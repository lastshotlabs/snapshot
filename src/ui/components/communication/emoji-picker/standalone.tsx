'use client';

import { useState, useMemo, useCallback, type CSSProperties } from "react";
import { Icon } from "../../../icons/icon";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { InputControl } from "../../forms/input";
import type { EmojiCategory, EmojiEntry } from "./types";
import type { CustomEmoji } from "./custom-emoji";
import emojiData from "./emoji-data.json";

// ── Constants ───────────���─────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  smileys: "Smileys & Emotion", people: "People & Body", animals: "Animals & Nature",
  food: "Food & Drink", travel: "Travel & Places", activities: "Activities",
  objects: "Objects", symbols: "Symbols", flags: "Flags", custom: "sparkles",
};

const CATEGORY_ICONS: Record<string, string> = {
  smileys: "smile", people: "users", animals: "bug", food: "coffee",
  travel: "map-pin", activities: "trophy", objects: "paperclip",
  symbols: "heart", flags: "flag", custom: "sparkles",
};

// ── Standalone Props ──────────────────��───────────────────────────────────────

export interface EmojiPickerBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Emojis per row. Default: 8. */
  perRow?: number;
  /** Max height of the emoji grid scroll area. Default: "300px". */
  maxHeight?: string;
  /** Restrict to specific category keys. */
  categories?: string[];
  /** Custom emoji entries. */
  customEmojis?: CustomEmoji[];
  /** Called when an emoji is selected. */
  onSelect?: (payload: { emoji: string; name: string; url?: string; shortcode?: string; isCustom: boolean }) => void;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ───────────���─────────────────────────────────────────────────────

/**
 * Standalone EmojiPicker — searchable emoji grid with category tabs and custom emoji
 * support. No manifest context required.
 *
 * @example
 * ```tsx
 * <EmojiPickerBase
 *   perRow={8}
 *   onSelect={({ emoji, name }) => console.log(emoji, name)}
 * />
 * ```
 */
