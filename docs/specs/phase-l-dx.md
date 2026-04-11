# Phase L: Developer Experience — Canonical Spec

> **Status**
>
> | Phase | Title | Status | Track |
> |---|---|---|---|
> | L.1 | Manifest Hot Reload — HMR for manifest changes | Not started | Vite |
> | L.2 | Validation Error Overlay — browser overlay for manifest errors | Not started | Vite |
> | L.3 | Component Inspector — Alt+click dev mode inspector | Not started | Runtime |
> | L.4 | CLI Scaffolding — `snapshot add-page`, `snapshot add-resource`, `snapshot preview` | Not started | CLI |
> | L.5 | JSON Schema for IDE — autocomplete + inline docs | Not started | Schema |
>
> **Priority:** P2 — improves developer velocity, not blocking features.
> **Depends on:** Phase A (CSS Foundation), Phase I (Presets — for `add-page` scaffolding).
> **Blocks:** Nothing.

---

## Vision

### Before (Today)

Developing with Snapshot requires:

1. **Full page refresh on manifest change.** The `snapshotApp()` Vite plugin serves the
   manifest as a JSON import. Changing the manifest file triggers a full page reload via
   Vite's default file watcher — the entire React tree unmounts and remounts, losing all
   client state (form inputs, scroll position, modal state).
2. **Silent manifest errors.** Invalid manifest JSON fails silently at parse time with a
   console error. The app shows a blank screen or partial render. The developer must check
   the browser console, find the Zod error, and manually trace the field path.
3. **No component inspection.** Understanding what config produced a visible component
   requires reading the manifest JSON and mentally tracing the component tree.
4. **Limited CLI.** `snapshot init` and `snapshot sync` exist. There is no `snapshot add-page`,
   `snapshot add-resource`, `snapshot validate` (exists as `snapshot manifest validate`),
   or `snapshot preview`.
5. **No IDE support for manifest JSON.** Writing `snapshot.manifest.json` is unassisted —
   no autocomplete, no inline docs, no error highlighting. Developers must reference
   documentation.

### After (This Spec)

1. Manifest changes trigger HMR — the React tree updates without losing state.
2. Invalid manifest shows a browser overlay with field path, expected type, and docs link.
3. Alt+click on any component shows an inspector panel with config, data, and actions.
4. CLI provides `snapshot add-page`, `snapshot add-resource`, `snapshot validate`,
   `snapshot preview`.
5. Published JSON Schema for `snapshot.manifest.json` enables IDE autocomplete.

---

## What Already Exists on Main

### Vite Plugin (WORKS — no manifest HMR)

| File | Lines | What Exists |
|---|---|---|
| `src/vite/index.ts` | 995 | `snapshotApp()` plugin: virtual entry imports manifest as JSON module. Vite's default behavior for `.json` changes is full page reload. No `handleHotUpdate` hook. |
| `src/vite/index.ts:141-164` | 24 | `configureServer()` middleware: serves HTML shell for `/` and `/index.html`. No error overlay middleware. |

### CLI (PARTIAL)

| File | What Exists |
|---|---|
| `src/cli/commands/init.ts` | `snapshot init` — scaffolds new project. |
| `src/cli/commands/sync.ts` | `snapshot sync` — generates typed API client from OpenAPI. |
| `src/cli/commands/manifest/init.ts` | `snapshot manifest init` — generates starter manifest. |
| `src/cli/commands/manifest/validate.ts` | `snapshot manifest validate` — validates manifest against schema. Reports Zod errors with field paths. |
| `src/cli/commands/dev.ts` | `snapshot dev` — starts Vite dev server. |
| `src/cli/commands/build.ts` | `snapshot build` — production build. |
| `src/cli/commands/preview.ts` | `snapshot preview` — serves production build. |

**Missing:** `snapshot add-page`, `snapshot add-resource`.

### Manifest Schema (Zod only — no JSON Schema)

| File | What Exists |
|---|---|
| `src/ui/manifest/schema.ts` | All schemas defined in Zod. No JSON Schema export. |

### ManifestApp (NO inspector)

| File | What Exists |
|---|---|
| `src/ui/manifest/app.tsx` | No dev mode inspector. No Alt+click handler. |
| `src/ui/components/_base/component-wrapper.tsx` | Adds `data-snapshot-component={type}` attribute. This is the hook for inspector targeting. |

---

## Developer Context

### Build & Test Commands

```sh
cd /c/Users/email/projects/snapshot
bun run typecheck        # tsc --noEmit
bun run format:check     # Prettier
bun run build            # tsup + oclif manifest
bun test                 # vitest
```

### Key Files

