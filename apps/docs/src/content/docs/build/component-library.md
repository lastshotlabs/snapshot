---
title: Component Library
description: Use Snapshot's standalone components as a plain React component library.
draft: false
---

Snapshot UI components are standalone React components with typed props.

## Import Paths

```tsx
import {
  ButtonBase,
  CardBase,
  DataTableBase,
  ModalBase,
  NavBase,
  RichInputBase,
} from "@lastshotlabs/snapshot/ui";
```

Focused bundles:

```ts
import { RichInputBase } from "@lastshotlabs/snapshot/ui/rich-input";
import { EmojiPickerBase } from "@lastshotlabs/snapshot/ui/emoji-picker";
import { GifPickerBase } from "@lastshotlabs/snapshot/ui/gif-picker";
```

## Basic Pattern

```tsx
import { ButtonBase, CardBase } from "@lastshotlabs/snapshot/ui";

export function SettingsCard() {
  return (
    <CardBase title="Settings">
      <ButtonBase
        label="Save"
        icon="check"
        onClick={() => {
          void saveSettings();
        }}
      />
    </CardBase>
  );
}
```

## Styling

Most components accept `className`, `style`, and `slots`.

```tsx
<ButtonBase
  id="publish"
  label="Publish"
  icon="send"
  slots={{
    icon: { style: { color: "var(--sn-color-primary)" } },
    label: { className: "publish-label" },
  }}
/>
```

## Component Families

- Forms: inputs, selects, textareas, buttons, switches, sliders, wizards.
- Data: tables, lists, charts, badges, avatars, progress, empty states.
- Layout: cards, grids, rows, columns, containers, nav, split panes.
- Overlay: modal, drawer, popover, context menu, command palette.
- Content: markdown, rich text, rich input, code blocks, timelines.
- Communication: chat, comments, message threads, reactions, presence.
- Media: image, video, carousel, embed, file uploader.
- Workflow: kanban, calendar, audit log, notification feed.

## Next

- [Theming and Styling](/guides/theming-and-styling/)
- [Quick Start](/start-here/)
- [Component Catalog](/reference/components/)
- [UI Reference](/reference/ui/)
