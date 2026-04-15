/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ManifestApp } from "../app";
import type { ManifestConfig } from "../types";
import "../structural";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

const originalFetch = global.fetch;
const originalCredentials = navigator.credentials;
const originalPublicKeyCredential = window.PublicKeyCredential;

function installPasskeyMocks() {
  class MockPublicKeyCredential {}

  Object.defineProperty(window, "PublicKeyCredential", {
    writable: true,
    value: MockPublicKeyCredential,
  });

  Object.defineProperty(navigator, "credentials", {
    writable: true,
    value: {
      get: vi.fn(async () => ({
        id: "credential-1",
        rawId: Uint8Array.from([1, 2, 3]).buffer,
        type: "public-key",
        authenticatorAttachment: "platform",
        getClientExtensionResults: () => ({}),
        response: {
          clientDataJSON: Uint8Array.from([4, 5, 6]).buffer,
          authenticatorData: Uint8Array.from([7, 8, 9]).buffer,
          signature: Uint8Array.from([10, 11, 12]).buffer,
          userHandle: null,
        },
      })),
    },
  });
}

function buildAuthManifest(): ManifestConfig {
  return {
    app: {
      shell: "full-width",
      home: "/dashboard",
      title: "Snapshot Auth",
    },
    auth: {
      screens: [
        "login",
        "register",
        "forgot-password",
        "reset-password",
        "verify-email",
        "mfa",
        "sso-callback",
      ],
      branding: {
        title: "Snapshot Auth",
        description: "Built-in auth runtime",
      },
    },
    routes: [
      {
        id: "dashboard",
        path: "/dashboard",
        guard: {
          authenticated: true,
        },
        content: [{ type: "heading", text: "Dashboard" }],
      },
      {
        id: "reports",
        path: "/reports",
        guard: {
          authenticated: true,
        },
        content: [{ type: "heading", text: "Reports" }],
      },
    ],
  };
}

