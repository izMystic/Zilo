import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import {
  GuildMember,
  ApplicationCommandOptionType,
  EmbedBuilder,
} from "discord.js";
import logger from "../../utils/logger";

export const data: CommandData = {
  name: "untimeout",
  description: "Remove a timeout from a user.",
  options: [
    {
      name: "user",
      description: "The user to remove the timeout from.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for removing the timeout.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
};

export const options: CommandOptions = {
  devOnly: true,
  userPermissions: ["ModerateMembers"],
  botPermissions: ["ModerateMembers"],
  deleted: false,
};

export async function run({ interaction }: SlashCommandProps) {
  const user = interaction.options.getMember("user") as GuildMember | null;
  const initialReason =
    interaction.options.getString("reason") || "No reason provided.";
  const reason = `${initialReason} (Actioned by: ${interaction.user.tag})`;

  if (!user) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription("The specified user was not found.")
      .setColor("Red");
    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }

  if (!user.isCommunicationDisabled()) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription(`${user.user.tag} is not timed out.`)
      .setColor("Red");
    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }

  try {
    await user.timeout(null, reason);
    const successEmbed = new EmbedBuilder()
      .setTitle("Removed Timeout")
      .setDescription(`${user.user.tag} has been untimed out.`)
      .addFields({ name: "Reason", value: initialReason })
      .setColor("Green");
    interaction.reply({ embeds: [successEmbed] });
  } catch (error) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription(
        "Failed to untimeout the user. Please check my permissions.",
      )
      .setColor("Red");
    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}
