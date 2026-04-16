import type { ActionConfig } from "../actions/types";
import type { PolicyExpr } from "../policies/types";
/** Keyboard shortcut definition from manifest. */
export interface ShortcutBinding {
    label?: string;
    action: ActionConfig | ActionConfig[];
    disabled?: boolean | PolicyExpr;
}
/** Parsed keyboard combo. */
export interface ParsedCombo {
    key: string;
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
}
export interface ParsedShortcut {
    id: string;
    sequence: ParsedCombo[];
    binding: ShortcutBinding;
    hasModifier: boolean;
}
