import moment from "moment-timezone";
import { Countdown, type UpdateInterval } from "./Countdown";
import type { Client } from "discord.js";
import { EmbedBuilder } from "discord.js";

const ANSI = {
  RESET: "\u001b[0m",
  CYAN_BOLD: "\u001b[1;36m",
  YELLOW: "\u001b[0;33m",
  GREEN_BOLD: "\u001b[1;32m",
  RED_BOLD: "\u001b[1;31m",
};

const PRIORITY_TIMEZONES: Record<string, string> = {
  "UTC-12:00": "Etc/GMT+12",
  "UTC-11:00": "Pacific/Pago_Pago",
  "UTC-10:00": "Pacific/Honolulu",
  "UTC-09:30": "Pacific/Marquesas",
  "UTC-09:00": "America/Anchorage",
  "UTC-08:00": "America/Los_Angeles",
  "UTC-07:00": "America/Denver",
  "UTC-06:00": "America/Chicago",
  "UTC-05:00": "America/New_York",
  "UTC-04:00": "America/Halifax",
  "UTC-03:30": "America/St_Johns",
  "UTC-03:00": "America/Argentina/Buenos_Aires",
  "UTC-02:00": "Atlantic/South_Georgia",
  "UTC-01:00": "Atlantic/Cape_Verde",
  "UTC+00:00": "Europe/London",
  "UTC+01:00": "Europe/Paris",
  "UTC+02:00": "Africa/Cairo",
  "UTC+03:00": "Europe/Moscow",
  "UTC+03:30": "Asia/Tehran",
  "UTC+04:00": "Asia/Dubai",
  "UTC+04:30": "Asia/Kabul",
  "UTC+05:00": "Asia/Karachi",
  "UTC+05:30": "Asia/Kolkata",
  "UTC+05:45": "Asia/Kathmandu",
  "UTC+06:00": "Asia/Dhaka",
  "UTC+06:30": "Asia/Yangon",
  "UTC+07:00": "Asia/Bangkok",
  "UTC+08:00": "Asia/Shanghai",
  "UTC+08:45": "Australia/Eucla",
  "UTC+09:00": "Asia/Tokyo",
  "UTC+09:30": "Australia/Adelaide",
  "UTC+10:00": "Australia/Sydney",
  "UTC+10:30": "Australia/Lord_Howe",
  "UTC+11:00": "Pacific/Guadalcanal",
  "UTC+12:00": "Pacific/Auckland",
  "UTC+12:45": "Pacific/Chatham",
  "UTC+13:00": "Pacific/Tongatapu",
  "UTC+14:00": "Pacific/Kiritimati",
};

const IMPORTANT_CITIES = [
  "New_York",
  "Los_Angeles",
  "London",
  "Paris",
  "Tokyo",
  "Sydney",
  "Dubai",
  "Mumbai",
  "Singapore",
  "Hong_Kong",
  "Bangkok",
  "Moscow",
  "Istanbul",
  "Cairo",
  "Toronto",
  "Mexico_City",
  "São_Paulo",
  "Buenos_Aires",
  "Auckland",
  "Shanghai",
  "Beijing",
  "Seoul",
  "Delhi",
  "Lagos",
  "Vancouver",
  "Bratislava",
  "Berlin",
  "Rome",
  "Madrid",
];

interface TimezoneInfo {
  name: string;
  offset: string;
  minutesUntilNewYear: number;
  aliases: string[];
}

class TimezoneUtils {
  static getAllTimezonesInfo(): TimezoneInfo[] {
    const nowUtc = moment.utc();
    const targetYear =
      nowUtc.month() === 11 ? nowUtc.year() + 1 : nowUtc.year();
    const allNames = moment.tz.names();

    const offsetMap = new Map<string, TimezoneInfo>();

    for (const tzName of allNames) {
      const localTime = moment().tz(tzName);
      const nextNewYearLocal = moment
        .tz(tzName)
        .year(targetYear)
        .startOf("year");
      const minutesUntil = nextNewYearLocal.diff(localTime, "minutes");

      if (Math.abs(minutesUntil) > 366 * 24 * 60) continue;

      const offset = `UTC${localTime.format("Z")}`;

      if (!offsetMap.has(offset)) {
        offsetMap.set(offset, {
          name: this.getPrimaryName(offset, tzName),
          offset,
          minutesUntilNewYear: minutesUntil,
          aliases: [],
        });
      }

      const info = offsetMap.get(offset)!;
      if (tzName !== info.name && !info.aliases.includes(tzName)) {
        info.aliases.push(tzName);
      }
    }

    return Array.from(offsetMap.values()).sort(
      (a, b) => a.minutesUntilNewYear - b.minutesUntilNewYear,
    );
  }

  private static getPrimaryName(offset: string, currentTz: string): string {
    if (PRIORITY_TIMEZONES[offset]) return PRIORITY_TIMEZONES[offset];
    return currentTz;
  }

  static getImportantAliases(aliases: string[]): string[] {
    return aliases.filter((alias) =>
      IMPORTANT_CITIES.some((city) => alias.includes(city)),
    );
  }
}

class AnsiFormatter {
  static formatList(timezones: TimezoneInfo[]): string {
    const lines = timezones.map((tz) => {
      const header = this.formatHeader(tz);
      const time = this.formatTime(tz);
      return `${header}\n${time}`;
    });
    return `\`\`\`ansi\n${lines.join("\n\n")}\n\`\`\``;
  }

