import type { Client } from "discord.js";
import type { CommandKit } from "commandkit";
import logger from "@src/utils/logger";

export default async function (
  c: Client<true>,
  client: Client<true>,
  handler: CommandKit,
) {
  logger.info(`Logged in as ${client.user.tag}! (${client.user.id})`);
}
