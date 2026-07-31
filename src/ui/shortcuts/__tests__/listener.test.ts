// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerShortcuts } from "../listener";

describe("registerShortcuts", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("fires single shortcuts immediately", () => {
    const executor = vi.fn();
    const cleanup = registerShortcuts(
      {
        "ctrl+k": {
          action: { type: "open-modal", modal: "palette" },
        },
      },
      executor,
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }),
    );

    expect(executor).toHaveBeenCalledWith({
      type: "open-modal",
      modal: "palette",
    });
    cleanup();
  });

  it("fires chord shortcuts when the full sequence is entered", () => {
    const executor = vi.fn();
    const cleanup = registerShortcuts(
      {
        "g then d": {
          action: { type: "navigate", to: "/dashboard" },
        },
      },
      executor,
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "g", bubbles: true }),
    );
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "d", bubbles: true }),
    );

    expect(executor).toHaveBeenCalledWith({
      type: "navigate",
      to: "/dashboard",
    });
    cleanup();
  });

  it("resets chord state after the timeout", () => {
    const executor = vi.fn();
    const cleanup = registerShortcuts(
      {
        "g then d": {
          action: { type: "navigate", to: "/dashboard" },
        },
      },
      executor,
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "g", bubbles: true }),
    );
    vi.advanceTimersByTime(1500);
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "d", bubbles: true }),
    );

    expect(executor).not.toHaveBeenCalled();
    cleanup();
  });
});
