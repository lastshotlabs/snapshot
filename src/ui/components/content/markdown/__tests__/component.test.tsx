// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Markdown } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => vi.fn(),
}));

describe("Markdown", () => {
  it("renders markdown headings and links", () => {
    const { container } = render(
      <Markdown
        config={{
          type: "markdown",
          id: "docs",
          className: "markdown-root",
          maxHeight: "320px",
          content: "# Welcome\n\nVisit [Snapshot](https://example.com).",
        }}
      />,
    );

    const root = container.querySelector('[data-snapshot-id="docs"]') as HTMLElement | null;
    expect(root?.className).toContain("markdown-root");
    expect(root?.style.maxHeight).toBe("320px");
    expect(root?.style.overflowY).toBe("auto");
    expect(screen.getByRole("heading", { name: "Welcome" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Snapshot" }).getAttribute("href")).toBe(
      "https://example.com",
    );
  });
});
