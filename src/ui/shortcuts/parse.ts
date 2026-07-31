import type { ParsedCombo } from "./types";

/**
 * Parse a shortcut string like "ctrl+k" or "shift+?" into a structured combo.
 */
export function parseCombo(combo: string): ParsedCombo {
  const parts = combo
    .toLowerCase()
    .split("+")
    .map((part) => part.trim());
  return {
    ctrl: parts.includes("ctrl") || parts.includes("control"),
    alt: parts.includes("alt"),
    shift: parts.includes("shift"),
    meta:
      parts.includes("meta") ||
      parts.includes("cmd") ||
      parts.includes("command"),
    key:
      parts
        .filter(
          (part) =>
            ![
              "ctrl",
              "control",
              "alt",
              "shift",
              "meta",
              "cmd",
              "command",
            ].includes(part),
        )
        .pop() ?? "",
  };
}

/**
 * Parse a multi-step keyboard chord like "g then i" into ordered combos.
 */
export function parseChord(input: string): ParsedCombo[] {
  return input
    .split(/\s+then\s+/i)
    .map((part) => parseCombo(part.trim()))
    .filter((combo) => combo.key.length > 0);
}

/**
 * Check if a keyboard event matches a parsed combo.
 */
export function matchesCombo(
  event: KeyboardEvent,
  combo: ParsedCombo,
): boolean {
  if (combo.ctrl !== event.ctrlKey) return false;
  if (combo.alt !== event.altKey) return false;
  if (combo.shift !== event.shiftKey) return false;
  if (combo.meta !== event.metaKey) return false;
  return event.key.toLowerCase() === combo.key;
}
