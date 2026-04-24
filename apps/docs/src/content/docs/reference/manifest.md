---
title: Manifest Schema Reference
description: Complete auto-generated reference for snapshot.manifest.json — all fields, types, defaults, and constraints.
draft: false
---

This reference is auto-generated from the Zod schemas in `src/ui/manifest/schema.ts` and related files.
It documents every field, type, default, and constraint in the manifest format.

For guides on building manifest apps, see the [Manifest Apps guide](/build/manifest-apps).

## Table of Contents

- [Top-Level Structure](#top-level-structure)
- [Dynamic Value Types](#dynamic-value-types)
- [app — Application Config](#app)
- [navigation — Navigation Config](#navigation)
- [routes — Route Tree](#routes)
- [resources — Data Resources](#resources)
- [state — Named State](#state)
- [auth — Authentication](#auth)
- [realtime — WebSocket and SSE](#realtime)
- [workflows — Action Workflows](#workflows)
- [overlays — Modal, Drawer, Confirm](#overlays)
- [toast — Toast Notifications](#toast)
- [analytics — Analytics Providers](#analytics)
- [observability — Audit and Errors](#observability)
- [push — Push Notifications](#push)
- [ssr — Server-Side Rendering](#ssr)
- [clients — Named API Clients](#clients)
- [policies — Access Control](#policies)
- [shortcuts — Keyboard Shortcuts](#shortcuts)
- [components — Custom Components](#components)
- [componentGroups — Reusable Groups](#componentgroups)
- [subApps — Mounted Sub-Applications](#subapps)
- [theme — Design Tokens](#theme)
- [i18n — Internationalization](#i18n)
- [Base Component Fields](#base-component-fields)
- [Common Sub-Schemas](#common-sub-schemas)

---

## Top-Level Structure

The root of `snapshot.manifest.json`. Only `routes` is required.

```json
{
  "app": { "title": "My App", "shell": "sidebar", "home": "/dashboard" },
  "theme": { "flavor": "violet" },
  "navigation": { "mode": "sidebar", "items": [...] },
  "auth": { "screens": ["login", "register"], ... },
  "routes": [
    { "id": "dashboard", "path": "/dashboard", "content": [...] }
  ],
  "resources": { "user.list": { "method": "GET", "endpoint": "/api/users" } },
  "state": { "filters": { "scope": "route", "default": { "status": "all" } } },
  "workflows": { "users.after-save": { "type": "toast", "message": "Saved" } },
  "i18n": { "default": "en", "locales": ["en"] }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `$schema` | `string` | — | No |
| `app` | `object` | — | No |
| `components` | `{ custom: Record<string, { props: Record<string, object> }> }` | — | No |
| `theme` | `ThemeConfig` | — | No |
| `toast` | `{ position: "top-left" \| "top-center" \| "top-right" \| "bottom-left" \| "bottom-center" \| "bottom-r...` | — | No |
| `analytics` | `{ providers: Record<string, object> }` | — | No |
| `observability` | `{ audit: { sink: string }, errors: { sink: string, include: string[] } }` | — | No |
| `push` | `{ vapidPublicKey: string \| EnvRef, serviceWorkerPath: string, applicationServerKey: string \| EnvR...` | — | No |
| `ssr` | `{ rsc: boolean, rscManifestPath: string, middleware: { match: string, workflow: string }[] }` | — | No |
| `state` | `Record<string, object>` | — | No |
| `navigation` | `object` | — | No |
| `auth` | `object` | — | No |
| `realtime` | `{ ws: object, sse: { endpoints: Record<string, object>, reconnectOnLogin: boolean }, presence: ob...` | — | No |
| `clients` | `Record<string, { apiUrl: string \| EnvRef, contract: object, custom: string }>` | — | No |
| `resources` | `Record<string, object>` | — | No |
| `workflows` | `{ actions: { custom: Record<string, { input: Record<string, ...> }> } }` | — | No |
| `overlays` | `Record<string, object>` | — | No |
| `presets` | `Record<string, unknown>` | — | No |
| `policies` | `Record<string, PolicyExpr>` | — | No |
| `i18n` | `I18nConfig` | — | No |
| `subApps` | `Record<string, { mountPath: string, manifest: string \| ..., inherit: object }>` | — | No |
| `shortcuts` | `Record<string, { label: string, action: ... \| ...[], disabled: boolean \| PolicyExpr }>` | — | No |
| `componentGroups` | `Record<string, { description: string, components: { type: string }[] }>` | — | No |
| `routes` | `object[]` | — | **Yes** |

---

## Dynamic Value Types

Many manifest fields accept dynamic values in addition to static strings. These are the common dynamic types:

| Type | Shape | Description |
|------|-------|-------------|
| `FromRef` | `{ from: string, transform?, transformArg? }` | Reference a value from page state, resources, or context. Supports 17 transforms: `uppercase`, `lowercase`, `trim`, `length`, `number`, `boolean`, `string`, `json`, `keys`, `values`, `first`, `last`, `count`, `sum`, `join`, `split`, `default` |
| `EnvRef` | `{ env: string, default? }` | Reference an environment variable |
| `TRef` | `{ t: string, vars? }` | i18n translation key reference |
| `Expr` | `{ expr: string }` | Expression evaluated through the Snapshot AST parser |
| `DataSource` | `string \| FromRef \| { resource, params? }` | Data binding — string endpoint, FromRef, or named resource reference |
| `EndpointTarget` | `string \| { resource, params? }` | API endpoint — string URL or named resource reference |
| `PolicyExpr` | `string \| { all } \| { any } \| { not } \| { equals } \| ...` | Boolean logic expression with `all`, `any`, `not`, `equals`, `not-equals`, `exists`, `truthy`, `falsy`, `in` |

---

## `app`

Application-level configuration.

```json
{
  "app": {
    "title": "Snapshot App",
    "shell": "sidebar",
    "home": "/dashboard",
    "cache": {
      "defaultCacheMs": 30000,
      "defaultStaleMs": 60000
    }
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `apiUrl` | `string \| EnvRef` | — | No |
| `title` | `string \| EnvRef \| TRef` | — | No |
| `shell` | `string` | `"full-width"` | No |
| `headers` | `Record<string, string \| EnvRef \| FromRef>` | — | No |
| `cache` | `{ staleTime: number, gcTime: number, retry: number }` | — | No |
| `home` | `string` | — | No |
| `loading` | `{ type: string } \| string \| EnvRef` | — | No |
| `error` | `{ type: string } \| string \| EnvRef` | — | No |
| `notFound` | `string \| EnvRef` | — | No |
| `offline` | `{ type: string } \| string \| EnvRef` | — | No |
| `breadcrumbs` | `object` | — | No |
| `currencyDivisor` | `number` | `1` | No |
| `a11y` | `{ respectReducedMotion: boolean, skipLinks: { label: string, target: string }[] }` | — | No |

#### `app.cache`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `staleTime` | `number` | `300000` | No |
| `gcTime` | `number` | `600000` | No |
| `retry` | `number` | `1` | No |

#### `app.breadcrumbs`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `auto` | `boolean` | `false` | No |
| `home` | `{ label: string, icon: string, href: string }` | — | No |
| `separator` | `string` | `"/"` | No |
| `labels` | `Record<string, string>` | — | No |

##### `app.breadcrumbs.home`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string` | `"Home"` | No |
| `icon` | `string` | — | No |
| `href` | `string` | `"/"` | No |

#### `app.a11y`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `respectReducedMotion` | `boolean` | `true` | No |
| `skipLinks` | `{ label: string, target: string }[]` | — | No |

---

## `navigation`

Navigation UI configuration. Must define either `items` (legacy mode) or `template` (composable mode).

```json
{
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
    ],
    "userMenu": {
      "items": [
        { "label": { "t": "nav.logout" }, "action": { "type": "navigate", "to": "/logout" } }
      ]
    },
    "logo": { "text": { "t": "nav.brand" } }
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `mode` | `"sidebar" \| "top-nav"` | — | No |
| `items` | `object[]` | — | No |
| `template` | `{ type: string }[]` | — | No |
| `collapsible` | `boolean` | — | No |
| `userMenu` | `boolean \| { showAvatar: boolean, showEmail: boolean, items: object[] }` | — | No |
| `logo` | `{ src: string, text: string \| TRef, path: string }` | — | No |
| `className` | `string` | — | No |
| `style` | `Record<string, string \| number>` | — | No |
| `slots` | `object` | — | No |

#### `navigation.logo`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `src` | `string` | — | No |
| `text` | `string \| TRef` | — | No |
| `path` | `string` | — | No |

#### `navigation.slots`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `root` | `SlotStyle` | — | No |
| `brand` | `SlotStyle` | — | No |
| `brandIcon` | `SlotStyle` | — | No |
| `brandLabel` | `SlotStyle` | — | No |
| `toggle` | `SlotStyle` | — | No |
| `list` | `SlotStyle` | — | No |
| `item` | `SlotStyle` | — | No |
| `itemLabel` | `SlotStyle` | — | No |
| `itemIcon` | `SlotStyle` | — | No |
| `itemBadge` | `SlotStyle` | — | No |
| `dropdown` | `SlotStyle` | — | No |
| `dropdownItem` | `SlotStyle` | — | No |
| `dropdownItemLabel` | `SlotStyle` | — | No |
| `dropdownItemIcon` | `SlotStyle` | — | No |
| `dropdownItemBadge` | `SlotStyle` | — | No |
| `userMenu` | `SlotStyle` | — | No |
| `userMenuTrigger` | `SlotStyle` | — | No |
| `userMenuItem` | `SlotStyle` | — | No |
| `userAvatar` | `SlotStyle` | — | No |

### `navigation.items[]` — Navigation Item

Recursive schema for hierarchical navigation items.

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string \| TRef` | — | **Yes** |
| `path` | `string` | — | **Yes** |
| `icon` | `string` | — | No |
| `visible` | `boolean \| FromRef` | — | No |
| `disabled` | `boolean \| FromRef` | — | No |
| `authenticated` | `boolean` | — | No |
| `roles` | `string[]` | — | No |
| `badge` | `number \| FromRef` | — | No |
| `slots` | `object` | — | No |
| `children` | `object[]` | — | No |

---

## `routes`

Route tree definitions. Each route requires `id` and `path`. Must define either `content` or `preset`, but not both. Children create nested routes.

```json
{
  "routes": [
    {
      "id": "dashboard",
      "path": "/dashboard",
      "layouts": ["sidebar"],
      "title": "Dashboard",
      "guard": "authenticated",
      "content": [
        { "type": "heading", "text": "Dashboard", "level": 1 },
        {
          "type": "row",
          "gap": "md",
          "children": [
            { "type": "stat-card", "label": "Users", "value": { "from": "resources.user.stats.total" } },
            { "type": "stat-card", "label": "Revenue", "value": { "from": "resources.user.stats.revenue" } }
          ]
        },
        { "type": "data-table", "data": { "resource": "user.list" }, "columns": [...] }
      ]
    },
    {
      "id": "user-detail",
      "path": "/users/:id",
      "title": { "from": "route.params.id" },
      "content": [{ "type": "heading", "text": { "from": "resources.user.detail.name" } }],
      "children": [
        { "id": "user-posts", "path": "posts", "content": [...] }
      ]
    },
    {
      "id": "settings",
      "path": "/settings",
      "preset": "settings-page"
    }
  ]
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `id` | `string` | — | **Yes** |
| `path` | `string` | — | **Yes** |
| `title` | `string \| EnvRef \| TRef` | — | No |
| `content` | `{ type: string }[]` | — | No |
| `roles` | `string[]` | — | No |
| `breadcrumb` | `string \| TRef` | — | No |
| `shell` | `false` | — | No |
| `layouts` | `string \| { type: string, props: Record<string, unknown>, slots: object[] }[]` | — | No |
| `slots` | `Record<string, { type: string }[]>` | — | No |
| `preload` | `EndpointTarget[]` | — | No |
| `prefetch` | `EndpointTarget[]` | — | No |
| `refreshOnEnter` | `string[]` | — | No |
| `invalidateOnLeave` | `string[]` | — | No |
| `enter` | `string \| object \| ...[]` | — | No |
| `leave` | `string \| object \| ...[]` | — | No |
| `guard` | `string \| object` | — | No |
| `events` | `Record<string, { type: string } \| ...[]>` | — | No |
| `transition` | `object` | — | No |
| `preset` | `string` | — | No |
| `presetConfig` | `Record<string, unknown>` | — | No |
| `children` | `object[]` | — | No |

#### `routes[].transition`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `enter` | `string` | `"fade-in"` | No |
| `exit` | `string` | `"fade-out"` | No |
| `duration` | `number` | `200` | No |
| `easing` | `string` | `"ease"` | No |

### Route Guard (object form)

Guards can be a string (policy name) or an object:

```json
{
  "guard": {
    "policy": "is-admin",
    "redirect": "/forbidden"
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `name` | `string` | — | No |
| `authenticated` | `boolean` | — | No |
| `roles` | `string[]` | — | No |
| `policy` | `string` | — | No |
| `redirectTo` | `string` | — | No |
| `render` | `{ type: string }` | — | No |

### Route Transition

```json
{
  "transition": {
    "enter": "fade-in",
    "exit": "fade-out",
    "duration": 200
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `enter` | `string` | `"fade-in"` | No |
| `exit` | `string` | `"fade-out"` | No |
| `duration` | `number` | `200` | No |
| `easing` | `string` | `"ease"` | No |

---

## `resources`

Named data resource declarations. Keyed by resource name (`Record<string, ResourceConfig>`).

```json
{
  "resources": {
    "user.list": {
      "method": "GET",
      "endpoint": "/api/users",
      "cacheMs": 30000,
      "pollMs": 60000,
      "refetchOnMount": true,
      "refetchOnWindowFocus": true,
      "invalidates": ["user.stats"]
    },
    "user.stats": {
      "method": "GET",
      "endpoint": "/api/users/stats",
      "dependsOn": ["user.list"]
    },
    "user.create": {
      "method": "POST",
      "endpoint": "/api/users",
      "optimistic": {
        "target": "user.list",
        "merge": "append",
        "idField": "id"
      }
    },
    "user.delete": {
      "method": "DELETE",
      "endpoint": "/api/users/{id}",
      "optimistic": {
        "target": "user.list",
        "merge": "remove",
        "idField": "id"
      }
    },
    "external.payments": {
      "method": "GET",
      "endpoint": "/api/payments",
      "client": "payments",
      "retry": 2,
      "retryDelayMs": 500
    }
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `method` | `"GET" \| "POST" \| "PUT" \| "PATCH" \| "DELETE"` | — | No |
| `endpoint` | `string` | — | **Yes** |
| `client` | `string` | — | No |
| `params` | `Record<string, unknown>` | — | No |
| `cacheMs` | `number` | — | No |
| `pollMs` | `number` | — | No |
| `refetchOnMount` | `boolean` | — | No |
| `refetchOnWindowFocus` | `boolean` | — | No |
| `retry` | `number` | — | No |
| `retryDelayMs` | `number` | — | No |
| `dependsOn` | `string[]` | — | No |
| `invalidates` | `string \| { key: string[] }[]` | — | No |
| `optimistic` | `{ target: string \| { resource: string, params: Record<string, unknown> }, merge: "append" \| "prep...` | — | No |

#### `resources.<name>.optimistic`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `target` | `string \| { resource: string, params: Record<string, unknown> }` | — | **Yes** |
| `merge` | `"append" \| "prepend" \| "replace" \| "patch" \| "remove"` | — | **Yes** |
| `idField` | `string` | — | No |

### Optimistic Update Config

Required when `merge` is `"replace"`, `"patch"`, or `"remove"`: `idField` must be set.

```json
{
  "optimistic": {
    "target": "user.list",
    "merge": "append",
    "idField": "id"
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `target` | `string \| { resource: string, params: Record<string, unknown> }` | — | **Yes** |
| `merge` | `"append" \| "prepend" \| "replace" \| "patch" \| "remove"` | — | **Yes** |
| `idField` | `string` | — | No |

---

## `state`

Named state declarations. Keyed by state name (`Record<string, StateValueConfig>`).
Cannot declare both `compute` and `data` on the same state.

```json
{
  "state": {
    "user": {
      "data": "GET /api/me",
      "default": null
    },
    "filters": {
      "scope": "route",
      "default": { "status": "all", "search": "" }
    },
    "routeCounter": {
      "scope": "route",
      "default": 0
    },
    "realtimeResult": {
      "scope": "app",
      "default": ""
    }
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `scope` | `"app" \| "route"` | — | No |
| `data` | `EndpointTarget` | — | No |
| `default` | `unknown` | — | No |
| `compute` | `string` | — | No |
| `persist` | `"none" \| "localStorage" \| "sessionStorage" \| { storage: "localStorage" \| "sessionStorage", key: s...` | `"none"` | No |

---

## `auth`

Authentication screens, session handling, providers, MFA, and WebAuthn configuration.

```json
{
  "auth": {
    "screens": ["login", "register", "forgot-password"],
    "branding": {
      "logo": "/logo.svg",
      "title": "My App",
      "description": "Welcome back"
    },
    "providers": {
      "google": { "type": "google" },
      "github": {
        "type": "github",
        "label": "Continue with GitHub Enterprise",
        "autoRedirect": true
      }
    },
    "providerMode": "auto",
    "passkey": {
      "enabled": true,
      "autoPrompt": true
    },
    "redirects": {
      "authenticated": "/dashboard",
      "afterLogin": "/reports",
      "unauthenticated": "/login",
      "forbidden": "/forbidden"
    },
    "session": {
      "mode": "token",
      "storage": "memory",
      "key": "auth.token"
    },
    "contract": {
      "endpoints": { "me": "/custom/auth/me" },
      "headers": { "csrf": "x-custom-csrf" },
      "csrfCookieName": "custom_csrf"
    },
    "on": {
      "unauthenticated": "redirect-to-login",
      "forbidden": "show-forbidden",
      "logout": "clear-session"
    },
    "screenOptions": {
      "login": {
        "title": "Welcome back",
        "description": "Use your work account",
        "submitLabel": "Continue",
        "sections": ["providers", "passkey", "form", "links"],
        "labels": {
          "providersHeading": "Use a provider",
          "passkeyButton": "Use a passkey"
        },
        "providers": ["google"],
        "providerMode": "buttons",
        "passkey": { "enabled": true },
        "fields": {
          "email": { "label": "Work email", "placeholder": "me@company.com" },
          "password": { "label": "Secret phrase" }
        },
        "links": [{ "label": "Create account", "screen": "register" }]
      }
    }
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `screens` | `"login" \| "register" \| "forgot-password" \| "reset-password" \| "verify-email" \| "mfa" \| "sso-callb...` | — | No |
| `session` | `{ mode: "cookie" \| "token", storage: "localStorage" \| "sessionStorage" \| "memory", key: string }` | — | No |
| `contract` | `object` | — | No |
| `providers` | `Record<string, object>` | — | No |
| `providerMode` | `"buttons" \| "auto"` | — | No |
| `mfa` | `{ issuer: string, period: number, methods: "totp" \| "email" \| "sms" \| "webauthn"[] }` | — | No |
| `webauthn` | `{ rpId: string, rpName: string, attestation: "none" \| "indirect" \| "direct" }` | — | No |
| `passkey` | `boolean \| { enabled: boolean, autoPrompt: boolean }` | — | No |
| `branding` | `{ logo: string \| EnvRef, title: string \| EnvRef \| TRef, description: string \| EnvRef \| TRef }` | — | No |
| `redirects` | `object` | — | No |
| `on` | `{ unauthenticated: string \| EnvRef, forbidden: string \| EnvRef, logout: string \| EnvRef }` | — | No |
| `screenOptions` | `object` | — | No |

#### `auth.session`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `mode` | `"cookie" \| "token"` | `"cookie"` | No |
| `storage` | `"localStorage" \| "sessionStorage" \| "memory"` | `"sessionStorage"` | No |
| `key` | `string` | `"snapshot.token"` | No |

#### `auth.contract`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `endpoints` | `object` | — | No |
| `headers` | `{ userToken: string \| EnvRef, csrf: string \| EnvRef }` | — | No |
| `csrfCookieName` | `string \| EnvRef` | — | No |
| `userIdField` | `string` | `"userId"` | No |

##### `auth.contract.endpoints`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `me` | `string \| EnvRef` | — | No |
| `login` | `string \| EnvRef` | — | No |
| `logout` | `string \| EnvRef` | — | No |
| `register` | `string \| EnvRef` | — | No |
| `forgotPassword` | `string \| EnvRef` | — | No |
| `refresh` | `string \| EnvRef` | — | No |
| `resetPassword` | `string \| EnvRef` | — | No |
| `verifyEmail` | `string \| EnvRef` | — | No |
| `resendVerification` | `string \| EnvRef` | — | No |
| `setPassword` | `string \| EnvRef` | — | No |
| `deleteAccount` | `string \| EnvRef` | — | No |
| `cancelDeletion` | `string \| EnvRef` | — | No |
| `sessions` | `string \| EnvRef` | — | No |
| `mfaVerify` | `string \| EnvRef` | — | No |
| `mfaSetup` | `string \| EnvRef` | — | No |
| `mfaVerifySetup` | `string \| EnvRef` | — | No |
| `mfaDisable` | `string \| EnvRef` | — | No |
| `mfaRecoveryCodes` | `string \| EnvRef` | — | No |
| `mfaEmailOtpEnable` | `string \| EnvRef` | — | No |
| `mfaEmailOtpVerifySetup` | `string \| EnvRef` | — | No |
| `mfaEmailOtpDisable` | `string \| EnvRef` | — | No |
| `mfaResend` | `string \| EnvRef` | — | No |
| `mfaMethods` | `string \| EnvRef` | — | No |
| `webauthnRegisterOptions` | `string \| EnvRef` | — | No |
| `webauthnRegister` | `string \| EnvRef` | — | No |
| `webauthnCredentials` | `string \| EnvRef` | — | No |
| `webauthnDisable` | `string \| EnvRef` | — | No |
| `passkeyLoginOptions` | `string \| EnvRef` | — | No |
| `passkeyLogin` | `string \| EnvRef` | — | No |
| `oauthExchange` | `string \| EnvRef` | — | No |
| `oauthStart` | `string \| EnvRef` | — | No |
| `oauthCallback` | `string \| EnvRef` | — | No |

##### `auth.contract.headers`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `userToken` | `string \| EnvRef` | — | No |
| `csrf` | `string \| EnvRef` | — | No |

#### `auth.mfa`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `issuer` | `string` | — | No |
| `period` | `number` | `30` | No |
| `methods` | `"totp" \| "email" \| "sms" \| "webauthn"[]` | — | No |

#### `auth.webauthn`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `rpId` | `string` | — | No |
| `rpName` | `string` | — | No |
| `attestation` | `"none" \| "indirect" \| "direct"` | `"none"` | No |

#### `auth.branding`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `logo` | `string \| EnvRef` | — | No |
| `title` | `string \| EnvRef \| TRef` | — | No |
| `description` | `string \| EnvRef \| TRef` | — | No |

#### `auth.redirects`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `authenticated` | `string \| EnvRef` | — | No |
| `afterLogin` | `string \| EnvRef` | — | No |
| `afterRegister` | `string \| EnvRef` | — | No |
| `afterMfa` | `string \| EnvRef` | — | No |
| `unauthenticated` | `string \| EnvRef` | — | No |
| `forbidden` | `string \| EnvRef` | — | No |

#### `auth.on`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `unauthenticated` | `string \| EnvRef` | — | No |
| `forbidden` | `string \| EnvRef` | — | No |
| `logout` | `string \| EnvRef` | — | No |

#### `auth.screenOptions`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `login` | `object` | — | No |
| `register` | `object` | — | No |
| `forgot-password` | `object` | — | No |
| `reset-password` | `object` | — | No |
| `verify-email` | `object` | — | No |
| `mfa` | `object` | — | No |

##### `auth.screenOptions.login`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `title` | `string \| EnvRef \| TRef` | — | No |
| `description` | `string \| EnvRef \| TRef` | — | No |
| `submitLabel` | `string \| EnvRef \| TRef` | — | No |
| `successMessage` | `string \| EnvRef \| TRef` | — | No |
| `sections` | `"form" \| "providers" \| "passkey" \| "links"[]` | — | No |
| `labels` | `object` | — | No |
| `providers` | `string[]` | — | No |
| `providerMode` | `"buttons" \| "auto"` | — | No |
| `passkey` | `boolean \| { enabled: boolean, autoPrompt: boolean }` | — | No |
| `fields` | `object` | — | No |
| `links` | `{ label: ..., path: string, screen: "login" \| "register" \| "forgot-password" \| "reset-password" \|...` | — | No |

###### `auth.screenOptions.login.labels`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `providersHeading` | `... \| TRef` | — | No |
| `passkeyButton` | `... \| TRef` | — | No |
| `method` | `... \| TRef` | — | No |
| `resend` | `... \| TRef` | — | No |

###### `auth.screenOptions.login.fields`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `email` | `{ label: ..., placeholder: ... }` | — | No |
| `password` | `{ label: ..., placeholder: ... }` | — | No |
| `name` | `{ label: ..., placeholder: ... }` | — | No |
| `code` | `{ label: ..., placeholder: ... }` | — | No |
| `method` | `{ label: ..., placeholder: ... }` | — | No |

###### `auth.screenOptions.login.fields.email`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.login.fields.password`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.login.fields.name`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.login.fields.code`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.login.fields.method`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

##### `auth.screenOptions.register`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `title` | `string \| EnvRef \| TRef` | — | No |
| `description` | `string \| EnvRef \| TRef` | — | No |
| `submitLabel` | `string \| EnvRef \| TRef` | — | No |
| `successMessage` | `string \| EnvRef \| TRef` | — | No |
| `sections` | `"form" \| "providers" \| "passkey" \| "links"[]` | — | No |
| `labels` | `object` | — | No |
| `providers` | `string[]` | — | No |
| `providerMode` | `"buttons" \| "auto"` | — | No |
| `passkey` | `boolean \| { enabled: boolean, autoPrompt: boolean }` | — | No |
| `fields` | `object` | — | No |
| `links` | `{ label: ..., path: string, screen: "login" \| "register" \| "forgot-password" \| "reset-password" \|...` | — | No |

###### `auth.screenOptions.register.labels`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `providersHeading` | `... \| TRef` | — | No |
| `passkeyButton` | `... \| TRef` | — | No |
| `method` | `... \| TRef` | — | No |
| `resend` | `... \| TRef` | — | No |

###### `auth.screenOptions.register.fields`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `email` | `{ label: ..., placeholder: ... }` | — | No |
| `password` | `{ label: ..., placeholder: ... }` | — | No |
| `name` | `{ label: ..., placeholder: ... }` | — | No |
| `code` | `{ label: ..., placeholder: ... }` | — | No |
| `method` | `{ label: ..., placeholder: ... }` | — | No |

###### `auth.screenOptions.register.fields.email`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.register.fields.password`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.register.fields.name`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.register.fields.code`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.register.fields.method`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

##### `auth.screenOptions.forgot-password`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `title` | `string \| EnvRef \| TRef` | — | No |
| `description` | `string \| EnvRef \| TRef` | — | No |
| `submitLabel` | `string \| EnvRef \| TRef` | — | No |
| `successMessage` | `string \| EnvRef \| TRef` | — | No |
| `sections` | `"form" \| "providers" \| "passkey" \| "links"[]` | — | No |
| `labels` | `object` | — | No |
| `providers` | `string[]` | — | No |
| `providerMode` | `"buttons" \| "auto"` | — | No |
| `passkey` | `boolean \| { enabled: boolean, autoPrompt: boolean }` | — | No |
| `fields` | `object` | — | No |
| `links` | `{ label: ..., path: string, screen: "login" \| "register" \| "forgot-password" \| "reset-password" \|...` | — | No |

###### `auth.screenOptions.forgot-password.labels`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `providersHeading` | `... \| TRef` | — | No |
| `passkeyButton` | `... \| TRef` | — | No |
| `method` | `... \| TRef` | — | No |
| `resend` | `... \| TRef` | — | No |

###### `auth.screenOptions.forgot-password.fields`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `email` | `{ label: ..., placeholder: ... }` | — | No |
| `password` | `{ label: ..., placeholder: ... }` | — | No |
| `name` | `{ label: ..., placeholder: ... }` | — | No |
| `code` | `{ label: ..., placeholder: ... }` | — | No |
| `method` | `{ label: ..., placeholder: ... }` | — | No |

###### `auth.screenOptions.forgot-password.fields.email`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.forgot-password.fields.password`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.forgot-password.fields.name`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.forgot-password.fields.code`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.forgot-password.fields.method`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

##### `auth.screenOptions.reset-password`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `title` | `string \| EnvRef \| TRef` | — | No |
| `description` | `string \| EnvRef \| TRef` | — | No |
| `submitLabel` | `string \| EnvRef \| TRef` | — | No |
| `successMessage` | `string \| EnvRef \| TRef` | — | No |
| `sections` | `"form" \| "providers" \| "passkey" \| "links"[]` | — | No |
| `labels` | `object` | — | No |
| `providers` | `string[]` | — | No |
| `providerMode` | `"buttons" \| "auto"` | — | No |
| `passkey` | `boolean \| { enabled: boolean, autoPrompt: boolean }` | — | No |
| `fields` | `object` | — | No |
| `links` | `{ label: ..., path: string, screen: "login" \| "register" \| "forgot-password" \| "reset-password" \|...` | — | No |

###### `auth.screenOptions.reset-password.labels`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `providersHeading` | `... \| TRef` | — | No |
| `passkeyButton` | `... \| TRef` | — | No |
| `method` | `... \| TRef` | — | No |
| `resend` | `... \| TRef` | — | No |

###### `auth.screenOptions.reset-password.fields`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `email` | `{ label: ..., placeholder: ... }` | — | No |
| `password` | `{ label: ..., placeholder: ... }` | — | No |
| `name` | `{ label: ..., placeholder: ... }` | — | No |
| `code` | `{ label: ..., placeholder: ... }` | — | No |
| `method` | `{ label: ..., placeholder: ... }` | — | No |

###### `auth.screenOptions.reset-password.fields.email`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.reset-password.fields.password`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.reset-password.fields.name`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.reset-password.fields.code`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.reset-password.fields.method`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

##### `auth.screenOptions.verify-email`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `title` | `string \| EnvRef \| TRef` | — | No |
| `description` | `string \| EnvRef \| TRef` | — | No |
| `submitLabel` | `string \| EnvRef \| TRef` | — | No |
| `successMessage` | `string \| EnvRef \| TRef` | — | No |
| `sections` | `"form" \| "providers" \| "passkey" \| "links"[]` | — | No |
| `labels` | `object` | — | No |
| `providers` | `string[]` | — | No |
| `providerMode` | `"buttons" \| "auto"` | — | No |
| `passkey` | `boolean \| { enabled: boolean, autoPrompt: boolean }` | — | No |
| `fields` | `object` | — | No |
| `links` | `{ label: ..., path: string, screen: "login" \| "register" \| "forgot-password" \| "reset-password" \|...` | — | No |

###### `auth.screenOptions.verify-email.labels`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `providersHeading` | `... \| TRef` | — | No |
| `passkeyButton` | `... \| TRef` | — | No |
| `method` | `... \| TRef` | — | No |
| `resend` | `... \| TRef` | — | No |

###### `auth.screenOptions.verify-email.fields`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `email` | `{ label: ..., placeholder: ... }` | — | No |
| `password` | `{ label: ..., placeholder: ... }` | — | No |
| `name` | `{ label: ..., placeholder: ... }` | — | No |
| `code` | `{ label: ..., placeholder: ... }` | — | No |
| `method` | `{ label: ..., placeholder: ... }` | — | No |

###### `auth.screenOptions.verify-email.fields.email`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.verify-email.fields.password`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.verify-email.fields.name`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.verify-email.fields.code`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.verify-email.fields.method`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

##### `auth.screenOptions.mfa`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `title` | `string \| EnvRef \| TRef` | — | No |
| `description` | `string \| EnvRef \| TRef` | — | No |
| `submitLabel` | `string \| EnvRef \| TRef` | — | No |
| `successMessage` | `string \| EnvRef \| TRef` | — | No |
| `sections` | `"form" \| "providers" \| "passkey" \| "links"[]` | — | No |
| `labels` | `object` | — | No |
| `providers` | `string[]` | — | No |
| `providerMode` | `"buttons" \| "auto"` | — | No |
| `passkey` | `boolean \| { enabled: boolean, autoPrompt: boolean }` | — | No |
| `fields` | `object` | — | No |
| `links` | `{ label: ..., path: string, screen: "login" \| "register" \| "forgot-password" \| "reset-password" \|...` | — | No |

###### `auth.screenOptions.mfa.labels`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `providersHeading` | `... \| TRef` | — | No |
| `passkeyButton` | `... \| TRef` | — | No |
| `method` | `... \| TRef` | — | No |
| `resend` | `... \| TRef` | — | No |

###### `auth.screenOptions.mfa.fields`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `email` | `{ label: ..., placeholder: ... }` | — | No |
| `password` | `{ label: ..., placeholder: ... }` | — | No |
| `name` | `{ label: ..., placeholder: ... }` | — | No |
| `code` | `{ label: ..., placeholder: ... }` | — | No |
| `method` | `{ label: ..., placeholder: ... }` | — | No |

###### `auth.screenOptions.mfa.fields.email`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.mfa.fields.password`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.mfa.fields.name`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.mfa.fields.code`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

###### `auth.screenOptions.mfa.fields.method`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `...` | — | No |
| `placeholder` | `...` | — | No |

### `auth.session` — Session Settings

```json
{
  "session": {
    "mode": "token",
    "storage": "memory",
    "key": "auth.token"
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `mode` | `"cookie" \| "token"` | `"cookie"` | No |
| `storage` | `"localStorage" \| "sessionStorage" \| "memory"` | `"sessionStorage"` | No |
| `key` | `string` | `"snapshot.token"` | No |

### `auth.contract` — Endpoint Overrides

```json
{
  "contract": {
    "endpoints": { "me": "/custom/auth/me" },
    "headers": { "csrf": "x-custom-csrf" },
    "csrfCookieName": "custom_csrf"
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `endpoints` | `object` | — | No |
| `headers` | `{ userToken: string \| EnvRef, csrf: string \| EnvRef }` | — | No |
| `csrfCookieName` | `string \| EnvRef` | — | No |
| `userIdField` | `string` | `"userId"` | No |

### `auth.providers.<name>` — OAuth/SAML Provider

Custom providers (`type: "custom"`) require a `name` field.

```json
{
  "providers": {
    "google": { "type": "google" },
    "github": {
      "type": "github",
      "label": "Continue with GitHub Enterprise",
      "description": "Use your engineering identity",
      "autoRedirect": true
    },
    "internal": {
      "type": "custom",
      "name": "internal-sso",
      "label": "Company SSO"
    }
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `type` | `"google" \| "github" \| "microsoft" \| "apple" \| "facebook" \| "discord" \| "custom"` | — | **Yes** |
| `clientId` | `string \| EnvRef` | — | No |
| `clientSecret` | `string \| EnvRef` | — | No |
| `scopes` | `string[]` | — | No |
| `callbackPath` | `string` | — | No |
| `label` | `string \| EnvRef \| TRef` | — | No |
| `description` | `string \| EnvRef \| TRef` | — | No |
| `autoRedirect` | `boolean` | — | No |
| `name` | `string` | — | No |

---

## `realtime`

WebSocket, Server-Sent Events, and presence configuration.

```json
{
  "realtime": {
    "ws": {
      "url": { "env": "WS_URL", "default": "wss://example.com/ws" },
      "reconnectOnLogin": false,
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
            "error": "sse-error",
            "closed": "sse-closed"
          }
        }
      }
    },
    "presence": {
      "enabled": true,
      "channel": "app-presence",
      "heartbeatInterval": 10000,
      "offlineThreshold": 30000
    }
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `ws` | `object` | — | No |
| `sse` | `{ endpoints: Record<string, object>, reconnectOnLogin: boolean }` | — | No |
| `presence` | `object` | — | No |

#### `realtime.ws`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `url` | `string \| EnvRef` | — | No |
| `autoReconnect` | `boolean` | `true` | No |
| `reconnectOnLogin` | `boolean` | `true` | No |
| `reconnectOnFocus` | `boolean` | `true` | No |
| `maxReconnectAttempts` | `number` | — | No |
| `reconnectBaseDelay` | `number` | — | No |
| `reconnectMaxDelay` | `number` | — | No |
| `auth` | `{ strategy: "query-param" \| "first-message", paramName: string }` | — | No |
| `reconnect` | `object` | — | No |
| `heartbeat` | `{ enabled: boolean, interval: number, message: string }` | — | No |
| `on` | `object` | — | No |
| `events` | `Record<string, string \| ... \| ...[]>` | — | No |
| `eventActions` | `Record<string, ... \| ...[]>` | — | No |

##### `realtime.ws.auth`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `strategy` | `"query-param" \| "first-message"` | — | **Yes** |
| `paramName` | `string` | `"token"` | No |

##### `realtime.ws.reconnect`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `enabled` | `boolean` | `true` | No |
| `maxAttempts` | `number` | `10` | No |
| `baseDelay` | `number` | `1000` | No |
| `maxDelay` | `number` | `30000` | No |

##### `realtime.ws.heartbeat`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `enabled` | `boolean` | `false` | No |
| `interval` | `number` | `30000` | No |
| `message` | `string` | `"ping"` | No |

##### `realtime.ws.on`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `connected` | `string` | — | No |
| `disconnected` | `string` | — | No |
| `reconnecting` | `string` | — | No |
| `reconnectFailed` | `string` | — | No |

#### `realtime.sse`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `endpoints` | `Record<string, object>` | — | **Yes** |
| `reconnectOnLogin` | `boolean` | `true` | No |

#### `realtime.presence`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `enabled` | `boolean` | `false` | No |
| `channel` | `string` | — | **Yes** |
| `heartbeatInterval` | `number` | `10000` | No |
| `offlineThreshold` | `number` | `30000` | No |
| `userData` | `Record<string, unknown>` | — | No |

### `realtime.ws` — WebSocket Config

`events` is merged into `on` so lifecycle hooks and event hooks resolve uniformly.

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `url` | `string \| EnvRef` | — | No |
| `autoReconnect` | `boolean` | `true` | No |
| `reconnectOnLogin` | `boolean` | `true` | No |
| `reconnectOnFocus` | `boolean` | `true` | No |
| `maxReconnectAttempts` | `number` | — | No |
| `reconnectBaseDelay` | `number` | — | No |
| `reconnectMaxDelay` | `number` | — | No |
| `auth` | `{ strategy: "query-param" \| "first-message", paramName: string }` | — | No |
| `reconnect` | `object` | — | No |
| `heartbeat` | `{ enabled: boolean, interval: number, message: string }` | — | No |
| `on` | `object` | — | No |
| `events` | `Record<string, string \| ... \| ...[]>` | — | No |
| `eventActions` | `Record<string, { type: string } \| ...[]>` | — | No |

#### `realtime.ws.auth`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `strategy` | `"query-param" \| "first-message"` | — | **Yes** |
| `paramName` | `string` | `"token"` | No |

#### `realtime.ws.reconnect`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `enabled` | `boolean` | `true` | No |
| `maxAttempts` | `number` | `10` | No |
| `baseDelay` | `number` | `1000` | No |
| `maxDelay` | `number` | `30000` | No |

#### `realtime.ws.heartbeat`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `enabled` | `boolean` | `false` | No |
| `interval` | `number` | `30000` | No |
| `message` | `string` | `"ping"` | No |

#### `realtime.ws.on`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `connected` | `string` | — | No |
| `disconnected` | `string` | — | No |
| `reconnecting` | `string` | — | No |
| `reconnectFailed` | `string` | — | No |

### `realtime.sse.endpoints.<name>` — SSE Endpoint

```json
{
  "/__sse/notifications": {
    "withCredentials": true,
    "on": {
      "connected": "sse-connected",
      "error": "sse-error",
      "closed": "sse-closed"
    }
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `withCredentials` | `boolean` | — | No |
| `on` | `{ connected: string, error: string, closed: string }` | — | No |
| `events` | `Record<string, string \| ... \| ...[]>` | — | No |
| `eventActions` | `Record<string, { type: string } \| ...[]>` | — | No |

### `realtime.presence` — Presence Tracking

```json
{
  "presence": {
    "enabled": true,
    "channel": "app-presence",
    "heartbeatInterval": 10000,
    "offlineThreshold": 30000,
    "userData": { "name": "Alice" }
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `enabled` | `boolean` | `false` | No |
| `channel` | `string` | — | **Yes** |
| `heartbeatInterval` | `number` | `10000` | No |
| `offlineThreshold` | `number` | `30000` | No |
| `userData` | `Record<string, unknown>` | — | No |

---

## `workflows`

Named workflow definitions plus custom action declarations.
Top-level key `actions` declares custom action types. All other keys are workflow definitions.

```json
{
  "workflows": {
    "users.after-save": {
      "type": "toast",
      "message": "Saved"
    },
    "users.delete": {
      "type": "if",
      "condition": {
        "left": { "from": "global.user.role" },
        "operator": "equals",
        "right": "admin"
      },
      "then": { "type": "run-workflow", "workflow": "users.delete-confirmed" }
    },
    "users.delete-confirmed": [
      { "type": "confirm", "message": "Delete this user?" },
      { "type": "api", "method": "DELETE", "endpoint": "/api/users/{id}" },
      { "type": "toast", "message": "User deleted" }
    ],
    "users.sync": {
      "type": "retry",
      "attempts": 3,
      "delayMs": 250,
      "backoffMultiplier": 2,
      "step": {
        "type": "api",
        "method": "POST",
        "endpoint": "/api/users/sync"
      },
      "onFailure": { "type": "toast", "message": "Sync failed" }
    },
    "users.reconcile": {
      "type": "try",
      "step": {
        "type": "api",
        "method": "POST",
        "endpoint": "/api/users/reconcile"
      },
      "catch": { "type": "toast", "message": "Reconcile failed" },
      "finally": { "type": "toast", "message": "Reconcile complete" }
    },
    "users.fetch-current": {
      "type": "capture",
      "action": {
        "type": "api",
        "method": "GET",
        "endpoint": { "resource": "user.list" }
      },
      "as": "current.users"
    },
    "users.decorate": [
      { "type": "assign", "values": { "source": "manifest" } },
      { "type": "toast", "message": "Decorated" }
    ],
    "auth-401": [
      { "type": "navigate", "to": "/login" }
    ]
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `actions` | `{ custom: Record<string, { input: Record<string, object> }> }` | — | No |

#### `workflows.actions`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `custom` | `Record<string, { input: Record<string, object> }>` | — | No |

Workflow nodes support these control-flow types:

| Node Type | Key Fields | Description |
|-----------|------------|-------------|
| `if` | `condition`, `then`, `else?` | Conditional branching |
| `wait` | `duration` (ms) | Delay execution |
| `parallel` | `branches[]` | Execute branches concurrently |
| `retry` | `attempts`, `delayMs?`, `backoffMultiplier?`, `step`, `onFailure?` | Retry with backoff |
| `assign` | `values` (Record) | Set state values |
| `try` | `step`, `catch?`, `finally?` | Error handling |
| `capture` | `action`, `as` (string) | Execute action and capture result |

All nodes support optional `id` and `when` (condition) fields.

---

## `overlays`

Named overlay declarations. Keyed by overlay name (`Record<string, OverlayConfig>`).
Each overlay is one of three types:

```json
{
  "overlays": {
    "help": {
      "type": "modal",
      "title": "Help",
      "content": [{ "type": "heading", "text": "Getting Started" }]
    },
    "user-edit": {
      "type": "drawer",
      "title": { "from": "overlay.payload.title" },
      "content": [
        { "type": "form", "data": { "from": "overlay.payload" }, "fields": [...] }
      ],
      "footer": {
        "actions": [
          {
            "label": "Apply",
            "dismiss": true,
            "action": {
              "type": "set-value",
              "target": "global.overlayResult",
              "value": "{overlay.payload.result}"
            }
          }
        ]
      }
    },
    "delete-confirm": {
      "type": "confirm-dialog",
      "title": "Delete Item?",
      "message": "This action cannot be undone.",
      "confirmLabel": "Delete",
      "cancelLabel": "Cancel"
    }
  }
}
```

### `overlays.<name>` — type: `"modal"`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `id` | `string` | — | No |
| `tokens` | `Record<string, string>` | — | No |
| `visibleWhen` | `string` | — | No |
| `visible` | `boolean \| FromRef \| Expr` | — | No |
| `sticky` | `boolean \| { top: string, zIndex: "base" \| "dropdown" \| "sticky" \| "overlay" \| "modal" \| "popover"...` | — | No |
| `zIndex` | `"base" \| "dropdown" \| "sticky" \| "overlay" \| "modal" \| "popover" \| "toast" \| number` | — | No |
| `animation` | `object` | — | No |
| `glass` | `boolean` | — | No |
| `background` | `string \| object` | — | No |
| `transition` | `"all" \| "colors" \| "opacity" \| "shadow" \| "transform" \| { property: string, duration: "instant" \|...` | — | No |
| `exitAnimation` | `{ preset: "fade" \| "fade-up" \| "fade-down" \| "slide-left" \| "slide-right" \| "scale", duration: "i...` | — | No |
| `span` | `number \| object` | — | No |
| `slots` | `object` | — | No |
| `padding` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `paddingX` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `paddingY` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `margin` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `marginX` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `marginY` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `gap` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `width` | `string \| number \| object` | — | No |
| `minWidth` | `string \| number \| object` | — | No |
| `maxWidth` | `string \| number \| object` | — | No |
| `height` | `string \| number \| object` | — | No |
| `minHeight` | `string \| number \| object` | — | No |
| `maxHeight` | `string \| number \| object` | — | No |
| `bg` | `string \| string \| object` | — | No |
| `color` | `string` | — | No |
| `borderRadius` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "full" \| string \| number` | — | No |
| `border` | `string` | — | No |
| `shadow` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| string` | — | No |
| `opacity` | `number` | — | No |
| `overflow` | `"auto" \| "hidden" \| "scroll" \| "visible"` | — | No |
| `position` | `"relative" \| "absolute" \| "fixed" \| "sticky"` | — | No |
| `inset` | `string \| number` | — | No |
| `display` | `"flex" \| "grid" \| "block" \| "inline" \| "inline-flex" \| "inline-grid" \| "none" \| object` | — | No |
| `flexDirection` | `"row" \| "column" \| "row-reverse" \| "column-reverse" \| object` | — | No |
| `alignItems` | `"start" \| "center" \| "end" \| "stretch" \| "baseline"` | — | No |
| `justifyContent` | `"start" \| "center" \| "end" \| "between" \| "around" \| "evenly"` | — | No |
| `flexWrap` | `"wrap" \| "nowrap" \| "wrap-reverse"` | — | No |
| `flex` | `string \| number` | — | No |
| `textAlign` | `"left" \| "center" \| "right" \| "justify"` | — | No |
| `fontSize` | `"xs" \| "sm" \| "base" \| "lg" \| "xl" \| "2xl" \| "3xl" \| "4xl" \| string \| number \| object` | — | No |
| `fontWeight` | `"light" \| "normal" \| "medium" \| "semibold" \| "bold" \| number \| string` | — | No |
| `lineHeight` | `"none" \| "tight" \| "snug" \| "normal" \| "relaxed" \| "loose" \| string \| number` | — | No |
| `letterSpacing` | `"tight" \| "normal" \| "wide" \| string \| number` | — | No |
| `hover` | `object` | — | No |
| `focus` | `object` | — | No |
| `active` | `object` | — | No |
| `className` | `string` | — | No |
| `style` | `Record<string, string \| number>` | — | No |
| `cursor` | `string` | — | No |
| `backgroundColor` | `string` | — | No |
| `gridTemplateColumns` | `string` | — | No |
| `gridTemplateRows` | `string` | — | No |
| `gridColumn` | `string` | — | No |
| `gridRow` | `string` | — | No |
| `type` | `"modal"` | — | **Yes** |
| `title` | `string \| FromRef` | — | No |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"md"` | No |
| `trigger` | `FromRef` | — | No |
| `content` | `Record<string, unknown>[]` | — | **Yes** |
| `onOpen` | `string \| ... \| object \| ...[]` | — | No |
| `onClose` | `string \| ... \| object \| ...[]` | — | No |
| `urlParam` | `string` | — | No |
| `trapFocus` | `boolean` | `true` | No |
| `initialFocus` | `string` | — | No |
| `returnFocus` | `boolean` | `true` | No |
| `footer` | `{ actions: object[], align: "left" \| "center" \| "right" }` | — | No |

### `overlays.<name>` — type: `"drawer"`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `id` | `string` | — | No |
| `tokens` | `Record<string, string>` | — | No |
| `visibleWhen` | `string` | — | No |
| `visible` | `boolean \| FromRef \| Expr` | — | No |
| `sticky` | `boolean \| { top: string, zIndex: "base" \| "dropdown" \| "sticky" \| "overlay" \| "modal" \| "popover"...` | — | No |
| `zIndex` | `"base" \| "dropdown" \| "sticky" \| "overlay" \| "modal" \| "popover" \| "toast" \| number` | — | No |
| `animation` | `object` | — | No |
| `glass` | `boolean` | — | No |
| `background` | `string \| object` | — | No |
| `transition` | `"all" \| "colors" \| "opacity" \| "shadow" \| "transform" \| { property: string, duration: "instant" \|...` | — | No |
| `exitAnimation` | `{ preset: "fade" \| "fade-up" \| "fade-down" \| "slide-left" \| "slide-right" \| "scale", duration: "i...` | — | No |
| `span` | `number \| object` | — | No |
| `slots` | `object` | — | No |
| `padding` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `paddingX` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `paddingY` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `margin` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `marginX` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `marginY` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `gap` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `width` | `string \| number \| object` | — | No |
| `minWidth` | `string \| number \| object` | — | No |
| `maxWidth` | `string \| number \| object` | — | No |
| `height` | `string \| number \| object` | — | No |
| `minHeight` | `string \| number \| object` | — | No |
| `maxHeight` | `string \| number \| object` | — | No |
| `bg` | `string \| string \| object` | — | No |
| `color` | `string` | — | No |
| `borderRadius` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "full" \| string \| number` | — | No |
| `border` | `string` | — | No |
| `shadow` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| string` | — | No |
| `opacity` | `number` | — | No |
| `overflow` | `"auto" \| "hidden" \| "scroll" \| "visible"` | — | No |
| `position` | `"relative" \| "absolute" \| "fixed" \| "sticky"` | — | No |
| `inset` | `string \| number` | — | No |
| `display` | `"flex" \| "grid" \| "block" \| "inline" \| "inline-flex" \| "inline-grid" \| "none" \| object` | — | No |
| `flexDirection` | `"row" \| "column" \| "row-reverse" \| "column-reverse" \| object` | — | No |
| `alignItems` | `"start" \| "center" \| "end" \| "stretch" \| "baseline"` | — | No |
| `justifyContent` | `"start" \| "center" \| "end" \| "between" \| "around" \| "evenly"` | — | No |
| `flexWrap` | `"wrap" \| "nowrap" \| "wrap-reverse"` | — | No |
| `flex` | `string \| number` | — | No |
| `textAlign` | `"left" \| "center" \| "right" \| "justify"` | — | No |
| `fontSize` | `"xs" \| "sm" \| "base" \| "lg" \| "xl" \| "2xl" \| "3xl" \| "4xl" \| string \| number \| object` | — | No |
| `fontWeight` | `"light" \| "normal" \| "medium" \| "semibold" \| "bold" \| number \| string` | — | No |
| `lineHeight` | `"none" \| "tight" \| "snug" \| "normal" \| "relaxed" \| "loose" \| string \| number` | — | No |
| `letterSpacing` | `"tight" \| "normal" \| "wide" \| string \| number` | — | No |
| `hover` | `object` | — | No |
| `focus` | `object` | — | No |
| `active` | `object` | — | No |
| `className` | `string` | — | No |
| `style` | `Record<string, string \| number>` | — | No |
| `cursor` | `string` | — | No |
| `backgroundColor` | `string` | — | No |
| `gridTemplateColumns` | `string` | — | No |
| `gridTemplateRows` | `string` | — | No |
| `gridColumn` | `string` | — | No |
| `gridRow` | `string` | — | No |
| `type` | `"drawer"` | — | **Yes** |
| `title` | `string \| FromRef` | — | No |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"md"` | No |
| `side` | `"left" \| "right"` | `"right"` | No |
| `trigger` | `FromRef` | — | No |
| `content` | `Record<string, unknown>[]` | — | **Yes** |
| `onOpen` | `string \| ... \| object \| ...[]` | — | No |
| `onClose` | `string \| ... \| object \| ...[]` | — | No |
| `urlParam` | `string` | — | No |
| `trapFocus` | `boolean` | `true` | No |
| `initialFocus` | `string` | — | No |
| `returnFocus` | `boolean` | `true` | No |
| `footer` | `{ actions: object[], align: "left" \| "center" \| "right" }` | — | No |

### `overlays.<name>` — type: `"confirm-dialog"`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `id` | `string` | — | No |
| `tokens` | `Record<string, string>` | — | No |
| `visibleWhen` | `string` | — | No |
| `visible` | `boolean \| FromRef \| Expr` | — | No |
| `sticky` | `boolean \| { top: string, zIndex: "base" \| "dropdown" \| "sticky" \| "overlay" \| "modal" \| "popover"...` | — | No |
| `zIndex` | `"base" \| "dropdown" \| "sticky" \| "overlay" \| "modal" \| "popover" \| "toast" \| number` | — | No |
| `animation` | `object` | — | No |
| `glass` | `boolean` | — | No |
| `background` | `string \| object` | — | No |
| `transition` | `"all" \| "colors" \| "opacity" \| "shadow" \| "transform" \| { property: string, duration: "instant" \|...` | — | No |
| `exitAnimation` | `{ preset: "fade" \| "fade-up" \| "fade-down" \| "slide-left" \| "slide-right" \| "scale", duration: "i...` | — | No |
| `span` | `number \| object` | — | No |
| `slots` | `object` | — | No |
| `padding` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `paddingX` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `paddingY` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `margin` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `marginX` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `marginY` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `gap` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `width` | `string \| number \| object` | — | No |
| `minWidth` | `string \| number \| object` | — | No |
| `maxWidth` | `string \| number \| object` | — | No |
| `height` | `string \| number \| object` | — | No |
| `minHeight` | `string \| number \| object` | — | No |
| `maxHeight` | `string \| number \| object` | — | No |
| `bg` | `string \| string \| object` | — | No |
| `color` | `string` | — | No |
| `borderRadius` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "full" \| string \| number` | — | No |
| `border` | `string` | — | No |
| `shadow` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| string` | — | No |
| `opacity` | `number` | — | No |
| `overflow` | `"auto" \| "hidden" \| "scroll" \| "visible"` | — | No |
| `position` | `"relative" \| "absolute" \| "fixed" \| "sticky"` | — | No |
| `inset` | `string \| number` | — | No |
| `display` | `"flex" \| "grid" \| "block" \| "inline" \| "inline-flex" \| "inline-grid" \| "none" \| object` | — | No |
| `flexDirection` | `"row" \| "column" \| "row-reverse" \| "column-reverse" \| object` | — | No |
| `alignItems` | `"start" \| "center" \| "end" \| "stretch" \| "baseline"` | — | No |
| `justifyContent` | `"start" \| "center" \| "end" \| "between" \| "around" \| "evenly"` | — | No |
| `flexWrap` | `"wrap" \| "nowrap" \| "wrap-reverse"` | — | No |
| `flex` | `string \| number` | — | No |
| `textAlign` | `"left" \| "center" \| "right" \| "justify"` | — | No |
| `fontSize` | `"xs" \| "sm" \| "base" \| "lg" \| "xl" \| "2xl" \| "3xl" \| "4xl" \| string \| number \| object` | — | No |
| `fontWeight` | `"light" \| "normal" \| "medium" \| "semibold" \| "bold" \| number \| string` | — | No |
| `lineHeight` | `"none" \| "tight" \| "snug" \| "normal" \| "relaxed" \| "loose" \| string \| number` | — | No |
| `letterSpacing` | `"tight" \| "normal" \| "wide" \| string \| number` | — | No |
| `hover` | `object` | — | No |
| `focus` | `object` | — | No |
| `active` | `object` | — | No |
| `className` | `string` | — | No |
| `style` | `Record<string, string \| number>` | — | No |
| `cursor` | `string` | — | No |
| `backgroundColor` | `string` | — | No |
| `gridTemplateColumns` | `string` | — | No |
| `gridTemplateRows` | `string` | — | No |
| `gridColumn` | `string` | — | No |
| `gridRow` | `string` | — | No |
| `type` | `"confirm-dialog"` | — | **Yes** |
| `title` | `string \| FromRef` | — | No |
| `description` | `string \| FromRef` | — | No |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | — | No |
| `confirmLabel` | `string \| FromRef` | `"Confirm"` | No |
| `cancelLabel` | `string \| FromRef` | `"Cancel"` | No |
| `confirmVariant` | `"default" \| "secondary" \| "destructive" \| "ghost"` | `"default"` | No |
| `cancelVariant` | `"default" \| "secondary" \| "destructive" \| "ghost"` | `"secondary"` | No |
| `confirmAction` | `object \| ... \| object \| ...[]` | — | No |
| `cancelAction` | `object \| ... \| object \| ...[]` | — | No |
| `dismissOnConfirm` | `boolean` | `true` | No |
| `dismissOnCancel` | `boolean` | `true` | No |
| `onOpen` | `string \| ... \| object \| ...[]` | — | No |
| `onClose` | `string \| ... \| object \| ...[]` | — | No |
| `urlParam` | `string` | — | No |
| `trapFocus` | `boolean` | `true` | No |
| `initialFocus` | `string` | — | No |
| `returnFocus` | `boolean` | `true` | No |

---

## `toast`

Toast notification defaults used by the `toast` action runtime.

```json
{
  "toast": {
    "position": "bottom-right",
    "duration": 4000,
    "variants": {
      "success": {
        "icon": "check-circle",
        "color": "#16a34a",
        "duration": 3000
      },
      "error": {
        "icon": "alert-circle",
        "color": "#dc2626",
        "duration": 6000
      }
    }
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `position` | `"top-left" \| "top-center" \| "top-right" \| "bottom-left" \| "bottom-center" \| "bottom-right"` | `"bottom-right"` | No |
| `duration` | `number` | `4000` | No |
| `variants` | `Record<string, { icon: string, color: string, duration: number }>` | — | No |

---

## `analytics`

Analytics provider configuration.

```json
{
  "analytics": {
    "providers": {
      "posthog": {
        "type": "posthog",
        "apiKey": { "env": "POSTHOG_KEY" }
      },
      "ga4": {
        "type": "ga4",
        "apiKey": "G-XXXXXXX"
      },
      "internal": {
        "type": "custom",
        "name": "internal-tracker",
        "config": { "endpoint": "/api/track" }
      }
    }
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `providers` | `Record<string, object>` | — | **Yes** |

### `analytics.providers.<name>` — Provider Declaration

Custom providers (`type: "custom"`) require a `name` field.

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `type` | `"ga4" \| "posthog" \| "plausible" \| "custom"` | — | **Yes** |
| `name` | `string` | — | No |
| `apiKey` | `string \| EnvRef` | — | No |
| `config` | `Record<string, unknown>` | — | No |

---

## `observability`

Audit and error logging configuration.

```json
{
  "observability": {
    "audit": {
      "sink": "/api/audit"
    },
    "errors": {
      "sink": "/api/errors",
      "include": ["TypeError", "NetworkError"]
    }
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `audit` | `{ sink: string }` | — | No |
| `errors` | `{ sink: string, include: string[] }` | — | No |

#### `observability.audit`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `sink` | `string` | — | **Yes** |

#### `observability.errors`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `sink` | `string` | — | **Yes** |
| `include` | `string[]` | — | No |

---

## `push`

Push notification runtime configuration.

```json
{
  "push": {
    "vapidPublicKey": { "env": "VAPID_PUBLIC_KEY" },
    "serviceWorkerPath": "/sw.js"
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `vapidPublicKey` | `string \| EnvRef` | — | **Yes** |
| `serviceWorkerPath` | `string` | `"/sw.js"` | No |
| `applicationServerKey` | `string \| EnvRef` | — | No |

---

## `ssr`

Server-side rendering configuration. When `rsc` is enabled, the manifest renderer loads `rsc-manifest.json` at startup.

```json
{
  "ssr": {
    "rsc": true,
    "rscManifestPath": "./dist/server/rsc-manifest.json",
    "middleware": [
      { "match": "/admin/*", "workflow": "auth-check" },
      { "workflow": "global-headers" }
    ]
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `rsc` | `boolean` | `false` | No |
| `rscManifestPath` | `string` | `"./dist/server/rsc-manifest.json"` | No |
| `middleware` | `{ match: string, workflow: string }[]` | — | No |

---

## `clients`

Named API client registry (`Record<string, ClientConfig>`). Used by resources via the `client` field.

```json
{
  "clients": {
    "payments": {
      "apiUrl": { "env": "PAYMENTS_API_URL" },
      "contract": {
        "endpoints": { "me": "/auth/whoami" }
      }
    },
    "legacy": {
      "apiUrl": "https://legacy.example.com",
      "custom": "LegacyApiClient"
    }
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `apiUrl` | `string \| EnvRef` | — | **Yes** |
| `contract` | `object` | — | No |
| `custom` | `string` | — | No |

---

## `policies`

Named access control policies (`Record<string, PolicyExpr>`).

```json
{
  "policies": {
    "is-admin": "admin",
    "is-admin-or-owner": {
      "any": [
        { "equals": [{ "from": "global.user.role" }, "admin"] },
        { "equals": [{ "from": "global.user.id" }, { "from": "global.resource.ownerId" }] }
      ]
    },
    "has-email": { "exists": { "from": "global.user.email" } },
    "not-banned": { "not": "is-banned" },
    "role-in-set": { "in": [{ "from": "global.user.role" }, ["admin", "editor"]] }
  }
}
```

Policy expressions are recursive boolean logic trees:

| Operator | Shape | Description |
|----------|-------|-------------|
| `all` | `{ all: PolicyExpr[] }` | All conditions must be true (AND) |
| `any` | `{ any: PolicyExpr[] }` | At least one must be true (OR) |
| `not` | `{ not: PolicyExpr }` | Negate a condition |
| `equals` | `{ equals: [a, b] }` | Value equality |
| `not-equals` | `{ "not-equals": [a, b] }` | Value inequality |
| `exists` | `{ exists: value }` | Value is defined |
| `truthy` | `{ truthy: value }` | Value is truthy |
| `falsy` | `{ falsy: value }` | Value is falsy |
| `in` | `{ in: [value, array] }` | Value is in array |

Operands can be: `string`, `number`, `boolean`, `null`, `FromRef`, or `EnvRef`.

---

## `shortcuts`

Keyboard shortcut declarations (`Record<string, ShortcutConfig>`). Keys are keyboard shortcut strings.

```json
{
  "shortcuts": {
    "ctrl+k": {
      "action": { "type": "open-modal", "modal": "command-palette" }
    },
    "g then d": {
      "action": { "type": "navigate", "to": "/dashboard" }
    },
    "ctrl+shift+p": {
      "label": "Open palette",
      "action": [
        { "type": "open-modal", "modal": "command-palette" },
        { "type": "track", "event": "palette.opened" }
      ]
    }
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string` | — | No |
| `action` | `{ type: string } \| { type: string }[]` | — | **Yes** |
| `disabled` | `boolean \| PolicyExpr` | — | No |

---

## `components`

Custom component declarations for manifest use.

```json
{
  "components": {
    "custom": {
      "order-timeline": {
        "props": {
          "orderId": { "type": "string", "required": true },
          "highlight": { "type": "boolean", "default": false }
        }
      }
    }
  }
}
```

Use custom components in route content like any built-in component:

```json
{
  "content": [
    { "type": "order-timeline", "orderId": "abc-123", "highlight": true }
  ]
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `custom` | `Record<string, { props: Record<string, { type: "string" \| "number" \| "boolean", required: boolean...` | — | No |

Custom component props accept types: `"string"`, `"number"`, `"boolean"`.
Each prop can have `required` (boolean) and `default` fields.

---

## `componentGroups`

Reusable component groups (`Record<string, { description?, components[] }>`). Each group bundles a set of components that can be referenced together.

```json
{
  "componentGroups": {
    "hero": {
      "description": "Hero banner with CTA",
      "components": [
        { "type": "markdown", "id": "title", "text": "# Welcome" },
        { "type": "button", "id": "cta", "label": "Get Started", "action": { "type": "navigate", "to": "/signup" } }
      ]
    }
  }
}
```

Reference a group in route content with overrides:

```json
{
  "content": [
    {
      "type": "component-group",
      "group": "hero",
      "overrides": {
        "title": { "text": "# Custom Welcome" }
      }
    }
  ]
}
```

---

## `subApps`

Mounted sub-application configurations (`Record<string, SubAppConfig>`).

```json
{
  "subApps": {
    "reporting": {
      "mountPath": "/reports",
      "manifest": "./reports-manifest.json",
      "inherit": {
        "theme": true,
        "i18n": true,
        "policies": true,
        "state": false
      }
    }
  }
}
```

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `mountPath` | `string` | — | **Yes** |
| `manifest` | `string \| object` | — | **Yes** |
| `inherit` | `object` | — | No |

### `subApps.<name>.inherit` — Inheritance Flags

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `theme` | `boolean` | `true` | No |
| `i18n` | `boolean` | `true` | No |
| `policies` | `boolean` | `true` | No |
| `state` | `boolean` | `false` | No |

---

## `theme`

Design token configuration. See the [Styling and Slots guide](/build/styling-and-slots) for details.

`theme` accepts a `ThemeConfig` object. The theme schema is defined in `src/ui/tokens/schema.ts`.

```json
{
  "theme": {
    "flavor": "violet",
    "mode": "dark",
    "overrides": {
      "colors": {
        "primary": "#8b5cf6",
        "secondary": "#64748b",
        "background": "#0a0a0a"
      },
      "darkColors": {
        "primary": "#3b82f6",
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
        "display": {
          "family": "Cal Sans",
          "source": "url",
          "url": "/fonts/cal-sans.woff2"
        },
        "baseSize": 16,
        "scale": 1.25
      },
      "components": {
        "card": { "shadow": "md" }
      }
    }
  }
}
```

---

## `i18n`

Internationalization configuration. `i18n` accepts an `I18nConfig` object defined in `src/ui/i18n/schema.ts`.

```json
{
  "i18n": {
    "default": "en",
    "locales": ["en", "fr", "de"],
    "detect": ["state", "navigator", "default"],
    "strings": {
      "en": {
        "greeting": "Hello",
        "nav": { "home": "Home", "logout": "Logout", "brand": "My App" }
      },
      "fr": {
        "greeting": "Bonjour",
        "nav": { "home": "Accueil", "logout": "Déconnexion", "brand": "Mon App" }
      }
    }
  }
}
```

Reference translations with t-refs: `{ "t": "nav.home" }` or `{ "t": "greeting", "vars": { "name": "Alice" } }`.

---

## Base Component Fields

All manifest-driven components inherit these fields (60 fields). Component-specific fields are documented in the [Component Reference](/reference/components).

<details>
<summary>Show all 60 base component fields</summary>

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `type` | `string` | — | **Yes** |
| `id` | `string` | — | No |
| `tokens` | `Record<string, string>` | — | No |
| `visibleWhen` | `string` | — | No |
| `visible` | `boolean \| boolean \| object \| FromRef \| PolicyRef` | — | No |
| `className` | `string` | — | No |
| `style` | `Record<string, string \| number>` | — | No |
| `span` | `number \| object` | — | No |
| `sticky` | `boolean \| { top: string, zIndex: "base" \| "dropdown" \| "sticky" \| "overlay" \| "modal" \| "popover"...` | — | No |
| `zIndex` | `"base" \| "dropdown" \| "sticky" \| "overlay" \| "modal" \| "popover" \| "toast" \| number` | — | No |
| `animation` | `object` | — | No |
| `glass` | `boolean` | — | No |
| `background` | `string \| object` | — | No |
| `transition` | `"all" \| "colors" \| "opacity" \| "shadow" \| "transform" \| { property: string, duration: "instant" \|...` | — | No |
| `ariaLabel` | `string` | — | No |
| `ariaDescribedBy` | `string` | — | No |
| `role` | `string` | — | No |
| `ariaLive` | `"off" \| "polite" \| "assertive"` | — | No |
| `padding` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| object` | — | No |
| `paddingX` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| object` | — | No |
| `paddingY` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| object` | — | No |
| `margin` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| object` | — | No |
| `marginX` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| object` | — | No |
| `marginY` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| object` | — | No |
| `gap` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| object` | — | No |
| `width` | `string \| object` | — | No |
| `minWidth` | `string \| object` | — | No |
| `maxWidth` | `string \| object` | — | No |
| `height` | `string \| object` | — | No |
| `minHeight` | `string \| object` | — | No |
| `maxHeight` | `string \| object` | — | No |
| `bg` | `string \| string \| object` | — | No |
| `color` | `string` | — | No |
| `borderRadius` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "full" \| string` | — | No |
| `border` | `string` | — | No |
| `shadow` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| string` | — | No |
| `opacity` | `number` | — | No |
| `overflow` | `"auto" \| "hidden" \| "scroll" \| "visible"` | — | No |
| `cursor` | `string` | — | No |
| `position` | `"relative" \| "absolute" \| "fixed" \| "sticky"` | — | No |
| `inset` | `string` | — | No |
| `display` | `"flex" \| "grid" \| "block" \| "inline" \| "inline-flex" \| "inline-grid" \| "none" \| object` | — | No |
| `flexDirection` | `"row" \| "column" \| "row-reverse" \| "column-reverse" \| object` | — | No |
| `alignItems` | `"start" \| "center" \| "end" \| "stretch" \| "baseline"` | — | No |
| `justifyContent` | `"start" \| "center" \| "end" \| "between" \| "around" \| "evenly"` | — | No |
| `flexWrap` | `"wrap" \| "nowrap" \| "wrap-reverse"` | — | No |
| `flex` | `string` | — | No |
| `gridTemplateColumns` | `string` | — | No |
| `gridTemplateRows` | `string` | — | No |
| `gridColumn` | `string` | — | No |
| `gridRow` | `string` | — | No |
| `textAlign` | `"left" \| "center" \| "right" \| "justify"` | — | No |
| `fontSize` | `"xs" \| "sm" \| "base" \| "lg" \| "xl" \| "2xl" \| "3xl" \| "4xl" \| string \| object` | — | No |
| `fontWeight` | `"light" \| "normal" \| "medium" \| "semibold" \| "bold" \| number` | — | No |
| `lineHeight` | `"none" \| "tight" \| "snug" \| "normal" \| "relaxed" \| "loose" \| string` | — | No |
| `letterSpacing` | `"tight" \| "normal" \| "wide" \| string` | — | No |
| `hover` | `object` | — | No |
| `focus` | `object` | — | No |
| `active` | `object` | — | No |
| `exitAnimation` | `{ preset: "fade" \| "fade-up" \| "fade-down" \| "slide-left" \| "slide-right" \| "scale", duration: "i...` | — | No |

</details>

---

## Common Sub-Schemas

### Loading Config

Used by data-aware components for loading state customization.

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `id` | `string` | — | No |
| `padding` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `paddingX` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `paddingY` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `margin` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `marginX` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `marginY` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `gap` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number \| object` | — | No |
| `width` | `string \| number \| object` | — | No |
| `minWidth` | `string \| number \| object` | — | No |
| `maxWidth` | `string \| number \| object` | — | No |
| `height` | `string \| number \| object` | — | No |
| `minHeight` | `string \| number \| object` | — | No |
| `maxHeight` | `string \| number \| object` | — | No |
| `bg` | `string \| string \| object` | — | No |
| `color` | `string` | — | No |
| `borderRadius` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "full" \| string \| number` | — | No |
| `border` | `string` | — | No |
| `shadow` | `"none" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| string` | — | No |
| `opacity` | `number` | — | No |
| `overflow` | `"auto" \| "hidden" \| "scroll" \| "visible"` | — | No |
| `position` | `"relative" \| "absolute" \| "fixed" \| "sticky"` | — | No |
| `inset` | `string \| number` | — | No |
| `display` | `"flex" \| "grid" \| "block" \| "inline" \| "inline-flex" \| "inline-grid" \| "none" \| object` | — | No |
| `flexDirection` | `"row" \| "column" \| "row-reverse" \| "column-reverse" \| object` | — | No |
| `alignItems` | `"start" \| "center" \| "end" \| "stretch" \| "baseline"` | — | No |
| `justifyContent` | `"start" \| "center" \| "end" \| "between" \| "around" \| "evenly"` | — | No |
| `flexWrap` | `"wrap" \| "nowrap" \| "wrap-reverse"` | — | No |
| `flex` | `string \| number` | — | No |
| `textAlign` | `"left" \| "center" \| "right" \| "justify"` | — | No |
| `fontSize` | `"xs" \| "sm" \| "base" \| "lg" \| "xl" \| "2xl" \| "3xl" \| "4xl" \| string \| number \| object` | — | No |
| `fontWeight` | `"light" \| "normal" \| "medium" \| "semibold" \| "bold" \| number \| string` | — | No |
| `lineHeight` | `"none" \| "tight" \| "snug" \| "normal" \| "relaxed" \| "loose" \| string \| number` | — | No |
| `letterSpacing` | `"tight" \| "normal" \| "wide" \| string \| number` | — | No |
| `hover` | `object` | — | No |
| `focus` | `object` | — | No |
| `active` | `object` | — | No |
| `className` | `string` | — | No |
| `style` | `Record<string, string \| number>` | — | No |
| `cursor` | `string` | — | No |
| `backgroundColor` | `string` | — | No |
| `gridTemplateColumns` | `string` | — | No |
| `gridTemplateRows` | `string` | — | No |
| `gridColumn` | `string` | — | No |
| `gridRow` | `string` | — | No |
| `states` | `Record<string, object>` | — | No |
| `disabled` | `boolean` | — | No |
| `variant` | `"auto" \| "table" \| "list" \| "card" \| "text" \| "chart" \| "stat"` | `"auto"` | No |
| `rows` | `number` | — | No |
| `count` | `number` | — | No |
| `delay` | `number` | `100` | No |
| `slots` | `object` | — | No |

### Empty State Config

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `id` | `string` | — | No |
| `className` | `string` | — | No |
| `style` | `Record<string, string \| number>` | — | No |
| `states` | `Record<string, object>` | — | No |
| `hover` | `object` | — | No |
| `focus` | `object` | — | No |
| `active` | `object` | — | No |
| `background` | `string \| object` | — | No |
| `backgroundColor` | `string` | — | No |
| `padding` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `paddingX` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `paddingY` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `margin` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `marginX` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `marginY` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `gap` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `width` | `string \| number` | — | No |
| `minWidth` | `string \| number` | — | No |
| `maxWidth` | `string \| number` | — | No |
| `height` | `string \| number` | — | No |
| `minHeight` | `string \| number` | — | No |
| `maxHeight` | `string \| number` | — | No |
| `bg` | `string` | — | No |
| `color` | `string` | — | No |
| `borderRadius` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `border` | `string` | — | No |
| `shadow` | `string` | — | No |
| `opacity` | `string \| number` | — | No |
| `overflow` | `string` | — | No |
| `cursor` | `string` | — | No |
| `position` | `"relative" \| "absolute" \| "fixed" \| "sticky"` | — | No |
| `inset` | `string \| number` | — | No |
| `display` | `"flex" \| "grid" \| "block" \| "inline" \| "inline-flex" \| "inline-grid" \| "none" \| object` | — | No |
| `flexDirection` | `"row" \| "column" \| "row-reverse" \| "column-reverse" \| object` | — | No |
| `alignItems` | `string` | — | No |
| `justifyContent` | `string` | — | No |
| `flexWrap` | `string` | — | No |
| `flex` | `string \| number` | — | No |
| `gridTemplateColumns` | `string` | — | No |
| `gridTemplateRows` | `string` | — | No |
| `gridColumn` | `string` | — | No |
| `gridRow` | `string` | — | No |
| `textAlign` | `string` | — | No |
| `fontSize` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `fontWeight` | `string \| number` | — | No |
| `lineHeight` | `string \| number` | — | No |
| `letterSpacing` | `string \| number` | — | No |
| `icon` | `string` | — | No |
| `title` | `string \| EnvRef \| FromRef \| Expr \| TRef` | `"No data"` | No |
| `description` | `string \| EnvRef \| FromRef \| Expr \| TRef` | — | No |
| `size` | `"sm" \| "md" \| "lg"` | — | No |
| `iconColor` | `string` | — | No |
| `action` | `object` | — | No |
| `slots` | `object` | — | No |

### Error State Config

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `id` | `string` | — | No |
| `className` | `string` | — | No |
| `style` | `Record<string, string \| number>` | — | No |
| `states` | `Record<string, object>` | — | No |
| `hover` | `object` | — | No |
| `focus` | `object` | — | No |
| `active` | `object` | — | No |
| `background` | `string \| object` | — | No |
| `backgroundColor` | `string` | — | No |
| `padding` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `paddingX` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `paddingY` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `margin` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `marginX` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `marginY` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `gap` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `width` | `string \| number` | — | No |
| `minWidth` | `string \| number` | — | No |
| `maxWidth` | `string \| number` | — | No |
| `height` | `string \| number` | — | No |
| `minHeight` | `string \| number` | — | No |
| `maxHeight` | `string \| number` | — | No |
| `bg` | `string` | — | No |
| `color` | `string` | — | No |
| `borderRadius` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `border` | `string` | — | No |
| `shadow` | `string` | — | No |
| `opacity` | `string \| number` | — | No |
| `overflow` | `string` | — | No |
| `cursor` | `string` | — | No |
| `position` | `"relative" \| "absolute" \| "fixed" \| "sticky"` | — | No |
| `inset` | `string \| number` | — | No |
| `display` | `"flex" \| "grid" \| "block" \| "inline" \| "inline-flex" \| "inline-grid" \| "none" \| object` | — | No |
| `flexDirection` | `"row" \| "column" \| "row-reverse" \| "column-reverse" \| object` | — | No |
| `alignItems` | `string` | — | No |
| `justifyContent` | `string` | — | No |
| `flexWrap` | `string` | — | No |
| `flex` | `string \| number` | — | No |
| `gridTemplateColumns` | `string` | — | No |
| `gridTemplateRows` | `string` | — | No |
| `gridColumn` | `string` | — | No |
| `gridRow` | `string` | — | No |
| `textAlign` | `string` | — | No |
| `fontSize` | `"none" \| "2xs" \| "xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string \| number` | — | No |
| `fontWeight` | `string \| number` | — | No |
| `lineHeight` | `string \| number` | — | No |
| `letterSpacing` | `string \| number` | — | No |
| `title` | `string \| EnvRef \| FromRef \| Expr \| TRef` | — | No |
| `description` | `string \| EnvRef \| FromRef \| Expr \| TRef` | — | No |
| `retry` | `boolean \| { label: string \| EnvRef \| FromRef \| Expr \| TRef }` | — | No |
| `icon` | `string` | — | No |
| `slots` | `object` | — | No |

### Suspense Fallback Config

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `type` | `"skeleton" \| "spinner" \| "custom"` | — | **Yes** |
| `variant` | `"card" \| "list" \| "text" \| "table"` | — | No |
| `count` | `number` | — | No |
| `component` | `Record<string, unknown>` | — | No |

### Cache Config (`app.cache`)

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `staleTime` | `number` | `300000` | No |
| `gcTime` | `number` | `600000` | No |
| `retry` | `number` | `1` | No |
