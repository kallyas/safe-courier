// src/server/middlewares/errorHandlers.js
import createError from "http-errors";
import logger from "../utils/logger.js";

/**
 * Handles 404 Not Found errors
 */
export const notFound = (req, res, next) => {
  const error = createError(404, `Resource at - ${req.originalUrl} Not Found`);
  logger.warn(`404 - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  next(error);
};

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log error details
  logger.error(
    `${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
  );

  // Format of error response
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    timestamp: new Date().toISOString(),
  });
};
