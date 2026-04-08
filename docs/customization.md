# Customization

This guide covers how to customize the appearance and behavior of the config-driven UI
layer: flavors, token overrides, component tokens, runtime editing, custom components,
and responsive values.

## Flavors

A flavor is a named theme preset that provides a complete set of design tokens: colors
(light and dark), border radius, spacing density, and font configuration.

### Built-in Flavors

| Flavor     | Description                   | Radius | Spacing   |
| ---------- | ----------------------------- | ------ | --------- |
| `neutral`  | Clean, professional (default) | `lg`   | `default` |
| `slate`    | Softer neutral, slate tones   | `sm`   | `default` |
| `midnight` | Dark-first, deep backgrounds  | `md`   | `default` |
| `violet`   | Vibrant purple                | `lg`   | `default` |
| `rose`     | Warm pink-red tones           | `lg`   | `default` |
| `emerald`  | Nature-inspired greens        | `md`   | `default` |
| `ocean`    | Deep blues with teal accents  | `md`   | `default` |
| `sunset`   | Warm orange-amber tones       | `lg`   | `default` |

Set a flavor in the manifest:

```json
{
  "theme": {
    "flavor": "midnight"
  }
}
```

### Custom Flavors

Define your own flavor with `defineFlavor()`. Register it before calling `resolveTokens()`
or rendering `ManifestApp`.

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
    border: "#e2e8f0",
    input: "#e2e8f0",
    ring: "#1d4ed8",
  },
  darkColors: {
    primary: "#3b82f6",
    secondary: "#94a3b8",
    accent: "#fbbf24",
    background: "#0c0a09",
    destructive: "#ef4444",
    border: "#334155",
    input: "#334155",
    ring: "#3b82f6",
  },
  radius: "md",
  spacing: "default",
  font: {
    sans: "DM Sans",
    mono: "JetBrains Mono",
  },
});

// Use in manifest
const css = resolveTokens({ flavor: "my-brand" });
```

If `darkColors` is omitted, dark mode variants are automatically derived from the light
colors with adjusted lightness and chroma.

Color values can be specified as:

- Hex: `"#1d4ed8"`
- OKLCH string: `"0.488 0.243 264.376"`
- OKLCH CSS function: `"oklch(0.488 0.243 264.376)"`

## Token System

### Color Tokens

Semantic colors that generate CSS custom properties:

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
| `card`        | `--card`, `--card-foreground`               | Card surfaces      |
| `popover`     | `--popover`, `--popover-foreground`         | Popover surfaces   |
| `sidebar`     | `--sidebar`, `--sidebar-foreground`         | Sidebar surfaces   |
| `border`      | `--border`                                  | Border color       |
| `input`       | `--input`                                   | Input border color |
| `ring`        | `--ring`                                    | Focus ring color   |
| `chart`       | `--chart-1` through `--chart-5`             | Chart palette      |

Foreground colors are automatically derived to pass WCAG AA contrast (4.5:1 ratio).

### Radius Scale

| Value  | CSS Output |
| ------ | ---------- |
| `none` | `0`        |
| `xs`   | `0.125rem` |
| `sm`   | `0.25rem`  |
| `md`   | `0.5rem`   |
| `lg`   | `0.75rem`  |
| `xl`   | `1rem`     |
| `full` | `9999px`   |

### Spacing Scale

Controls global padding, gaps, and margins via a multiplier.

| Value         | Multiplier |
| ------------- | ---------- |
| `compact`     | `0.75`     |
| `default`     | `1`        |
| `comfortable` | `1.25`     |
| `spacious`    | `1.5`      |

### Font Configuration

| Field      | Type     | Description                 |
| ---------- | -------- | --------------------------- |
| `sans`     | `string` | Sans-serif font family      |
| `mono`     | `string` | Monospace font family       |
| `display`  | `string` | Display/heading font family |
| `baseSize` | `number` | Base font size in pixels    |
| `scale`    | `number` | Type scale multiplier       |

## Theme Overrides

Override specific tokens on top of a flavor. Overrides only replace what they specify;
everything else cascades from the flavor.

```json
{
  "theme": {
    "flavor": "violet",
    "overrides": {
      "colors": {
        "primary": "#e11d48"
      },
      "radius": "lg",
      "spacing": "comfortable",
      "font": {
        "sans": "Inter",
        "baseSize": 16
      }
    },
    "mode": "system"
  }
}
```

The `mode` field controls the initial color scheme: `"light"`, `"dark"`, or `"system"`
(follows OS preference).

## resolveTokens()

Generates a complete CSS string from a theme configuration. The output contains `:root`
(light mode) and `.dark` blocks with all CSS custom properties.

```ts
import { resolveTokens } from "@lastshotlabs/snapshot/ui";

