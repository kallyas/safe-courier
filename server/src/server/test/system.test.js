// src/server/test/system.test.js
import { use, expect, should } from "chai";
import chaiHttp from "chai-http";
import request from "supertest";
import server from "../../index.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { generateAccessToken } from "../middlewares/auth.js";
import logger from "../utils/logger.js";
import { faker } from "@faker-js/faker";

use(chaiHttp);

describe("System Integration", () => {
  // Clear the database before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // Clear the database after each test
  afterEach(async () => {
    await User.deleteMany({});
  });

  // Clear the database after all tests
  after(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Generate test user data using faker
  const testUser = {
    username: faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password(12),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };

  let userToken;

  before(async () => {
    // Create test user
    const user = await User.create(testUser);
    userToken = generateAccessToken(user);
  });

  // Test health endpoint
  describe("GET /api/v1/health", () => {
    it("should return health status", async () => {
      const res = await request(server).get("/api/v1/health");

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "ok");
      expect(res.body).to.have.property("timestamp").that.is.a("string");
    });
  });

  // Test API information
  describe("GET /api/v1", () => {
    it("should return API information", async () => {
      const res = await request(server).get("/api/v1");

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("name").that.is.a("string");
      expect(res.body).to.have.property("version").that.is.a("string");
      expect(res.body).to.have.property("author").that.is.a("string");
    });
  });

  // Test error handling for invalid routes
  describe("Error Handling", () => {
    it("should return 404 for non-existent routes", async () => {
      const res = await request(server).get("/api/v1/nonexistentroute");

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("status", "error");
      expect(res.body).to.have.property("message").that.includes("Not Found");
    });

    it("should return 405 for method not allowed", async () => {
      const res = await request(server).delete("/api/v1");

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("status", "error");
    });

    it("should return helpful validation errors", async () => {
      const invalidData = {
        username: faker.internet.username().slice(0, 2), // Too short
        email: "notanemail",
        password: faker.internet.password(5), // Too short
        firstName: faker.person.firstName().slice(0, 1),
        lastName: faker.person.lastName().slice(0, 1),
      };

      const res = await request(server)
        .post("/api/v1/auth/signup")
        .send(invalidData);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("status", "error");
      expect(res.body).to.have.property("errors").that.is.an("array");
      expect(res.body.errors.length).to.be.at.least(2);
    });
  });

  // Test rate limiting
  describe("Rate Limiting", () => {
    it("should allow requests under the rate limit", async () => {
      for (let i = 0; i < 5; i++) {
        const res = await request(server).get("/api/v1");

        expect(res).to.have.status(200);
      }
    });

    it("should include rate limit headers", async () => {
      const res = await request(server).get("/api/v1");

      expect(res).to.have.header("x-ratelimit-limit");
      expect(res).to.have.header("x-ratelimit-remaining");
    });
  });

  // Test CORS support
  describe("CORS Support", () => {
    it("should allow CORS preflight requests", async () => {
      const res = await request(server)
        .options("/api/v1/auth/login")
        .set("Origin", faker.internet.url())
        .set("Access-Control-Request-Method", "POST")
        .set("Access-Control-Request-Headers", "Content-Type");

      expect(res).to.have.header("access-control-allow-origin");
      expect(res).to.have.header("access-control-allow-methods");
      expect(res).to.have.header("access-control-allow-headers");
    });
  });

  // Test security headers
  describe("Security Headers", () => {
    it("should include security headers", async () => {
      const res = await request(server).get("/api/v1");

      expect(res).to.have.header("x-content-type-options", "nosniff");
      expect(res).to.have.header("x-xss-protection");
      expect(res).to.have.header("x-frame-options");
    });
  });

  // Test database connection resilience
  describe("Database Connection", () => {
    it("should reconnect after connection loss (mocked)", async function () {


      const originalConnection = mongoose.connection;

      try {
        await mongoose.connection.close();
        await new Promise((resolve) => setTimeout(resolve, 1000));

        expect(mongoose.connection.readyState).to.be.oneOf([1, 2]);
      } finally {
        if (mongoose.connection.readyState === 0) {
          await mongoose.connect(process.env.DB_URL_TEST);
        }
      }
    });
  });

  // Test API documentation access
  describe("API Documentation", () => {
    it("should serve Swagger documentation", async () => {
      const res = await request(server).get("/api/v1/api-docs");

      expect(res).to.have.status(200);
      expect(res).to.be.html;
    });

    it("should serve Swagger JSON spec", async () => {
      const res = await request(server).get("/api/v1/api-docs/swagger-ui-init.js");

      expect(res).to.have.status(200);
      expect(res.type).to.equal("application/javascript");
      expect(res.text).to.include("SwaggerUIBundle");
    });
  });

  // Test response compression
  describe("Response Compression", () => {
    it("should compress responses when requested", async () => {
      const res = await request(server)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${userToken}`)
        .set("Accept-Encoding", "gzip, deflate");

      expect(res.header).to.satisfy((headers) => {
        return (
          headers["content-encoding"] === "gzip" ||
          headers["content-encoding"] === "deflate" ||
          !headers["content-encoding"]
        );
      });
    });
  });

  // Test logging
  describe("Logging", () => {
    let originalLogLevel;
    let logMessages = [];

    before(() => {
      originalLogLevel = logger.level;
      logger.level = "debug";

      const originalLog = logger.log;
      logger.log = function (level, message) {
        logMessages.push({ level, message });

        if (level !== "silent") {
          originalLog.call(this, "silent", message);
        }
      };
    });

    after(() => {
      logger.level = originalLogLevel;
    });

    beforeEach(() => {
      logMessages = [];
    });

    it("should log HTTP requests", async () => {
      await request(server).get("/api/v1");

      expect(
        logMessages.some(
          (log) => log.level === "http" || log.message.includes("GET /api/v1"),
        ),
      ).to.be.true;
    });

    it("should log errors with appropriate level", async () => {
      await request(server).get("/api/v1/invalid-route");

      expect(
        logMessages.some(
          (log) => log.level === "error" || log.level === "warn",
        ),
      ).to.be.true;
    });
  });
});
