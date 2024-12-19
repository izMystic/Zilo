import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import logger from "@src/utils/logger";

const animals = [
  "bird",
  "cat",
  "dog",
  "fox",
  "kangaroo",
  "koala",
  "panda",
  "raccoon",
  "red_panda",
];
const BASE_URL = "https://some-random-api.com/animal";

export const options: CommandOptions = {
  devOnly: true,
};

export const data: CommandData = {
  name: "animal",
  description: "Get a random animal image.",
  options: [
    {
      name: "type",
      description: "The type of animal to get.",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: animals.map((animal) => ({ name: animal, value: animal })),
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  try {
    const choice = interaction.options.getString("type", true);
    const response = await fetch(`${BASE_URL}/${choice}`);
    const data = await response.json();
    const embed = new EmbedBuilder()
      .setImage(data.image)
      .setDescription(data.fact)
      .setColor("Random")
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error(error);
    interaction.reply({
      content:
        "There was an error fetching the animal image. Please try again later.",
      ephemeral: true,
    });
  }
}
