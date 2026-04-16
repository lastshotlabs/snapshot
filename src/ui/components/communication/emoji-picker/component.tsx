'use client';

import { useState, useMemo, useCallback } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { ButtonControl } from "../../forms/button";
import { InputControl } from "../../forms/input";
import type { EmojiCategory, EmojiEntry, EmojiPickerConfig } from "./types";
import emojiData from "./emoji-data.json";
import type { CustomEmoji } from "./custom-emoji";
import { resolveEmojiRecords } from "./custom-emoji";

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

const CATEGORY_ICONS: Record<string, string> = {
  smileys: "smile",
  people: "users",
  animals: "bug",
  food: "coffee",
  travel: "map-pin",
  activities: "trophy",
  objects: "paperclip",
  symbols: "heart",
  flags: "flag",
  custom: "sparkles",
};

function toRecordArray(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload as Record<string, unknown>[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const recordData = payload as Record<string, unknown>;
  const candidates = [
    recordData.results,
    recordData.data,
    recordData.items,
    recordData.emojis,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as Record<string, unknown>[];
    }
  }

  return [];
}

export function EmojiPicker({ config }: { config: EmojiPickerConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const customEmojiResult = useComponentData(config.customEmojiData ?? "");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const rootId = config.id ?? "emoji-picker";

  const perRow = config.perRow ?? 8;
  const maxHeight = config.maxHeight ?? "300px";

  const remoteCustomEmojis = useMemo(
    () =>
      resolveEmojiRecords(
        toRecordArray(customEmojiResult.data),
        config.emojiUrlField,
        config.emojiUrlPrefix,
      ),
    [config.emojiUrlField, config.emojiUrlPrefix, customEmojiResult.data],
  );

  const customEmojis = useMemo(() => {
    const entries = [...remoteCustomEmojis, ...(config.customEmojis ?? [])];
    const seen = new Set<string>();

    return entries.filter((emoji) => {
      const key = emoji.shortcode || emoji.id;
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [config.customEmojis, remoteCustomEmojis]);

  const customCategory: EmojiCategory | null = useMemo(() => {
    if (customEmojis.length === 0) {
      return null;
    }

    return {
      category: "custom",
      emojis: customEmojis.map((customEmoji) => ({
        native: "",
        name: customEmoji.name,
        keywords: [customEmoji.shortcode, customEmoji.name.toLowerCase()],
        _custom: customEmoji,
      })),
    };
  }, [customEmojis]);

  const categories = useMemo(() => {
    const allCategories = emojiData as EmojiCategory[];
    let result: EmojiCategory[];

    if (config.categories) {
      const allowed = new Set<string>(config.categories);
      result = allCategories.filter((category) => allowed.has(category.category));
    } else {
      result = [...allCategories];
    }

    if (customCategory) {
      result = [customCategory, ...result];
    }

    return result;
  }, [config.categories, customCategory]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) {
      return categories;
    }

    const query = search.toLowerCase();
    return categories
      .map((category) => ({
        ...category,
        emojis: category.emojis.filter(
          (emoji) =>
            emoji.name.toLowerCase().includes(query) ||
            emoji.keywords.some((keyword) => keyword.includes(query)),
        ),
      }))
      .filter((category) => category.emojis.length > 0);
  }, [categories, search]);

  const handleSelect = useCallback(
    (emoji: EmojiEntry) => {
      const custom = ((emoji as unknown) as Record<string, unknown>)._custom as
        | CustomEmoji
        | undefined;
      const payload = custom
        ? {
            emoji: `:${custom.shortcode}:`,
            name: custom.name,
            url: custom.url,
            shortcode: custom.shortcode,
            isCustom: true,
          }
        : { emoji: emoji.native, name: emoji.name, isCustom: false };

      publish?.(payload);

      if (config.selectAction) {
        void execute(config.selectAction, payload);
      }
    },
    [config.selectAction, execute, publish],
  );

  if (visible === false) {
    return null;
  }

  const categoryKeys = categories.map((category) => category.category);
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      width: "100%",
      maxWidth: `${perRow * 2.25 + 1.5}rem`,
      overflow: "hidden",
      borderRadius: "md",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      bg: "var(--sn-color-card, #ffffff)",
    },
    componentSurface: extractSurfaceConfig(config, { omit: ["maxHeight"] }),
    itemSurface: config.slots?.root,
  });
  const searchSectionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-searchSection`,
    implementationBase: {
      padding: "xs",
      style: {
        borderBottom:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: config.slots?.searchSection,
  });
  const searchShellSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-searchShell`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "xs",
      paddingY: "xs",
      paddingX: "sm",
      borderRadius: "sm",
      bg: "var(--sn-color-secondary, #f3f4f6)",
    },
    componentSurface: config.slots?.searchShell,
  });
  const searchIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-searchIcon`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        flexShrink: 0,
      },
    },
    componentSurface: config.slots?.searchIcon,
  });
  const searchInputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-searchInput`,
    implementationBase: {
      width: "100%",
      fontSize: "sm",
      color: "var(--sn-color-foreground, #111827)",
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        border: "none",
        outline: "none",
        background: "transparent",
        padding: 0,
        minWidth: 0,
        fontFamily: "inherit",
      },
    },
    componentSurface: config.slots?.searchInput,
  });
  const categoryTabsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-categoryTabs`,
    implementationBase: {
      display: "flex",
      gap: "2xs",
      overflow: "auto",
      paddingY: "2xs",
      paddingX: "xs",
      style: {
        borderBottom:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: config.slots?.categoryTabs,
  });
  const gridScrollSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-gridScroll`,
    implementationBase: {
      overflow: "auto",
      padding: "xs",
      style: {
        maxHeight,
      },
    },
    componentSurface: config.slots?.gridScroll,
  });
  const emptyStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-emptyState`,
    implementationBase: {
      padding: "md",
      textAlign: "center",
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.emptyState,
  });

  return (
    <>
      <div
        data-snapshot-component="emoji-picker"
        data-testid="emoji-picker"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-searchSection`}
          className={searchSectionSurface.className}
          style={searchSectionSurface.style}
        >
          <div
            data-snapshot-id={`${rootId}-searchShell`}
            className={searchShellSurface.className}
            style={searchShellSurface.style}
          >
            <span
              aria-hidden="true"
              data-snapshot-id={`${rootId}-searchIcon`}
              className={searchIconSurface.className}
              style={searchIconSurface.style}
            >
              <Icon name="search" size={14} />
            </span>
            <InputControl
              testId="emoji-search"
              surfaceId={`${rootId}-searchInput`}
              type="text"
              placeholder="Search emoji..."
              value={search}
              onChangeText={setSearch}
              surfaceConfig={searchInputSurface.resolvedConfigForWrapper}
            />
          </div>
        </div>

        <div
          data-snapshot-id={`${rootId}-categoryTabs`}
          className={categoryTabsSurface.className}
          style={categoryTabsSurface.style}
        >
          {categoryKeys.map((categoryKey) => {
            const categoryTabSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-categoryTab-${categoryKey}`,
              implementationBase: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sn-color-muted-foreground, #6b7280)",
                borderRadius: "sm",
                cursor: "pointer",
                hover: {
                  bg: "var(--sn-color-accent, #f3f4f6)",
                },
                focus: {
                  ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
                },
                states: {
                  active: {
                    bg: "var(--sn-color-primary, #2563eb)",
                    color: "var(--sn-color-primary-foreground, #ffffff)",
                    hover: {
                      bg: "color-mix(in oklch, var(--sn-color-primary, #2563eb) 85%, black)",
                    },
                  },
                },
                style: {
                  flex: "0 0 auto",
                  width: "2rem",
                  height: "2rem",
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  transition:
                    "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
                },
              },
              componentSurface: config.slots?.categoryTab,
              activeStates: activeCategory === categoryKey ? ["active"] : [],
            });

            return (
              <div key={categoryKey}>
                <ButtonControl
                  type="button"
                  title={CATEGORY_LABELS[categoryKey] ?? categoryKey}
                  ariaLabel={CATEGORY_LABELS[categoryKey] ?? categoryKey}
                  onClick={() =>
                    setActiveCategory(
                      activeCategory === categoryKey ? null : categoryKey,
                    )
                  }
                  surfaceId={`${rootId}-categoryTab-${categoryKey}`}
                  surfaceConfig={categoryTabSurface.resolvedConfigForWrapper}
                  variant="ghost"
                  size="icon"
                  activeStates={activeCategory === categoryKey ? ["active"] : []}
                >
                  <Icon name={CATEGORY_ICONS[categoryKey] ?? "hash"} size={14} />
                </ButtonControl>
                <SurfaceStyles css={categoryTabSurface.scopedCss} />
              </div>
            );
          })}
        </div>

        <div
          data-snapshot-id={`${rootId}-gridScroll`}
          className={gridScrollSurface.className}
          style={gridScrollSurface.style}
        >
          {filteredCategories
            .filter(
              (category) =>
                !activeCategory || category.category === activeCategory,
            )
            .map((category) => {
              const categoryId = `${rootId}-category-${category.category}`;
              const categorySectionSurface = resolveSurfacePresentation({
                surfaceId: categoryId,
                implementationBase: {
                  style: {
                    marginBottom: "var(--sn-spacing-xs, 0.25rem)",
                  },
                },
                componentSurface: config.slots?.categorySection,
              });
              const categoryLabelSurface = resolveSurfacePresentation({
                surfaceId: `${categoryId}-label`,
                implementationBase: {
                  paddingY: "xs",
                  paddingX: "xs",
                  fontSize: "xs",
                  fontWeight: "semibold",
                  color: "var(--sn-color-muted-foreground, #6b7280)",
                  style: {
                    textTransform: "capitalize",
                  },
                },
                componentSurface: config.slots?.categoryLabel,
              });
              const emojiGridSurface = resolveSurfacePresentation({
                surfaceId: `${categoryId}-grid`,
                implementationBase: {
                  display: "grid",
                  gap: "2xs",
                  style: {
                    gridTemplateColumns: `repeat(${perRow}, 1fr)`,
                  },
                },
                componentSurface: config.slots?.emojiGrid,
              });

              return (
                <div
                  key={category.category}
                  data-snapshot-id={categoryId}
                  className={categorySectionSurface.className}
                  style={categorySectionSurface.style}
                >
                  <div
                    data-snapshot-id={`${categoryId}-label`}
                    className={categoryLabelSurface.className}
                    style={categoryLabelSurface.style}
                  >
                    {CATEGORY_LABELS[category.category] ?? category.category}
                  </div>
                  <div
                    data-snapshot-id={`${categoryId}-grid`}
                    className={emojiGridSurface.className}
                    style={emojiGridSurface.style}
                  >
                    {category.emojis.map((emoji) => {
                      const custom = ((emoji as unknown) as Record<string, unknown>)
                        ._custom as CustomEmoji | undefined;
                      const emojiButtonSurface = resolveSurfacePresentation({
                        surfaceId: `${categoryId}-emoji-${emoji.name}`,
                        implementationBase: {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "sm",
                          cursor: "pointer",
                          fontSize: "lg",
                          hover: {
                            bg: "var(--sn-color-accent, #f3f4f6)",
                            scale: 1.15,
                          },
                          focus: {
                            ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
                          },
                          style: {
                            width: "2rem",
                            height: "2rem",
                            padding: 0,
                            border: "none",
                            background: "transparent",
                            transition:
                              "all var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
                          },
                        },
                        componentSurface: config.slots?.emojiButton,
                      });
                      const customEmojiSurface = resolveSurfacePresentation({
                        surfaceId: `${categoryId}-emoji-${emoji.name}-custom`,
                        implementationBase: {
                          style: {
                            width: "1.375rem",
                            height: "1.375rem",
                            objectFit: "contain",
                          },
                        },
                        componentSurface: config.slots?.customEmoji,
                      });

                      return (
                        <div key={emoji.name}>
                          <ButtonControl
                            type="button"
                            onClick={() => handleSelect(emoji)}
                            title={custom ? `:${custom.shortcode}:` : emoji.name}
                            ariaLabel={custom ? `:${custom.shortcode}:` : emoji.name}
                            surfaceId={`${categoryId}-emoji-${emoji.name}`}
                            surfaceConfig={emojiButtonSurface.resolvedConfigForWrapper}
                            variant="ghost"
                            size="icon"
                          >
                            {custom ? (
                              <img
                                src={custom.url}
                                alt={`:${custom.shortcode}:`}
                                data-snapshot-id={`${categoryId}-emoji-${emoji.name}-custom`}
                                className={customEmojiSurface.className}
                                style={customEmojiSurface.style}
                              />
                            ) : (
                              emoji.native
                            )}
                          </ButtonControl>
                          <SurfaceStyles css={emojiButtonSurface.scopedCss} />
                          <SurfaceStyles css={customEmojiSurface.scopedCss} />
                        </div>
                      );
                    })}
                  </div>
                  <SurfaceStyles css={categorySectionSurface.scopedCss} />
                  <SurfaceStyles css={categoryLabelSurface.scopedCss} />
                  <SurfaceStyles css={emojiGridSurface.scopedCss} />
                </div>
              );
            })}

          {filteredCategories.length === 0 ? (
            <div
              data-snapshot-id={`${rootId}-emptyState`}
              className={emptyStateSurface.className}
              style={emptyStateSurface.style}
            >
              No emojis found
            </div>
          ) : null}
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
