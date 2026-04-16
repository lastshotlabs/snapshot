import type { ParsedCombo } from "./types";
/**
 * Parse a shortcut string like "ctrl+k" or "shift+?" into a structured combo.
 */
export declare function parseCombo(combo: string): ParsedCombo;
/**
 * Parse a multi-step keyboard chord like "g then i" into ordered combos.
 */
export declare function parseChord(input: string): ParsedCombo[];
/**
 * Check if a keyboard event matches a parsed combo.
 */
export declare function matchesCombo(event: KeyboardEvent, combo: ParsedCombo): boolean;
