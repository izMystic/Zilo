import mongoose from "mongoose";
import logger from "@src/utils/logger";

mongoose.set("strictQuery", true);

export async function initializeMongoose() {
  logger.info("Connecting to MongoDB...");
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    logger.info("Mongoose: Database connection established");
    return mongoose.connection;
  } catch (error) {
    logger.error("Mongoose: Failed to connect to database", error);
    process.exit(1);
  }
}
