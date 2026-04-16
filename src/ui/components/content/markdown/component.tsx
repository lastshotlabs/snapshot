'use client';

import { useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import "../code-block/hljs-theme.css";
import type { MarkdownConfig } from "./types";

type SlotName =
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "heading5"
  | "heading6"
  | "paragraph"
  | "link"
  | "unorderedList"
  | "orderedList"
  | "listItem"
  | "blockquote"
  | "pre"
  | "inlineCode"
  | "blockCode"
  | "table"
  | "tableHead"
  | "tableHeader"
  | "tableCell"
  | "rule"
  | "image";

function sanitizeMarkdownProps<T extends object>(props: T): Omit<T, "node" | "ref"> {
  const { node: _node, ref: _ref, ...rest } = props as T & {
    node?: unknown;
    ref?: unknown;
  };
  return rest;
}

export function Markdown({ config }: { config: MarkdownConfig }) {
  const resolvedContent = useSubscribe(config.content) as string;
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);
  const rootId = config.id ?? "markdown";

  useEffect(() => {
    if (publish && resolvedContent) {
      publish({ content: resolvedContent });
    }
  }, [publish, resolvedContent]);

  const content = typeof resolvedContent === "string" ? resolvedContent : "";

  const slotSurface = (slot: SlotName, implementationBase: Record<string, unknown>) =>
    resolveSurfacePresentation({
      surfaceId: `${rootId}-${slot}`,
      implementationBase,
      componentSurface: config.slots?.[slot],
    });

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      color: "var(--sn-color-foreground, #111827)",
      style: {
        fontFamily: "var(--sn-font-sans, system-ui, sans-serif)",
        ...(config.maxHeight
          ? { maxHeight: config.maxHeight, overflowY: "auto" as const }
          : {}),
      },
    },
    componentSurface: extractSurfaceConfig(config, { omit: ["maxHeight"] }),
    itemSurface: config.slots?.root,
  });

  const surfaces = {
    heading1: slotSurface("heading1", {
      fontSize: "4xl",
      fontWeight: "bold",
      lineHeight: "tight",
      color: "var(--sn-color-foreground, #111827)",
      style: {
        marginTop: "var(--sn-spacing-xl, 1.5rem)",
        marginBottom: "var(--sn-spacing-md, 0.75rem)",
      },
    }),
    heading2: slotSurface("heading2", {
      fontSize: "3xl",
      fontWeight: "bold",
      lineHeight: "tight",
      color: "var(--sn-color-foreground, #111827)",
      style: {
        marginTop: "var(--sn-spacing-xl, 1.5rem)",
        marginBottom: "var(--sn-spacing-sm, 0.5rem)",
      },
    }),
    heading3: slotSurface("heading3", {
      fontSize: "2xl",
      fontWeight: "semibold",
      lineHeight: "tight",
      color: "var(--sn-color-foreground, #111827)",
      style: {
        marginTop: "var(--sn-spacing-lg, 1rem)",
        marginBottom: "var(--sn-spacing-sm, 0.5rem)",
      },
    }),
    heading4: slotSurface("heading4", {
      fontSize: "xl",
      fontWeight: "semibold",
      lineHeight: "normal",
      color: "var(--sn-color-foreground, #111827)",
      style: {
        marginTop: "var(--sn-spacing-md, 0.75rem)",
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
      },
    }),
    heading5: slotSurface("heading5", {
      fontSize: "lg",
      fontWeight: "semibold",
      lineHeight: "normal",
      color: "var(--sn-color-foreground, #111827)",
      style: {
        marginTop: "var(--sn-spacing-md, 0.75rem)",
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
      },
    }),
    heading6: slotSurface("heading6", {
      fontSize: "md",
      fontWeight: "semibold",
      lineHeight: "normal",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        marginTop: "var(--sn-spacing-md, 0.75rem)",
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
      },
    }),
    paragraph: slotSurface("paragraph", {
      fontSize: "md",
      lineHeight: "relaxed",
      color: "var(--sn-color-foreground, #111827)",
      style: {
        marginTop: 0,
        marginBottom: "var(--sn-spacing-md, 0.75rem)",
      },
    }),
    link: slotSurface("link", {
      color: "var(--sn-color-primary, #2563eb)",
      hover: {
        color: "var(--sn-color-primary, #1d4ed8)",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        textDecoration: "underline",
        textUnderlineOffset: "2px",
      },
    }),
    unorderedList: slotSurface("unorderedList", {
      color: "var(--sn-color-foreground, #111827)",
      fontSize: "md",
      lineHeight: "relaxed",
      style: {
        paddingLeft: "var(--sn-spacing-xl, 1.5rem)",
        marginTop: 0,
        marginBottom: "var(--sn-spacing-md, 0.75rem)",
      },
    }),
    orderedList: slotSurface("orderedList", {
      color: "var(--sn-color-foreground, #111827)",
      fontSize: "md",
      lineHeight: "relaxed",
      style: {
        paddingLeft: "var(--sn-spacing-xl, 1.5rem)",
        marginTop: 0,
        marginBottom: "var(--sn-spacing-md, 0.75rem)",
      },
    }),
    listItem: slotSurface("listItem", {
      style: {
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
      },
    }),
    blockquote: slotSurface("blockquote", {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        borderLeft:
          "var(--sn-border-thick, 4px) solid var(--sn-color-border, #e5e7eb)",
        paddingLeft: "var(--sn-spacing-md, 0.75rem)",
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: "var(--sn-spacing-md, 0.75rem)",
        fontStyle: "italic",
      },
    }),
    pre: slotSurface("pre", {
      bg: "var(--sn-color-card, #ffffff)",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "md",
      style: {
        padding: "var(--sn-spacing-md, 0.75rem)",
        overflow: "auto",
        marginTop: 0,
        marginBottom: "var(--sn-spacing-md, 0.75rem)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        lineHeight: "var(--sn-leading-relaxed, 1.75)",
      },
    }),
    inlineCode: slotSurface("inlineCode", {
      bg: "var(--sn-color-secondary, #f1f5f9)",
      color: "var(--sn-color-foreground, #111827)",
      borderRadius: "sm",
      fontSize: "sm",
      style: {
        padding: "0.15em 0.4em",
        fontFamily: "var(--sn-font-mono, monospace)",
      },
    }),
    blockCode: slotSurface("blockCode", {
      color: "var(--sn-color-foreground, #111827)",
      style: {
        fontFamily: "var(--sn-font-mono, monospace)",
      },
    }),
    table: slotSurface("table", {
      style: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        color: "var(--sn-color-foreground, #111827)",
      },
    }),
    tableHead: slotSurface("tableHead", {
      style: {
        borderBottom:
          "var(--sn-border-thick, 2px) solid var(--sn-color-border, #e5e7eb)",
      },
    }),
    tableHeader: slotSurface("tableHeader", {
      color: "var(--sn-color-foreground, #111827)",
      fontWeight: "semibold",
      style: {
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
        textAlign: "left",
      },
    }),
    tableCell: slotSurface("tableCell", {
      style: {
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
        borderBottom:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    }),
    rule: slotSurface("rule", {
      style: {
        border: "none",
        borderTop:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        marginTop: "var(--sn-spacing-lg, 1rem)",
        marginBottom: "var(--sn-spacing-lg, 1rem)",
      },
    }),
    image: slotSurface("image", {
      style: {
        maxWidth: "100%",
        height: "auto",
        borderRadius: "var(--sn-radius-md, 0.5rem)",
      },
    }),
  };

  const markdownComponents = useMemo<Components>(
    () => ({
      h1: ({ children, ...props }) => (
        <h1
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-heading1`}
          className={surfaces.heading1.className}
          style={surfaces.heading1.style}
        >
          {children}
        </h1>
      ),
      h2: ({ children, ...props }) => (
        <h2
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-heading2`}
          className={surfaces.heading2.className}
          style={surfaces.heading2.style}
        >
          {children}
        </h2>
      ),
      h3: ({ children, ...props }) => (
        <h3
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-heading3`}
          className={surfaces.heading3.className}
          style={surfaces.heading3.style}
        >
          {children}
        </h3>
      ),
      h4: ({ children, ...props }) => (
        <h4
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-heading4`}
          className={surfaces.heading4.className}
          style={surfaces.heading4.style}
        >
          {children}
        </h4>
      ),
      h5: ({ children, ...props }) => (
        <h5
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-heading5`}
          className={surfaces.heading5.className}
          style={surfaces.heading5.style}
        >
          {children}
        </h5>
      ),
      h6: ({ children, ...props }) => (
        <h6
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-heading6`}
          className={surfaces.heading6.className}
          style={surfaces.heading6.style}
        >
          {children}
        </h6>
      ),
      p: ({ children, ...props }) => (
        <p
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-paragraph`}
          className={surfaces.paragraph.className}
          style={surfaces.paragraph.style}
        >
          {children}
        </p>
      ),
      a: ({ children, href, ...props }) => (
        <a
          {...sanitizeMarkdownProps(props)}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-snapshot-id={`${rootId}-link`}
          className={surfaces.link.className}
          style={surfaces.link.style}
        >
          {children}
        </a>
      ),
      ul: ({ children, ...props }) => (
        <ul
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-unorderedList`}
          className={surfaces.unorderedList.className}
          style={surfaces.unorderedList.style}
        >
          {children}
        </ul>
      ),
      ol: ({ children, ...props }) => (
        <ol
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-orderedList`}
          className={surfaces.orderedList.className}
          style={surfaces.orderedList.style}
        >
          {children}
        </ol>
      ),
      li: ({ children, ...props }) => (
        <li
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-listItem`}
          className={surfaces.listItem.className}
          style={surfaces.listItem.style}
        >
          {children}
        </li>
      ),
      blockquote: ({ children, ...props }) => (
        <blockquote
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-blockquote`}
          className={surfaces.blockquote.className}
          style={surfaces.blockquote.style}
        >
          {children}
        </blockquote>
      ),
      pre: ({ children, ...props }) => (
        <pre
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-pre`}
          className={surfaces.pre.className}
          style={surfaces.pre.style}
        >
          {children}
        </pre>
      ),
      code: ({ children, className, ...props }) => {
        const isInline = !className;
        return (
          <code
            {...sanitizeMarkdownProps(props)}
            className={[className, isInline ? surfaces.inlineCode.className : surfaces.blockCode.className]
              .filter(Boolean)
              .join(" ") || undefined}
            data-snapshot-id={isInline ? `${rootId}-inlineCode` : `${rootId}-blockCode`}
            style={isInline ? surfaces.inlineCode.style : surfaces.blockCode.style}
          >
            {children}
          </code>
        );
      },
      table: ({ children, ...props }) => (
        <div
          style={{
            overflowX: "auto",
            marginBottom: "var(--sn-spacing-md, 0.75rem)",
          }}
        >
          <table
            {...sanitizeMarkdownProps(props)}
            data-snapshot-id={`${rootId}-table`}
            className={surfaces.table.className}
            style={surfaces.table.style}
          >
            {children}
          </table>
        </div>
      ),
      thead: ({ children, ...props }) => (
        <thead
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-tableHead`}
          className={surfaces.tableHead.className}
          style={surfaces.tableHead.style}
        >
          {children}
        </thead>
      ),
      th: ({ children, ...props }) => (
        <th
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-tableHeader`}
          className={surfaces.tableHeader.className}
          style={surfaces.tableHeader.style}
        >
          {children}
        </th>
      ),
      td: ({ children, ...props }) => (
        <td
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-tableCell`}
          className={surfaces.tableCell.className}
          style={surfaces.tableCell.style}
        >
          {children}
        </td>
      ),
      hr: (props) => (
        <hr
          {...sanitizeMarkdownProps(props)}
          data-snapshot-id={`${rootId}-rule`}
          className={surfaces.rule.className}
          style={surfaces.rule.style}
        />
      ),
      img: ({ alt, src, ...props }) => (
        <img
          {...sanitizeMarkdownProps(props)}
          src={src}
          alt={alt ?? ""}
          data-snapshot-id={`${rootId}-image`}
          className={surfaces.image.className}
          style={surfaces.image.style}
        />
      ),
    }),
    [rootId, surfaces],
  );

  if (visible === false) {
    return null;
  }

  return (
    <>
      <div
        data-snapshot-component="markdown"
        data-testid="markdown"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
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
      <SurfaceStyles css={rootSurface.scopedCss} />
      {Object.values(surfaces).map((surface, index) => (
        <SurfaceStyles key={index} css={surface.scopedCss} />
      ))}
    </>
  );
}
