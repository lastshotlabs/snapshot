/**
 * Runtime token editor hook.
 *
 * `useTokenEditor()` provides runtime overrides for design tokens via
 * `document.documentElement.style.setProperty()`. Changes are instant
 * and take priority over CSS file declarations (inline > class specificity).
 */

import { useCallback, useEffect, useRef } from "react";
import type { ThemeConfig, TokenEditor } from "./types";
import { getFlavor } from "./flavors";
import { colorToOklch, oklchToString } from "./color";
import { deriveDarkVariant } from "./derive-dark";
import { resolveTokens } from "./resolve";
import { useManifestRuntime } from "../manifest/runtime";
import { buildRequestUrl, resolveEndpointTarget } from "../manifest/resources";

// ── Token path -> CSS variable mapping ───────────────────────────────────────

const TOKEN_PATH_MAP: Record<string, string> = {
  "colors.primary": "--sn-color-primary",
  "colors.secondary": "--sn-color-secondary",
  "colors.muted": "--sn-color-muted",
  "colors.accent": "--sn-color-accent",
  "colors.destructive": "--sn-color-destructive",
  "colors.success": "--sn-color-success",
  "colors.warning": "--sn-color-warning",
  "colors.info": "--sn-color-info",
  "colors.background": "--sn-color-background",
  "colors.card": "--sn-color-card",
  "colors.popover": "--sn-color-popover",
  "colors.sidebar": "--sn-color-sidebar",
  "colors.border": "--sn-color-border",
  "colors.input": "--sn-color-input",
  "colors.ring": "--sn-color-ring",
  radius: "--sn-radius-md",
  spacing: "--sn-spacing-md",
  "font.sans": "--sn-font-sans",
  "font.mono": "--sn-font-mono",
  "font.display": "--sn-font-display",
  "font.baseSize": "--sn-font-size-base",
  "font.scale": "--sn-font-scale",
  "components.card.shadow": "--sn-card-shadow",
  "components.card.padding": "--sn-card-padding",
  "components.card.border": "--sn-card-border",
  "components.table.density": "--sn-table-density",
  "components.table.striped": "--sn-table-stripe-bg",
  "components.button.weight": "--sn-button-weight",
  "components.button.uppercase": "--sn-button-transform",
  "components.input.size": "--sn-input-height",
  "components.input.variant": "--sn-input-variant",
  "components.modal.overlay": "--sn-modal-overlay",
  "components.modal.animation": "--sn-modal-animation",
  "components.nav.variant": "--sn-nav-variant",
  "components.nav.activeIndicator": "--sn-nav-active-indicator",
  "components.badge.variant": "--sn-badge-variant",
  "components.badge.rounded": "--sn-badge-radius",
  "components.toast.position": "--sn-toast-position",
  "components.toast.animation": "--sn-toast-animation",
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

const TOKEN_EDITOR_STORAGE_KEY = "snapshot.token-editor.overrides";
const TOKEN_EDITOR_DARK_STYLE_ID = "snapshot-token-editor-dark";

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
  // Color paths: convert to oklch CSS function
  if (path.startsWith("colors.")) {
    const [l, c, h] = colorToOklch(value);
    return `oklch(${oklchToString(l, c, h)})`;
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

type PersistTarget = NonNullable<NonNullable<ThemeConfig["editor"]>["persist"]>;

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

function mapToPersistedOverrides(
  overrides: Map<string, string>,
): Record<string, string> {
  return Object.fromEntries(overrides.entries());
}

function parsePersistedOverrides(value: string | null): Record<string, string> | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const next: Record<string, string> = {};
    for (const [key, entry] of Object.entries(parsed)) {
      if (typeof entry === "string") {
        next[key] = entry;
      }
    }

    return next;
  } catch {
    return null;
  }
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
  const manifestRuntime = useManifestRuntime();
  const overridesRef = useRef<Map<string, string>>(new Map());
  const currentFlavorRef = useRef<string>("neutral");
  const listenersRef = useRef<Set<Listener>>(new Set());
  const appliedFlavorVarsRef = useRef<string[]>([]);
  const persistTarget: PersistTarget =
    manifestRuntime?.theme?.editor?.persist ?? "localStorage";

  const renderDarkOverrides = useCallback(() => {
    if (typeof document === "undefined") {
      return;
    }

    const darkEntries = [...overridesRef.current.entries()].filter(([path]) =>
      path.startsWith("darkColors."),
    );
    const existing = document.getElementById(
      TOKEN_EDITOR_DARK_STYLE_ID,
    ) as HTMLStyleElement | null;

    if (darkEntries.length === 0) {
      existing?.remove();
      return;
    }

    const declarations = darkEntries
      .map(([path, value]) => {
        const tokenName = path.slice("darkColors.".length);
        const [l, c, h] = colorToOklch(value);
        return `  --sn-color-${tokenName}: oklch(${oklchToString(l, c, h)});`;
      })
      .join("\n");

    const element =
      existing ??
      (() => {
        const next = document.createElement("style");
        next.id = TOKEN_EDITOR_DARK_STYLE_ID;
        document.head.appendChild(next);
        return next;
      })();

    element.textContent = `.dark {\n${declarations}\n}`;
  }, []);

  const notifyListeners = useCallback(() => {
    const current = mapToThemeConfig(overridesRef.current);
    for (const listener of listenersRef.current) {
      listener(current);
    }
  }, []);

  const persistOverrides = useCallback(
    (next: Record<string, string>) => {
      if (persistTarget === "none") {
        return;
      }

      if (persistTarget === "localStorage" || persistTarget === "sessionStorage") {
        if (typeof window === "undefined") {
          return;
        }
        const storage =
          persistTarget === "localStorage"
            ? window.localStorage
            : window.sessionStorage;
        if (Object.keys(next).length === 0) {
          storage.removeItem(TOKEN_EDITOR_STORAGE_KEY);
          return;
        }
        storage.setItem(TOKEN_EDITOR_STORAGE_KEY, JSON.stringify(next));
        return;
      }

      if (!manifestRuntime?.resources?.[persistTarget.resource]) {
        return;
      }

      const request = resolveEndpointTarget(
        { resource: persistTarget.resource },
        manifestRuntime.resources,
      );
      const endpoint = buildRequestUrl(request.endpoint, request.params);
      void fetch(endpoint, {
        method: request.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ overrides: next }),
      });
    },
    [manifestRuntime?.resources, persistTarget],
  );

  const persistCurrentOverrides = useCallback(() => {
    persistOverrides(mapToPersistedOverrides(overridesRef.current));
  }, [persistOverrides]);

  const applyOverride = useCallback((path: string, value: string) => {
    if (path.startsWith("darkColors.")) {
      overridesRef.current.set(path, value);
      renderDarkOverrides();
      return;
    }

    const cssVar = tokenPathToCssVar(path);
    const cssValue = convertToCssValue(path, value);
    document.documentElement.style.setProperty(cssVar, cssValue);
    overridesRef.current.set(path, value);
  }, [renderDarkOverrides]);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      let restored: Record<string, string> | null = null;

      if (persistTarget === "localStorage" || persistTarget === "sessionStorage") {
        if (typeof window !== "undefined") {
          const storage =
            persistTarget === "localStorage"
              ? window.localStorage
              : window.sessionStorage;
          restored = parsePersistedOverrides(
            storage.getItem(TOKEN_EDITOR_STORAGE_KEY),
          );
        }
      } else if (typeof persistTarget === "object") {
        if (!manifestRuntime?.resources?.[persistTarget.resource]) {
          return;
        }

        const request = resolveEndpointTarget(
          { resource: persistTarget.resource },
          manifestRuntime.resources,
          undefined,
          "GET",
        );
        const endpoint = buildRequestUrl(request.endpoint, request.params);
        const response = await fetch(endpoint, {
          method: request.method,
          credentials: "include",
        });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          overrides?: Record<string, unknown>;
        };
        if (payload.overrides && typeof payload.overrides === "object") {
          restored = Object.fromEntries(
            Object.entries(payload.overrides).filter(
              (entry): entry is [string, string] =>
                typeof entry[1] === "string",
            ),
          );
        }
      }

      if (cancelled || !restored) {
        return;
      }

      for (const path of overridesRef.current.keys()) {
        try {
          const cssVar = tokenPathToCssVar(path);
          document.documentElement.style.removeProperty(cssVar);
        } catch {
          // Ignore unknown paths during cleanup
        }
      }
      overridesRef.current.clear();

      for (const [path, value] of Object.entries(restored)) {
        applyOverride(path, value);
      }
      notifyListeners();
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [applyOverride, manifestRuntime?.resources, notifyListeners, persistTarget]);

  const setToken = useCallback(
    (path: string, value: string) => {
      applyOverride(path, value);

      // Keep dark overrides aligned with light color changes unless explicitly set.
      if (path.startsWith("colors.")) {
        const darkPath = `darkColors.${path.slice("colors.".length)}`;
        if (!overridesRef.current.has(darkPath)) {
          applyOverride(darkPath, deriveDarkVariant(value));
        }
      }

      notifyListeners();
      persistCurrentOverrides();
    },
    [applyOverride, notifyListeners, persistCurrentOverrides],
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
    document.getElementById(TOKEN_EDITOR_DARK_STYLE_ID)?.remove();

    notifyListeners();
    persistCurrentOverrides();
  }, [notifyListeners, persistCurrentOverrides]);

  const setFlavor = useCallback(
    (flavorName: string) => {
      const flavor = getFlavor(flavorName);
      if (!flavor) {
        throw new Error(`Unknown flavor: "${flavorName}"`);
      }

      // Remove all current overrides and flavor vars
      resetTokens();

      // Regenerate full CSS via resolveTokens — the correct approach per CLAUDE.md.
      // This ensures dark mode, foreground pairs, and all derived tokens update correctly.
      const css = resolveTokens({ flavor: flavorName });
      const styleId = "snapshot-tokens";
      if (typeof document !== "undefined") {
        let el = document.getElementById(styleId) as HTMLStyleElement | null;
        if (!el) {
          el = document.createElement("style");
          el.id = styleId;
          document.head.appendChild(el);
        }
        el.textContent = css;
      }

      currentFlavorRef.current = flavorName;
      notifyListeners();
      persistCurrentOverrides();
    },
    [notifyListeners, persistCurrentOverrides, resetTokens],
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
