import type { Request, Response } from "express";
import mongoose from "mongoose";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { getRedisClient } from "../../config/redis";
import { asyncHandler } from "../../shared/asyncHandler";

type ServiceStatus = "ok" | "checking" | "disconnected" | "error" | "disabled";

interface HealthReport {
  status: "ok" | "degraded";
  timestamp: string;
  uptime: number;
  environment: string;
  services: Record<string, Record<string, unknown> & { status: ServiceStatus }>;
}

async function checkDatabase(
  report: HealthReport,
  deep: boolean,
): Promise<void> {
  const db = report.services.database;
  try {
    if (mongoose.connection.readyState !== 1) {
      db.status = "disconnected";
      db.state = mongoose.connection.readyState;
      report.status = "degraded";
      return;
    }

    const start = Date.now();
    await mongoose.connection.db?.admin().ping();
    db.status = "ok";

    if (deep) {
      db.ping = `${Date.now() - start}ms`;
      const stats = await mongoose.connection.db?.admin().serverStatus();
      db.version = stats?.version ?? "unknown";
      db.connections = {
        current: stats?.connections?.current ?? "unknown",
        available: stats?.connections?.available ?? "unknown",
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Health check - MongoDB error: ${message}`);
    db.status = "error";
    db.error = message;
    report.status = "degraded";
  }
}

async function checkRedis(report: HealthReport, deep: boolean): Promise<void> {
  const client = getRedisClient();
  const redis = report.services.redis;
  if (!client) return; // stays "disabled"

  try {
    const start = Date.now();
    const pong = await client.ping();
    if (pong === "PONG") {
      redis.status = "ok";
      if (deep) redis.ping = `${Date.now() - start}ms`;
    } else {
      redis.status = "error";
      report.status = "degraded";
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    redis.status = "error";
    redis.error = message;
    report.status = "degraded";
  }
}

export const checkHealth = asyncHandler(async (_req: Request, res: Response) => {
  const report: HealthReport = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    services: {
      api: { status: "ok" },
      database: { status: "checking" },
      redis: { status: "disabled" },
    },
  };

  await Promise.all([checkDatabase(report, false), checkRedis(report, false)]);

  res.status(200).json(report);
});

export const deepHealthCheck = asyncHandler(
  async (_req: Request, res: Response) => {
    const report: HealthReport = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      services: {
        api: { status: "ok", version: env.API_VERSION },
        database: {
          status: "checking",
          connection: {
            host: env.databaseUrl
              ? safeHostname(env.databaseUrl)
              : "unknown",
          },
        },
        redis: { status: "disabled" },
      },
    };

    Object.assign(report, {
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    });

    await Promise.all([checkDatabase(report, true), checkRedis(report, true)]);

    res.status(200).json(report);
  },
);

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname || "unknown";
  } catch {
    return "unknown";
  }
}
