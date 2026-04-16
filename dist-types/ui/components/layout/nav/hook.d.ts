import type { NavConfig } from "./schema";
import type { UseNavResult } from "./types";
/**
 * Headless hook for nav component logic.
 * Resolves nav items with active state, role-based visibility,
 * badge resolution from FromRefs, and collapse toggle.
 *
 * @param config - Nav component configuration from the manifest
 * @param pathname - Current URL pathname for active route detection
 * @returns Resolved nav items, active item, collapse state, and user info
 */
export declare function useNav(config: NavConfig, pathname: string): UseNavResult;
