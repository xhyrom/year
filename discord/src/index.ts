import { Client, IntentsBitField, TextChannel } from "discord.js";
import moment from "moment-timezone";
import { Cron } from "croner";

const CHANNEL_ID = "1056166562614231061";

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds],
});

client.on("clientReady", () => {
  console.log("I am ready!");

  new Cron("0 0 * * *", {
    timezone: "Europe/London",
  }, calculate);
});

const calculate = () => {
  const now = moment().tz("Europe/London");
  const start = moment().tz("Europe/London").startOf("year");
  const end = moment().tz("Europe/London").endOf("year");
  const percentage = (now.diff(start, "days") / end.diff(start, "days")) * 100;

  const elapsedDays = now.diff(start, "days");
  const remainingDays = end.diff(now, "days");

  // send message to channel
  (client.channels.cache
    .get(CHANNEL_ID) as TextChannel)!
    .send(
      [
        `The year is now **${percentage}%** complete.`,
        `We've had **${elapsedDays}** days so far, with **${remainingDays}** days left.`,
      ].join("\n"),
    );
};

process.on("uncaughtException", console.log);
process.on("unhandledRejection", console.log);

client.login(process.env.DISCORD_BOT_TOKEN);
