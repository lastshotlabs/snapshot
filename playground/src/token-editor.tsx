import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  useTokenEditor,
  getAllFlavors,
  getFlavor,
  defineFlavor,
  resolveTokens,
  oklchToHex,
  hexToOklch,
  parseOklchString,
} from "@lastshotlabs/snapshot/ui";

const COLOR_TOKENS = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "muted", label: "Muted" },
  { key: "destructive", label: "Destructive" },
  { key: "success", label: "Success" },
  { key: "warning", label: "Warning" },
  { key: "info", label: "Info" },
  { key: "background", label: "Background" },
  { key: "card", label: "Card" },
  { key: "border", label: "Border" },
] as const;

const RADIUS_OPTIONS = ["none", "xs", "sm", "md", "lg", "xl", "full"] as const;
const SPACING_OPTIONS = [
  "compact",
  "default",
  "comfortable",
  "spacious",
] as const;

/**
 * Convert an oklch string (raw "L C H" or "oklch(L C H)") to hex
 * for use as an <input type="color"> value. Returns #808080 on failure.
 */
function oklchStringToHex(raw: string): string {
  try {
    const [l, c, h] = parseOklchString(raw);
    return oklchToHex(l, c, h);
  } catch {
    return "#808080";
  }
}

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="editor-section">
      <button
        type="button"
        className="editor-section__header"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <span>{open ? "\u25B4" : "\u25BE"}</span>
      </button>
      {open && <div className="editor-section__body">{children}</div>}
    </div>
  );
}

/** Inject CSS into the snapshot-tokens style tag */
function injectCss(css: string) {
  const el = document.getElementById("snapshot-tokens");
  if (el) el.textContent = css;
}

