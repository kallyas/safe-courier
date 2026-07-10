import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { closeRedis, initRedis } from "./config/redis";
import { logger } from "./config/logger";
import { Parcel } from "./modules/parcels/parcel.model";
import { User } from "./modules/users/user.model";

async function bootstrap(): Promise<void> {
  // Connect dependencies before accepting traffic.
  await connectDatabase();
  await initRedis();

  // With autoIndex disabled in production, build indexes explicitly on boot in
  // other environments so text-search queries have an index to use.
  if (!env.isProduction) {
    await Promise.all([User.syncIndexes(), Parcel.syncIndexes()]);
  }

  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Server listening on port ${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully...`);

    const forceExit = setTimeout(() => {
      logger.error("Could not close connections in time, forcing shutdown");
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    server.close(async () => {
      await Promise.allSettled([disconnectDatabase(), closeRedis()]);
      logger.info("Shutdown complete");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`Failed to start server: ${message}`);
  process.exit(1);
});
