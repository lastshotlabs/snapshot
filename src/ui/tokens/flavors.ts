/**
 * Flavor registry and built-in flavor definitions.
 *
 * Flavors are named theme presets that provide a complete set of design tokens.
 * The first 4 flavors (neutral, slate, violet) are extracted from the existing
 * hardcoded palettes in `globals-css.ts`. The remaining 5 are new additions.
 */

import type { Flavor } from "./types";

// ── Registry ─────────────────────────────────────────────────────────────────

const flavorRegistry = new Map<string, Flavor>();

/**
 * Define and register a new flavor. If a flavor with the same name already exists,
 * it is replaced.
 *
 * @param name - Unique flavor identifier
 * @param config - Flavor configuration (colors, radius, spacing, font, components)
 * @returns The registered Flavor object
 */
export function defineFlavor(
  name: string,
  config: Omit<Flavor, "name">,
): Flavor {
  const flavor: Flavor = { name, ...config };
  flavorRegistry.set(name, flavor);
  return flavor;
}

/**
 * Retrieve a registered flavor by name.
 *
 * @param name - Flavor identifier
 * @returns The Flavor object, or undefined if not found
 */
export function getFlavor(name: string): Flavor | undefined {
  return flavorRegistry.get(name);
}

/**
 * Get all registered flavors as a record.
 *
 * @returns Record of flavor name to Flavor object
 */
export function getAllFlavors(): Record<string, Flavor> {
  const result: Record<string, Flavor> = {};
  for (const [name, flavor] of flavorRegistry) {
    result[name] = flavor;
  }
  return result;
}

// ── Built-in flavors ─────────────────────────────────────────────────────────
// Extracted from src/cli/templates/globals-css.ts + new palettes

/** Clean, professional. Default shadcn neutral palette. */
defineFlavor("neutral", {
  displayName: "Neutral",
  colors: {
    background: "1 0 0",
    card: "1 0 0",
    popover: "1 0 0",
    primary: "0.205 0 0",
    secondary: "0.97 0 0",
    muted: "0.97 0 0",
    accent: "0.97 0 0",
    destructive: "0.577 0.245 27.325",
    border: "0.922 0 0",
    input: "0.922 0 0",
    ring: "0.708 0 0",
    chart: [
      "0.646 0.222 41.116",
      "0.6 0.118 184.704",
      "0.398 0.07 227.392",
      "0.828 0.189 84.429",
      "0.769 0.188 70.08",
    ],
  },
  darkColors: {
    background: "0.145 0 0",
    card: "0.205 0 0",
    popover: "0.205 0 0",
    primary: "0.922 0 0",
    secondary: "0.269 0 0",
    muted: "0.269 0 0",
    accent: "0.269 0 0",
    destructive: "0.704 0.191 22.216",
    border: "0.3 0 0",
    input: "0.3 0 0",
    ring: "0.556 0 0",
    chart: [
      "0.488 0.243 264.376",
      "0.696 0.17 162.48",
      "0.769 0.188 70.08",
      "0.627 0.265 303.9",
      "0.645 0.246 16.439",
    ],
  },
  radius: "lg",
  spacing: "default",
  font: {},
});

/** Softer neutral with a slate undertone. Extracted from "minimal" palette. */
defineFlavor("slate", {
  displayName: "Slate",
  colors: {
    background: "0.99 0 0",
    card: "0.99 0 0",
    popover: "0.99 0 0",
    primary: "0.3 0.02 264",
    secondary: "0.96 0.005 264",
    muted: "0.96 0.005 264",
    accent: "0.94 0.008 264",
    destructive: "0.577 0.245 27.325",
    border: "0.9 0.005 264",
    input: "0.9 0.005 264",
    ring: "0.7 0.01 264",
    chart: [
      "0.55 0.12 240",
      "0.6 0.1 180",
      "0.5 0.08 220",
      "0.65 0.09 200",
      "0.45 0.1 260",
    ],
  },
  darkColors: {
    background: "0.15 0.01 264",
    card: "0.19 0.01 264",
    popover: "0.19 0.01 264",
    primary: "0.88 0.005 264",
    secondary: "0.25 0.01 264",
    muted: "0.25 0.01 264",
    accent: "0.25 0.01 264",
    destructive: "0.704 0.191 22.216",
    border: "0.3 0.01 264",
    input: "0.3 0.01 264",
    ring: "0.5 0.01 264",
    chart: [
      "0.55 0.12 240",
      "0.6 0.1 180",
      "0.65 0.09 200",
      "0.5 0.08 220",
      "0.45 0.1 260",
    ],
  },
  radius: "sm",
  spacing: "default",
  font: {},
});

