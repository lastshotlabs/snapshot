import { describe, expect, it } from "vitest";
import { compileManifest } from "../compiler";
import { resolveDocumentTitle, resolveRouteMatch } from "../router";

describe("manifest router helpers", () => {
  it("prefers the configured notFound route over home for unknown paths", () => {
    const manifest = compileManifest({
      app: {
        title: "Snapshot App",
        home: "/",
        notFound: "/404",
      },
      routes: [
        {
          id: "home",
          path: "/",
          title: "Home",
          content: [{ type: "heading", text: "Home Page" }],
        },
        {
          id: "not-found",
          path: "/404",
          title: "Missing",
          content: [{ type: "heading", text: "Not Found" }],
        },
      ],
    });

    const match = resolveRouteMatch(manifest, "/missing");

    expect(match.route?.id).toBe("not-found");
  });

  it("extracts params for dynamic route matches", () => {
    const manifest = compileManifest({
      routes: [
        {
          id: "user-detail",
          path: "/users/{id}",
          title: "User {params.id}",
          content: [{ type: "heading", text: "User Page" }],
        },
      ],
    });

    const match = resolveRouteMatch(manifest, "/users/42");

    expect(match.route?.id).toBe("user-detail");
    expect(match.params).toEqual({ id: "42" });
  });

  it("builds document titles from route metadata and params", () => {
    const manifest = compileManifest({
      app: {
        title: "Snapshot App",
      },
      routes: [
        {
          id: "user-detail",
          path: "/users/{id}",
          title: "User {params.id}",
          content: [{ type: "heading", text: "User Page" }],
        },
      ],
    });

    const match = resolveRouteMatch(manifest, "/users/42");

    expect(
      resolveDocumentTitle(manifest, match.route, "/users/42", match.params),
    ).toBe("User 42 | Snapshot App");
  });
});
