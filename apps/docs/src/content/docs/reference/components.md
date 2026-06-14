---
title: Component Reference
description: Complete auto-generated reference for Snapshot UI components, props, types, and helpers.
draft: false
---

This reference is auto-generated from the code-first component exports under `src/ui/components`.
It documents the React component exports, standalone prop surfaces, related types, and helper exports for each component directory.

Total components: **114** across 13 domains.

## Table of Contents

- [Layout](#layout) (19)
- [Forms](#forms) (18)
- [Data Display](#data-display) (23)
- [Content](#content) (11)
- [Navigation](#navigation) (6)
- [Overlays](#overlays) (8)
- [Media](#media) (4)
- [Communication](#communication) (8)
- [Workflow](#workflow) (4)
- [Commerce](#commerce) (1)
- [Feedback States](#feedback-states) (4)
- [Primitives](#primitives) (7)
- [Base Utilities](#base-utilities) (1)

---

## Layout

### `layout/box`

Standalone Box -- a generic container element with configurable HTML tag.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `BoxBase` | component | `src/ui/components/layout/box/standalone.tsx` | Standalone Box -- a generic container element with configurable HTML tag. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `as` | `'div' \| 'section' \| 'article' \| 'aside' \| 'header' \| 'footer' \| 'main' \| 'nav' \| 'span' \| undefined` | No | HTML element to render (default: "div"). |
| `children` | `ReactNode` | No | React children rendered inside the box. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, item). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `BoxBaseProps` | interface | `src/ui/components/layout/box/standalone.tsx` |  |
| `BoxConfig` | type | `src/ui/components/layout/box/types.ts` |  |

---

### `layout/card`

Standalone Card — a styled container with optional title/subtitle and
standard React children. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CardBase` | component | `src/ui/components/layout/card/standalone.tsx` | Standalone Card — a styled container with optional title/subtitle and standard React children. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `background` | `ComponentBackgroundValue \| undefined` | No | Background config — a CSS color string, or an object with image/gradient/overlay. |
| `children` | `ReactNode` | No | React children — rendered as the card body. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `gap` | `string \| undefined` | No | Content gap — a token name ("sm", "md", "lg") or raw CSS value. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, header, title, subtitle, content, item). |
| `staggerDelay` | `number \| undefined` | No | Stagger animation delay per child (ms). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `subtitle` | `string \| undefined` | No | Card subtitle. |
| `title` | `string \| undefined` | No | Card title. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CardBaseProps` | interface | `src/ui/components/layout/card/standalone.tsx` |  |
| `CardConfig` | type | `src/ui/components/layout/card/types.ts` |  |

---

### `layout/collapsible`

Standalone Collapsible -- an animated expand/collapse container with an optional trigger.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CollapsibleBase` | component | `src/ui/components/layout/collapsible/standalone.tsx` | Standalone Collapsible -- an animated expand/collapse container with an optional trigger. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `children` | `ReactNode` | No | React children rendered inside the collapsible content. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `defaultOpen` | `boolean \| undefined` | No | Default open state for uncontrolled mode. |
| `duration` | `string \| undefined` | No | Animation duration token ("instant", "fast", "normal", "slow") or ms number. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onOpenChange` | `((open: boolean) => void) \| undefined` | No | Callback fired when the open state changes. |
| `open` | `boolean \| undefined` | No | Controlled open state. When undefined, the component manages its own state. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, trigger, content). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `trigger` | `ReactNode` | No | Trigger element rendered before the collapsible content. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CollapsibleBaseProps` | interface | `src/ui/components/layout/collapsible/standalone.tsx` |  |
| `CollapsibleConfig` | type | `src/ui/components/layout/collapsible/types.ts` |  |

---

### `layout/column`

Standalone Column -- a vertical flex container.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ColumnBase` | component | `src/ui/components/layout/column/standalone.tsx` | Standalone Column -- a vertical flex container. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `align` | `string \| undefined` | No | Cross-axis alignment. |
| `children` | `ReactNode` | No | React children rendered inside the column. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `gap` | `string \| undefined` | No | Gap between children -- a token name or raw CSS value. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `justify` | `string \| undefined` | No | Main-axis justification. |
| `maxHeight` | `string \| undefined` | No | Maximum height constraint. |
| `overflow` | `string \| undefined` | No | Overflow behavior. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, item). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ColumnBaseProps` | interface | `src/ui/components/layout/column/standalone.tsx` |  |
| `ColumnConfig` | type | `src/ui/components/layout/column/types.ts` | Inferred config type for the Column layout component. |

---

### `layout/container`

Standalone Container -- a centered, max-width-constrained wrapper.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ContainerBase` | component | `src/ui/components/layout/container/standalone.tsx` | Standalone Container -- a centered, max-width-constrained wrapper. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `center` | `boolean \| undefined` | No | Whether the container is horizontally centered. Default: true. |
| `children` | `ReactNode` | No | React children rendered inside the container. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `maxWidth` | `string \| number \| undefined` | No | Max-width token name, raw CSS value, or numeric px value. |
| `padding` | `string \| undefined` | No | Inline padding token name. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, item). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ContainerBaseProps` | interface | `src/ui/components/layout/container/standalone.tsx` |  |
| `ContainerConfig` | type | `src/ui/components/layout/container/types.ts` |  |

---

### `layout/grid`

Standalone Grid -- a CSS grid container.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `GridBase` | component | `src/ui/components/layout/grid/standalone.tsx` | Standalone Grid -- a CSS grid container. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `areas` | `string[] \| undefined` | No | Grid template areas (responsive). |
| `children` | `ReactNode` | No | React children rendered as grid items. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `columns` | `string \| number \| undefined` | No | Number of columns or a CSS grid-template-columns value (responsive). |
| `gap` | `string \| undefined` | No | Gap between grid items -- a token name or raw CSS value. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `rows` | `string \| undefined` | No | Grid template rows (CSS value). |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, item). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `GridBaseProps` | interface | `src/ui/components/layout/grid/standalone.tsx` |  |
| `GridConfig` | type | `src/ui/components/layout/grid/types.ts` |  |

---

### `layout/layout`

Standalone Layout -- a layout shell component that wraps page content.
Renders one of six layout variants with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `LayoutBase` | component | `src/ui/components/layout/layout/standalone.tsx` | Standalone Layout -- a layout shell component that wraps page content. Renders one of six layout variants with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `children` | `ReactNode` | Yes | The page content to render inside the layout. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `layoutSlots` | `LayoutBaseSlots \| undefined` | No | Optional named slot content for slot-aware layout variants. |
| `nav` | `ReactNode` | No | The nav element to render in the layout. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `variant` | `LayoutBaseVariant \| undefined` | No | Layout variant determines the overall page structure. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `LayoutBaseProps` | interface | `src/ui/components/layout/layout/standalone.tsx` |  |
| `LayoutBaseSlots` | type | `src/ui/components/layout/layout/standalone.tsx` | Named slot content map for slot-aware layouts. |
| `LayoutBaseVariant` | type | `src/ui/components/layout/layout/standalone.tsx` |  |
| `LayoutConfig` | interface | `src/ui/components/layout/layout/types.ts` |  |
| `LayoutProps` | interface | `src/ui/components/layout/layout/types.ts` | Props for the Layout component. |
| `LayoutSlots` | type | `src/ui/components/layout/layout/types.ts` | Named slot content map for slot-aware layouts. |
| `LayoutVariant` | type | `src/ui/components/layout/layout/types.ts` | Layout variant type extracted from the schema. |

---

### `layout/nav`

Standalone Nav -- a navigation component with items, logo, and collapse support.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NavBase` | component | `src/ui/components/layout/nav/standalone.tsx` | Standalone Nav -- a navigation component with items, logo, and collapse support. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `children` | `ReactNode` | No | React children rendered inside the nav (for template mode). |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `collapsed` | `boolean \| undefined` | No | Whether the nav is currently collapsed (controlled). |
| `collapsible` | `boolean \| undefined` | No | Whether the nav is collapsible (sidebar only). Default: true. |
| `footer` | `ReactNode` | No | Optional content rendered after the items list (e.g., user menu). |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `items` | `NavBaseItem[] \| undefined` | No | Navigation items to render. |
| `logo` | `NavBaseLogo \| undefined` | No | Logo configuration. |
| `onNavigate` | `((path: string) => void) \| undefined` | No | Callback fired on navigation. |
| `onToggleCollapse` | `(() => void) \| undefined` | No | Called when collapse state should change. |
| `pathname` | `string \| undefined` | No | Current URL pathname for active route detection. |
| `renderItem` | `((item: NavBaseItem, index: number, defaultNode: ReactNode) => ReactNode) \| undefined` | No | Custom item renderer. When provided, called for each item instead of the built-in `<NavEntryBase>`. Receives the item, its index, and a sensible default rendering you can fall back to. |
| `renderLogo` | `((logo: NavBaseLogo \| undefined) => ReactNode) \| undefined` | No | Custom logo renderer; replaces the built-in logo block when provided. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `variant` | `'sidebar' \| 'top-nav' \| undefined` | No | Navigation variant. Default: "sidebar". |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `AuthUser` | interface | `src/ui/components/layout/nav/types.ts` | User info shape expected from `global.user` in AppContext. Minimal contract: the nav only needs name, email, avatar, and role. |
| `NavBaseItem` | interface | `src/ui/components/layout/nav/standalone.tsx` |  |
| `NavBaseLogo` | interface | `src/ui/components/layout/nav/standalone.tsx` |  |
| `NavBaseProps` | interface | `src/ui/components/layout/nav/standalone.tsx` |  |
| `NavBaseUser` | interface | `src/ui/components/layout/nav/standalone.tsx` |  |
| `NavItemConfig` | interface | `src/ui/components/layout/nav/types.ts` |  |
| `ResolvedNavItem` | interface | `src/ui/components/layout/nav/types.ts` | A nav item enriched with computed state: active detection, visibility based on role, and resolved badge value. |
| `UseNavResult` | interface | `src/ui/components/layout/nav/types.ts` | Return type of the useNav headless hook. |

---

### `layout/nav-dropdown`

Standalone NavDropdown -- a navigation dropdown with floating panel.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NavDropdownBase` | component | `src/ui/components/layout/nav-dropdown/standalone.tsx` | Standalone NavDropdown -- a navigation dropdown with floating panel. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `align` | `'start' \| 'end' \| undefined` | No | Panel alignment relative to trigger. Default: "start". |
| `children` | `ReactNode` | No | React children rendered as dropdown panel content. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `current` | `boolean \| undefined` | No | Whether this dropdown represents the current section. |
| `disabled` | `boolean \| undefined` | No | Whether the trigger is disabled. |
| `icon` | `string \| undefined` | No | Icon name for the trigger. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Dropdown trigger label. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, trigger, triggerLabel, triggerIcon, panel, item, itemLabel, itemIcon). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `trigger` | `'hover' \| 'click' \| undefined` | No | How the dropdown opens. Default: "click". |
| `width` | `string \| undefined` | No | Minimum width for the dropdown panel (CSS value). |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NavDropdownBaseProps` | interface | `src/ui/components/layout/nav-dropdown/standalone.tsx` |  |
| `NavDropdownConfig` | type | `src/ui/components/layout/nav-dropdown/types.ts` |  |

---

### `layout/nav-link`

Standalone NavLink -- a navigation link with optional icon and badge.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NavLinkBase` | component | `src/ui/components/layout/nav-link/standalone.tsx` | Standalone NavLink -- a navigation link with optional icon and badge. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `path` | `string` | Yes | Navigation path. |
| `active` | `boolean \| undefined` | No | Whether the link is currently active. |
| `badge` | `number \| undefined` | No | Badge count to display. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `disabled` | `boolean \| undefined` | No | Whether the link is disabled. |
| `icon` | `string \| undefined` | No | Icon name (resolved via renderIcon). |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Link label text. |
| `matchChildren` | `boolean \| undefined` | No | Whether child routes should also match for active state. Default: true. |
| `onNavigate` | `((path: string) => void) \| undefined` | No | Callback fired on navigation. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, label, icon, badge). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NavLinkBaseProps` | interface | `src/ui/components/layout/nav-link/standalone.tsx` |  |
| `NavLinkConfig` | type | `src/ui/components/layout/nav-link/types.ts` |  |

---

### `layout/nav-logo`

Standalone NavLogo -- a clickable brand logo/text element for navigation headers.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NavLogoBase` | component | `src/ui/components/layout/nav-logo/standalone.tsx` | Standalone NavLogo -- a clickable brand logo/text element for navigation headers. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `logoHeight` | `string \| undefined` | No | Logo height (CSS value). Default: "var(--sn-spacing-lg, 1.5rem)". |
| `onNavigate` | `((path: string) => void) \| undefined` | No | Callback fired when the logo is clicked with a navigation path. |
| `path` | `string \| undefined` | No | Navigation path when the logo is clicked. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, icon, label). |
| `src` | `string \| undefined` | No | Logo image source URL. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `text` | `string \| undefined` | No | Logo text label. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NavLogoBaseProps` | interface | `src/ui/components/layout/nav-logo/standalone.tsx` |  |
| `NavLogoConfig` | type | `src/ui/components/layout/nav-logo/types.ts` |  |

---

### `layout/nav-search`

Standalone NavSearch -- a search input with optional keyboard shortcut display.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NavSearchBase` | component | `src/ui/components/layout/nav-search/standalone.tsx` | Standalone NavSearch -- a search input with optional keyboard shortcut display. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onSearch` | `((value: string) => void) \| undefined` | No | Callback fired when the search form is submitted. |
| `onValueChange` | `((value: string) => void) \| undefined` | No | Callback fired when the search value changes. |
| `placeholder` | `string \| undefined` | No | Placeholder text for the search input. |
| `shortcut` | `string \| undefined` | No | Keyboard shortcut label (e.g., "Ctrl+K" or "/"). |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, input, shortcut). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NavSearchBaseProps` | interface | `src/ui/components/layout/nav-search/standalone.tsx` |  |
| `NavSearchConfig` | type | `src/ui/components/layout/nav-search/types.ts` |  |

---

### `layout/nav-section`

Standalone NavSection -- a labeled, optionally collapsible group within navigation.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NavSectionBase` | component | `src/ui/components/layout/nav-section/standalone.tsx` | Standalone NavSection -- a labeled, optionally collapsible group within navigation. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `children` | `ReactNode` | No | React children rendered as the section content. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `collapsible` | `boolean \| undefined` | No | Whether the section is collapsible. |
| `defaultCollapsed` | `boolean \| undefined` | No | Default collapsed state. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Section label/header. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, header, headerLabel, content). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NavSectionBaseProps` | interface | `src/ui/components/layout/nav-section/standalone.tsx` |  |
| `NavSectionConfig` | type | `src/ui/components/layout/nav-section/types.ts` |  |

---

### `layout/nav-user-menu`

Standalone NavUserMenu -- a user menu dropdown with avatar trigger.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NavUserMenuBase` | component | `src/ui/components/layout/nav-user-menu/standalone.tsx` | Standalone NavUserMenu -- a user menu dropdown with avatar trigger. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `items` | `NavUserMenuBaseItem[] \| undefined` | No | Menu items to render in the dropdown. |
| `mode` | `'compact' \| 'full' \| undefined` | No | Display mode: "compact" (avatar only) or "full" (avatar + name). Default: "compact". |
| `showAvatar` | `boolean \| undefined` | No | Whether to show the avatar. Default: true. |
| `showEmail` | `boolean \| undefined` | No | Whether to show the user email in the dropdown. Default: false. |
| `showName` | `boolean \| undefined` | No | Whether to show the user name in the trigger (full mode). Default: true. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, trigger, triggerLabel, avatar, avatarImage, panel, item, itemLabel, itemIcon, email). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `userAvatar` | `string \| undefined` | No | User avatar URL. |
| `userEmail` | `string \| undefined` | No | User email address. |
| `userName` | `string \| undefined` | No | User display name. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NavUserMenuBaseItem` | interface | `src/ui/components/layout/nav-user-menu/standalone.tsx` |  |
| `NavUserMenuBaseProps` | interface | `src/ui/components/layout/nav-user-menu/standalone.tsx` |  |
| `NavUserMenuConfig` | type | `src/ui/components/layout/nav-user-menu/types.ts` |  |

---

### `layout/outlet`

Standalone OutletBase — a router-agnostic mount point for child routes or
manually-supplied content. Works with plain React props.

Pass router-rendered content as `children`. When children is empty,
`fallback` is rendered instead.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `OutletBase` | component | `src/ui/components/layout/outlet/standalone.tsx` | Standalone OutletBase — a router-agnostic mount point for child routes or manually-supplied content. Works with plain React props. Pass router-rendered content as `children`. When children is empty, `fallback` is rendered instead. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `children` | `ReactNode` | No | Pre-rendered children to display in the outlet (router-driven or manual). |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `fallback` | `ReactNode` | No | Fallback content rendered when `children` is empty/null. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `OutletBaseProps` | interface | `src/ui/components/layout/outlet/standalone.tsx` |  |
| `OutletConfig` | type | `src/ui/components/layout/outlet/types.ts` |  |

---

### `layout/row`

Standalone Row -- a horizontal flex container.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `RowBase` | component | `src/ui/components/layout/row/standalone.tsx` | Standalone Row -- a horizontal flex container. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `align` | `string \| undefined` | No | Cross-axis alignment. |
| `children` | `ReactNode` | No | React children rendered inside the row. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `gap` | `string \| undefined` | No | Gap between children -- a token name or raw CSS value. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `justify` | `string \| undefined` | No | Main-axis justification. |
| `maxHeight` | `string \| undefined` | No | Maximum height constraint. |
| `overflow` | `string \| undefined` | No | Overflow behavior. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, item). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `wrap` | `boolean \| undefined` | No | Whether children wrap to the next line. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `RowBaseProps` | interface | `src/ui/components/layout/row/standalone.tsx` |  |
| `RowConfig` | type | `src/ui/components/layout/row/types.ts` |  |

---

### `layout/section`

Standalone Section -- a full-width vertical section with optional height and alignment.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SectionBase` | component | `src/ui/components/layout/section/standalone.tsx` | Standalone Section -- a full-width vertical section with optional height and alignment. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `align` | `string \| undefined` | No | Cross-axis alignment. |
| `bleed` | `boolean \| undefined` | No | Whether the section bleeds to full width. |
| `children` | `ReactNode` | No | React children rendered inside the section. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `height` | `string \| undefined` | No | Section height: "screen" for 100vh, "auto", or a CSS value. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `justify` | `string \| undefined` | No | Main-axis justification. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, item). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SectionBaseProps` | interface | `src/ui/components/layout/section/standalone.tsx` |  |
| `SectionConfig` | type | `src/ui/components/layout/section/types.ts` |  |

---

### `layout/spacer`

Standalone Spacer -- an empty element that takes up space along an axis.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SpacerBase` | component | `src/ui/components/layout/spacer/standalone.tsx` | Standalone Spacer -- an empty element that takes up space along an axis. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `axis` | `'vertical' \| 'horizontal' \| undefined` | No | Axis along which the spacer expands. Default: "vertical". |
| `className` | `string \| undefined` | No | className applied to the root element. |
| `flex` | `boolean \| undefined` | No | Whether the spacer should flex-grow. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `size` | `string \| undefined` | No | Size token name or raw CSS value. Default: "md". |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root element. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SpacerBaseProps` | interface | `src/ui/components/layout/spacer/standalone.tsx` |  |
| `SpacerConfig` | type | `src/ui/components/layout/spacer/types.ts` |  |

---

### `layout/split-pane`

Standalone SplitPane -- a resizable two-pane layout with a draggable divider.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SplitPaneBase` | component | `src/ui/components/layout/split-pane/standalone.tsx` | Standalone SplitPane -- a resizable two-pane layout with a draggable divider. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `defaultSplit` | `number \| undefined` | No | Initial split percentage. Default: 50. |
| `direction` | `'vertical' \| 'horizontal' \| undefined` | No | Split direction. Default: "horizontal". |
| `first` | `ReactNode` | No | Content for the first pane. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `minSize` | `number \| undefined` | No | Minimum pane size in pixels. Default: 100. |
| `second` | `ReactNode` | No | Content for the second pane. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, pane, firstPane, secondPane, divider). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SplitPaneBaseProps` | interface | `src/ui/components/layout/split-pane/standalone.tsx` |  |
| `SplitPaneConfig` | type | `src/ui/components/layout/split-pane/types.ts` |  |

---

## Forms

### `forms/auto-form`

Standalone AutoFormBase -- renders a schema-driven form with fields, sections,
validation, and submit/reset actions. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `AutoFormBase` | component | `src/ui/components/forms/auto-form/standalone.tsx` | Standalone AutoFormBase -- renders a schema-driven form with fields, sections, validation, and submit/reset actions. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `errors` | `Record<string, string \| undefined>` | Yes | Current validation errors keyed by field name. |
| `onFieldBlur` | `(name: string) => void` | Yes | Called when a field loses focus. |
| `onFieldChange` | `(name: string, value: unknown) => void` | Yes | Called when a field value changes. |
| `onSubmit` | `() => void` | Yes | Called when the form is submitted. |
| `touched` | `Record<string, boolean>` | Yes | Map of field names to whether they have been touched/blurred. |
| `values` | `Record<string, unknown>` | Yes | Current form values keyed by field name. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `columns` | `number \| undefined` | No | Number of grid columns for the field layout. Overrides `layout` when > 1. |
| `dataComponent` | `string \| undefined` | No | Override the `data-snapshot-component` attribute on the form element. |
| `dataTestId` | `string \| undefined` | No | Override the `data-testid` attribute on the form element. |
| `fields` | `AutoFormFieldConfig[] \| undefined` | No | Flat list of field configurations (use when not grouping into sections). |
| `gap` | `'sm' \| 'md' \| 'lg' \| 'xs' \| undefined` | No | Spacing between fields. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `isDirty` | `boolean \| undefined` | No | Whether the form values differ from their initial state. |
| `isSubmitting` | `boolean \| undefined` | No | Whether the form is currently submitting. |
| `isValid` | `boolean \| undefined` | No | Whether all fields pass validation. Used to disable the submit button. |
| `layout` | `'vertical' \| 'horizontal' \| 'grid' \| undefined` | No | Layout mode for arranging fields. |
| `onInlineAction` | `((fieldName: string, to: string) => void) \| undefined` | No | Callback for inline field actions (e.g. "Forgot password?" links). |
| `onReset` | `(() => void) \| undefined` | No | Called when the reset button is clicked. |
| `resetLabel` | `string \| undefined` | No | Label text for the reset button. |
| `sections` | `AutoFormSectionConfig[] \| undefined` | No | Grouped sections, each containing its own fields. |
| `showReset` | `boolean \| undefined` | No | Whether to display the reset button. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `submitFullWidth` | `boolean \| undefined` | No | Whether the submit button spans the full width. |
| `submitIcon` | `string \| undefined` | No | Icon name to show before the submit button label. |
| `submitLabel` | `string \| undefined` | No | Label text for the submit button. |
| `submitLoadingLabel` | `string \| undefined` | No | Label shown on the submit button while the form is submitting. |
| `submitSize` | `'sm' \| 'md' \| 'lg' \| 'icon' \| undefined` | No | Size for the submit button. |
| `submitVariant` | `'ghost' \| 'link' \| 'default' \| 'destructive' \| 'outline' \| 'secondary' \| undefined` | No | Variant for the submit button. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `AutoFormBaseProps` | interface | `src/ui/components/forms/auto-form/standalone.tsx` |  |
| `AutoFormConfig` | type | `src/ui/components/forms/auto-form/types.ts` | Inferred type for the AutoForm component config. |
| `AutoFormFieldConfig` | interface | `src/ui/components/forms/auto-form/standalone.tsx` |  |
| `AutoFormFieldOption` | interface | `src/ui/components/forms/auto-form/standalone.tsx` |  |
| `AutoFormFieldValidation` | interface | `src/ui/components/forms/auto-form/standalone.tsx` |  |
| `AutoFormSectionConfig` | interface | `src/ui/components/forms/auto-form/standalone.tsx` |  |
| `FieldConfig` | type | `src/ui/components/forms/auto-form/types.ts` | Inferred type for a single field configuration. |
| `FieldErrors` | type | `src/ui/components/forms/auto-form/types.ts` | Per-field validation error. |
| `FieldSectionConfig` | type | `src/ui/components/forms/auto-form/types.ts` | Inferred type for a field section configuration. |
| `TouchedFields` | type | `src/ui/components/forms/auto-form/types.ts` | Tracks which fields have been interacted with. |
| `UseAutoFormResult` | interface | `src/ui/components/forms/auto-form/types.ts` | Return type for the useAutoForm headless hook. |

---

### `forms/button`

Standalone ButtonBase -- a styled button that works with plain React props.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ButtonBase` | component | `src/ui/components/forms/button/standalone.tsx` | Standalone ButtonBase -- a styled button that works with plain React props. Works with plain React props. |
| `ButtonControl` | component | `src/ui/components/forms/button/control.tsx` | Low-level styled button element with surface resolution and accessibility attributes. Used internally by ButtonBase and other components that need a styled `<button>`. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `ariaLabel` | `string \| undefined` | No | Accessible label for icon-only buttons. |
| `children` | `ReactNode` | No | Children to render inside the button (overrides label/icon). |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `disabled` | `boolean \| undefined` | No | Disabled state. |
| `fullWidth` | `boolean \| undefined` | No | Whether the button spans full width. |
| `icon` | `string \| undefined` | No | Icon name displayed before the label. |
| `id` | `string \| undefined` | No | Unique identifier for the button. Used for surface scoping. |
| `label` | `string \| undefined` | No | Button label text. |
| `onClick` | `MouseEventHandler<HTMLButtonElement> \| undefined` | No | Click handler. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'icon' \| undefined` | No | Size of the button. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, label, icon). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `type` | `'button' \| 'submit' \| undefined` | No | HTML button type. |
| `variant` | `'ghost' \| 'link' \| 'default' \| 'destructive' \| 'outline' \| 'secondary' \| undefined` | No | Visual variant. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ButtonBaseProps` | interface | `src/ui/components/forms/button/standalone.tsx` |  |
| `ButtonConfig` | interface | `src/ui/components/forms/button/types.ts` |  |
| `ButtonControlProps` | interface | `src/ui/components/forms/button/types.ts` |  |

---

### `forms/color-picker`

Forms Color Picker is a code-first Snapshot UI component exported from the UI package.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ColorPickerBase` | value | `src/ui/components/forms/color-picker/standalone.tsx` |  |
| `ColorPickerField` | component | `src/ui/components/forms/color-picker/standalone.tsx` | Standalone ColorPickerField -- a color picker with optional swatches, alpha slider, and custom hex input. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `allowCustom` | `boolean \| undefined` | No | Whether to allow typing a custom hex value. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `defaultValue` | `string \| undefined` | No | Initial color value in hex format. |
| `format` | `'hex' \| 'rgb' \| 'hsl' \| undefined` | No | Output format for the color value. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Label text displayed above the picker. |
| `onChange` | `((value: string) => void) \| undefined` | No | Called when the selected color changes. |
| `showAlpha` | `boolean \| undefined` | No | Whether to show the alpha/opacity slider. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `swatches` | `string[] \| undefined` | No | Preset color swatches displayed as quick-select buttons. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ColorPickerBaseProps` | type | `src/ui/components/forms/color-picker/standalone.tsx` |  |
| `ColorPickerConfig` | type | `src/ui/components/forms/color-picker/types.ts` | Props/config shape for the color picker component. |
| `ColorPickerFieldProps` | interface | `src/ui/components/forms/color-picker/standalone.tsx` |  |

---

### `forms/date-picker`

Forms Date Picker is a code-first Snapshot UI component exported from the UI package.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DatePickerBase` | value | `src/ui/components/forms/date-picker/standalone.tsx` |  |
| `DatePickerField` | component | `src/ui/components/forms/date-picker/standalone.tsx` | Standalone DatePickerField -- date picker supporting single, range, and multiple selection modes with presets and disabled dates. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `disabledDates` | `(string \| DatePickerDisabledEntry)[] \| undefined` | No | Dates or day-of-week patterns that cannot be selected. |
| `format` | `string \| undefined` | No | Display format string for the selected date(s). |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Label text displayed above the date picker. |
| `max` | `string \| undefined` | No | Latest selectable date (YYYY-MM-DD). |
| `min` | `string \| undefined` | No | Earliest selectable date (YYYY-MM-DD). |
| `mode` | `'single' \| 'range' \| 'multiple' \| undefined` | No | Selection mode: single date, date range, or multiple dates. |
| `onChange` | `((value: unknown) => void) \| undefined` | No | Called when the selected date(s) change. |
| `placeholder` | `string \| undefined` | No | Placeholder text shown when no date is selected. |
| `presets` | `DatePickerPreset[] \| undefined` | No | Preset date ranges shown as quick-select buttons. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `valueFormat` | `'iso' \| 'unix' \| 'locale' \| undefined` | No | Output format for the emitted value. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DatePickerBaseProps` | type | `src/ui/components/forms/date-picker/standalone.tsx` |  |
| `DatePickerConfig` | type | `src/ui/components/forms/date-picker/types.ts` | Props/config shape for the date picker component. |
| `DatePickerDisabledEntry` | interface | `src/ui/components/forms/date-picker/standalone.tsx` |  |
| `DatePickerFieldProps` | interface | `src/ui/components/forms/date-picker/standalone.tsx` |  |
| `DatePickerPreset` | interface | `src/ui/components/forms/date-picker/standalone.tsx` |  |

---

### `forms/icon-button`

Standalone IconButtonBase -- an icon-only button with configurable shape,
size, and variant. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `IconButtonBase` | component | `src/ui/components/forms/icon-button/standalone.tsx` | Standalone IconButtonBase -- an icon-only button with configurable shape, size, and variant. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `ariaLabel` | `string` | Yes | Accessible label (required for icon-only buttons). |
| `icon` | `string` | Yes | Icon name to render. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `disabled` | `boolean \| undefined` | No | Disabled state. |
| `id` | `string \| undefined` | No | Unique identifier. |
| `onClick` | `MouseEventHandler<HTMLButtonElement> \| undefined` | No | Click handler. |
| `shape` | `'circle' \| 'square' \| undefined` | No | Shape of the button. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xs' \| undefined` | No | Size. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `tooltip` | `string \| undefined` | No | Tooltip text. |
| `variant` | `'ghost' \| 'link' \| 'default' \| 'destructive' \| 'outline' \| 'secondary' \| undefined` | No | Visual variant. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `IconButtonBaseProps` | interface | `src/ui/components/forms/icon-button/standalone.tsx` |  |
| `IconButtonConfig` | type | `src/ui/components/forms/icon-button/types.ts` |  |

---

### `forms/inline-edit`

Forms Inline Edit is a code-first Snapshot UI component exported from the UI package.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `InlineEditBase` | value | `src/ui/components/forms/inline-edit/standalone.tsx` |  |
| `InlineEditField` | component | `src/ui/components/forms/inline-edit/standalone.tsx` | Standalone InlineEditField -- a click-to-edit text field that toggles between display and input modes. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `cancelOnEscape` | `boolean \| undefined` | No | Whether pressing Escape cancels the edit and reverts the value. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `fontSize` | `string \| undefined` | No | CSS font-size applied to both display text and the editing input. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `inputType` | `'number' \| 'email' \| 'url' \| 'search' \| 'password' \| 'text' \| 'tel' \| undefined` | No | HTML input type used when editing. |
| `onSave` | `((value: string) => void) \| undefined` | No | Called when the user confirms an edit (Enter key or blur). |
| `placeholder` | `string \| undefined` | No | Placeholder shown when value is empty. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `value` | `string \| undefined` | No | Current display value of the field. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `InlineEditBaseProps` | type | `src/ui/components/forms/inline-edit/standalone.tsx` |  |
| `InlineEditConfig` | type | `src/ui/components/forms/inline-edit/types.ts` | Inferred config type for the InlineEdit component. |
| `InlineEditFieldProps` | interface | `src/ui/components/forms/inline-edit/standalone.tsx` |  |

---

### `forms/input`

Forms Input is a code-first Snapshot UI component exported from the UI package.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `InputBase` | value | `src/ui/components/forms/input/standalone.tsx` |  |
| `InputControl` | component | `src/ui/components/forms/input/control.tsx` | Low-level styled input element with surface resolution and state management. Used internally by InputField and other components that need a styled `<input>`. Works with plain React props. |
| `InputField` | component | `src/ui/components/forms/input/standalone.tsx` | Standalone InputField — a complete form field (label + input + helper/error) that works with plain React props. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `disabled` | `boolean \| undefined` | No | Disabled state. |
| `errorText` | `string \| undefined` | No | Error message — overrides validation and helper text. |
| `helperText` | `string \| undefined` | No | Helper text displayed below the input. |
| `icon` | `string \| undefined` | No | Left icon name. |
| `id` | `string \| undefined` | No | Unique identifier for the field. Used for htmlFor, aria, and surface scoping. |
| `label` | `string \| undefined` | No | Label text displayed above the input. |
| `maxLength` | `number \| undefined` | No | Maximum character length. |
| `onBlur` | `FocusEventHandler<HTMLInputElement> \| undefined` | No | Standard blur handler. |
| `onChange` | `((value: string) => void) \| undefined` | No | Called with the new string value on every change. |
| `onClick` | `MouseEventHandler<HTMLInputElement> \| undefined` | No | Standard click handler. |
| `onFocus` | `FocusEventHandler<HTMLInputElement> \| undefined` | No | Standard focus handler. |
| `onKeyDown` | `KeyboardEventHandler<HTMLInputElement> \| undefined` | No | Standard keydown handler. |
| `onMouseEnter` | `MouseEventHandler<HTMLInputElement> \| undefined` | No | Standard mouseenter handler. |
| `onMouseLeave` | `MouseEventHandler<HTMLInputElement> \| undefined` | No | Standard mouseleave handler. |
| `onPointerDown` | `import("/Users/jdd/projects/snapshot/node_modules/@types/react/index").PointerEventHandler<HTMLInputElement> \| undefined` | No | Standard pointerdown handler. |
| `onPointerUp` | `import("/Users/jdd/projects/snapshot/node_modules/@types/react/index").PointerEventHandler<HTMLInputElement> \| undefined` | No | Standard pointerup handler. |
| `onTouchEnd` | `import("/Users/jdd/projects/snapshot/node_modules/@types/react/index").TouchEventHandler<HTMLInputElement> \| undefined` | No | Standard touchend handler. |
| `onTouchStart` | `import("/Users/jdd/projects/snapshot/node_modules/@types/react/index").TouchEventHandler<HTMLInputElement> \| undefined` | No | Standard touchstart handler. |
| `pattern` | `string \| undefined` | No | Regex validation pattern. |
| `placeholder` | `string \| undefined` | No | Placeholder text inside the input. |
| `readOnly` | `boolean \| undefined` | No | Read-only state. |
| `required` | `boolean \| undefined` | No | Whether the field is required. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, label, field, control, icon, helper, requiredIndicator). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `type` | `'number' \| 'email' \| 'url' \| 'search' \| 'password' \| 'text' \| 'tel' \| undefined` | No | HTML input type. Default: "text". |
| `value` | `string \| undefined` | No | Controlled value. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `InputBaseProps` | type | `src/ui/components/forms/input/standalone.tsx` |  |
| `InputConfig` | interface | `src/ui/components/forms/input/types.ts` |  |
| `InputControlProps` | interface | `src/ui/components/forms/input/types.ts` |  |
| `InputFieldProps` | interface | `src/ui/components/forms/input/standalone.tsx` |  |

---

### `forms/location-input`

Forms Location Input is a code-first Snapshot UI component exported from the UI package.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `LocationInputBase` | value | `src/ui/components/forms/location-input/standalone.tsx` |  |
| `LocationInputField` | component | `src/ui/components/forms/location-input/standalone.tsx` | Standalone LocationInputField -- a location search input with results dropdown and optional Google Maps link. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `disabled` | `boolean \| undefined` | No | Whether the field is disabled. |
| `errorText` | `string \| undefined` | No | Error message displayed below the field, replacing helper text. |
| `helperText` | `string \| undefined` | No | Helper text displayed below the field when there is no error. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Label text displayed above the input. |
| `loading` | `boolean \| undefined` | No | Whether search results are currently loading. |
| `onSearch` | `((query: string) => void) \| undefined` | No | Called when the user types a search query. |
| `onSelect` | `((location: LocationResult) => void) \| undefined` | No | Called when the user selects a location from the results. |
| `placeholder` | `string \| undefined` | No | Placeholder text shown inside the search input. |
| `required` | `boolean \| undefined` | No | Whether the field is required. |
| `results` | `LocationResult[] \| undefined` | No | Search result locations to display in the dropdown. |
| `showMapLink` | `boolean \| undefined` | No | Whether to show a Google Maps link after selecting a location. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `value` | `string \| undefined` | No | Controlled text value of the search input. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `LocationInputBaseProps` | type | `src/ui/components/forms/location-input/standalone.tsx` |  |
| `LocationInputConfig` | type | `src/ui/components/forms/location-input/types.ts` | Props/config shape for the location input component. |
| `LocationInputFieldProps` | interface | `src/ui/components/forms/location-input/standalone.tsx` |  |
| `LocationResult` | interface | `src/ui/components/forms/location-input/standalone.tsx` |  |

---

### `forms/multi-select`

Forms Multi Select is a code-first Snapshot UI component exported from the UI package.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `MultiSelectBase` | value | `src/ui/components/forms/multi-select/standalone.tsx` |  |
| `MultiSelectField` | component | `src/ui/components/forms/multi-select/standalone.tsx` | Standalone MultiSelectField -- multi-select dropdown with pill tags, inline search, and configurable max selection. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `defaultValue` | `string[] \| undefined` | No | Initial selected values (uncontrolled). |
| `disabled` | `boolean \| undefined` | No | Whether the entire field is disabled. |
| `error` | `string \| null \| undefined` | No | Error message displayed inside the dropdown when options fail to load. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Label text displayed above the select trigger. |
| `loading` | `boolean \| undefined` | No | Whether options are currently loading. |
| `maxSelected` | `number \| undefined` | No | Maximum number of items that can be selected. |
| `onChange` | `((value: string[]) => void) \| undefined` | No | Called when the selection changes. |
| `onRetry` | `(() => void) \| undefined` | No | Called when the user clicks "Retry" after a load error. |
| `options` | `MultiSelectFieldOption[] \| undefined` | No | Available options to choose from. |
| `placeholder` | `string \| undefined` | No | Placeholder text shown when no items are selected. |
| `searchable` | `boolean \| undefined` | No | Whether to show a search input inside the dropdown. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `value` | `string[] \| undefined` | No | Controlled array of selected values. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `MultiSelectBaseProps` | type | `src/ui/components/forms/multi-select/standalone.tsx` |  |
| `MultiSelectConfig` | type | `src/ui/components/forms/multi-select/types.ts` | Inferred config type from the MultiSelect Zod schema. |
| `MultiSelectFieldOption` | interface | `src/ui/components/forms/multi-select/standalone.tsx` |  |
| `MultiSelectFieldProps` | interface | `src/ui/components/forms/multi-select/standalone.tsx` |  |
| `MultiSelectOption` | interface | `src/ui/components/forms/multi-select/types.ts` | Normalized option shape used internally by the component. |

---

### `forms/quick-add`

Forms Quick Add is a code-first Snapshot UI component exported from the UI package.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `QuickAddBase` | value | `src/ui/components/forms/quick-add/standalone.tsx` |  |
| `QuickAddField` | component | `src/ui/components/forms/quick-add/standalone.tsx` | Standalone QuickAddField -- a compact input with submit button for quickly adding items to a list. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `buttonText` | `string \| undefined` | No | Label text for the submit button. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `clearOnSubmit` | `boolean \| undefined` | No | Whether to clear the input after a successful submit. |
| `icon` | `string \| undefined` | No | Icon name displayed before the input. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onSubmit` | `((value: string) => void) \| undefined` | No | Called with the trimmed input value on submit. |
| `placeholder` | `string \| undefined` | No | Placeholder text shown inside the input. |
| `showButton` | `boolean \| undefined` | No | Whether to show the submit button beside the input. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `submitOnEnter` | `boolean \| undefined` | No | Whether pressing Enter submits the value. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `QuickAddBaseProps` | type | `src/ui/components/forms/quick-add/standalone.tsx` |  |
| `QuickAddConfig` | type | `src/ui/components/forms/quick-add/types.ts` | Inferred config type from the QuickAdd Zod schema. |
| `QuickAddFieldProps` | interface | `src/ui/components/forms/quick-add/standalone.tsx` |  |

---

### `forms/select`

Forms Select is a code-first Snapshot UI component exported from the UI package.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SelectBase` | value | `src/ui/components/forms/select/standalone.tsx` |  |
| `SelectControl` | component | `src/ui/components/forms/select/control.tsx` | Low-level styled select element with surface resolution and state management. Used internally by SelectField and other components that need a styled `<select>`. Works with plain React props. |
| `SelectField` | component | `src/ui/components/forms/select/standalone.tsx` | Standalone SelectField -- a complete select form field with label, options, helper/error text, and required indicator. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `defaultValue` | `string \| undefined` | No | Default value (uncontrolled). |
| `disabled` | `boolean \| undefined` | No | Disabled state. |
| `errorText` | `string \| undefined` | No | Error message -- overrides helper text. |
| `helperText` | `string \| undefined` | No | Helper text below the select. |
| `id` | `string \| undefined` | No | Unique identifier. |
| `label` | `string \| undefined` | No | Label text. |
| `loading` | `boolean \| undefined` | No | Whether options are currently loading. |
| `onBlur` | `FocusEventHandler<HTMLSelectElement> \| undefined` | No | Called when the select loses focus. |
| `onChange` | `((value: string) => void) \| undefined` | No | Called when the selected value changes. |
| `onClick` | `MouseEventHandler<HTMLSelectElement> \| undefined` | No | Called when the select is clicked. |
| `onFocus` | `FocusEventHandler<HTMLSelectElement> \| undefined` | No | Called when the select gains focus. |
| `onKeyDown` | `KeyboardEventHandler<HTMLSelectElement> \| undefined` | No | Called on keydown events within the select. |
| `options` | `{ label: string; value: string; }[] \| undefined` | No | Static options to display. |
| `placeholder` | `string \| undefined` | No | Placeholder text shown as disabled first option. |
| `required` | `boolean \| undefined` | No | Whether the field is required. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `value` | `string \| undefined` | No | Controlled value. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SelectBaseProps` | type | `src/ui/components/forms/select/standalone.tsx` |  |
| `SelectConfig` | type | `src/ui/components/forms/select/types.ts` |  |
| `SelectControlProps` | interface | `src/ui/components/forms/select/types.ts` |  |
| `SelectFieldProps` | interface | `src/ui/components/forms/select/standalone.tsx` |  |

---

### `forms/slider`

Forms Slider is a code-first Snapshot UI component exported from the UI package.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SliderBase` | value | `src/ui/components/forms/slider/standalone.tsx` |  |
| `SliderField` | component | `src/ui/components/forms/slider/standalone.tsx` | Standalone SliderField -- a range slider with optional label, value display, limit labels, and dual-thumb range mode. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `defaultValue` | `number \| [number, number] \| undefined` | No | Initial value (number for single, tuple for range). |
| `disabled` | `boolean \| undefined` | No | Whether the slider is disabled. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Label text displayed above the slider. |
| `max` | `number \| undefined` | No | Maximum value of the slider. |
| `min` | `number \| undefined` | No | Minimum value of the slider. |
| `onChange` | `((value: number \| [number, number]) => void) \| undefined` | No | Called when the slider value changes. |
| `range` | `boolean \| undefined` | No | Whether to render a dual-thumb range slider. |
| `showLimits` | `boolean \| undefined` | No | Whether to display min/max labels below the track. |
| `showValue` | `boolean \| undefined` | No | Whether to display the current value beside the label. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `step` | `number \| undefined` | No | Step increment between values. |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `suffix` | `string \| undefined` | No | Unit suffix appended to displayed values (e.g. "%", "px"). |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SliderBaseProps` | type | `src/ui/components/forms/slider/standalone.tsx` |  |
| `SliderConfig` | type | `src/ui/components/forms/slider/types.ts` | Props/config shape for the slider component. |
| `SliderFieldProps` | interface | `src/ui/components/forms/slider/standalone.tsx` |  |

---

### `forms/switch`

Forms Switch is a code-first Snapshot UI component exported from the UI package.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SwitchBase` | value | `src/ui/components/forms/switch/standalone.tsx` |  |
| `SwitchField` | component | `src/ui/components/forms/switch/standalone.tsx` | Standalone SwitchField -- a toggle switch with label, description, and configurable size and color. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `checked` | `boolean \| undefined` | No | Controlled checked state. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `color` | `string \| undefined` | No | Token color name for the active track (e.g. "primary", "success"). |
| `defaultChecked` | `boolean \| undefined` | No | Initial checked state (uncontrolled). |
| `description` | `string \| undefined` | No | Description text displayed below the label. |
| `disabled` | `boolean \| undefined` | No | Whether the switch is disabled. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Label text displayed beside the switch. |
| `onChange` | `((checked: boolean) => void) \| undefined` | No | Called when the switch is toggled. |
| `size` | `'sm' \| 'md' \| 'lg' \| undefined` | No | Size of the switch track and thumb. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SwitchBaseProps` | type | `src/ui/components/forms/switch/standalone.tsx` |  |
| `SwitchConfig` | type | `src/ui/components/forms/switch/types.ts` | Inferred config type from the Switch Zod schema. |
| `SwitchFieldProps` | interface | `src/ui/components/forms/switch/standalone.tsx` |  |

---

### `forms/tag-selector`

Forms Tag Selector is a code-first Snapshot UI component exported from the UI package.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `TagSelectorBase` | value | `src/ui/components/forms/tag-selector/standalone.tsx` |  |
| `TagSelectorField` | component | `src/ui/components/forms/tag-selector/standalone.tsx` | Standalone TagSelectorField -- tag pills with dropdown selection, search filtering, and optional tag creation. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `allowCreate` | `boolean \| undefined` | No | Whether the user can create new tags by typing. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `defaultValue` | `string[] \| undefined` | No | Initial selected tag values (uncontrolled). |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Label text displayed above the tag field. |
| `maxTags` | `number \| undefined` | No | Maximum number of tags that can be selected. |
| `onChange` | `((values: string[]) => void) \| undefined` | No | Called when the tag selection changes. |
| `onCreate` | `((label: string, value: string) => void) \| undefined` | No | Called when the user creates a new tag. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `tags` | `TagSelectorTag[] \| undefined` | No | Available tags to select from. |
| `value` | `string[] \| undefined` | No | Controlled array of selected tag values. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `TagSelectorBaseProps` | type | `src/ui/components/forms/tag-selector/standalone.tsx` |  |
| `TagSelectorConfig` | type | `src/ui/components/forms/tag-selector/types.ts` | Inferred config type from the TagSelector Zod schema. |
| `TagSelectorFieldProps` | interface | `src/ui/components/forms/tag-selector/standalone.tsx` |  |
| `TagSelectorTag` | interface | `src/ui/components/forms/tag-selector/standalone.tsx` |  |

---

### `forms/textarea`

Forms Textarea is a code-first Snapshot UI component exported from the UI package.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `TextareaBase` | value | `src/ui/components/forms/textarea/standalone.tsx` |  |
| `TextareaControl` | component | `src/ui/components/forms/textarea/control.tsx` | Low-level styled textarea element with surface resolution and state management. Used internally by TextareaField and other components that need a styled `<textarea>`. Works with plain React props. |
| `TextareaField` | component | `src/ui/components/forms/textarea/standalone.tsx` | Standalone TextareaField -- a complete textarea form field with label, character counter, validation, and helper/error text. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `disabled` | `boolean \| undefined` | No | Whether the textarea is disabled. |
| `errorText` | `string \| undefined` | No | Error message displayed below the textarea, replacing helper text. |
| `helperText` | `string \| undefined` | No | Helper text displayed below the textarea when there is no error. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Label text displayed above the textarea. |
| `maxLength` | `number \| undefined` | No | Maximum character length with counter display. |
| `onBlur` | `FocusEventHandler<HTMLTextAreaElement> \| undefined` | No | Called when the textarea loses focus. |
| `onChange` | `((value: string) => void) \| undefined` | No | Called when the textarea value changes. |
| `onClick` | `MouseEventHandler<HTMLTextAreaElement> \| undefined` | No | Called when the textarea is clicked. |
| `onFocus` | `FocusEventHandler<HTMLTextAreaElement> \| undefined` | No | Called when the textarea gains focus. |
| `onKeyDown` | `KeyboardEventHandler<HTMLTextAreaElement> \| undefined` | No | Called on keydown events within the textarea. |
| `placeholder` | `string \| undefined` | No | Placeholder text shown inside the textarea. |
| `readOnly` | `boolean \| undefined` | No | Whether the textarea is read-only. |
| `required` | `boolean \| undefined` | No | Whether the field is required. |
| `resize` | `'vertical' \| 'horizontal' \| 'both' \| 'none' \| undefined` | No | CSS resize behavior of the textarea. |
| `rows` | `number \| undefined` | No | Number of visible text rows. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `value` | `string \| undefined` | No | Controlled value of the textarea. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `TextareaBaseProps` | type | `src/ui/components/forms/textarea/standalone.tsx` |  |
| `TextareaConfig` | interface | `src/ui/components/forms/textarea/types.ts` |  |
| `TextareaControlProps` | interface | `src/ui/components/forms/textarea/types.ts` |  |
| `TextareaFieldProps` | interface | `src/ui/components/forms/textarea/standalone.tsx` |  |

---

### `forms/toggle`

Forms Toggle is a code-first Snapshot UI component exported from the UI package.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ToggleBase` | value | `src/ui/components/forms/toggle/standalone.tsx` |  |
| `ToggleField` | component | `src/ui/components/forms/toggle/standalone.tsx` | Standalone ToggleField -- a pressable toggle button with optional icon and label. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `defaultPressed` | `boolean \| undefined` | No | Initial pressed state (uncontrolled). |
| `disabled` | `boolean \| undefined` | No | Whether the toggle is disabled. |
| `icon` | `string \| undefined` | No | Icon name rendered beside the label. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Label text displayed inside the toggle button. |
| `onChange` | `((pressed: boolean) => void) \| undefined` | No | Called when the toggle is pressed or released. |
| `pressed` | `boolean \| undefined` | No | Controlled pressed state. Maps to `aria-pressed` on the rendered button. |
| `size` | `'sm' \| 'md' \| 'lg' \| undefined` | No | Size of the toggle button. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `variant` | `'default' \| 'outline' \| undefined` | No | Visual variant of the toggle button. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ToggleBaseProps` | type | `src/ui/components/forms/toggle/standalone.tsx` |  |
| `ToggleConfig` | type | `src/ui/components/forms/toggle/types.ts` | Inferred config type from the Toggle Zod schema. |
| `ToggleFieldProps` | interface | `src/ui/components/forms/toggle/standalone.tsx` |  |

---

### `forms/toggle-group`

Standalone ToggleGroupBase -- a group of toggle buttons supporting single
or multi-select modes. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ToggleGroupBase` | component | `src/ui/components/forms/toggle-group/standalone.tsx` | Standalone ToggleGroupBase -- a group of toggle buttons supporting single or multi-select modes. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `items` | `ToggleGroupItem[]` | Yes | Array of toggle items to render in the group. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `defaultValue` | `string \| string[] \| undefined` | No | Initial selected value(s) (uncontrolled). |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `mode` | `'single' \| 'multiple' \| undefined` | No | Selection mode: single exclusive or multiple simultaneous. |
| `onChange` | `((value: string \| string[]) => void) \| undefined` | No | Called when the selection changes. |
| `size` | `'sm' \| 'md' \| 'lg' \| undefined` | No | Size applied to all items in the group. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `value` | `string \| string[] \| undefined` | No | Controlled selected value(s). |
| `variant` | `'ghost' \| 'outline' \| undefined` | No | Visual variant of the group container. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ToggleGroupBaseProps` | interface | `src/ui/components/forms/toggle-group/standalone.tsx` |  |
| `ToggleGroupConfig` | type | `src/ui/components/forms/toggle-group/types.ts` |  |
| `ToggleGroupItem` | interface | `src/ui/components/forms/toggle-group/standalone.tsx` |  |

---

### `forms/wizard`

Standalone WizardBase -- a multi-step form wizard with progress indicator,
step navigation, field validation, and completion state. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `WizardBase` | component | `src/ui/components/forms/wizard/standalone.tsx` | Standalone WizardBase -- a multi-step form wizard with progress indicator, step navigation, field validation, and completion state. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `state` | `WizardState` | Yes | Wizard state object (from useWizard hook or custom implementation). |
| `steps` | `WizardStepDef[]` | Yes | Array of step definitions with fields and metadata. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `submitLabel` | `string \| undefined` | No | Label for the final submit button on the last step. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `UseWizardResult` | interface | `src/ui/components/forms/wizard/types.ts` | Return type of the useWizard headless hook. |
| `WizardBaseProps` | interface | `src/ui/components/forms/wizard/standalone.tsx` |  |
| `WizardConfig` | type | `src/ui/components/forms/wizard/types.ts` | Inferred type for the Wizard component configuration. |
| `WizardFieldConfig` | interface | `src/ui/components/forms/wizard/standalone.tsx` |  |
| `WizardState` | interface | `src/ui/components/forms/wizard/standalone.tsx` |  |
| `WizardStepConfig` | type | `src/ui/components/forms/wizard/types.ts` | Inferred type for a single wizard step configuration. |
| `WizardStepDef` | interface | `src/ui/components/forms/wizard/standalone.tsx` |  |

---

## Data Display

### `data/alert`

Standalone Alert — a styled alert/notification box with optional icon,
action button, and dismiss. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `AlertBase` | component | `src/ui/components/data/alert/standalone.tsx` | Standalone Alert — a styled alert/notification box with optional icon, action button, and dismiss. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `actionLabel` | `string \| undefined` | No | Label for the action button. |
| `children` | `ReactNode` | No | React children — rendered after description. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `description` | `string \| undefined` | No | Alert description text. |
| `dismissible` | `boolean \| undefined` | No | Whether the alert can be dismissed. |
| `icon` | `string \| null \| undefined` | No | Override the default icon for the variant. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onAction` | `(() => void) \| undefined` | No | Callback when the action button is clicked. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `title` | `string \| undefined` | No | Alert title. |
| `variant` | `'warning' \| 'info' \| 'default' \| 'success' \| 'destructive' \| undefined` | No | Variant — controls color accent and default icon. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `AlertBaseProps` | interface | `src/ui/components/data/alert/standalone.tsx` |  |
| `AlertConfig` | type | `src/ui/components/data/alert/types.ts` | Inferred config type from the Alert Zod schema. |

---

### `data/avatar`

Standalone Avatar — image, initials, or icon fallback.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `AvatarBase` | component | `src/ui/components/data/avatar/standalone.tsx` | Standalone Avatar — image, initials, or icon fallback. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `alt` | `string \| undefined` | No | Alt text for the image. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `color` | `string \| undefined` | No | Semantic color token for background. |
| `icon` | `string \| undefined` | No | Fallback icon name. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `name` | `string \| undefined` | No | Display name — used for initials fallback. |
| `shape` | `'circle' \| 'square' \| undefined` | No | Shape variant. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xs' \| 'xl' \| undefined` | No | Size variant. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, image, initials, icon, fallback, status). |
| `src` | `string \| undefined` | No | Image source URL. |
| `status` | `'online' \| 'offline' \| 'busy' \| 'away' \| undefined` | No | Online status indicator. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `AvatarBaseProps` | interface | `src/ui/components/data/avatar/standalone.tsx` |  |
| `AvatarConfig` | type | `src/ui/components/data/avatar/types.ts` | Inferred config type from the Avatar Zod schema. |

---

### `data/avatar-group`

Standalone AvatarGroup — overlapping avatars with +N overflow.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `AvatarGroupBase` | component | `src/ui/components/data/avatar-group/standalone.tsx` | Standalone AvatarGroup — overlapping avatars with +N overflow. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `avatars` | `AvatarGroupBaseAvatar[]` | Yes | Array of avatars to display. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `max` | `number \| undefined` | No | Maximum number of avatars to display before +N overflow. |
| `overlap` | `number \| undefined` | No | Overlap in pixels between adjacent avatars. |
| `size` | `'sm' \| 'md' \| 'lg' \| undefined` | No | Size variant. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, item, image, initials, overflow). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `AvatarGroupBaseAvatar` | interface | `src/ui/components/data/avatar-group/standalone.tsx` |  |
| `AvatarGroupBaseProps` | interface | `src/ui/components/data/avatar-group/standalone.tsx` |  |
| `AvatarGroupConfig` | type | `src/ui/components/data/avatar-group/types.ts` | Inferred config type from the AvatarGroup Zod schema. |

---

### `data/badge`

Standalone Badge — a small label with color-coded variants.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `BadgeBase` | component | `src/ui/components/data/badge/standalone.tsx` | Standalone Badge — a small label with color-coded variants. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `text` | `string` | Yes | Badge text. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `color` | `string \| undefined` | No | Semantic color token. |
| `icon` | `string \| undefined` | No | Optional icon name. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `rounded` | `boolean \| undefined` | No | Whether corners are fully rounded. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xs' \| undefined` | No | Size variant. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, dot, icon, label). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `variant` | `'dot' \| 'solid' \| 'soft' \| 'outline' \| undefined` | No | Visual variant. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `BadgeBaseProps` | interface | `src/ui/components/data/badge/standalone.tsx` |  |
| `BadgeConfig` | type | `src/ui/components/data/badge/types.ts` | Inferred config type from the Badge Zod schema. |

---

### `data/chart`

Standalone Chart — renders data-driven charts via recharts.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ChartBase` | component | `src/ui/components/data/chart/standalone.tsx` | Standalone Chart — renders data-driven charts via recharts. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `chartType` | `'bar' \| 'donut' \| 'line' \| 'area' \| 'pie' \| 'radar' \| 'scatter' \| 'treemap' \| 'funnel' \| 'sparkline'` | Yes | Chart type. |
| `data` | `Record<string, unknown>[]` | Yes | Chart data rows. |
| `series` | `ChartBaseSeries[]` | Yes | Series definitions. |
| `xKey` | `string` | Yes | Key for the X axis. |
| `aspectRatio` | `string \| undefined` | No | Aspect ratio. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `emptyMessage` | `string \| undefined` | No | Text shown when data is empty. |
| `error` | `string \| null \| undefined` | No | Error message. |
| `grid` | `boolean \| undefined` | No | Whether to show the grid. |
| `hasNewData` | `boolean \| undefined` | No | Whether new data is available (for live updates). |
| `height` | `string \| number \| undefined` | No | Chart container height. |
| `hideWhenEmpty` | `boolean \| undefined` | No | Whether to hide when empty. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `isLoading` | `boolean \| undefined` | No | Whether the chart is loading. |
| `legend` | `boolean \| undefined` | No | Whether to show the legend. |
| `loadingContent` | `ReactNode` | No | Custom loading content. |
| `onPointClick` | `((payload: Record<string, unknown>, seriesKey?: string) => void) \| undefined` | No | Callback when a chart point is clicked. |
| `onRefresh` | `(() => void) \| undefined` | No | Callback to refresh data. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, legend, legendItem, tooltip, axis, grid). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ChartBaseProps` | interface | `src/ui/components/data/chart/standalone.tsx` |  |
| `ChartBaseSeries` | interface | `src/ui/components/data/chart/standalone.tsx` |  |
| `ChartConfig` | type | `src/ui/components/data/chart/types.ts` | Inferred type for the Chart component configuration. |
| `SeriesConfig` | type | `src/ui/components/data/chart/types.ts` | Inferred type for a single chart series config. |

---

### `data/data-table`

Standalone DataTable — feature-rich data table with sorting, pagination,
selection, and search. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DataTableBase` | component | `src/ui/components/data/data-table/standalone.tsx` | Standalone DataTable — feature-rich data table with sorting, pagination, selection, and search. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `columns` | `DataTableBaseColumn[]` | Yes | Column definitions. |
| `rows` | `Record<string, unknown>[]` | Yes | Row data. |
| `bulkActions` | `DataTableBaseBulkAction[] \| undefined` | No | Bulk actions. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `compact` | `boolean \| undefined` | No | Whether the table is compact. |
| `emptyContent` | `React.ReactNode` | No | Custom empty content. |
| `emptyMessage` | `string \| undefined` | No | Empty state message. |
| `error` | `string \| null \| undefined` | No | Error message. |
| `errorContent` | `React.ReactNode` | No | Custom error content. |
| `hasNewData` | `boolean \| undefined` | No | Whether new data is available. |
| `hoverable` | `boolean \| undefined` | No | Whether the table has hoverable rows. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `isLoading` | `boolean \| undefined` | No | Whether data is loading. |
| `loadingContent` | `React.ReactNode` | No | Custom loading content. |
| `onPageChange` | `((page: number) => void) \| undefined` | No | Callback to go to a page. |
| `onRefresh` | `(() => void) \| undefined` | No | Callback to refresh data. |
| `onRowClick` | `((row: Record<string, unknown>) => void) \| undefined` | No | Callback when a row is clicked. |
| `onSearchChange` | `((query: string) => void) \| undefined` | No | Callback when search changes. |
| `onSortChange` | `((column: string) => void) \| undefined` | No | Callback when sort changes. |
| `onToggleAll` | `(() => void) \| undefined` | No | Toggle all row selection. |
| `onToggleRow` | `((id: string \| number) => void) \| undefined` | No | Toggle row selection. |
| `pagination` | `DataTableBasePagination \| null \| undefined` | No | Pagination state. |
| `rowActions` | `DataTableBaseRowAction[] \| undefined` | No | Row actions. |
| `rowIdField` | `string \| undefined` | No | Row ID field. |
| `search` | `string \| undefined` | No | Current search query. |
| `searchable` | `boolean \| undefined` | No | Whether search is enabled. |
| `searchPlaceholder` | `string \| undefined` | No | Search input placeholder text. |
| `selectable` | `boolean \| undefined` | No | Whether row selection is enabled. |
| `selectedRows` | `Record<string, unknown>[] \| undefined` | No | Selected rows for bulk actions. |
| `selection` | `Set<string \| number> \| undefined` | No | Selected row IDs. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, headerCell, pagination). |
| `sort` | `DataTableBaseSort \| null \| undefined` | No | Sort state. |
| `striped` | `boolean \| undefined` | No | Whether the table is striped. |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `toolbarContent` | `React.ReactNode` | No | Custom toolbar content rendered above the table. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `BulkAction` | type | `src/ui/components/data/data-table/types.ts` | Inferred bulk action type. |
| `ColumnConfig` | type | `src/ui/components/data/data-table/types.ts` | Inferred column configuration type. |
| `DataTableBaseBulkAction` | interface | `src/ui/components/data/data-table/standalone.tsx` |  |
| `DataTableBaseColumn` | interface | `src/ui/components/data/data-table/standalone.tsx` |  |
| `DataTableBasePagination` | interface | `src/ui/components/data/data-table/standalone.tsx` |  |
| `DataTableBaseProps` | interface | `src/ui/components/data/data-table/standalone.tsx` |  |
| `DataTableBaseRowAction` | interface | `src/ui/components/data/data-table/standalone.tsx` |  |
| `DataTableBaseSort` | interface | `src/ui/components/data/data-table/standalone.tsx` |  |
| `DataTableConfig` | type | `src/ui/components/data/data-table/types.ts` | Inferred DataTable configuration type from the Zod schema. |
| `PaginationState` | interface | `src/ui/components/data/data-table/types.ts` | Pagination state for the data table. |
| `ResolvedColumn` | interface | `src/ui/components/data/data-table/types.ts` | Resolved column definition used internally by the hook and component. |
| `RowAction` | type | `src/ui/components/data/data-table/types.ts` | Inferred row action type. |
| `SortState` | interface | `src/ui/components/data/data-table/types.ts` | Sort state for the data table. |
| `UseDataTableResult` | interface | `src/ui/components/data/data-table/types.ts` | Return type of the `useDataTable` headless hook. Provides all state and handlers needed to render a data table. |

---

### `data/detail-card`

Standalone DetailCard — data-driven detail view with formatted fields
and header actions. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DetailCardBase` | component | `src/ui/components/data/detail-card/standalone.tsx` | Standalone DetailCard — data-driven detail view with formatted fields and header actions. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `data` | `Record<string, unknown> \| null` | Yes | Record data to display (null = empty state). |
| `fields` | `DetailCardBaseField[]` | Yes | Fields to display. |
| `actions` | `DetailCardBaseAction[] \| undefined` | No | Header actions. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `emptyMessage` | `string \| undefined` | No | Empty state message. |
| `error` | `React.ReactNode` | No | Error message or node. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `isLoading` | `boolean \| undefined` | No | Whether data is loading. |
| `loadingContent` | `React.ReactNode` | No | Custom loading content. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (panel, header, title, actions, fields, field, fieldLabel, fieldValue). |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `title` | `string \| undefined` | No | Card title. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DetailCardAction` | type | `src/ui/components/data/detail-card/types.ts` |  |
| `DetailCardActionSlotName` | type | `src/ui/components/data/detail-card/types.ts` |  |
| `DetailCardBaseAction` | interface | `src/ui/components/data/detail-card/standalone.tsx` |  |
| `DetailCardBaseField` | interface | `src/ui/components/data/detail-card/standalone.tsx` |  |
| `DetailCardBaseProps` | interface | `src/ui/components/data/detail-card/standalone.tsx` |  |
| `DetailCardConfig` | type | `src/ui/components/data/detail-card/types.ts` |  |
| `DetailCardFieldSlotName` | type | `src/ui/components/data/detail-card/types.ts` |  |
| `DetailCardSlotName` | type | `src/ui/components/data/detail-card/types.ts` |  |
| `DetailFieldConfig` | interface | `src/ui/components/data/detail-card/types.ts` |  |
| `DetailFieldFormat` | type | `src/ui/components/data/detail-card/types.ts` |  |
| `ResolvedField` | interface | `src/ui/components/data/detail-card/types.ts` | A resolved field ready for rendering — includes the raw value, display label, and format. |
| `UseDetailCardResult` | interface | `src/ui/components/data/detail-card/types.ts` | Return type of the useDetailCard hook. |

#### Helpers

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DetailCardActionSlotNames` | value | `src/ui/components/data/detail-card/types.ts` |  |
| `DetailCardFieldSlotNames` | value | `src/ui/components/data/detail-card/types.ts` |  |
| `DetailCardSlotNames` | value | `src/ui/components/data/detail-card/types.ts` |  |

---

### `data/empty-state`

Standalone EmptyState — a centered message with optional icon and action.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `EmptyStateBase` | component | `src/ui/components/data/empty-state/standalone.tsx` | Standalone EmptyState — a centered message with optional icon and action. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `title` | `string` | Yes | Title text. |
| `actionLabel` | `string \| undefined` | No | Action button label. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `description` | `string \| undefined` | No | Description text. |
| `icon` | `string \| undefined` | No | Icon name. |
| `iconColor` | `string \| undefined` | No | Icon color token. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onAction` | `(() => void) \| undefined` | No | Callback when the action button is clicked. |
| `size` | `'sm' \| 'md' \| 'lg' \| undefined` | No | Size variant. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, icon, title, description, action). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `EmptyStateBaseProps` | interface | `src/ui/components/data/empty-state/standalone.tsx` |  |
| `EmptyStateConfig` | type | `src/ui/components/data/empty-state/types.ts` | Inferred config type from the EmptyState Zod schema. |

---

### `data/entity-picker`

Standalone EntityPicker — dropdown with search, single/multi select.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `EntityPickerBase` | component | `src/ui/components/data/entity-picker/standalone.tsx` | Standalone EntityPicker — dropdown with search, single/multi select. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `entities` | `EntityPickerEntity[]` | Yes | List of selectable entities. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `error` | `string \| undefined` | No | Error message to display. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `isLoading` | `boolean \| undefined` | No | Whether data is loading. |
| `label` | `string \| undefined` | No | Label text shown on the trigger button. |
| `maxHeight` | `string \| undefined` | No | Max height of the dropdown list. |
| `multiple` | `boolean \| undefined` | No | Whether multiple selection is allowed. |
| `onChange` | `((value: string \| string[]) => void) \| undefined` | No | Callback when selection changes. |
| `searchable` | `boolean \| undefined` | No | Whether the search input is shown. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, trigger, dropdown, item, searchContainer, list). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `value` | `string \| string[] \| undefined` | No | Currently selected value(s). |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `EntityPickerBaseProps` | interface | `src/ui/components/data/entity-picker/standalone.tsx` |  |
| `EntityPickerConfig` | type | `src/ui/components/data/entity-picker/types.ts` | Inferred config type from the EntityPicker Zod schema. |
| `EntityPickerEntity` | interface | `src/ui/components/data/entity-picker/standalone.tsx` |  |

---

### `data/favorite-button`

Standalone FavoriteButton — a toggle button with a star icon.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `FavoriteButtonBase` | component | `src/ui/components/data/favorite-button/standalone.tsx` | Standalone FavoriteButton — a toggle button with a star icon. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `active` | `boolean \| undefined` | No | Whether the button is active (favorited). |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onToggle` | `((active: boolean) => void) \| undefined` | No | Callback when the button is toggled. |
| `size` | `'sm' \| 'md' \| 'lg' \| undefined` | No | Size variant. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, icon). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `FavoriteButtonBaseProps` | interface | `src/ui/components/data/favorite-button/standalone.tsx` |  |
| `FavoriteButtonConfig` | type | `src/ui/components/data/favorite-button/types.ts` | Inferred config type from the FavoriteButton Zod schema. |

---

### `data/feed`

Standalone Feed — feed/activity list with grouping, pagination, and
live updates. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `FeedBase` | component | `src/ui/components/data/feed/standalone.tsx` | Standalone Feed — feed/activity list with grouping, pagination, and live updates. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `items` | `FeedBaseItem[]` | Yes | Feed items to display. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `emptyMessage` | `string \| undefined` | No | Text shown when feed is empty. |
| `error` | `string \| null \| undefined` | No | Error message. |
| `groupBy` | `'day' \| 'week' \| 'month' \| undefined` | No | Grouping mode. |
| `hasNewData` | `boolean \| undefined` | No | Whether new data is available. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `infinite` | `boolean \| undefined` | No | Whether to use infinite scroll. |
| `isLoading` | `boolean \| undefined` | No | Whether the feed is loading. |
| `itemActions` | `FeedBaseItemAction[] \| undefined` | No | Item actions. |
| `loadingContent` | `ReactNode` | No | Custom loading content. |
| `onRefresh` | `(() => void) \| undefined` | No | Callback to refresh data. |
| `onSelectItem` | `((item: Record<string, unknown>) => void) \| undefined` | No | Callback when an item is selected. |
| `pageSize` | `number \| undefined` | No | Page size for pagination. |
| `relativeTime` | `boolean \| undefined` | No | Whether to show relative timestamps. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, item, title, description, timestamp, badge, actions). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `FeedBaseItem` | interface | `src/ui/components/data/feed/standalone.tsx` |  |
| `FeedBaseItemAction` | interface | `src/ui/components/data/feed/standalone.tsx` |  |
| `FeedBaseProps` | interface | `src/ui/components/data/feed/standalone.tsx` |  |
| `FeedConfig` | type | `src/ui/components/data/feed/types.ts` | Inferred type for the Feed component config (from Zod schema). |
| `FeedItem` | interface | `src/ui/components/data/feed/types.ts` | A single resolved feed item for rendering. |
| `UseFeedResult` | interface | `src/ui/components/data/feed/types.ts` | Return type of the useFeed headless hook. |

