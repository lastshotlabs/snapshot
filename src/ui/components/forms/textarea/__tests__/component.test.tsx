// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Textarea, TextareaControl } from "../component";

const subscribedValues: Record<string, unknown> = {
  "editor.copy.label": "Notes",
  "editor.copy.placeholder": "Add your notes",
  "editor.copy.helper": "Keep it concise",
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

describe("Textarea", () => {
  it("shows the character count and required validation feedback", () => {
    const { container } = render(
      <Textarea
        config={{
          type: "textarea",
          id: "notes",
          className: "textarea-root-class",
          label: { from: "editor.copy.label" },
          placeholder: { from: "editor.copy.placeholder" },
          helperText: { from: "editor.copy.helper" },
          required: true,
          maxLength: 10,
          slots: {
            root: { className: "textarea-root-slot" },
          },
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="notes"]')?.className,
    ).toContain("textarea-root-class");
    expect(
      container.querySelector('[data-snapshot-id="notes"]')?.className,
    ).toContain("textarea-root-slot");
    expect(screen.getByText("Notes")).toBeDefined();

    const textarea = screen.getByRole("textbox");
    expect(textarea.getAttribute("placeholder")).toBe("Add your notes");
    expect(screen.getByText("0/10")).toBeTruthy();

    fireEvent.blur(textarea);

    expect(screen.getByRole("alert").textContent).toBe("This field is required");
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
  });

  it("merges direct control overrides through the shared surface path", () => {
    render(
      <TextareaControl
        surfaceId="notes-control"
        ariaLabel="Notes control"
        value=""
        className="textarea-direct-class"
        style={{ paddingTop: "2rem" }}
        itemSurfaceConfig={{ className: "textarea-item-class" }}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "Notes control" });
    expect(textarea.className).toContain("textarea-direct-class");
    expect(textarea.className).toContain("textarea-item-class");
    expect(textarea.style.paddingTop).toBe("2rem");
  });
});
