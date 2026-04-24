'use client';

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useResolveFrom, useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import {
  executeEventAction,
  focusEventPayload,
  keyEventPayload,
  mouseEventPayload,
  pointerEventPayload,
  touchEventPayload,
} from "../../_base/events";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { InputField } from "./standalone";
import type { InputConfig, InputControlProps } from "./types";

// Re-export InputControl from its standalone module for backwards compatibility
export { InputControl } from "./control";

/**
 * Manifest adapter — resolves config refs and actions, delegates to InputField.
 */
export function Input({ config }: { config: InputConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const primitiveOptions = usePrimitiveValueOptions();

  const visible = useSubscribe(config.visible ?? true);
  const resolvedConfig = useResolveFrom({
    label: config.label,
    placeholder: config.placeholder,
    helperText: config.helperText,
    errorText: config.errorText,
  });
  const resolvedValue = useSubscribe(config.value) as string | undefined;
  const resolvedDisabled = useSubscribe(config.disabled ?? false) as boolean;
  const resolvedReadonly = useSubscribe(config.readonly ?? false) as boolean;
  const resolvedLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.label,
    primitiveOptions,
  );
  const resolvedPlaceholder = resolveOptionalPrimitiveValue(
    resolvedConfig.placeholder,
    primitiveOptions,
  );
  const resolvedHelperText = resolveOptionalPrimitiveValue(
    resolvedConfig.helperText,
    primitiveOptions,
  );
  const resolvedErrorText = resolveOptionalPrimitiveValue(
    resolvedConfig.errorText,
    primitiveOptions,
  );

  const inputType = config.inputType ?? "text";
  const [value, setValue] = useState(resolvedValue ?? "");

  useEffect(() => {
    if (resolvedValue !== undefined) {
      setValue(resolvedValue);
    }
  }, [resolvedValue]);

  useEffect(() => {
    publish?.({ value });
  }, [publish, value]);

  const buildPayload = useCallback(
    (nextValue = value) => ({
      id: config.id,
      value: nextValue,
      inputType,
    }),
    [config.id, inputType, value],
  );

  const handleChange = useCallback(
    (nextValue: string) => {
      setValue(nextValue);
      const payload = buildPayload(nextValue);
      void executeEventAction(execute, config.on?.input, payload);
      void executeEventAction(execute, config.on?.change, payload);
    },
    [buildPayload, config.on?.change, config.on?.input, execute],
  );

  const handleBlur = useCallback<NonNullable<InputControlProps["onBlur"]>>((event) => {
    void executeEventAction(
      execute,
      config.on?.blur,
      focusEventPayload(event, buildPayload()),
    );
  }, [buildPayload, config.on?.blur, execute]);

  const handleFocus = useCallback<NonNullable<InputControlProps["onFocus"]>>((event) => {
    void executeEventAction(
      execute,
      config.on?.focus,
      focusEventPayload(event, buildPayload()),
    );
  }, [buildPayload, config.on?.focus, execute]);

  const handleClick = useCallback<NonNullable<InputControlProps["onClick"]>>((event) => {
    void executeEventAction(
      execute,
      config.on?.click,
      mouseEventPayload(event, buildPayload()),
    );
  }, [buildPayload, config.on?.click, execute]);

  const handleKeyDown = useCallback<NonNullable<InputControlProps["onKeyDown"]>>((event) => {
    void executeEventAction(
      execute,
      config.on?.keyDown,
      keyEventPayload(event, buildPayload()),
    );
  }, [buildPayload, config.on?.keyDown, execute]);

  const handleMouseEnter = useCallback<NonNullable<InputControlProps["onMouseEnter"]>>((event) => {
    void executeEventAction(
      execute,
      config.on?.mouseEnter,
      mouseEventPayload(event, buildPayload()),
    );
  }, [buildPayload, config.on?.mouseEnter, execute]);

  const handleMouseLeave = useCallback<NonNullable<InputControlProps["onMouseLeave"]>>((event) => {
    void executeEventAction(
      execute,
      config.on?.mouseLeave,
      mouseEventPayload(event, buildPayload()),
    );
  }, [buildPayload, config.on?.mouseLeave, execute]);

  const handlePointerDown = useCallback<NonNullable<InputControlProps["onPointerDown"]>>((event) => {
    void executeEventAction(
      execute,
      config.on?.pointerDown,
      pointerEventPayload(event, buildPayload()),
    );
  }, [buildPayload, config.on?.pointerDown, execute]);

  const handlePointerUp = useCallback<NonNullable<InputControlProps["onPointerUp"]>>((event) => {
    void executeEventAction(
      execute,
      config.on?.pointerUp,
      pointerEventPayload(event, buildPayload()),
    );
  }, [buildPayload, config.on?.pointerUp, execute]);

  const handleTouchStart = useCallback<NonNullable<InputControlProps["onTouchStart"]>>((event) => {
    void executeEventAction(
      execute,
      config.on?.touchStart,
      touchEventPayload(event, buildPayload()),
    );
  }, [buildPayload, config.on?.touchStart, execute]);

  const handleTouchEnd = useCallback<NonNullable<InputControlProps["onTouchEnd"]>>((event) => {
    void executeEventAction(
      execute,
      config.on?.touchEnd,
      touchEventPayload(event, buildPayload()),
    );
  }, [buildPayload, config.on?.touchEnd, execute]);

  if (visible === false) {
    return null;
  }

  return (
    <InputField
      id={config.id}
      label={resolvedLabel}
      placeholder={resolvedPlaceholder}
      value={value}
      type={inputType}
      required={config.required}
      disabled={resolvedDisabled}
      readOnly={resolvedReadonly}
      maxLength={config.maxLength}
      pattern={config.pattern}
      helperText={resolvedHelperText}
      errorText={resolvedErrorText}
      icon={config.icon}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
