import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { EmbedBuilder } from "discord.js";

export const options: CommandOptions = {
  devOnly: true,
  deleted: false,
};

export const data: CommandData = {
  name: "ping",
  description: "Returns the bot's ping.",
};

export async function run({ interaction }: SlashCommandProps) {
  const ping = interaction.client.ws.ping;

  const embed = new EmbedBuilder()
    .setTitle("Bot Ping")
    .setDescription(`🏓 Pong! The bot's ping is **${ping}ms**.`)
    .setColor("Blue");

  await interaction.reply({
    embeds: [embed],
  });
}
