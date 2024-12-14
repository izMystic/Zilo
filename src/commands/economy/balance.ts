import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { Embed, EmbedBuilder } from "discord.js";
import User from "../../database/schemas/UserSchema";

export const data: CommandData = {
  name: "balance",
  description: "Check your balance.",
};

export const options: CommandOptions = {
  devOnly: true,
  deleted: false,
};

export async function run({ interaction }: SlashCommandProps) {
  const userId = interaction.user.id;
  const username = interaction.user.tag;

  try {
    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({ userId, username, coins: 0, bank: 0 });
      await user.save();
    } else if (user.username !== username) {
      user.username = username;
      await user.save();
    }

    const balanceEmbed = new EmbedBuilder()
      .setTitle(`${username}'s Balance`)
      .addFields(
        { name: "Wallet", value: `${user.coins} coins`, inline: true },
        { name: "Bank", value: `${user.bank} coins`, inline: true },
      )
      .setColor("Blue")
      .setTimestamp();

    interaction.reply({ embeds: [balanceEmbed] });
  } catch (error) {
    interaction.reply({
      content:
        "There was an error fetching your balance. Please try again later.",
      ephemeral: true,
    });
  }
}
