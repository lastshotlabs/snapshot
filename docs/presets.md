# Page Presets

Presets are TypeScript factory functions that return a valid `PageConfig` from
high-level options. Instead of writing 80 lines of manifest JSON for a CRUD page,
you write 15 lines of typed TypeScript.

```ts
import { crudPage } from "@lastshotlabs/snapshot/ui";

const usersPage = crudPage({
  title: "Users",
  listEndpoint: "GET /api/users",
  createEndpoint: "POST /api/users",
  deleteEndpoint: "DELETE /api/users/{id}",
  columns: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", badge: true },
  ],
});
```

Drop the result into a manifest's `pages` record:

```ts
const manifest = {
  pages: {
    "/users": usersPage,
    "/dashboard": dashboardPage({ ... }),
  },
};
```

Presets produce standard `PageConfig` objects — the result is identical to writing
the manifest by hand. You can inspect the output, mix in hand-written components,
or use it as a starting point and customize from there.

---

## `crudPage`

Generates a full create/read/update/delete page with:

- A page heading
- A "Create" button (when `createEndpoint` is provided)
- A searchable `DataTable` bound to `listEndpoint`
- A `Modal` with an `AutoForm` for record creation
- A `Drawer` with an `AutoForm` for record editing (when `updateEndpoint` is provided)
- A confirm-then-delete row action (when `deleteEndpoint` is provided)

```ts
import { crudPage } from "@lastshotlabs/snapshot/ui";
import type { CrudPageOptions } from "@lastshotlabs/snapshot/ui";
```

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `title` | `string` | yes | Page heading text |
| `listEndpoint` | `string` | yes | `"GET /api/..."` — data source for the table |
| `createEndpoint` | `string` | no | `"POST /api/..."` — enables the Create button + modal |
| `updateEndpoint` | `string` | no | `"PUT /api/.../{id}"` — enables the Edit row action + drawer |
| `deleteEndpoint` | `string` | no | `"DELETE /api/.../{id}"` — enables the Delete row action |
| `columns` | `ColumnDef[]` | yes | Column definitions for the data table |
| `createForm` | `FormDef` | no | Form fields for the create modal. Required if `createEndpoint` is set |
| `updateForm` | `FormDef` | no | Form fields for the edit drawer. Defaults to same as `createForm` |
| `filters` | `FilterDef[]` | no | Filter bar definitions |
| `id` | `string` | no | ID prefix for sub-component refs. Defaults to slugified `title` |

### `FormDef`

| Field | Type | Description |
|-------|------|-------------|
| `fields` | `FormFieldDef[]` | Form field definitions |

### `ColumnDef`

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Field name in the data object |
| `label` | `string` | Column header label |
| `badge` | `boolean` | Render value as a status badge |
| `format` | `"date" \| "currency" \| "number" \| "boolean"` | Value format |

### `FormFieldDef`

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Maps to the submitted value key |
| `type` | `"text" \| "email" \| "password" \| "number" \| "select" \| "textarea" \| "toggle"` | Input type |
| `label` | `string` | Display label |
| `required` | `boolean` | Whether the field is required |
| `options` | `Array<{label, value}>` | Options for select fields |
| `placeholder` | `string` | Placeholder text |

### `FilterDef`

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | The field to filter on |
| `label` | `string` | Filter label |
| `type` | `"select" \| "text"` | Filter input type |
| `options` | `Array<{label, value}>` | Options for select filters |

### Example: Users CRUD page

```ts
import { crudPage } from "@lastshotlabs/snapshot/ui";

const usersPage = crudPage({
  title: "Users",
  listEndpoint: "GET /api/users",
  createEndpoint: "POST /api/users",
  updateEndpoint: "PUT /api/users/{id}",
  deleteEndpoint: "DELETE /api/users/{id}",

  columns: [
    { key: "name", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", badge: true },
    { key: "createdAt", label: "Joined", format: "date" },
  ],

  createForm: {
    fields: [
      { key: "name", type: "text", label: "Full Name", required: true },
      { key: "email", type: "email", required: true },
      {
        key: "role", type: "select",
        options: [
          { label: "User", value: "user" },
          { label: "Admin", value: "admin" },
        ],
      },
    ],
  },

  filters: [
    {
      key: "role",
      label: "Role",
      type: "select",
      options: [
        { label: "All", value: "" },
        { label: "User", value: "user" },
        { label: "Admin", value: "admin" },
      ],
    },
  ],
});
```

### Example: Products catalog with currency formatting

