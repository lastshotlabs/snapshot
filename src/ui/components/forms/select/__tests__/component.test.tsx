// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Select, SelectControl } from "../component";

vi.mock("../../../../context/hooks", () => ({
  usePublish: () => null,
  useSubscribe: (value: unknown) => value,
}));

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => ({
    data: [{ id: "us", name: "United States" }],
    isLoading: false,
  }),
}));

describe("Select", () => {
  it("renders resource-backed options using the configured fields", () => {
    const { container } = render(
      <Select
        config={{
          type: "select",
          id: "country-select",
          className: "select-root-class",
          options: { resource: "countries" },
          valueField: "id",
          labelField: "name",
          slots: {
            root: { className: "select-root-slot" },
          },
        }}
      />,
    );

    expect(
      container.querySelector('[data-snapshot-id="country-select"]')?.className,
    ).toContain("select-root-class");
    expect(
      container.querySelector('[data-snapshot-id="country-select"]')?.className,
    ).toContain("select-root-slot");
    expect(screen.getByRole("option", { name: "United States" })).toBeDefined();
  });

  it("applies placeholder and updates the selected value", () => {
    render(
      <Select
        config={{
          type: "select",
          options: [
            { label: "One", value: "1" },
            { label: "Two", value: "2" },
          ],
          placeholder: "Choose one",
        }}
      />,
    );

    const select = screen.getByLabelText("Choose one") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "2" } });
    expect(select.value).toBe("2");
  });

  it("merges direct control overrides through the shared surface path", () => {
    render(
      <SelectControl
        surfaceId="country-control"
        ariaLabel="Country"
        value=""
        className="select-direct-class"
        style={{ paddingRight: "2.5rem" }}
        itemSurfaceConfig={{ className: "select-item-class" }}
      >
        <option value="">Choose</option>
      </SelectControl>,
    );

    const select = screen.getByRole("combobox", { name: "Country" });
    expect(select.className).toContain("select-direct-class");
    expect(select.className).toContain("select-item-class");
    expect((select as HTMLSelectElement).style.paddingRight).toBe("2.5rem");
  });
});
