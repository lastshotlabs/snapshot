"use client";

import React, { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { InputControl } from "../input";

// ── Standalone Props ──────────��───────────────────────────────────────────────

export interface SliderFieldProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Label text displayed above the slider. */
  label?: string;
  /** Minimum value of the slider. */
  min?: number;
  /** Maximum value of the slider. */
  max?: number;
  /** Step increment between values. */
  step?: number;
  /** Initial value (number for single, tuple for range). */
  defaultValue?: number | [number, number];
  /** Whether to render a dual-thumb range slider. */
  range?: boolean;
  /** Whether to display the current value beside the label. */
  showValue?: boolean;
  /** Whether to display min/max labels below the track. */
  showLimits?: boolean;
  /** Unit suffix appended to displayed values (e.g. "%", "px"). */
  suffix?: string;
  /** Whether the slider is disabled. */
  disabled?: boolean;
  /** Called when the slider value changes. */
  onChange?: (value: number | [number, number]) => void;

  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

function formatSliderValue(
  value: number | [number, number],
  suffix?: string,
): string {
  if (Array.isArray(value)) {
    return `${value[0]}${suffix ?? ""} - ${value[1]}${suffix ?? ""}`;
  }
  return `${value}${suffix ?? ""}`;
}

const rangeInputStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  margin: 0,
  background: "transparent",
  appearance: "none",
  pointerEvents: "auto",
};

/**
 * Standalone SliderField -- a range slider with optional label, value display,
 * limit labels, and dual-thumb range mode. No manifest context required.
 *
 * @example
 * ```tsx
 * <SliderField
 *   label="Volume"
 *   min={0}
 *   max={100}
 *   showValue
 *   suffix="%"
 *   onChange={(val) => setVolume(val)}
 * />
 * ```
 */