| Path | What | Lines |
|---|---|---|
| `src/vite/index.ts` | Vite plugin | 995 |
| `src/cli/commands/init.ts` | CLI init command | ~100 |
| `src/cli/commands/manifest/validate.ts` | CLI validate command | 80 |
| `src/cli/index.ts` | CLI entry point | ~20 |
| `src/ui/manifest/schema.ts` | All Zod schemas | ~1400 |
| `src/ui/manifest/app.tsx` | ManifestApp | 1764 |
| `src/ui/manifest/compiler.ts` | compileManifest() | ~600 |
| `src/ui/components/_base/component-wrapper.tsx` | ComponentWrapper | 181 |

---

## Non-Negotiable Engineering Constraints

1. **No `any`** — strict types on all new code.
2. **CLI templates are pure functions** — no filesystem side effects in template code.
3. **SSR safe** — inspector only activates in browser with `useEffect`.
4. **Manifest-only architecture** — DX tools work with the manifest, not around it.
5. **Tests mandatory** — CLI commands tested, Vite plugin hooks tested.
6. **No new peer dependencies** — inspector uses native DOM APIs.

---

## Phase L.1: Manifest Hot Reload — HMR for Manifest Changes

### Goal

When the manifest file changes during development, send an HMR update that re-compiles
and re-renders the manifest without a full page refresh. Client state (forms, modals,
scroll position) is preserved.

### Implementation

**1. Update `src/vite/index.ts` — `snapshotApp()` plugin:**

Add `handleHotUpdate` hook to intercept manifest file changes:

```ts
export function snapshotApp(opts: SnapshotAppOptions = {}): Plugin {
  const manifestFile = opts.manifestFile ?? "snapshot.manifest.json";
  const manifestUrl = normalizeManifestUrl(manifestFile);

  return {
    name: "snapshot-app",
    enforce: "pre",

    // ... existing config, resolveId, load, configureServer ...

    handleHotUpdate({ file, server }) {
      // Check if the changed file is the manifest
      const manifestPath = path.resolve(server.config.root, manifestFile);
      if (file !== manifestPath) return;

      // Send custom HMR event with the updated manifest
      server.ws.send({
        type: "custom",
        event: "snapshot:manifest-update",
        data: { file: manifestUrl, timestamp: Date.now() },
      });

      // Prevent Vite's default full reload for this file
      return [];
    },
  };
}
```

**2. Update virtual entry module:**

Inject HMR acceptance code into the virtual entry:

```ts
// In the load() hook for RESOLVED_VIRTUAL_APP_ENTRY_ID:
return `
import "${VIRTUAL_GLOBALS_ID}";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { ManifestApp } from "@lastshotlabs/snapshot/ui";
import manifest from ${JSON.stringify(manifestUrl)};

const apiUrl = ${apiUrlExpression};
const root = document.getElementById("root");
if (!root) throw new Error("Snapshot app shell is missing #root");

let currentRoot;

function render(m) {
  if (!currentRoot) {
    currentRoot = createRoot(root);
  }
  currentRoot.render(
    createElement(ManifestApp, { manifest: m, apiUrl }),
  );
}

render(manifest);

// HMR: re-render with updated manifest without unmounting
if (import.meta.hot) {
  import.meta.hot.on("snapshot:manifest-update", async (data) => {
    try {
      // Re-import the manifest module to get updated content
      const mod = await import(/* @vite-ignore */ data.file + "?t=" + data.timestamp);
      render(mod.default);
      console.log("[snapshot] Manifest hot-reloaded");
    } catch (e) {
      console.error("[snapshot] Manifest hot reload failed:", e);
      // Fall back to full reload
      import.meta.hot.invalidate();
    }
  });
}
`;
```

**3. Update `ManifestApp` to support manifest prop changes:**

`ManifestApp` must re-compile when the manifest prop changes. Add a `useEffect` or
`useMemo` that watches the manifest prop:

```tsx
// In ManifestApp:
const compiled = useMemo(() => {
  return compileManifest(props.manifest);
}, [props.manifest]);
```

If `ManifestApp` already does this (it should since it takes manifest as a prop), no
change needed. Verify.

### Files to Create/Modify

| Action | Path |
|---|---|
| Modify | `src/vite/index.ts` — add `handleHotUpdate` to `snapshotApp()`, update virtual entry with HMR code |

### Tests

| File | What |
|---|---|
| `src/vite/__tests__/plugin.test.ts` | Add tests: `handleHotUpdate` returns empty array for manifest file, returns undefined for non-manifest files, sends custom HMR event. |

### Exit Criteria

