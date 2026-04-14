// @vitest-environment jsdom
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HoverCard } from "../component";

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { id?: string; type: string } }) => (
    <div>{config.id ?? config.type}</div>
  ),
}));

describe("HoverCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens after the configured delay", () => {
    const { container } = render(
      <HoverCard
        config={{
          type: "hover-card",
          openDelay: 100,
          trigger: { type: "markdown", id: "hover-trigger", content: "Open" } as never,
          content: [{ type: "markdown", id: "hover-body", content: "Body" } as never],
        }}
      />,
    );

    fireEvent.pointerEnter(screen.getByText("hover-trigger").parentElement!);
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(container.querySelector('[data-snapshot-id="hover-card-panel"]')).toBeTruthy();
  });

  it("anchors the hover card to a positioned root", () => {
    const { container } = render(
      <HoverCard
        config={{
          type: "hover-card",
          trigger: { type: "markdown", id: "hover-trigger", content: "Open" } as never,
          content: [{ type: "markdown", id: "hover-body", content: "Body" } as never],
        }}
      />,
    );

    const root = container.querySelector('[data-snapshot-id="hover-card-root"]');
    expect((root as HTMLElement | null)?.style.position).toBe("relative");
  });
});
