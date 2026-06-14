# Customization

Snapshot UI is customized in React and CSS. Import standalone components,
pass normal props, and use token helpers when you want Snapshot's design
variables generated from a shared theme object.

## Component Props

Standalone components are plain React components.

```tsx
import { ButtonBase, CardBase, RichInputBase } from "@lastshotlabs/snapshot/ui";

export function ReplyComposer() {
  return (
    <CardBase className="reply-card">
      <RichInputBase
        placeholder="Write a reply"
        minHeight="8rem"
        emitMarkdown
        onSend={({ markdown, text }) => {
          console.log(markdown ?? text);
        }}
      />
      <ButtonBase label="Send" icon="send" />
    </CardBase>
  );
}
```

Common styling props:

| Prop | Purpose |
| --- | --- |
| `className` | Add a class to the component root |
| `style` | Add inline root styles |
| `slots` | Target named internal pieces when the component supports slots |
| `id` | Stabilize generated surface IDs for scoped styles |

## Slots

Slots let you style sub-elements without replacing the component.

```tsx
import { ButtonBase } from "@lastshotlabs/snapshot/ui";

export function PrimaryAction() {
  return (
    <ButtonBase
      id="publish-button"
      label="Publish"
      icon="send"
      slots={{
        root: {
          className: "publish-button",
        },
        icon: {
          style: { color: "var(--sn-color-primary)" },
        },
        label: {
          className: "publish-button-label",
        },
      }}
    />
  );
}
```

Slot names are component-specific. Check the exported prop type for the
component you are using.

## Tokens

`resolveTokens()` turns a theme object into CSS custom properties used by
Snapshot UI.

```tsx
import { resolveTokens } from "@lastshotlabs/snapshot/ui";

const snapshotCss = resolveTokens({
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
  return <style>{snapshotCss}</style>;
}
```

The generated CSS includes `:root`, `.dark`, and component-level custom
properties. Components read variables such as:

- `--sn-color-background`
- `--sn-color-foreground`
- `--sn-color-primary`
- `--sn-color-primary-foreground`
- `--sn-color-border`
- `--sn-radius-md`
- `--sn-spacing-md`
- `--sn-shadow-md`

## Flavors

Use a built-in flavor or register your own in code.

```tsx
import { defineFlavor, resolveTokens } from "@lastshotlabs/snapshot/ui";

defineFlavor("brand", {
  displayName: "Brand",
  colors: {
    background: "#ffffff",
    primary: "#0f766e",
    accent: "#7c3aed",
  },
  radius: "md",
  spacing: "default",
  font: {
    sans: "Inter",
  },
});

const css = resolveTokens({ flavor: "brand" });
```

You can inspect available flavors with:

```ts
import { getAllFlavors, getFlavor } from "@lastshotlabs/snapshot/ui";

const all = getAllFlavors();
const neutral = getFlavor("neutral");
```

## Dark Mode

Snapshot generates dark color variables automatically when explicit dark
overrides are not supplied. To control dark mode yourself, provide
`overrides.darkColors`.

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

Toggle dark mode by adding or removing the `dark` class on the document root.
The runtime also exposes `snapshot.useTheme()` for light/dark state.

```tsx
function ThemeToggle() {
  const { theme, toggle } = snapshot.useTheme();

  return (
    <button onClick={toggle}>
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
```

## Tailwind

Snapshot components work with Tailwind classes through `className` and `slots`.
When you want Tailwind utilities backed by Snapshot tokens, generate a bridge:

```ts
import { generateTailwindBridge, resolveTokens } from "@lastshotlabs/snapshot/ui";

const theme = {
  flavor: "neutral",
  overrides: {
    colors: {
      primary: "#2563eb",
    },
  },
};

export const snapshotCss = resolveTokens(theme);
export const tailwindBridge = generateTailwindBridge();
```

## Focused Bundles

For heavier UI, import the focused bundle when you only need one surface.

```ts
import { RichInputBase } from "@lastshotlabs/snapshot/ui/rich-input";
import { EmojiPickerBase } from "@lastshotlabs/snapshot/ui/emoji-picker";
import { GifPickerBase } from "@lastshotlabs/snapshot/ui/gif-picker";
```

The full `@lastshotlabs/snapshot/ui` barrel is convenient for app code. Focused
subpaths are better for libraries and routes that need tight bundle boundaries.

## Composing Your Own Components

Use Snapshot primitives as building blocks and keep the app-specific behavior in
your component.

```tsx
import {
  ButtonBase,
  ConfirmDialog,
  ToastContainer,
  useConfirmManager,
  useToastManager,
} from "@lastshotlabs/snapshot/ui";

export function DangerZone() {
  const confirm = useConfirmManager();
  const toast = useToastManager();
  const deleteAccount = snapshot.useDeleteAccount();

  async function onDelete() {
    const ok = await confirm.show({
      title: "Delete account",
      message: "This cannot be undone.",
      confirmLabel: "Delete",
      variant: "destructive",
      requireInput: "DELETE",
    });

    if (!ok) return;
    await deleteAccount.mutateAsync();
    toast.show({ message: "Account deleted", variant: "success" });
  }

  return (
    <>
      <ButtonBase
        label="Delete account"
        variant="destructive"
        onClick={() => void onDelete()}
      />
      <ToastContainer />
      <ConfirmDialog />
    </>
  );
}
```

## Runtime Styling Rules

- Prefer `className` for app-level layout and spacing.
- Prefer tokens for colors, radius, font, and repeated theme decisions.
- Prefer `slots` when a nested element needs targeted styling.
- Keep one `ToastContainer` and one `ConfirmDialog` at the app shell level.
- Use focused UI subpaths for bundle-sensitive routes.
