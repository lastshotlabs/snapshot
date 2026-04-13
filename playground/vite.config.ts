import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@lastshotlabs/snapshot/ui": path.resolve(__dirname, "../src/ui.ts"),
      "@lastshotlabs/snapshot": path.resolve(__dirname, "../src/index.ts"),
    },
  },
  build: {
    // The showcase intentionally pulls a broad cross-section of Snapshot surfaces
    // into one smoke build, so the default warning threshold is too low to be useful.
    chunkSizeWarningLimit: 3500,
  },
});
