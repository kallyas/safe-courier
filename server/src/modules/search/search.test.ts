import { describe, expect, it } from "vitest";
import {
  api,
  bearer,
  createAdmin,
  createParcel,
  createUser,
} from "../../tests/helpers";

describe("Search", () => {
  describe("GET /api/v1/users/search", () => {
    it("finds users by an indexed name term", async () => {
      const { token } = await createAdmin();
      await createUser({ firstName: "Zaphod" });

      const res = await api()
        .get("/api/v1/users/search?q=Zaphod")
        .set("Authorization", bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].password).toBeUndefined();
    });

    it("rejects a too-short query", async () => {
      const { token } = await createUser();
      const res = await api()
        .get("/api/v1/users/search?q=a")
        .set("Authorization", bearer(token));

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Search query must be at least 2 characters",
      );
    });
  });

  describe("GET /api/v1/parcels/search", () => {
    it("finds a user's own parcels by description", async () => {
      const { user, token } = await createUser();
      await createParcel(user.id, { description: "Laptop computer" });
      await createParcel(user.id, { description: "Legal documents" });

      const res = await api()
        .get("/api/v1/parcels/search?q=Laptop")
        .set("Authorization", bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].description).toContain("Laptop");
    });

    it("scopes results to the requester for non-admins", async () => {
      const { user } = await createUser();
      const { token: otherToken } = await createUser();
      await createParcel(user.id, { description: "Secret cargo" });

      const res = await api()
        .get("/api/v1/parcels/search?q=Secret")
        .set("Authorization", bearer(otherToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it("lets an admin search across all parcels", async () => {
      const { user } = await createUser();
      const { token: adminToken } = await createAdmin();
      await createParcel(user.id, { description: "Globally findable item" });

      const res = await api()
        .get("/api/v1/parcels/search?q=findable")
        .set("Authorization", bearer(adminToken));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("POST /api/v1/search/advanced", () => {
    it("filters parcels by status", async () => {
      const { user, token } = await createUser();
      await createParcel(user.id, { status: "in-transit" });
      await createParcel(user.id, { status: "pending" });

      const res = await api()
        .post("/api/v1/search/advanced")
        .set("Authorization", bearer(token))
        .send({ type: "parcels", status: "in-transit" });

      expect(res.status).toBe(200);
      expect(
        res.body.data.every((p: { status: string }) => p.status === "in-transit"),
      ).toBe(true);
    });
  });
});
