import express, { type Application, type Request, type Response } from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env";
import { logger } from "./config/logger";
import swaggerDocument from "./config/swagger";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import { createRateLimiter } from "./middlewares/rateLimiter";
import authRoutes from "./modules/auth/auth.routes";
import healthRoutes from "./modules/health/health.routes";
import parcelRoutes from "./modules/parcels/parcel.routes";
import searchRoutes from "./modules/search/search.routes";
import userRoutes from "./modules/users/user.routes";

const API_PREFIX = "/api/v1";

/**
 * Build and configure the Express application.
 *
 * Returning an app from a factory (instead of a module-level singleton with
 * side effects) keeps construction explicit and makes the app trivial to mount
 * in tests with supertest — no server needs to be listening.
 */
export function createApp(): Application {
  const app = express();

  // Security & performance
  app.use(helmet());
  app.use(compression());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // Request logging routed through winston
  app.use(
    morgan(env.isProduction ? "combined" : "dev", {
      stream: { write: (message) => logger.http(message.trim()) },
    }),
  );

  // Body parsing
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Health endpoints are mounted before the rate limiter so monitoring is
  // never throttled.
  app.use(API_PREFIX, healthRoutes);

  // Rate limiting for everything below.
  app.use(createRateLimiter());

  // API metadata.
  app.get(API_PREFIX, (_req: Request, res: Response) => {
    res.json({
      name: env.API_NAME,
      author: env.API_TEAM,
      version: env.API_VERSION,
    });
  });

  // Feature routes. Search is mounted before parcels so literal segments like
  // "/parcels/search" are not captured by "/parcels/:parcelId".
  app.use(API_PREFIX, authRoutes);
  app.use(API_PREFIX, searchRoutes);
  app.use(API_PREFIX, parcelRoutes);
  app.use(API_PREFIX, userRoutes);

  // API documentation.
  app.use(
    `${API_PREFIX}/api-docs`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument),
  );

  // 404 + centralized error handling (must be last).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
