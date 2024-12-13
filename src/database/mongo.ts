import mongoose from "mongoose";
import logger from "../utils/logger";

export async function connectToDatabase() {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI as string);

    if (connection.connection.readyState === 1) {
      logger.info("Successfully connected to MongoDB.");
      return true;
    } else {
      const errorMessage = "Failed to establish a stable connection.";
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Failed to connect to MongoDB: ${error.message}`, {
        stack: error.stack,
      });
    } else {
      logger.error("An unknown error occurred while connecting to MongoDB.");
    }
  }
}
