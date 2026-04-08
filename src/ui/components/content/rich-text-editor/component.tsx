import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { EditorView, placeholder as cmPlaceholder, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { Icon } from "../../../icons/icon";
import { snEditorTheme, snSyntaxHighlight } from "./cm-theme";
import "../code-block/hljs-theme.css";
import {
  TOOLBAR_ITEMS,
  DEFAULT_TOOLBAR,
  applyToolbarAction,
} from "./toolbar";
import type { ToolbarItem } from "./toolbar";
import type { RichTextEditorConfig } from "./types";

/**
 * Resolves the toolbar config into an ordered list of ToolbarItem objects.
 */
function resolveToolbar(
  toolbar: RichTextEditorConfig["toolbar"],
): ToolbarItem[] {
  if (toolbar === false) return [];
  const names = toolbar === true || toolbar === undefined ? DEFAULT_TOOLBAR : toolbar;
  return names
    .map((name) => TOOLBAR_ITEMS[name])
    .filter((item): item is ToolbarItem => item !== undefined);
}

/**
 * RichTextEditor component — a CodeMirror 6-based markdown editor with
 * toolbar, preview pane, and split view support.
 *
 * Fetches initial content from config or via from-ref, publishes the
 * current markdown content to the page context when the editor has an id.
 *
 * @param props - Component props containing the editor configuration
 *
 * @example
 * ```json
 * {
 *   "type": "rich-text-editor",
 *   "id": "editor",
 *   "content": "# Hello World",
 *   "mode": "split",
 *   "toolbar": ["bold", "italic", "h1", "h2", "separator", "code", "link"]
 * }
 * ```
 */
export function RichTextEditor({ config }: { config: RichTextEditorConfig }) {
  const resolvedContent = useSubscribe(config.content ?? "") as string;
  const resolvedReadonly = useSubscribe(config.readonly ?? false) as boolean;
  const visible = useSubscribe(config.visible ?? true);
  const publish = config.id ? usePublish(config.id) : undefined; // eslint-disable-line react-hooks/rules-of-hooks

  const [currentMode, setCurrentMode] = useState<"edit" | "preview" | "split">(
    config.mode ?? "edit",
  );
  const [markdownContent, setMarkdownContent] = useState(resolvedContent || "");

  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const publishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track whether we initialized from resolved content
  const initializedRef = useRef(false);

  const toolbarItems = useMemo(
    () => resolveToolbar(config.toolbar),
    [config.toolbar],
  );

  // Debounced publish
  const debouncedPublish = useCallback(
    (value: string) => {
      if (!publish) return;
      if (publishTimerRef.current) clearTimeout(publishTimerRef.current);
      publishTimerRef.current = setTimeout(() => {
        publish(value);
      }, 300);
    },
    [publish],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (publishTimerRef.current) clearTimeout(publishTimerRef.current);
    };
  }, []);

  // Build keyboard shortcuts from toolbar items
  const toolbarKeymap = useMemo(() => {
    const bindings: { key: string; run: (view: EditorView) => boolean }[] = [];
    for (const item of toolbarItems) {
      if (item.shortcut && item.type === "action") {
        // Convert "Ctrl+B" to "Mod-b" format for CodeMirror
        const cmKey = item.shortcut
          .replace("Ctrl+", "Mod-")
          .replace(/\+/g, "-")
          .toLowerCase()
          .replace("mod-", "Mod-");
        bindings.push({
          key: cmKey,
          run: (view: EditorView) => {
            applyToolbarAction(view, item);
            return true;
          },
        });
      }
    }
    return bindings;
  }, [toolbarItems]);

  // Create/destroy CodeMirror editor
  useEffect(() => {
    if (!editorRef.current) return;
    if (currentMode === "preview") return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newContent = update.state.doc.toString();
        setMarkdownContent(newContent);
        debouncedPublish(newContent);
      }
    });

    const extensions = [
      markdown({ codeLanguages: languages }),
      snEditorTheme,
      snSyntaxHighlight,
      EditorView.lineWrapping,
      updateListener,
      EditorView.editable.of(!resolvedReadonly),
      keymap.of(toolbarKeymap),
    ];

    if (config.placeholder) {
      extensions.push(cmPlaceholder(config.placeholder));
    }

    const state = EditorState.create({
      doc: markdownContent,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only recreate editor when mode or readonly changes — NOT on content changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMode, resolvedReadonly, config.placeholder, toolbarKeymap]);

  // Sync external content changes into the editor
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (resolvedContent && resolvedContent !== markdownContent) {
        setMarkdownContent(resolvedContent);
        if (viewRef.current) {
          const view = viewRef.current;
          view.dispatch({
            changes: {
              from: 0,
              to: view.state.doc.length,
              insert: resolvedContent,
            },
          });
        }
      }
      return;
    }

    // External update — only if content actually differs from what we have
    if (resolvedContent !== markdownContent && viewRef.current) {
      setMarkdownContent(resolvedContent);
      const view = viewRef.current;
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: resolvedContent,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedContent]);

  // Publish initial content
  useEffect(() => {
    if (publish && markdownContent) {
      publish(markdownContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToolbarAction = useCallback((item: ToolbarItem) => {
    if (viewRef.current && item.type === "action") {
      applyToolbarAction(viewRef.current, item);
    }
  }, []);

  if (visible === false) return null;

  const showEditor = currentMode === "edit" || currentMode === "split";
  const showPreview = currentMode === "preview" || currentMode === "split";

  return (
    <div
      data-snapshot-component="rich-text-editor"
      data-testid="rich-text-editor"
      className={config.className}
      style={{
        border: "1px solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        backgroundColor: "var(--sn-color-card, #ffffff)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...config.style,
      }}
    >
      {/* Toolbar */}
      {config.toolbar !== false && (
        <div
          data-testid="rich-text-editor-toolbar"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-xs, 0.25rem)",
            padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
            borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
            backgroundColor: "var(--sn-color-secondary, #f9fafb)",
            flexWrap: "wrap",
          }}
        >
          {/* Format buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sn-spacing-xs, 0.25rem)",
              flex: 1,
              flexWrap: "wrap",
            }}
          >
            {toolbarItems.map((item, i) =>
              item.type === "separator" ? (
                <div
                  key={`sep-${i}`}
                  style={{
                    width: "1px",
                    height: "1.25rem",
                    backgroundColor: "var(--sn-color-border, #e5e7eb)",
                    margin: "0 var(--sn-spacing-xs, 0.25rem)",
                  }}
                />
              ) : (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleToolbarAction(item)}
                  title={
                    item.shortcut
                      ? `${item.label} (${item.shortcut})`
                      : item.label
                  }
                  aria-label={item.label}
                  disabled={resolvedReadonly}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "1.75rem",
                    height: "1.75rem",
                    border: "none",
                    borderRadius: "var(--sn-radius-sm, 0.25rem)",
                    backgroundColor: "transparent",
                    color: "var(--sn-color-foreground, #111827)",
                    cursor: resolvedReadonly ? "not-allowed" : "pointer",
                    opacity: resolvedReadonly
                      ? "var(--sn-opacity-disabled, 0.5)"
                      : "1",
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (!resolvedReadonly) {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "var(--sn-color-muted, #f3f4f6)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "transparent";
                  }}
                >
                  <Icon name={item.icon} size={14} />
                </button>
              ),
            )}
          </div>

          {/* Mode toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1px",
              backgroundColor: "var(--sn-color-border, #e5e7eb)",
              borderRadius: "var(--sn-radius-sm, 0.25rem)",
              overflow: "hidden",
            }}
          >
            {(["edit", "preview", "split"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setCurrentMode(mode)}
                aria-label={`${mode} mode`}
                aria-pressed={currentMode === mode}
                style={{
                  padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                  border: "none",
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  fontWeight:
                    currentMode === mode
                      ? ("var(--sn-font-weight-semibold, 600)" as string)
                      : ("var(--sn-font-weight-normal, 400)" as string),
                  backgroundColor:
                    currentMode === mode
                      ? "var(--sn-color-card, #ffffff)"
                      : "var(--sn-color-secondary, #f9fafb)",
                  color:
                    currentMode === mode
                      ? "var(--sn-color-foreground, #111827)"
                      : "var(--sn-color-muted-foreground, #6b7280)",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {mode === "split" ? (
                  <Icon name="split" size={12} />
                ) : mode === "preview" ? (
                  <Icon name="eye" size={12} />
                ) : (
                  <Icon name="edit" size={12} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor + Preview container */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          flex: 1,
          minHeight: config.minHeight ?? "12rem",
          maxHeight: config.maxHeight,
          overflow: "auto",
        }}
      >
        {/* Editor pane */}
        {showEditor && (
          <div
            ref={editorRef}
            data-testid="rich-text-editor-editor"
            style={{
              flex: showPreview ? "1 1 50%" : "1 1 100%",
              minWidth: showPreview ? "min(100%, 250px)" : 0,
              overflow: "auto",
              borderRight: showPreview
                ? "1px solid var(--sn-color-border, #e5e7eb)"
                : undefined,
            }}
          />
        )}

        {/* Preview pane */}
        {showPreview && (
          <div
            data-testid="rich-text-editor-preview"
            style={{
              flex: showEditor ? "1 1 50%" : "1 1 100%",
              minWidth: showEditor ? "min(100%, 250px)" : 0,
              overflow: "auto",
              padding: "var(--sn-spacing-md, 1rem)",
              color: "var(--sn-color-foreground, #111827)",
              fontFamily: "var(--sn-font-sans, sans-serif)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              lineHeight: "var(--sn-leading-relaxed, 1.625)",
            }}
          >
            {markdownContent ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeHighlight, { detect: true }]]}
                children={markdownContent}
                components={{
                  h1: ({ children }) => (
                    <h1
                      style={{
                        fontSize: "var(--sn-font-size-xl, 1.25rem)",
                        fontWeight: "var(--sn-font-weight-bold, 700)" as string,
                        color: "var(--sn-color-foreground, #111827)",
                        marginBottom: "var(--sn-spacing-md, 1rem)",
                        lineHeight: "var(--sn-leading-tight, 1.25)",
                        borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
                        paddingBottom: "var(--sn-spacing-sm, 0.5rem)",
                      }}
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2
                      style={{
                        fontSize: "var(--sn-font-size-lg, 1.125rem)",
                        fontWeight: "var(--sn-font-weight-semibold, 600)" as string,
                        color: "var(--sn-color-foreground, #111827)",
                        marginBottom: "var(--sn-spacing-sm, 0.5rem)",
                        lineHeight: "var(--sn-leading-tight, 1.25)",
                      }}
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3
                      style={{
                        fontSize: "var(--sn-font-size-md, 1rem)",
                        fontWeight: "var(--sn-font-weight-semibold, 600)" as string,
                        color: "var(--sn-color-foreground, #111827)",
                        marginBottom: "var(--sn-spacing-sm, 0.5rem)",
                      }}
                    >
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p
                      style={{
                        marginBottom: "var(--sn-spacing-sm, 0.5rem)",
                        color: "var(--sn-color-foreground, #111827)",
                      }}
                    >
                      {children}
                    </p>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      style={{
                        color: "var(--sn-color-info, #3b82f6)",
                        textDecoration: "underline",
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ children, className }) => {
                    const isBlock =
                      className?.includes("language-") ||
                      className?.includes("hljs");
                    if (isBlock) {
                      return (
                        <code
                          className={className}
                          style={{
                            fontFamily: "var(--sn-font-mono, monospace)",
                            fontSize: "var(--sn-font-size-sm, 0.875rem)",
                            color: "var(--sn-color-foreground, #111827)",
                          }}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code
                        style={{
                          backgroundColor: "var(--sn-color-muted, #f3f4f6)",
                          color: "var(--sn-color-destructive, #dc2626)",
                          fontFamily: "var(--sn-font-mono, monospace)",
                          fontSize: "0.9em",
                          padding: "0.15em 0.35em",
                          borderRadius: "var(--sn-radius-sm, 0.25rem)",
                        }}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre
                      style={{
                        backgroundColor: "var(--sn-color-secondary, #f3f4f6)",
                        color: "var(--sn-color-secondary-foreground, #111827)",
                        padding: "var(--sn-spacing-md, 1rem)",
                        borderRadius: "var(--sn-radius-md, 0.5rem)",
                        overflow: "auto",
                        marginBottom: "var(--sn-spacing-sm, 0.5rem)",
                        fontFamily: "var(--sn-font-mono, monospace)",
                        fontSize: "var(--sn-font-size-sm, 0.875rem)",
                      }}
                    >
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote
                      style={{
                        borderLeft: "3px solid var(--sn-color-primary, #2563eb)",
                        paddingLeft: "var(--sn-spacing-md, 1rem)",
                        color: "var(--sn-color-muted-foreground, #6b7280)",
                        fontStyle: "italic",
                        marginBottom: "var(--sn-spacing-sm, 0.5rem)",
                      }}
                    >
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children }) => (
                    <ul
                      style={{
                        paddingLeft: "var(--sn-spacing-lg, 1.5rem)",
                        marginBottom: "var(--sn-spacing-sm, 0.5rem)",
                        listStyleType: "disc",
                      }}
                    >
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol
                      style={{
                        paddingLeft: "var(--sn-spacing-lg, 1.5rem)",
                        marginBottom: "var(--sn-spacing-sm, 0.5rem)",
                        listStyleType: "decimal",
                      }}
                    >
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li
                      style={{
                        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
                      }}
                    >
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong
                      style={{
                        fontWeight: "var(--sn-font-weight-bold, 700)" as string,
                      }}
                    >
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em style={{ fontStyle: "italic" }}>{children}</em>
                  ),
                  hr: () => (
                    <hr
                      style={{
                        border: "none",
                        borderTop: "1px solid var(--sn-color-border, #e5e7eb)",
                        margin: "var(--sn-spacing-md, 1rem) 0",
                      }}
                    />
                  ),
                  table: ({ children }) => (
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginBottom: "var(--sn-spacing-sm, 0.5rem)",
                        fontSize: "var(--sn-font-size-sm, 0.875rem)",
                      }}
                    >
                      {children}
                    </table>
                  ),
                  th: ({ children }) => (
                    <th
                      style={{
                        borderBottom: "2px solid var(--sn-color-border, #e5e7eb)",
                        padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                        textAlign: "left",
                        fontWeight: "var(--sn-font-weight-semibold, 600)" as string,
                      }}
                    >
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td
                      style={{
                        borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
                        padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                      }}
                    >
                      {children}
                    </td>
                  ),
                }}
              />
            ) : (
              <div
                style={{
                  color: "var(--sn-color-muted-foreground, #9ca3af)",
                  fontStyle: "italic",
                }}
              >
                Nothing to preview
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
