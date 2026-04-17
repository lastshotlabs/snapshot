/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const EMPTY: string[] = [];
const subscribedValues: Record<string, unknown> = {
  "copy.tagSelectorLabel": "Skills",
  "copy.reactLabel": "React",
  "copy.typescriptLabel": "TypeScript",
};

function resolveRefs<T>(value: T): T {
  if (typeof value === "object" && value !== null && "from" in value) {
    return subscribedValues[(value as { from: string }).from] as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveRefs(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        resolveRefs(nested),
      ]),
    ) as T;
  }

  return value;
}

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
  useResolveFrom: <T,>(value: T) => resolveRefs(value),
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
            { label: { from: "copy.reactLabel" }, value: "react" },
            { label: { from: "copy.typescriptLabel" }, value: "ts" },
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
