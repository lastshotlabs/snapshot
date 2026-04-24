---
title: Layout and Navigation
description: App shells, sidebars, top-nav, grids, cards, and layout composition.
draft: false
---

```tsx
import { LayoutBase, NavBase, CardBase, GridBase } from "@lastshotlabs/snapshot/ui";

function AppShell({ children }) {
  return (
    <LayoutBase
      variant="sidebar"
      nav={
        <NavBase
          variant="sidebar"
          logo={{ text: "My App", path: "/" }}
          items={[
            { label: "Dashboard", path: "/", icon: "home" },
            { label: "Users", path: "/users", icon: "users" },
            { label: "Settings", path: "/settings", icon: "settings" },
          ]}
          collapsible
        />
      }
    >
      {children}
    </LayoutBase>
  );
}
```

## LayoutBase

Wraps your page content with nav, header, sidebar, main, and footer regions.

```tsx
<LayoutBase variant="sidebar" nav={<NavBase ... />}>
  <h1>Page content</h1>
</LayoutBase>
```

**Variants:**

| Variant | Description |
|---------|-------------|
| `sidebar` | Nav on the left, content on the right |
| `top-nav` | Nav on top, content below |
| `stacked` | Vertical stack: header, sidebar, main, footer |
| `minimal` | Centered single column |
| `centered` | Centered, max-width constrained |
| `full-width` | No constraints, full viewport |

**Layout slots** for advanced composition:

```tsx
<LayoutBase
  variant="sidebar"
  nav={<NavBase ... />}
  layoutSlots={{
    header: <AnnouncementBar />,
    footer: <Footer />,
  }}
>
  <Dashboard />
</LayoutBase>
```

## NavBase

Main navigation component supporting sidebar and top-nav layouts.

### Sidebar navigation

```tsx
<NavBase
  variant="sidebar"
  logo={{ text: "My App", src: "/logo.svg", path: "/" }}
  items={[
    { label: "Dashboard", path: "/", icon: "home" },
    { label: "Users", path: "/users", icon: "users", badge: "12" },
    { label: "Reports", path: "/reports", icon: "bar-chart", children: [
      { label: "Revenue", path: "/reports/revenue" },
      { label: "Growth", path: "/reports/growth" },
    ]},
    { label: "Settings", path: "/settings", icon: "settings" },
  ]}
  collapsible
  pathname={currentPath}
  onNavigate={(path) => router.push(path)}
/>
```

### Top navigation

```tsx
<NavBase
  variant="top-nav"
  logo={{ text: "My App", path: "/" }}
  items={[
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Pricing", path: "/pricing" },
  ]}
>
  <ButtonBase label="Sign in" variant="outline" />
</NavBase>
```

### Nav item shape

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Display text |
| `path` | `string` | Navigation path |
| `icon` | `string` | Icon name |
| `badge` | `string` | Badge text |
| `disabled` | `boolean` | Disable the item |
| `active` | `boolean` | Force active state |
| `visible` | `boolean` | Show/hide the item |
| `children` | `NavBaseItem[]` | Nested sub-items |

## NavLinkBase

Individual nav link for custom navigation layouts.

```tsx
import { NavLinkBase } from "@lastshotlabs/snapshot/ui";

<NavLinkBase
  path="/users"
  label="Users"
  icon="users"
  badge="12"
  active={pathname === "/users"}
  onNavigate={(path) => router.push(path)}
/>
```

## NavUserMenuBase

User dropdown menu with avatar for auth-aware navigation.

```tsx
import { NavUserMenuBase } from "@lastshotlabs/snapshot/ui";

<NavUserMenuBase
  userName={user.name}
  userEmail={user.email}
  userAvatar={user.avatarUrl}
  showAvatar
  showName
  items={[
    { label: "Profile", icon: "user", onClick: () => navigate("/profile") },
    { label: "Settings", icon: "settings", onClick: () => navigate("/settings") },
    { label: "Sign out", icon: "log-out", onClick: () => logout() },
  ]}
/>
```

## Grid layout

### GridBase

CSS Grid container.

```tsx
import { GridBase } from "@lastshotlabs/snapshot/ui";

<GridBase columns={3} gap="md">
  <CardBase title="Revenue">$48,200</CardBase>
  <CardBase title="Users">1,234</CardBase>
  <CardBase title="Orders">567</CardBase>
</GridBase>
```

**Responsive columns:** Pass a string for responsive grid:

```tsx
<GridBase columns="repeat(auto-fill, minmax(300px, 1fr))" gap="lg">
  {items.map((item) => <CardBase key={item.id} title={item.name} />)}
</GridBase>
```

### RowBase and ColumnBase

Flexbox row and column containers.

```tsx
import { RowBase, ColumnBase } from "@lastshotlabs/snapshot/ui";

<RowBase gap="md" align="center" justify="between">
  <h1>Users</h1>
  <ButtonBase label="Add User" icon="plus" />
</RowBase>

<ColumnBase gap="lg">
  <SectionOne />
  <SectionTwo />
</ColumnBase>
```

