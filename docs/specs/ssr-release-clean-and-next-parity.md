# SSR Release-Clean and Next Parity — Canonical Spec

> **Status**
>
> | Phase | Title | Status | Track |
> | ----- | ----- | ------ | ----- |
> | A | Release-Clean Build and Type Surface | Not started | A — Build |
> | B | SSR Request and Render Contract Hardening | Not started | B — Runtime |
> | C | Universal Styling Contract Normalization | Not started | C — UI Contract |
> | D | Next.js Parity Matrix and Conformance | Not started | B — Runtime |
> | E | Docs, Examples, and Certification | Not started | D — Docs |
>
> **Priority:** P0
>
> **Product bar:** Snapshot SSR is not considered complete until `typecheck`, `build`, and the
> full test suite are green, the styling contract is consistent across components, and
> “Next.js parity” is defined by explicit conformance rows rather than by intuition.

---

Synced status note:

- the quoted status block above is historical formatting only
- the authoritative phase order for this spec is A, B, C, D, E, F as listed below
- the authoritative product bar includes the SSG path, not only request-time SSR

Authoritative phase map for implementing agents:

| Phase | Title | Track |
| ----- | ----- | ----- |
| A | Release-Clean Build and Type Surface | A |
| B | SSR Request and Render Contract Hardening | B |
| C | SSG Contract and Build Integration Hardening | B |
| D | Universal Styling Contract Normalization | C |
| E | Next.js Parity Matrix and Conformance | B |
| F | Docs, Examples, and Certification | D |

Authoritative product bar for implementing agents:

- release sign-off requires `typecheck`, `build`, `test`, and `docs:ci`
- release sign-off includes the SSG path, not only request-time SSR
- implementing agents must follow the authoritative phase map and product bar below

## Vision

### Before

Snapshot SSR is materially stronger than it was before the audit, but it is not yet a
release-clean or parity-certified surface.

The audited branch now has several concrete runtime fixes in place:

- `renderPage()` keeps its abort timeout alive until the response stream settles.
- `createReactRenderer()` forwards real request headers into `load()` when available.
- `notFound` results return a real `404` shell that preserves `headTags` and assets.
- the universal style resolver no longer emits conflicting `background` and
  `backgroundColor` shorthands for simple color cases.
- chart SSR avoids the `ResponsiveContainer` warning path by rendering fixed dimensions on
  the server.

Those are real improvements, but they do not finish the job.

Four hard gaps still block sign-off:

1. **The repo is not release-clean.** `bun run build` currently fails during declaration
   generation with `TS7056` in three large schema exports.
2. **The SSR request contract is still partly inferred from adapter shape.**
   `renderer.ts` reconstructs a request from `bsCtx.request` or `bsCtx.req`, which is
   better than the previous fake request path but is still not the explicit contract we want.
3. **Universal styling is broad, not uniform.** `layout/layout/schema.ts` still uses a
   layout-specific `slots` declaration rather than the canonical universal `slotsSchema(...)`
   surface used elsewhere.
4. **SSG is implemented but under-specified.** `snapshotSsr()` can spawn `slingshot-ssg`, and
   `staticParamsPlugin()` writes `static-params.json`, but the current docs do not yet provide
   a clear end-to-end guide for required packages, build order, generated artifacts, warning
   behavior, and supported SSR/RSC/SSG combinations.

### After

Snapshot reaches the target state only when all of the following are true:

- `bun run typecheck`, `bun run build`, `bun run test`, and `bun run docs:ci` are green.
- the SSR request contract is explicit and adapter-independent at the Snapshot boundary.
- the SSG contract is explicit, including required packages, build order, generated artifacts,
  and supported Snapshot-managed option combinations.
- request/status/head/streaming/cache semantics are covered by conformance tests.
- the universal styling contract is consistent across layout, primitives, grouped components,
  and SSR/hydration.
- “Next.js parity” is represented by an explicit matrix of semantics with each row marked
  `done`, `partial`, or `missing`, and the runtime is validated against that matrix.

Sign-off language matters here:

- "SSR runtime is sound and robust" means the request contract is explicit, both renderers
  agree on status/head/streaming semantics, and the relevant conformance tests are green.
- "SSR and SSG integration is sound and robust" additionally means `snapshotSsr({ ssg: true })`
  has explicit docs and tests for prerequisites, warnings, and supported combinations.
- "Universal styling system compatible" means layout no longer overloads `slots`, the
  canonical style-slot contract is documented once, and that contract is exercised by tests.
- "Full parity with Next.js" is not a slogan. It is only true when the parity matrix has no
  `partial` or `missing` rows that affect publicly documented capabilities.

This spec does **not** mean “copy the Next.js API surface verbatim.” Snapshot remains a
manifest-first framework. “Parity” here means parity of runtime behavior and guarantees where
Snapshot claims to provide an equivalent capability.

---

## What Already Exists on Main

### Audited current strengths

