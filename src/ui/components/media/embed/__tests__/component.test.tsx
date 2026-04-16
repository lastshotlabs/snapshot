// @vitest-environment jsdom
import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Embed } from "../component";

describe("Embed", () => {
  it("renders an iframe with the configured source", () => {
    const { container } = render(
      <Embed
        config={{
          type: "embed",
          id: "marketing-embed",
          url: "https://example.com/embed",
          title: "Embedded content",
          className: "embed-root-class",
          slots: {
            root: { className: "embed-root-slot" },
          },
        }}
      />,
    );

    const root = container.querySelector('[data-snapshot-component="embed"]');
    expect(root?.className).toContain("embed-root-class");
    expect(root?.className).toContain("embed-root-slot");
    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toBe("https://example.com/embed");
    expect(iframe?.getAttribute("title")).toBe("Embedded content");
  });
});
