# Component Reference

All config-driven components available in `@lastshotlabs/snapshot/ui`. Every component
is rendered from a JSON config object in the manifest. Components fetch their own data,
manage their own loading/error/empty states, and communicate through the `id`/`from` ref
system.

All components share a base config:

| Field       | Type                                  | Default     | Description |
|-------------|---------------------------------------|-------------|-------------|
| `id`        | `string`                              | --          | Unique id for publishing state to the page context |
| `visible`   | `boolean \| FromRef \| Responsive`    | `true`      | Controls visibility. FromRef for conditional display |
| `className` | `string`                              | --          | Additional CSS class |
| `span`      | `number (1-12) \| Responsive`         | --          | Grid column span when inside a row |

---

## Structural Components

### row

Flex/grid container for laying out child components in a horizontal row.

| Field      | Type | Default | Description |
|------------|------|---------|-------------|
| `type`     | `"row"` | -- | Required |
| `gap`      | `"xs" \| "sm" \| "md" \| "lg" \| "xl" \| Responsive` | -- | Gap between children |
| `justify`  | `"start" \| "center" \| "end" \| "between" \| "around"` | -- | Horizontal alignment |
| `align`    | `"start" \| "center" \| "end" \| "stretch"` | -- | Vertical alignment |
| `wrap`     | `boolean` | -- | Whether children wrap to the next line |
| `children` | `ComponentConfig[]` | -- | Required. At least one child component |

```json
{
  "type": "row",
  "gap": "md",
  "justify": "between",
  "children": [
    { "type": "stat-card", "data": "GET /api/stats/a", "span": 6 },
    { "type": "stat-card", "data": "GET /api/stats/b", "span": 6 }
  ]
}
```

### heading

Renders an HTML heading element (h1-h6) with token-based styling.

| Field   | Type | Default | Description |
|---------|------|---------|-------------|
| `type`  | `"heading"` | -- | Required |
| `text`  | `string \| FromRef` | -- | Required. Heading text |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | -- | Heading level |

```json
{ "type": "heading", "text": "Dashboard", "level": 1 }
```

Dynamic text from another component:

```json
{ "type": "heading", "text": { "from": "users-table.selected.name" }, "level": 2 }
```

### button

A button that triggers one or more actions when clicked.

| Field     | Type | Default | Description |
|-----------|------|---------|-------------|
| `type`    | `"button"` | -- | Required |
| `label`   | `string` | -- | Required. Button text |
| `icon`    | `string` | -- | Lucide icon name |
| `variant` | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive" \| "link"` | `"default"` | Visual variant |
| `size`    | `"sm" \| "md" \| "lg" \| "icon"` | -- | Button size |
| `action`  | `ActionConfig \| ActionConfig[]` | -- | Required. Action(s) to execute on click |
| `disabled`| `boolean \| FromRef` | -- | Disabled state |

```json
{
  "type": "button",
  "label": "Add User",
  "icon": "Plus",
  "variant": "default",
  "action": { "type": "open-modal", "modal": "create-user" }
}
```

### select

A dropdown selector that publishes its selected value via `id`.

| Field         | Type | Default | Description |
|---------------|------|---------|-------------|
| `type`        | `"select"` | -- | Required |
| `options`     | `Array<{label, value}> \| string` | -- | Required. Static options or endpoint string |
| `valueField`  | `string` | -- | Field name for option value (when options come from an endpoint) |
| `labelField`  | `string` | -- | Field name for option label (when options come from an endpoint) |
| `default`     | `string` | -- | Default selected value |
| `placeholder` | `string` | -- | Placeholder text |

```json
{
  "type": "select",
  "id": "date-range",
  "options": [
    { "label": "Last 7 days", "value": "7d" },
    { "label": "Last 30 days", "value": "30d" },
    { "label": "Last 90 days", "value": "90d" }
  ],
  "default": "30d"
}
```

### custom

Escape hatch for rendering a consumer-registered React component.

| Field       | Type | Default | Description |
|-------------|------|---------|-------------|
| `type`      | `"custom"` | -- | Required |
| `component` | `string` | -- | Required. Name of the registered component |
| `props`     | `Record<string, unknown>` | -- | Props forwarded to the component |

```json
{ "type": "custom", "component": "MyWidget", "props": { "color": "blue" } }
```

