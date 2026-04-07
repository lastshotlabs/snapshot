import type { TabConfig } from "./schema";

/**
 * Return type for the useTabs hook.
 */
export interface UseTabsReturn {
  /** Index of the currently active tab. */
  activeTab: number;
  /** Set the active tab by index. */
  setActiveTab: (index: number) => void;
  /** The tab definitions from config. */
  tabs: TabConfig[];
}
