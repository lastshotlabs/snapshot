# Design Tokens

Snapshot UI uses CSS custom properties with the `--sn-` prefix. Generate those
variables from a theme object with `resolveTokens()` and inject the CSS once near
the root of your app.

## Quick Start

```tsx
import { resolveTokens } from "@lastshotlabs/snapshot/ui";

const css = resolveTokens({
  flavor: "neutral",
  overrides: {
    colors: {
      background: "#ffffff",
      primary: "#2563eb",
      accent: "#14b8a6",
      destructive: "#dc2626",
    },
    radius: "md",
    spacing: "default",
    font: {
      sans: "Inter",
    },
  },
});

export function SnapshotStyles() {
  return <style>{css}</style>;
}
```

## Common Variables

- `--sn-color-background`
- `--sn-color-foreground`
- `--sn-color-card`
- `--sn-color-primary`
- `--sn-color-primary-foreground`
- `--sn-color-border`
- `--sn-radius-md`
- `--sn-spacing-md`
- `--sn-shadow-md`

## Built-In Flavors

| Flavor | Description |
| --- | --- |
| `neutral` | Clean professional default |
| `slate` | Soft neutral palette |
| `midnight` | Dark-first palette |
| `violet` | Saturated violet palette |
| `rose` | Warm red/pink palette |
| `emerald` | Green palette |
| `ocean` | Blue/teal palette |
| `sunset` | Orange/amber palette |

## Code-Registered Flavors

```ts
import { defineFlavor, resolveTokens } from "@lastshotlabs/snapshot/ui";

defineFlavor("brand", {
  displayName: "Brand",
  colors: {
    background: "#ffffff",
    primary: "#0f766e",
    accent: "#7c3aed",
  },
  darkColors: {
    background: "#0b1020",
    primary: "#2dd4bf",
    accent: "#a78bfa",
  },
  radius: "md",
  spacing: "default",
  font: {
    sans: "Inter",
    mono: "JetBrains Mono",
  },
});

const css = resolveTokens({ flavor: "brand" });
```

## Runtime Editing

`useTokenEditor()` gives you a small state manager for token overrides.

```tsx
import { useTokenEditor } from "@lastshotlabs/snapshot/ui";

function ThemeEditor() {
  const { setToken, setFlavor, resetTokens, getTokens } = useTokenEditor();

  return (
    <>
      <button onClick={() => setToken("colors.primary", "#e11d48")}>
        Pink primary
      </button>
      <button onClick={() => setFlavor("ocean")}>Ocean</button>
      <button onClick={resetTokens}>Reset</button>
      <pre>{JSON.stringify(getTokens(), null, 2)}</pre>
    </>
  );
}
```

Persist editor output in your app state, local storage, or account preferences
as needed.

## Dark Mode

If `overrides.darkColors` is not provided, Snapshot derives dark color variables
from the light palette and the selected flavor.

```ts
const css = resolveTokens({
  flavor: "neutral",
  overrides: {
    colors: {
      background: "#ffffff",
      primary: "#2563eb",
    },
    darkColors: {
      background: "#0b1020",
      primary: "#60a5fa",
    },
  },
});
```

Apply the `dark` class to the document root to use dark variables.

## Tailwind Bridge

```ts
import { generateTailwindBridge, resolveTokens } from "@lastshotlabs/snapshot/ui";

export const snapshotCss = resolveTokens({ flavor: "neutral" });
export const tailwindBridge = generateTailwindBridge();
```

The bridge maps Snapshot variables into Tailwind v4 `@theme` variables so you
can use utilities such as `bg-primary` and `text-foreground` against the
Snapshot token values.
