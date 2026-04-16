import type { ModalConfig } from "./schema";
import type { UseModalReturn } from "./types";
/**
 * Hook that manages modal state for a given modal config.
 * Reads open/close state from the modal manager, resolves the title FromRef,
 * and handles the trigger auto-open behavior.
 *
 * @param config - The modal config from the manifest
 * @returns Modal state and controls
 */
export declare function useModal(config: ModalConfig): UseModalReturn;
