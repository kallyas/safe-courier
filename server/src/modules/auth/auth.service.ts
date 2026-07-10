import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { blacklistToken } from "../../config/redis";
import { logger } from "../../config/logger";
import { ApiError } from "../../shared/ApiError";
import { duplicateKeyField, isDuplicateKeyError } from "../../shared/mongo";
import type { AuthPayload } from "../../shared/types";
import { User, type UserDocument } from "../users/user.model";
import type { SignupInput } from "./auth.validation";

/**
 * Sign a short-lived access token embedding the claims the API authorizes on
 * (notably `role` and `isAdmin`, which the previous implementation omitted —
 * breaking every admin check that relied on the token).
 */
export function generateAccessToken(user: UserDocument): string {
  const payload: AuthPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
    isAdmin: user.isAdminUser(),
  };

  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRY as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, options);
}

export async function registerUser(
  input: SignupInput,
): Promise<{ user: UserDocument; token: string }> {
  try {
    // Rely on the unique indexes as the single source of truth — this is one
    // write instead of two pre-check reads plus a write, and is free of the
    // check-then-create race that the previous version had.
    const user = await User.create(input);
    logger.info(`New user registered: ${user.username}`);
    return { user, token: generateAccessToken(user) };
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      const field = duplicateKeyField(err);
      throw ApiError.badRequest(
        field === "email" ? "Email already exists" : "Username already taken",
      );
    }
    throw err;
  }
}

export async function loginUser(
  identifier: string,
  password: string,
): Promise<{ user: UserDocument; token: string }> {
  const user = await User.findOne({
    $or: [{ username: identifier.toLowerCase() }, { email: identifier.toLowerCase() }],
  });

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid login credentials");
  }

  user.lastLogin = new Date();
  await user.save();
  logger.info(`User logged in: ${user.username}`);

  return { user, token: generateAccessToken(user) };
}

/**
 * Revoke an access token by blacklisting it until its natural expiry.
 * No-op when Redis is not configured.
 */
export async function revokeToken(token: string): Promise<void> {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) return;
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  await blacklistToken(token, ttl);
}
