// @vitest-environment happy-dom
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Spacer } from "../component";

describe("Spacer", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders vertical spacing by default", () => {
    const { container } = render(<Spacer config={{ type: "spacer" }} />);
    const element = container.firstElementChild as HTMLElement;

    expect(element.getAttribute("style")).toContain("var(--sn-spacing-md");
    expect(element.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders horizontal spacing when requested", () => {
    const { container } = render(
      <Spacer
        config={{
          type: "spacer",
          id: "inline-gap",
          axis: "horizontal",
          size: "lg",
          className: "spacer-root-class",
          slots: {
            root: { className: "spacer-root-slot" },
          },
        }}
      />,
    );
    const element = container.firstElementChild as HTMLElement;

    expect(element.getAttribute("style")).toContain("var(--sn-spacing-lg");
    expect(element.className).toContain("spacer-root-class");
    expect(element.className).toContain("spacer-root-slot");
  });
});
