// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SaveIndicator } from "../component";
import type { SaveIndicatorConfig } from "../types";

describe("SaveIndicator - SSR compatibility", () => {
  it("renders to static markup without throwing", () => {
    const config: SaveIndicatorConfig = {
      type: "save-indicator",
      status: "saved",
      savedText: "Saved",
      className: "component-root",
      slots: {
        root: { className: "slot-root" },
      },
    };

    expect(() => renderToStaticMarkup(<SaveIndicator config={config} />)).not.toThrow();

    const html = renderToStaticMarkup(<SaveIndicator config={config} />);
    expect(html).toContain("component-root");
    expect(html).toContain("slot-root");
  });
});
