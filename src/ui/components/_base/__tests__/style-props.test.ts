import { describe, expect, it } from "vitest";
import { resolveInteractiveCSS } from "../style-props";

describe("style-props interactive css", () => {
  it("marks interactive declarations important so they can override inline base styles", () => {
    const css = resolveInteractiveCSS(
      "menu-item",
      { bg: "red", color: "white", border: "1px solid red" },
      { ring: true },
      { bg: "blue" },
    );

    expect(css).toContain("background: red !important");
    expect(css).toContain("color: white !important");
    expect(css).toContain("border: 1px solid red !important");
    expect(css).toContain("outline: 2px solid var(--sn-ring-color, var(--sn-color-primary)) !important");
    expect(css).toContain("background: blue !important");
  });
});
