'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView, keymap, placeholder as cmPlaceholder } from "@codemirror/view";
import { Icon } from "../../../icons/icon";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { MarkdownBase } from "../markdown/standalone";
import { snEditorTheme, snSyntaxHighlight } from "./cm-theme";
import { applyToolbarAction, DEFAULT_TOOLBAR, TOOLBAR_ITEMS } from "./toolbar";
import type { ToolbarItem } from "./toolbar";

function resolveToolbar(toolbar: boolean | string[] | undefined): ToolbarItem[] {
  if (toolbar === false) return [];
  const names = toolbar === true || toolbar === undefined ? DEFAULT_TOOLBAR : toolbar;
  return names.map((name) => TOOLBAR_ITEMS[name]).filter((item): item is ToolbarItem => item !== undefined);
}

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface RichTextEditorBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Initial markdown content. */
  content?: string;
  /** Placeholder text for the editor. */
  placeholder?: string;
  /** Whether the editor is read-only. */
  readonly?: boolean;
  /** Initial editor mode. Default: "edit". */
  mode?: "edit" | "preview" | "split";
  /** Toolbar configuration — true for defaults, false to hide, or array of item names. */
  toolbar?: boolean | string[];
  /** Minimum height of the content area (CSS value). */
  minHeight?: string;
  /** Maximum height of the content area (CSS value). */
  maxHeight?: string;
  /** Called on content changes with the markdown string. */
  onChange?: (content: string) => void;
  /** Custom preview renderer. If not provided, uses MarkdownBase. */
  renderPreview?: (content: string) => ReactNode;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root element. */
  className?: string;
  /** Inline style applied to the root element. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone RichTextEditor — a markdown editor with live preview,
 * powered by CodeMirror. No manifest context required.
 *
 * @example
 * ```tsx
 * <RichTextEditorBase content="# Hello" onChange={(md) => save(md)} />
 * ```
 */
