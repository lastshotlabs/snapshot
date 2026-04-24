"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../button";
import { InputControl } from "../input";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface DatePickerPreset {
  /** Display label for the preset button. */
  label: string;
  /** Start date string for the preset range. */
  start: string;
  /** End date string for the preset range. */
  end: string;
}

export interface DatePickerDisabledEntry {
  /** Array of day-of-week indices (0 = Sunday) to disable. */
  dayOfWeek: number[];
}

export interface DatePickerFieldProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Label text displayed above the date picker. */
  label?: string;
  /** Placeholder text shown when no date is selected. */
  placeholder?: string;
  /** Selection mode: single date, date range, or multiple dates. */
  mode?: "single" | "range" | "multiple";
  /** Display format string for the selected date(s). */
  format?: string;
  /** Output format for the emitted value. */
  valueFormat?: "iso" | "unix" | "locale";
  /** Earliest selectable date (YYYY-MM-DD). */
  min?: string;
  /** Latest selectable date (YYYY-MM-DD). */
  max?: string;
  /** Preset date ranges shown as quick-select buttons. */
  presets?: DatePickerPreset[];
  /** Dates or day-of-week patterns that cannot be selected. */
  disabledDates?: (string | DatePickerDisabledEntry)[];
  /** Called when the selected date(s) change. */
  onChange?: (value: unknown) => void;

  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

function toOutputValue(
  value: string | string[] | { start: string; end: string },
  format: DatePickerFieldProps["valueFormat"],
) {
  const convert = (input: string) => {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) {
      return input;
    }
    if (format === "unix") {
      return Math.floor(date.getTime() / 1000);
    }
    if (format === "locale") {
      return new Intl.DateTimeFormat().format(date);
    }
    return date.toISOString();
  };

  if (Array.isArray(value)) {
    return value.map(convert);
  }
  if (typeof value === "object") {
    return {
      start: convert(value.start),
      end: convert(value.end),
    };
  }
  return convert(value);
}

function isDisabledDate(
  value: string,
  disabledDates: DatePickerFieldProps["disabledDates"],
): boolean {
  if (!disabledDates || value.length === 0) {
    return false;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return disabledDates.some((entry) => {
    if (typeof entry === "string") {
      return entry === value;
    }
    return entry.dayOfWeek.includes(date.getDay());
  });
}

function formatDisplayValue(value: string, format?: string): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  if (format) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      date,
    );
  }
  return new Intl.DateTimeFormat().format(date);
}

/**
 * Standalone DatePickerField -- date picker supporting single, range, and multiple
 * selection modes with presets and disabled dates. No manifest context required.
 *
 * @example
 * ```tsx
 * <DatePickerField
 *   label="Event Date"
 *   mode="range"
 *   valueFormat="iso"
 *   min="2024-01-01"
 *   onChange={(range) => setDateRange(range)}
 * />
 * ```
 */
