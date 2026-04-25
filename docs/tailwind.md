# Tailwind Integration

Snapshot scaffolded apps use Tailwind v4. This doc explains how Tailwind, the scaffold's
theme, and the Snapshot `--sn-*` token system relate — and how to use all three together.

---

## Two theming systems

Snapshot has two separate theming systems that serve different parts of your app.

### 1. Scaffold theme (your custom React code)

The scaffold generates `src/styles/globals.css` with a Tailwind v4 setup. This is the
theme for the code you write: your page components, custom layouts, shadcn components.

It uses **unprefixed CSS variables** (`--primary`, `--background`, `--card`, etc.) and
bridges them into Tailwind utilities via the `@theme` block:

```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ... */
}

@layer base {
  :root {
    --primary: oklch(0.205 0 0);
    --background: oklch(1 0 0);
    /* ... */
  }
  .dark {
    --primary: oklch(0.922 0 0);
    --background: oklch(0.145 0 0);
    /* ... */
  }
}
```

This means Tailwind utilities like `bg-primary`, `text-foreground`, `bg-card` all work
and automatically switch between light and dark values when the `.dark` class is applied.

### 2. Snapshot `--sn-*` token system (config-driven components)

Config-driven components (`data-table`, `stat-card`, `form`, etc.) use a separate
`--sn-*` token system documented in [tokens.md](./tokens.md). These tokens are generated
by `resolveTokens()` and injected as a `<style>` block.

**The two systems are independent.** Config-driven components read `--sn-color-primary`,
not `--primary`. Your custom React code reads `--primary` and gets Tailwind utilities.

---

## Using Tailwind utilities in custom code

Once scaffolded, Tailwind utilities work exactly as expected:

```tsx
// Using theme colors as utilities
<div className="bg-background text-foreground">
  <h1 className="text-primary font-semibold">Title</h1>
  <p className="text-muted-foreground text-sm">Subtitle</p>
  <div className="bg-card border border-border rounded-lg p-4">
    Card content
  </div>
</div>
```

All the semantic color names from the scaffold theme are available as Tailwind utilities:

| Utility prefix | CSS variable | Use for |
|----------------|-------------|---------|
| `bg-background` / `text-background` | `--background` | Page background |
| `bg-foreground` / `text-foreground` | `--foreground` | Primary text |
| `bg-card` / `text-card-foreground` | `--card` | Card surfaces |
| `bg-primary` / `text-primary-foreground` | `--primary` | Primary actions |
| `bg-secondary` / `text-secondary-foreground` | `--secondary` | Secondary surfaces |
| `bg-muted` / `text-muted-foreground` | `--muted` | Muted text, subtle backgrounds |
| `bg-accent` / `text-accent-foreground` | `--accent` | Hover states |
| `bg-destructive` / `text-destructive` | `--destructive` | Error states |
| `border-border` | `--border` | Default borders |
| `ring-ring` | `--ring` | Focus rings |

### Border radius

The scaffold theme provides a single `--radius` variable that shadcn components and the
`rounded-*` utilities share:

```css
/* In @theme */
--radius: var(--radius); /* theme-level: becomes --radius utility */
```

Use `rounded-[var(--radius)]` or the standard Tailwind `rounded-lg`, `rounded-md`, etc.
for custom components — both work.

---

## Dark mode

The scaffold uses a class-based dark mode strategy. The `RootLayout` component applies
`.dark` to `<html>` when the user switches themes.

```tsx
// Tailwind dark: variant works with the .dark class
<div className="bg-white dark:bg-gray-900">
  ...
</div>

// Semantic utilities switch automatically — no dark: prefix needed:
<div className="bg-background text-foreground">
  ...
</div>
```

Prefer semantic utilities (`bg-background`) over explicit dark mode variants (`dark:bg-gray-900`)
wherever possible — the semantic variants automatically follow the theme's light/dark colors.

To programmatically toggle dark mode, use `useTheme()` from `@lib/snapshot`:

```tsx
import { useTheme } from "@lib/snapshot";

function DarkModeToggle() {
  const { isDark, toggle } = useTheme();
  return <button onClick={toggle}>{isDark ? "Light" : "Dark"}</button>;
}
```

---

## Changing the scaffold theme

The scaffold theme is chosen at `snapshot init` time (`default`, `dark`, `minimal`,
`vibrant`). After scaffolding, `src/styles/globals.css` is yours to edit freely.

