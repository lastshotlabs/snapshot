---
title: Component Library
description: Use Snapshot's standalone components as a plain React component library.
draft: false
---

Snapshot ships every UI component in two tiers:

- **Standalone** — pure React components with plain props, no manifest runtime required
- **Manifest-driven** — config objects resolved at runtime through the manifest system

Both tiers are first-class. Use standalone components when you want a traditional React component library. Use manifest-driven components when you want config-driven app assembly. Mix them freely in the same application.

Standalone components have no dependency on `createSnapshot`, manifest resolution, or any Snapshot runtime hooks. They accept props, render UI, and stay out of the way.

## Import Paths

Every standalone component is available from the main UI entry point. The entry is tree-shakeable, so unused components are excluded from production builds.

```typescript
import { ButtonBase, InputField, CardBase } from '@lastshotlabs/snapshot/ui';
```

You can also import from individual component modules when you want explicit control over what enters the dependency graph:

```typescript
import { ButtonBase } from '@lastshotlabs/snapshot/ui/components/forms/button';
import type { ButtonBaseProps } from '@lastshotlabs/snapshot/ui/components/forms/button';

import { InputField } from '@lastshotlabs/snapshot/ui/components/forms/input';
import type { InputFieldProps } from '@lastshotlabs/snapshot/ui/components/forms/input';
```

## Naming Convention

Two naming patterns cover the entire catalog:

**Form fields** use the `{Name}Field` suffix. These are components that capture user input and participate in form state.

```typescript
import { InputField, SelectField, TextareaField } from '@lastshotlabs/snapshot/ui';
import type { InputFieldProps, SelectFieldProps } from '@lastshotlabs/snapshot/ui';
```

**Everything else** uses the `{Name}Base` suffix. These are layout, data display, navigation, overlay, content, media, workflow, and primitive components.

```typescript
import { ButtonBase, CardBase, ModalBase } from '@lastshotlabs/snapshot/ui';
import type { ButtonBaseProps, CardBaseProps, ModalBaseProps } from '@lastshotlabs/snapshot/ui';
```

## Quick Examples

### Simple Form

```tsx
import { InputField, SelectField, ButtonBase, CardBase } from '@lastshotlabs/snapshot/ui';

function CreateProjectForm() {
  return (
    <CardBase padding="lg">
      <InputField
        label="Project name"
        placeholder="My project"
        required
      />
      <SelectField
        label="Visibility"
        options={[
          { label: 'Public', value: 'public' },
          { label: 'Private', value: 'private' },
        ]}
        defaultValue="private"
      />
      <ButtonBase variant="default" onClick={handleSubmit}>
        Create project
      </ButtonBase>
    </CardBase>
  );
}
```

### Layout with Cards

```tsx
import { GridBase, CardBase, HeadingBase, TextBase } from '@lastshotlabs/snapshot/ui';

function Dashboard() {
  return (
    <GridBase columns={3} gap="md">
      <CardBase padding="lg">
        <HeadingBase level={3}>Revenue</HeadingBase>
        <TextBase size="2xl" fontWeight="bold">$12,340</TextBase>
      </CardBase>
      <CardBase padding="lg">
        <HeadingBase level={3}>Users</HeadingBase>
        <TextBase size="2xl" fontWeight="bold">1,204</TextBase>
      </CardBase>
      <CardBase padding="lg">
        <HeadingBase level={3}>Uptime</HeadingBase>
        <TextBase size="2xl" fontWeight="bold">99.9%</TextBase>
      </CardBase>
    </GridBase>
  );
}
```

### Data Table

```tsx
import { DataTableBase } from '@lastshotlabs/snapshot/ui';

function UsersTable({ users }: { users: User[] }) {
  return (
    <DataTableBase
      columns={[
        { field: 'name', label: 'Name' },
        { field: 'email', label: 'Email' },
        { field: 'role', label: 'Role' },
      ]}
      rows={users}
      sortable
      searchable
    />
  );
}
```

### Modal Overlay

```tsx
import { ModalBase, ButtonBase, InputField } from '@lastshotlabs/snapshot/ui';
import { useState } from 'react';

function InviteModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ButtonBase onClick={() => setOpen(true)}>Invite member</ButtonBase>
      <ModalBase
        open={open}
        onClose={() => setOpen(false)}
        title="Invite a team member"
      >
        <InputField label="Email address" type="email" />
        <ButtonBase variant="default" onClick={handleInvite}>
          Send invite
        </ButtonBase>
      </ModalBase>
    </>
  );
}
```

