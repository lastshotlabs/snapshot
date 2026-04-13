/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

vi.mock("../../../../manifest/schema", () => ({
  componentConfigSchema: z.object({ type: z.string() }).passthrough(),
}));

import { splitPaneConfigSchema } from "../schema";

describe("splitPaneConfigSchema", () => {
  it("accepts canonical split-pane slots", () => {
    const result = splitPaneConfigSchema.safeParse({
      type: "split-pane",
      children: [{ type: "text", value: "Left" }, { type: "text", value: "Right" }],
      slots: {
        root: { className: "split-root" },
        divider: { className: "split-divider" },
      },
    });

    expect(result.success).toBe(true);
  });
});
