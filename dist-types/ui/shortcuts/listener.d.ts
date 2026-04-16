import type { ActionConfig } from "../actions/types";
import type { ShortcutBinding } from "./types";
/**
 * Register a global keyboard shortcut listener.
 * Returns an unsubscribe function.
 *
 * Ignores shortcuts when the user is typing in an input, textarea, or
 * contenteditable element (unless the shortcut has a modifier key).
 */
export declare function registerShortcuts(shortcuts: Record<string, ShortcutBinding>, executor: (action: ActionConfig | ActionConfig[]) => void): () => void;
