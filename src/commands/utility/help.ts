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
  StringSelectMenuBuilder,
} from "discord.js";
import logger from "@src/utils/logger";

export const options: CommandOptions = {
  devOnly: true,
};

export const data: CommandData = {
  name: "help",
  description: "Displays a list of available commands.",
};

export async function run({ interaction, handler }: SlashCommandProps) {
  const commands: { [category: string]: any[] } = {};

  if (!handler || !handler.commands) {
    logger.error("Command handler or commands not available.");
    return interaction.reply({
      content: "Could not retrieve command information.",
      ephemeral: true,
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
    return interaction.reply({
      content: "No commands found.",
      ephemeral: true,
    });
  }

  let currentCategory: string | null = null;
  let currentPage = 0;

  const generateGeneralInfoEmbed = () =>
    new EmbedBuilder()
      .setTitle("Help - General Information")
      .addFields(
        {
          name: "About Me",
          value: `Hello I am ${interaction.guild?.members?.me?.displayName}! \n An all in one Discord Bot with auto-moderation, administration, music, and more.`,
        },
        {
          name: "Invite Me",
          value:
            "[Here](https://discord.com/oauth2/authorize?client_id=1222574387203670111&permissions=397602323830&scope=bot%20applications.commands)",
          inline: true,
        },
        {
          name: "Support Server",
          value: "https://discord.gg/bZBQQa63D6",
          inline: true,
        }
      )
      .setColor("Blue")
      .setFooter({
        text: `Total Categories: ${categories.length}`,
      });

  const generateCategoryEmbed = (category: string, page: number) => {
    const embed = new EmbedBuilder()
      .setTitle(`${category[0].toUpperCase() + category.substring(1)} Commands`)
      .setColor("Blue");

    const validCommands = commands[category].filter(
      (command) =>
        command && command.data && command.data.name && command.data.description
    );

    const paginatedCommands = validCommands.slice(page * 5, page * 5 + 5);

    if (paginatedCommands.length === 0) {
      embed.addFields({
        name: "No commands in this Category",
        value: "There are no commands in this category.",
      });
    } else {
      paginatedCommands.forEach((command) => {
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
    }

    embed.setFooter({
      text: `Page ${page + 1} of ${Math.ceil(validCommands.length / 5)}`,
    });
    return embed;
  };

  const generateComponents = () => {
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("category_select")
        .setPlaceholder("Select a category")
        .addOptions(
          categories.map((category) => ({
            label: category[0].toUpperCase() + category.substring(1),
            value: category,
          }))
        )
    );

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("⬅️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("➡️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true)
    );

    return { dropdown: row, buttons };
  };

  const { dropdown, buttons } = generateComponents();

  const message = await interaction.reply({
    embeds: [generateGeneralInfoEmbed()],
    components: [dropdown],
  });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 60000,
  });

  collector.on("collect", async (i) => {
    const selectedCategory = i.values[0];
    currentCategory = selectedCategory;
    currentPage = 0;

    const validCommands = commands[selectedCategory] || [];
    buttons.components[0].setDisabled(currentPage === 0);
    buttons.components[1].setDisabled(validCommands.length <= 5);

    await i.update({
      embeds: [generateCategoryEmbed(selectedCategory, currentPage)],
      components: [dropdown, buttons],
    });
  });

  const buttonCollector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 60000,
  });

  buttonCollector.on("collect", async (i) => {
    if (!currentCategory) return;

    const validCommands = commands[currentCategory] || [];
    if (i.customId === "prev") currentPage--;
    else if (i.customId === "next") currentPage++;

    buttons.components[0].setDisabled(currentPage === 0);
    buttons.components[1].setDisabled(
      currentPage === Math.ceil(validCommands.length / 5) - 1
    );

    await i.update({
      embeds: [generateCategoryEmbed(currentCategory, currentPage)],
      components: [dropdown, buttons],
    });
  });

  collector.on("end", async () => {
    try {
      await message.edit({ components: [] });
    } catch (error) {
      console.error("Error editing message:", error);
    }
  });
}
