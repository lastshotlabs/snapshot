// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MultiSelect } from "../component";

const executeSpy = vi.fn();
const publishSpy = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => publishSpy,
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => executeSpy,
}));

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("../../../../icons/index", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`multi-select-icon-${name}`}>{name}</span>,
}));

describe("MultiSelect", () => {
  it("selects options and dispatches the change action", () => {
    executeSpy.mockReset();

    render(
      <MultiSelect
        config={{
          type: "multi-select",
          options: [
            { label: "Bug", value: "bug" },
            { label: "Docs", value: "docs" },
          ],
          changeAction: { type: "set-tags" } as never,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: /Bug/ }));

    expect(executeSpy).toHaveBeenCalledWith({ type: "set-tags" }, { value: ["bug"] });
  });
});
