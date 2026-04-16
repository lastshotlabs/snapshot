/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const EMPTY: string[] = [];
const subscribedValues: Record<string, unknown> = {
  "copy.tagSelectorLabel": "Skills",
};

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => {
    if (typeof value === "object" && value !== null && "from" in value) {
      return subscribedValues[(value as { from: string }).from];
    }

    if (Array.isArray(value) && value.length === 0) {
      return EMPTY;
    }

    return value;
  },
  usePublish: () => vi.fn(),
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => vi.fn(),
}));

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

import { TagSelector } from "../component";

afterEach(() => {
  cleanup();
});

describe("TagSelector", () => {
  it("selects an available tag from the dropdown", () => {
    render(
      <TagSelector
        config={{
          type: "tag-selector",
          id: "skill-tags",
          className: "tag-selector-root",
          label: { from: "copy.tagSelectorLabel" },
          tags: [
            { label: "React", value: "react" },
            { label: "TypeScript", value: "ts" },
          ],
        }}
      />,
    );

    expect(screen.getByTestId("tag-selector").classList.contains("tag-selector-root")).toBe(
      true,
    );
    expect(screen.getByText("Skills")).toBeDefined();
    const input = screen.getByTestId("tag-input");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "React" } });
    fireEvent.click(screen.getByTestId("tag-option"));

    expect(screen.getByText("React")).toBeTruthy();
  });

  it("applies canonical option and create-option label slots", () => {
    const { container } = render(
      <TagSelector
        config={{
          type: "tag-selector",
          allowCreate: true,
          tags: [
            { label: "React", value: "react" },
          ],
          slots: {
            optionLabel: { className: "option-label-slot" },
            createOptionLabel: { className: "create-option-label-slot" },
          },
        }}
      />,
    );

    const input = container.querySelector(
      '[data-snapshot-id="tag-selector-input"]',
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();
    const tagInput = input as HTMLInputElement;

    fireEvent.focus(tagInput);

    expect(
      container.querySelector('[data-snapshot-id="tag-selector-option-react-label"]')
        ?.className,
    ).toContain("option-label-slot");

    fireEvent.change(tagInput, { target: { value: "Vue" } });

    expect(
      container.querySelector('[data-snapshot-id="tag-selector-createOptionLabel"]')
        ?.className,
    ).toContain("create-option-label-slot");
  });
});
