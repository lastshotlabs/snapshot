/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";

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

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { z } from "zod";
import { ManifestApp, injectStyleSheet } from "../app";
import { registerComponent } from "../component-registry";
import { registerComponentSchema } from "../schema";
import type { ManifestConfig } from "../types";
import { useSubscribe } from "../../context";
import { useSetStateValue, useStateValue } from "../../state";

import "../structural";

registerComponentSchema(
  "route-state-probe",
  z.object({
    type: z.literal("route-state-probe"),
  }),
);
registerComponent("route-state-probe", function RouteStateProbe() {
  const value = useStateValue("routeCounter");
  const setValue = useSetStateValue("routeCounter");

  return (
    <button onClick={() => setValue(Number(value ?? 0) + 1)}>
      {String(value ?? 0)}
    </button>
  );
});

registerComponentSchema(
  "app-state-probe",
  z.object({
    type: z.literal("app-state-probe"),
    key: z.string(),
  }),
);
registerComponent("app-state-probe", function AppStateProbe({
  config,
}: {
  config: Record<string, unknown>;
}) {
  const value = useStateValue(String(config.key ?? ""), { scope: "app" });
  return <div>{String(value ?? "")}</div>;
});

registerComponentSchema(
  "auth-value-probe",
  z.object({
    type: z.literal("auth-value-probe"),
    from: z.string(),
  }),
);
registerComponent("auth-value-probe", function AuthValueProbe({
  config,
}: {
  config: Record<string, unknown>;
}) {
  const value = useSubscribe({ from: String(config.from ?? "") });
  return <div>{typeof value === "string" ? value : String(value ?? "")}</div>;
});

registerComponentSchema(
  "params-probe",
  z.object({
    type: z.literal("params-probe"),
    from: z.string(),
  }),
);
registerComponent("params-probe", function ParamsProbe({
  config,
}: {
  config: Record<string, unknown>;
}) {
  const value = useSubscribe({ from: String(config.from ?? "") });
  return <div>{typeof value === "string" ? value : String(value ?? "")}</div>;
});

const minimalManifest: ManifestConfig = {
  app: {
    title: "Snapshot App",
    home: "/",
  },
  routes: [
    {
      id: "home",
      path: "/",
      title: "Home",
      content: [
        {
          type: "heading",
          text: "Welcome Home",
          level: 1,
        },
      ],
    },
  ],
};

describe("injectStyleSheet", () => {
  afterEach(() => {
    const el = document.getElementById("test-style");
    if (el) el.remove();
  });

  it("creates a style element in the head", () => {
    injectStyleSheet("test-style", "body { margin: 0; }");
    const el = document.getElementById("test-style");
    expect(el).not.toBeNull();
    expect(el?.textContent).toBe("body { margin: 0; }");
  });
});

