// src/server/utils/redis.js
import { createClient } from "redis";
import mongoose from "mongoose";
import logger from "./logger.js";

// Create Redis client
export let redisClient = null;

/**
 * Initialize Redis connection
 */
export const initRedis = async () => {
  if (!process.env.REDIS_URL) {
    logger.warn("REDIS_URL not defined, caching disabled");
    return;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          // Exponential backoff with a max delay of 10 seconds
          return Math.min(1000 * 2 ** retries, 10000);
        },
      },
    });

    // Handle events
    redisClient.on("error", (err) => {
      logger.error(`Redis error: ${err.message}`);
    });

    redisClient.on("connect", () => {
      logger.info("Redis client connected");
    });

    redisClient.on("reconnecting", () => {
      logger.info("Redis client reconnecting");
    });

    redisClient.on("ready", () => {
      logger.info("Redis client ready");
    });

    await redisClient.connect();

    // Add cache method to mongoose queries
    setupMongooseCache();

    logger.info("Redis caching enabled");
  } catch (error) {
    logger.error(`Redis initialization failed: ${error.message}`);
    redisClient = null;
  }
};

/**
 * Add caching functionality to Mongoose queries
 */
const setupMongooseCache = () => {
  // Store reference to the original exec function
  const exec = mongoose.Query.prototype.exec;

  // Add cache method to mongoose queries
  mongoose.Query.prototype.cache = function (options = { ttl: 60 }) {
    this._cache = {
      enabled: true,
      ttl: options.ttl,
      key: options.key || this.mongooseCollection.name,
    };
    return this;
  };

  // Override exec function
  mongoose.Query.prototype.exec = async function () {
    // Skip cache if disabled for this query or Redis is not available
    if (!this._cache || !this._cache.enabled || !redisClient) {
      return exec.apply(this, arguments);
    }

    // Create a unique key for this query
    const key = JSON.stringify({
      ...this.getQuery(),
      collection: this.mongooseCollection.name,
      options: this.getOptions(),
      model: this.model.modelName,
    });

    // Try getting data from cache first
    try {
      const cachedResult = await redisClient.get(
        `cache:${this._cache.key}:${key}`,
      );

      if (cachedResult) {
        logger.debug("Query result retrieved from cache");

        // Parse the cached result
        const parsedResult = JSON.parse(cachedResult);

        // Convert plain objects to Mongoose documents
        return Array.isArray(parsedResult)
          ? parsedResult.map((doc) => new this.model(doc))
          : new this.model(parsedResult);
      }
    } catch (error) {
      logger.error(`Redis cache error: ${error.message}`);
    }

    // Execute the query
    const result = await exec.apply(this, arguments);

    // Store result in cache
    try {
      // Don't cache null results
      if (result) {
        const valueToCache = JSON.stringify(result);
        await redisClient.set(`cache:${this._cache.key}:${key}`, valueToCache, {
          EX: this._cache.ttl,
        });
      }
    } catch (error) {
      logger.error(`Redis cache set error: ${error.message}`);
    }

    return result;
  };
};

/**
 * Clear cache by key pattern
 * @param {string} pattern - Key pattern to clear
 */
export const clearCache = async (pattern) => {
  if (!redisClient) return;

  try {
    // Get all keys matching the pattern
    const keys = await redisClient.keys(`cache:${pattern}:*`);

    if (keys.length > 0) {
      // Delete all matching keys
      await redisClient.del(keys);
      logger.debug(
        `Cleared ${keys.length} cache entries for pattern: ${pattern}`,
      );
    }
  } catch (error) {
    logger.error(`Error clearing cache: ${error.message}`);
  }
};

// Initialize Redis when this module is imported
initRedis().catch((err) => {
  logger.error(`Redis initialization error: ${err.message}`);
});
