import { Client, GatewayIntentBits } from "discord.js";
import { CommandKit } from "commandkit";
import { initializeMongoose } from "./database/mongo";
import path from "node:path";
import "./config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

new CommandKit({
  client,
  commandsPath: path.join(__dirname, "commands"),
  eventsPath: path.join(__dirname, "events"),
  devGuildIds: config.devGuildIds,
  devUserIds: config.devUserIds,
  devRoleIds: config.devRoleIds,
  skipBuiltInValidations: true,
  bulkRegister: true,
});

(async () => {
  await initializeMongoose();

  await client.login(process.env.DISCORD_TOKEN);
})();
