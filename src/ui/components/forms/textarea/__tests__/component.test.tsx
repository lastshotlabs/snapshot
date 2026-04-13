// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => vi.fn(),
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => vi.fn(),
}));

describe("Textarea", () => {
  it("shows the character count and required validation feedback", () => {
    render(
      <Textarea
        config={{
          type: "textarea",
          id: "notes",
          label: "Notes",
          required: true,
          maxLength: 10,
        }}
      />,
    );

    const textarea = screen.getByRole("textbox");
    expect(screen.getByText("0/10")).toBeTruthy();

    fireEvent.blur(textarea);

    expect(screen.getByRole("alert").textContent).toBe("This field is required");
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
  });
});
