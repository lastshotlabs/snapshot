import { useCallback, useState } from "react";
import { usePublish } from "../../../context/hooks";
import type { TabsConfig } from "./schema";
import type { UseTabsReturn } from "./types";

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

  const setActiveTab = useCallback(
    (index: number) => {
      const tab = config.children[index];
      if (!tab || tab.disabled) return;

      setActiveTabRaw(index);

      if (config.id) {
        publish({
          activeTab: index,
          label: tab.label,
        });
      }
    },
    [config.children, config.id, publish],
  );

  return {
    activeTab,
    setActiveTab,
    tabs: config.children,
  };
}