| Area | File(s) | Current state |
| ---- | ------- | ------------- |
| Stream timeout lifecycle | `src/ssr/render.ts` | Abort timeout now survives until stream completion/cancel. |
| Request header propagation | `src/ssr/renderer.ts` | `load()` receives real request headers when `bsCtx.request` or `bsCtx.req` exists. |
| Not-found status behavior | `src/ssr/renderer.ts` | `notFound` returns `404` HTML shell and preserves `headTags` and assets. |
| Style shorthand safety | `src/ui/components/_base/style-props.ts` | Simple backgrounds normalize to `backgroundColor`; complex shorthands stay `background`. |
| Chart SSR safety | `src/ui/components/data/chart/component.tsx` | Server path renders charts with explicit dimensions instead of `ResponsiveContainer`. |
| RSC option threading surface | `src/ssr/types.ts` | `SnapshotSsrConfig` and `ManifestSsrConfig` already expose `rscOptions?: RscOptions`. |
| SSG runner wiring | `src/vite/index.ts` | `snapshotSsr({ ssg: true })` spawns `slingshot-ssg` and already forwards `--rsc-manifest` when `rsc: true`. |
| Static params artifact generation | `src/vite/index.ts` | `staticParamsPlugin()` writes `static-params.json` for routes that export `generateStaticParams`. |
| Audited SSR/styling test slice | `src/ssr/__tests__`, `_base/__tests__`, chart tests | 176 tests passed across 23 files in the audited slice. |

### Audited current blockers

| Area | File(s) | Gap |
| ---- | ------- | --- |
| DTS/build blocker | `src/ui/components/data/chart/schema.ts`, `src/ui/components/data/stat-card/schema.ts`, `src/ui/components/navigation/tree-view/schema.ts` | `bun run build` fails with `TS7056` because the inferred schema export types are too large to serialize. |
| Explicit SSR request contract | `src/ssr/renderer.ts`, `src/ssr/manifest-renderer.ts`, adapter boundary upstream of Snapshot | Request extraction still relies on structural probing of `bsCtx`. |
| SSG conformance and usage docs | `src/vite/index.ts`, `apps/docs/src/content/docs/integrate/ssr-rsc.md`, `apps/docs/src/content/docs/reference/vite.md` | SSG exists in code, but the docs do not yet provide a clear, end-to-end usage guide or parity status. |
| Universal layout styling contract | `src/ui/components/layout/layout/schema.ts` | Layout uses custom `slots: z.array(layoutSlotSchema)` semantics instead of reserving `slots` for universal style surfaces. |
| Full-suite certification | repo-wide test suite | The audited slice is green, but full-suite completion still needs a clean end-to-end pass. |
| Formatting baseline | repo-wide | `bun run format:check` fails on a large pre-existing formatting backlog. |

### Current build and docs reality

- `bun run typecheck` currently passes.
- `bun run build` currently fails on the three `TS7056` schema exports above.
- `bun run format:check` is not a useful signal for this surface yet because the repo has
  broad existing formatting debt unrelated to SSR.
- public SSR/RSC/SSG docs already exist, but are uneven in depth:
  - `apps/docs/src/content/docs/integrate/ssr-rsc.md`
  - `apps/docs/src/content/docs/reference/ssr.md`
  - `apps/docs/src/content/docs/reference/vite.md`
  - `apps/docs/src/content/docs/start-here/capabilities.md`
- `reference/ssr.md` and `reference/vite.md` are generated reference outputs; when their
  content needs to change, the source-of-truth edit must happen in JSDoc and export
  surfaces under `src/ssr/**` or `src/vite/index.ts`, then `docs:generate` must be run

---

## Developer Context

### Build and test commands

```sh
bun run typecheck
bun run build
bun run test
bun run docs:ci
```

### Key files

| File | What it does | Line count | Notes |
| ---- | ------------ | ---------- | ----- |
| `src/ssr/render.ts` | streaming SSR and RSC render body | 410 | timeout semantics are already improved and must remain invariant |
| `src/ssr/renderer.ts` | file-based SSR runtime | 1268 | request extraction is still partly structural |
| `src/ssr/manifest-renderer.ts` | manifest SSR runtime | 1159 | must follow the same request/status/head semantics as file-based SSR |
| `src/ssr/types.ts` | public and internal SSR contract types | 470 | the correct place for any new request-envelope type |
| `src/vite/index.ts` | SSR/Vite integration surface | 1117 | update only if parity work changes public integration semantics |
| `src/ui/components/_base/style-props.ts` | universal style prop resolution | 519 | current shorthand fix is correct and should be treated as baseline |
| `src/ui/components/layout/layout/schema.ts` | layout config contract | 30 | currently mixes semantic area declaration with visual slot semantics |
| `src/ui/components/layout/layout/component.tsx` | built-in layout runtime | 519 | existing layout tests already live next to this file |
| `src/ui/components/data/chart/schema.ts` | one of the current DTS blockers | 99 | must be fixed without eroding consumer typing |
| `src/ui/components/data/stat-card/schema.ts` | one of the current DTS blockers | 95 | same requirement as chart |
| `src/ui/components/navigation/tree-view/schema.ts` | one of the current DTS blockers | 116 | same requirement as chart |

