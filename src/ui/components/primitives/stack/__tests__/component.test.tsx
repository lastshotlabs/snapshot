/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { type: string; id?: string } }) => (
    <div>{config.id ?? config.type}</div>
  ),
}));

import { Stack } from "../component";

describe("Stack", () => {
  it("renders canonical root and item surfaces", () => {
    render(
      <Stack
        config={{
          type: "stack",
          id: "stack-test",
          gap: "md",
          align: "stretch",
          justify: "start",
          children: [{ type: "text", id: "child-a", value: "Hello" }],
          slots: {
            root: { className: "stack-root-slot" },
            item: { className: "stack-item-slot" },
          },
        }}
      />,
    );

    const root = document.querySelector('[data-snapshot-component="stack"]');
    expect(root?.className).toContain("stack-root-slot");
    const item = document.querySelector('[data-snapshot-id="stack-test-item-0"]');
    expect(item?.className).toContain("stack-item-slot");
    expect(screen.getByText("child-a")).toBeTruthy();
  });
});
