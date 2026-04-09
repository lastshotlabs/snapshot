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
    expect(compiled.routes[0]?.preload).toEqual([
      {
        resource: "users.list",
        params: {
          page: 2,
        },
      },
    ]);
    expect(compiled.firstRoute?.id).toBe("dashboard");
    expect(compiled.routeMap["/dashboard"]?.page.title).toBe("Dashboard");
  });

  it("preserves auth screen options and redirects", () => {
    const compiled = compileManifest({
      auth: {
        screens: ["login"],
        redirects: {
          afterLogin: "/reports",
        },
        screenOptions: {
          login: {
            title: "Welcome back",
            submitLabel: "Continue",
            sections: ["providers", "form"],
            providers: [
              {
                provider: "google",
                label: "Use Google Workspace",
              },
            ],
          },
        },
      },
      routes: [
        {
          id: "login",
          path: "/login",
          content: [{ type: "heading", text: "Login" }],
        },
      ],
    });

    expect(compiled.auth?.redirects?.afterLogin).toBe("/reports");
    expect(compiled.auth?.screenOptions?.login?.title).toBe("Welcome back");
    expect(compiled.auth?.screenOptions?.login?.sections).toEqual([
      "providers",
      "form",
    ]);
    expect(compiled.auth?.screenOptions?.login?.providers).toEqual([
      {
        provider: "google",
        label: "Use Google Workspace",
      },
    ]);
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
});
