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
import logger from "@src/utils/logger";

export const options: CommandOptions = {
  devOnly: true,
  userPermissions: ["KickMembers"],
  botPermissions: ["KickMembers"],
};

export const data: CommandData = {
  name: "kick",
  description: "Kick a user from the server.",
  options: [
    {
      name: "user",
      description: "The user to kick.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "Reason for kicking the user.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  const user = interaction.options.getMember("user") as GuildMember;
  const initialReason = interaction.options.getString("reason");
  const reason = `${initialReason} (Actioned by: ${interaction.user.tag})`;

  try {
    await user.kick(reason);
    const successEmbed = new EmbedBuilder()
      .setTitle("User Kicked")
      .setDescription(`${user.user.tag} has been kicked.`)
      .addFields({ name: "Reason", value: reason })
      .setColor("Green");
    interaction.reply({ embeds: [successEmbed] });
  } catch (error) {
    logger.error(error);
    interaction.reply({
      content: "Failed to kick the user. Please check my permissions",
      ephemeral: true,
    });
  }
}
