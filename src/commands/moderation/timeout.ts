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

export const data: CommandData = {
  name: "timeout",
  description: "Timeout a user.",
  options: [
    {
      name: "user",
      description: "The user to timeout.",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "duration",
      description:
        "The duration of the timeout (in seconds). Max 28 days (2419200 seconds)",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: "reason",
      description: "The reason for the timeout.",
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
  const duration = interaction.options.getInteger("duration", true);
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

  if (duration > 2419200) {
    const errorEmbed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("Error")
      .setDescription(
        "Timeout duration cannot exceed 28 days (2419200 seconds).",
      );
    return interaction.reply({
      embeds: [errorEmbed],
      ephemeral: true,
    });
  }

  try {
    await user.timeout(duration * 1000, reason);
    const successEmbed = new EmbedBuilder()
      .setTitle("Timeout Successful")
      .setDescription(
        `${user.user.tag} has been timed out for ${duration} seconds.`,
      )
      .addFields({ name: "Reason", value: initialReason })
      .setColor("Green");
    interaction.reply({ embeds: [successEmbed] });
  } catch (error) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription(
        "Failed to timeout the user. Please check my permissions.",
      )
      .setColor("Red");
    interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }
}
