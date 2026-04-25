# Design Token System

The token system provides flavor-based theming with runtime customization. All tokens are
emitted as CSS custom properties with the `--sn-` prefix. Components use these variables
for every visual attribute — changing a token updates every component that references it.

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

### Editor persistence target

Runtime editor persistence is configured in the manifest:

```json
{
  "theme": {
    "editor": {
      "persist": "localStorage"
    }
  }
}
```

`persist` values:

- `"none"`
- `"localStorage"` (default)
- `"sessionStorage"`
- `{ "resource": "user-prefs" }`

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

### Manifest-declared flavor extension

You can declare new flavors directly in the manifest with `theme.flavors`:

```json
{
  "theme": {
    "flavor": "my-brand",
    "flavors": {
      "my-brand": {
        "extends": "neutral",
        "displayName": "My Brand",
        "colors": {
          "primary": "0.55 0.18 25",
          "accent": "0.60 0.15 280"
        }
      }
    }
  }
}
```

Merge semantics for dark colors:

1. `darkColors[key]` override wins when provided.
2. Otherwise, `colors[key]` overrides derive dark variants automatically.
3. Otherwise, parent flavor dark values are inherited.

Circular `extends` chains are rejected at compile time.

### Code-side registration

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

Code-side `defineFlavor()` remains supported, but manifest declaration is enough to
create and activate a flavor.

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
    table: { striped: true, density: "compact", hoverRow: true, headerBackground: true, borderStyle: "horizontal" },
    button: { weight: "bold", uppercase: true, iconSize: "md" },
    input: { size: "lg", variant: "filled" },
    modal: { overlay: "blur", animation: "slide-up" },
    nav: { variant: "bordered", activeIndicator: "dot" },
    badge: { variant: "soft", rounded: true },
    toast: { position: "top-center", animation: "pop" },
  }
}
```

See [customization.md](./customization.md) for the full list of component token values.

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

---

## CSS variable names

All CSS custom properties use the `--sn-` prefix. These are the valid token names —
referencing anything else silently falls back to a hardcoded value, breaking theme switching.

**Colors** — each generates a `-foreground` companion:
`--sn-color-primary`, `--sn-color-secondary`, `--sn-color-muted`, `--sn-color-accent`,
`--sn-color-destructive`, `--sn-color-success`, `--sn-color-warning`, `--sn-color-info`,
`--sn-color-background` / `--sn-color-foreground`,
`--sn-color-card`, `--sn-color-popover`, `--sn-color-sidebar`,
`--sn-color-border`, `--sn-color-input`, `--sn-color-ring`,
`--sn-chart-1` through `--sn-chart-5`

**Aliases:** `--sn-color-surface` (= card), `--sn-color-text` (= foreground)

**Radius:** `--sn-radius-none`, `--sn-radius-xs`, `--sn-radius-sm`, `--sn-radius-md`,
`--sn-radius-lg`, `--sn-radius-xl`, `--sn-radius-full`

**Spacing:** `--sn-spacing-2xs` through `--sn-spacing-3xl`

**Font:** `--sn-font-sans`, `--sn-font-mono`, `--sn-font-display`,
`--sn-font-size-xs` through `--sn-font-size-4xl`,
`--sn-font-weight-light` through `--sn-font-weight-bold`

**Shadows:** `--sn-shadow-none` through `--sn-shadow-xl`

**Component tokens:** `--sn-card-*`, `--sn-table-*`, `--sn-button-*`, `--sn-input-*`,
`--sn-modal-*`, `--sn-nav-*`, `--sn-badge-*`, `--sn-toast-*`

---

## Common mistakes

These mistakes cause silent visual breakage — the value is accepted but doesn't respond
to theme changes or dark mode.

**Wrong token name:**

```css
/* Wrong — this variable doesn't exist */
color: var(--sn-color-danger);
/* Correct */
color: var(--sn-color-destructive);

/* Wrong */
font-size: var(--sn-font-sm);
/* Correct */
font-size: var(--sn-font-size-sm);
```

**`muted` as a text color:**

`--sn-color-muted` is a background color with very high lightness. Text set to it becomes
invisible in light mode. Use `--sn-color-muted-foreground` for secondary/dimmed text:

```css
/* Wrong — invisible text */
color: var(--sn-color-muted);
/* Correct */
color: var(--sn-color-muted-foreground);
```

**Background without foreground:**

When using a semantic color as a background, always pair it with its `-foreground` companion
to guarantee contrast in every theme:

```css
/* Wrong — text color is unspecified, may have no contrast */
background-color: var(--sn-color-primary);

/* Correct */
background-color: var(--sn-color-primary);
color: var(--sn-color-primary-foreground);
```

**`setToken()` for flavor switching:**

`useTokenEditor().setToken()` applies a single CSS property inline on `:root`. Inline styles
have higher specificity than stylesheet rules, so they override the `.dark` block and break
dark mode. For flavor changes, use `setFlavor()` or regenerate the full stylesheet:

```ts
// Wrong — breaks dark mode
const { setToken } = useTokenEditor();
setToken("colors.primary", "#6d28d9");
setToken("colors.background", "#1a1a2e");

// Correct — for flavor switching
const { setFlavor } = useTokenEditor();
setFlavor("midnight");

// Correct — for full theme switch (e.g. brand override)
const css = resolveTokens({ flavor: "neutral", overrides: { colors: { primary: "#6d28d9" } } });
injectStyleSheet("my-app-tokens", css);
```

**Hardcoded font sizes:**

```tsx
// Wrong — bypasses the font size token, doesn't respond to the font scale control
<span style={{ fontSize: "0.875rem" }}>label</span>

// Correct — responds to token overrides
<span style={{ fontSize: "var(--sn-font-size-sm, 0.875rem)" }}>label</span>
```

---

## Dark mode

Dark mode is handled automatically. `resolveTokens()` emits both `:root { ... }` (light)
and `.dark { ... }` (dark) blocks. The `useTheme()` hook toggles the `.dark` class on
`<html>`.

To force dark mode at startup:

```ts
const css = resolveTokens({ flavor: "midnight", mode: "dark" });
injectStyleSheet("my-app-tokens", css);
```

The `:root` block includes `color-scheme: light` and `.dark` includes `color-scheme: dark`.
This ensures native browser elements (scrollbars, form controls, date pickers) match the
current theme.

When a user overrides a color in light mode (via `useTokenEditor`), the dark variant
auto-derives from the override — you don't need to set both.
