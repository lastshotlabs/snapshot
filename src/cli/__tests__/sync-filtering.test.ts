import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const silentLogger = {
  info: () => {},
  success: () => {},
  warn: () => {},
  error: () => {},
};

const fixtureSchema = path.resolve(__dirname, "fixtures/multi-tag-schema.json");

describe("runSync with include/exclude filtering", () => {
  it("generates only included paths", async () => {
    const { runSync } = await import("../sync");
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "snapshot-sync-filter-"));

    try {
      await runSync({
        filePath: fixtureSchema,
        cwd: tmpDir,
        include: ["/auth/**", "/users/**"],
        logger: silentLogger,
      });

      const apiDir = path.join(tmpDir, "src/api");
      const hooksDir = path.join(tmpDir, "src/hooks/api");
      const apiFiles = await fs.readdir(apiDir);
      const hooksFiles = await fs.readdir(hooksDir);

      // Should have auth and users tags, but NOT admin or internal
      expect(apiFiles).toContain("auth.ts");
      expect(apiFiles).toContain("users.ts");
      expect(apiFiles).not.toContain("admin.ts");
      expect(apiFiles).not.toContain("internal.ts");

      expect(hooksFiles).toContain("auth.ts");
      expect(hooksFiles).toContain("users.ts");
      expect(hooksFiles).not.toContain("admin.ts");
      expect(hooksFiles).not.toContain("internal.ts");

      // Verify auth file contains login and register
      const authApi = await fs.readFile(path.join(apiDir, "auth.ts"), "utf8");
      expect(authApi).toContain("login");
      expect(authApi).toContain("register");

      // Verify users file contains user operations
      const usersApi = await fs.readFile(path.join(apiDir, "users.ts"), "utf8");
      expect(usersApi).toContain("listUsers");
      expect(usersApi).toContain("getUser");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("excludes specified paths", async () => {
    const { runSync } = await import("../sync");
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "snapshot-sync-exclude-"));

    try {
      await runSync({
        filePath: fixtureSchema,
        cwd: tmpDir,
        exclude: ["/admin/**", "/internal/**"],
        logger: silentLogger,
      });

      const apiDir = path.join(tmpDir, "src/api");
      const apiFiles = await fs.readdir(apiDir);

      expect(apiFiles).toContain("auth.ts");
      expect(apiFiles).toContain("users.ts");
      expect(apiFiles).not.toContain("admin.ts");
      expect(apiFiles).not.toContain("internal.ts");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("generates all files when no filters specified", async () => {
    const { runSync } = await import("../sync");
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "snapshot-sync-nofilter-"));

    try {
      await runSync({
        filePath: fixtureSchema,
        cwd: tmpDir,
        logger: silentLogger,
      });

      const apiDir = path.join(tmpDir, "src/api");
      const apiFiles = await fs.readdir(apiDir);

      expect(apiFiles).toContain("auth.ts");
      expect(apiFiles).toContain("users.ts");
      expect(apiFiles).toContain("admin.ts");
      expect(apiFiles).toContain("internal.ts");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("supports per-backend include/exclude via config", async () => {
    const { runSync } = await import("../sync");
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "snapshot-sync-backend-"));

    // Write a snapshot.config.json with per-backend filtering
    await fs.writeFile(
      path.join(tmpDir, "snapshot.config.json"),
      JSON.stringify({
        backends: [
          {
            name: "public",
            filePath: fixtureSchema,
            include: ["/auth/**", "/users/**"],
          },
          {
            name: "admin",
            filePath: fixtureSchema,
            include: ["/admin/**"],
          },
        ],
      }),
    );

    try {
      await runSync({
        cwd: tmpDir,
        logger: silentLogger,
      });

      // Public backend should have auth + users
      const publicApiDir = path.join(tmpDir, "src/api/public");
      const publicFiles = await fs.readdir(publicApiDir);
      expect(publicFiles).toContain("auth.ts");
      expect(publicFiles).toContain("users.ts");
      expect(publicFiles).not.toContain("admin.ts");

      // Admin backend should have admin only
      const adminApiDir = path.join(tmpDir, "src/api/admin");
      const adminFiles = await fs.readdir(adminApiDir);
      expect(adminFiles).toContain("admin.ts");
      expect(adminFiles).not.toContain("auth.ts");
      expect(adminFiles).not.toContain("users.ts");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
