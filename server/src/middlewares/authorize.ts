import type { Request, RequestHandler } from "express";
import { ApiError } from "../shared/ApiError";
import { can, isAdmin, type Permission } from "../shared/rbac";
import type { AuthPayload } from "../shared/types";

/** True if the authenticated user has administrative privileges. */
export const isAdminUser = isAdmin;

/** Require a specific capability (see `shared/rbac`). */
export function requirePermission(permission: Permission): RequestHandler {
  return (req, _res, next) => {
    if (can(req.user, permission)) return next();
    next(ApiError.forbidden("Forbidden, Insufficient Permissions"));
  };
}

/** Require the caller to be an administrator. */
export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (isAdmin(req.user)) return next();
  next(ApiError.forbidden("Forbidden, Admin Access Required"));
};

/**
 * Require the caller to be acting on their own resource, or to be an admin.
 * The resource owner id is read from the first matching route param.
 */
export const requireSelfOrAdmin: RequestHandler = (req, _res, next) => {
  if (isAdmin(req.user)) return next();

  const resourceId =
    req.params.id ?? req.params.userId ?? req.params.parcelId ?? "";

  if (req.user && req.user.id === resourceId) return next();

  next(
    ApiError.forbidden(
      "Forbidden, You are not authorized to access this resource",
    ),
  );
};

/** Assert and return the authenticated user, or throw 401. */
export function requireUser(req: Request): AuthPayload {
  if (!req.user) {
    throw ApiError.unauthorized("Unauthorized, Missing Access Token");
  }
  return req.user;
}
