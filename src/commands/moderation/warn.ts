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

export const options: CommandOptions = {
  devOnly: true,
  userPermissions: ["ModerateMembers"],
  botPermissions: ["ModerateMembers"],
};

export const data: CommandData = {
  name: "warn",
  description: "Warn a user in the server.",
  options: [
    {
      name: "user",
      description: "The user to warn.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the warn.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  const member = interaction.options.getMember("user") as GuildMember;
  const reason = interaction.options.getString("reason", true);

  const guildId = interaction.guild?.id;
  const userId = member.id;
  const moderator = interaction.user.tag;

  try {
    let memberRecord = await Member.findOne({ userId, guildId });
    if (!memberRecord) {
      memberRecord = new Member({ userId, guildId, warnings: [] });
    }

    memberRecord.warnings.push({ reason, moderator });
    await memberRecord.save();

    const embed = new EmbedBuilder()
      .setTitle("User Warned")
      .setDescription(`${member.user.tag} has been warned.`)
      .addFields(
        { name: "Reason", value: reason },
        { name: "Moderator", value: moderator }
      )
      .setColor("Yellow")
      .setFooter({ text: `Total Warnings: ${memberRecord.warnings.length}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error("Error warning user:", error);
    await interaction.reply({
      content: "An error occured while warning the user.",
      ephemeral: true,
    });
  }
}
