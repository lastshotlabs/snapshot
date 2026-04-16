// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "../component";

const executeSpy = vi.fn();
const publishSpy = vi.fn();
const subscribedValues: Record<string, unknown> = {
  "form.copy.dateLabel": "Due date",
  "form.copy.datePlaceholder": "Choose a date",
};

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    typeof value === "object" && value !== null && "from" in value
      ? subscribedValues[(value as { from: string }).from]
      : value,
  usePublish: () => publishSpy,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

describe("DatePicker", () => {
  it("dispatches formatted values when a date is selected", () => {
    executeSpy.mockReset();

    const { container } = render(
      <DatePicker
        config={{
          type: "date-picker",
          id: "publish-date",
          className: "date-root-class",
          mode: "single",
          label: { from: "form.copy.dateLabel" },
          placeholder: { from: "form.copy.datePlaceholder" },
          valueFormat: "iso",
          onChange: { type: "set-date" } as never,
          slots: {
            root: { className: "date-root-slot" },
          },
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="publish-date"]')?.className,
    ).toContain("date-root-class");
    expect(
      container.querySelector('[data-snapshot-id="publish-date"]')?.className,
    ).toContain("date-root-slot");
    expect(screen.getByText("Due date")).toBeDefined();

    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    expect(input.placeholder).toBe("Choose a date");
    fireEvent.change(input, { target: { value: "2026-04-13" } });

    expect(executeSpy).toHaveBeenCalledWith(
      { type: "set-date" },
      { value: "2026-04-13T00:00:00.000Z" },
    );
  });
});
