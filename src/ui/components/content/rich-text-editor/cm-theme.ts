import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

/**
 * CodeMirror 6 theme extension that maps all editor styling to `--sn-*`
 * design token CSS variables, ensuring the editor responds to flavor
 * changes and dark mode.
 */
export const snEditorTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--sn-color-card, #ffffff)",
    borderRadius: "var(--sn-radius-md, 0.5rem)",
    fontSize: "var(--sn-font-size-sm, 0.875rem)",
  },
  ".cm-content": {
    color: "var(--sn-color-foreground, #111827)",
    fontFamily: "var(--sn-font-mono, monospace)",
    fontSize: "var(--sn-font-size-sm, 0.875rem)",
    padding: "var(--sn-spacing-md, 1rem)",
    caretColor: "var(--sn-color-foreground, #111827)",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--sn-color-foreground, #111827)",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
    background:
      "color-mix(in oklch, var(--sn-color-primary, #2563eb) 25%, transparent) !important",
  },
  ".cm-gutters": {
    backgroundColor: "var(--sn-color-secondary, #f3f4f6)",
    color: "var(--sn-color-muted-foreground, #6b7280)",
    borderRight: "1px solid var(--sn-color-border, #e5e7eb)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--sn-color-muted, #f3f4f6)",
  },
  ".cm-activeLine": {
    background:
      "color-mix(in oklch, var(--sn-color-muted, #f3f4f6) 30%, transparent)",
  },
  ".cm-scroller": {
    fontFamily: "var(--sn-font-mono, monospace)",
  },
  ".cm-line": {
    padding: "0 var(--sn-spacing-xs, 0.25rem)",
  },
  ".cm-placeholder": {
    color: "var(--sn-color-muted-foreground, #9ca3af)",
    fontStyle: "italic",
  },
});

/**
 * Syntax highlighting for Markdown content in the editor.
 * Uses dedicated syntax colors (--sn-syn-*) for code elements,
 * and semantic colors for markdown structure.
 */
const snHighlightStyle = HighlightStyle.define([
  {
    tag: tags.heading,
    color: "var(--sn-color-primary, #2563eb)",
    fontWeight: "bold",
  },
  {
    tag: tags.emphasis,
    fontStyle: "italic",
  },
  {
    tag: tags.strong,
    fontWeight: "bold",
  },
  {
    tag: tags.link,
    color: "var(--sn-color-info, #3b82f6)",
    textDecoration: "underline",
  },
  {
    tag: tags.url,
    color: "var(--sn-color-info, #3b82f6)",
  },
  {
    tag: [tags.monospace, tags.processingInstruction],
    color: "var(--sn-syn-string, #0a3069)",
    fontFamily: "var(--sn-font-mono, monospace)",
  },
  {
    tag: tags.quote,
    color: "var(--sn-color-muted-foreground, #6b7280)",
    fontStyle: "italic",
  },
  {
    tag: tags.strikethrough,
    textDecoration: "line-through",
  },
  {
    tag: [tags.meta, tags.comment],
    color: "var(--sn-syn-comment, #6e7781)",
  },
  {
    tag: tags.keyword,
    color: "var(--sn-syn-keyword, #8250df)",
  },
  {
    tag: tags.string,
    color: "var(--sn-syn-string, #0a3069)",
  },
  {
    tag: tags.number,
    color: "var(--sn-syn-number, #0550ae)",
  },
  {
    tag: [
      tags.function(tags.variableName),
      tags.function(tags.definition(tags.variableName)),
    ],
    color: "var(--sn-syn-function, #8250df)",
  },
  {
    tag: tags.typeName,
    color: "var(--sn-syn-type, #953800)",
  },
]);

/** Combined syntax highlighting extension. */
export const snSyntaxHighlight = syntaxHighlighting(snHighlightStyle);
