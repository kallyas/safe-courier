import { logger } from "../../config/logger";
import { isAdminUser } from "../../middlewares/authorize";
import { ApiError } from "../../shared/ApiError";
import { assertValidObjectId } from "../../shared/mongo";
import {
  buildPaginationMeta,
  type PaginationParams,
} from "../../shared/pagination";
import type { AuthPayload, PaginationMeta } from "../../shared/types";
import { User } from "../users/user.model";
import {
  Parcel,
  progressForStatus,
  type ILocation,
  type ParcelDocument,
  type ParcelStatus,
  type ParcelType,
  type PaymentStatus,
} from "./parcel.model";
import type { CreateParcelInput } from "./parcel.validation";

const SENDER_FIELDS = "-password -refreshToken";
const TERMINAL: ParcelStatus[] = ["delivered", "returned", "cancelled"];

/** Base transit days by parcel type — lighter/urgent goods move faster. */
const DAYS_BY_TYPE: Record<ParcelType, number> = {
  document: 1,
  perishable: 1,
  fragile: 2,
  electronics: 2,
  package: 3,
  other: 3,
};

/** Normalize an id that may be a raw ObjectId or a populated doc to a string. */
function idToString(value: unknown): string | undefined {
  if (value == null) return undefined;
  const maybeDoc = value as { _id?: unknown };
  return (maybeDoc._id ?? value).toString();
}

/** Attach the (virtual) progress to a lean parcel object. */
function withProgress<T extends { status: ParcelStatus }>(parcel: T) {
  return { ...parcel, progress: progressForStatus(parcel.status) };
}

