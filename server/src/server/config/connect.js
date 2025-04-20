// src/server/config/connect.js
import mongoose from "mongoose";
import { DEVELOPMENT, PRODUCTION, LOCAL, TEST } from "./envTypes.js";
import logger from "../utils/logger.js";

// Select the appropriate DB URL based on environment
let DB_URL;
switch (process.env.NODE_ENV) {
  case DEVELOPMENT:
    DB_URL = process.env.DB_URL_DEV;
    break;
  case PRODUCTION:
    DB_URL = process.env.DB_URL_PROD;
    break;
  case LOCAL:
    DB_URL = process.env.DB_URL_LOC;
    break;
  case TEST:
    DB_URL = process.env.DB_URL_TEST;
    break;
  default:
    DB_URL = process.env.DB_URL;
}

const options = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  maxPoolSize: 10, // Maintain up to 10 socket connections
};

const connectWithRetry = async (retryCount = 0, maxRetries = 5) => {
  try {
    logger.info("Attempting to connect to MongoDB...");
    await mongoose.connect(DB_URL, options);
    logger.info("MongoDB connection established successfully!");

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err}`);
      setTimeout(() => connectWithRetry(0), 5000);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected, attempting to reconnect...");
      setTimeout(() => connectWithRetry(0), 5000);
    });

    // If the Node process ends, close the MongoDB connection
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (err) {
    if (retryCount < maxRetries) {
      logger.warn(
        `MongoDB connection failed. Retrying (${
          retryCount + 1
        }/${maxRetries})...`,
      );
      setTimeout(() => connectWithRetry(retryCount + 1, maxRetries), 5000);
    } else {
      logger.error(
        `MongoDB connection failed after ${maxRetries} attempts: ${err.message}`,
      );
      // Don't exit the process, allow other functionalities to work
    }
  }
};

// Initialize connection
connectWithRetry();

export default mongoose.connection;
