'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type ReactElement,
} from 'react';

/** A single suggestion result. The shape consumers feed back from `onMentionSearch`. */
export interface MentionSuggestion {
  /** Stable identifier — written into the entity body's `<@id>` token. */
  id: string;
  /** Display label shown in the editor and the popover. */
  label: string;
}

/**
 * Props the default `MentionList` (and any consumer-provided override) receive
 * from the Tiptap suggestion plugin's render lifecycle.
 */
export interface MentionListProps {
  /** Current candidate items. */
  items: MentionSuggestion[];
  /** Called when the user picks an item. */
  command: (item: MentionSuggestion) => void;
  /** The current query string after the `@`. */
  query: string;
}

/**
 * Imperative handle the default popover exposes so the suggestion plugin can
 * forward keyboard events without React state synchronization tax.
 */
export interface MentionListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

/**
 * Default mention popover. Minimal styling; uses CSS variables that
 * snapshot's theme tokens already publish (`--popover`, `--popover-foreground`,
 * `--accent`, `--border`) so it inherits whatever flavor the consumer ships.
 *
 * Consumers wanting branded UI should pass `renderMentionList` to
 * `RichInputBase` instead — this component is intentionally simple.
 */
export const DefaultMentionList = forwardRef<MentionListHandle, MentionListProps>(
  function DefaultMentionList({ items, command }, ref): ReactElement {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      // Reset selection whenever the list changes so we never point past the end.
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (items.length === 0) return false;
        if (event.key === 'ArrowUp') {
          setSelectedIndex((i) => (i + items.length - 1) % items.length);
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
          const item = items[selectedIndex];
          if (item) {
            command(item);
            return true;
          }
        }
        return false;
      },
    }), [items, selectedIndex, command]);

    if (items.length === 0) {
      return (
        <div
          className="rich-input-mention-list rich-input-mention-list--empty"
          style={{
            background: 'var(--popover, #fff)',
            color: 'var(--popover-foreground, #6b7280)',
            border: '1px solid var(--border, #e5e7eb)',
            borderRadius: 6,
            padding: '0.375rem 0.625rem',
            fontSize: '0.8125rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          }}
        >
          No matches
        </div>
      );
    }

    return (
      <ul
        className="rich-input-mention-list"
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 4,
          background: 'var(--popover, #fff)',
          color: 'var(--popover-foreground, inherit)',
          border: '1px solid var(--border, #e5e7eb)',
          borderRadius: 6,
          minWidth: 180,
          maxHeight: 240,
          overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }}
      >
        {items.map((item, idx) => {
          const active = idx === selectedIndex;
          return (
            <li key={item.id}>
              <button
                type="button"
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => command(item)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.375rem 0.625rem',
                  border: 'none',
                  borderRadius: 4,
                  background: active ? 'var(--accent, #f3f4f6)' : 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                @{item.label}
              </button>
            </li>
          );
        })}
      </ul>
    );
  },
);
