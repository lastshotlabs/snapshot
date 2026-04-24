---
title: Overlays and Modals
description: Modals, drawers, confirm dialogs, command palettes, dropdown menus, and context menus.
draft: false
---

```tsx
import { ModalBase, InputField, ButtonBase } from "@lastshotlabs/snapshot/ui";
import { useState } from "react";

function CreateUserModal({ open, onClose, onSave }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <ModalBase
      title="Create User"
      open={open}
      onClose={onClose}
      footer={[
        { label: "Cancel", variant: "outline", onClick: onClose },
        { label: "Save", variant: "default", onClick: () => onSave({ name, email }) },
      ]}
    >
      <InputField label="Name" value={name} onChange={setName} />
      <InputField label="Email" type="email" value={email} onChange={setEmail} />
    </ModalBase>
  );
}
```

## ModalBase

Full-screen centered dialog with backdrop, focus trap, and footer actions.

```tsx
<ModalBase
  title="Edit Project"
  size="lg"
  open={isOpen}
  onClose={() => setIsOpen(false)}
  footer={[
    { label: "Cancel", variant: "outline", onClick: () => setIsOpen(false) },
    { label: "Save", variant: "default", onClick: handleSave },
  ]}
  footerAlign="right"
>
  {/* form content */}
</ModalBase>
```

**Sizes:** `sm`, `md`, `lg`, `xl`, `full`

**Props:**
- `open` / `onClose` -- controlled visibility
- `title` -- header text
- `footer` -- array of `{ label, variant, onClick }`
- `footerAlign` -- `left` | `center` | `right`
- `trapFocus` -- focus trap (default: `true`)
- `initialFocus` -- CSS selector for initial focus target
- `returnFocus` -- return focus on close (default: `true`)

## DrawerBase

Slide-in side panel. Same API as ModalBase but opens from the left or right.

```tsx
import { DrawerBase } from "@lastshotlabs/snapshot/ui";

<DrawerBase
  title="User Details"
  side="right"
  size="md"
  open={isOpen}
  onClose={() => setIsOpen(false)}
  footer={[
    { label: "Close", variant: "outline", onClick: () => setIsOpen(false) },
  ]}
>
  <DetailCardBase data={selectedUser} fields={userFields} />
</DrawerBase>
```

**Sides:** `left`, `right`

**Sizes:** `sm`, `md`, `lg`, `xl`, `full`

## ConfirmDialogBase

Simple confirmation dialog for destructive actions.

```tsx
import { ConfirmDialogBase } from "@lastshotlabs/snapshot/ui";

<ConfirmDialogBase
  title="Delete User"
  description="This action cannot be undone. Are you sure you want to delete this user?"
  open={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={() => { deleteUser(userId); setShowConfirm(false); }}
  confirmLabel="Delete"
  confirmVariant="destructive"
  cancelLabel="Cancel"
/>
```

## CommandPaletteBase

Spotlight-style search command palette (Ctrl+K / Cmd+K).

```tsx
import { CommandPaletteBase } from "@lastshotlabs/snapshot/ui";

<CommandPaletteBase
  open={isOpen}
  onClose={() => setIsOpen(false)}
  placeholder="Search commands..."
  emptyMessage="No results found"
  groups={[
    {
      label: "Navigation",
      items: [
        { id: "dashboard", label: "Dashboard", icon: "home" },
        { id: "settings", label: "Settings", icon: "settings" },
        { id: "users", label: "Users", icon: "users" },
      ],
    },
    {
      label: "Actions",
      items: [
        { id: "create", label: "Create project", icon: "plus" },
        { id: "invite", label: "Invite member", icon: "user-plus" },
      ],
    },
  ]}
  onSelect={(item) => {
    navigate(item.id);
    setIsOpen(false);
  }}
/>
```

For controlled search with async results:

```tsx
<CommandPaletteBase
  open={isOpen}
  onClose={() => setIsOpen(false)}
  query={searchQuery}
  onQueryChange={setSearchQuery}
  groups={filteredGroups}
  onSelect={handleSelect}
/>
```

## DropdownMenuBase

Dropdown menu triggered by a button click.

