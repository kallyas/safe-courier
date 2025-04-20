// src/server/routes/parcel.routes.js
import express from "express";
import { validate } from "../utils/validation.js";
import {
  parcelSchema,
  parcelStatusSchema,
  parcelLocationSchema,
  parcelDestinationSchema,
} from "../utils/validation.js";
import {
  createParcel,
  getParcels,
  findParcelById,
  getParcelsByUser,
  cancelParcel,
  updateDestination,
  updateStatus,
  updateLocation,
  trackParcel,
  assignCourier,
} from "../controllers/parcel.controller.js";
import { authenticateToken, isAdmin, checkUser } from "../middlewares/auth.js";

const router = express.Router();

// Get all parcels (admin) or user's parcels
router.get("/parcels", authenticateToken, getParcels);

// Create a parcel
router.post(
  "/parcels",
  authenticateToken,
  validate(parcelSchema),
  createParcel,
);

// Get parcel by ID
router.get("/parcels/:parcelId", authenticateToken, findParcelById);

// Track parcel by tracking code (public endpoint)
router.get("/parcels/track/:trackingCode", trackParcel);

// Get parcels by user
router.get("/users/:userId/parcels", authenticateToken, getParcelsByUser);

// Cancel parcel
router.put("/parcels/:parcelId/cancel", authenticateToken, cancelParcel);

// Update destination
router.put(
  "/parcels/:parcelId/destination",
  authenticateToken,
  validate(parcelDestinationSchema),
  updateDestination,
);

// Update status (admin only)
router.put(
  "/parcels/:parcelId/status",
  authenticateToken,
  isAdmin,
  validate(parcelStatusSchema),
  updateStatus,
);

// Update present location (admin only)
router.put(
  "/parcels/:parcelId/presentLocation",
  authenticateToken,
  isAdmin,
  validate(parcelLocationSchema),
  updateLocation,
);

// Assign courier to parcel (admin only)
router.put(
  "/parcels/:parcelId/assign",
  authenticateToken,
  isAdmin,
  assignCourier,
);

export default router;
