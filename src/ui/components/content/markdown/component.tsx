import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useEffect } from "react";
import "../code-block/hljs-theme.css";
import type { MarkdownConfig } from "./types";
import type { Components } from "react-markdown";

/**
 * Custom component overrides for ReactMarkdown.
 * All styles use `--sn-*` design tokens.
 */
const markdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1
      {...props}
      style={{
        fontSize: "var(--sn-font-size-4xl, 2.25rem)",
        fontWeight: "var(--sn-font-weight-bold, 700)" as string,
        lineHeight: "var(--sn-leading-tight, 1.25)",
        color: "var(--sn-color-foreground, #111827)",
        marginTop: "var(--sn-spacing-xl, 1.5rem)",
        marginBottom: "var(--sn-spacing-md, 0.75rem)",
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      {...props}
      style={{
        fontSize: "var(--sn-font-size-3xl, 1.875rem)",
        fontWeight: "var(--sn-font-weight-bold, 700)" as string,
        lineHeight: "var(--sn-leading-tight, 1.25)",
        color: "var(--sn-color-foreground, #111827)",
        marginTop: "var(--sn-spacing-xl, 1.5rem)",
        marginBottom: "var(--sn-spacing-sm, 0.5rem)",
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      {...props}
      style={{
        fontSize: "var(--sn-font-size-2xl, 1.5rem)",
        fontWeight: "var(--sn-font-weight-semibold, 600)" as string,
        lineHeight: "var(--sn-leading-tight, 1.25)",
        color: "var(--sn-color-foreground, #111827)",
        marginTop: "var(--sn-spacing-lg, 1rem)",
        marginBottom: "var(--sn-spacing-sm, 0.5rem)",
      }}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      {...props}
      style={{
        fontSize: "var(--sn-font-size-xl, 1.25rem)",
        fontWeight: "var(--sn-font-weight-semibold, 600)" as string,
        lineHeight: "var(--sn-leading-normal, 1.5)",
        color: "var(--sn-color-foreground, #111827)",
        marginTop: "var(--sn-spacing-md, 0.75rem)",
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
      }}
    >
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5
      {...props}
      style={{
        fontSize: "var(--sn-font-size-lg, 1.125rem)",
        fontWeight: "var(--sn-font-weight-semibold, 600)" as string,
        lineHeight: "var(--sn-leading-normal, 1.5)",
        color: "var(--sn-color-foreground, #111827)",
        marginTop: "var(--sn-spacing-md, 0.75rem)",
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
      }}
    >
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6
      {...props}
      style={{
        fontSize: "var(--sn-font-size-md, 1rem)",
        fontWeight: "var(--sn-font-weight-semibold, 600)" as string,
        lineHeight: "var(--sn-leading-normal, 1.5)",
        color: "var(--sn-color-muted-foreground, #6b7280)",
        marginTop: "var(--sn-spacing-md, 0.75rem)",
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
      }}
    >
      {children}
    </h6>
  ),
  p: ({ children, ...props }) => (
    <p
      {...props}
      style={{
        fontSize: "var(--sn-font-size-md, 1rem)",
        lineHeight: "var(--sn-leading-relaxed, 1.625)",
        color: "var(--sn-color-foreground, #111827)",
        marginTop: 0,
        marginBottom: "var(--sn-spacing-md, 0.75rem)",
      }}
    >
      {children}
    </p>
  ),
  a: ({ children, href, ...props }) => (
    <a
      {...props}
      href={href}
      style={{
        color: "var(--sn-color-primary, #2563eb)",
        textDecoration: "underline",
        textUnderlineOffset: "2px",
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }) => (
    <ul
      {...props}
      style={{
        paddingLeft: "var(--sn-spacing-xl, 1.5rem)",
        marginTop: 0,
        marginBottom: "var(--sn-spacing-md, 0.75rem)",
        color: "var(--sn-color-foreground, #111827)",
        fontSize: "var(--sn-font-size-md, 1rem)",
        lineHeight: "var(--sn-leading-relaxed, 1.625)",
      }}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      {...props}
      style={{
        paddingLeft: "var(--sn-spacing-xl, 1.5rem)",
        marginTop: 0,
        marginBottom: "var(--sn-spacing-md, 0.75rem)",
        color: "var(--sn-color-foreground, #111827)",
        fontSize: "var(--sn-font-size-md, 1rem)",
        lineHeight: "var(--sn-leading-relaxed, 1.625)",
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li
      {...props}
      style={{
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
      }}
    >
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      {...props}
      style={{
        borderLeft: "4px solid var(--sn-color-border, #e5e7eb)",
        paddingLeft: "var(--sn-spacing-md, 0.75rem)",
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: "var(--sn-spacing-md, 0.75rem)",
        color: "var(--sn-color-muted-foreground, #6b7280)",
        fontStyle: "italic",
      }}
    >
      {children}
    </blockquote>
  ),
  pre: ({ children, ...props }) => (
    <pre
      {...props}
      style={{
        backgroundColor: "var(--sn-color-card, #ffffff)",
        border: "1px solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        padding: "var(--sn-spacing-md, 0.75rem)",
        overflow: "auto",
        marginTop: 0,
        marginBottom: "var(--sn-spacing-md, 0.75rem)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        lineHeight: 1.6,
      }}
    >
      {children}
    </pre>
  ),
  code: ({ children, className, ...props }) => {
    // Inline code (no className means no language tag from rehype-highlight)
    const isInline = !className;
    if (isInline) {
      return (
        <code
          {...props}
          style={{
            backgroundColor: "var(--sn-color-secondary, #f1f5f9)",
            color: "var(--sn-color-foreground, #111827)",
            padding: "0.15em 0.4em",
            borderRadius: "var(--sn-radius-sm, 0.25rem)",
            fontSize: "0.9em",
            fontFamily: "var(--sn-font-mono, monospace)",
          }}
        >
          {children}
        </code>
      );
    }
    // Block code — styled by hljs-theme.css via the data-snapshot-component="code-block" wrapper
    return (
      <code
        {...props}
        className={className}
        style={{
          fontFamily: "var(--sn-font-mono, monospace)",
          color: "var(--sn-color-foreground, #111827)",
        }}
      >
        {children}
      </code>
    );
  },
  table: ({ children, ...props }) => (
    <div style={{ overflowX: "auto", marginBottom: "var(--sn-spacing-md, 0.75rem)" }}>
      <table
        {...props}
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          color: "var(--sn-color-foreground, #111827)",
        }}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead
      {...props}
      style={{
        borderBottom: "2px solid var(--sn-color-border, #e5e7eb)",
      }}
    >
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      {...props}
      style={{
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
        textAlign: "left",
        fontWeight: "var(--sn-font-weight-semibold, 600)" as string,
        color: "var(--sn-color-foreground, #111827)",
      }}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      {...props}
      style={{
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
        borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
      }}
    >
      {children}
    </td>
  ),
  hr: ({ ...props }) => (
    <hr
      {...props}
      style={{
        border: "none",
        borderTop: "1px solid var(--sn-color-border, #e5e7eb)",
        marginTop: "var(--sn-spacing-lg, 1rem)",
        marginBottom: "var(--sn-spacing-lg, 1rem)",
      }}
    />
  ),
  img: ({ alt, src, ...props }) => (
    <img
      {...props}
      src={src}
      alt={alt ?? ""}
      style={{
        maxWidth: "100%",
        height: "auto",
        borderRadius: "var(--sn-radius-md, 0.5rem)",
      }}
    />
  ),
};

/**
 * Markdown component — renders markdown content with full GFM support
 * and syntax highlighting powered by rehype-highlight.
 *
 * Uses `--sn-*` design tokens for all typography, colors, and spacing.
 *
 * @param props - Component props containing the markdown configuration
 *
 * @example
 * ```json
 * {
 *   "type": "markdown",
 *   "content": "# Welcome\n\nThis is **markdown** with `code`.",
 *   "maxHeight": "500px"
 * }
 * ```
 */
export function Markdown({ config }: { config: MarkdownConfig }) {
  const resolvedContent = useSubscribe(config.content) as string;
  const visible = useSubscribe(config.visible ?? true);
  const publish = config.id ? usePublish(config.id) : undefined; // eslint-disable-line react-hooks/rules-of-hooks

  useEffect(() => {
    if (publish && resolvedContent) {
      publish({ content: resolvedContent });
    }
  }, [publish, resolvedContent]);

  if (visible === false) return null;

  const content = typeof resolvedContent === "string" ? resolvedContent : "";

  return (
    <div
      data-snapshot-component="markdown"
      data-testid="markdown"
      className={config.className}
      style={{
        color: "var(--sn-color-foreground, #111827)",
        fontFamily: "var(--sn-font-sans, system-ui, sans-serif)",
        ...(config.maxHeight
          ? { maxHeight: config.maxHeight, overflowY: "auto" as const }
          : {}),
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      <div data-snapshot-component="code-block">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