export function DatePickerField({
  id,
  label,
  placeholder,
  mode = "single",
  format,
  valueFormat = "iso",
  min,
  max,
  presets,
  disabledDates,
  onChange,
  className,
  style,
  slots,
}: DatePickerFieldProps) {
  const rootId = id ?? "date-picker";
  const [singleValue, setSingleValue] = useState("");
  const [rangeValue, setRangeValue] = useState({ start: "", end: "" });
  const [multipleValue, setMultipleValue] = useState<string[]>([]);
  const [multipleInput, setMultipleInput] = useState("");

  const currentOutput = useMemo(() => {
    if (mode === "range") return toOutputValue(rangeValue, valueFormat);
    if (mode === "multiple") return toOutputValue(multipleValue, valueFormat);
    return singleValue ? toOutputValue(singleValue, valueFormat) : null;
  }, [mode, rangeValue, multipleValue, singleValue, valueFormat]);

  useEffect(() => {
    onChange?.(currentOutput);
  }, [currentOutput, onChange]);

  const triggerChange = (value: unknown) => {
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
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      fontSize: "sm",
      fontWeight: "medium",
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: slots?.label,
  });
  const presetsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-presets`,
    implementationBase: {
      display: "flex",
      flexWrap: "wrap",
      gap: "xs",
    },
    componentSurface: slots?.presets,
  });
  const presetButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-presetButton`,
    implementationBase: {
      border: "var(--sn-border-thin, 1px) solid var(--sn-color-border, #d1d5db)",
      bg: "var(--sn-color-card, #ffffff)",
      borderRadius: "sm",
      paddingY: "xs",
      paddingX: "sm",
      cursor: "pointer",
      hover: {
        bg: "var(--sn-color-accent, var(--sn-color-muted, #f3f4f6))",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
    },
    componentSurface: slots?.presetButton,
  });
  const inputBase = {
    width: "100%",
    paddingY: "sm",
    paddingX: "md",
    borderRadius: "md",
    border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
    bg: "var(--sn-color-background, #ffffff)",
    fontSize: "sm",
    focus: {
      ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
    },
    style: {
      boxSizing: "border-box",
    },
  } as const;
  const singleInputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-singleInput`,
    implementationBase: inputBase,
    componentSurface: slots?.singleInput,
  });
  const rangeSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-range`,
    implementationBase: {
      display: "grid",
      gap: "sm",
      style: {
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      },
    },
    componentSurface: slots?.range,
  });
  const rangeStartSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-rangeStart`,
    implementationBase: inputBase,
    componentSurface: slots?.rangeStart,
  });
  const rangeEndSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-rangeEnd`,
    implementationBase: inputBase,
    componentSurface: slots?.rangeEnd,
  });
  const multipleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-multiple`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "sm",
    },
    componentSurface: slots?.multiple,
  });
  const multipleEntrySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-multipleEntry`,
    implementationBase: {
      display: "flex",
      gap: "sm",
    },
    componentSurface: slots?.multipleEntry,
  });
  const multipleInputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-multipleInput`,
    implementationBase: inputBase,
    componentSurface: slots?.multipleInput,
  });
  const multipleAddButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-multipleAddButton`,
    implementationBase: {
      border: "var(--sn-border-thin, 1px) solid var(--sn-color-border, #d1d5db)",
      bg: "var(--sn-color-card, #ffffff)",
      borderRadius: "sm",
      paddingY: "sm",
      paddingX: "md",
      cursor: "pointer",
      hover: {
        bg: "var(--sn-color-accent, var(--sn-color-muted, #f3f4f6))",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
    },
    componentSurface: slots?.multipleAddButton,
  });
  const multipleValuesSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-multipleValues`,
    implementationBase: {
      display: "flex",
      flexWrap: "wrap",
      gap: "xs",
    },
    componentSurface: slots?.multipleValues,
  });
  const multipleValueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-multipleValue`,
    implementationBase: {
      border: "var(--sn-border-thin, 1px) solid var(--sn-color-border, #d1d5db)",
      bg: "var(--sn-color-secondary, #f3f4f6)",
      borderRadius: "full",
      paddingY: "xs",
      paddingX: "sm",
      cursor: "pointer",
      hover: {
        bg: "var(--sn-color-accent, var(--sn-color-muted, #e5e7eb))",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
    },
    componentSurface: slots?.multipleValue,
  });
  const summarySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-summary`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: slots?.summary,
  });

  return (
    <>
      <div
        data-snapshot-component="date-picker"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {label ? (
          <label
            data-snapshot-id={`${rootId}-label`}
            className={labelSurface.className}
            style={labelSurface.style}
          >
            {label}
          </label>
        ) : null}

        {presets && presets.length > 0 ? (
          <div
            data-snapshot-id={`${rootId}-presets`}
            className={presetsSurface.className}
            style={presetsSurface.style}
          >
            {presets.map((preset, index) => (
              <ButtonControl
                key={preset.label}
                type="button"
                surfaceId={`${rootId}-presetButton-${index}`}
                surfaceConfig={presetButtonSurface.resolvedConfigForWrapper}
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (mode === "range") {
                    const nextValue = { start: preset.start, end: preset.end };
                    setRangeValue(nextValue);
                    triggerChange(toOutputValue(nextValue, valueFormat));
                    return;
                  }
                  if (mode === "multiple") {
                    const nextValue = [preset.start, preset.end].filter(Boolean);
                    setMultipleValue(nextValue);
                    triggerChange(toOutputValue(nextValue, valueFormat));
                    return;
                  }
                  setSingleValue(preset.start);
                  triggerChange(toOutputValue(preset.start, valueFormat));
                }}
              >
                {preset.label}
              </ButtonControl>
            ))}
          </div>
        ) : null}

        {mode === "single" ? (
          <InputControl
            type={"date" as Parameters<typeof InputControl>[0]["type"]}
            value={singleValue}
            min={min}
            max={max}
            placeholder={placeholder}
            surfaceId={`${rootId}-singleInput`}
            surfaceConfig={singleInputSurface.resolvedConfigForWrapper}
            onChangeText={(nextValue) => {
              if (isDisabledDate(nextValue, disabledDates)) {
                return;
              }
              setSingleValue(nextValue);
              triggerChange(toOutputValue(nextValue, valueFormat));
            }}
          />
        ) : null}

        {mode === "range" ? (
          <div
            data-snapshot-id={`${rootId}-range`}
            className={rangeSurface.className}
            style={rangeSurface.style}
          >
            <InputControl
              type={"date" as Parameters<typeof InputControl>[0]["type"]}
              value={rangeValue.start}
              min={min}
              max={max}
              surfaceId={`${rootId}-rangeStart`}
              surfaceConfig={rangeStartSurface.resolvedConfigForWrapper}
              onChangeText={(nextValue) => {
                if (isDisabledDate(nextValue, disabledDates)) {
                  return;
                }
                const updated = { ...rangeValue, start: nextValue };
                setRangeValue(updated);
                triggerChange(toOutputValue(updated, valueFormat));
              }}
            />
            <InputControl
              type={"date" as Parameters<typeof InputControl>[0]["type"]}
              value={rangeValue.end}
              min={rangeValue.start || min}
              max={max}
              surfaceId={`${rootId}-rangeEnd`}
              surfaceConfig={rangeEndSurface.resolvedConfigForWrapper}
              onChangeText={(nextValue) => {
                if (isDisabledDate(nextValue, disabledDates)) {
                  return;
                }
                const updated = { ...rangeValue, end: nextValue };
                setRangeValue(updated);
                triggerChange(toOutputValue(updated, valueFormat));
              }}
            />
          </div>
        ) : null}

        {mode === "multiple" ? (
          <div
            data-snapshot-id={`${rootId}-multiple`}
            className={multipleSurface.className}
            style={multipleSurface.style}
          >
            <div
              data-snapshot-id={`${rootId}-multipleEntry`}
              className={multipleEntrySurface.className}
              style={multipleEntrySurface.style}
            >
              <InputControl
                type={"date" as Parameters<typeof InputControl>[0]["type"]}
                value={multipleInput}
                min={min}
                max={max}
                surfaceId={`${rootId}-multipleInput`}
                surfaceConfig={multipleInputSurface.resolvedConfigForWrapper}
                onChangeText={setMultipleInput}
              />
              <ButtonControl
                type="button"
                surfaceId={`${rootId}-multipleAddButton`}
                surfaceConfig={multipleAddButtonSurface.resolvedConfigForWrapper}
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (
                    multipleInput.length === 0 ||
                    isDisabledDate(multipleInput, disabledDates)
                  ) {
                    return;
                  }
                  const nextValue = [...multipleValue, multipleInput]
                    .filter((value, index, array) => array.indexOf(value) === index)
                    .sort();
                  setMultipleValue(nextValue);
                  setMultipleInput("");
                  triggerChange(toOutputValue(nextValue, valueFormat));
                }}
              >
                Add
              </ButtonControl>
            </div>
            <div
              data-snapshot-id={`${rootId}-multipleValues`}
              className={multipleValuesSurface.className}
              style={multipleValuesSurface.style}
            >
              {multipleValue.map((value, index) => (
                <ButtonControl
                  key={value}
                  type="button"
                  surfaceId={`${rootId}-multipleValue-${index}`}
                  surfaceConfig={multipleValueSurface.resolvedConfigForWrapper}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const nextValue = multipleValue.filter((entry) => entry !== value);
                    setMultipleValue(nextValue);
                    triggerChange(toOutputValue(nextValue, valueFormat));
                  }}
                >
                  {formatDisplayValue(value, format)} x
                </ButtonControl>
              ))}
            </div>
          </div>
        ) : null}

        <div
          data-snapshot-id={`${rootId}-summary`}
          className={summarySurface.className}
          style={summarySurface.style}
        >
          {mode === "single"
            ? formatDisplayValue(singleValue, format)
            : mode === "range"
              ? `${formatDisplayValue(rangeValue.start, format)}${
                  rangeValue.end
                    ? ` -> ${formatDisplayValue(rangeValue.end, format)}`
                    : ""
                }`
              : multipleValue
                  .map((value) => formatDisplayValue(value, format))
                  .join(", ")}
        </div>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={presetsSurface.scopedCss} />
      <SurfaceStyles css={rangeSurface.scopedCss} />
      <SurfaceStyles css={multipleSurface.scopedCss} />
      <SurfaceStyles css={multipleEntrySurface.scopedCss} />
      <SurfaceStyles css={multipleValuesSurface.scopedCss} />
      <SurfaceStyles css={summarySurface.scopedCss} />
    </>
  );
}
