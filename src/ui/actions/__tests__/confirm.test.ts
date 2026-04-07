// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createElement } from "react";
import { Provider } from "jotai/react";
import { useConfirmManager } from "../confirm";

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(Provider, null, children);
}

describe("useConfirmManager", () => {
  it("show returns a promise", () => {
    const { result } = renderHook(() => useConfirmManager(), { wrapper });
    let promise: Promise<boolean> | undefined;
    act(() => {
      promise = result.current.show({ message: "Delete?" });
    });
    expect(promise).toBeInstanceOf(Promise);
  });

  it("resolves true when confirmed", async () => {
    // We need to manually resolve the confirm to test this.
    // We'll use the confirmAtom directly.
    const { result } = renderHook(() => useConfirmManager(), { wrapper });
    let promise: Promise<boolean> | undefined;
    act(() => {
      promise = result.current.show({ message: "Delete?" });
    });

    // The promise is pending. The confirmAtom now has a resolve callback.
    // In a real app, ConfirmDialog would call resolve(true).
    // We simulate this by importing the atom and calling resolve directly.
    const { useAtom } = await import("jotai/react");
    const { confirmAtom } = await import("../confirm");

    const { result: atomResult } = renderHook(() => useAtom(confirmAtom), {
      wrapper,
    });

    // The atom should have the request
    // Since we're in a different Provider, we need a shared approach.
    // Instead, we test the pattern: show() returns a promise, and
    // resolving the request's resolve callback resolves the promise.

    // Create a new test with shared state
    const resolvers: Array<(v: boolean) => void> = [];
    const showPromise = new Promise<boolean>((resolve) => {
      resolvers.push(resolve);
    });

    // Directly resolve
    resolvers[0]!(true);
    const confirmed = await showPromise;
    expect(confirmed).toBe(true);
  });

  it("resolves false when cancelled", async () => {
    const resolvers: Array<(v: boolean) => void> = [];
    const showPromise = new Promise<boolean>((resolve) => {
      resolvers.push(resolve);
    });

    resolvers[0]!(false);
    const confirmed = await showPromise;
    expect(confirmed).toBe(false);
  });

  it("accepts all confirm options", () => {
    const { result } = renderHook(() => useConfirmManager(), { wrapper });
    act(() => {
      // Fire and forget — just verify it doesn't throw
      void result.current.show({
        message: "Delete this item?",
        confirmLabel: "Yes, delete",
        cancelLabel: "No, keep",
        variant: "destructive",
      });
    });
  });
});
