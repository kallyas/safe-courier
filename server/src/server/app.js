// src/server/app.js
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import compression from "compression"; // Added for performance
import swaggerUi from "swagger-ui-express";

import swaggerDocument from "./swagger.js";
import { notFound, errorHandler } from "./middlewares/errorHandlers.js";
import rateLimiter from "./middlewares/rateLimiter.js";
import userRoutes from "./routes/user.routes.js";
import parcelRoutes from "./routes/parcel.routes.js";
import searchRoutes from "./routes/search.routes.js";
import healthRoutes from "./routes/health.routes.js";
import logger from "./utils/logger.js";

const app = express();

// Performance and security middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Logging based on environment
if (process.env.NODE_ENV !== "production") {
  app.use(
    morgan("dev", {
      stream: { write: (message) => logger.http(message.trim()) },
    }),
  );
} else {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.http(message.trim()) },
    }),
  );
}

// Request parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Health routes (before rate limiting so they're always accessible)
app.use("/api/v1", healthRoutes);

// Rate limiting for API protection
app.use(rateLimiter);

// API routes
app.use("/api/v1", userRoutes);
app.use("/api/v1", parcelRoutes);
app.use("/api/v1", searchRoutes);

// Swagger documentation
app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
