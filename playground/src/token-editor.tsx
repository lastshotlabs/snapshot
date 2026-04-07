import React, { useState, useCallback } from "react";
import {
  useTokenEditor,
  getAllFlavors,
  resolveTokens,
} from "@lastshotlabs/snapshot/ui";

const COLOR_TOKENS = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "muted", label: "Muted" },
  { key: "destructive", label: "Destructive" },
  { key: "success", label: "Success" },
  { key: "warning", label: "Warning" },
  { key: "background", label: "Background" },
  { key: "card", label: "Card" },
  { key: "border", label: "Border" },
] as const;

const RADIUS_OPTIONS = ["none", "xs", "sm", "md", "lg", "xl", "full"] as const;
const SPACING_OPTIONS = ["compact", "default", "comfortable", "spacious"] as const;

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
      <div className="editor-section__header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span>{open ? "\u25B4" : "\u25BE"}</span>
      </div>
      {open && <div className="editor-section__body">{children}</div>}
    </div>
  );
}

export function TokenEditorSidebar() {
  const editor = useTokenEditor();
  const flavors = getAllFlavors();
  const [activeFlavor, setActiveFlavor] = useState("neutral");

  const handleFlavorChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const name = e.target.value;
      setActiveFlavor(name);
      // Re-inject the full token CSS for the new flavor
      const css = resolveTokens({ flavor: name });
      const el = document.getElementById("snapshot-tokens");
      if (el) el.textContent = css;
      // Also notify the editor
      editor.setFlavor(name);
    },
    [editor],
  );

  const handleColorChange = useCallback(
    (key: string, value: string) => {
      editor.setToken(`colors.${key}`, value);
    },
    [editor],
  );

  const handleRadiusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const css = resolveTokens({
        flavor: activeFlavor,
        overrides: { radius: e.target.value as any },
      });
      const el = document.getElementById("snapshot-tokens");
      if (el) el.textContent = css;
    },
    [activeFlavor],
  );

  const handleSpacingChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const css = resolveTokens({
        flavor: activeFlavor,
        overrides: { spacing: e.target.value as any },
      });
      const el = document.getElementById("snapshot-tokens");
      if (el) el.textContent = css;
    },
    [activeFlavor],
  );

  const handleReset = useCallback(() => {
    editor.resetTokens();
    setActiveFlavor("neutral");
    const css = resolveTokens({ flavor: "neutral" });
    const el = document.getElementById("snapshot-tokens");
    if (el) el.textContent = css;
  }, [editor]);

  return (
    <div className="playground__sidebar">
      <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Token Editor</h2>

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
                onChange={(e) => handleColorChange(key, e.target.value)}
                style={{ width: 40, flex: "none" }}
              />
              <input
                type="text"
                placeholder={`var(--sn-color-${key})`}
                onChange={(e) => {
                  if (e.target.value) handleColorChange(key, e.target.value);
                }}
              />
            </div>
          </div>
        ))}
      </Section>

      <Section title="Radius" defaultOpen={false}>
        <div className="control">
          <label>Border Radius</label>
          <select onChange={handleRadiusChange}>
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
          <select onChange={handleSpacingChange}>
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
            onChange={(e) => {
              if (e.target.value) {
                document.documentElement.style.setProperty(
                  "--sn-font-sans",
                  e.target.value,
                );
              }
            }}
          />
        </div>
        <div className="control">
          <label>Base Size (px)</label>
          <input
            type="number"
            placeholder="16"
            min={10}
            max={24}
            onChange={(e) => {
              if (e.target.value) {
                document.documentElement.style.setProperty(
                  "--sn-font-size-base",
                  `${e.target.value}px`,
                );
              }
            }}
          />
        </div>
      </Section>

      <button className="btn-reset" onClick={handleReset}>
        Reset All Tokens
      </button>
    </div>
  );
}
