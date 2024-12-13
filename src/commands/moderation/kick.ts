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
      required: false,
    },
  ],
};

export const options: CommandOptions = {
  devOnly: true,
  userPermissions: ["KickMembers"],
  botPermissions: ["KickMembers"],
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

  try {
    await user.kick(reason);
    const successEmbed = new EmbedBuilder()
      .setTitle("User Kicked")
      .setDescription(`${user.user.tag} has been kicked.`)
      .addFields({ name: "Reason", value: reason })
      .setColor("Green");
    interaction.reply({ embeds: [successEmbed] });
  } catch (error) {
    console.error(error);
    const failureEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription("Failed to kick the user. Please check my permissions.")
      .setColor("Red");
    interaction.reply({ embeds: [failureEmbed], ephemeral: true });
  }
}