const css = resolveTokens({
  flavor: "midnight",
  overrides: {
    radius: "lg",
    spacing: "comfortable",
  },
});

// Write to a file during build
fs.writeFileSync("src/theme.css", css);

// Or inject at runtime
const style = document.createElement("style");
style.textContent = css;
document.head.appendChild(style);
```

Resolution order:

1. Flavor defaults (base tokens from the named flavor)
2. Config overrides (`overrides` in the theme config)
3. Runtime `setToken()` calls (inline styles, see below)

## useTokenEditor()

Runtime hook for live theme editing. Changes are applied instantly via CSS custom
properties on the document root. Useful for theme editors, user preferences, and
whitelabel customization.

```tsx
import { useTokenEditor } from "@lastshotlabs/snapshot/ui";

function ThemeEditor() {
  const {
    setToken,
    setFlavor,
    resetTokens,
    getTokens,
    currentFlavor,
    subscribe,
  } = useTokenEditor();

  // Change individual tokens
  setToken("colors.primary", "#e11d48");
  setToken("radius", "full");
  setToken("spacing", "compact");

  // Switch entire flavor (resets all overrides)
  setFlavor("midnight");

  // Get current overrides for persistence
  const overrides = getTokens();
  localStorage.setItem("theme-overrides", JSON.stringify(overrides));

  // Get active flavor name
  const name = currentFlavor(); // "midnight"

  // Subscribe to changes
  const unsubscribe = subscribe((overrides) => {
    console.log("Theme changed:", overrides);
  });

  // Reset all runtime overrides
  resetTokens();
}
```

## Component Tokens

Per-component styling knobs applied via `[data-snapshot-component]` CSS selectors. Set
them in the theme config under `overrides.components`.

```json
{
  "theme": {
    "flavor": "neutral",
    "overrides": {
      "components": {
        "card": {
          "shadow": "md",
          "padding": "comfortable",
          "border": true
        },
        "table": {
          "striped": true,
          "density": "compact",
          "hoverRow": true,
          "headerBackground": true,
          "borderStyle": "horizontal"
        },
        "button": {
          "weight": "bold",
          "uppercase": true,
          "iconSize": "md"
        },
        "input": {
          "size": "lg",
          "variant": "filled"
        },
        "modal": {
          "overlay": "blur",
          "animation": "slide-up"
        },
        "nav": {
          "variant": "bordered",
          "activeIndicator": "border-left"
        },
        "badge": {
          "variant": "soft",
          "rounded": true
        },
        "toast": {
          "position": "top-center",
          "animation": "pop"
        }
      }
    }
  }
}
```

### Card tokens

| Token     | Type      | Values                                                  | Description      |
| --------- | --------- | ------------------------------------------------------- | ---------------- |
| `shadow`  | `string`  | `"none"`, `"sm"`, `"md"`, `"lg"`, `"xl"`                | Shadow depth     |
| `padding` | `string`  | `"compact"`, `"default"`, `"comfortable"`, `"spacious"` | Internal padding |
| `border`  | `boolean` | --                                                      | Show border      |

### Table tokens

| Token              | Type      | Values                                    | Description            |
| ------------------ | --------- | ----------------------------------------- | ---------------------- |
| `striped`          | `boolean` | --                                        | Alternate row striping |
| `density`          | `string`  | `"compact"`, `"default"`, `"comfortable"` | Row padding            |
| `hoverRow`         | `boolean` | --                                        | Highlight row on hover |
| `headerBackground` | `boolean` | --                                        | Show header background |
| `borderStyle`      | `string`  | `"none"`, `"horizontal"`, `"grid"`        | Cell border style      |

### Button tokens

| Token       | Type      | Values                          | Description              |
| ----------- | --------- | ------------------------------- | ------------------------ |
| `weight`    | `string`  | `"light"`, `"medium"`, `"bold"` | Font weight              |
| `uppercase` | `boolean` | --                              | Uppercase text transform |
| `iconSize`  | `string`  | `"sm"`, `"md"`, `"lg"`          | Icon dimensions          |

### Input tokens

| Token     | Type     | Values                                 | Description  |
| --------- | -------- | -------------------------------------- | ------------ |
| `size`    | `string` | `"sm"`, `"md"`, `"lg"`                 | Input height |
| `variant` | `string` | `"outline"`, `"filled"`, `"underline"` | Input style  |

### Modal tokens

| Token       | Type     | Values                                      | Description    |
| ----------- | -------- | ------------------------------------------- | -------------- |
| `overlay`   | `string` | `"light"`, `"dark"`, `"blur"`               | Overlay style  |
| `animation` | `string` | `"fade"`, `"scale"`, `"slide-up"`, `"none"` | Open animation |

### Nav tokens

| Token             | Type     | Values                                                      | Description           |
| ----------------- | -------- | ----------------------------------------------------------- | --------------------- |
| `variant`         | `string` | `"minimal"`, `"bordered"`, `"filled"`                       | Nav style             |
| `activeIndicator` | `string` | `"background"`, `"border-left"`, `"border-bottom"`, `"dot"` | Active item indicator |

### Badge tokens

| Token     | Type      | Values                           | Description        |
| --------- | --------- | -------------------------------- | ------------------ |
| `variant` | `string`  | `"solid"`, `"outline"`, `"soft"` | Badge style        |
| `rounded` | `boolean` | --                               | Full border radius |

### Toast tokens

| Token       | Type     | Values                                                             | Description        |
| ----------- | -------- | ------------------------------------------------------------------ | ------------------ |
| `position`  | `string` | `"top-right"`, `"top-center"`, `"bottom-right"`, `"bottom-center"` | Screen position    |
| `animation` | `string` | `"slide"`, `"pop"`, `"fade"`                                       | Entrance animation |

## Component Overrides (registerComponent)

Replace the rendering of any built-in component type while keeping the same config
contract. The framework still validates the config against the schema, manages data
fetching, and wires up the context system.

```tsx
import { registerComponent } from "@lastshotlabs/snapshot/ui";
import type { StatCardConfig } from "@lastshotlabs/snapshot/ui";