export function RichTextEditorBase({
  id,
  content: initialContent = "",
  placeholder: placeholderText,
  readonly = false,
  mode: initialMode = "edit",
  toolbar,
  minHeight,
  maxHeight,
  onChange,
  renderPreview,
  className,
  style,
  slots,
}: RichTextEditorBaseProps) {
  const [currentMode, setCurrentMode] = useState<"edit" | "preview" | "split">(initialMode);
  const [markdownContent, setMarkdownContent] = useState(initialContent);
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const initializedRef = useRef(false);
  const rootId = id ?? "rich-text-editor";

  const toolbarItems = useMemo(() => resolveToolbar(toolbar), [toolbar]);

  const toolbarKeymap = useMemo(() => {
    const bindings: { key: string; run: (view: EditorView) => boolean }[] = [];
    for (const item of toolbarItems) {
      if (item.shortcut && item.type === "action") {
        const cmKey = item.shortcut.replace("Ctrl+", "Mod-").replace(/\+/g, "-").toLowerCase().replace("mod-", "Mod-");
        bindings.push({ key: cmKey, run: (view) => { applyToolbarAction(view, item); return true; } });
      }
    }
    return bindings;
  }, [toolbarItems]);

  useEffect(() => {
    if (!editorRef.current || currentMode === "preview") return;
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const next = update.state.doc.toString();
        setMarkdownContent(next);
        onChange?.(next);
      }
    });
    const extensions = [
      markdown({ codeLanguages: languages }),
      snEditorTheme,
      snSyntaxHighlight,
      EditorView.lineWrapping,
      updateListener,
      EditorView.editable.of(!readonly),
      keymap.of(toolbarKeymap),
    ];
    if (placeholderText) extensions.push(cmPlaceholder(placeholderText));
    const state = EditorState.create({ doc: markdownContent, extensions });
    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;
    return () => { view.destroy(); viewRef.current = null; };
  }, [currentMode, placeholderText, readonly, toolbarKeymap]); // intentional

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (initialContent && initialContent !== markdownContent) {
        setMarkdownContent(initialContent);
        if (viewRef.current) {
          const view = viewRef.current;
          view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: initialContent } });
        }
      }
    }
  }, [initialContent, markdownContent]);

  const handleToolbarAction = useCallback((item: ToolbarItem) => {
    if (viewRef.current && item.type === "action") applyToolbarAction(viewRef.current, item);
  }, []);

  const showEditor = currentMode === "edit" || currentMode === "split";
  const showPreview = currentMode === "preview" || currentMode === "split";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: { display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "md", border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)", bg: "var(--sn-color-card, #ffffff)" },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const toolbarSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-toolbar`,
    implementationBase: { display: "flex", alignItems: "center", gap: "xs", paddingY: "xs", paddingX: "sm", bg: "var(--sn-color-secondary, #f9fafb)", style: { borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)", flexWrap: "wrap" } },
    componentSurface: slots?.toolbar,
  });
  const toolbarGroupSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-toolbarGroup`,
    implementationBase: { display: "flex", alignItems: "center", gap: "xs", flex: "1", style: { flexWrap: "wrap" } },
    componentSurface: slots?.toolbarGroup,
  });
  const modeGroupSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-modeGroup`,
    implementationBase: { display: "flex", alignItems: "center", gap: "2xs", bg: "var(--sn-color-border, #e5e7eb)", borderRadius: "sm", overflow: "hidden" },
    componentSurface: slots?.modeGroup,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: { display: "flex", flexWrap: "wrap", flex: "1", overflow: "auto", style: { minHeight: minHeight ?? "12rem", maxHeight } },
    componentSurface: slots?.content,
  });
  const emptyPreviewSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-emptyPreview`,
    implementationBase: { color: "var(--sn-color-muted-foreground, #9ca3af)", style: { fontStyle: "italic" } },
    componentSurface: slots?.emptyPreview,
  });

  const editorPaneSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-editorPane`,
    implementationBase: {
      flex: showPreview ? "1 1 50%" : "1 1 100%",
      overflow: "auto",
      style: { minWidth: showPreview ? "min(100%, 250px)" : 0, borderRight: showPreview ? "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" : undefined },
    },
    componentSurface: slots?.editorPane,
  });
  const previewPaneSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-previewPane`,
    implementationBase: {
      flex: showEditor ? "1 1 50%" : "1 1 100%",
      overflow: "auto",
      padding: "md",
      style: { minWidth: showEditor ? "min(100%, 250px)" : 0 },
    },
    componentSurface: slots?.previewPane,
  });

  return (
    <>
      <div data-snapshot-component="rich-text-editor" data-testid="rich-text-editor" data-snapshot-id={rootId} className={rootSurface.className} style={rootSurface.style}>
        {toolbar !== false ? (
          <div data-editor-toolbar="" data-testid="rich-text-editor-toolbar" role="toolbar" data-snapshot-id={`${rootId}-toolbar`} className={toolbarSurface.className} style={toolbarSurface.style}>
            <div data-snapshot-id={`${rootId}-toolbarGroup`} className={toolbarGroupSurface.className} style={toolbarGroupSurface.style}>
              {toolbarItems.map((item, index) =>
                item.type === "separator" ? (
                  <div key={`sep-${index}`} data-snapshot-id={`${rootId}-separator-${index}`} style={{ width: "1px", height: "1.25rem", margin: "0 var(--sn-spacing-xs, 0.25rem)", backgroundColor: "var(--sn-color-border, #e5e7eb)" }} />
                ) : (
                  (() => {
                    const buttonSurface = resolveSurfacePresentation({
                      surfaceId: `${rootId}-toolbarButton-${index}`,
                      implementationBase: { display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "sm", cursor: readonly ? "not-allowed" : "pointer", color: "var(--sn-color-foreground, #111827)", hover: readonly ? undefined : { bg: "var(--sn-color-accent, var(--sn-color-muted))" }, focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" }, style: { width: "1.75rem", height: "1.75rem", border: "none", backgroundColor: "transparent", padding: 0, opacity: readonly ? 0.5 : 1 } },
                      componentSurface: slots?.toolbarButton,
                    });
                    return (
                      <div key={item.name}>
                        <ButtonControl type="button" onClick={() => handleToolbarAction(item)} title={item.shortcut ? `${item.label} (${item.shortcut})` : item.label} ariaLabel={item.label} disabled={readonly} surfaceId={`${rootId}-toolbarButton-${index}`} surfaceConfig={buttonSurface.resolvedConfigForWrapper} variant="ghost" size="icon">
                          <Icon name={item.icon} size={14} />
                        </ButtonControl>
                      </div>
                    );
                  })()
                ),
              )}
            </div>
            <div data-snapshot-id={`${rootId}-modeGroup`} className={modeGroupSurface.className} style={modeGroupSurface.style}>
              {(["edit", "preview", "split"] as const).map((mode, index) => {
                const active = currentMode === mode;
                const buttonSurface = resolveSurfacePresentation({
                  surfaceId: `${rootId}-modeButton-${index}`,
                  implementationBase: { paddingY: "xs", paddingX: "sm", cursor: "pointer", bg: active ? "var(--sn-color-card, #ffffff)" : "var(--sn-color-secondary, #f9fafb)", color: active ? "var(--sn-color-foreground, #111827)" : "var(--sn-color-muted-foreground, #6b7280)", hover: { bg: "var(--sn-color-accent, var(--sn-color-muted))" }, focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" }, style: { border: "none", textTransform: "capitalize", fontSize: "var(--sn-font-size-xs, 0.75rem)", fontWeight: active ? "var(--sn-font-weight-semibold, 600)" : "var(--sn-font-weight-normal, 400)" } },
                  componentSurface: slots?.modeButton,
                  activeStates: active ? ["active"] : [],
                });
                return (
                  <div key={mode}>
                    <ButtonControl type="button" onClick={() => setCurrentMode(mode)} ariaLabel={`Switch to ${mode} mode`} ariaPressed={active} surfaceId={`${rootId}-modeButton-${index}`} surfaceConfig={buttonSurface.resolvedConfigForWrapper} variant="ghost" size="sm" activeStates={active ? ["active"] : []}>
                      {mode === "split" ? <Icon name="split" size={12} /> : mode === "preview" ? <Icon name="eye" size={12} /> : <Icon name="edit" size={12} />}
                    </ButtonControl>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div data-editor-content="" data-snapshot-id={`${rootId}-content`} className={contentSurface.className} style={contentSurface.style}>
          {showEditor ? (
            <div ref={editorRef} data-testid="rich-text-editor-editor" data-snapshot-id={`${rootId}-editorPane`} className={editorPaneSurface.className} style={editorPaneSurface.style} />
          ) : null}
          {showPreview ? (
            <div data-testid="rich-text-editor-preview" data-snapshot-id={`${rootId}-previewPane`} className={previewPaneSurface.className} style={previewPaneSurface.style}>
              {markdownContent ? (
                renderPreview ? renderPreview(markdownContent) : <MarkdownBase content={markdownContent} />
              ) : (
                <div data-snapshot-id={`${rootId}-emptyPreview`} className={emptyPreviewSurface.className} style={emptyPreviewSurface.style}>Nothing to preview</div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={toolbarSurface.scopedCss} />
      <SurfaceStyles css={toolbarGroupSurface.scopedCss} />
      <SurfaceStyles css={modeGroupSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
      <SurfaceStyles css={emptyPreviewSurface.scopedCss} />
      <SurfaceStyles css={editorPaneSurface.scopedCss} />
      <SurfaceStyles css={previewPaneSurface.scopedCss} />
    </>
  );
}
