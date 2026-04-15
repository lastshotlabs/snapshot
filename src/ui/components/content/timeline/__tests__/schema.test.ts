// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { timelineConfigSchema } from "../schema";

describe("timelineConfigSchema", () => {
  it("accepts a timeline config with static items", () => {
    const result = timelineConfigSchema.safeParse({
      type: "timeline",
      items: [
        {
          title: "Created",
          description: "Record created",
          date: "2026-04-13",
          color: "primary",
          slots: {
            item: {
              className: "timeline-item",
            },
          },
        },
      ],
      variant: "default",
      showConnector: true,
      slots: {
        loadingState: {
          className: "timeline-loading",
        },
        header: {
          className: "timeline-header",
        },
        title: {
          className: "timeline-title",
        },
      },
    });

    expect(result.success).toBe(true);
  });
});
