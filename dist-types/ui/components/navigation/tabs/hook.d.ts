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
export declare function useTabs(config: TabsConfig): UseTabsReturn;
