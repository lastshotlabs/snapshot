"use client";

import { Node } from "@tiptap/core";
import type { Node as ProseMirrorNode, NodeType } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorState, Transaction } from "@tiptap/pm/state";

/**
 * A consumer token rendered as a CHIP inside `RichInputBase`.
 *
 * `resolveEmoji` already covers one shape — `:shortcode:` becoming a
 * line-sized image. This covers the other one every real composer needs:
 * a piece of content the author placed in the body that is too big, too
 * structured, or too remote to draw inline. A GIF, an upload, a quoted post,
 * a link embed. The editor shows a compact labelled chip; the document still
 * stores the consumer's own token text.
 */
export interface RichInputToken {
  /** Text shown inside the chip. Keep it short — it sits on one line of prose. */
  label: string;
  /**
   * Optional leading glyph. A short string (an emoji, a symbol) rather than a
   * URL: the chip is a compact inline object, and a remote image inside it
   * would reflow the line when it loads.
   */
  icon?: string;
  /**
   * Consumer-defined kind, surfaced as `data-kind` so different token types can
   * be styled apart without this extension knowing what any of them mean.
   */
  kind?: string;
}

export interface BuildTokenOptions {
  /**
   * What a token looks like in the text.
   *
   * MUST be global (`/g`) — it is used with `matchAll`. The whole match is
   * replaced, and the whole match is what the chip serializes back to, so the
   * consumer's storage format is preserved byte for byte.
   */
  pattern: RegExp;
  /** Resolve the raw matched text into a chip, or null to leave it as text. */
  resolveToken: (raw: string) => RichInputToken | null;
}

interface TokenReplacement {
  from: number;
  to: number;
  node: ProseMirrorNode;
}

function createTokenTransaction(
  state: EditorState,
  tokenType: NodeType,
  opts: BuildTokenOptions,
): Transaction | null {
  const replacements: TokenReplacement[] = [];

  state.doc.descendants((node, position, parent) => {
    if (!node.isText || !node.text) return;

    // A token inside inline or block code is source text someone is showing,
    // not a token they meant to place. Same rule the emoji extension follows.
    if (
      parent?.type.spec.code ||
      node.marks.some((mark) => mark.type.name === "code")
    ) {
      return;
    }

    // `lastIndex` is per-regex state, and a global regex reused across calls
    // would resume mid-string and silently skip the first token in a document.
    const pattern = new RegExp(opts.pattern.source, opts.pattern.flags.includes("g") ? opts.pattern.flags : `${opts.pattern.flags}g`);

    for (const match of node.text.matchAll(pattern)) {
      const raw = match[0];
      if (match.index === undefined || !raw) continue;

      const resolved = opts.resolveToken(raw);
      if (!resolved) continue;

      replacements.push({
        from: position + match.index,
        to: position + match.index + raw.length,
        node: tokenType.create(
          {
            raw,
            label: resolved.label,
            icon: resolved.icon ?? null,
            kind: resolved.kind ?? null,
          },
          undefined,
          node.marks,
        ),
      });
    }
  });

  if (replacements.length === 0) return null;

  const transaction = state.tr;
  // Reversed, so an earlier replacement cannot shift the positions of a later
  // one — the same ordering the emoji extension depends on.
  for (const replacement of replacements.reverse()) {
    transaction.replaceWith(replacement.from, replacement.to, replacement.node);
  }
  return transaction;
}

/**
 * Build the inline token-chip node used by `RichInputBase`.
 *
 * The ProseMirror document holds a real atom so the author sees a chip and can
 * place, reorder and delete it as one object; its text and markdown
 * projections are the ORIGINAL RAW TOKEN. That round-trip is the whole point:
 * the consumer's stored body is unchanged, and the editor is the only thing
 * that renders differently.
 *
 * A transaction plugin converts matches after typing, paste, controlled
 * updates and imperative `insertText()` calls — the same four paths the emoji
 * extension covers, because a token arrives through all of them (a GIF picker
 * inserts imperatively; a pasted draft arrives whole).
 */
export function buildTokenExtension(opts: BuildTokenOptions): Node {
  return Node.create({
    name: "customToken",
    group: "inline",
    inline: true,
    atom: true,
    // Selectable, unlike the emoji atom: a chip stands for a whole piece of
    // content, so selecting it before deleting is the expected gesture.
    selectable: true,
    draggable: false,

    addAttributes() {
      return {
        raw: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute("data-raw"),
        },
        label: {
          default: null,
          parseHTML: (element: HTMLElement) =>
            element.getAttribute("data-label"),
        },
        icon: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute("data-icon"),
        },
        kind: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute("data-kind"),
        },
      };
    },

    parseHTML() {
      return [{ tag: 'span[data-type="custom-token"]' }];
    },

    renderHTML({ node }) {
      const label = String(node.attrs.label ?? "");
      const icon = node.attrs.icon ? String(node.attrs.icon) : "";
      const kind = node.attrs.kind ? String(node.attrs.kind) : "";
      return [
        "span",
        {
          "data-type": "custom-token",
          "data-raw": String(node.attrs.raw ?? ""),
          "data-label": label,
          ...(icon ? { "data-icon": icon } : {}),
          ...(kind ? { "data-kind": kind } : {}),
          class: "sn-rich-input-token",
          // The chip is one object to a screen reader, not an icon plus a word.
          "aria-label": kind ? `${kind}: ${label}` : label,
          draggable: "false",
        },
        icon ? `${icon} ${label}` : label,
      ];
    },

    renderText({ node }) {
      return String(node.attrs.raw ?? "");
    },

    addStorage() {
      return {
        markdown: {
          serialize(
            markdownState: { write: (value: string) => void },
            node: { attrs: { raw?: string } },
          ) {
            markdownState.write(String(node.attrs.raw ?? ""));
          },
          parse: { setup() {} },
        },
      };
    },

    addProseMirrorPlugins() {
      const tokenType = this.type;
      return [
        new Plugin({
          key: new PluginKey("richInputCustomToken"),
          appendTransaction(transactions, oldState, newState) {
            if (
              !transactions.some((transaction) => transaction.docChanged) ||
              oldState.doc.eq(newState.doc)
            ) {
              return null;
            }
            return createTokenTransaction(newState, tokenType, opts);
          },
        }),
      ];
    },

    onCreate() {
      // Covers `defaultValue` — a restored draft must show chips immediately,
      // not raw tokens that only become chips once the author types.
      this.editor.commands.command(({ state, dispatch }) => {
        const transaction = createTokenTransaction(state, this.type, opts);
        if (!transaction) return false;
        transaction.setMeta("addToHistory", false);
        dispatch?.(transaction);
        return true;
      });
    },
  });
}
