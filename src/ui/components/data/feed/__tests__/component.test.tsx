// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  PageRegistryContext,
  AppRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { Feed } from "../component";
import type { FeedConfig } from "../types";

const testItems = [
  {
    id: "1",
    message: "Alice joined the team",
    detail: "Onboarding complete",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    type: "info",
  },
  {
    id: "2",
    message: "Build failed",
    detail: "TypeScript error in main.tsx",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    type: "error",
  },
  {
    id: "3",
    message: "Deployment succeeded",
    detail: "v2.1.0 is live",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    type: "success",
  },
];

function createWrapper(data: unknown[] = testItems) {
  const registry = new AtomRegistryImpl();
  const sourceAtom = registry.register("feed-source");
  registry.store.set(sourceAtom, data);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          <SnapshotApiContext.Provider value={null}>
            {children}
          </SnapshotApiContext.Provider>
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>
    );
  }

  return { Wrapper, registry };
}

function baseConfig(overrides: Partial<FeedConfig> = {}): FeedConfig {
  return {
    type: "feed",
    data: { from: "feed-source" },
    title: "message",
    itemKey: "id",
    emptyMessage: "No activity yet",
    pageSize: 20,
    relativeTime: false,
    ...overrides,
  };
}

describe("Feed component", () => {
  it("renders with data-snapshot-component attribute", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Feed config={baseConfig({ className: "feed-root-config" })} />
      </Wrapper>,
    );
    expect(
      container.querySelector('[data-snapshot-component="feed"]'),
    ).not.toBeNull();
    expect(
      container
        .querySelector('[data-snapshot-component="feed"]')
        ?.classList.contains("feed-root-config"),
    ).toBe(true);
  });

  it("renders feed items", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Feed config={baseConfig()} />
      </Wrapper>,
    );
    const scope = within(container);
    expect(scope.getByText("Alice joined the team")).toBeDefined();
    expect(scope.getByText("Build failed")).toBeDefined();
    expect(scope.getByText("Deployment succeeded")).toBeDefined();
  });

  it("renders initials when an item has no avatar", () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <Feed config={baseConfig()} />
      </Wrapper>,
    );

    expect(
      container.querySelector("[data-feed-avatar-fallback]")?.textContent,
    ).toBe("AJ");
  });

  it("renders descriptions when configured", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <Feed config={baseConfig({ description: "detail" })} />
      </Wrapper>,
    );
    expect(screen.getByText("Onboarding complete")).toBeDefined();
    expect(screen.getByText("TypeScript error in main.tsx")).toBeDefined();
  });

  it("renders badges when configured", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <Feed
          config={baseConfig({
            badge: {
              field: "type",
              colorMap: {
                error: "destructive",
                info: "info",
                success: "success",
              },
            },
          })}
        />
      </Wrapper>,
    );
    expect(screen.getByText("info")).toBeDefined();
    expect(screen.getByText("error")).toBeDefined();
    expect(screen.getByText("success")).toBeDefined();
  });

  it("renders empty state when no items", () => {
    const { Wrapper } = createWrapper([]);
    render(
      <Wrapper>
        <Feed config={baseConfig({ emptyMessage: "Nothing here" })} />
      </Wrapper>,
    );
    expect(screen.getByText("Nothing here")).toBeDefined();
  });

  it("renders custom empty message", () => {
    const { Wrapper } = createWrapper([]);
    render(
      <Wrapper>
        <Feed config={baseConfig({ emptyMessage: "No events found" })} />
      </Wrapper>,
    );
    expect(screen.getByText("No events found")).toBeDefined();
  });

  it("shows load more when pageSize limits items", () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      message: `Event ${i}`,
    }));
    const { Wrapper } = createWrapper(manyItems);
    render(
      <Wrapper>
        <Feed config={baseConfig({ pageSize: 10 })} />
      </Wrapper>,
    );
    expect(screen.getByText("Load more")).toBeDefined();
  });

  it("loads more items on button click", () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      message: `Event ${i}`,
    }));
    const { Wrapper } = createWrapper(manyItems);
    const { container } = render(
      <Wrapper>
        <Feed config={baseConfig({ pageSize: 10 })} />
      </Wrapper>,
    );
    const scope = within(container);
    // Before: 10 items
    expect(scope.queryByText("Event 10")).toBeNull();
    fireEvent.click(scope.getByText("Load more"));
    // After: 20 items
    expect(scope.getByText("Event 10")).toBeDefined();
  });

  it("does not show load more when all items fit on one page", () => {
    const { Wrapper } = createWrapper(testItems); // 3 items, pageSize 20
    const { container } = render(
      <Wrapper>
        <Feed config={baseConfig()} />
      </Wrapper>,
    );
    expect(within(container).queryByText("Load more")).toBeNull();
  });

  it("publishes selected item when id is set", () => {
    const { Wrapper, registry } = createWrapper();
    const publishAtom = registry.register("my-feed");
    const { container } = render(
      <Wrapper>
        <Feed config={baseConfig({ id: "my-feed" })} />
      </Wrapper>,
    );
    // Click on first item
    const firstItem = within(container)
      .getByText("Alice joined the team")
      .closest("[data-feed-item]");
    expect(firstItem).not.toBeNull();
    fireEvent.click(firstItem!);
    const published = registry.store.get(publishAtom);
    expect(published).toBeDefined();
    expect((published as Record<string, unknown>)["message"]).toBe(
      "Alice joined the team",
    );
  });
});
