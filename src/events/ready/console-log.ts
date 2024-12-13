import type { Client } from "discord.js";
import type { CommandKit } from "commandkit";
import logger from "../../utils/logger";
import { initalizeDatabase } from "../../utils/database-connection";

export default async function (
  c: Client<true>,
  client: Client<true>,
  handler: CommandKit,
) {
  logger.info(`${c.user.username} is ready!`);

  await initalizeDatabase();
}