export function TokenEditorSidebar({
  darkMode = false,
}: {
  darkMode?: boolean;
}) {
  const editor = useTokenEditor();
  const flavors = getAllFlavors();
  const [activeFlavor, setActiveFlavor] = useState("neutral");
  const [overrides, setOverrides] = useState<{
    radius?: string;
    spacing?: string;
    colors?: Record<string, string>;
    font?: { sans?: string; baseSize?: number };
  }>({});

  // Get current flavor's colors for the color picker defaults
  // Switches between light and dark palette based on current mode
  const flavorColors = useMemo(() => {
    const flavor = getFlavor(activeFlavor);
    const colors: Record<string, string> = {};
    if (flavor) {
      const palette =
        darkMode && flavor.darkColors ? flavor.darkColors : flavor.colors;
      for (const { key } of COLOR_TOKENS) {
        const raw = (palette as Record<string, string>)[key];
        if (raw) colors[key] = oklchStringToHex(raw);
      }
    }
    return colors;
  }, [activeFlavor, darkMode]);

  // Merged color values: flavor defaults + user overrides
  const currentColors = useMemo(() => {
    const merged = { ...flavorColors };
    if (overrides.colors) {
      for (const [k, v] of Object.entries(overrides.colors)) {
        merged[k] = v;
      }
    }
    return merged;
  }, [flavorColors, overrides.colors]);

  const cssTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Regenerate the full CSS from current state */
  const regenerateCss = useCallback(
    (flavorName: string, ovr: typeof overrides) => {
      const resolveOverrides: Record<string, unknown> = {};
      if (ovr.radius) resolveOverrides.radius = ovr.radius;
      if (ovr.spacing) resolveOverrides.spacing = ovr.spacing;
      if (ovr.colors) resolveOverrides.colors = ovr.colors;
      if (ovr.font) {
        const font: Record<string, unknown> = {};
        if (ovr.font.sans) font.sans = ovr.font.sans;
        if (ovr.font.baseSize) font.baseSize = ovr.font.baseSize;
        resolveOverrides.font = font;
      }
      const css = resolveTokens({
        flavor: flavorName,
        overrides:
          Object.keys(resolveOverrides).length > 0
            ? (resolveOverrides as any)
            : undefined,
      });
      injectCss(css);
    },
    [],
  );

  /** Debounced version for drag-heavy inputs like color pickers */
  const regenerateCssDebounced = useCallback(
    (flavorName: string, ovr: typeof overrides) => {
      if (cssTimerRef.current) clearTimeout(cssTimerRef.current);
      cssTimerRef.current = setTimeout(() => {
        regenerateCss(flavorName, ovr);
      }, 30);
    },
    [regenerateCss],
  );

  const handleFlavorChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const name = e.target.value;
      setActiveFlavor(name);
      editor.resetTokens();
      const newOverrides = {};
      setOverrides(newOverrides);
      regenerateCss(name, newOverrides);
    },
    [editor, regenerateCss],
  );

  const handleColorChange = useCallback(
    (key: string, value: string) => {
      setOverrides((prev) => {
        const next = {
          ...prev,
          colors: { ...prev.colors, [key]: value },
        };
        regenerateCssDebounced(activeFlavor, next);
        return next;
      });
    },
    [activeFlavor, regenerateCssDebounced],
  );

  const handleColorTextChange = useCallback(
    (key: string, value: string) => {
      setOverrides((prev) => {
        const nextColors = { ...prev.colors };
        if (value) {
          nextColors[key] = value;
        } else {
          delete nextColors[key];
        }

        const next = {
          ...prev,
          colors: Object.keys(nextColors).length > 0 ? nextColors : undefined,
        };
        regenerateCssDebounced(activeFlavor, next);
        return next;
      });
    },
    [activeFlavor, regenerateCssDebounced],
  );

  const handleRadiusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setOverrides((prev) => {
        const next = { ...prev, radius: e.target.value };
        regenerateCss(activeFlavor, next);
        return next;
      });
    },
    [activeFlavor, regenerateCss],
  );

  const handleSpacingChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setOverrides((prev) => {
        const next = { ...prev, spacing: e.target.value };
        regenerateCss(activeFlavor, next);
        return next;
      });
    },
    [activeFlavor, regenerateCss],
  );

  const handleFontFamilyChange = useCallback(
    (value: string) => {
      setOverrides((prev) => {
        const next = {
          ...prev,
          font: { ...prev.font, sans: value || undefined },
        };
        regenerateCss(activeFlavor, next);
        return next;
      });
    },
    [activeFlavor, regenerateCss],
  );

  const handleFontSizeChange = useCallback(
    (value: string) => {
      const num = value ? parseInt(value, 10) : undefined;
      setOverrides((prev) => {
        const next = { ...prev, font: { ...prev.font, baseSize: num } };
        regenerateCss(activeFlavor, next);
        return next;
      });
    },
    [activeFlavor, regenerateCss],
  );

  const [saveName, setSaveName] = useState("");
  const [exportJson, setExportJson] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  /**
   * Convert a hex color string to an oklch "L C H" raw string
   * suitable for flavor definitions.
   */
  const hexToOklchString = useCallback((hex: string): string => {
    try {
      const [l, c, h] = hexToOklch(hex);
      return `${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(3)}`;
    } catch {
      return "0.5 0 0";
    }
  }, []);

  /** Build a colors object from hex overrides → oklch strings, merged with base flavor */
  const buildFlavorColors = useCallback(
    (
      base: Record<string, string>,
      hexOverrides: Record<string, string> | undefined,
    ) => {
      const result = { ...base };
      if (hexOverrides) {
        for (const [key, val] of Object.entries(hexOverrides)) {
          if (val.startsWith("#")) {
            result[key] = hexToOklchString(val);
          } else {
            result[key] = val;
          }
        }
      }
      return result;
    },
    [hexToOklchString],
  );

  const handleSaveFlavor = useCallback(() => {
    const name = saveName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!name) return;

    const baseFlavor = getFlavor(activeFlavor);
    if (!baseFlavor) return;

    const lightColors = buildFlavorColors(
      baseFlavor.colors as Record<string, string>,
      overrides.colors,
    );
    const darkColors = baseFlavor.darkColors
      ? buildFlavorColors(
          baseFlavor.darkColors as Record<string, string>,
          overrides.colors,
        )
      : undefined;

    defineFlavor(name, {
      displayName: saveName.trim() || name,
      colors: lightColors as any,
      darkColors: darkColors as any,
      radius: (overrides.radius || baseFlavor.radius) as any,
      spacing: (overrides.spacing || baseFlavor.spacing) as any,
      font: { ...baseFlavor.font, ...overrides.font },
    });

    setActiveFlavor(name);
    setSaveName("");
    regenerateCss(name, {});
    setOverrides({});
  }, [saveName, activeFlavor, overrides, buildFlavorColors, regenerateCss]);

  const handleExport = useCallback(() => {
    const config: Record<string, unknown> = { flavor: activeFlavor };
    if (
      overrides.colors ||
      overrides.radius ||
      overrides.spacing ||
      overrides.font
    ) {
      const ov: Record<string, unknown> = {};
      if (overrides.colors) {
        const colorOv: Record<string, string> = {};
        for (const [key, val] of Object.entries(overrides.colors)) {
          if (val.startsWith("#")) {
            colorOv[key] = hexToOklchString(val);
          } else {
            colorOv[key] = val;
          }
        }
        ov.colors = colorOv;
      }
      if (overrides.radius) ov.radius = overrides.radius;
      if (overrides.spacing) ov.spacing = overrides.spacing;
      if (overrides.font) ov.font = overrides.font;
      config.overrides = ov;
    }
    setExportJson(JSON.stringify(config, null, 2));
  }, [activeFlavor, overrides, hexToOklchString]);

  const handleCopyExport = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch {
      setCopyFeedback("Copy failed");
      setTimeout(() => setCopyFeedback(""), 2000);
    }
  }, [exportJson]);

  const handleReset = useCallback(() => {
    editor.resetTokens();
    setActiveFlavor("neutral");
    setOverrides({});
    setExportJson("");
    injectCss(resolveTokens({ flavor: "neutral" }));
  }, [editor]);

  return (
    <div className="playground__sidebar">
      <div className="token-editor__intro">
        <p className="playground__eyebrow">Live tokens</p>
        <h2>Token Editor</h2>
        <p>Stress-test every demo against color, radius, spacing, and type.</p>
      </div>

      <Section title="Flavor">
        <div className="control">
          <label>Theme Flavor</label>
          <select value={activeFlavor} onChange={handleFlavorChange}>
            {Object.entries(flavors).map(([key, flavor]) => (
              <option key={key} value={key}>
                {flavor.displayName}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Colors">
        {COLOR_TOKENS.map(({ key, label }) => (
          <div className="control" key={key}>
            <label>{label}</label>
            <div className="control-row">
              <input
                type="color"
                value={currentColors[key] || "#808080"}
                onChange={(e) => handleColorChange(key, e.target.value)}
                style={{ width: 40, flex: "none" }}
              />
              <input
                type="text"
                placeholder={`#hex or oklch(...)`}
                value={overrides.colors?.[key] || ""}
                onChange={(e) => handleColorTextChange(key, e.target.value)}
              />
            </div>
          </div>
        ))}
      </Section>

      <Section title="Radius" defaultOpen={false}>
        <div className="control">
          <label>Border Radius</label>
          <select
            value={overrides.radius || "md"}
            onChange={handleRadiusChange}
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Spacing" defaultOpen={false}>
        <div className="control">
          <label>Spacing Scale</label>
          <select
            value={overrides.spacing || "default"}
            onChange={handleSpacingChange}
          >
            {SPACING_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Font" defaultOpen={false}>
        <div className="control">
          <label>Font Family</label>
          <input
            type="text"
            placeholder="system-ui, sans-serif"
            value={overrides.font?.sans || ""}
            onChange={(e) => handleFontFamilyChange(e.target.value)}
          />
        </div>
        <div className="control">
          <label>Base Size (px)</label>
          <input
            type="number"
            placeholder="16"
            min={10}
            max={24}
            value={overrides.font?.baseSize || ""}
            onChange={(e) => handleFontSizeChange(e.target.value)}
          />
        </div>
      </Section>

      <Section title="Save / Export" defaultOpen={false}>
        <div className="control">
          <label>Save as New Flavor</label>
          <div className="control-row">
            <input
              type="text"
              placeholder="My Custom Theme"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveFlavor();
              }}
            />
            <button
              className="btn-small"
              onClick={handleSaveFlavor}
              disabled={!saveName.trim()}
            >
              Save
            </button>
          </div>
        </div>
        <div className="control">
          <label>Export Theme Config</label>
          <button className="btn-small" onClick={handleExport}>
            Generate JSON
          </button>
          {exportJson && (
            <>
              <textarea
                readOnly
                value={exportJson}
                rows={8}
                style={{
                  marginTop: 6,
                  fontFamily: "monospace",
                  fontSize: 12,
                  width: "100%",
                  resize: "vertical",
                }}
              />
              <button
                className="btn-small"
                onClick={handleCopyExport}
                style={{ marginTop: 4 }}
              >
                {copyFeedback || "Copy to Clipboard"}
              </button>
            </>
          )}
        </div>
      </Section>

      <button className="btn-reset" onClick={handleReset}>
        Reset All Tokens
      </button>
    </div>
  );
}
