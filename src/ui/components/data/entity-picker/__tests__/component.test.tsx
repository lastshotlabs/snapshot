// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  AppRegistryContext,
  PageRegistryContext,
} from "../../../../context/providers";
import { EntityPicker } from "../component";

const executeSpy = vi.fn();

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

afterEach(() => {
  cleanup();
});

describe("EntityPicker", () => {
  it("selects an entity and publishes the resulting value", () => {
    executeSpy.mockReset();
    const registry = new AtomRegistryImpl();

    render(
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          <EntityPicker
            config={{
              type: "entity-picker",
              id: "assignee",
              className: "entity-picker-root",
              data: "/api/users" as never,
              descriptionField: "email",
              changeAction: { type: "assign" } as never,
            }}
          />
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>,
    );

    expect(screen.getByTestId("entity-picker").classList.contains("entity-picker-root")).toBe(
      true,
    );
    fireEvent.click(screen.getByTestId("entity-picker-trigger"));
    fireEvent.click(screen.getAllByTestId("entity-picker-item")[0]!);

    expect(executeSpy).toHaveBeenCalledWith({ type: "assign" }, { value: "u1" });
    const publishedAtom = registry.get("assignee");
    expect(publishedAtom).toBeTruthy();
    expect(registry.store.get(publishedAtom!)).toEqual({ value: "u1" });
  });

  it("renders a ref-backed trigger label before selection", () => {
    const registry = new AtomRegistryImpl();
    const pickerAtom = registry.register("picker");
    registry.store.set(pickerAtom, { label: "Assign reviewer" });

    render(
      <AppRegistryContext.Provider value={null}>
        <PageRegistryContext.Provider value={registry}>
          <EntityPicker
            config={{
              type: "entity-picker",
              id: "reviewer",
              data: "/api/users" as never,
              label: { from: "picker.label" },
            }}
          />
        </PageRegistryContext.Provider>
      </AppRegistryContext.Provider>,
    );

    expect(screen.getByText("Assign reviewer")).toBeTruthy();
    fireEvent.click(screen.getByTestId("entity-picker-trigger"));
    expect(screen.getByTestId("entity-picker-dropdown")).toBeTruthy();
  });
});
