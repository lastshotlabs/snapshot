"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Icon } from "../../../icons/index";
import {
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { SurfaceStyles } from "../../_base/surface-styles";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface CommandPaletteBaseItem {
  /** Display label. */
  label: string;
  /** Icon name. */
  icon?: string;
  /** Keyboard shortcut hint. */
  shortcut?: string;
  /** Description text. */
  description?: string;
}

export interface CommandPaletteBaseGroup {
  /** Group heading label. */
  label: string;
  /** Items in this group. */
  items: CommandPaletteBaseItem[];
}

export interface CommandPaletteBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Whether the palette is visible. */
  open: boolean;
  /** Called when the palette should close. */
  onClose: () => void;
  /** Called when an item is selected. */
  onSelect?: (item: CommandPaletteBaseItem) => void;
  /** Static command groups. */
  groups?: CommandPaletteBaseGroup[];
  /** Placeholder text for the search input. */
  placeholder?: string;
  /** Message when no results match the query. */
  emptyMessage?: string;
  /** Max height of the items list. */
  maxHeight?: string;
  /** Controlled search query value. When provided, the component uses this instead of internal state. */
  query?: string;
  /** Called when the search query changes. Use with `query` for controlled mode. */
  onQueryChange?: (query: string) => void;
  /** Keyboard shortcut hint displayed in the search bar (e.g. "ctrl+k"). */
  shortcutHint?: string;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const ANIMATION_DURATION = 150;

function flattenItems(
  groups: CommandPaletteBaseGroup[],
): Array<{ item: CommandPaletteBaseItem; groupIndex: number; itemIndex: number }> {
  const flat: Array<{
    item: CommandPaletteBaseItem;
    groupIndex: number;
    itemIndex: number;
  }> = [];

  groups.forEach((group, groupIndex) => {
    group.items.forEach((item, itemIndex) => {
      flat.push({ item, groupIndex, itemIndex });
    });
  });

  return flat;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone CommandPalette — a search-driven command list with keyboard
 * navigation. No manifest context required.
 *
 * @example
 * ```tsx
 * <CommandPaletteBase
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   groups={[{ label: "Actions", items: [{ label: "Search..." }] }]}
 *   onSelect={(item) => console.log(item.label)}
 * />
 * ```
 */
export function CommandPaletteBase({
  id,
  open,
  onClose,
  onSelect,
  groups = [],
  placeholder = "Type a command...",
  emptyMessage = "No results found",
  maxHeight = "300px",
  query: controlledQuery,
  onQueryChange,
  shortcutHint,
  className,
  style,
  slots,
}: CommandPaletteBaseProps) {
  const [internalQuery, setInternalQuery] = useState("");
  const isControlled = controlledQuery !== undefined;
  const query = isControlled ? controlledQuery : internalQuery;
  const setQuery = useCallback(
    (value: string) => {
      if (isControlled) {
        onQueryChange?.(value);
      } else {
        setInternalQuery(value);
      }
    },
    [isControlled, onQueryChange],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rootId = id ?? "command-palette";

  const filteredGroups = useMemo(() => {
    if (!query.trim()) {
      return groups;
    }

    const lowerQuery = query.toLowerCase();
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(lowerQuery) ||
            (item.description?.toLowerCase().includes(lowerQuery) ?? false),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  const flatItems = useMemo(() => flattenItems(filteredGroups), [filteredGroups]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    const activeElement = listRef.current.querySelector(
      `[data-command-index="${activeIndex}"]`,
    );
    if (
      activeElement &&
      "scrollIntoView" in activeElement &&
      typeof activeElement.scrollIntoView === "function"
    ) {
      activeElement.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const handleSelect = useCallback(
    (item: CommandPaletteBaseItem) => {
      onSelect?.(item);
      onClose();
    },
    [onClose, onSelect],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setActiveIndex((currentIndex) =>
            currentIndex < flatItems.length - 1 ? currentIndex + 1 : 0,
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setActiveIndex((currentIndex) =>
            currentIndex > 0 ? currentIndex - 1 : flatItems.length - 1,
          );
          break;
        case "Enter":
          event.preventDefault();
          if (flatItems[activeIndex]) {
            handleSelect(flatItems[activeIndex]!.item);
          }
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    },
    [activeIndex, flatItems, handleSelect, onClose],
  );

  useEffect(() => {
    if (open) {
      setMounted(true);
      if (!isControlled) {
        setInternalQuery("");
      }
      const enterTimer = setTimeout(() => {
        setAnimating(true);
        inputRef.current?.focus();
      }, 10);
      return () => clearTimeout(enterTimer);
    }

    if (mounted) {
      setAnimating(false);
      const exitTimer = setTimeout(() => setMounted(false), ANIMATION_DURATION);
      return () => clearTimeout(exitTimer);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) {
    return null;
  }

  const animationStyle: CSSProperties = {
    opacity: animating ? 1 : 0,
    transform: animating ? "scale(1)" : "scale(0.95)",
    transition: `opacity var(--sn-duration-fast, ${ANIMATION_DURATION}ms) var(--sn-ease-default, ease), transform var(--sn-duration-fast, ${ANIMATION_DURATION}ms) var(--sn-ease-default, ease)`,
  };

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "block",
      style: animationStyle,
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const panelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-panel`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      color:
        "var(--sn-color-popover-foreground, var(--sn-color-foreground, #111827))",
      bg: "var(--sn-color-popover, var(--sn-color-card, #ffffff))",
      borderRadius: "lg",
      shadow: "lg",
      style: {
        border:
          "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
        overflow: "hidden",
      },
    },
    componentSurface: slots?.panel,
  });
  const searchSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-search`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "sm",
      style: {
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
        borderBottom:
          "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
      },
    },
    componentSurface: slots?.search,
  });
  const searchInputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-search-input`,
    implementationBase: {
      color: "var(--sn-color-foreground, #111827)",
      bg: "transparent",
      style: {
        flex: 1,
        border: "none",
        outline: "none",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        fontFamily: "inherit",
        lineHeight: "var(--sn-leading-normal, 1.5)",
      },
    },
    componentSurface: slots?.searchInput,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    implementationBase: {
      style: {
        maxHeight,
        overflowY: "auto",
        padding: "var(--sn-spacing-xs, 0.25rem)",
      },
    },
    componentSurface: slots?.list,
  });
  const emptyStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-empty-state`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      textAlign: "center",
      style: {
        padding: "var(--sn-spacing-lg, 1.5rem) var(--sn-spacing-md, 1rem)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
      },
    },
    componentSurface: slots?.emptyState,
  });
  const groupLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-group-label`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
        fontSize: "var(--sn-font-size-xs, 0.75rem)",
        fontWeight: "var(--sn-font-weight-semibold, 600)",
        textTransform: "uppercase",
        letterSpacing: "var(--sn-tracking-wide, 0.05em)",
      },
    },
    componentSurface: slots?.groupLabel,
  });

  let flatIndex = 0;

  return (
    <div
      data-snapshot-component="command-palette"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      onKeyDown={handleKeyDown}
      style={rootSurface.style}
    >
      <div
        data-snapshot-id={`${rootId}-panel`}
        className={panelSurface.className}
        style={panelSurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-search`}
          className={searchSurface.className}
          style={searchSurface.style}
        >
          <Icon
            name="search"
            size={16}
            color="var(--sn-color-muted-foreground, #6b7280)"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            data-snapshot-id={`${rootId}-search-input`}
            className={searchInputSurface.className}
            style={searchInputSurface.style as CSSProperties}
          />
          {shortcutHint ? (
            <kbd
              style={{
                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                fontFamily: "var(--sn-font-mono, monospace)",
                color: "var(--sn-color-muted-foreground, #6b7280)",
                backgroundColor: "var(--sn-color-muted, #f3f4f6)",
                padding:
                  "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-xs, 0.25rem)",
                borderRadius: "var(--sn-radius-xs, 0.125rem)",
                border:
                  "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
              }}
            >
              {shortcutHint}
            </kbd>
          ) : null}
        </div>

        <div
          ref={listRef}
          data-snapshot-id={`${rootId}-list`}
          role="listbox"
          className={listSurface.className}
          style={listSurface.style}
        >
          {filteredGroups.length === 0 ? (
            <div
              data-snapshot-id={`${rootId}-empty-state`}
              className={emptyStateSurface.className}
              style={emptyStateSurface.style}
            >
              {emptyMessage}
            </div>
          ) : (
            filteredGroups.map((group, groupIndex) => (
              <div
                key={`group-${group.label}-${groupIndex}`}
                data-snapshot-command-group=""
              >
                <div
                  data-snapshot-id={`${rootId}-group-label`}
                  className={groupLabelSurface.className}
                  style={groupLabelSurface.style}
                >
                  {group.label}
                </div>
                {group.items.map((item, itemIndex) => {
                  const currentFlatIndex = flatIndex++;
                  const isActive = currentFlatIndex === activeIndex;
                  const itemSurface = resolveSurfacePresentation({
                    surfaceId: `${rootId}-item-${currentFlatIndex}`,
                    implementationBase: {
                      display: "flex",
                      alignItems: "center",
                      gap: "sm",
                      borderRadius: "sm",
                      cursor: "pointer",
                      hover: {
                        bg: "var(--sn-color-accent, #f3f4f6)",
                      },
                      states: {
                        current: {
                          bg: "var(--sn-color-accent, #f3f4f6)",
                          color:
                            "var(--sn-color-accent-foreground, #111827)",
                        },
                      },
                      style: {
                        padding:
                          "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                        transition:
                          "background-color var(--sn-duration-fast, 100ms) var(--sn-ease-default, ease)",
                      },
                    },
                    componentSurface: slots?.item,
                    activeStates: isActive ? ["current"] : [],
                  });
                  const itemIconSurface = resolveSurfacePresentation({
                    surfaceId: `${rootId}-item-icon-${currentFlatIndex}`,
                    implementationBase: {
                      display: "inline-flex",
                      color: "var(--sn-color-muted-foreground, #6b7280)",
                    },
                    componentSurface: slots?.itemIcon,
                  });
                  const itemLabelSurface = resolveSurfacePresentation({
                    surfaceId: `${rootId}-item-label-${currentFlatIndex}`,
                    implementationBase: {
                      style: {
                        fontSize: "var(--sn-font-size-sm, 0.875rem)",
                        fontWeight: "var(--sn-font-weight-normal, 400)",
                        lineHeight: "var(--sn-leading-normal, 1.5)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    },
                    componentSurface: slots?.itemLabel,
                  });

                  return (
                    <React.Fragment
                      key={`item-${groupIndex}-${itemIndex}-${item.label}`}
                    >
                      <div
                        data-command-index={currentFlatIndex}
                        data-snapshot-id={`${rootId}-item-${currentFlatIndex}`}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleSelect(item)}
                        onPointerEnter={() => setActiveIndex(currentFlatIndex)}
                        className={itemSurface.className}
                        style={itemSurface.style}
                      >
                        {item.icon ? (
                          <span
                            data-snapshot-id={`${rootId}-item-icon-${currentFlatIndex}`}
                            className={itemIconSurface.className}
                            style={itemIconSurface.style}
                          >
                            <Icon name={item.icon} size={16} />
                          </span>
                        ) : null}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            data-snapshot-id={`${rootId}-item-label-${currentFlatIndex}`}
                            className={itemLabelSurface.className}
                            style={itemLabelSurface.style}
                          >
                            {item.label}
                          </div>
                          {item.description ? (
                            <div
                              style={{
                                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                                color:
                                  "var(--sn-color-muted-foreground, #6b7280)",
                                lineHeight: "var(--sn-leading-tight, 1.25)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.description}
                            </div>
                          ) : null}
                        </div>
                        {item.shortcut ? (
                          <kbd
                            data-snapshot-command-shortcut=""
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "var(--sn-spacing-2xs, 0.125rem)",
                              fontSize: "var(--sn-font-size-xs, 0.75rem)",
                              fontFamily: "var(--sn-font-mono, monospace)",
                              color: "var(--sn-color-muted-foreground, #6b7280)",
                              backgroundColor: "var(--sn-color-muted, #f3f4f6)",
                              padding:
                                "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-xs, 0.25rem)",
                              borderRadius: "var(--sn-radius-xs, 0.125rem)",
                              border:
                                "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
                              lineHeight: "var(--sn-leading-none, 1)",
                              flexShrink: 0,
                            }}
                          >
                            {item.shortcut}
                          </kbd>
                        ) : null}
                      </div>
                      <SurfaceStyles css={itemSurface.scopedCss} />
                      <SurfaceStyles css={itemIconSurface.scopedCss} />
                      <SurfaceStyles css={itemLabelSurface.scopedCss} />
                    </React.Fragment>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={panelSurface.scopedCss} />
      <SurfaceStyles css={searchSurface.scopedCss} />
      <SurfaceStyles css={searchInputSurface.scopedCss} />
      <SurfaceStyles css={listSurface.scopedCss} />
      <SurfaceStyles css={emptyStateSurface.scopedCss} />
      <SurfaceStyles css={groupLabelSurface.scopedCss} />
    </div>
  );
}