- [ ] Editing `snapshot.manifest.json` during `snapshot dev` does not cause full page reload.
- [ ] Updated manifest content is reflected in the browser immediately.
- [ ] Form inputs and other client state are preserved across manifest updates.
- [ ] Non-manifest file changes still trigger normal Vite HMR.
- [ ] Invalid manifest during hot reload logs error and falls back to full reload.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase L.2: Validation Error Overlay — Browser Overlay for Manifest Errors

### Goal

When the manifest is invalid (Zod parse fails), show a styled browser overlay similar to
Vite's error overlay. The overlay shows the field path, expected type, received value, and
a link to docs.

### Implementation

**1. Create `src/ui/manifest/error-overlay.tsx`:**

```tsx
'use client';

import React from "react";

interface ManifestError {
  path: string;
  message: string;
  expected?: string;
  received?: string;
}

interface ErrorOverlayProps {
  errors: ManifestError[];
  manifestFile?: string;
}

/**
 * Development-only error overlay for manifest validation failures.
 * Styled to match Vite's error overlay appearance.
 */
export function ManifestErrorOverlay({ errors, manifestFile }: ErrorOverlayProps) {
  return (
    <div
      data-snapshot-error-overlay=""
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        color: "#e8e8e8",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: "14px",
        overflow: "auto",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}>
          <span style={{
            backgroundColor: "#ff5555",
            color: "#fff",
            padding: "0.25rem 0.75rem",
            borderRadius: "4px",
            fontWeight: 700,
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            Manifest Error
          </span>
          <span style={{ color: "#888" }}>
            {manifestFile ?? "snapshot.manifest.json"}
          </span>
        </div>

        <div style={{ color: "#ff8888", fontSize: "16px", marginBottom: "1rem" }}>
          {errors.length} validation error{errors.length > 1 ? "s" : ""} in manifest
        </div>

        {errors.map((error, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "rgba(255, 85, 85, 0.1)",
              border: "1px solid rgba(255, 85, 85, 0.3)",
              borderRadius: "6px",
              padding: "1rem",
              marginBottom: "0.75rem",
            }}
          >
            <div style={{ color: "#ffaa88", marginBottom: "0.5rem", fontWeight: 600 }}>
              {error.path || "(root)"}
            </div>
            <div style={{ color: "#e8e8e8", marginBottom: "0.25rem" }}>
              {error.message}
            </div>
            {error.expected && (
              <div style={{ color: "#88cc88", fontSize: "12px" }}>
                Expected: {error.expected}
              </div>
            )}
            {error.received && (
              <div style={{ color: "#ff8888", fontSize: "12px" }}>
                Received: {error.received}
              </div>
            )}
          </div>
        ))}

        <div style={{ marginTop: "1.5rem", color: "#888", fontSize: "12px" }}>
          <a
            href="https://docs.lastshotlabs.com/snapshot/manifest"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#88aaff", textDecoration: "underline" }}
          >
            Manifest documentation
          </a>
          {" | "}
          <button
            type="button"
            onClick={() => {
              const overlay = document.querySelector("[data-snapshot-error-overlay]");
              if (overlay) overlay.remove();
            }}
            style={{
              background: "none",
              border: "none",
              color: "#88aaff",
              cursor: "pointer",
              textDecoration: "underline",
              font: "inherit",
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
```

**2. Update `src/ui/manifest/app.tsx`:**

Catch Zod errors during `compileManifest()` and render the overlay in dev mode:

```tsx
import { ManifestErrorOverlay } from "./error-overlay";
import { ZodError } from "zod";

function ManifestApp({ manifest, apiUrl }: ManifestAppProps) {
  const [compileResult, setCompileResult] = useState<{
    compiled?: CompiledManifest;
    errors?: Array<{ path: string; message: string; expected?: string; received?: string }>;
  }>(() => {
    try {
      return { compiled: compileManifest(manifest) };
    } catch (e) {
      if (e instanceof ZodError) {
        return {
          errors: e.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
            expected: "expected" in issue ? String(issue.expected) : undefined,
            received: "received" in issue ? String(issue.received) : undefined,
          })),
        };
      }
      throw e;
    }
  });

  // Re-compile on manifest prop change (HMR)
  useEffect(() => {
    try {
      setCompileResult({ compiled: compileManifest(manifest) });
    } catch (e) {
      if (e instanceof ZodError) {
        setCompileResult({
          errors: e.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
    }
  }, [manifest]);

  if (compileResult.errors && import.meta.env?.DEV) {
    return <ManifestErrorOverlay errors={compileResult.errors} />;
  }

  // ... normal render with compileResult.compiled ...
}
```

**3. Update HMR handler in virtual entry:**

When manifest hot-reload fails validation, the error overlay will show automatically
because `ManifestApp` catches the `ZodError`.

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/manifest/error-overlay.tsx` |
| Modify | `src/ui/manifest/app.tsx` — catch compile errors, render overlay in dev mode |

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/error-overlay.test.tsx` (create) | Tests: renders error count, renders field paths, renders expected/received, dismiss button removes overlay, docs link present. |

