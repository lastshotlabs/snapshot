// @vitest-environment jsdom
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  FloatingMenu,
  FloatingPanel,
  FloatingMenuStyles,
  MenuItem,
  MenuLabel,
  MenuSeparator,
} from "../component";

const execute = vi.fn();

vi.mock("../../../../context", () => ({
  useSubscribe: () => null,
  useResolveFrom: <T extends Record<string, unknown>>(value: T) => value,
}));

vi.mock("../../../../manifest/runtime", () => ({
  useManifestRuntime: () => null,
  useRouteRuntime: () => null,
}));

vi.mock("../../../../actions/executor", async () => {
  const actual =
    await vi.importActual<typeof import("../../../../actions/executor")>(
      "../../../../actions/executor"
    );
  return {
    ...actual,
    useActionExecutor: () => execute,
  };
});

describe("floating-menu primitives", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    execute.mockReset();
  });

  it("renders an open floating panel and closes on Escape", () => {
    const onClose = vi.fn();
    const containerRef = createRef<HTMLDivElement>();

    render(
      <div ref={containerRef}>
        <FloatingPanel
          open
          onClose={onClose}
          containerRef={containerRef}
          surfaceId="menu-panel"
          testId="menu-panel"
        >
          <div>Panel body</div>
        </FloatingPanel>
      </div>,
    );

    vi.runAllTimers();
    const panel = screen.getByTestId("menu-panel");
    expect(panel).toBeTruthy();
    expect(panel.getAttribute("style")).toContain("var(--sn-color-popover");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("renders menu item, label, and separator with primitive semantics", () => {
    const onClick = vi.fn();

    render(
      <div>
        <FloatingMenuStyles />
        <MenuLabel text="Actions" surfaceId="menu-label" />
        <MenuItem
          label="Edit"
          onClick={onClick}
          current
          active
          surfaceId="menu-item"
        />
        <MenuSeparator surfaceId="menu-separator" />
      </div>,
    );

    const item = screen.getByRole("menuitem", { name: "Edit" });
    expect(item.getAttribute("data-active")).toBe("true");
    expect(item.getAttribute("data-current")).toBe("true");
    expect(item.getAttribute("data-snapshot-id")).toBe("menu-item");
    expect((item as HTMLButtonElement).style.cursor).toBe("pointer");
    expect(screen.getByText("Actions")).toBeTruthy();
    expect(screen.getByRole("separator")).toBeTruthy();

    fireEvent.click(item);
    expect(onClick).toHaveBeenCalled();
  });

  it("prevents clicks for disabled menu items", () => {
    const onClick = vi.fn();

    render(<MenuItem label="Disabled" onClick={onClick} disabled surfaceId="disabled-item" />);

    const item = screen.getByRole("menuitem", { name: "Disabled" });
    expect(item.getAttribute("aria-disabled")).toBe("true");

    fireEvent.click(item);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders the manifest floating-menu and executes item actions", () => {
    render(
      <FloatingMenu
        config={{
          type: "floating-menu",
          triggerLabel: "Actions",
          items: [
            { type: "label", text: "Project" },
            {
              type: "item",
              label: "Rename",
              action: { type: "navigate", to: "/rename" },
            },
          ],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Rename" }));

    expect(execute).toHaveBeenCalledWith({
      type: "navigate",
      to: "/rename",
    });
  });

  it("applies canonical open-state styling to the panel surface", () => {
    render(
      <FloatingMenu
        config={{
          type: "floating-menu",
          triggerLabel: "Actions",
          items: [{ type: "item", label: "Rename" }],
          slots: {
            panel: {
              states: {
                open: {
                  className: "menu-panel-open",
                },
              },
            },
          },
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Actions" }));
    vi.runAllTimers();

    const panel = document.querySelector('[data-floating-panel]');
    expect(panel?.className).toContain("menu-panel-open");
  });

  it("opens from the trigger keyboard interaction and moves DOM focus through items", async () => {
    render(
      <FloatingMenu
        config={{
          type: "floating-menu",
          triggerLabel: "Actions",
          items: [
            {
              type: "item",
              label: "Rename",
              action: { type: "navigate", to: "/rename" },
            },
            {
              type: "item",
              label: "Duplicate",
              action: { type: "navigate", to: "/duplicate" },
            },
          ],
        }}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Actions" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    vi.runAllTimers();
    await Promise.resolve();

    const rename = screen.getByRole("menuitem", { name: "Rename" });
    expect(rename.getAttribute("tabindex")).toBe("0");
    expect(rename.getAttribute("data-active")).toBe("true");

    fireEvent.keyDown(rename, { key: "ArrowDown" });
    const duplicate = screen.getByRole("menuitem", { name: "Duplicate" });
    await Promise.resolve();
    expect(duplicate.getAttribute("tabindex")).toBe("0");
    expect(duplicate.getAttribute("data-active")).toBe("true");

    fireEvent.keyDown(duplicate, { key: "Enter" });
    await Promise.resolve();
    expect(execute).toHaveBeenCalledWith({
      type: "navigate",
      to: "/duplicate",
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});