---

### `data/filter-bar`

Standalone FilterBar — search + filter dropdowns + active pills.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `FilterBarBase` | component | `src/ui/components/data/filter-bar/standalone.tsx` | Standalone FilterBar — search + filter dropdowns + active pills. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `filters` | `FilterBarFilter[]` | Yes | Filter definitions. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onChange` | `((state: { search: string; filters: FilterState; }) => void) \| undefined` | No | Callback when search or filters change. |
| `searchPlaceholder` | `string \| undefined` | No | Search input placeholder text. |
| `showSearch` | `boolean \| undefined` | No | Whether to show the search input. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, toolbar, search, dropdown, pill, filterButton). |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `FilterBarBaseProps` | interface | `src/ui/components/data/filter-bar/standalone.tsx` |  |
| `FilterBarConfig` | type | `src/ui/components/data/filter-bar/types.ts` | Inferred config type for the FilterBar component. |
| `FilterBarFilter` | interface | `src/ui/components/data/filter-bar/standalone.tsx` |  |

---

### `data/highlighted-text`

Standalone HighlightedText — renders text with search query highlighting.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `HighlightedTextBase` | component | `src/ui/components/data/highlighted-text/standalone.tsx` | Standalone HighlightedText — renders text with search query highlighting. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `text` | `string` | Yes | The text to display. |
| `caseSensitive` | `boolean \| undefined` | No | Whether the highlight matching is case-sensitive. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `highlight` | `string \| undefined` | No | The search query to highlight. |
| `highlightColor` | `string \| undefined` | No | Highlight background color. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, mark). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `HighlightedTextBaseProps` | interface | `src/ui/components/data/highlighted-text/standalone.tsx` |  |
| `HighlightedTextConfig` | type | `src/ui/components/data/highlighted-text/types.ts` | Inferred config type from the HighlightedText Zod schema. |

---

### `data/list`

Standalone List — renders a vertical list of items with optional icons,
descriptions, badges, and click actions. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ListBase` | component | `src/ui/components/data/list/standalone.tsx` | Standalone List — renders a vertical list of items with optional icons, descriptions, badges, and click actions. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `items` | `ListBaseItem[]` | Yes | List items. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `divider` | `boolean \| undefined` | No | Whether to show dividers between items. |
| `emptyContent` | `React.ReactNode` | No | Custom empty content. |
| `emptyMessage` | `string \| undefined` | No | Empty state message. |
| `error` | `string \| null \| undefined` | No | Error message. |
| `errorContent` | `React.ReactNode` | No | Custom error content. |
| `hasNewData` | `boolean \| undefined` | No | Whether new data is available. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `isLoading` | `boolean \| undefined` | No | Whether the list is loading. |
| `limit` | `number \| undefined` | No | Maximum number of items to show. |
| `loadingContent` | `React.ReactNode` | No | Custom loading content. |
| `onRefresh` | `(() => void) \| undefined` | No | Callback to refresh data. |
| `selectable` | `boolean \| undefined` | No | Whether items are selectable/clickable. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, list, item, itemIcon, itemTitle, itemDescription, itemBadge, divider). |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `variant` | `'default' \| 'bordered' \| 'card' \| undefined` | No | Visual variant. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ListBaseItem` | interface | `src/ui/components/data/list/standalone.tsx` |  |
| `ListBaseProps` | interface | `src/ui/components/data/list/standalone.tsx` |  |
| `ListConfig` | type | `src/ui/components/data/list/types.ts` | Inferred config type from the List Zod schema. |
| `ListItemConfig` | type | `src/ui/components/data/list/types.ts` | Inferred type for a single static list item. |

---

### `data/notification-bell`

Standalone NotificationBell — bell icon with unread count badge.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NotificationBellBase` | component | `src/ui/components/data/notification-bell/standalone.tsx` | Standalone NotificationBell — bell icon with unread count badge. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `ariaLive` | `'polite' \| 'assertive' \| 'off' \| undefined` | No | ARIA live region behavior. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `count` | `number \| undefined` | No | Unread notification count. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `max` | `number \| undefined` | No | Maximum count before showing "N+". |
| `onClick` | `(() => void) \| undefined` | No | Callback when the bell is clicked. |
| `size` | `'sm' \| 'md' \| 'lg' \| undefined` | No | Size variant. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, button, badge). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NotificationBellBaseProps` | interface | `src/ui/components/data/notification-bell/standalone.tsx` |  |
| `NotificationBellConfig` | type | `src/ui/components/data/notification-bell/types.ts` | Inferred config type from the NotificationBell Zod schema. |

---

### `data/progress`

Standalone Progress — bar or circular progress indicator.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ProgressBase` | component | `src/ui/components/data/progress/standalone.tsx` | Standalone Progress — bar or circular progress indicator. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `color` | `string \| undefined` | No | Color token for the fill. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Label text. |
| `max` | `number \| undefined` | No | Maximum value. Default: 100. |
| `segments` | `number \| undefined` | No | Number of segments (bar variant only). |
| `showValue` | `boolean \| undefined` | No | Whether to show the percentage value. |
| `size` | `'sm' \| 'md' \| 'lg' \| undefined` | No | Size variant. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, track, fill, label, value, labelRow, segment). |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `value` | `number \| undefined` | No | Current value. undefined = indeterminate. |
| `variant` | `'bar' \| 'circular' \| undefined` | No | Visual variant. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ProgressBaseProps` | interface | `src/ui/components/data/progress/standalone.tsx` |  |
| `ProgressConfig` | type | `src/ui/components/data/progress/types.ts` | Inferred config type from the Progress Zod schema. |

---

### `data/save-indicator`

Standalone SaveIndicator — shows saving/saved/error status.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SaveIndicatorBase` | component | `src/ui/components/data/save-indicator/standalone.tsx` | Standalone SaveIndicator — shows saving/saved/error status. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `status` | `'idle' \| 'saving' \| 'saved' \| 'error'` | Yes | Current save status. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `errorText` | `string \| undefined` | No | Text shown on error. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `savedText` | `string \| undefined` | No | Text shown when saved. |
| `savingText` | `string \| undefined` | No | Text shown while saving. |
| `showIcon` | `boolean \| undefined` | No | Whether to show the status icon. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, icon, label). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SaveIndicatorBaseProps` | interface | `src/ui/components/data/save-indicator/standalone.tsx` |  |
| `SaveIndicatorConfig` | type | `src/ui/components/data/save-indicator/types.ts` | Inferred config type from the SaveIndicator Zod schema. |

---

### `data/scroll-area`

Standalone ScrollArea — a scrollable container with custom-styled thin
scrollbars. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ScrollAreaBase` | component | `src/ui/components/data/scroll-area/standalone.tsx` | Standalone ScrollArea — a scrollable container with custom-styled thin scrollbars. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `children` | `ReactNode` | No | Child content. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `maxHeight` | `string \| undefined` | No | Maximum height of the scroll area. |
| `maxWidth` | `string \| undefined` | No | Maximum width of the scroll area. |
| `orientation` | `'vertical' \| 'horizontal' \| 'both' \| undefined` | No | Scroll orientation. |
| `showScrollbar` | `'auto' \| 'always' \| 'hover' \| undefined` | No | Scrollbar visibility behavior. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, viewport). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ScrollAreaBaseProps` | interface | `src/ui/components/data/scroll-area/standalone.tsx` |  |
| `ScrollAreaConfig` | type | `src/ui/components/data/scroll-area/types.ts` | Inferred config type for the ScrollArea component. |

---

### `data/separator`

Standalone Separator — a horizontal or vertical line with optional label.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SeparatorBase` | component | `src/ui/components/data/separator/standalone.tsx` | Standalone Separator — a horizontal or vertical line with optional label. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Optional label text displayed in the center of the separator. |
| `orientation` | `'vertical' \| 'horizontal' \| undefined` | No | Orientation of the separator. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, line, label). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SeparatorBaseProps` | interface | `src/ui/components/data/separator/standalone.tsx` |  |
| `SeparatorConfig` | type | `src/ui/components/data/separator/types.ts` | Inferred config type for the Separator component. |

---

### `data/skeleton`

Standalone Skeleton — a placeholder loading indicator.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SkeletonBase` | component | `src/ui/components/data/skeleton/standalone.tsx` | Standalone Skeleton — a placeholder loading indicator. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `animated` | `boolean \| undefined` | No | Whether the skeleton pulses. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `height` | `string \| number \| undefined` | No | Height (CSS value or number in px). |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `lines` | `number \| undefined` | No | Number of lines for the text variant. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, shape, line, title, body). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `variant` | `'card' \| 'circular' \| 'text' \| 'rectangular' \| undefined` | No | Skeleton variant. |
| `width` | `string \| number \| undefined` | No | Width (CSS value or number in px). |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SkeletonBaseProps` | interface | `src/ui/components/data/skeleton/standalone.tsx` |  |
| `SkeletonConfig` | type | `src/ui/components/data/skeleton/types.ts` | Inferred config type from the Skeleton Zod schema. |

---

### `data/stat-card`

Standalone StatCard — displays a single metric with optional trend indicator.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `StatCardBase` | component | `src/ui/components/data/stat-card/standalone.tsx` | Standalone StatCard — displays a single metric with optional trend indicator. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `label` | `string` | Yes | Label text. |
| `value` | `string \| null` | Yes | Formatted display value. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `emptyMessage` | `string \| undefined` | No | Empty state message. |
| `error` | `string \| null \| undefined` | No | Error message. |
| `icon` | `string \| undefined` | No | Icon name. |
| `iconColor` | `string \| undefined` | No | Icon color token. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `isLoading` | `boolean \| undefined` | No | Whether data is loading. |
| `loadingVariant` | `'skeleton' \| 'pulse' \| undefined` | No | Loading variant. |
| `onClick` | `(() => void) \| undefined` | No | Callback when the card is clicked. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, label, value, valueRow, icon, trend, loading, error, empty). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `trend` | `StatCardTrend \| null \| undefined` | No | Trend indicator. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `StatCardBaseProps` | interface | `src/ui/components/data/stat-card/standalone.tsx` |  |
| `StatCardConfig` | type | `src/ui/components/data/stat-card/types.ts` | Inferred config type from the StatCard Zod schema. |
| `StatCardTrend` | interface | `src/ui/components/data/stat-card/standalone.tsx` |  |
| `UseStatCardResult` | interface | `src/ui/components/data/stat-card/types.ts` | Result returned by the StatCard headless hook or internal logic. Provides all the data needed to render a stat card. |

---

### `data/tooltip`

Standalone Tooltip — wraps child content and shows informational text
on hover with configurable placement and delay. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `TooltipBase` | component | `src/ui/components/data/tooltip/standalone.tsx` | Standalone Tooltip — wraps child content and shows informational text on hover with configurable placement and delay. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `text` | `string` | Yes | Tooltip text. |
| `children` | `React.ReactNode` | No | Child content that triggers the tooltip on hover. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `delay` | `number \| undefined` | No | Delay before showing tooltip (ms). |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `placement` | `'left' \| 'right' \| 'top' \| 'bottom' \| undefined` | No | Tooltip placement relative to the trigger element. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, content, arrow). |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `TooltipBaseProps` | interface | `src/ui/components/data/tooltip/standalone.tsx` |  |
| `TooltipConfig` | type | `src/ui/components/data/tooltip/types.ts` | Inferred config type from the Tooltip Zod schema. |

---

### `data/vote`

Standalone Vote — upvote/downvote toggle with count display.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `VoteBase` | component | `src/ui/components/data/vote/standalone.tsx` | Standalone Vote — upvote/downvote toggle with count display. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onDownvote` | `(() => void) \| undefined` | No | Callback when downvote is clicked. |
| `onUpvote` | `(() => void) \| undefined` | No | Callback when upvote is clicked. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, upvote, value, downvote). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `value` | `number \| undefined` | No | Current vote count. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `VoteBaseProps` | interface | `src/ui/components/data/vote/standalone.tsx` |  |
| `VoteConfig` | type | `src/ui/components/data/vote/types.ts` | Inferred config type from the Vote Zod schema. |

