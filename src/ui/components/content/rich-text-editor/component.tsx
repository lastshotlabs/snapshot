'use client';

import { useCallback, useEffect, useRef } from "react";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { RichTextEditorBase } from "./standalone";
import type { RichTextEditorConfig } from "./types";

/**
 * Manifest adapter — resolves config refs, wires publish, and delegates to RichTextEditorBase.
 */
export function RichTextEditor({ config }: { config: RichTextEditorConfig }) {
  const resolvedContent = useSubscribe(config.content ?? "") as string;
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ placeholder: config.placeholder });
  const resolvedPlaceholder = resolveOptionalPrimitiveValue(
    resolvedConfig.placeholder,
    primitiveOptions,
  );
  const resolvedReadonly = useSubscribe(config.readonly ?? false) as boolean;
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);
  const publishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (publishTimerRef.current) clearTimeout(publishTimerRef.current);
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      if (!publish) return;
      if (publishTimerRef.current) clearTimeout(publishTimerRef.current);
      publishTimerRef.current = setTimeout(() => publish(value), 300);
    },
    [publish],
  );

  useEffect(() => {
    if (publish && resolvedContent) publish(resolvedContent);
  }, []); // initial publish only

  if (visible === false) return null;

  return (
    <RichTextEditorBase
      id={config.id}
      content={resolvedContent}
      placeholder={resolvedPlaceholder}
      readonly={resolvedReadonly}
      mode={config.mode}
      toolbar={config.toolbar}
      minHeight={config.minHeight}
      maxHeight={config.maxHeight}
      onChange={handleChange}
      className={config.className}
      style={config.style}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
