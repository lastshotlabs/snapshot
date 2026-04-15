/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

const EMPTY: string[] = [];

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => {
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

describe("TagSelector", () => {
  it("selects an available tag from the dropdown", () => {
    render(
      <TagSelector
        config={{
          type: "tag-selector",
          tags: [
            { label: "React", value: "react" },
            { label: "TypeScript", value: "ts" },
          ],
        }}
      />,
    );

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

    const input = screen.getByTestId("tag-input");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Vue" } });

    expect(
      container.querySelector('[data-snapshot-id="tag-selector-option-react-label"]')
        ?.className,
    ).toContain("option-label-slot");
    expect(
      container.querySelector('[data-snapshot-id="tag-selector-createOptionLabel"]')
        ?.className,
    ).toContain("create-option-label-slot");
  });
});
