'use client';

import { useResolveFrom, useSubscribe } from "../../../context/hooks";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { CodeBlockBase } from "./standalone";
import type { CodeBlockConfig } from "./types";

/**
 * Manifest adapter — resolves config refs and delegates to CodeBlockBase.
 */
export function CodeBlock({ config }: { config: CodeBlockConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const resolvedCode = useSubscribe(config.code);
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ title: config.title });
  const resolvedTitle = resolveOptionalPrimitiveValue(
    resolvedConfig.title,
    primitiveOptions,
  );
  const codeText = typeof resolvedCode === "string" ? resolvedCode : "";

  if (visible === false) return null;

  return (
    <CodeBlockBase
      id={config.id}
      code={codeText}
      language={config.language}
      title={resolvedTitle}
      showCopy={config.showCopy}
      showLineNumbers={config.showLineNumbers}
      wrap={config.wrap}
      highlight={config.highlight}
      maxHeight={config.maxHeight}
      className={config.className}
      style={config.style}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
