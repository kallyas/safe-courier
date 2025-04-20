// src/index.js
import "dotenv/config";
import { createServer } from "http";
import app from "./server/app.js";
import "./server/config/connect.js";
import logger from "./server/utils/logger.js";

const PORT = process.env.PORT || 5000;

const server = createServer(app);

server.listen(PORT, () => {
  logger.info(`Using environment: ${process.env.NODE_ENV}`);
  logger.info(`Server successfully started and listening on port ${PORT}`);
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  logger.info("Received shutdown signal, closing server...");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export default server; // For testing