---

## Content

### `content/banner`

Standalone Banner — a full-width hero section with background, overlay,
and content alignment. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `BannerBase` | component | `src/ui/components/content/banner/standalone.tsx` | Standalone Banner — a full-width hero section with background, overlay, and content alignment. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `align` | `'left' \| 'right' \| 'center' \| undefined` | No | Content alignment. Default: "center". |
| `background` | `{ image?: string; color?: string; overlay?: string; } \| undefined` | No | Background configuration. |
| `children` | `ReactNode` | No | React children rendered as banner content. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `height` | `string \| undefined` | No | Minimum height of the banner (CSS value). Default: "50vh". |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, overlay, content). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `BannerBaseProps` | interface | `src/ui/components/content/banner/standalone.tsx` |  |
| `BannerConfig` | type | `src/ui/components/content/banner/types.ts` | Inferred config type from the Banner Zod schema. |

---

### `content/code`

Standalone Code — an inline code element for displaying code snippets
within flowing text. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CodeBase` | component | `src/ui/components/content/code/standalone.tsx` | Standalone Code — an inline code element for displaying code snippets within flowing text. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `value` | `string` | Yes | The code text to display. |
| `className` | `string \| undefined` | No | className applied to the root element. |
| `fallback` | `string \| undefined` | No | Fallback text when value is empty. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root element. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CodeBaseProps` | interface | `src/ui/components/content/code/standalone.tsx` |  |
| `CodeConfig` | type | `src/ui/components/content/code/types.ts` | Inferred config type for the Code component. |

