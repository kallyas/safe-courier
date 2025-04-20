// src/server/controllers/parcel.controller.js
import createError from "http-errors";
import mongoose from "mongoose";
import Parcel from "../models/parcel.model.js";
import User from "../models/user.model.js";
import { clearCache } from "../utils/redis.js";
import logger from "../utils/logger.js";

/**
 * Create a new parcel
 * @route POST /api/v1/parcels
 */
export const createParcel = async (req, res, next) => {
  try {
    // Set the sender to the authenticated user
    req.body.sender = req.user.id;

    // Create parcel
    const parcel = new Parcel(req.body);
    const savedParcel = await parcel.save();

    // Populate sender information
    await savedParcel.populate("sender", "-password -refreshToken");

    // Clear cache
    await clearCache("Parcel");
    await clearCache(`user-parcels:${req.user.id}`);

    logger.info(`New parcel created: ${savedParcel._id}`);

    res.status(201).json({
      status: "success",
      message: "Parcel created successfully",
      data: savedParcel,
    });
  } catch (error) {
    logger.error(`Parcel creation error: ${error.message}`);
    next(error);
  }
};

/**
 * Get all parcels
 * @route GET /api/v1/parcels
 */
export const getParcels = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.parcelType) filter.parcelType = req.query.parcelType;

    // Admin sees all parcels, regular users see only their own
    if (!req.user.isAdmin && req.user.role !== "admin") {
      filter.sender = req.user.id;
    }

    // Query with caching
    const parcels = await Parcel.find(filter)
      .populate("sender", "-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .cache({ ttl: 300, key: "parcels" });

    const total = await Parcel.countDocuments(filter);

    if (!parcels.length) {
      return res.status(200).json({
        status: "success",
        message: "No parcels found",
        data: [],
        pagination: {
          total: 0,
          page,
          pages: 0,
          limit,
        },
      });
    }

    res.status(200).json({
      status: "success",
      data: parcels,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    logger.error(`Error fetching parcels: ${error.message}`);
    next(error);
  }
};

/**
 * Find parcel by ID
 * @route GET /api/v1/parcels/:parcelId
 */
export const findParcelById = async (req, res, next) => {
  try {
    const parcel = await Parcel.findById(req.params.parcelId)
      .populate("sender", "-password -refreshToken")
      .cache({ ttl: 300, key: `parcel:${req.params.parcelId}` });

    if (!parcel) {
      return next(createError(404, "Parcel not found"));
    }

    // Check if user is authorized to view this parcel
    if (
      !req.user.isAdmin &&
      req.user.role !== "admin" &&
      parcel.sender._id.toString() !== req.user.id
    ) {
      return next(
        createError(403, "You are not authorized to view this parcel"),
      );
    }

    res.status(200).json({
      status: "success",
      data: parcel,
    });
  } catch (error) {
    logger.error(`Error finding parcel: ${error.message}`);

    if (error instanceof mongoose.Error.CastError) {
      return next(createError(400, "Invalid parcel ID format"));
    }

    next(error);
  }
};

/**
 * Get parcels by user
 * @route GET /api/v1/users/:userId/parcels
 */
export const getParcelsByUser = async (req, res, next) => {
  try {
    // Check if user is authorized to view these parcels
    if (
      !req.user.isAdmin &&
      req.user.role !== "admin" &&
      req.params.userId !== req.user.id
    ) {
      return next(
        createError(403, "You are not authorized to view these parcels"),
      );
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {
      sender: mongoose.Types.ObjectId(req.params.userId),
    };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.parcelType) filter.parcelType = req.query.parcelType;

    // Query with caching
    const parcels = await Parcel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .cache({ ttl: 300, key: `user-parcels:${req.params.userId}` });

    const total = await Parcel.countDocuments(filter);

    if (!parcels.length) {
      return res.status(200).json({
        status: "success",
        message: "No parcels found for this user",
        data: [],
        pagination: {
          total: 0,
          page,
          pages: 0,
          limit,
        },
      });
    }

    res.status(200).json({
      status: "success",
      data: parcels,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    logger.error(`Error fetching user parcels: ${error.message}`);

    if (error instanceof mongoose.Error.CastError) {
      return next(createError(400, "Invalid user ID format"));
    }

    next(error);
  }
};

/**
 * Cancel parcel
 * @route PUT /api/v1/parcels/:parcelId/cancel
 */
export const cancelParcel = async (req, res, next) => {
  try {
    const parcel = await Parcel.findById(req.params.parcelId);

    if (!parcel) {
      return next(createError(404, "Parcel not found"));
    }

    // Check if user is authorized to cancel this parcel
    if (
      !req.user.isAdmin &&
      req.user.role !== "admin" &&
      parcel.sender.toString() !== req.user.id
    ) {
      return next(
        createError(403, "You are not authorized to cancel this parcel"),
      );
    }

    // Check if parcel can be cancelled
    if (["delivered", "returned"].includes(parcel.status)) {
      return next(
        createError(400, "Cannot cancel a delivered or returned parcel"),
      );
    }

    // Cancel parcel
    parcel.status = "cancelled";
    const updatedParcel = await parcel.save();

    // Clear cache
    await clearCache("Parcel");
    await clearCache(`parcel:${req.params.parcelId}`);
    await clearCache(`user-parcels:${parcel.sender}`);

    logger.info(`Parcel cancelled: ${parcel._id}`);

    res.status(200).json({
      status: "success",
      message: "Parcel cancelled successfully",
      data: updatedParcel,
    });
  } catch (error) {
    logger.error(`Error cancelling parcel: ${error.message}`);

    if (error instanceof mongoose.Error.CastError) {
      return next(createError(400, "Invalid parcel ID format"));
    }

    next(error);
  }
};

/**
 * Update destination
 * @route PUT /api/v1/parcels/:parcelId/destination
 */
export const updateDestination = async (req, res, next) => {
  try {
    const parcel = await Parcel.findById(req.params.parcelId);

    if (!parcel) {
      return next(createError(404, "Parcel not found"));
    }

    // Check if user is authorized to update this parcel
    if (
      !req.user.isAdmin &&
      req.user.role !== "admin" &&
      parcel.sender.toString() !== req.user.id
    ) {
      return next(
        createError(403, "You are not authorized to update this parcel"),
      );
    }

    // Check if parcel can be updated
    if (["delivered", "returned", "cancelled"].includes(parcel.status)) {
      return next(
        createError(
          400,
          "Cannot update a delivered, returned, or cancelled parcel",
        ),
      );
    }

    // Update destination
    parcel.locationTo = req.body.locationTo;
    const updatedParcel = await parcel.save();

    // Clear cache
    await clearCache("Parcel");
    await clearCache(`parcel:${req.params.parcelId}`);
    await clearCache(`user-parcels:${parcel.sender}`);

    logger.info(`Parcel destination updated: ${parcel._id}`);

    res.status(200).json({
      status: "success",
      message: "Destination updated successfully",
      data: updatedParcel,
    });
  } catch (error) {
    logger.error(`Error updating destination: ${error.message}`);

    if (error instanceof mongoose.Error.CastError) {
      return next(createError(400, "Invalid parcel ID format"));
    }

    next(error);
  }
};

/**
 * Update status
 * @route PUT /api/v1/parcels/:parcelId/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    // Only admins can update status
    if (!req.user.isAdmin && req.user.role !== "admin") {
      return next(
        createError(403, "Only administrators can update parcel status"),
      );
    }

    const parcel = await Parcel.findById(req.params.parcelId).populate(
      "sender",
      "-password -refreshToken",
    );

    if (!parcel) {
      return next(createError(404, "Parcel not found"));
    }

    // Update status
    parcel.status = req.body.status;

    // If marking as delivered, set deliveryDate
    if (req.body.status === "delivered") {
      parcel.deliveryDate = new Date();
    }

    const updatedParcel = await parcel.save();

    // Clear cache
    await clearCache("Parcel");
    await clearCache(`parcel:${req.params.parcelId}`);
    await clearCache(`user-parcels:${parcel.sender._id}`);

    logger.info(`Parcel status updated: ${parcel._id} -> ${req.body.status}`);

    res.status(200).json({
      status: "success",
      message: "Status updated successfully",
      data: updatedParcel,
    });
  } catch (error) {
    logger.error(`Error updating status: ${error.message}`);

    if (error instanceof mongoose.Error.CastError) {
      return next(createError(400, "Invalid parcel ID format"));
    }

    next(error);
  }
};

/**
 * Update current location
 * @route PUT /api/v1/parcels/:parcelId/presentLocation
 */
export const updateLocation = async (req, res, next) => {
  try {
    // Only admins can update location
    if (!req.user.isAdmin && req.user.role !== "admin") {
      return next(
        createError(403, "Only administrators can update parcel location"),
      );
    }

    const parcel = await Parcel.findById(req.params.parcelId);

    if (!parcel) {
      return next(createError(404, "Parcel not found"));
    }

    // Check if parcel can be updated
    if (["delivered", "returned", "cancelled"].includes(parcel.status)) {
      return next(
        createError(
          400,
          "Cannot update location of a delivered, returned, or cancelled parcel",
        ),
      );
    }

    // Update location
    parcel.presentLocation = req.body.presentLocation;

    // If status is pending, update to in-transit
    if (parcel.status === "pending") {
      parcel.status = "in-transit";
    }

    const updatedParcel = await parcel.save();

    // Clear cache
    await clearCache("Parcel");
    await clearCache(`parcel:${req.params.parcelId}`);
    await clearCache(`user-parcels:${parcel.sender}`);

    logger.info(`Parcel location updated: ${parcel._id}`);

    res.status(200).json({
      status: "success",
      message: "Location updated successfully",
      data: updatedParcel,
    });
  } catch (error) {
    logger.error(`Error updating location: ${error.message}`);

    if (error instanceof mongoose.Error.CastError) {
      return next(createError(400, "Invalid parcel ID format"));
    }

    next(error);
  }
};

/**
 * Track parcel by tracking code
 * @route GET /api/v1/parcels/track/:trackingCode
 */
export const trackParcel = async (req, res, next) => {
  try {
    const parcel = await Parcel.findOne({
      trackingCode: req.params.trackingCode.toUpperCase(),
    }).cache({ ttl: 300, key: `tracking:${req.params.trackingCode}` });

    if (!parcel) {
      return next(createError(404, "Parcel not found"));
    }

    res.status(200).json({
      status: "success",
      data: {
        trackingCode: parcel.trackingCode,
        status: parcel.status,
        createdAt: parcel.createdAt,
        estimatedDelivery: parcel.estimatedDelivery,
        locationFrom: parcel.locationFrom,
        locationTo: parcel.locationTo,
        presentLocation: parcel.presentLocation,
        progress: parcel.progress,
      },
    });
  } catch (error) {
    logger.error(`Error tracking parcel: ${error.message}`);
    next(error);
  }
};

/**
 * Assign courier to parcel
 * @route PUT /api/v1/parcels/:parcelId/assign
 */
export const assignCourier = async (req, res, next) => {
  try {
    // Only admins can assign couriers
    if (!req.user.isAdmin && req.user.role !== "admin") {
      return next(createError(403, "Only administrators can assign couriers"));
    }

    const parcel = await Parcel.findById(req.params.parcelId);

    if (!parcel) {
      return next(createError(404, "Parcel not found"));
    }

    // Check if courier exists and has correct role
    const courier = await User.findOne({
      _id: req.body.courierId,
      role: "courier",
    });

    if (!courier) {
      return next(createError(404, "Courier not found"));
    }

    // Update courier
    parcel.courierAssigned = courier._id;

    // Update status if pending
    if (parcel.status === "pending") {
      parcel.status = "processing";
    }

    const updatedParcel = await parcel.save();

    // Clear cache
    await clearCache("Parcel");
    await clearCache(`parcel:${req.params.parcelId}`);

    logger.info(`Courier assigned to parcel: ${parcel._id} -> ${courier._id}`);

    res.status(200).json({
      status: "success",
      message: "Courier assigned successfully",
      data: updatedParcel,
    });
  } catch (error) {
    logger.error(`Error assigning courier: ${error.message}`);

    if (error instanceof mongoose.Error.CastError) {
      return next(createError(400, "Invalid ID format"));
    }

    next(error);
  }
};
