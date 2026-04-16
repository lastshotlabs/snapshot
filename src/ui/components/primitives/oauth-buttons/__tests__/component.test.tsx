/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

let manifestRuntime: {
  raw: Record<string, unknown>;
  app?: {
    apiUrl?: string;
  };
  auth: {
    providers: Record<string, unknown>;
    providerMode?: string;
    contract?: {
      endpoints?: {
        oauthStart?: string;
      };
      oauthUrl?: (provider: string) => string;
    };
  };
};

vi.mock("../../../../context", () => ({
  useSubscribe: () => null,
  useResolveFrom: <T extends Record<string, unknown>>(value: T) => value,
}));

vi.mock("../../../../manifest/runtime", () => ({
  useManifestRuntime: () => manifestRuntime,
  useRouteRuntime: () => ({
    currentRoute: { id: "signin" },
    currentPath: "/sign-in",
    params: {},
    query: {},
  }),
}));

import { OAuthButtons } from "../component";

let submitSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  submitSpy = vi
    .spyOn(HTMLFormElement.prototype, "submit")
    .mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  document.body.querySelectorAll("form").forEach((form) => form.remove());
  submitSpy.mockRestore();
});

describe("OAuthButtons", () => {
  it("remains stable when providers become available after an empty render", () => {
    manifestRuntime = {
      raw: {},
      auth: {
        providers: {},
      },
    };

    const { rerender } = render(<OAuthButtons config={{ type: "oauth-buttons" }} />);
    expect(screen.queryByRole("button")).toBeNull();

    manifestRuntime = {
      raw: {},
      auth: {
        providers: {
          google: {
            label: "Continue with Google",
            description: "Use your workspace account",
            startUrl: "/auth/google/start",
          },
        },
      },
    };

    rerender(<OAuthButtons config={{ type: "oauth-buttons" }} />);
    expect(
      screen.getByRole("button", {
        name: "Continue with Google",
      }),
    ).toBeTruthy();
  });

  it("renders provider buttons through the shared button primitive", () => {
    manifestRuntime = {
      raw: {},
      auth: {
        providers: {
          google: {
            label: "Continue with Google",
            description: "Use your workspace account",
            startUrl: "/auth/google/start",
          },
        },
      },
    };

    const { container } = render(
      <OAuthButtons
        config={{
          type: "oauth-buttons",
          id: "signin-oauth",
          className: "oauth-root-class",
          heading: "Continue with",
          slots: {
            root: { className: "oauth-root-slot" },
            providerLabel: { className: "provider-label-slot" },
          },
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="signin-oauth-root"]')?.className,
    ).toContain("oauth-root-class");
    expect(
      container.querySelector('[data-snapshot-id="signin-oauth-root"]')?.className,
    ).toContain("oauth-root-slot");
    expect(screen.getByText("Continue with")).toBeTruthy();
    const button = screen.getByRole("button", {
      name: "Continue with Google",
    });
    expect(screen.getByText("Continue with Google").className).toContain(
      "provider-label-slot",
    );

    fireEvent.click(button);
    expect(submitSpy).toHaveBeenCalledTimes(1);
    const form = document.body.querySelector("form");
    expect(form?.getAttribute("action")).toBe("/auth/google/start");
  });

  it("connects provider descriptions through aria-describedby", () => {
    manifestRuntime = {
      raw: {},
      auth: {
        providers: {
          google: {
            label: "Continue with Google",
            description: "Use your workspace account",
            startUrl: "/auth/google/start",
          },
        },
      },
    };

    render(<OAuthButtons config={{ type: "oauth-buttons" }} />);

    const button = screen.getByRole("button", {
      name: "Continue with Google",
    });
    const description = screen.getByText("Use your workspace account");

    expect(button.getAttribute("aria-describedby")).toBe(description.id);
  });

  it("does not auto-redirect when a single provider opts out", () => {
    manifestRuntime = {
      raw: {},
      auth: {
        providerMode: "auto",
        providers: {
          google: {
            label: "Continue with Google",
            autoRedirect: false,
            startUrl: "/auth/google/start",
          },
        },
      },
    };

    render(<OAuthButtons config={{ type: "oauth-buttons" }} />);

    expect(submitSpy).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", {
        name: "Continue with Google",
      }),
    ).toBeTruthy();
  });

  it("builds an absolute provider URL from manifest.app.apiUrl when no startUrl is provided", () => {
    manifestRuntime = {
      raw: {},
      app: {
        apiUrl: "http://localhost:2323/",
      },
      auth: {
        providers: {
          google: {
            label: "Continue with Google",
          },
        },
      },
    };

    render(<OAuthButtons config={{ type: "oauth-buttons" }} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Continue with Google",
      }),
    );

    expect(submitSpy).toHaveBeenCalledTimes(1);
    const form = document.body.querySelector("form");
    expect(form?.getAttribute("action")).toBe("http://localhost:2323/auth/google");
  });
});
