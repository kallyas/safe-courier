import { randomBytes } from "crypto";
import {
  Schema,
  model,
  Types,
  type HydratedDocument,
  type Model,
} from "mongoose";

export type ParcelType =
  | "document"
  | "package"
  | "fragile"
  | "perishable"
  | "electronics"
  | "other";

export type ParcelStatus =
  | "pending"
  | "processing"
  | "in-transit"
  | "on-hold"
  | "delivered"
  | "returned"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface ILocation {
  address: string;
  city: string;
  state?: string;
  country?: string;
  postalCode?: string;
  coordinates?: number[];
}

export interface IRecipient {
  name: string;
  phone?: string;
  email: string;
}

export interface IDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit: "cm" | "in";
}

export interface IPrice {
  amount: number;
  currency: "USD" | "EUR" | "GBP" | "JPY";
}

export interface IParcel {
  trackingCode: string;
  parcelType: ParcelType;
  description?: string;
  sender: Types.ObjectId;
  weight: number;
  dimensions?: IDimensions;
  price: IPrice;
  status: ParcelStatus;
  locationFrom?: ILocation;
  locationTo?: ILocation;
  presentLocation?: ILocation;
  notes?: string;
  recipient?: IRecipient;
  estimatedDelivery?: Date;
  pickupDate?: Date;
  deliveryDate?: Date;
  courierAssigned?: Types.ObjectId;
  paymentStatus: PaymentStatus;
  signature?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IParcelVirtuals {
  progress: number;
}

export type ParcelDocument = HydratedDocument<IParcel, IParcelVirtuals>;
export type ParcelModel = Model<IParcel, object, object, IParcelVirtuals>;

/** Percentage completion derived from the workflow status. */
const PROGRESS_BY_STATUS: Record<ParcelStatus, number> = {
  pending: 0,
  processing: 20,
  "on-hold": 30,
  "in-transit": 50,
  delivered: 100,
  returned: 100,
  cancelled: 0,
};

const PRICING = { baseFee: 5, ratePerKg: 10 };
// Dimensional weight divisors (industry standard) by unit.
const VOLUMETRIC_DIVISOR = { cm: 5000, in: 139 };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s()-]{8,15}$/;

function generateTrackingCode(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = randomBytes(10);
  let code = "";
  for (let i = 0; i < 10; i += 1) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return code;
}

/** Percentage completion for a given workflow status. */
export function progressForStatus(status: ParcelStatus): number {
  return PROGRESS_BY_STATUS[status] ?? 0;
}

/** Chargeable weight = max(actual, dimensional) weight. */
export function computePrice(weight: number, dimensions?: IDimensions): number {
  let volumetric = 0;
  if (dimensions?.length && dimensions.width && dimensions.height) {
    const divisor = VOLUMETRIC_DIVISOR[dimensions.unit] ?? VOLUMETRIC_DIVISOR.cm;
    volumetric =
      (dimensions.length * dimensions.width * dimensions.height) / divisor;
  }
  const chargeable = Math.max(weight, volumetric);
  return Number((PRICING.baseFee + chargeable * PRICING.ratePerKg).toFixed(2));
}

const locationSchema = new Schema<ILocation>(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    country: String,
    postalCode: String,
    coordinates: { type: [Number], index: "2dsphere" },
  },
  { _id: false },
);

const recipientSchema = new Schema<IRecipient>(
  {
    name: {
      type: String,
      required: [true, "Recipient name is required"],
      trim: true,
      minlength: [2, "Recipient name must be at least 2 characters"],
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => !v || PHONE_REGEX.test(v),
        message: "Please provide a valid phone number",
      },
    },
    email: {
      type: String,
      required: [true, "Recipient email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: "Please provide a valid email address",
      },
    },
  },
  { _id: false },
);

const parcelSchema = new Schema<IParcel, ParcelModel, object, object, IParcelVirtuals>(
  {
    trackingCode: {
      type: String,
      unique: true,
      default: generateTrackingCode,
    },
    parcelType: {
      type: String,
      required: [true, "Parcel type is required"],
      enum: ["document", "package", "fragile", "perishable", "electronics", "other"],
    },
    description: { type: String, trim: true, maxlength: 500 },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
      index: true,
    },
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [0.1, "Weight must be at least 0.1 kg"],
      max: [1000, "Weight cannot exceed 1000 kg"],
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      unit: { type: String, enum: ["cm", "in"], default: "cm" },
    },
    price: {
      amount: { type: Number, default: 0 },
      currency: {
        type: String,
        enum: ["USD", "EUR", "GBP", "JPY"],
        default: "USD",
      },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "in-transit",
        "on-hold",
        "delivered",
        "returned",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    locationFrom: locationSchema,
    locationTo: locationSchema,
    presentLocation: locationSchema,
    notes: { type: String, trim: true, maxlength: 500 },
    recipient: recipientSchema,
    estimatedDelivery: Date,
    pickupDate: Date,
    deliveryDate: Date,
    courierAssigned: { type: Schema.Types.ObjectId, ref: "User" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    signature: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

parcelSchema.index({ status: 1, createdAt: -1 });
parcelSchema.index(
  {
    trackingCode: "text",
    "recipient.name": "text",
    "recipient.email": "text",
    description: "text",
  },
  {
    weights: {
      trackingCode: 10,
      "recipient.name": 5,
      "recipient.email": 3,
      description: 1,
    },
  },
);

parcelSchema.virtual("progress").get(function (this: IParcel) {
  return PROGRESS_BY_STATUS[this.status] ?? 0;
});

parcelSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("weight") || this.isModified("dimensions")) {
    this.price.amount = computePrice(this.weight, this.dimensions ?? undefined);
  }
  next();
});

export const Parcel = model<IParcel, ParcelModel>("Parcel", parcelSchema);
export default Parcel;
