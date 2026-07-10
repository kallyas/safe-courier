import { describe, expect, it } from "vitest";
import {
  api,
  bearer,
  createAdmin,
  createUser,
} from "../../tests/helpers";
import { User } from "./user.model";

describe("User management", () => {
  describe("GET /api/v1/user/:id", () => {
    it("returns a user by id without sensitive fields", async () => {
      const { user, token } = await createUser();
      const res = await api()
        .get(`/api/v1/user/${user.id}`)
        .set("Authorization", bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe(user.username);
      expect(res.body.data.password).toBeUndefined();
      expect(res.body.data.refreshToken).toBeUndefined();
    });

    it("lets an admin fetch any user", async () => {
      const { user } = await createUser();
      const { token: adminToken } = await createAdmin();
      const res = await api()
        .get(`/api/v1/user/${user.id}`)
        .set("Authorization", bearer(adminToken));

      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe(user.username);
    });

    it("returns 404 for a non-existent user", async () => {
      const { token } = await createUser();
      const res = await api()
        .get("/api/v1/user/60c72c3f9b1d8c001c8f0fdd")
        .set("Authorization", bearer(token));

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("User not found");
    });

    it("returns 400 for an invalid id", async () => {
      const { token } = await createUser();
      const res = await api()
        .get("/api/v1/user/not-an-id")
        .set("Authorization", bearer(token));

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid user ID format");
    });

    it("requires authentication", async () => {
      const { user } = await createUser();
      const res = await api().get(`/api/v1/user/${user.id}`);
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/v1/user/:id", () => {
    it("lets a user update their own profile", async () => {
      const { user, token } = await createUser();
      const res = await api()
        .put(`/api/v1/user/${user.id}`)
        .set("Authorization", bearer(token))
        .send({ firstName: "Updated", lastName: "Name" });

      expect(res.status).toBe(200);
      expect(res.body.data.firstName).toBe("Updated");
      expect(res.body.data.lastName).toBe("Name");
    });

    it("rejects an invalid email", async () => {
      const { user, token } = await createUser();
      const res = await api()
        .put(`/api/v1/user/${user.id}`)
        .set("Authorization", bearer(token))
        .send({ email: "not-an-email" });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
    });

    it("never updates the password through this endpoint", async () => {
      const { user, token, password } = await createUser();
      const res = await api()
        .put(`/api/v1/user/${user.id}`)
        .set("Authorization", bearer(token))
        .send({ password: "Hacked123" });

      expect(res.status).toBe(200);
      const fresh = await User.findById(user.id);
      expect(await fresh!.comparePassword(password)).toBe(true);
    });

    it("forbids updating another user's profile", async () => {
      const { user } = await createUser();
      const { token: otherToken } = await createUser();
      const res = await api()
        .put(`/api/v1/user/${user.id}`)
        .set("Authorization", bearer(otherToken))
        .send({ firstName: "Nope" });

      expect(res.status).toBe(403);
    });
  });

  describe("PUT /api/v1/user/:id/password", () => {
    it("lets a user change their own password", async () => {
      const { user, token, password } = await createUser();
      const res = await api()
        .put(`/api/v1/user/${user.id}/password`)
        .set("Authorization", bearer(token))
        .send({
          currentPassword: password,
          newPassword: "NewPass123",
          confirmPassword: "NewPass123",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Password changed successfully");

      const fresh = await User.findById(user.id);
      expect(await fresh!.comparePassword("NewPass123")).toBe(true);
    });

    it("rejects an incorrect current password", async () => {
      const { user, token } = await createUser();
      const res = await api()
        .put(`/api/v1/user/${user.id}/password`)
        .set("Authorization", bearer(token))
        .send({
          currentPassword: "WrongPass123",
          newPassword: "NewPass123",
          confirmPassword: "NewPass123",
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Current password is incorrect");
    });

    it("rejects mismatched passwords", async () => {
      const { user, token, password } = await createUser();
      const res = await api()
        .put(`/api/v1/user/${user.id}/password`)
        .set("Authorization", bearer(token))
        .send({
          currentPassword: password,
          newPassword: "NewPass123",
          confirmPassword: "Different123",
        });

      expect(res.status).toBe(400);
      expect(
        res.body.errors.some((e: { message: string }) =>
          e.message.includes("match"),
        ),
      ).toBe(true);
    });
  });

  describe("GET /api/v1/profile", () => {
    it("returns the current user's profile", async () => {
      const { user, token } = await createUser();
      const res = await api()
        .get("/api/v1/profile")
        .set("Authorization", bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(user.id);
    });
  });

  describe("GET /api/v1/users", () => {
    it("lets an admin list users", async () => {
      await createUser();
      const { token: adminToken } = await createAdmin();
      const res = await api()
        .get("/api/v1/users")
        .set("Authorization", bearer(adminToken));

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it("paginates results", async () => {
      const { token: adminToken } = await createAdmin();
      for (let i = 0; i < 5; i += 1) await createUser();

      const res = await api()
        .get("/api/v1/users?limit=3&page=1")
        .set("Authorization", bearer(adminToken));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.pagination).toMatchObject({ page: 1, limit: 3 });
      expect(res.body.pagination.total).toBeGreaterThanOrEqual(6);
    });

    it("filters by role", async () => {
      const { token: adminToken } = await createAdmin();
      await createUser();
      const res = await api()
        .get("/api/v1/users?role=admin")
        .set("Authorization", bearer(adminToken));

      expect(res.status).toBe(200);
      expect(
        res.body.data.every((u: { role: string }) => u.role === "admin"),
      ).toBe(true);
    });

    it("denies access to non-admins", async () => {
      const { token } = await createUser();
      const res = await api()
        .get("/api/v1/users")
        .set("Authorization", bearer(token));
      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/v1/user/:id", () => {
    it("lets an admin delete any user", async () => {
      const { user } = await createUser();
      const { token: adminToken } = await createAdmin();
      const res = await api()
        .delete(`/api/v1/user/${user.id}`)
        .set("Authorization", bearer(adminToken));

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User deleted successfully");
      expect(await User.findById(user.id)).toBeNull();
    });

    it("lets a user delete their own account", async () => {
      const { user, token } = await createUser();
      const res = await api()
        .delete(`/api/v1/user/${user.id}`)
        .set("Authorization", bearer(token));

      expect(res.status).toBe(200);
      expect(await User.findById(user.id)).toBeNull();
    });

    it("forbids deleting another user's account", async () => {
      const { user } = await createUser();
      const { token: otherToken } = await createUser();
      const res = await api()
        .delete(`/api/v1/user/${user.id}`)
        .set("Authorization", bearer(otherToken));

      expect(res.status).toBe(403);
      expect(await User.findById(user.id)).not.toBeNull();
    });
  });
});
