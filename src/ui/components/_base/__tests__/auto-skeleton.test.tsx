// @vitest-environment jsdom
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AutoSkeleton } from "../auto-skeleton";

afterEach(() => {
  cleanup();
});

describe("AutoSkeleton", () => {
  it("applies canonical root and block surfaces", () => {
    const { container } = render(
      <AutoSkeleton
        componentType="list"
        config={{
          id: "orders-loading-auto",
          className: "loading-root",
          variant: "list",
          rows: 2,
          slots: {
            root: { className: "root-slot" },
            row: { className: "row-slot" },
            block: { className: "block-slot" },
          },
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="orders-loading-auto"]')?.className,
    ).toContain("loading-root");
    expect(
      container.querySelector('[data-snapshot-id="orders-loading-auto"]')?.className,
    ).toContain("root-slot");
    expect(
      container.querySelector('[data-snapshot-id="orders-loading-auto-row-0"]')?.className,
    ).toContain("row-slot");
    expect(
      container.querySelector('[data-snapshot-id="orders-loading-auto-block-avatar-0"]')?.className,
    ).toContain("block-slot");
  });
});
