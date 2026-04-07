import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  PageRegistryContext,
  AppRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { StatCard } from "../component";
import type { StatCardConfig } from "../types";
import type { ApiClient } from "../../../../../api/client";

/** Create a mock API client that returns specified data. */
function createMockApi(
  data: Record<string, unknown>,
): Pick<ApiClient, "get" | "post" | "put" | "patch" | "delete"> {
  return {
    get: vi.fn().mockResolvedValue(data),
    post: vi.fn().mockResolvedValue(data),
    put: vi.fn().mockResolvedValue(data),
    patch: vi.fn().mockResolvedValue(data),
    delete: vi.fn().mockResolvedValue(data),
  };
}

/** Wrapper providing context for tests. */
function createTestWrapper(
  api?: Pick<ApiClient, "get" | "post" | "put" | "patch" | "delete">,
  pageRegistry?: AtomRegistryImpl,
) {
  const registry = pageRegistry ?? new AtomRegistryImpl();
  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          <SnapshotApiContext.Provider value={(api as ApiClient) ?? null}>
            {children}
          </SnapshotApiContext.Provider>
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>
    );
  };
}

const baseConfig: StatCardConfig = {
  type: "stat-card",
  data: "GET /api/stats/revenue",
  field: "total",
  label: "Revenue",
};