/** Dark-first. Deep backgrounds with high-contrast text. */
defineFlavor("midnight", {
  displayName: "Midnight",
  colors: {
    background: "0.985 0 0",
    card: "0.985 0 0",
    popover: "0.985 0 0",
    primary: "0.4 0.18 265",
    secondary: "0.94 0.01 265",
    muted: "0.95 0.005 265",
    accent: "0.92 0.02 265",
    destructive: "0.577 0.245 27.325",
    border: "0.88 0.01 265",
    input: "0.88 0.01 265",
    ring: "0.4 0.18 265",
    chart: [
      "0.5 0.2 265",
      "0.55 0.15 200",
      "0.45 0.18 300",
      "0.6 0.12 150",
      "0.5 0.16 40",
    ],
  },
  darkColors: {
    background: "0.13 0.02 265",
    card: "0.17 0.025 265",
    popover: "0.17 0.025 265",
    primary: "0.7 0.18 265",
    secondary: "0.24 0.03 265",
    muted: "0.22 0.02 265",
    accent: "0.26 0.04 265",
    destructive: "0.704 0.191 22.216",
    border: "0.3 0.03 265",
    input: "0.3 0.03 265",
    ring: "0.7 0.18 265",
    chart: [
      "0.65 0.2 265",
      "0.6 0.15 200",
      "0.55 0.18 300",
      "0.65 0.12 150",
      "0.6 0.16 40",
    ],
  },
  radius: "md",
  spacing: "default",
  font: {},
});

/** Vibrant purple. Extracted from "vibrant" palette. */
defineFlavor("violet", {
  displayName: "Violet",
  colors: {
    background: "1 0 0",
    card: "1 0 0",
    popover: "1 0 0",
    primary: "0.52 0.24 285",
    secondary: "0.94 0.04 285",
    muted: "0.96 0.02 285",
    accent: "0.92 0.06 285",
    destructive: "0.577 0.245 27.325",
    border: "0.88 0.04 285",
    input: "0.88 0.04 285",
    ring: "0.52 0.24 285",
    chart: [
      "0.52 0.24 285",
      "0.6 0.2 200",
      "0.55 0.22 310",
      "0.65 0.18 160",
      "0.58 0.2 40",
    ],
  },
  darkColors: {
    background: "0.13 0.03 285",
    card: "0.18 0.04 285",
    popover: "0.18 0.04 285",
    primary: "0.68 0.22 285",
    secondary: "0.25 0.06 285",
    muted: "0.24 0.05 285",
    accent: "0.28 0.08 285",
    destructive: "0.704 0.191 22.216",
    border: "0.32 0.05 285",
    input: "0.32 0.05 285",
    ring: "0.68 0.22 285",
    chart: [
      "0.68 0.22 285",
      "0.65 0.18 200",
      "0.62 0.2 310",
      "0.68 0.16 160",
      "0.65 0.18 40",
    ],
  },
  radius: "lg",
  spacing: "default",
  font: {},
});

/** Warm pink-red tones. */
defineFlavor("rose", {
  displayName: "Rose",
  colors: {
    background: "0.995 0.002 10",
    card: "0.995 0.002 10",
    popover: "0.995 0.002 10",
    primary: "0.55 0.22 350",
    secondary: "0.94 0.02 350",
    muted: "0.96 0.01 350",
    accent: "0.92 0.04 350",
    destructive: "0.577 0.245 27.325",
    border: "0.9 0.02 350",
    input: "0.9 0.02 350",
    ring: "0.55 0.22 350",
    chart: [
      "0.55 0.22 350",
      "0.6 0.18 20",
      "0.5 0.2 330",
      "0.65 0.15 10",
      "0.58 0.16 0",
    ],
  },
  darkColors: {
    background: "0.14 0.015 350",
    card: "0.18 0.02 350",
    popover: "0.18 0.02 350",
    primary: "0.7 0.2 350",
    secondary: "0.25 0.04 350",
    muted: "0.23 0.03 350",
    accent: "0.27 0.05 350",
    destructive: "0.704 0.191 22.216",
    border: "0.32 0.03 350",
    input: "0.32 0.03 350",
    ring: "0.7 0.2 350",
    chart: [
      "0.7 0.2 350",
      "0.65 0.16 20",
      "0.6 0.18 330",
      "0.68 0.14 10",
      "0.62 0.15 0",
    ],
  },
  radius: "lg",
  spacing: "default",
  font: {},
});

