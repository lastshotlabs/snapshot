import { contrastRatio, deriveForeground, meetsWcagAA } from "./color";
import type { ThemeConfig } from "./types";

const CONTRAST_PAIRS = [
  ["background", "foreground"],
  ["primary", "primaryForeground"],
  ["secondary", "secondaryForeground"],
  ["muted", "mutedForeground"],
  ["accent", "accentForeground"],
  ["destructive", "destructiveForeground"],
  ["card", "cardForeground"],
  ["popover", "popoverForeground"],
] as const;

type ThemeColorKey = (typeof CONTRAST_PAIRS)[number][number];

function getThemeColorValue(
  theme: ThemeConfig | undefined,
  key: ThemeColorKey,
): string | undefined {
  const colors = theme?.overrides?.colors;
  if (!colors) {
    return undefined;
  }

  const colorMap = colors as Record<string, string | undefined>;
  const resolved = colorMap[key];
  if (resolved) {
    return resolved;
  }

  if (key.endsWith("Foreground")) {
    const backgroundKey = key.replace(/Foreground$/, "") as ThemeColorKey;
    const backgroundColor = colorMap[backgroundKey];
    return backgroundColor ? deriveForeground(backgroundColor) : undefined;
  }

  return undefined;
}

/**
 * Warn when theme color pairs fail WCAG AA contrast.
 */
export function validateContrast(theme: ThemeConfig | undefined): void {
  if (
    typeof process !== "undefined" &&
    process.env.NODE_ENV === "production"
  ) {
    return;
  }

  if (!theme?.overrides?.colors) {
    return;
  }

  for (const [backgroundKey, foregroundKey] of CONTRAST_PAIRS) {
    const background = getThemeColorValue(theme, backgroundKey);
    const foreground = getThemeColorValue(theme, foregroundKey);

    if (!background || !foreground) {
      continue;
    }

    try {
      const ratio = contrastRatio(background, foreground);
      if (!meetsWcagAA(background, foreground)) {
        // eslint-disable-next-line no-console
        console.warn(
          `[snapshot a11y] Contrast warning for "${backgroundKey}" and "${foregroundKey}": ${ratio.toFixed(2)}:1`,
        );
      }
    } catch {
      continue;
    }
  }
}
