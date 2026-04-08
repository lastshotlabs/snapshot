import { useState, useMemo, useCallback } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import emojiData from "./emoji-data.json";
import type { EmojiPickerConfig } from "./types";
import type { EmojiEntry, EmojiCategory } from "./types";

import type { CustomEmoji } from "./custom-emoji";
import { CUSTOM_EMOJI_CSS } from "./custom-emoji";

/** Category → display label mapping. */
const CATEGORY_LABELS: Record<string, string> = {
  smileys: "Smileys & Emotion",
  people: "People & Body",
  animals: "Animals & Nature",
  food: "Food & Drink",
  travel: "Travel & Places",
  activities: "Activities",
  objects: "Objects",
  symbols: "Symbols",
  flags: "Flags",
  custom: "sparkles",
};

/** Category → icon name mapping. */
const CATEGORY_ICONS: Record<string, string> = {
  smileys: "smile",
  people: "users",
  animals: "bug",
  food: "coffee",
  travel: "map-pin",
  activities: "trophy",
  objects: "laptop",
  symbols: "heart",
  flags: "flag",
  custom: "sparkles",
};

/**
 * EmojiPicker — searchable grid of emojis organized by category.
 * Publishes `{ emoji, name }` when an emoji is selected.
 *
 * @param props - Component props containing the emoji picker configuration
 */
export function EmojiPicker({ config }: { config: EmojiPickerConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const perRow = config.perRow ?? 8;
  const maxHeight = config.maxHeight ?? "300px";

  // Build custom emoji category
  const customEmojis = config.customEmojis as CustomEmoji[] | undefined;
  const customCategory: EmojiCategory | null = useMemo(() => {
    if (!customEmojis || customEmojis.length === 0) return null;
    return {
      category: "custom",
      emojis: customEmojis.map((ce) => ({
        native: "", // Custom emojis don't have native chars
        name: ce.name,
        keywords: [ce.shortcode, ce.name.toLowerCase()],
        // Store custom data for rendering
        _custom: ce,
      })),
    };
  }, [customEmojis]);

  // Filter categories based on config + merge custom
  const categories = useMemo(() => {
    const allCategories = emojiData as EmojiCategory[];
    let result: EmojiCategory[];
    if (config.categories) {
      const allowed = new Set<string>(config.categories);
      result = allCategories.filter((c) => allowed.has(c.category));
    } else {
      result = [...allCategories];
    }
    // Add custom category at the front if present
    if (customCategory) {
      result = [customCategory, ...result];
    }
    return result;
  }, [config.categories, customCategory]);

  // Filter by search
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const query = search.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        emojis: cat.emojis.filter(
          (e) =>
            e.name.toLowerCase().includes(query) ||
            e.keywords.some((k) => k.includes(query)),
        ),
      }))
      .filter((cat) => cat.emojis.length > 0);
  }, [categories, search]);

  const handleSelect = useCallback(
    (emoji: EmojiEntry) => {
      const custom = (emoji as unknown as Record<string, unknown>)._custom as CustomEmoji | undefined;
      const payload = custom
        ? {
            emoji: `:${custom.shortcode}:`,
            name: custom.name,
            url: custom.url,
            shortcode: custom.shortcode,
            isCustom: true,
          }
        : { emoji: emoji.native, name: emoji.name, isCustom: false };

      if (publish) {
        publish(payload);
      }
      if (config.selectAction) {
        void execute(config.selectAction, payload);
      }
    },
    [publish, config.selectAction, execute],
  );

  if (visible === false) return null;

  const categoryKeys = categories.map((c) => c.category);

  return (
    <div
      data-snapshot-component="emoji-picker"
      data-testid="emoji-picker"
      className={config.className}
      style={{
        border: "1px solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-md, 0.5rem)",
        backgroundColor: "var(--sn-color-card, #ffffff)",
        overflow: "hidden",
        width: "100%",
        maxWidth: `${perRow * 2.25 + 1.5}rem`,
      }}
    >
      {/* Custom emoji CSS */}
      {customCategory && <style>{CUSTOM_EMOJI_CSS}</style>}
      {/* Search */}
      <div
        style={{
          padding: "var(--sn-spacing-xs, 0.25rem)",
          borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-xs, 0.25rem)",
            padding:
              "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
            backgroundColor: "var(--sn-color-secondary, #f3f4f6)",
            borderRadius: "var(--sn-radius-sm, 0.25rem)",
          }}
        >
          <Icon name="search" size={14} />
          <input
            data-testid="emoji-search"
            type="text"
            placeholder="Search emoji..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-foreground, #111827)",
              width: "100%",
              padding: 0,
            }}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
          padding: "2px var(--sn-spacing-xs, 0.25rem)",
          gap: "1px",
          overflowX: "auto",
        }}
      >
        {categoryKeys.map((cat) => (
          <button
            key={cat}
            title={CATEGORY_LABELS[cat] ?? cat}
            onClick={() =>
              setActiveCategory(activeCategory === cat ? null : cat)
            }
            style={{
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "1.75rem",
              height: "1.75rem",
              padding: 0,
              border: "none",
              borderRadius: "var(--sn-radius-sm, 0.25rem)",
              backgroundColor:
                activeCategory === cat
                  ? "var(--sn-color-primary, #2563eb)"
                  : "transparent",
              color:
                activeCategory === cat
                  ? "var(--sn-color-primary-foreground, #ffffff)"
                  : "var(--sn-color-muted-foreground, #6b7280)",
              cursor: "pointer",
            }}
          >
            <Icon name={CATEGORY_ICONS[cat] ?? "hash"} size={14} />
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div
        style={{
          maxHeight,
          overflowY: "auto",
          padding: "var(--sn-spacing-xs, 0.25rem)",
        }}
      >
        {filteredCategories
          .filter((cat) => !activeCategory || cat.category === activeCategory)
          .map((cat) => (
            <div key={cat.category}>
              <div
                style={{
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  color: "var(--sn-color-muted-foreground, #6b7280)",
                  fontWeight:
                    "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
                  padding:
                    "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-xs, 0.25rem)",
                  textTransform: "capitalize",
                }}
              >
                {CATEGORY_LABELS[cat.category] ?? cat.category}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${perRow}, 1fr)`,
                  gap: "1px",
                }}
              >
                {cat.emojis.map((emoji) => {
                  const custom = (emoji as unknown as Record<string, unknown>)._custom as CustomEmoji | undefined;
                  return (
                    <button
                      key={emoji.name}
                      onClick={() => handleSelect(emoji)}
                      title={custom ? `:${custom.shortcode}:` : emoji.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "2rem",
                        height: "2rem",
                        padding: 0,
                        border: "none",
                        borderRadius: "var(--sn-radius-sm, 0.25rem)",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        fontSize: "1.25rem",
                      }}
                    >
                      {custom ? (
                        <img
                          src={custom.url}
                          alt={`:${custom.shortcode}:`}
                          style={{
                            width: "1.375rem",
                            height: "1.375rem",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        emoji.native
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        {filteredCategories.length === 0 && (
          <div
            style={{
              padding: "var(--sn-spacing-md, 1rem)",
              textAlign: "center",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
            }}
          >
            No emojis found
          </div>
        )}
      </div>
    </div>
  );
}
