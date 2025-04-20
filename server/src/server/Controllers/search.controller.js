// src/server/controllers/search.controller.js
import createError from "http-errors";
import User from "../models/user.model.js";
import Parcel from "../models/parcel.model.js";
import logger from "../utils/logger.js";

/**
 * Search users
 * @route GET /api/v1/users/search
 */
export const searchUser = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return next(
        createError(400, "Search query must be at least 2 characters"),
      );
    }

    // Admin can search all users, regular users can only search by username/name
    const searchQuery =
      req.user.isAdmin || req.user.role === "admin"
        ? { $text: { $search: q } }
        : {
            $or: [
              { username: { $regex: q, $options: "i" } },
              { firstName: { $regex: q, $options: "i" } },
              { lastName: { $regex: q, $options: "i" } },
            ],
          };

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const results = await User.find(searchQuery, {
      score: { $meta: "textScore" }, // Add text score for sorting
    })
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit)
      .select("-password -refreshToken");

    const total = await User.countDocuments(searchQuery);

    if (!results.length) {
      return res.status(200).json({
        status: "success",
        message: "No users found matching your search",
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
      data: results,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    logger.error(`User search error: ${error.message}`);
    next(error);
  }
};

/**
 * Search parcels
 * @route GET /api/v1/parcels/search
 */
export const searchParcel = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return next(
        createError(400, "Search query must be at least 2 characters"),
      );
    }

    // Build search query based on user role
    let searchQuery;

    // Tracking code is exact match
    if (q.length >= 5 && /^[A-Za-z0-9]+$/.test(q)) {
      // If it looks like a tracking code, prioritize that search
      searchQuery = {
        trackingCode: { $regex: q.toUpperCase() },
      };
    } else {
      // Text search
      searchQuery = { $text: { $search: q } };

      // Regular users can only search their own parcels
      if (!req.user.isAdmin && req.user.role !== "admin") {
        searchQuery.sender = req.user.id;
      }
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const results = await Parcel.find(searchQuery, {
      score: { $meta: "textScore" }, // Add text score for sorting
    })
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit)
      .populate("sender", "-password -refreshToken");

    // If non-admin searches by tracking code and it's not their parcel
    if (!req.user.isAdmin && req.user.role !== "admin" && results.length > 0) {
      // Filter out parcels that don't belong to the user but allow tracking code search
      const filtered = results.filter(
        (parcel) =>
          parcel.sender._id.toString() === req.user.id ||
          (q.length >= 5 && parcel.trackingCode.includes(q.toUpperCase())),
      );

      if (filtered.length === 0) {
        return res.status(200).json({
          status: "success",
          message: "No parcels found matching your search",
          data: [],
          pagination: {
            total: 0,
            page,
            pages: 0,
            limit,
          },
        });
      }

      return res.status(200).json({
        status: "success",
        data: filtered,
        pagination: {
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          limit,
        },
      });
    }

    const total = await Parcel.countDocuments(searchQuery);

    if (!results.length) {
      return res.status(200).json({
        status: "success",
        message: "No parcels found matching your search",
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
      data: results,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    logger.error(`Parcel search error: ${error.message}`);
    next(error);
  }
};

/**
 * Advanced search with multiple filters
 * @route POST /api/v1/search/advanced
 */
export const advancedSearch = async (req, res, next) => {
  try {
    const {
      query,
      type,
      dateFrom,
      dateTo,
      status,
      parcelType,
      weight,
      city,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.body;

    // Determine model based on type
    const Model = type === "users" ? User : Parcel;
    const searchField = type === "users" ? "-password -refreshToken" : "";

    // Build query object
    const queryObj = {};

    // Text search if query provided
    if (query && query.trim().length >= 2) {
      queryObj.$text = { $search: query };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      queryObj.createdAt = {};
      if (dateFrom) queryObj.createdAt.$gte = new Date(dateFrom);
      if (dateTo) queryObj.createdAt.$lte = new Date(dateTo);
    }

    // Parcel-specific filters
    if (type === "parcels") {
      if (status) queryObj.status = status;
      if (parcelType) queryObj.parcelType = parcelType;
      if (city) queryObj["locationTo.city"] = { $regex: city, $options: "i" };

      if (weight) {
        const [min, max] = weight.split("-").map(Number);
        queryObj.weight = {};
        if (min) queryObj.weight.$gte = min;
        if (max) queryObj.weight.$lte = max;
      }

      // Regular users can only search their own parcels
      if (!req.user.isAdmin && req.user.role !== "admin") {
        queryObj.sender = req.user.id;
      }
    }

    // Pagination
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 10;
    const skip = (page - 1) * limit;

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;

    // If doing text search, sort by relevance first
    if (queryObj.$text) {
      sortObj.score = { $meta: "textScore" };
    }

    // Execute query
    const results = await Model.find(
      queryObj,
      queryObj.$text ? { score: { $meta: "textScore" } } : {},
    )
      .select(searchField)
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    // Populate references if it's a parcel search
    if (type === "parcels") {
      await Promise.all(
        results.map((result) =>
          result.populate("sender", "-password -refreshToken"),
        ),
      );
    }

    const total = await Model.countDocuments(queryObj);

    if (!results.length) {
      return res.status(200).json({
        status: "success",
        message: `No ${type} found matching your search criteria`,
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
      data: results,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    logger.error(`Advanced search error: ${error.message}`);
    next(error);
  }
};
