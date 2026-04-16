import type { DrawerConfig } from "./schema";
import type { UseDrawerReturn } from "./types";
/**
 * Hook that manages drawer state for a given drawer config.
 * Reads open/close state from the modal manager, resolves the title FromRef,
 * and handles the trigger auto-open behavior.
 *
 * @param config - The drawer config from the manifest
 * @returns Drawer state and controls
 */
export declare function useDrawer(config: DrawerConfig): UseDrawerReturn;
