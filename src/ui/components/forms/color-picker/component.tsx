"use client";

import { useEffect, useMemo, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../button";
import { InputControl } from "../input";
import type { ColorPickerConfig } from "./types";

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const safeHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((value) => `${value}${value}`)
          .join("")
      : normalized.padEnd(6, "0").slice(0, 6);
  return [
    Number.parseInt(safeHex.slice(0, 2), 16),
    Number.parseInt(safeHex.slice(2, 4), 16),
    Number.parseInt(safeHex.slice(4, 6), 16),
  ];
}

function rgbToHsl([red, green, blue]: [number, number, number]): [
  number,
  number,
  number,
] {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return [0, 0, Math.round(lightness * 100)];
  }

  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;
  switch (max) {
    case r:
      hue = (g - b) / delta + (g < b ? 6 : 0);
      break;
    case g:
      hue = (b - r) / delta + 2;
      break;
    default:
      hue = (r - g) / delta + 4;
      break;
  }

  return [
    Math.round((hue / 6) * 360),
    Math.round(saturation * 100),
    Math.round(lightness * 100),
  ];
}

function formatColorValue(
  color: string,
  format: ColorPickerConfig["format"],
  alpha: number,
) {
  if (format === "hex") {
    return color;
  }
  const rgb = hexToRgb(color);
  if (format === "rgb") {
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(2)})`;
  }
  const hsl = rgbToHsl(rgb);
  return `hsla(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%, ${alpha.toFixed(2)})`;
}

export function ColorPicker({ config }: { config: ColorPickerConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);
  const resolvedLabel = useSubscribe(config.label) as string | undefined;
  const rootId = config.id ?? "color-picker";
  const [color, setColor] = useState(config.defaultValue ?? "#2563eb");
  const [alpha, setAlpha] = useState(1);
  const displayValue = useMemo(
    () => formatColorValue(color, config.format, config.showAlpha ? alpha : 1),
    [alpha, color, config.format, config.showAlpha],
  );

  useEffect(() => {
    if (!publish) {
      return;
    }
    publish(displayValue);
  }, [displayValue, publish]);

  if (visible === false) {
    return null;
  }

  const triggerChange = (nextColor: string, nextAlpha: number) => {
    if (config.onChange) {
      void execute(config.onChange, {
        value: formatColorValue(
          nextColor,
          config.format,
          config.showAlpha ? nextAlpha : 1,
        ),
      });
    }
  };

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "sm",
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      fontSize: "sm",
      fontWeight: "medium",
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: config.slots?.label,
  });
  const controlsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-controls`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "sm",
    },
    componentSurface: config.slots?.controls,
  });
  const pickerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-picker`,
    implementationBase: {
      cursor: "pointer",
      style: {
        width: "3rem",
        height: "3rem",
        border: "none",
        background: "transparent",
        padding: 0,
      },
    },
    componentSurface: config.slots?.picker,
  });
  const inputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-input`,
    implementationBase: {
      flex: "1",
      fontSize: "sm",
      paddingY: "sm",
      paddingX: "md",
      borderRadius: "md",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
      bg: "var(--sn-color-background, #ffffff)",
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        boxSizing: "border-box",
      },
    },
    componentSurface: config.slots?.input,
  });
  const alphaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-alpha`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "xs",
    },
    componentSurface: config.slots?.alpha,
  });
  const alphaLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-alphaLabel`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.alphaLabel,
  });
  const alphaInputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-alphaInput`,
    implementationBase: {},
    componentSurface: config.slots?.alphaInput,
  });
  const swatchesSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-swatches`,
    implementationBase: {
      display: "grid",
      gap: "xs",
      style: {
        gridTemplateColumns: "repeat(auto-fit, minmax(2rem, 1fr))",
      },
    },
    componentSurface: config.slots?.swatches,
  });
  const valueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-value`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.value,
  });

  return (
    <>
      <div
        data-snapshot-component="color-picker"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {resolvedLabel ? (
          <label
            data-snapshot-id={`${rootId}-label`}
            className={labelSurface.className}
            style={labelSurface.style}
          >
            {resolvedLabel}
          </label>
        ) : null}

        <div
          data-snapshot-id={`${rootId}-controls`}
          className={controlsSurface.className}
          style={controlsSurface.style}
        >
          <InputControl
            type="color"
            value={color}
            onChangeText={(nextColor) => {
              setColor(nextColor);
              triggerChange(nextColor, alpha);
            }}
            surfaceId={`${rootId}-picker`}
            surfaceConfig={pickerSurface.resolvedConfigForWrapper}
          />
          {config.allowCustom ? (
            <InputControl
              type="text"
              value={color}
              onChangeText={(nextColor) => {
                setColor(nextColor);
                triggerChange(nextColor, alpha);
              }}
              surfaceId={`${rootId}-input`}
              surfaceConfig={inputSurface.resolvedConfigForWrapper}
            />
          ) : null}
        </div>

        {config.showAlpha ? (
          <div
            data-snapshot-id={`${rootId}-alpha`}
            className={alphaSurface.className}
            style={alphaSurface.style}
          >
            <span
              data-snapshot-id={`${rootId}-alphaLabel`}
              className={alphaLabelSurface.className}
              style={alphaLabelSurface.style}
            >
              Alpha {Math.round(alpha * 100)}%
            </span>
            <InputControl
              type="range"
              min="0"
              max="100"
              value={String(Math.round(alpha * 100))}
              onChangeText={(nextValue) => {
                const nextAlpha = Number(nextValue) / 100;
                setAlpha(nextAlpha);
                triggerChange(color, nextAlpha);
              }}
              surfaceId={`${rootId}-alphaInput`}
              surfaceConfig={alphaInputSurface.resolvedConfigForWrapper}
            />
          </div>
        ) : null}

        {config.swatches && config.swatches.length > 0 ? (
          <div
            data-snapshot-id={`${rootId}-swatches`}
            className={swatchesSurface.className}
            style={swatchesSurface.style}
          >
            {config.swatches.map((swatch, index) => {
              const swatchSurface = resolveSurfacePresentation({
                surfaceId: `${rootId}-swatch-${index}`,
                implementationBase: {
                  cursor: "pointer",
                  borderRadius: "sm",
                  border:
                    "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
                  style: {
                    width: "2rem",
                    height: "2rem",
                    backgroundColor: swatch,
                  },
                },
                componentSurface: config.slots?.swatch,
              });

              return (
                <span key={swatch}>
                  <ButtonControl
                    type="button"
                    ariaLabel={swatch}
                    onClick={() => {
                      setColor(swatch);
                      triggerChange(swatch, alpha);
                    }}
                    surfaceId={`${rootId}-swatch-${index}`}
                    surfaceConfig={swatchSurface.resolvedConfigForWrapper}
                    variant="ghost"
                    size="icon"
                  >
                    {" "}
                  </ButtonControl>
                  <SurfaceStyles css={swatchSurface.scopedCss} />
                </span>
              );
            })}
          </div>
        ) : null}

        <span
          data-snapshot-id={`${rootId}-value`}
          className={valueSurface.className}
          style={valueSurface.style}
        >
          {displayValue}
        </span>
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
