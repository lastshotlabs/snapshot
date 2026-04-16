'use client';

import { useSubscribe } from "../../../context";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import type { CodeConfig } from "./types";

/**
 * Inline code primitive rendered inside flowing text or compact metadata.
 */
export function Code({ config }: { config: CodeConfig }) {
  const value = useSubscribe(config.value);
  const rootId = config.id ?? "code";
  const displayValue =
    String(value ?? "").trim().length > 0
      ? String(value ?? "")
      : (config.fallback ?? "");
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      style: {
        fontFamily: "var(--sn-font-mono, monospace)",
        fontSize: "0.95em",
        backgroundColor: "var(--sn-color-muted, #f3f4f6)",
        color: "var(--sn-color-foreground, #111827)",
        padding: "0.15em 0.35em",
        borderRadius: "var(--sn-radius-sm, 0.25rem)",
        wordBreak: "break-word",
      },
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });

  return (
    <>
      <code
        data-snapshot-component="code"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {displayValue}
      </code>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}
