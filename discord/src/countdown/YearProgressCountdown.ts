import moment from "moment-timezone";
import { Countdown, type UpdateInterval } from "./Countdown";

export class YearProgressCountdown extends Countdown {
  override get channelId(): string {
    return process.env.YEAR_PROGRESS_CHANNEL_ID!;
  }

  override enabled(): boolean {
    return true;
  }

  override interval(): UpdateInterval {
    return "daily";
  }

  override message(): string {
    const now = moment().tz("Europe/London");
    const start = moment().tz("Europe/London").startOf("year");
    const end = moment().tz("Europe/London").endOf("year");
    const percentage =
      (now.diff(start, "days") / end.diff(start, "days")) * 100;
    const elapsedDays = now.diff(start, "days");
    const remainingDays = end.diff(now, "days");

    return [
      `The year is now **${percentage.toFixed(2)}%** complete.`,
      `We've had **${elapsedDays}** days so far, with **${remainingDays}** days left.`,
    ].join("\n");
  }
}
