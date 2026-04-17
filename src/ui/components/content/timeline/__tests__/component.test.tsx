// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Timeline } from "../component";

const executeSpy = vi.fn();
const refValues: Record<string, unknown> = {
  "timelineState.title": "Resolved title",
  "timelineState.description": "Resolved description",
};

function resolveRefs<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => resolveRefs(entry)) as T;
  }

  if (
    value &&
    typeof value === "object" &&
    "from" in (value as Record<string, unknown>) &&
    typeof (value as unknown as { from: unknown }).from === "string"
  ) {
    return refValues[(value as unknown as { from: string }).from] as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        resolveRefs(entry),
      ]),
    ) as T;
  }

  return value;
}

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    value &&
    typeof value === "object" &&
    "from" in (value as Record<string, unknown>)
      ? refValues[(value as { from: string }).from]
      : value,
  usePublish: () => vi.fn(),
  useResolveFrom: <T,>(value: T) => resolveRefs(value),
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

afterEach(() => {
  cleanup();
});

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

  it("applies canonical slot styling to grouped item surfaces", () => {
    const { container } = render(
      <Timeline
        config={{
          type: "timeline",
          id: "activity-timeline",
          className: "timeline-root-class",
          items: [
            {
              title: "Created",
              slots: {
                item: { className: "timeline-item-slot" },
              },
            },
          ],
          slots: {
            root: { className: "timeline-root-slot" },
            header: { className: "timeline-header-slot" },
            title: { className: "timeline-title-slot" },
          },
        }}
      />,
    );

    expect(
      container
        .querySelector('[data-snapshot-id="activity-timeline-root"]')
        ?.classList.contains("timeline-root-class"),
    ).toBe(true);
    expect(
      container
        .querySelector('[data-snapshot-id="activity-timeline-root"]')
        ?.classList.contains("timeline-root-slot"),
    ).toBe(true);
    expect(
      container
        .querySelector('[data-testid="timeline-item"]')
        ?.classList.contains("timeline-item-slot"),
    ).toBe(true);
    expect(
      container
        .querySelector('[data-snapshot-id="activity-timeline-item-0-header"]')
        ?.classList.contains("timeline-header-slot"),
    ).toBe(true);
    expect(
      container
        .querySelector('[data-testid="timeline-title"]')
        ?.classList.contains("timeline-title-slot"),
    ).toBe(true);
  });

  it("renders ref-backed static item copy", () => {
    render(
      <Timeline
        config={{
          type: "timeline",
          items: [
            {
              title: { from: "timelineState.title" } as never,
              description: { from: "timelineState.description" } as never,
            },
          ],
        }}
      />,
    );

    expect(screen.getByTestId("timeline-title").textContent).toBe(
      "Resolved title",
    );
    expect(screen.getByTestId("timeline-description").textContent).toBe(
      "Resolved description",
    );
  });
});
