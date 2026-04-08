import { useEffect, useId } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import type { ProgressConfig } from "./types";

/** Height in pixels for each size variant. */
const SIZE_MAP = { sm: 4, md: 8, lg: 12 } as const;

/** SVG dimensions for each size variant of the circular progress. */
const CIRCULAR_SIZE_MAP = { sm: 32, md: 48, lg: 64 } as const;

/**
 * Progress component — displays a determinate or indeterminate progress
 * bar or circular ring.
 *
 * When `value` is omitted, renders an indeterminate shimmer animation.
 * When `variant` is "circular", renders an SVG ring.
 *
 * @param props - Component props containing the progress configuration
 *
 * @example
 * ```json
 * {
 *   "type": "progress",
 *   "value": 75,
 *   "label": "Upload",
 *   "showValue": true,
 *   "color": "success",
 *   "size": "lg"
 * }
 * ```
 */
export function Progress({ config }: { config: ProgressConfig }) {
  const uniqueId = useId();
  const publish = usePublish(config.id);

  // Check visibility
  const visible = useSubscribe(config.visible ?? true);
  if (visible === false) return null;

  const resolvedLabel = useSubscribe(config.label) as string | undefined;
  const resolvedValue = useSubscribe(config.value) as number | undefined;

  const max = config.max ?? 100;
  const color = config.color ?? "primary";
  const size = config.size ?? "md";
  const variant = config.variant ?? "bar";
  const showValue = config.showValue ?? false;
  const segments = config.segments;

  const percentage =
    resolvedValue !== undefined
      ? Math.min(100, Math.max(0, (resolvedValue / max) * 100))
      : undefined;
  const isIndeterminate = percentage === undefined;

  // Publish value
  useEffect(() => {
    if (publish && percentage !== undefined) {
      publish({ value: resolvedValue, percentage });
    }
  }, [publish, resolvedValue, percentage]);

  const fillColor = `var(--sn-color-${color}, currentColor)`;
  const trackColor = "var(--sn-color-secondary, #e5e7eb)";

  if (variant === "circular") {
    const svgSize = CIRCULAR_SIZE_MAP[size];
    const strokeWidth = size === "sm" ? 3 : size === "lg" ? 5 : 4;
    const radius = (svgSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = isIndeterminate
      ? circumference * 0.75
      : circumference - (circumference * (percentage ?? 0)) / 100;

    return (
      <div
        data-snapshot-component="progress"
        data-testid="progress"
        className={config.className}
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--sn-spacing-xs, 0.25rem)",
        }}
      >
        {isIndeterminate && (
          <style>{`
            @keyframes sn-progress-spin-${uniqueId.replace(/:/g, "")} {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        )}
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{
            transform: "rotate(-90deg)",
            ...(isIndeterminate
              ? {
                  animation: `sn-progress-spin-${uniqueId.replace(/:/g, "")} 1.5s linear infinite`,
                }
              : {}),
          }}
          role="progressbar"
          aria-valuenow={isIndeterminate ? undefined : percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Track */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
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
            style={{
              transition: isIndeterminate
                ? undefined
                : "stroke-dashoffset var(--sn-duration-normal, 250ms) var(--sn-ease-out, ease-out)",
            }}
          />
        </svg>
        {(resolvedLabel || showValue) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sn-spacing-xs, 0.25rem)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
            }}
          >
            {resolvedLabel && <span>{resolvedLabel}</span>}
            {showValue && percentage !== undefined && (
              <span>{Math.round(percentage)}%</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Bar variant
  const barHeight = SIZE_MAP[size];

  return (
    <div
      data-snapshot-component="progress"
      data-testid="progress"
      className={config.className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--sn-spacing-xs, 0.25rem)",
      }}
    >
      {isIndeterminate && (
        <style>{`
          @keyframes sn-progress-indeterminate-${uniqueId.replace(/:/g, "")} {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      )}

      {/* Label + value row */}
      {(resolvedLabel || (showValue && percentage !== undefined)) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
          }}
        >
          {resolvedLabel && <span>{resolvedLabel}</span>}
          {showValue && percentage !== undefined && (
            <span>{Math.round(percentage)}%</span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={resolvedLabel ?? "Progress"}
        style={{
          width: "100%",
          height: barHeight,
          backgroundColor: trackColor,
          borderRadius: "var(--sn-radius-full, 9999px)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Fill */}
        {isIndeterminate ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "33%",
              height: "100%",
              backgroundColor: fillColor,
              borderRadius: "var(--sn-radius-full, 9999px)",
              animation: `sn-progress-indeterminate-${uniqueId.replace(/:/g, "")} 1.5s ease-in-out infinite`,
            }}
          />
        ) : segments && segments > 1 ? (
          <div
            style={{
              display: "flex",
              height: "100%",
              gap: 2,
            }}
          >
            {Array.from({ length: segments }).map((_, i) => {
              const segmentThreshold = ((i + 1) / segments) * 100;
              const isFilled = (percentage ?? 0) >= segmentThreshold;
              const isPartial =
                !isFilled && (percentage ?? 0) > (i / segments) * 100;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: "100%",
                    backgroundColor:
                      isFilled || isPartial
                        ? fillColor
                        : "transparent",
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
            style={{
              width: `${percentage}%`,
              height: "100%",
              backgroundColor: fillColor,
              borderRadius: "var(--sn-radius-full, 9999px)",
              transition:
                "width var(--sn-duration-normal, 250ms) var(--sn-ease-out, ease-out)",
            }}
          />
        )}
      </div>
    </div>
  );
}
