// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EntityPicker } from "../component";

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
    data: [
      { id: "u1", name: "Ada Lovelace", email: "ada@example.com" },
      { id: "u2", name: "Grace Hopper", email: "grace@example.com" },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("../../../../icons/index", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`entity-icon-${name}`}>{name}</span>,
}));

describe("EntityPicker", () => {
  it("selects an entity and publishes the resulting value", () => {
    executeSpy.mockReset();
    publishSpy.mockReset();

    render(
      <EntityPicker
        config={{
          type: "entity-picker",
          id: "assignee",
          data: "/api/users" as never,
          descriptionField: "email",
          changeAction: { type: "assign" } as never,
        }}
      />,
    );

    fireEvent.click(screen.getByTestId("entity-picker-trigger"));
    fireEvent.click(screen.getAllByTestId("entity-picker-item")[0]!);

    expect(executeSpy).toHaveBeenCalledWith({ type: "assign" }, { value: "u1" });
    expect(publishSpy).toHaveBeenCalledWith({ value: "u1" });
  });
});
