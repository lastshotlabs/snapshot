---
title: Presets
description: Factory functions that generate complete page configurations from minimal input.
draft: false
---

Presets are factory functions that generate full page configurations from a few options. Instead of writing dozens of component configs by hand, you describe what you want and the preset builds it.

## Available presets

| Preset | Description |
|--------|-------------|
| `crudPage` | Data table with create/edit/delete overlays |
| `dashboardPage` | KPI stats, chart, and activity table |
| `settingsPage` | Tabbed settings with form sections |
| `authPage` | Login, register, and forgot-password screens |

## CRUD Page

Generates a data table with create modal, edit drawer, and delete confirmation.

```json
{
  "routes": [
    {
      "id": "users",
      "path": "/users",
      "preset": "crud",
      "presetOptions": {
        "resource": "users",
        "title": "Users",
        "columns": [
          { "field": "name", "header": "Name", "sortable": true },
          { "field": "email", "header": "Email" },
          { "field": "role", "header": "Role", "format": "badge" }
        ],
        "createFields": ["name", "email", "role"],
        "editFields": ["name", "email", "role"]
      }
    }
  ]
}
```

This generates:
- A data table bound to the `users` resource
- A "Create" button that opens a modal with an auto-form
- Edit and Delete row actions
- A confirm dialog for deletions

## Dashboard Page

Generates a stats row, main chart, and activity table.

```json
{
  "routes": [
    {
      "id": "dashboard",
      "path": "/",
      "preset": "dashboard",
      "presetOptions": {
        "title": "Dashboard",
        "stats": [
          { "label": "Revenue", "resource": "stats", "field": "revenue", "format": "currency", "icon": "dollar-sign" },
          { "label": "Users", "resource": "stats", "field": "totalUsers", "icon": "users" },
          { "label": "Orders", "resource": "stats", "field": "totalOrders", "icon": "shopping-cart" }
        ],
        "chart": {
          "resource": "analytics",
          "chartType": "area",
          "xKey": "date",
          "series": [{ "key": "revenue", "label": "Revenue" }]
        },
        "table": {
          "resource": "recentOrders",
          "title": "Recent Orders",
          "columns": [
            { "field": "customer", "header": "Customer" },
            { "field": "amount", "header": "Amount", "format": "currency" },
            { "field": "status", "header": "Status", "format": "badge" }
          ]
        }
      }
    }
  ]
}
```

## Settings Page

Generates a tabbed layout with form sections.

```json
{
  "routes": [
    {
      "id": "settings",
      "path": "/settings",
      "preset": "settings",
      "presetOptions": {
        "title": "Settings",
        "tabs": [
          {
            "id": "profile",
            "label": "Profile",
            "fields": [
              { "name": "name", "label": "Full Name", "type": "text" },
              { "name": "email", "label": "Email", "type": "email" },
              { "name": "bio", "label": "Bio", "type": "textarea" }
            ]
          },
          {
            "id": "notifications",
            "label": "Notifications",
            "fields": [
              { "name": "emailNotifs", "label": "Email notifications", "type": "switch" },
              { "name": "pushNotifs", "label": "Push notifications", "type": "switch" }
            ]
          }
        ]
      }
    }
  ]
}
```

## Auth Page

Generates login, register, and forgot-password screens with optional OAuth buttons.

```json
{
  "auth": {
    "preset": "auth",
    "presetOptions": {
      "logo": { "text": "My App", "src": "/logo.svg" },
      "providers": ["google", "github"],
      "showPasskeys": true,
      "showForgotPassword": true,
      "showRegister": true
    }
  }
}
```

## Using presets in code-first apps

Presets are also available as JavaScript functions for programmatic use:

```tsx
import { crudPage, dashboardPage, settingsPage } from "@lastshotlabs/snapshot/ui";

const manifest = {
  routes: [
    dashboardPage({ title: "Dashboard", stats: [...], chart: {...}, table: {...} }),
    crudPage({ resource: "users", title: "Users", columns: [...] }),
    settingsPage({ title: "Settings", tabs: [...] }),
  ],
};
```

## Next steps

- [Manifest Examples](/manifest/examples/) -- complete manifest app examples
- [Manifest Reference](/reference/manifest/) -- full schema documentation
- [Manifest Quick Start](/manifest/quick-start/) -- step-by-step guide