export function EmojiPickerBase({
  id,
  perRow = 8,
  maxHeight = "300px",
  categories: allowedCategories,
  customEmojis = [],
  onSelect,
  className,
  style,
  slots,
}: EmojiPickerBaseProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const rootId = id ?? "emoji-picker";

  const customCategory: EmojiCategory | null = useMemo(() => {
    if (customEmojis.length === 0) return null;
    return {
      category: "custom",
      emojis: customEmojis.map((ce) => ({ native: "", name: ce.name, keywords: [ce.shortcode, ce.name.toLowerCase()], _custom: ce })) as EmojiEntry[],
    };
  }, [customEmojis]);

  const categories = useMemo(() => {
    const all = emojiData as EmojiCategory[];
    let result: EmojiCategory[];
    if (allowedCategories) {
      const allowed = new Set(allowedCategories);
      result = all.filter((c) => allowed.has(c.category));
    } else {
      result = [...all];
    }
    if (customCategory) result = [customCategory, ...result];
    return result;
  }, [allowedCategories, customCategory]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const query = search.toLowerCase();
    return categories
      .map((c) => ({ ...c, emojis: c.emojis.filter((e) => e.name.toLowerCase().includes(query) || e.keywords.some((k) => k.includes(query))) }))
      .filter((c) => c.emojis.length > 0);
  }, [categories, search]);

  const handleSelect = useCallback(
    (emoji: EmojiEntry) => {
      const custom = ((emoji as unknown) as Record<string, unknown>)._custom as CustomEmoji | undefined;
      const payload = custom
        ? { emoji: `:${custom.shortcode}:`, name: custom.name, url: custom.url, shortcode: custom.shortcode, isCustom: true }
        : { emoji: emoji.native, name: emoji.name, isCustom: false };
      onSelect?.(payload);
    },
    [onSelect],
  );

  const categoryKeys = categories.map((c) => c.category);

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: { width: "100%", maxWidth: `${perRow * 2.25 + 1.5}rem`, overflow: "hidden", borderRadius: "md", border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)", bg: "var(--sn-color-card, #ffffff)" },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const searchSectionSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-searchSection`, implementationBase: { padding: "xs", style: { borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" } }, componentSurface: slots?.searchSection });
  const searchShellSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-searchShell`, implementationBase: { display: "flex", alignItems: "center", gap: "xs", paddingY: "xs", paddingX: "sm", borderRadius: "sm", bg: "var(--sn-color-secondary, #f3f4f6)" }, componentSurface: slots?.searchShell });
  const searchIconSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-searchIcon`, implementationBase: { color: "var(--sn-color-muted-foreground, #6b7280)", style: { flexShrink: 0 } }, componentSurface: slots?.searchIcon });
  const searchInputSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-searchInput`, implementationBase: { width: "100%", fontSize: "sm", color: "var(--sn-color-foreground, #111827)", focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" }, style: { border: "none", outline: "none", background: "transparent", padding: 0, minWidth: 0, fontFamily: "inherit" } }, componentSurface: slots?.searchInput });
  const categoryTabsSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-categoryTabs`, implementationBase: { display: "flex", gap: "2xs", overflow: "auto", paddingY: "2xs", paddingX: "xs", style: { borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)" } }, componentSurface: slots?.categoryTabs });
  const gridScrollSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-gridScroll`, implementationBase: { overflow: "auto", padding: "xs", style: { maxHeight } }, componentSurface: slots?.gridScroll });
  const emptyStateSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-emptyState`, implementationBase: { padding: "md", textAlign: "center", fontSize: "sm", color: "var(--sn-color-muted-foreground, #6b7280)" }, componentSurface: slots?.emptyState });

  return (
    <>
      <div data-snapshot-component="emoji-picker" data-testid="emoji-picker" data-snapshot-id={rootId} className={rootSurface.className} style={rootSurface.style}>
        <div data-snapshot-id={`${rootId}-searchSection`} className={searchSectionSurface.className} style={searchSectionSurface.style}>
          <div data-snapshot-id={`${rootId}-searchShell`} className={searchShellSurface.className} style={searchShellSurface.style}>
            <span aria-hidden="true" data-snapshot-id={`${rootId}-searchIcon`} className={searchIconSurface.className} style={searchIconSurface.style}><Icon name="search" size={14} /></span>
            <InputControl testId="emoji-search" surfaceId={`${rootId}-searchInput`} type="text" placeholder="Search emoji..." value={search} onChangeText={setSearch} surfaceConfig={searchInputSurface.resolvedConfigForWrapper} />
          </div>
        </div>

        <div data-snapshot-id={`${rootId}-categoryTabs`} className={categoryTabsSurface.className} style={categoryTabsSurface.style}>
          {categoryKeys.map((key) => {
            const tabSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-categoryTab-${key}`,
              implementationBase: { display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sn-color-muted-foreground, #6b7280)", borderRadius: "sm", cursor: "pointer", hover: { bg: "var(--sn-color-accent, #f3f4f6)" }, focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" }, states: { active: { bg: "var(--sn-color-primary, #2563eb)", color: "var(--sn-color-primary-foreground, #ffffff)", hover: { bg: "color-mix(in oklch, var(--sn-color-primary, #2563eb) 85%, black)" } } }, style: { flex: "0 0 auto", width: "2rem", height: "2rem", padding: 0, border: "none", background: "transparent", transition: "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)" } },
              componentSurface: slots?.categoryTab,
              activeStates: activeCategory === key ? ["active"] : [],
            });
            return (
              <div key={key}>
                <ButtonControl type="button" title={CATEGORY_LABELS[key] ?? key} ariaLabel={CATEGORY_LABELS[key] ?? key} onClick={() => setActiveCategory(activeCategory === key ? null : key)} surfaceId={`${rootId}-categoryTab-${key}`} surfaceConfig={tabSurface.resolvedConfigForWrapper} variant="ghost" size="icon" activeStates={activeCategory === key ? ["active"] : []}>
                  <Icon name={CATEGORY_ICONS[key] ?? "hash"} size={14} />
                </ButtonControl>
                <SurfaceStyles css={tabSurface.scopedCss} />
              </div>
            );
          })}
        </div>

        <div data-snapshot-id={`${rootId}-gridScroll`} className={gridScrollSurface.className} style={gridScrollSurface.style}>
          {filteredCategories.filter((c) => !activeCategory || c.category === activeCategory).map((category) => {
            const catId = `${rootId}-category-${category.category}`;
            const sectionSurface = resolveSurfacePresentation({ surfaceId: catId, implementationBase: { style: { marginBottom: "var(--sn-spacing-xs, 0.25rem)" } }, componentSurface: slots?.categorySection });
            const labelSurface = resolveSurfacePresentation({ surfaceId: `${catId}-label`, implementationBase: { paddingY: "xs", paddingX: "xs", fontSize: "xs", fontWeight: "semibold", color: "var(--sn-color-muted-foreground, #6b7280)", style: { textTransform: "capitalize" } }, componentSurface: slots?.categoryLabel });
            const gridSurface = resolveSurfacePresentation({ surfaceId: `${catId}-grid`, implementationBase: { display: "grid", gap: "2xs", style: { gridTemplateColumns: `repeat(${perRow}, 1fr)` } }, componentSurface: slots?.emojiGrid });
            return (
              <div key={category.category} data-snapshot-id={catId} className={sectionSurface.className} style={sectionSurface.style}>
                <div data-snapshot-id={`${catId}-label`} className={labelSurface.className} style={labelSurface.style}>{CATEGORY_LABELS[category.category] ?? category.category}</div>
                <div data-snapshot-id={`${catId}-grid`} className={gridSurface.className} style={gridSurface.style}>
                  {category.emojis.map((emoji) => {
                    const custom = ((emoji as unknown) as Record<string, unknown>)._custom as CustomEmoji | undefined;
                    const btnSurface = resolveSurfacePresentation({ surfaceId: `${catId}-emoji-${emoji.name}`, implementationBase: { display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "sm", cursor: "pointer", fontSize: "lg", hover: { bg: "var(--sn-color-accent, #f3f4f6)", scale: 1.15 }, focus: { ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))" }, style: { width: "2rem", height: "2rem", padding: 0, border: "none", background: "transparent", transition: "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)" } }, componentSurface: slots?.emojiButton });
                    const customSurface = resolveSurfacePresentation({ surfaceId: `${catId}-emoji-${emoji.name}-custom`, implementationBase: { style: { width: "1.375rem", height: "1.375rem", objectFit: "contain" } }, componentSurface: slots?.customEmoji });
                    return (
                      <div key={emoji.name}>
                        <ButtonControl type="button" onClick={() => handleSelect(emoji)} title={custom ? `:${custom.shortcode}:` : emoji.name} ariaLabel={custom ? `:${custom.shortcode}:` : emoji.name} surfaceId={`${catId}-emoji-${emoji.name}`} surfaceConfig={btnSurface.resolvedConfigForWrapper} variant="ghost" size="icon">
                          {custom ? <img src={custom.url} alt={`:${custom.shortcode}:`} data-snapshot-id={`${catId}-emoji-${emoji.name}-custom`} className={customSurface.className} style={customSurface.style} /> : emoji.native}
                        </ButtonControl>
                        <SurfaceStyles css={btnSurface.scopedCss} />
                        <SurfaceStyles css={customSurface.scopedCss} />
                      </div>
                    );
                  })}
                </div>
                <SurfaceStyles css={sectionSurface.scopedCss} />
                <SurfaceStyles css={labelSurface.scopedCss} />
                <SurfaceStyles css={gridSurface.scopedCss} />
              </div>
            );
          })}
          {filteredCategories.length === 0 ? <div data-snapshot-id={`${rootId}-emptyState`} className={emptyStateSurface.className} style={emptyStateSurface.style}>No emojis found</div> : null}
        </div>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={searchSectionSurface.scopedCss} />
      <SurfaceStyles css={searchShellSurface.scopedCss} />
      <SurfaceStyles css={searchIconSurface.scopedCss} />
      <SurfaceStyles css={searchInputSurface.scopedCss} />
      <SurfaceStyles css={categoryTabsSurface.scopedCss} />
      <SurfaceStyles css={gridScrollSurface.scopedCss} />
      <SurfaceStyles css={emptyStateSurface.scopedCss} />
    </>
  );
}
