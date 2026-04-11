import { beforeAll, describe, expect, it } from "vitest";
import { bootBuiltins } from "../../manifest/boot-builtins";
import { pageConfigSchema } from "../../manifest/schema";
import { mapEntityDetailPage } from "../detail-mapper";
import { buildDetailResult } from "./fixtures";

beforeAll(() => {
  bootBuiltins();
});

describe("mapEntityDetailPage", () => {
  it("returns a valid page config", () => {
    const result = mapEntityDetailPage(buildDetailResult());
    expect(() => pageConfigSchema.parse(result.page)).not.toThrow();
  });

  it("builds heading actions for back, edit, and delete", () => {
    const result = mapEntityDetailPage(buildDetailResult());
    const header = result.page.content[0] as {
      children: Array<{ type: string; children?: Array<{ label: string }> }>;
    };
    const buttonRow = header.children[1];
    expect(buttonRow?.children?.map((button) => button.label)).toEqual([
      "Back",
      "Edit",
      "Delete",
    ]);
  });

  it("creates detail-card sections from declaration sections", () => {
    const result = mapEntityDetailPage(buildDetailResult());
    const types = result.page.content.map((component) => component.type);
    expect(types.filter((type) => type === "detail-card")).toHaveLength(2);
  });

  it("adds related table resources", () => {
    const result = mapEntityDetailPage(buildDetailResult());
    expect(result.resources["related-comment"]).toMatchObject({
      endpoint: "/comments",
      params: { postId: "1", limit: 5 },
    });
  });

  it("injects display-normalized item data into state", () => {
    const result = mapEntityDetailPage(buildDetailResult());
    expect(result.state.entityPageData?.default).toMatchObject({
      item: expect.objectContaining({
        metadata: JSON.stringify({ hero: true }, null, 2),
        tags: ["intro"],
      }),
    });
  });
});
