import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { EmbedBuilder } from "discord.js";
import logger from "@src/utils/logger";

export const options: CommandOptions = {
  devOnly: true,
};

export const data: CommandData = {
  name: "meme",
  description: "Get a random meme from Reddit.",
};

export async function run({ interaction }: SlashCommandProps) {
  try {
    const response = await fetch("https://meme-api.com/gimme");
    const data = await response.json();
    const embed = new EmbedBuilder()
      .setImage(data.url)
      .setDescription(data.title)
      .setColor("Random")
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error(error);
    interaction.reply({
      content: "There was an error fetching the meme. Please try again later.",
      ephemeral: true,
    });
  }
}
