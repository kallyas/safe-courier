import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

const options: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10,
  // Don't rebuild indexes on every boot in production — manage them explicitly
  // (e.g. via a migration or `syncIndexes`) to avoid surprise foreground builds.
  autoIndex: !env.isProduction,
};

/**
 * Connect to MongoDB with bounded retries.
 *
 * Unlike the previous implementation this is an explicit, awaitable function
 * (no work happens on import), which makes the connection lifecycle easy to
 * control from the entrypoint and to bypass entirely in tests.
 */
export async function connectDatabase(
  retries = 5,
  delayMs = 5000,
): Promise<typeof mongoose> {
  if (!env.databaseUrl) {
    throw new Error(
      "No MongoDB connection string configured for the current environment",
    );
  }

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      logger.info(`Connecting to MongoDB (attempt ${attempt}/${retries})...`);
      await mongoose.connect(env.databaseUrl, options);
      logger.info("MongoDB connection established");

      mongoose.connection.on("error", (err) => {
        logger.error(`MongoDB connection error: ${err.message}`);
      });
      mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
      });

      return mongoose;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`MongoDB connection failed: ${message}`);
      if (attempt === retries) {
        throw new Error(
          `Could not connect to MongoDB after ${retries} attempts: ${message}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Unreachable, but satisfies the type checker.
  throw new Error("Unexpected MongoDB connection failure");
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
  }
}
