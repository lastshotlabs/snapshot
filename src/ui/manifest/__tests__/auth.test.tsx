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
      home: "/dashboard",
    },
    auth: {
      screens: [
        "login",
        "register",
        "forgot-password",
        "reset-password",
        "verify-email",
        "mfa",
      ],
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
        id: "reset-password",
        path: "/reset-password",
        content: [{ type: "heading", text: "placeholder reset" }],
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

describe("Manifest auth runtime", () => {
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

  it("resends verification when the verify-email route has no token", async () => {
    window.history.replaceState({}, "", "/verify-email");

    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/auth/me")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.endsWith("/auth/resend-verification")) {
        return new Response(JSON.stringify({ message: "Verification resent." }), {
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
    fireEvent.click(
      screen.getByRole("button", { name: "Resend verification email" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Verification resent.")).toBeDefined();
    });
  });

  it("redirects authenticated users away from the login screen", async () => {
    window.history.replaceState({}, "", "/login");

    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/auth/me")) {
        return new Response(JSON.stringify({ id: "1", email: "ada@example.com" }), {
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
      expect(screen.getByText("Dashboard")).toBeDefined();
    });
  });

  it("uses manifest auth screen options and redirect config", async () => {
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

    const manifest = buildAuthManifest();
    manifest.auth = {
      ...manifest.auth!,
      passkey: true,
      redirects: {
        afterLogin: "/reports",
      },
      screenOptions: {
        login: {
          title: "Welcome back",
          description: "Use your workspace account",
          submitLabel: "Continue",
          providers: false,
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
          links: [{ label: "Make an account", screen: "register" }],
        },
      },
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);

    expect(screen.getByText("Welcome back")).toBeDefined();
    expect(screen.getByText("Use your workspace account")).toBeDefined();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Make an account" })).toBeDefined();
    expect(screen.queryByText("Continue with a provider")).toBeNull();
    expect(
      screen.queryByText("Passkey sign-in can be enabled from the Snapshot auth runtime."),
    ).toBeNull();

    fireEvent.change(screen.getByLabelText("Work email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Secret phrase"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(screen.getByText("Reports")).toBeDefined();
    });
  });

  it("runs a real manifest-controlled passkey login flow", async () => {
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

        return new Response(
          JSON.stringify({ id: "1", email: "ada@example.com" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
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
    }) as typeof fetch;

    const manifest = buildAuthManifest();
    manifest.auth = {
      ...manifest.auth!,
      providers: [
        {
          provider: "google",
          label: "Continue with Google Workspace",
          description: "Recommended for your team account",
        },
      ],
      passkey: true,
      redirects: {
        afterLogin: "/reports",
      },
      screenOptions: {
        login: {
          sections: ["providers", "passkey", "form", "links"],
          labels: {
            providersHeading: "Use a provider",
            passkeyButton: "Use a passkey",
          },
        },
      },
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);

    const providersHeading = screen.getByText("Use a provider");
    expect(
      screen.getByRole("button", {
        name: /Continue with Google Workspace/i,
      }),
    ).toBeDefined();
    expect(screen.getByText("Recommended for your team account")).toBeDefined();
    const passkeyButton = screen.getByRole("button", { name: "Use a passkey" });
    const emailField = screen.getByLabelText("Email");

    expect(
      providersHeading.compareDocumentPosition(emailField) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      passkeyButton.compareDocumentPosition(emailField) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    fireEvent.click(passkeyButton);

    await waitFor(() => {
      expect(screen.getByText("Reports")).toBeDefined();
    });
  });

  it("returns to the original protected route after signing in", async () => {
    window.history.replaceState({}, "", "/reports");

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

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toBeDefined();
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(screen.getByText("Reports")).toBeDefined();
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