### Current pattern that must be replaced

The current request extraction path is defensive but not final:

- `renderer.ts` accepts `bsCtx: unknown`
- it attempts to discover `Request` via `bsCtx.request`
- it falls back to reconstructing a `Request` from `bsCtx.req`
- if neither exists, it synthesizes a new `Request(url)`

That is a reasonable compatibility bridge. It is not the end-state contract.

### Consumer contract after this spec

After this spec:

- the Snapshot SSR surface must describe exactly what request object the renderer receives,
  when abort signals propagate, and what status semantics apply to redirects and route signals.
- the Snapshot Vite/SSG surface must describe exactly when `slingshot-ssg` runs, which package
  provides it, what artifacts it consumes, and what happens on warning or failure.
- the universal styling system must document one meaning for `slots`, one meaning for layout
  area declarations, and one rendering path for styleable surfaces.
- parity claims must map to documented test cases, not prose-only assertions.

`SsrRequestEnvelope` is part of the public SSR surface. The consumer import path is:

```ts
import type { SsrRequestEnvelope } from "@lastshotlabs/snapshot/ssr";
```

The executing agent must export this type from `src/ssr/index.ts` and document it in the SSR
reference pages in the same phase. Do not leave its visibility ambiguous.

---

## Non-Negotiable Engineering Constraints

From root `CLAUDE.md`, `src/ssr/CLAUDE.md`, and the existing spec rules:

1. **Read actual source before codifying behavior.** The spec must describe current runtime
   truth, not intended behavior.
2. **Manifest-first remains first-class.** Next parity cannot come at the cost of a second,
   special-case runtime philosophy.
3. **Public API changes require docs and JSDoc updates.** Any change to `src/ssr/index.ts`,
   `src/vite/index.ts`, or visible manifest/runtime behavior updates docs in the same phase.
4. **SSG is part of the release surface.** A parity or release-clean SSR spec is incomplete if
   it omits `snapshotSsr({ ssg: true })`, `staticParamsPlugin()`, or the slingshot-ssg handoff.
5. **No `any`-based build “fixes.”** DTS unblock work must not erase consumer-facing config
   typing by collapsing schemas to `Record<string, any>`.
6. **One semantic model across renderers.** File-based SSR and manifest SSR must agree on
   request, status, head, and streaming semantics.
7. **Universal styling means universal.** `slots` must have one canonical meaning across the
   component system.
8. **Every phase leaves the codebase greener than it found it.** No phase may knowingly
   regress `typecheck`, `build`, or the audited SSR/runtime tests.

---

## Phase A: Release-Clean Build and Type Surface

### Goal

Make `bun run build` green without weakening the UI config type surface.

### Recommendation

Fix the three `TS7056` failures by reducing schema serialization complexity, not by replacing
the public type surface with `any`.

The required pattern for the three failing components is:

1. extract large inline fragments into named exported schemas
2. define or refine the corresponding config types in `types.ts`
3. annotate the top-level schema export with the exact config type only after the nested
   fragments have stable named types

### Files to modify

- `src/ui/components/data/chart/schema.ts`
- `src/ui/components/data/chart/types.ts`
- `src/ui/components/data/stat-card/schema.ts`
- `src/ui/components/data/stat-card/types.ts`
- `src/ui/components/navigation/tree-view/schema.ts`
- `src/ui/components/navigation/tree-view/types.ts`

### Tests to update or add

- `src/ui/components/data/chart/__tests__/component.test.tsx`
- `src/ui/components/data/stat-card/__tests__/component.test.tsx`
- `src/ui/components/data/stat-card/__tests__/schema.test.ts`
- `src/ui/components/navigation/tree-view/__tests__/component.test.tsx`
- `src/ui/components/navigation/tree-view/__tests__/schema.test.ts`

### Documentation impact

- none expected for user-facing docs unless the public config shape changes
- if exported config types or JSDoc are touched in `types.ts`, update those comments in the
  same patch

### Implementation details

- `chart/schema.ts`
  - extract the top-level config shape into named fragments for the chart type enum, lookup
    config, empty state reference, and slot schema
  - keep `seriesConfigSchema` as a named export
  - reduce the amount of anonymous inline shape expansion inside the exported `chartSchema`
- `stat-card/schema.ts`
  - extract the value-format config and slot contract into named exports
  - ensure the exported `StatCardConfig` type remains consumer-usable from `types.ts`
- `tree-view/schema.ts`
  - extract the node slot schema and top-level tree-view config shape into named fragments
  - keep the recursive `treeItemSchema` explicit and isolated so the exported
    `treeViewConfigSchema` is not responsible for serializing the full recursive expansion

### Explicit constraints

- Do **not** “fix” these files by annotating their schemas as `z.ZodType<Record<string, any>>`
  unless the config type is restored by a separate exact interface in the same change.
- Do **not** modify `tsconfig.ui-types.json` or `scripts/build-ui-types.mjs` first. The build
  script is not the bug; the exported type complexity is.