Register the component in code:

```tsx
import { registerComponent } from "@lastshotlabs/snapshot/ui";
registerComponent("MyWidget", MyWidgetComponent);
```

---

## Layout Components

### layout

Defines the layout shell that wraps page content.

| Field     | Type | Default | Description |
|-----------|------|---------|-------------|
| `type`    | `"layout"` | -- | Required |
| `variant` | `"sidebar" \| "top-nav" \| "minimal" \| "full-width"` | -- | Required. Layout structure |

Layout variant is typically set at the page level via `page.layout`, not as a component
in the content tree.

### nav

Sidebar or top navigation bar with items, logo, and user menu.

| Field         | Type | Default | Description |
|---------------|------|---------|-------------|
| `type`        | `"nav"` | -- | Required |
| `items`       | `NavItem[]` | -- | Required. Navigation items |
| `collapsible` | `boolean` | `true` | Whether sidebar collapses on mobile |
| `userMenu`    | `boolean \| UserMenuConfig` | -- | Show user menu. `true` for defaults |
| `logo`        | `{ src?, text?, path? }` | -- | Logo/brand configuration |

**NavItem fields:**

| Field      | Type | Default | Description |
|------------|------|---------|-------------|
| `label`    | `string` | -- | Required. Display text |
| `path`     | `string` | -- | Route path |
| `icon`     | `string` | -- | Lucide icon name |
| `badge`    | `number \| FromRef` | -- | Badge count |
| `roles`    | `string[]` | -- | Required roles (visible to all if omitted) |
| `children` | `NavItem[]` | -- | Nested sub-items |

**UserMenuConfig fields:**

| Field        | Type | Default | Description |
|--------------|------|---------|-------------|
| `showAvatar` | `boolean` | `true` | Show user avatar |
| `showEmail`  | `boolean` | `false` | Show user email |
| `items`      | `Array<{ label, icon?, action }>` | -- | Additional menu items |

```json
{
  "type": "nav",
  "logo": { "text": "My App", "path": "/" },
  "items": [
    { "label": "Dashboard", "path": "/", "icon": "LayoutDashboard" },
    { "label": "Users", "path": "/users", "icon": "Users" },
    {
      "label": "Settings",
      "icon": "Settings",
      "children": [
        { "label": "General", "path": "/settings/general" },
        { "label": "Billing", "path": "/settings/billing" }
      ]
    }
  ],
  "userMenu": {
    "showAvatar": true,
    "showEmail": true,
    "items": [
      { "label": "Profile", "icon": "User", "action": { "type": "navigate", "to": "/profile" } },
      { "label": "Logout", "icon": "LogOut", "action": { "type": "api", "method": "POST", "endpoint": "/api/auth/logout" } }
    ]
  }
}
```

Headless hook: `useNav` returns resolved nav items with active state and role filtering.

---

## Data Components

### stat-card

Displays a single metric with optional trend indicator. Fetches its own data.

| Field       | Type | Default | Description |
|-------------|------|---------|-------------|
| `type`      | `"stat-card"` | -- | Required |
| `data`      | `string \| FromRef` | -- | Required. API endpoint (e.g. `"GET /api/stats/revenue"`) |
| `params`    | `Record<string, unknown \| FromRef>` | -- | Query parameters |
| `field`     | `string` | auto-detect | Response field to display |
| `label`     | `string \| FromRef` | humanized field | Display label |
| `format`    | `"number" \| "currency" \| "percent" \| "compact" \| "decimal"` | -- | Number format |
| `currency`  | `string` | `"USD"` | Currency code (when format is `"currency"`) |
| `decimals`  | `number` | auto | Decimal places |
| `prefix`    | `string` | -- | Prefix text (e.g. "$") |
| `suffix`    | `string` | -- | Suffix text (e.g. "%") |
| `icon`      | `string` | -- | Lucide icon name |
| `iconColor` | `string` | -- | Semantic token name for icon color |
| `trend`     | `TrendConfig` | -- | Trend indicator |
| `action`    | `ActionConfig` | -- | Click action |
| `loading`   | `"skeleton" \| "pulse" \| "spinner"` | `"skeleton"` | Loading state variant |

**TrendConfig fields:**

