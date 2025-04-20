// src/server/test/auth.test.js
import { use, expect, should } from "chai";
import request from "supertest";
import chaiHttp from "chai-http";
import server from "../../index.js";
import User from "../models/user.model.js";
import { generateAccessToken } from "../middlewares/auth.js";
import { faker } from "@faker-js/faker";

use(chaiHttp);

describe("Authentication", () => {
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
  });

  let authToken;

  // Test user registration
  describe("POST /api/v1/auth/signup", () => {
    it("should register a new user", async () => {
      const testUser = {
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(12, true),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      const res = await request(server)
        .post("/api/v1/auth/signup")
        .send(testUser);

      expect(res).to.have.status(201);
      expect(res.body).to.be.an("object");
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property("message", "User created successfully");
      expect(res.body).to.have.property("token");

      const user = await User.findOne({ username: testUser.username });
      expect(user).to.exist;
      expect(user.email).to.equal(testUser.email);
      expect(user.firstName).to.equal(testUser.firstName);
      expect(user.lastName).to.equal(testUser.lastName);
    });

    it("should not register a user with missing fields", async () => {
      const incompleteUser = {
        username: faker.internet.username(),
        email: faker.internet.email(),
      };

      const res = await request(server)
        .post("/api/v1/auth/signup")
        .send(incompleteUser);

      expect(res).to.have.status(400);
      expect(res.body).to.be.an("object");
      expect(res.body).to.have.property("status", "error");
      expect(res.body).to.have.property("message", "Validation error");
      expect(res.body).to.have.property("errors").that.is.an("array");
    });

    it("should not register a user with weak password", async () => {
      const weakPasswordUser = {
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: "weak",
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      const res = await request(server)
        .post("/api/v1/auth/signup")
        .send(weakPasswordUser);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("status", "error");
      expect(res.body.errors.some((err) => err.message.includes("Password"))).to
        .be.true;
    });

    it("should not register a user with existing username", async () => {
      const testUser = {
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(12, true),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      await User.create(testUser);

      const res = await request(server)
        .post("/api/v1/auth/signup")
        .send(testUser);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Username already taken");
    });
  });

  // Test user login
  describe("POST /api/v1/auth/login", () => {
    let testUser;

    before(async () => {
      testUser = {
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(12, true),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      await User.create(testUser);
    });

    it("should login with correct credentials", async () => {
      const res = await request(server).post("/api/v1/auth/login").send({
        username: testUser.username,
        password: testUser.password,
      });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property("message", "Logged in successfully");
      expect(res.body).to.have.property("token");

      authToken = res.body.token;
    });

    it("should login with email as username", async () => {
      const res = await request(server).post("/api/v1/auth/login").send({
        username: testUser.email,
        password: testUser.password,
      });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("token");
    });

    it("should not login with incorrect password", async () => {
      const res = await request(server).post("/api/v1/auth/login").send({
        username: testUser.username,
        password: "wrongpassword",
      });

      expect(res).to.have.status(401);
      expect(res.body).to.have.property("message", "Invalid login credentials");
    });

    it("should not login with non-existent user", async () => {
      const res = await request(server).post("/api/v1/auth/login").send({
        username: faker.internet.username(),
        password: faker.internet.password(12, true),
      });

      expect(res).to.have.status(401);
      expect(res.body).to.have.property("message", "Invalid login credentials");
    });
  });

  // Test token verification
  describe("POST /api/v1/verify", () => {
    before(async () => {
      const user = await User.create({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(12, true),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });

      authToken = generateAccessToken(user);
    });

    it("should verify a valid token", async () => {
      const res = await request(server)
        .post("/api/v1/verify")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property("message", "Token is valid");
      expect(res.body).to.have.property("user").that.is.an("object");
    });

    it("should reject requests with no token", async () => {
      const res = await request(server).post("/api/v1/verify");

      expect(res).to.have.status(401);
      expect(res.body).to.have.property(
        "message",
        "Unauthorized, Missing Access Token"
      );
    });

    it("should reject requests with invalid token format", async () => {
      const res = await request(server)
        .post("/api/v1/verify")
        .set("Authorization", "InvalidTokenFormat");

      expect(res).to.have.status(401);
      expect(res.body).to.have.property(
        "message",
        "Unauthorized, Invalid Token Format"
      );
    });

    it("should reject requests with malformed token", async () => {
      const res = await request(server)
        .post("/api/v1/verify")
        .set("Authorization", "Bearer invalidtoken123");

      expect(res).to.have.status(401);
      expect(res.body).to.have.property(
        "message",
        "Unauthorized, Invalid Token"
      );
    });
  });

  // Test user logout
  describe("POST /api/v1/auth/logout", () => {
    before(async () => {
      const user = await User.create({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(12, true),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });

      authToken = generateAccessToken(user);
    });

    it("should successfully logout", async () => {
      const res = await request(server)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("message", "Logged out successfully");
    });

    it("should reject logout with no token", async () => {
      const res = await request(server).post("/api/v1/auth/logout");

      expect(res).to.have.status(401);
    });
  });
});