```ts
const productsPage = crudPage({
  title: "Products",
  listEndpoint: "GET /api/products",
  createEndpoint: "POST /api/products",
  deleteEndpoint: "DELETE /api/products/{id}",

  columns: [
    { key: "name", label: "Product" },
    { key: "sku", label: "SKU" },
    { key: "price", label: "Price", format: "currency" },
    { key: "stock", label: "Stock", format: "number" },
    { key: "active", label: "Status", badge: true },
  ],

  createForm: {
    fields: [
      { key: "name", type: "text", required: true },
      { key: "sku", type: "text", label: "SKU", required: true },
      { key: "price", type: "number", required: true },
      { key: "description", type: "textarea" },
    ],
  },
});
```

---

## `dashboardPage`

Generates a dashboard page with:

- A page heading
- A responsive row of `StatCard` components (one per stat)
- An optional `List` component for recent activity

```ts
import { dashboardPage } from "@lastshotlabs/snapshot/ui";
import type { DashboardPageOptions } from "@lastshotlabs/snapshot/ui";
```

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `title` | `string` | yes | Page heading text |
| `stats` | `StatDef[]` | yes | Stat card definitions |
| `recentActivity` | `string` | no | `"GET /api/..."` — populates an activity list below the stats |
| `id` | `string` | no | ID prefix. Defaults to slugified `title` |

### `StatDef`

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Stat card label |
| `endpoint` | `string` | API endpoint to fetch the value from |
| `valueKey` | `string` | Response field name for the metric value |
| `format` | `"number" \| "currency" \| "percent"` | Value format |
| `trend` | `{ key: string, positive?: "up" \| "down" }` | Trend indicator config |
| `icon` | `string` | Lucide icon name |

### Example: SaaS business dashboard

```ts
import { dashboardPage } from "@lastshotlabs/snapshot/ui";

const overview = dashboardPage({
  title: "Overview",
  stats: [
    {
      label: "Monthly Revenue",
      endpoint: "GET /api/metrics/revenue",
      valueKey: "mrr",
      format: "currency",
      icon: "DollarSign",
      trend: { key: "prevMrr", positive: "up" },
    },
    {
      label: "Active Users",
      endpoint: "GET /api/metrics/users",
      valueKey: "active",
      format: "number",
      icon: "Users",
      trend: { key: "prevActive", positive: "up" },
    },
    {
      label: "Churn Rate",
      endpoint: "GET /api/metrics/churn",
      valueKey: "rate",
      format: "percent",
      icon: "TrendingDown",
      trend: { key: "prevRate", positive: "down" },
    },
    {
      label: "Avg. Session",
      endpoint: "GET /api/metrics/sessions",
      valueKey: "avgMinutes",
      icon: "Clock",
    },
  ],
  recentActivity: "GET /api/activity",
});
```

### Example: E-commerce store

```ts
const storeDashboard = dashboardPage({
  title: "Store Overview",
  stats: [
    { label: "Orders Today", endpoint: "GET /api/orders/today", valueKey: "count", format: "number", icon: "ShoppingCart" },
    { label: "Revenue Today", endpoint: "GET /api/orders/today", valueKey: "revenue", format: "currency", icon: "DollarSign" },
    { label: "Pending Orders", endpoint: "GET /api/orders/pending", valueKey: "count", format: "number", icon: "Clock" },
    { label: "Low Stock Items", endpoint: "GET /api/products/low-stock", valueKey: "count", format: "number", icon: "AlertCircle" },
  ],
  recentActivity: "GET /api/orders/recent",
});
```

---

## `settingsPage`

Generates a settings page with:

- A page heading
- A `Tabs` component with one tab per section
- Each tab contains an `AutoForm` for that section's settings

```ts
import { settingsPage } from "@lastshotlabs/snapshot/ui";
import type { SettingsPageOptions } from "@lastshotlabs/snapshot/ui";
```

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `title` | `string` | yes | Page heading text |
| `sections` | `SettingsSectionDef[]` | yes | Tab definitions (at least one) |
| `id` | `string` | no | ID prefix. Defaults to slugified `title` |

### `SettingsSectionDef`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | `string` | yes | Tab label |
| `submitEndpoint` | `string` | yes | API endpoint for form submission |
| `method` | `"POST" \| "PUT" \| "PATCH"` | no | HTTP method. Defaults to `"PATCH"` |
| `dataEndpoint` | `string` | no | Endpoint to load current values (for pre-filling) |
| `fields` | `FormFieldDef[]` | yes | Form fields for this tab |
| `submitLabel` | `string` | no | Submit button text. Defaults to `"Save Changes"` |
| `icon` | `string` | no | Lucide icon for the tab |

### Example: User account settings

