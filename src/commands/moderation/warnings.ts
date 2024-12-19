import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import {
  ApplicationCommandOptionType,
  GuildMember,
  EmbedBuilder,
} from "discord.js";
import Member from "@src/database/schemas/Member";
import logger from "@src/utils/logger";
import prettyMilliseconds from "pretty-ms";

export const options: CommandOptions = {
  devOnly: true,
  userPermissions: ["ModerateMembers"],
  botPermissions: ["ModerateMembers"],
};

export const data: CommandData = {
  name: "warnings",
  description: "View or manage a user's warnings.",
  options: [
    {
      name: "user",
      description: "The user whose warnings to view",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "clear",
      description: "Clear all warnings for the user.",
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  const member = interaction.options.getMember("user") as GuildMember;
  const clearWarnings = interaction.options.getBoolean("clear", false);

  const guildId = interaction.guild?.id;
  const userId = member.id;

  try {
    const memberRecord = await Member.findOne({ userId, guildId });

    if (!memberRecord || memberRecord.warnings.length === 0) {
      return interaction.reply({
        content: `${member.user.tag} has no warnings.`,
        ephemeral: true,
      });
    }
    if (clearWarnings) {
      memberRecord.warnings.splice(0, memberRecord.warnings.length);
      await memberRecord.save();

      return interaction.reply({
        content: `All warnings for ${member.user.tag} have been cleared.`,
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`${member.user.tag}'s Warnings`)
      .setColor("Yellow");
    memberRecord.warnings.forEach((warning, index) => {
      const timestamp = Math.floor(Number(warning.date) / 1000);
      embed.addFields({
        name: `Warning #${index + 1}`,
        value: `**Reason** ${warning.reason}\n**Moderator:** ${warning.moderator}\n**Date:** <t:${timestamp}:f>`,
      });
    });

    return interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error("Error retrieving warnings:", error);
    await interaction.reply({
      content: "An error occured while retrieving warnings.",
      ephemeral: true,
    });
  }
}
