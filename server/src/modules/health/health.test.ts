import { afterEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { api } from "../../tests/helpers";

describe("Health checks", () => {
  describe("GET /api/v1/health", () => {
    it("reports overall and per-service status", async () => {
      const res = await api().get("/api/v1/health");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.timestamp).toBeTypeOf("string");
      expect(res.body.uptime).toBeTypeOf("number");
      expect(res.body.services).toHaveProperty("api");
      expect(res.body.services).toHaveProperty("database");
      expect(res.body.services).toHaveProperty("redis");
    });

    it("reports the database as ok when connected", async () => {
      const res = await api().get("/api/v1/health");
      expect(res.body.services.database.status).toBe("ok");
    });

    it("is accessible without authentication", async () => {
      const res = await api().get("/api/v1/health");
      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/v1/health/deep", () => {
    it("includes process and dependency detail", async () => {
      const res = await api().get("/api/v1/health/deep");

      expect(res.status).toBe(200);
      expect(res.body.memory).toBeTypeOf("object");
      expect(res.body.cpuUsage).toBeTypeOf("object");
      expect(res.body.services.api).toHaveProperty("version");
      expect(res.body.services.database).toHaveProperty("connection");
      if (res.body.services.database.status === "ok") {
        expect(res.body.services.database).toHaveProperty("ping");
        expect(res.body.services.database).toHaveProperty("version");
      }
    });
  });

  describe("degraded state", () => {
    afterEach(() => {
      // Restore the real getter after mocking it below.
      delete (mongoose.connection as unknown as { readyState?: number })
        .readyState;
    });

    it("reports degraded when the database is disconnected", async () => {
      Object.defineProperty(mongoose.connection, "readyState", {
        get: () => 0,
        configurable: true,
      });

      const res = await api().get("/api/v1/health");

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("degraded");
      expect(res.body.services.database.status).toBe("disconnected");
    });
  });
});
