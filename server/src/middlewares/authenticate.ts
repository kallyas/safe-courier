import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { isTokenBlacklisted } from "../config/redis";
import { ApiError } from "../shared/ApiError";
import { asyncHandler } from "../shared/asyncHandler";
import type { AuthPayload } from "../shared/types";

/** Extract the bearer token from an Authorization header, or `null`. */
export function extractToken(header?: string): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

/**
 * Verify the JWT, ensure it has not been revoked, and attach the decoded
 * payload to `req.user`. Wrapped with `asyncHandler` so async failures
 * propagate to the central error handler.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req.headers.authorization);

  if (!req.headers.authorization) {
    throw ApiError.unauthorized("Unauthorized, Missing Access Token");
  }
  if (!token) {
    throw ApiError.unauthorized("Unauthorized, Invalid Token Format");
  }
  if (await isTokenBlacklisted(token)) {
    throw ApiError.unauthorized("Unauthorized, Token Revoked");
  }

  try {
    req.user = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AuthPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized("Unauthorized, Token Expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized("Unauthorized, Invalid Token");
    }
    throw error;
  }

  next();
});