/** Nature-inspired greens. */
defineFlavor("emerald", {
  displayName: "Emerald",
  colors: {
    background: "0.995 0.002 150",
    card: "0.995 0.002 150",
    popover: "0.995 0.002 150",
    primary: "0.55 0.18 160",
    secondary: "0.94 0.02 160",
    muted: "0.96 0.01 160",
    accent: "0.92 0.03 160",
    destructive: "0.577 0.245 27.325",
    border: "0.9 0.02 160",
    input: "0.9 0.02 160",
    ring: "0.55 0.18 160",
    chart: [
      "0.55 0.18 160",
      "0.6 0.14 140",
      "0.5 0.16 180",
      "0.65 0.12 120",
      "0.45 0.15 170",
    ],
  },
  darkColors: {
    background: "0.14 0.015 160",
    card: "0.18 0.02 160",
    popover: "0.18 0.02 160",
    primary: "0.68 0.17 160",
    secondary: "0.25 0.04 160",
    muted: "0.23 0.03 160",
    accent: "0.27 0.05 160",
    destructive: "0.704 0.191 22.216",
    border: "0.32 0.03 160",
    input: "0.32 0.03 160",
    ring: "0.68 0.17 160",
    chart: [
      "0.68 0.17 160",
      "0.63 0.14 140",
      "0.58 0.15 180",
      "0.7 0.12 120",
      "0.55 0.14 170",
    ],
  },
  radius: "md",
  spacing: "default",
  font: {},
});

/** Deep blues with teal accents. */
defineFlavor("ocean", {
  displayName: "Ocean",
  colors: {
    background: "0.995 0.002 220",
    card: "0.995 0.002 220",
    popover: "0.995 0.002 220",
    primary: "0.5 0.18 230",
    secondary: "0.94 0.02 220",
    muted: "0.96 0.01 220",
    accent: "0.92 0.03 200",
    destructive: "0.577 0.245 27.325",
    border: "0.9 0.02 220",
    input: "0.9 0.02 220",
    ring: "0.5 0.18 230",
    chart: [
      "0.5 0.18 230",
      "0.55 0.15 200",
      "0.45 0.16 250",
      "0.6 0.12 180",
      "0.5 0.14 210",
    ],
  },
  darkColors: {
    background: "0.13 0.02 220",
    card: "0.17 0.025 220",
    popover: "0.17 0.025 220",
    primary: "0.65 0.17 230",
    secondary: "0.24 0.04 220",
    muted: "0.22 0.03 220",
    accent: "0.26 0.05 200",
    destructive: "0.704 0.191 22.216",
    border: "0.3 0.03 220",
    input: "0.3 0.03 220",
    ring: "0.65 0.17 230",
    chart: [
      "0.65 0.17 230",
      "0.6 0.14 200",
      "0.55 0.15 250",
      "0.65 0.12 180",
      "0.58 0.13 210",
    ],
  },
  radius: "md",
  spacing: "default",
  font: {},
});

/** Warm orange-amber tones. */
defineFlavor("sunset", {
  displayName: "Sunset",
  colors: {
    background: "0.995 0.003 60",
    card: "0.995 0.003 60",
    popover: "0.995 0.003 60",
    primary: "0.65 0.2 55",
    secondary: "0.94 0.02 55",
    muted: "0.96 0.01 55",
    accent: "0.92 0.04 40",
    destructive: "0.577 0.245 27.325",
    border: "0.9 0.02 55",
    input: "0.9 0.02 55",
    ring: "0.65 0.2 55",
    chart: [
      "0.65 0.2 55",
      "0.6 0.18 30",
      "0.7 0.16 70",
      "0.55 0.15 20",
      "0.68 0.14 80",
    ],
  },
  darkColors: {
    background: "0.14 0.015 55",
    card: "0.18 0.02 55",
    popover: "0.18 0.02 55",
    primary: "0.72 0.18 55",
    secondary: "0.25 0.04 55",
    muted: "0.23 0.03 55",
    accent: "0.27 0.05 40",
    destructive: "0.704 0.191 22.216",
    border: "0.32 0.03 55",
    input: "0.32 0.03 55",
    ring: "0.72 0.18 55",
    chart: [
      "0.72 0.18 55",
      "0.65 0.16 30",
      "0.75 0.14 70",
      "0.6 0.14 20",
      "0.7 0.13 80",
    ],
  },
  radius: "lg",
  spacing: "default",
  font: {},
});
