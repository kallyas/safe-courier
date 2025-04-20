import { use, should, expect } from "chai";
import chaiHttp from "chai-http";
import request from "supertest";
import server from "../../index.js";
import User from "../models/user.model.js";
import Parcel from "../models/parcel.model.js";
import { generateAccessToken } from "../middlewares/auth.js";
import { faker } from "@faker-js/faker";

use(chaiHttp);

describe("Search Functionality", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Parcel.deleteMany({});
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Parcel.deleteMany({});
  });

  after(async () => {
    await User.deleteMany({});
    await Parcel.deleteMany({});
  });

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

  const sampleParcel = {
    parcelType: faker.helpers.arrayElement(["package", "document"]),
    weight: Math.max(0.1, Math.random() * 50), // Ensures weight is between 0.1 and 50
    description: faker.commerce.productDescription(),
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
    city: faker.location.city(),
  };

  let adminToken;
  let userToken;
  let userId;
  let adminId;
  let uniqueTrackingCode;

  before(async () => {
    const admin = await User.create(adminUser);
    adminToken = generateAccessToken(admin);
    adminId = admin._id.toString();

    const user = await User.create(regularUser);
    userToken = generateAccessToken(user);
    userId = user._id.toString();

    const laptopParcel = new Parcel({
      ...sampleParcel,
      description: "Laptop computer with accessories",
      sender: userId,
    });
    await laptopParcel.save();

    const documentsParcel = new Parcel({
      ...sampleParcel,
      parcelType: "document",
      description: "Important legal documents",
      sender: userId,
      weight: Math.max(0.1, Math.random() * 5), // Ensures weight is between 0.1 and 5
    });
    await documentsParcel.save();

    const uniqueParcel = new Parcel({
      ...sampleParcel,
      description: "Unique item for testing",
      sender: adminId,
    });
    const savedUniqueParcel = await uniqueParcel.save();
    uniqueTrackingCode = savedUniqueParcel.trackingCode;

    const adminParcel1 = new Parcel({
      ...sampleParcel,
      description: "Admin test package 1",
      sender: adminId,
    });
    await adminParcel1.save();

    const adminParcel2 = new Parcel({
      ...sampleParcel,
      description: "Admin test package 2",
      sender: adminId,
    });
    await adminParcel2.save();

    for (let i = 0; i < 3; i++) {
      await User.create({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
    }
  });

  // The rest of the test cases remain unchanged
});
