# Components

Snapshot UI exports standalone React components from focused
`@lastshotlabs/snapshot/ui/<name>` subpaths. They are regular components with
typed props, event handlers, `className`, `style`, and component-specific slot
overrides.

## Imports

```tsx
import { ButtonBase } from "@lastshotlabs/snapshot/ui/button";
import { CardBase } from "@lastshotlabs/snapshot/ui/card";
import { DataTableBase } from "@lastshotlabs/snapshot/ui/data-table";
import { ModalBase } from "@lastshotlabs/snapshot/ui/modal";
import { NavBase } from "@lastshotlabs/snapshot/ui/nav";
import { RichInputBase } from "@lastshotlabs/snapshot/ui/rich-input";
```

The compatibility `@lastshotlabs/snapshot/ui` barrel re-exports the whole
catalog and requires every optional UI peer. Prefer subpaths for normal use.

## Basic Usage

```tsx
import { ButtonBase } from "@lastshotlabs/snapshot/ui/button";
import { CardBase } from "@lastshotlabs/snapshot/ui/card";

export function SettingsCard() {
  return (
    <CardBase title="Settings" subtitle="Profile and account controls">
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

Most components accept:

| Prop        | Purpose                         |
| ----------- | ------------------------------- |
| `className` | Add a root class                |
| `style`     | Add root inline styles          |
| `slots`     | Style named internal pieces     |
| `id`        | Stabilize generated surface IDs |

```tsx
<ButtonBase
  id="publish-button"
  label="Publish"
  icon="send"
  className="publish-button"
  slots={{
    icon: { style: { color: "var(--sn-color-primary)" } },
    label: { className: "publish-label" },
  }}
/>
```

## Forms

```tsx
import {
  InputControl,
  SelectControl,
  TextareaControl,
} from "@lastshotlabs/snapshot/ui";

function ProfileForm() {
  const [name, setName] = useState("");

  return (
    <form>
      <InputControl value={name} onChangeText={setName} />
      <TextareaControl placeholder="Bio" />
      <SelectControl
        value="public"
        options={[
          { label: "Public", value: "public" },
          { label: "Private", value: "private" },
        ]}
      />
    </form>
  );
}
```

## Feedback Managers

```tsx
import {
  ConfirmDialog,
  ToastContainer,
  useConfirmManager,
  useToastManager,
} from "@lastshotlabs/snapshot/ui";

function DeleteButton() {
  const confirm = useConfirmManager();
  const toast = useToastManager();

  async function remove() {
    const ok = await confirm.show({
      title: "Delete item",
      message: "This cannot be undone.",
      variant: "destructive",
    });

    if (!ok) return;
    await deleteItem();
    toast.show({ message: "Deleted", variant: "success" });
  }

  return <button onClick={() => void remove()}>Delete</button>;
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
      <ConfirmDialog />
    </>
  );
}
```

## Component Families

- Forms: buttons, inputs, selects, textareas, switches, sliders, wizards.
- Data: tables, lists, charts, badges, avatars, progress, empty states.
- Layout: cards, grids, rows, columns, containers, nav, split panes.
- Overlay: modal, drawer, popover, context menu, command palette.
- Content: markdown, rich text, rich input, code blocks, timelines.
- Communication: chat, comments, message threads, reactions, presence.
- Media: image, video, carousel, embed, file uploader.
- Workflow: kanban, calendar, audit log, notification feed.
