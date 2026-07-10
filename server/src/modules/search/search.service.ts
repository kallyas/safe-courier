import { isAdminUser } from "../../middlewares/authorize";
import { ApiError } from "../../shared/ApiError";
import {
  buildPaginationMeta,
  type PaginationParams,
} from "../../shared/pagination";
import type { AuthPayload, PaginationMeta } from "../../shared/types";
import { Parcel, progressForStatus } from "../parcels/parcel.model";
import { User } from "../users/user.model";
import type { AdvancedSearchInput } from "./search.validation";

const MIN_QUERY_LENGTH = 2;
const USER_FIELDS = "-password -refreshToken -__v";
const SENDER_FIELDS = "-password -refreshToken";

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertQueryLength(q: string | undefined): asserts q is string {
  if (!q || q.trim().length < MIN_QUERY_LENGTH) {
    throw ApiError.badRequest("Search query must be at least 2 characters");
  }
}

/** Restrict non-admins to parcels they sent or are assigned to deliver. */
function parcelScope(requester: AuthPayload): Record<string, unknown> {
  if (isAdminUser(requester)) return {};
  return {
    $or: [{ sender: requester.id }, { courierAssigned: requester.id }],
  };
}

export async function searchUsers(options: {
  q: string;
  requester: AuthPayload;
  pagination: PaginationParams;
}): Promise<{ users: unknown[]; meta: PaginationMeta }> {
  assertQueryLength(options.q);
  // Uses the weighted text index on username/first/last/email.
  const filter = { $text: { $search: options.q.trim() } };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(USER_FIELDS)
      .skip(options.pagination.skip)
      .limit(options.pagination.limit)
      .lean()
      .exec(),
    User.countDocuments(filter),
  ]);

  return { users, meta: buildPaginationMeta(total, options.pagination) };
}

export async function searchParcels(options: {
  q: string;
  requester: AuthPayload;
  pagination: PaginationParams;
}): Promise<{ parcels: unknown[]; meta: PaginationMeta }> {
  assertQueryLength(options.q);
  // Text index covers trackingCode/recipient/description.
  const filter = {
    $text: { $search: options.q.trim() },
    ...parcelScope(options.requester),
  };

  const [parcels, total] = await Promise.all([
    Parcel.find(filter)
      .populate("sender", SENDER_FIELDS)
      .skip(options.pagination.skip)
      .limit(options.pagination.limit)
      .lean()
      .exec(),
    Parcel.countDocuments(filter),
  ]);

  return {
    parcels: parcels.map((p) => ({ ...p, progress: progressForStatus(p.status) })),
    meta: buildPaginationMeta(total, options.pagination),
  };
}

export async function advancedSearch(
  input: AdvancedSearchInput,
  requester: AuthPayload,
): Promise<{ results: unknown[]; meta: PaginationMeta }> {
  const pagination: PaginationParams = {
    page: input.page ?? 1,
    limit: input.limit ?? 10,
    skip: ((input.page ?? 1) - 1) * (input.limit ?? 10),
  };
  const sort: Record<string, 1 | -1> = {
    [input.sortBy]: input.sortOrder === "asc" ? 1 : -1,
  };
  const hasQuery =
    !!input.query && input.query.trim().length >= MIN_QUERY_LENGTH;

  if (input.type === "users") {
    const filter: Record<string, unknown> = {};
    if (hasQuery) filter.$text = { $search: input.query!.trim() };
    applyDateRange(filter, input.dateFrom, input.dateTo);

    const [results, total] = await Promise.all([
      User.find(filter)
        .select(USER_FIELDS)
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean()
        .exec(),
      User.countDocuments(filter),
    ]);
    return { results, meta: buildPaginationMeta(total, pagination) };
  }

  const filter: Record<string, unknown> = { ...parcelScope(requester) };
  if (hasQuery) filter.$text = { $search: input.query!.trim() };
  applyDateRange(filter, input.dateFrom, input.dateTo);
  if (input.status) filter.status = input.status;
  if (input.parcelType) filter.parcelType = input.parcelType;
  if (input.city) {
    filter["locationTo.city"] = new RegExp(escapeRegex(input.city), "i");
  }
  if (input.weight) applyWeightRange(filter, input.weight);

  const [results, total] = await Promise.all([
    Parcel.find(filter)
      .populate("sender", SENDER_FIELDS)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean()
      .exec(),
    Parcel.countDocuments(filter),
  ]);
  return {
    results: results.map((p) => ({
      ...p,
      progress: progressForStatus(p.status),
    })),
    meta: buildPaginationMeta(total, pagination),
  };
}

function applyDateRange(
  filter: Record<string, unknown>,
  from?: string,
  to?: string,
): void {
  if (!from && !to) return;
  const range: Record<string, Date> = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(to);
  filter.createdAt = range;
}

function applyWeightRange(
  filter: Record<string, unknown>,
  weight: string,
): void {
  const [min, max] = weight.split("-").map(Number);
  const range: Record<string, number> = {};
  if (!Number.isNaN(min)) range.$gte = min;
  if (!Number.isNaN(max)) range.$lte = max;
  if (Object.keys(range).length) filter.weight = range;
}
