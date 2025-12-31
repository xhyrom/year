import type {
  Client,
  SendableChannels,
  TextBasedChannel,
  TextChannel,
} from "discord.js";

export type UpdateInterval = "daily" | "minutely";

export abstract class Countdown {
  abstract get channelId(): string;

  channel(client: Client): TextBasedChannel & SendableChannels {
    const channel = client.channels.cache.get(this.channelId);
    if (!channel?.isTextBased() || !channel.isSendable())
      throw new Error(`Channel ${this.channelId} is not text-based.`);

    return channel;
  }

  abstract enabled(): boolean;

  abstract message(): string;

  abstract interval(): UpdateInterval;

  async onUpdate(client: Client): Promise<void> {
    const channel = this.channel(client);
    const message = this.message();

    try {
      const messages = await channel.messages.fetch({ limit: 1 });
      const lastMessage = messages.first();

      if (lastMessage && lastMessage.author.id === client.user?.id) {
        await lastMessage.edit(message);
      } else {
        await channel.send(message);
      }
    } catch {
      await channel.send(message);
    }
  }
}
