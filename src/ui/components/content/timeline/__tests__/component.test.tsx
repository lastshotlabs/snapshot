// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Timeline } from "../component";

const executeSpy = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => vi.fn(),
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("../../../../manifest/renderer", () => ({
  ComponentRenderer: ({ config }: { config: { id?: string; type: string } }) => (
    <div data-testid="timeline-child">{config.id ?? config.type}</div>
  ),
}));

vi.mock("../../../../icons/icon", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`timeline-icon-${name}`}>{name}</span>,
}));

describe("Timeline", () => {
  it("renders items and dispatches item actions", () => {
    executeSpy.mockReset();

    render(
      <Timeline
        config={{
          type: "timeline",
          action: { type: "open" } as never,
          items: [
            {
              title: "Created",
              description: "Record created",
              date: "2026-04-13",
              icon: "calendar",
              color: "success",
              content: [{ type: "markdown", id: "timeline-copy", content: "Details" } as never],
            },
          ],
        }}
      />,
    );

    expect(screen.getByTestId("timeline")).toBeTruthy();
    expect(screen.getByTestId("timeline-title").textContent).toBe("Created");
    expect(screen.getByTestId("timeline-child").textContent).toContain("timeline-copy");

    fireEvent.click(screen.getByTestId("timeline-item"));

    expect(executeSpy).toHaveBeenCalledWith(
      { type: "open" },
      expect.objectContaining({ title: "Created", index: 0 }),
    );
  });

  it("applies canonical slot styling to item and title surfaces", () => {
    const { container } = render(
      <Timeline
        config={{
          type: "timeline",
          items: [
            {
              title: "Created",
              slots: {
                item: { className: "timeline-item-slot" },
              },
            },
          ],
          slots: {
            title: { className: "timeline-title-slot" },
          },
        }}
      />,
    );

    expect(
      container
        .querySelector('[data-testid="timeline-item"]')
        ?.classList.contains("timeline-item-slot"),
    ).toBe(true);
    expect(
      container
        .querySelector('[data-testid="timeline-title"]')
        ?.classList.contains("timeline-title-slot"),
    ).toBe(true);
  });
});
