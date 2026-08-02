"use client";

import { Node } from "@tiptap/core";
import type { Node as ProseMirrorNode, NodeType } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorState, Transaction } from "@tiptap/pm/state";

/** Resolved custom emoji displayed by `RichInputBase`. */
export interface RichInputEmoji {
  /** Image URL to show inside the editor. Trusted `data:image/` URLs are allowed. */
  src: string;
  /** Accessible display name for the emoji. */
  name: string;
}

export interface BuildEmojiOptions {
  /** Resolve a shortcode without surrounding colons into an editor image. */
  resolveEmoji: (shortcode: string) => RichInputEmoji | null;
}

interface EmojiReplacement {
  from: number;
  to: number;
  node: ProseMirrorNode;
}

const shortcodePattern = /:([a-zA-Z0-9_+-]+):/g;

function createEmojiTransaction(
  state: EditorState,
  emojiType: NodeType,
  resolveEmoji: BuildEmojiOptions["resolveEmoji"],
): Transaction | null {
  const replacements: EmojiReplacement[] = [];

  state.doc.descendants((node, position, parent) => {
    if (!node.isText || !node.text) return;

    // A shortcode inside inline or block code is source text, not an emoji.
    if (
      parent?.type.spec.code ||
      node.marks.some((mark) => mark.type.name === "code")
    ) {
      return;
    }

    for (const match of node.text.matchAll(shortcodePattern)) {
      const raw = match[0];
      const shortcode = match[1];
      if (match.index === undefined || !shortcode) continue;

      const resolved = resolveEmoji(shortcode);
      if (!resolved) continue;

      replacements.push({
        from: position + match.index,
        to: position + match.index + raw.length,
        node: emojiType.create(
          { shortcode, src: resolved.src, name: resolved.name },
          undefined,
          node.marks,
        ),
      });
    }
  });

  if (replacements.length === 0) return null;

  const transaction = state.tr;
  for (const replacement of replacements.reverse()) {
    transaction.replaceWith(replacement.from, replacement.to, replacement.node);
  }
  return transaction;
}

/**
 * Build the inline custom-emoji node used by `RichInputBase`.
 *
 * The ProseMirror document stores a real atom for the editor view, while its
 * text and markdown projections both remain `:shortcode:`. A transaction
 * plugin converts resolved shortcode text after typing, paste, controlled
 * updates, and imperative `insertText()` calls.
 */
export function buildEmojiExtension(opts: BuildEmojiOptions): Node {
  return Node.create({
    name: "customEmoji",
    group: "inline",
    inline: true,
    atom: true,
    selectable: false,
    draggable: false,

    addAttributes() {
      return {
        shortcode: {
          default: null,
          parseHTML: (element: HTMLElement) =>
            element.getAttribute("data-shortcode"),
        },
        src: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute("src"),
        },
        name: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute("title"),
        },
      };
    },

    parseHTML() {
      return [{ tag: 'img[data-type="custom-emoji"]' }];
    },

    renderHTML({ node }) {
      const shortcode = String(node.attrs.shortcode ?? "");
      const name = String(node.attrs.name ?? shortcode);
      return [
        "img",
        {
          "data-type": "custom-emoji",
          "data-shortcode": shortcode,
          class: "sn-rich-input-emoji",
          src: String(node.attrs.src ?? ""),
          alt: `:${shortcode}:`,
          title: name,
          draggable: "false",
        },
      ];
    },

    renderText({ node }) {
      return `:${String(node.attrs.shortcode ?? "")}:`;
    },

    addStorage() {
      return {
        markdown: {
          serialize(
            markdownState: { write: (value: string) => void },
            node: { attrs: { shortcode?: string } },
          ) {
            markdownState.write(`:${String(node.attrs.shortcode ?? "")}:`);
          },
          parse: { setup() {} },
        },
      };
    },

    addProseMirrorPlugins() {
      const emojiType = this.type;
      return [
        new Plugin({
          key: new PluginKey("richInputCustomEmoji"),
          appendTransaction(transactions, oldState, newState) {
            if (
              !transactions.some((transaction) => transaction.docChanged) ||
              oldState.doc.eq(newState.doc)
            ) {
              return null;
            }
            return createEmojiTransaction(
              newState,
              emojiType,
              opts.resolveEmoji,
            );
          },
        }),
      ];
    },

    onCreate() {
      this.editor.commands.command(({ state, dispatch }) => {
        const transaction = createEmojiTransaction(
          state,
          this.type,
          opts.resolveEmoji,
        );
        if (!transaction) return false;
        transaction.setMeta("addToHistory", false);
        dispatch?.(transaction);
        return true;
      });
    },
  });
}