describe("Manifest auth fragments", () => {
  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(navigator, "credentials", {
      writable: true,
      value: originalCredentials,
    });
    Object.defineProperty(window, "PublicKeyCredential", {
      writable: true,
      value: originalPublicKeyCredential,
    });
    window.history.replaceState({}, "", "/");
    vi.restoreAllMocks();
  });

  it("renders the default login fragment and signs the user in", async () => {
    window.history.replaceState({}, "", "/login");

    let meRequestCount = 0;
    global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith("/auth/me")) {
        meRequestCount += 1;
        if (meRequestCount === 1) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ id: "1", email: "ada@example.com" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.endsWith("/auth/login")) {
        expect(init?.method).toBe("POST");
        return new Response(JSON.stringify({ token: "token-1", userId: "1" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    render(<ManifestApp manifest={buildAuthManifest()} apiUrl="http://localhost" />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Snapshot Auth" })).toBeDefined();
      expect(screen.getByText("Sign in to continue.")).toBeDefined();
    });

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i, { selector: "input" }), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeDefined();
    });
  });

  it("renders the forgot-password fragment and shows the success toast", async () => {
    window.history.replaceState({}, "", "/forgot-password");

    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/auth/me")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.endsWith("/auth/forgot-password")) {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    render(<ManifestApp manifest={buildAuthManifest()} apiUrl="http://localhost" />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Forgot password" })).toBeDefined();
    });

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "ada@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    await waitFor(() => {
      expect(
        screen.getByText(
          "If that email is registered, you will receive a reset link shortly.",
        ),
      ).toBeDefined();
    });
  });

  it("auto-verifies email from the query token", async () => {
    window.history.replaceState({}, "", "/verify-email?token=verify-123");

    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/auth/me")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.endsWith("/auth/verify-email")) {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    render(<ManifestApp manifest={buildAuthManifest()} apiUrl="http://localhost" />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Verify email" })).toBeDefined();
    });

    await waitFor(() => {
      expect(screen.getByText("Your email has been verified.")).toBeDefined();
    });
  });

  it("applies screenOptions to the default login fragment", async () => {
    window.history.replaceState({}, "", "/login");

    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/auth/me")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const manifest = buildAuthManifest();
    manifest.auth = {
      ...manifest.auth!,
      passkey: true,
      providers: {
        google: {
          type: "google",
          label: "Use Google Workspace",
          description: "Recommended for your team account",
        },
      },
      redirects: {
        afterLogin: "/reports",
      },
      screenOptions: {
        login: {
          title: "Welcome back",
          description: "Use your workspace account",
          submitLabel: "Continue",
          providers: [],
          passkey: false,
          fields: {
            email: {
              label: "Work email",
              placeholder: "me@workspace.com",
            },
            password: {
              label: "Secret phrase",
              placeholder: "Your secret phrase",
            },
          },
          links: [{ label: "Make an account", path: "/register" }],
        },
      },
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Welcome back" })).toBeDefined();
      expect(screen.getByText("Use your workspace account")).toBeDefined();
      expect(screen.getByRole("button", { name: "Continue" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Make an account" })).toBeDefined();
      expect(screen.queryByText("Use Google Workspace")).toBeNull();
      expect(screen.queryByRole("button", { name: "Sign in with passkey" })).toBeNull();
      expect(screen.getByLabelText(/Work email/i, { selector: "input" })).toBeDefined();
      expect(
        screen.getByLabelText(/Secret phrase/i, { selector: "input" }),
      ).toBeDefined();
    });
  });

  it("auto-redirects a provider when providerMode is auto", async () => {
    window.history.replaceState({}, "", "/register");

    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/auth/me")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const redirectListener = vi.fn();
    window.addEventListener(
      "snapshot:auth-provider-redirect",
      redirectListener as EventListener,
    );

    const manifest = buildAuthManifest();
    manifest.auth = {
      ...manifest.auth!,
      providers: {
        google: {
          type: "google",
          label: "Continue with Google Workspace",
          autoRedirect: true,
        },
      },
      screenOptions: {
        register: {
          providerMode: "auto",
          providers: ["google"],
          sections: ["providers", "form", "links"],
        },
      },
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);

    await waitFor(() => {
      expect(redirectListener).toHaveBeenCalledTimes(1);
    });

    const event = redirectListener.mock.calls[0]?.[0] as
      | CustomEvent<{ provider: string; url: string }>
      | undefined;
    expect(event?.detail.provider).toBe("google");
    expect(event?.detail.url).toBe("http://localhost/auth/google");

    window.removeEventListener(
      "snapshot:auth-provider-redirect",
      redirectListener as EventListener,
    );
  });

  it("runs a passkey flow and supports autoPrompt", async () => {
    window.history.replaceState({}, "", "/login");
    installPasskeyMocks();

    let meRequestCount = 0;
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/auth/me")) {
        meRequestCount += 1;
        if (meRequestCount === 1) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ id: "1", email: "ada@example.com" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.endsWith("/auth/passkey/login-options")) {
        return new Response(
          JSON.stringify({
            passkeyToken: "passkey-token",
            options: {
              challenge: "AQID",
              rpId: "localhost",
              userVerification: "preferred",
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (url.endsWith("/auth/passkey/login")) {
        return new Response(JSON.stringify({ token: "token-1", userId: "1" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const manifest = buildAuthManifest();
    manifest.auth = {
      ...manifest.auth!,
      redirects: {
        afterLogin: "/reports",
      },
      passkey: {
        enabled: true,
        autoPrompt: true,
      },
      screenOptions: {
        login: {
          sections: ["passkey", "form", "links"],
        },
      },
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);

    await waitFor(() => {
      expect(screen.getByText("Reports")).toBeDefined();
    });
  });

  it("returns to the original protected route after signing in", async () => {
    window.history.replaceState({}, "", "/reports");

    let meRequestCount = 0;
    global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith("/auth/me")) {
        meRequestCount += 1;
        if (meRequestCount === 1) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ id: "1", email: "ada@example.com" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.endsWith("/auth/login")) {
        expect(init?.method).toBe("POST");
        return new Response(JSON.stringify({ token: "token-1", userId: "1" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    render(<ManifestApp manifest={buildAuthManifest()} apiUrl="http://localhost" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toBeDefined();
    });

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i, { selector: "input" }), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Reports")).toBeDefined();
    });
  });

  it("routes MFA login challenges into the MFA fragment", async () => {
    window.history.replaceState({}, "", "/login");

    let meRequestCount = 0;
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/auth/me")) {
        meRequestCount += 1;
        if (meRequestCount === 1) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ id: "1", email: "ada@example.com" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.endsWith("/auth/login")) {
        return new Response(
          JSON.stringify({
            token: "",
            userId: "1",
            mfaRequired: true,
            mfaToken: "challenge-1",
            mfaMethods: ["emailOtp"],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (url.endsWith("/auth/mfa/verify")) {
        return new Response(JSON.stringify({ token: "token-1", userId: "1" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    render(<ManifestApp manifest={buildAuthManifest()} apiUrl="http://localhost" />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toBeDefined();
    });

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i, { selector: "input" }), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(
        screen.getByLabelText(/Verification code/i, { selector: "input" }),
      ).toBeDefined();
    });

    fireEvent.change(
      screen.getByLabelText(/Verification code/i, { selector: "input" }),
      {
      target: { value: "123456" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeDefined();
    });
  });
});
