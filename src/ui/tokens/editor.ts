/**
 * Runtime token editor hook.
 *
 * `useTokenEditor()` provides runtime overrides for design tokens via
 * `document.documentElement.style.setProperty()`. Changes are instant
 * and take priority over CSS file declarations (inline > class specificity).
 */

import { useCallback, useRef } from "react";
import type { ThemeConfig, TokenEditor } from "./types";
import { getFlavor } from "./flavors";
import { colorToOklch, oklchToString } from "./color";

// ── Token path -> CSS variable mapping ───────────────────────────────────────

const TOKEN_PATH_MAP: Record<string, string> = {
  "colors.primary": "--primary",
  "colors.secondary": "--secondary",
  "colors.muted": "--muted",
  "colors.accent": "--accent",
  "colors.destructive": "--destructive",
  "colors.success": "--success",
  "colors.warning": "--warning",
  "colors.info": "--info",
  "colors.background": "--background",
  "colors.card": "--card",
  "colors.popover": "--popover",
  "colors.sidebar": "--sidebar",
  "colors.border": "--border",
  "colors.input": "--input",
  "colors.ring": "--ring",
  radius: "--radius",
  spacing: "--spacing-unit",
  "font.sans": "--font-sans",
  "font.mono": "--font-mono",
  "font.display": "--font-display",
  "font.baseSize": "--font-size-base",
  "font.scale": "--font-scale",
  "components.card.shadow": "--card-shadow",
  "components.card.padding": "--card-padding",
  "components.card.border": "--card-border",
  "components.table.density": "--table-density",
  "components.table.striped": "--table-stripe-bg",
  "components.button.weight": "--button-weight",
  "components.button.uppercase": "--button-transform",
  "components.input.size": "--input-height",
  "components.input.variant": "--input-variant",
  "components.modal.overlay": "--modal-overlay",
  "components.modal.animation": "--modal-animation",
  "components.nav.variant": "--nav-variant",
  "components.nav.activeIndicator": "--nav-active-indicator",
  "components.badge.variant": "--badge-variant",
  "components.badge.rounded": "--badge-radius",
  "components.toast.position": "--toast-position",
  "components.toast.animation": "--toast-animation",
};

const RADIUS_MAP: Record<string, string> = {
  none: "0",
  xs: "0.125rem",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
};

const SPACING_MAP: Record<string, string> = {
  compact: "0.75",
  default: "1",
  comfortable: "1.25",
  spacious: "1.5",
};

/**
 * Map a token path to its CSS variable name.
 */
function tokenPathToCssVar(path: string): string {
  const mapped = TOKEN_PATH_MAP[path];
  if (mapped) return mapped;
  throw new Error(`Unknown token path: "${path}"`);
}

/**
 * Convert a token value to its CSS representation.
 * Color values are converted to oklch strings.
 * Radius/spacing values are mapped to their CSS equivalents.
 */
function convertToCssValue(path: string, value: string): string {
  // Color paths: convert to oklch
  if (path.startsWith("colors.")) {
    const [l, c, h] = colorToOklch(value);
    return oklchToString(l, c, h);
  }

  // Radius: map enum to CSS value
  if (path === "radius") {
    return RADIUS_MAP[value] ?? value;
  }

  // Spacing: map enum to multiplier
  if (path === "spacing") {
    return SPACING_MAP[value] ?? value;
  }

  // Font size: append px
  if (path === "font.baseSize") {
    return `${value}px`;
  }

  return value;
}

type Overrides = Partial<NonNullable<ThemeConfig["overrides"]>>;
type Listener = (overrides: Overrides) => void;

/**
 * Convert the internal overrides map to a manifest-compatible config object.
 */
