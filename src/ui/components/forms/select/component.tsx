'use client';

import { useEffect, useMemo, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import {
  executeEventAction,
  focusEventPayload,
  keyEventPayload,
  mouseEventPayload,
  pointerEventPayload,
  touchEventPayload,
} from "../../_base/events";
import { useComponentData } from "../../_base/use-component-data";
import { setDomRef } from "../../_base/dom-ref";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import type { SelectConfig, SelectControlProps } from "./types";

type SelectOption = {
  label: string;
  value: string;
};

function toOptions(
  raw: unknown,
  labelField?: string,
  valueField?: string,
): SelectOption[] {
  const normalizedLabelField = labelField ?? "label";
  const normalizedValueField = valueField ?? "value";
  const payload =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : undefined;
  const items = Array.isArray(raw)
    ? (raw as Record<string, unknown>[])
    : ((payload?.results ??
        payload?.data ??
        payload?.items ??
        []) as Record<string, unknown>[]);

  return items.map((item) => ({
    label: String(
      item.label ??
        item[normalizedLabelField] ??
        item.name ??
        item.title ??
        item.id ??
        "",
    ),
    value: String(
      item.value ??
        item[normalizedValueField] ??
        item.id ??
        item.key ??
        "",
    ),
  }));
}

export function SelectControl({
  selectRef,
  selectId,
  name,
  value,
  disabled,
  required,
  ariaInvalid,
  ariaDescribedBy,
  ariaLabel,
  onChangeValue,
  onBlur,
  onFocus,
  onClick,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
  onPointerDown,
  onPointerUp,
  onTouchStart,
  onTouchEnd,
  className,
  style,
  surfaceId,
  surfaceConfig,
  itemSurfaceConfig,
  activeStates,
  testId,
  children,
}: SelectControlProps) {
  const resolvedStates = new Set([
    ...(activeStates ?? []),
    ...(disabled ? (["disabled"] as const) : []),
  ]);
  const resolvedItemSurfaceConfig =
    className || style
      ? {
          ...(itemSurfaceConfig ?? {}),
          className: [
            typeof itemSurfaceConfig?.className === "string"
              ? itemSurfaceConfig.className
              : undefined,
            className,
          ]
            .filter(Boolean)
            .join(" ") || undefined,
          style: {
            ...((itemSurfaceConfig?.style as Record<string, unknown> | undefined) ?? {}),
            ...(style ?? {}),
          },
        }
      : itemSurfaceConfig;
  const controlSurface = resolveSurfacePresentation({
    surfaceId,
    implementationBase: {
      width: "100%",
      style: {
        appearance: "none",
        cursor: "pointer",
        boxSizing: "border-box",
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        lineHeight: "var(--sn-leading-normal, 1.5)",
        color: "var(--sn-color-foreground, #111827)",
        backgroundColor: "var(--sn-color-background, #ffffff)",
        border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
        borderRadius: "var(--sn-radius-md, 0.375rem)",
        outline: "none",
        fontFamily: "inherit",
        transition:
          "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out), box-shadow var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
      },
      states: {
        focus: {
          style: {
            borderColor: "var(--sn-color-primary, #2563eb)",
            boxShadow:
              "0 0 0 var(--sn-ring-width, 2px) color-mix(in oklch, var(--sn-color-primary, #2563eb) 25%, transparent)",
          },
        },
        disabled: {
          opacity: 0.5,
          cursor: "not-allowed",
        },
      },
    },
    componentSurface: surfaceConfig,
    itemSurface: resolvedItemSurfaceConfig,
    activeStates: Array.from(resolvedStates),
  });

  return (
    <>
      <select
        ref={(instance) => setDomRef(selectRef, instance)}
        id={selectId}
        name={name}
        value={value}
        disabled={disabled}
        required={required}
        onChange={(event) => onChangeValue?.(event.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        data-snapshot-id={surfaceId}
        data-testid={testId}
        className={controlSurface.className}
        style={controlSurface.style}
      >
        {children}
      </select>
      <SurfaceStyles css={controlSurface.scopedCss} />
    </>
  );
}

export function Select({ config }: { config: SelectConfig }) {
  const execute = useActionExecutor();
  const publish = config.id ? usePublish(config.id) : null;
  const resolvedDefault = useSubscribe(config.default ?? "");
  const resolvedPlaceholder = useSubscribe(config.placeholder ?? "");
  const visible = useSubscribe(config.visible ?? true);

  const dataResult = useComponentData(
    !Array.isArray(config.options) && config.options ? config.options : "",
  );

  const options = useMemo(() => {
    if (Array.isArray(config.options)) {
      return config.options.map((option) => ({
        label:
          typeof option.label === "string" ? option.label : String(option.label),
        value: option.value,
      }));
    }

    return toOptions(dataResult.data, config.labelField, config.valueField);
  }, [config.labelField, config.options, config.valueField, dataResult.data]);

  const defaultValue =
    typeof resolvedDefault === "string"
      ? resolvedDefault
      : String(resolvedDefault ?? "");
  const placeholder =
    typeof resolvedPlaceholder === "string"
      ? resolvedPlaceholder
      : String(resolvedPlaceholder ?? "");
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    publish?.(value);
  }, [publish, value]);

  const buildPayload = (nextValue = value) => ({
    id: config.id,
    value: nextValue,
  });

  if (visible === false) {
    return null;
  }

  const isLoading =
    !Array.isArray(config.options) &&
    Boolean(config.options) &&
    dataResult.isLoading &&
    options.length === 0;
  const rootId = config.id ?? "select";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      width: "100%",
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });

  return (
    <div
      data-snapshot-component="select"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <SelectControl
        selectId={config.id}
        value={value}
        ariaLabel={placeholder || config.id || "Select"}
        onChangeValue={(nextValue) => {
          setValue(nextValue);
          const payload = buildPayload(nextValue);
          void executeEventAction(execute, config.on?.input, payload);
          void executeEventAction(execute, config.on?.change, payload);
        }}
        onBlur={(event) => {
          void executeEventAction(
            execute,
            config.on?.blur,
            focusEventPayload(event, buildPayload()),
          );
        }}
        onFocus={(event) => {
          void executeEventAction(
            execute,
            config.on?.focus,
            focusEventPayload(event, buildPayload()),
          );
        }}
        onClick={(event) => {
          void executeEventAction(
            execute,
            config.on?.click,
            mouseEventPayload(event, buildPayload()),
          );
        }}
        onKeyDown={(event) => {
          void executeEventAction(
            execute,
            config.on?.keyDown,
            keyEventPayload(event, buildPayload()),
          );
        }}
        onMouseEnter={(event) => {
          void executeEventAction(
            execute,
            config.on?.mouseEnter,
            mouseEventPayload(event, buildPayload()),
          );
        }}
        onMouseLeave={(event) => {
          void executeEventAction(
            execute,
            config.on?.mouseLeave,
            mouseEventPayload(event, buildPayload()),
          );
        }}
        onPointerDown={(event) => {
          void executeEventAction(
            execute,
            config.on?.pointerDown,
            pointerEventPayload(event, buildPayload()),
          );
        }}
        onPointerUp={(event) => {
          void executeEventAction(
            execute,
            config.on?.pointerUp,
            pointerEventPayload(event, buildPayload()),
          );
        }}
        onTouchStart={(event) => {
          void executeEventAction(
            execute,
            config.on?.touchStart,
            touchEventPayload(event, buildPayload()),
          );
        }}
        onTouchEnd={(event) => {
          void executeEventAction(
            execute,
            config.on?.touchEnd,
            touchEventPayload(event, buildPayload()),
          );
        }}
        surfaceId={`${rootId}-control`}
        surfaceConfig={config.slots?.control}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {isLoading ? (
          <option value="" disabled>
            Loading...
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectControl>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
