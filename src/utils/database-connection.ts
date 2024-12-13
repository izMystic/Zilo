import { connectToDatabase } from "../database/mongo";
import logger from "./logger";

export async function initalizeDatabase() {
  try {
    await connectToDatabase();
    logger.info("Database connection established");
  } catch (error) {
    logger.error("Database connection failed", error);
  }
}