---

### `content/code-block`

Standalone CodeBlock — displays code with syntax highlighting,
optional line numbers, copy button, and title bar.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CodeBlockBase` | component | `src/ui/components/content/code-block/standalone.tsx` | Standalone CodeBlock — displays code with syntax highlighting, optional line numbers, copy button, and title bar. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `code` | `string` | Yes | The code string to display. |
| `className` | `string \| undefined` | No | className applied to the root element. |
| `highlight` | `boolean \| undefined` | No | Whether to enable syntax highlighting. Default: true. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `language` | `string \| undefined` | No | Language for syntax highlighting. |
| `maxHeight` | `string \| undefined` | No | Maximum height of the code area (CSS value). |
| `showCopy` | `boolean \| undefined` | No | Whether to show the copy button. Default: true. |
| `showLineNumbers` | `boolean \| undefined` | No | Whether to show line numbers. Default: false. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, titleBar, titleMeta, title, language, copyButton, body, pre, lineNumbers, code). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root element. |
| `title` | `string \| undefined` | No | Title displayed in the title bar. |
| `wrap` | `boolean \| undefined` | No | Whether to wrap long lines. Default: false. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CodeBlockBaseProps` | interface | `src/ui/components/content/code-block/standalone.tsx` |  |
| `CodeBlockConfig` | type | `src/ui/components/content/code-block/types.ts` | Inferred config type from the CodeBlock Zod schema. |

