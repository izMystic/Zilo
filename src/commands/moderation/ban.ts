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
  userPermissions: ["BanMembers"],
  botPermissions: ["BanMembers"],
};

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
      required: true,
    },
  ],
};

export async function run({ interaction }: SlashCommandProps) {
  const user = interaction.options.getMember("user") as GuildMember;
  const initialReason = interaction.options.getString("reason");
  const reason = `${initialReason} (Actioned by: ${interaction.user.tag})`;

  try {
    await user.ban({ reason });
    const successEmbed = new EmbedBuilder()
      .setTitle("User Banned")
      .setDescription(`${user.user.tag} has been banned.`)
      .addFields({ name: "Reason", value: reason })
      .setColor("Green");
    interaction.reply({ embeds: [successEmbed] });
  } catch (error) {
    logger.error(error);
    interaction.reply({
      content: "Failed to ban the user. Please check my permissions",
      ephemeral: true,
    });
  }
}