- If a manual config interface becomes necessary, it must be composed from existing input
  types of nested schemas, not ad-hoc `unknown` placeholders.

### Exit criteria

- `bun run typecheck` passes
- `bun run build` passes
- no consumer-facing config types for chart, stat-card, or tree-view degrade to `any`

### Required verification commands

```sh
bun run typecheck
bun run build
```

---

## Phase B: SSR Request and Render Contract Hardening

### Goal

Replace request-shape inference with an explicit contract and lock down SSR semantics that
must hold across file-based and manifest rendering.

### API

Add a new explicit request envelope type in `src/ssr/types.ts`:

```ts
export interface SsrRequestEnvelope {
  readonly request: Request;
  readonly signal?: AbortSignal;
}
```

Snapshot renderers must consume this envelope first. Structural probing of `bsCtx` remains
only as a temporary compatibility fallback and is marked deprecated in JSDoc.

Target renderer preference order:

1. explicit `SsrRequestEnvelope`
2. legacy `bsCtx.request`
3. legacy `bsCtx.req`
4. synthesized `new Request(url)` only as the final defensive fallback

The implementation must not reorder those paths silently.

### Files to modify

- `src/ssr/types.ts`
- `src/ssr/index.ts`
- `src/ssr/renderer.ts`
- `src/ssr/manifest-renderer.ts`
- `src/ssr/render.ts`
- `src/ssr/__tests__/renderer.test.tsx`
- `src/ssr/__tests__/render-page.test.tsx`
- `src/ssr/__tests__/render-timeout.test.ts`
- `src/ssr/__tests__/head.test.ts`
- `src/ssr/__tests__/manifest-renderer-rsc.test.ts`
- new conformance tests under `src/ssr/__tests__/conformance/`

### Preferred boundary shape example

```ts
import type { SsrRequestEnvelope } from "@lastshotlabs/snapshot/ssr";

const envelope: SsrRequestEnvelope = {
  request: new Request("https://example.test/products?id=42", {
    method: "GET",
    headers: { cookie: "session=abc" },
  }),
  signal: AbortSignal.timeout(5000),
};
```

This snippet documents the data shape at the Snapshot renderer boundary, not a guessed adapter
method signature. If the type is public, the docs phase must show the real consumer call site
that passes this envelope.

### Implementation details

- `types.ts`
  - add `SsrRequestEnvelope`
  - document that this is the preferred renderer input contract
- `renderer.ts` and `manifest-renderer.ts`
  - prefer `SsrRequestEnvelope.request` over `bsCtx` probing
  - keep the current probing path only as a compatibility bridge
  - ensure status/head behavior remains aligned between renderers
- `render.ts`
  - preserve the current timeout lifecycle fix as a non-regression invariant
  - if `signal` is provided by the envelope, compose it with the render timeout abort path

### Conformance tests to add

- `src/ssr/__tests__/conformance/request-semantics.test.ts`
  - headers
  - cookies
  - method
  - URL
- `src/ssr/__tests__/conformance/status-semantics.test.ts`
  - redirect
  - `notFound`
  - `forbidden`
  - `unauthorized`
- `src/ssr/__tests__/conformance/streaming-semantics.test.ts`
  - timeout abort
  - consumer cancel
  - shell/head preservation

Existing tests that remain owners for this phase:

- `src/ssr/__tests__/renderer.test.tsx`
  - route loader integration
  - request/header propagation
  - `notFound` shell behavior
- `src/ssr/__tests__/render-timeout.test.ts`
  - timeout lifecycle
  - abort behavior
- `src/ssr/__tests__/head.test.ts`
  - head tag preservation and serialization
- `src/ssr/__tests__/manifest-renderer-rsc.test.ts`
  - manifest renderer agreement with file-based renderer for RSC-bearing paths

### Upstream dependency

Snapshot can define the explicit contract locally, but full completion requires the upstream
SSR adapter to pass `Request` and optional `AbortSignal` explicitly. Snapshot-side work and
upstream adapter work must be reviewed together before declaring this phase complete.

Risk control:

- if the upstream adapter cannot pass `AbortSignal` yet, land the local envelope type and
  request path first, but leave the parity row for abort propagation as `partial`
- do not delete the legacy probing branch until the upstream adapter contract has shipped and
  the compatibility bridge has at least one release cycle

### Documentation impact

- add or update JSDoc on `SsrRequestEnvelope` in `src/ssr/types.ts`
- export the type from `src/ssr/index.ts`
- update `apps/docs/src/content/docs/reference/ssr.md` with the preferred request contract
- update `apps/docs/src/content/docs/integrate/ssr-rsc.md` so the RSC path documents the same
  request-envelope contract

### Exit criteria

- both renderers prefer the explicit request envelope
- compatibility fallback remains covered by tests
- request/status/streaming conformance tests pass

### Required verification commands

```sh
bun run test -- src/ssr/__tests__
bun run typecheck
```

---

## Phase C: SSG Contract and Build Integration Hardening

