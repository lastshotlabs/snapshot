'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { SlotOverrides } from "../../_base/types";
import type { CSSProperties } from "react";
import { Extension } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { buildMentionExtension } from "./mention-extension";
import type {
  MentionListHandle,
  MentionListProps,
  MentionSuggestion,
} from "./mention-list";
import type { ComponentType } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { InputControl } from "../../forms/input";

interface ToolbarItem {
  name: string;
  icon: string;
  label: string;
  action: string;
}

const ALL_TOOLBAR_ITEMS: ToolbarItem[] = [
  { name: "bold", icon: "bold", label: "Bold", action: "toggleBold" },
  { name: "italic", icon: "italic", label: "Italic", action: "toggleItalic" },
  { name: "underline", icon: "underline", label: "Underline", action: "toggleUnderline" },
  { name: "strike", icon: "strikethrough", label: "Strikethrough", action: "toggleStrike" },
  { name: "code", icon: "code", label: "Inline code", action: "toggleCode" },
  { name: "code-block", icon: "terminal", label: "Code block", action: "toggleCodeBlock" },
  { name: "bullet-list", icon: "list", label: "Bullet list", action: "toggleBulletList" },
  { name: "ordered-list", icon: "list-ordered", label: "Numbered list", action: "toggleOrderedList" },
  { name: "link", icon: "link", label: "Insert link", action: "setLink" },
];

/**
 * Read the markdown projection from a Tiptap editor instance, defensively
 * tolerating the absence of the `tiptap-markdown` extension storage.
 *
 * Returns `undefined` if `tiptap-markdown` is not registered on the
 * editor (e.g. the consumer set `emitMarkdown` to `true` but a future
 * dependency rev removed the storage shape). The `onSend` / `onChange`
 * payloads omit the `markdown` field in that case rather than emit an
 * empty string that consumers might mistake for an empty document.
 */
function readMarkdown(editor: unknown): string | undefined {
  const storage = (editor as { storage?: Record<string, unknown> } | null)?.storage?.[
    'markdown'
  ] as { getMarkdown?: () => string } | undefined;
  return typeof storage?.getMarkdown === 'function' ? storage.getMarkdown() : undefined;
}

function createSendOnEnterExtension(onSend: () => void) {
  return Extension.create({
    name: "sendOnEnter",
    addKeyboardShortcuts() {
      return {
        Enter: ({ editor }) => {
          if (editor.isActive("bulletList") || editor.isActive("orderedList") || editor.isActive("codeBlock")) {
            return false;
          }
          onSend();
          return true;
        },
      };
    },
  });
}

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface RichInputBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Initial editor content (uncontrolled). HTML or plain text. */
  defaultValue?: string;
  /** Controlled editor content. When set, `value` updates flow into the editor. */
  value?: string;
  /** Whether the editor is read-only. */
  readonly?: boolean;
  /** Enabled formatting features. */
  features?: string[];
  /** Whether pressing Enter sends (vs. newline). Default: true. */
  sendOnEnter?: boolean;
  /** Maximum character count. */
  maxLength?: number;
  /** Minimum height of the editor area (CSS value). */
  minHeight?: string;
  /** Maximum height of the editor area (CSS value). */
  maxHeight?: string;
  /** Whether to show a send button. */
  showSendButton?: boolean;
  /**
   * Emit a `markdown` field on `onSend` / `onChange` payloads.
   *
   * When true, registers the `tiptap-markdown` Tiptap extension and
   * exposes `editor.storage.markdown.getMarkdown()` on each event.
   * Off by default to keep the editor's emitted payload minimal for
   * consumers that store HTML or plain text. Storage cost is the
   * `tiptap-markdown` package and its `markdown-it` transitive dep.
   */
  emitMarkdown?: boolean;

  /**
   * @-mention typeahead source. When provided, the editor registers a
   * mention extension; typing `@` opens a suggestion popover, and
   * selecting an item inserts a mention chip that round-trips through
   * the slingshot content-token format (`<@<id>>`) in both the plain-text
   * and markdown projections. Server-side `parseBody` then derives the
   * mention sidecar fields directly from the body.
   *
   * Returning a `Promise` lets you debounce / cancel; the editor only
   * shows the latest resolved batch.
   */
  onMentionSearch?: (
    query: string,
  ) => Promise<readonly MentionSuggestion[]> | readonly MentionSuggestion[];

  /**
   * Optional consumer-rendered popover. If omitted, snapshot uses a
   * minimal default list styled with the framework's CSS variables.
   * Accepts the same props the default does and exposes
   * `onKeyDown({ event })` via `forwardRef` so the suggestion plugin
   * can forward arrow / Enter keys.
   */
  renderMentionList?: ComponentType<MentionListProps & React.RefAttributes<MentionListHandle>>;

  /**
   * Override the mention serialization format. Defaults to slingshot's
   * `<@<id>>` content-token format, which `slingshot-core/parseBody`
   * understands. Override only when integrating into a non-slingshot
   * server.
   */
  serializeMention?: (attrs: { id: string; label: string }) => string;

  /** Called when the send button is pressed or Enter is pressed (if sendOnEnter). */
  onSend?: (data: { html: string; text: string; markdown?: string }) => void;
  /** Called on every content change. */
  onChange?: (data: { html: string; text: string; markdown?: string }) => void;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root element. */
  className?: string;
  /** Inline style applied to the root element. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: SlotOverrides;
}

/**
 * Imperative handle exposed via `ref`. Use this when an external surface
 * (emoji picker, GIF picker, slash-command menu) needs to insert content
 * at the user's current cursor position without going through the
 * controlled-value path (which clobbers the cursor).
 *
 * @example
 * ```tsx
 * const editorRef = useRef<RichInputBaseHandle>(null);
 * <RichInputBase ref={editorRef} ... />
 * <button onClick={() => editorRef.current?.insertText('👍')}>👍</button>
 * ```
 */