| Field       | Type | Default | Description |
|-------------|------|---------|-------------|
| `field`     | `string` | -- | Required. Response field for comparison value |
| `sentiment` | `"up-is-good" \| "up-is-bad"` | `"up-is-good"` | Trend direction sentiment |
| `format`    | `"percent" \| "absolute"` | `"percent"` | How to format the trend value |

```json
{
  "type": "stat-card",
  "data": "GET /api/stats/revenue",
  "field": "total",
  "label": "Revenue",
  "format": "currency",
  "icon": "DollarSign",
  "trend": { "field": "previousTotal", "sentiment": "up-is-good" }
}
```

### data-table

Full-featured data table with sorting, pagination, filtering, selection, search, row
actions, and bulk actions. Publishes `selected` row(s) when `id` is set.

| Field         | Type | Default | Description |
|---------------|------|---------|-------------|
| `type`        | `"data-table"` | -- | Required |
| `data`        | `string \| FromRef` | -- | Required. API endpoint |
| `params`      | `Record<string, unknown \| FromRef>` | -- | Query parameters |
| `columns`     | `"auto" \| ColumnConfig[]` | -- | Required. `"auto"` derives from response keys |
| `pagination`  | `PaginationConfig \| false` | -- | Pagination config. `false` to disable |
| `selectable`  | `boolean` | -- | Enable row selection checkboxes |
| `searchable`  | `boolean \| SearchConfig` | -- | Enable search bar |
| `actions`     | `RowAction[]` | -- | Per-row action buttons |
| `bulkActions` | `BulkAction[]` | -- | Actions on selected rows |
| `emptyMessage`| `string` | -- | Message when no data |
| `density`     | `"compact" \| "default" \| "comfortable"` | `"default"` | Row padding density |

**ColumnConfig fields:**

| Field        | Type | Default | Description |
|--------------|------|---------|-------------|
| `field`      | `string` | -- | Required. Field name from data object |
| `label`      | `string` | humanized field | Column header label |
| `sortable`   | `boolean` | -- | Enable sorting |
| `format`     | `"date" \| "number" \| "currency" \| "badge" \| "boolean"` | -- | Display format |
| `badgeColors`| `Record<string, string>` | -- | Map field values to semantic colors (for badge format) |
| `filter`     | `{ type: "select" \| "text" \| "date-range", options? }` | -- | Column filter |
| `width`      | `string` | -- | CSS width (e.g. `"200px"`, `"20%"`) |
| `align`      | `"left" \| "center" \| "right"` | -- | Text alignment |

**PaginationConfig fields:**

| Field      | Type | Default | Description |
|------------|------|---------|-------------|
| `type`     | `"offset" \| "cursor"` | -- | Required. Pagination strategy |
| `pageSize` | `number` | `10` | Rows per page |

**RowAction fields:**

| Field    | Type | Default | Description |
|----------|------|---------|-------------|
| `label`  | `string` | -- | Required. Button text |
| `icon`   | `string` | -- | Icon name |
| `action` | `ActionConfig \| ActionConfig[]` | -- | Required. Action(s) on click. Row data available in context |
| `visible`| `boolean \| FromRef` | -- | Conditional visibility |

**BulkAction fields:**

| Field    | Type | Default | Description |
|----------|------|---------|-------------|
| `label`  | `string` | -- | Required. `{count}` interpolates to selected count |
| `icon`   | `string` | -- | Icon name |
| `action` | `ActionConfig \| ActionConfig[]` | -- | Required. Selected rows available in context |

```json
{
  "type": "data-table",
  "id": "users-table",
  "data": "GET /api/users",
  "columns": [
    { "field": "name", "sortable": true },
    { "field": "email" },
    {
      "field": "status",
      "format": "badge",
      "badgeColors": { "active": "success", "inactive": "muted" },
      "filter": { "type": "select", "options": "auto" }
    }
  ],
  "pagination": { "type": "offset", "pageSize": 20 },
  "selectable": true,
  "searchable": true,
  "actions": [
    {
      "label": "View",
      "icon": "Eye",
      "action": { "type": "navigate", "to": "/users/{id}" }
    }
  ]
}
```

Headless hook: `useDataTable` returns rows, sort state, pagination state, selection, and
handlers without rendering.

### detail-card

Displays a single record's fields in a key-value layout. Used in drawers, modals, and
detail pages.

