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
      workflows: {
        "users.after-save": {
          type: "toast",
          message: "Saved",
        },
      },
      routes: [
        {
          id: "dashboard",
          path: "/dashboard",
          title: "Dashboard",
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
    expect(compiled.firstRoute?.id).toBe("dashboard");
    expect(compiled.routeMap["/dashboard"]?.page.title).toBe("Dashboard");
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
