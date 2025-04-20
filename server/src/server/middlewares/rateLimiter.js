// src/server/middlewares/rateLimiter.js
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";
import logger from "../utils/logger.js";

// Redis client for rate limiting
let redisClient;
let store;

// Initialize Redis if REDIS_URL is available
const initRedis = async () => {
  if (process.env.REDIS_URL) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            // Exponential backoff with a maximum delay of 10 seconds
            const delay = Math.min(1000 * 2 ** retries, 10000);
            logger.info(`Redis reconnecting in ${delay}ms...`);
            return delay;
          },
        },
      });

      await redisClient.connect();

      redisClient.on("error", (err) => {
        logger.error(`Redis error: ${err}`);
      });

      redisClient.on("ready", () => {
        logger.info("Redis connection established");
      });

      store = new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      });

      logger.info("Redis rate limiting enabled");
    } catch (error) {
      logger.error(`Redis initialization error: ${error.message}`);
      // Fall back to memory store
      store = undefined;
    }
  }
};

initRedis().catch((err) => {
  logger.error(`Failed to initialize Redis: ${err.message}`);
});

// Create and export the rate limiter middleware
const rateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  max: process.env.NODE_ENV === "production" ? 1000 : 5000, // Limit each IP to 1000 requests per window in production
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: store, // Use Redis store if available, otherwise use memory store
  message: {
    status: "error",
    statusCode: 429,
    message: "Too Many Requests",
    detail: "You have exceeded the request rate limit. Please try again later.",
  },
  // Skip rate limiting for specific IPs (e.g., internal monitoring services)
  skip: (req) => {
    const skipIPs = (process.env.RATE_LIMIT_SKIP_IPS || "").split(",");
    return skipIPs.includes(req.ip);
  },
});

export default rateLimiter;