| Field        | Type | Default | Description |
|--------------|------|---------|-------------|
| `type`       | `"detail-card"` | -- | Required |
| `data`       | `string \| FromRef` | -- | Required. Endpoint or FromRef to get record data |
| `params`     | `Record<string, unknown \| FromRef>` | -- | URL params for the endpoint |
| `title`      | `string \| FromRef` | -- | Card title |
| `fields`     | `"auto" \| DetailFieldConfig[]` | `"auto"` | Field configuration. `"auto"` shows all fields |
| `actions`    | `DetailCardAction[]` | -- | Action buttons in the card header |
| `emptyState` | `string` | -- | Message when data is null/undefined |

**DetailFieldConfig fields:**

| Field      | Type | Default | Description |
|------------|------|---------|-------------|
| `field`    | `string` | -- | Required. Field key from the data object |
| `label`    | `string` | humanized field | Display label |
| `format`   | `"text" \| "date" \| "datetime" \| "number" \| "currency" \| "badge" \| "boolean" \| "email" \| "url" \| "image" \| "link" \| "list"` | `"text"` | Render format |
| `copyable` | `boolean` | -- | Show copy-to-clipboard button |

```json
{
  "type": "detail-card",
  "data": { "from": "users-table.selected" },
  "title": "User Details",
  "fields": [
    { "field": "name", "label": "Full Name" },
    { "field": "email", "format": "email", "copyable": true },
    { "field": "role", "format": "badge" },
    { "field": "createdAt", "format": "date" }
  ],
  "actions": [
    { "label": "Edit", "icon": "Pencil", "action": { "type": "open-modal", "modal": "edit-user" } }
  ]
}
```

Headless hook: `useDetailCard` returns resolved fields and loading state without rendering.

---

## Form Components

### auto-form (type: "form")

Config-driven form that auto-generates fields. Supports validation, submission, and
action chaining on success/error.

| Field          | Type | Default | Description |
|----------------|------|---------|-------------|
| `type`         | `"form"` | -- | Required |
| `data`         | `string \| FromRef` | -- | Endpoint to load initial values (edit forms) |
| `submit`       | `string` | -- | Required. Endpoint for form submission |
| `method`       | `"POST" \| "PUT" \| "PATCH"` | `"POST"` | HTTP method |
| `fields`       | `"auto" \| FieldConfig[]` | -- | Required. Field definitions |
| `submitLabel`  | `string` | `"Submit"` | Submit button text |
| `resetOnSubmit`| `boolean` | -- | Reset form after successful submission |
| `onSuccess`    | `ActionConfig \| ActionConfig[]` | -- | Actions after successful submission |
| `onError`      | `ActionConfig \| ActionConfig[]` | -- | Actions when submission fails |

**FieldConfig fields:**

| Field        | Type | Default | Description |
|--------------|------|---------|-------------|
| `name`       | `string` | -- | Required. Maps to key in submitted values |
| `type`       | `"text" \| "email" \| "password" \| "number" \| "textarea" \| "select" \| "checkbox" \| "date" \| "file"` | -- | Required. Input type |
| `label`      | `string` | humanized name | Display label |
| `placeholder`| `string` | -- | Placeholder text |
| `required`   | `boolean` | -- | Whether the field is required |
| `validation` | `ValidationConfig` | -- | Client-side validation rules |
| `options`    | `Array<{label, value}> \| string` | -- | Options for select fields |
| `default`    | `unknown` | -- | Default value |

**ValidationConfig fields:**

| Field       | Type | Description |
|-------------|------|-------------|
| `minLength` | `number` | Minimum string length |
| `maxLength` | `number` | Maximum string length |
| `min`       | `number` | Minimum numeric value |
| `max`       | `number` | Maximum numeric value |
| `pattern`   | `string` | Regex pattern |
| `message`   | `string` | Custom error message |

```json
{
  "type": "form",
  "submit": "/api/users",
  "method": "POST",
  "fields": [
    { "name": "email", "type": "email", "required": true },
    { "name": "name", "type": "text", "label": "Full Name" },
    {
      "name": "password", "type": "password", "required": true,
      "validation": { "minLength": 8, "message": "At least 8 characters" }
    },
    {
      "name": "role", "type": "select",
      "options": [
        { "label": "User", "value": "user" },
        { "label": "Admin", "value": "admin" }
      ]
    }
  ],
  "submitLabel": "Create User",
  "onSuccess": [
    { "type": "close-modal" },
    { "type": "refresh", "target": "users-table" },
    { "type": "toast", "message": "User created!", "variant": "success" }
  ]
}
```

