"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { useComponentData } from "../../_base/use-component-data";
import {
  buildRequestUrl,
  resolveEndpointTarget,
} from "../../../manifest/resources";
import { useManifestRuntime } from "../../../manifest/runtime";
import { matchesCombo, parseChord } from "../../../shortcuts";
import { useApiClient } from "../../../state";
import type { ActionConfig } from "../../../actions/types";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { CommandPaletteBase } from "./standalone";
import type { CommandPaletteBaseItem, CommandPaletteBaseGroup } from "./standalone";
import type { CommandPaletteConfig } from "./types";

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
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    groups: config.groups,
    placeholder: config.placeholder,
    emptyMessage: config.emptyMessage,
  });
  const publish = usePublish(config.id);
  const executeAction = useActionExecutor();
  const api = useApiClient();
  const runtime = useManifestRuntime();
  const [query, setQuery] = useState("");
  const [shortcutVisible, setShortcutVisible] = useState(false);
  const [searchGroups, setSearchGroups] = useState<CommandGroup[]>([]);
  const [recentItems, setRecentItems] = useState<CommandItem[]>([]);
  const rootId = config.id ?? "command-palette";
  const storageKey = `${RECENT_STORAGE_PREFIX}:${config.id ?? "default"}`;
  const shortcut = config.shortcut ?? "ctrl+k";
  const placeholder =
    resolveOptionalPrimitiveValue(resolvedConfig.placeholder, primitiveOptions) ??
    "Type a command...";
  const emptyMessage =
    resolveOptionalPrimitiveValue(resolvedConfig.emptyMessage, primitiveOptions) ??
    "No results found";
  const maxHeight = config.maxHeight ?? "300px";
  const staticGroups = useMemo<CommandGroup[]>(
    () =>
      ((resolvedConfig.groups as CommandPaletteConfig["groups"] | undefined) ??
        config.groups ??
        []).map((group) => ({
        label: resolveOptionalPrimitiveValue(group.label, primitiveOptions) ?? "",
        items: group.items.map((item) => ({
          ...item,
          label: resolveOptionalPrimitiveValue(item.label, primitiveOptions) ?? "",
          description: resolveOptionalPrimitiveValue(
            item.description,
            primitiveOptions,
          ),
        })),
      })),
    [config.groups, primitiveOptions, resolvedConfig.groups],
  );

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

  // Load recent items from localStorage
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

  // Persist recent items to localStorage
  useEffect(() => {
    if (!config.recentItems?.enabled || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(recentItems.slice(0, config.recentItems.maxItems)),
    );
  }, [config.recentItems, recentItems, storageKey]);

  // Global keyboard shortcut listener
  useEffect(() => {
    const combos = parseChord(shortcut);
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
  }, [shortcut]);

  // Remote search endpoint
  useEffect(() => {
    if (!config.searchEndpoint || typeof window === "undefined") {
      setSearchGroups([]);
      return;
    }

    const minLength = config.searchEndpoint.minLength ?? 2;
    if (query.trim().length < minLength) {
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

  // Merge all groups: recent + shortcuts + static + data + remote search
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

    groups.push(...staticGroups);
    groups.push(...normalizeSearchGroups(dataResult.data));
    groups.push(...searchGroups);
    return groups;
  }, [
    config.recentItems,
    dataResult.data,
    query,
    recentItems,
    searchGroups,
    staticGroups,
    shortcutCommands,
  ]);

  // Convert internal CommandGroups to standalone format
  const standaloneGroups = useMemo<CommandPaletteBaseGroup[]>(
    () =>
      allGroups.map((group) => ({
        label: group.label,
        items: group.items.map((item) => ({
          label: item.label,
          icon: item.icon,
          shortcut: item.shortcut,
          description: item.description,
        })),
      })),
    [allGroups],
  );

  // Build a lookup from label to original CommandItem (with action) for onSelect
  const itemLookup = useMemo(() => {
    const lookup = new Map<string, CommandItem>();
    for (const group of allGroups) {
      for (const item of group.items) {
        lookup.set(item.label, item);
      }
    }
    return lookup;
  }, [allGroups]);

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
    (baseItem: CommandPaletteBaseItem) => {
      const originalItem = itemLookup.get(baseItem.label);
      if (originalItem) {
        persistRecentItem(originalItem);
        publish?.({ selectedItem: originalItem });

        if (originalItem.action) {
          void executeAction(originalItem.action);
        }
      }

      setShortcutVisible(false);
    },
    [executeAction, itemLookup, persistRecentItem, publish],
  );

  const handleClose = useCallback(() => {
    setShortcutVisible(false);
    publish?.({ dismissed: true });
  }, [publish]);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const isVisible = visible !== false || shortcutVisible;

  return (
    <CommandPaletteBase
      id={rootId}
      open={isVisible}
      onClose={handleClose}
      onSelect={handleSelect}
      groups={standaloneGroups}
      placeholder={placeholder}
      emptyMessage={emptyMessage}
      maxHeight={maxHeight}
      query={query}
      onQueryChange={handleQueryChange}
      shortcutHint={shortcut}
      className={config.className}
      style={config.style as React.CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
