import { describe, expect, it } from "vitest";
import { stepperConfigSchema } from "../schema";

describe("stepperConfigSchema", () => {
  it("accepts canonical root and item slots", () => {
    const result = stepperConfigSchema.safeParse({
      type: "stepper",
      steps: [
        {
          title: "Account",
          slots: {
            item: { className: "step-item" },
            marker: { className: "step-marker" },
          },
        },
      ],
      slots: {
        root: { className: "stepper-root" },
        content: { className: "stepper-content" },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts disabled steps", () => {
    const result = stepperConfigSchema.safeParse({
      type: "stepper",
      steps: [
        {
          title: "Account",
          disabled: true,
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("accepts ref-backed step copy", () => {
    const result = stepperConfigSchema.safeParse({
      type: "stepper",
      steps: [
        {
          title: { from: "stepperState.title" },
          description: { from: "stepperState.description" },
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
