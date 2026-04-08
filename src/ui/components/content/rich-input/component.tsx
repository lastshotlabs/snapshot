import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Extension } from "@tiptap/core";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import type { RichInputConfig } from "./types";

// ── Toolbar button definitions ────────────────────────────────────────────

interface ToolbarItem {
  name: string;
  icon: string;
  label: string;
  action: string;
}

const ALL_TOOLBAR_ITEMS: ToolbarItem[] = [
  { name: "bold", icon: "bold", label: "Bold", action: "toggleBold" },
  { name: "italic", icon: "italic", label: "Italic", action: "toggleItalic" },
  {
    name: "underline",
    icon: "underline",
    label: "Underline",
    action: "toggleUnderline",
  },
  {
    name: "strike",
    icon: "strikethrough",
    label: "Strikethrough",
    action: "toggleStrike",
  },
  { name: "code", icon: "code", label: "Inline code", action: "toggleCode" },
  {
    name: "code-block",
    icon: "terminal",
    label: "Code block",
    action: "toggleCodeBlock",
  },
  {
    name: "bullet-list",
    icon: "list",
    label: "Bullet list",
    action: "toggleBulletList",
  },
  {
    name: "ordered-list",
    icon: "list-ordered",
    label: "Numbered list",
    action: "toggleOrderedList",
  },
  {
    name: "link",
    icon: "link",
    label: "Insert link",
    action: "setLink",
  },
];

// ── Custom Enter-to-send extension ────────────────────────────────────────

function createSendOnEnterExtension(onSend: () => void) {
  return Extension.create({
    name: "sendOnEnter",
    addKeyboardShortcuts() {
      return {
        Enter: () => {
          onSend();
          return true;
        },
      };
    },
  });
}

// ── Component ─────────────────────────────────────────────────────────────

/**
 * RichInput component — TipTap-based WYSIWYG editor for chat messages,
 * comments, and posts. Users see formatted text as they type.
 *
 * Publishes `{ html, text, mentions }` to the page context when content changes.
 *
 * @param props - Component props containing the rich input configuration
 */