### Goal

Make the static-generation path first-class in the release bar: explicit package/runtime
expectations, documented build order, and tested option combinations across SSR, RSC, and SSG.

### Scope

This phase covers the Snapshot-managed SSG handoff points:

- `snapshotSsr({ ssg: true })`
- `SnapshotSsrOptions.ssg` and `ssgOutDir`
- `staticParamsPlugin()` and `static-params.json`
- the `slingshot-ssg` CLI spawn contract in `src/vite/index.ts`

This phase does **not** re-implement slingshot-ssg inside Snapshot. It defines and validates the
contract between Snapshot and slingshot-ssg.

### Files to modify

- `src/vite/index.ts`
- `src/vite/__tests__/plugin.test.ts`
- add `src/vite/__tests__/ssg.test.ts`
- `apps/docs/src/content/docs/integrate/ssr-rsc.md`
- add `apps/docs/src/content/docs/integrate/ssr-ssg-workflows.md`
- `apps/docs/src/content/docs/reference/vite.md`
- `apps/docs/src/content/docs/start-here/capabilities.md`

### Implementation details

- document the exact SSG prerequisites in code comments and docs
  - Snapshot's own `package.json` does not currently declare `@lastshotlabs/slingshot-ssr` or
    `@lastshotlabs/slingshot-ssg` as peer dependencies, so the docs must state the install
    requirement explicitly unless package policy changes in the same workstream
  - `@lastshotlabs/slingshot-ssr` for the server runtime wiring
  - `@lastshotlabs/slingshot-ssg` for static generation
  - client build artifact: `dist/client/.vite/manifest.json`
  - server build artifact: `dist/server/entry-server.js`
  - optional RSC artifact: `dist/server/rsc-manifest.json`
  - static params artifact: `dist/client/static-params.json`
- make the supported build order explicit
  - docs must show the actual scripts needed for the server build and the client build
  - docs must state that the server bundle must exist before the client build's `closeBundle`
    SSG spawn runs
  - the canonical SSG script order for docs and examples is:

```json
{
  "scripts": {
    "build:server": "vite build --ssr src/ssr/entry-server.ts",
    "build:client": "vite build",
    "build:ssg": "bun run build:server && bun run build:client"
  }
}
```

  - rationale: `snapshotSsr({ ssg: true })` runs the `slingshot-ssg` spawn from the client
    build's `closeBundle`, so `dist/server/entry-server.js` must already exist
- define and test warning behavior
  - missing `slingshot-ssg` binary
  - non-zero `slingshot-ssg` exit code
  - any option combination that still cannot be declared `done` in the parity matrix after this
    phase must emit explicit docs language and a proving warning or test assertion
  - preserve the current Snapshot-owned semantics unless the developer explicitly changes them:
    missing or failing `slingshot-ssg` produces warnings, not hard client-build failures
- define and test the Snapshot-owned option matrix
  - `ssg: true`
  - `ssg: true` + `rsc: true`
  - `ssg: true` + static params generation

### Tests to update or add

- add `src/vite/__tests__/ssg.test.ts`
  - spawns slingshot-ssg with `--assets-manifest`
  - passes `--renderer`
  - passes `--out`
  - passes `--rsc-manifest` when `rsc: true`
  - warns when `slingshot-ssg` is missing
  - warns when `slingshot-ssg` exits non-zero
- extend `src/vite/__tests__/plugin.test.ts`
  - verifies `snapshotSsr({ ssg: true })` docs-facing defaults remain stable:
    `serverOutDir = dist/server`, `ssgOutDir = dist/static`, and client-build SSG spawn
    consumes `dist/client/.vite/manifest.json`
- extend `src/vite/__tests__/plugin.test.ts`
  - verifies `staticParamsPlugin()` still writes the expected `static-params.json` artifact

### Documentation impact

- `integrate/ssr-rsc.md`
  - add an explicit "SSR vs SSG vs PPR" decision section
  - add a short index section that points workflow readers to `integrate/ssr-ssg-workflows.md`
- `integrate/ssr-ssg-workflows.md`
  - add required package install commands for slingshot SSR and slingshot SSG
  - add an end-to-end Vite config plus package.json script example for SSG
  - document canonical build order and generated artifacts
  - document current warning semantics for missing or failing `slingshot-ssg`
- `reference/vite.md`
  - make `SnapshotSsrOptions.ssg` and `ssgOutDir` visible and explained
  - explain what `snapshotSsr({ ssg: true })` actually triggers
  - explain the generated artifacts and warning semantics
- because `reference/vite.md` is generated, make the source edit in `src/vite/index.ts` JSDoc
  first, then regenerate docs
- `start-here/capabilities.md`
  - avoid lumping SSG into a generic "oriented integration" label once this phase is done

### Exit criteria

- SSG package/runtime prerequisites are explicit in docs
- SSG option combinations are represented in tests
- warning and failure behavior are documented and tested
- `snapshotSsr({ ssg: true })` has a real end-to-end usage example in docs

### Required verification commands

