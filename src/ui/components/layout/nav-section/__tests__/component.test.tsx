// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const refValues: Record<string, unknown> = {
  "navSection.label": "Resolved Resources {route.params.id}",
};

function resolveRefs<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => resolveRefs(entry)) as T;
  }

  if (value && typeof value === "object") {
    if ("from" in (value as Record<string, unknown>)) {
      return refValues[(value as unknown as { from: string }).from] as T;
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        resolveRefs(entry),
      ]),
    ) as T;
  }

  return value;
}

vi.mock("../../../../context/hooks", async () => {
  const actual = await vi.importActual("../../../../context/hooks");

  return {
    ...actual,
    useSubscribe: (value: unknown) =>
      value &&
      typeof value === "object" &&
      "from" in (value as Record<string, unknown>)
        ? refValues[(value as { from: string }).from]
        : value,
    useResolveFrom: resolveRefs,
  };
});

vi.mock("../../../../manifest/runtime", async () => {
  const actual = await vi.importActual("../../../../manifest/runtime");

  return {
    ...actual,
    useManifestRuntime: () => ({
      raw: { routes: [] },
      app: {},
      auth: {},
    }),
    useRouteRuntime: () => ({
      currentRoute: { id: "resources" },
      currentPath: "/resources/guides",
      params: { id: "guides" },
      query: {},
    }),
  };
});

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { id?: string; type: string } }) => (
    <div data-testid={`nav-section-item-${config.id ?? config.type}`}>{config.type}</div>
  ),
}));

import { NavSection } from "../component";

describe("NavSection", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders child items by default", () => {
    render(
      <NavSection
        config={{
          type: "nav-section",
          className: "component-root",
          label: "Resources",
          items: [{ type: "text", id: "item-a" } as never],
          slots: {
            root: { className: "slot-root" },
          },
        }}
      />,
    );

    const root = document.querySelector('[data-snapshot-component="nav-section"]');
    expect(root?.className).toContain("component-root");
    expect(root?.className).toContain("slot-root");
    expect(screen.getByTestId("nav-section-item-item-a")).toBeTruthy();
  });

  it("toggles collapsed content for collapsible sections", () => {
    render(
      <NavSection
        config={{
          type: "nav-section",
          label: "Resources",
          collapsible: true,
          defaultCollapsed: true,
          items: [{ type: "text", id: "item-a" } as never],
        }}
      />,
    );

    expect(screen.queryByTestId("nav-section-item-item-a")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Resources" }));
    expect(screen.getByTestId("nav-section-item-item-a")).toBeTruthy();
  });

  it("renders ref-backed labels", () => {
    render(
      <NavSection
        config={{
          type: "nav-section",
          label: { from: "navSection.label" } as never,
          items: [{ type: "text", id: "item-a" } as never],
        }}
      />,
    );

    expect(screen.getByText("Resolved Resources guides")).toBeTruthy();
  });
});
