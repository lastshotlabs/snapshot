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
import { useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import "./hljs-theme.css";
import type { CodeBlockConfig } from "./types";

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

/**
 * CodeBlock component — displays code with syntax highlighting,
 * optional line numbers, copy button, and title bar.
 *
 * Syntax highlighting is powered by highlight.js with colors mapped
 * to `--sn-*` design tokens (no stock hljs themes). Highlighting is
 * enabled by default and can be disabled via `highlight: false`.
 *
 * @param props - Component props containing the code block configuration
 *
 * @example
 * ```json
 * {
 *   "type": "code-block",
 *   "code": "console.log('hello');",
 *   "language": "javascript",
 *   "showLineNumbers": true,
 *   "title": "example.js"
 * }
 * ```
 */
export function CodeBlock({ config }: { config: CodeBlockConfig }) {
  const [copied, setCopied] = useState(false);

  const visible = useSubscribe(config.visible ?? true);
  const resolvedCode = useSubscribe(config.code);
  const codeText = typeof resolvedCode === "string" ? resolvedCode : "";
  const rootId = config.id ?? "code-block";

  const highlightEnabled = config.highlight !== false;

  // Compute highlighted HTML
  const highlightedHtml = useMemo(() => {
    if (!highlightEnabled || !codeText) return null;
    try {
      if (config.language && hljs.getLanguage(config.language)) {
        return hljs.highlight(codeText, { language: config.language }).value;
      }
      return hljs.highlightAuto(codeText).value;
    } catch {
      return null;
    }
  }, [highlightEnabled, codeText, config.language]);

  if (visible === false) return null;

  const showCopy = config.showCopy ?? true;
  const showLineNumbers = config.showLineNumbers ?? false;
  const wrap = config.wrap ?? false;
  const lines = codeText.split("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: silent fail
    }
  }

  const hasTitleBar = config.title || config.language || showCopy;
  const copyLabel = copied ? "Copied!" : "Copy";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      borderRadius: "md",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      bg: "var(--sn-color-card, #ffffff)",
      overflow: "hidden",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
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
    componentSurface: config.slots?.titleBar,
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
    componentSurface: config.slots?.titleMeta,
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
    componentSurface: config.slots?.title,
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
    componentSurface: config.slots?.language,
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
    componentSurface: config.slots?.copyButton,
  });
  const bodySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-body`,
    implementationBase: {
      overflow: "auto",
      style: {
        maxHeight: config.maxHeight,
      },
    },
    componentSurface: config.slots?.body,
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
    componentSurface: config.slots?.pre,
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
    componentSurface: config.slots?.lineNumbers,
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
    componentSurface: config.slots?.code,
  });

  return (
    <>
      <div
        data-snapshot-component="code-block"
        data-snapshot-id={rootId}
        data-testid="code-block"
        className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
        style={{
          ...(rootSurface.style ?? {}),
          ...((config.style as CSSProperties | undefined) ?? {}),
        }}
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
            {config.title && (
              <span
                data-snapshot-id={`${rootId}-title`}
                data-testid="code-block-title"
                className={titleSurface.className}
                style={titleSurface.style}
              >
                {config.title}
              </span>
            )}
            {config.language && (
              <span
                data-snapshot-id={`${rootId}-language`}
                data-testid="code-block-language"
                className={languageSurface.className}
                style={languageSurface.style}
              >
                {config.language}
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
              {codeText}
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
