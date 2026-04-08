import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import { useComponentData } from "../../_base/use-component-data";
import type { ActionConfig } from "../../../actions/types";
import type { CommandPaletteConfig } from "./types";

/** Shape of a single command item for internal use. */
interface CommandItem {
  label: string;
  icon?: string;
  shortcut?: string;
  action?: ActionConfig;
  description?: string;
}

/** Shape of a command group for internal use. */
interface CommandGroup {
  label: string;
  items: CommandItem[];
}

/**
 * Flatten all groups into a single ordered list of items with group indices
 * for keyboard navigation.
 */
function flattenItems(
  groups: CommandGroup[],
): Array<{ item: CommandItem; groupIndex: number; itemIndex: number }> {
  const flat: Array<{
    item: CommandItem;
    groupIndex: number;
    itemIndex: number;
  }> = [];
  groups.forEach((group, gi) => {
    group.items.forEach((item, ii) => {
      flat.push({ item, groupIndex: gi, itemIndex: ii });
    });
  });
  return flat;
}

/**
 * CommandPalette component — a searchable command/action list.
 *
 * Provides a search input at the top, a filterable grouped list of commands,
 * keyboard navigation (arrow keys + Enter), and dispatches actions on selection.
 *
 * @param props.config - The command palette config from the manifest
 *
 * @example
 * ```json
 * {
 *   "type": "command-palette",
 *   "placeholder": "Search commands...",
 *   "groups": [
 *     {
 *       "label": "Navigation",
 *       "items": [
 *         { "label": "Dashboard", "icon": "layout-dashboard", "action": { "type": "navigate", "to": "/dashboard" } }
 *       ]
 *     }
 *   ]
 * }
 * ```
 */
