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
  name: "ban",
  description: "Ban a user from the server.",
  options: [
    {
      name: "user",
      description: "The user to ban.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "reason",
      description: "Reason for banning the user.",
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
};

export const options: CommandOptions = {
  devOnly: true,
  userPermissions: ["BanMembers"],
  botPermissions: ["BanMembers"],
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
    await user.ban({ reason });
    const successEmbed = new EmbedBuilder()
      .setTitle("User Banned")
      .setDescription(`${user.user.tag} has been banned.`)
      .addFields({ name: "Reason", value: reason })
      .setColor("Green");
    interaction.reply({ embeds: [successEmbed] });
  } catch (error) {
    const failureEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription("Failed to ban the user. Please check my permissions.")
      .setColor("Red");
    interaction.reply({ embeds: [failureEmbed], ephemeral: true });
  }
}
