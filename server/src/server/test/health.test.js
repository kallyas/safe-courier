// src/server/test/api/v1/health.test.js
import { use, should, expect } from "chai";
import request from "supertest";
import chaiHttp from "chai-http";
import server from "../../index.js";
import mongoose from "mongoose";

use(chaiHttp);

describe("Health Checks", () => {
  // Basic health check tests
  describe("GET /api/v1/health", () => {
    it("should return health status", async () => {
      const res = await request(server).get("/api/v1/health");

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status");
      expect(res.body).to.have.property("timestamp").that.is.a("string");
      expect(res.body).to.have.property("uptime").that.is.a("number");
      expect(res.body).to.have.property("environment");
      expect(res.body).to.have.property("services");
      expect(res.body.services).to.have.property("api");
      expect(res.body.services).to.have.property("database");
      expect(res.body.services).to.have.property("redis");
    });

    it("should report database as connected when MongoDB is available", async () => {
      const res = await request(server).get("/api/v1/health");

      expect(res).to.have.status(200);
      expect(res.body.services.database).to.have.property("status");

      // Since we're using a real MongoDB connection in tests,
      // the status should be 'ok'
      expect(res.body.services.database.status).to.equal("ok");
    });

    it("should be accessible without authentication", async () => {
      const res = await request(server).get("/api/v1/health");

      expect(res).to.have.status(200);
    });
  });

  // Deep health check tests
  describe("GET /api/v1/health/deep", () => {
    it("should return detailed health information", async () => {
      const res = await request(server).get("/api/v1/health/deep");

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status");
      expect(res.body).to.have.property("timestamp");
      expect(res.body).to.have.property("uptime");
      expect(res.body).to.have.property("memory").that.is.an("object");
      expect(res.body).to.have.property("cpuUsage").that.is.an("object");
      expect(res.body).to.have.property("services");

      // Check API service info
      expect(res.body.services.api).to.have.property("version");

      // Check database info
      expect(res.body.services.database).to.have.property("connection");
      if (res.body.services.database.status === "ok") {
        expect(res.body.services.database).to.have.property("ping");
        expect(res.body.services.database).to.have.property("version");
      }
    });
  });

  // Test error simulation (only in test environment)
  describe("Health Check Error Handling", () => {
    let originalReadyState;

    before(() => {
      // Save original connection state
      originalReadyState = mongoose.connection.readyState;

      // Mock mongoose.connection to simulate disconnected state
      Object.defineProperty(mongoose.connection, "readyState", {
        get: function () {
          return 0;
        }, // 0 = disconnected
        configurable: true,
      });
    });

    after(() => {
      // Restore original connection state
      Object.defineProperty(mongoose.connection, "readyState", {
        get: function () {
          return originalReadyState;
        },
        configurable: true,
      });
    });

    it("should report degraded status when database is disconnected", async () => {
      const res = await request(server).get("/api/v1/health");

      expect(res).to.have.status(200); // Still returns 200 even when degraded
      expect(res.body).to.have.property("status", "degraded");
      expect(res.body.services.database).to.have.property(
        "status",
        "disconnected",
      );
    });
  });
});
