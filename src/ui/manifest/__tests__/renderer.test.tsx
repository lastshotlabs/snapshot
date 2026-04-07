/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComponentRenderer, PageRenderer } from "../renderer";
import { registerComponent } from "../component-registry";
import type { PageConfig, ComponentConfig } from "../types";

// Ensure structural components are registered
import "../structural";

describe("ComponentRenderer", () => {
  it("renders a known component type", () => {
    const config: ComponentConfig = {
      type: "heading",
      text: "Test Heading",
      level: 2,
    };

    render(<ComponentRenderer config={config} />);
    expect(screen.getByText("Test Heading")).toBeDefined();
  });

  it("sets data-snapshot-component attribute", () => {
    const config: ComponentConfig = {
      type: "heading",
      text: "Attributed",
    };

    const { container } = render(<ComponentRenderer config={config} />);
    const wrapper = container.querySelector(
      '[data-snapshot-component="heading"]',
    );
    expect(wrapper).not.toBeNull();
  });

  it("returns null for unknown component types", () => {
    const config = {
      type: "nonexistent",
    } as unknown as ComponentConfig;

    const { container } = render(<ComponentRenderer config={config} />);
    expect(container.innerHTML).toBe("");
  });

  it("hides component when visible is false", () => {
    const config: ComponentConfig = {
      type: "heading",
      text: "Hidden",
      visible: false,
    };

    const { container } = render(<ComponentRenderer config={config} />);
    expect(container.innerHTML).toBe("");
  });

  it("shows component when visible is true", () => {
    const config: ComponentConfig = {
      type: "heading",
      text: "Visible",
      visible: true,
    };

    render(<ComponentRenderer config={config} />);
    expect(screen.getByText("Visible")).toBeDefined();
  });

  it("applies grid span style", () => {
    const config: ComponentConfig = {
      type: "heading",
      text: "Spanned",
      span: 6,
    };

    const { container } = render(<ComponentRenderer config={config} />);
    const wrapper = container.querySelector(
      '[data-snapshot-component="heading"]',
    );
    expect(wrapper?.getAttribute("style")).toContain("span 6");
  });

  it("applies className from config", () => {
    const config: ComponentConfig = {
      type: "heading",
      text: "Classy",
      className: "my-custom-class",
    };

    const { container } = render(<ComponentRenderer config={config} />);
    const wrapper = container.querySelector(
      '[data-snapshot-component="heading"]',
    );
    expect(wrapper?.classList.contains("my-custom-class")).toBe(true);
  });

  it("renders custom component via registry", () => {
    const MyCustom = ({ config }: { config: Record<string, unknown> }) => (
      <span>Custom Content</span>
    );
    registerComponent("test-custom-render", MyCustom);

    const config = {
      type: "test-custom-render",
    } as unknown as ComponentConfig;

    render(<ComponentRenderer config={config} />);
    expect(screen.getByText("Custom Content")).toBeDefined();
  });
});

describe("PageRenderer", () => {
  it("renders page content", () => {
    const page: PageConfig = {
      content: [
        { type: "heading", text: "Page Title", level: 1 },
        { type: "heading", text: "Subtitle", level: 2 },
      ],
    };

    render(<PageRenderer page={page} />);
    expect(screen.getByText("Page Title")).toBeDefined();
    expect(screen.getByText("Subtitle")).toBeDefined();
  });

  it("wraps content in a data-snapshot-page div", () => {
    const page: PageConfig = {
      title: "Test Page",
      content: [{ type: "heading", text: "Hello" }],
    };

    const { container } = render(<PageRenderer page={page} />);
    const pageDiv = container.querySelector('[data-snapshot-page="Test Page"]');
    expect(pageDiv).not.toBeNull();
  });

  it("renders multiple components in order", () => {
    const page: PageConfig = {
      content: [
        { type: "heading", text: "First" },
        { type: "heading", text: "Second" },
        { type: "heading", text: "Third" },
      ],
    };

    const { container } = render(<PageRenderer page={page} />);
    const headings = container.querySelectorAll("h2");
    expect(headings.length).toBe(3);
    expect(headings[0]?.textContent).toBe("First");
    expect(headings[1]?.textContent).toBe("Second");
    expect(headings[2]?.textContent).toBe("Third");
  });
});
