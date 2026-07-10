import { faker } from "@faker-js/faker";
import supertest from "supertest";
import { createApp } from "../app";
import { generateAccessToken } from "../modules/auth/auth.service";
import { User, type UserDocument } from "../modules/users/user.model";
import { Parcel, type ParcelDocument } from "../modules/parcels/parcel.model";

// A single app instance is reused across the suite (no server is listening —
// supertest drives the Express handler directly).
export const app = createApp();
export const api = () => supertest(app);

const VALID_PASSWORD = "Password123";

export interface BuildUserOptions {
  role?: "user" | "admin" | "courier";
  isAdmin?: boolean;
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export function buildUser(overrides: BuildUserOptions = {}) {
  const suffix = faker.string.alphanumeric(8).toLowerCase();
  return {
    username: `user_${suffix}`,
    email: `user_${suffix}@example.com`,
    password: VALID_PASSWORD,
    firstName: faker.person.firstName().padEnd(2, "x"),
    lastName: faker.person.lastName().padEnd(2, "x"),
    ...overrides,
  };
}

export async function createUser(overrides: BuildUserOptions = {}): Promise<{
  user: UserDocument;
  token: string;
  password: string;
}> {
  const data = buildUser(overrides);
  const user = await User.create(data);
  return { user, token: generateAccessToken(user), password: data.password };
}

export const createAdmin = () => createUser({ role: "admin", isAdmin: true });
export const createCourier = () => createUser({ role: "courier" });

export function buildParcel(overrides: Record<string, unknown> = {}) {
  return {
    parcelType: "package",
    weight: 5.2,
    description: "Test package containing books",
    locationFrom: {
      address: "123 Sender St",
      city: "Sender City",
      state: "Sender State",
      country: "Senderland",
      postalCode: "12345",
    },
    locationTo: {
      address: "456 Receiver Ave",
      city: "Receiver City",
      state: "Receiver State",
      country: "Senderland",
      postalCode: "67890",
    },
    recipient: {
      name: "Recipient Name",
      email: "recipient@example.com",
      phone: "555-123-4567",
    },
    ...overrides,
  };
}

export async function createParcel(
  senderId: string,
  overrides: Record<string, unknown> = {},
): Promise<ParcelDocument> {
  return Parcel.create({ ...buildParcel(overrides), sender: senderId });
}

export const bearer = (token: string) => `Bearer ${token}`;