export function CommandPalette({ config }: { config: CommandPaletteConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);
  const executeAction = useActionExecutor();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const placeholder = config.placeholder ?? "Type a command...";
  const emptyMessage = config.emptyMessage ?? "No results found";
  const maxHeight = config.maxHeight ?? "300px";

  // Fetch dynamic items if data endpoint is provided
  const dataResult = config.data ? useComponentData(config.data) : null;

  // Merge static groups with dynamic data
  const allGroups: CommandGroup[] = useMemo(() => {
    const staticGroups: CommandGroup[] = (config.groups ?? []) as CommandGroup[];
    if (dataResult?.data && Array.isArray((dataResult.data as Record<string, unknown>).groups)) {
      const dynamicGroups = (dataResult.data as Record<string, unknown>).groups as CommandGroup[];
      return [...staticGroups, ...dynamicGroups];
    }
    return staticGroups;
  }, [config.groups, dataResult?.data]);

  // Filter groups by query
  const filteredGroups: CommandGroup[] = useMemo(() => {
    if (!query.trim()) return allGroups;
    const lowerQuery = query.toLowerCase();
    return allGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(lowerQuery) ||
            (item.description?.toLowerCase().includes(lowerQuery) ?? false),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [allGroups, query]);

  const flatItems = useMemo(() => flattenItems(filteredGroups), [filteredGroups]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeElement = listRef.current.querySelector(
      `[data-command-index="${activeIndex}"]`,
    );
    if (activeElement) {
      activeElement.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      if (publish) {
        publish({ selectedItem: item });
      }
      if (item.action) {
        executeAction(item.action);
      }
    },
    [publish, executeAction],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < flatItems.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : flatItems.length - 1,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (flatItems[activeIndex]) {
            handleSelect(flatItems[activeIndex].item);
          }
          break;
      }
    },
    [flatItems, activeIndex, handleSelect],
  );

  if (visible === false) return null;

  let flatIndex = 0;

  return (
    <div
      data-snapshot-component="command-palette"
      className={config.className}
      onKeyDown={handleKeyDown}
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor:
          "var(--sn-color-popover, var(--sn-color-card, #fff))",
        color:
          "var(--sn-color-popover-foreground, var(--sn-color-foreground, #111))",
        border:
          "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-lg, 0.5rem)",
        boxShadow:
          "var(--sn-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1))",
        overflow: "hidden",
      }}
    >
      {/* Search input */}
      <div
        data-snapshot-command-input=""
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sn-spacing-sm, 0.5rem)",
          padding:
            "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
          borderBottom:
            "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
        }}
      >
        <Icon name="search" size={16} color="var(--sn-color-muted-foreground, #6b7280)" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
            color: "var(--sn-color-foreground, #111)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            fontFamily: "inherit",
            lineHeight: 1.5,
          }}
        />
      </div>

      {/* Results list */}
      <div
        ref={listRef}
        data-snapshot-command-list=""
        role="listbox"
        style={{
          maxHeight,
          overflowY: "auto",
          padding: "var(--sn-spacing-xs, 0.25rem)",
        }}
      >
        {filteredGroups.length === 0 ? (
          <div
            data-snapshot-command-empty=""
            style={{
              padding:
                "var(--sn-spacing-lg, 1.5rem) var(--sn-spacing-md, 1rem)",
              textAlign: "center",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
            }}
          >
            {emptyMessage}
          </div>
        ) : (
          filteredGroups.map((group, groupIdx) => (
            <div key={`group-${groupIdx}`} data-snapshot-command-group="">
              {/* Group heading */}
              <div
                data-snapshot-command-group-heading=""
                style={{
                  padding:
                    "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  fontWeight: "var(--sn-font-weight-semibold, 600)" as string,
                  color: "var(--sn-color-muted-foreground, #6b7280)",
                  textTransform: "uppercase" as const,
                  letterSpacing: "var(--sn-tracking-wide, 0.05em)",
                }}
              >
                {group.label}
              </div>

              {/* Items */}
              {group.items.map((item, itemIdx) => {
                const currentFlatIndex = flatIndex++;
                const isActive = currentFlatIndex === activeIndex;

                return (
                  <div
                    key={`item-${groupIdx}-${itemIdx}`}
                    data-command-index={currentFlatIndex}
                    data-snapshot-command-item=""
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(currentFlatIndex)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--sn-spacing-sm, 0.5rem)",
                      padding:
                        "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                      borderRadius: "var(--sn-radius-sm, 0.25rem)",
                      cursor: "pointer",
                      backgroundColor: isActive
                        ? "var(--sn-color-accent, #f3f4f6)"
                        : "transparent",
                      color: isActive
                        ? "var(--sn-color-accent-foreground, #111)"
                        : "var(--sn-color-foreground, #111)",
                      transition: `background-color var(--sn-duration-fast, 100ms) var(--sn-ease-default, ease)`,
                    }}
                  >
                    {/* Icon */}
                    {item.icon && (
                      <Icon
                        name={item.icon}
                        size={16}
                        color="var(--sn-color-muted-foreground, #6b7280)"
                      />
                    )}

                    {/* Label + description */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "var(--sn-font-size-sm, 0.875rem)",
                          fontWeight: "var(--sn-font-weight-normal, 400)" as string,
                          lineHeight: 1.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.label}
                      </div>
                      {item.description && (
                        <div
                          style={{
                            fontSize: "var(--sn-font-size-xs, 0.75rem)",
                            color:
                              "var(--sn-color-muted-foreground, #6b7280)",
                            lineHeight: 1.4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.description}
                        </div>
                      )}
                    </div>

                    {/* Shortcut badge */}
                    {item.shortcut && (
                      <kbd
                        data-snapshot-command-shortcut=""
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "var(--sn-spacing-2xs, 0.125rem)",
                          fontSize: "var(--sn-font-size-xs, 0.75rem)",
                          fontFamily: "var(--sn-font-mono, monospace)",
                          color:
                            "var(--sn-color-muted-foreground, #6b7280)",
                          backgroundColor:
                            "var(--sn-color-muted, #f3f4f6)",
                          padding:
                            "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-xs, 0.25rem)",
                          borderRadius: "var(--sn-radius-xs, 0.125rem)",
                          border:
                            "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
                          lineHeight: 1,
                          flexShrink: 0,
                        }}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
