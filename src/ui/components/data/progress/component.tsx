'use client';

import { useEffect, useId } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { ProgressConfig } from "./types";

const SIZE_MAP = { sm: 4, md: 8, lg: 12 } as const;
const CIRCULAR_SIZE_MAP = { sm: 32, md: 48, lg: 64 } as const;

export function Progress({ config }: { config: ProgressConfig }) {
  const uniqueId = useId().replace(/:/g, "");
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);
  const resolvedLabel = useSubscribe(config.label) as string | undefined;
  const resolvedValue = useSubscribe(config.value) as number | undefined;

  const max = config.max ?? 100;
  const size = config.size ?? "md";
  const variant = config.variant ?? "bar";
  const showValue = config.showValue ?? false;
  const segments = config.segments;
  const percentage =
    resolvedValue !== undefined
      ? Math.min(100, Math.max(0, (resolvedValue / max) * 100))
      : undefined;
  const isIndeterminate = percentage === undefined;
  const circularSpinCss = `
    @keyframes sn-progress-spin-${uniqueId} {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  const indeterminateBarCss = `
    @keyframes sn-progress-indeterminate-${uniqueId} {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(300%); }
    }
  `;

  useEffect(() => {
    if (publish && percentage !== undefined) {
      publish({ value: resolvedValue, percentage });
    }
  }, [publish, resolvedValue, percentage]);

  if (visible === false) {
    return null;
  }

  const rootId = config.id ?? "progress";
  const states = isIndeterminate ? (["active"] as const) : [];
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-xs, 0.25rem)",
    },
    componentSurface: config.slots?.root,
    activeStates: [...states],
  });
  const labelRowSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label-row`,
    implementationBase: {
      display: "flex",
      justifyContent: "between",
      alignItems: "center",
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.labelRow,
    activeStates: [...states],
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {},
    componentSurface: config.slots?.label,
    activeStates: [...states],
  });
  const valueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-value`,
    implementationBase: {},
    componentSurface: config.slots?.value,
    activeStates: [...states],
  });

  const fillColor = `var(--sn-color-${config.color ?? "primary"}, currentColor)`;
  const trackColor = "var(--sn-color-secondary, #e5e7eb)";

  if (variant === "circular") {
    const svgSize = CIRCULAR_SIZE_MAP[size];
    const strokeWidth = size === "sm" ? 3 : size === "lg" ? 5 : 4;
    const radius = (svgSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = isIndeterminate
      ? circumference * 0.75
      : circumference - (circumference * (percentage ?? 0)) / 100;
    const circularTrackSurface = resolveSurfacePresentation({
      surfaceId: `${rootId}-circular-track`,
      implementationBase: {},
      componentSurface: config.slots?.circularTrack,
      activeStates: [...states],
    });
    const circularFillSurface = resolveSurfacePresentation({
      surfaceId: `${rootId}-circular-fill`,
      implementationBase: {},
      componentSurface: config.slots?.circularFill ?? config.slots?.fill,
      activeStates: [...states],
    });

    return (
      <div
        data-snapshot-component="progress"
        data-testid="progress"
        data-snapshot-id={rootId}
        className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
        style={{
          ...(rootSurface.style ?? {}),
          ...(config.style ?? {}),
          alignItems: "center",
          display: "inline-flex",
        }}
      >
        {isIndeterminate ? <SurfaceStyles css={circularSpinCss} /> : null}
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{
            transform: "rotate(-90deg)",
            ...(isIndeterminate
              ? {
                  animation: `sn-progress-spin-${uniqueId} var(--sn-duration-slow, 1.5s) linear infinite`,
                }
              : {}),
          }}
          role="progressbar"
          aria-valuenow={isIndeterminate ? undefined : percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            className={circularTrackSurface.className}
            style={circularTrackSurface.style}
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={fillColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={circularFillSurface.className}
            style={{
              ...(circularFillSurface.style ?? {}),
              ...(isIndeterminate
                ? {}
                : {
                    transition:
                      "stroke-dashoffset var(--sn-duration-normal, 250ms) var(--sn-ease-out, ease-out)",
                  }),
            }}
          />
        </svg>
        {resolvedLabel || showValue ? (
          <div
            data-snapshot-id={`${rootId}-label-row`}
            className={labelRowSurface.className}
            style={labelRowSurface.style}
          >
            {resolvedLabel ? (
              <span
                data-snapshot-id={`${rootId}-label`}
                className={labelSurface.className}
                style={labelSurface.style}
              >
                {resolvedLabel}
              </span>
            ) : null}
            {showValue && percentage !== undefined ? (
              <span
                data-snapshot-id={`${rootId}-value`}
                className={valueSurface.className}
                style={valueSurface.style}
              >
                {Math.round(percentage)}%
              </span>
            ) : null}
          </div>
        ) : null}
        <SurfaceStyles css={rootSurface.scopedCss} />
        <SurfaceStyles css={labelRowSurface.scopedCss} />
        <SurfaceStyles css={labelSurface.scopedCss} />
        <SurfaceStyles css={valueSurface.scopedCss} />
        <SurfaceStyles css={circularTrackSurface.scopedCss} />
        <SurfaceStyles css={circularFillSurface.scopedCss} />
      </div>
    );
  }

  const barHeight = SIZE_MAP[size];
  const trackSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-track`,
    implementationBase: {
      width: "100%",
      overflow: "hidden",
      style: {
        height: barHeight,
        backgroundColor: trackColor,
        borderRadius: "var(--sn-radius-full, 9999px)",
        position: "relative",
      },
    },
    componentSurface: config.slots?.track,
    activeStates: [...states],
  });
  const fillSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-fill`,
    implementationBase: {},
    componentSurface: config.slots?.fill,
    activeStates: [...states],
  });
  const segmentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-segment`,
    implementationBase: {},
    componentSurface: config.slots?.segment,
    activeStates: [...states],
  });

  return (
    <div
      data-snapshot-component="progress"
      data-testid="progress"
      data-snapshot-id={rootId}
      className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
      style={{
        ...(rootSurface.style ?? {}),
        ...(config.style ?? {}),
      }}
    >
      {isIndeterminate ? <SurfaceStyles css={indeterminateBarCss} /> : null}

      {(resolvedLabel || (showValue && percentage !== undefined)) ? (
        <div
          data-snapshot-id={`${rootId}-label-row`}
          className={labelRowSurface.className}
          style={labelRowSurface.style}
        >
          {resolvedLabel ? (
            <span
              data-snapshot-id={`${rootId}-label`}
              className={labelSurface.className}
              style={labelSurface.style}
            >
              {resolvedLabel}
            </span>
          ) : null}
          {showValue && percentage !== undefined ? (
            <span
              data-snapshot-id={`${rootId}-value`}
              className={valueSurface.className}
              style={valueSurface.style}
            >
              {Math.round(percentage)}%
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={resolvedLabel ?? "Progress"}
        data-progress-bar=""
        data-snapshot-id={`${rootId}-track`}
        className={trackSurface.className}
        style={trackSurface.style}
      >
        {isIndeterminate ? (
          <div
            data-snapshot-id={`${rootId}-fill`}
            className={fillSurface.className}
            style={{
              ...(fillSurface.style ?? {}),
              position: "absolute",
              top: 0,
              left: 0,
              width: "33%",
              height: "100%",
              backgroundColor: fillColor,
              borderRadius: "var(--sn-radius-full, 9999px)",
              animation: `sn-progress-indeterminate-${uniqueId} var(--sn-duration-slow, 1.5s) var(--sn-ease-in-out, ease-in-out) infinite`,
            }}
          />
        ) : segments && segments > 1 ? (
          <div
            style={{
              display: "flex",
              height: "100%",
              gap: "var(--sn-spacing-2xs, 2px)",
            }}
          >
            {Array.from({ length: segments }).map((_, index) => {
              const segmentThreshold = ((index + 1) / segments) * 100;
              const isFilled = (percentage ?? 0) >= segmentThreshold;
              const isPartial =
                !isFilled && (percentage ?? 0) > (index / segments) * 100;
              return (
                <div
                  key={index}
                  data-snapshot-id={`${rootId}-segment`}
                  className={segmentSurface.className}
                  style={{
                    ...(segmentSurface.style ?? {}),
                    flex: 1,
                    height: "100%",
                    backgroundColor:
                      isFilled || isPartial ? fillColor : "transparent",
                    opacity: isPartial ? 0.5 : 1,
                    borderRadius: "var(--sn-radius-full, 9999px)",
                    transition:
                      "background-color var(--sn-duration-normal, 250ms) var(--sn-ease-out, ease-out)",
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div
            data-snapshot-id={`${rootId}-fill`}
            className={fillSurface.className}
            style={{
              ...(fillSurface.style ?? {}),
              width: `${percentage ?? 0}%`,
              height: "100%",
              backgroundColor: fillColor,
              borderRadius: "var(--sn-radius-full, 9999px)",
              transition:
                "width var(--sn-duration-normal, 250ms) var(--sn-ease-out, ease-out)",
            }}
          />
        )}
      </div>

      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={labelRowSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={valueSurface.scopedCss} />
      <SurfaceStyles css={trackSurface.scopedCss} />
      <SurfaceStyles css={fillSurface.scopedCss} />
      <SurfaceStyles css={segmentSurface.scopedCss} />
    </div>
  );
}
