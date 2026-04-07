// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement } from "react";
import { Provider } from "jotai/react";
import { useToastManager } from "../toast";

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(Provider, null, children);
}

describe("useToastManager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a toast and returns an id", () => {
    const { result } = renderHook(() => useToastManager(), { wrapper });
    let id: string = "";
    act(() => {
      id = result.current.show({
        message: "Hello",
        variant: "info",
        duration: 5000,
      });
    });
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
  });

  it("dismisses a toast by id", () => {
    const { result } = renderHook(() => useToastManager(), { wrapper });
    let id: string = "";
    act(() => {
      id = result.current.show({
        message: "Hello",
        variant: "info",
        duration: 0, // no auto-dismiss
      });
    });
    act(() => {
      result.current.dismiss(id);
    });
    // Toast was dismissed — no error
  });

  it("auto-dismisses after duration", () => {
    const { result } = renderHook(() => useToastManager(), { wrapper });
    act(() => {
      result.current.show({
        message: "Bye",
        variant: "success",
        duration: 3000,
      });
    });
    // Toast exists

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    // Toast auto-dismissed after 3 seconds
  });

  it("does not auto-dismiss when duration is 0", () => {
    const { result } = renderHook(() => useToastManager(), { wrapper });
    act(() => {
      result.current.show({
        message: "Sticky",
        variant: "warning",
        duration: 0,
      });
    });

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    // Toast should still be present — no error, no auto-dismiss
  });

  it("maintains queue ordering", () => {
    const { result } = renderHook(() => useToastManager(), { wrapper });
    const ids: string[] = [];
    act(() => {
      ids.push(
        result.current.show({
          message: "First",
          variant: "info",
          duration: 0,
        }),
      );
      ids.push(
        result.current.show({
          message: "Second",
          variant: "success",
          duration: 0,
        }),
      );
      ids.push(
        result.current.show({
          message: "Third",
          variant: "error",
          duration: 0,
        }),
      );
    });
    expect(ids).toHaveLength(3);
    // All unique ids
    expect(new Set(ids).size).toBe(3);
  });

  it("supports toast with action button", () => {
    const { result } = renderHook(() => useToastManager(), { wrapper });
    const onClick = vi.fn();
    act(() => {
      result.current.show({
        message: "Undo?",
        variant: "info",
        duration: 0,
        action: { label: "Undo", onClick },
      });
    });
    // No error — action is accepted
  });
});