---

### `content/compare-view`

Standalone CompareView — a side-by-side diff viewer for comparing two
text blocks. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CompareViewBase` | component | `src/ui/components/content/compare-view/standalone.tsx` | Standalone CompareView — a side-by-side diff viewer for comparing two text blocks. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `left` | `string` | Yes | Left (original) text content. |
| `right` | `string` | Yes | Right (modified) text content. |
| `className` | `string \| undefined` | No | className applied to the root element. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `leftLabel` | `string \| undefined` | No | Left pane label. Default: "Original". |
| `maxHeight` | `string \| undefined` | No | Maximum height of each pane (CSS value). Default: "400px". |
| `rightLabel` | `string \| undefined` | No | Right pane label. Default: "Modified". |
| `showLineNumbers` | `boolean \| undefined` | No | Whether to show line numbers. Default: true. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root element. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CompareViewBaseProps` | interface | `src/ui/components/content/compare-view/standalone.tsx` |  |
| `CompareViewConfig` | type | `src/ui/components/content/compare-view/types.ts` | Inferred config type from the CompareView Zod schema. |
| `DiffLine` | interface | `src/ui/components/content/compare-view/types.ts` | A single line in the diff output. |

---

### `content/file-uploader`

Standalone FileUploader — a file upload component with dropzone, button,
and compact variants. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `FileUploaderBase` | component | `src/ui/components/content/file-uploader/standalone.tsx` | Standalone FileUploader — a file upload component with dropzone, button, and compact variants. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `accept` | `string \| undefined` | No | Accepted file types (e.g. "image/*,.pdf"). |
| `className` | `string \| undefined` | No | className applied to the root element. |
| `description` | `string \| undefined` | No | Description text shown below the label. |
| `files` | `UploadFileEntry[] \| undefined` | No | Controlled file entries (for external upload management). |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Label text for the uploader. |
| `maxFiles` | `number \| undefined` | No | Maximum number of files. Default: 1. |
| `maxSize` | `number \| undefined` | No | Maximum file size in bytes. |
| `onComplete` | `((files: File[]) => void) \| undefined` | No | Called once when all in-flight uploads have settled. |
| `onError` | `((file: File, error: Error) => void) \| undefined` | No | Called when a single upload errors. |
| `onFileRemoved` | `((id: string) => void) \| undefined` | No | Called when a file is removed. |
| `onFilesAdded` | `((files: File[]) => void) \| undefined` | No | Called when files are added. Receives the new files and should return updated entries with upload status. |
| `onProgress` | `((file: File, percent: number) => void) \| undefined` | No | Called when an upload's progress changes. |
| `onUpload` | `((file: File, response?: unknown) => void) \| undefined` | No | Called after each file's upload has completed successfully. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root element. |
| `variant` | `'dropzone' \| 'button' \| 'compact' \| undefined` | No | Display variant. Default: "dropzone". |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `FileUploaderBaseProps` | interface | `src/ui/components/content/file-uploader/standalone.tsx` |  |
| `FileUploaderConfig` | type | `src/ui/components/content/file-uploader/types.ts` | Inferred config type from the FileUploader Zod schema. |
| `UploadFileEntry` | interface | `src/ui/components/content/file-uploader/types.ts` | Internal state for a file in the upload queue. |

---

### `content/heading`

Standalone Heading — a styled heading element (h1-h6) that works with plain
React props. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `HeadingBase` | component | `src/ui/components/content/heading/standalone.tsx` | Standalone Heading — a styled heading element (h1-h6) that works with plain React props. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `text` | `string` | Yes | The heading text. |
| `align` | `'left' \| 'right' \| 'center' \| undefined` | No | Text alignment. |
| `className` | `string \| undefined` | No | className applied to the root element. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| undefined` | No | Heading level (1-6). Default: 2. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root element. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `HeadingBaseProps` | interface | `src/ui/components/content/heading/standalone.tsx` |  |
| `HeadingConfig` | type | `src/ui/components/content/heading/types.ts` |  |

---

### `content/link-embed`

Standalone LinkEmbed — renders rich link previews with platform-specific
embeds (YouTube, Instagram, TikTok, Twitter, GIF) or a generic card.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `LinkEmbedBase` | component | `src/ui/components/content/link-embed/standalone.tsx` | Standalone LinkEmbed — renders rich link previews with platform-specific embeds (YouTube, Instagram, TikTok, Twitter, GIF) or a generic card. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `url` | `string` | Yes | URL to display as a link embed. |
| `allowIframe` | `boolean \| undefined` | No | Whether to allow iframe embeds for supported platforms. Default: true. |
| `aspectRatio` | `string \| undefined` | No | Aspect ratio for video embeds. Default: "16/9". |
| `className` | `string \| undefined` | No | className applied to the root element. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `maxWidth` | `string \| undefined` | No | Maximum width for the embed. |
| `meta` | `LinkEmbedMeta \| undefined` | No | Metadata for the link preview. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root element. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `LinkEmbedBaseProps` | interface | `src/ui/components/content/link-embed/standalone.tsx` |  |
| `LinkEmbedConfig` | type | `src/ui/components/content/link-embed/types.ts` | Inferred config type from the LinkEmbed Zod schema. |
| `LinkEmbedMeta` | interface | `src/ui/components/content/link-embed/standalone.tsx` |  |
| `Platform` | type | `src/ui/components/content/link-embed/platform.ts` | Platform detection and embed URL extraction. Identifies known platforms from URLs and extracts the embed-compatible URL or ID needed to render platform-specific iframes. |
| `PlatformInfo` | interface | `src/ui/components/content/link-embed/platform.ts` | Resolved platform metadata used to render a platform-specific embedded preview. |

#### Helpers

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `detectPlatform` | component | `src/ui/components/content/link-embed/platform.ts` | Detects the platform from a URL and extracts embed info. |
| `PLATFORM_COLORS` | value | `src/ui/components/content/link-embed/platform.ts` | Platform accent colors. |
| `PLATFORM_NAMES` | value | `src/ui/components/content/link-embed/platform.ts` | Platform display names. |

---

### `content/markdown`

Standalone Markdown — renders markdown content with syntax highlighting
and Snapshot design tokens. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `MarkdownBase` | component | `src/ui/components/content/markdown/standalone.tsx` | Standalone Markdown — renders markdown content with syntax highlighting and Snapshot design tokens. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `content` | `string` | Yes | The markdown content string to render. |
| `className` | `string \| undefined` | No | className applied to the root element. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `maxHeight` | `string \| undefined` | No | Maximum height of the container (CSS value). |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, heading1-6, paragraph, link, unorderedList, orderedList, listItem, blockquote, pre, inlineCode, blockCode, table, tableHead, tableHeader, tableCell, rule, image). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root element. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `MarkdownBaseProps` | interface | `src/ui/components/content/markdown/standalone.tsx` |  |
| `MarkdownConfig` | type | `src/ui/components/content/markdown/types.ts` | Inferred config type from the Markdown Zod schema. |

---

### `content/rich-input`

Standalone RichInput — a rich text editor with formatting toolbar,
powered by tiptap. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `RichInputBase` | value | `src/ui/components/content/rich-input/standalone.tsx` | Standalone RichInput — a rich text editor with formatting toolbar, powered by tiptap. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root element. |
| `defaultValue` | `string \| undefined` | No | Initial editor content (uncontrolled). HTML or plain text. |
| `emitMarkdown` | `boolean \| undefined` | No | Emit a `markdown` field on `onSend` / `onChange` payloads. When true, registers the `tiptap-markdown` Tiptap extension and exposes `editor.storage.markdown.getMarkdown()` on each event. Off by default to keep the editor's emitted payload minimal for consumers that store HTML or plain text. Storage cost is the `tiptap-markdown` package and its `markdown-it` transitive dep. |
| `features` | `string[] \| undefined` | No | Enabled formatting features. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `key` | `Key \| null \| undefined` | No |  |
| `maxHeight` | `string \| undefined` | No | Maximum height of the editor area (CSS value). |
| `maxLength` | `number \| undefined` | No | Maximum character count. |
| `minHeight` | `string \| undefined` | No | Minimum height of the editor area (CSS value). |
| `onChange` | `((data: { html: string; text: string; markdown?: string; }) => void) \| undefined` | No | Called on every content change. |
| `onMentionSearch` | `((query: string) => Promise<readonly MentionSuggestion[]> \| readonly MentionSuggestion[]) \| undefined` | No |  |
| `onSend` | `((data: { html: string; text: string; markdown?: string; }) => void) \| undefined` | No | Called when the send button is pressed or Enter is pressed (if sendOnEnter). |
| `placeholder` | `string \| undefined` | No | Placeholder text. |
| `readonly` | `boolean \| undefined` | No | Whether the editor is read-only. |
| `ref` | `Ref<import("/Users/jdd/projects/snapshot/src/ui").RichInputBaseHandle> \| undefined` | No | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |
| `renderMentionList` | `ComponentType<MentionListProps & import("/Users/jdd/projects/snapshot/node_modules/@types/react/index").RefAttributes<MentionListHandle>> \| undefined` | No | Optional consumer-rendered popover. If omitted, snapshot uses a minimal default list styled with the framework's CSS variables. Accepts the same props the default does and exposes `onKeyDown({ event })` via `forwardRef` so the suggestion plugin can forward arrow / Enter keys. |
| `sendOnEnter` | `boolean \| undefined` | No | Whether pressing Enter sends (vs. newline). Default: true. |
| `serializeMention` | `((attrs: { id: string; label: string; }) => string) \| undefined` | No | Override the mention serialization format. Defaults to slingshot's `<@<id>>` content-token format, which `slingshot-core/parseBody` understands. Override only when integrating into a non-slingshot server. |
| `showSendButton` | `boolean \| undefined` | No | Whether to show a send button. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root element. |
| `value` | `string \| undefined` | No | Controlled editor content. When set, `value` updates flow into the editor. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `RichInputBaseHandle` | interface | `src/ui/components/content/rich-input/standalone.tsx` | Imperative handle exposed via `ref`. Use this when an external surface (emoji picker, GIF picker, slash-command menu) needs to insert content at the user's current cursor position without going through the controlled-value path (which clobbers the cursor). |
| `RichInputBaseProps` | interface | `src/ui/components/content/rich-input/standalone.tsx` |  |
| `RichInputConfig` | type | `src/ui/components/content/rich-input/types.ts` | Inferred config type from the RichInput Zod schema. |

---

### `content/rich-text-editor`

Standalone RichTextEditor — a markdown editor with live preview,
powered by CodeMirror. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `RichTextEditorBase` | component | `src/ui/components/content/rich-text-editor/standalone.tsx` | Standalone RichTextEditor — a markdown editor with live preview, powered by CodeMirror. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root element. |
| `content` | `string \| undefined` | No | Initial markdown content. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `maxHeight` | `string \| undefined` | No | Maximum height of the content area (CSS value). |
| `minHeight` | `string \| undefined` | No | Minimum height of the content area (CSS value). |
| `mode` | `'edit' \| 'preview' \| 'split' \| undefined` | No | Initial editor mode. Default: "edit". |
| `onChange` | `((content: string) => void) \| undefined` | No | Called on content changes with the markdown string. |
| `placeholder` | `string \| undefined` | No | Placeholder text for the editor. |
| `readonly` | `boolean \| undefined` | No | Whether the editor is read-only. |
| `renderPreview` | `((content: string) => ReactNode) \| undefined` | No | Custom preview renderer. If not provided, uses MarkdownBase. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root element. |
| `toolbar` | `boolean \| string[] \| undefined` | No | Toolbar configuration — true for defaults, false to hide, or array of item names. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `RichTextEditorBaseProps` | interface | `src/ui/components/content/rich-text-editor/standalone.tsx` |  |
| `RichTextEditorConfig` | type | `src/ui/components/content/rich-text-editor/types.ts` | Inferred config type from the RichTextEditor Zod schema. |

---

### `content/timeline`

Standalone Timeline — vertical event timeline with dot markers, connectors,
date labels, and default/compact/alternating layout variants. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `TimelineBase` | component | `src/ui/components/content/timeline/standalone.tsx` | Standalone Timeline — vertical event timeline with dot markers, connectors, date labels, and default/compact/alternating layout variants. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `items` | `TimelineItemEntry[]` | Yes | Array of timeline event entries to render. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `emptyText` | `string \| undefined` | No | Text shown when items array is empty. Default: "No events to display". |
| `error` | `ReactNode` | No | Error content displayed in place of items. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `loading` | `boolean \| undefined` | No | Loading state displays skeleton placeholders. |
| `onItemClick` | `((item: TimelineItemEntry, index: number) => void) \| undefined` | No | Called when a timeline item is clicked. |
| `showConnector` | `boolean \| undefined` | No | Whether to show vertical connectors between items. Default: true. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `variant` | `'compact' \| 'default' \| 'alternating' \| undefined` | No | Layout variant. Default: "default". |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `TimelineBaseProps` | interface | `src/ui/components/content/timeline/standalone.tsx` |  |
| `TimelineConfig` | type | `src/ui/components/content/timeline/types.ts` | Inferred config type from the Timeline Zod schema. |
| `TimelineItem` | type | `src/ui/components/content/timeline/types.ts` | Inferred type for a single timeline item. |
| `TimelineItemEntry` | interface | `src/ui/components/content/timeline/standalone.tsx` |  |

---

## Navigation

### `navigation/accordion`

Standalone Accordion — an expandable/collapsible panel list with plain React
children. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `AccordionBase` | component | `src/ui/components/navigation/accordion/standalone.tsx` | Standalone Accordion — an expandable/collapsible panel list with plain React children. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `items` | `AccordionBaseItem[]` | Yes | Accordion items. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `defaultOpen` | `number \| number[] \| undefined` | No | Index or indices of items open by default. |
| `iconPosition` | `'left' \| 'right' \| undefined` | No | Position of the chevron icon. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `mode` | `'single' \| 'multiple' \| undefined` | No | Expansion mode — "single" collapses siblings; "multiple" allows any. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `variant` | `'default' \| 'bordered' \| 'separated' \| undefined` | No | Visual variant. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `AccordionBaseItem` | interface | `src/ui/components/navigation/accordion/standalone.tsx` |  |
| `AccordionBaseProps` | interface | `src/ui/components/navigation/accordion/standalone.tsx` |  |
| `AccordionConfig` | type | `src/ui/components/navigation/accordion/types.ts` | Inferred config type from the Accordion Zod schema. |
| `AccordionItemConfig` | type | `src/ui/components/navigation/accordion/types.ts` | Inferred type for a single accordion item. |

---

### `navigation/breadcrumb`

Standalone Breadcrumb — a navigation trail rendered with plain React props.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `BreadcrumbBase` | component | `src/ui/components/navigation/breadcrumb/standalone.tsx` | Standalone Breadcrumb — a navigation trail rendered with plain React props. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `items` | `BreadcrumbBaseItem[]` | Yes | Breadcrumb items. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `maxItems` | `number \| undefined` | No | Maximum visible items — remainder are collapsed. |
| `onNavigate` | `((item: BreadcrumbBaseItem, event: React.MouseEvent<HTMLAnchorElement>) => void) \| undefined` | No | Called when a breadcrumb link is clicked. Receives the item. |
| `separator` | `string \| undefined` | No | Visual separator between items. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `BreadcrumbBaseItem` | interface | `src/ui/components/navigation/breadcrumb/standalone.tsx` |  |
| `BreadcrumbBaseProps` | interface | `src/ui/components/navigation/breadcrumb/standalone.tsx` |  |
| `BreadcrumbConfig` | type | `src/ui/components/navigation/breadcrumb/types.ts` | Inferred config type from the Breadcrumb Zod schema. |
| `BreadcrumbItemConfig` | type | `src/ui/components/navigation/breadcrumb/types.ts` | Inferred type for a single breadcrumb item. |

---

### `navigation/prefetch-link`

Standalone PrefetchLink — a plain `<a>` anchor that fires a prefetch callback
based on the configured strategy. Works without SSR context.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `PrefetchLinkBase` | component | `src/ui/components/navigation/prefetch-link/standalone.tsx` | Standalone PrefetchLink — a plain `<a>` anchor that fires a prefetch callback based on the configured strategy. Works without SSR context. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `to` | `string` | Yes | The href of the link. |
| `children` | `ReactNode` | No | Content rendered inside the anchor. |
| `className` | `string \| undefined` | No | className applied to the root anchor. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onPrefetch` | `((to: string) => void) \| undefined` | No | Called when a prefetch should be triggered. |
| `prefetch` | `'hover' \| 'none' \| 'eager' \| 'visible' \| 'viewport' \| undefined` | No | When to trigger prefetching: - `'hover'`    — prefetch on pointerenter (default) - `'visible'`  — prefetch when the link enters the viewport - `'viewport'` — legacy alias for `'visible'` - `'eager'`    — prefetch immediately on mount - `'none'`     — never prefetch automatically |
| `rel` | `string \| undefined` | No | `rel` attribute forwarded to the `<a>` element. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root anchor. |
| `target` | `string \| undefined` | No | `target` attribute forwarded to the `<a>` element. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `PrefetchLinkBaseProps` | interface | `src/ui/components/navigation/prefetch-link/standalone.tsx` |  |
| `PrefetchLinkConfig` | type | `src/ui/components/navigation/prefetch-link/types.ts` |  |
| `PrefetchLinkProps` | type | `src/ui/components/navigation/prefetch-link/types.ts` |  |
| `PrefetchLinkSlotNames` | type | `src/ui/components/navigation/prefetch-link/types.ts` |  |