## Styling and Slots

Standalone components support the same slot system as manifest-driven components. Every component accepts `className`, `style`, and `slots` props.

Slots let you target named sub-elements of a component without wrapping or overriding internals:

```tsx
<ButtonBase
  variant="default"
  slots={{
    root: {
      paddingX: 'lg',
      borderRadius: 'full',
    },
    label: {
      fontWeight: 'semibold',
    },
    icon: {
      color: 'var(--sn-color-primary-foreground)',
    },
  }}
>
  Save changes
</ButtonBase>
```

Slots also support stateful styling through the `states` key:

```tsx
<CardBase
  slots={{
    root: {
      border: '1px solid var(--sn-color-border)',
      states: {
        hover: {
          shadow: 'md',
          border: '1px solid var(--sn-color-primary)',
        },
      },
    },
  }}
>
  Hoverable card content
</CardBase>
```

For the full slot and state model, see [Styling and Slots](/build/styling-and-slots/).

## Component Catalog

Snapshot ships 113 standalone components across 13 categories.

### Forms (18)

| Component | Props Type | Purpose |
|---|---|---|
| `InputField` | `InputFieldProps` | Text input with label, validation, and state |
| `SelectField` | `SelectFieldProps` | Single-value select dropdown |
| `TextareaField` | `TextareaFieldProps` | Multi-line text input |
| `ButtonBase` | `ButtonBaseProps` | Button with variants, icons, and loading state |
| `SwitchField` | `SwitchFieldProps` | Toggle switch for boolean values |
| `ToggleField` | `ToggleFieldProps` | Toggle button for on/off states |
| `SliderField` | `SliderFieldProps` | Range slider input |
| `DatePickerField` | `DatePickerFieldProps` | Date and date-range picker |
| `ColorPickerField` | `ColorPickerFieldProps` | Color selection input |
| `MultiSelectField` | `MultiSelectFieldProps` | Multi-value select with tags |
| `IconButtonBase` | `IconButtonBaseProps` | Icon-only button |
| `InlineEditField` | `InlineEditFieldProps` | Click-to-edit inline text |
| `TagSelectorField` | `TagSelectorFieldProps` | Tag selection from a defined set |
| `QuickAddField` | `QuickAddFieldProps` | Inline quick-add input |
| `LocationInputField` | `LocationInputFieldProps` | Location/address input |
| `WizardBase` | `WizardBaseProps` | Multi-step form wizard |
| `AutoFormBase` | `AutoFormBaseProps` | Schema-driven auto-generated form |
| `ToggleGroupBase` | `ToggleGroupBaseProps` | Grouped toggle buttons |

### Layout (18)

| Component | Props Type | Purpose |
|---|---|---|
| `BoxBase` | `BoxBaseProps` | Generic layout container |
| `CardBase` | `CardBaseProps` | Card with header, body, and footer |
| `ColumnBase` | `ColumnBaseProps` | Vertical flex column |
| `ContainerBase` | `ContainerBaseProps` | Max-width centered container |
| `GridBase` | `GridBaseProps` | CSS grid layout |
| `RowBase` | `RowBaseProps` | Horizontal flex row |
| `SectionBase` | `SectionBaseProps` | Semantic page section |
| `SpacerBase` | `SpacerBaseProps` | Spacing utility |
| `SplitPaneBase` | `SplitPaneBaseProps` | Resizable split layout |
| `CollapsibleBase` | `CollapsibleBaseProps` | Collapsible content region |
| `NavBase` | `NavBaseProps` | Navigation shell |
| `LayoutBase` | `LayoutBaseProps` | Page layout scaffolding |
| `NavDropdownBase` | `NavDropdownBaseProps` | Navigation dropdown menu |
| `NavLinkBase` | `NavLinkBaseProps` | Navigation link item |
| `NavLogoBase` | `NavLogoBaseProps` | Navigation logo slot |
| `NavSearchBase` | `NavSearchBaseProps` | Navigation search input |
| `NavSectionBase` | `NavSectionBaseProps` | Navigation grouped section |
| `NavUserMenuBase` | `NavUserMenuBaseProps` | Navigation user account menu |

