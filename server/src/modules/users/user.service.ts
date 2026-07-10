import { logger } from "../../config/logger";
import { ApiError } from "../../shared/ApiError";
import {
  assertValidObjectId,
  duplicateKeyField,
  isDuplicateKeyError,
} from "../../shared/mongo";
import {
  buildPaginationMeta,
  type PaginationParams,
} from "../../shared/pagination";
import type { PaginationMeta } from "../../shared/types";
import { User } from "./user.model";
import type { UpdateUserInput } from "./user.validation";

// Projection applied to every read so secrets never leave the data layer —
// `.lean()` skips the schema's toJSON transform, so we must be explicit here.
const PUBLIC_FIELDS = "-password -refreshToken -__v";

export interface ListUsersOptions {
  pagination: PaginationParams;
  status?: string;
  role?: string;
  includeParcels?: boolean;
}

export async function getUserById(id: string) {
  assertValidObjectId(id, "user ID");
  const user = await User.findById(id).select(PUBLIC_FIELDS).lean();
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function getProfile(id: string) {
  assertValidObjectId(id, "user ID");
  const user = await User.findById(id)
    .select(PUBLIC_FIELDS)
    .populate("parcels")
    .lean();
  if (!user) throw ApiError.notFound("User not found");
  return user;
}

export async function listUsers(
  options: ListUsersOptions,
): Promise<{ users: unknown[]; meta: PaginationMeta }> {
  const filter: Record<string, unknown> = {};
  if (options.status) filter.status = options.status;
  if (options.role) filter.role = options.role;

  const query = User.find(filter)
    .select(PUBLIC_FIELDS)
    .sort({ createdAt: -1 })
    .skip(options.pagination.skip)
    .limit(options.pagination.limit)
    .lean();

  if (options.includeParcels) query.populate("parcels");

  const [users, total] = await Promise.all([
    query.exec(),
    User.countDocuments(filter),
  ]);

  return { users, meta: buildPaginationMeta(total, options.pagination) };
}

export async function updateUser(id: string, updates: UpdateUserInput) {
  assertValidObjectId(id, "user ID");

  try {
    // The unique index enforces email uniqueness atomically; no pre-check read.
    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .select(PUBLIC_FIELDS)
      .lean();

    if (!user) throw ApiError.notFound("User not found");
    logger.info(`User updated: ${id}`);
    return user;
  } catch (err) {
    if (isDuplicateKeyError(err) && duplicateKeyField(err) === "email") {
      throw ApiError.badRequest("Email already exists");
    }
    throw err;
  }
}

export async function deleteUser(id: string): Promise<void> {
  assertValidObjectId(id, "user ID");
  const user = await User.findByIdAndDelete(id);
  if (!user) throw ApiError.notFound("User not found");
  logger.info(`User deleted: ${id}`);
}

export async function changePassword(
  id: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  assertValidObjectId(id, "user ID");
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound("User not found");

  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.unauthorized("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();
  logger.info(`Password changed for user: ${user.id}`);
}