---

### `navigation/stepper`

Standalone Stepper — a multi-step progress indicator with plain React props.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `StepperBase` | component | `src/ui/components/navigation/stepper/standalone.tsx` | Standalone Stepper — a multi-step progress indicator with plain React props. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `steps` | `StepperBaseStep[]` | Yes | Steps to display. |
| `activeStep` | `number \| undefined` | No | Index of the currently active step. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `clickable` | `boolean \| undefined` | No | Whether steps are clickable. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onStepChange` | `((index: number) => void) \| undefined` | No | Callback when the active step changes. |
| `orientation` | `'vertical' \| 'horizontal' \| undefined` | No | Layout direction. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `variant` | `'default' \| 'dots' \| 'simple' \| undefined` | No | Visual variant. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `StepConfig` | type | `src/ui/components/navigation/stepper/types.ts` | Inferred type for a single step config. |
| `StepperBaseProps` | interface | `src/ui/components/navigation/stepper/standalone.tsx` |  |
| `StepperBaseStep` | interface | `src/ui/components/navigation/stepper/standalone.tsx` |  |
| `StepperConfig` | type | `src/ui/components/navigation/stepper/types.ts` | Inferred config type from the Stepper Zod schema. |

---

### `navigation/tabs`

Standalone Tabs — tabbed navigation with plain React props.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `TabsBase` | component | `src/ui/components/navigation/tabs/standalone.tsx` | Standalone Tabs — tabbed navigation with plain React props. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `tabs` | `TabsBaseTab[]` | Yes | Tab definitions. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `defaultTab` | `number \| undefined` | No | Index of the initially active tab. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onTabChange` | `((index: number) => void) \| undefined` | No | Callback when the active tab changes. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `variant` | `'underline' \| 'default' \| 'pills' \| undefined` | No | Visual variant. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ResolvedTabConfig` | type | `src/ui/components/navigation/tabs/types.ts` |  |
| `TabConfig` | interface | `src/ui/components/navigation/tabs/types.ts` |  |
| `TabsBaseProps` | interface | `src/ui/components/navigation/tabs/standalone.tsx` |  |
| `TabsBaseTab` | interface | `src/ui/components/navigation/tabs/standalone.tsx` |  |
| `UseTabsReturn` | interface | `src/ui/components/navigation/tabs/types.ts` | Return type for the useTabs hook. |

---

### `navigation/tree-view`

Standalone TreeView — a hierarchical tree with expand/collapse and selection.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `TreeViewBase` | component | `src/ui/components/navigation/tree-view/standalone.tsx` | Standalone TreeView — a hierarchical tree with expand/collapse and selection. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `items` | `TreeViewBaseItem[]` | Yes | Tree data. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `emptyMessage` | `string \| undefined` | No | Empty state message. |
| `error` | `ReactNode` | No | Error content to display. When provided, shows an error state instead of the tree. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `isLoading` | `boolean \| undefined` | No | Whether remote data is loading. Shows a skeleton UI when true. |
| `multiSelect` | `boolean \| undefined` | No | Whether multiple items can be selected. |
| `onRetry` | `(() => void) \| undefined` | No | Called when the user requests a retry from the error state. |
| `onSelect` | `((value: string) => void) \| undefined` | No | Called when an item is selected. |
| `selectable` | `boolean \| undefined` | No | Whether items are selectable. |
| `showConnectors` | `boolean \| undefined` | No | Whether to show tree connectors. |
| `showIcon` | `boolean \| undefined` | No | Whether to show item icons. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `TreeItemInput` | interface | `src/ui/components/navigation/tree-view/types.ts` |  |
| `TreeViewBaseItem` | interface | `src/ui/components/navigation/tree-view/standalone.tsx` |  |
| `TreeViewBaseProps` | interface | `src/ui/components/navigation/tree-view/standalone.tsx` |  |
| `TreeViewConfig` | type | `src/ui/components/navigation/tree-view/types.ts` | Inferred config type from the TreeView Zod schema. |

---

## Overlays

### `overlay/command-palette`

Standalone CommandPalette — a search-driven command list with keyboard
navigation. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CommandPaletteBase` | component | `src/ui/components/overlay/command-palette/standalone.tsx` | Standalone CommandPalette — a search-driven command list with keyboard navigation. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `onClose` | `() => void` | Yes | Called when the palette should close. |
| `open` | `boolean` | Yes | Whether the palette is visible. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `emptyMessage` | `string \| undefined` | No | Message when no results match the query. |
| `groups` | `CommandPaletteBaseGroup[] \| undefined` | No | Static command groups. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `maxHeight` | `string \| undefined` | No | Max height of the items list. |
| `onQueryChange` | `((query: string) => void) \| undefined` | No | Called when the search query changes. Use with `query` for controlled mode. |
| `onSelect` | `((item: CommandPaletteBaseItem) => void) \| undefined` | No | Called when an item is selected. |
| `placeholder` | `string \| undefined` | No | Placeholder text for the search input. |
| `query` | `string \| undefined` | No | Controlled search query value. When provided, the component uses this instead of internal state. |
| `shortcutHint` | `string \| undefined` | No | Keyboard shortcut hint displayed in the search bar (e.g. "ctrl+k"). |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CommandPaletteBaseGroup` | interface | `src/ui/components/overlay/command-palette/standalone.tsx` |  |
| `CommandPaletteBaseItem` | interface | `src/ui/components/overlay/command-palette/standalone.tsx` |  |
| `CommandPaletteBaseProps` | interface | `src/ui/components/overlay/command-palette/standalone.tsx` |  |
| `CommandPaletteConfig` | type | `src/ui/components/overlay/command-palette/types.ts` | Inferred config type for the CommandPalette component. |

---

### `overlay/confirm-dialog`

Standalone ConfirmDialog — a confirmation dialog built on ModalBase with
plain React props. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ConfirmDialogBase` | component | `src/ui/components/overlay/confirm-dialog/standalone.tsx` | Standalone ConfirmDialog — a confirmation dialog built on ModalBase with plain React props. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `onClose` | `() => void` | Yes | Called when the dialog should close. |
| `open` | `boolean` | Yes | Whether the dialog is open. |
| `cancelLabel` | `string \| undefined` | No | Cancel button label. |
| `cancelVariant` | `'ghost' \| 'default' \| 'destructive' \| 'outline' \| 'secondary' \| undefined` | No | Cancel button variant. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `confirmLabel` | `string \| undefined` | No | Confirm button label. |
| `confirmVariant` | `'ghost' \| 'default' \| 'destructive' \| 'outline' \| 'secondary' \| undefined` | No | Confirm button variant. |
| `description` | `string \| undefined` | No | Description / body text. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onCancel` | `(() => void) \| undefined` | No | Called when cancel is clicked. |
| `onConfirm` | `(() => void) \| undefined` | No | Called when confirm is clicked. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' \| undefined` | No | Modal size. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `title` | `string \| undefined` | No | Dialog title. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ConfirmDialogBaseProps` | interface | `src/ui/components/overlay/confirm-dialog/standalone.tsx` |  |
| `ConfirmDialogConfig` | type | `src/ui/components/overlay/confirm-dialog/types.ts` | Input config type for the ConfirmDialog component. |

---

### `overlay/context-menu`

Standalone ContextMenu — a right-click context menu with plain React props.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ContextMenuBase` | component | `src/ui/components/overlay/context-menu/standalone.tsx` | Standalone ContextMenu — a right-click context menu with plain React props. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `items` | `ContextMenuBaseEntry[]` | Yes | Menu items to display. |
| `children` | `React.ReactNode` | No | Content that triggers the context menu on right-click. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onOpenChange` | `((open: boolean) => void) \| undefined` | No | Called when the menu opens or closes. |
| `onSelect` | `((item: ContextMenuBaseItem) => void) \| undefined` | No | Called when a menu item is selected. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ContextMenuBaseEntry` | type | `src/ui/components/overlay/context-menu/standalone.tsx` |  |
| `ContextMenuBaseItem` | interface | `src/ui/components/overlay/context-menu/standalone.tsx` |  |
| `ContextMenuBaseLabel` | interface | `src/ui/components/overlay/context-menu/standalone.tsx` |  |
| `ContextMenuBaseProps` | interface | `src/ui/components/overlay/context-menu/standalone.tsx` |  |
| `ContextMenuBaseSeparator` | interface | `src/ui/components/overlay/context-menu/standalone.tsx` |  |
| `ContextMenuConfig` | type | `src/ui/components/overlay/context-menu/types.ts` | Inferred config type for the ContextMenu component. |

---

### `overlay/drawer`

Standalone Drawer — a sliding panel overlay with plain React props.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DrawerBase` | component | `src/ui/components/overlay/drawer/standalone.tsx` | Standalone Drawer — a sliding panel overlay with plain React props. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `onClose` | `() => void` | Yes | Called when the drawer should close. |
| `open` | `boolean` | Yes | Whether the drawer is open. |
| `children` | `React.ReactNode` | No | React children — rendered as the drawer body. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `footer` | `DrawerBaseFooterAction[] \| undefined` | No | Footer actions. |
| `footerAlign` | `'left' \| 'right' \| 'center' \| undefined` | No | Footer alignment. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `initialFocus` | `string \| undefined` | No | Selector for the element to focus on open. |
| `onOpen` | `(() => void) \| undefined` | No | Called when the drawer opens. |
| `returnFocus` | `boolean \| undefined` | No | Whether to return focus on close. |
| `side` | `'left' \| 'right' \| undefined` | No | Which side the drawer opens from. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' \| undefined` | No | Drawer width preset. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `title` | `string \| undefined` | No | Drawer title. |
| `trapFocus` | `boolean \| undefined` | No | Whether to trap focus inside the drawer. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DrawerBaseFooterAction` | interface | `src/ui/components/overlay/drawer/standalone.tsx` |  |
| `DrawerBaseProps` | interface | `src/ui/components/overlay/drawer/standalone.tsx` |  |
| `UseDrawerReturn` | interface | `src/ui/components/overlay/drawer/types.ts` | Return type for the useDrawer hook. |

---

### `overlay/dropdown-menu`

Standalone DropdownMenu — a button-triggered floating menu with plain React props.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DropdownMenuBase` | component | `src/ui/components/overlay/dropdown-menu/standalone.tsx` | Standalone DropdownMenu — a button-triggered floating menu with plain React props. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `items` | `DropdownMenuBaseEntry[]` | Yes | Menu items. |
| `trigger` | `DropdownMenuBaseTrigger` | Yes | Trigger button configuration. |
| `align` | `'center' \| 'start' \| 'end' \| undefined` | No | Panel alignment relative to trigger. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onSelect` | `((item: DropdownMenuBaseItem, index: number) => void) \| undefined` | No | Called when a menu item is selected. |
| `side` | `'left' \| 'right' \| 'top' \| 'bottom' \| undefined` | No | Panel side relative to trigger. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DropdownMenuBaseEntry` | type | `src/ui/components/overlay/dropdown-menu/standalone.tsx` |  |
| `DropdownMenuBaseItem` | interface | `src/ui/components/overlay/dropdown-menu/standalone.tsx` |  |
| `DropdownMenuBaseLabel` | interface | `src/ui/components/overlay/dropdown-menu/standalone.tsx` |  |
| `DropdownMenuBaseProps` | interface | `src/ui/components/overlay/dropdown-menu/standalone.tsx` |  |
| `DropdownMenuBaseSeparator` | interface | `src/ui/components/overlay/dropdown-menu/standalone.tsx` |  |
| `DropdownMenuBaseTrigger` | interface | `src/ui/components/overlay/dropdown-menu/standalone.tsx` |  |
| `DropdownMenuConfig` | type | `src/ui/components/overlay/dropdown-menu/types.ts` | Inferred config type from the DropdownMenu Zod schema. |

---

### `overlay/hover-card`

Standalone HoverCard — a floating panel that appears on hover with plain
React props. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `HoverCardBase` | component | `src/ui/components/overlay/hover-card/standalone.tsx` | Standalone HoverCard — a floating panel that appears on hover with plain React props. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `children` | `ReactNode` | Yes | Content rendered inside the hover card panel. |
| `trigger` | `ReactNode` | Yes | The trigger element that activates the hover card. |
| `align` | `'center' \| 'start' \| 'end' \| undefined` | No | Panel alignment relative to trigger. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `closeDelay` | `number \| undefined` | No | Delay in ms before the card closes on leave. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `openDelay` | `number \| undefined` | No | Delay in ms before the card opens on hover. |
| `side` | `'left' \| 'right' \| 'top' \| 'bottom' \| undefined` | No | Which side to show the panel. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `width` | `string \| undefined` | No | Fixed width for the card. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `HoverCardBaseProps` | interface | `src/ui/components/overlay/hover-card/standalone.tsx` |  |
| `HoverCardConfig` | type | `src/ui/components/overlay/hover-card/types.ts` |  |

---

### `overlay/modal`

