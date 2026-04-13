/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../context", () => ({
  useSubscribe: () => null,
}));

vi.mock("../../../../manifest/runtime", () => ({
  useManifestRuntime: () => null,
  useRouteRuntime: () => null,
}));

import { Text } from "../component";

describe("Text", () => {
  it("renders canonical root slot styling on the primitive root", () => {
    render(
      <Text
        config={{
          type: "text",
          value: "Hello world",
          variant: "default",
          size: "md",
          weight: "normal",
          align: "left",
          slots: {
            root: {
              className: "text-slot",
              color: "var(--sn-color-primary)",
            },
          },
        }}
      />,
    );

    const element = screen.getByText("Hello world");
    expect(element.className).toContain("text-slot");
    expect(element.getAttribute("style")).toContain(
      "color: var(--sn-color-primary)",
    );
  });
});