## Cards and containers

### CardBase

Styled card with optional title and subtitle.

```tsx
<CardBase title="Project Details" subtitle="Last updated 2 hours ago" gap="md">
  <p>Card content</p>
</CardBase>
```

### ContainerBase

Centered, max-width wrapper for page content.

```tsx
import { ContainerBase } from "@lastshotlabs/snapshot/ui";

<ContainerBase maxWidth="lg" padding="xl">
  <h1>Page Title</h1>
  <p>Content is centered and constrained.</p>
</ContainerBase>
```

**Max-width presets:** `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `full`, `prose`

### BoxBase

Generic element wrapper with customizable HTML tag.

```tsx
import { BoxBase } from "@lastshotlabs/snapshot/ui";

<BoxBase as="section" className="hero-section">
  <h1>Welcome</h1>
</BoxBase>
```

**HTML tags:** `div`, `section`, `article`, `aside`, `header`, `footer`, `main`, `nav`, `span`

## Spacing and sections

### SectionBase

Full-width vertical section.

```tsx
import { SectionBase } from "@lastshotlabs/snapshot/ui";

<SectionBase height="screen" align="center" justify="center">
  <h1>Full-height hero</h1>
</SectionBase>
```

### SpacerBase

Empty spacing element.

```tsx
import { SpacerBase } from "@lastshotlabs/snapshot/ui";

<ColumnBase>
  <Header />
  <SpacerBase size="xl" />
  <Content />
</ColumnBase>
```

**Spacing tokens:** `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`

## Advanced layout

### SplitPaneBase

Resizable two-pane split.

```tsx
import { SplitPaneBase } from "@lastshotlabs/snapshot/ui";

<SplitPaneBase
  direction="horizontal"
  defaultSplit={30}
  minSize={200}
  first={<Sidebar />}
  second={<MainContent />}
/>
```

### CollapsibleBase

Animated expand/collapse.

```tsx
import { CollapsibleBase } from "@lastshotlabs/snapshot/ui";

<CollapsibleBase
  trigger={<ButtonBase label="Show details" variant="ghost" />}
  defaultOpen={false}
  duration="normal"
>
  <p>Hidden content that expands on click.</p>
</CollapsibleBase>
```

## Composition: full app shell

```tsx
function App() {
  const { user } = snap.useUser();
  const { mutate: logout } = snap.useLogout();

  return (
    <LayoutBase
      variant="sidebar"
      nav={
        <NavBase
          variant="sidebar"
          logo={{ text: "Admin", src: "/logo.svg", path: "/" }}
          items={[
            { label: "Dashboard", path: "/", icon: "home" },
            { label: "Users", path: "/users", icon: "users" },
            { label: "Reports", path: "/reports", icon: "bar-chart" },
          ]}
          collapsible
          onNavigate={(path) => router.push(path)}
        />
      }
    >
      <ContainerBase maxWidth="xl" padding="lg">
        <RowBase justify="between" align="center">
          <h1>Dashboard</h1>
          <NavUserMenuBase
            userName={user?.name}
            userAvatar={user?.avatarUrl}
            items={[
              { label: "Settings", icon: "settings", onClick: () => navigate("/settings") },
              { label: "Sign out", icon: "log-out", onClick: () => logout() },
            ]}
          />
        </RowBase>
        <SpacerBase size="lg" />
        <GridBase columns={3} gap="md">
          <StatCardBase label="Revenue" value="$48K" trend={{ direction: "up", value: "+12%" }} />
          <StatCardBase label="Users" value="1,234" trend={{ direction: "up", value: "+5%" }} />
          <StatCardBase label="Orders" value="567" trend={{ direction: "down", value: "-3%" }} />
        </GridBase>
      </ContainerBase>
    </LayoutBase>
  );
}
```

## All layout components

| Component | Description |
|-----------|-------------|
| `LayoutBase` | App shell with 6 layout variants |
| `NavBase` | Sidebar and top-nav navigation |
| `NavLinkBase` | Individual nav link |
| `NavUserMenuBase` | User dropdown menu |
| `GridBase` | CSS Grid container |
| `RowBase` | Flex row |
| `ColumnBase` | Flex column |
| `CardBase` | Styled card |
| `ContainerBase` | Centered max-width wrapper |
| `BoxBase` | Generic element wrapper |
| `SectionBase` | Full-width section |
| `SpacerBase` | Spacing element |
| `SplitPaneBase` | Resizable split panes |
| `CollapsibleBase` | Expand/collapse |

## Next steps

- [Data Tables and Lists](/guides/data-tables/) -- fill your layout with data
- [Overlays and Modals](/guides/overlays/) -- modals and drawers for CRUD
- [Theming and Styling](/guides/theming-and-styling/) -- customize layout appearance
