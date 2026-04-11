# Manifest-Only Enterprise UI — Implementation Appendix

> **Status:** Completed (archived 2026-04-11)
> **Companion to:** `docs/specs/completed/manifest-only-ui.md`
> **Purpose:** Zero-context implementation detail for every phase. An implementing agent
> reads this file alongside the main spec and has everything needed to write code without
> asking questions.
> **Archive note:** This appendix moved with the canonical spec into `docs/specs/completed/`.

---

## Table of Contents

- [A. Phase 0 — Foundation Fixes (expanded)](#a-phase-0)
- [B. Phase 2 — All 7 Default Auth Screen Fragments](#b-phase-2-auth-screens)
- [C. Phase 3 — Layout Registry + Centered Layout (expanded)](#c-phase-3)
- [D. Phase 4 — Every New Component Schema](#d-phase-4-component-schemas)
- [E. Phase 5 — Every New Action Handler](#e-phase-5-action-handlers)
- [F. Phase 6 — Data Binding Migration Per Component](#f-phase-6-data-binding)
- [G. Phase 7 — Guard Implementations](#g-phase-7-guards)
- [H. Phase 8 — i18n / Realtime / Observability Runtime](#h-phase-8-enterprise)
- [I. Compiler Pipeline Insertion Points](#i-compiler-pipeline)
- [J. Auto-Form Schema Extensions](#j-auto-form-extensions)
- [K. Expression Language Parser Detail](#k-expression-parser)
- [L. Default i18n Catalog (English)](#l-i18n-catalog)

---

<a id="a-phase-0"></a>
## A. Phase 0 — Foundation Fixes (expanded)

### A.1 Nav icon rendering fix

**File:** `src/ui/components/layout/nav/component.tsx`

**Current code (lines 76-80):**
```tsx
{item.icon && (
  <span data-nav-icon="" aria-hidden="true">
    {item.icon}
  </span>
)}
```

**Replacement:**
```tsx
{item.icon && (
  <span data-nav-icon="" aria-hidden="true">
    <Icon name={item.icon} size={16} />
  </span>
)}
```

**Import to add:** The `Icon` component is already imported in the same file (used at line 276 for
user menu items). Verify import exists; if not, add:
```tsx
import { Icon } from "../../icons/icon";
```

**Where Icon is defined:** Grep for `export.*function Icon` or `export.*const Icon` in
`src/ui/icons/` or `src/ui/components/`. The user menu at line 276 already calls
`<Icon name={item.icon} size={16} />` — use the same import path.

### A.2 Nav active-state wiring in manifest mode

**Current behavior:** The `useNav` hook at `src/ui/components/layout/nav/hook.ts:97` accepts
`pathname: string` as a parameter. Active state is computed as:
```ts
const isActive = item.path
  ? pathname === item.path || pathname.startsWith(item.path + "/")
  : false;
```

The `Nav` component at `component.tsx:11-18` accepts `pathname?: string` as an optional prop.
If not provided, it falls back to `window.location.pathname` in the render body (lines 306-313),
which is an SSR bug.

**The fix has two parts:**

1. **Remove `window.location.pathname` from render body.** Replace with `useState` + `useEffect`:
```tsx
const [currentPath, setCurrentPath] = useState(pathname ?? '/');
useEffect(() => {
  if (!pathname) {
    setCurrentPath(window.location.pathname);
    const handler = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }
}, [pathname]);
```

2. **In `ManifestApp`, pass pathname to Nav.** Wherever the nav is rendered inside the manifest
router, pass the current route path. The manifest router uses `history.pushState` (see
executor.ts:327-345) and dispatches `popstate` — the above listener catches it.

### A.3 Nav defaults when minimally configured

**Current behavior with minimal config (`{ type: "nav", items: [...] }`):**
- No logo section renders (config.logo is undefined)
- User menu renders if user is authenticated BUT has no menu items
- No header/brand visible
- Result: a naked list of buttons

**Fix:** In `Nav` component, when `config.logo` is undefined, derive a fallback from the
manifest's `app.title`:

```tsx
// Inside Nav component, access manifest context:
const manifest = useManifestRuntime(); // already available via context

const effectiveLogo = config.logo ?? (manifest?.app?.title
  ? { text: manifest.app.title, path: manifest.app.home ?? '/' }
  : undefined);
```

Then render `effectiveLogo` instead of `config.logo` at lines 329-378. This ensures a minimal
nav always shows the app name as a brand link.

Similarly, for user menu: when `config.userMenu` is undefined (not explicitly `false`), show
avatar + name by default when user is authenticated.

### A.4 Token injection — synchronous rendering

**Current code in `app.tsx:1582-1587`:**
```tsx
useLayoutEffect(() => {
  if (compiledManifest.theme) {
    const css = resolveTokens(compiledManifest.theme);
    injectStyleSheet("snapshot-tokens", css);
  }
}, [compiledManifest.theme]);
```

**Replacement:** Move to a `useMemo` + inline `<style>` tag:
```tsx
// After compiledManifest is computed:
const tokenCss = useMemo(
  () => resolveTokens(compiledManifest.theme ?? {}),
  [compiledManifest.theme],
);

// Inside the JSX return, as the FIRST child:
<>
  <style
    id="snapshot-tokens"
    dangerouslySetInnerHTML={{ __html: tokenCss }}
  />
  {/* rest of the provider tree */}
</>
```

**Why `resolveTokens({})` not `resolveTokens(undefined)`:** `resolveTokens` with an empty
config returns the `neutral` flavor defaults. This guarantees every `var(--sn-*)` has a
value even if the manifest omits `theme` entirely.

**Remove** the `injectStyleSheet` import if it becomes unused after this change.

### A.5 Unified `bootBuiltins()`

**Current state:** `registerBuiltInComponents()` is in `src/ui/components/register.ts`.
`registerBuiltInFlavors()` is in `src/ui/tokens/flavors.ts`. There is no single
`bootBuiltins()` function.

**Create `src/ui/manifest/boot-builtins.ts`:**
```ts
import { registerBuiltInComponents } from "../components/register";
import { registerBuiltInFlavors } from "../tokens/flavors";

let booted = false;

/**
 * Idempotent bootstrap: registers all built-in components, schemas,
 * flavors, and (in later phases) layouts, actions, guards.
 * Must be called before compileManifest() touches the schema registry.
 */
export function bootBuiltins(): void {
  if (booted) return;
  booted = true;
  registerBuiltInComponents();
  registerBuiltInFlavors();
}

/** Reset for testing only. */
export function resetBootBuiltins(): void {
  booted = false;
}
```

**Call site:** First statement of `ManifestApp` in `app.tsx`, before the `useMemo` that
calls `compileManifest`:
```tsx
export function ManifestApp({ manifest, apiUrl }: ManifestAppProps) {
  bootBuiltins(); // MUST be before compileManifest
  const compiledManifest = useMemo(() => compileManifest(manifest), [manifest]);
  // ...
}
```

---

<a id="b-phase-2-auth-screens"></a>
## B. Phase 2 — All 7 Default Auth Screen Fragments

These are the complete `content` arrays for every auth screen. Each screen uses only
public component types that exist (or are added in Phase 4). Every string is an i18n ref
(`{i18n:key}`) with the English catalog in [Appendix L](#l-i18n-catalog).

### B.1 Login screen

```json
{
  "id": "login",
  "path": "/login",
  "layouts": [{ "type": "centered" }],
  "guard": { "authenticated": false, "redirectTo": "{auth.redirects.afterLogin}" },
  "title": "{i18n:auth.login.title}",
  "content": [
    {
      "type": "stack",
      "gap": "lg",
      "align": "stretch",
      "maxWidth": "sm",
      "children": [
        { "type": "heading", "text": "{auth.branding.title}", "level": 1, "align": "center",
          "fallback": "{app.title}" },
        { "type": "text", "value": "{i18n:auth.login.description}", "variant": "muted",
          "align": "center" },
        {
          "type": "oauth-buttons",
          "visibleWhen": "defined(auth.providers)",
          "onSuccess": [{ "type": "navigate", "to": "{auth.redirects.afterLogin}" }]
        },
        { "type": "divider", "label": "{i18n:common.or}",
          "visibleWhen": "defined(auth.providers)" },
        {
          "type": "auto-form",
          "id": "login-form",
          "submit": "{auth.contract.endpoints.login}",
          "method": "POST",
          "fields": [
            {
              "name": "email",
              "type": "email",
              "label": "{i18n:auth.field.email.label}",
              "placeholder": "{i18n:auth.field.email.placeholder}",
              "required": true,
              "autoComplete": "email"
            },
            {
              "name": "password",
              "type": "password",
              "label": "{i18n:auth.field.password.label}",
              "placeholder": "{i18n:auth.field.password.placeholder}",
              "required": true,
              "autoComplete": "current-password",
              "inlineAction": {
                "label": "{i18n:auth.link.forgot_password}",
                "to": "/forgot-password"
              }
            }
          ],
          "submitLabel": "{i18n:auth.action.sign_in}",
          "submitLoadingLabel": "{i18n:auth.action.sign_in.loading}",
          "on": {
            "success": [
              { "type": "api", "method": "GET", "endpoint": "{auth.contract.endpoints.me}",
                "onSuccess": [
                  { "type": "set-value", "target": "global.user", "value": "{context.result}" },
                  { "type": "navigate", "to": "{auth.redirects.afterLogin}" }
                ]
              }
            ],
            "error": [
              { "type": "toast", "variant": "error", "message": "{context.error.message}" }
            ]
          }
        },
        {
          "type": "passkey-button",
          "label": "{i18n:auth.label.passkey_button}",
          "visibleWhen": "defined(auth.passkey)",
          "onSuccess": [
            { "type": "set-value", "target": "global.user", "value": "{context.result}" },
            { "type": "navigate", "to": "{auth.redirects.afterLogin}" }
          ]
        },
        { "type": "link", "to": "/register", "text": "{i18n:auth.link.create_account}",
          "align": "center" }
      ]
    }
  ]
}
```

### B.2 Register screen

```json
{
  "id": "register",
  "path": "/register",
  "layouts": [{ "type": "centered" }],
  "guard": { "authenticated": false, "redirectTo": "/" },
  "title": "{i18n:auth.register.title}",
  "content": [
    {
      "type": "stack",
      "gap": "lg",
      "align": "stretch",
      "maxWidth": "sm",
      "children": [
        { "type": "heading", "text": "{auth.branding.title}", "level": 1, "align": "center",
          "fallback": "{app.title}" },
        { "type": "text", "value": "{i18n:auth.register.description}", "variant": "muted",
          "align": "center" },
        {
          "type": "oauth-buttons",
          "visibleWhen": "defined(auth.providers)",
          "onSuccess": [{ "type": "navigate", "to": "{auth.redirects.afterRegister}" }]
        },
        { "type": "divider", "label": "{i18n:common.or}",
          "visibleWhen": "defined(auth.providers)" },
        {
          "type": "auto-form",
          "id": "register-form",
          "submit": "{auth.contract.endpoints.register}",
          "method": "POST",
          "fields": [
            {
              "name": "name",
              "type": "text",
              "label": "{i18n:auth.field.name.label}",
              "placeholder": "{i18n:auth.field.name.placeholder}",
              "autoComplete": "name"
            },
            {
              "name": "email",
              "type": "email",
              "label": "{i18n:auth.field.email.label}",
              "placeholder": "{i18n:auth.field.email.placeholder}",
              "required": true,
              "autoComplete": "email"
            },
            {
              "name": "password",
              "type": "password",
              "label": "{i18n:auth.field.password.label}",
              "placeholder": "{i18n:auth.field.password.placeholder.register}",
              "required": true,
              "autoComplete": "new-password"
            }
          ],
          "submitLabel": "{i18n:auth.action.create_account}",
          "submitLoadingLabel": "{i18n:auth.action.create_account.loading}",
          "on": {
            "success": [
              { "type": "api", "method": "GET", "endpoint": "{auth.contract.endpoints.me}",
                "onSuccess": [
                  { "type": "set-value", "target": "global.user", "value": "{context.result}" },
                  { "type": "navigate", "to": "{auth.redirects.afterRegister}" }
                ]
              }
            ],
            "error": [
              { "type": "toast", "variant": "error", "message": "{context.error.message}" }
            ]
          }
        },
        { "type": "link", "to": "/login", "text": "{i18n:auth.link.sign_in}",
          "align": "center" }
      ]
    }
  ]
}
```

### B.3 Forgot-password screen

```json
{
  "id": "forgot-password",
  "path": "/forgot-password",
  "layouts": [{ "type": "centered" }],
  "guard": { "authenticated": false, "redirectTo": "/" },
  "title": "{i18n:auth.forgot_password.title}",
  "content": [
    {
      "type": "stack",
      "gap": "lg",
      "align": "stretch",
      "maxWidth": "sm",
      "children": [
        { "type": "heading", "text": "{i18n:auth.forgot_password.title}", "level": 1,
          "align": "center" },
        { "type": "text", "value": "{i18n:auth.forgot_password.description}",
          "variant": "muted", "align": "center" },
        {
          "type": "auto-form",
          "id": "forgot-password-form",
          "submit": "{auth.contract.endpoints.forgotPassword}",
          "method": "POST",
          "fields": [
            {
              "name": "email",
              "type": "email",
              "label": "{i18n:auth.field.email.label}",
              "placeholder": "{i18n:auth.field.email.placeholder}",
              "required": true,
              "autoComplete": "email"
            }
          ],
          "submitLabel": "{i18n:auth.action.send_reset_link}",
          "submitLoadingLabel": "{i18n:auth.action.send_reset_link.loading}",
          "on": {
            "success": [
              { "type": "toast", "variant": "success",
                "message": "{i18n:auth.message.forgot_password_sent}" }
            ],
            "error": [
              { "type": "toast", "variant": "error", "message": "{context.error.message}" }
            ]
          }
        },
        { "type": "link", "to": "/login", "text": "{i18n:auth.link.back_to_sign_in}",
          "align": "center" }
      ]
    }
  ]
}
```

### B.4 Reset-password screen

```json
{
  "id": "reset-password",
  "path": "/reset-password",
  "layouts": [{ "type": "centered" }],
  "title": "{i18n:auth.reset_password.title}",
  "content": [
    {
      "type": "stack",
      "gap": "lg",
      "align": "stretch",
      "maxWidth": "sm",
      "children": [
        { "type": "heading", "text": "{i18n:auth.reset_password.title}", "level": 1,
          "align": "center" },
        { "type": "text", "value": "{i18n:auth.reset_password.description}",
          "variant": "muted", "align": "center" },
        {
          "type": "alert",
          "variant": "warning",
          "message": "{i18n:auth.error.reset_link_missing_token}",
          "visibleWhen": "empty(route.query.token)"
        },
        {
          "type": "auto-form",
          "id": "reset-password-form",
          "submit": "{auth.contract.endpoints.resetPassword}",
          "method": "POST",
          "visibleWhen": "defined(route.query.token)",
          "fields": [
            {
              "name": "token",
              "type": "text",
              "default": "{route.query.token}",
              "visible": false
            },
            {
              "name": "password",
              "type": "password",
              "label": "{i18n:auth.field.password.label.reset}",
              "placeholder": "{i18n:auth.field.password.placeholder.reset}",
              "required": true,
              "autoComplete": "new-password"
            }
          ],
          "submitLabel": "{i18n:auth.action.reset_password}",
          "submitLoadingLabel": "{i18n:auth.action.reset_password.loading}",
          "on": {
            "success": [
              { "type": "toast", "variant": "success",
                "message": "{i18n:auth.message.password_reset}" }
            ],
            "error": [
              { "type": "toast", "variant": "error", "message": "{context.error.message}" }
            ]
          }
        },
        { "type": "link", "to": "/login", "text": "{i18n:auth.link.back_to_sign_in}",
          "align": "center" }
      ]
    }
  ]
}
```

### B.5 Verify-email screen

```json
{
  "id": "verify-email",
  "path": "/verify-email",
  "layouts": [{ "type": "centered" }],
  "title": "{i18n:auth.verify_email.title}",
  "content": [
    {
      "type": "stack",
      "gap": "lg",
      "align": "stretch",
      "maxWidth": "sm",
      "children": [
        { "type": "heading", "text": "{i18n:auth.verify_email.title}", "level": 1,
          "align": "center" },
        { "type": "text", "value": "{i18n:auth.verify_email.description}",
          "variant": "muted", "align": "center" },
        {
          "type": "auto-form",
          "id": "verify-email-auto",
          "submit": "{auth.contract.endpoints.verifyEmail}",
          "method": "POST",
          "autoSubmit": true,
          "autoSubmitWhen": "defined(route.query.token)",
          "fields": [
            {
              "name": "token",
              "type": "text",
              "default": "{route.query.token}",
              "visible": false
            }
          ],
          "on": {
            "success": [
              { "type": "toast", "variant": "success",
                "message": "{i18n:auth.message.email_verified}" }
            ],
            "error": [
              { "type": "toast", "variant": "error", "message": "{context.error.message}" }
            ]
          }
        },
        {
          "type": "auto-form",
          "id": "resend-verification-form",
          "submit": "{auth.contract.endpoints.resendVerification}",
          "method": "POST",
          "visibleWhen": "empty(route.query.token)",
          "fields": [
            {
              "name": "email",
              "type": "email",
              "label": "{i18n:auth.field.email.label}",
              "placeholder": "{i18n:auth.field.email.placeholder}",
              "required": true,
              "autoComplete": "email"
            }
          ],
          "submitLabel": "{i18n:auth.action.resend_verification}",
          "submitLoadingLabel": "{i18n:auth.action.resend_verification.loading}",
          "on": {
            "success": [
              { "type": "toast", "variant": "success",
                "message": "{i18n:auth.message.verification_sent}" }
            ],
            "error": [
              { "type": "toast", "variant": "error", "message": "{context.error.message}" }
            ]
          }
        },
        { "type": "link", "to": "/login", "text": "{i18n:auth.link.continue_to_sign_in}",
          "align": "center" }
      ]
    }
  ]
}
```

### B.6 MFA screen

```json
{
  "id": "mfa",
  "path": "/mfa",
  "layouts": [{ "type": "centered" }],
  "title": "{i18n:auth.mfa.title}",
  "content": [
    {
      "type": "stack",
      "gap": "lg",
      "align": "stretch",
      "maxWidth": "sm",
      "children": [
        { "type": "heading", "text": "{i18n:auth.mfa.title}", "level": 1,
          "align": "center" },
        { "type": "text", "value": "{i18n:auth.mfa.description}",
          "variant": "muted", "align": "center" },
        {
          "type": "alert",
          "variant": "warning",
          "message": "{i18n:auth.error.no_active_challenge}",
          "visibleWhen": "empty(global.pendingMfaChallenge)"
        },
        {
          "type": "auto-form",
          "id": "mfa-form",
          "submit": "{auth.contract.endpoints.mfaVerify}",
          "method": "POST",
          "visibleWhen": "defined(global.pendingMfaChallenge)",
          "fields": [
            {
              "name": "mfaToken",
              "type": "text",
              "default": "{global.pendingMfaChallenge.mfaToken}",
              "visible": false
            },
            {
              "name": "code",
              "type": "text",
              "label": "{i18n:auth.field.code.label}",
              "placeholder": "{i18n:auth.field.code.placeholder}",
              "required": true,
              "autoComplete": "one-time-code"
            },
            {
              "name": "method",
              "type": "select",
              "label": "{i18n:auth.field.method.label}",
              "visibleWhen": "global.pendingMfaChallenge.mfaMethods.length > 1",
              "options": "{global.pendingMfaChallenge.mfaMethods}",
              "default": "{global.pendingMfaChallenge.mfaMethods[0]}"
            }
          ],
          "submitLabel": "{i18n:auth.action.verify}",
          "submitLoadingLabel": "{i18n:auth.action.verify.loading}",
          "on": {
            "success": [
              { "type": "api", "method": "GET", "endpoint": "{auth.contract.endpoints.me}",
                "onSuccess": [
                  { "type": "set-value", "target": "global.pendingMfaChallenge", "value": null },
                  { "type": "set-value", "target": "global.user", "value": "{context.result}" },
                  { "type": "navigate", "to": "{auth.redirects.afterMfa}" }
                ]
              }
            ],
            "error": [
              { "type": "toast", "variant": "error", "message": "{context.error.message}" }
            ]
          }
        },
        { "type": "link", "to": "/login", "text": "{i18n:auth.link.back_to_sign_in}",
          "align": "center" }
      ]
    }
  ]
}
```

### B.7 SSO callback screen

```json
{
  "id": "sso-callback",
  "path": "/auth/callback",
  "layouts": [{ "type": "centered" }],
  "title": "{i18n:auth.sso_callback.title}",
  "content": [
    {
      "type": "stack",
      "gap": "md",
      "align": "center",
      "maxWidth": "sm",
      "children": [
        { "type": "spinner", "size": "lg" },
        { "type": "text", "value": "{i18n:auth.sso_callback.message}", "variant": "muted",
          "align": "center" }
      ]
    }
  ],
  "enter": {
    "steps": [
      {
        "type": "api",
        "method": "POST",
        "endpoint": "{auth.contract.endpoints.oauthCallback}",
        "body": { "code": "{route.query.code}", "state": "{route.query.state}" },
        "onSuccess": [
          { "type": "api", "method": "GET", "endpoint": "{auth.contract.endpoints.me}",
            "onSuccess": [
              { "type": "set-value", "target": "global.user", "value": "{context.result}" },
              { "type": "navigate", "to": "{auth.redirects.afterLogin}", "replace": true }
            ]
          }
        ],
        "onError": [
          { "type": "toast", "variant": "error", "message": "{context.error.message}" },
          { "type": "navigate", "to": "/login", "replace": true }
        ]
      }
    ]
  }
}
```

---

<a id="c-phase-3"></a>
## C. Phase 3 — Layout Registry + Centered Layout

### C.1 Where to insert layout resolution in the renderer

**Current route rendering path:** `ManifestApp` → `ManifestRouter` → route match → page
render. The layout is currently applied inside the `Layout` component based on
`route.page.layout` which maps to the 5-variant switch in
`src/ui/components/layout/layout/component.tsx`.

**Change:** Instead of the switch, call `resolveLayout(layoutName)` from the registry.
The switch becomes:
```tsx
const layoutDef = resolveLayout(layoutName);
if (!layoutDef) {
  console.warn(`Unknown layout: ${layoutName}, falling back to sidebar`);
  return <SidebarLayout config={{}} children={children} />;
}
const LayoutComponent = layoutDef.component;
return <LayoutComponent config={layoutConfig} children={children} />;
```

### C.2 The `routeConfigSchema.layouts` field

**Current schema** (`schema.ts:1056-1081`):
```ts
layouts: z.array(routeLayoutSchema).optional()
```

Where `routeLayoutSchema` is:
```ts
z.union([
  layoutSchema,  // z.enum(["sidebar", "top-nav", "stacked", "minimal", "full-width"])
  z.object({ type: z.string().min(1), props: z.record(z.unknown()).optional(), slots: ... })
])
```

**Change:** Add `"centered"`, `"blank"`, `"focused"`, `"split"`, `"dashboard"` to the
`layoutSchema` enum. Or better: make the enum open by switching to `z.string().min(1)` and
let the layout registry handle unknown names with a runtime warning.

### C.3 Centered layout full implementation

**File:** `src/ui/layouts/centered/component.tsx`

```tsx
'use client';

import type { ReactNode, CSSProperties } from "react";

interface CenteredLayoutConfig {
  maxWidth?: "xs" | "sm" | "md" | "lg";
  showBranding?: boolean;
}

export function CenteredLayout({
  config,
  children,
}: {
  config: CenteredLayoutConfig;
  children: ReactNode;
}) {
  const maxWidth = config.maxWidth ?? "sm";

  return (
    <div
      data-snapshot-layout="centered"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--sn-color-background)",
        color: "var(--sn-color-foreground)",
        fontFamily: "var(--sn-font-sans)",
        padding: "var(--sn-spacing-lg)",
      }}
    >
      <div
        data-centered-card=""
        style={{
          width: "100%",
          maxWidth: `var(--sn-container-${maxWidth})`,
          padding: "var(--sn-spacing-2xl)",
          background: "var(--sn-color-card)",
          color: "var(--sn-color-card-foreground)",
          borderRadius: "var(--sn-radius-lg)",
          boxShadow: "var(--sn-shadow-lg)",
          border: "var(--sn-border-thin) solid var(--sn-color-border)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

**Schema:** `src/ui/layouts/centered/schema.ts`
```ts
import { z } from "zod";

export const centeredLayoutSchema = z.object({
  maxWidth: z.enum(["xs", "sm", "md", "lg"]).default("sm"),
  showBranding: z.boolean().default(false),
}).strict();
```

---

<a id="d-phase-4-component-schemas"></a>
## D. Phase 4 — Every New Component Schema

### D.1 `stack` — vertical flex container

**Schema:**
```ts
export const stackSchema = extendComponentSchema({
  type: z.literal("stack"),
  children: z.array(componentConfigSchema).min(1),
  gap: z.enum(["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl"]).default("md"),
  align: z.enum(["stretch", "start", "center", "end"]).default("stretch"),
  justify: z.enum(["start", "center", "end", "between", "around"]).default("start"),
  maxWidth: z.enum(["xs", "sm", "md", "lg", "xl", "2xl", "full"]).optional(),
  padding: z.enum(["none", "sm", "md", "lg", "xl"]).optional(),
}).strict();
```

**Render:** `<div>` with `display: flex`, `flexDirection: column`, gap from `--sn-spacing-{gap}`,
max-width from `--sn-container-{maxWidth}`, margin `0 auto` when maxWidth is set.

### D.2 `heading` — h1-h6

**Schema:**
```ts
export const headingSchema = extendComponentSchema({
  type: z.literal("heading"),
  text: z.string(),
  level: z.number().int().min(1).max(6).default(2),
  align: z.enum(["left", "center", "right"]).default("left"),
  fallback: z.string().optional(),
}).strict();
```

**Render:** `<h{level}>` with `fontSize` from token mapping (h1→`--sn-font-size-2xl`,
h2→`--sn-font-size-xl`, etc.), `textAlign` from `align`, `fontWeight` from
`--sn-font-weight-bold`, `color` from `--sn-color-foreground`.

If `text` resolves to empty and `fallback` is set, render `fallback` instead.

### D.3 `text` — paragraph

**Schema:**
```ts
export const textSchema = extendComponentSchema({
  type: z.literal("text"),
  value: z.string(),
  variant: z.enum(["default", "muted", "subtle"]).default("default"),
  size: z.enum(["xs", "sm", "md", "lg"]).default("md"),
  weight: z.enum(["light", "normal", "medium", "semibold", "bold"]).default("normal"),
  align: z.enum(["left", "center", "right"]).default("left"),
}).strict();
```

**Render:** `<p>` with:
- `color`: default → `--sn-color-foreground`, muted → `--sn-color-muted-foreground`,
  subtle → `--sn-color-muted-foreground` with `--sn-opacity-muted`
- `fontSize`: `--sn-font-size-{size}`
- `fontWeight`: `--sn-font-weight-{weight}`
- `textAlign`: from `align`

### D.4 `link` — navigation primitive

**Schema:**
```ts
export const linkSchema = extendComponentSchema({
  type: z.literal("link"),
  text: z.string(),
  to: z.string(),
  external: z.boolean().default(false),
  align: z.enum(["left", "center", "right"]).default("left"),
  variant: z.enum(["default", "muted", "button"]).default("default"),
}).strict();
```

**Render:** `<a>` if external, `<button>` with `navigate` action if internal. Uses
`--sn-color-primary` for default variant, `--sn-color-muted-foreground` for muted,
button styling for button variant. `textAlign` from `align`, `display: block` when
`align` is center/right.

### D.5 `divider` — with optional label

**Schema:**
```ts
export const dividerSchema = extendComponentSchema({
  type: z.literal("divider"),
  label: z.string().optional(),
  orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
}).strict();
```

**Render:** `<div role="separator">`. Horizontal: `borderTop: var(--sn-border-thin) solid
var(--sn-color-border)`. When `label` is present, flex layout with the label centered
between two lines:
```html
<div style="display:flex; align-items:center; gap:var(--sn-spacing-md)">
  <div style="flex:1; height:0; borderTop:..." />
  <span style="color:var(--sn-color-muted-foreground); fontSize:var(--sn-font-size-xs)">
    {label}
  </span>
  <div style="flex:1; height:0; borderTop:..." />
</div>
```

### D.6 `oauth-buttons` — branded OAuth provider buttons

**Schema:**
```ts
export const oauthButtonsSchema = extendComponentSchema({
  type: z.literal("oauth-buttons"),
  heading: z.string().optional(),
  onSuccess: z.array(actionConfigSchema).optional(),
}).strict();
```

**Behavior:**
1. Read `auth.providers` from manifest runtime context (via `useManifestRuntime()`)
2. Filter to OAuth-type providers only
3. If no OAuth providers, render nothing (return null)
4. For each provider, render a secondary-styled button:
   - Icon: `renderIcon(provider.icon ?? providerName)` (e.g., "google" → Google icon)
   - Label: `provider.label ?? "Continue with {titleCase(name)}"`
   - `onClick`: `{ type: "navigate-external", to: provider.startUrl ?? "/auth/{name}/start" }`
5. All buttons in a vertical stack with `gap: --sn-spacing-sm`

**Implementation detail:** The `startUrl` defaults are resolved from the auth contract:
`auth.contract.endpoints.oauthStart` with `{provider}` interpolated. If the contract
doesn't specify it, fall back to `/auth/{provider}/start`.

### D.7 `passkey-button` — WebAuthn login

**Schema:**
```ts
export const passkeyButtonSchema = extendComponentSchema({
  type: z.literal("passkey-button"),
  label: z.string().default("Sign in with passkey"),
  onSuccess: z.array(actionConfigSchema).optional(),
}).strict();
```

**Behavior:**
1. Check `isPasskeySupported()` (from `src/auth/passkey.ts`) — if not supported, return null
2. Render secondary-styled button
3. On click: call `startPasskeyAuthentication()` → on success, POST credentials to
   `auth.contract.endpoints.passkeyLogin` → execute `onSuccess` actions
4. On DOMException with name "NotAllowedError", silently ignore (user cancelled)

### D.8 Base schema definition

**File:** `src/ui/components/_base/schema.ts`

```ts
import { z } from "zod";

export const baseComponentSchema = z.object({
  id: z.string().optional(),
  tokens: z.record(z.string(), z.string()).optional(),
  className: z.string().optional(),
  style: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  visibleWhen: z.string().optional(),
  visible: z.union([z.boolean(), z.object({ from: z.string() })]).optional(),
});

export function extendComponentSchema<T extends z.ZodRawShape>(shape: T) {
  return baseComponentSchema.extend(shape);
}
```

**Migration for existing 69 components:** Each component's `schema.ts` currently defines its
own `z.object({...}).strict()`. Change to `extendComponentSchema({...}).strict()`. The
`id`, `tokens`, `className`, `style`, `visibleWhen`, `visible` fields are automatically
included. Remove any manually-declared `id`, `className`, or `style` fields from individual
component schemas to avoid duplication.

This is a mechanical refactor — search for `z.object({` in every `schema.ts` under
`src/ui/components/`, replace with `extendComponentSchema({`, and remove duplicated fields.

---

<a id="e-phase-5-action-handlers"></a>
## E. Phase 5 — Every New Action Handler

**Current state:** All 11 action handlers are inline switch cases in
`src/ui/actions/executor.ts:322-669`. This spec adds new actions as additional cases in
the same switch. (Extracting to separate files is a cleanup that can happen later per P8.)

### E.1 `navigate-external`

**Config schema:**
```ts
interface NavigateExternalAction {
  type: "navigate-external";
  to: string;           // URL with {param} interpolation
  target?: "_self" | "_blank";  // default: "_self"
}
```

**Handler (in executor.ts switch):**
```ts
case "navigate-external": {
  const url = resolveTemplate(builtin.to, templateContext);
  const target = builtin.target ?? "_self";
  if (target === "_blank") {
    window.open(url, "_blank", "noopener");
  } else {
    window.location.assign(url);
  }
  break;
}
```

### E.2 `copy`

**Config schema:**
```ts
interface CopyAction {
  type: "copy";
  text: string;          // text to copy, with {param} interpolation
  onSuccess?: ActionConfig | ActionConfig[];
}
```

**Handler:**
```ts
case "copy": {
  const text = resolveTemplate(builtin.text, templateContext);
  await navigator.clipboard.writeText(text);
  if (builtin.onSuccess) {
    await executeActions(builtin.onSuccess, actionContext);
  }
  break;
}
```

### E.3 `emit`

**Config schema:**
```ts
interface EmitAction {
  type: "emit";
  event: string;         // custom event name
  payload?: unknown;     // arbitrary payload
}
```

**Handler:**
```ts
case "emit": {
  const eventName = resolveTemplate(builtin.event, templateContext);
  window.dispatchEvent(
    new CustomEvent(`snapshot:${eventName}`, { detail: builtin.payload })
  );
  break;
}
```

Components can listen via `useEffect(() => { window.addEventListener('snapshot:eventName', ...) })`.

### E.4 `submit-form`

**Config schema:**
```ts
interface SubmitFormAction {
  type: "submit-form";
  formId: string;        // id of the auto-form component
}
```

**Handler:**
```ts
case "submit-form": {
  // Dispatch a custom event that auto-form listens for
  window.dispatchEvent(
    new CustomEvent("snapshot:submit-form", { detail: { formId: builtin.formId } })
  );
  break;
}
```

The `auto-form` component registers a listener in a `useEffect` for
`snapshot:submit-form` events matching its `config.id`.

### E.5 `reset-form`

**Config schema:**
```ts
interface ResetFormAction {
  type: "reset-form";
  formId: string;
}
```

**Handler:** Same pattern as `submit-form` but with event name `snapshot:reset-form`.

### E.6 `set-theme`

**Config schema:**
```ts
interface SetThemeAction {
  type: "set-theme";
  flavor?: string;       // flavor name from registry
  mode?: "light" | "dark" | "system";
}
```

**Handler:**
```ts
case "set-theme": {
  if (builtin.flavor) {
    // Re-resolve tokens with new flavor and inject
    const newTheme = { ...currentTheme, flavor: builtin.flavor };
    const css = resolveTokens(newTheme);
    const styleEl = document.getElementById("snapshot-tokens");
    if (styleEl) styleEl.textContent = css;
  }
  if (builtin.mode) {
    const root = document.documentElement;
    if (builtin.mode === "dark") root.classList.add("dark");
    else if (builtin.mode === "light") root.classList.remove("dark");
    else {
      // system: use prefers-color-scheme
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", dark);
    }
  }
  break;
}
```

### E.7 `log`

**Config schema:**
```ts
interface LogAction {
  type: "log";
  level: "info" | "warn" | "error" | "debug";
  message: string;       // with {param} interpolation
  data?: Record<string, unknown>;
}
```

**Handler:**
```ts
case "log": {
  const msg = resolveTemplate(builtin.message, templateContext);
  // If observability sink is configured, POST to it
  const sink = manifest?.observability?.audit?.sink;
  if (sink) {
    void api.post(sink, {
      level: builtin.level,
      message: msg,
      data: builtin.data,
      timestamp: new Date().toISOString(),
      route: actionContext.route?.path,
    });
  }
  // Also console log in dev
  if (import.meta.env.DEV) {
    console[builtin.level]?.(msg, builtin.data);
  }
  break;
}
```

### E.8 `open-drawer` / `close-drawer`

Not needed as separate actions. The existing `open-modal` / `close-modal` already handle
both modals and drawers — the overlay registry distinguishes them by `kind: "modal" | "drawer"`.
The spec should NOT add these as separate actions. Remove from the gap list.

---

<a id="f-phase-6-data-binding"></a>
## F. Phase 6 — Data Binding Migration

### F.1 Current state

`useComponentData` already exists at `src/ui/components/_base/use-component-data.ts` and is
already used by most data-displaying components (stat-card, data-table, list, chart,
detail-card). The hook signature:

```ts
function useComponentData(
  dataConfig: string | FromRef | ResourceRef,
  params?: Record<string, unknown | FromRef>,
): ComponentDataResult
```

### F.2 What Phase 6 actually needs to do

Since `useComponentData` already exists and is already the standard pattern, Phase 6 is
**not** building a new hook. It's:

1. **Audit:** Grep every component for direct `api.get()`, `api.post()`, `useQuery()`, or
   `fetch()` calls that bypass `useComponentData`. List every hit.
2. **Migrate:** For each hit, replace with `useComponentData` using the same endpoint.
3. **Resource declarations:** Ensure `manifest.resources` is the preferred binding form.
   Components that currently accept `"GET /api/users"` as a string should also accept
   `{ "resource": "users" }` — which they already do via the `ResourceRef` union in
   `useComponentData`.
4. **Template resolver unification:** `resolveTemplate` currently exists inline in the
   executor. Extract to `src/ui/expressions/template.ts` and use it everywhere:
   - Action executor (already uses interpolation)
   - Component text rendering (headings, text, etc.)
   - From-ref resolution paths
   - Auth contract endpoint resolution

### F.3 `resolveFromRef` canonical location

The function currently lives in `src/ui/actions/executor.ts:126-216`. Move it to
`src/ui/context/from-ref.ts` (the file path referenced in CLAUDE.md). Re-export from the
executor file for backwards compat during the transition, then delete the re-export.

---

<a id="g-phase-7-guards"></a>
## G. Phase 7 — Guard Implementations

### G.1 Current guard mechanism

Guards already exist at `src/routing/loaders.ts`. The `createLoaders()` factory returns
`{ protectedBeforeLoad, guestBeforeLoad }` using TanStack Router's `beforeLoad` pattern.

The manifest route schema already has:
```ts
guard: z.object({
  authenticated: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
  policy: z.string().min(1).optional(),
  redirectTo: z.string().startsWith("/").optional(),
}).strict().optional()
```

### G.2 What Phase 7 actually needs

The guard schema and mechanism already exist. Phase 7 connects them to the manifest in
the router. Inside the route builder (wherever `ManifestRouter` creates TanStack routes
from compiled routes), each route's `guard` config maps to a `beforeLoad`:

```ts
function buildRouteGuard(guard: RouteGuard, snapshot: SnapshotInstance) {
  return async ({ context }: { context: unknown }) => {
    if (guard.authenticated === true) {
      // Reuse existing protectedBeforeLoad logic
      const user = await fetchUser(snapshot.api, snapshot.queryClient);
      if (!user) {
        throw redirect({ to: guard.redirectTo ?? '/login' });
      }
      // Role check
      if (guard.roles?.length) {
        const userRoles = [...(user.roles ?? []), user.role].filter(Boolean);
        const hasRole = guard.roles.some(r => userRoles.includes(r));
        if (!hasRole) {
          throw redirect({ to: guard.redirectTo ?? '/' });
        }
      }
      // Policy check
      if (guard.policy) {
        const policies = compiledManifest.raw.policies ?? {};
        const expr = policies[guard.policy];
        if (expr && !evaluatePolicy(expr, { user })) {
          throw redirect({ to: guard.redirectTo ?? '/' });
        }
      }
    }
    if (guard.authenticated === false) {
      // Inverse: redirect authenticated users away (guest guard)
      const user = await fetchUser(snapshot.api, snapshot.queryClient);
      if (user) {
        throw redirect({ to: guard.redirectTo ?? '/' });
      }
    }
  };
}
```

The `fetchUser` function is the same cache-aware function from `loaders.ts:31-56`.

### G.3 SSR guard behavior

In SSR, the guard runs during server rendering. The `fetchUser` function reads auth from
the request context (cookies/headers) passed through the SSR bridge. The existing
`protectedBeforeLoad` already handles this via the `ApiClient` which forwards auth
headers in SSR mode.

---

<a id="h-phase-8-enterprise"></a>
## H. Phase 8 — i18n / Realtime / Observability Runtime Detail

### H.1 i18n runtime

**Current state:** `manifest.i18n` schema exists (from manifest-only spec, Phase D3-D4).
Translation refs use `{ "t": "key.path" }` syntax. Locale detection and persistence are
implemented.

**What Phase 8 adds:**

1. **`{i18n:key}` template syntax** inside string fields. The template resolver
   (`src/ui/expressions/template.ts`) recognizes `{i18n:auth.login.title}` and calls:
   ```ts
   function resolveI18nRef(key: string, locale: string, catalogs: I18nCatalogs): string {
     const catalog = catalogs[locale] ?? catalogs[defaultLocale];
     return catalog?.[key] ?? catalogs[defaultLocale]?.[key] ?? key;
   }
   ```

2. **Date/number formatting** via `Intl`:
   - `{date:fieldPath|format}` → `new Intl.DateTimeFormat(locale, options).format(value)`
   - `{number:fieldPath|style:currency|currency:USD}` → `new Intl.NumberFormat(locale, options).format(value)`
   - Formats: `short`, `medium`, `long`, `full` for dates; `decimal`, `percent`, `currency` for numbers

3. **RTL:** When locale is in `["ar", "he", "fa", "ur"]`, set `dir="rtl"` on `document.documentElement`.
   This is done in the same effect that handles locale switching.

### H.2 Realtime runtime

**Current state:** `manifest.realtime.ws` and `manifest.realtime.sse` schemas exist
(from manifest-only spec, Phase B5). WS/SSE event → workflow mapping exists
(Phase G1).

**What Phase 8 adds:** Nothing new — this is already implemented. Phase 8 just tests
it end-to-end with `budget-fe`.

### H.3 Observability runtime

**Current state:** `manifest.analytics` and `track` action exist (Phase H2). Push
notifications exist (Phase H3).

**What Phase 8 adds:**

1. **Audit logging via `log` action** (defined in E.7 above)
2. **Error reporting:** In `ComponentWrapper`'s error boundary `componentDidCatch`,
   if `manifest.observability.errors.sink` is configured, POST error data to the sink:
   ```ts
   componentDidCatch(error: Error, info: ErrorInfo) {
     const sink = this.props.manifest?.observability?.errors?.sink;
     if (sink) {
       void this.props.api.post(sink, {
         message: error.message,
         stack: error.stack,
         componentStack: info.componentStack,
         route: this.props.currentRoute,
         user: this.props.currentUser?.id,
         timestamp: new Date().toISOString(),
       });
     }
   }
   ```

---

<a id="i-compiler-pipeline"></a>
## I. Compiler Pipeline Insertion Points

### I.1 Current pipeline (from `compiler.ts:564-700`)

```
1. resolveManifestEnvRefs(manifest, env)        → resolves { env: "VAR" } refs
2. synthesizeAuthRoutes(manifest)               → creates default routes for auth screens
3. resolveThemeFlavors(manifest.theme)          → builds token system from flavor config
4. validatePolicyRefs(manifest)                 → ensure policy refs exist
5. validateCustomClients(manifest)              → ensure clients are registered
6. validateResourceClients(manifest)            → ensure resources reference defined clients
7. setDeclaredCustomActionSchemas(customs)       → register custom action schemas
8. validateWorkflowDefinitions(manifest)        → validate all workflows
9-11. validateWorkflowReferences(manifest)      → check auth/realtime handler refs
12. Build compiled routes                       → map routes to CompiledRoute[]
13. Build route map                             → routes keyed by path
14. Build auth config                           → apply session defaults
15. Return CompiledManifest
```

### I.2 Where to insert fragment merge

**After step 1, before step 2.** The fragment merge replaces step 2 entirely:

```
1. resolveManifestEnvRefs(manifest, env)
--- NEW: applyDefaultFragments(manifest) ---
   a. if auth declared && auth.screens has entries → buildAuthFragment(manifest)
   b. always → merge defaultFeedbackFragment
   c. mergeFragment(manifest, fragment) for each
--- DELETE step 2 (synthesizeAuthRoutes) ---
3. resolveThemeFlavors(manifest.theme)
... rest unchanged ...
```

The `synthesizeAuthRoutes` function at step 2 is the old auth-screen synthesis. It's replaced
by the fragment merge which does the same thing but using real manifest route definitions
instead of bespoke code.

### I.3 Fragment merge function location

**File:** `src/ui/manifest/merge.ts`

```ts
import type { ManifestConfig, RouteConfig } from "./schema";

export interface ManifestFragment {
  routes?: RouteConfig[];
  theme?: ManifestConfig["theme"];
  resources?: Record<string, unknown>;
  state?: Record<string, unknown>;
  i18n?: Record<string, Record<string, string>>;
  overlays?: Record<string, unknown>;
}

export function mergeFragment(
  base: ManifestConfig,
  fragment: ManifestFragment,
): ManifestConfig {
  const baseRouteIds = new Set((base.routes ?? []).map(r => r.id));

  return {
    ...base,
    routes: [
      ...(base.routes ?? []),
      // Only include fragment routes whose ids aren't already in the base
      ...(fragment.routes ?? []).filter(r => !baseRouteIds.has(r.id)),
    ],
    theme: deepMerge(fragment.theme, base.theme),
    resources: { ...(fragment.resources ?? {}), ...(base.resources ?? {}) },
    state: { ...(fragment.state ?? {}), ...(base.state ?? {}) },
    i18n: mergeI18n(fragment.i18n, base.i18n),
    overlays: { ...(fragment.overlays ?? {}), ...(base.overlays ?? {}) },
  };
}

function deepMerge<T extends Record<string, unknown>>(
  base: T | undefined,
  override: T | undefined,
): T | undefined {
  if (!base && !override) return undefined;
  if (!base) return override;
  if (!override) return base;
  const result = { ...base } as Record<string, unknown>;
  for (const [key, val] of Object.entries(override)) {
    if (val && typeof val === "object" && !Array.isArray(val) && result[key] && typeof result[key] === "object") {
      result[key] = deepMerge(result[key] as Record<string, unknown>, val as Record<string, unknown>);
    } else {
      result[key] = val;
    }
  }
  return result as T;
}

function mergeI18n(
  base: Record<string, Record<string, string>> | undefined,
  override: Record<string, Record<string, string>> | undefined,
): Record<string, Record<string, string>> | undefined {
  if (!base && !override) return undefined;
  if (!base) return override;
  if (!override) return base;
  const result: Record<string, Record<string, string>> = {};
  const locales = new Set([...Object.keys(base), ...Object.keys(override)]);
  for (const locale of locales) {
    result[locale] = { ...(base[locale] ?? {}), ...(override[locale] ?? {}) };
  }
  return result;
}
```

### I.4 `buildAuthFragment` — screen filtering

```ts
function buildAuthFragment(manifest: ManifestConfig): ManifestFragment {
  const screens = manifest.auth?.screens;
  if (!screens) return { routes: [] };

  // Filter default auth routes to only those requested
  const requestedScreens = typeof screens === "object" && !Array.isArray(screens)
    ? Object.entries(screens)
        .filter(([, mode]) => mode === "default")
        .map(([name]) => name)
    : screens; // backwards compat: array form means all are "default"

  return {
    routes: defaultAuthFragment.routes?.filter(r =>
      requestedScreens.includes(r.id)
    ),
    i18n: defaultAuthFragment.i18n,
  };
}
```

---

<a id="j-auto-form-extensions"></a>
## J. Auto-Form Schema Extensions

### J.1 Current field schema (from audit)

```ts
// src/ui/components/forms/auto-form/schema.ts:48-91
export const fieldConfigSchema = z.object({
  name: z.string(),
  type: z.enum(["text", "email", "password", "number", "textarea", "select", "checkbox", "date", "file"]),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  validation: fieldValidationSchema.optional(),
  options: z.union([z.array(fieldOptionSchema), dataSourceSchema]).optional(),
  labelField: z.string().optional(),
  valueField: z.string().optional(),
  default: z.unknown().optional(),
  disabled: z.boolean().optional(),
  helperText: z.string().optional(),
  span: z.number().int().min(1).max(12).optional(),
  dependsOn: dependsOnSchema.optional(),
  visible: z.boolean().optional(),
}).strict();
```

### J.2 Fields to add

Replace `.strict()` with a passthrough approach, or add these fields inside the object:

```ts
export const fieldConfigSchema = z.object({
  // --- existing fields (keep all) ---
  name: z.string(),
  type: z.enum(["text", "email", "password", "number", "textarea", "select",
                 "checkbox", "date", "file",
                 // NEW field types:
                 "time", "datetime", "radio-group", "switch", "slider",
                 "color", "combobox", "tag-input"]),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  validation: fieldValidationSchema.optional(),
  options: z.union([z.array(fieldOptionSchema), dataSourceSchema]).optional(),
  labelField: z.string().optional(),
  valueField: z.string().optional(),
  default: z.unknown().optional(),
  disabled: z.boolean().optional(),
  helperText: z.string().optional(),
  span: z.number().int().min(1).max(12).optional(),
  dependsOn: dependsOnSchema.optional(),
  visible: z.boolean().optional(),

  // --- NEW fields ---
  autoComplete: z.string().optional(),
  visibleWhen: z.string().optional(),
  inlineAction: z.object({
    label: z.string(),
    to: z.string(),
  }).strict().optional(),
  readOnly: z.boolean().optional(),
  description: z.string().optional(),
}).strict();
```

### J.3 Auto-form level additions

```ts
export const autoFormConfigSchema = extendComponentSchema({
  type: z.literal("auto-form"),
  // ... existing fields ...
  submitLoadingLabel: z.string().optional(),         // NEW: "Signing in..."
  autoSubmit: z.boolean().optional(),                // NEW: submit on mount
  autoSubmitWhen: z.string().optional(),             // NEW: expression that triggers auto-submit
  layout: z.enum(["vertical", "horizontal", "grid"]).default("vertical"),  // NEW
}).strict();
```

### J.4 Password field visibility toggle

In the auto-form component (`component.tsx`), when rendering a field with `type: "password"`:

```tsx
function PasswordField({ field, value, onChange }: FieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <BaseTextField
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={field.autoComplete ?? "current-password"}
        // ... other props
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Hide password" : "Show password"}
        style={{
          position: "absolute",
          right: "var(--sn-spacing-sm)",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--sn-color-muted-foreground)",
          padding: "var(--sn-spacing-xs)",
        }}
      >
        <Icon name={visible ? "EyeOff" : "Eye"} size={16} />
      </button>
    </div>
  );
}
```

This is built into the password field rendering — **no manifest opt-in needed**. Every
password field gets the toggle automatically.

### J.5 `inlineAction` rendering

When a field has `inlineAction`, render the label row as:

```tsx
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
  <label>{field.label}</label>
  <button
    type="button"
    onClick={() => executeAction({ type: "navigate", to: field.inlineAction.to })}
    style={{
      background: "none", border: "none", cursor: "pointer",
      color: "var(--sn-color-primary)",
      fontSize: "var(--sn-font-size-xs)",
    }}
  >
    {field.inlineAction.label}
  </button>
</div>
```

---

<a id="k-expression-parser"></a>
## K. Expression Language Parser

### K.1 Grammar (formal)

```ebnf
Expression  ::= OrExpr
OrExpr      ::= AndExpr ( "||" AndExpr )*
AndExpr     ::= NotExpr ( "&&" NotExpr )*
NotExpr     ::= "!" NotExpr | CompareExpr
CompareExpr ::= Primary ( ( "==" | "!=" | ">" | "<" | ">=" | "<=" ) Primary )?
Primary     ::= FnCall | Ref | Literal | "(" Expression ")"
FnCall      ::= ( "defined" | "empty" | "length" ) "(" Ref ")"
Ref         ::= Segment ( "." Segment | "[" (Number | String) "]" )*
Segment     ::= Identifier
Literal     ::= String | Number | Boolean | Null
String      ::= "'" [^']* "'" | '"' [^"]* '"'
Number      ::= [0-9]+ ("." [0-9]+)?
Boolean     ::= "true" | "false"
Null        ::= "null"
Identifier  ::= [a-zA-Z_$] [a-zA-Z0-9_$-]*
```

### K.2 Semantics

- **`defined(ref)`** — returns true if `resolveRef(ref)` is not `undefined` and not `null`
- **`empty(ref)`** — returns true if value is `undefined`, `null`, `""`, `[]`, or `{}`
- **`length(ref)`** — returns the `.length` property of the resolved value (0 if undefined)
- **Comparison** — `==` and `!=` use loose equality for strings/numbers; `>`, `<`, `>=`, `<=` coerce to numbers
- **Refs** — resolved via the same `resolveFromRef` function used everywhere else. Scopes: `auth.*`, `app.*`, `route.*`, `global.*`, component ids.

### K.3 Implementation sketch

```ts
// src/ui/expressions/parser.ts
export function evaluateExpression(
  expr: string,
  context: ExpressionContext,
): boolean {
  const tokens = tokenize(expr);
  const ast = parseOrExpr(tokens);
  return evaluate(ast, context);
}
```

Tokenizer: ~60 lines (regex-based, handles identifiers, operators, parens, strings, numbers).
Parser: ~100 lines (recursive descent, one function per grammar rule).
Evaluator: ~40 lines (switch on AST node type).
Total: ~200 lines. Exhaustively tested with:

```ts
// True cases
evaluateExpression("defined(auth.providers)", ctx)              // providers exist
evaluateExpression("empty(route.query.token)", ctx)             // no token param
evaluateExpression("global.user.role == 'admin'", ctx)          // role check
evaluateExpression("length(items) > 0", ctx)                    // array has items
evaluateExpression("defined(auth.passkey) && !empty(global.user)", ctx)  // compound

// False cases
evaluateExpression("defined(nonexistent.path)", ctx)            // undefined ref
evaluateExpression("1 > 2", ctx)                                // math
```

### K.4 Where it's used

- `visibleWhen` on every component (checked in `ComponentWrapper` before rendering)
- `visibleWhen` on form fields (checked in auto-form field loop)
- `when` on workflow steps (checked in workflow engine)
- `autoSubmitWhen` on auto-form (checked in useEffect)

---

<a id="l-i18n-catalog"></a>
## L. Default i18n Catalog (English)

```ts
// src/ui/manifest/defaults/i18n-en.ts
export const defaultEnglishCatalog: Record<string, string> = {
  // Auth screen titles
  "auth.login.title": "Sign in",
  "auth.login.description": "Sign in to continue.",
  "auth.register.title": "Create account",
  "auth.register.description": "Create your account to get started.",
  "auth.forgot_password.title": "Forgot password",
  "auth.forgot_password.description": "Enter your email and we'll send a reset link.",
  "auth.reset_password.title": "Reset password",
  "auth.reset_password.description": "Choose a new password for your account.",
  "auth.verify_email.title": "Verify email",
  "auth.verify_email.description": "Confirm your email address to finish setup.",
  "auth.mfa.title": "Two-factor verification",
  "auth.mfa.description": "Enter the verification code from your authentication method.",
  "auth.sso_callback.title": "Signing in...",
  "auth.sso_callback.message": "Completing sign-in, please wait.",

  // Auth field labels
  "auth.field.email.label": "Email",
  "auth.field.email.placeholder": "you@example.com",
  "auth.field.password.label": "Password",
  "auth.field.password.placeholder": "Enter your password",
  "auth.field.password.placeholder.register": "Create a password",
  "auth.field.password.label.reset": "New password",
  "auth.field.password.placeholder.reset": "Create a new password",
  "auth.field.name.label": "Name",
  "auth.field.name.placeholder": "Your name",
  "auth.field.code.label": "Verification code",
  "auth.field.code.placeholder": "Enter the code",
  "auth.field.method.label": "Method",

  // Auth action labels
  "auth.action.sign_in": "Sign in",
  "auth.action.sign_in.loading": "Signing in...",
  "auth.action.create_account": "Create account",
  "auth.action.create_account.loading": "Creating account...",
  "auth.action.send_reset_link": "Send reset link",
  "auth.action.send_reset_link.loading": "Sending reset link...",
  "auth.action.reset_password": "Reset password",
  "auth.action.reset_password.loading": "Resetting password...",
  "auth.action.resend_verification": "Resend verification email",
  "auth.action.resend_verification.loading": "Sending verification...",
  "auth.action.verify": "Verify",
  "auth.action.verify.loading": "Verifying...",

  // Auth links
  "auth.link.create_account": "Don't have an account? Sign up",
  "auth.link.sign_in": "Already have an account? Sign in",
  "auth.link.forgot_password": "Forgot?",
  "auth.link.back_to_sign_in": "Back to sign in",
  "auth.link.continue_to_sign_in": "Continue to sign in",

  // Auth auxiliary labels
  "auth.label.providers_heading": "Continue with a provider",
  "auth.label.passkey_button": "Sign in with passkey",
  "auth.label.resend": "Resend code",

  // Auth messages
  "auth.message.forgot_password_sent": "If that email is registered, you will receive a reset link shortly.",
  "auth.message.password_reset": "Your password has been reset.",
  "auth.message.email_verified": "Your email has been verified.",
  "auth.message.verification_sent": "Verification email sent.",
  "auth.message.code_resent": "A new verification code has been sent.",

  // Auth errors
  "auth.error.reset_link_missing_token": "This reset link is missing a token.",
  "auth.error.verify_link_missing_token": "This verification link is missing a token.",
  "auth.error.no_active_challenge": "There is no active verification challenge.",

  // Common
  "common.or": "or",

  // Feedback
  "feedback.notFound.title": "Page not found",
  "feedback.notFound.message": "The page you're looking for doesn't exist.",
  "feedback.notFound.home": "Go home",
  "feedback.error.title": "Something went wrong",
  "feedback.error.message": "An unexpected error occurred.",
  "feedback.error.retry": "Try again",
  "feedback.offline.title": "You're offline",
  "feedback.offline.message": "Check your connection and try again.",
};
```

---

## M. auth.screens Schema Migration

### M.1 Current schema

```ts
// src/ui/manifest/schema.ts:943
screens: z.array(authScreenNameSchema).min(1)
```

Where `authScreenNameSchema` is an enum of `"login" | "register" | "forgot-password" |
"reset-password" | "verify-email" | "mfa"`.

### M.2 New schema

```ts
const authScreenModeSchema = z.union([
  z.literal("default"),  // use framework default fragment
  z.literal(false),      // do not create this route
]);

const authScreensSchema = z.union([
  // New object form (preferred):
  z.record(
    z.enum(["login", "register", "forgot-password", "reset-password",
            "verify-email", "mfa", "sso-callback"]),
    authScreenModeSchema,
  ),
  // Legacy array form (backwards compat — treat all as "default"):
  z.array(authScreenNameSchema),
]).optional();  // no longer .min(1)
```

In the fragment builder, normalize the legacy array form:
```ts
function normalizeAuthScreens(
  screens: string[] | Record<string, "default" | false> | undefined,
): Record<string, "default" | false> {
  if (!screens) return {};
  if (Array.isArray(screens)) {
    return Object.fromEntries(screens.map(s => [s, "default" as const]));
  }
  return screens;
}
```

---

## N. Summary: Every Gap Closed

| Gap from review | Where addressed |
|---|---|
| All 7 auth screen content arrays | Appendix B (B.1–B.7) |
| stack, heading, text, link, divider, oauth-buttons schemas | Appendix D (D.1–D.8) |
| New action handler config + behavior | Appendix E (E.1–E.7) |
| Data binding migration per component | Appendix F — mostly already done; F.2 is the audit |
| Guard implementation detail | Appendix G (G.1–G.3) |
| compileManifest insertion point | Appendix I (I.1–I.4) |
| auto-form schema extensions | Appendix J (J.1–J.5) |
| Expression parser detail | Appendix K (K.1–K.4) |
| Nav icon fix | Appendix A.1 |
| Nav active-state wiring | Appendix A.2 |
| Nav defaults (logo from app.title) | Appendix A.3 |
| Token synchronous injection | Appendix A.4 |
| i18n runtime detail | Appendix H.1 |
| Realtime runtime detail | Appendix H.2 (already done) |
| Observability runtime detail | Appendix H.3 |
| Default i18n catalog | Appendix L |
| auth.screens schema migration | Appendix M |

---

## O. Changelog

- **v1 (2026-04-10)** — Initial implementation appendix. All gaps from zero-context review addressed.
