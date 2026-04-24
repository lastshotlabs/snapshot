"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../button";
import { InputControl } from "../input";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface ColorPickerFieldProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Label text displayed above the picker. */
  label?: string;
  /** Initial color value in hex format. */
  defaultValue?: string;
  /** Output format for the color value. */
  format?: "hex" | "rgb" | "hsl";
  /** Whether to show the alpha/opacity slider. */
  showAlpha?: boolean;
  /** Whether to allow typing a custom hex value. */
  allowCustom?: boolean;
  /** Preset color swatches displayed as quick-select buttons. */
  swatches?: string[];
  /** Called when the selected color changes. */
  onChange?: (value: string) => void;

  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const safeHex =
    normalized.length === 3
      ? normalized.split("").map((value) => `${value}${value}`).join("")
      : normalized.padEnd(6, "0").slice(0, 6);
  return [
    Number.parseInt(safeHex.slice(0, 2), 16),
    Number.parseInt(safeHex.slice(2, 4), 16),
    Number.parseInt(safeHex.slice(4, 6), 16),
  ];
}

function rgbToHsl([red, green, blue]: [number, number, number]): [number, number, number] {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) return [0, 0, Math.round(lightness * 100)];

  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;
  switch (max) {
    case r: hue = (g - b) / delta + (g < b ? 6 : 0); break;
    case g: hue = (b - r) / delta + 2; break;
    default: hue = (r - g) / delta + 4; break;
  }

  return [Math.round((hue / 6) * 360), Math.round(saturation * 100), Math.round(lightness * 100)];
}