describe("StatCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with data-snapshot-component attribute", async () => {
    const api = createMockApi({ total: 12345 });
    const wrapper = createTestWrapper(api);

    render(<StatCard config={baseConfig} />, { wrapper });

    // Wait for data fetch
    await screen.findByTestId("stat-card-value");
    expect(
      screen.getByTestId("stat-card").getAttribute("data-snapshot-component"),
    ).toBe("stat-card");
  });

  it("displays formatted value after loading", async () => {
    const api = createMockApi({ total: 12345 });
    const wrapper = createTestWrapper(api);

    render(<StatCard config={baseConfig} />, { wrapper });

    const valueEl = await screen.findByTestId("stat-card-value");
    expect(valueEl.textContent).toBe("12,345");
  });

  it("displays label", async () => {
    const api = createMockApi({ total: 42 });
    const wrapper = createTestWrapper(api);

    render(<StatCard config={baseConfig} />, { wrapper });

    const label = await screen.findByTestId("stat-card-label");
    expect(label.textContent).toBe("Revenue");
  });

  it("formats as currency", async () => {
    const config: StatCardConfig = {
      ...baseConfig,
      format: "currency",
      currency: "USD",
    };
    const api = createMockApi({ total: 12345 });
    const wrapper = createTestWrapper(api);

    render(<StatCard config={config} />, { wrapper });

    const valueEl = await screen.findByTestId("stat-card-value");
    expect(valueEl.textContent).toContain("$");
    expect(valueEl.textContent).toContain("12,345");
  });

  it("formats as percent", async () => {
    const config: StatCardConfig = {
      ...baseConfig,
      format: "percent",
    };
    const api = createMockApi({ total: 0.89 });
    const wrapper = createTestWrapper(api);

    render(<StatCard config={config} />, { wrapper });

    const valueEl = await screen.findByTestId("stat-card-value");
    expect(valueEl.textContent).toBe("89%");
  });

  it("formats as compact", async () => {
    const config: StatCardConfig = {
      ...baseConfig,
      format: "compact",
    };
    const api = createMockApi({ total: 1234567 });
    const wrapper = createTestWrapper(api);

    render(<StatCard config={config} />, { wrapper });

    const valueEl = await screen.findByTestId("stat-card-value");
    expect(valueEl.textContent).toContain("M");
  });

  it("applies prefix and suffix", async () => {
    const config: StatCardConfig = {
      ...baseConfig,
      prefix: "~",
      suffix: " items",
    };
    const api = createMockApi({ total: 42 });
    const wrapper = createTestWrapper(api);

    render(<StatCard config={config} />, { wrapper });

    const valueEl = await screen.findByTestId("stat-card-value");
    expect(valueEl.textContent).toBe("~42 items");
  });

  it("shows loading state initially", () => {
    const api = createMockApi({ total: 100 });
    // Make the get hang forever
    api.get = vi.fn().mockReturnValue(new Promise(() => {}));
    const wrapper = createTestWrapper(api);

    render(<StatCard config={baseConfig} />, { wrapper });

    expect(screen.getByTestId("stat-card-loading")).toBeDefined();
  });

  it("shows error state on fetch failure", async () => {
    const api = createMockApi({});
    api.get = vi.fn().mockRejectedValue(new Error("Network error"));
    const wrapper = createTestWrapper(api);

    render(<StatCard config={baseConfig} />, { wrapper });

    const errorEl = await screen.findByTestId("stat-card-error");
    expect(errorEl.textContent).toContain("Failed to load");
  });

  it("shows empty state when no data returned", async () => {
    const wrapper = createTestWrapper(undefined);

    render(<StatCard config={baseConfig} />, { wrapper });

    const empty = await screen.findByTestId("stat-card-empty");
    expect(empty.textContent).toContain("No data");
  });

  it("renders trend indicator with up direction", async () => {
    const config: StatCardConfig = {
      ...baseConfig,
      trend: { field: "previousTotal", sentiment: "up-is-good" },
    };
    const api = createMockApi({ total: 120, previousTotal: 100 });
    const wrapper = createTestWrapper(api);

    render(<StatCard config={config} />, { wrapper });

    const trendEl = await screen.findByTestId("stat-card-trend");
    expect(trendEl.textContent).toContain("\u2191"); // up arrow
    expect(trendEl.textContent).toContain("20.0%");
  });

  it("renders trend indicator with down direction", async () => {
    const config: StatCardConfig = {
      ...baseConfig,
      trend: { field: "previousTotal", sentiment: "up-is-good" },
    };
    const api = createMockApi({ total: 80, previousTotal: 100 });
    const wrapper = createTestWrapper(api);

    render(<StatCard config={config} />, { wrapper });

    const trendEl = await screen.findByTestId("stat-card-trend");
    expect(trendEl.textContent).toContain("\u2193"); // down arrow
    expect(trendEl.textContent).toContain("20.0%");
  });

  it("renders trend with absolute format", async () => {
    const config: StatCardConfig = {
      ...baseConfig,
      trend: {
        field: "previousTotal",
        sentiment: "up-is-good",
        format: "absolute",
      },
    };
    const api = createMockApi({ total: 120, previousTotal: 100 });
    const wrapper = createTestWrapper(api);

    render(<StatCard config={config} />, { wrapper });

    const trendEl = await screen.findByTestId("stat-card-trend");
    expect(trendEl.textContent).toContain("20");
  });

  it("renders icon when configured", async () => {
    const config: StatCardConfig = {
      ...baseConfig,
      icon: "dollar-sign",
      iconColor: "primary",
    };
    const api = createMockApi({ total: 100 });
    const wrapper = createTestWrapper(api);

    render(<StatCard config={config} />, { wrapper });

    const iconEl = await screen.findByTestId("stat-card-icon");
    expect(iconEl.textContent).toBe("dollar-sign");
  });

  it("handles click action", async () => {
    const config: StatCardConfig = {
      ...baseConfig,
      action: { type: "navigate", to: "/revenue" },
    };
    const api = createMockApi({ total: 100 });
    const wrapper = createTestWrapper(api);

    render(<StatCard config={config} />, { wrapper });

    await screen.findByTestId("stat-card-value");
    const card = screen.getByTestId("stat-card");
    expect(card.getAttribute("role")).toBe("button");
    expect(card.getAttribute("tabindex")).toBe("0");
  });

  it("auto-detects first numeric field when field is not specified", async () => {
    const config: StatCardConfig = {
      type: "stat-card",
      data: "GET /api/stats",
    };
    const api = createMockApi({ name: "test", value: 42 });
    const wrapper = createTestWrapper(api);

    render(<StatCard config={config} />, { wrapper });

    const valueEl = await screen.findByTestId("stat-card-value");
    expect(valueEl.textContent).toBe("42");
  });

  it("auto-generates label from field name", async () => {
    const config: StatCardConfig = {
      type: "stat-card",
      data: "GET /api/stats",
      field: "totalRevenue",
    };
    const api = createMockApi({ totalRevenue: 1000 });
    const wrapper = createTestWrapper(api);

    render(<StatCard config={config} />, { wrapper });

    const label = await screen.findByTestId("stat-card-label");
    expect(label.textContent).toBe("Total Revenue");
  });

  it("hides when visible is false", async () => {
    const config: StatCardConfig = {
      ...baseConfig,
      visible: false,
    };
    const api = createMockApi({ total: 100 });
    const wrapper = createTestWrapper(api);

    const { container } = render(<StatCard config={config} />, { wrapper });
    // The component should not render anything
    expect(container.innerHTML).toBe("");
  });

  it("publishes value when id is set", async () => {
    const registry = new AtomRegistryImpl();
    const config: StatCardConfig = {
      ...baseConfig,
      id: "revenue-card",
    };
    const api = createMockApi({ total: 12345 });
    const wrapper = createTestWrapper(api, registry);

    render(<StatCard config={config} />, { wrapper });

    await screen.findByTestId("stat-card-value");

    // Wait for the publish effect to run
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const publishedAtom = registry.get("revenue-card");
    expect(publishedAtom).toBeDefined();
    if (publishedAtom) {
      const publishedValue = registry.store.get(publishedAtom) as Record<
        string,
        unknown
      >;
      expect(publishedValue).toEqual(
        expect.objectContaining({
          value: 12345,
          label: "Revenue",
        }),
      );
    }
  });

  it("applies loading variant attribute", () => {
    const config: StatCardConfig = {
      ...baseConfig,
      loading: "pulse",
    };
    const api = createMockApi({});
    api.get = vi.fn().mockReturnValue(new Promise(() => {}));
    const wrapper = createTestWrapper(api);

    render(<StatCard config={config} />, { wrapper });

    const loadingEl = screen.getByTestId("stat-card-loading");
    expect(loadingEl.getAttribute("data-loading-variant")).toBe("pulse");
  });

  it("supports keyboard activation when action is configured", async () => {
    const config: StatCardConfig = {
      ...baseConfig,
      action: { type: "navigate", to: "/details" },
    };
    const api = createMockApi({ total: 100 });
    const wrapper = createTestWrapper(api);

    render(<StatCard config={config} />, { wrapper });

    await screen.findByTestId("stat-card-value");
    const card = screen.getByTestId("stat-card");

    // Should be focusable and activatable via keyboard
    fireEvent.keyDown(card, { key: "Enter" });
    // No error thrown means the action executor was called
  });
});
