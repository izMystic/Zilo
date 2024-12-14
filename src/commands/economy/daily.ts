import type {
  CommandData,
  SlashCommandProps,
  CommandOptions,
} from "commandkit";
import { EmbedBuilder } from "discord.js";
import User from "../../database/schemas/UserSchema";

const DAILY_REWARD = 500;
const COOLDOWN = 24 * 60 * 60 * 1000;

export const data: CommandData = {
  name: "daily",
  description: "Claim your daily reward.",
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
      user = new User({ userId, username, coins: DAILY_REWARD, bank: 0 });
      await user.save();

      const firstTimeEmbed = new EmbedBuilder()
        .setTitle("Daily Reward Claimed!")
        .setDescription(
          `Welcome to the economy system! You've recieved your first daily reward of **${DAILY_REWARD} coins**!`,
        )
        .setColor("Green")
        .setTimestamp();

      return interaction.reply({ embeds: [firstTimeEmbed] });
    }

    const now = Date.now();
    const lastClaimed = user.lastDaily || 0;

    if (now - lastClaimed < COOLDOWN) {
      const timeLeft = COOLDOWN - (now - lastClaimed);
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      const cooldownEmbed = new EmbedBuilder()
        .setTitle("Daily Reward Cooldown")
        .setDescription(
          `You've already claimed your daily reward! Come back in **${hours} hours and ${minutes} minutes**.`,
        )
        .setColor("Red")
        .setTimestamp();

      return interaction.reply({ embeds: [cooldownEmbed] });
    }

    user.coins += DAILY_REWARD;
    user.lastDaily = now;
    await user.save();

    const successEmbed = new EmbedBuilder()
      .setTitle("Daily Reward Claimed!")
      .setDescription(
        `You've recieved your daily reward of **${DAILY_REWARD} coins**!`,
      )
      .addFields({
        name: "Total Wallet Balance",
        value: `${user.coins} coins`,
      })
      .setColor("Green")
      .setTimestamp();

    interaction.reply({ embeds: [successEmbed] });
  } catch (error) {
    interaction.reply({
      content:
        "There was an error processing your daily reward. Please try again later.",
      ephemeral: true,
    });
  }
}
