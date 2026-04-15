"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import { useComponentData } from "../../_base/use-component-data";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { InputControl } from "../../forms/input";
import {
  buildRequestUrl,
  resolveEndpointTarget,
} from "../../../manifest/resources";
import { useManifestRuntime } from "../../../manifest/runtime";
import { SurfaceStyles } from "../../_base/surface-styles";
import { matchesCombo, parseChord } from "../../../shortcuts";
import { useApiClient } from "../../../state";
import type { ActionConfig } from "../../../actions/types";
import type { CommandPaletteConfig } from "./types";

const ANIMATION_DURATION = 150;
const RECENT_STORAGE_PREFIX = "snapshot-command-palette";

interface CommandItem {
  label: string;
  icon?: string;
  shortcut?: string;
  action?: ActionConfig;
  description?: string;
}

interface CommandGroup {
  label: string;
  items: CommandItem[];
}

function flattenItems(
  groups: CommandGroup[],
): Array<{ item: CommandItem; groupIndex: number; itemIndex: number }> {
  const flat: Array<{
    item: CommandItem;
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

function normalizeSearchGroups(data: unknown): CommandGroup[] {
  if (data == null || typeof data !== "object") {
    return [];
  }

  const record = data as Record<string, unknown>;
  if (Array.isArray(record.groups)) {
    return record.groups as CommandGroup[];
  }

  if (Array.isArray(record.items)) {
    return [
      {
        label: "Search",
        items: record.items as CommandItem[],
      },
    ];
  }

  return [];
}

/** CommandPalette — search-driven command palette that renders static groups or fetches remote results, then dispatches manifest actions for the selected command. */
export function CommandPalette({ config }: { config: CommandPaletteConfig }) {
  const visible = useSubscribe(config.visible ?? false);
  const publish = usePublish(config.id);
  const executeAction = useActionExecutor();
  const api = useApiClient();
  const runtime = useManifestRuntime();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [shortcutVisible, setShortcutVisible] = useState(false);
  const [searchGroups, setSearchGroups] = useState<CommandGroup[]>([]);
  const [recentItems, setRecentItems] = useState<CommandItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rootId = config.id ?? "command-palette";
  const storageKey = `${RECENT_STORAGE_PREFIX}:${config.id ?? "default"}`;
  const placeholder = config.placeholder ?? "Type a command...";
  const emptyMessage = config.emptyMessage ?? "No results found";
  const maxHeight = config.maxHeight ?? "300px";

  const dataResult = useComponentData(config.data ?? "");
  const shortcutCommands = useMemo(() => {
    if (!config.autoRegisterShortcuts) {
      return [];
    }

    const manifestShortcuts = runtime?.raw.shortcuts as
      | Record<
          string,
          { label?: string; action: ActionConfig; disabled?: boolean }
        >
      | undefined;

    if (!manifestShortcuts) {
      return [];
    }

    return Object.entries(manifestShortcuts)
      .filter(
        ([, shortcutConfig]) =>
          shortcutConfig.label && shortcutConfig.disabled !== true,
      )
      .map(([shortcut, shortcutConfig]) => ({
        label: shortcutConfig.label!,
        shortcut,
        action: shortcutConfig.action,
      }));
  }, [config.autoRegisterShortcuts, runtime?.raw.shortcuts]);

  useEffect(() => {
    if (!config.recentItems?.enabled || typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(storageKey);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as CommandItem[];
      if (Array.isArray(parsed)) {
        setRecentItems(parsed);
      }
    } catch {
      setRecentItems([]);
    }
  }, [config.recentItems?.enabled, storageKey]);

  useEffect(() => {
    if (!config.recentItems?.enabled || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(recentItems.slice(0, config.recentItems.maxItems)),
    );
  }, [config.recentItems, recentItems, storageKey]);

  useEffect(() => {
    const combos = parseChord(config.shortcut);
    if (typeof window === "undefined" || combos.length === 0) {
      return;
    }

    let chordIndex = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const clearChord = () => {
      if (timer) {
        clearTimeout(timer);
      }
      chordIndex = 0;
      timer = undefined;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (isTyping && !event.ctrlKey && !event.metaKey && !event.altKey) {
        return;
      }

      const expected = combos[chordIndex];
      if (!expected || !matchesCombo(event, expected)) {
        clearChord();
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (chordIndex === combos.length - 1) {
        clearChord();
        setShortcutVisible((current) => !current);
        return;
      }

      chordIndex += 1;
      timer = setTimeout(clearChord, 1000);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearChord();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [config.shortcut]);

  useEffect(() => {
    if (!config.searchEndpoint || typeof window === "undefined") {
      setSearchGroups([]);
      return;
    }

    if (query.trim().length < config.searchEndpoint.minLength) {
      setSearchGroups([]);
      return;
    }

    if (!api) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      const request = resolveEndpointTarget(
        config.searchEndpoint!.endpoint,
        runtime?.resources,
        { q: query.trim() },
      );
      const url = buildRequestUrl(request.endpoint, request.params);

      void (async () => {
        try {
          const response =
            request.method === "POST"
              ? await api.post(url, { q: query.trim() })
              : await api.get(url);
          if (!controller.signal.aborted) {
            setSearchGroups(normalizeSearchGroups(response));
          }
        } catch {
          if (!controller.signal.aborted) {
            setSearchGroups([]);
          }
        }
      })();
    }, config.searchEndpoint.debounce);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [api, config.searchEndpoint, query, runtime?.resources]);

  const allGroups = useMemo(() => {
    const groups: CommandGroup[] = [];

    if (
      config.recentItems?.enabled &&
      recentItems.length > 0 &&
      query.trim().length === 0
    ) {
      groups.push({
        label: "Recent",
        items: recentItems.slice(0, config.recentItems.maxItems),
      });
    }

    if (shortcutCommands.length > 0) {
      groups.push({ label: "Shortcuts", items: shortcutCommands });
    }

    groups.push(...((config.groups ?? []) as CommandGroup[]));
    groups.push(...normalizeSearchGroups(dataResult.data));
    groups.push(...searchGroups);
    return groups;
  }, [
    config.groups,
    config.recentItems,
    dataResult.data,
    query,
    recentItems,
    searchGroups,
    shortcutCommands,
  ]);

  const filteredGroups = useMemo(() => {
    if (!query.trim()) {
      return allGroups;
    }

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

  const persistRecentItem = useCallback(
    (item: CommandItem) => {
      if (!config.recentItems?.enabled) {
        return;
      }

      setRecentItems((currentItems) => {
        const next = [
          item,
          ...currentItems.filter((entry) => entry.label !== item.label),
        ];
        return next.slice(0, config.recentItems!.maxItems);
      });
    },
    [config.recentItems],
  );

  const handleSelect = useCallback(
    (item: CommandItem) => {
      persistRecentItem(item);
      publish?.({ selectedItem: item });

      if (item.action) {
        void executeAction(item.action);
      }

      setShortcutVisible(false);
    },
    [executeAction, persistRecentItem, publish],
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
          setShortcutVisible(false);
          publish?.({ dismissed: true });
          break;
        default:
          break;
      }
    },
    [activeIndex, flatItems, handleSelect, publish],
  );

  const isVisible = visible !== false || shortcutVisible;

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
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
  }, [isVisible, mounted]);

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
    componentSurface: config,
    itemSurface: config.slots?.root,
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
    componentSurface: config.slots?.panel,
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
    componentSurface: config.slots?.search,
  });
  const searchInputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-search-input`,
    implementationBase: {
      color: "var(--sn-color-foreground, #111827)",
      bg: "transparent",
      focus: {
        ring: true,
      },
      states: {
        active: {
          color: "var(--sn-color-foreground, #111827)",
        },
      },
      style: {
        flex: 1,
        border: "none",
        outline: "none",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        fontFamily: "inherit",
        lineHeight: "var(--sn-leading-normal, 1.5)",
      },
    },
    componentSurface: config.slots?.searchInput,
    activeStates: query.trim().length > 0 ? ["active"] : [],
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
    componentSurface: config.slots?.list,
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
    componentSurface: config.slots?.emptyState,
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
    componentSurface: config.slots?.groupLabel,
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
          <InputControl
            inputRef={inputRef}
            surfaceId={`${rootId}-search-input`}
            surfaceConfig={searchInputSurface.resolvedConfigForWrapper}
            type="text"
            value={query}
            onChangeText={setQuery}
            placeholder={placeholder}
            ariaLabel={placeholder}
          />
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
            {config.shortcut}
          </kbd>
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
                    componentSurface: config.slots?.item,
                    activeStates: isActive ? ["current"] : [],
                  });
                  const itemIconSurface = resolveSurfacePresentation({
                    surfaceId: `${rootId}-item-icon-${currentFlatIndex}`,
                    implementationBase: {
                      display: "inline-flex",
                      color: "var(--sn-color-muted-foreground, #6b7280)",
                    },
                    componentSurface: config.slots?.itemIcon,
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
                    componentSurface: config.slots?.itemLabel,
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
