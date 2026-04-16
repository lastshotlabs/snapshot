// @vitest-environment jsdom
import React, { createContext } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CommandPalette } from "../component";

const mockExecute = vi.fn();
const mockPublish = vi.fn();

vi.mock("../../../../context/hooks", () => ({
  usePublish: () => mockPublish,
  useSubscribe: (value: unknown) => value,
}));

vi.mock("../../../../actions/executor", () => ({
  SnapshotApiContext: createContext(null),
  useActionExecutor: () => mockExecute,
}));

vi.mock("../../../_base/use-component-data", () => ({
  useComponentData: () => ({ data: undefined }),
}));

vi.mock("../../../../manifest/runtime", () => ({
  useManifestRuntime: () => undefined,
}));

vi.mock("../../../../shortcuts", () => ({
  parseChord: () => [],
  matchesCombo: () => false,
}));

describe("CommandPalette", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("applies canonical panel and current-item slot styling", () => {
    render(
      <CommandPalette
        config={{
          type: "command-palette",
          id: "palette-demo",
          className: "palette-root",
          visible: true,
          autoRegisterShortcuts: false,
          shortcut: "ctrl+k",
          maxHeight: "420px",
          groups: [
            {
              label: "Actions",
              items: [{ label: "First" }, { label: "Second" }],
            },
          ],
          slots: {
            panel: {
              className: "palette-panel-slot",
            },
            item: {
              states: {
                current: {
                  className: "palette-current-item",
                },
              },
            },
          },
        }}
      />,
    );

    act(() => {
      vi.runAllTimers();
    });

    expect(
      document
        .querySelector('[data-snapshot-id="palette-demo-root"]')
        ?.className.includes("palette-root"),
    ).toBe(true);
    expect(
      (
        document.querySelector(
          '[data-snapshot-id="palette-demo-root"]',
        ) as HTMLElement | null
      )?.style.maxHeight ?? "",
    ).toBe("");
    expect(
      (
        document.querySelector(
          '[data-snapshot-id="palette-demo-list"]',
        ) as HTMLElement | null
      )?.style.maxHeight,
    ).toBe("420px");
    expect(
      document
        .querySelector('[data-snapshot-id="palette-demo-panel"]')
        ?.className.includes("palette-panel-slot"),
    ).toBe(true);
    expect(
      document
        .querySelector('[data-snapshot-id="palette-demo-item-0"]')
        ?.className.includes("palette-current-item"),
    ).toBe(true);

    fireEvent.keyDown(
      document.querySelector('[data-snapshot-id="palette-demo-root"]')!,
      { key: "ArrowDown" },
    );

    expect(
      document
        .querySelector('[data-snapshot-id="palette-demo-item-1"]')
        ?.className.includes("palette-current-item"),
    ).toBe(true);
    expect(screen.getByText("Second")).toBeTruthy();
  });
});
