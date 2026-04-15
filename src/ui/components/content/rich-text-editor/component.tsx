'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView, keymap, placeholder as cmPlaceholder } from "@codemirror/view";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { Icon } from "../../../icons/icon";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { Markdown } from "../markdown/component";
import { snEditorTheme, snSyntaxHighlight } from "./cm-theme";
import { applyToolbarAction, DEFAULT_TOOLBAR, TOOLBAR_ITEMS } from "./toolbar";
import type { ToolbarItem } from "./toolbar";
import type { RichTextEditorConfig } from "./types";

function resolveToolbar(toolbar: RichTextEditorConfig["toolbar"]): ToolbarItem[] {
  if (toolbar === false) return [];
  const names = toolbar === true || toolbar === undefined ? DEFAULT_TOOLBAR : toolbar;
  return names.map((name) => TOOLBAR_ITEMS[name]).filter((item): item is ToolbarItem => item !== undefined);
}

export function RichTextEditor({ config }: { config: RichTextEditorConfig }) {
  const resolvedContent = useSubscribe(config.content ?? "") as string;
  const resolvedReadonly = useSubscribe(config.readonly ?? false) as boolean;
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);
  const [currentMode, setCurrentMode] = useState<"edit" | "preview" | "split">(config.mode ?? "edit");
  const [markdownContent, setMarkdownContent] = useState(resolvedContent || "");
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const publishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);
  const rootId = config.id ?? "rich-text-editor";

  const toolbarItems = useMemo(() => resolveToolbar(config.toolbar), [config.toolbar]);
  const debouncedPublish = useCallback((value: string) => {
    if (!publish) return;
    if (publishTimerRef.current) clearTimeout(publishTimerRef.current);
    publishTimerRef.current = setTimeout(() => publish(value), 300);
  }, [publish]);

  useEffect(() => () => {
    if (publishTimerRef.current) clearTimeout(publishTimerRef.current);
  }, []);

  const toolbarKeymap = useMemo(() => {
    const bindings: { key: string; run: (view: EditorView) => boolean }[] = [];
    for (const item of toolbarItems) {
      if (item.shortcut && item.type === "action") {
        const cmKey = item.shortcut.replace("Ctrl+", "Mod-").replace(/\+/g, "-").toLowerCase().replace("mod-", "Mod-");
        bindings.push({
          key: cmKey,
          run: (view) => {
            applyToolbarAction(view, item);
            return true;
          },
        });
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
        debouncedPublish(next);
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
    if (config.placeholder) extensions.push(cmPlaceholder(config.placeholder));
    const state = EditorState.create({ doc: markdownContent, extensions });
    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [currentMode, resolvedReadonly, config.placeholder, toolbarKeymap]); // intentional

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (resolvedContent && resolvedContent !== markdownContent) {
        setMarkdownContent(resolvedContent);
        if (viewRef.current) {
          const view = viewRef.current;
          view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: resolvedContent } });
        }
      }
      return;
    }
    if (resolvedContent !== markdownContent && viewRef.current) {
      setMarkdownContent(resolvedContent);
      const view = viewRef.current;
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: resolvedContent } });
    }
  }, [markdownContent, resolvedContent]);

  useEffect(() => {
    if (publish && markdownContent) publish(markdownContent);
  }, []); // initial publish only

  const handleToolbarAction = useCallback((item: ToolbarItem) => {
    if (viewRef.current && item.type === "action") applyToolbarAction(viewRef.current, item);
  }, []);

  if (visible === false) return null;

  const showEditor = currentMode === "edit" || currentMode === "split";
  const showPreview = currentMode === "preview" || currentMode === "split";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      borderRadius: "md",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      bg: "var(--sn-color-card, #ffffff)",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const toolbarSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-toolbar`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "xs",
      paddingY: "xs",
      paddingX: "sm",
      bg: "var(--sn-color-secondary, #f9fafb)",
      style: {
        borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        flexWrap: "wrap",
      },
    },
    componentSurface: config.slots?.toolbar,
  });
  const toolbarGroupSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-toolbarGroup`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "xs",
      flex: "1",
      style: { flexWrap: "wrap" },
    },
    componentSurface: config.slots?.toolbarGroup,
  });
  const modeGroupSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-modeGroup`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "2xs",
      bg: "var(--sn-color-border, #e5e7eb)",
      borderRadius: "sm",
      overflow: "hidden",
    },
    componentSurface: config.slots?.modeGroup,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      display: "flex",
      flexWrap: "wrap",
      flex: "1",
      overflow: "auto",
      style: {
        minHeight: config.minHeight ?? "12rem",
        maxHeight: config.maxHeight,
      },
    },
    componentSurface: config.slots?.content,
  });
  const emptyPreviewSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-emptyPreview`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #9ca3af)",
      style: { fontStyle: "italic" },
    },
    componentSurface: config.slots?.emptyPreview,
  });

  return (
    <>
      <div data-snapshot-component="rich-text-editor" data-testid="rich-text-editor" data-snapshot-id={rootId} className={rootSurface.className} style={rootSurface.style}>
        {config.toolbar !== false ? (
          <div data-editor-toolbar="" data-testid="rich-text-editor-toolbar" role="toolbar" data-snapshot-id={`${rootId}-toolbar`} className={toolbarSurface.className} style={toolbarSurface.style}>
            <div data-snapshot-id={`${rootId}-toolbarGroup`} className={toolbarGroupSurface.className} style={toolbarGroupSurface.style}>
              {toolbarItems.map((item, index) =>
                item.type === "separator" ? (
                  <div
                    key={`sep-${index}`}
                    data-snapshot-id={`${rootId}-separator-${index}`}
                    className={resolveSurfacePresentation({
                      surfaceId: `${rootId}-separator-${index}`,
                      implementationBase: { bg: "var(--sn-color-border, #e5e7eb)", style: { width: "1px", height: "1.25rem", margin: "0 var(--sn-spacing-xs, 0.25rem)" } },
                      componentSurface: config.slots?.separator,
                    }).className}
                    style={resolveSurfacePresentation({
                      surfaceId: `${rootId}-separator-${index}`,
                      implementationBase: { bg: "var(--sn-color-border, #e5e7eb)", style: { width: "1px", height: "1.25rem", margin: "0 var(--sn-spacing-xs, 0.25rem)" } },
                      componentSurface: config.slots?.separator,
                    }).style}
                  />
                ) : (
                  (() => {
                    const buttonSurface = resolveSurfacePresentation({
                      surfaceId: `${rootId}-toolbarButton-${index}`,
                      implementationBase: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "sm",
                        cursor: resolvedReadonly ? "not-allowed" : "pointer",
                        color: "var(--sn-color-foreground, #111827)",
                        hover: resolvedReadonly ? undefined : { bg: "var(--sn-color-accent, var(--sn-color-muted))" },
                        focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
                        style: {
                          width: "1.75rem",
                          height: "1.75rem",
                          border: "none",
                          backgroundColor: "transparent",
                          padding: 0,
                          opacity: resolvedReadonly ? 0.5 : 1,
                        },
                      },
                      componentSurface: config.slots?.toolbarButton,
                    });
                    return (
                      <div key={item.name}>
                        <button
                          type="button"
                          onClick={() => handleToolbarAction(item)}
                          title={item.shortcut ? `${item.label} (${item.shortcut})` : item.label}
                          aria-label={item.label}
                          disabled={resolvedReadonly}
                          data-snapshot-id={`${rootId}-toolbarButton-${index}`}
                          className={buttonSurface.className}
                          style={buttonSurface.style}
                        >
                          <Icon name={item.icon} size={14} />
                        </button>
                        <SurfaceStyles css={buttonSurface.scopedCss} />
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
                  implementationBase: {
                    paddingY: "xs",
                    paddingX: "sm",
                    cursor: "pointer",
                    bg: active ? "var(--sn-color-card, #ffffff)" : "var(--sn-color-secondary, #f9fafb)",
                    color: active ? "var(--sn-color-foreground, #111827)" : "var(--sn-color-muted-foreground, #6b7280)",
                    hover: { bg: "var(--sn-color-accent, var(--sn-color-muted))" },
                    focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
                    style: {
                      border: "none",
                      textTransform: "capitalize",
                      fontSize: "var(--sn-font-size-xs, 0.75rem)",
                      fontWeight: active ? "var(--sn-font-weight-semibold, 600)" : "var(--sn-font-weight-normal, 400)",
                    },
                  },
                  componentSurface: config.slots?.modeButton,
                  activeStates: active ? ["active"] : [],
                });
                return (
                  <div key={mode}>
                    <button
                      type="button"
                      onClick={() => setCurrentMode(mode)}
                      aria-label={`Switch to ${mode} mode`}
                      aria-pressed={active}
                      data-snapshot-id={`${rootId}-modeButton-${index}`}
                      className={buttonSurface.className}
                      style={buttonSurface.style}
                    >
                      {mode === "split" ? <Icon name="split" size={12} /> : mode === "preview" ? <Icon name="eye" size={12} /> : <Icon name="edit" size={12} />}
                    </button>
                    <SurfaceStyles css={buttonSurface.scopedCss} />
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div data-editor-content="" data-snapshot-id={`${rootId}-content`} className={contentSurface.className} style={contentSurface.style}>
          {showEditor ? (
            <div
              ref={editorRef}
              data-testid="rich-text-editor-editor"
              data-snapshot-id={`${rootId}-editorPane`}
              className={resolveSurfacePresentation({
                surfaceId: `${rootId}-editorPane`,
                implementationBase: {
                  flex: showPreview ? "1 1 50%" : "1 1 100%",
                  overflow: "auto",
                  style: {
                    minWidth: showPreview ? "min(100%, 250px)" : 0,
                    borderRight: showPreview ? "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" : undefined,
                  },
                },
                componentSurface: config.slots?.editorPane,
              }).className}
              style={resolveSurfacePresentation({
                surfaceId: `${rootId}-editorPane`,
                implementationBase: {
                  flex: showPreview ? "1 1 50%" : "1 1 100%",
                  overflow: "auto",
                  style: {
                    minWidth: showPreview ? "min(100%, 250px)" : 0,
                    borderRight: showPreview ? "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" : undefined,
                  },
                },
                componentSurface: config.slots?.editorPane,
              }).style}
            />
          ) : null}

          {showPreview ? (
            <div
              data-testid="rich-text-editor-preview"
              data-snapshot-id={`${rootId}-previewPane`}
              className={resolveSurfacePresentation({
                surfaceId: `${rootId}-previewPane`,
                implementationBase: {
                  flex: showEditor ? "1 1 50%" : "1 1 100%",
                  overflow: "auto",
                  padding: "md",
                  style: {
                    minWidth: showEditor ? "min(100%, 250px)" : 0,
                  },
                },
                componentSurface: config.slots?.previewPane,
              }).className}
              style={resolveSurfacePresentation({
                surfaceId: `${rootId}-previewPane`,
                implementationBase: {
                  flex: showEditor ? "1 1 50%" : "1 1 100%",
                  overflow: "auto",
                  padding: "md",
                  style: {
                    minWidth: showEditor ? "min(100%, 250px)" : 0,
                  },
                },
                componentSurface: config.slots?.previewPane,
              }).style}
            >
              {markdownContent ? (
                <Markdown config={{ type: "markdown", content: markdownContent }} />
              ) : (
                <div data-snapshot-id={`${rootId}-emptyPreview`} className={emptyPreviewSurface.className} style={emptyPreviewSurface.style}>
                  Nothing to preview
                </div>
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
    </>
  );
}
