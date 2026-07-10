import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";
import { env } from "../config/env";

/**
 * Build the API rate limiter.
 *
 * Both standard (`RateLimit-*`) and legacy (`X-RateLimit-*`) headers are emitted
 * for broad client compatibility. The limit is generous in non-production so it
 * never interferes with development or the test suite.
 */
export function createRateLimiter(): RateLimitRequestHandler {
  return rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24h
    max: env.isProduction ? 1000 : 5000,
    standardHeaders: true,
    legacyHeaders: true,
    message: {
      status: "error",
      statusCode: 429,
      message: "Too Many Requests",
      detail:
        "You have exceeded the request rate limit. Please try again later.",
    },
    skip: (req) => env.rateLimitSkipIps.includes(req.ip ?? ""),
  });
}