```ts
import { settingsPage } from "@lastshotlabs/snapshot/ui";

const accountSettings = settingsPage({
  title: "Account Settings",
  sections: [
    {
      label: "Profile",
      icon: "User",
      submitEndpoint: "PATCH /api/me/profile",
      dataEndpoint: "GET /api/me/profile",
      fields: [
        { key: "name", type: "text", label: "Full Name", required: true },
        { key: "email", type: "email", required: true },
        { key: "bio", type: "textarea", label: "Bio" },
        { key: "website", type: "text", label: "Website" },
      ],
    },
    {
      label: "Notifications",
      icon: "Bell",
      submitEndpoint: "PATCH /api/me/notifications",
      dataEndpoint: "GET /api/me/notifications",
      fields: [
        { key: "emailDigest", type: "toggle", label: "Weekly email digest" },
        { key: "mentionAlerts", type: "toggle", label: "Mention alerts" },
        { key: "marketingEmails", type: "toggle", label: "Marketing emails" },
      ],
    },
    {
      label: "Security",
      icon: "Shield",
      submitEndpoint: "POST /api/me/change-password",
      fields: [
        { key: "currentPassword", type: "password", label: "Current Password", required: true },
        { key: "newPassword", type: "password", label: "New Password", required: true },
        { key: "confirmPassword", type: "password", label: "Confirm Password", required: true },
      ],
      submitLabel: "Change Password",
    },
  ],
});
```

---

## Combining presets in a manifest

Presets return plain `PageConfig` objects. Combine them freely:

```ts
import {
  crudPage,
  dashboardPage,
  settingsPage,
} from "@lastshotlabs/snapshot/ui";

const manifest = {
  theme: { flavor: "violet" },
  nav: [
    { label: "Dashboard", path: "/", icon: "LayoutDashboard" },
    { label: "Users", path: "/users", icon: "Users" },
    { label: "Products", path: "/products", icon: "Package" },
    { label: "Settings", path: "/settings", icon: "Settings" },
  ],
  pages: {
    "/": dashboardPage({
      title: "Overview",
      stats: [
        { label: "Users", endpoint: "GET /api/stats", valueKey: "users", format: "number", icon: "Users" },
        { label: "Revenue", endpoint: "GET /api/stats", valueKey: "revenue", format: "currency", icon: "DollarSign" },
      ],
    }),
    "/users": crudPage({
      title: "Users",
      listEndpoint: "GET /api/users",
      createEndpoint: "POST /api/users",
      deleteEndpoint: "DELETE /api/users/{id}",
      columns: [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", badge: true },
      ],
    }),
    "/products": crudPage({
      title: "Products",
      listEndpoint: "GET /api/products",
      createEndpoint: "POST /api/products",
      columns: [
        { key: "name" },
        { key: "price", format: "currency" },
      ],
    }),
    "/settings": settingsPage({
      title: "Settings",
      sections: [
        {
          label: "General",
          submitEndpoint: "PATCH /api/settings",
          fields: [{ key: "siteName", type: "text", label: "Site Name" }],
        },
      ],
    }),
  },
};
```

---

## Extending a preset

Presets return a `PageConfig` — a plain object with a `content` array. You can spread
and extend it:

```ts
import { crudPage } from "@lastshotlabs/snapshot/ui";

const basePage = crudPage({ title: "Users", listEndpoint: "GET /api/users", columns: [...] });

// Add a chart above the preset's content
const usersPage = {
  ...basePage,
  content: [
    {
      type: "chart",
      data: "GET /api/users/signups-by-month",
      chartType: "bar",
      xKey: "month",
      series: [{ key: "count", label: "New Users" }],
    },
    ...basePage.content,
  ],
};
```

---

## Writing your own preset

A preset is a function that takes options and returns a `PageConfig`. No magic involved:

```ts
import type { PageConfig } from "@lastshotlabs/snapshot/ui";

interface AuditPageOptions {
  title: string;
  endpoint: string;
  entityLabel: string;
}

function auditPage(options: AuditPageOptions): PageConfig {
  return {
    title: options.title,
    content: [
      {
        type: "heading",
        text: options.title,
        level: 1,
      },
      {
        type: "data-table",
        data: options.endpoint,
        columns: [
          { field: "actor", label: "User" },
          { field: "action", label: "Action", format: "badge" },
          { field: "target", label: options.entityLabel },
          { field: "createdAt", label: "When", format: "date", sortable: true },
        ],
        pagination: { type: "offset", pageSize: 50 },
        searchable: true,
      },
    ],
  };
}
```

Use the component schemas from `@lastshotlabs/snapshot/ui` to get full TypeScript
autocomplete on the returned config objects.
