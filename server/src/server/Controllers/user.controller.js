// src/server/controllers/user.controller.js
import createError from "http-errors";
import User from "../models/user.model.js";
import { clearCache } from "../utils/redis.js";
import logger from "../utils/logger.js";
import { generateAccessToken, logout } from "../middlewares/auth.js";

/**
 * Create a new user
 * @route POST /api/v1/auth/signup
 */
export const createUser = async (req, res, next) => {
  try {
    // Check if username already exists
    const existingUser = await User.findOne({
      username: req.body.username.toLowerCase(),
    });

    if (existingUser) {
      return next(createError(400, "Username already taken"));
    }

    // Check if email already exists
    const existingEmail = await User.findOne({
      email: req.body.email.toLowerCase(),
    });

    if (existingEmail) {
      return next(createError(400, "Email already exists"));
    }

    // Create new user
    const user = new User(req.body);
    const savedUser = await user.save();

    // Generate token
    const token = generateAccessToken(savedUser);

    // Clear users cache
    await clearCache("User");

    logger.info(`New user created: ${savedUser.username}`);

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      token,
    });
  } catch (error) {
    logger.error(`User creation error: ${error.message}`);
    next(error);
  }
};

/**
 * Find user by ID
 * @route GET /api/v1/user/:id
 */
export const findUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).cache({
      ttl: 300,
      key: `user:${req.params.id}`,
    });

    if (!user) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    logger.error(`Error finding user: ${error.message}`);

    if (error.name === "CastError") {
      return next(createError(400, "Invalid user ID format"));
    }

    next(error);
  }
};

/**
 * Update user
 * @route PUT /api/v1/user/:id
 */
export const updateUser = async (req, res, next) => {
  try {
    // Don't allow password updates through this endpoint
    if (req.body.password) {
      delete req.body.password;
    }

    // Only allow updating certain fields
    const allowedUpdates = ["firstName", "lastName", "email", "profileImage"];

    const updates = Object.keys(req.body)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // If trying to update email, check if it's already taken
    if (updates.email) {
      const existingEmail = await User.findOne({
        email: updates.email.toLowerCase(),
        _id: { $ne: req.params.id },
      });

      if (existingEmail) {
        return next(createError(400, "Email already exists"));
      }
    }

    const options = {
      new: true,
      runValidators: true,
    };

    const user = await User.findByIdAndUpdate(req.params.id, updates, options);

    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Clear cache
    await clearCache(`user:${req.params.id}`);

    logger.info(`User updated: ${user._id}`);

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);

    if (error.name === "CastError") {
      return next(createError(400, "Invalid user ID format"));
    }

    next(error);
  }
};

/**
 * Delete user
 * @route DELETE /api/v1/user/:id
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Clear cache
    await clearCache("User");
    await clearCache(`user:${req.params.id}`);

    logger.info(`User deleted: ${req.params.id}`);

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);

    if (error.name === "CastError") {
      return next(createError(400, "Invalid user ID format"));
    }

    next(error);
  }
};

/**
 * Get all users
 * @route GET /api/v1/users
 */
export const getUsers = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.role) filter.role = req.query.role;

    // Populate parcels if requested
    const populateOptions = req.query.includeParcels
      ? { path: "parcels" }
      : null;

    // Query with caching
    const query = User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (populateOptions) {
      query.populate(populateOptions);
    }

    const users = await query.cache({ ttl: 300, key: "users" });
    const total = await User.countDocuments(filter);

    if (!users.length) {
      return res.status(200).json({
        status: "success",
        message: "No users found",
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
      data: users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`);
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/v1/auth/login
 */
export const login = async (req, res, next) => {
  try {
    // Find user by username or email
    const { username, password } = req.body;

    // Use the static method for authentication
    const user = await User.findByCredentials(username, password);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateAccessToken(user);

    logger.info(`User logged in: ${user.username}`);

    res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      token,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);

    // Provide generic error message for security
    next(createError(401, "Invalid login credentials"));
  }
};

/**
 * Logout user
 * @route POST /api/v1/auth/logout
 */
export const logoutUser = logout;

/**
 * Verify token
 * @route POST /api/v1/verify
 */
export const verifyToken = (req, res) => {
  // If middleware passed, token is valid
  res.status(200).json({
    status: "success",
    message: "Token is valid",
    user: req.user,
  });
};

/**
 * Change password
 * @route PUT /api/v1/user/:id/password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Only allow users to change their own password (or admins)
    if (req.user.id !== req.params.id && !req.user.isAdmin) {
      return next(createError(403, "You can only change your own password"));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return next(createError(401, "Current password is incorrect"));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user._id}`);

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    logger.error(`Error changing password: ${error.message}`);
    next(error);
  }
};

/**
 * Get user profile (for current user)
 * @route GET /api/v1/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("parcels")
      .cache({ ttl: 300, key: `profile:${req.user.id}` });

    if (!user) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    logger.error(`Error getting profile: ${error.message}`);
    next(error);
  }
};
