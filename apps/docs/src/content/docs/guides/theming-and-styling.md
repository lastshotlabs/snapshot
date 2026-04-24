---
title: Theming and Styling
description: Design tokens, slots, dark mode, and component customization.
draft: false
---

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";
import { ButtonBase, CardBase } from "@lastshotlabs/snapshot/ui";

const snap = createSnapshot({
  apiUrl: "/api",
  manifest: {
    theme: {
      colors: { primary: "#3b82f6", accent: "#8b5cf6" },
      radius: { default: "0.5rem" },
      fonts: { sans: "Inter" },
    },
  },
});

// Every component automatically uses the theme tokens
<ButtonBase label="Themed button" variant="default" />

// Customize individual components with slots
<CardBase
  title="Custom Card"
  slots={{
    root: { className: "shadow-lg", style: { borderRadius: "1rem" } },
    title: { style: { fontSize: "1.5rem", fontWeight: "bold" } },
  }}
>
  Content
</CardBase>
```

## Design tokens

Tokens are set in the manifest `theme` and compiled to CSS custom properties on `:root` and `.dark`.

### Colors

```tsx
manifest: {
  theme: {
    colors: {
      primary: "#3b82f6",      // --sn-color-primary
      accent: "#8b5cf6",       // --sn-color-accent
      background: "#ffffff",   // --sn-color-background
      surface: "#f8fafc",      // --sn-color-surface
      muted: "#94a3b8",        // --sn-color-muted
      border: "#e2e8f0",       // --sn-color-border
      success: "#10b981",      // --sn-color-success
      warning: "#f59e0b",      // --sn-color-warning
      error: "#ef4444",        // --sn-color-error
    },
  },
}
```

Each color automatically generates a foreground pair (`--sn-color-primary-foreground`) computed for contrast.

### Spacing

Spacing tokens are used by `gap`, `padding`, and spacing props throughout all components:

| Token | CSS Variable | Default |
|-------|-------------|---------|
| `2xs` | `--sn-spacing-2xs` | `0.25rem` |
| `xs` | `--sn-spacing-xs` | `0.5rem` |
| `sm` | `--sn-spacing-sm` | `0.75rem` |
| `md` | `--sn-spacing-md` | `1rem` |
| `lg` | `--sn-spacing-lg` | `1.5rem` |
| `xl` | `--sn-spacing-xl` | `2rem` |
| `2xl` | `--sn-spacing-2xl` | `3rem` |

### Border radius

```tsx
theme: {
  radius: {
    default: "0.5rem",  // --sn-radius-default
    sm: "0.25rem",      // --sn-radius-sm
    lg: "1rem",         // --sn-radius-lg
    full: "9999px",     // --sn-radius-full
  },
}
```

### Fonts

```tsx
theme: {
  fonts: {
    sans: "Inter",                          // --sn-font-sans
    mono: "JetBrains Mono",                 // --sn-font-mono
    display: { family: "Outfit", weights: [400, 700] }, // --sn-font-display
  },
}
```

Google Fonts are auto-loaded when recognized (Inter, Roboto, Open Sans, Poppins, Montserrat, etc.).

## Slots

Every standalone component accepts a `slots` prop for targeting sub-elements.

### Basic slot usage

```tsx
<ButtonBase
  label="Save"
  variant="default"
  slots={{
    root: { className: "my-button", style: { minWidth: "120px" } },
    label: { style: { fontWeight: "bold" } },
    icon: { style: { color: "green" } },
  }}
/>
```

### Common slot names

Most components share these patterns:

| Slot | Target |
|------|--------|
| `root` | Outermost wrapper element |
| `label` | Text label element |
| `icon` | Icon element |
| `title` | Title text |
| `subtitle` | Subtitle text |
| `content` | Main content area |
| `header` | Header region |
| `footer` | Footer region |

Each component documents its available slot names in its props interface.

### Slot merge order

When multiple style sources apply, they merge in this order (later wins):

1. Implementation base styles (component defaults)
2. Component surface config (from `surfaceConfig`)
3. Item surface config (from `slots`)
4. Active states (hover, focus, open, etc.)

### Slot className and style

Both `className` and `style` can be set on any slot:

```tsx
<DataTableBase
  columns={columns}
  rows={data}
  slots={{
    root: { className: "my-table" },
    header: { style: { backgroundColor: "#f0f0f0", fontWeight: "bold" } },
    row: { style: { borderBottom: "1px solid #e0e0e0" } },
  }}
/>
```

## Dark mode

### Toggle with useTheme

```tsx
const { theme, set, toggle } = snap.useTheme();

<ButtonBase
  label={theme === "dark" ? "Light mode" : "Dark mode"}
  icon={theme === "dark" ? "sun" : "moon"}
  variant="ghost"
  onClick={toggle}
/>
```

`useTheme` adds/removes the `.dark` class on `<html>`. All token CSS variables have dark-mode overrides that activate automatically.

### Dark-mode token overrides

Colors set in `theme.colors` automatically derive dark variants using OKLCH color space. You can also set explicit dark overrides in the manifest:

```tsx
theme: {
  colors: {
    background: "#ffffff",
    surface: "#f8fafc",
  },
  dark: {
    colors: {
      background: "#0f172a",
      surface: "#1e293b",
    },
  },
}
```

## Applying styles to components

### className and style

Every component accepts `className` and `style` on the root element:

```tsx
<CardBase
  className="dashboard-card"
  style={{ maxWidth: "400px", margin: "0 auto" }}
  title="Revenue"
>
  <StatCardBase value="$48K" label="Total" />
</CardBase>
```

### Responsive patterns

Use CSS media queries via className or inline styles:

```tsx
<GridBase
  columns="repeat(auto-fill, minmax(300px, 1fr))"
  gap="md"
  className="responsive-grid"
>
  {items.map((item) => <CardBase key={item.id} title={item.name} />)}
</GridBase>
```

## Next steps

- [Layout and Navigation](/guides/layout-and-navigation/) -- themed app shells
- [Forms and Validation](/guides/forms/) -- styled form components
- [Component Library reference](/reference/components/) -- all 113 components
