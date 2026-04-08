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
      const url = window.prompt("Enter URL:");
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
      return;
    }

    // Use chain().focus() then the command
    const chain = editor.chain().focus();
    const command = (chain as Record<string, unknown>)[item.action];
    if (typeof command === "function") {
      (command as () => { run: () => void }).call(chain).run();
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
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
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
            padding:
              "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
            borderTop: "1px solid var(--sn-color-border, #e5e7eb)",
            backgroundColor: "var(--sn-color-secondary, #f3f4f6)",
            gap: "var(--sn-spacing-xs, 0.25rem)",
          }}
        >
          {/* Formatting buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
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
                  onClick={() => handleToolbarAction(item)}
                  title={item.label}
                  disabled={readonly}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "1.75rem",
                    height: "1.75rem",
                    padding: 0,
                    border: "none",
                    borderRadius: "var(--sn-radius-sm, 0.25rem)",
                    backgroundColor: isActive
                      ? "var(--sn-color-primary, #2563eb)"
                      : "transparent",
                    color: isActive
                      ? "var(--sn-color-primary-foreground, #ffffff)"
                      : "var(--sn-color-muted-foreground, #6b7280)",
                    cursor: readonly ? "not-allowed" : "pointer",
                    opacity: readonly ? 0.5 : 1,
                    flexShrink: 0,
                  }}
                >
                  <Icon name={item.icon} size={14} />
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
                    : "var(--sn-color-muted-foreground, #6b7280)",
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "1.75rem",
                  height: "1.75rem",
                  padding: 0,
                  border: "none",
                  borderRadius: "var(--sn-radius-sm, 0.25rem)",
                  backgroundColor:
                    charCount > 0 && !isOverLimit
                      ? "var(--sn-color-primary, #2563eb)"
                      : "var(--sn-color-muted, #f3f4f6)",
                  color:
                    charCount > 0 && !isOverLimit
                      ? "var(--sn-color-primary-foreground, #ffffff)"
                      : "var(--sn-color-muted-foreground, #6b7280)",
                  cursor:
                    readonly || !charCount || isOverLimit
                      ? "not-allowed"
                      : "pointer",
                  flexShrink: 0,
                }}
              >
                <Icon name="send" size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
