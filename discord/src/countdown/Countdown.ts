import type { Client, SendableChannels, TextBasedChannel } from "discord.js";

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
}
