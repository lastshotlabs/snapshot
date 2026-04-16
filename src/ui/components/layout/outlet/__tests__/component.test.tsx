// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Outlet } from "../component";

const runtimeState = vi.hoisted(() => ({
  manifest: { state: undefined, resources: undefined },
  route: null as
    | {
        match: {
          activeRoutes: Array<{ id: string; page: { content: Array<{ type: string }> } }>;
        };
      }
    | null,
}));

vi.mock("../../../../manifest/runtime", () => ({
  useManifestRuntime: () => runtimeState.manifest,
  useRouteRuntime: () => runtimeState.route,
}));

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { type: string } }) => (
    <div data-testid="outlet-fallback">{config.type}</div>
  ),
  PageRenderer: ({
    routeId,
  }: {
    routeId?: string;
  }) => <div data-testid="outlet-route">{routeId ?? "fallback-page"}</div>,
}));

describe("Outlet", () => {
  it("renders fallback children when no nested route is active", () => {
    runtimeState.route = {
      match: {
        activeRoutes: [{ id: "parent", page: { content: [] } }],
      },
    };

    render(
      <Outlet
        config={{
          type: "outlet",
          className: "component-root",
          slots: {
            root: { className: "slot-root" },
          },
          fallback: [{ type: "text", value: "Empty state" }],
        }}
      />,
    );

    const root = document.querySelector('[data-snapshot-component="outlet"]');
    expect(root?.className).toContain("component-root");
    expect(root?.className).toContain("slot-root");
    expect(screen.getByTestId("outlet-fallback").textContent).toBe("text");
  });

  it("renders the next active route when one exists", () => {
    runtimeState.route = {
      match: {
        activeRoutes: [
          { id: "parent", page: { content: [] } },
          { id: "child", page: { content: [{ type: "text" }] } },
        ],
      },
    };

    render(<Outlet config={{ type: "outlet" }} />);

    expect(screen.getByTestId("outlet-route").textContent).toBe("child");
  });
});