```sh
bun run test -- src/vite/__tests__
bun run typecheck
```

---

## Phase D: Universal Styling Contract Normalization

### Goal

Make `slots` mean one thing everywhere: styleable visual surfaces. Layout area declarations
must stop competing with that meaning.

### Recommendation

Rename the layout-specific area declaration away from `slots` and reserve `slots` for the
universal styling contract.

### Files to modify

- `src/ui/components/layout/layout/schema.ts`
- `src/ui/components/layout/layout/component.tsx`
- `src/ui/components/layout/layout/types.ts`
- `src/ui/manifest/schema.ts`
- `src/ui/manifest/compiler.ts`
- `src/ui/manifest/app.tsx`
- `src/ssr/manifest-renderer.ts`
- `src/ui/components/layout/layout/__tests__/schema.test.ts`
- `src/ui/components/layout/layout/__tests__/component.test.tsx`
- `docs/specs/universal-item-styling.md`
- add `src/ui/components/_base/__tests__/slot-contract.test.ts`

### Implementation details

- in `layout/layout/schema.ts`
  - introduce a new semantic field for layout areas, named `areas`
  - reserve `slots` for the canonical `slotsSchema(...)` visual-surface contract
- update every known reader of layout semantic slot declarations in the same phase
  - `src/ui/manifest/compiler.ts`
  - `src/ui/manifest/app.tsx`
  - `src/ssr/manifest-renderer.ts`
  - `src/ui/manifest/schema.ts`
- provide backwards compatibility
  - continue accepting legacy `slots` as layout-area input for one transition window
  - normalize legacy `slots` to `areas` during compile or schema preprocessing
  - mark the legacy alias deprecated in JSDoc and docs
  - reject configs that try to use legacy layout-area `slots` and canonical visual `slots`
    simultaneously, because that would preserve the ambiguity we are removing
- add a universal contract test
  - layout uses `areas` for semantic region declarations
  - components use `slots` only for styleable surfaces

### Compatibility window

- release N: accept both `areas` and legacy layout `slots`, normalize to `areas`, and emit a
  deprecation warning in development
- release N+1: keep parsing legacy layout `slots` only if telemetry or migration feedback says
  consumers still need it
- release N+2 at the earliest: remove the alias, but only after docs, examples, and changelog
  guidance exist

The executing agent must not remove the alias in the same change that introduces `areas`
unless the developer explicitly approves a breaking change.

### Tests to update or add

- update `src/ui/components/layout/layout/__tests__/schema.test.ts`
  - accepts `areas`
  - accepts legacy layout `slots` during transition
  - rejects simultaneous semantic `areas` plus legacy semantic `slots`
- update `src/ui/components/layout/layout/__tests__/component.test.tsx`
  - layout rendering still works when config is normalized from legacy input
- add `src/ui/components/_base/__tests__/slot-contract.test.ts`
  - verifies canonical visual `slots` remain style-surface-only

### Documentation impact

- update `docs/specs/universal-item-styling.md` so `slots` has one canonical meaning
- update any public layout docs or examples that still show semantic layout `slots`
- if `LayoutConfig` JSDoc is updated in schema or types, keep the deprecation notice there too

### Why this matters

Without this separation, Snapshot cannot honestly claim universal styling compatibility. The
name `slots` currently means two different things depending on component family, which is
exactly the kind of framework inconsistency this system is trying to eliminate.

### Exit criteria

- layout no longer overloads `slots`
- universal styling docs define one canonical `slots` meaning
- compatibility path for legacy layout config is tested

### Required verification commands

```sh
bun run test -- src/ui/components/layout/layout/__tests__ src/ui/components/_base/__tests__
bun run typecheck
```

---

## Phase E: Next.js Parity Matrix and Conformance

### Goal

Turn “full parity with Next.js” into a concrete matrix of runtime behaviors with explicit
coverage and status.

### Matrix rows

Create a parity matrix in docs and in tests with these rows:

1. request semantics
2. redirect and status semantics
3. route convention semantics
4. head and metadata semantics
5. streaming and Suspense semantics
6. cache, draft mode, revalidation, and static params semantics
7. SSG build and prerender semantics
8. RSC semantics
9. PPR semantics
10. manifest-renderer parity with file-based SSR

Each row must be marked `done`, `partial`, or `missing`.

Each row also needs:

- a canonical owner test file
- a docs paragraph stating the Snapshot behavior today
- a short note explaining why the row is not `done` when marked `partial` or `missing`

### Files to modify

- `apps/docs/src/content/docs/integrate/ssr-rsc.md`
- `apps/docs/src/content/docs/reference/ssr.md`
- `apps/docs/src/content/docs/reference/vite.md`
- `apps/docs/src/content/docs/start-here/capabilities.md`
- add `apps/docs/src/content/docs/reference/ssr-parity.md`
- update `apps/docs/src/content/docs/reference/index.md` to link to the new parity page
- `src/ssr/__tests__/conformance/`
- `src/vite/__tests__/plugin.test.ts`
- `src/vite/__tests__/rsc-transform.test.ts`
- `src/vite/__tests__/ssg.test.ts`

