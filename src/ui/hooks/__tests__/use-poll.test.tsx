// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import { usePoll } from "../use-poll";

describe("usePoll", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("calls onPoll on the configured interval", () => {
    const onPoll = vi.fn();
    renderHook(() =>
      usePoll({
        interval: 1000,
        pauseWhenHidden: false,
        onPoll,
        enabled: true,
      }),
    );

    vi.advanceTimersByTime(3000);
    expect(onPoll).toHaveBeenCalledTimes(3);
  });

  it("pauses while hidden and refreshes immediately when visible again", () => {
    const onPoll = vi.fn();
    const hiddenDescriptor = Object.getOwnPropertyDescriptor(
      document,
      "hidden",
    );
    let hidden = false;
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => hidden,
    });

    renderHook(() =>
      usePoll({
        interval: 1000,
        pauseWhenHidden: true,
        onPoll,
        enabled: true,
      }),
    );

    hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
    vi.advanceTimersByTime(3000);
    expect(onPoll).toHaveBeenCalledTimes(0);

    hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
    expect(onPoll).toHaveBeenCalledTimes(1);

    if (hiddenDescriptor) {
      Object.defineProperty(document, "hidden", hiddenDescriptor);
    }
  });
});
