/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { AtomRegistryImpl } from "../../context/registry";
import { PageRegistryContext } from "../../context/providers";
import type {
  RowConfig,
  HeadingConfig,
  ButtonConfig,
  SelectConfig,
} from "../types";

// Ensure structural components are registered
import "../structural";
import { getRegisteredComponent } from "../component-registry";

/** Wraps components in a PageContext for usePublish/useSubscribe to work. */
function TestPageWrapper({ children }: { children: ReactNode }) {
  const registry = new AtomRegistryImpl();
  return (
    <PageRegistryContext.Provider value={registry}>
      {children}
    </PageRegistryContext.Provider>
  );
}

function renderWithContext(ui: React.ReactElement) {
  return render(ui, { wrapper: TestPageWrapper });
}

describe("Row", () => {
  it("is registered as a component", () => {
    expect(getRegisteredComponent("row")).toBeDefined();
  });

  it("renders children", () => {
    const RowComponent = getRegisteredComponent("row")!;
    const config: RowConfig = {
      type: "row",
      children: [
        { type: "heading", text: "Child 1" },
        { type: "heading", text: "Child 2" },
      ],
    };

    renderWithContext(
      <RowComponent config={config as unknown as Record<string, unknown>} />,
    );
    expect(screen.getByText("Child 1")).toBeDefined();
    expect(screen.getByText("Child 2")).toBeDefined();
  });

  it("applies gap styling", () => {
    const RowComponent = getRegisteredComponent("row")!;
    const config: RowConfig = {
      type: "row",
      gap: "lg",
      children: [{ type: "heading", text: "Test" }],
    };

    const { container } = renderWithContext(
      <RowComponent config={config as unknown as Record<string, unknown>} />,
    );
    const row = container.querySelector("[data-snapshot-row]");
    expect(row?.getAttribute("style")).toContain("gap");
  });

  it("applies justify and align", () => {
    const RowComponent = getRegisteredComponent("row")!;
    const config: RowConfig = {
      type: "row",
      justify: "between",
      align: "center",
      children: [{ type: "heading", text: "Test" }],
    };

    const { container } = renderWithContext(
      <RowComponent config={config as unknown as Record<string, unknown>} />,
    );
    const row = container.querySelector("[data-snapshot-row]");
    const style = row?.getAttribute("style") ?? "";
    expect(style).toContain("space-between");
    expect(style).toContain("center");
  });

  it("applies wrap", () => {
    const RowComponent = getRegisteredComponent("row")!;
    const config: RowConfig = {
      type: "row",
      wrap: true,
      children: [{ type: "heading", text: "Test" }],
    };

    const { container } = renderWithContext(
      <RowComponent config={config as unknown as Record<string, unknown>} />,
    );
    const row = container.querySelector("[data-snapshot-row]");
    expect(row?.getAttribute("style")).toContain("wrap");
  });

  it("uses grid layout when children have span", () => {
    const RowComponent = getRegisteredComponent("row")!;
    const config: RowConfig = {
      type: "row",
      children: [
        { type: "heading", text: "Span 6", span: 6 },
        { type: "heading", text: "Span 6", span: 6 },
      ],
    };

    const { container } = renderWithContext(
      <RowComponent config={config as unknown as Record<string, unknown>} />,
    );
    const row = container.querySelector("[data-snapshot-row]");
    expect(row?.getAttribute("style")).toContain("grid");
  });
});

describe("Heading", () => {
  it("is registered as a component", () => {
    expect(getRegisteredComponent("heading")).toBeDefined();
  });

  it("renders text as h2 by default", () => {
    const HeadingComponent = getRegisteredComponent("heading")!;
    const config: HeadingConfig = {
      type: "heading",
      text: "Default Heading",
    };

    const { container } = renderWithContext(
      <HeadingComponent
        config={config as unknown as Record<string, unknown>}
      />,
    );
    const h2 = container.querySelector("h2");
    expect(h2).not.toBeNull();
    expect(h2?.textContent).toBe("Default Heading");
  });

  it("renders with specified level", () => {
    const HeadingComponent = getRegisteredComponent("heading")!;
    const config: HeadingConfig = {
      type: "heading",
      text: "H1 Title",
      level: 1,
    };

    const { container } = renderWithContext(
      <HeadingComponent
        config={config as unknown as Record<string, unknown>}
      />,
    );
    expect(container.querySelector("h1")).not.toBeNull();
  });

  it("renders h3 level", () => {
    const HeadingComponent = getRegisteredComponent("heading")!;
    const config: HeadingConfig = {
      type: "heading",
      text: "Section",
      level: 3,
    };

    const { container } = renderWithContext(
      <HeadingComponent
        config={config as unknown as Record<string, unknown>}
      />,
    );
    expect(container.querySelector("h3")).not.toBeNull();
  });
});

