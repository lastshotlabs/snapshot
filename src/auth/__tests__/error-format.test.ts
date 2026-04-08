import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatAuthError, createAuthErrorFormatter } from "../error-format";
import type { AuthErrorContext, AuthErrorConfig } from "../../types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeError(message: string) {
  const err = new Error(message) as any;
  err.status = 400;
  return err;
}

// Stub window.location for localhost detection
function stubHostname(hostname: string) {
  Object.defineProperty(window, "location", {
    value: { hostname },
    writable: true,
    configurable: true,
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("formatAuthError", () => {
  beforeEach(() => {
    stubHostname("app.example.com"); // non-localhost by default
  });

  it("returns default safe message per context on non-localhost", () => {
    const err = makeError("email not found");
    expect(formatAuthError(err, "login")).toBe("Invalid email or password.");
    expect(formatAuthError(err, "register")).toBe(
      "Unable to create account. Please try again.",
    );
    expect(formatAuthError(err, "forgot-password")).toBe(
      "If that email is registered, you'll receive a password reset link shortly.",
    );
    expect(formatAuthError(err, "reset-password")).toBe(
      "Unable to reset password. The link may have expired.",
    );
    expect(formatAuthError(err, "verify-email")).toBe(
      "Unable to verify email. The link may have expired or already been used.",
    );
  });

  it("returns raw error message when verbose: true", () => {
    const err = makeError("email not found");
    const config: AuthErrorConfig = { verbose: true };
    expect(formatAuthError(err, "login", config)).toBe("email not found");
  });

  it("auto-enables verbose on localhost", () => {
    stubHostname("localhost");
    const err = makeError("email not found");
    expect(formatAuthError(err, "login")).toBe("email not found");
  });

  it("custom messages override defaults", () => {
    const err = makeError("something went wrong");
    const config: AuthErrorConfig = {
      messages: { login: "Wrong credentials, try again" },
    };
    expect(formatAuthError(err, "login", config)).toBe(
      "Wrong credentials, try again",
    );
    // Other contexts still use defaults
    expect(formatAuthError(err, "register", config)).toBe(
      "Unable to create account. Please try again.",
    );
  });

  it("custom format function takes priority over everything", () => {
    const err = makeError("email not found");
    const config: AuthErrorConfig = {
      verbose: true,
      format: (_err, ctx) => `Custom: ${ctx}`,
    };
    expect(formatAuthError(err, "login", config)).toBe("Custom: login");
  });
});

describe("createAuthErrorFormatter", () => {
  it("returns a bound formatter that uses provided config", () => {
    stubHostname("app.example.com");
    const formatter = createAuthErrorFormatter({ verbose: true });
    const err = makeError("raw error");
    expect(formatter(err, "login")).toBe("raw error");
  });
});
