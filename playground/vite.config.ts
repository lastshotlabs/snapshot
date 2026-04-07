import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@lastshotlabs/snapshot/ui": path.resolve(__dirname, "../src/ui.ts"),
      "@lastshotlabs/snapshot": path.resolve(__dirname, "../src/index.ts"),
    },
  },
});
