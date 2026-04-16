"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import { InputControl } from "../input";
import type { SliderConfig } from "./types";

function formatSliderValue(
  value: number | [number, number],
  suffix?: string,
): string {
  if (Array.isArray(value)) {
    return `${value[0]}${suffix ?? ""} - ${value[1]}${suffix ?? ""}`;
  }
  return `${value}${suffix ?? ""}`;
}

/**
 * Render a manifest-driven slider input.
 */
export function Slider({ config }: { config: SliderConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);
  const resolvedLabel = useSubscribe(config.label) as string | undefined;
  const resolvedSuffix = useSubscribe(config.suffix) as string | undefined;
  const disabled = Boolean(useSubscribe(config.disabled ?? false));
  const rootId = config.id ?? "slider";
  const min = config.min ?? 0;
  const max = config.max ?? 100;
  const step = config.step ?? 1;
  const initialValue = useMemo(() => {
    if (config.range) {
      return Array.isArray(config.defaultValue)
        ? config.defaultValue
        : ([min, max] as [number, number]);
    }
    return typeof config.defaultValue === "number"
      ? config.defaultValue
      : min;
  }, [config.defaultValue, config.range, max, min]);
  const [singleValue, setSingleValue] = useState(
    Array.isArray(initialValue) ? initialValue[0] : initialValue,
  );
  const [rangeValue, setRangeValue] = useState<[number, number]>(
    Array.isArray(initialValue) ? initialValue : [min, max],
  );

  useEffect(() => {
    if (!publish) {
      return;
    }
    publish(config.range ? rangeValue : singleValue);
  }, [config.range, publish, rangeValue, singleValue]);

  if (visible === false) {
    return null;
  }

  const currentValue = config.range ? rangeValue : singleValue;
  const trackStart =
    ((rangeValue[0] - min) / (max - min)) * 100;
  const trackEnd =
    ((rangeValue[1] - min) / (max - min)) * 100;
  const singleTrackWidth =
    ((singleValue - min) / (max - min)) * 100;

  const triggerChange = (value: number | [number, number]) => {
    if (config.onChange) {
      void execute(config.onChange, { value });
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
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      justifyContent: "between",
      alignItems: "center",
      gap: "sm",
    },
    componentSurface: config.slots?.header,
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
  const valueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-value`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.value,
  });
  const railSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-rail`,
    implementationBase: {
      position: "relative",
      style: {
        padding: "var(--sn-spacing-sm, 0.5rem) 0",
      },
    },
    componentSurface: config.slots?.rail,
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
    componentSurface: config.slots?.track,
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
        left: config.range ? `${trackStart}%` : "0%",
        width: config.range
          ? `${trackEnd - trackStart}%`
          : `${singleTrackWidth}%`,
      },
    },
    componentSurface: config.slots?.fill,
  });
  const inputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-input`,
    implementationBase: {
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
    },
    componentSurface: config.slots?.input,
  });
  const inputStartSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-inputStart`,
    implementationBase: {
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
    },
    componentSurface: config.slots?.inputStart,
  });
  const inputEndSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-inputEnd`,
    implementationBase: {
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
    },
    componentSurface: config.slots?.inputEnd,
  });
  const limitsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-limits`,
    implementationBase: {
      display: "flex",
      justifyContent: "between",
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.limits,
  });
  const minLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-minLabel`,
    implementationBase: {},
    componentSurface: config.slots?.minLabel,
  });
  const maxLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-maxLabel`,
    implementationBase: {},
    componentSurface: config.slots?.maxLabel,
  });

  return (
    <>
      <div
        data-snapshot-component="slider"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
      {resolvedLabel ? (
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
            {resolvedLabel}
          </label>
          {config.showValue ? (
            <span
              data-snapshot-id={`${rootId}-value`}
            className={valueSurface.className}
            style={valueSurface.style}
          >
              {formatSliderValue(currentValue, resolvedSuffix)}
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
        {config.range ? (
          <>
            <InputControl
              type="range"
              min={String(min)}
              max={String(max)}
              step={step}
              value={String(rangeValue[0])}
              disabled={disabled}
              onChangeText={(nextRawValue) => {
                const nextValue = Math.min(
                  Number(nextRawValue),
                  rangeValue[1],
                );
                const updated: [number, number] = [nextValue, rangeValue[1]];
                setRangeValue(updated);
                triggerChange(updated);
              }}
              surfaceId={`${rootId}-input-start`}
              className={inputStartSurface.className}
              style={{ ...rangeInputStyle, ...(inputStartSurface.style ?? {}), zIndex: 2 }}
            />
            <InputControl
              type="range"
              min={String(min)}
              max={String(max)}
              step={step}
              value={String(rangeValue[1])}
              disabled={disabled}
              onChangeText={(nextRawValue) => {
                const nextValue = Math.max(
                  Number(nextRawValue),
                  rangeValue[0],
                );
                const updated: [number, number] = [rangeValue[0], nextValue];
                setRangeValue(updated);
                triggerChange(updated);
              }}
              surfaceId={`${rootId}-input-end`}
              className={inputEndSurface.className}
              style={{ ...rangeInputStyle, ...(inputEndSurface.style ?? {}), zIndex: 3 }}
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
            className={inputSurface.className}
            style={{ ...rangeInputStyle, ...(inputSurface.style ?? {}) }}
          />
        )}
      </div>

      {config.showLimits ? (
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
            {config.min}
            {resolvedSuffix ?? ""}
          </span>
          <span
            data-snapshot-id={`${rootId}-maxLabel`}
            className={maxLabelSurface.className}
            style={maxLabelSurface.style}
          >
            {config.max}
            {resolvedSuffix ?? ""}
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
      <SurfaceStyles css={inputSurface.scopedCss} />
      <SurfaceStyles css={inputStartSurface.scopedCss} />
      <SurfaceStyles css={inputEndSurface.scopedCss} />
      <SurfaceStyles css={limitsSurface.scopedCss} />
      <SurfaceStyles css={minLabelSurface.scopedCss} />
      <SurfaceStyles css={maxLabelSurface.scopedCss} />
    </>
  );
}

const rangeInputStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  margin: 0,
  background: "transparent",
  appearance: "none",
  pointerEvents: "auto",
};
