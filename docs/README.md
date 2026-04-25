# Snapshot Documentation

Snapshot is the frontend SDK + config-driven UI layer for bunshot-powered backends.
You describe your application as a JSON manifest; Snapshot renders it as a React app
with routing, data fetching, theming, forms, and inter-component communication.

---

## Start here

**New to Snapshot?** Read in this order:

1. **[Getting Started](./getting-started.md)** — Install, write your first manifest, understand the three mental models
2. **[CLI Reference](./cli.md)** — `snapshot init`, `snapshot sync`, Vite plugin, generated file structure
3. **[Component Reference](./components.md)** — Every component with fields and examples
4. **[Data Binding](./data-binding.md)** — How components talk to each other via `id` / `from`
5. **[Actions](./actions.md)** — What happens when users interact: navigate, submit, open modals, toast
6. **[Tokens](./tokens.md)** — Themes, flavors, colors, spacing, and dark mode
7. **[Tailwind](./tailwind.md)** — Tailwind v4 integration, scaffold theme, `--sn-*` token bridging
8. **[Presets](./presets.md)** — Build a CRUD page, dashboard, or settings page in 10 lines

---

## Reading paths

### "I want to build a data-heavy admin app"
1. [Getting Started → Tutorial](./getting-started.md#tutorial-build-a-project-tracker)
2. [Components → data-table, stat-card, detail-card, chart, feed](./components.md)
3. [Data Binding → filter chain, reactive panels](./data-binding.md)
4. [Presets → crudPage, dashboardPage](./presets.md)

### "I want to build a settings or onboarding flow"
1. [Components → auto-form, wizard, tabs](./components.md)
2. [Actions → form submission, onSuccess chains](./actions.md)
3. [Presets → settingsPage](./presets.md)

### "I want to customize the look and feel"
1. [Tokens → flavors, color overrides, dark mode](./tokens.md)
2. [Customization → component tokens, custom flavors, responsive values](./customization.md)
3. [Tailwind → scaffold theme, dark mode utilities, bridging the two systems](./tailwind.md)

### "I want to scaffold a new app from scratch"
1. [CLI → snapshot init prompts, generated structure, .env](./cli.md)
2. [Tailwind → scaffold theme, dark mode](./tailwind.md)
3. [Getting Started → ManifestApp, PageRenderer](./getting-started.md)

### "I want to add my own React components"
1. [Getting Started → Level 2: custom components](./getting-started.md#option-c-level-2--custom-components-alongside-config)
2. [Getting Started → Level 3: headless hooks](./getting-started.md#option-d-level-3--headless-hooks)

### "I'm a contributor to Snapshot itself"
1. [Engineering Rules](./engineering-rules.md) — Code patterns, conventions, definition of done
2. [Spec Process](./spec-process.md) — How to write implementation specs

---

## All docs

| File | What it covers |
|------|----------------|
| [getting-started.md](./getting-started.md) | Install, quick start, 6-step tutorial, mental models, ManifestApp/PageRenderer, troubleshooting |
| [components.md](./components.md) | Every component: fields, examples, headless hooks |
| [data-binding.md](./data-binding.md) | `id`/`from` system, page vs. global context, wiring patterns |
| [actions.md](./actions.md) | All 9 action types, chaining, error handling, debugging |
| [tokens.md](./tokens.md) | Flavors, token names, dark mode, common mistakes |
| [customization.md](./customization.md) | Deep token customization, component tokens, custom flavors |
| [presets.md](./presets.md) | `crudPage`, `dashboardPage`, `settingsPage` — options and examples |
| [cli.md](./cli.md) | `snapshot init`, `snapshot sync`, Vite plugin, generated file structure, environment variables |
| [tailwind.md](./tailwind.md) | Tailwind v4 setup, scaffold theme variables, dark mode, `--sn-*` bridging |
| [vision.md](./vision.md) | Architecture, full-stack manifest vision, long-term roadmap |
| [engineering-rules.md](./engineering-rules.md) | Internal: code conventions, testing patterns, component file structure |
| [spec-process.md](./spec-process.md) | Internal: how to write implementation specs |

---

## Quick reference

### Manifest structure
```json
{
  "$schema": "...",
  "theme": { "flavor": "neutral", "overrides": { ... } },
  "globals": { "cartCount": { "data": "GET /api/cart/count" } },
  "nav": [{ "label": "Dashboard", "path": "/", "icon": "LayoutDashboard" }],
  "pages": {
    "/": { "layout": "sidebar", "content": [ ... ] }
  }
}
```

### Component types at a glance

**Data display:** `stat-card` `data-table` `detail-card` `list` `feed` `chart` `badge` `avatar` `alert` `progress` `skeleton` `empty-state` `tooltip` `separator` `notification-bell` `save-indicator` `highlighted-text` `favorite-button`

**Forms & input:** `form` `wizard` `input` `textarea` `switch` `toggle` `multi-select` `tag-selector` `inline-edit` `filter-bar` `quick-add` `entity-picker`

**Navigation:** `tabs` `accordion` `breadcrumb` `stepper` `tree-view`

**Overlays:** `modal` `drawer` `popover` `dropdown-menu` `context-menu` `command-palette` `scroll-area`

**Content:** `markdown` `code-block` `rich-text-editor` `rich-input` `file-uploader` `compare-view` `link-embed`

**Workflow:** `kanban` `calendar` `audit-log` `notification-feed` `timeline` `pricing-table`

**Communication:** `chat-window` `message-thread` `comment-section` `reaction-bar` `presence-indicator` `emoji-picker` `gif-picker` `typing-indicator`

**Layout:** `row` `heading` `button` `select` `custom`

### Action types at a glance
`navigate` `api` `open-modal` `close-modal` `refresh` `set-value` `download` `confirm` `toast`

### Built-in flavors
`neutral` `slate` `midnight` `violet` `rose` `emerald` `ocean` `sunset`