export function SliderField({
  id,
  label,
  min: minProp = 0,
  max: maxProp = 100,
  step = 1,
  defaultValue,
  range = false,
  showValue = false,
  showLimits = false,
  suffix,
  disabled = false,
  onChange,
  className,
  style,
  slots,
}: SliderFieldProps) {
  const rootId = id ?? "slider";
  const min = minProp;
  const max = maxProp;

  const initialValue = useMemo(() => {
    if (range) {
      return Array.isArray(defaultValue)
        ? defaultValue
        : ([min, max] as [number, number]);
    }
    return typeof defaultValue === "number" ? defaultValue : min;
  }, [defaultValue, range, max, min]);

  const [singleValue, setSingleValue] = useState(
    Array.isArray(initialValue) ? initialValue[0] : initialValue,
  );
  const [rangeValue, setRangeValue] = useState<[number, number]>(
    Array.isArray(initialValue) ? initialValue : [min, max],
  );

  const currentValue = range ? rangeValue : singleValue;
  const trackStart = ((rangeValue[0] - min) / (max - min)) * 100;
  const trackEnd = ((rangeValue[1] - min) / (max - min)) * 100;
  const singleTrackWidth = ((singleValue - min) / (max - min)) * 100;

  const triggerChange = (value: number | [number, number]) => {
    onChange?.(value);
  };

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "sm",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      justifyContent: "between",
      alignItems: "center",
      gap: "sm",
    },
    componentSurface: slots?.header,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      fontSize: "sm",
      fontWeight: "medium",
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: slots?.label,
  });
  const valueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-value`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: slots?.value,
  });
  const railSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-rail`,
    implementationBase: {
      position: "relative",
      style: {
        padding: "var(--sn-spacing-sm, 0.5rem) 0",
      },
    },
    componentSurface: slots?.rail,
  });
  const trackSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-track`,
    implementationBase: {
      position: "absolute",
      style: {
        left: 0,
        right: 0,
        top: "50%",
        height: "0.375rem",
        transform: "translateY(-50%)",
        borderRadius: "var(--sn-radius-full, 9999px)",
        backgroundColor: "var(--sn-color-muted, #e5e7eb)",
      },
    },
    componentSurface: slots?.track,
  });
  const fillSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-fill`,
    implementationBase: {
      position: "absolute",
      style: {
        top: "50%",
        height: "0.375rem",
        transform: "translateY(-50%)",
        borderRadius: "var(--sn-radius-full, 9999px)",
        backgroundColor: "var(--sn-color-primary, #2563eb)",
        left: range ? `${trackStart}%` : "0%",
        width: range
          ? `${trackEnd - trackStart}%`
          : `${singleTrackWidth}%`,
      },
    },
    componentSurface: slots?.fill,
  });
  const inputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-input`,
    implementationBase: {
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
    },
    componentSurface: slots?.input,
  });
  const inputStartSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-inputStart`,
    implementationBase: {
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
    },
    componentSurface: slots?.inputStart,
  });
  const inputEndSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-inputEnd`,
    implementationBase: {
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
    },
    componentSurface: slots?.inputEnd,
  });
  const limitsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-limits`,
    implementationBase: {
      display: "flex",
      justifyContent: "between",
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: slots?.limits,
  });
  const minLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-minLabel`,
    implementationBase: {},
    componentSurface: slots?.minLabel,
  });
  const maxLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-maxLabel`,
    implementationBase: {},
    componentSurface: slots?.maxLabel,
  });

  return (
    <>
      <div
        data-snapshot-component="slider"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {label ? (
          <div
            data-snapshot-id={`${rootId}-header`}
            className={headerSurface.className}
            style={headerSurface.style}
          >
            <label
              data-snapshot-id={`${rootId}-label`}
              className={labelSurface.className}
              style={labelSurface.style}
            >
              {label}
            </label>
            {showValue ? (
              <span
                data-snapshot-id={`${rootId}-value`}
                className={valueSurface.className}
                style={valueSurface.style}
              >
                {formatSliderValue(currentValue, suffix)}
              </span>
            ) : null}
          </div>
        ) : null}

        <div
          data-snapshot-id={`${rootId}-rail`}
          className={railSurface.className}
          style={railSurface.style}
        >
          <div
            aria-hidden="true"
            data-snapshot-id={`${rootId}-track`}
            className={trackSurface.className}
            style={trackSurface.style}
          />
          <div
            aria-hidden="true"
            data-snapshot-id={`${rootId}-fill`}
            className={fillSurface.className}
            style={fillSurface.style}
          />
          {range ? (
            <>
              <InputControl
                type="range"
                min={String(min)}
                max={String(max)}
                step={step}
                value={String(rangeValue[0])}
                disabled={disabled}
                onChangeText={(nextRawValue) => {
                  const nextValue = Math.min(Number(nextRawValue), rangeValue[1]);
                  const updated: [number, number] = [nextValue, rangeValue[1]];
                  setRangeValue(updated);
                  triggerChange(updated);
                }}
                surfaceId={`${rootId}-input-start`}
                itemSurfaceConfig={inputStartSurface.resolvedConfigForWrapper}
                style={{ ...rangeInputStyle, zIndex: 2 }}
              />
              <InputControl
                type="range"
                min={String(min)}
                max={String(max)}
                step={step}
                value={String(rangeValue[1])}
                disabled={disabled}
                onChangeText={(nextRawValue) => {
                  const nextValue = Math.max(Number(nextRawValue), rangeValue[0]);
                  const updated: [number, number] = [rangeValue[0], nextValue];
                  setRangeValue(updated);
                  triggerChange(updated);
                }}
                surfaceId={`${rootId}-input-end`}
                itemSurfaceConfig={inputEndSurface.resolvedConfigForWrapper}
                style={{ ...rangeInputStyle, zIndex: 3 }}
              />
            </>
          ) : (
            <InputControl
              type="range"
              min={String(min)}
              max={String(max)}
              step={step}
              value={String(singleValue)}
              disabled={disabled}
              onChangeText={(nextRawValue) => {
                const nextValue = Number(nextRawValue);
                setSingleValue(nextValue);
                triggerChange(nextValue);
              }}
              surfaceId={`${rootId}-input`}
              itemSurfaceConfig={inputSurface.resolvedConfigForWrapper}
              style={rangeInputStyle}
            />
          )}
        </div>

        {showLimits ? (
          <div
            data-snapshot-id={`${rootId}-limits`}
            className={limitsSurface.className}
            style={limitsSurface.style}
          >
            <span
              data-snapshot-id={`${rootId}-minLabel`}
              className={minLabelSurface.className}
              style={minLabelSurface.style}
            >
              {min}
              {suffix ?? ""}
            </span>
            <span
              data-snapshot-id={`${rootId}-maxLabel`}
              className={maxLabelSurface.className}
              style={maxLabelSurface.style}
            >
              {max}
              {suffix ?? ""}
            </span>
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={valueSurface.scopedCss} />
      <SurfaceStyles css={railSurface.scopedCss} />
      <SurfaceStyles css={trackSurface.scopedCss} />
      <SurfaceStyles css={fillSurface.scopedCss} />
      <SurfaceStyles css={limitsSurface.scopedCss} />
      <SurfaceStyles css={minLabelSurface.scopedCss} />
      <SurfaceStyles css={maxLabelSurface.scopedCss} />
    </>
  );
}
