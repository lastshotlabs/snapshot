/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTokenEditor } from "../editor";

// Spy on actual document.documentElement.style methods
let setPropertySpy: ReturnType<typeof vi.fn>;
let removePropertySpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  // Clear any inline styles from previous tests
  document.documentElement.removeAttribute("style");

  setPropertySpy = vi.fn(
    document.documentElement.style.setProperty.bind(
      document.documentElement.style,
    ),
  );
  document.documentElement.style.setProperty =
    setPropertySpy as typeof document.documentElement.style.setProperty;

  removePropertySpy = vi.fn(
    document.documentElement.style.removeProperty.bind(
      document.documentElement.style,
    ),
  );
  document.documentElement.style.removeProperty =
    removePropertySpy as typeof document.documentElement.style.removeProperty;
});

describe("useTokenEditor", () => {
  it("returns all expected methods", () => {
    const { result } = renderHook(() => useTokenEditor());
    expect(result.current.setToken).toBeTypeOf("function");
    expect(result.current.setFlavor).toBeTypeOf("function");
    expect(result.current.resetTokens).toBeTypeOf("function");
    expect(result.current.getTokens).toBeTypeOf("function");
    expect(result.current.currentFlavor).toBeTypeOf("function");
    expect(result.current.subscribe).toBeTypeOf("function");
  });

  describe("setToken", () => {
    it("sets a color token as inline style", () => {
      const { result } = renderHook(() => useTokenEditor());

      act(() => {
        result.current.setToken("colors.primary", "#ff0000");
      });

      expect(setPropertySpy).toHaveBeenCalledWith(
        "--sn-color-primary",
        expect.stringContaining(" "),
      );
    });

    it("sets a radius token", () => {
      const { result } = renderHook(() => useTokenEditor());

      act(() => {
        result.current.setToken("radius", "lg");
      });

      expect(setPropertySpy).toHaveBeenCalledWith("--sn-radius-md", "0.75rem");
    });

    it("sets a spacing token", () => {
      const { result } = renderHook(() => useTokenEditor());

      act(() => {
        result.current.setToken("spacing", "compact");
      });

      expect(setPropertySpy).toHaveBeenCalledWith("--sn-spacing-md", "0.75");
    });

    it("sets a font token", () => {
      const { result } = renderHook(() => useTokenEditor());

      act(() => {
        result.current.setToken("font.sans", "Inter");
      });

      expect(setPropertySpy).toHaveBeenCalledWith("--sn-font-sans", "Inter");
    });

    it("throws on unknown token path", () => {
      const { result } = renderHook(() => useTokenEditor());

      expect(() => {
        act(() => {
          result.current.setToken("unknown.path", "value");
        });
      }).toThrow("Unknown token path");
    });
  });

  describe("getTokens", () => {
    it("returns empty object when no overrides", () => {
      const { result } = renderHook(() => useTokenEditor());
      expect(result.current.getTokens()).toEqual({});
    });

    it("returns current overrides as manifest-compatible config", () => {
      const { result } = renderHook(() => useTokenEditor());

      act(() => {
        result.current.setToken("colors.primary", "#ff0000");
        result.current.setToken("radius", "lg");
        result.current.setToken("font.sans", "Inter");
      });

      const tokens = result.current.getTokens();
      expect(tokens.colors).toBeDefined();
      expect(tokens.colors!.primary).toBe("#ff0000");
      expect(tokens.radius).toBe("lg");
      expect(tokens.font).toBeDefined();
      expect(tokens.font!.sans).toBe("Inter");
    });

    it("returns component overrides", () => {
      const { result } = renderHook(() => useTokenEditor());

      act(() => {
        result.current.setToken("components.card.shadow", "lg");
      });

      const tokens = result.current.getTokens();
      expect(tokens.components).toBeDefined();
      expect(
        (tokens.components as Record<string, Record<string, string>>)?.card
          ?.shadow,
      ).toBe("lg");
    });
  });

  describe("resetTokens", () => {
    it("removes all overrides", () => {
      const { result } = renderHook(() => useTokenEditor());

      act(() => {
        result.current.setToken("colors.primary", "#ff0000");
        result.current.setToken("radius", "lg");
      });

      act(() => {
        result.current.resetTokens();
      });

      expect(removePropertySpy).toHaveBeenCalledWith("--sn-color-primary");
      expect(removePropertySpy).toHaveBeenCalledWith("--sn-radius-md");
      expect(result.current.getTokens()).toEqual({});
    });
  });

  describe("setFlavor", () => {
    it("applies a flavor's tokens via injected style element", () => {
      const { result } = renderHook(() => useTokenEditor());

      act(() => {
        result.current.setFlavor("violet");
      });

      // setFlavor now regenerates full CSS via resolveTokens() and injects
      // it into a <style id="snapshot-tokens"> element instead of using
      // inline styles on document.documentElement.
      const styleEl = document.getElementById("snapshot-tokens");
      expect(styleEl).not.toBeNull();
      expect(styleEl?.textContent).toContain(":root");
      expect(styleEl?.textContent).toContain("--sn-color-primary");
      expect(result.current.currentFlavor()).toBe("violet");
    });

    it("throws for unknown flavor", () => {
      const { result } = renderHook(() => useTokenEditor());

      expect(() => {
        act(() => {
          result.current.setFlavor("nonexistent");
        });
      }).toThrow("Unknown flavor");
    });

    it("defaults to neutral", () => {
      const { result } = renderHook(() => useTokenEditor());
      expect(result.current.currentFlavor()).toBe("neutral");
    });
  });

  describe("subscribe", () => {
    it("notifies listener on setToken", () => {
      const { result } = renderHook(() => useTokenEditor());
      const listener = vi.fn();

      act(() => {
        result.current.subscribe(listener);
      });

      act(() => {
        result.current.setToken("colors.primary", "#ff0000");
      });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          colors: expect.objectContaining({ primary: "#ff0000" }),
        }),
      );
    });

    it("notifies listener on resetTokens", () => {
      const { result } = renderHook(() => useTokenEditor());
      const listener = vi.fn();

      act(() => {
        result.current.setToken("colors.primary", "#ff0000");
        result.current.subscribe(listener);
      });

      act(() => {
        result.current.resetTokens();
      });

      expect(listener).toHaveBeenCalled();
    });

    it("returns unsubscribe function", () => {
      const { result } = renderHook(() => useTokenEditor());
      const listener = vi.fn();
      let unsub: () => void;

      act(() => {
        unsub = result.current.subscribe(listener);
      });

      act(() => {
        result.current.setToken("colors.primary", "#ff0000");
      });

      expect(listener).toHaveBeenCalledTimes(1);

      act(() => {
        unsub();
      });

      act(() => {
        result.current.setToken("colors.secondary", "#00ff00");
      });

      // Should not be called again after unsubscribe
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("supports multiple listeners", () => {
      const { result } = renderHook(() => useTokenEditor());
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      act(() => {
        result.current.subscribe(listener1);
        result.current.subscribe(listener2);
      });

      act(() => {
        result.current.setToken("radius", "lg");
      });

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });
});
