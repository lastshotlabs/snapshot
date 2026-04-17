'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Extension } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { InputControl } from "../../forms/input";
import type { RichInputConfig } from "./types";

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

export function RichInput({ config }: { config: RichInputConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const readonly = useSubscribe(config.readonly ?? false) as boolean;
  const resolvedPlaceholder = useSubscribe(config.placeholder) as string | undefined;
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const [charCount, setCharCount] = useState(0);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);
  const sendRef = useRef<() => void>(() => {});
  const rootId = config.id ?? "rich-input";

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
  const featuresSet = useMemo(() => new Set<string>(features), [features]);

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
      ? [
          Link.configure({
            openOnClick: false,
            HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
          }),
        ]
      : []),
    ...(sendOnEnter ? [createSendOnEnterExtension(() => sendRef.current())] : []),
  ] as unknown as NonNullable<Parameters<typeof useEditor>[0]["extensions"]>;

  const editor = useEditor({
    extensions,
    editable: !readonly,
    editorProps: {
      attributes: {
        style: "outline:none;min-height:100%;",
      },
    },
    onUpdate: ({ editor: instance }) => {
      const html = instance.getHTML();
      const text = instance.getText();
      setCharCount(text.length);
      publish?.({ html, text, mentions: [] });
    },
  });

  useEffect(() => {
    editor?.setEditable(!readonly);
  }, [editor, readonly]);

  const handleSend = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    const text = editor.getText();
    if (!text.trim()) return;
    if (config.sendAction) void execute(config.sendAction, { html, text, mentions: [] });
    editor.commands.clearContent(true);
    setCharCount(0);
    publish?.({ html: "", text: "", mentions: [] });
  }, [config.sendAction, editor, execute, publish]);

  sendRef.current = handleSend;

  if (visible === false) return null;

  const toolbarItems = ALL_TOOLBAR_ITEMS.filter((item) => featuresSet.has(item.name));
  const isOverLimit = config.maxLength !== undefined && charCount > config.maxLength;
  const isEmpty = charCount === 0;

  const handleToolbarAction = (item: ToolbarItem) => {
    if (!editor) return;
    if (item.action === "setLink") {
      if (editor.isActive("link")) {
        editor.chain().focus().unsetLink().run();
      } else {
        setLinkUrl("");
        setShowLinkInput(true);
        setTimeout(() => linkInputRef.current?.focus(), 10);
      }
      return;
    }
    switch (item.action) {
      case "toggleBold":
        editor.chain().focus().toggleBold().run();
        break;
      case "toggleItalic":
        editor.chain().focus().toggleItalic().run();
        break;
      case "toggleUnderline":
        editor.chain().focus().toggleUnderline().run();
        break;
      case "toggleStrike":
        editor.chain().focus().toggleStrike().run();
        break;
      case "toggleCode":
        editor.chain().focus().toggleCode().run();
        break;
      case "toggleCodeBlock":
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case "toggleBulletList":
        editor.chain().focus().toggleBulletList().run();
        break;
      case "toggleOrderedList":
        editor.chain().focus().toggleOrderedList().run();
        break;
    }
  };

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
    componentSurface: extractSurfaceConfig(config, {
      omit: ["minHeight", "maxHeight"],
    }),
    itemSurface: config.slots?.root,
  });
  const editorAreaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-editorArea`,
    implementationBase: {
      position: "relative",
      flex: "1",
      overflow: "auto",
      style: {
        minHeight: config.minHeight ?? "2.5rem",
        maxHeight: config.maxHeight ?? "12rem",
      },
    },
    componentSurface: config.slots?.editorArea,
  });
  const editorContentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-editorContent`,
    implementationBase: {
      paddingY: "sm",
      paddingX: "md",
      fontSize: "sm",
      color: "var(--sn-color-foreground, #111827)",
      style: {
        lineHeight: "var(--sn-leading-relaxed, 1.625)",
      },
    },
    componentSurface: config.slots?.editorContent,
  });
  const placeholderSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-placeholder`,
    implementationBase: {
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #9ca3af)",
      style: {
        position: "absolute",
        top: "var(--sn-spacing-sm, 0.5rem)",
        left: "var(--sn-spacing-md, 1rem)",
        pointerEvents: "none",
      },
    },
    componentSurface: config.slots?.placeholder,
  });
  const linkBarSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-linkBar`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "xs",
      paddingY: "xs",
      paddingX: "sm",
      bg: "var(--sn-color-secondary, #f9fafb)",
      style: {
        borderTop: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: config.slots?.linkBar,
  });
  const linkIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-linkIcon`,
    implementationBase: { color: "var(--sn-color-muted-foreground, #6b7280)" },
    componentSurface: config.slots?.linkIcon,
  });
  const linkInputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-linkInput`,
    implementationBase: {
      flex: "1",
      fontSize: "sm",
      color: "var(--sn-color-foreground, #111827)",
      focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
      style: {
        border: "none",
        outline: "none",
        backgroundColor: "transparent",
        padding: "var(--sn-spacing-xs, 0.25rem)",
        minWidth: 0,
      },
    },
    componentSurface: config.slots?.linkInput,
  });
  const linkCloseSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-linkCloseButton`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      hover: { bg: "var(--sn-color-accent, #f3f4f6)" },
      focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
      style: {
        border: "none",
        background: "none",
        padding: "var(--sn-spacing-xs, 0.25rem)",
      },
    },
    componentSurface: config.slots?.linkCloseButton,
  });
  const toolbarSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-toolbar`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "between",
      gap: "sm",
      paddingY: "xs",
      paddingX: "sm",
      style: {
        borderTop: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: config.slots?.toolbar,
  });
  const formattingGroupSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-formattingGroup`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "2xs",
      flexWrap: "wrap",
    },
    componentSurface: config.slots?.formattingGroup,
  });
  const statusGroupSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-statusGroup`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "sm",
    },
    componentSurface: config.slots?.statusGroup,
  });
  const counterSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-counter`,
    implementationBase: {
      fontSize: "xs",
      color: isOverLimit
        ? "var(--sn-color-destructive, #ef4444)"
        : "var(--sn-color-muted-foreground, #9ca3af)",
    },
    componentSurface: config.slots?.counter,
    activeStates: isOverLimit ? ["invalid"] : [],
  });
  const sendButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-sendButton`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "full",
      cursor: readonly || !charCount || isOverLimit ? "not-allowed" : "pointer",
      color:
        charCount > 0 && !isOverLimit
          ? "var(--sn-color-primary-foreground, #ffffff)"
          : "var(--sn-color-muted-foreground, #9ca3af)",
      bg:
        charCount > 0 && !isOverLimit
          ? "var(--sn-color-primary, #2563eb)"
          : "transparent",
      hover:
        readonly || !charCount || isOverLimit
          ? undefined
          : { opacity: 0.9 },
      focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
      style: {
        width: "2rem",
        height: "2rem",
        padding: 0,
        border: "none",
      },
    },
    componentSurface: config.slots?.sendButton,
  });

  return (
    <>
      <div data-snapshot-component="rich-input" data-testid="rich-input" data-snapshot-id={rootId} className={rootSurface.className} style={rootSurface.style}>
        <div data-snapshot-id={`${rootId}-editorArea`} className={editorAreaSurface.className} style={editorAreaSurface.style}>
          {resolvedPlaceholder && isEmpty ? (
            <div data-snapshot-id={`${rootId}-placeholder`} className={placeholderSurface.className} style={placeholderSurface.style}>
              {resolvedPlaceholder}
            </div>
          ) : null}
          <EditorContent
            editor={editor}
            data-snapshot-id={`${rootId}-editorContent`}
            style={editorContentSurface.style}
            className={editorContentSurface.className}
            data-testid="rich-input-editor"
          />
        </div>

        {showLinkInput ? (
          <div data-snapshot-id={`${rootId}-linkBar`} className={linkBarSurface.className} style={linkBarSurface.style}>
            <span data-snapshot-id={`${rootId}-linkIcon`} className={linkIconSurface.className} style={linkIconSurface.style}>
              <Icon name="link" size={14} />
            </span>
            <InputControl
              inputRef={linkInputRef}
              type="url"
              value={linkUrl}
              onChangeText={setLinkUrl}
              onKeyDown={(e) => {
                if (e.key === "Enter" && linkUrl.trim()) {
                  e.preventDefault();
                  const url = linkUrl.trim().startsWith("http") ? linkUrl.trim() : `https://${linkUrl.trim()}`;
                  editor?.chain().focus().setLink({ href: url }).run();
                  setShowLinkInput(false);
                  setLinkUrl("");
                }
                if (e.key === "Escape") {
                  setShowLinkInput(false);
                  setLinkUrl("");
                  editor?.chain().focus().run();
                }
              }}
              placeholder="Paste URL and press Enter..."
              surfaceId={`${rootId}-linkInput`}
              surfaceConfig={linkInputSurface.resolvedConfigForWrapper}
              testId="rich-input-link-input"
            />
            <ButtonControl
              type="button"
              ariaLabel="Close link input"
              onClick={() => {
                if (linkUrl.trim()) {
                  const url = linkUrl.trim().startsWith("http") ? linkUrl.trim() : `https://${linkUrl.trim()}`;
                  editor?.chain().focus().setLink({ href: url }).run();
                }
                setShowLinkInput(false);
                setLinkUrl("");
              }}
              surfaceId={`${rootId}-linkCloseButton`}
              surfaceConfig={linkCloseSurface.resolvedConfigForWrapper}
              variant="ghost"
              size="icon"
            >
              <Icon name="x" size={14} />
            </ButtonControl>
          </div>
        ) : null}

        {(toolbarItems.length > 0 || config.sendAction) ? (
          <div data-testid="rich-input-toolbar" data-snapshot-id={`${rootId}-toolbar`} className={toolbarSurface.className} style={toolbarSurface.style}>
            <div data-snapshot-id={`${rootId}-formattingGroup`} className={formattingGroupSurface.className} style={formattingGroupSurface.style}>
              {toolbarItems.map((item, index) => {
                const active =
                  editor?.isActive(
                    item.name === "bullet-list"
                      ? "bulletList"
                      : item.name === "ordered-list"
                        ? "orderedList"
                        : item.name === "code-block"
                          ? "codeBlock"
                          : item.name,
                  ) ?? false;
                const buttonSurface = resolveSurfacePresentation({
                  surfaceId: `${rootId}-toolbarButton-${index}`,
                  implementationBase: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "sm",
                    cursor: readonly ? "not-allowed" : "pointer",
                    color: active
                      ? "var(--sn-color-primary, #2563eb)"
                      : "var(--sn-color-muted-foreground, #9ca3af)",
                    bg: active
                      ? "var(--sn-color-accent, #eff6ff)"
                      : "transparent",
                    hover: readonly
                      ? undefined
                      : {
                          bg: active
                            ? "color-mix(in oklch, var(--sn-color-primary, #2563eb) 10%, transparent)"
                            : "var(--sn-color-accent, #f3f4f6)",
                          color: "var(--sn-color-foreground, #111827)",
                        },
                    focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" },
                    style: {
                      width: "2rem",
                      height: "2rem",
                      padding: 0,
                      border: "none",
                      opacity: readonly ? 0.5 : 1,
                    },
                  },
                  componentSurface: config.slots?.toolbarButton,
                  activeStates: active ? ["active"] : [],
                });

                return (
                  <div key={item.name}>
                    <ButtonControl
                      type="button"
                      onClick={() => handleToolbarAction(item)}
                      title={item.label}
                      ariaLabel={item.label}
                      disabled={readonly}
                      surfaceId={`${rootId}-toolbarButton-${index}`}
                      surfaceConfig={buttonSurface.resolvedConfigForWrapper}
                      variant="ghost"
                      size="icon"
                      activeStates={active ? ["active"] : []}
                    >
                      <Icon name={item.icon} size={16} />
                    </ButtonControl>
                  </div>
                );
              })}
            </div>

            <div data-snapshot-id={`${rootId}-statusGroup`} className={statusGroupSurface.className} style={statusGroupSurface.style}>
              {config.maxLength !== undefined ? (
                <span data-snapshot-id={`${rootId}-counter`} className={counterSurface.className} style={counterSurface.style}>
                  {charCount}/{config.maxLength}
                </span>
              ) : null}
              {config.sendAction ? (
                <ButtonControl
                  type="button"
                  onClick={handleSend}
                  disabled={readonly || !charCount || isOverLimit}
                  ariaLabel="Send message"
                  surfaceId={`${rootId}-sendButton`}
                  surfaceConfig={sendButtonSurface.resolvedConfigForWrapper}
                  variant="ghost"
                  size="icon"
                  testId="rich-input-send"
                >
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
}
