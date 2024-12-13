import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export const data: CommandData = {
  name: "unban",
  description: "Unban a user from the server.",
  options: [
    {
      name: "user_id",
      description: "The ID of the user to unban.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "reason",
      description: "Reason for unbanning the user.",
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
  const userId = interaction.options.getString("user_id");
  const initialReason =
    interaction.options.getString("reason") || "No reason provided.";
  const reason = `${initialReason} (Actioned by: ${interaction.user.tag})`;

  if (!userId) {
    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription("You must provide a valid user ID.")
      .setColor("Red");
    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }

  try {
    const banList = await interaction.guild?.bans.fetch();
    if (!banList?.has(userId)) {
      const notBannedEmbed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription("The specified user is not banned.")
        .setColor("Red");
      return interaction.reply({ embeds: [notBannedEmbed], ephemeral: true });
    }

    await interaction.guild?.bans.remove(userId, reason);
    const successEmbed = new EmbedBuilder()
      .setTitle("User Unbanned")
      .setDescription(`The user with ID ${userId} has been unbanned.`)
      .addFields({ name: "Reason", value: reason })
      .setColor("Green");
    interaction.reply({ embeds: [successEmbed] });
  } catch (error) {
    console.error(error);
    const failureEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setDescription(
        "Failed to unban the user. Please check the user ID and my permissions.",
      )
      .setColor("Red");
    interaction.reply({ embeds: [failureEmbed], ephemeral: true });
  }
}
