import { describe, expect, it } from "vitest";
import { generateTailwindBridge } from "../tailwind-bridge";

describe("generateTailwindBridge", () => {
  it("bridges the full canonical token surface", () => {
    const css = generateTailwindBridge();

    expect(css).toContain("--color-primary: var(--sn-color-primary);");
    expect(css).toContain("--color-sidebar: var(--sn-color-sidebar);");
    expect(css).toContain("--radius-none: var(--sn-radius-none);");
    expect(css).toContain("--radius-full: var(--sn-radius-full);");
    expect(css).toContain("--spacing-2xs: var(--sn-spacing-2xs);");
    expect(css).toContain("--spacing-3xl: var(--sn-spacing-3xl);");
    expect(css).toContain("--font-display: var(--sn-font-display);");
    expect(css).toContain("--text-4xl: var(--sn-font-size-4xl);");
    expect(css).toContain(
      "--font-weight-semibold: var(--sn-font-weight-semibold);",
    );
    expect(css).toContain("--shadow-xl: var(--sn-shadow-xl);");
    expect(css).toContain("--container-prose: var(--sn-container-prose);");
    expect(css).toContain("--duration-fast: var(--sn-duration-fast);");
    expect(css).toContain("--z-modal: var(--sn-z-index-modal);");
  });
});
