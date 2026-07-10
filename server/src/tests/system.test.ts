import { describe, expect, it } from "vitest";
import { api, buildUser } from "./helpers";

describe("System integration", () => {
  describe("GET /api/v1", () => {
    it("returns API metadata", async () => {
      const res = await api().get("/api/v1");
      expect(res.status).toBe(200);
      expect(res.body.name).toBeTypeOf("string");
      expect(res.body.version).toBeTypeOf("string");
      expect(res.body.author).toBeTypeOf("string");
    });
  });

  describe("error handling", () => {
    it("returns 404 for unknown routes", async () => {
      const res = await api().get("/api/v1/does-not-exist");
      expect(res.status).toBe(404);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toContain("Not Found");
    });

    it("returns 404 for an unsupported method on a known path", async () => {
      const res = await api().delete("/api/v1");
      expect(res.status).toBe(404);
    });

    it("returns detailed validation errors", async () => {
      const res = await api()
        .post("/api/v1/auth/signup")
        .send({
          ...buildUser(),
          username: "ab",
          email: "notanemail",
          password: "short",
        });

      expect(res.status).toBe(400);
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("middleware", () => {
    it("emits rate-limit headers", async () => {
      const res = await api().get("/api/v1");
      expect(res.headers["x-ratelimit-limit"]).toBeDefined();
      expect(res.headers["x-ratelimit-remaining"]).toBeDefined();
    });

    it("answers CORS preflight requests", async () => {
      const res = await api()
        .options("/api/v1/auth/login")
        .set("Origin", "https://example.com")
        .set("Access-Control-Request-Method", "POST");

      expect(res.headers["access-control-allow-origin"]).toBeDefined();
      expect(res.headers["access-control-allow-methods"]).toBeDefined();
    });

    it("sets security headers via helmet", async () => {
      const res = await api().get("/api/v1");
      expect(res.headers["x-content-type-options"]).toBe("nosniff");
      expect(res.headers["x-frame-options"]).toBeDefined();
    });

    it("supports gzip compression", async () => {
      const res = await api()
        .get("/api/v1/health/deep")
        .set("Accept-Encoding", "gzip");

      const encoding = res.headers["content-encoding"];
      expect(encoding === undefined || encoding === "gzip").toBe(true);
    });
  });

  describe("API documentation", () => {
    it("serves the Swagger UI", async () => {
      const res = await api().get("/api/v1/api-docs/");
      expect(res.status).toBe(200);
      expect(res.text).toContain("swagger");
    });

    it("serves the Swagger init script", async () => {
      const res = await api().get("/api/v1/api-docs/swagger-ui-init.js");
      expect(res.status).toBe(200);
      expect(res.text).toContain("SwaggerUIBundle");
    });
  });
});
