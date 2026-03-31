import { categoryPrefixes } from "./prefixes";
import type { TokenSet } from "./schema";

// ── CSS variable generation ──────────────────────────────────────────────────

/**
 * Flattens a nested token object into a flat map of CSS variable name → value.
 *
 * `{ colors: { primary: 'blue' } }` → `{ '--color-primary': 'blue' }`
 *
 * Handles special cases:
 * - Color tokens (ColorPair) are split into light/dark
 * - Typography sub-objects flatten with joined prefixes
 */
function flattenTokens(
  obj: Record<string, unknown>,
  prefix: string,
  mode: "light" | "dark",
): Map<string, string> {
  const vars = new Map<string, string>();

  for (const [key, value] of Object.entries(obj)) {
    const varName = prefix ? `--${prefix}-${key}` : `--${key}`;

    if (value === null || value === undefined) continue;

    if (typeof value === "string") {
      vars.set(varName, value);
      continue;
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      const record = value as Record<string, unknown>;

      // Check if this is a ColorPair: { light: string, dark: string }
      if (
        "light" in record &&
        "dark" in record &&
        typeof record.light === "string" &&
        typeof record.dark === "string"
      ) {
        vars.set(varName, mode === "light" ? record.light : record.dark);
        continue;
      }

      // Recurse into nested objects
      const nested = flattenTokens(record, prefix ? `${prefix}-${key}` : key, mode);
      for (const [k, v] of nested) {
        vars.set(k, v);
      }
    }
  }

  return vars;
}

/**
 * Generates CSS custom properties from a token set.
 *
 * Produces two blocks:
 * - `:root { ... }` for light mode tokens
 * - `.dark { ... }` for dark mode overrides (only color tokens differ)
 *
 * Also includes keyframe definitions for interaction animations.
 *
 * @returns A complete CSS string ready for injection into the document.
 */
export function resolveTokensToCSS(tokens: TokenSet): string {
  const lightVars = new Map<string, string>();
  const darkOverrides = new Map<string, string>();

  for (const [category, values] of Object.entries(tokens)) {
    const prefix = categoryPrefixes[category] ?? category;

    if (category === "colors") {
      // Colors have light/dark pairs — resolve both modes
      const lightColors = flattenTokens(values as Record<string, unknown>, prefix, "light");
      const darkColors = flattenTokens(values as Record<string, unknown>, prefix, "dark");

      for (const [k, v] of lightColors) lightVars.set(k, v);
      for (const [k, v] of darkColors) {
        if (lightVars.get(k) !== v) darkOverrides.set(k, v);
      }
    } else {
      // Non-color tokens are mode-independent
      const flat = flattenTokens(values as Record<string, unknown>, prefix, "light");
      for (const [k, v] of flat) lightVars.set(k, v);
    }
  }

  // Build CSS
  const lines: string[] = [];

  lines.push(":root {");
  for (const [name, value] of lightVars) {
    lines.push(`  ${name}: ${value};`);
  }
  lines.push("}");

  if (darkOverrides.size > 0) {
    lines.push("");
    lines.push(".dark {");
    for (const [name, value] of darkOverrides) {
      lines.push(`  ${name}: ${value};`);
    }
    lines.push("}");
  }

  // Keyframes for interaction animations
  lines.push("");
  lines.push(`@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}`);
  lines.push(`@keyframes slide-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}`);
  lines.push(`@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}`);

  return lines.join("\n");
}
