// src/server/models/parcel.model.js
import mongoose from "mongoose";
import validator from "validator";
import { nanoid } from "nanoid";

const { Schema } = mongoose;

// Define recipient schema as a sub-document
const recipientSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Recipient name is required"],
      trim: true,
      minLength: [2, "Recipient name must be at least 2 characters"],
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          // Allow null/empty or validate phone number
          return !v || /^\+?[\d\s()-]{8,15}$/.test(v);
        },
        message: "Please provide a valid phone number",
      },
    },
    email: {
      type: String,
      required: [true, "Recipient email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Please provide a valid email address",
      },
    },
  },
  {
    _id: false, // Don't create IDs for subdocuments
  },
);

// Define location schema as a sub-document
const locationSchema = new Schema(
  {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: "2dsphere", // Enable geospatial queries
    },
  },
  {
    _id: false,
  },
);

// Main parcel schema
const parcelSchema = new Schema(
  {
    trackingCode: {
      type: String,
      unique: true,
      default: () => nanoid(10).toUpperCase(),
      index: true,
    },
    parcelType: {
      type: String,
      required: [true, "Parcel type is required"],
      enum: [
        "document",
        "package",
        "fragile",
        "perishable",
        "electronics",
        "other",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, "Description cannot exceed 500 characters"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
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
      amount: {
        type: Number,
        default: 100,
      },
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
        "in-transit",
        "delivered",
        "returned",
        "cancelled",
        "processing",
        "on-hold",
      ],
      default: "pending",
      index: true,
    },
    locationFrom: locationSchema,
    locationTo: locationSchema,
    presentLocation: locationSchema,
    notes: {
      type: String,
      trim: true,
    },
    recipient: recipientSchema,
    estimatedDelivery: {
      type: Date,
    },
    pickupDate: {
      type: Date,
    },
    deliveryDate: {
      type: Date,
    },
    courierAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    signature: {
      type: String, // URL to signature image
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index for status + creation date
parcelSchema.index({ status: 1, createdAt: -1 });

// Text index for search functionality
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

// Virtual for calculating delivery progress
parcelSchema.virtual("progress").get(function () {
  const statusMap = {
    pending: 0,
    processing: 20,
    "in-transit": 50,
    delivered: 100,
    returned: 100,
    cancelled: 0,
    "on-hold": 30,
  };

  return statusMap[this.status] || 0;
});

// Method to cancel a parcel
parcelSchema.methods.cancel = async function () {
  if (this.status === "delivered" || this.status === "returned") {
    throw new Error("Cannot cancel a delivered or returned parcel");
  }

  this.status = "cancelled";
  return this.save();
};

// Method to update current location
parcelSchema.methods.updateCurrentLocation = function (location) {
  this.presentLocation = location;

  if (this.status === "pending") {
    this.status = "in-transit";
  }

  return this.save();
};

// Method to mark as delivered
parcelSchema.methods.markDelivered = function (signature = null) {
  this.status = "delivered";
  this.deliveryDate = new Date();

  if (signature) {
    this.signature = signature;
  }

  return this.save();
};

// Static method to find parcels by user
parcelSchema.statics.findByUser = function (userId) {
  return this.find({ sender: userId }).sort({ createdAt: -1 });
};

// Static method to find parcels by tracking code
parcelSchema.statics.findByTrackingCode = function (code) {
  return this.findOne({ trackingCode: code.toUpperCase() });
};

// Middleware to calculate price before saving
parcelSchema.pre("save", function (next) {
  if (this.isModified("weight") || !this.price.amount) {
    // Simple pricing formula: $10 per kg + $5 base fee
    const baseFee = 5;
    const ratePerKg = 10;
    this.price.amount = Number((baseFee + this.weight * ratePerKg).toFixed(2));
  }
  next();
});

const Parcel = mongoose.model("Parcel", parcelSchema);

export default Parcel;
