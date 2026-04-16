import { describe, expect, it } from "vitest";
import {
  compileManifest,
  defineManifest,
  safeCompileManifest,
} from "../compiler";

describe("compiler", () => {
  it("compiles routes into a route map and page configs", () => {
    const manifest = defineManifest({
      app: {
        shell: "full-width",
        title: "Snapshot App",
        home: "/dashboard",
      },
      state: {
        user: {
          data: "GET /api/me",
          default: null,
        },
      },
      resources: {
        "users.list": {
          method: "GET",
          endpoint: "/api/users",
          refetchOnMount: true,
          refetchOnWindowFocus: true,
        },
      },
      workflows: {
        "users.after-save": {
          type: "toast",
          message: "Saved",
        },
        "users.sync": {
          type: "retry",
          attempts: 2,
          step: {
            type: "api",
            method: "POST",
            endpoint: "/api/users/sync",
          },
          onFailure: {
            type: "toast",
            message: "Sync failed",
          },
        },
        "users.reconcile": {
          type: "try",
          step: {
            type: "api",
            method: "POST",
            endpoint: "/api/users/reconcile",
          },
          catch: {
            type: "toast",
            message: "Reconcile failed",
          },
        },
        "users.fetch-current": {
          type: "capture",
          action: {
            type: "api",
            method: "GET",
            endpoint: { resource: "users.list" },
          },
          as: "current.users",
        },
      },
      routes: [
        {
          id: "dashboard",
          path: "/dashboard",
          title: "Dashboard",
          preload: [
            {
              resource: "users.list",
              params: {
                page: 2,
              },
            },
          ],
          refreshOnEnter: ["users.list"],
          invalidateOnLeave: ["users.list"],
          content: [{ type: "heading", text: "Dashboard" }],
        },
      ],
    });

    const compiled = compileManifest(manifest);

    expect(compiled.app.home).toBe("/dashboard");
    expect(compiled.state?.user?.data).toBe("GET /api/me");
    expect(compiled.workflows?.["users.after-save"]).toMatchObject({
      type: "toast",
      message: "Saved",
    });
    expect(compiled.workflows?.["users.sync"]).toMatchObject({
      type: "retry",
      attempts: 2,
      onFailure: {
        type: "toast",
        message: "Sync failed",
      },
    });
    expect(compiled.workflows?.["users.reconcile"]).toMatchObject({
      type: "try",
      catch: {
        type: "toast",
        message: "Reconcile failed",
      },
    });
    expect(compiled.workflows?.["users.fetch-current"]).toMatchObject({
      type: "capture",
      as: "current.users",
    });
    expect(compiled.resources?.["users.list"]?.refetchOnMount).toBe(true);
    expect(compiled.resources?.["users.list"]?.refetchOnWindowFocus).toBe(true);
    expect(compiled.routes[0]?.preload).toEqual([
      {
        resource: "users.list",
        params: {
          page: 2,
        },
      },
    ]);
    expect(compiled.routes[0]?.refreshOnEnter).toEqual(["users.list"]);
    expect(compiled.routes[0]?.invalidateOnLeave).toEqual(["users.list"]);
    expect(compiled.firstRoute?.id).toBe("dashboard");
    expect(compiled.routeMap["/dashboard"]?.page.title).toBe("Dashboard");
  });

  it("preserves auth screen options and redirects", () => {
    const compiled = compileManifest({
      auth: {
        screens: ["login"],
        session: {
          mode: "token",
          storage: "memory",
          key: "auth.token",
        },
        redirects: {
          afterLogin: "/reports",
        },
        providers: {
          google: {
            type: "google",
            label: "Use Google Workspace",
            autoRedirect: true,
          },
        },
        screenOptions: {
          login: {
            title: "Welcome back",
            submitLabel: "Continue",
            sections: ["providers", "form"],
            providers: ["google"],
            providerMode: "auto",
            passkey: {
              enabled: true,
              autoPrompt: true,
            },
          },
        },
      },
      routes: [
        {
          id: "dashboard",
          path: "/dashboard",
          content: [{ type: "heading", text: "Dashboard" }],
        },
      ],
    });

    expect(compiled.auth?.redirects?.afterLogin).toBe("/reports");
    expect(compiled.auth?.session).toEqual({
      mode: "token",
      storage: "memory",
      key: "auth.token",
    });
    expect(compiled.auth?.screenOptions?.login?.title).toBe("Welcome back");
    expect(compiled.auth?.screenOptions?.login?.sections).toEqual([
      "providers",
      "form",
    ]);
    expect(compiled.auth?.screenOptions?.login?.providers).toEqual(["google"]);
    expect(compiled.auth?.providers?.google).toMatchObject({
      type: "google",
      label: "Use Google Workspace",
      autoRedirect: true,
    });
    expect(compiled.auth?.screenOptions?.login?.providerMode).toBe("auto");
    expect(compiled.auth?.screenOptions?.login?.passkey).toEqual({
      enabled: true,
      autoPrompt: true,
    });
    expect(compiled.routeMap["/login"]?.id).toBe("login");
  });

  it("preserves manifest runtime resource loaders outside schema validation", () => {
    const loader = async () => ({ items: [], hasMore: false });
    const compiled = compileManifest(
      defineManifest({
        __runtime: {
          resources: {
            transactions: {
              load: loader,
            },
          },
        },
        routes: [
          {
            id: "dashboard",
            path: "/",
            content: [{ type: "heading", text: "Dashboard" }],
          },
        ],
      }),
    );

    expect(compiled.__runtime?.resources?.transactions?.load).toBe(loader);
    expect(compiled.routeMap["/"]?.id).toBe("dashboard");
  });

  it("preserves auth contract overrides and workflow handlers", () => {
    const compiled = compileManifest({
      auth: {
        screens: ["login"],
        contract: {
          endpoints: {
            me: "/custom/auth/me",
          },
          headers: {
            csrf: "x-custom-csrf",
          },
          csrfCookieName: "custom_csrf",
        },
        on: {
          unauthenticated: "redirect-to-login",
          forbidden: "show-forbidden",
          logout: "clear-session",
        },
      },
      workflows: {
        "redirect-to-login": {
          type: "navigate",
          to: "/login",
        },
        "show-forbidden": {
          type: "toast",
          message: "Forbidden",
        },
        "clear-session": {
          type: "toast",
          message: "Logged out",
        },
      },
      routes: [
        {
          id: "dashboard",
          path: "/dashboard",
          content: [{ type: "heading", text: "Dashboard" }],
        },
      ],
    });

    expect(compiled.auth?.contract?.endpoints?.me).toBe("/custom/auth/me");
    expect(compiled.auth?.contract?.endpoints?.login).toBe("/auth/login");
    expect(compiled.auth?.contract?.headers?.csrf).toBe("x-custom-csrf");
    expect(compiled.auth?.contract?.headers?.userToken).toBe("x-user-token");
    expect(compiled.auth?.contract?.csrfCookieName).toBe("custom_csrf");
    expect(compiled.auth?.on?.unauthenticated).toBe("redirect-to-login");
    expect(compiled.auth?.on?.forbidden).toBe("show-forbidden");
    expect(compiled.auth?.on?.logout).toBe("clear-session");
  });

  it("preserves realtime config and workflow handlers", () => {
    const compiled = compileManifest({
      realtime: {
        ws: {
          url: { env: "WS_URL", default: "wss://example.com/ws" },
          reconnectOnLogin: false,
          on: {
            connected: "ws-connected",
            disconnected: "ws-disconnected",
          },
        },
        sse: {
          endpoints: {
            "/__sse/updates": {
              withCredentials: true,
              on: {
                connected: "sse-connected",
                error: "sse-error",
                closed: "sse-closed",
              },
            },
          },
        },
      },
      workflows: {
        "ws-connected": {
          type: "toast",
          message: "WS connected",
        },
        "ws-disconnected": {
          type: "toast",
          message: "WS disconnected",
        },
        "sse-connected": {
          type: "toast",
          message: "SSE connected",
        },
        "sse-error": {
          type: "toast",
          message: "SSE error",
        },
        "sse-closed": {
          type: "toast",
          message: "SSE closed",
        },
      },
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "heading", text: "Home" }],
        },
      ],
    });

    expect(compiled.realtime?.ws?.reconnectOnLogin).toBe(false);
    expect(compiled.realtime?.ws?.url).toBe("wss://example.com/ws");
    expect(compiled.realtime?.ws?.on?.connected).toBe("ws-connected");
    expect(compiled.realtime?.sse?.endpoints["/__sse/updates"]?.withCredentials).toBe(
      true,
    );
    expect(
      compiled.realtime?.sse?.endpoints["/__sse/updates"]?.on?.closed,
    ).toBe("sse-closed");
  });

  it("rejects realtime handlers that reference missing workflows", () => {
    expect(() =>
      compileManifest({
        realtime: {
          ws: {
            on: {
              connected: "missing-workflow",
            },
          },
        },
        routes: [
          {
            id: "home",
            path: "/",
            content: [{ type: "heading", text: "Home" }],
          },
        ],
      }),
    ).toThrow(
      'Realtime WS handler "connected" references missing workflow "missing-workflow". Add it to manifest.workflows.',
    );
  });

  it("rejects auth handlers that reference missing workflows", () => {
    expect(() =>
      compileManifest({
        auth: {
          screens: ["login"],
          on: {
            unauthenticated: "missing-workflow",
          },
        },
        routes: [
          {
            id: "login",
            path: "/login",
            content: [{ type: "heading", text: "Login" }],
          },
        ],
      }),
    ).toThrow(
      'Auth handler "unauthenticated" references missing workflow "missing-workflow". Add it to manifest.workflows.',
    );
  });

  it("defaults auth.session when omitted", () => {
    const compiled = compileManifest({
      auth: {
        screens: ["login"],
      },
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "heading", text: "Home" }],
        },
      ],
    });

    expect(compiled.auth?.session).toEqual({
      mode: "cookie",
      storage: "sessionStorage",
      key: "snapshot.token",
    });
  });

  it("synthesizes default auth routes when screens are enabled", () => {
    const compiled = compileManifest({
      auth: {
        screens: ["login"],
      },
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "heading", text: "Home" }],
        },
      ],
    });

    expect(compiled.routeMap["/login"]?.id).toBe("login");
    expect(compiled.routes.some((route) => route.id === "login")).toBe(true);
  });

  it("accepts custom auth screen paths when the route id matches", () => {
    const compiled = compileManifest({
      auth: {
        screens: ["login"],
      },
      routes: [
        {
          id: "login",
          path: "/sign-in",
          content: [{ type: "heading", text: "Login" }],
        },
      ],
    });

    expect(compiled.routeMap["/sign-in"]?.id).toBe("login");
  });

  it("defaults app.home to the first route when omitted", () => {
    const compiled = compileManifest({
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "heading", text: "Home" }],
        },
      ],
    });

    expect(compiled.app.home).toBe("/");
  });

  it("defaults app.cache to the current QueryClient settings", () => {
    const compiled = compileManifest({
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "heading", text: "Home" }],
        },
      ],
    });

    expect(compiled.app.cache).toEqual({
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    });
  });

  it("preserves app.cache overrides", () => {
    const compiled = compileManifest({
      app: {
        cache: {
          staleTime: 60_000,
          gcTime: 120_000,
          retry: 3,
        },
      },
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "heading", text: "Home" }],
        },
      ],
    });

    expect(compiled.app.cache).toEqual({
      staleTime: 60_000,
      gcTime: 120_000,
      retry: 3,
    });
  });

  it("resolves env refs at compile time", () => {
    const original = process.env["SNAPSHOT_APP_TITLE"];
    process.env["SNAPSHOT_APP_TITLE"] = "Env Snapshot";

    try {
      const compiled = compileManifest({
        app: {
          title: { env: "SNAPSHOT_APP_TITLE" },
        },
        routes: [
          {
            id: "home",
            path: "/",
            content: [{ type: "heading", text: "Home" }],
          },
        ],
      });

      expect(compiled.app.title).toBe("Env Snapshot");
    } finally {
      if (original === undefined) {
        delete process.env["SNAPSHOT_APP_TITLE"];
      } else {
        process.env["SNAPSHOT_APP_TITLE"] = original;
      }
    }
  });

  it("resolves manifest.app.apiUrl env refs at compile time", () => {
    const original = process.env["SNAPSHOT_API_URL"];
    process.env["SNAPSHOT_API_URL"] = "https://api.env.example.com";

    try {
      const compiled = compileManifest({
        app: {
          apiUrl: { env: "SNAPSHOT_API_URL" },
        },
        routes: [
          {
            id: "home",
            path: "/",
            content: [{ type: "heading", text: "Home" }],
          },
        ],
      });

      expect(compiled.app.apiUrl).toBe("https://api.env.example.com");
    } finally {
      if (original === undefined) {
        delete process.env["SNAPSHOT_API_URL"];
      } else {
        process.env["SNAPSHOT_API_URL"] = original;
      }
    }
  });

  it("uses env ref defaults when the env var is missing", () => {
    const compiled = compileManifest({
      app: {
        title: { env: "SNAPSHOT_MISSING_TITLE", default: "Fallback Title" },
      },
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "heading", text: "Home" }],
        },
      ],
    });

    expect(compiled.app.title).toBe("Fallback Title");
  });

  it("throws a clear error when an env ref is missing without a default", () => {
    expect(() =>
      compileManifest({
        app: {
          title: { env: "SNAPSHOT_MISSING_TITLE" },
        },
        routes: [
          {
            id: "home",
            path: "/",
            content: [{ type: "heading", text: "Home" }],
          },
        ],
      }),
    ).toThrow(
      'Unable to resolve env ref at "app.title": env "SNAPSHOT_MISSING_TITLE" is not defined and no default was provided.',
    );
  });

  it("returns zod errors from safeCompileManifest", () => {
    const result = safeCompileManifest({
      routes: [
        {
          id: "home",
          path: "home",
          content: [{ type: "heading", text: "Home" }],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("preserves translated navigation labels without nav-specific casts", () => {
    const compiled = compileManifest({
      i18n: {
        default: "en",
        locales: ["en"],
        strings: {
          en: {
            nav: {
              home: "Home",
              logout: "Logout",
              brand: "Snapshot",
            },
          },
        },
      },
      navigation: {
        mode: "sidebar",
        items: [{ label: { t: "nav.home" }, path: "/" }],
        userMenu: {
          items: [
            {
              label: { t: "nav.logout" },
              action: { type: "navigate", to: "/logout" },
            },
          ],
        },
        logo: {
          text: { t: "nav.brand" },
        },
      },
      routes: [
        {
          id: "home",
          path: "/",
          content: [{ type: "heading", text: "Home" }],
        },
      ],
    });

    expect(compiled.navigation?.items?.[0]?.label).toEqual({ t: "nav.home" });

    const userMenu =
      compiled.navigation?.userMenu &&
      typeof compiled.navigation.userMenu === "object"
        ? compiled.navigation.userMenu
        : undefined;

    expect(userMenu?.items?.[0]?.label).toEqual({ t: "nav.logout" });
    expect(compiled.navigation?.logo?.text).toEqual({ t: "nav.brand" });
  });
});
