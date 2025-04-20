// src/server/routes/search.routes.js
import express from "express";
import {
  searchUser,
  searchParcel,
  advancedSearch,
} from "../controllers/search.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// User search
router.get("/users/search", authenticateToken, searchUser);

// Parcel search
router.get("/parcels/search", authenticateToken, searchParcel);

// Advanced search
router.post("/search/advanced", authenticateToken, advancedSearch);

export default router;
