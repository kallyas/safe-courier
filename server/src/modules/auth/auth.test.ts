import { describe, expect, it } from "vitest";
import { api, bearer, buildUser, createUser } from "../../tests/helpers";
import { generateAccessToken } from "./auth.service";
import { User } from "../users/user.model";

describe("Authentication", () => {
  describe("POST /api/v1/auth/signup", () => {
    it("registers a new user and returns a token", async () => {
      const payload = buildUser();
      const res = await api().post("/api/v1/auth/signup").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        status: "success",
        message: "User created successfully",
      });
      expect(res.body.token).toBeTypeOf("string");

      const user = await User.findOne({ username: payload.username });
      expect(user).not.toBeNull();
      expect(user?.email).toBe(payload.email);
    });

    it("rejects missing required fields", async () => {
      const res = await api()
        .post("/api/v1/auth/signup")
        .send({ username: "abc", email: "a@b.com" });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toBe("Validation error");
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it("rejects a weak password", async () => {
      const res = await api()
        .post("/api/v1/auth/signup")
        .send(buildUser({ password: "weak" }));

      expect(res.status).toBe(400);
      expect(
        res.body.errors.some((e: { message: string }) =>
          e.message.includes("Password"),
        ),
      ).toBe(true);
    });

    it("rejects a duplicate username", async () => {
      const payload = buildUser();
      await api().post("/api/v1/auth/signup").send(payload);

      const res = await api()
        .post("/api/v1/auth/signup")
        .send({ ...buildUser(), username: payload.username });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Username already taken");
    });

    it("rejects a duplicate email", async () => {
      const payload = buildUser();
      await api().post("/api/v1/auth/signup").send(payload);

      const res = await api()
        .post("/api/v1/auth/signup")
        .send({ ...buildUser(), email: payload.email });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email already exists");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("logs in with username", async () => {
      const { raw } = await registerViaApi();
      const res = await api()
        .post("/api/v1/auth/login")
        .send({ username: raw.username, password: raw.password });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged in successfully");
      expect(res.body.token).toBeTypeOf("string");
    });

    it("logs in with email as the identifier", async () => {
      const { raw } = await registerViaApi();
      const res = await api()
        .post("/api/v1/auth/login")
        .send({ username: raw.email, password: raw.password });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeTypeOf("string");
    });

    it("rejects an incorrect password", async () => {
      const { raw } = await registerViaApi();
      const res = await api()
        .post("/api/v1/auth/login")
        .send({ username: raw.username, password: "WrongPass123" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid login credentials");
    });

    it("rejects a non-existent user", async () => {
      const res = await api()
        .post("/api/v1/auth/login")
        .send({ username: "nobody", password: "Password123" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid login credentials");
    });
  });

  describe("POST /api/v1/verify", () => {
    it("verifies a valid token and returns the payload", async () => {
      const { token } = await createUser();
      const res = await api()
        .post("/api/v1/verify")
        .set("Authorization", bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Token is valid");
      expect(res.body.user).toMatchObject({ role: "user" });
    });

    it("rejects a request with no token", async () => {
      const res = await api().post("/api/v1/verify");
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorized, Missing Access Token");
    });

    it("rejects an invalid Authorization format", async () => {
      const res = await api()
        .post("/api/v1/verify")
        .set("Authorization", "InvalidFormat");
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorized, Invalid Token Format");
    });

    it("rejects a malformed token", async () => {
      const res = await api()
        .post("/api/v1/verify")
        .set("Authorization", bearer("not-a-real-token"));
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorized, Invalid Token");
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("logs out an authenticated user", async () => {
      const { token } = await createUser();
      const res = await api()
        .post("/api/v1/auth/logout")
        .set("Authorization", bearer(token));

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out successfully");
    });

    it("rejects logout without a token", async () => {
      const res = await api().post("/api/v1/auth/logout");
      expect(res.status).toBe(401);
    });
  });

  it("generateAccessToken embeds role and admin claims", async () => {
    const admin = await User.create(buildUser({ role: "admin", isAdmin: true }));
    const token = generateAccessToken(admin);
    expect(token.split(".")).toHaveLength(3);
  });
});

async function registerViaApi() {
  const raw = buildUser();
  await api().post("/api/v1/auth/signup").send(raw);
  return { raw };
}
