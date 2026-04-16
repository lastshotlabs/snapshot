// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocationInput } from "../component";

vi.mock("../../../../context/hooks", () => ({
  useSubscribe: (value: unknown) => value,
  usePublish: () => vi.fn(),
}));

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => vi.fn(),
}));

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => ({ data: [], isLoading: false }),
}));

vi.mock("../../../../icons/index", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

describe("LocationInput", () => {
  it("renders the label, input, and helper text", () => {
    render(
      <LocationInput
        config={{
          type: "location-input",
          id: "office",
          searchEndpoint: { resource: "locations" },
          label: "Office",
          helperText: "Search for an address",
        }}
      />,
    );

    expect(screen.getByText("Office")).toBeDefined();
    expect(screen.getByTestId("location-search")).toBeDefined();
    expect(screen.getByText("Search for an address")).toBeDefined();
  });

  it("applies distinct helper and error surfaces", () => {
    const { container } = render(
      <LocationInput
        config={{
          type: "location-input",
          id: "office",
          className: "location-root-class",
          searchEndpoint: { resource: "locations" },
          helperText: "Search for an address",
          errorText: "Location is required",
          slots: {
            root: { className: "location-root-slot" },
            helper: { className: "helper-slot" },
            error: { className: "error-slot" },
          },
        }}
      />,
    );

    expect(screen.getByText("Location is required")).toBeDefined();
    expect(
      container.querySelector('[data-snapshot-id="office"]')?.className,
    ).toContain("location-root-class");
    expect(
      container.querySelector('[data-snapshot-id="office"]')?.className,
    ).toContain("location-root-slot");
    expect(container.querySelector('[data-snapshot-id="office-helper"]')).toBeNull();
    expect(
      container.querySelector('[data-snapshot-id="office-error"]')?.className,
    ).toContain("error-slot");
  });
});
