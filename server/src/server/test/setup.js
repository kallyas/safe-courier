// src/server/test/setup.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { fileURLToPath } from "url";
import path from "path";

// Get the directory name using ES module approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup environment for testing
dotenv.config({ path: path.join(__dirname, "../../../.env.test") });

// Disable console output during tests
console.log = () => {};
console.warn = () => {};
console.error = () => {};

// Helper to wait for mongoose connection
const waitForMongoose = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  return new Promise((resolve) => {
    mongoose.connection.once("connected", resolve);
  });
};

let mongoServer;

// Setup in-memory MongoDB for testing
before(async function () {
  this.timeout(30000); // Increase timeout for slower CI environments

  try {
    // Only start the server if we're not already connected
    if (mongoose.connection.readyState !== 1) {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();

      // Set test DB URI
      process.env.DB_URL_TEST = mongoUri;

      // Connect to in-memory database
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log(`MongoDB successfully connected to ${mongoUri}`);

      // Wait for connection to be fully established
      await waitForMongoose();
    }
  } catch (error) {
    console.error("MongoDB setup error:", error);
    throw error;
  }
});

// Clean up after tests
after(async function () {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("MongoDB teardown error:", error);
  }
});

// Clear all collections between tests
afterEach(async function () {
  if (mongoose.connection.readyState !== 0) {
    const collections = Object.keys(mongoose.connection.collections);
    for (const collectionName of collections) {
      const collection = mongoose.connection.collections[collectionName];
      try {
        await collection.deleteMany({});
      } catch (error) {
        console.error(`Error clearing ${collectionName} collection:`, error);
      }
    }
  }
});
