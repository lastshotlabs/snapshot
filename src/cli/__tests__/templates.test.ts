import { describe, it, expect, vi, beforeEach } from "vitest";

// ── auth-passkey-manage ────────────────────────────────────────────────────────

import { generatePasskeyManagePageComponent } from "../templates/pages/auth-passkey-manage";

describe("auth-passkey-manage", () => {
  it("uses credentials.credentials (not credentials.data)", () => {
    const output = generatePasskeyManagePageComponent();
    expect(output).toContain("credentials.credentials");
    expect(output).not.toContain("credentials.data");
  });

  it("calls remove.mutate with a string credentialId, not an object", () => {
    const output = generatePasskeyManagePageComponent();
    expect(output).toContain("remove.mutate(cred.credentialId)");
    expect(output).not.toContain("remove.mutate({ credentialId");
  });
});

// ── auth-mfa-verify ────────────────────────────────────────────────────────────

import { generateMfaVerifyPageComponent } from "../templates/pages/auth-mfa-verify";
import type { ScaffoldConfig } from "../types";

describe("auth-mfa-verify", () => {
  const config: ScaffoldConfig = {
    projectName: "test",
    packageName: "test",
    mfaPages: true,
    authPages: true,
    securityProfile: "hardened",
    layout: "minimal",
    theme: "default",
    passkeyPages: false,
    webSocket: false,
    communityPages: false,
    sse: false,
    mailPlugin: false,
    gitInit: false,
    components: [],
    dir: "/tmp/test",
  };

  it("checks for emailOtp (not bare email)", () => {
    const output = generateMfaVerifyPageComponent(config);
    expect(output).toMatch(/includes\('emailOtp'\)/);
  });
});

// ── index-html ─────────────────────────────────────────────────────────────────

import { generateIndexHtml } from "../templates/index-html";

describe("index-html", () => {
  const baseConfig: ScaffoldConfig = {
    projectName: "Test App",
    packageName: "test-app",
    theme: "dark",
    securityProfile: "hardened",
    layout: "minimal",
    authPages: false,
    mfaPages: false,
    passkeyPages: false,
    components: [],
    webSocket: false,
    communityPages: false,
    sse: false,
    mailPlugin: false,
    gitInit: false,
    dir: "/tmp/test",
  };

  it("contains 'snapshot-theme' as the localStorage key", () => {
    const output = generateIndexHtml(baseConfig);
    expect(output).toContain("snapshot-theme");
  });

  it("does NOT use bare 'theme' as the localStorage key (regression guard)", () => {
    const output = generateIndexHtml(baseConfig);
    // Must not reference a bare 'theme' key — should always be 'snapshot-theme'
    expect(output).not.toMatch(/getItem\('theme'\)/);
  });
});

// ── sidebar nav ───────────────────────────────────────────────────────────────

import {
  generateSidebarNav,
  generateRootLayoutSidebar,
} from "../templates/layouts/sidebar";

describe("sidebar nav", () => {
  it("does NOT contain '/settings'", () => {
    const output = generateSidebarNav();
    expect(output).not.toContain("/settings");
  });

  it("contains '/' (Dashboard still present)", () => {
    const output = generateSidebarNav();
    expect(output).toContain("'/'");
  });
});

describe("sidebar root layout", () => {
  it("contains sidebarOpen && conditional overlay", () => {
    const output = generateRootLayoutSidebar();
    expect(output).toContain("sidebarOpen &&");
  });

  it("destructures both [sidebarOpen, setSidebarOpen] from useAtom", () => {
    const output = generateRootLayoutSidebar();
    expect(output).toContain("[sidebarOpen, setSidebarOpen]");
  });
});

// ── scaffold writes favicon ───────────────────────────────────────────────────

describe("scaffold favicon", () => {
  it("writes public/vite.svg", async () => {
    vi.resetModules();
    const writtenPaths: string[] = [];

    vi.mock("node:fs/promises", () => ({
      default: {
        mkdir: vi.fn().mockResolvedValue(undefined),
        writeFile: vi.fn().mockImplementation((p: string) => {
          writtenPaths.push(String(p));
          return Promise.resolve();
        }),
        readdir: vi.fn().mockResolvedValue([]),
        readFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
        access: vi.fn().mockRejectedValue(new Error("ENOENT")),
      },
      mkdir: vi.fn().mockResolvedValue(undefined),
      writeFile: vi.fn().mockImplementation((p: string) => {
        writtenPaths.push(String(p));
        return Promise.resolve();
      }),
      readdir: vi.fn().mockResolvedValue([]),
      readFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
      access: vi.fn().mockRejectedValue(new Error("ENOENT")),
    }));

    vi.mock("../utils", () => ({
      exec: vi.fn(),
    }));

    vi.mock("@clack/prompts", () => ({
      spinner: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
      log: { warn: vi.fn() },
    }));

    const { scaffold } = await import("../scaffold");

    const config: ScaffoldConfig = {
      dir: "/tmp/test-scaffold",
      projectName: "test",
      packageName: "test",
      layout: "minimal",
      theme: "default",
      authPages: false,
      mfaPages: false,
      passkeyPages: false,
      webSocket: false,
      communityPages: false,
      sse: false,
      mailPlugin: false,
      securityProfile: "hardened",
      gitInit: false,
      components: [],
    };

    await scaffold(config);

    expect(
      writtenPaths.some((p) =>
        p.replace(/\\/g, "/").includes("public/vite.svg"),
      ),
    ).toBe(true);
  });
});
