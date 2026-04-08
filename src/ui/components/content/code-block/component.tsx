import { useState, useCallback, useMemo } from "react";
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

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: silent fail
    }
  }, [codeText]);

  const hasTitleBar = config.title || config.language || showCopy;

  return (
    <div
      data-snapshot-component="code-block"
      data-testid="code-block"
      className={config.className}
      style={{
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        border: "1px solid var(--sn-color-border, #e5e7eb)",
        backgroundColor: "var(--sn-color-card, #ffffff)",
        overflow: "hidden",
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      {/* Title bar */}
      {hasTitleBar && (
        <div
          data-testid="code-block-titlebar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-md, 1rem)",
            backgroundColor: "var(--sn-color-secondary, #f1f5f9)",
            borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
            gap: "var(--sn-spacing-sm, 0.5rem)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sn-spacing-sm, 0.5rem)",
              minWidth: 0,
            }}
          >
            {config.title && (
              <span
                data-testid="code-block-title"
                style={{
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  fontWeight: "var(--sn-font-weight-semibold, 600)",
                  color: "var(--sn-color-foreground, #111827)",
                  fontFamily: "var(--sn-font-mono, monospace)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {config.title}
              </span>
            )}
            {config.language && (
              <span
                data-testid="code-block-language"
                style={{
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  color: "var(--sn-color-muted-foreground, #6b7280)",
                }}
              >
                {config.language}
              </span>
            )}
          </div>

          {showCopy && (
            <button
              data-testid="code-block-copy"
              onClick={() => void handleCopy()}
              style={{
                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                padding:
                  "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                borderRadius: "var(--sn-radius-sm, 0.25rem)",
                border: "1px solid var(--sn-color-border, #e5e7eb)",
                backgroundColor: "var(--sn-color-card, #ffffff)",
                color: "var(--sn-color-foreground, #111827)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      )}

      {/* Copy button positioned top-right when no title bar */}
      {showCopy && !hasTitleBar && (
        <div style={{ position: "relative" }}>
          <button
            data-testid="code-block-copy"
            onClick={() => void handleCopy()}
            style={{
              position: "absolute",
              top: "var(--sn-spacing-xs, 0.25rem)",
              right: "var(--sn-spacing-xs, 0.25rem)",
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              padding:
                "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
              borderRadius: "var(--sn-radius-sm, 0.25rem)",
              border: "1px solid var(--sn-color-border, #e5e7eb)",
              backgroundColor: "var(--sn-color-card, #ffffff)",
              color: "var(--sn-color-foreground, #111827)",
              cursor: "pointer",
              zIndex: 1,
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {/* Code area */}
      <div
        style={{
          overflow: "auto",
          maxHeight: config.maxHeight,
        }}
      >
        <pre
          style={{
            margin: 0,
            padding: "var(--sn-spacing-md, 1rem)",
            fontFamily: "var(--sn-font-mono, monospace)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            lineHeight: 1.6,
            display: "flex",
          }}
        >
          {/* Line numbers */}
          {showLineNumbers && (
            <div
              data-testid="code-block-line-numbers"
              aria-hidden="true"
              style={{
                color: "var(--sn-color-muted-foreground, #6b7280)",
                borderRight: "1px solid var(--sn-color-border, #e5e7eb)",
                paddingRight: "var(--sn-spacing-sm, 0.5rem)",
                marginRight: "var(--sn-spacing-md, 1rem)",
                textAlign: "right",
                userSelect: "none",
                flexShrink: 0,
              }}
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}

          {/* Code content */}
          {highlightedHtml ? (
            <code
              data-testid="code-block-code"
              style={{
                flex: 1,
                whiteSpace: wrap ? "pre-wrap" : "pre",
                wordBreak: wrap ? "break-all" : undefined,
                color: "var(--sn-color-foreground, #111827)",
              }}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <code
              data-testid="code-block-code"
              style={{
                flex: 1,
                whiteSpace: wrap ? "pre-wrap" : "pre",
                wordBreak: wrap ? "break-all" : undefined,
                color: "var(--sn-color-foreground, #111827)",
              }}
            >
              {codeText}
            </code>
          )}
        </pre>
      </div>
    </div>
  );
}