  private static formatHeader(tz: TimezoneInfo): string {
    let aliasStr = "";
    if (tz.aliases.length > 0) {
      const selected = TimezoneUtils.getImportantAliases(tz.aliases).slice(
        0,
        3,
      );
      if (selected.length > 0) aliasStr = ` [${selected.join(", ")}]`;
    }
    return `${ANSI.CYAN_BOLD}${tz.name}${ANSI.RESET} ${ANSI.YELLOW}(${tz.offset})${ANSI.RESET}${aliasStr}`;
  }

  private static formatTime(tz: TimezoneInfo): string {
    if (tz.minutesUntilNewYear <= 0) {
      return `  ${ANSI.RED_BOLD}🎉 ARRIVED! 🎉${ANSI.RESET}`;
    }

    const h = Math.floor(tz.minutesUntilNewYear / 60);
    const m = (tz.minutesUntilNewYear % 60).toString().padStart(2, "0");
    const s = (59 - (Math.floor(Date.now() / 1000) % 60))
      .toString()
      .padStart(2, "0");

    return `  ⏱️ ${ANSI.GREEN_BOLD}${h}h ${m}m ${s}s${ANSI.RESET}`;
  }
}

export class NewYearCountdown extends Countdown {
  override get channelId(): string {
    return process.env.NEW_YEAR_COUNTDOWN_CHANNEL_ID!;
  }

  override enabled(): boolean {
    const now = moment.utc();
    const currentYear = now.year();

    let targetYear = currentYear;

    if (now.month() === 11) {
      targetYear = currentYear + 1;
    } else if (now.month() === 0) {
      targetYear = currentYear;
    } else {
      return false;
    }

    const startWindow = moment
      .tz({ year: targetYear, month: 0, day: 1, hour: 0 }, "Pacific/Kiritimati")
      .subtract(1, "hours");

    const endWindow = moment
      .tz({ year: targetYear, month: 0, day: 1, hour: 0 }, "Etc/GMT+12")
      .add(2, "hours");

    return now.isSameOrAfter(startWindow) && now.isSameOrBefore(endWindow);
  }

  override interval(): UpdateInterval {
    return "minutely";
  }

  override message(): string {
    return "";
  }

  override async onUpdate(client: Client): Promise<void> {
    const channel = this.channel(client);
    if (!channel) return;

    const allTimezones = TimezoneUtils.getAllTimezonesInfo();

    const activeTimezones = allTimezones.filter(
      (tz) => tz.minutesUntilNewYear > -60 * 12,
    );
    await this.updateDashboard(client, channel, activeTimezones);

    await this.processGreetings(client, channel, allTimezones);
  }

  private async updateDashboard(
    client: Client,
    channel: any,
    timezones: TimezoneInfo[],
  ): Promise<void> {
    const descriptionText = AnsiFormatter.formatList(timezones);

    const embed = new EmbedBuilder()
      .setColor(0x2c2f33)
      .setDescription(
        timezones.length > 0
          ? descriptionText || "Waiting for timezone data..."
          : "",
      );

    const messageContent =
      "🎉 As we eagerly await the arrival of the New Year, let's check in on the countdown times across the globe! 🌍\n";

    try {
      const messages = await channel.messages.fetch({ limit: 5 });
      const lastMessage = messages.find(
        (m: any) => m.author.id === client.user?.id && m.embeds.length > 0,
      );

      if (lastMessage) {
        await lastMessage.edit({ content: messageContent, embeds: [embed] });
      } else {
        await channel.send({ content: messageContent, embeds: [embed] });
      }
    } catch (error) {
      console.error("Error updating dashboard:", error);
    }
  }

  private async processGreetings(
    client: Client,
    channel: any,
    allTimezones: TimezoneInfo[],
  ): Promise<void> {
    const nowUtc = moment.utc();
    const targetYear =
      nowUtc.month() === 11 ? nowUtc.year() + 1 : nowUtc.year();

    const arrivedTimezones = allTimezones.filter(
      (tz) => tz.minutesUntilNewYear <= 0 && tz.minutesUntilNewYear > -60 * 24,
    );

    arrivedTimezones.sort(
      (a, b) => b.minutesUntilNewYear - a.minutesUntilNewYear,
    );

    for (const info of arrivedTimezones) {
      const wasAlreadySent = await this.checkOrSendGreeting(
        client,
        channel,
        info,
        targetYear,
      );

      if (wasAlreadySent) {
        break;
      }
    }
  }

  private async checkOrSendGreeting(
    client: Client,
    channel: any,
    info: TimezoneInfo,
    year: number,
  ): Promise<boolean> {
    const threadName = `in ${year}`;

    try {
      let thread = channel.threads.cache.find(
        (t: any) => t.name.toLowerCase() === threadName,
      );
      if (!thread) {
        const active = await channel.threads.fetch();
        thread = active.threads.find(
          (t: any) => t.name.toLowerCase() === threadName,
        );
      }

      if (!thread) return true;

      const messages = await thread.messages.fetch({ limit: 5 });
      const lastBotMessage = messages
        .filter((m: any) => m.author.id === client.user?.id)
        .first();

      const greetingMarker = "Happy New Year";
      let alreadySent = false;

      if (lastBotMessage) {
        const content = lastBotMessage.content;
        if (content.includes(greetingMarker) && content.includes(info.name)) {
          alreadySent = true;
        }
      }

      if (alreadySent) {
        return true;
      } else {
        console.log(`Sending missing greeting to ${info.name}`);
        const message = `🎉🥂 **Happy New Year ${year}** 🥂🎉 to all our friends in **${info.name} (${info.offset})**! May the coming year be filled with joy, prosperity, and happiness. 🌟🎆`;
        await thread.send(message);
        return false;
      }
    } catch (e) {
      console.error(`Failed to check/send greeting for ${info.name}`, e);
      return true;
    }
  }
}
