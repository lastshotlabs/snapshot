---
title: Manifest Examples
description: Complete manifest app examples from minimal starter to production SaaS.
draft: false
---

Every example below is a complete manifest that can be passed to `createSnapshot()` and rendered with `ManifestApp`. For field-level details, see the [Manifest Reference](/reference/manifest/).

## Minimal Starter

The smallest possible manifest app -- one route, one component.

```json
{
  "routes": [
    {
      "id": "home",
      "path": "/",
      "title": "Home",
      "content": [
        { "type": "heading", "text": "Welcome Home", "level": 1 }
      ]
    }
  ]
}
```

## Dashboard with Sidebar Navigation

```json
{
  "app": { "name": "Analytics" },
  "theme": {
    "colors": { "primary": "#3b82f6" },
    "fonts": { "sans": "Inter" }
  },
  "navigation": {
    "position": "sidebar",
    "logo": { "text": "Analytics" },
    "items": [
      { "label": "Overview", "path": "/", "icon": "home" },
      { "label": "Reports", "path": "/reports", "icon": "bar-chart" },
      { "label": "Settings", "path": "/settings", "icon": "settings" }
    ]
  },
  "routes": [
    {
      "id": "overview",
      "path": "/",
      "title": "Overview",
      "content": [
        {
          "type": "grid",
          "columns": 3,
          "gap": "md",
          "children": [
            { "type": "stat-card", "label": "Revenue", "value": "$48,200", "icon": "dollar-sign" },
            { "type": "stat-card", "label": "Users", "value": "1,234", "icon": "users" },
            { "type": "stat-card", "label": "Orders", "value": "567", "icon": "shopping-cart" }
          ]
        }
      ]
    }
  ]
}
```

## CRUD Admin with Auth and Overlays

```json
{
  "app": {
    "name": "Admin Panel",
    "auth": { "loginPath": "/login", "homePath": "/" }
  },
  "navigation": {
    "position": "sidebar",
    "logo": { "text": "Admin" },
    "items": [
      { "label": "Users", "path": "/", "icon": "users" }
    ]
  },
  "resources": {
    "users": {
      "endpoint": "/api/users",
      "fields": ["id", "name", "email", "role"]
    }
  },
  "overlays": {
    "createUser": {
      "type": "modal",
      "title": "New User",
      "content": [
        { "type": "auto-form", "resource": "users", "action": "create" }
      ]
    },
    "confirmDelete": {
      "type": "confirm-dialog",
      "title": "Delete User",
      "description": "This action cannot be undone.",
      "confirmLabel": "Delete",
      "confirmVariant": "destructive"
    }
  },
  "routes": [
    {
      "id": "users",
      "path": "/",
      "title": "Users",
      "content": [
        {
          "type": "data-table",
          "resource": "users",
          "columns": [
            { "field": "name", "header": "Name", "sortable": true },
            { "field": "email", "header": "Email" },
            { "field": "role", "header": "Role", "format": "badge" }
          ],
          "actions": {
            "create": { "type": "open-overlay", "overlay": "createUser" }
          }
        }
      ]
    }
  ]
}
```

## Realtime App with WebSocket

```json
{
  "app": { "name": "Live Feed" },
  "realtime": {
    "ws": { "url": "wss://api.example.com/ws" }
  },
  "routes": [
    {
      "id": "feed",
      "path": "/",
      "title": "Live Feed",
      "content": [
        {
          "type": "feed",
          "resource": "activities",
          "relativeTime": true,
          "groupBy": "day"
        }
      ]
    }
  ]
}
```

## Multi-Language SaaS with Policies and Theme

```json
{
  "app": {
    "name": "SaaS Platform",
    "auth": { "loginPath": "/login", "homePath": "/" }
  },
  "theme": {
    "colors": {
      "primary": "#6366f1",
      "accent": "#ec4899",
      "background": "#fafafa"
    },
    "radius": { "default": "0.75rem" },
    "fonts": { "sans": "Plus Jakarta Sans" }
  },
  "i18n": {
    "defaultLocale": "en",
    "locales": ["en", "es", "fr"],
    "messages": {
      "en": { "app.title": "Dashboard", "users.title": "Users" },
      "es": { "app.title": "Panel", "users.title": "Usuarios" },
      "fr": { "app.title": "Tableau de bord", "users.title": "Utilisateurs" }
    }
  },
  "policies": {
    "admin": { "roles": ["admin"] },
    "member": { "roles": ["admin", "member"] }
  },
  "navigation": {
    "position": "sidebar",
    "logo": { "text": "SaaS" },
    "items": [
      { "label": { "t": "app.title" }, "path": "/", "icon": "home" },
      { "label": { "t": "users.title" }, "path": "/users", "icon": "users", "roles": ["admin"] }
    ]
  },
  "routes": [
    {
      "id": "dashboard",
      "path": "/",
      "title": { "t": "app.title" },
      "content": [
        { "type": "heading", "text": { "t": "app.title" }, "level": 1 }
      ]
    }
  ]
}
```

## Code-first equivalent

Every manifest app can also be built with React and standalone components. See the [Quick Start](/start-here/) for a code-first version of the CRUD Admin example above.

## Next steps

- [Manifest Quick Start](/manifest/quick-start/) -- step-by-step guide
- [Presets](/manifest/presets/) -- factory functions for common pages
- [Manifest Reference](/reference/manifest/) -- full schema documentation
