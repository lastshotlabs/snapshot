import { describe, expect, it } from "vitest";
import {
  defaultAuthFormSlots,
  defaultAuthOAuthButtonSlots,
  withDefaultAuthFormSlots,
  withDefaultAuthOAuthButtonSlots,
} from "../auth-surfaces";

describe("auth surface presets", () => {
  it("applies auth form slot defaults", () => {
    const config = withDefaultAuthFormSlots({ type: "form" });

    expect(config.slots).toEqual(defaultAuthFormSlots);
  });

  it("applies oauth button slot defaults", () => {
    const config = withDefaultAuthOAuthButtonSlots({ type: "oauth-buttons" });

    expect(config.slots).toEqual(defaultAuthOAuthButtonSlots);
  });

  it("preserves explicit slot overrides", () => {
    const config = withDefaultAuthFormSlots({
      type: "form",
      slots: {
        submitButton: {
          style: {
            width: "auto",
          },
        },
      },
    });

    expect(config.slots.actions).toEqual(defaultAuthFormSlots.actions);
    expect(config.slots.submitButton).toEqual({
      style: {
        width: "auto",
      },
    });
  });
});
