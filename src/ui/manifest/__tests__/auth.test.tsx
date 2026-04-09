/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ManifestApp } from "../app";
import type { ManifestConfig } from "../types";
import "../structural";

vi.hoisted(() => {
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
});

const originalFetch = global.fetch;

function buildAuthManifest(): ManifestConfig {
  return {
    app: {
      home: "/dashboard",
    },
    auth: {
      screens: ["login", "register", "forgot-password", "verify-email", "mfa"],
      providers: ["google"],
      branding: {
        title: "Snapshot Auth",
        description: "Built-in auth runtime",
      },
    },
    routes: [
      {
        id: "login",
        path: "/login",
        content: [{ type: "heading", text: "placeholder login" }],
      },
      {
        id: "register",
        path: "/register",
        content: [{ type: "heading", text: "placeholder register" }],
      },
      {
        id: "forgot-password",
        path: "/forgot-password",
        content: [{ type: "heading", text: "placeholder forgot" }],
      },
      {
        id: "verify-email",
        path: "/verify-email",
        content: [{ type: "heading", text: "placeholder verify" }],
      },
      {
        id: "mfa",
        path: "/mfa",
        content: [{ type: "heading", text: "placeholder mfa" }],
      },
      {
        id: "dashboard",
        path: "/dashboard",
        guard: {
          authenticated: true,
        },
        content: [{ type: "heading", text: "Dashboard" }],
      },
    ],
  };
}

describe("Manifest auth runtime", () => {
  afterEach(() => {
    global.fetch = originalFetch;
    window.history.replaceState({}, "", "/");
    vi.restoreAllMocks();
  });

  it("renders the built-in login screen and signs the user in", async () => {
    window.history.replaceState({}, "", "/login");

    let meRequestCount = 0;
    global.fetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.endsWith("/auth/me")) {
          meRequestCount += 1;
          if (meRequestCount === 1) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(
            JSON.stringify({ id: "1", email: "ada@example.com" }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        if (url.endsWith("/auth/login")) {
          expect(init?.method).toBe("POST");
          return new Response(
            JSON.stringify({ token: "token-1", userId: "1" }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    ) as typeof fetch;

    render(
      <ManifestApp manifest={buildAuthManifest()} apiUrl="http://localhost" />,
    );

    expect(screen.getByText("Snapshot Auth")).toBeDefined();
    expect(screen.getByText("Built-in auth runtime")).toBeDefined();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeDefined();
    });
  });

  it("renders the built-in forgot-password screen and shows the server message", async () => {
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
        return new Response(JSON.stringify({ message: "Reset link sent." }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    render(
      <ManifestApp manifest={buildAuthManifest()} apiUrl="http://localhost" />,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

    await waitFor(() => {
      expect(screen.getByText("Reset link sent.")).toBeDefined();
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
        return new Response(JSON.stringify({ message: "Email verified." }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    render(
      <ManifestApp manifest={buildAuthManifest()} apiUrl="http://localhost" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Email verified.")).toBeDefined();
    });
  });

  it("routes MFA login challenges into the built-in MFA screen", async () => {
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

        return new Response(
          JSON.stringify({ id: "1", email: "ada@example.com" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
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

    render(
      <ManifestApp manifest={buildAuthManifest()} apiUrl="http://localhost" />,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Verification code")).toBeDefined();
    });

    fireEvent.change(screen.getByLabelText("Verification code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeDefined();
    });
  });
});