Standalone Modal — a centered overlay dialog with plain React props.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ModalBase` | component | `src/ui/components/overlay/modal/standalone.tsx` | Standalone Modal — a centered overlay dialog with plain React props. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `onClose` | `() => void` | Yes | Called when the modal should close. |
| `open` | `boolean` | Yes | Whether the modal is open. |
| `children` | `React.ReactNode` | No | React children — rendered as the modal body. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `footer` | `ModalBaseFooterAction[] \| undefined` | No | Footer actions. |
| `footerAlign` | `'left' \| 'right' \| 'center' \| undefined` | No | Footer alignment. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `initialFocus` | `string \| undefined` | No | Selector for the element to focus on open. |
| `onOpen` | `(() => void) \| undefined` | No | Called when the modal opens. |
| `returnFocus` | `boolean \| undefined` | No | Whether to return focus on close. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' \| undefined` | No | Modal size. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `title` | `string \| undefined` | No | Modal title. |
| `trapFocus` | `boolean \| undefined` | No | Whether to trap focus inside the modal. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ModalBaseFooterAction` | interface | `src/ui/components/overlay/modal/standalone.tsx` |  |
| `ModalBaseProps` | interface | `src/ui/components/overlay/modal/standalone.tsx` |  |
| `ModalConfig` | type | `src/ui/components/overlay/modal/types.ts` |  |
| `ModalProps` | interface | `src/ui/components/overlay/modal/types.ts` | Props for the Modal component. |
| `UseModalReturn` | interface | `src/ui/components/overlay/modal/types.ts` | Return type for the useModal hook. |

---

### `overlay/popover`

Standalone Popover — a button-triggered floating panel with plain React props.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `PopoverBase` | component | `src/ui/components/overlay/popover/standalone.tsx` | Standalone Popover — a button-triggered floating panel with plain React props. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | No | React children — rendered as the popover content. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `description` | `string \| undefined` | No | Description text displayed below the title. |
| `footer` | `React.ReactNode` | No | Footer content. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onOpenChange` | `((isOpen: boolean) => void) \| undefined` | No | Called when the popover opens or closes. |
| `placement` | `'left' \| 'right' \| 'top' \| 'bottom' \| undefined` | No | Placement of the popover panel. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `title` | `string \| undefined` | No | Title displayed inside the popover. |
| `triggerIcon` | `string \| undefined` | No | Trigger icon name. |
| `triggerLabel` | `string \| undefined` | No | Trigger button text. |
| `triggerVariant` | `'ghost' \| 'link' \| 'default' \| 'destructive' \| 'outline' \| 'secondary' \| undefined` | No | Trigger button variant. |
| `width` | `string \| undefined` | No | Fixed width for the panel. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `PopoverBaseProps` | interface | `src/ui/components/overlay/popover/standalone.tsx` |  |
| `PopoverConfig` | type | `src/ui/components/overlay/popover/types.ts` | Inferred config type for the Popover component. |

---

## Media

### `media/carousel`

Standalone CarouselBase — renders a slide carousel with auto-play, arrow navigation,
and dot indicators. Pauses on hover. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CarouselBase` | component | `src/ui/components/media/carousel/standalone.tsx` | Standalone CarouselBase — renders a slide carousel with auto-play, arrow navigation, and dot indicators. Pauses on hover. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `children` | `ReactNode[]` | Yes | Slide content elements. Each child becomes one slide. |
| `autoPlay` | `boolean \| undefined` | No | Whether to auto-advance slides. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `interval` | `number \| undefined` | No | Auto-advance interval in ms. Default: 5000. |
| `showArrows` | `boolean \| undefined` | No | Show previous/next arrow buttons. Default: true. |
| `showDots` | `boolean \| undefined` | No | Show dot indicators. Default: true. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CarouselBaseProps` | interface | `src/ui/components/media/carousel/standalone.tsx` |  |
| `CarouselConfig` | type | `src/ui/components/media/carousel/types.ts` | Inferred config type from the Carousel Zod schema. |

---

### `media/embed`

Standalone Embed — a responsive iframe container for embedding external
content. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `EmbedBase` | component | `src/ui/components/media/embed/standalone.tsx` | Standalone Embed — a responsive iframe container for embedding external content. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `url` | `string` | Yes | URL to embed in the iframe. |
| `aspectRatio` | `string \| undefined` | No | CSS aspect ratio string (e.g. "16/9"). Default: "16/9". |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, frame). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `title` | `string \| undefined` | No | Title for the iframe (accessibility). |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `EmbedBaseProps` | interface | `src/ui/components/media/embed/standalone.tsx` |  |
| `EmbedSchemaConfig` | type | `src/ui/components/media/embed/types.ts` | Inferred config type from the Embed Zod schema. |

---

### `media/image`

Standalone SnapshotImage — an optimized image component with placeholder
support. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SnapshotImageBase` | component | `src/ui/components/media/image/standalone.tsx` | Standalone SnapshotImage — an optimized image component with placeholder support. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `alt` | `string` | Yes | Image alt text. |
| `src` | `string` | Yes | Image source URL. |
| `width` | `number` | Yes | Display width in pixels. |
| `aspectRatio` | `string \| undefined` | No | CSS aspect ratio override. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `format` | `'avif' \| 'webp' \| 'jpeg' \| 'png' \| 'original' \| undefined` | No | Output format. Default: "original". |
| `height` | `number \| undefined` | No | Display height in pixels. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `loading` | `'lazy' \| 'eager' \| undefined` | No | Loading strategy. Defaults to "eager" if priority, else "lazy". |
| `placeholder` | `'skeleton' \| 'blur' \| 'empty' \| undefined` | No | Placeholder type while loading. Default: "empty". |
| `priority` | `boolean \| undefined` | No | Whether to preload the image. Default: false. |
| `quality` | `number \| undefined` | No | Output quality (1-100). Default: 75. |
| `sizes` | `string \| undefined` | No | Responsive sizes attribute. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, placeholder, image). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `SnapshotImageBaseProps` | interface | `src/ui/components/media/image/standalone.tsx` |  |
| `SnapshotImageConfig` | type | `src/ui/components/media/image/types.ts` | Inferred config type from the SnapshotImage Zod schema. This is the single source of truth for what props the `<SnapshotImage>` component accepts. Never define this type manually. |
| `SnapshotImageConfigInput` | type | `src/ui/components/media/image/types.ts` |  |

---

### `media/video`

Standalone Video — a styled video element that works with plain React props.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `VideoBase` | component | `src/ui/components/media/video/standalone.tsx` | Standalone Video — a styled video element that works with plain React props. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `src` | `string` | Yes | Video source URL. |
| `autoPlay` | `boolean \| undefined` | No | Whether to auto-play. |
| `className` | `string \| undefined` | No | className applied to the root element. |
| `controls` | `boolean \| undefined` | No | Whether to show playback controls. Default: true. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `loop` | `boolean \| undefined` | No | Whether to loop. |
| `muted` | `boolean \| undefined` | No | Whether to mute. Defaults to true if autoPlay is set. |
| `poster` | `string \| undefined` | No | Poster image URL. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root element. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `VideoBaseProps` | interface | `src/ui/components/media/video/standalone.tsx` |  |
| `VideoSchemaConfig` | type | `src/ui/components/media/video/types.ts` | Inferred config type from the Video Zod schema. |

---

## Communication

### `communication/chat-window`

Standalone ChatWindow — composable chat container with header, message thread,
typing indicator, and input slots. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ChatWindowBase` | component | `src/ui/components/communication/chat-window/standalone.tsx` | Standalone ChatWindow — composable chat container with header, message thread, typing indicator, and input slots. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `inputSlot` | `ReactNode` | Yes | Content for the input area (typically a RichInputBase). |
| `threadSlot` | `ReactNode` | Yes | Content for the message thread area (typically a MessageThreadBase). |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `height` | `string \| undefined` | No | Height of the chat window. Default: "clamp(300px, 70vh, 500px)". |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `showHeader` | `boolean \| undefined` | No | Show the header bar. Default: true. |
| `showTypingIndicator` | `boolean \| undefined` | No | Whether to show the typing indicator area. Default: true. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `subtitle` | `string \| undefined` | No | Header subtitle text. |
| `title` | `string \| undefined` | No | Header title text. |
| `typingSlot` | `ReactNode` | No | Content for the typing indicator area. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ChatWindowBaseProps` | interface | `src/ui/components/communication/chat-window/standalone.tsx` |  |
| `ChatWindowConfig` | type | `src/ui/components/communication/chat-window/types.ts` | Inferred config type from the ChatWindow Zod schema. |

---

### `communication/comment-section`

Standalone CommentSection — threaded comment list with avatars, timestamps,
optional delete actions, and a composable input slot. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CommentSectionBase` | component | `src/ui/components/communication/comment-section/standalone.tsx` | Standalone CommentSection — threaded comment list with avatars, timestamps, optional delete actions, and a composable input slot. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `authorAvatarField` | `string \| undefined` | No | Field name for author avatar. Default: "author.avatar". |
| `authorNameField` | `string \| undefined` | No | Field name for author name. Default: "author.name". |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `comments` | `Record<string, unknown>[] \| undefined` | No | Comment records. |
| `contentField` | `string \| undefined` | No | Field name for comment content. Default: "content". |
| `emptyText` | `string \| undefined` | No | Empty state text. |
| `error` | `ReactNode` | No | Error message. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `inputSlot` | `ReactNode` | No | Input area rendered at the bottom. Uses ReactNode to allow any input component. |
| `loading` | `boolean \| undefined` | No | Loading state. |
| `onDelete` | `((comment: Record<string, unknown>) => void) \| undefined` | No | Called when delete is clicked. |
| `showDelete` | `boolean \| undefined` | No | Whether delete is available. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `sortOrder` | `'newest' \| 'oldest' \| undefined` | No | Sort order. Default: "newest". |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `timestampField` | `string \| undefined` | No | Field name for timestamp. Default: "timestamp". |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CommentSectionBaseProps` | interface | `src/ui/components/communication/comment-section/standalone.tsx` |  |
| `CommentSectionConfig` | type | `src/ui/components/communication/comment-section/types.ts` | Inferred config type from the CommentSection Zod schema. |

---

### `communication/emoji-picker`

Standalone EmojiPicker — searchable emoji grid with category tabs and custom emoji
support. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `EmojiPickerBase` | component | `src/ui/components/communication/emoji-picker/standalone.tsx` | Standalone EmojiPicker — searchable emoji grid with category tabs and custom emoji support. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `categories` | `string[] \| undefined` | No | Restrict to specific category keys. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `customEmojis` | `CustomEmoji[] \| undefined` | No | Custom emoji entries. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `maxHeight` | `string \| undefined` | No | Max height of the emoji grid scroll area. Default: "300px". |
| `onSelect` | `((payload: { emoji: string; name: string; url?: string; shortcode?: string; isCustom: boolean; }) => void) \| undefined` | No | Called when an emoji is selected. |
| `perRow` | `number \| undefined` | No | Emojis per row. Default: 8. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CustomEmoji` | interface | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | Shape of a custom emoji entry. |
| `EmojiCategory` | interface | `src/ui/components/communication/emoji-picker/types.ts` | Shape of an emoji category. |
| `EmojiEntry` | interface | `src/ui/components/communication/emoji-picker/types.ts` | Shape of a single emoji entry. |
| `EmojiPickerBaseProps` | interface | `src/ui/components/communication/emoji-picker/standalone.tsx` |  |
| `EmojiPickerConfig` | type | `src/ui/components/communication/emoji-picker/types.ts` | Inferred config type from the EmojiPicker Zod schema. |

#### Helpers

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `buildEmojiMap` | component | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | Builds a shortcode lookup map from an array of custom emojis. |
| `CUSTOM_EMOJI_CSS` | value | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | CSS for custom emoji sizing. Custom emojis render as inline images sized to match surrounding text. |
| `parseShortcodes` | component | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | Parses shortcodes in text and replaces them with `<img>` tags. |
| `resolveEmojiRecords` | component | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | Resolves emoji records from the API into CustomEmoji entries. Handles the `uploadKey` → `url` resolution using a URL prefix or field mapping. |

---

### `communication/gif-picker`

Standalone GifPicker — searchable GIF grid with debounced search, loading states,
and optional attribution. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `GifPickerBase` | component | `src/ui/components/communication/gif-picker/standalone.tsx` | Standalone GifPicker — searchable GIF grid with debounced search, loading states, and optional attribution. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `attribution` | `string \| undefined` | No | Attribution text shown at the bottom. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `columns` | `number \| undefined` | No | Number of grid columns. Default: 2. |
| `gifs` | `GifEntry[] \| undefined` | No | Static GIF entries. When provided, remote endpoints are not used. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `loading` | `boolean \| undefined` | No | Loading state. |
| `maxHeight` | `string \| undefined` | No | Max height of content area. Default: "300px". |
| `onSearchChange` | `((query: string) => void) \| undefined` | No | Called when search text changes (debounced). Used by adapter to trigger remote searches. |
| `onSelect` | `((gif: GifEntry) => void) \| undefined` | No | Called when a GIF is selected. |
| `placeholder` | `string \| undefined` | No | Placeholder text for the search input. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `GifEntry` | interface | `src/ui/components/communication/gif-picker/types.ts` | Shape of a GIF entry. |
| `GifPickerBaseProps` | interface | `src/ui/components/communication/gif-picker/standalone.tsx` |  |
| `GifPickerConfig` | type | `src/ui/components/communication/gif-picker/types.ts` | Inferred config type from the GifPicker Zod schema. |

---

### `communication/message-thread`

Standalone MessageThread — scrollable message list with avatars, date separators,
auto-scroll, embed rendering, and consecutive-message grouping. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `MessageThreadBase` | component | `src/ui/components/communication/message-thread/standalone.tsx` | Standalone MessageThread — scrollable message list with avatars, date separators, auto-scroll, embed rendering, and consecutive-message grouping. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `authorAvatarField` | `string \| undefined` | No | Field name for author avatar URL. Default: "author.avatar". |
| `authorNameField` | `string \| undefined` | No | Field name for author name. Default: "author.name". |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `contentField` | `string \| undefined` | No | Field name for message content. Default: "content". |
| `embedsField` | `string \| undefined` | No | Field for embeds. Default: "embeds". |
| `emptyText` | `string \| undefined` | No | Empty state text. |
| `error` | `ReactNode` | No | Error message. |
| `groupByDate` | `boolean \| undefined` | No | Group messages by date. Default: true. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `loading` | `boolean \| undefined` | No | Loading state. |
| `maxHeight` | `string \| undefined` | No | Max height for scrollable area. |
| `messages` | `Record<string, unknown>[] \| undefined` | No | Message records. |
| `onMessageClick` | `((message: Record<string, unknown>) => void) \| undefined` | No | Called when a message is clicked. |
| `renderEmbed` | `((embed: Record<string, unknown>, index: number) => ReactNode) \| undefined` | No | Render function for embed items. |
| `showEmbeds` | `boolean \| undefined` | No | Show embeds. Default: true. |
| `showTimestamps` | `boolean \| undefined` | No | Show timestamps. Default: true. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `timestampField` | `string \| undefined` | No | Field name for timestamp. Default: "timestamp". |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `MessageThreadBaseProps` | interface | `src/ui/components/communication/message-thread/standalone.tsx` |  |
| `MessageThreadConfig` | type | `src/ui/components/communication/message-thread/types.ts` | Inferred config type from the MessageThread Zod schema. |

---

### `communication/presence-indicator`

Standalone PresenceIndicator — displays online/offline/away/busy/dnd status
with a colored dot and optional label. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `PresenceIndicatorBase` | component | `src/ui/components/communication/presence-indicator/standalone.tsx` | Standalone PresenceIndicator — displays online/offline/away/busy/dnd status with a colored dot and optional label. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `status` | `string` | Yes | Status string: "online" \| "offline" \| "away" \| "busy" \| "dnd". |
| `className` | `string \| undefined` | No | className applied to the root element. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Custom label text. Falls back to status name. |
| `showDot` | `boolean \| undefined` | No | Whether to show the status dot. Default: true. |
| `showLabel` | `boolean \| undefined` | No | Whether to show the status label. Default: true. |
| `size` | `'sm' \| 'md' \| 'lg' \| undefined` | No | Size variant. Default: "md". |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, dot, label). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root element. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `PresenceIndicatorBaseProps` | interface | `src/ui/components/communication/presence-indicator/standalone.tsx` |  |
| `PresenceIndicatorConfig` | type | `src/ui/components/communication/presence-indicator/types.ts` | Inferred config type from the PresenceIndicator Zod schema. |

---

### `communication/reaction-bar`

Standalone ReactionBar — row of emoji reaction pills with counts and an
add-reaction button that opens an inline emoji picker. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ReactionBarBase` | component | `src/ui/components/communication/reaction-bar/standalone.tsx` | Standalone ReactionBar — row of emoji reaction pills with counts and an add-reaction button that opens an inline emoji picker. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `EmojiPickerComponent` | `import("/Users/jdd/projects/snapshot/node_modules/@types/react/index").ComponentType<{ maxHeight?: string; perRow?: number; onSelect?: (payload: { emoji: string; name: string; isCustom: boolean; }) => void; }> \| undefined` | No | Optional override for the emoji picker component, useful in tests. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onEmojiSelect` | `((payload: { emoji: string; name: string; isCustom: boolean; }) => void) \| undefined` | No | Called when an emoji is picked from the add-reaction picker. |
| `onReactionClick` | `((emoji: string, wasActive: boolean) => void) \| undefined` | No | Called when a reaction button is clicked. Receives the emoji and whether it was active (for toggle). |
| `reactions` | `ReactionEntry[] \| undefined` | No | Array of reaction entries to display. |
| `showAddButton` | `boolean \| undefined` | No | Whether to show the add-reaction button with emoji picker. Default: true. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ReactionBarBaseProps` | interface | `src/ui/components/communication/reaction-bar/standalone.tsx` |  |
| `ReactionBarConfig` | type | `src/ui/components/communication/reaction-bar/types.ts` | Inferred config type from the ReactionBar Zod schema. |
| `ReactionEntry` | interface | `src/ui/components/communication/reaction-bar/standalone.tsx` |  |

---

### `communication/typing-indicator`

Standalone TypingIndicator — shows animated bouncing dots with user names
to indicate who is currently typing. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `TypingIndicatorBase` | component | `src/ui/components/communication/typing-indicator/standalone.tsx` | Standalone TypingIndicator — shows animated bouncing dots with user names to indicate who is currently typing. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `users` | `TypingUser[]` | Yes | Users currently typing. |
| `className` | `string \| undefined` | No | className applied to the root element. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `maxDisplay` | `number \| undefined` | No | Maximum number of user names to display before truncating. Default: 3. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, dots, dot, text). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root element. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `TypingIndicatorBaseProps` | interface | `src/ui/components/communication/typing-indicator/standalone.tsx` |  |
| `TypingIndicatorConfig` | type | `src/ui/components/communication/typing-indicator/types.ts` | Inferred config type from the TypingIndicator Zod schema. |
| `TypingUser` | interface | `src/ui/components/communication/typing-indicator/standalone.tsx` | A user entry for the typing indicator. |

---

## Workflow

### `workflow/audit-log`

Standalone AuditLogBase — renders a filterable, paginated timeline of audit log entries
with user avatars, relative timestamps, and expandable detail panels. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `AuditLogBase` | component | `src/ui/components/workflow/audit-log/standalone.tsx` | Standalone AuditLogBase — renders a filterable, paginated timeline of audit log entries with user avatars, relative timestamps, and expandable detail panels. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `items` | `Record<string, unknown>[]` | Yes | Data items to display. |
| `actionField` | `string \| undefined` | No | Field name that holds the action description. Default: "action". |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `detailsField` | `string \| undefined` | No | Field name that holds the expandable details object. |
| `error` | `{ message: string; } \| null \| undefined` | No | Error object, if any. |
| `filters` | `AuditLogFilterEntry[] \| undefined` | No | Filter definitions for the filter bar. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `loading` | `boolean \| undefined` | No | Whether data is currently loading. |
| `pagination` | `number \| false \| undefined` | No | Pagination config. false disables, number sets pageSize. Default: 20. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `timestampField` | `string \| undefined` | No | Field name that holds the timestamp value. Default: "timestamp". |
| `userField` | `string \| undefined` | No | Field name that holds the user/actor value. Default: "user". |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `AuditLogBaseProps` | interface | `src/ui/components/workflow/audit-log/standalone.tsx` |  |
| `AuditLogConfig` | type | `src/ui/components/workflow/audit-log/types.ts` | Inferred config type from the AuditLog Zod schema. |
| `AuditLogFilterConfig` | type | `src/ui/components/workflow/audit-log/types.ts` | Inferred filter configuration type. |
| `AuditLogFilterEntry` | interface | `src/ui/components/workflow/audit-log/standalone.tsx` |  |

---

### `workflow/calendar`

Standalone CalendarBase — renders a month or week calendar grid with event pills,
navigation controls, and optional week numbers. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CalendarBase` | component | `src/ui/components/workflow/calendar/standalone.tsx` | Standalone CalendarBase — renders a month or week calendar grid with event pills, navigation controls, and optional week numbers. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `error` | `{ message: string; } \| null \| undefined` | No | Error object, if any. |
| `events` | `CalendarEventEntry[] \| undefined` | No | Events to display. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `initialDate` | `Date \| undefined` | No | Initial visible date. Defaults to today. |
| `loading` | `boolean \| undefined` | No | Whether data is loading. |
| `onDateClick` | `((date: Date) => void) \| undefined` | No | Called when a date cell is clicked. |
| `onEventClick` | `((event: CalendarEventEntry) => void) \| undefined` | No | Called when an event pill is clicked. |
| `showWeekNumbers` | `boolean \| undefined` | No | Show week numbers. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `todayLabel` | `string \| undefined` | No | Label for the Today button. |
| `view` | `'week' \| 'month' \| undefined` | No | "month" or "week". Default: "month". |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `CalendarBaseProps` | interface | `src/ui/components/workflow/calendar/standalone.tsx` |  |
| `CalendarConfig` | type | `src/ui/components/workflow/calendar/types.ts` | Inferred config type from the Calendar Zod schema. |
| `CalendarEventConfig` | type | `src/ui/components/workflow/calendar/types.ts` | Inferred static event type. |
| `CalendarEventEntry` | interface | `src/ui/components/workflow/calendar/standalone.tsx` |  |
| `ResolvedEvent` | interface | `src/ui/components/workflow/calendar/types.ts` | Internal resolved event used for rendering. |

