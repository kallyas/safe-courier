import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/**/*.test.ts"],
    // The suites share a single in-memory MongoDB instance per worker and
    // clean state between tests, so run files serially to avoid contention.
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 30_000,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/tests/**", "src/**/*.test.ts", "src/config/swagger.ts"],
    },
  },
});