### Data (23)

| Component | Props Type | Purpose |
|---|---|---|
| `AlertBase` | `AlertBaseProps` | Alert message with severity levels |
| `AvatarBase` | `AvatarBaseProps` | User avatar with fallback |
| `AvatarGroupBase` | `AvatarGroupBaseProps` | Stacked avatar group |
| `BadgeBase` | `BadgeBaseProps` | Status or count badge |
| `ChartBase` | `ChartBaseProps` | Configurable chart |
| `DataTableBase` | `DataTableBaseProps` | Data table with sorting, filtering, pagination |
| `DetailCardBase` | `DetailCardBaseProps` | Key-value detail display |
| `EmptyStateBase` | `EmptyStateBaseProps` | Empty state placeholder |
| `EntityPickerBase` | `EntityPickerBaseProps` | Entity search and selection |
| `FavoriteButtonBase` | `FavoriteButtonBaseProps` | Favorite/bookmark toggle |
| `FeedBase` | `FeedBaseProps` | Activity feed list |
| `FilterBarBase` | `FilterBarBaseProps` | Filter controls bar |
| `HighlightedTextBase` | `HighlightedTextBaseProps` | Text with search highlighting |
| `ListBase` | `ListBaseProps` | Configurable list with actions |
| `NotificationBellBase` | `NotificationBellBaseProps` | Notification bell with count |
| `ProgressBase` | `ProgressBaseProps` | Progress bar or ring |
| `SaveIndicatorBase` | `SaveIndicatorBaseProps` | Save status indicator |
| `ScrollAreaBase` | `ScrollAreaBaseProps` | Custom scrollable area |
| `SeparatorBase` | `SeparatorBaseProps` | Visual separator |
| `SkeletonBase` | `SkeletonBaseProps` | Loading skeleton placeholder |
| `StatCardBase` | `StatCardBaseProps` | Statistic display card |
| `TooltipBase` | `TooltipBaseProps` | Hover tooltip |
| `VoteBase` | `VoteBaseProps` | Upvote/downvote control |

### Navigation (6)

| Component | Props Type | Purpose |
|---|---|---|
| `AccordionBase` | `AccordionBaseProps` | Expandable accordion sections |
| `BreadcrumbBase` | `BreadcrumbBaseProps` | Breadcrumb trail |
| `PrefetchLinkBase` | `PrefetchLinkBaseProps` | Link with prefetch behavior |
| `StepperBase` | `StepperBaseProps` | Step progress indicator |
| `TabsBase` | `TabsBaseProps` | Tabbed content panels |
| `TreeViewBase` | `TreeViewBaseProps` | Hierarchical tree view |

### Overlay (8)

| Component | Props Type | Purpose |
|---|---|---|
| `CommandPaletteBase` | `CommandPaletteBaseProps` | Command palette search dialog |
| `ConfirmDialogBase` | `ConfirmDialogBaseProps` | Confirmation dialog |
| `ContextMenuBase` | `ContextMenuBaseProps` | Right-click context menu |
| `DrawerBase` | `DrawerBaseProps` | Slide-in drawer panel |
| `DropdownMenuBase` | `DropdownMenuBaseProps` | Dropdown action menu |
| `HoverCardBase` | `HoverCardBaseProps` | Hover-triggered preview card |
| `ModalBase` | `ModalBaseProps` | Modal dialog |
| `PopoverBase` | `PopoverBaseProps` | Popover content panel |

### Content (11)

| Component | Props Type | Purpose |
|---|---|---|
| `BannerBase` | `BannerBaseProps` | Dismissible banner message |
| `CodeBase` | `CodeBaseProps` | Inline code display |
| `CodeBlockBase` | `CodeBlockBaseProps` | Syntax-highlighted code block |
| `CompareViewBase` | `CompareViewBaseProps` | Side-by-side comparison view |
| `HeadingBase` | `HeadingBaseProps` | Semantic heading (h1-h6) |
| `LinkEmbedBase` | `LinkEmbedBaseProps` | URL preview embed |
| `MarkdownBase` | `MarkdownBaseProps` | Markdown renderer |
| `RichInputBase` | `RichInputBaseProps` | Rich text input |
| `RichTextEditorBase` | `RichTextEditorBaseProps` | Full rich text editor |
| `TimelineBase` | `TimelineBaseProps` | Vertical timeline |
| `FileUploaderBase` | `FileUploaderBaseProps` | File upload with drag-and-drop |