describe("ManifestApp", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    const el = document.getElementById("snapshot-tokens");
    if (el) el.remove();
    window.history.replaceState({}, "", "/");
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("renders page content from manifest", () => {
    render(
      <ManifestApp manifest={minimalManifest} apiUrl="http://localhost" />,
    );
    expect(screen.getByText("Welcome Home")).toBeDefined();
  });

  it("applies theme tokens as injected CSS", () => {
    const manifest: ManifestConfig = {
      theme: {
        flavor: "neutral",
      },
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "heading", text: "Themed" }],
        },
      ],
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);
    const style = document.getElementById("snapshot-tokens");
    expect(style).not.toBeNull();
    expect(style?.textContent).toContain(":root");
  });

  it("renders the current route when multiple routes exist", () => {
    window.history.replaceState({}, "", "/about");

    const manifest: ManifestConfig = {
      app: {
        home: "/",
      },
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "heading", text: "Home Page" }],
        },
        {
          id: "about",
          path: "/about",
          content: [{ type: "heading", text: "About Page" }],
        },
      ],
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);
    expect(screen.getByText("About Page")).toBeDefined();
  });

  it("resets route-scoped state when navigation changes routes", async () => {
    const manifest: ManifestConfig = {
      state: {
        routeCounter: {
          scope: "route",
          default: 0,
        },
      },
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "route-state-probe" }],
        },
        {
          id: "about",
          path: "/about",
          content: [{ type: "route-state-probe" }],
        },
      ],
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);

    fireEvent.click(screen.getByRole("button", { name: "0" }));
    expect(screen.getByRole("button", { name: "1" })).toBeDefined();

    await act(async () => {
      window.history.replaceState({}, "", "/about");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "0" })).toBeDefined();
    });
  });

  it("renders manifest navigation and navigates within the shell", async () => {
    const manifest: ManifestConfig = {
      navigation: {
        mode: "sidebar",
        items: [
          { label: "Home", path: "/" },
          { label: "About", path: "/about" },
        ],
      },
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "heading", text: "Home Page" }],
        },
        {
          id: "about",
          path: "/about",
          content: [{ type: "heading", text: "About Page" }],
        },
      ],
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);
    fireEvent.click(screen.getByRole("button", { name: "About" }));

    await waitFor(() => {
      expect(screen.getByText("About Page")).toBeDefined();
    });
  });

  it("redirects guarded routes to the configured fallback", async () => {
    window.history.replaceState({}, "", "/private");

    const manifest: ManifestConfig = {
      state: {
        user: {
          scope: "app",
          default: null,
        },
      },
      routes: [
        {
          id: "login",
          path: "/login",
          content: [{ type: "heading", text: "Login Page" }],
        },
        {
          id: "private",
          path: "/private",
          guard: {
            authenticated: true,
            redirectTo: "/login",
          },
          content: [{ type: "heading", text: "Private Page" }],
        },
      ],
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);

    await waitFor(() => {
      expect(screen.getByText("Login Page")).toBeDefined();
    });
  });

  it("renders named overlays opened by actions", async () => {
    const manifest: ManifestConfig = {
      state: {
        overlayResult: {
          scope: "app",
          default: "",
        },
      },
      overlays: {
        help: {
          type: "modal",
          title: { from: "overlay.payload.title" },
          content: [
            {
              type: "heading",
              text: { from: "overlay.payload.message" },
            },
            { type: "app-state-probe", key: "overlayResult" },
          ],
          footer: {
            actions: [
              {
                label: "Apply",
                dismiss: true,
                action: {
                  type: "set-value",
                  target: "global.overlayResult",
                  value: "{overlay.payload.result}",
                },
              },
            ],
          },
        },
      },
      routes: [
        {
          id: "home",
          path: "/",
          content: [
            {
              type: "button",
              label: "Open Help",
              action: {
                type: "open-modal",
                modal: "help",
                payload: {
                  title: "Need Help?",
                  message: "Overlay Content",
                  result: "applied",
                },
              },
            },
          ],
        },
      ],
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);
    fireEvent.click(screen.getByRole("button", { name: "Open Help" }));

    await waitFor(() => {
      expect(screen.getByText("Need Help?")).toBeDefined();
      expect(screen.getByText("Overlay Content")).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => {
      expect(screen.getByText("applied")).toBeDefined();
    });
  });

  it("preloads route resources before rendering page content", async () => {
    let resolveFetch!: (response: Response) => void;
    global.fetch = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    ) as typeof fetch;

    const manifest: ManifestConfig = {
      resources: {
        me: {
          method: "GET",
          endpoint: "/api/me",
        },
      },
      routes: [
        {
          id: "home",
          path: "/",
          preload: ["me"],
          content: [{ type: "heading", text: "Ready" }],
        },
      ],
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);
    expect(screen.getByText("Loading...")).toBeDefined();

    resolveFetch(
      new Response(JSON.stringify({ id: 1, name: "Ada" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Ready")).toBeDefined();
    });
  });

  it("passes dynamic route params into route preload resources", async () => {
    window.history.replaceState({}, "", "/users/42");

    let requestedUrl = "";
    let resolveFetch!: (response: Response) => void;
    global.fetch = vi.fn(
      (input: RequestInfo | URL) => {
        requestedUrl = String(input);
        return new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        });
      },
    ) as typeof fetch;

    const manifest: ManifestConfig = {
      resources: {
        user: {
          method: "GET",
          endpoint: "/api/users/{id}",
        },
      },
      routes: [
        {
          id: "user-detail",
          path: "/users/{id}",
          preload: ["user"],
          content: [{ type: "heading", text: "User Ready" }],
        },
      ],
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);
    expect(screen.getByText("Loading...")).toBeDefined();
    expect(requestedUrl).toContain("/api/users/42");

    resolveFetch(
      new Response(JSON.stringify({ id: 42, name: "Ada" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("User Ready")).toBeDefined();
    });
  });

  it("runs route leave and enter workflows during navigation", async () => {
    const manifest: ManifestConfig = {
      state: {
        enterStatus: {
          scope: "app",
          default: "",
        },
        leaveStatus: {
          scope: "app",
          default: "",
        },
      },
      navigation: {
        mode: "sidebar",
        items: [
          { label: "Home", path: "/" },
          { label: "About", path: "/about" },
        ],
      },
      routes: [
        {
          id: "home",
          path: "/",
          leave: [
            {
              type: "set-value",
              target: "global.leaveStatus",
              value: "left {route.id}",
            },
          ],
          content: [{ type: "heading", text: "Home Page" }],
        },
        {
          id: "about",
          path: "/about",
          enter: [
            {
              type: "set-value",
              target: "global.enterStatus",
              value: "entered {route.id}",
            },
          ],
          content: [
            { type: "heading", text: "About Page" },
            { type: "app-state-probe", key: "enterStatus" },
            { type: "app-state-probe", key: "leaveStatus" },
          ],
        },
      ],
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);
    fireEvent.click(screen.getByRole("button", { name: "About" }));

    await waitFor(() => {
      expect(screen.getByText("About Page")).toBeDefined();
      expect(screen.getByText("entered about")).toBeDefined();
      expect(screen.getByText("left home")).toBeDefined();
    });
  });

  it("matches dynamic routes and exposes params to bindings", async () => {
    window.history.replaceState({}, "", "/users/42");

    const manifest: ManifestConfig = {
      state: {
        routeCounter: {
          scope: "route",
          default: 0,
        },
      },
      routes: [
        {
          id: "user-detail",
          path: "/users/{id}",
          content: [
            { type: "params-probe", from: "params.id" },
            { type: "params-probe", from: "route.path" },
            { type: "params-probe", from: "route.pattern" },
            { type: "route-state-probe" },
          ],
        },
      ],
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);

    await waitFor(() => {
      expect(screen.getByText("42")).toBeDefined();
      expect(screen.getByText("/users/42")).toBeDefined();
      expect(screen.getByText("/users/{id}")).toBeDefined();
      expect(screen.getByRole("button", { name: "0" })).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: "0" }));
    expect(screen.getByRole("button", { name: "1" })).toBeDefined();

    await act(async () => {
      window.history.replaceState({}, "", "/users/84");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    await waitFor(() => {
      expect(screen.getByText("84")).toBeDefined();
      expect(screen.getByText("/users/84")).toBeDefined();
      expect(screen.getByRole("button", { name: "0" })).toBeDefined();
    });
  });

  it("hydrates auth state from the session user before rendering a protected route", async () => {
    window.history.replaceState({}, "", "/private");
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/auth/me")) {
        return new Response(JSON.stringify({ name: "Ada", role: "admin" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const manifest: ManifestConfig = {
      app: {
        home: "/private",
      },
      auth: {
        screens: ["login"],
      },
      routes: [
        {
          id: "login",
          path: "/login",
          content: [{ type: "heading", text: "Login Page" }],
        },
        {
          id: "private",
          path: "/private",
          guard: {
            authenticated: true,
          },
          content: [
            { type: "heading", text: "Private Page" },
            { type: "auth-value-probe", from: "global.user.name" },
            { type: "auth-value-probe", from: "global.auth.isAuthenticated" },
          ],
        },
      ],
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);

    await waitFor(() => {
      expect(screen.getByText("Private Page")).toBeDefined();
      expect(screen.getByText("Ada")).toBeDefined();
      expect(screen.getByText("true")).toBeDefined();
    });
  });

  it("redirects protected routes to the inferred login route after auth bootstrap", async () => {
    window.history.replaceState({}, "", "/private");
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

    const manifest: ManifestConfig = {
      auth: {
        screens: ["login"],
      },
      routes: [
        {
          id: "login",
          path: "/login",
          content: [{ type: "heading", text: "Login Page" }],
        },
        {
          id: "private",
          path: "/private",
          guard: {
            authenticated: true,
          },
          content: [{ type: "heading", text: "Private Page" }],
        },
      ],
    };

    render(<ManifestApp manifest={manifest} apiUrl="http://localhost" />);

    await waitFor(() => {
      expect(screen.getByText("Login Page")).toBeDefined();
    });
  });
});