---

### `workflow/kanban`

Standalone KanbanBase — renders a multi-column board with cards, WIP limits,
assignee avatars, priority indicators, and optional drag-and-drop reordering. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `KanbanBase` | component | `src/ui/components/workflow/kanban/standalone.tsx` | Standalone KanbanBase — renders a multi-column board with cards, WIP limits, assignee avatars, priority indicators, and optional drag-and-drop reordering. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `columns` | `KanbanColumnEntry[]` | Yes | Column definitions. |
| `items` | `Record<string, unknown>[]` | Yes | Data items. |
| `assigneeField` | `string \| undefined` | No | Field for assignee name. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `columnField` | `string \| undefined` | No | Field that determines which column an item belongs to. Default: "status". |
| `descriptionField` | `string \| undefined` | No | Field for card description. |
| `emptyMessage` | `string \| undefined` | No | Empty column message. |
| `error` | `{ message: string; } \| null \| undefined` | No | Error object, if any. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `loading` | `boolean \| undefined` | No | Whether data is loading. |
| `onCardClick` | `((item: Record<string, unknown>) => void) \| undefined` | No | Called when a card is clicked. |
| `onDndChange` | `((payload: { movedItem: Record<string, unknown>; targetColumn: string; position: number; }) => void) \| undefined` | No | Called when items change via DnD (for publish). |
| `onReorder` | `((payload: { id: string \| number; columnKey: string; position: number; item: Record<string, unknown>; }) => void) \| undefined` | No | Called after drag-and-drop reorder. |
| `priorityField` | `string \| undefined` | No | Field for priority indicator. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `sortable` | `boolean \| undefined` | No | Enable drag-and-drop sorting. |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `titleField` | `string \| undefined` | No | Field for card title. Default: "title". |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `KanbanBaseProps` | interface | `src/ui/components/workflow/kanban/standalone.tsx` |  |
| `KanbanColumnConfig` | type | `src/ui/components/workflow/kanban/types.ts` | Inferred column definition type. |
| `KanbanColumnEntry` | interface | `src/ui/components/workflow/kanban/standalone.tsx` |  |
| `KanbanConfig` | type | `src/ui/components/workflow/kanban/types.ts` | Inferred config type from the Kanban Zod schema. |

---

### `workflow/notification-feed`

Standalone NotificationFeedBase — renders a scrollable notification list with type icons,
unread indicators, relative timestamps, and a mark-all-read action. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NotificationFeedBase` | component | `src/ui/components/workflow/notification-feed/standalone.tsx` | Standalone NotificationFeedBase — renders a scrollable notification list with type icons, unread indicators, relative timestamps, and a mark-all-read action. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `items` | `Record<string, unknown>[]` | Yes | Notification items. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `clickable` | `boolean \| undefined` | No | Whether item click is enabled. |
| `emptyMessage` | `string \| undefined` | No | Empty state message. |
| `error` | `{ message: string; } \| null \| undefined` | No | Error object, if any. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `loading` | `boolean \| undefined` | No | Whether data is loading. |
| `maxHeight` | `string \| undefined` | No | Max height for scrollable list. |
| `messageField` | `string \| undefined` | No | Field name that holds the notification body text. Default: "message". |
| `onItemClick` | `((item: Record<string, unknown>) => void) \| undefined` | No | Called when an item is clicked. |
| `onMarkAllRead` | `(() => void) \| undefined` | No | Called to mark all as read. |
| `readField` | `string \| undefined` | No | Field name that holds the read/unread boolean. Default: "read". |
| `showMarkAllRead` | `boolean \| undefined` | No | Show "Mark all read" button. Default: true. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `React.CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `timestampField` | `string \| undefined` | No | Field name that holds the timestamp value. Default: "timestamp". |
| `titleField` | `string \| undefined` | No | Field name that holds the notification title. Default: "title". |
| `typeField` | `string \| undefined` | No | Field name that holds the notification type (info, success, warning, error). Default: "type". |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `NotificationFeedBaseProps` | interface | `src/ui/components/workflow/notification-feed/standalone.tsx` |  |
| `NotificationFeedConfig` | type | `src/ui/components/workflow/notification-feed/types.ts` | Inferred config type from the NotificationFeed Zod schema. |

---

## Commerce

### `commerce/pricing-table`

Standalone PricingTableBase — renders a responsive pricing comparison as either
a card grid or a feature-comparison table with CTA buttons per tier. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `PricingTableBase` | component | `src/ui/components/commerce/pricing-table/standalone.tsx` | Standalone PricingTableBase — renders a responsive pricing comparison as either a card grid or a feature-comparison table with CTA buttons per tier. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `tiers` | `PricingTierEntry[]` | Yes | Pricing tier definitions to render. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `columns` | `string \| undefined` | No | Number of columns for card variant. Default: auto (tier count). |
| `currency` | `string \| undefined` | No | Currency symbol. Default: "$". |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements. |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `variant` | `'cards' \| 'table' \| undefined` | No | "cards" or "table" variant. Default: "cards". |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `PricingFeatureEntry` | interface | `src/ui/components/commerce/pricing-table/standalone.tsx` |  |
| `PricingTableBaseProps` | interface | `src/ui/components/commerce/pricing-table/standalone.tsx` |  |
| `PricingTableConfig` | type | `src/ui/components/commerce/pricing-table/types.ts` | Inferred config type from the PricingTable Zod schema. |
| `PricingTierEntry` | interface | `src/ui/components/commerce/pricing-table/standalone.tsx` |  |

---

## Feedback States

### `feedback/default-error`

Standalone DefaultError — renders an error feedback card with optional
retry button. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DefaultErrorBase` | component | `src/ui/components/feedback/default-error/standalone.tsx` | Standalone DefaultError — renders an error feedback card with optional retry button. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `description` | `string \| undefined` | No | Pre-resolved description text. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onRetry` | `(() => void) \| undefined` | No | Retry callback — called when the retry button is clicked. |
| `retryLabel` | `string \| undefined` | No | Pre-resolved retry button label. |
| `showRetry` | `boolean \| undefined` | No | Whether to show a retry button. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, title, description, action). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `title` | `string \| undefined` | No | Pre-resolved title text. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DefaultErrorBaseProps` | interface | `src/ui/components/feedback/default-error/standalone.tsx` |  |
| `ErrorPageConfig` | type | `src/ui/components/feedback/default-error/types.ts` | Inferred config type from the default error schema. |

---

### `feedback/default-loading`

Standalone DefaultLoading — renders a loading spinner with label.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DefaultLoadingBase` | component | `src/ui/components/feedback/default-loading/standalone.tsx` | Standalone DefaultLoading — renders a loading spinner with label. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Pre-resolved label text. |
| `size` | `'sm' \| 'md' \| 'lg' \| undefined` | No | Spinner size. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, spinner, label). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DefaultLoadingBaseProps` | interface | `src/ui/components/feedback/default-loading/standalone.tsx` |  |
| `SpinnerConfig` | type | `src/ui/components/feedback/default-loading/types.ts` | Inferred config type from the default loading schema. |

---

### `feedback/default-not-found`

Standalone DefaultNotFound — renders a 404 page with title and description.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DefaultNotFoundBase` | component | `src/ui/components/feedback/default-not-found/standalone.tsx` | Standalone DefaultNotFound — renders a 404 page with title and description. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `description` | `string \| undefined` | No | Pre-resolved description text. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, eyebrow, title, description). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `title` | `string \| undefined` | No | Pre-resolved title text. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DefaultNotFoundBaseProps` | interface | `src/ui/components/feedback/default-not-found/standalone.tsx` |  |
| `NotFoundConfig` | type | `src/ui/components/feedback/default-not-found/types.ts` | Inferred config type from the default not-found schema. |

---

### `feedback/default-offline`

Standalone DefaultOffline — renders an offline status banner.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DefaultOfflineBase` | component | `src/ui/components/feedback/default-offline/standalone.tsx` | Standalone DefaultOffline — renders an offline status banner. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `description` | `string \| undefined` | No | Pre-resolved description text. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, title, description). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `title` | `string \| undefined` | No | Pre-resolved title text. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DefaultOfflineBaseProps` | interface | `src/ui/components/feedback/default-offline/standalone.tsx` |  |
| `OfflineBannerConfig` | type | `src/ui/components/feedback/default-offline/types.ts` | Inferred config type from the default offline schema. |

---

## Primitives

### `primitives/divider`

Standalone Divider — renders a horizontal or vertical separator line,
optionally with a centered label. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DividerBase` | component | `src/ui/components/primitives/divider/standalone.tsx` | Standalone Divider — renders a horizontal or vertical separator line, optionally with a centered label. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Optional label text displayed in the center of a horizontal divider. |
| `orientation` | `'vertical' \| 'horizontal' \| undefined` | No | Orientation of the divider. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, lineStart, label, lineEnd). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `DividerBaseProps` | interface | `src/ui/components/primitives/divider/standalone.tsx` |  |
| `DividerConfig` | type | `src/ui/components/primitives/divider/types.ts` |  |

---

### `primitives/floating-menu`

Standalone FloatingMenu — a dropdown menu with trigger, keyboard navigation,
and pre-resolved items. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `FloatingMenuBase` | component | `src/ui/components/primitives/floating-menu/standalone.tsx` | Standalone FloatingMenu — a dropdown menu with trigger, keyboard navigation, and pre-resolved items. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `align` | `'center' \| 'start' \| 'end' \| undefined` | No | Menu alignment. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `items` | `FloatingMenuBaseEntry[] \| undefined` | No | Menu entries — items, separators, and labels with pre-resolved text. |
| `open` | `boolean \| undefined` | No | Controlled open state. |
| `side` | `'left' \| 'right' \| 'top' \| 'bottom' \| undefined` | No | Menu side. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, trigger, panel, item, separator, label, itemLabel, itemIcon). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `triggerIcon` | `string \| undefined` | No | Icon name for the trigger button. |
| `triggerLabel` | `string \| undefined` | No | Pre-resolved trigger label text. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `FloatingMenuBaseEntry` | type | `src/ui/components/primitives/floating-menu/standalone.tsx` |  |
| `FloatingMenuBaseItem` | interface | `src/ui/components/primitives/floating-menu/standalone.tsx` |  |
| `FloatingMenuBaseLabel` | interface | `src/ui/components/primitives/floating-menu/standalone.tsx` |  |
| `FloatingMenuBaseProps` | interface | `src/ui/components/primitives/floating-menu/standalone.tsx` |  |
| `FloatingMenuBaseSeparator` | interface | `src/ui/components/primitives/floating-menu/standalone.tsx` |  |
| `FloatingMenuConfig` | type | `src/ui/components/primitives/floating-menu/types.ts` |  |
| `FloatingMenuEntry` | type | `src/ui/components/primitives/floating-menu/types.ts` |  |
| `FloatingPanelProps` | interface | `src/ui/components/primitives/floating-menu/shared.tsx` |  |
| `MenuItemProps` | interface | `src/ui/components/primitives/floating-menu/shared.tsx` |  |

#### Helpers

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `FloatingMenuStyles` | component | `src/ui/components/primitives/floating-menu/shared.tsx` |  |
| `FloatingPanel` | component | `src/ui/components/primitives/floating-menu/shared.tsx` | Positioned floating panel with animation, outside-click dismissal, and Escape key handling. Used internally by FloatingMenuBase, DropdownMenuBase, and other overlay components. |
| `MenuItem` | component | `src/ui/components/primitives/floating-menu/shared.tsx` | Styled menu item button with icon, label, and interaction states. Used inside FloatingPanel for dropdown and context menus. |
| `MenuLabel` | component | `src/ui/components/primitives/floating-menu/shared.tsx` | Non-interactive label heading within a menu group. |
| `MenuSeparator` | component | `src/ui/components/primitives/floating-menu/shared.tsx` | Horizontal divider line between menu items. |

---

### `primitives/link`

Standalone Link — renders a styled anchor element with optional icon and
badge. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `LinkBase` | component | `src/ui/components/primitives/link/standalone.tsx` | Standalone Link — renders a styled anchor element with optional icon and badge. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `text` | `string` | Yes | Link display text. |
| `to` | `string` | Yes | Link destination URL. |
| `align` | `'left' \| 'right' \| 'center' \| undefined` | No | Text alignment. |
| `badge` | `string \| undefined` | No | Badge text rendered after the label. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `current` | `boolean \| undefined` | No | Whether this link represents the current page. |
| `disabled` | `boolean \| undefined` | No | Disable the link. |
| `external` | `boolean \| undefined` | No | Open link in a new tab. |
| `icon` | `string \| undefined` | No | Icon name rendered before the label. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onNavigate` | `((to: string) => void) \| undefined` | No | Client-side navigation callback — called instead of default behavior. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, label, icon, badge). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `variant` | `'button' \| 'default' \| 'muted' \| 'navigation' \| undefined` | No | Visual variant. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `LinkBaseProps` | interface | `src/ui/components/primitives/link/standalone.tsx` |  |
| `LinkConfig` | type | `src/ui/components/primitives/link/types.ts` |  |

---

### `primitives/oauth-buttons`

Standalone OAuthButtons — renders OAuth provider buttons with optional
heading and auto-redirect support. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `OAuthButtonsBase` | component | `src/ui/components/primitives/oauth-buttons/standalone.tsx` | Standalone OAuthButtons — renders OAuth provider buttons with optional heading and auto-redirect support. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `heading` | `string \| undefined` | No | Pre-resolved heading text. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `onProviderClick` | `((url: string, providerName: string) => void) \| undefined` | No | Callback when a provider is selected — receives the provider URL. |
| `providerMode` | `'auto' \| 'buttons' \| undefined` | No | Provider mode — "buttons" shows button per provider, "auto" auto-redirects for single provider. |
| `providers` | `OAuthProvider[] \| undefined` | No | List of resolved OAuth providers to render. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, heading, providerGroup, provider, providerIcon, providerLabel, providerDescription). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `OAuthButtonsBaseProps` | interface | `src/ui/components/primitives/oauth-buttons/standalone.tsx` |  |
| `OAuthButtonsConfig` | type | `src/ui/components/primitives/oauth-buttons/types.ts` |  |
| `OAuthProvider` | interface | `src/ui/components/primitives/oauth-buttons/standalone.tsx` |  |

---

### `primitives/passkey-button`

Standalone PasskeyButton — renders a passkey authentication button.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `PasskeyButtonBase` | component | `src/ui/components/primitives/passkey-button/standalone.tsx` | Standalone PasskeyButton — renders a passkey authentication button. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `autoPrompt` | `boolean \| undefined` | No | Auto-prompt passkey on mount. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `label` | `string \| undefined` | No | Pre-resolved label text. |
| `loading` | `boolean \| undefined` | No | Whether the button is in a loading state. |
| `loadingLabel` | `string \| undefined` | No | Loading label shown while passkey auth is in progress. |
| `onClick` | `(() => void \| Promise<void>) \| undefined` | No | Click handler — should trigger the passkey auth flow. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, label). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `visible` | `boolean \| undefined` | No | Whether passkey is supported and enabled (controls rendering). |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `PasskeyButtonBaseProps` | interface | `src/ui/components/primitives/passkey-button/standalone.tsx` |  |
| `PasskeyButtonConfig` | type | `src/ui/components/primitives/passkey-button/types.ts` |  |

---

### `primitives/stack`

Standalone Stack — a flex-column layout container with token-based spacing.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `StackBase` | component | `src/ui/components/primitives/stack/standalone.tsx` | Standalone Stack — a flex-column layout container with token-based spacing. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `align` | `'center' \| 'start' \| 'end' \| 'stretch' \| undefined` | No | Cross-axis alignment. |
| `children` | `ReactNode` | No | React children rendered inside the stack. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `gap` | `string \| undefined` | No | Gap between children — a token name or CSS value. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `justify` | `'center' \| 'start' \| 'end' \| 'between' \| 'around' \| undefined` | No | Main-axis justification. |
| `maxHeight` | `string \| undefined` | No | Maximum height. |
| `maxWidth` | `string \| undefined` | No | Maximum width constraint token. |
| `overflow` | `string \| undefined` | No | Overflow behavior. |
| `padding` | `string \| undefined` | No | Padding token. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root, item). |
| `staggerDelay` | `number \| undefined` | No | Stagger animation delay per child (ms). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `StackBaseProps` | interface | `src/ui/components/primitives/stack/standalone.tsx` |  |
| `StackConfig` | type | `src/ui/components/primitives/stack/types.ts` |  |

---

### `primitives/text`

Standalone Text — renders a styled paragraph element with token-based
typography. Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `TextBase` | component | `src/ui/components/primitives/text/standalone.tsx` | Standalone Text — renders a styled paragraph element with token-based typography. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `align` | `'left' \| 'right' \| 'center' \| undefined` | No | Text alignment. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xs' \| undefined` | No | Font size token. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |
| `value` | `string \| undefined` | No | Text content to display. |
| `variant` | `'default' \| 'muted' \| 'subtle' \| undefined` | No | Color variant. |
| `weight` | `'bold' \| 'light' \| 'normal' \| 'medium' \| 'semibold' \| undefined` | No | Font weight token. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `TextBaseProps` | interface | `src/ui/components/primitives/text/standalone.tsx` |  |
| `TextConfig` | type | `src/ui/components/primitives/text/types.ts` |  |

---

## Base Utilities

### `_base/component-group`

Standalone ComponentGroup — a simple wrapper for pre-rendered group content.
Works with plain React props.

#### Components

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ComponentGroupBase` | component | `src/ui/components/_base/component-group/standalone.tsx` | Standalone ComponentGroup — a simple wrapper for pre-rendered group content. Works with plain React props. |

#### Props

| Prop | Type | Required | Summary |
| --- | --- | --- | --- |
| `children` | `ReactNode` | No | React children — pre-rendered group content. |
| `className` | `string \| undefined` | No | className applied to the root wrapper. |
| `id` | `string \| undefined` | No | Unique identifier for surface scoping. |
| `slots` | `Partial<Record<string, Record<string, unknown>>> \| undefined` | No | Slot overrides for sub-elements (root). |
| `style` | `CSSProperties \| undefined` | No | Inline style applied to the root wrapper. |

#### Types

| Export | Kind | Source | Summary |
| --- | --- | --- | --- |
| `ComponentGroupBaseProps` | interface | `src/ui/components/_base/component-group/standalone.tsx` |  |
| `ComponentGroupConfig` | type | `src/ui/components/_base/component-group/types.ts` |  |

---
