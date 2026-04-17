import { useCallback, useMemo, useState } from "react";
import { usePublish, useResolveFrom } from "../../../context/hooks";
import { useUrlSync } from "../../../hooks/use-url-sync";
import type { TabsConfig } from "./schema";
import type { ResolvedTabConfig, UseTabsReturn } from "./types";

function resolveText(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * Hook that manages tab state for a given tabs config.
 * Tracks the active tab index and publishes the current tab info
 * to the page context when the component has an id.
 *
 * @param config - The tabs config from the manifest
 * @returns Tab state and controls
 */
export function useTabs(config: TabsConfig): UseTabsReturn {
  const [activeTab, setActiveTabRaw] = useState(config.defaultTab ?? 0);
  const publish = usePublish(config.id ?? "");
  const resolvedConfig = useResolveFrom({ children: config.children });
  const tabs = useMemo<ResolvedTabConfig[]>(
    () =>
      (((resolvedConfig.children as TabsConfig["children"] | undefined) ??
        config.children) as TabsConfig["children"]).map((tab) => ({
        ...tab,
        label: resolveText(tab.label) ?? "",
      })),
    [config.children, resolvedConfig.children],
  );
  const urlSyncConfig = useMemo(() => {
    if (!config.urlSync) {
      return null;
    }

    if (config.urlSync === true) {
      return {
        params: { activeTab: "tab" },
        replace: true,
      };
    }

    return {
      params: config.urlSync.params,
      replace: config.urlSync.replace,
    };
  }, [config.urlSync]);

  const setActiveTab = useCallback(
    (index: number) => {
      const tab = tabs[index];
      if (!tab || tab.disabled) return;

      setActiveTabRaw(index);

      if (config.id) {
        publish({
          activeTab: index,
          label: tab.label,
        });
      }
    },
    [config.id, publish, tabs],
  );

  useUrlSync({
    enabled: urlSyncConfig !== null,
    params: urlSyncConfig?.params ?? {},
    replace: urlSyncConfig?.replace,
    state: { activeTab },
    onStateFromUrl: (state) => {
      const rawValue = state["activeTab"];
      if (rawValue === undefined) {
        return;
      }

      const nextIndex = Number(rawValue);
      if (!Number.isInteger(nextIndex)) {
        return;
      }

      const nextTab = tabs[nextIndex];
      if (!nextTab || nextTab.disabled) {
        return;
      }

      setActiveTabRaw(nextIndex);
      if (config.id) {
        publish({
          activeTab: nextIndex,
          label: nextTab.label,
        });
      }
    },
  });

  return {
    activeTab,
    setActiveTab,
    tabs,
  };
}