export interface RichInputBaseHandle {
  /** Insert plain text at the cursor (or replace the current selection). */
  insertText(text: string): void;
  /** Insert raw HTML at the cursor — Tiptap parses it through the schema. */
  insertContent(html: string): void;
  /** Move keyboard focus into the editor without changing content. */
  focus(): void;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone RichInput — a rich text editor with formatting toolbar,
 * powered by tiptap. Works with plain React props.
 *
 * @example
 * ```tsx
 * <RichInputBase
 *   placeholder="Type a message..."
 *   features={["bold", "italic", "link"]}
 *   onSend={({ html, text }) => sendMessage(html)}
 * />
 * ```
 */
export const RichInputBase = forwardRef<RichInputBaseHandle, RichInputBaseProps>(function RichInputBase({
  id,
  placeholder,
  defaultValue,
  value,
  readonly = false,
  features = ["bold", "italic", "underline", "strike", "code", "code-block", "link", "bullet-list", "ordered-list"],
  sendOnEnter = true,
  maxLength,
  minHeight,
  maxHeight,
  showSendButton = false,
  emitMarkdown = false,
  onMentionSearch,
  renderMentionList,
  serializeMention,
  onSend,
  onChange,
  className,
  style,
  slots,
}: RichInputBaseProps, ref) {
  const [charCount, setCharCount] = useState(0);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);
  const linkFocusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendRef = useRef<() => void>(() => {});
  const rootId = id ?? "rich-input";

  useEffect(() => {
    return () => {
      if (linkFocusTimerRef.current) clearTimeout(linkFocusTimerRef.current);
    };
  }, []);

  const featuresSet = useMemo(() => new Set<string>(features), [features]);

  // The mention extension is configuration-locked at editor-init time.
  // Wrapping in `useMemo` keyed on the relevant props prevents Tiptap
  // from recreating the editor on every render — but ALSO means runtime
  // changes to `onMentionSearch` are not picked up. That's the right
  // tradeoff for a callback that's typically stable across the lifetime
  // of a Composer mount.
  const mentionExtension = useMemo(
    () =>
      onMentionSearch
        ? buildMentionExtension({
            onSearch: onMentionSearch,
            renderList: renderMentionList,
            serializeMention,
          })
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Boolean(onMentionSearch)],
  );

