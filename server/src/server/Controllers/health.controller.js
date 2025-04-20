// src/server/controllers/health.controller.js
import mongoose from "mongoose";
import { redisClient } from "../utils/redis.js";
import logger from "../utils/logger.js";

/**
 * Check the health of the API and its dependencies
 * @route GET /health
 */
export const checkHealth = async (req, res) => {
  try {
    // Initialize status object
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      services: {
        api: {
          status: "ok",
        },
        database: {
          status: "checking",
        },
        redis: {
          status: "disabled",
        },
      },
    };

    // Check MongoDB connection
    try {
      if (mongoose.connection.readyState === 1) {
        // Run a simple query to verify connection is working
        await mongoose.connection.db.admin().ping();
        health.services.database.status = "ok";
      } else {
        health.services.database.status = "disconnected";
        health.services.database.state = mongoose.connection.readyState;
        health.status = "degraded";
      }
    } catch (error) {
      logger.error(`Health check - MongoDB error: ${error.message}`);
      health.services.database.status = "error";
      health.services.database.error = error.message;
      health.status = "degraded";
    }

    // Check Redis connection if available
    if (redisClient) {
      try {
        const redisStatus = await redisClient.ping();
        if (redisStatus === "PONG") {
          health.services.redis.status = "ok";
        } else {
          health.services.redis.status = "error";
          health.status = "degraded";
        }
      } catch (error) {
        logger.error(`Health check - Redis error: ${error.message}`);
        health.services.redis.status = "error";
        health.services.redis.error = error.message;
        health.status = "degraded";
      }
    }

    // Set appropriate status code
    const statusCode =
      health.status === "ok" ? 200 : health.status === "degraded" ? 200 : 503;

    // Return health status
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error(`Health check error: ${error.message}`);

    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};

/**
 * Deep health check that performs more thorough testing of dependencies
 * @route GET /health/deep
 */
export const deepHealthCheck = async (req, res) => {
  try {
    // Initialize deep health object
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      services: {
        api: {
          status: "ok",
          version: process.env.API_VERSION || "1.0.0",
        },
        database: {
          status: "checking",
          connection: {
            host: process.env.DB_URL
              ? new URL(process.env.DB_URL).hostname
              : "unknown",
          },
        },
        redis: {
          status: "disabled",
        },
      },
    };

    // Check MongoDB connection and performance
    try {
      if (mongoose.connection.readyState === 1) {
        // Run ping to check connection
        const pingStart = Date.now();
        await mongoose.connection.db.admin().ping();
        const pingDuration = Date.now() - pingStart;

        // Get server stats
        const stats = await mongoose.connection.db.admin().serverStatus();

        health.services.database.status = "ok";
        health.services.database.ping = `${pingDuration}ms`;
        health.services.database.version = stats.version;
        health.services.database.connections = {
          current: stats.connections?.current || "unknown",
          available: stats.connections?.available || "unknown",
        };
      } else {
        health.services.database.status = "disconnected";
        health.services.database.state = mongoose.connection.readyState;
        health.status = "degraded";
      }
    } catch (error) {
      logger.error(`Deep health check - MongoDB error: ${error.message}`);
      health.services.database.status = "error";
      health.services.database.error = error.message;
      health.status = "degraded";
    }

    // Check Redis connection and performance if available
    if (redisClient) {
      try {
        const redisStart = Date.now();
        const redisStatus = await redisClient.ping();
        const redisDuration = Date.now() - redisStart;

        if (redisStatus === "PONG") {
          // Get some info about Redis
          const info = await redisClient.info();
          const infoLines = info.split("\r\n");
          const version =
            infoLines
              .find((line) => line.startsWith("redis_version"))
              ?.split(":")[1] || "unknown";
          const memory =
            infoLines
              .find((line) => line.startsWith("used_memory_human"))
              ?.split(":")[1] || "unknown";

          health.services.redis.status = "ok";
          health.services.redis.ping = `${redisDuration}ms`;
          health.services.redis.version = version;
          health.services.redis.memory = memory;
        } else {
          health.services.redis.status = "error";
          health.status = "degraded";
        }
      } catch (error) {
        logger.error(`Deep health check - Redis error: ${error.message}`);
        health.services.redis.status = "error";
        health.services.redis.error = error.message;
        health.status = "degraded";
      }
    }

    // Set appropriate status code
    const statusCode =
      health.status === "ok" ? 200 : health.status === "degraded" ? 200 : 503;

    // Return health status
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error(`Deep health check error: ${error.message}`);

    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};