### Exit Criteria

- [ ] Invalid manifest in dev mode shows styled error overlay, not blank screen.
- [ ] Overlay shows field path (e.g., `routes.0.content.0.type`), error message, expected
      type, and received value.
- [ ] Overlay has dismiss button that removes it.
- [ ] Overlay has docs link.
- [ ] Fixing the manifest and saving hot-reloads correctly (overlay disappears).
- [ ] Production builds do not include overlay code (`import.meta.env.DEV` guard).
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase L.3: Component Inspector — Alt+Click Dev Mode Inspector

### Goal

In development mode, Alt+click on any rendered component shows an inspector panel with:
the component's config object, its data (from `useComponentData`), its `from-ref` bindings,
and its available actions.

### Implementation

**1. Create `src/ui/manifest/inspector.tsx`:**

```tsx
'use client';

import React, { useState, useEffect, useCallback } from "react";

interface InspectorData {
  type: string;
  id?: string;
  config: Record<string, unknown>;
  element: HTMLElement;
}

/**
 * Dev-mode component inspector.
 * Alt+click on any [data-snapshot-component] element opens an inspector panel.
 */
export function ComponentInspector() {
  const [inspected, setInspected] = useState<InspectorData | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleAltClick = useCallback((e: MouseEvent) => {
    if (!e.altKey) return;

    // Find closest snapshot component
    const target = e.target as HTMLElement;
    const componentEl = target.closest("[data-snapshot-component]") as HTMLElement | null;
    if (!componentEl) return;

    e.preventDefault();
    e.stopPropagation();

    const type = componentEl.getAttribute("data-snapshot-component") ?? "unknown";
    const id = componentEl.getAttribute("data-snapshot-id") ?? undefined;

    // Read config from data attribute (stored as JSON)
    let config: Record<string, unknown> = {};
    const configAttr = componentEl.getAttribute("data-snapshot-config");
    if (configAttr) {
      try {
        config = JSON.parse(configAttr);
      } catch {
        config = { _raw: configAttr };
      }
    }

    setInspected({ type, id, config, element: componentEl });
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleAltClick, true);
    return () => document.removeEventListener("click", handleAltClick, true);
  }, [handleAltClick]);

  // Highlight the inspected element
  useEffect(() => {
    if (!inspected) return;
    const el = inspected.element;
    const originalOutline = el.style.outline;
    el.style.outline = "2px solid var(--sn-color-primary, #2563eb)";
    el.style.outlineOffset = "2px";
    return () => {
      el.style.outline = originalOutline;
      el.style.outlineOffset = "";
    };
  }, [inspected]);

  if (!inspected) return null;

  return (
    <div
      data-snapshot-inspector=""
      style={{
        position: "fixed",
        top: Math.min(position.y, window.innerHeight - 400),
        left: Math.min(position.x + 16, window.innerWidth - 420),
        width: "400px",
        maxHeight: "380px",
        overflow: "auto",
        backgroundColor: "var(--sn-color-surface, #fff)",
        border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-lg, 0.5rem)",
        boxShadow: "var(--sn-shadow-xl, 0 20px 25px -5px rgba(0,0,0,.1))",
        zIndex: 99998,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: "12px",
        color: "var(--sn-color-foreground, #111)",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.5rem 0.75rem",
        borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        backgroundColor: "var(--sn-color-muted, #f9fafb)",
      }}>
        <div>
          <span style={{
            backgroundColor: "var(--sn-color-primary, #2563eb)",
            color: "var(--sn-color-primary-foreground, #fff)",
            padding: "0.125rem 0.5rem",
            borderRadius: "var(--sn-radius-sm, 0.25rem)",
            fontSize: "11px",
            fontWeight: 600,
          }}>
            {inspected.type}
          </span>
          {inspected.id && (
            <span style={{ marginLeft: "0.5rem", color: "var(--sn-color-muted-foreground, #6b7280)" }}>
              #{inspected.id}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setInspected(null)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            fontSize: "16px",
            lineHeight: 1,
            padding: "0.125rem",
          }}
          aria-label="Close inspector"
        >
          {"\u00D7"}
        </button>
      </div>

      {/* Config */}
      <div style={{ padding: "0.75rem" }}>
        <div style={{
          fontWeight: 600,
          marginBottom: "0.25rem",
          color: "var(--sn-color-muted-foreground, #6b7280)",
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>
          Config
        </div>
        <pre style={{
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: "11px",
          lineHeight: 1.5,
          color: "var(--sn-color-foreground, #111)",
          backgroundColor: "var(--sn-color-muted, #f9fafb)",
          padding: "0.5rem",
          borderRadius: "var(--sn-radius-sm, 0.25rem)",
          maxHeight: "250px",
          overflow: "auto",
        }}>
          {JSON.stringify(inspected.config, null, 2)}
        </pre>
      </div>
    </div>
  );
}
```

