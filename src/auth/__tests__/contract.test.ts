import { describe, it, expect } from "vitest";
import { defaultContract, mergeContract } from "../contract";

describe("defaultContract", () => {
  it("returns all expected paths", () => {
    const c = defaultContract("https://api.example.com");
    expect(c.endpoints.me).toBe("/auth/me");
    expect(c.endpoints.login).toBe("/auth/login");
    expect(c.endpoints.logout).toBe("/auth/logout");
    expect(c.endpoints.refresh).toBe("/auth/refresh");
    expect(c.endpoints.mfaVerify).toBe("/auth/mfa/verify");
    expect(c.endpoints.passkeyLogin).toBe("/auth/passkey/login");
    expect(c.headers.userToken).toBe("x-user-token");
    expect(c.headers.csrf).toBe("x-csrf-token");
    expect(c.csrfCookieName).toBe("csrf_token");
  });

  it("sessionRevoke generates correct path", () => {
    const c = defaultContract("https://api.example.com");
    expect(c.sessionRevoke("abc-123")).toBe("/auth/sessions/abc-123");
  });

  it("oauthUrl uses full apiUrl", () => {
    const c = defaultContract("https://api.example.com");
    expect(c.oauthUrl("google")).toBe("https://api.example.com/auth/google");
  });

  it("strips trailing slash from apiUrl", () => {
    const c = defaultContract("https://api.example.com/");
    expect(c.oauthUrl("github")).toBe("https://api.example.com/auth/github");
  });
});

describe("mergeContract", () => {
  it("with no overrides equals default", () => {
    const def = defaultContract("https://api.example.com");
    const merged = mergeContract("https://api.example.com");
    expect(merged.endpoints.login).toBe(def.endpoints.login);
    expect(merged.headers.userToken).toBe(def.headers.userToken);
  });

  it("partial endpoint override changes only that endpoint", () => {
    const merged = mergeContract("https://api.example.com", {
      endpoints: { login: "/v2/login" },
    });
    expect(merged.endpoints.login).toBe("/v2/login");
    expect(merged.endpoints.logout).toBe("/auth/logout"); // untouched
    expect(merged.endpoints.me).toBe("/auth/me"); // untouched
  });

  it("header and cookie name overrides merge correctly", () => {
    const merged = mergeContract("https://api.example.com", {
      headers: { userToken: "x-custom-token" },
      csrfCookieName: "my_csrf",
    });
    expect(merged.headers.userToken).toBe("x-custom-token");
    expect(merged.headers.csrf).toBe("x-csrf-token"); // untouched
    expect(merged.csrfCookieName).toBe("my_csrf");
  });

  it("function overrides are used when provided", () => {
    const customSessionRevoke = (id: string) => `/v2/sessions/${id}`;
    const merged = mergeContract("https://api.example.com", {
      sessionRevoke: customSessionRevoke,
    });
    expect(merged.sessionRevoke("xyz")).toBe("/v2/sessions/xyz");
    // Other functions unchanged
    expect(merged.webauthnRemoveCredential("cred-1")).toBe(
      "/auth/mfa/webauthn/credentials/cred-1",
    );
  });
});
