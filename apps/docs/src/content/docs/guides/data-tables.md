---
title: Data Tables and Lists
description: Display data with tables, lists, feeds, charts, stat cards, and filter bars.
draft: false
---

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";
import { DataTableBase } from "@lastshotlabs/snapshot/ui";
import { useState } from "react";

const snap = createSnapshot({ apiUrl: "/api", manifest: {} });

function UsersTable() {
  const { data: users, isLoading, error } = snap.api.useQuery<User[]>("/users");
  const [sort, setSort] = useState({ column: "name", direction: "asc" });

  return (
    <DataTableBase
      columns={[
        { field: "name", label: "Name", sortable: true },
        { field: "email", label: "Email" },
        { field: "role", label: "Role", format: "badge", badgeColors: {
          admin: "blue", member: "gray", owner: "green",
        }},
        { field: "createdAt", label: "Joined", format: "date" },
      ]}
      rows={users ?? []}
      isLoading={isLoading}
      error={error?.message}
      emptyMessage="No users found"
      sort={sort}
      onSortChange={(col) => setSort((prev) =>
        prev.column === col
          ? { column: col, direction: prev.direction === "asc" ? "desc" : "asc" }
          : { column: col, direction: "asc" }
      )}
      hoverable
      striped
    />
  );
}
```

## DataTableBase

Feature-rich data table with sorting, pagination, search, selection, and row actions.

### Column config

```tsx
const columns = [
  { field: "name", label: "Name", sortable: true },
  { field: "email", label: "Email" },
  { field: "amount", label: "Amount", format: "currency", prefix: "$", divisor: 100 },
  { field: "status", label: "Status", format: "badge", badgeColors: {
    active: "green", inactive: "gray", suspended: "red",
  }},
  { field: "avatar", label: "", format: "avatar", avatarField: "avatarUrl", width: "48px" },
  { field: "verified", label: "Verified", format: "boolean" },
  { field: "progress", label: "Progress", format: "progress" },
  { field: "website", label: "Website", format: "link", linkTextField: "websiteLabel" },
];
```

**Column format options:** `date`, `number`, `currency`, `badge`, `boolean`, `avatar`, `progress`, `link`, `code`

### Pagination

```tsx
<DataTableBase
  columns={columns}
  rows={pageData}
  pagination={{
    currentPage: page,
    totalPages: Math.ceil(total / pageSize),
    pageSize,
    totalRows: total,
  }}
  onPageChange={setPage}
/>
```

### Search

```tsx
<DataTableBase
  columns={columns}
  rows={filtered}
  searchable
  search={query}
  onSearchChange={setQuery}
/>
```

### Row selection

```tsx
const [selected, setSelected] = useState(new Set());

<DataTableBase
  columns={columns}
  rows={users}
  selectable
  selection={selected}
  onToggleRow={(id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }}
  onToggleAll={(allIds) => {
    setSelected((prev) => prev.size === allIds.length ? new Set() : new Set(allIds));
  }}
  bulkActions={[
    { label: "Delete", icon: "trash", variant: "destructive", onAction: (ids) => deleteMany(ids) },
    { label: "Export", icon: "download", onAction: (ids) => exportCsv(ids) },
  ]}
/>
```

### Row actions

```tsx
<DataTableBase
  columns={columns}
  rows={users}
  rowActions={[
    { label: "Edit", icon: "edit", onAction: (row) => openEdit(row) },
    { label: "Delete", icon: "trash", variant: "destructive", onAction: (row) => deleteUser(row.id) },
  ]}
/>
```

### Loading and error states

DataTableBase has built-in loading, error, and empty states:

```tsx
<DataTableBase
  columns={columns}
  rows={data ?? []}
  isLoading={isLoading}
  error={error?.message}
  emptyMessage="No users found"
/>
```

You can also provide custom content for each state:

```tsx
<DataTableBase
  columns={columns}
  rows={data ?? []}
  isLoading={isFetching}
  loadingContent={<p>Fetching users...</p>}
  errorContent={<p>Something went wrong. <button onClick={refetch}>Try again</button></p>}
  emptyContent={<p>No users match your filters. <button onClick={clearFilters}>Clear filters</button></p>}
/>
```

## ListBase

Vertical list with icons, badges, and actions.

```tsx
import { ListBase } from "@lastshotlabs/snapshot/ui";

<ListBase
  items={[
    { id: "1", title: "Getting started", description: "Learn the basics", icon: "book" },
    { id: "2", title: "API Reference", description: "Full API docs", icon: "code", badge: "New", badgeColor: "blue" },
    { id: "3", title: "Examples", description: "Real-world examples", icon: "layout", href: "/examples" },
  ]}
  variant="bordered"
  divider
