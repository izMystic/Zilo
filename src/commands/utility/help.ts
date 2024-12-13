import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from "discord.js";
import logger from "../../utils/logger";

export const data: CommandData = {
  name: "help",
  description: "Displays a list of available commands.",
};

export const options: CommandOptions = {
  devOnly: true,
};

export async function run({ interaction, client, handler }: SlashCommandProps) {
  const commands: { [category: string]: any[] } = {};

  if (!handler || !handler.commands) {
    logger.error("Command handler or commands not available.");
    return interaction.reply({
      content: "Could not retrieve command information.",
    });
  }

  handler.commands.forEach((commandData, commandName) => {
    if (commandData.category) {
      const category = commandData.category;
      if (!commands[category]) {
        commands[category] = [];
      }
      commands[category].push(commandData);
    } else {
      logger.warn(`Command ${commandName} is missing a category.`);
    }
  });

  const categories = Object.keys(commands);

  if (categories.length === 0) {
    return interaction.reply({ content: "No commands found." });
  }

  let currentPage = 0;

  const generateEmbed = (page: number) => {
    const category = categories[page];
    const embed = new EmbedBuilder()
      .setTitle(`Help - ${category}`)
      .setDescription(`List of commands in the ${category} category.`)
      .setColor("Blue");

    const validCommands = commands[category].filter(
      (command) =>
        command &&
        command.data &&
        command.data.name &&
        command.data.description,
    );

    if (validCommands.length === 0) {
      embed.addFields({
        name: "No commands in this Category",
        value: "There are no commands in this category.",
      });
      return embed;
    }

    validCommands.forEach((command) => {
      let usage = `/${command.data.name}`;
      if (command.options && command.options.options) {
        usage += command.options.options
          .map((option: CommandOptions) => ` [${option.name}]`)
          .join("");
      }
      embed.addFields({
        name: `\`${usage}\``,
        value: command.data.description,
      });
    });

    embed.setFooter({ text: `Page ${page + 1} of ${categories.length}` });
    return embed;
  };

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("Previous")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(categories.length <= 1),
  );

  const message = await interaction.reply({
    embeds: [generateEmbed(currentPage)],
    components: [row],
  });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 60000,
  });

  collector.on("collect", async (i) => {
    if (i.customId === "prev") {
      currentPage--;
    } else if (i.customId === "next") {
      currentPage++;
    }

    row.components[0].setDisabled(currentPage === 0);
    row.components[1].setDisabled(currentPage === categories.length - 1);

    await i.update({ embeds: [generateEmbed(currentPage)], components: [row] });
  });

  collector.on("end", async () => {
    try {
      await message.edit({ components: [] });
    } catch (error) {
      console.error("Error editing message:", error);
    }
  });
}
