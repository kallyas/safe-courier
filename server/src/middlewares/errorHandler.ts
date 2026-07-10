import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiError } from "../shared/ApiError";

/** Turn unmatched routes into a 404 that flows through the error handler. */
export const notFound: RequestHandler = (req, _res, next) => {
  logger.warn(`404 - ${req.method} ${req.originalUrl} - ${req.ip}`);
  next(ApiError.notFound(`Resource at - ${req.originalUrl} Not Found`));
};

interface NormalizedError {
  statusCode: number;
  message: string;
  errors?: unknown;
}

/**
 * Map any thrown value to a stable HTTP response shape.
 */
function normalize(err: unknown): NormalizedError {
  if (err instanceof ApiError) {
    return { statusCode: err.statusCode, message: err.message };
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return {
      statusCode: 400,
      message: "Validation error",
      errors: Object.values(err.errors).map((e) => ({
        message: e.message,
        path: e.path,
      })),
    };
  }

  if (err instanceof mongoose.Error.CastError) {
    return { statusCode: 400, message: "Invalid ID format" };
  }

  // Mongo duplicate-key error.
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  ) {
    return { statusCode: 409, message: "Resource already exists" };
  }

  return { statusCode: 500, message: "Internal server error" };
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const { statusCode, message, errors } = normalize(err);
  const stack = err instanceof Error ? err.stack : undefined;

  if (statusCode >= 500) {
    logger.error(
      `${statusCode} - ${message} - ${req.method} ${req.originalUrl}\n${stack ?? ""}`,
    );
  } else {
    logger.warn(`${statusCode} - ${message} - ${req.method} ${req.originalUrl}`);
  }

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    ...(errors ? { errors } : {}),
    ...(env.isProduction ? {} : { stack }),
    timestamp: new Date().toISOString(),
  });
};