### Recommended parity ownership table

| Parity row | Status source | Owner tests |
| ---------- | ------------- | ----------- |
| request semantics | `reference/ssr.md` | `src/ssr/__tests__/conformance/request-semantics.test.ts`, `src/ssr/__tests__/renderer.test.tsx` |
| redirect and status semantics | `reference/ssr.md` | `src/ssr/__tests__/conformance/status-semantics.test.ts` |
| route convention semantics | parity document | `src/ssr/__tests__/renderer.test.tsx` |
| head and metadata semantics | `integrate/ssr-rsc.md`, `reference/ssr.md` | `src/ssr/__tests__/head.test.ts`, `src/ssr/__tests__/conformance/streaming-semantics.test.ts` |
| streaming and Suspense semantics | parity document | `src/ssr/__tests__/render-page.test.tsx`, `src/ssr/__tests__/render-timeout.test.ts`, `src/ssr/__tests__/conformance/streaming-semantics.test.ts` |
| cache, draft mode, revalidation, and static params semantics | `reference/ssr.md`, `reference/vite.md` | `src/ssr/__tests__/cache.test.ts`, `src/ssr/__tests__/ppr-cache.test.ts`, `src/vite/__tests__/plugin.test.ts` |
| SSG build and prerender semantics | `integrate/ssr-rsc.md`, `reference/vite.md`, parity document | `src/vite/__tests__/ssg.test.ts`, `src/vite/__tests__/plugin.test.ts` |
| RSC semantics | `integrate/ssr-rsc.md`, `reference/vite.md` | `src/ssr/__tests__/rsc.test.ts`, `src/ssr/__tests__/manifest-renderer-rsc.test.ts`, `src/vite/__tests__/rsc-transform.test.ts`, `src/vite/__tests__/ssg.test.ts` |
| PPR semantics | parity document | `src/ssr/__tests__/ppr.test.tsx`, `src/ssr/__tests__/ppr-render.test.tsx`, `src/ssr/__tests__/ppr-cache.test.ts` |
| manifest-renderer parity with file-based SSR | parity document | `src/ssr/__tests__/manifest-renderer-rsc.test.ts`, `src/ssr/__tests__/conformance/request-semantics.test.ts`, `src/ssr/__tests__/conformance/status-semantics.test.ts` |

### Explicit non-goals

- Do **not** claim parity based on filename convention similarity alone.
- Do **not** rewrite Snapshot APIs to mimic Next.js where Snapshot already has a manifest
  abstraction that is serving the same user problem.
- Do **not** mark a row `done` unless it has at least one proving test and one source-backed
  docs entry.
- Do **not** mark the entire product "fully parity-complete" while any documented capability
  row remains `partial` or `missing`.

### Documentation impact

- publish the parity matrix at `apps/docs/src/content/docs/reference/ssr-parity.md`, not only in a spec
- ensure `reference/ssr.md` and `reference/vite.md` link to the matrix
- ensure `start-here/capabilities.md` does not over-claim parity before the matrix is green
- because `reference/ssr.md` and `reference/vite.md` are generated pages, update source JSDoc
  and docs-link inputs first, then regenerate docs rather than relying on hand edits alone

### Exit criteria

- parity matrix exists in docs
- every row has an owner test file
- every row is marked `done`, `partial`, or `missing`
- no “full parity” claim appears in docs without the matrix

### Required verification commands

```sh
bun run test -- src/ssr/__tests__ src/vite/__tests__
bun run docs:ci
```

---

## Phase F: Docs, Examples, and Certification

### Goal

Make the public documentation and the release gate reflect actual runtime truth.

### Files to modify

- `apps/docs/src/content/docs/integrate/ssr-rsc.md`
- `apps/docs/src/content/docs/reference/ssr.md`
- `apps/docs/src/content/docs/reference/vite.md`
- `apps/docs/src/content/docs/start-here/capabilities.md`
- `apps/docs/src/content/docs/examples/index.md`
- `apps/docs/src/content/docs/integrate/ssr-ssg-workflows.md`
- `apps/docs/src/content/docs/reference/index.md`
- `src/ssr/index.ts` JSDoc if public exports changed
- `src/ssr/types.ts` JSDoc if request-envelope or status semantics changed
- `src/vite/index.ts` JSDoc for `SnapshotSsrOptions.ssg`, `ssgOutDir`, and `staticParamsPlugin`
- generated reference outputs produced by `bun run docs:generate`, especially
  `apps/docs/src/content/docs/reference/ssr.md` and `apps/docs/src/content/docs/reference/vite.md`

### Documentation requirements

- describe the explicit request envelope
- document the real status semantics for `notFound`, `forbidden`, and `unauthorized`
- document the difference between parity rows that are `done` versus `partial`
- document the exact SSR and SSG package expectations:
  - `@lastshotlabs/slingshot-ssr`
  - `@lastshotlabs/slingshot-ssg`
  - the canonical install example in docs must be:

