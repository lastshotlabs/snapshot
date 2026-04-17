// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "../component";
import { afterEach } from "vitest";

const executeSpy = vi.fn();
const refValues: Record<string, unknown> = {
  "state.calendar.launch": "Launch week",
  "state.calendar.today": "Jump to today",
};

function resolveRefs<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => resolveRefs(entry)) as T;
  }
  if (value && typeof value === "object") {
    if ("from" in (value as Record<string, unknown>)) {
      return refValues[((value as unknown) as { from: string }).from] as T;
    }
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        resolveRefs(entry),
      ]),
    ) as T;
  }
  return value;
}

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => ({
    data: null,
    isLoading: false,
    error: null,
  }),
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    value && typeof value === "object" && "from" in (value as Record<string, unknown>)
      ? refValues[(value as { from: string }).from]
      : value,
  useResolveFrom: (value: unknown) => resolveRefs(value),
}));

afterEach(() => {
  cleanup();
  executeSpy.mockReset();
});

describe("Calendar", () => {
  it("dispatches event actions when an event is clicked", () => {
    executeSpy.mockReset();

    render(
      <Calendar
        config={{
          type: "calendar",
          id: "team-calendar",
          className: "calendar-root",
          events: [{ title: "Launch", date: "2026-04-13", color: "success" }],
          eventAction: { type: "open-event" } as never,
        }}
      />,
    );

    expect(
      document
        .querySelector('[data-snapshot-id="team-calendar"]')
        ?.classList.contains("calendar-root"),
    ).toBe(true);
    fireEvent.click(screen.getByText("Launch"));

    expect(executeSpy).toHaveBeenCalledWith(
      { type: "open-event" },
      expect.objectContaining({ title: "Launch", date: "2026-04-13" }),
    );
  });

  it("renders ref-backed event titles and today label", () => {
    render(
      <Calendar
        config={{
          type: "calendar",
          todayLabel: { from: "state.calendar.today" } as never,
          events: [{ title: { from: "state.calendar.launch" } as never, date: "2026-04-13", color: "success" }],
        }}
      />,
    );

    expect(screen.getByText("Launch week")).toBeTruthy();
    expect(screen.getByText("Jump to today")).toBeTruthy();
  });
});
