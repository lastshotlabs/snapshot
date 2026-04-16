// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Input, InputControl } from "../component";

const subscribedValues: Record<string, unknown> = {
  "form.copy.label": "Email",
  "form.copy.placeholder": "you@example.com",
  "form.copy.helper": "We will never share your email",
};

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) =>
    typeof value === "object" && value !== null && "from" in value
      ? subscribedValues[(value as { from: string }).from]
      : value,
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
    const { container } = render(
      <Input
        config={{
          type: "input",
          id: "email",
          className: "input-root-class",
          label: { from: "form.copy.label" },
          placeholder: { from: "form.copy.placeholder" },
          helperText: { from: "form.copy.helper" },
          required: true,
          slots: {
            root: { className: "input-root-slot" },
          },
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="email"]')?.className,
    ).toContain("input-root-class");
    expect(
      container.querySelector('[data-snapshot-id="email"]')?.className,
    ).toContain("input-root-slot");
    expect(screen.getByText("Email")).toBeDefined();

    const input = screen.getByRole("textbox");
    expect(input.getAttribute("placeholder")).toBe("you@example.com");
    fireEvent.blur(input);

    expect(screen.getByRole("alert").textContent).toBe("This field is required");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("merges direct control overrides through the shared surface path", () => {
    render(
      <InputControl
        surfaceId="search-control"
        ariaLabel="Search"
        className="input-direct-class"
        style={{ paddingLeft: "3rem" }}
        itemSurfaceConfig={{ className: "input-item-class" }}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Search" });
    expect(input.className).toContain("input-direct-class");
    expect(input.className).toContain("input-item-class");
    expect(input.style.paddingLeft).toBe("3rem");
  });
});
