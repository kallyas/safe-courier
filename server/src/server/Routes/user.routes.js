// src/server/routes/user.routes.js
import express from "express";
import { validate } from "../utils/validation.js";
import {
  signUpSchema,
  loginSchema,
  profileUpdateSchema,
  passwordUpdateSchema,
} from "../utils/validation.js";
import {
  createUser,
  login,
  getUsers,
  findUserById,
  updateUser,
  deleteUser,
  verifyToken,
  logoutUser,
  changePassword,
  getProfile,
} from "../controllers/user.controller.js";
import { authenticateToken, isAdmin, checkUser } from "../middlewares/auth.js";

const router = express.Router();

// API information route
router.get("/", (req, res) => {
  res.json({
    name: process.env.API_NAME || "Safe Courier API",
    author: process.env.API_TEAM || "Safe Courier Team",
    version: process.env.API_VERSION || "1.0.0",
  });
});

// Auth routes
router.post("/auth/signup", validate(signUpSchema), createUser);
router.post("/auth/login", validate(loginSchema), login);
router.post("/auth/logout", authenticateToken, logoutUser);
router.post("/verify", authenticateToken, verifyToken);

// User routes
router.get("/users", authenticateToken, isAdmin, getUsers);
router.get("/user/:id", authenticateToken, findUserById);
router.put(
  "/user/:id",
  authenticateToken,
  checkUser,
  validate(profileUpdateSchema),
  updateUser,
);
router.delete("/user/:id", authenticateToken, checkUser, deleteUser);
router.put(
  "/user/:id/password",
  authenticateToken,
  checkUser,
  validate(passwordUpdateSchema),
  changePassword,
);

// Profile route
router.get("/profile", authenticateToken, getProfile);

export default router;