```sh
bun add @lastshotlabs/slingshot-ssr
bun add -d @lastshotlabs/slingshot-ssg
```

- document the universal styling contract change for layout `areas` vs visual `slots`
- include at least one manifest-first example, not only file-route examples
- include at least one explicit SSG example with install commands, Vite config, package.json
  build scripts, and artifact expectations
- if legacy layout `slots` are still accepted, label them deprecated everywhere they appear
- generated reference pages must be updated through source JSDoc and regenerated outputs unless
  the docs pipeline explicitly requires a hand-authored page change

### Final certification gate

The SSR surface is considered release-clean only when all of the following are true:

```sh
bun run typecheck
bun run build
bun run test
bun run docs:ci
```

Formatting cleanup is intentionally not part of the SSR release gate until the repo-wide
formatting backlog is baselined separately.

### Required verification commands

```sh
bun run typecheck
bun run build
bun run test
bun run docs:ci
```

---

## Parallelization and Sequencing

### Track overview

| Track | Phases | File ownership |
| ----- | ------ | -------------- |
| A | A | chart/stat-card/tree-view schema and types only |
| B | B, C, E | `src/ssr/**`, `src/vite/**`, SSR/SSG docs, conformance tests |
| C | D | layout schema/runtime, universal styling docs/tests |
| D | F | public docs and certification pass |

### Dependency order

- Track A must complete first because `bun run build` is a release blocker.
- Track B and Track C can proceed in parallel after Track A is green.
- Track D starts only after Tracks B and C land, because docs and certification must reflect
  the final runtime behavior.

### Per-track sequencing table

| Track | Step 1 | Step 2 | Step 3 |
| ----- | ------ | ------ | ------ |
| A | reduce schema serialization complexity | restore exact exported config typing | run `typecheck` and `build` |
| B | add request envelope type and fallback order | harden `snapshotSsr()` and slingshot-ssg integration semantics | add conformance tests and update SSR/SSG docs/JSDoc |
| C | introduce `areas` plus legacy normalization | update layout runtime and slot-contract tests | update styling docs and deprecation language |
| D | publish parity matrix and examples | verify docs wording matches actual test-backed status | run final certification commands |

### Risk mitigation by track

| Track | Main risk | Mitigation |
| ----- | --------- | ---------- |
| A | build passes but consumer types silently degrade | verify exported config types remain exact and add focused component tests |
| B | request-envelope or SSG claims land without adapter/runner clarity, leaving false confidence | keep legacy fallback covered, test slingshot-ssg handoff explicitly, and mark parity rows `partial` until upstream behavior is proven |
| C | layout migration breaks existing manifests | accept legacy semantic `slots` during transition and test normalization explicitly |
| D | docs over-claim parity before runtime is proven | require matrix rows, owner tests, and `docs:ci` before sign-off |

### Branch strategy

The authoritative branch list for this spec is:

- `feature/ssr-release-clean-build`
- `feature/ssr-request-contract-and-conformance`
- `feature/ssg-contract-and-build-integration`
- `feature/universal-styling-layout-normalization`
- `feature/ssr-docs-and-certification`

The branch names above are authoritative. The ASCII diagram below is illustrative only and omits
the dedicated SSG branch.

```text
origin/main
├── feature/ssr-release-clean-build
├── feature/ssr-request-contract-and-conformance
├── feature/universal-styling-layout-normalization
└── feature/ssr-docs-and-certification
```

### Why these tracks are independent

- Track A only touches component schema/type files involved in build emission.
- Track B owns SSR/Vite runtime, SSG integration, and parity files.
- Track C owns layout and universal styling contract files.
- Track D owns docs and release validation only after the runtime contracts stabilize.

### Agent execution checklist

1. read root `CLAUDE.md`, `src/ssr/CLAUDE.md`, and this spec
2. complete Phase A first and get `build` green
3. complete Phase B before making any "runtime is robust" claim
4. complete Phase C before making any "SSR/SSG path is complete" claim
5. complete Phase D after Phase C
6. complete Phase E only after Phases B, C, and D have stabilized
7. complete Phase F last so docs and certification match the landed runtime behavior
8. independently verify JSDoc and docs impact before closing each phase
9. run the final certification commands before closing

---

## Definition of Done

### Per-phase

- Phase A: `typecheck` and `build` are green
- Phase B: SSR conformance tests pass, request contract preference order is explicit, and any
  public type export decision is documented
- Phase C: SSG prerequisites, build order, warning behavior, and option combinations are
  documented and test-backed
- Phase D: layout no longer overloads `slots`, legacy migration path is tested, and docs mark
  the alias deprecated
- Phase E: parity matrix exists, is backed by tests, and no public docs claim more than the
  matrix says
- Phase F: docs and certification commands are green

### Full completion

- `bun run typecheck` passes
- `bun run build` passes
- `bun run test` passes
- `bun run docs:ci` passes
- parity matrix is published and source-backed
- universal styling contract has one meaning for `slots`
- no docs claim “full parity with Next.js” without the conformance matrix
