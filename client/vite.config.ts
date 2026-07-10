import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// In dev, requests to /api are proxied to the backend so the SPA and API share
// an origin (no CORS). In production set VITE_API_URL to the API base instead.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET ?? "http://localhost:4500",
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split large, rarely-changing vendors into their own cacheable chunks.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@mui/x-data-grid")) return "mui-datagrid";
          if (id.includes("@mui") || id.includes("@emotion")) return "mui";
          // Keep react-dom's own runtime deps bundled with react/react-dom.
          // Splitting them into "vendor" creates a circular chunk dependency
          // (vendor needs react, react needs scheduler from vendor), which
          // can trigger "Cannot access '<var>' before initialization" at
          // runtime since Rollup can't guarantee a safe load order for
          // mutually-dependent chunks.
          if (
            id.includes("react") ||
            id.includes("/scheduler/") ||
            id.includes("/use-sync-external-store/") ||
            id.includes("/prop-types/") ||
            id.includes("/object-assign/") ||
            id.includes("@tanstack") ||
            id.includes("notistack") ||
            id.includes("@hookform")
          )
            return "react";
          return "vendor";
        },
      },
    },
  },
});
