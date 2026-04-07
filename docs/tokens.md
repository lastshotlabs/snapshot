# Design Token System

The token system provides flavor-based theming with runtime customization. It replaces
hardcoded CSS palettes with a configurable, extensible design token layer that integrates
with shadcn's CSS variable system.

## Quick Start

```ts
import {
  resolveTokens,
  useTokenEditor,
  defineFlavor,
  getAllFlavors,
  themeConfigSchema,
} from "@lastshotlabs/snapshot/ui";
```

### Generate CSS from a flavor

```ts
// Use a built-in flavor
const css = resolveTokens({ flavor: "midnight" });

// Use a flavor with overrides
const css = resolveTokens({
  flavor: "violet",
  overrides: {
    colors: { primary: "#8b5cf6" },
    radius: "lg",
    spacing: "comfortable",
  },
});

// Write to a CSS file or inject into a <style> tag
```

### Runtime editing

```ts
function ThemeEditor() {
  const { setToken, setFlavor, resetTokens, getTokens, subscribe } =
    useTokenEditor();

  // Change individual tokens — instant visual update
  setToken("colors.primary", "#e11d48");
  setToken("radius", "full");

  // Switch entire flavor
  setFlavor("midnight");

  // Get current state for persistence
  const overrides = getTokens();

  // Reset all runtime overrides
  resetTokens();
}
```

## Built-in Flavors

| Flavor     | Description                   | Primary     | Default Radius |
| ---------- | ----------------------------- | ----------- | -------------- |
| `neutral`  | Clean, professional (default) | Gray scale  | `lg`           |
| `slate`    | Softer neutral, slate tones   | Slate       | `sm`           |
| `midnight` | Dark-first, deep backgrounds  | Blue-violet | `md`           |
| `violet`   | Vibrant purple                | Violet      | `lg`           |
| `rose`     | Warm pink-red tones           | Rose        | `lg`           |
| `emerald`  | Nature-inspired greens        | Emerald     | `md`           |
| `ocean`    | Deep blues with teal accents  | Cyan-blue   | `md`           |
| `sunset`   | Warm orange-amber tones       | Orange      | `lg`           |

Each flavor includes light and dark mode colors, a default border radius, spacing density,
and font configuration.

## Custom Flavors

```ts
import { defineFlavor, resolveTokens } from "@lastshotlabs/snapshot/ui";

defineFlavor("my-brand", {
  displayName: "My Brand",
  colors: {
    primary: "#1d4ed8",
    secondary: "#64748b",
    accent: "#f59e0b",
    background: "#fafaf9",
    destructive: "#dc2626",
  },
  darkColors: {
    primary: "#3b82f6",
    secondary: "#94a3b8",
    accent: "#fbbf24",
    background: "#0c0a09",
    destructive: "#ef4444",
  },
  radius: "md",
  spacing: "default",
  font: { sans: "DM Sans", mono: "JetBrains Mono" },
});

// Now usable in config
const css = resolveTokens({ flavor: "my-brand" });
```

If `darkColors` is omitted, dark mode variants are automatically derived from the light
colors with adjusted lightness and chroma.

## Theme Config Schema

The theme configuration is validated by `themeConfigSchema` (Zod):

```ts
{
  flavor?: string,          // Flavor name (default: "neutral")
  overrides?: {
    colors?: ThemeColors,    // Light mode color overrides
    darkColors?: ThemeColors, // Dark mode color overrides
    radius?: RadiusScale,    // "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full"
    spacing?: SpacingScale,  // "compact" | "default" | "comfortable" | "spacious"
    font?: FontConfig,       // { sans?, mono?, display?, baseSize?, scale? }
    components?: ComponentTokens, // Per-component styling knobs
  },
  mode?: "light" | "dark" | "system",
}
```

## Color Tokens

Semantic color tokens that generate CSS custom properties:

| Token         | CSS Variables                               | Purpose            |
| ------------- | ------------------------------------------- | ------------------ |
| `primary`     | `--primary`, `--primary-foreground`         | Brand color        |
| `secondary`   | `--secondary`, `--secondary-foreground`     | Secondary color    |
| `muted`       | `--muted`, `--muted-foreground`             | Subtle backgrounds |
| `accent`      | `--accent`, `--accent-foreground`           | Highlight color    |
| `destructive` | `--destructive`, `--destructive-foreground` | Danger/error       |
| `success`     | `--success`, `--success-foreground`         | Success state      |
| `warning`     | `--warning`, `--warning-foreground`         | Warning state      |
| `info`        | `--info`, `--info-foreground`               | Info state         |
| `background`  | `--background`, `--foreground`              | Page background    |
| `card`        | `--card`, `--card-foreground`               | Card background    |
| `popover`     | `--popover`, `--popover-foreground`         | Popover background |
| `sidebar`     | `--sidebar`, `--sidebar-foreground`         | Sidebar background |
| `border`      | `--border`                                  | Border color       |
| `input`       | `--input`                                   | Input border color |
| `ring`        | `--ring`                                    | Focus ring color   |
| `chart`       | `--chart-1` through `--chart-5`             | Chart palette      |

Foreground colors are automatically derived to pass WCAG AA contrast (4.5:1).

All colors are internally stored in oklch format. Input colors can be hex (`#ff0000`),
oklch strings (`0.637 0.237 25`), or oklch CSS functions (`oklch(0.637 0.237 25)`).

## Radius Scale

| Value  | CSS Output |
| ------ | ---------- |
| `none` | `0`        |
| `xs`   | `0.125rem` |
| `sm`   | `0.25rem`  |
| `md`   | `0.5rem`   |
| `lg`   | `0.75rem`  |
| `xl`   | `1rem`     |
| `full` | `9999px`   |

## Spacing Scale

| Value         | Multiplier |
| ------------- | ---------- |
| `compact`     | `0.75`     |
| `default`     | `1`        |
| `comfortable` | `1.25`     |
| `spacious`    | `1.5`      |

## Component Tokens

Per-component styling knobs, scoped via `[data-snapshot-component]` selectors:

```ts
{
  components: {
    card: { shadow: "md", padding: "comfortable", border: true },
    table: { striped: true, density: "compact", hoverRow: true },
    button: { weight: "bold", uppercase: true },
    input: { size: "lg", variant: "filled" },
    modal: { overlay: "blur", animation: "slide-up" },
    nav: { variant: "bordered", activeIndicator: "dot" },
    badge: { variant: "soft", rounded: true },
    toast: { position: "top-center", animation: "pop" },
  }
}
```

## Resolution Order

1. **Flavor defaults** — base tokens from the named flavor
2. **Config overrides** — `overrides` in the theme config
3. **Runtime `setToken()`** — inline styles applied by `useTokenEditor()`

Each layer only overrides what it specifies. Omitted tokens cascade from the previous layer.

## Integration with `useTheme()`

The existing `useTheme()` hook handles light/dark class toggle on `<html>`. The token
system generates `:root { ... }` and `.dark { ... }` blocks. The class toggle picks which
set of variables is active. No changes to `useTheme()` are needed.

## Color Utilities

Low-level color conversion functions are also exported:

```ts
import {
  hexToOklch,
  hslToOklch,
  oklchToString,
  oklchToHex,
  deriveForeground,
  deriveDarkVariant,
  colorToOklch,
  parseOklchString,
} from "@lastshotlabs/snapshot/ui";
```
