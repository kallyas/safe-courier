import type { AuthPayload, UserRole } from "./types";

/**
 * Capability-based access control.
 *
 * Authorization is expressed as discrete permissions rather than scattered
 * `role === "admin"` checks. Roles are mapped to the permissions they grant, so
 * adding a capability (or a role) is a one-line change here instead of an audit
 * across every controller.
 */
export type Permission =
  | "user:list"
  | "parcel:read:all"
  | "parcel:update:status"
  | "parcel:update:location"
  | "parcel:assign";

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  admin: [
    "user:list",
    "parcel:read:all",
    "parcel:update:status",
    "parcel:update:location",
    "parcel:assign",
  ],
  // Couriers can advance the parcels assigned to them; ownership of the
  // specific parcel is enforced separately in the service layer.
  courier: ["parcel:update:status", "parcel:update:location"],
  user: [],
};

export function permissionsForRole(role: UserRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Whether the authenticated user holds a permission. The legacy `isAdmin`
 * boolean is honored as a full-access flag so existing tokens keep working.
 */
export function can(
  user: AuthPayload | undefined,
  permission: Permission,
): boolean {
  if (!user) return false;
  if (user.isAdmin || user.role === "admin") return true;
  return permissionsForRole(user.role).includes(permission);
}

export function isAdmin(user: AuthPayload | undefined): boolean {
  return Boolean(user && (user.isAdmin || user.role === "admin"));
}
