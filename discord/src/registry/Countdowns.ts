import { ChristmasCountdown } from "../countdown/ChristmasCountdown";
import type { Countdown } from "../countdown/Countdown";
import { YearProgressCountdown } from "../countdown/YearProgressCountdown";
import { NewYearCountdown } from "../countdown/NewYearCountdown";

export class Countdowns {
  private static countdowns: Map<string, Countdown> = new Map();

  public static YEAR_PROGRESS = this.register(new YearProgressCountdown());
  public static CHRISTMAS = this.register(new ChristmasCountdown());
  public static NEW_YEAR = this.register(new NewYearCountdown());

  public static all(): Countdown[] {
    return [...this.countdowns.values()];
  }

  private static register(countdown: Countdown): Countdown {
    this.countdowns.set(countdown.constructor.name, countdown);
    return countdown;
  }
}
