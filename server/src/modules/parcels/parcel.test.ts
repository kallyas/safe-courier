import { describe, expect, it } from "vitest";
import {
  api,
  bearer,
  buildParcel,
  createAdmin,
  createCourier,
  createParcel,
  createUser,
} from "../../tests/helpers";

const NON_EXISTENT_ID = "60c72c3f9b1d8c001c8f0fdd";

describe("Parcel management", () => {
  describe("POST /api/v1/parcels", () => {
    it("creates a parcel for the authenticated sender", async () => {
      const { token } = await createUser();
      const res = await api()
        .post("/api/v1/parcels")
        .set("Authorization", bearer(token))
        .send(buildParcel({ parcelType: "electronics", weight: 3.5 }));

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Parcel created successfully");
      expect(res.body.data.parcelType).toBe("electronics");
      expect(res.body.data.trackingCode).toBeTypeOf("string");
      expect(res.body.data.sender).toBeDefined();
    });

    it("rejects missing required fields", async () => {
      const { token } = await createUser();
      const res = await api()
        .post("/api/v1/parcels")
        .set("Authorization", bearer(token))
        .send({ parcelType: "package" });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
    });

    it("computes price from weight (base $5 + $10/kg)", async () => {
      const { token } = await createUser();
      const res = await api()
        .post("/api/v1/parcels")
        .set("Authorization", bearer(token))
        .send(buildParcel({ weight: 3 }));

      expect(res.status).toBe(201);
      expect(res.body.data.price.amount).toBe(35);
    });

    it("charges more for a larger dimensional weight", async () => {
      const { token } = await createUser();
      const small = await api()
        .post("/api/v1/parcels")
        .set("Authorization", bearer(token))
        .send(buildParcel({ weight: 5, dimensions: { length: 10, width: 10, height: 10, unit: "cm" } }));
      const large = await api()
        .post("/api/v1/parcels")
        .set("Authorization", bearer(token))
        .send(buildParcel({ weight: 5, dimensions: { length: 50, width: 50, height: 50, unit: "cm" } }));

      expect(large.body.data.price.amount).toBeGreaterThan(
        small.body.data.price.amount,
      );
    });

    it("rejects an excessive weight", async () => {
      const { token } = await createUser();
      const res = await api()
        .post("/api/v1/parcels")
        .set("Authorization", bearer(token))
        .send(buildParcel({ weight: 1001 }));

      expect(res.status).toBe(400);
      expect(
        res.body.errors.some((e: { message: string }) =>
          e.message.includes("Weight"),
        ),
      ).toBe(true);
    });

    it("defaults paymentStatus to pending", async () => {
      const { token } = await createUser();
      const res = await api()
        .post("/api/v1/parcels")
        .set("Authorization", bearer(token))
        .send(buildParcel());

      expect(res.body.data.paymentStatus).toBe("pending");
    });
  });

  describe("GET /api/v1/parcels", () => {
    it("lets an admin see all parcels", async () => {
      const { user } = await createUser();
      const { token: adminToken } = await createAdmin();
      await createParcel(user.id);
      await createParcel(user.id);

      const res = await api()
        .get("/api/v1/parcels")
        .set("Authorization", bearer(adminToken));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it("scopes results to the owner for regular users", async () => {
      const { user, token } = await createUser();
      const { user: other } = await createUser();
      await createParcel(user.id);
      await createParcel(other.id);

      const res = await api()
        .get("/api/v1/parcels")
        .set("Authorization", bearer(token));

      expect(res.status).toBe(200);
      res.body.data.forEach((parcel: { sender: { _id: string } }) => {
        expect(parcel.sender._id).toBe(user.id);
      });
    });

    it("filters by status", async () => {
      const { user, token } = await createUser();
      await createParcel(user.id, { status: "in-transit" });
      await createParcel(user.id, { status: "pending" });

      const res = await api()
        .get("/api/v1/parcels?status=in-transit")
        .set("Authorization", bearer(token));

      expect(
        res.body.data.every((p: { status: string }) => p.status === "in-transit"),
      ).toBe(true);
    });

    it("paginates", async () => {
      const { user, token } = await createUser();
      for (let i = 0; i < 5; i += 1) await createParcel(user.id);

      const res = await api()
        .get("/api/v1/parcels?limit=3&page=1")
        .set("Authorization", bearer(token));

      expect(res.body.data).toHaveLength(3);
      expect(res.body.pagination).toMatchObject({ page: 1, limit: 3 });
    });
  });

  describe("GET /api/v1/parcels/:parcelId", () => {
    it("returns a parcel to its owner", async () => {
      const { user, token } = await createUser();
      const parcel = await createParcel(user.id);

      const res = await api()
        .get(`/api/v1/parcels/${parcel.id}`)
        .set("Authorization", bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(parcel.id);
    });

    it("forbids access to another user's parcel", async () => {
      const { user } = await createUser();
      const { token: otherToken } = await createUser();
      const parcel = await createParcel(user.id);

      const res = await api()
        .get(`/api/v1/parcels/${parcel.id}`)
        .set("Authorization", bearer(otherToken));

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("You are not authorized to view this parcel");
    });

    it("returns 404 for a missing parcel", async () => {
      const { token: adminToken } = await createAdmin();
      const res = await api()
        .get(`/api/v1/parcels/${NON_EXISTENT_ID}`)
        .set("Authorization", bearer(adminToken));

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Parcel not found");
    });
  });

  describe("GET /api/v1/users/:userId/parcels", () => {
    it("returns a user's own parcels", async () => {
      const { user, token } = await createUser();
      await createParcel(user.id);

      const res = await api()
        .get(`/api/v1/users/${user.id}/parcels`)
        .set("Authorization", bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("forbids accessing another user's parcels", async () => {
      const { user } = await createUser();
      const { token: otherToken } = await createUser();

      const res = await api()
        .get(`/api/v1/users/${user.id}/parcels`)
        .set("Authorization", bearer(otherToken));

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/parcels/track/:trackingCode", () => {
    it("publicly tracks a parcel without exposing the sender", async () => {
      const { user } = await createUser();
      const parcel = await createParcel(user.id);

      const res = await api().get(
        `/api/v1/parcels/track/${parcel.trackingCode}`,
      );

      expect(res.status).toBe(200);
      expect(res.body.data.trackingCode).toBe(parcel.trackingCode);
      expect(res.body.data.progress).toBeTypeOf("number");
      expect(res.body.data.sender).toBeUndefined();
    });

    it("returns 404 for an unknown tracking code", async () => {
      const res = await api().get("/api/v1/parcels/track/UNKNOWN123");
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Parcel not found");
    });
  });

  describe("PUT /api/v1/parcels/:parcelId/cancel", () => {
    it("lets the sender cancel", async () => {
      const { user, token } = await createUser();
      const parcel = await createParcel(user.id);

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/cancel`)
        .set("Authorization", bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("cancelled");
    });

    it("rejects cancelling a delivered parcel", async () => {
      const { user, token } = await createUser();
      const parcel = await createParcel(user.id, { status: "delivered" });

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/cancel`)
        .set("Authorization", bearer(token));

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Cannot cancel a delivered or returned parcel",
      );
    });

    it("forbids cancelling someone else's parcel", async () => {
      const { user } = await createUser();
      const { token: otherToken } = await createUser();
      const parcel = await createParcel(user.id);

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/cancel`)
        .set("Authorization", bearer(otherToken));

      expect(res.status).toBe(403);
      expect(res.body.message).toBe(
        "You are not authorized to cancel this parcel",
      );
    });
  });

  describe("PUT /api/v1/parcels/:parcelId/destination", () => {
    it("updates the destination", async () => {
      const { user, token } = await createUser();
      const parcel = await createParcel(user.id);

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/destination`)
        .set("Authorization", bearer(token))
        .send({
          locationTo: { address: "789 New St", city: "New City" },
        });

      expect(res.status).toBe(200);
      expect(res.body.data.locationTo.city).toBe("New City");
    });

    it("rejects updating a delivered parcel", async () => {
      const { user, token } = await createUser();
      const parcel = await createParcel(user.id, { status: "delivered" });

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/destination`)
        .set("Authorization", bearer(token))
        .send({ locationTo: { address: "x", city: "y" } });

      expect(res.status).toBe(400);
    });

    it("validates the destination payload", async () => {
      const { user, token } = await createUser();
      const parcel = await createParcel(user.id);

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/destination`)
        .set("Authorization", bearer(token))
        .send({ locationTo: { city: "Missing Address" } });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
    });
  });

  describe("PUT /api/v1/parcels/:parcelId/status (admin)", () => {
    it("lets an admin update status", async () => {
      const { user } = await createUser();
      const { token: adminToken } = await createAdmin();
      const parcel = await createParcel(user.id);

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/status`)
        .set("Authorization", bearer(adminToken))
        .send({ status: "in-transit" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("in-transit");
    });

    it("sets deliveryDate when marked delivered", async () => {
      const { user } = await createUser();
      const { token: adminToken } = await createAdmin();
      const parcel = await createParcel(user.id);

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/status`)
        .set("Authorization", bearer(adminToken))
        .send({ status: "delivered" });

      expect(res.body.data.status).toBe("delivered");
      expect(res.body.data.deliveryDate).toBeTypeOf("string");
    });

    it("can update paymentStatus", async () => {
      const { user } = await createUser();
      const { token: adminToken } = await createAdmin();
      const parcel = await createParcel(user.id);

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/status`)
        .set("Authorization", bearer(adminToken))
        .send({ paymentStatus: "paid" });

      expect(res.status).toBe(200);
      expect(res.body.data.paymentStatus).toBe("paid");
    });

    it("forbids regular users", async () => {
      const { user, token } = await createUser();
      const parcel = await createParcel(user.id);

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/status`)
        .set("Authorization", bearer(token))
        .send({ status: "delivered" });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Forbidden, Insufficient Permissions");
    });

    it("validates the status value", async () => {
      const { user } = await createUser();
      const { token: adminToken } = await createAdmin();
      const parcel = await createParcel(user.id);

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/status`)
        .set("Authorization", bearer(adminToken))
        .send({ status: "not-a-status" });

      expect(res.status).toBe(400);
      expect(
        res.body.errors.some((e: { path: (string | number)[] }) =>
          e.path.includes("status"),
        ),
      ).toBe(true);
    });
  });

  describe("PUT /api/v1/parcels/:parcelId/presentLocation (admin)", () => {
    it("updates location and moves pending to in-transit", async () => {
      const { user } = await createUser();
      const { token: adminToken } = await createAdmin();
      const parcel = await createParcel(user.id, { status: "pending" });

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/presentLocation`)
        .set("Authorization", bearer(adminToken))
        .send({ presentLocation: { address: "Hub", city: "Transit City" } });

      expect(res.status).toBe(200);
      expect(res.body.data.presentLocation.city).toBe("Transit City");
      expect(res.body.data.status).toBe("in-transit");
    });

    it("forbids regular users", async () => {
      const { user, token } = await createUser();
      const parcel = await createParcel(user.id);

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/presentLocation`)
        .set("Authorization", bearer(token))
        .send({ presentLocation: { address: "Hub", city: "Transit City" } });

      expect(res.status).toBe(403);
    });
  });

  describe("PUT /api/v1/parcels/:parcelId/assign (admin)", () => {
    it("assigns a courier and sets a future estimated delivery", async () => {
      const { user } = await createUser();
      const { token: adminToken } = await createAdmin();
      const { user: courier } = await createCourier();
      const parcel = await createParcel(user.id, { status: "pending" });

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/assign`)
        .set("Authorization", bearer(adminToken))
        .send({ courierId: courier.id });

      expect(res.status).toBe(200);
      expect(res.body.data.courierAssigned).toBe(courier.id);
      expect(res.body.data.status).toBe("processing");
      expect(new Date(res.body.data.estimatedDelivery).getTime()).toBeGreaterThan(
        Date.now(),
      );
    });

    it("estimates farther destinations as later", async () => {
      const { user } = await createUser();
      const { token: adminToken } = await createAdmin();
      const { user: courier } = await createCourier();

      const near = await createParcel(user.id, {
        parcelType: "document",
        locationFrom: { address: "a", city: "Same", country: "X" },
        locationTo: { address: "b", city: "Same", country: "X" },
      });
      const far = await createParcel(user.id, {
        parcelType: "package",
        locationFrom: { address: "a", city: "Here", country: "X" },
        locationTo: { address: "b", city: "There", country: "Y" },
      });

      const nearRes = await api()
        .put(`/api/v1/parcels/${near.id}/assign`)
        .set("Authorization", bearer(adminToken))
        .send({ courierId: courier.id });
      const farRes = await api()
        .put(`/api/v1/parcels/${far.id}/assign`)
        .set("Authorization", bearer(adminToken))
        .send({ courierId: courier.id });

      expect(
        new Date(farRes.body.data.estimatedDelivery).getTime(),
      ).toBeGreaterThan(new Date(nearRes.body.data.estimatedDelivery).getTime());
    });

    it("rejects assigning a non-courier", async () => {
      const { user } = await createUser();
      const { token: adminToken } = await createAdmin();
      const { user: notCourier } = await createUser();
      const parcel = await createParcel(user.id);

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/assign`)
        .set("Authorization", bearer(adminToken))
        .send({ courierId: notCourier.id });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Courier not found");
    });

    it("returns 400 for an invalid parcel id", async () => {
      const { token: adminToken } = await createAdmin();
      const { user: courier } = await createCourier();

      const res = await api()
        .put("/api/v1/parcels/invalidid/assign")
        .set("Authorization", bearer(adminToken))
        .send({ courierId: courier.id });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid ID format");
    });

    it("forbids regular users", async () => {
      const { user, token } = await createUser();
      const { user: courier } = await createCourier();
      const parcel = await createParcel(user.id);

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/assign`)
        .set("Authorization", bearer(token))
        .send({ courierId: courier.id });

      expect(res.status).toBe(403);
    });
  });

  describe("progress virtual", () => {
    it("increases with workflow status", async () => {
      const { user, token } = await createUser();
      const statuses = ["pending", "processing", "in-transit", "delivered"];
      const progresses: number[] = [];

      for (const status of statuses) {
        const parcel = await createParcel(user.id, { status });
        const res = await api()
          .get(`/api/v1/parcels/${parcel.id}`)
          .set("Authorization", bearer(token));
        progresses.push(res.body.data.progress);
      }

      expect(progresses[0]).toBe(0);
      expect(progresses[1]).toBeGreaterThan(progresses[0]);
      expect(progresses[2]).toBeGreaterThan(progresses[1]);
      expect(progresses[3]).toBe(100);
    });
  });

  describe("courier capabilities (RBAC)", () => {
    async function assignedParcel() {
      const { user } = await createUser();
      const { token: adminToken } = await createAdmin();
      const { user: courier, token: courierToken } = await createCourier();
      const parcel = await createParcel(user.id, { status: "pending" });
      await api()
        .put(`/api/v1/parcels/${parcel.id}/assign`)
        .set("Authorization", bearer(adminToken))
        .send({ courierId: courier.id });
      return { parcel, courier, courierToken };
    }

    it("lets an assigned courier update status", async () => {
      const { parcel, courierToken } = await assignedParcel();
      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/status`)
        .set("Authorization", bearer(courierToken))
        .send({ status: "in-transit" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("in-transit");
    });

    it("lets an assigned courier update present location", async () => {
      const { parcel, courierToken } = await assignedParcel();
      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/presentLocation`)
        .set("Authorization", bearer(courierToken))
        .send({ presentLocation: { address: "Hub", city: "Transit City" } });

      expect(res.status).toBe(200);
      expect(res.body.data.presentLocation.city).toBe("Transit City");
    });

    it("forbids a courier from updating a parcel not assigned to them", async () => {
      const { user } = await createUser();
      const { token: courierToken } = await createCourier();
      const parcel = await createParcel(user.id);

      const res = await api()
        .put(`/api/v1/parcels/${parcel.id}/status`)
        .set("Authorization", bearer(courierToken))
        .send({ status: "in-transit" });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("You are not authorized to update this parcel");
    });

    it("includes assigned parcels in the courier's list", async () => {
      const { parcel, courierToken } = await assignedParcel();
      const res = await api()
        .get("/api/v1/parcels")
        .set("Authorization", bearer(courierToken));

      expect(res.status).toBe(200);
      expect(res.body.data.some((p: { _id: string }) => p._id === parcel.id)).toBe(
        true,
      );
    });
  });
});