function formatColorValue(color: string, format: ColorPickerFieldProps["format"], alpha: number) {
  if (format === "hex") return color;
  const rgb = hexToRgb(color);
  if (format === "rgb") return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(2)})`;
  const hsl = rgbToHsl(rgb);
  return `hsla(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%, ${alpha.toFixed(2)})`;
}

/**
 * Standalone ColorPickerField -- a color picker with optional swatches, alpha slider,
 * and custom hex input. No manifest context required.
 *
 * @example
 * ```tsx
 * <ColorPickerField
 *   label="Brand Color"
 *   defaultValue="#2563eb"
 *   format="hex"
 *   swatches={["#ef4444", "#22c55e", "#3b82f6"]}
 *   onChange={(color) => setBrand(color)}
 * />
 * ```
 */
export function ColorPickerField({
  id,
  label,
  defaultValue = "#2563eb",
  format = "hex",
  showAlpha = false,
  allowCustom = false,
  swatches,
  onChange,
  className,
  style,
  slots,
}: ColorPickerFieldProps) {
  const rootId = id ?? "color-picker";
  const [color, setColor] = useState(defaultValue);
  const [alpha, setAlpha] = useState(1);
  const displayValue = useMemo(
    () => formatColorValue(color, format, showAlpha ? alpha : 1),
    [alpha, color, format, showAlpha],
  );

  useEffect(() => {
    onChange?.(displayValue);
  }, [displayValue, onChange]);

  const triggerChange = (nextColor: string, nextAlpha: number) => {
    const value = formatColorValue(nextColor, format, showAlpha ? nextAlpha : 1);
    onChange?.(value);
  };

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: { display: "flex", flexDirection: "column", gap: "sm" },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: { fontSize: "sm", fontWeight: "medium", color: "var(--sn-color-foreground, #111827)" },
    componentSurface: slots?.label,
  });
  const controlsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-controls`,
    implementationBase: { display: "flex", alignItems: "center", gap: "sm" },
    componentSurface: slots?.controls,
  });
  const pickerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-picker`,
    implementationBase: { cursor: "pointer", style: { width: "3rem", height: "3rem", border: "none", background: "transparent", padding: 0 } },
    componentSurface: slots?.picker,
  });
  const inputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-input`,
    implementationBase: { flex: "1", fontSize: "sm", paddingY: "sm", paddingX: "md", borderRadius: "md", border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)", bg: "var(--sn-color-background, #ffffff)", style: { boxSizing: "border-box" } },
    componentSurface: slots?.input,
  });
  const alphaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-alpha`,
    implementationBase: { display: "flex", flexDirection: "column", gap: "xs" },
    componentSurface: slots?.alpha,
  });
  const alphaLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-alphaLabel`,
    implementationBase: { fontSize: "xs", color: "var(--sn-color-muted-foreground, #6b7280)" },
    componentSurface: slots?.alphaLabel,
  });
  const alphaInputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-alphaInput`,
    implementationBase: {},
    componentSurface: slots?.alphaInput,
  });
  const swatchesSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-swatches`,
    implementationBase: { display: "grid", gap: "xs", style: { gridTemplateColumns: "repeat(auto-fit, minmax(2rem, 1fr))" } },
    componentSurface: slots?.swatches,
  });
  const valueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-value`,
    implementationBase: { fontSize: "xs", color: "var(--sn-color-muted-foreground, #6b7280)" },
    componentSurface: slots?.value,
  });

  return (
    <>
      <div data-snapshot-component="color-picker" data-snapshot-id={rootId} className={rootSurface.className} style={rootSurface.style}>
        {label ? (
          <label data-snapshot-id={`${rootId}-label`} className={labelSurface.className} style={labelSurface.style}>{label}</label>
        ) : null}

        <div data-snapshot-id={`${rootId}-controls`} className={controlsSurface.className} style={controlsSurface.style}>
          <InputControl type="color" value={color} onChangeText={(nc) => { setColor(nc); triggerChange(nc, alpha); }} surfaceId={`${rootId}-picker`} surfaceConfig={pickerSurface.resolvedConfigForWrapper} />
          {allowCustom ? (
            <InputControl type="text" value={color} onChangeText={(nc) => { setColor(nc); triggerChange(nc, alpha); }} surfaceId={`${rootId}-input`} surfaceConfig={inputSurface.resolvedConfigForWrapper} />
          ) : null}
        </div>

        {showAlpha ? (
          <div data-snapshot-id={`${rootId}-alpha`} className={alphaSurface.className} style={alphaSurface.style}>
            <span data-snapshot-id={`${rootId}-alphaLabel`} className={alphaLabelSurface.className} style={alphaLabelSurface.style}>
              Alpha {Math.round(alpha * 100)}%
            </span>
            <InputControl type="range" min="0" max="100" value={String(Math.round(alpha * 100))} onChangeText={(nv) => { const na = Number(nv) / 100; setAlpha(na); triggerChange(color, na); }} surfaceId={`${rootId}-alphaInput`} surfaceConfig={alphaInputSurface.resolvedConfigForWrapper} />
          </div>
        ) : null}

        {swatches && swatches.length > 0 ? (
          <div data-snapshot-id={`${rootId}-swatches`} className={swatchesSurface.className} style={swatchesSurface.style}>
            {swatches.map((swatch, index) => {
              const swatchSurface = resolveSurfacePresentation({
                surfaceId: `${rootId}-swatch-${index}`,
                implementationBase: { cursor: "pointer", borderRadius: "sm", border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)", style: { width: "2rem", height: "2rem", backgroundColor: swatch } },
                componentSurface: slots?.swatch,
              });
              return (
                <span key={swatch}>
                  <ButtonControl type="button" ariaLabel={swatch} onClick={() => { setColor(swatch); triggerChange(swatch, alpha); }} surfaceId={`${rootId}-swatch-${index}`} surfaceConfig={swatchSurface.resolvedConfigForWrapper} variant="ghost" size="icon">
                    {" "}
                  </ButtonControl>
                  <SurfaceStyles css={swatchSurface.scopedCss} />
                </span>
              );
            })}
          </div>
        ) : null}

        <span data-snapshot-id={`${rootId}-value`} className={valueSurface.className} style={valueSurface.style}>{displayValue}</span>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={controlsSurface.scopedCss} />
      <SurfaceStyles css={pickerSurface.scopedCss} />
      <SurfaceStyles css={inputSurface.scopedCss} />
      <SurfaceStyles css={alphaSurface.scopedCss} />
      <SurfaceStyles css={alphaLabelSurface.scopedCss} />
      <SurfaceStyles css={alphaInputSurface.scopedCss} />
      <SurfaceStyles css={swatchesSurface.scopedCss} />
      <SurfaceStyles css={valueSurface.scopedCss} />
    </>
  );
}