**2. Store config on component wrapper:**

Update `src/ui/components/_base/component-wrapper.tsx` to store the config as a data
attribute in dev mode:

```tsx
// In ComponentWrapper:
const devAttrs = import.meta.env?.DEV
  ? {
      "data-snapshot-config": JSON.stringify(config),
      "data-snapshot-id": config.id,
    }
  : {};

return (
  <div
    data-snapshot-component={config.type}
    {...devAttrs}
    // ... existing props ...
  >
    {children}
  </div>
);
```

**3. Mount inspector in ManifestApp (dev only):**

```tsx
import { ComponentInspector } from "./inspector";

// In ManifestApp render, after the router:
{import.meta.env?.DEV && <ComponentInspector />}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/manifest/inspector.tsx` |
| Modify | `src/ui/components/_base/component-wrapper.tsx` — store config as data attribute in dev |
| Modify | `src/ui/manifest/app.tsx` — mount ComponentInspector in dev mode |

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/inspector.test.tsx` (create) | Tests: Alt+click on component element opens inspector, inspector shows component type and id, inspector shows config JSON, close button hides inspector, non-Alt click does not open. |

### Exit Criteria

- [ ] Alt+click on any component in dev mode opens the inspector panel.
- [ ] Inspector shows component type, id, and full config object.
- [ ] Inspected component gets a visual outline highlight.
- [ ] Clicking close or Alt+clicking another component dismisses/replaces.
- [ ] Regular clicks (without Alt) are not intercepted.
- [ ] Inspector does not render in production builds.
- [ ] Config data attribute is not rendered in production.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.

---

## Phase L.4: CLI Scaffolding — `add-page`, `add-resource`, `validate`, `preview`

### Goal

Add CLI commands for common development tasks:
- `snapshot add-page` — add a page definition to the manifest.
- `snapshot add-resource` — add a resource (API endpoint group) to the manifest.
- `snapshot validate` — alias for `snapshot manifest validate` (already exists).
- `snapshot preview` — already exists in `src/cli/commands/preview.ts`.

### Implementation

**1. Create `src/cli/commands/add-page.ts`:**

```ts
import { Command, Flags } from "@oclif/core";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { intro, log, outro, text, select, confirm } from "@clack/prompts";