  const extensions = [
    StarterKit.configure({
      bold: featuresSet.has("bold") ? {} : false,
      italic: featuresSet.has("italic") ? {} : false,
      strike: featuresSet.has("strike") ? {} : false,
      code: featuresSet.has("code") ? {} : false,
      codeBlock: featuresSet.has("code-block") ? {} : false,
      bulletList: featuresSet.has("bullet-list") ? {} : false,
      orderedList: featuresSet.has("ordered-list") ? {} : false,
      heading: false,
      hardBreak: {},
    }),
    ...(featuresSet.has("underline") ? [Underline] : []),
    ...(featuresSet.has("link")
      ? [Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } })]
      : []),
    // Markdown extension: registered when `emitMarkdown` is on. Provides
    // `editor.storage.markdown.getMarkdown()` and a richer markdown
    // round-trip on `setContent`. Costs ~70 KB raw (markdown-it +
    // prosemirror-markdown) so we leave it off by default.
    ...(emitMarkdown ? [Markdown.configure({ html: false, transformPastedText: true })] : []),
    ...(mentionExtension ? [mentionExtension] : []),
    ...(sendOnEnter && onSend ? [createSendOnEnterExtension(() => sendRef.current())] : []),
  ] as unknown as NonNullable<Parameters<typeof useEditor>[0]["extensions"]>;

  const editor = useEditor({
    extensions,
    editable: !readonly,
    content: value ?? defaultValue ?? undefined,
    editorProps: { attributes: { style: "outline:none;min-height:100%;" } },
    onUpdate: ({ editor: instance }) => {
      const html = instance.getHTML();
      const text = instance.getText();
      setCharCount(text.length);
      const markdown = emitMarkdown ? readMarkdown(instance) : undefined;
      onChange?.({ html, text, ...(markdown !== undefined ? { markdown } : {}) });
    },
  });

  useEffect(() => {
    editor?.setEditable(!readonly);
  }, [editor, readonly]);

  // Expose a small imperative API for external surfaces (emoji picker,
  // GIF picker, slash-command menu) to insert content at the cursor
  // without going through the controlled-value path. Callers hold a ref
  // typed as `RichInputBaseHandle`.
  useImperativeHandle(
    ref,
    () => ({
      insertText: (text: string) => {
        editor?.chain().focus().insertContent(text).run();
      },
      insertContent: (html: string) => {
        editor?.chain().focus().insertContent(html).run();
      },
      focus: () => {
        editor?.commands.focus();
      },
    }),
    [editor],
  );

  // Controlled-mode sync: when external `value` changes, replace the editor
  // doc unless the user is mid-edit (i.e. the current HTML already matches).
  useEffect(() => {
    if (value === undefined || !editor) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value, { emitUpdate: false });
    setCharCount(editor.getText().length);
  }, [editor, value]);

  const handleSend = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    const text = editor.getText();
    if (!text.trim()) return;
    const markdown = emitMarkdown ? readMarkdown(editor) : undefined;
    onSend?.({ html, text, ...(markdown !== undefined ? { markdown } : {}) });
    editor.commands.clearContent(true);
    setCharCount(0);
  }, [editor, onSend, emitMarkdown]);

  sendRef.current = handleSend;

  const toolbarItems = ALL_TOOLBAR_ITEMS.filter((item) => featuresSet.has(item.name));
  const isOverLimit = maxLength !== undefined && charCount > maxLength;
  const isEmpty = charCount === 0;

  const handleToolbarAction = (item: ToolbarItem) => {
    if (!editor) return;
    if (item.action === "setLink") {
      if (editor.isActive("link")) {
        editor.chain().focus().unsetLink().run();
      } else {
        setLinkUrl("");
        setShowLinkInput(true);
        linkFocusTimerRef.current = setTimeout(() => linkInputRef.current?.focus(), 10);
      }
      return;
    }
    switch (item.action) {
      case "toggleBold": editor.chain().focus().toggleBold().run(); break;
      case "toggleItalic": editor.chain().focus().toggleItalic().run(); break;
      case "toggleUnderline": editor.chain().focus().toggleUnderline().run(); break;
      case "toggleStrike": editor.chain().focus().toggleStrike().run(); break;
      case "toggleCode": editor.chain().focus().toggleCode().run(); break;
      case "toggleCodeBlock": editor.chain().focus().toggleCodeBlock().run(); break;
      case "toggleBulletList": editor.chain().focus().toggleBulletList().run(); break;
      case "toggleOrderedList": editor.chain().focus().toggleOrderedList().run(); break;
    }
  };

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "md",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      bg: "var(--sn-color-card, #ffffff)",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const editorAreaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-editorArea`,
    implementationBase: { position: "relative", flex: "1", overflow: "auto", style: { minHeight: minHeight ?? "2.5rem", maxHeight: maxHeight ?? "12rem" } },
    componentSurface: slots?.editorArea,
  });
  const editorContentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-editorContent`,
    implementationBase: { paddingY: "sm", paddingX: "md", fontSize: "sm", color: "var(--sn-color-foreground, #111827)", style: { lineHeight: "var(--sn-leading-relaxed, 1.625)" } },
    componentSurface: slots?.editorContent,
  });
  const placeholderSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-placeholder`,
    implementationBase: { fontSize: "sm", color: "var(--sn-color-muted-foreground, #9ca3af)", style: { position: "absolute", top: "var(--sn-spacing-sm, 0.5rem)", left: "var(--sn-spacing-md, 1rem)", pointerEvents: "none" } },
    componentSurface: slots?.placeholder,
  });
  const linkBarSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-linkBar`,
    implementationBase: { display: "flex", alignItems: "center", gap: "xs", paddingY: "xs", paddingX: "sm", bg: "var(--sn-color-secondary, #f9fafb)", style: { borderTop: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" } },
    componentSurface: slots?.linkBar,
  });
  const linkIconSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-linkIcon`, implementationBase: { color: "var(--sn-color-muted-foreground, #6b7280)" }, componentSurface: slots?.linkIcon });
  const linkInputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-linkInput`,
    implementationBase: { flex: "1", fontSize: "sm", color: "var(--sn-color-foreground, #111827)", focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" }, style: { border: "none", outline: "none", backgroundColor: "transparent", padding: "var(--sn-spacing-xs, 0.25rem)", minWidth: 0 } },
    componentSurface: slots?.linkInput,
  });
  const linkCloseSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-linkCloseButton`,
    implementationBase: { display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--sn-color-muted-foreground, #6b7280)", hover: { bg: "var(--sn-color-accent, #f3f4f6)" }, focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" }, style: { border: "none", background: "none", padding: "var(--sn-spacing-xs, 0.25rem)" } },
    componentSurface: slots?.linkCloseButton,
  });
  const toolbarSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-toolbar`,
    implementationBase: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "sm", paddingY: "xs", paddingX: "sm", style: { borderTop: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" } },
    componentSurface: slots?.toolbar,
  });
  const formattingGroupSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-formattingGroup`, implementationBase: { display: "flex", alignItems: "center", gap: "2xs", flexWrap: "wrap" }, componentSurface: slots?.formattingGroup });
  const statusGroupSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-statusGroup`, implementationBase: { display: "flex", alignItems: "center", gap: "sm" }, componentSurface: slots?.statusGroup });
  const counterSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-counter`,
    implementationBase: { fontSize: "xs", color: isOverLimit ? "var(--sn-color-destructive, #ef4444)" : "var(--sn-color-muted-foreground, #9ca3af)" },
    componentSurface: slots?.counter,
    activeStates: isOverLimit ? ["invalid"] : [],
  });
  const sendButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-sendButton`,
    implementationBase: {
      display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "full",
      cursor: readonly || !charCount || isOverLimit ? "not-allowed" : "pointer",
      color: charCount > 0 && !isOverLimit ? "var(--sn-color-primary-foreground, #ffffff)" : "var(--sn-color-muted-foreground, #9ca3af)",
      bg: charCount > 0 && !isOverLimit ? "var(--sn-color-primary, #2563eb)" : "transparent",
      hover: readonly || !charCount || isOverLimit ? undefined : { opacity: 0.9 },
      focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
      style: { width: "2rem", height: "2rem", padding: 0, border: "none" },
    },
    componentSurface: slots?.sendButton,
  });

  return (
    <>
      <div data-snapshot-component="rich-input" data-testid="rich-input" data-snapshot-id={rootId} className={rootSurface.className} style={rootSurface.style}>
        <div data-snapshot-id={`${rootId}-editorArea`} className={editorAreaSurface.className} style={editorAreaSurface.style}>
          {placeholder && isEmpty ? (
            <div data-snapshot-id={`${rootId}-placeholder`} className={placeholderSurface.className} style={placeholderSurface.style}>{placeholder}</div>
          ) : null}
          <EditorContent editor={editor} data-snapshot-id={`${rootId}-editorContent`} style={editorContentSurface.style} className={editorContentSurface.className} data-testid="rich-input-editor" />
        </div>

        {showLinkInput ? (
          <div data-snapshot-id={`${rootId}-linkBar`} className={linkBarSurface.className} style={linkBarSurface.style}>
            <span data-snapshot-id={`${rootId}-linkIcon`} className={linkIconSurface.className} style={linkIconSurface.style}><Icon name="link" size={14} /></span>
            <InputControl inputRef={linkInputRef} type="url" value={linkUrl} onChangeText={setLinkUrl} onKeyDown={(e) => {
              if (e.key === "Enter" && linkUrl.trim()) { e.preventDefault(); const url = linkUrl.trim().startsWith("http") ? linkUrl.trim() : `https://${linkUrl.trim()}`; editor?.chain().focus().setLink({ href: url }).run(); setShowLinkInput(false); setLinkUrl(""); }
              if (e.key === "Escape") { setShowLinkInput(false); setLinkUrl(""); editor?.chain().focus().run(); }
            }} placeholder="Paste URL and press Enter..." surfaceId={`${rootId}-linkInput`} surfaceConfig={linkInputSurface.resolvedConfigForWrapper} testId="rich-input-link-input" />
            <ButtonControl type="button" ariaLabel="Close link input" onClick={() => { if (linkUrl.trim()) { const url = linkUrl.trim().startsWith("http") ? linkUrl.trim() : `https://${linkUrl.trim()}`; editor?.chain().focus().setLink({ href: url }).run(); } setShowLinkInput(false); setLinkUrl(""); }} surfaceId={`${rootId}-linkCloseButton`} surfaceConfig={linkCloseSurface.resolvedConfigForWrapper} variant="ghost" size="icon">
              <Icon name="x" size={14} />
            </ButtonControl>
          </div>
        ) : null}

        {(toolbarItems.length > 0 || showSendButton) ? (
          <div role="toolbar" data-testid="rich-input-toolbar" data-snapshot-id={`${rootId}-toolbar`} className={toolbarSurface.className} style={toolbarSurface.style}>
            <div data-snapshot-id={`${rootId}-formattingGroup`} className={formattingGroupSurface.className} style={formattingGroupSurface.style}>
              {toolbarItems.map((item, index) => {
                const active = editor?.isActive(item.name === "bullet-list" ? "bulletList" : item.name === "ordered-list" ? "orderedList" : item.name === "code-block" ? "codeBlock" : item.name) ?? false;
                const buttonSurface = resolveSurfacePresentation({
                  surfaceId: `${rootId}-toolbarButton-${index}`,
                  implementationBase: {
                    display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "sm",
                    cursor: readonly ? "not-allowed" : "pointer",
                    color: active ? "var(--sn-color-primary, #2563eb)" : "var(--sn-color-muted-foreground, #9ca3af)",
                    bg: active ? "var(--sn-color-accent, #eff6ff)" : "transparent",
                    hover: readonly ? undefined : { bg: active ? "color-mix(in oklch, var(--sn-color-primary, #2563eb) 10%, transparent)" : "var(--sn-color-accent, #f3f4f6)", color: "var(--sn-color-foreground, #111827)" },
                    focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
                    style: { width: "2rem", height: "2rem", padding: 0, border: "none", opacity: readonly ? 0.5 : 1 },
                  },
                  componentSurface: slots?.toolbarButton,
                  activeStates: active ? ["active"] : [],
                });
                return (
                  <div key={item.name}>
                    <ButtonControl type="button" onClick={() => handleToolbarAction(item)} title={item.label} ariaLabel={item.label} disabled={readonly} surfaceId={`${rootId}-toolbarButton-${index}`} surfaceConfig={buttonSurface.resolvedConfigForWrapper} variant="ghost" size="icon" activeStates={active ? ["active"] : []}>
                      <Icon name={item.icon} size={16} />
                    </ButtonControl>
                  </div>
                );
              })}
            </div>
            <div data-snapshot-id={`${rootId}-statusGroup`} className={statusGroupSurface.className} style={statusGroupSurface.style}>
              {maxLength !== undefined ? (
                <span data-snapshot-id={`${rootId}-counter`} className={counterSurface.className} style={counterSurface.style}>{charCount}/{maxLength}</span>
              ) : null}
              {showSendButton ? (
                <ButtonControl type="button" onClick={handleSend} disabled={readonly || !charCount || isOverLimit} ariaLabel="Send message" surfaceId={`${rootId}-sendButton`} surfaceConfig={sendButtonSurface.resolvedConfigForWrapper} variant="ghost" size="icon" testId="rich-input-send">
                  <Icon name="send" size={16} />
                </ButtonControl>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={editorAreaSurface.scopedCss} />
      <SurfaceStyles css={editorContentSurface.scopedCss} />
      <SurfaceStyles css={placeholderSurface.scopedCss} />
      <SurfaceStyles css={linkBarSurface.scopedCss} />
      <SurfaceStyles css={linkIconSurface.scopedCss} />
      <SurfaceStyles css={toolbarSurface.scopedCss} />
      <SurfaceStyles css={formattingGroupSurface.scopedCss} />
      <SurfaceStyles css={statusGroupSurface.scopedCss} />
      <SurfaceStyles css={counterSurface.scopedCss} />
    </>
  );
});