/** Rough delivery estimate from parcel type and distance between endpoints. */
function computeEstimatedDelivery(
  type: ParcelType,
  from?: ILocation,
  to?: ILocation,
): Date {
  let days = DAYS_BY_TYPE[type];
  if (from && to) {
    if (from.country && to.country && from.country !== to.country) days += 3;
    else if (from.city !== to.city) days += 1;
  } else {
    days += 2;
  }
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function createParcel(
  senderId: string,
  input: CreateParcelInput,
): Promise<ParcelDocument> {
  const parcel = await Parcel.create({ ...input, sender: senderId });
  await parcel.populate("sender", SENDER_FIELDS);
  logger.info(`Parcel created: ${parcel.id}`);
  return parcel;
}

export async function listParcels(options: {
  requester: AuthPayload;
  pagination: PaginationParams;
  status?: string;
  parcelType?: string;
}): Promise<{ parcels: unknown[]; meta: PaginationMeta }> {
  const filter: Record<string, unknown> = {};
  if (options.status) filter.status = options.status;
  if (options.parcelType) filter.parcelType = options.parcelType;
  // Non-admins see parcels they sent or are assigned to deliver.
  if (!isAdminUser(options.requester)) {
    filter.$or = [
      { sender: options.requester.id },
      { courierAssigned: options.requester.id },
    ];
  }

  const [parcels, total] = await Promise.all([
    Parcel.find(filter)
      .populate("sender", SENDER_FIELDS)
      .sort({ createdAt: -1 })
      .skip(options.pagination.skip)
      .limit(options.pagination.limit)
      .lean()
      .exec(),
    Parcel.countDocuments(filter),
  ]);

  return {
    parcels: parcels.map(withProgress),
    meta: buildPaginationMeta(total, options.pagination),
  };
}

export async function getParcelById(
  id: string,
  requester: AuthPayload,
): Promise<ParcelDocument> {
  assertValidObjectId(id, "parcel ID");
  const parcel = await Parcel.findById(id).populate("sender", SENDER_FIELDS);
  if (!parcel) throw ApiError.notFound("Parcel not found");

  const canView =
    isAdminUser(requester) ||
    idToString(parcel.sender) === requester.id ||
    idToString(parcel.courierAssigned) === requester.id;

  if (!canView) {
    throw ApiError.forbidden("You are not authorized to view this parcel");
  }
  return parcel;
}

export async function getParcelsByUser(options: {
  targetUserId: string;
  requester: AuthPayload;
  pagination: PaginationParams;
  status?: string;
  parcelType?: string;
}): Promise<{ parcels: unknown[]; meta: PaginationMeta }> {
  assertValidObjectId(options.targetUserId, "user ID");

  if (
    !isAdminUser(options.requester) &&
    options.requester.id !== options.targetUserId
  ) {
    throw ApiError.forbidden("You are not authorized to view these parcels");
  }

  const filter: Record<string, unknown> = { sender: options.targetUserId };
  if (options.status) filter.status = options.status;
  if (options.parcelType) filter.parcelType = options.parcelType;

  const [parcels, total] = await Promise.all([
    Parcel.find(filter)
      .populate("sender", SENDER_FIELDS)
      .sort({ createdAt: -1 })
      .skip(options.pagination.skip)
      .limit(options.pagination.limit)
      .lean()
      .exec(),
    Parcel.countDocuments(filter),
  ]);

  return {
    parcels: parcels.map(withProgress),
    meta: buildPaginationMeta(total, options.pagination),
  };
}

export async function cancelParcel(
  id: string,
  requester: AuthPayload,
): Promise<ParcelDocument> {
  assertValidObjectId(id, "parcel ID");
  const admin = isAdminUser(requester);
  const ownerScope = admin ? {} : { sender: requester.id };

  // Single atomic update: only cancellable, owned (unless admin) parcels match.
  const parcel = await Parcel.findOneAndUpdate(
    { _id: id, ...ownerScope, status: { $nin: ["delivered", "returned"] } },
    { $set: { status: "cancelled" } },
    { new: true },
  );
  if (parcel) {
    logger.info(`Parcel cancelled: ${parcel.id}`);
    return parcel;
  }

  // The update matched nothing — figure out precisely why (error path only).
  const existing = await Parcel.findById(id).select("sender status").lean();
  if (!existing) throw ApiError.notFound("Parcel not found");
  if (!admin && idToString(existing.sender) !== requester.id) {
    throw ApiError.forbidden("You are not authorized to cancel this parcel");
  }
  if (existing.status === "delivered" || existing.status === "returned") {
    throw ApiError.badRequest("Cannot cancel a delivered or returned parcel");
  }
  throw ApiError.notFound("Parcel not found");
}

export async function updateDestination(
  id: string,
  requester: AuthPayload,
  locationTo: ILocation,
): Promise<ParcelDocument> {
  assertValidObjectId(id, "parcel ID");
  const admin = isAdminUser(requester);
  const ownerScope = admin ? {} : { sender: requester.id };

  const parcel = await Parcel.findOneAndUpdate(
    { _id: id, ...ownerScope, status: { $nin: TERMINAL } },
    { $set: { locationTo } },
    { new: true },
  );
  if (parcel) {
    logger.info(`Parcel destination updated: ${parcel.id}`);
    return parcel;
  }

  const existing = await Parcel.findById(id).select("sender status").lean();
  if (!existing) throw ApiError.notFound("Parcel not found");
  if (!admin && idToString(existing.sender) !== requester.id) {
    throw ApiError.forbidden("You are not authorized to update this parcel");
  }
  if (TERMINAL.includes(existing.status)) {
    throw ApiError.badRequest(
      "Cannot update a delivered, returned, or cancelled parcel",
    );
  }
  throw ApiError.notFound("Parcel not found");
}

export async function updateStatus(
  id: string,
  requester: AuthPayload,
  updates: { status?: ParcelStatus; paymentStatus?: PaymentStatus },
): Promise<ParcelDocument> {
  assertValidObjectId(id, "parcel ID");
  const admin = isAdminUser(requester);
  // Couriers may only update parcels assigned to them.
  const actorScope = admin ? {} : { courierAssigned: requester.id };

  const set: Record<string, unknown> = {};
  if (updates.status) {
    set.status = updates.status;
    if (updates.status === "delivered") set.deliveryDate = new Date();
  }
  if (updates.paymentStatus) set.paymentStatus = updates.paymentStatus;

  const parcel = await Parcel.findOneAndUpdate(
    { _id: id, ...actorScope },
    { $set: set },
    { new: true },
  ).populate("sender", SENDER_FIELDS);
  if (parcel) {
    logger.info(`Parcel status updated: ${parcel.id}`);
    return parcel;
  }

  const existing = await Parcel.findById(id).select("courierAssigned").lean();
  if (!existing) throw ApiError.notFound("Parcel not found");
  if (!admin && idToString(existing.courierAssigned) !== requester.id) {
    throw ApiError.forbidden("You are not authorized to update this parcel");
  }
  throw ApiError.notFound("Parcel not found");
}

export async function updatePresentLocation(
  id: string,
  requester: AuthPayload,
  presentLocation: ILocation,
): Promise<ParcelDocument> {
  assertValidObjectId(id, "parcel ID");
  const admin = isAdminUser(requester);
  const actorScope = admin ? {} : { courierAssigned: requester.id };

  // Aggregation-pipeline update: set the location and, atomically, advance a
  // pending parcel to in-transit in the same write.
  const parcel = await Parcel.findOneAndUpdate(
    { _id: id, ...actorScope, status: { $nin: TERMINAL } },
    [
      {
        $set: {
          presentLocation,
          status: {
            $cond: [{ $eq: ["$status", "pending"] }, "in-transit", "$status"],
          },
        },
      },
    ],
    { new: true },
  );
  if (parcel) {
    logger.info(`Parcel location updated: ${parcel.id}`);
    return parcel;
  }

  const existing = await Parcel.findById(id)
    .select("courierAssigned status")
    .lean();
  if (!existing) throw ApiError.notFound("Parcel not found");
  if (!admin && idToString(existing.courierAssigned) !== requester.id) {
    throw ApiError.forbidden("You are not authorized to update this parcel");
  }
  if (TERMINAL.includes(existing.status)) {
    throw ApiError.badRequest(
      "Cannot update location of a delivered, returned, or cancelled parcel",
    );
  }
  throw ApiError.notFound("Parcel not found");
}

export async function trackParcel(trackingCode: string) {
  const parcel = await Parcel.findOne({ trackingCode: trackingCode.toUpperCase() })
    .select(
      "trackingCode status createdAt estimatedDelivery locationFrom locationTo presentLocation",
    )
    .lean();
  if (!parcel) throw ApiError.notFound("Parcel not found");

  return { ...parcel, progress: progressForStatus(parcel.status) };
}

export async function assignCourier(
  id: string,
  courierId: string,
): Promise<ParcelDocument> {
  assertValidObjectId(id, "ID");
  const existing = await Parcel.findById(id)
    .select("parcelType locationFrom locationTo status")
    .lean();
  if (!existing) throw ApiError.notFound("Parcel not found");

  assertValidObjectId(courierId, "ID");
  const courier = await User.findOne({ _id: courierId, role: "courier" })
    .select("_id")
    .lean();
  if (!courier) throw ApiError.notFound("Courier not found");

  const estimatedDelivery = computeEstimatedDelivery(
    existing.parcelType,
    existing.locationFrom,
    existing.locationTo,
  );

  const parcel = await Parcel.findByIdAndUpdate(
    id,
    [
      {
        $set: {
          courierAssigned: courier._id,
          estimatedDelivery,
          status: {
            $cond: [{ $eq: ["$status", "pending"] }, "processing", "$status"],
          },
        },
      },
    ],
    { new: true },
  );
  if (!parcel) throw ApiError.notFound("Parcel not found");

  logger.info(`Courier ${courierId} assigned to parcel ${parcel.id}`);
  return parcel;
}