registerComponent("stat-card", function MyStatCard({ config }) {
  const typedConfig = config as unknown as StatCardConfig;
  return (
    <div className="my-custom-stat-card">
      <span>{typedConfig.label}</span>
      <strong>{typedConfig.field}</strong>
    </div>
  );
});
```

The manifest stays unchanged. Only the rendering changes. A dev warning is emitted when
overriding an existing registration.

## Custom Components (Escape Hatch)

For components that have no config-driven equivalent, use the `custom` type to reference
a React component by name:

```tsx
// Register your component
import { registerComponent } from "@lastshotlabs/snapshot/ui";

function MyChart({ config }: { config: Record<string, unknown> }) {
  return <canvas data-chart-type={config.chartType as string} />;
}

registerComponent("MyChart", MyChart);
```

Reference in the manifest:

```json
{
  "type": "custom",
  "component": "MyChart",
  "props": {
    "chartType": "bar",
    "height": 300
  }
}
```

The `props` object is merged into the config and forwarded to your component. Custom
components can use `useSubscribe`, `usePublish`, `useActionExecutor`, and all other
context hooks.

## Responsive Values

Many config fields accept responsive breakpoint maps in addition to flat values.

Flat value (applies at all sizes):

```json
{ "span": 6 }
```

Responsive value (per breakpoint):

```json
{
  "span": { "default": 12, "md": 6, "lg": 4 }
}
```

Breakpoints follow standard Tailwind sizes:

| Breakpoint | Min width     |
| ---------- | ------------- |
| `default`  | 0 (all sizes) |
| `sm`       | 640px         |
| `md`       | 768px         |
| `lg`       | 1024px        |
| `xl`       | 1280px        |
| `2xl`      | 1536px        |

Fields that support responsive values: `span`, `gap`, `visible`.

## Dark Mode

Dark mode is controlled by the `theme.mode` setting:

| Value    | Behavior                       |
| -------- | ------------------------------ |
| `light`  | Always light mode              |
| `dark`   | Always dark mode               |
| `system` | Follow OS preference (default) |

The token system generates `:root { ... }` (light) and `.dark { ... }` blocks. The
`useTheme()` hook toggles the `dark` class on `<html>`. All semantic tokens have both
light and dark variants; switching modes is a class toggle, not a re-render.

```json
{
  "theme": {
    "flavor": "midnight",
    "mode": "system"
  }
}
```
