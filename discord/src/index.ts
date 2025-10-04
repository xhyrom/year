import { Client, IntentsBitField } from "discord.js";
import { Cron } from "croner";
import { Countdowns } from "./registry/Countdowns";

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds],
});

client.on("clientReady", () => {
  console.log("I am ready!");

  new Cron(
    "0 0 * * *",
    {
      timezone: "Europe/London",
    },
    () =>
      Countdowns.all()
        .filter((c) => c.enabled())
        .forEach((c) => c.channel(client).send(c.message())),
  );
});

process.on("uncaughtException", console.log);
process.on("unhandledRejection", console.log);

client.login(process.env.DISCORD_BOT_TOKEN);
