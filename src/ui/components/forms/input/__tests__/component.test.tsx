// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => vi.fn(),
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => vi.fn(),
}));

vi.mock("../../../../icons/index", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid="input-icon">{name}</span>,
}));

describe("Input", () => {
  it("shows required validation feedback after blur", () => {
    render(
      <Input
        config={{
          type: "input",
          id: "email",
          label: "Email",
          required: true,
        }}
      />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.blur(input);

    expect(screen.getByRole("alert").textContent).toBe("This field is required");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });
});
