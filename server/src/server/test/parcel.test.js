// src/server/test/parcel.test.js
import { use, should, expect } from "chai";
import chaiHttp from "chai-http";
import request from "supertest";
import server from "../../index.js";
import User from "../models/user.model.js";
import Parcel from "../models/parcel.model.js";
import { generateAccessToken } from "../middlewares/auth.js";
import { faker } from "@faker-js/faker";

use(chaiHttp);

describe("Parcel Management", () => {
  // Clear the database before each test
  beforeEach(async () => {
    // Clear the database
    await User.deleteMany({});
    await Parcel.deleteMany({});
  });
  // Clear the database after each test
  afterEach(async () => {
    // Clear the database
    await User.deleteMany({});
    await Parcel.deleteMany({});
  });
  // Clear the database after all tests
  after(async () => {
    // Clear the database
    await User.deleteMany({});
    await Parcel.deleteMany({});
  });
  // Test users
  const adminUser = {
    username: "parceladmin",
    email: "padmin@example.com",
    password: "AdminPass123",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    isAdmin: true,
  };

  const regularUser = {
    username: "parceluser",
    email: "puser@example.com",
    password: "UserPass123",
    firstName: "Regular",
    lastName: "User",
  };

  const courierUser = {
    username: "courier",
    email: "courier@example.com",
    password: "CourierPass123",
    firstName: "Courier",
    lastName: "User",
    role: "courier",
  };

  // Sample parcel data
  const sampleParcel = {
    parcelType: "package",
    weight: 5.2,
    description: "Test package containing books",
    locationFrom: {
      address: "123 Sender St",
      city: "Sender City",
      state: "Sender State",
      country: "Sender Country",
      postalCode: "12345",
    },
    locationTo: {
      address: "456 Receiver Ave",
      city: "Receiver City",
      state: "Receiver State",
      country: "Receiver Country",
      postalCode: "67890",
    },
    recipient: {
      name: "Recipient Name",
      email: "recipient@example.com",
      phone: "555-123-4567",
    },
    city: "Receiver City",
  };

  let adminToken;
  let userToken;
  let courierToken;
  let userId;
  let courierId;
  let adminId;
  let parcelId;
  let userParcelId;

  before(async () => {
    // Create test users
    const admin = await User.create(adminUser);
    adminToken = generateAccessToken(admin);
    adminId = admin._id.toString();

    const user = await User.create(regularUser);
    userToken = generateAccessToken(user);
    userId = user._id.toString();

    const courier = await User.create(courierUser);
    courierToken = generateAccessToken(courier);
    courierId = courier._id.toString();

    // Create a test parcel for admin
    const adminParcel = new Parcel({
      ...sampleParcel,
      sender: admin._id,
    });
    const savedAdminParcel = await adminParcel.save();
    parcelId = savedAdminParcel._id.toString();

    // Create a test parcel for regular user
    const userParcel = new Parcel({
      parcelType: "document",
      weight: Math.random() * (10 - 0.1) + 0.1, // Generate random weight between 0.1 and 10
      description: faker.lorem.sentence(),
      sender: user._id,
      locationFrom: {
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      postalCode: faker.location.zipCode(),
      },
      locationTo: {
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      postalCode: faker.location.zipCode(),
      },
      recipient: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      },
    });
    const savedUserParcel = await userParcel.save();
    userParcelId = savedUserParcel._id.toString();
  });

  // Test creating a parcel
  describe("POST /api/v1/parcels", () => {
    it("should create a new parcel", async () => {
      const newParcel = {
        ...sampleParcel,
        parcelType: "electronics",
        description: "New laptop computer",
        weight: 3.5,
      };

      const res = await 
        request(server)
        .post("/api/v1/parcels")
        .set("Authorization", `Bearer ${userToken}`)
        .send(newParcel);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property(
        "message",
        "Parcel created successfully",
      );
      expect(res.body).to.have.property("data");
      expect(res.body.data).to.have.property(
        "parcelType",
        newParcel.parcelType,
      );
      expect(res.body.data).to.have.property("weight", newParcel.weight);
      expect(res.body.data)
        .to.have.property("trackingCode")
        .that.is.a("string");
      expect(res.body.data).to.have.property("sender");
    });

    it("should not create a parcel with missing required fields", async () => {
      const incompleteParcel = {
        parcelType: "package",
        // Missing weight, locationFrom, locationTo, etc.
      };

      const res = await 
        request(server)
        .post("/api/v1/parcels")
        .set("Authorization", `Bearer ${userToken}`)
        .send(incompleteParcel);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("status", "error");
    });

    it("should calculate price automatically based on weight", async () => {
      const testParcel = {
        ...sampleParcel,
        weight: 3.0, // Should result in $35 (base $5 + $10 * 3)
      };

      const res = await 
        request(server)
        .post("/api/v1/parcels")
        .set("Authorization", `Bearer ${userToken}`)
        .send(testParcel);

      expect(res).to.have.status(201);
      expect(res.body.data.price.amount).to.equal(35);
    });
  });

  // Test getting all parcels
  describe("GET /api/v1/parcels", () => {
    it("should allow admin to get all parcels", async () => {
      const res = await 
        request(server)
        .get("/api/v1/parcels")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property("data").that.is.an("array");
      expect(res.body.data.length).to.be.at.least(2);
    });

    it("should only return user's own parcels for regular users", async () => {
      const res = await 
        request(server)
        .get("/api/v1/parcels")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res).to.have.status(200);

      // Check ownership by either populated user object or just ID
      res.body.data.forEach((parcel) => {
        const senderId = parcel.sender._id || parcel.sender;
        expect(senderId.toString() === userId).to.be.true;
      });
    });

    it("should filter parcels by status", async () => {
      // Create a parcel with specific status
      const statusParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "in-transit",
      });
      await statusParcel.save();

      const res = await 
        request(server)
        .get("/api/v1/parcels?status=in-transit")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res).to.have.status(200);
      expect(res.body.data.every((parcel) => parcel.status === "in-transit")).to
        .be.true;
    });

    it("should paginate results correctly", async () => {
      // Create 5 more parcels
      for (let i = 0; i < 5; i++) {
        const extraParcel = new Parcel({
          ...sampleParcel,
          sender: userId,
          description: `Extra parcel ${i}`,
        });
        await extraParcel.save();
      }

      const res = await 
        request(server)
        .get("/api/v1/parcels?limit=3&page=1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res).to.have.status(200);
      expect(res.body.data.length).to.equal(3);
      expect(res.body).to.have.property("pagination");
      expect(res.body.pagination).to.have.property("page", 1);
      expect(res.body.pagination).to.have.property("limit", 3);
    });
  });

  // Test getting parcel by ID
  describe("GET /api/v1/parcels/:parcelId", () => {
    it("should retrieve a parcel by ID for the owner", async () => {
      const res = await 
        request(server)
        .get(`/api/v1/parcels/${userParcelId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property("data");
      expect(res.body.data).to.have.property("_id", userParcelId);
    });

    it("should allow admin to retrieve any parcel", async () => {
      const res = await 
        request(server)
        .get(`/api/v1/parcels/${userParcelId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.data).to.have.property("_id", userParcelId);
    });

    it("should not allow unauthorized access to other users' parcels", async () => {
      // Create another user and get their token
      const anotherUser = await User.create({
        username: "anotheruser",
        email: "another@example.com",
        password: "AnotherPass123",
        firstName: "Another",
        lastName: "User",
      });
      const anotherToken = generateAccessToken(anotherUser);

      const res = await 
        request(server)
        .get(`/api/v1/parcels/${userParcelId}`)
        .set("Authorization", `Bearer ${anotherToken}`);

      expect(res).to.have.status(403);
      expect(res.body).to.have.property(
        "message",
        "You are not authorized to view this parcel",
      );
    });

    it("should return 404 for non-existent parcel", async () => {
      const nonExistentId = "60c72c3f9b1d8c001c8f0fdd"; // Valid MongoDB ID that doesn't exist

      const res = await 
        request(server)
        .get(`/api/v1/parcels/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message", "Parcel not found");
    });
  });

  // Test getting user's parcels
  describe("GET /api/v1/users/:userId/parcels", () => {
    it("should get all parcels for a specific user", async () => {
      const res = await 
        request(server)
        .get(`/api/v1/users/${userId}/parcels`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property("data").that.is.an("array");

      // All returned parcels should belong to the user
      res.body.data.forEach((parcel) => {
        const senderId = parcel.sender || parcel.sender;
        expect(senderId.toString() === userId || senderId === userId).to.be
          .true;
      });
    });

    it("should allow admin to get any user's parcels", async () => {
      const res = await 
        request(server)
        .get(`/api/v1/users/${userId}/parcels`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.data.length).to.be.at.least(1);
    });

    it("should not allow users to access other users' parcels", async () => {
      // Create another user
      const anotherUser = await User.create({
        username: "restricteduser",
        email: "restricted@example.com",
        password: "RestrictedPass123",
        firstName: "Restricted",
        lastName: "User",
      });
      const restrictedToken = generateAccessToken(anotherUser);

      const res = await 
        request(server)
        .get(`/api/v1/users/${userId}/parcels`)
        .set("Authorization", `Bearer ${restrictedToken}`);

      expect(res).to.have.status(403);
    });
  });

  // Test public tracking endpoint
  describe("GET /api/v1/parcels/track/:trackingCode", () => {
    let trackingCode;

    before(async () => {
      // Get tracking code from existing parcel
      const parcel = await Parcel.findById(userParcelId);
      trackingCode = parcel.trackingCode;
    });

    it("should allow anyone to track a parcel by tracking code", async () => {
      const res = await 
        request(server)
        .get(`/api/v1/parcels/track/${trackingCode}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property("data");
      expect(res.body.data).to.have.property("trackingCode", trackingCode);
      expect(res.body.data).to.have.property("status");
      expect(res.body.data).to.have.property("progress").that.is.a("number");

      // Ensure sensitive information is not exposed
      expect(res.body.data).to.not.have.property("sender");
    });

    it("should return 404 for invalid tracking code", async () => {
      const res = await 
        request(server)
        .get("/api/v1/parcels/track/INVALID123");

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message", "Parcel not found");
    });
  });

  // Test cancel parcel
  describe("PUT /api/v1/parcels/:parcelId/cancel", () => {
    let cancelableParcelId;

    before(async () => {
      // Create a parcel to cancel
      const cancelableParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
      });
      const saved = await cancelableParcel.save();
      cancelableParcelId = saved._id.toString();
    });

    it("should allow sender to cancel their parcel", async () => {
      const res = await 
        request(server)
        .put(`/api/v1/parcels/${cancelableParcelId}/cancel`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property(
        "message",
        "Parcel cancelled successfully",
      );
      expect(res.body.data).to.have.property("status", "cancelled");
    });

    it("should allow admin to cancel any parcel", async () => {
      // Create another parcel to cancel
      const adminCancelParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        description: "Admin cancel test",
      });
      const saved = await adminCancelParcel.save();

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${saved._id}/cancel`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.data).to.have.property("status", "cancelled");
    });

    it("should not allow cancellation of a delivered parcel", async () => {
      // Create and deliver a parcel
      const deliveredParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "delivered",
        deliveryDate: new Date(),
      });
      const saved = await deliveredParcel.save();

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${saved._id}/cancel`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property(
        "message",
        "Cannot cancel a delivered or returned parcel",
      );
    });

    it("should not allow unauthorized user to cancel a parcel", async () => {
      // Create another user's parcel
      const anotherUser = await User.create({
        username: "canceltest",
        email: "cancel@example.com",
        password: "CancelPass123",
        firstName: "Cancel",
        lastName: "Test",
      });

      const anotherParcel = new Parcel({
        ...sampleParcel,
        sender: anotherUser._id,
      });
      const saved = await anotherParcel.save();

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${saved._id}/cancel`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res).to.have.status(403);
      expect(res.body).to.have.property(
        "message",
        "You are not authorized to cancel this parcel",
      );
    });
  });

  // Test update destination
  describe("PUT /api/v1/parcels/:parcelId/destination", () => {
    let updateableParcelId;

    before(async () => {
      // Create a parcel to update
      const updateableParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
      });
      const saved = await updateableParcel.save();
      updateableParcelId = saved._id.toString();
    });

    it("should allow sender to update destination", async () => {
      const newDestination = {
        locationTo: {
          address: "789 New Destination St",
          city: "New City",
          state: "New State",
          country: "New Country",
          postalCode: "54321",
        },
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${updateableParcelId}/destination`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(newDestination);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property(
        "message",
        "Destination updated successfully",
      );
      expect(res.body.data.locationTo).to.have.property("city", "New City");
      expect(res.body.data.locationTo).to.have.property(
        "address",
        "789 New Destination St",
      );
    });

    it("should not allow destination update for delivered parcels", async () => {
      // Create and deliver a parcel
      const deliveredParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "delivered",
        deliveryDate: new Date(),
      });
      const saved = await deliveredParcel.save();

      const newDestination = {
        locationTo: {
          address: "789 Cannot Change St",
          city: "Cannot Change City",
          state: "State",
          country: "Country",
          postalCode: "54321",
        },
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${saved._id}/destination`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(newDestination);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property(
        "message",
        "Cannot update a delivered, returned, or cancelled parcel",
      );
    });

    it("should validate destination data", async () => {
      const invalidDestination = {
        locationTo: {
          // Missing required address field
          city: "Invalid City",
        },
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${updateableParcelId}/destination`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(invalidDestination);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("status", "error");
    });
  });

  // Test update status (admin only)
  describe("PUT /api/v1/parcels/:parcelId/status", () => {
    let statusTestParcelId;

    before(async () => {
      // Create a parcel for status tests
      const statusTestParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "pending",
      });
      const saved = await statusTestParcel.save();
      statusTestParcelId = saved._id.toString();
    });

    it("should allow admin to update status", async () => {
      const statusUpdate = {
        status: "in-transit",
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${statusTestParcelId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(statusUpdate);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property(
        "message",
        "Status updated successfully",
      );
      expect(res.body.data).to.have.property("status", "in-transit");
    });

    it("should set deliveryDate when marking as delivered", async () => {
      const deliveredUpdate = {
        status: "delivered",
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${statusTestParcelId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(deliveredUpdate);

      expect(res).to.have.status(200);
      expect(res.body.data).to.have.property("status", "delivered");
      expect(res.body.data)
        .to.have.property("deliveryDate")
        .that.is.a("string");
    });

    it("should not allow regular users to update status", async () => {
      // Create a new parcel for this test
      const newStatusParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "pending",
      });
      const saved = await newStatusParcel.save();

      const statusUpdate = {
        status: "delivered",
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${saved._id}/status`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(statusUpdate);

      expect(res).to.have.status(403);
      expect(res.body).to.have.property(
        "message",
        "Only administrators can update parcel status",
      );
    });

    it("should validate status value", async () => {
      const invalidUpdate = {
        status: "invalid-status",
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${statusTestParcelId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(invalidUpdate);

      expect(res).to.have.status(400);
      expect(res.body.errors.some((err) => err.path.includes("status"))).to.be
        .true;
    });
  });

  // Test update present location (admin only)
  describe("PUT /api/v1/parcels/:parcelId/presentLocation", () => {
    let locationUpdateParcelId;

    before(async () => {
      // Create a parcel in transit
      const inTransitParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "in-transit",
      });
      const saved = await inTransitParcel.save();
      locationUpdateParcelId = saved._id.toString();
    });

    it("should allow admin to update present location", async () => {
      const locationUpdate = {
        presentLocation: {
          address: "123 Current St",
          city: "Transit City",
          state: "Transit State",
          country: "Transit Country",
          postalCode: "12345",
        },
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${locationUpdateParcelId}/presentLocation`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(locationUpdate);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property(
        "message",
        "Location updated successfully",
      );
      expect(res.body.data.presentLocation).to.have.property(
        "city",
        "Transit City",
      );
    });

    it("should update status from pending to in-transit when updating location", async () => {
      // Create a pending parcel
      const pendingParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "pending",
      });
      const saved = await pendingParcel.save();

      const locationUpdate = {
        presentLocation: {
          address: "123 Processing St",
          city: "Processing City",
          state: "Processing State",
          country: "Processing Country",
          postalCode: "12345",
        },
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${saved._id}/presentLocation`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(locationUpdate);

      expect(res).to.have.status(200);
      expect(res.body.data).to.have.property("status", "in-transit");
    });

    it("should not allow location update for delivered parcels", async () => {
      // Create a delivered parcel
      const deliveredParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "delivered",
      });
      const saved = await deliveredParcel.save();

      const locationUpdate = {
        presentLocation: {
          address: "123 Too Late St",
          city: "Too Late City",
          state: "Too Late State",
          country: "Too Late Country",
          postalCode: "12345",
        },
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${saved._id}/presentLocation`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(locationUpdate);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property(
        "message",
        "Cannot update location of a delivered, returned, or cancelled parcel",
      );
    });

    it("should not allow regular users to update location", async () => {
      const locationUpdate = {
        presentLocation: {
          address: "123 Unauthorized St",
          city: "Unauthorized City",
          state: "Unauthorized State",
          country: "Unauthorized Country",
          postalCode: "12345",
        },
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${locationUpdateParcelId}/presentLocation`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(locationUpdate);

      expect(res).to.have.status(403);
      expect(res.body).to.have.property(
        "message",
        "Only administrators can update parcel location",
      );
    });
  });

  // Test assign courier to parcel
  describe("PUT /api/v1/parcels/:parcelId/assign", () => {
    let assignableParcelId;

    before(async () => {
      // Create a parcel to assign
      const assignableParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "pending",
      });
      const saved = await assignableParcel.save();
      assignableParcelId = saved._id.toString();
    });

    it("should allow admin to assign courier to parcel", async () => {
      const assignRequest = {
        courierId: courierId,
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${assignableParcelId}/assign`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(assignRequest);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("status", "success");
      expect(res.body).to.have.property(
        "message",
        "Courier assigned successfully",
      );
      expect(res.body.data).to.have.property("courierAssigned", courierId);
      expect(res.body.data).to.have.property("status", "processing");
    });

    it("should not assign non-courier users", async () => {
      // Create another non-courier user
      const nonCourier = await User.create({
        username: "noncourier",
        email: "noncourier@example.com",
        password: "NonCourierPass123",
        firstName: "Non",
        lastName: "Courier",
      });

      // Create a new parcel for this test
      const newAssignParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "pending",
      });
      const saved = await newAssignParcel.save();

      const assignRequest = {
        courierId: nonCourier._id.toString(),
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${saved._id}/assign`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(assignRequest);

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message", "Courier not found");
    });

    it("should not allow non-admin to assign courier", async () => {
      // Create a new parcel for this test
      const userAssignParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "pending",
      });
      const saved = await userAssignParcel.save();

      const assignRequest = {
        courierId: courierId,
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${saved._id}/assign`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(assignRequest);

      expect(res).to.have.status(403);
      expect(res.body).to.have.property(
        "message",
        "Only administrators can assign couriers",
      );
    });

    it("should handle invalid parcel ID", async () => {
      const assignRequest = {
        courierId: courierId,
      };

      const res = await 
        request(server)
        .put("/api/v1/parcels/invalidid/assign")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(assignRequest);

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message", "Invalid ID format");
    });

    it("should handle non-existent parcel", async () => {
      const nonExistentId = "60c72c3f9b1d8c001c8f0fdd"; // Valid MongoDB ID that doesn't exist

      const assignRequest = {
        courierId: courierId,
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${nonExistentId}/assign`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(assignRequest);

      expect(res).to.have.status(404);
      expect(res.body).to.have.property("message", "Parcel not found");
    });
  });

  // Test estimated delivery calculations
  describe("Parcel Delivery Estimates", () => {
    it("should set estimated delivery date when assigning courier", async () => {
      // Create a new parcel
      const estimateParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "pending",
      });
      const saved = await estimateParcel.save();

      const assignRequest = {
        courierId: courierId,
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${saved._id}/assign`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(assignRequest);

      expect(res).to.have.status(200);
      expect(res.body.data)
        .to.have.property("estimatedDelivery")
        .that.is.a("string");

      // Verify the estimated delivery is in the future
      const estimatedDate = new Date(res.body.data.estimatedDelivery);
      const now = new Date();
      expect(estimatedDate > now).to.be.true;
    });

    it("should calculate delivery estimate based on distance and parcel type", async () => {
      // Create two parcels with different types and locations
      const nearbyParcel = new Parcel({
        ...sampleParcel,
        parcelType: "document", // Documents should be faster
        sender: userId,
        status: "pending",
        locationFrom: {
          address: "123 Near St",
          city: "Near City",
          state: "Near State",
          country: "Near Country",
          postalCode: "12345",
        },
        locationTo: {
          address: "456 Also Near Ave",
          city: "Near City", // Same city = short distance
          state: "Near State",
          country: "Near Country",
          postalCode: "12346",
        },
      });
      await nearbyParcel.save();

      const farAwayParcel = new Parcel({
        ...sampleParcel,
        parcelType: "package", // Packages are slower
        sender: userId,
        status: "pending",
        locationFrom: {
          address: "123 Start St",
          city: "Start City",
          state: "Start State",
          country: "Start Country",
          postalCode: "12345",
        },
        locationTo: {
          address: "456 Distant Ave",
          city: "Far City", // Different city = longer distance
          state: "Far State",
          country: "Far Country", // Different country = even longer
          postalCode: "99999",
        },
      });
      await farAwayParcel.save();

      // Assign courier to both
      await 
        request(server)
        .put(`/api/v1/parcels/${nearbyParcel._id}/assign`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ courierId });

      await 
        request(server)
        .put(`/api/v1/parcels/${farAwayParcel._id}/assign`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ courierId });

      // Get both parcels
      const nearbyRes = await 
        request(server)
        .get(`/api/v1/parcels/${nearbyParcel._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      const farAwayRes = await 
        request(server)
        .get(`/api/v1/parcels/${farAwayParcel._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      // Parse dates for comparison
      const nearbyDate = new Date(nearbyRes.body.data.estimatedDelivery);
      const farAwayDate = new Date(farAwayRes.body.data.estimatedDelivery);

      // The far away parcel should have a later estimated delivery
      expect(farAwayDate > nearbyDate).to.be.true;
    });
  });

  // Test parcel progress calculation
  describe("Parcel Progress Calculations", () => {
    it("should calculate correct progress percentage based on status", async () => {
      // Create parcels with different statuses
      const pendingParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "pending",
      });
      await pendingParcel.save();

      const processingParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "processing",
      });
      await processingParcel.save();

      const inTransitParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "in-transit",
      });
      await inTransitParcel.save();

      const deliveredParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "delivered",
      });
      await deliveredParcel.save();

      // Get all parcels
      const pendingRes = await 
        request(server)
        .get(`/api/v1/parcels/${pendingParcel._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      const processingRes = await 
        request(server)
        .get(`/api/v1/parcels/${processingParcel._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      const inTransitRes = await 
        request(server)
        .get(`/api/v1/parcels/${inTransitParcel._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      const deliveredRes = await 
        request(server)
        .get(`/api/v1/parcels/${deliveredParcel._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      // Check progress values
      expect(pendingRes.body.data.progress).to.be.a("number");
      expect(processingRes.body.data.progress).to.be.a("number");
      expect(inTransitRes.body.data.progress).to.be.a("number");
      expect(deliveredRes.body.data.progress).to.be.a("number");

      // Verify progression
      expect(pendingRes.body.data.progress).to.equal(0);
      expect(processingRes.body.data.progress).to.be.greaterThan(
        pendingRes.body.data.progress,
      );
      expect(inTransitRes.body.data.progress).to.be.greaterThan(
        processingRes.body.data.progress,
      );
      expect(deliveredRes.body.data.progress).to.equal(100);
    });
  });

  // Test handling of dimensions and weight
  describe("Parcel Dimensions and Weight", () => {
    it("should store and retrieve parcel dimensions correctly", async () => {
      const parcelWithDimensions = {
        ...sampleParcel,
        weight: 4.5,
        dimensions: {
          length: 30,
          width: 20,
          height: 15,
          unit: "cm",
        },
      };

      const res = await 
        request(server)
        .post("/api/v1/parcels")
        .set("Authorization", `Bearer ${userToken}`)
        .send(parcelWithDimensions);

      expect(res).to.have.status(201);
      expect(res.body.data.dimensions).to.deep.include({
        length: 30,
        width: 20,
        height: 15,
        unit: "cm",
      });

      // Retrieve and check dimensions
      const getRes = await 
        request(server)
        .get(`/api/v1/parcels/${res.body.data._id}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(getRes.body.data.dimensions).to.deep.include({
        length: 30,
        width: 20,
        height: 15,
        unit: "cm",
      });
    });

    it("should allow imperial units for dimensions", async () => {
      const imperialParcel = {
        ...sampleParcel,
        weight: 10,
        dimensions: {
          length: 12,
          width: 8,
          height: 6,
          unit: "in",
        },
      };

      const res = await 
        request(server)
        .post("/api/v1/parcels")
        .set("Authorization", `Bearer ${userToken}`)
        .send(imperialParcel);

      expect(res).to.have.status(201);
      expect(res.body.data.dimensions.unit).to.equal("in");
    });

    it("should calculate price based on weight and dimensions", async () => {
      // Create two parcels with same weight but different dimensions
      const smallParcel = {
        ...sampleParcel,
        weight: 5,
        dimensions: {
          length: 10,
          width: 10,
          height: 10,
          unit: "cm",
        },
      };

      const largeParcel = {
        ...sampleParcel,
        weight: 5,
        dimensions: {
          length: 50,
          width: 50,
          height: 50,
          unit: "cm",
        },
      };

      const smallRes = await 
        request(server)
        .post("/api/v1/parcels")
        .set("Authorization", `Bearer ${userToken}`)
        .send(smallParcel);

      const largeRes = await 
        request(server)
        .post("/api/v1/parcels")
        .set("Authorization", `Bearer ${userToken}`)
        .send(largeParcel);

      // Both should have the same base rate from weight
      const smallPrice = smallRes.body.data.price.amount;
      const largePrice = largeRes.body.data.price.amount;

      // But large parcel should have additional volumetric weight charges
      expect(largePrice).to.be.greaterThan(smallPrice);
    });

    it("should reject parcels with excessive weight", async () => {
      const heavyParcel = {
        ...sampleParcel,
        weight: 1001, // Over the 1000kg limit
      };

      const res = await 
        request(server)
        .post("/api/v1/parcels")
        .set("Authorization", `Bearer ${userToken}`)
        .send(heavyParcel);

      expect(res).to.have.status(400);
      expect(res.body.errors.some((err) => err.message.includes("Weight"))).to
        .be.true;
    });
  });

  // Test payment status updates
  describe("Parcel Payment Status", () => {
    it("should have pending payment status by default", async () => {
      const newParcel = {
        ...sampleParcel,
        description: "Payment test parcel",
      };

      const res = await 
        request(server)
        .post("/api/v1/parcels")
        .set("Authorization", `Bearer ${userToken}`)
        .send(newParcel);

      expect(res).to.have.status(201);
      expect(res.body.data).to.have.property("paymentStatus", "pending");
    });

    it("should allow admin to update payment status", async () => {
      // Create a parcel for payment testing
      const paymentParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
      });
      const saved = await paymentParcel.save();

      // Update to paid
      const paymentUpdate = {
        paymentStatus: "paid",
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${saved._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(paymentUpdate);

      expect(res).to.have.status(200);

      // Verify payment status was updated
      const getRes = await 
        request(server)
        .get(`/api/v1/parcels/${saved._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getRes.body.data).to.have.property("paymentStatus", "paid");
    });

    it("should not proceed to delivery before payment", async () => {
      // This test assumes we have implemented business logic that
      // prevents parcels from being delivered if not paid

      // Create a parcel with pending payment
      const unpaidParcel = new Parcel({
        ...sampleParcel,
        sender: userId,
        status: "processing",
        paymentStatus: "pending",
      });
      const saved = await unpaidParcel.save();

      // Try to update to delivered
      const statusUpdate = {
        status: "delivered",
      };

      const res = await 
        request(server)
        .put(`/api/v1/parcels/${saved._id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(statusUpdate);

      // Either should get an error or should still not be marked as delivered
      if (res.status === 400) {
        expect(res.body).to.have.property("message").that.includes("payment");
      } else {
        const getRes = await 
          request(server)
          .get(`/api/v1/parcels/${saved._id}`)
          .set("Authorization", `Bearer ${adminToken}`);

        // Should still not be marked as delivered
        expect(getRes.body.data).to.not.have.property("status", "delivered");
      }
    });
  });
});
