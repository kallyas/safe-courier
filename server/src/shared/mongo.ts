import mongoose from "mongoose";
import { ApiError } from "./ApiError";

/**
 * Guard a route/service parameter that must be a Mongo ObjectId, producing a
 * friendly 400 (e.g. "Invalid user ID format") instead of an internal CastError.
 */
export function assertValidObjectId(id: string, label = "ID"): void {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest(`Invalid ${label} format`);
  }
}

interface DuplicateKeyError {
  code: number;
  keyPattern?: Record<string, unknown>;
}

/** Narrow an unknown error to a MongoDB duplicate-key (E11000) error. */
export function isDuplicateKeyError(err: unknown): err is DuplicateKeyError {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: number }).code === 11000
  );
}

/** Name of the first field that violated a unique index, if available. */
export function duplicateKeyField(err: DuplicateKeyError): string | undefined {
  return err.keyPattern ? Object.keys(err.keyPattern)[0] : undefined;
}
