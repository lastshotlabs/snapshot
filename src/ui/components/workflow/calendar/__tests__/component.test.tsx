// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "../component";

const executeSpy = vi.fn();

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
  useSubscribe: (value: unknown) => value,
}));

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
});
