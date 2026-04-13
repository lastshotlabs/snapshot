// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "../component";

const executeSpy = vi.fn();
const publishSpy = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => publishSpy,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

describe("DatePicker", () => {
  it("dispatches formatted values when a date is selected", () => {
    executeSpy.mockReset();

    render(
      <DatePicker
        config={{
          type: "date-picker",
          mode: "single",
          valueFormat: "iso",
          onChange: { type: "set-date" } as never,
        }}
      />,
    );

    const input = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2026-04-13" } });

    expect(executeSpy).toHaveBeenCalledWith(
      { type: "set-date" },
      { value: "2026-04-13T00:00:00.000Z" },
    );
  });
});
