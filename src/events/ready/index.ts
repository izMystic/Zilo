import type { Client } from "discord.js";
import logger from "@src/utils/logger";

export default async function (client: Client<true>) {
  logger.info(`Logged in as ${client.user.tag}! (${client.user.id})`);
}