```tsx
import { DropdownMenuBase } from "@lastshotlabs/snapshot/ui";

<DropdownMenuBase
  trigger={{ label: "Actions", icon: "more-vertical", variant: "ghost" }}
  items={[
    { type: "item", label: "Edit", icon: "edit" },
    { type: "item", label: "Duplicate", icon: "copy" },
    { type: "separator" },
    { type: "item", label: "Delete", icon: "trash", destructive: true },
  ]}
  onSelect={(item) => handleAction(item.label)}
/>
```

**Item types:** `item` (clickable), `separator` (divider line)

## ContextMenuBase

Right-click context menu.

```tsx
import { ContextMenuBase } from "@lastshotlabs/snapshot/ui";

<ContextMenuBase
  items={[
    { type: "item", label: "Cut", icon: "scissors" },
    { type: "item", label: "Copy", icon: "copy" },
    { type: "item", label: "Paste", icon: "clipboard" },
    { type: "separator" },
    { type: "item", label: "Delete", icon: "trash", destructive: true },
  ]}
  onSelect={(item) => handleAction(item.label)}
>
  <div style={{ padding: "2rem", border: "1px dashed gray" }}>
    Right-click this area
  </div>
</ContextMenuBase>
```

## PopoverBase

Floating panel anchored to a trigger button.

```tsx
import { PopoverBase } from "@lastshotlabs/snapshot/ui";

<PopoverBase
  triggerLabel="Filter"
  triggerIcon="filter"
  triggerVariant="outline"
  title="Filter Options"
  placement="bottom"
  width="300px"
>
  <SelectField label="Status" options={statusOptions} value={status} onChange={setStatus} />
  <SelectField label="Priority" options={priorityOptions} value={priority} onChange={setPriority} />
</PopoverBase>
```

## HoverCardBase

Floating card that opens on hover.

```tsx
import { HoverCardBase } from "@lastshotlabs/snapshot/ui";

<HoverCardBase
  trigger={<a href={`/users/${user.id}`}>{user.name}</a>}
  side="bottom"
  align="start"
  width="300px"
  openDelay={200}
  closeDelay={100}
>
  <AvatarBase src={user.avatar} name={user.name} size="lg" />
  <p>{user.bio}</p>
</HoverCardBase>
```

## Composition patterns

### Modal form with table row action

```tsx
function UserTable() {
  const [editUser, setEditUser] = useState(null);

  return (
    <>
      <DataTableBase
        columns={columns}
        rows={users}
        rowActions={[
          { label: "Edit", icon: "edit", onAction: (row) => setEditUser(row) },
        ]}
      />
      <ModalBase
        title="Edit User"
        open={editUser !== null}
        onClose={() => setEditUser(null)}
        footer={[
          { label: "Cancel", variant: "outline", onClick: () => setEditUser(null) },
          { label: "Save", onClick: () => { saveUser(editUser); setEditUser(null); } },
        ]}
      >
        {editUser && (
          <>
            <InputField label="Name" value={editUser.name} onChange={(v) => setEditUser({ ...editUser, name: v })} />
            <InputField label="Email" value={editUser.email} onChange={(v) => setEditUser({ ...editUser, email: v })} />
          </>
        )}
      </ModalBase>
    </>
  );
}
```

### Confirm before delete

```tsx
function DeleteButton({ userId, onDeleted }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <ButtonBase label="Delete" variant="destructive" onClick={() => setShowConfirm(true)} />
      <ConfirmDialogBase
        title="Delete User"
        description="This cannot be undone."
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { deleteUser(userId).then(onDeleted); setShowConfirm(false); }}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </>
  );
}
```

## All overlay components

| Component | Description |
|-----------|-------------|
| `ModalBase` | Centered dialog with footer actions |
| `DrawerBase` | Slide-in side panel |
| `ConfirmDialogBase` | Confirmation dialog |
| `CommandPaletteBase` | Spotlight-style command search |
| `DropdownMenuBase` | Button-triggered dropdown menu |
| `ContextMenuBase` | Right-click context menu |
| `PopoverBase` | Floating panel with trigger |
| `HoverCardBase` | Hover-activated floating card |

## Next steps

- [Layout and Navigation](/guides/layout-and-navigation/) -- app shells and sidebars
- [Forms and Validation](/guides/forms/) -- form components to use inside modals
- [Theming and Styling](/guides/theming-and-styling/) -- customize overlay appearance
