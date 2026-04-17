// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MultiSelect } from "../component";

const executeSpy = vi.fn();
const publishSpy = vi.fn();
const subscribedValues: Record<string, unknown> = {
  "copy.multiSelectLabel": "Tags",
  "copy.multiSelectPlaceholder": "Select tags...",
  "copy.bugLabel": "Bug",
  "copy.docsLabel": "Docs",
};
const dataState = {
  data: null as unknown,
  isLoading: false,
  error: null as unknown,
  refetch: vi.fn(),
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
  useSubscribe: (value: unknown) =>
    typeof value === "object" && value !== null && "from" in value
      ? subscribedValues[(value as { from: string }).from]
      : value,
  usePublish: () => publishSpy,
  useResolveFrom: <T,>(value: T) => resolveRefs(value),
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => dataState,
}));

vi.mock("../../../../icons/index", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`multi-select-icon-${name}`}>{name}</span>,
}));

afterEach(() => {
  cleanup();
});

describe("MultiSelect", () => {
  it("selects options and dispatches the change action", () => {
    executeSpy.mockReset();
    dataState.data = null;
    dataState.isLoading = false;
    dataState.error = null;
    dataState.refetch = vi.fn();

    render(
      <MultiSelect
        config={{
          type: "multi-select",
          label: { from: "copy.multiSelectLabel" },
          placeholder: { from: "copy.multiSelectPlaceholder" },
          options: [
            { label: { from: "copy.bugLabel" }, value: "bug" },
            { label: { from: "copy.docsLabel" }, value: "docs" },
          ],
          on: {
            change: { type: "set-tags" } as never,
          },
        }}
      />,
    );

    expect(screen.getByText("Tags")).toBeDefined();
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Bug")).toBeDefined();
    fireEvent.click(screen.getByRole("option", { name: /Bug/ }));

    expect(executeSpy).toHaveBeenCalledWith(
      { type: "set-tags" },
      { id: undefined, value: ["bug"] },
    );
  });

  it("applies canonical error message surfaces", () => {
    dataState.data = null;
    dataState.isLoading = false;
    dataState.error = new Error("load failed");
    dataState.refetch = vi.fn();

    const { container } = render(
      <MultiSelect
        config={{
          type: "multi-select",
          id: "tag-select",
          className: "multi-select-root",
          options: [{ label: "Bug", value: "bug" }],
          slots: {
            errorMessage: { className: "error-message-slot" },
          },
        }}
      />,
    );

    const combobox = container.querySelector(
      '[data-snapshot-id="tag-select-trigger"]',
    ) as HTMLDivElement | null;
    expect(combobox).not.toBeNull();
    expect(screen.getByTestId("multi-select").classList.contains("multi-select-root")).toBe(
      true,
    );
    fireEvent.click(combobox as HTMLDivElement);

    expect(
      container.querySelector('[data-snapshot-id="tag-select-errorMessage"]')
        ?.className,
    ).toContain("error-message-slot");
  });
});