Headless hook: `useAutoForm` returns form values, errors, touched fields, handlers, and
submit function without rendering.

---

## Overlay Components

### modal

Overlay dialog opened/closed via the `open-modal`/`close-modal` actions.

| Field     | Type | Default | Description |
|-----------|------|---------|-------------|
| `type`    | `"modal"` | -- | Required |
| `title`   | `string \| FromRef` | -- | Modal title |
| `size`    | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"md"` | Modal size |
| `trigger` | `FromRef` | -- | Auto-open when resolved value is truthy |
| `content` | `ComponentConfig[]` | -- | Required. Child components inside the modal body |

```json
{
  "type": "modal",
  "id": "edit-user",
  "title": "Edit User",
  "size": "lg",
  "content": [
    {
      "type": "form",
      "data": { "from": "users-table.selected" },
      "submit": "/api/users/{id}",
      "method": "PUT",
      "fields": "auto",
      "onSuccess": [
        { "type": "close-modal" },
        { "type": "refresh", "target": "users-table" }
      ]
    }
  ]
}
```

Open a modal from a button:

```json
{ "type": "button", "label": "Edit", "action": { "type": "open-modal", "modal": "edit-user" } }
```

### drawer

Slide-in panel from the left or right edge. Same open/close mechanism as modals.

| Field     | Type | Default | Description |
|-----------|------|---------|-------------|
| `type`    | `"drawer"` | -- | Required |
| `title`   | `string \| FromRef` | -- | Drawer title |
| `size`    | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"md"` | Drawer width |
| `side`    | `"left" \| "right"` | `"right"` | Which side it slides in from |
| `trigger` | `FromRef` | -- | Auto-open when resolved value is truthy |
| `content` | `ComponentConfig[]` | -- | Required. Child components inside the drawer |

```json
{
  "type": "drawer",
  "id": "user-detail",
  "trigger": { "from": "users-table.selected" },
  "title": { "from": "users-table.selected.name" },
  "side": "right",
  "size": "md",
  "content": [
    {
      "type": "detail-card",
      "data": { "from": "users-table.selected" }
    }
  ]
}
```

---

## Navigation Components

### tabs

In-page tabbed navigation. Each tab renders its own content panel. Publishes the active
tab index when `id` is set.

| Field        | Type | Default | Description |
|--------------|------|---------|-------------|
| `type`       | `"tabs"` | -- | Required |
| `children`   | `TabConfig[]` | -- | Required. At least one tab |
| `defaultTab` | `number` | `0` | Index of the initially active tab |
| `variant`    | `"default" \| "underline" \| "pills"` | `"default"` | Tab bar visual style |

**TabConfig fields:**

| Field      | Type | Default | Description |
|------------|------|---------|-------------|
| `label`    | `string` | -- | Required. Tab label |
| `icon`     | `string` | -- | Lucide icon name |
| `content`  | `ComponentConfig[]` | -- | Required. Components rendered when tab is active |
| `disabled` | `boolean` | -- | Whether the tab is disabled |

```json
{
  "type": "tabs",
  "id": "settings-tabs",
  "variant": "underline",
  "children": [
    {
      "label": "General",
      "icon": "Settings",
      "content": [
        { "type": "form", "submit": "/api/settings", "fields": "auto" }
      ]
    },
    {
      "label": "Notifications",
      "icon": "Bell",
      "content": [
        { "type": "form", "submit": "/api/settings/notifications", "fields": "auto" }
      ]
    },
    {
      "label": "Danger Zone",
      "icon": "AlertTriangle",
      "content": [
        {
          "type": "button",
          "label": "Delete Account",
          "variant": "destructive",
          "action": [
            { "type": "confirm", "message": "This cannot be undone.", "variant": "destructive" },
            { "type": "api", "method": "DELETE", "endpoint": "/api/account" },
            { "type": "navigate", "to": "/goodbye" }
          ]
        }
      ]
    }
  ]
}
```
