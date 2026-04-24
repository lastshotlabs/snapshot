'use client';

import { useState, useMemo } from "react";
import type { CSSProperties } from "react";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import sql from "highlight.js/lib/languages/sql";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import java from "highlight.js/lib/languages/java";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import "./hljs-theme.css";

// Register languages once at module level
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("java", java);

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface CodeBlockBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** The code string to display. */
  code: string;
  /** Language for syntax highlighting. */
  language?: string;
  /** Title displayed in the title bar. */
  title?: string;
  /** Whether to show the copy button. Default: true. */
  showCopy?: boolean;
  /** Whether to show line numbers. Default: false. */
  showLineNumbers?: boolean;
  /** Whether to wrap long lines. Default: false. */
  wrap?: boolean;
  /** Whether to enable syntax highlighting. Default: true. */
  highlight?: boolean;
  /** Maximum height of the code area (CSS value). */
  maxHeight?: string;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root element. */
  className?: string;
  /** Inline style applied to the root element. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, titleBar, titleMeta, title, language, copyButton, body, pre, lineNumbers, code). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone CodeBlock — displays code with syntax highlighting,
 * optional line numbers, copy button, and title bar.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <CodeBlockBase code="console.log('hello');" language="javascript" title="example.js" showLineNumbers />
 * ```
 */
export function CodeBlockBase({
  id,
  code,
  language,
  title,
  showCopy = true,
  showLineNumbers = false,
  wrap = false,
  highlight: highlightEnabled = true,
  maxHeight,
  className,
  style,
  slots,
}: CodeBlockBaseProps) {
  const [copied, setCopied] = useState(false);
  const rootId = id ?? "code-block";

  // Compute highlighted HTML
  const highlightedHtml = useMemo(() => {
    if (!highlightEnabled || !code) return null;
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(code, { language }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch {
      return null;
    }
  }, [highlightEnabled, code, language]);

  const lines = code.split("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: silent fail
    }
  }

  const hasTitleBar = title || language || showCopy;
  const copyLabel = copied ? "Copied!" : "Copy";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      borderRadius: "md",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      bg: "var(--sn-color-card, #ffffff)",
      overflow: "hidden",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const titleBarSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-titleBar`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "between",
      paddingY: "xs",
      paddingX: "md",
      bg: "var(--sn-color-secondary, #f1f5f9)",
      border: "0",
      style: {
        borderBottom:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        gap: "var(--sn-spacing-sm, 0.5rem)",
      },
    },
    componentSurface: slots?.titleBar,
  });
  const titleMetaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-titleMeta`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "sm",
      style: {
        minWidth: 0,
      },
    },
    componentSurface: slots?.titleMeta,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      fontSize: "xs",
      fontWeight: "semibold",
      color: "var(--sn-color-foreground, #111827)",
      style: {
        fontFamily: "var(--sn-font-mono, monospace)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: slots?.title,
  });
  const languageSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-language`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        whiteSpace: "nowrap",
      },
    },
    componentSurface: slots?.language,
  });
  const copyButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-copyButton`,
    implementationBase: {
      fontSize: "xs",
      paddingY: "xs",
      paddingX: "sm",
      borderRadius: "sm",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      bg: "var(--sn-color-card, #ffffff)",
      color: "var(--sn-color-foreground, #111827)",
      cursor: "pointer",
      transition: "colors",
      hover: {
        bg: "var(--sn-color-accent, var(--sn-color-muted, #f3f4f6))",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        whiteSpace: "nowrap",
        flexShrink: 0,
      },
    },
    componentSurface: slots?.copyButton,
  });
  const bodySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-body`,
    implementationBase: {
      overflow: "auto",
      style: {
        maxHeight,
      },
    },
    componentSurface: slots?.body,
  });
  const preSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-pre`,
    implementationBase: {
      display: "flex",
      style: {
        margin: 0,
        padding: "var(--sn-spacing-md, 1rem)",
        fontFamily: "var(--sn-font-mono, monospace)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        lineHeight: "var(--sn-leading-relaxed, 1.625)",
      },
    },
    componentSurface: slots?.pre,
  });
  const lineNumbersSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-lineNumbers`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        borderRight:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        paddingRight: "var(--sn-spacing-sm, 0.5rem)",
        marginRight: "var(--sn-spacing-md, 1rem)",
        textAlign: "right",
        userSelect: "none",
        flexShrink: 0,
      },
    },
    componentSurface: slots?.lineNumbers,
  });
  const codeSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-code`,
    implementationBase: {
      color: "var(--sn-color-foreground, #111827)",
      style: {
        flex: 1,
        whiteSpace: wrap ? "pre-wrap" : "pre",
        wordBreak: wrap ? "break-all" : undefined,
      },
    },
    componentSurface: slots?.code,
  });

  return (
    <>
      <div
        data-snapshot-component="code-block"
        data-snapshot-id={rootId}
        data-testid="code-block"
        className={rootSurface.className}
        style={rootSurface.style}
      >
      {/* Title bar */}
      {hasTitleBar && (
        <div
          data-snapshot-id={`${rootId}-titleBar`}
          data-testid="code-block-titlebar"
          className={titleBarSurface.className}
          style={titleBarSurface.style}
        >
          <div
            data-snapshot-id={`${rootId}-titleMeta`}
            className={titleMetaSurface.className}
            style={titleMetaSurface.style}
          >
            {title && (
              <span
                data-snapshot-id={`${rootId}-title`}
                data-testid="code-block-title"
                className={titleSurface.className}
                style={titleSurface.style}
              >
                {title}
              </span>
            )}
            {language && (
              <span
                data-snapshot-id={`${rootId}-language`}
                data-testid="code-block-language"
                className={languageSurface.className}
                style={languageSurface.style}
              >
                {language}
              </span>
            )}
          </div>

          {showCopy && (
            <ButtonControl
              type="button"
              onClick={() => void handleCopy()}
              testId="code-block-copy"
              variant="ghost"
              size="sm"
              surfaceId={`${rootId}-copyButton`}
              surfaceConfig={copyButtonSurface.resolvedConfigForWrapper}
            >
              {copyLabel}
            </ButtonControl>
          )}
        </div>
      )}

      {/* Code area */}
      <div
        data-snapshot-id={`${rootId}-body`}
        className={bodySurface.className}
        style={bodySurface.style}
      >
        <pre
          data-snapshot-id={`${rootId}-pre`}
          className={preSurface.className}
          style={preSurface.style}
        >
          {/* Line numbers */}
          {showLineNumbers && (
            <div
              data-snapshot-id={`${rootId}-lineNumbers`}
              data-testid="code-block-line-numbers"
              aria-hidden="true"
              className={lineNumbersSurface.className}
              style={lineNumbersSurface.style}
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}

          {/* Code content */}
          {highlightedHtml ? (
            <code
              data-snapshot-id={`${rootId}-code`}
              data-testid="code-block-code"
              className={codeSurface.className}
              style={codeSurface.style}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <code
              data-snapshot-id={`${rootId}-code`}
              data-testid="code-block-code"
              className={codeSurface.className}
              style={codeSurface.style}
            >
              {code}
            </code>
          )}
        </pre>
      </div>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={titleBarSurface.scopedCss} />
      <SurfaceStyles css={titleMetaSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={languageSurface.scopedCss} />
      <SurfaceStyles css={copyButtonSurface.scopedCss} />
      <SurfaceStyles css={bodySurface.scopedCss} />
      <SurfaceStyles css={preSurface.scopedCss} />
      <SurfaceStyles css={lineNumbersSurface.scopedCss} />
      <SurfaceStyles css={codeSurface.scopedCss} />
    </>
  );
}
