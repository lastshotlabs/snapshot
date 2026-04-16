"use client";

import { useEffect, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../button";
import { InputControl } from "../input";
import type { DatePickerConfig } from "./types";

function toOutputValue(
  value: string | string[] | { start: string; end: string },
  format: DatePickerConfig["valueFormat"],
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
  disabledDates: DatePickerConfig["disabledDates"],
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

export function DatePicker({ config }: { config: DatePickerConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);
  const resolvedLabel = useSubscribe(config.label) as string | undefined;
  const resolvedPlaceholder = useSubscribe(config.placeholder) as
    | string
    | undefined;
  const rootId = config.id ?? "date-picker";
  const [singleValue, setSingleValue] = useState("");
  const [rangeValue, setRangeValue] = useState({ start: "", end: "" });
  const [multipleValue, setMultipleValue] = useState<string[]>([]);
  const [multipleInput, setMultipleInput] = useState("");

  useEffect(() => {
    if (!publish) {
      return;
    }

    if (config.mode === "range") {
      publish(toOutputValue(rangeValue, config.valueFormat));
      return;
    }
    if (config.mode === "multiple") {
      publish(toOutputValue(multipleValue, config.valueFormat));
      return;
    }
    publish(singleValue ? toOutputValue(singleValue, config.valueFormat) : null);
  }, [
    config.mode,
    config.valueFormat,
    multipleValue,
    publish,
    rangeValue,
    singleValue,
  ]);

  if (visible === false) {
    return null;
  }

  const triggerChange = (value: unknown) => {
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
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      fontSize: "sm",
      fontWeight: "medium",
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: config.slots?.label,
  });
  const presetsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-presets`,
    implementationBase: {
      display: "flex",
      flexWrap: "wrap",
      gap: "xs",
    },
    componentSurface: config.slots?.presets,
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
    componentSurface: config.slots?.presetButton,
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
    componentSurface: config.slots?.singleInput,
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
    componentSurface: config.slots?.range,
  });
  const rangeStartSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-rangeStart`,
    implementationBase: inputBase,
    componentSurface: config.slots?.rangeStart,
  });
  const rangeEndSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-rangeEnd`,
    implementationBase: inputBase,
    componentSurface: config.slots?.rangeEnd,
  });
  const multipleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-multiple`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "sm",
    },
    componentSurface: config.slots?.multiple,
  });
  const multipleEntrySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-multipleEntry`,
    implementationBase: {
      display: "flex",
      gap: "sm",
    },
    componentSurface: config.slots?.multipleEntry,
  });
  const multipleInputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-multipleInput`,
    implementationBase: inputBase,
    componentSurface: config.slots?.multipleInput,
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
    componentSurface: config.slots?.multipleAddButton,
  });
  const multipleValuesSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-multipleValues`,
    implementationBase: {
      display: "flex",
      flexWrap: "wrap",
      gap: "xs",
    },
    componentSurface: config.slots?.multipleValues,
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
    componentSurface: config.slots?.multipleValue,
  });
  const summarySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-summary`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.summary,
  });

  return (
    <>
      <div
        data-snapshot-component="date-picker"
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

        {config.presets && config.presets.length > 0 ? (
          <div
            data-snapshot-id={`${rootId}-presets`}
            className={presetsSurface.className}
            style={presetsSurface.style}
          >
            {config.presets.map((preset, index) => (
              <ButtonControl
                key={preset.label}
                type="button"
                surfaceId={`${rootId}-presetButton-${index}`}
                surfaceConfig={presetButtonSurface.resolvedConfigForWrapper}
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (config.mode === "range") {
                    const nextValue = { start: preset.start, end: preset.end };
                    setRangeValue(nextValue);
                    triggerChange(toOutputValue(nextValue, config.valueFormat));
                    return;
                  }
                  if (config.mode === "multiple") {
                    const nextValue = [preset.start, preset.end].filter(Boolean);
                    setMultipleValue(nextValue);
                    triggerChange(toOutputValue(nextValue, config.valueFormat));
                    return;
                  }
                  setSingleValue(preset.start);
                  triggerChange(toOutputValue(preset.start, config.valueFormat));
                }}
              >
                {preset.label}
              </ButtonControl>
            ))}
          </div>
        ) : null}

        {config.mode === "single" ? (
          <InputControl
            type={"date" as Parameters<typeof InputControl>[0]["type"]}
            value={singleValue}
            min={config.min}
            max={config.max}
            placeholder={resolvedPlaceholder}
            surfaceId={`${rootId}-singleInput`}
            surfaceConfig={singleInputSurface.resolvedConfigForWrapper}
            onChangeText={(nextValue) => {
              if (isDisabledDate(nextValue, config.disabledDates)) {
                return;
              }
              setSingleValue(nextValue);
              triggerChange(toOutputValue(nextValue, config.valueFormat));
            }}
          />
        ) : null}

        {config.mode === "range" ? (
          <div
            data-snapshot-id={`${rootId}-range`}
            className={rangeSurface.className}
            style={rangeSurface.style}
          >
            <InputControl
              type={"date" as Parameters<typeof InputControl>[0]["type"]}
              value={rangeValue.start}
              min={config.min}
              max={config.max}
              surfaceId={`${rootId}-rangeStart`}
              surfaceConfig={rangeStartSurface.resolvedConfigForWrapper}
              onChangeText={(nextValue) => {
                if (isDisabledDate(nextValue, config.disabledDates)) {
                  return;
                }
                const updated = { ...rangeValue, start: nextValue };
                setRangeValue(updated);
                triggerChange(toOutputValue(updated, config.valueFormat));
              }}
            />
            <InputControl
              type={"date" as Parameters<typeof InputControl>[0]["type"]}
              value={rangeValue.end}
              min={rangeValue.start || config.min}
              max={config.max}
              surfaceId={`${rootId}-rangeEnd`}
              surfaceConfig={rangeEndSurface.resolvedConfigForWrapper}
              onChangeText={(nextValue) => {
                if (isDisabledDate(nextValue, config.disabledDates)) {
                  return;
                }
                const updated = { ...rangeValue, end: nextValue };
                setRangeValue(updated);
                triggerChange(toOutputValue(updated, config.valueFormat));
              }}
            />
          </div>
        ) : null}

        {config.mode === "multiple" ? (
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
                min={config.min}
                max={config.max}
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
                    isDisabledDate(multipleInput, config.disabledDates)
                  ) {
                    return;
                  }
                  const nextValue = [...multipleValue, multipleInput]
                    .filter((value, index, array) => array.indexOf(value) === index)
                    .sort();
                  setMultipleValue(nextValue);
                  setMultipleInput("");
                  triggerChange(toOutputValue(nextValue, config.valueFormat));
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
                    triggerChange(toOutputValue(nextValue, config.valueFormat));
                  }}
                >
                  {formatDisplayValue(value, config.format)} x
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
          {config.mode === "single"
            ? formatDisplayValue(singleValue, config.format)
            : config.mode === "range"
              ? `${formatDisplayValue(rangeValue.start, config.format)}${
                  rangeValue.end
                    ? ` -> ${formatDisplayValue(rangeValue.end, config.format)}`
                    : ""
                }`
              : multipleValue
                  .map((value) => formatDisplayValue(value, config.format))
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
