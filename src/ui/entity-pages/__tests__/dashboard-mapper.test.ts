import "../../components/register";
import { describe, expect, it } from "vitest";
import { pageConfigSchema } from "../../manifest/schema";
import { mapEntityDashboardPage } from "../dashboard-mapper";
import { buildDashboardResult } from "./fixtures";

describe("mapEntityDashboardPage", () => {
  it("returns a valid page config", () => {
    const result = mapEntityDashboardPage(buildDashboardResult());
    expect(() => pageConfigSchema.parse(result.page)).not.toThrow();
  });

  it("creates stat cards with even spans", () => {
    const result = mapEntityDashboardPage(buildDashboardResult());
    const statRow = result.page.content[1] as {
      children: Array<{ span: number }>;
    };
    expect(statRow.children.map((child) => child.span)).toEqual([6, 6]);
  });

  it("renders chart and activity feed when data is present", () => {
    const result = mapEntityDashboardPage(buildDashboardResult());
    const types = result.page.content.map((component) => component.type);
    expect(types).toContain("chart");
    expect(types).toContain("feed");
  });

  it("stores prefetched dashboard data in route state", () => {
    const result = mapEntityDashboardPage(buildDashboardResult());
    expect(result.state.entityPageData?.default).toEqual(
      expect.objectContaining({
        stats: expect.arrayContaining([
          expect.objectContaining({ label: "Total Posts", value: 2 }),
        ]),
      }),
    );
  });
});
