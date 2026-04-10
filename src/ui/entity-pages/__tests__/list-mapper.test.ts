import "../../components/register";
import { describe, expect, it } from "vitest";
import { pageConfigSchema } from "../../manifest/schema";
import { mapEntityListPage } from "../list-mapper";
import { buildListResult } from "./fixtures";

describe("mapEntityListPage", () => {
  it("returns a valid page config", () => {
    const result = mapEntityListPage(buildListResult());
    expect(() => pageConfigSchema.parse(result.page)).not.toThrow();
  });

  it("creates a heading row and data table", () => {
    const result = mapEntityListPage(buildListResult());
    expect(result.page.content[0]).toMatchObject({ type: "row" });
    expect(result.page.content[2]).toMatchObject({ type: "data-table" });
  });

  it("maps searchable and row click behavior", () => {
    const result = mapEntityListPage(buildListResult());
    expect(result.page.content[2]).toMatchObject({
      searchable: true,
      rowClickAction: { type: "navigate", to: "/posts/{id}" },
    });
  });

  it("injects prefetched list data into route state", () => {
    const result = mapEntityListPage(buildListResult());
    expect(result.state.entityPageData?.default).toMatchObject({
      total: 2,
      page: 1,
      pageSize: 20,
    });
  });

  it("defines a list resource for client-side refreshes", () => {
    const result = mapEntityListPage(buildListResult());
    expect(
      result.resources["post-list"] ?? result.resources["posts-list"],
    ).toBeDefined();
  });
});
