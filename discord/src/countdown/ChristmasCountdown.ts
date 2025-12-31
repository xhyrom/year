import moment from "moment-timezone";
import { Countdown, type UpdateInterval } from "./Countdown";

export class ChristmasCountdown extends Countdown {
  override get channelId(): string {
    return process.env.CHRISTMAS_COUNTDOWN_CHANNEL_ID!;
  }

  override enabled(): boolean {
    return new Date().getMonth() == 11;
  }

  override interval(): UpdateInterval {
    return "daily";
  }

  override message(): string {
    const now = moment().tz("Europe/London");
    const currentYear = now.year();
    const christmas = moment(`${currentYear}-12-24`, "YYYY-MM-DD")
      .tz("Europe/London")
      .startOf("day");

    if (now.isAfter(christmas)) {
      christmas.add(1, "year");
    }

    const diff = christmas.diff(now);
    if (diff < 0) {
      return [
        "🎄 Merry Christmas! 🎅",
        "",
        "🕯️ The long-awaited day has finally arrived, and we're celebrating the birth of Jesus Christ. 🙏 Let's rejoice in the gift of God's love and share it with everyone around us! 🌟",
        "",
        "I hope you like it. Have a wonderful Christmas! 🎁",
      ].join("\n");
    }

    const duration = moment.duration(diff);
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();

    const adventSundays = this.adventSundays();
    const remainingSundays = adventSundays.filter((sunday) =>
      sunday.isAfter(now),
    );

    const sundaysText =
      remainingSundays.length !== 0
        ? `🕯️ The remaining Advent Sundays are:\n- ${remainingSundays
            .map((s) => s.format("MMMM D, YYYY"))
            .join("\n- ")}`
        : `🕯️ All the Advent Sundays have passed, and we're in the final stretch.\nLet's spread the holiday cheer and look forward to the joy and warmth that Christmas brings! 🌟`;

    return [
      `🎄 With **${days}** days, **${hours}** hours, and **${minutes}** minutes left, Christmas is just around the corner! 🎅`,
      ``,
      sundaysText,
    ].join("\n");
  }

  private adventSundays(): moment.Moment[] {
    const now = moment().tz("Europe/London");
    const year = now.year();

    const christmasYear =
      now.month() === 11 && now.date() > 24 ? year + 1 : year;

    let firstSunday = moment()
      .tz("Europe/London")
      .year(christmasYear)
      .month(10)
      .date(27);

    while (firstSunday.day() !== 0) {
      firstSunday.add(1, "day");
    }

    const secondSunday = moment(firstSunday).add(7, "days");
    const thirdSunday = moment(secondSunday).add(7, "days");
    const fourthSunday = moment(thirdSunday).add(7, "days");

    return [firstSunday, secondSunday, thirdSunday, fourthSunday];
  }
}
