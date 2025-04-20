// src/server/routes/health.routes.js
import express from "express";
import {
  checkHealth,
  deepHealthCheck,
} from "../controllers/health.controller.js";

const router = express.Router();

/**
 * @route GET /health
 * @desc Basic health check endpoint
 * @access Public
 */
router.get("/health", checkHealth);

/**
 * @route GET /health/deep
 * @desc Detailed health check with more thorough testing
 * @access Private - should be protected in production
 */
router.get("/health/deep", deepHealthCheck);

export default router;