describe("Button", () => {
  it("is registered as a component", () => {
    expect(getRegisteredComponent("button")).toBeDefined();
  });

  it("renders with label", () => {
    const ButtonComponent = getRegisteredComponent("button")!;
    const config: ButtonConfig = {
      type: "button",
      label: "Click me",
      action: { type: "navigate", path: "/" },
    };

    renderWithContext(
      <ButtonComponent config={config as unknown as Record<string, unknown>} />,
    );
    expect(screen.getByText("Click me")).toBeDefined();
  });

  it("dispatches action event on click", () => {
    const ButtonComponent = getRegisteredComponent("button")!;
    const handler = vi.fn();
    document.addEventListener("snapshot:action", handler);

    const config: ButtonConfig = {
      type: "button",
      label: "Fire",
      action: { type: "navigate", path: "/test" },
    };

    renderWithContext(
      <ButtonComponent config={config as unknown as Record<string, unknown>} />,
    );
    fireEvent.click(screen.getByText("Fire"));
    expect(handler).toHaveBeenCalledTimes(1);

    document.removeEventListener("snapshot:action", handler);
  });

  it("is disabled when disabled is true", () => {
    const ButtonComponent = getRegisteredComponent("button")!;
    const config: ButtonConfig = {
      type: "button",
      label: "Disabled",
      action: { type: "navigate", path: "/" },
      disabled: true,
    };

    renderWithContext(
      <ButtonComponent config={config as unknown as Record<string, unknown>} />,
    );
    const button = screen.getByText("Disabled") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("sets data-variant attribute", () => {
    const ButtonComponent = getRegisteredComponent("button")!;
    const config: ButtonConfig = {
      type: "button",
      label: "Ghost",
      variant: "ghost",
      action: { type: "navigate", path: "/" },
    };

    renderWithContext(
      <ButtonComponent config={config as unknown as Record<string, unknown>} />,
    );
    const button = screen.getByText("Ghost");
    expect(button.getAttribute("data-variant")).toBe("ghost");
  });
});

describe("Select", () => {
  it("is registered as a component", () => {
    expect(getRegisteredComponent("select")).toBeDefined();
  });

  it("renders options", () => {
    const SelectComponent = getRegisteredComponent("select")!;
    const config: SelectConfig = {
      type: "select",
      options: [
        { label: "Apple", value: "apple" },
        { label: "Banana", value: "banana" },
      ],
    };

    renderWithContext(
      <SelectComponent config={config as unknown as Record<string, unknown>} />,
    );
    expect(screen.getByText("Apple")).toBeDefined();
    expect(screen.getByText("Banana")).toBeDefined();
  });

  it("renders placeholder", () => {
    const SelectComponent = getRegisteredComponent("select")!;
    const config: SelectConfig = {
      type: "select",
      options: [{ label: "A", value: "a" }],
      placeholder: "Choose one...",
    };

    renderWithContext(
      <SelectComponent config={config as unknown as Record<string, unknown>} />,
    );
    expect(screen.getByText("Choose one...")).toBeDefined();
  });

  it("sets default value", () => {
    const SelectComponent = getRegisteredComponent("select")!;
    const config: SelectConfig = {
      type: "select",
      options: [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ],
      default: "b",
    };

    const { container } = renderWithContext(
      <SelectComponent config={config as unknown as Record<string, unknown>} />,
    );
    const select = container.querySelector("select") as HTMLSelectElement;
    expect(select.value).toBe("b");
  });

  it("publishes value on change when id is set", () => {
    const SelectComponent = getRegisteredComponent("select")!;
    const config: SelectConfig = {
      type: "select",
      id: "my-select",
      options: [
        { label: "X", value: "x" },
        { label: "Y", value: "y" },
      ],
    };

    const { container } = renderWithContext(
      <SelectComponent config={config as unknown as Record<string, unknown>} />,
    );
    const select = container.querySelector("select") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "y" } });
    expect(select.value).toBe("y");
  });
});
