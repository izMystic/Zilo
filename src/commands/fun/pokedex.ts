import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import logger from "@src/utils/logger";

const BASE_URL = "https://some-random-api.com/pokemon/pokedex?pokemon=";

export const options: CommandOptions = {
  devOnly: true,
};

export const data: CommandData = {
  name: "pokedex",
  description: "Get information about a Pokémon.",
  options: [
    {
      name: "pokemon",
      description: "The Pokémon to get information about.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  try {
    const pokemon = interaction.options.getString("pokemon", true);
    const response = await fetch(`${BASE_URL}${pokemon}`);
    const data = await response.json();

    const capitalizeFirstLetter = (string: string) =>
      string.charAt(0).toUpperCase() + string.slice(1);

    const typeColors: { [key: string]: number } = {
      normal: 0xa8a77a,
      fire: 0xee8130,
      water: 0x6390f0,
      electric: 0xf7d02c,
      grass: 0x7ac74c,
      ice: 0x96d9d6,
      fighting: 0xc22e28,
      poison: 0xa33ea1,
      ground: 0xe2bf65,
      flying: 0xa98ff3,
      psychic: 0xf95587,
      bug: 0xa6b91a,
      rock: 0xb6a136,
      ghost: 0x735797,
      dragon: 0x6f35fc,
      dark: 0x705746,
      steel: 0xb7b7ce,
      fairy: 0xd685ad,
    };

    const getColorFromType = (types: string[]): number => {
      for (const type of types) {
        if (typeColors[type.toLowerCase()]) {
          return typeColors[type.toLowerCase()];
        }
      }
      return 0xffffff; // Default color if no type matches
    };

    const embed = new EmbedBuilder()
      .setTitle(capitalizeFirstLetter(data.name))
      .setDescription(
        `${data.description}\n\n` +
          `**ID:** ${data.id}\n` +
          `**Height:** ${data.height} m\n` +
          `**Weight:** ${data.weight} kg\n` +
          `**Type:** ${data.type.join(", ")}\n` +
          `**Species:** ${data.species.join(", ")}\n` +
          `**Abilities:** ${data.abilities.join(", ")}\n` +
          `**Egg Groups:** ${data.egg_groups.join(", ")}\n` +
          `**Gender:** ${data.gender.join(", ")}\n` +
          `**Base Experience:** ${data.base_experience}`
      )
      .addFields(
        { name: "HP", value: `${data.stats.hp}`, inline: true },
        { name: "Attack", value: `${data.stats.attack}`, inline: true },
        { name: "Defense", value: `${data.stats.defense}`, inline: true },
        { name: "Sp. Atk", value: `${data.stats.sp_atk}`, inline: true },
        { name: "Sp. Def", value: `${data.stats.sp_def}`, inline: true },
        { name: "Speed", value: `${data.stats.speed}`, inline: true },
        { name: "Total", value: `${data.stats.total}`, inline: true }
      )
      .setThumbnail(data.sprites.animated)
      .setColor(getColorFromType(data.type))
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error(error);
    interaction.reply({
      content:
        "There was an error fetching the Pokémon information. Please try again later.",
      ephemeral: true,
    });
  }
}