/>
```

**Variants:** `default`, `bordered`, `card`

## FeedBase

Activity feed with grouping and pagination.

```tsx
import { FeedBase } from "@lastshotlabs/snapshot/ui";

<FeedBase
  items={activities.map((a) => ({
    key: a.id,
    title: a.actor,
    description: a.action,
    timestamp: a.createdAt,
    avatar: a.actorAvatar,
    raw: a,
  }))}
  relativeTime
  groupBy="day"
  pageSize={20}
  infinite
  itemActions={[
    { label: "Reply", icon: "reply", onAction: (item) => reply(item) },
  ]}
/>
```

## ChartBase

Data visualization supporting 10 chart types.

```tsx
import { ChartBase } from "@lastshotlabs/snapshot/ui";

<ChartBase
  chartType="bar"
  data={[
    { month: "Jan", revenue: 4200, expenses: 3100 },
    { month: "Feb", revenue: 5300, expenses: 2800 },
    { month: "Mar", revenue: 6100, expenses: 3500 },
  ]}
  xKey="month"
  series={[
    { key: "revenue", label: "Revenue", color: "#3b82f6" },
    { key: "expenses", label: "Expenses", color: "#ef4444" },
  ]}
  height={300}
  legend
  grid
/>
```

**Chart types:** `line`, `bar`, `area`, `pie`, `donut`, `radar`, `scatter`, `treemap`, `funnel`, `sparkline`

## StatCardBase

Single metric display with trend indicator.

```tsx
import { StatCardBase } from "@lastshotlabs/snapshot/ui";

<StatCardBase
  label="Total Revenue"
  value="$48,200"
  icon="dollar-sign"
  trend={{
    direction: "up",
    value: "+12.5%",
    percentage: 12.5,
    sentiment: "positive",
  }}
/>
```

## FilterBarBase

Search and dropdown filters that compose with any data component.

```tsx
import { FilterBarBase } from "@lastshotlabs/snapshot/ui";

<FilterBarBase
  showSearch
  searchPlaceholder="Search users..."
  filters={[
    { key: "role", label: "Role", options: [
      { label: "Admin", value: "admin" },
      { label: "Member", value: "member" },
    ]},
    { key: "status", label: "Status", multiple: true, options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ]},
  ]}
  onChange={({ search, filters }) => {
    setQuery(search);
    setFilters(filters);
  }}
/>
```

## DetailCardBase

Formatted data display for single records.

```tsx
import { DetailCardBase } from "@lastshotlabs/snapshot/ui";

<DetailCardBase
  title="User Details"
  data={user}
  fields={[
    { field: "name", label: "Name", value: user.name },
    { field: "email", label: "Email", value: user.email, format: "email", copyable: true },
    { field: "role", label: "Role", value: user.role, format: "badge" },
    { field: "createdAt", label: "Joined", value: user.createdAt, format: "date" },
    { field: "verified", label: "Verified", value: user.verified, format: "boolean" },
  ]}
  actions={[
    { label: "Edit", icon: "edit", onAction: () => openEdit(user) },
  ]}
/>
```

**Field formats:** `text`, `boolean`, `date`, `datetime`, `number`, `currency`, `badge`, `email`, `url`, `link`, `image`, `list`

## All data components

| Component | Description |
|-----------|-------------|
| `DataTableBase` | Full-featured data table |
| `ListBase` | Vertical item list |
| `FeedBase` | Activity feed with grouping |
| `ChartBase` | 10 chart types |
| `StatCardBase` | Single metric card |
| `FilterBarBase` | Search and filter controls |
| `DetailCardBase` | Formatted single-record display |
| `EntityPickerBase` | Entity selection dropdown |
| `AlertBase` | Alert/notification banners |
| `BadgeBase` | Status badges |
| `AvatarBase` | User avatars |
| `AvatarGroupBase` | Stacked avatar group |
| `TooltipBase` | Hover tooltips |
| `ProgressBase` | Progress bars |
| `SkeletonBase` | Loading placeholders |
| `ScrollAreaBase` | Scrollable container |
| `SeparatorBase` | Visual dividers |
| `EmptyStateBase` | Empty state messages |
| `HighlightedTextBase` | Text highlighting |
| `NotificationBellBase` | Notification indicator |
| `SaveIndicatorBase` | Save status indicator |
| `FavoriteButtonBase` | Favorite toggle |
| `VoteBase` | Upvote/downvote |

## Next steps

- [Layout and Navigation](/guides/layout-and-navigation/) -- app shells, grids, and nav bars
- [Overlays and Modals](/guides/overlays/) -- CRUD modals for table row actions
- [Theming and Styling](/guides/theming-and-styling/) -- customize table appearance
