import { afterAll, afterEach, beforeAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { User } from "../modules/users/user.model";
import { Parcel } from "../modules/parcels/parcel.model";

// Deterministic test environment — set before any app module reads `env`.
process.env.NODE_ENV = "test";
process.env.ACCESS_TOKEN_SECRET ||= "test-secret-key-for-testing-only";
process.env.JWT_EXPIRY ||= "1h";
process.env.LOG_LEVEL = "silent";
delete process.env.REDIS_URL;

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  // Build text indexes up front so $text search queries work in the suite.
  await Promise.all([User.syncIndexes(), Parcel.syncIndexes()]);
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