export default class AddPage extends Command {
  static override description = "Add a new page to the snapshot manifest";
  static override examples = [
    "<%= config.bin %> add-page",
    "<%= config.bin %> add-page --preset crud --path /users --title Users",
  ];
  static override flags = {
    path: Flags.string({ description: "Route path (e.g. /users)" }),
    title: Flags.string({ description: "Page title" }),
    preset: Flags.string({
      description: "Page preset (crud, dashboard, settings, auth)",
      options: ["crud", "dashboard", "settings", "auth", "blank"],
    }),
    manifest: Flags.string({
      description: "Path to manifest file",
      default: "snapshot.manifest.json",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AddPage);
    const manifestPath = path.resolve(process.cwd(), flags.manifest);

    intro("@lastshotlabs/snapshot add-page");

    // Read existing manifest
    if (!fs.existsSync(manifestPath)) {
      log.error(`Manifest not found: ${flags.manifest}. Run 'snapshot init' first.`);
      outro("Aborted.");
      this.exit(1);
      return;
    }

    const manifestRaw = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

    // Prompt for missing values
    const routePath = flags.path ?? await text({
      message: "Route path:",
      placeholder: "/users",
      validate: (value) => {
        if (!value.startsWith("/")) return "Path must start with /";
        return undefined;
      },
    });
    if (typeof routePath === "symbol") { this.exit(0); return; }

    const title = flags.title ?? await text({
      message: "Page title:",
      placeholder: "Users",
    });
    if (typeof title === "symbol") { this.exit(0); return; }

    const preset = flags.preset ?? await select({
      message: "Page preset:",
      options: [
        { label: "CRUD — Table with create/edit/delete", value: "crud" },
        { label: "Dashboard — Stats, charts, activity feed", value: "dashboard" },
        { label: "Settings — Tabbed forms", value: "settings" },
        { label: "Auth — Login/register screen", value: "auth" },
        { label: "Blank — Empty page", value: "blank" },
      ],
    });
    if (typeof preset === "symbol") { this.exit(0); return; }

    // Build route config
    const route: Record<string, unknown> = {
      path: routePath,
    };

    if (preset === "blank") {
      route.title = title;
      route.content = [
        { type: "heading", text: title, level: 1 },
      ];
    } else {
      route.preset = preset;
      route.presetConfig = buildPresetConfig(preset as string, title as string);
    }

    // Add to manifest
    if (!manifestRaw.routes) {
      manifestRaw.routes = [];
    }

    // Check for duplicate path
    const existing = manifestRaw.routes.find((r: any) => r.path === routePath);
    if (existing) {
      const overwrite = await confirm({
        message: `Route "${routePath}" already exists. Overwrite?`,
      });
      if (!overwrite || typeof overwrite === "symbol") {
        outro("Aborted.");
        this.exit(0);
        return;
      }
      const idx = manifestRaw.routes.indexOf(existing);
      manifestRaw.routes[idx] = route;
    } else {
      manifestRaw.routes.push(route);
    }

    // Write manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifestRaw, null, 2) + "\n");

    log.success(`Added page "${title}" at ${routePath}`);

    // Add nav item
    const addNav = await confirm({
      message: "Add to navigation?",
    });
    if (addNav === true) {
      if (!manifestRaw.navigation) {
        manifestRaw.navigation = { items: [] };
      }
      if (!manifestRaw.navigation.items) {
        manifestRaw.navigation.items = [];
      }
      manifestRaw.navigation.items.push({
        label: title,
        path: routePath,
      });
      fs.writeFileSync(manifestPath, JSON.stringify(manifestRaw, null, 2) + "\n");
      log.success(`Added "${title}" to navigation`);
    }

    outro("Done!");
  }
}

function buildPresetConfig(preset: string, title: string): Record<string, unknown> {
  switch (preset) {
    case "crud":
      return {
        title,
        listEndpoint: `GET /api/${title.toLowerCase().replace(/\s+/g, "-")}`,
        columns: [
          { key: "name", label: "Name" },
          { key: "createdAt", label: "Created", format: "date" },
        ],
      };
    case "dashboard":
      return {
        title,
        stats: [
          { label: "Total", endpoint: "GET /api/stats/total", valueKey: "count", format: "number" },
        ],
      };
    case "settings":
      return {
        title,
        sections: [
          {
            label: "General",
            submitEndpoint: "PATCH /api/settings",
            fields: [
              { key: "name", type: "text", label: "Name", required: true },
            ],
          },
        ],
      };
    case "auth":
      return {
        screen: "login",
      };
    default:
      return { title };
  }
}
```

**2. Create `src/cli/commands/add-resource.ts`:**

```ts
import { Command, Flags } from "@oclif/core";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { intro, log, outro, text, multiselect } from "@clack/prompts";

export default class AddResource extends Command {
  static override description = "Add a resource (API endpoint group) to the manifest";
  static override examples = [
    "<%= config.bin %> add-resource",
    "<%= config.bin %> add-resource --name users --base /api/users",
  ];
  static override flags = {
    name: Flags.string({ description: "Resource name (e.g. users)" }),
    base: Flags.string({ description: "Base API path (e.g. /api/users)" }),
    manifest: Flags.string({
      description: "Path to manifest file",
      default: "snapshot.manifest.json",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AddResource);
    const manifestPath = path.resolve(process.cwd(), flags.manifest);

    intro("@lastshotlabs/snapshot add-resource");

    if (!fs.existsSync(manifestPath)) {
      log.error(`Manifest not found: ${flags.manifest}. Run 'snapshot init' first.`);
      outro("Aborted.");
      this.exit(1);
      return;
    }

    const manifestRaw = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

    const name = flags.name ?? await text({
      message: "Resource name:",
      placeholder: "users",
      validate: (v) => v.length === 0 ? "Required" : undefined,
    });
    if (typeof name === "symbol") { this.exit(0); return; }

    const base = flags.base ?? await text({
      message: "Base API path:",
      placeholder: `/api/${name}`,
      initialValue: `/api/${name}`,
    });
    if (typeof base === "symbol") { this.exit(0); return; }

    const operations = await multiselect({
      message: "Operations to include:",
      options: [
        { label: "List (GET /)", value: "list", hint: `GET ${base}` },
        { label: "Get (GET /:id)", value: "get", hint: `GET ${base}/:id` },
        { label: "Create (POST /)", value: "create", hint: `POST ${base}` },
        { label: "Update (PUT /:id)", value: "update", hint: `PUT ${base}/:id` },
        { label: "Delete (DELETE /:id)", value: "delete", hint: `DELETE ${base}/:id` },
      ],
      initialValues: ["list", "get", "create", "update", "delete"],
    });
    if (typeof operations === "symbol") { this.exit(0); return; }

    // Build resource config
    const resource: Record<string, unknown> = {};
    if (operations.includes("list")) resource.list = `GET ${base}`;
    if (operations.includes("get")) resource.get = `GET ${base}/{id}`;
    if (operations.includes("create")) resource.create = `POST ${base}`;
    if (operations.includes("update")) resource.update = `PUT ${base}/{id}`;
    if (operations.includes("delete")) resource.delete = `DELETE ${base}/{id}`;

    // Add to manifest
    if (!manifestRaw.resources) {
      manifestRaw.resources = {};
    }

    if (manifestRaw.resources[name as string]) {
      log.warn(`Resource "${name}" already exists. It will be overwritten.`);
    }

    manifestRaw.resources[name as string] = resource;

    fs.writeFileSync(manifestPath, JSON.stringify(manifestRaw, null, 2) + "\n");

    log.success(`Added resource "${name}" with ${(operations as string[]).length} operations`);
    outro("Done!");
  }
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/cli/commands/add-page.ts` |
| Create | `src/cli/commands/add-resource.ts` |

### Tests

| File | What |
|---|---|
| `src/cli/__tests__/add-page.test.ts` (create) | Tests: adds route to manifest JSON, builds correct preset config for each type, detects duplicate paths, adds nav item when requested. |
| `src/cli/__tests__/add-resource.test.ts` (create) | Tests: adds resource to manifest JSON, builds correct endpoint patterns, handles existing resources. |

### Exit Criteria

- [ ] `snapshot add-page --path /users --title Users --preset crud` adds a CRUD route to
      the manifest.
- [ ] Interactive prompts work when flags are omitted.
- [ ] Duplicate path detection warns and prompts for overwrite.
- [ ] Nav item added when confirmed.
- [ ] `snapshot add-resource --name users --base /api/users` adds resource with all operations.
- [ ] Manifest JSON is properly formatted after modification.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.
- [ ] `bun run build` passes (oclif manifest regenerated).

---

## Phase L.5: JSON Schema for IDE — Autocomplete + Inline Docs

### Goal

Generate and publish a JSON Schema for `snapshot.manifest.json` that enables:
- VS Code autocomplete and IntelliSense.
- Inline docs on hover.
- Red underlines for invalid fields.
- `$schema` key in manifest for auto-association.

### Implementation

**1. Create `src/cli/commands/manifest/schema.ts`:**

```ts
import { Command, Flags } from "@oclif/core";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { intro, log, outro } from "@clack/prompts";

export default class ManifestSchema extends Command {
  static override description = "Generate JSON Schema for snapshot.manifest.json";
  static override examples = [
    "<%= config.bin %> manifest schema",
    "<%= config.bin %> manifest schema --output schema.json",
  ];
  static override flags = {
    output: Flags.string({
      char: "o",
      description: "Output file path",
      default: "snapshot.schema.json",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(ManifestSchema);
    const outputPath = path.resolve(process.cwd(), flags.output);

    intro("@lastshotlabs/snapshot manifest schema");

    const { generateJsonSchema } = await import("../../../ui/manifest/json-schema.js");
    const schema = generateJsonSchema();

    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2) + "\n");
    log.success(`JSON Schema written to ${flags.output}`);
    log.info('Add "$schema": "./snapshot.schema.json" to your manifest for IDE support.');
    outro("Done!");
  }
}
```

**2. Create `src/ui/manifest/json-schema.ts`:**

Convert the Zod schemas to JSON Schema format. Use `zod-to-json-schema` as an optional
dependency, or hand-build the schema from the Zod definitions.

```ts
import { zodToJsonSchema } from "zod-to-json-schema";
import { manifestConfigSchema } from "./schema";

/**
 * Generate a JSON Schema from the manifest Zod schema.
 *
 * The generated schema is suitable for IDE autocomplete in
 * snapshot.manifest.json files.
 */
export function generateJsonSchema(): Record<string, unknown> {
  const schema = zodToJsonSchema(manifestConfigSchema, {
    name: "SnapshotManifest",
    $refStrategy: "none",
    errorMessages: true,
  });

  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "Snapshot Manifest",
    description: "Configuration schema for snapshot.manifest.json",
    ...schema,
  };
}
```

**3. Update manifest init to include `$schema`:**

Update `src/cli/templates/manifest-init.ts` to include the `$schema` key:

```ts
// In the generated manifest template:
{
  "$schema": "./snapshot.schema.json",
  "app": { ... },
  "routes": [ ... ]
}
```

**4. Add `zod-to-json-schema` as optional peer dependency:**

In `package.json`:
```json
{
  "optionalDependencies": {
    "zod-to-json-schema": "^3.0.0"
  }
}
```

### Files to Create/Modify

| Action | Path |
|---|---|
| Create | `src/ui/manifest/json-schema.ts` |
| Create | `src/cli/commands/manifest/schema.ts` |
| Modify | `src/cli/templates/manifest-init.ts` — add `$schema` to generated manifest |
| Modify | `package.json` — add `zod-to-json-schema` as optional dependency |

### Tests

| File | What |
|---|---|
| `src/ui/manifest/__tests__/json-schema.test.ts` (create) | Tests: `generateJsonSchema()` returns valid JSON Schema, schema has correct `$schema` URI, schema has properties for all top-level manifest keys (app, routes, auth, theme, etc.). |
| `src/cli/__tests__/manifest-schema.test.ts` (create) | Tests: command writes file, output is valid JSON, output has `$schema` key. |

### Exit Criteria

- [ ] `snapshot manifest schema` generates `snapshot.schema.json`.
- [ ] Generated schema validates successfully against JSON Schema Draft 7.
- [ ] VS Code recognizes `$schema` key and provides autocomplete.
- [ ] Schema includes all top-level manifest keys: `app`, `routes`, `auth`, `theme`,
      `navigation`, `resources`, `state`, `overlays`, `toast`, `analytics`,
      `observability`, `push`, `realtime`, `workflows`, `i18n`, `policies`.
- [ ] `snapshot manifest init` includes `$schema` in generated manifest.
- [ ] `bun run typecheck` passes.
- [ ] `bun test` passes.
- [ ] `bun run build` passes.

---

## Parallelization & Sequencing

### Track Overview

Three independent tracks:

| Track | Phases | Files Owned |
|---|---|---|
| Vite | L.1, L.2 | `src/vite/index.ts`, `src/ui/manifest/error-overlay.tsx` |
| Runtime | L.3 | `src/ui/manifest/inspector.tsx`, `src/ui/components/_base/component-wrapper.tsx` |
| CLI | L.4, L.5 | `src/cli/commands/add-page.ts`, `src/cli/commands/add-resource.ts`, `src/cli/commands/manifest/schema.ts`, `src/ui/manifest/json-schema.ts` |

### File Conflicts

- L.1 and L.2 both modify `src/vite/index.ts` and `src/ui/manifest/app.tsx`. Must be
  sequential within the Vite track.
- L.3 modifies `src/ui/manifest/app.tsx` (inspector mount) — must coordinate with L.2.
- L.4 and L.5 are independent CLI commands.

### Recommended Order

**Track A (Vite):** L.1 then L.2.
**Track B (Runtime):** L.3 (after L.2 since both modify app.tsx).
**Track C (CLI):** L.4 and L.5 in parallel.

Overall: L.1 -> L.2 -> L.3, with L.4 and L.5 running anytime.

### Branch Strategy

```
branch: phase-l-dx
base: main
```

### Agent Execution Checklist

1. Read `docs/engineering-rules.md` in full.
2. Read this spec in full.
3. Read all files in "Key Files" before modifying.
4. Start with L.4 or L.5 (independent CLI commands, fast to validate).
5. Then L.1 (HMR), L.2 (error overlay), L.3 (inspector).
6. Run `bun run typecheck && bun test` after each sub-phase.
7. Run `bun run build` at the end (oclif manifest must regenerate for new commands).
8. Verify SSR safety for L.3 (inspector must not run on server).
9. Verify production guards for L.2 and L.3 (`import.meta.env.DEV` checks).
10. Commit each sub-phase separately.

### Risk Mitigation

| Risk | Mitigation |
|---|---|
| HMR manifest re-import may not work with all Vite configurations | Fall back to `import.meta.hot.invalidate()` (full reload) on any error |
| `zod-to-json-schema` may produce incomplete schema for complex unions | Hand-verify the generated schema against a real manifest; supplement missing properties manually |
| Inspector data attribute (`data-snapshot-config`) adds bytes to DOM | Only inject in dev mode via `import.meta.env.DEV` |
| CLI commands modifying manifest may produce invalid JSON | Always re-parse and re-serialize with `JSON.stringify(parsed, null, 2)` |

---

## Definition of Done

### Per-Phase Checks

```sh
bun run typecheck        # No type errors
bun test                 # All tests pass
bun run format:check     # Prettier clean
```

### Full Completion Checks

```sh
bun run build            # tsup + oclif manifest succeeds (includes new CLI commands)
bun test                 # All DX tests pass
```

### Documentation Checks

- [ ] JSDoc on `ManifestErrorOverlay`, `ComponentInspector`, `generateJsonSchema`.
- [ ] JSDoc on all new CLI command classes.
- [ ] All new CLI commands have `static override description` and `static override examples`.
- [ ] `src/ui.ts` exports updated if any new public symbols added.