export function RichInput({ config }: { config: RichInputConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const readonly = useSubscribe(config.readonly ?? false) as boolean;
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const [charCount, setCharCount] = useState(0);

  const features = config.features ?? [
    "bold",
    "italic",
    "underline",
    "strike",
    "code",
    "code-block",
    "link",
    "bullet-list",
    "ordered-list",
  ];
  const sendOnEnter = config.sendOnEnter ?? true;
  const featuresSet = new Set<string>(features);

  // Stable ref for the send callback so the extension doesn't re-create
  const sendRef = useRef<() => void>(() => {});

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: featuresSet.has("bold") ? {} : false,
        italic: featuresSet.has("italic") ? {} : false,
        strike: featuresSet.has("strike") ? {} : false,
        code: featuresSet.has("code") ? {} : false,
        codeBlock: featuresSet.has("code-block") ? {} : false,
        bulletList: featuresSet.has("bullet-list") ? {} : false,
        orderedList: featuresSet.has("ordered-list") ? {} : false,
        // Disable heading in chat input — use it only in rich-text-editor
        heading: false,
        // HardBreak for Shift+Enter newlines
        hardBreak: {},
      }),
      ...(featuresSet.has("underline") ? [Underline] : []),
      ...(featuresSet.has("link")
        ? [
            Link.configure({
              openOnClick: false,
              HTMLAttributes: {
                rel: "noopener noreferrer",
                target: "_blank",
              },
            }),
          ]
        : []),
      ...(config.placeholder
        ? [Placeholder.configure({ placeholder: config.placeholder })]
        : []),
      ...(sendOnEnter
        ? [
            createSendOnEnterExtension(() => {
              sendRef.current();
            }),
          ]
        : []),
    ],
    editable: !readonly,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      const text = ed.getText();
      setCharCount(text.length);

      if (publish) {
        publish({ html, text, mentions: [] });
      }
    },
  });

  // Update editable when readonly changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readonly);
    }
  }, [editor, readonly]);

  // Send handler
  const handleSend = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    const text = editor.getText();

    // Don't send empty messages
    if (!text.trim()) return;

    if (config.sendAction) {
      void execute(config.sendAction, { html, text, mentions: [] });
    }

    // Clear editor after send
    editor.commands.clearContent(true);
    setCharCount(0);

    if (publish) {
      publish({ html: "", text: "", mentions: [] });
    }
  }, [editor, config.sendAction, execute, publish]);

  // Keep sendRef updated
  sendRef.current = handleSend;

  if (visible === false) return null;

  // Filter toolbar items based on enabled features
  const toolbarItems = ALL_TOOLBAR_ITEMS.filter((item) =>
    featuresSet.has(item.name),
  );

  const handleToolbarAction = (item: ToolbarItem) => {
    if (!editor) return;

    if (item.action === "setLink") {
      // If already a link, unset it
      if (editor.isActive("link")) {
        editor.chain().focus().unsetLink().run();
        return;
      }
      // Get selected text — if it looks like a URL, use it
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, " ");
      if (selectedText && /^https?:\/\//.test(selectedText.trim())) {
        editor.chain().focus().setLink({ href: selectedText.trim() }).run();
      } else if (selectedText) {
        // Use selected text, wrap with a placeholder URL
        editor.chain().focus().setLink({ href: `https://${selectedText.trim().replace(/\s+/g, "")}` }).run();
      }
      return;
    }

    // Direct command dispatch — explicit for reliability
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

  const isOverLimit =
    config.maxLength !== undefined && charCount > config.maxLength;

  return (
    <div
      data-snapshot-component="rich-input"
      data-testid="rich-input"
      className={config.className}
      style={{
        border: "1px solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        backgroundColor: "var(--sn-color-card, #ffffff)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      {/* Hover/focus styles */}
      <style>{`
        [data-snapshot-component="rich-input"]:focus-within {
          border-color: var(--sn-color-primary, #2563eb);
          box-shadow: 0 0 0 2px color-mix(in oklch, var(--sn-color-primary, #2563eb) 15%, transparent);
        }
        [data-snapshot-component="rich-input"] [data-ri-btn]:hover:not(:disabled) {
          background-color: var(--sn-color-accent, #f3f4f6) !important;
          color: var(--sn-color-foreground, #111827) !important;
        }
        [data-snapshot-component="rich-input"] [data-ri-btn][data-active]:hover:not(:disabled) {
          background-color: color-mix(in oklch, var(--sn-color-primary, #2563eb) 85%, black) !important;
          color: var(--sn-color-primary-foreground, #ffffff) !important;
        }
        [data-snapshot-component="rich-input"] .ProseMirror {
          outline: none;
          min-height: inherit;
        }
        [data-snapshot-component="rich-input"] .ProseMirror p.is-editor-empty:first-child::before {
          color: var(--sn-color-muted-foreground, #9ca3af);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>

      {/* Editor area */}
      <div
        style={{
          flex: 1,
          minHeight: config.minHeight ?? "2.5rem",
          maxHeight: config.maxHeight ?? "12rem",
          overflowY: "auto",
        }}
      >
        <EditorContent
          editor={editor}
          style={{
            padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-foreground, #111827)",
            lineHeight: "var(--sn-leading-relaxed, 1.625)",
          }}
        />
      </div>

      {/* Bottom toolbar */}
      {(toolbarItems.length > 0 || config.sendAction) && (
        <div
          data-testid="rich-input-toolbar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
            borderTop: "1px solid var(--sn-color-border, #e5e7eb)",
            gap: "var(--sn-spacing-sm, 0.5rem)",
          }}
        >
          {/* Formatting buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1px",
              flexWrap: "wrap",
            }}
          >
            {toolbarItems.map((item) => {
              const isActive =
                editor?.isActive(
                  item.name === "bullet-list"
                    ? "bulletList"
                    : item.name === "ordered-list"
                      ? "orderedList"
                      : item.name === "code-block"
                        ? "codeBlock"
                        : item.name,
                ) ?? false;

              return (
                <button
                  key={item.name}
                  data-ri-btn
                  data-active={isActive ? "" : undefined}
                  onClick={() => handleToolbarAction(item)}
                  title={item.label}
                  disabled={readonly}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2rem",
                    height: "2rem",
                    padding: 0,
                    border: "none",
                    borderRadius: "var(--sn-radius-sm, 0.25rem)",
                    backgroundColor: isActive
                      ? "color-mix(in oklch, var(--sn-color-primary, #2563eb) 15%, transparent)"
                      : "transparent",
                    color: isActive
                      ? "var(--sn-color-primary, #2563eb)"
                      : "var(--sn-color-muted-foreground, #9ca3af)",
                    cursor: readonly ? "not-allowed" : "pointer",
                    opacity: readonly ? 0.5 : 1,
                    flexShrink: 0,
                    transition: "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
                  }}
                >
                  <Icon name={item.icon} size={16} />
                </button>
              );
            })}
          </div>

          {/* Right side: char count + send */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sn-spacing-sm, 0.5rem)",
            }}
          >
            {config.maxLength !== undefined && (
              <span
                style={{
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  color: isOverLimit
                    ? "var(--sn-color-destructive, #ef4444)"
                    : "var(--sn-color-muted-foreground, #9ca3af)",
                  transition: "color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
                }}
              >
                {charCount}/{config.maxLength}
              </span>
            )}

            {config.sendAction && (
              <button
                data-testid="rich-input-send"
                onClick={handleSend}
                disabled={readonly || !charCount || isOverLimit}
                aria-label="Send message"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "2rem",
                  height: "2rem",
                  padding: 0,
                  border: "none",
                  borderRadius: "var(--sn-radius-full, 9999px)",
                  backgroundColor:
                    charCount > 0 && !isOverLimit
                      ? "var(--sn-color-primary, #2563eb)"
                      : "transparent",
                  color:
                    charCount > 0 && !isOverLimit
                      ? "var(--sn-color-primary-foreground, #ffffff)"
                      : "var(--sn-color-muted-foreground, #9ca3af)",
                  cursor:
                    readonly || !charCount || isOverLimit
                      ? "not-allowed"
                      : "pointer",
                  flexShrink: 0,
                  transition: "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
                }}
              >
                <Icon name="send" size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