To change the color palette, edit the CSS variables in `globals.css`:

```css
@layer base {
  :root {
    --primary: oklch(0.52 0.24 285);          /* violet */
    --primary-foreground: oklch(0.98 0 0);
    /* ... other colors */
  }
  .dark {
    --primary: oklch(0.68 0.22 285);
    /* ... */
  }
}
```

All Tailwind utilities that reference `--color-primary` (i.e., `bg-primary`, `text-primary`,
etc.) pick up the change immediately.

For a new shadcn theme, the [shadcn theme generator](https://ui.shadcn.com/themes) outputs
CSS variable blocks in this format — paste them into the `:root` and `.dark` blocks in
`globals.css`.

---

## Using `--sn-*` tokens in Tailwind utilities

Config-driven components own their own visual appearance via `--sn-*` tokens. You
generally don't need to reference them in your custom code. But if you're building a
custom component that should visually match config-driven ones, you can reference the
tokens directly:

```tsx
// Match a stat-card's surface color in custom code
<div style={{ backgroundColor: "var(--sn-color-card)" }}>
  ...
</div>
```

If you want Tailwind utility access to `--sn-*` tokens, add them to the `@theme` block
in `globals.css`:

```css
@theme {
  /* Existing scaffold theme ... */

  /* Add sn-* tokens as Tailwind utilities */
  --color-sn-primary: var(--sn-color-primary);
  --color-sn-muted: var(--sn-color-muted);
  --spacing-sn-md: var(--sn-spacing-md);
  --radius-sn-lg: var(--sn-radius-lg);
}
```

Then use them as utilities:

```tsx
<div className="bg-sn-primary text-white p-[--spacing-sn-md] rounded-[--radius-sn-lg]">
  ...
</div>
```

This is only needed if you're building custom components that sit alongside config-driven
ones and must visually match them. For most custom code, the scaffold theme variables
(`--primary`, `--background`, etc.) are sufficient.

---

## Keeping the two themes in sync

The scaffold theme (`--primary`) and the Snapshot token system (`--sn-color-primary`)
have independent default values. If your app uses both config-driven and custom React
components, you may want them to share the same primary color.

Two options:

**Option A: Set both independently**

Edit `globals.css` to set the scaffold theme, and pass `overrides` to `resolveTokens()`
(or use `useTokenEditor().setFlavor()`) for the Snapshot flavor. They just happen to have
the same visual value.

**Option B: Drive `--sn-*` from the scaffold variables**

Generate the Snapshot CSS with custom overrides that reference the scaffold vars. In
`src/main.tsx` or `src/lib/snapshot.ts`, after the scaffold CSS is applied:

```ts
import { resolveTokens } from "@lastshotlabs/snapshot/ui";

// Read the current --primary value and pass it as an override
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue("--primary").trim();

const snCss = resolveTokens({
  flavor: "neutral",
  overrides: { colors: { primary: primaryColor } },
});

const style = document.createElement("style");
style.textContent = snCss;
document.head.appendChild(style);
```

This is only needed for tight visual consistency between custom and config-driven
components. For most apps, the two systems co-exist without explicit syncing.

---

## shadcn components

The scaffold installs shadcn components into `src/components/ui/`. These use the same
unprefixed CSS variables (`--primary`, `--background`, etc.) as the `@theme` block, so
they automatically match the scaffold theme.

shadcn components are regular React components — use them in your custom pages alongside
config-driven Snapshot components:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function MyPage() {
  return (
    <Card>
      <CardContent>
        <Button variant="default">Primary button</Button>
        <Button variant="destructive">Delete</Button>
      </CardContent>
    </Card>
  );
}
```

Add more shadcn components at any time:

```sh
bunx shadcn@latest add table popover tooltip
```

---

## Adding custom Tailwind utilities

Tailwind v4 uses CSS-native configuration — you add utilities directly in `globals.css`:

```css
@theme {
  /* Custom spacing */
  --spacing-18: 4.5rem;
  --spacing-22: 5.5rem;

  /* Custom colors */
  --color-brand: oklch(0.6 0.2 240);
  --color-brand-foreground: oklch(0.98 0 0);
}
```

These become standard Tailwind utilities: `p-18`, `mt-22`, `bg-brand`, `text-brand-foreground`.

For component-level design tokens that should respond to flavor switching, add them to
the Snapshot token system via `defineFlavor()` instead — see [customization.md](./customization.md).
