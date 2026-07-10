import "dotenv/config";
import { z } from "zod";

/**
 * Centralized, validated environment configuration.
 *
 * All environment access in the app goes through the exported `env` object so
 * that a missing or malformed variable fails fast at startup instead of
 * surfacing as a confusing runtime error deep in a request handler.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test", "local"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),

  // MongoDB — one URL per environment, resolved by `databaseUrl` below.
  DB_URL: z.string().optional(),
  DB_URL_DEV: z.string().optional(),
  DB_URL_PROD: z.string().optional(),
  DB_URL_LOC: z.string().optional(),
  DB_URL_TEST: z.string().optional(),

  // Auth
  ACCESS_TOKEN_SECRET: z.string().min(1, "ACCESS_TOKEN_SECRET is required"),
  JWT_EXPIRY: z.string().default("24h"),

  // Optional infrastructure
  REDIS_URL: z.string().optional(),

  // HTTP
  CORS_ORIGIN: z.string().default("*"),
  RATE_LIMIT_SKIP_IPS: z.string().default(""),

  // API metadata
  API_NAME: z.string().default("Safe Courier API"),
  API_TEAM: z.string().default("Safe Courier Team"),
  API_VERSION: z.string().default("1.0.0"),

  LOG_LEVEL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  console.error(`Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

const raw = parsed.data;

/**
 * Resolve the active MongoDB connection string for the current environment.
 */
function resolveDatabaseUrl(): string | undefined {
  switch (raw.NODE_ENV) {
    case "development":
      return raw.DB_URL_DEV ?? raw.DB_URL;
    case "production":
      return raw.DB_URL_PROD ?? raw.DB_URL;
    case "local":
      return raw.DB_URL_LOC ?? raw.DB_URL;
    case "test":
      return raw.DB_URL_TEST ?? raw.DB_URL;
    default:
      return raw.DB_URL;
  }
}

export const env = {
  ...raw,
  databaseUrl: resolveDatabaseUrl(),
  isProduction: raw.NODE_ENV === "production",
  isTest: raw.NODE_ENV === "test",
  isDevelopment: raw.NODE_ENV === "development" || raw.NODE_ENV === "local",
  rateLimitSkipIps: raw.RATE_LIMIT_SKIP_IPS.split(",")
    .map((ip) => ip.trim())
    .filter(Boolean),
};

export type Env = typeof env;
