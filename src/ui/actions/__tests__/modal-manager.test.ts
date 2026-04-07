// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement } from "react";
import { Provider } from "jotai/react";
import { useModalManager } from "../modal-manager";

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(Provider, null, children);
}

describe("useModalManager", () => {
  it("starts with an empty stack", () => {
    const { result } = renderHook(() => useModalManager(), { wrapper });
    expect(result.current.stack).toEqual([]);
  });

  it("opens a modal", () => {
    const { result } = renderHook(() => useModalManager(), { wrapper });
    act(() => result.current.open("edit-user"));
    expect(result.current.stack).toEqual(["edit-user"]);
    expect(result.current.isOpen("edit-user")).toBe(true);
  });

  it("opens multiple modals in stack order", () => {
    const { result } = renderHook(() => useModalManager(), { wrapper });
    act(() => {
      result.current.open("modal-a");
      result.current.open("modal-b");
    });
    expect(result.current.stack).toEqual(["modal-a", "modal-b"]);
  });

  it("closes a specific modal by id", () => {
    const { result } = renderHook(() => useModalManager(), { wrapper });
    act(() => {
      result.current.open("modal-a");
      result.current.open("modal-b");
    });
    act(() => result.current.close("modal-a"));
    expect(result.current.stack).toEqual(["modal-b"]);
    expect(result.current.isOpen("modal-a")).toBe(false);
  });

  it("closes the topmost modal when no id is provided", () => {
    const { result } = renderHook(() => useModalManager(), { wrapper });
    act(() => {
      result.current.open("modal-a");
      result.current.open("modal-b");
    });
    act(() => result.current.close());
    expect(result.current.stack).toEqual(["modal-a"]);
  });

  it("handles duplicate open — moves to top of stack", () => {
    const { result } = renderHook(() => useModalManager(), { wrapper });
    act(() => {
      result.current.open("modal-a");
      result.current.open("modal-b");
      result.current.open("modal-a"); // re-open, should move to top
    });
    expect(result.current.stack).toEqual(["modal-b", "modal-a"]);
  });

  it("isOpen returns false for non-existent modal", () => {
    const { result } = renderHook(() => useModalManager(), { wrapper });
    expect(result.current.isOpen("nonexistent")).toBe(false);
  });

  it("closing from empty stack is a no-op", () => {
    const { result } = renderHook(() => useModalManager(), { wrapper });
    act(() => result.current.close());
    expect(result.current.stack).toEqual([]);
  });

  it("closing a non-existent modal id is a no-op", () => {
    const { result } = renderHook(() => useModalManager(), { wrapper });
    act(() => result.current.open("modal-a"));
    act(() => result.current.close("nonexistent"));
    expect(result.current.stack).toEqual(["modal-a"]);
  });
});
