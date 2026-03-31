import { categoryPrefixes as prefixMap } from "./prefixes";
import type { BreakpointTokens, TokenSet } from "./schema";

/**
 * Returns a CSS `var()` reference for a token path.
 *
 * @example
 * ```ts
 * token('colors.primary')            // 'var(--color-primary)'
 * token('spacing.4')                 // 'var(--spacing-4)'
 * token('radius.lg')                 // 'var(--radius-lg)'
 * token('typography.fontSize.xl')    // 'var(--typography-fontSize-xl)'
 * token('shadows.md')                // 'var(--shadow-md)'
 * token('transitions.duration.fast') // 'var(--transition-duration-fast)'
 * ```
 */
export function token(path: string): string {
  const parts = path.split(".");
  if (parts.length < 2) {
    throw new Error(
      `[snapshot] Invalid token path "${path}". Expected "category.key" or "category.sub.key".`,
    );
  }

  const [category, ...rest] = parts;
  const prefix = prefixMap[category!] ?? category;
  return `var(--${prefix}-${rest.join("-")})`;
}

// ── Raw value lookup ─────────────────────────────────────────────────────────

/**
 * Resolves a token path to its raw value from a token set.
 *
 * For color tokens, returns the light mode value by default.
 * Pass `mode: 'dark'` for the dark mode value.
 *
 * @example
 * ```ts
 * tokenValue('spacing.4', tokens)                  // '1rem'
 * tokenValue('colors.primary', tokens)             // 'oklch(0.21 0.006 285.89)' (light)
 * tokenValue('colors.primary', tokens, 'dark')     // 'oklch(0.92 0.004 286.32)'
 * tokenValue('typography.fontSize.xl', tokens)     // '1.25rem'
 * ```
 */
export function tokenValue(
  path: string,
  tokens: TokenSet,
  mode: "light" | "dark" = "light",
): string {
  const parts = path.split(".");
  if (parts.length < 2) {
    throw new Error(`[snapshot] Invalid token path "${path}".`);
  }

  let current: unknown = tokens;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      throw new Error(`[snapshot] Token path "${path}" not found — failed at "${part}".`);
    }
    current = (current as Record<string, unknown>)[part];
  }

  if (current === null || current === undefined) {
    throw new Error(`[snapshot] Token path "${path}" resolved to null/undefined.`);
  }

  // Handle ColorPair objects
  if (typeof current === "object" && "light" in current && "dark" in current) {
    return (current as { light: string; dark: string })[mode];
  }

  if (typeof current !== "string") {
    throw new Error(
      `[snapshot] Token path "${path}" resolved to a non-string value. Use a more specific path.`,
    );
  }

  return current;
}

// ── Breakpoint-aware values ──────────────────────────────────────────────────

/**
 * A value that can be responsive — either a flat value or a breakpoint map.
 *
 * @example
 * ```ts
 * // Flat value
 * const gap: ResponsiveValue<string> = 'md'
 *
 * // Responsive
 * const gap: ResponsiveValue<string> = { default: 'sm', md: 'md', lg: 'lg' }
 * ```
 */
export type ResponsiveValue<T> = T | ({ default: T } & Partial<Record<keyof BreakpointTokens, T>>);

/**
 * Resolves a responsive value into an array of `{ breakpoint, value }` entries.
 * The `default` entry has `breakpoint: null`.
 *
 * @example
 * ```ts
 * resolveResponsive('md')
 * // [{ breakpoint: null, value: 'md' }]
 *
 * resolveResponsive({ default: 'sm', md: 'md', lg: 'lg' })
 * // [
 * //   { breakpoint: null, value: 'sm' },
 * //   { breakpoint: 'md', value: 'md' },
 * //   { breakpoint: 'lg', value: 'lg' },
 * // ]
 * ```
 */
export function resolveResponsive<T>(
  value: ResponsiveValue<T>,
): Array<{ breakpoint: string | null; value: T }> {
  if (typeof value !== "object" || value === null || !("default" in value)) {
    return [{ breakpoint: null, value: value as T }];
  }

  const entries: Array<{ breakpoint: string | null; value: T }> = [];
  const record = value as Record<string, T>;

  if ("default" in record) {
    entries.push({ breakpoint: null, value: record.default! });
  }

  const breakpointOrder = ["sm", "md", "lg", "xl", "2xl"];
  for (const bp of breakpointOrder) {
    if (bp in record) {
      entries.push({ breakpoint: bp, value: record[bp]! });
    }
  }

  return entries;
}

/**
 * Generates inline styles for a responsive value, using CSS container queries
 * or media queries. For simple use cases, returns the default value's style.
 *
 * For responsive values, generates a CSS class string that should be applied
 * alongside the generated responsive CSS.
 *
 * @example
 * ```ts
 * responsiveStyle('gap', 'md', tokens)
 * // { gap: 'var(--spacing-md)' }
 *
 * responsiveStyle('gap', { default: 'sm', lg: 'lg' }, tokens)
 * // { gap: 'var(--spacing-sm)' }
 * // (the lg breakpoint override must be handled via CSS classes)
 * ```
 */
export function responsiveStyle(
  property: string,
  value: ResponsiveValue<string>,
  tokenCategory: string = "spacing",
): Record<string, string> {
  const entries = resolveResponsive(value);
  const defaultEntry = entries.find((e) => e.breakpoint === null);

  if (!defaultEntry) return {};

  const prefix = prefixMap[tokenCategory] ?? tokenCategory;
  return { [property]: `var(--${prefix}-${defaultEntry.value})` };
}
