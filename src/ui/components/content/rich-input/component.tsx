'use client';

import { useCallback } from "react";
import type { SlotOverrides } from "../../_base/types";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { RichInputBase } from "./standalone";
import type { RichInputConfig } from "./types";

/**
 * Manifest adapter — resolves config refs, wires actions, and delegates to RichInputBase.
 */
export function RichInput({ config }: { config: RichInputConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const readonly = useSubscribe(config.readonly ?? false) as boolean;
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    placeholder: config.placeholder,
    defaultValue: config.defaultValue,
  });
  const resolvedPlaceholder = resolveOptionalPrimitiveValue(
    resolvedConfig.placeholder,
    primitiveOptions,
  );
  const resolvedDefaultValue = resolveOptionalPrimitiveValue(
    resolvedConfig.defaultValue,
    primitiveOptions,
  );
  const resolvedValue = useSubscribe(config.value);
  const value =
    config.value === undefined
      ? undefined
      : typeof resolvedValue === "string"
        ? resolvedValue
        : resolvedValue == null
          ? ""
          : String(resolvedValue);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const handleSend = useCallback(
    (data: { html: string; text: string }) => {
      if (config.sendAction) void execute(config.sendAction, { ...data, mentions: [] });
      publish?.({ html: "", text: "", mentions: [] });
    },
    [config.sendAction, execute, publish],
  );

  const handleChange = useCallback(
    (data: { html: string; text: string }) => {
      publish?.({ ...data, mentions: [] });
    },
    [publish],
  );

  if (visible === false) return null;

  return (
    <RichInputBase
      id={config.id}
      placeholder={resolvedPlaceholder}
      defaultValue={resolvedDefaultValue}
      value={value}
      readonly={readonly}
      features={config.features}
      sendOnEnter={config.sendOnEnter}
      emitMarkdown={config.emitMarkdown}
      maxLength={config.maxLength}
      minHeight={config.minHeight}
      maxHeight={config.maxHeight}
      showSendButton={Boolean(config.sendAction)}
      onSend={config.sendAction ? handleSend : undefined}
      onChange={handleChange}
      className={config.className}
      style={config.style}
      slots={config.slots as SlotOverrides}
    />
  );
}
