// src/server/middlewares/auth.js
import jwt from "jsonwebtoken";
import createError from "http-errors";
import User from "../models/user.model.js";
import logger from "../utils/logger.js";
import { redisClient } from "../utils/redis.js";

/**
 * Generate JWT access token
 * @param {Object} user - User object to encode in token
 * @returns {string} JWT token
 */
export const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    role: user.role,
  };

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || "24h",
  });
};

/**
 * Verify JWT token and attach user to request
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(createError(401, "Unauthorized, Missing Access Token"));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(createError(401, "Unauthorized, Invalid Token Format"));
    }

    // Check if token is blacklisted (user logged out)
    if (redisClient && (await redisClient.get(`bl_${token}`))) {
      return next(createError(401, "Unauthorized, Token Revoked"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(createError(401, "Unauthorized, Token Expired"));
    }

    if (error.name === "JsonWebTokenError") {
      return next(createError(401, "Unauthorized, Invalid Token"));
    }

    logger.error(`Auth error: ${error.message}`);
    return next(createError(403, "Forbidden, Invalid Access Token"));
  }
};

/**
 * Check if user has admin role
 */
export const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.isAdmin)) {
    return next();
  }
  return next(createError(403, "Forbidden, Admin Access Required"));
};

/**
 * Check if user is accessing their own resource or is an admin
 */
export const checkUser = (req, res, next) => {
  const resourceId = req.params.id || req.params.userId || req.params.parcelId;

  // If user is admin, allow access
  if (req.user && (req.user.role === "admin" || req.user.isAdmin)) {
    return next();
  }

  // If user is accessing their own resource
  if (req.user && req.user.id === resourceId) {
    return next();
  }

  return next(
    createError(
      403,
      "Forbidden, You are not authorized to access this resource",
    ),
  );
};

/**
 * Log out a user by blacklisting their token
 */
export const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];

    // Get JWT expiry time from token
    const decoded = jwt.decode(token);
    const expiryTime = decoded.exp - Math.floor(Date.now() / 1000);

    // Add token to blacklist in Redis
    if (redisClient) {
      await redisClient.set(`bl_${token}`, "true", "EX", expiryTime);
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
