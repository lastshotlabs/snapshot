import { describe, it, expect } from "vitest";
// Register the component schemas needed by the preset under test.
import { registerComponentSchema } from "../../manifest/schema";
import { statCardConfigSchema } from "../../components/data/stat-card/schema";
import { listConfigSchema } from "../../components/data/list/schema";
registerComponentSchema("stat-card", statCardConfigSchema);
registerComponentSchema("list", listConfigSchema);
import { pageConfigSchema } from "../../manifest/schema";
import { dashboardPage } from "../dashboard-page";
import type { DashboardPageOptions } from "../types";

// ── Fixtures ─────────────────────────────────────────────────────────────────

const minimalOptions: DashboardPageOptions = {
  title: "Overview",
  stats: [
    {
      label: "Total Users",
      endpoint: "GET /api/stats/users",
      valueKey: "count",
    },
  ],
};

const fullOptions: DashboardPageOptions = {
  title: "Overview",
  stats: [
    {
      label: "Total Users",
      endpoint: "GET /api/stats/users",
      valueKey: "count",
      format: "number",
      icon: "users",
      trend: { key: "change", positive: "up" },
    },
    {
      label: "Revenue",
      endpoint: "GET /api/stats/revenue",
      valueKey: "total",
      format: "currency",
      icon: "dollar-sign",
      trend: { key: "delta", positive: "down" },
    },
    {
      label: "Orders",
      endpoint: "GET /api/stats/orders",
      valueKey: "count",
      format: "number",
    },
    {
      label: "Conversion Rate",
      endpoint: "GET /api/stats/conversion",
      valueKey: "rate",
      format: "percent",
    },
  ],
  recentActivity: "GET /api/activity",
  id: "main-dashboard",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("dashboardPage", () => {
  it("returns a valid PageConfig for minimal options", () => {
    const result = dashboardPage(minimalOptions);
    expect(() => pageConfigSchema.parse(result)).not.toThrow();
  });

  it("returns a valid PageConfig for full options", () => {
    const result = dashboardPage(fullOptions);
    expect(() => pageConfigSchema.parse(result)).not.toThrow();
  });

  it("sets the page title from options", () => {
    const result = dashboardPage(minimalOptions);
    expect(result.title).toBe("Overview");
  });

  it("produces a heading component", () => {
    const result = dashboardPage(minimalOptions);
    const heading = result.content.find(
      (c) => (c as Record<string, unknown>).type === "heading",
    ) as Record<string, unknown> | undefined;
    expect(heading?.text).toBe("Overview");
  });

  it("produces a row of stat cards", () => {
    const result = dashboardPage(fullOptions);
    const row = result.content.find(
      (c) => (c as Record<string, unknown>).type === "row",
    ) as Record<string, unknown> | undefined;
    expect(row).toBeDefined();
    const children = row?.children as Record<string, unknown>[];
    expect(children.every((c) => c.type === "stat-card")).toBe(true);
    expect(children).toHaveLength(4);
  });

  it("maps stat format to stat-card config", () => {
    const result = dashboardPage(fullOptions);
    const row = result.content.find(
      (c) => (c as Record<string, unknown>).type === "row",
    ) as Record<string, unknown>;
    const children = row.children as Record<string, unknown>[];
    const revenueCard = children.find((c) => c.label === "Revenue");
    expect(revenueCard?.format).toBe("currency");
  });

  it("maps trend with positive=up to up-is-good sentiment", () => {
    const result = dashboardPage(fullOptions);
    const row = result.content.find(
      (c) => (c as Record<string, unknown>).type === "row",
    ) as Record<string, unknown>;
    const children = row.children as Record<string, unknown>[];
    const usersCard = children.find((c) => c.label === "Total Users") as Record<
      string,
      unknown
    >;
    const trend = usersCard.trend as Record<string, unknown>;
    expect(trend.sentiment).toBe("up-is-good");
  });

  it("maps trend with positive=down to up-is-bad sentiment", () => {
    const result = dashboardPage(fullOptions);
    const row = result.content.find(
      (c) => (c as Record<string, unknown>).type === "row",
    ) as Record<string, unknown>;
    const children = row.children as Record<string, unknown>[];
    const revenueCard = children.find((c) => c.label === "Revenue") as Record<
      string,
      unknown
    >;
    const trend = revenueCard.trend as Record<string, unknown>;
    expect(trend.sentiment).toBe("up-is-bad");
  });

  it("includes a list component when recentActivity endpoint is provided", () => {
    const result = dashboardPage(fullOptions);
    const list = result.content.find(
      (c) => (c as Record<string, unknown>).type === "list",
    ) as Record<string, unknown> | undefined;
    expect(list).toBeDefined();
    expect(list?.data).toBe("GET /api/activity");
  });

  it("does not include a list component when recentActivity is omitted", () => {
    const result = dashboardPage(minimalOptions);
    const list = result.content.find(
      (c) => (c as Record<string, unknown>).type === "list",
    );
    expect(list).toBeUndefined();
  });

  it("uses custom id prefix when provided", () => {
    const result = dashboardPage(fullOptions);
    const list = result.content.find(
      (c) => (c as Record<string, unknown>).type === "list",
    ) as Record<string, unknown> | undefined;
    expect(list?.id).toBe("main-dashboard-activity");
  });

  it("sets span 3 on each stat card for 4-column grid layout", () => {
    const result = dashboardPage(fullOptions);
    const row = result.content.find(
      (c) => (c as Record<string, unknown>).type === "row",
    ) as Record<string, unknown>;
    const children = row.children as Record<string, unknown>[];
    expect(children.every((c) => c.span === 3)).toBe(true);
  });

  it("maps icon onto stat card config when provided", () => {
    const result = dashboardPage(fullOptions);
    const row = result.content.find(
      (c) => (c as Record<string, unknown>).type === "row",
    ) as Record<string, unknown>;
    const children = row.children as Record<string, unknown>[];
    const usersCard = children.find((c) => c.label === "Total Users") as Record<
      string,
      unknown
    >;
    expect(usersCard.icon).toBe("users");
  });

  it("does not set icon when not provided", () => {
    const result = dashboardPage(minimalOptions);
    const row = result.content.find(
      (c) => (c as Record<string, unknown>).type === "row",
    ) as Record<string, unknown>;
    const children = row.children as Record<string, unknown>[];
    const first = children[0];
    expect(first).toBeDefined();
    expect("icon" in first!).toBe(false);
  });
});
