---
title: Full App Examples
description: Complete, copy-paste-ready manifest app examples — from minimal starter to production SaaS dashboards.
draft: false
---

Every example below is a complete `snapshot.manifest.json` that can be dropped into a Snapshot project and run immediately.
For field-level details, see the [Manifest Reference](/reference/manifest/).
For component-specific fields, see the [Component Reference](/reference/components/).

## Table of Contents

- [Minimal Starter](#minimal-starter)
- [Dashboard with Sidebar Navigation](#dashboard-with-sidebar-navigation)
- [CRUD Admin with Auth and Overlays](#crud-admin-with-auth-and-overlays)
- [Realtime App with WebSocket and Workflows](#realtime-app-with-websocket-and-workflows)
- [Multi-Language SaaS with Policies and Theme](#multi-language-saas-with-policies-and-theme)
- [Using Presets](#using-presets)

---

## Minimal Starter

The smallest possible manifest app — one route, one component.

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

Only `routes` is required. Everything else — auth, navigation, theme, resources — is optional.

---

## Dashboard with Sidebar Navigation

A typical dashboard shell with sidebar navigation, theme, multiple routes, stat cards, a data table bound to a resource, and route preloading.

```json
{
  "app": {
    "title": "Budget App",
    "shell": "sidebar",
    "home": "/dashboard",
    "cache": {
      "staleTime": 30000,
      "gcTime": 120000
    }
  },
  "theme": {
    "flavor": "violet"
  },
  "navigation": {
    "mode": "sidebar",
    "items": [
      { "label": "Dashboard", "path": "/dashboard", "icon": "layout-dashboard" },
      { "label": "Users", "path": "/users", "icon": "users" },
      {
        "label": "Settings",
        "icon": "settings",
        "children": [
          { "label": "General", "path": "/settings/general" },
          { "label": "Billing", "path": "/settings/billing" }
        ]
      }
    ]
  },
  "resources": {
    "user.list": {
      "method": "GET",
      "endpoint": "/api/users",
      "cacheMs": 30000,
      "refetchOnMount": true,
      "refetchOnWindowFocus": true,
      "invalidates": ["user.stats"]
    },
    "user.stats": {
      "method": "GET",
      "endpoint": "/api/users/stats",
      "dependsOn": ["user.list"]
    }
  },
  "routes": [
    {
      "id": "dashboard",
      "path": "/dashboard",
      "title": "Dashboard",
      "preload": ["user.stats"],
      "content": [
        { "type": "heading", "text": "Dashboard", "level": 1 },
        {
          "type": "row",
          "gap": "md",
          "children": [
            {
              "type": "stat-card",
              "label": "Total Users",
              "value": { "from": "resources.user.stats.total" },
              "icon": "users",
              "trend": { "key": "change", "positive": "up" }
            },
            {
              "type": "stat-card",
              "label": "Revenue",
              "value": { "from": "resources.user.stats.revenue" },
              "icon": "dollar-sign",
              "format": "currency"
            },
            {
              "type": "stat-card",
              "label": "Active Sessions",
              "value": { "from": "resources.user.stats.sessions" },
              "icon": "activity"
            }
          ]
        }
      ]
    },
    {
      "id": "users",
      "path": "/users",
      "title": "Users",
      "preload": [{ "resource": "user.list", "params": { "page": 1 } }],
      "content": [
        { "type": "heading", "text": "Users", "level": 1 },
        {
          "type": "data-table",
          "data": { "resource": "user.list" },
          "columns": [
            { "key": "name", "label": "Name" },
            { "key": "email", "label": "Email" },
            { "key": "role", "label": "Role" },
            { "key": "createdAt", "label": "Joined", "format": "date" }
          ]
        }
      ]
    },
    {
      "id": "settings-general",
      "path": "/settings/general",
      "title": "General Settings",
      "content": [
        { "type": "heading", "text": "General Settings", "level": 1 }
      ]
    },
    {
      "id": "settings-billing",
      "path": "/settings/billing",
      "title": "Billing",
      "content": [
        { "type": "heading", "text": "Billing", "level": 1 }
      ]
    }
  ]
}
```

Key patterns used:
- **`resources`** with `dependsOn` so `user.stats` refetches when `user.list` changes
- **`preload`** on routes to fetch data before the page renders
- **`{ "from": "resources.user.stats.total" }`** to bind component props to resource data
- **`navigation.items[].children`** for nested sidebar groups

---

## CRUD Admin with Auth and Overlays

A user management admin with login/register screens, route guards, OAuth providers, create/edit overlays, delete confirmation, toast feedback, and workflow-driven actions.

```json
{
  "app": {
    "title": "Admin Panel",
    "shell": "sidebar",
    "home": "/users",
    "loading": { "type": "spinner", "label": "Loading..." },
    "error": { "type": "error-page", "title": "Something went wrong", "showRetry": true }
  },
  "theme": {
    "flavor": "neutral",
    "overrides": {
      "colors": { "primary": "#2563eb" },
      "radius": "md"
    }
  },
  "auth": {
    "screens": ["login", "register", "forgot-password"],
    "branding": {
      "logo": "/logo.svg",
      "title": "Admin Panel",
      "description": "Sign in to manage your team"
    },
    "providers": {
      "google": { "type": "google" },
      "github": { "type": "github", "label": "Continue with GitHub" }
    },
    "providerMode": "auto",
    "passkey": { "enabled": true, "autoPrompt": true },
    "redirects": {
      "authenticated": "/users",
      "afterLogin": "/users",
      "unauthenticated": "/login"
    },
    "session": { "mode": "token" },
    "on": {
      "unauthenticated": "auth-redirect",
      "forbidden": "show-forbidden"
    },
    "screenOptions": {
      "login": {
        "title": "Welcome back",
        "submitLabel": "Sign In",
        "sections": ["providers", "passkey", "form", "links"],
        "links": [{ "label": "Create an account", "screen": "register" }]
      }
    }
  },
  "navigation": {
    "mode": "sidebar",
    "items": [
      { "label": "Users", "path": "/users", "icon": "users" },
      { "label": "Settings", "path": "/settings", "icon": "settings" }
    ],
    "userMenu": {
      "items": [
        { "label": "Logout", "action": { "type": "logout" } }
      ]
    }
  },
  "resources": {
    "user.list": {
      "method": "GET",
      "endpoint": "/api/users",
      "cacheMs": 30000,
      "refetchOnMount": true
    },
    "user.create": {
      "method": "POST",
      "endpoint": "/api/users",
      "optimistic": { "target": "user.list", "merge": "append", "idField": "id" }
    },
    "user.update": {
      "method": "PUT",
      "endpoint": "/api/users/{id}",
      "optimistic": { "target": "user.list", "merge": "patch", "idField": "id" }
    },
    "user.delete": {
      "method": "DELETE",
      "endpoint": "/api/users/{id}",
      "optimistic": { "target": "user.list", "merge": "remove", "idField": "id" }
    }
  },
  "state": {
    "filters": {
      "scope": "route",
      "default": { "status": "all", "search": "" }
    }
  },
  "policies": {
    "is-admin": {
      "equals": [{ "from": "global.user.role" }, "admin"]
    }
  },
  "overlays": {
    "create-user": {
      "type": "modal",
      "title": "Create User",
      "content": [
        {
          "type": "auto-form",
          "action": { "type": "api", "method": "POST", "endpoint": "/api/users" },
          "fields": [
            { "key": "name", "type": "text", "label": "Full Name", "required": true },
            { "key": "email", "type": "email", "label": "Email", "required": true },
            {
              "key": "role",
              "type": "select",
              "label": "Role",
              "options": [
                { "label": "Admin", "value": "admin" },
                { "label": "Editor", "value": "editor" },
                { "label": "Viewer", "value": "viewer" }
              ]
            }
          ],
          "onSuccess": "user-created"
        }
      ]
    },
    "edit-user": {
      "type": "drawer",
      "title": { "from": "overlay.payload.name" },
      "content": [
        {
          "type": "auto-form",
          "data": { "from": "overlay.payload" },
          "action": { "type": "api", "method": "PUT", "endpoint": "/api/users/{id}" },
          "fields": [
            { "key": "name", "type": "text", "label": "Full Name", "required": true },
            {
              "key": "role",
              "type": "select",
              "label": "Role",
              "options": [
                { "label": "Admin", "value": "admin" },
                { "label": "Editor", "value": "editor" },
                { "label": "Viewer", "value": "viewer" }
              ]
            }
          ],
          "onSuccess": "user-updated"
        }
      ]
    },
    "confirm-delete": {
      "type": "confirm-dialog",
      "title": "Delete User?",
      "message": "This action cannot be undone.",
      "confirmLabel": "Delete",
      "cancelLabel": "Cancel"
    }
  },
  "workflows": {
    "auth-redirect": [
      { "type": "navigate", "to": "/login" }
    ],
    "show-forbidden": [
      { "type": "toast", "message": "You don't have permission to do that", "variant": "error" }
    ],
    "user-created": [
      { "type": "toast", "message": "User created" },
      { "type": "close-overlay", "overlay": "create-user" },
      { "type": "invalidate", "resources": ["user.list"] }
    ],
    "user-updated": [
      { "type": "toast", "message": "User updated" },
      { "type": "close-overlay", "overlay": "edit-user" },
      { "type": "invalidate", "resources": ["user.list"] }
    ],
    "delete-user": {
      "type": "try",
      "step": [
        { "type": "api", "method": "DELETE", "endpoint": "/api/users/{id}" },
        { "type": "toast", "message": "User deleted" },
        { "type": "invalidate", "resources": ["user.list"] }
      ],
      "catch": {
        "type": "toast",
        "message": "Failed to delete user",
        "variant": "error"
      }
    }
  },
  "toast": {
    "position": "bottom-right",
    "duration": 4000
  },
  "routes": [
    {
      "id": "users",
      "path": "/users",
      "title": "Users",
      "guard": { "authenticated": true },
      "preload": ["user.list"],
      "content": [
        {
          "type": "row",
          "justify": "space-between",
          "align": "center",
          "children": [
            { "type": "heading", "text": "Users", "level": 1 },
            {
              "type": "button",
              "label": "Create User",
              "icon": "plus",
              "action": { "type": "open-modal", "modal": "create-user" },
              "visible": { "policy": "is-admin" }
            }
          ]
        },
        {
          "type": "data-table",
          "data": { "resource": "user.list" },
          "columns": [
            { "key": "name", "label": "Name" },
            { "key": "email", "label": "Email" },
            { "key": "role", "label": "Role", "badge": true },
            { "key": "createdAt", "label": "Joined", "format": "date" }
          ],
          "rowActions": [
            {
              "label": "Edit",
              "icon": "pencil",
              "action": { "type": "open-drawer", "drawer": "edit-user", "payload": { "from": "row" } }
            },
            {
              "label": "Delete",
              "icon": "trash",
              "variant": "destructive",
              "action": { "type": "run-workflow", "workflow": "delete-user" },
              "visible": { "policy": "is-admin" }
            }
          ]
        }
      ]
    },
    {
      "id": "settings",
      "path": "/settings",
      "title": "Settings",
      "guard": { "authenticated": true },
      "content": [
        { "type": "heading", "text": "Settings", "level": 1 }
      ]
    }
  ],
  "shortcuts": {
    "ctrl+k": {
      "action": { "type": "open-modal", "modal": "create-user" }
    }
  }
}
```

Key patterns used:
- **`auth`** with OAuth providers, passkey, screen customization, and workflow-bound event handlers
- **`overlays`** — modal for create, drawer for edit, confirm dialog for delete
- **`workflows`** — sequences that chain toast + close-overlay + invalidate, and `try/catch` for error handling
- **`optimistic`** updates on mutations so the table updates instantly before the server responds
- **`policies`** — `is-admin` policy controls which users see the Create/Delete buttons
- **`{ "from": "overlay.payload" }`** passes row data into the edit drawer
- **`shortcuts`** — `ctrl+k` opens the create modal

---

## Realtime App with WebSocket and Workflows

A live-updating app that connects to a WebSocket, listens for SSE events, handles connection lifecycle through workflows, and binds realtime state to the UI.

```json
{
  "app": {
    "title": "Live Monitor",
    "shell": "full-width",
    "home": "/"
  },
  "theme": { "flavor": "neutral" },
  "state": {
    "connectionStatus": {
      "scope": "app",
      "default": "disconnected"
    },
    "lastEvent": {
      "scope": "app",
      "default": null
    },
    "eventCount": {
      "scope": "app",
      "default": 0
    }
  },
  "realtime": {
    "ws": {
      "url": { "env": "WS_URL", "default": "wss://api.example.com/ws" },
      "reconnectOnLogin": true,
      "on": {
        "connected": "ws-connected",
        "disconnected": "ws-disconnected",
        "reconnecting": "ws-reconnecting",
        "reconnectFailed": "ws-reconnect-failed"
      }
    },
    "sse": {
      "endpoints": {
        "/__sse/updates": {
          "withCredentials": true,
          "on": {
            "connected": "sse-connected",
            "error": "sse-error"
          }
        }
      }
    },
    "presence": {
      "enabled": true,
      "channel": "monitor",
      "heartbeatInterval": 10000,
      "offlineThreshold": 30000
    }
  },
  "workflows": {
    "ws-connected": [
      {
        "type": "set-value",
        "target": "global.connectionStatus",
        "value": "connected"
      },
      { "type": "toast", "message": "Connected to live feed", "variant": "success" }
    ],
    "ws-disconnected": [
      {
        "type": "set-value",
        "target": "global.connectionStatus",
        "value": "disconnected"
      },
      { "type": "toast", "message": "Disconnected", "variant": "warning" }
    ],
    "ws-reconnecting": [
      {
        "type": "set-value",
        "target": "global.connectionStatus",
        "value": "reconnecting"
      }
    ],
    "ws-reconnect-failed": [
      {
        "type": "set-value",
        "target": "global.connectionStatus",
        "value": "failed"
      },
      { "type": "toast", "message": "Connection lost. Please refresh.", "variant": "error" }
    ],
    "sse-connected": [
      { "type": "toast", "message": "SSE stream active" }
    ],
    "sse-error": {
      "type": "retry",
      "attempts": 3,
      "delayMs": 1000,
      "backoffMultiplier": 2,
      "step": { "type": "toast", "message": "Reconnecting to SSE..." },
      "onFailure": { "type": "toast", "message": "SSE connection failed", "variant": "error" }
    }
  },
  "resources": {
    "events": {
      "method": "GET",
      "endpoint": "/api/events",
      "pollMs": 30000,
      "refetchOnWindowFocus": true
    }
  },
  "routes": [
    {
      "id": "monitor",
      "path": "/",
      "title": "Live Monitor",
      "content": [
        {
          "type": "row",
          "justify": "space-between",
          "align": "center",
          "children": [
            { "type": "heading", "text": "Live Monitor", "level": 1 },
            {
              "type": "badge",
              "text": { "from": "global.connectionStatus" },
              "variant": {
                "expr": "global.connectionStatus === 'connected' ? 'success' : global.connectionStatus === 'reconnecting' ? 'warning' : 'destructive'"
              }
            }
          ]
        },
        {
          "type": "row",
          "gap": "md",
          "children": [
            {
              "type": "stat-card",
              "label": "Status",
              "value": { "from": "global.connectionStatus" },
              "icon": "wifi"
            },
            {
              "type": "stat-card",
              "label": "Events Today",
              "value": { "from": "global.eventCount" },
              "icon": "activity"
            }
          ]
        },
        {
          "type": "data-table",
          "data": { "resource": "events" },
          "columns": [
            { "key": "timestamp", "label": "Time", "format": "datetime" },
            { "key": "type", "label": "Event", "badge": true },
            { "key": "source", "label": "Source" },
            { "key": "message", "label": "Message" }
          ]
        }
      ]
    }
  ],
  "toast": {
    "position": "top-right",
    "duration": 3000
  }
}
```

Key patterns used:
- **`realtime.ws`** with `url` from an env var and lifecycle handlers bound to workflows
- **`realtime.sse`** with a credentialed endpoint and error handling
- **`realtime.presence`** for live user tracking
- **`set-value`** workflow actions to push realtime events into app state
- **`{ "from": "global.connectionStatus" }`** to bind state to UI components
- **`{ "expr": "..." }`** for conditional badge variants based on connection state
- **`retry`** workflow with exponential backoff for SSE reconnection

---

## Multi-Language SaaS with Policies and Theme

A full SaaS app with internationalization, role-based access control, custom theme with dark mode, multiple API clients, keyboard shortcuts, and analytics.

```json
{
  "app": {
    "title": { "t": "app.title" },
    "shell": "sidebar",
    "home": "/dashboard"
  },
  "theme": {
    "flavor": "violet",
    "mode": "dark",
    "overrides": {
      "colors": {
        "primary": "#8b5cf6",
        "secondary": "#64748b"
      },
      "darkColors": {
        "primary": "#a78bfa",
        "background": "#0a0a0a"
      },
      "radius": "lg",
      "spacing": "comfortable",
      "font": {
        "sans": {
          "family": "Inter",
          "source": "google",
          "weights": [400, 500, 600, 700]
        },
        "baseSize": 16,
        "scale": 1.25
      }
    }
  },
  "i18n": {
    "default": "en",
    "locales": ["en", "fr"],
    "detect": ["state", "navigator", "default"],
    "strings": {
      "en": {
        "app": { "title": "Acme Platform" },
        "nav": {
          "dashboard": "Dashboard",
          "users": "Users",
          "reports": "Reports",
          "settings": "Settings",
          "logout": "Logout"
        },
        "actions": {
          "create": "Create",
          "save": "Save",
          "cancel": "Cancel",
          "delete": "Delete",
          "confirm_delete": "Are you sure? This cannot be undone."
        }
      },
      "fr": {
        "app": { "title": "Plateforme Acme" },
        "nav": {
          "dashboard": "Tableau de bord",
          "users": "Utilisateurs",
          "reports": "Rapports",
          "settings": "Paramètres",
          "logout": "Déconnexion"
        },
        "actions": {
          "create": "Créer",
          "save": "Enregistrer",
          "cancel": "Annuler",
          "delete": "Supprimer",
          "confirm_delete": "Êtes-vous sûr ? Cette action est irréversible."
        }
      }
    }
  },
  "auth": {
    "screens": ["login", "register", "forgot-password"],
    "providers": {
      "google": { "type": "google" }
    },
    "passkey": { "enabled": true },
    "redirects": {
      "authenticated": "/dashboard",
      "unauthenticated": "/login"
    }
  },
  "navigation": {
    "mode": "sidebar",
    "items": [
      { "label": { "t": "nav.dashboard" }, "path": "/dashboard", "icon": "layout-dashboard" },
      { "label": { "t": "nav.users" }, "path": "/users", "icon": "users", "visible": { "policy": "can-manage-users" } },
      { "label": { "t": "nav.reports" }, "path": "/reports", "icon": "bar-chart" },
      { "label": { "t": "nav.settings" }, "path": "/settings", "icon": "settings" }
    ],
    "userMenu": {
      "items": [
        { "label": { "t": "nav.logout" }, "action": { "type": "logout" } }
      ]
    },
    "logo": { "text": { "t": "app.title" } }
  },
  "clients": {
    "payments": {
      "apiUrl": { "env": "PAYMENTS_API_URL" },
      "contract": {
        "endpoints": { "me": "/auth/whoami" }
      }
    }
  },
  "resources": {
    "dashboard.stats": {
      "method": "GET",
      "endpoint": "/api/dashboard/stats"
    },
    "user.list": {
      "method": "GET",
      "endpoint": "/api/users",
      "cacheMs": 30000
    },
    "payments.summary": {
      "method": "GET",
      "endpoint": "/api/payments/summary",
      "client": "payments"
    }
  },
  "policies": {
    "is-admin": {
      "equals": [{ "from": "global.user.role" }, "admin"]
    },
    "can-manage-users": {
      "any": [
        { "equals": [{ "from": "global.user.role" }, "admin"] },
        { "equals": [{ "from": "global.user.role" }, "manager"] }
      ]
    },
    "can-view-reports": {
      "not": { "equals": [{ "from": "global.user.role" }, "viewer"] }
    }
  },
  "analytics": {
    "providers": {
      "posthog": {
        "type": "posthog",
        "apiKey": { "env": "POSTHOG_KEY" }
      }
    }
  },
  "observability": {
    "errors": {
      "sink": "/api/errors"
    }
  },
  "shortcuts": {
    "ctrl+k": {
      "action": { "type": "open-modal", "modal": "command-palette" }
    },
    "g then d": {
      "action": { "type": "navigate", "to": "/dashboard" }
    },
    "g then u": {
      "action": { "type": "navigate", "to": "/users" }
    }
  },
  "routes": [
    {
      "id": "dashboard",
      "path": "/dashboard",
      "title": { "t": "nav.dashboard" },
      "guard": { "authenticated": true },
      "preload": ["dashboard.stats"],
      "content": [
        { "type": "heading", "text": { "t": "nav.dashboard" }, "level": 1 },
        {
          "type": "row",
          "gap": "md",
          "children": [
            {
              "type": "stat-card",
              "label": "Users",
              "value": { "from": "resources.dashboard.stats.users" },
              "icon": "users"
            },
            {
              "type": "stat-card",
              "label": "Revenue",
              "value": { "from": "resources.dashboard.stats.revenue" },
              "icon": "dollar-sign",
              "format": "currency"
            }
          ]
        }
      ]
    },
    {
      "id": "users",
      "path": "/users",
      "title": { "t": "nav.users" },
      "guard": { "policy": "can-manage-users", "redirect": "/dashboard" },
      "content": [
        { "type": "heading", "text": { "t": "nav.users" }, "level": 1 },
        {
          "type": "data-table",
          "data": { "resource": "user.list" },
          "columns": [
            { "key": "name", "label": "Name" },
            { "key": "email", "label": "Email" },
            { "key": "role", "label": "Role", "badge": true }
          ]
        }
      ]
    },
    {
      "id": "reports",
      "path": "/reports",
      "title": { "t": "nav.reports" },
      "guard": { "policy": "can-view-reports" },
      "preload": ["payments.summary"],
      "content": [
        { "type": "heading", "text": { "t": "nav.reports" }, "level": 1 },
        {
          "type": "chart",
          "data": { "resource": "payments.summary" },
          "chartType": "bar"
        }
      ]
    },
    {
      "id": "settings",
      "path": "/settings",
      "title": { "t": "nav.settings" },
      "guard": { "authenticated": true },
      "content": [
        { "type": "heading", "text": { "t": "nav.settings" }, "level": 1 }
      ]
    }
  ]
}
```

Key patterns used:
- **`i18n`** with two locales and `{ "t": "nav.dashboard" }` references throughout navigation and routes
- **`policies`** with `equals`, `any`, and `not` operators for role-based access control
- **`guard`** on routes using both `authenticated` and `policy` to restrict access
- **`visible`** on nav items so non-admins don't see the Users link
- **`clients`** for a separate payments API with its own base URL from an env var
- **`resources`** with `client: "payments"` to route a resource through the named client
- **`theme`** with dark mode, custom colors, dark-specific overrides, Google Fonts, and spacing
- **`shortcuts`** with vim-style `g then d` key sequences
- **`analytics`** and **`observability`** for production telemetry

---

## Using Presets

Snapshot includes preset factories that generate full page content from high-level options. Instead of manually composing dozens of components, you call `crudPage()`, `dashboardPage()`, or `settingsPage()` and get a complete page layout.

Presets are TypeScript functions that return `PageConfig` objects you spread into routes:

```typescript
import { crudPage, dashboardPage, settingsPage } from "@lastshotlabs/snapshot/ui";

const manifest = {
  routes: [
    { id: "dashboard", path: "/dashboard", ...dashboardPage({ title: "Overview", stats: [...] }) },
    { id: "users", path: "/users", ...crudPage({ title: "Users", listEndpoint: "GET /api/users", ... }) },
    { id: "settings", path: "/settings", ...settingsPage({ title: "Settings", sections: [...] }) },
  ],
};
```

Below is the full JSON manifest that presets generate — this is what the expanded output looks like. You can write this JSON by hand without using the TypeScript factories.

### Full Preset App (expanded JSON)

```json
{
  "app": {
    "title": "My App",
    "shell": "sidebar",
    "home": "/dashboard"
  },
  "theme": { "flavor": "violet" },
  "navigation": {
    "mode": "sidebar",
    "items": [
      { "label": "Dashboard", "path": "/dashboard", "icon": "layout-dashboard" },
      { "label": "Users", "path": "/users", "icon": "users" },
      { "label": "Settings", "path": "/settings", "icon": "settings" }
    ]
  },
  "auth": { "screens": ["login", "register"] },
  "routes": [
    {
      "id": "dashboard",
      "path": "/dashboard",
      "title": "Overview",
      "content": [
        { "type": "heading", "text": "Overview", "level": 1 },
        {
          "type": "row",
          "gap": "md",
          "children": [
            {
              "type": "stat-card",
              "id": "stat-total-users-0",
              "data": "GET /api/stats/users",
              "field": "count",
              "label": "Total Users",
              "span": 3,
              "format": "number",
              "icon": "users",
              "trend": { "field": "change", "sentiment": "up-is-good", "format": "percent" }
            },
            {
              "type": "stat-card",
              "id": "stat-revenue-1",
              "data": "GET /api/stats/revenue",
              "field": "total",
              "label": "Revenue",
              "span": 3,
              "format": "currency",
              "icon": "dollar-sign"
            },
            {
              "type": "stat-card",
              "id": "stat-orders-2",
              "data": "GET /api/stats/orders",
              "field": "count",
              "label": "Orders",
              "span": 3,
              "format": "number",
              "icon": "shopping-cart"
            },
            {
              "type": "stat-card",
              "id": "stat-conversion-rate-3",
              "data": "GET /api/stats/conversion",
              "field": "rate",
              "label": "Conversion Rate",
              "span": 3,
              "format": "percent",
              "icon": "trending-up"
            }
          ]
        },
        { "type": "heading", "text": "Recent Activity", "level": 2 },
        {
          "type": "list",
          "id": "overview-activity",
          "data": "GET /api/activity",
          "emptyMessage": "No recent activity"
        }
      ]
    },
    {
      "id": "users",
      "path": "/users",
      "title": "Users",
      "content": [
        {
          "type": "row",
          "justify": "between",
          "align": "center",
          "children": [
            { "type": "heading", "text": "Users", "level": 1 },
            {
              "type": "button",
              "label": "New User",
              "icon": "plus",
              "variant": "default",
              "action": { "type": "open-modal", "modal": "users-create-modal" }
            }
          ]
        },
        {
          "type": "data-table",
          "id": "users-table",
          "data": "GET /api/users",
          "columns": [
            { "field": "name", "label": "Name", "sortable": true },
            { "field": "email", "label": "Email", "sortable": true },
            { "field": "role", "label": "Role", "sortable": true, "format": "badge" },
            { "field": "createdAt", "label": "Joined", "sortable": true, "format": "date" }
          ],
          "pagination": { "type": "offset", "pageSize": 20 },
          "searchable": true,
          "emptyMessage": "No users yet",
          "actions": [
            {
              "label": "Edit",
              "icon": "pencil",
              "action": { "type": "open-modal", "modal": "users-edit-drawer" }
            },
            {
              "label": "Delete",
              "icon": "trash",
              "action": [
                {
                  "type": "confirm",
                  "message": "Delete this user?",
                  "confirmLabel": "Delete",
                  "variant": "destructive"
                },
                {
                  "type": "api",
                  "method": "DELETE",
                  "endpoint": "DELETE /api/users/{id}",
                  "onSuccess": [
                    { "type": "refresh", "target": "users-table" },
                    { "type": "toast", "message": "User deleted", "variant": "success" }
                  ],
                  "onError": {
                    "type": "toast",
                    "message": "Delete failed. Please try again.",
                    "variant": "error"
                  }
                }
              ]
            }
          ]
        },
        {
          "type": "modal",
          "id": "users-create-modal",
          "title": "New User",
          "size": "md",
          "content": [
            {
              "type": "form",
              "submit": "POST /api/users",
              "method": "POST",
              "fields": [
                { "name": "name", "type": "text", "label": "Full Name", "required": true },
                { "name": "email", "type": "email", "label": "Email", "required": true },
                {
                  "name": "role",
                  "type": "select",
                  "label": "Role",
                  "options": [
                    { "label": "Admin", "value": "admin" },
                    { "label": "Editor", "value": "editor" },
                    { "label": "Viewer", "value": "viewer" }
                  ]
                }
              ],
              "submitLabel": "Create",
              "resetOnSubmit": true,
              "onSuccess": [
                { "type": "close-modal", "modal": "users-create-modal" },
                { "type": "refresh", "target": "users-table" },
                { "type": "toast", "message": "User created", "variant": "success" }
              ]
            }
          ]
        },
        {
          "type": "drawer",
          "id": "users-edit-drawer",
          "title": "Edit User",
          "size": "md",
          "side": "right",
          "content": [
            {
              "type": "form",
              "submit": "PUT /api/users/{id}",
              "method": "PUT",
              "fields": [
                { "name": "name", "type": "text", "label": "Full Name", "required": true },
                { "name": "role", "type": "select", "label": "Role" }
              ],
              "submitLabel": "Save Changes",
              "onSuccess": [
                { "type": "close-modal", "modal": "users-edit-drawer" },
                { "type": "refresh", "target": "users-table" },
                { "type": "toast", "message": "User updated", "variant": "success" }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "settings",
      "path": "/settings",
      "title": "Account Settings",
      "content": [
        { "type": "heading", "text": "Account Settings", "level": 1 },
        {
          "type": "tabs",
          "id": "account-settings-tabs",
          "defaultTab": 0,
          "variant": "underline",
          "children": [
            {
              "label": "Profile",
              "icon": "user",
              "content": [
                {
                  "type": "form",
                  "id": "profile-form",
                  "submit": "PATCH /api/me/profile",
                  "method": "PATCH",
                  "data": "GET /api/me/profile",
                  "fields": [
                    { "name": "name", "type": "text", "label": "Full Name", "required": true },
                    { "name": "bio", "type": "textarea", "label": "Bio" }
                  ],
                  "submitLabel": "Update Profile",
                  "onSuccess": {
                    "type": "toast",
                    "message": "Profile settings saved",
                    "variant": "success"
                  }
                }
              ]
            },
            {
              "label": "Password",
              "icon": "lock",
              "content": [
                {
                  "type": "form",
                  "id": "password-form",
                  "submit": "POST /api/me/password",
                  "method": "POST",
                  "fields": [
                    { "name": "currentPassword", "type": "password", "label": "Current Password", "required": true },
                    { "name": "newPassword", "type": "password", "label": "New Password", "required": true }
                  ],
                  "submitLabel": "Save Changes",
                  "onSuccess": {
                    "type": "toast",
                    "message": "Password settings saved",
                    "variant": "success"
                  }
                }
              ]
            },
            {
              "label": "Notifications",
              "icon": "bell",
              "content": [
                {
                  "type": "form",
                  "id": "notifications-form",
                  "submit": "PUT /api/me/notifications",
                  "method": "PUT",
                  "fields": [
                    { "name": "emailNotifications", "type": "checkbox", "label": "Email Notifications" },
                    { "name": "pushNotifications", "type": "checkbox", "label": "Push Notifications" }
                  ],
                  "submitLabel": "Save Changes",
                  "onSuccess": {
                    "type": "toast",
                    "message": "Notifications settings saved",
                    "variant": "success"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

Key things to notice in the expanded output:
- **`dashboardPage`** generates stat-cards with auto-generated IDs (`stat-total-users-0`), `span: 3` for 4-column grid, trend sentiment mapping, and an activity list
- **`crudPage`** generates a header row with create button, a data-table with pagination/search/row-actions, a create modal with form + onSuccess chain (close + refresh + toast), an edit drawer with form, and confirm-then-delete with error handling
- **`settingsPage`** generates underline-variant tabs with one tab per section, each containing a form bound to its own submit/data endpoints, with icon tabs and toast on success
- **`toggle` fields** become `checkbox` type in the expanded form
- **Row actions** chain multiple steps: confirm dialog → API call → refresh table → toast

---

## Standalone Component Usage

If you do not need a full manifest app, every component in the examples above is also available as a standalone React component with plain props. See the [Component Library](/build/component-library/) for the full catalog and standalone usage patterns.

## Playground

For live interactive exploration of individual components (not full apps), use the playground:

```bash
bun run playground:dev
```

The playground showcases every component category with real configs and data. Use it to validate component shape, slot patterns, and interaction states.
