// src/server/test/user.test.js
import { use, expect, should } from "chai";
import { faker} from "@faker-js/faker";
import chaiHttp from "chai-http";
import request from "supertest";
import server from "../../index.js";
import User from "../models/user.model.js";
import { generateAccessToken } from "../middlewares/auth.js";

use(chaiHttp);

describe("User Management", () => {
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

  // Test users
  const adminUser = {
    username: faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: "admin",
    isAdmin: true,
  };

  const regularUser = {
    username: faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };

  const updatedInfo = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
  };

  let adminToken;
  let userToken;
  let userId;

  before(async () => {
    // Create admin user
    const admin = await User.create(adminUser);
    adminToken = generateAccessToken(admin);

    // Create regular user
    const user = await User.create(regularUser);
    userToken = generateAccessToken(user);
    userId = user._id.toString();
  });

  // Test getting user by ID
  describe("GET /api/v1/user/:id", () => {
    it("should get user by ID with valid token", async () => {
      const res = await request(server)
        .get(`/api/v1/user/${userId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property("data");
      expect(res.body.data).to.have.property("username", regularUser.username);
      expect(res.body.data).to.have.property("email", regularUser.email);
      expect(res.body.data).to.not.have.property("password");
    });

    it("should allow admin to get any user by ID", async () => {
      const res = await request(server)
        .get(`/api/v1/user/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.data).to.have.property("username", regularUser.username);
    });

    it("should not find non-existent user", async () => {
      const nonExistentId = faker.datatype.uuid(); // Generate a random ID

      const res = await request(server)
        .get(`/api/v1/user/${nonExistentId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message", "User not found");
    });

    it("should reject request with invalid ID format", async () => {
      const res = await request(server)
        .get("/api/v1/user/invalid-id")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Invalid user ID format");
    });

    it("should reject request without token", async () => {
      const res = await request(server).get(`/api/v1/user/${userId}`);

      expect(res).to.have.status(401);
    });
  });

  // Test updating user
  describe("PUT /api/v1/user/:id", () => {
    it("should allow user to update their own profile", async () => {
      const res = await request(server)
        .put(`/api/v1/user/${userId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(updatedInfo);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property("data");
      expect(res.body.data).to.have.property(
        "firstName",
        updatedInfo.firstName
      );
      expect(res.body.data).to.have.property("lastName", updatedInfo.lastName);
      expect(res.body.data).to.have.property("email", updatedInfo.email);
    });

    it("should allow admin to update any user profile", async () => {
      const adminUpdate = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      const res = await request(server)
        .put(`/api/v1/user/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(adminUpdate);

      expect(res).to.have.status(200);
      expect(res.body.data).to.have.property(
        "firstName",
        adminUpdate.firstName
      );
    });

    it("should not update with invalid data", async () => {
      const invalidData = {
        email: "not-an-email",
      };

      const res = await request(server)
        .put(`/api/v1/user/${userId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(invalidData);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("status", "error");
    });

    it("should prevent updating password through this endpoint", async () => {
      const passwordUpdate = {
        password: faker.internet.password(),
      };

      const res = await request(server)
        .put(`/api/v1/user/${userId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(passwordUpdate);

      expect(res).to.have.status(200);

      // Check that password was not changed
      const user = await User.findById(userId);
      const isMatch = await user.comparePassword(regularUser.password);
      expect(isMatch).to.be.true;
    });
  });

  // Test changing password
  describe("PUT /api/v1/user/:id/password", () => {
    it("should allow user to change their own password", async () => {
      const passwordUpdate = {
        currentPassword: regularUser.password,
        newPassword: faker.internet.password(),
        confirmPassword: faker.internet.password(),
      };

      const res = await request(server)
        .put(`/api/v1/user/${userId}/password`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(passwordUpdate);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property(
        "message",
        "Password changed successfully"
      );

      // Verify password was changed
      const user = await User.findById(userId);
      const isMatch = await user.comparePassword(passwordUpdate.newPassword);
      expect(isMatch).to.be.true;
    });

    it("should reject change with incorrect current password", async () => {
      const badPasswordUpdate = {
        currentPassword: "WrongPassword",
        newPassword: faker.internet.password(),
        confirmPassword: faker.internet.password(),
      };

      const res = await request(server)
        .put(`/api/v1/user/${userId}/password`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(badPasswordUpdate);

      expect(res).to.have.status(401);
      expect(res.body).to.have.property(
        "message",
        "Current password is incorrect"
      );
    });

    it("should reject if passwords do not match", async () => {
      const mismatchedPasswords = {
        currentPassword: regularUser.password,
        newPassword: faker.internet.password(),
        confirmPassword: faker.internet.password(),
      };

      const res = await request(server)
        .put(`/api/v1/user/${userId}/password`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(mismatchedPasswords);

      expect(res).to.have.status(400);
      expect(res.body.errors.some((err) => err.message.includes("match"))).to.be
        .true;
    });
  });

  // Test getting user profile
  describe("GET /api/v1/profile", () => {
    it("should get current user profile", async () => {
      const res = await request(server)
        .get("/api/v1/profile")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property("data");
      expect(res.body.data).to.have.property("_id", userId);
    });
  });

  // Test getting all users (admin only)
  describe("GET /api/v1/users", () => {
    it("should allow admin to get all users", async () => {
      const res = await request(server)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property("data").that.is.an("array");
      expect(res.body.data.length).to.be.at.least(2); // Admin and regular user
    });

    it("should paginate results correctly", async () => {
      // Create 5 more users
      for (let i = 0; i < 5; i++) {
        await User.create({
          username: faker.internet.username(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
        });
      }

      // Request with pagination (limit 3, page 1)
      const res = await request(server)
        .get("/api/v1/users?limit=3&page=1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.data.length).to.equal(3);
      expect(res.body).to.have.property("pagination");
      expect(res.body.pagination).to.have.property("total").that.is.at.least(7); // 2 original + 5 new
      expect(res.body.pagination).to.have.property("page", 1);
      expect(res.body.pagination).to.have.property("limit", 3);
    });

    it("should apply filters correctly", async () => {
      // Filter by role
      const res = await request(server)
        .get("/api/v1/users?role=admin")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.data.every((user) => user.role === "admin")).to.be.true;
    });

    it("should deny access to regular users", async () => {
      const res = await request(server)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res).to.have.status(403);
    });
  });

  // Test deleting user
  describe("DELETE /api/v1/user/:id", () => {
    let tempUserId;

    before(async () => {
      // Create a temporary user to delete
      const tempUser = await User.create({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
      tempUserId = tempUser._id.toString();
    });

    it("should allow admin to delete any user", async () => {
      const res = await request(server)
        .delete(`/api/v1/user/${tempUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property("message", "User deleted successfully");

      // Verify user was deleted
      const deletedUser = await User.findById(tempUserId);
      expect(deletedUser).to.be.null;
    });

    it("should return 404 for already deleted user", async () => {
      const res = await request(server)
        .delete(`/api/v1/user/${tempUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res).to.have.status(404);
    });

    it("should allow user to delete own account", async () => {
      // Create another temporary user
      const anotherUser = await User.create({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });

      const selfDeleteId = anotherUser._id.toString();
      const selfDeleteToken = generateAccessToken(anotherUser);

      const res = await request(server)
        .delete(`/api/v1/user/${selfDeleteId}`)
        .set("Authorization", `Bearer ${selfDeleteToken}`);

      expect(res).to.have.status(200);

      // Verify user was deleted
      const deletedUser = await User.findById(selfDeleteId);
      expect(deletedUser).to.be.null;
    });

    it("should not allow user to delete another user's account", async () => {
      // Create two more temporary users
      const user1 = await User.create({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });

      const user2 = await User.create({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });

      const user1Id = user1._id.toString();
      const user1Token = generateAccessToken(user1);
      const user2Id = user2._id.toString();

      const res = await request(server)
        .delete(`/api/v1/user/${user2Id}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res).to.have.status(403);

      // Verify user2 was not deleted
      const notDeletedUser = await User.findById(user2Id);
      expect(notDeletedUser).to.exist;
    });
  });
});
