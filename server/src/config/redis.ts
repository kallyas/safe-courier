import { createClient, type RedisClientType } from "redis";
import { env } from "./env";
import { logger } from "./logger";

let client: RedisClientType | null = null;

/**
 * Initialize the Redis connection if `REDIS_URL` is configured.
 *
 * Redis is entirely optional: when it is not configured every helper below
 * becomes a no-op so the app runs fine without it (e.g. in tests).
 */
export async function initRedis(): Promise<void> {
  if (!env.REDIS_URL) {
    logger.warn("REDIS_URL not set — token revocation/caching disabled");
    return;
  }

  try {
    client = createClient({
      url: env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(1000 * 2 ** retries, 10_000),
      },
    });

    client.on("error", (err) => logger.error(`Redis error: ${err.message}`));
    client.on("ready", () => logger.info("Redis client ready"));

    await client.connect();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Redis initialization failed: ${message}`);
    client = null;
  }
}

export function getRedisClient(): RedisClientType | null {
  return client;
}

export function isRedisReady(): boolean {
  return client !== null && client.isReady;
}

/**
 * Revoke a JWT by storing it in a blacklist until its natural expiry.
 */
export async function blacklistToken(
  token: string,
  ttlSeconds: number,
): Promise<void> {
  if (!isRedisReady() || ttlSeconds <= 0) return;
  await client!.set(`bl:${token}`, "1", { EX: ttlSeconds });
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  if (!isRedisReady()) return false;
  const value = await client!.get(`bl:${token}`);
  return value !== null;
}

export async function closeRedis(): Promise<void> {
  if (client && client.isOpen) {
    await client.quit();
    client = null;
  }
}
