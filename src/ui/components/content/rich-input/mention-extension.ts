'use client';

/**
 * Configured Tiptap Mention extension for `RichInputBase`.
 *
 * Aligns the editor's three projections of a mention so consumers don't
 * have to think about the format:
 *
 *   - **Editor view (HTML)**: `<span data-type="mention" data-id="<id>">@<label></span>`
 *     — what the user sees, styled as a chip.
 *   - **Plain-text projection (`editor.getText()`)**: `<@<id>>`
 *     — slingshot-core's content-token format. `parseContentTokens` in
 *     `slingshot-core` parses this directly.
 *   - **Markdown projection (`editor.storage.markdown.getMarkdown()`)**:
 *     `<@<id>>` — same token, so the entity body (which we store as
 *     markdown) round-trips through the framework's `parseBody` and
 *     mention-fan-out path with no special handling.
 *
 * Override the format with `serializeMention` if you store mentions in
 * a different convention (only relevant if you're not on slingshot's
 * content-token grammar).
 */

import Mention from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import {
  DefaultMentionList,
  type MentionListHandle,
  type MentionListProps,
  type MentionSuggestion,
} from './mention-list';
import type { ComponentType } from 'react';

export interface BuildMentionOptions {
  /** Search callback. Required. */
  onSearch: (
    query: string,
  ) => Promise<readonly MentionSuggestion[]> | readonly MentionSuggestion[];
  /**
   * Optional consumer-provided popover. Receives the same props the
   * default list does; should expose `onKeyDown(props: { event })` via
   * `forwardRef` so arrow-key + Enter handling works.
   */
  renderList?: ComponentType<MentionListProps & React.RefAttributes<MentionListHandle>>;
  /**
   * Override the mention serialization format. Default is slingshot's
   * `<@<id>>` token format. Used by `renderText` (plain-text projection)
   * and the markdown serializer.
   */
  serializeMention?: (attrs: { id: string; label: string }) => string;
}

const DEFAULT_SERIALIZE = (attrs: { id: string; label: string }): string => `<@${attrs.id}>`;

export function buildMentionExtension(opts: BuildMentionOptions): unknown {
  const serialize = opts.serializeMention ?? DEFAULT_SERIALIZE;
  const ListComponent = opts.renderList ?? DefaultMentionList;

  // Tiptap's Mention/Suggestion types are nominally strict (generic over
  // SuggestionProps shape, NodeAttrs type, etc.) but the runtime contract
  // is the simple shape captured in this file. We extend then configure
  // with `as never` on the configure argument because the structural
  // match is correct but the nominal generic match isn't worth chasing
  // through three layers of generics.
  const ext = Mention.extend({
    /**
     * Markdown projection. tiptap-markdown reads `addStorage().markdown` to
     * decide how each node serializes when `getMarkdown()` is called.
     */
    addStorage() {
      const parent = (this.parent as (() => Record<string, unknown>) | undefined)?.() ?? {};
      return {
        ...parent,
        markdown: {
          serialize(
            state: { write: (s: string) => void },
            node: { attrs: { id: string; label: string } },
          ) {
            state.write(serialize({ id: node.attrs.id, label: node.attrs.label }));
          },
          parse: { setup() {} },
        },
      };
    },
  });

  const configured = ext.configure({
    HTMLAttributes: { class: 'mention' },
    /**
     * Plain-text projection. `editor.getText()` calls this so the body we
     * hand to plain-text consumers (search snippets, push body preview)
     * already has the slingshot token format.
     */
    renderText: (props: unknown) => {
      const { node } = props as { node: { attrs: { id: string; label: string } } };
      return serialize({ id: node.attrs.id, label: node.attrs.label });
    },
    suggestion: {
      char: '@',
      items: async ({ query }: { query: string }) => {
        const results = await opts.onSearch(query);
        return Array.from(results);
      },
      render: () => {
        let component: ReactRenderer<MentionListHandle, MentionListProps> | null = null;
        let popup: HTMLDivElement | null = null;

        const positionPopup = (rect: DOMRect | null): void => {
          if (!popup || !rect) return;
          // Anchor below the caret. `position: fixed` means clientRect
          // (already viewport-relative) is the right coordinate space —
          // no scroll offset to add.
          popup.style.top = `${rect.bottom + 4}px`;
          popup.style.left = `${rect.left}px`;
        };

        return {
          onStart(props: {
            editor: unknown;
            clientRect?: () => DOMRect | null;
            items: MentionSuggestion[];
            command: (item: MentionSuggestion) => void;
            query: string;
          }) {
            component = new ReactRenderer<MentionListHandle, MentionListProps>(
              ListComponent as unknown as ComponentType<MentionListProps>,
              {
                props: { items: props.items, command: props.command, query: props.query },
                editor: props.editor as never,
              },
            );
            popup = document.createElement('div');
            popup.style.position = 'fixed';
            popup.style.zIndex = '50';
            popup.style.pointerEvents = 'auto';
            popup.appendChild(component.element);
            document.body.appendChild(popup);
            positionPopup(props.clientRect?.() ?? null);
          },
          onUpdate(props: {
            clientRect?: () => DOMRect | null;
            items: MentionSuggestion[];
            command: (item: MentionSuggestion) => void;
            query: string;
          }) {
            component?.updateProps({
              items: props.items,
              command: props.command,
              query: props.query,
            });
            positionPopup(props.clientRect?.() ?? null);
          },
          onKeyDown(props: { event: KeyboardEvent }) {
            if (props.event.key === 'Escape') {
              popup?.remove();
              component?.destroy();
              popup = null;
              component = null;
              return true;
            }
            return component?.ref?.onKeyDown(props) ?? false;
          },
          onExit() {
            popup?.remove();
            component?.destroy();
            popup = null;
            component = null;
          },
        };
      },
    },
  } as never);

  return configured;
}

// Re-export the public types so consumers have a single import path.
export type { MentionSuggestion, MentionListProps, MentionListHandle };