### Communication (8)

| Component | Props Type | Purpose |
|---|---|---|
| `ChatWindowBase` | `ChatWindowBaseProps` | Real-time chat interface |
| `CommentSectionBase` | `CommentSectionBaseProps` | Threaded comment section |
| `EmojiPickerBase` | `EmojiPickerBaseProps` | Emoji selection picker |
| `GifPickerBase` | `GifPickerBaseProps` | GIF search and selection |
| `MessageThreadBase` | `MessageThreadBaseProps` | Message thread view |
| `PresenceIndicatorBase` | `PresenceIndicatorBaseProps` | Online/offline presence dot |
| `ReactionBarBase` | `ReactionBarBaseProps` | Emoji reaction bar |
| `TypingIndicatorBase` | `TypingIndicatorBaseProps` | Typing status indicator |

### Media (4)

| Component | Props Type | Purpose |
|---|---|---|
| `CarouselBase` | `CarouselBaseProps` | Image/content carousel |
| `EmbedBase` | `EmbedBaseProps` | Embeddable media frame |
| `SnapshotImageBase` | `SnapshotImageBaseProps` | Optimized image with loading states |
| `VideoBase` | `VideoBaseProps` | Video player |

### Workflow (4)

| Component | Props Type | Purpose |
|---|---|---|
| `AuditLogBase` | `AuditLogBaseProps` | Audit trail log viewer |
| `CalendarBase` | `CalendarBaseProps` | Calendar with events |
| `KanbanBase` | `KanbanBaseProps` | Kanban board |
| `NotificationFeedBase` | `NotificationFeedBaseProps` | Notification feed list |

### Commerce (1)

| Component | Props Type | Purpose |
|---|---|---|
| `PricingTableBase` | `PricingTableBaseProps` | Pricing tier comparison table |

### Primitives (7)

| Component | Props Type | Purpose |
|---|---|---|
| `DividerBase` | `DividerBaseProps` | Visual divider line |
| `FloatingMenuBase` | `FloatingMenuBaseProps` | Generic floating menu primitive |
| `LinkBase` | `LinkBaseProps` | Styled anchor link |
| `OAuthButtonsBase` | `OAuthButtonsBaseProps` | OAuth provider login buttons |
| `PasskeyButtonBase` | `PasskeyButtonBaseProps` | Passkey authentication button |
| `StackBase` | `StackBaseProps` | Vertical/horizontal stack layout |
| `TextBase` | `TextBaseProps` | Text primitive |

### Feedback (4)

| Component | Props Type | Purpose |
|---|---|---|
| `DefaultErrorBase` | `DefaultErrorBaseProps` | Error state display |
| `DefaultLoadingBase` | `DefaultLoadingBaseProps` | Loading state display |
| `DefaultNotFoundBase` | `DefaultNotFoundBaseProps` | 404 not-found state display |
| `DefaultOfflineBase` | `DefaultOfflineBaseProps` | Offline state display |

### Utility (1)

| Component | Props Type | Purpose |
|---|---|---|
| `ComponentGroupBase` | `ComponentGroupBaseProps` | Group wrapper for arranging components with shared layout |

## Relationship to Manifest Components

Every manifest-driven component wraps the corresponding standalone component. The architecture is:

1. The manifest adapter receives the config object from `snapshot.manifest.json`
2. It resolves config refs (resource bindings, action handlers, subscriptions, computed values)
3. It passes the resolved values as plain props to the standalone component
4. The standalone component renders without any knowledge of the manifest system

This means you can use standalone components inside manifest-driven apps. A manifest route can render a page that mixes config-driven components with standalone components used directly in custom React sections.

Going the other direction, if you start with standalone components and later want config-driven assembly for part of the app, the manifest adapter is already using the same component underneath. The visual output stays consistent.

## What to reach for next

- [Theming and Styling](/guides/theming-and-styling/) for slots, tokens, and dark mode
- [Manifest Quick Start](/manifest/quick-start/) for config-driven app assembly
- [Quick Start](/start-here/) for building apps with standalone components
- [Component Catalog](/reference/components/) for generated component reference
- [UI Reference](/reference/ui/) for the full UI entry point API
