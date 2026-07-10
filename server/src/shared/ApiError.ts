/**
 * Operational error carrying an HTTP status code.
 *
 * Controllers and services throw these (often via the static helpers) and the
 * central error handler turns them into a consistent JSON response. "Operational"
 * means an expected, handled condition — as opposed to a programmer bug.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = "ApiError";
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }

  static unauthorized(message: string): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static internal(message = "Internal server error"): ApiError {
    return new ApiError(500, message, false);
  }
}