function mapToThemeConfig(overrides: Map<string, string>): Overrides {
  const result: Overrides = {};

  for (const [path, value] of overrides) {
    const parts = path.split(".");

    if (parts[0] === "colors" && parts.length === 2) {
      if (!result.colors) result.colors = {};
      (result.colors as Record<string, string>)[parts[1]!] = value;
    } else if (parts[0] === "darkColors" && parts.length === 2) {
      if (!result.darkColors) result.darkColors = {};
      (result.darkColors as Record<string, string>)[parts[1]!] = value;
    } else if (path === "radius") {
      result.radius = value as Overrides["radius"];
    } else if (path === "spacing") {
      result.spacing = value as Overrides["spacing"];
    } else if (parts[0] === "font" && parts.length === 2) {
      if (!result.font) result.font = {};
      (result.font as Record<string, string>)[parts[1]!] = value;
    } else if (parts[0] === "components" && parts.length === 3) {
      if (!result.components) result.components = {};
      const componentKey = parts[1]! as keyof NonNullable<
        Overrides["components"]
      >;
      if (
        !(result.components as Record<string, Record<string, string>>)[
          componentKey
        ]
      ) {
        (result.components as Record<string, Record<string, string>>)[
          componentKey
        ] = {};
      }
      (result.components as Record<string, Record<string, string>>)[
        componentKey
      ]![parts[2]!] = value;
    }
  }

  return result;
}

/**
 * Generate all CSS variable entries from a flavor's colors for runtime application.
 */
function flavorToTokenMap(flavor: {
  colors: Record<string, unknown>;
  darkColors?: Record<string, unknown>;
}): Array<[string, string]> {
  const entries: Array<[string, string]> = [];
  const colors = flavor.colors;

  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === "string") {
      const cssVar = `--${key}`;
      entries.push([cssVar, value]);
    } else if (key === "chart" && Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (typeof value[i] === "string") {
          entries.push([`--chart-${i + 1}`, value[i] as string]);
        }
      }
    }
  }

  return entries;
}

/**
 * React hook for runtime token editing.
 *
 * Provides setToken/setFlavor/resetTokens/getTokens/subscribe for live
 * theme customization. Changes are applied instantly via inline styles
 * on document.documentElement.
 *
 * @returns TokenEditor interface for runtime token manipulation
 */
export function useTokenEditor(): TokenEditor {
  const overridesRef = useRef<Map<string, string>>(new Map());
  const currentFlavorRef = useRef<string>("neutral");
  const listenersRef = useRef<Set<Listener>>(new Set());
  const appliedFlavorVarsRef = useRef<string[]>([]);

  const notifyListeners = useCallback(() => {
    const current = mapToThemeConfig(overridesRef.current);
    for (const listener of listenersRef.current) {
      listener(current);
    }
  }, []);

  const setToken = useCallback(
    (path: string, value: string) => {
      const cssVar = tokenPathToCssVar(path);
      const cssValue = convertToCssValue(path, value);
      document.documentElement.style.setProperty(cssVar, cssValue);
      overridesRef.current.set(path, value);
      notifyListeners();
    },
    [notifyListeners],
  );

  const resetTokens = useCallback(() => {
    // Remove per-token overrides
    for (const path of overridesRef.current.keys()) {
      try {
        const cssVar = tokenPathToCssVar(path);
        document.documentElement.style.removeProperty(cssVar);
      } catch {
        // Ignore unknown paths during cleanup
      }
    }
    overridesRef.current.clear();

    // Remove flavor-applied vars
    for (const cssVar of appliedFlavorVarsRef.current) {
      document.documentElement.style.removeProperty(cssVar);
    }
    appliedFlavorVarsRef.current = [];

    notifyListeners();
  }, [notifyListeners]);

  const setFlavor = useCallback(
    (flavorName: string) => {
      const flavor = getFlavor(flavorName);
      if (!flavor) {
        throw new Error(`Unknown flavor: "${flavorName}"`);
      }

      // Remove all current overrides and flavor vars
      resetTokens();

      // Apply flavor's tokens as inline styles
      const tokens = flavorToTokenMap(flavor);
      const appliedVars: string[] = [];
      for (const [cssVar, value] of tokens) {
        document.documentElement.style.setProperty(cssVar, value);
        appliedVars.push(cssVar);
      }
      appliedFlavorVarsRef.current = appliedVars;
      currentFlavorRef.current = flavorName;
      notifyListeners();
    },
    [resetTokens, notifyListeners],
  );

  const getTokens = useCallback((): Overrides => {
    return mapToThemeConfig(overridesRef.current);
  }, []);

  const currentFlavor = useCallback(() => currentFlavorRef.current, []);

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  return {
    setToken,
    setFlavor,
    resetTokens,
    getTokens,
    currentFlavor,
    subscribe,
  };
}
