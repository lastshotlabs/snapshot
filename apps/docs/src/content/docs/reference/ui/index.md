---
title: UI Reference
description: Generated from src/ui.ts and the declarations it re-exports.
draft: false
---

Generated from `src/ui.ts`.

## Contents

- [Tokens & Flavors](#tokens-flavors) (22)
- [API Client](#api-client) (2)
- [Context & Data Binding](#context-data-binding) (10)
- [State Runtime](#state-runtime) (14)
- [Actions](#actions) (17)
- [Manifest & Rendering](#manifest-rendering) (90)
- [Components — Data](#components-data) (117)
- [Components — Forms](#components-forms) (98)
- [Components — Communication](#components-communication) (48)
- [Components — Content](#components-content) (48)
- [Components — Overlay](#components-overlay) (43)
- [Components — Navigation](#components-navigation) (25)
- [Components — Layout](#components-layout) (59)
- [Components — Media](#components-media) (11)
- [Components — Primitives](#components-primitives) (18)
- [Component Utilities](#component-utilities) (4)
- [Page Presets](#page-presets) (26)
- [Hooks & Utilities](#hooks-utilities) (14)
- [Icons](#icons) (3)
- [Workflows](#workflows) (3)
- [Other](#other) (103)

<details>
<summary><strong>All exports (alphabetical)</strong></summary>

| Export | Kind | Source | Description |
|---|---|---|---|
| `AccordionBase` | function | `src/ui/components/navigation/accordion/standalone.tsx` | Standalone Accordion — an expandable/collapsible panel list with plain React children. No manifest context required. |
| `AccordionBaseItem` | interface | `src/ui/components/navigation/accordion/standalone.tsx` | No JSDoc description. |
| `AccordionBaseProps` | interface | `src/ui/components/navigation/accordion/standalone.tsx` | No JSDoc description. |
| `ActionBase` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `ActionConfig` | typealias | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `ActionExecuteFn` | typealias | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `actionSchema` | variable | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `ActivityFeedDef` | interface | `src/ui/presets/types.ts` | Feed section definition for dashboard-style presets. |
| `AlertBase` | function | `src/ui/components/data/alert/standalone.tsx` | Standalone Alert — a styled alert/notification box with optional icon, action button, and dismiss. No manifest context required. |
| `AlertBaseProps` | interface | `src/ui/components/data/alert/standalone.tsx` | No JSDoc description. |
| `AnalyticsConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `analyticsConfigSchema` — defaulted fields are optional. |
| `analyticsConfigSchema` | variable | `src/ui/manifest/schema.ts` | Manifest analytics runtime configuration. |
| `AnalyticsProvider` | interface | `src/ui/analytics/types.ts` | Analytics provider runtime contract. |
| `AnalyticsProviderFactory` | typealias | `src/ui/analytics/types.ts` | Factory used to create analytics providers per snapshot instance. |
| `AnalyticsProviderInitConfig` | interface | `src/ui/analytics/types.ts` | Analytics provider initialization payload. |
| `analyticsProviderSchema` | variable | `src/ui/manifest/schema.ts` | Analytics provider declaration schema. |
| `ApiAction` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `apiActionSchema` | variable | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `AppConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `appConfigSchema` — defaulted fields are optional. |
| `appConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the top-level manifest `app` section. |
| `AppContextProvider` | function | `src/ui/context/providers.tsx` | Provides persistent global state that survives route changes. Initializes globals from the manifest config. |
| `AppContextProviderProps` | interface | `src/ui/context/types.ts` | Props for AppContextProvider. Wraps the entire app to provide persistent global state. |
| `AssignWorkflowNode` | interface | `../frontend-contract/src/workflows/types.ts` | No JSDoc description. |
| `AtomRegistry` | interface | `src/ui/state/types.ts` | Registry of named state atoms. Backing store is shared per scope (app or route). |
| `AuditLogBase` | function | `src/ui/components/workflow/audit-log/standalone.tsx` | Standalone AuditLogBase — renders a filterable, paginated timeline of audit log entries with user avatars, relative timestamps, and expandable detail panels. No manifest context required. |
| `AuditLogBaseProps` | interface | `src/ui/components/workflow/audit-log/standalone.tsx` | No JSDoc description. |
| `AuditLogFilterEntry` | interface | `src/ui/components/workflow/audit-log/standalone.tsx` | No JSDoc description. |
| `AuthBrandingDef` | interface | `src/ui/presets/types.ts` | Branding and background options for the auth page preset. |
| `authPage` | function | `src/ui/presets/auth-page.ts` | Build a manifest page config for a common auth screen. |
| `AuthPageOptions` | interface | `src/ui/presets/types.ts` | Options for the `authPage` preset factory. |
| `authPresetConfigSchema` | variable | `src/ui/presets/schemas.ts` | Validate preset config for auth screens such as login, register, and password recovery. |
| `AuthProviderConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `authProviderSchema` — defaulted fields are optional. |
| `authProviderSchema` | variable | `src/ui/manifest/schema.ts` | Auth provider declaration schema.  Declared at `manifest.auth.providers.<name>`. |
| `AuthScreenConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `authScreenConfigSchema` — defaulted fields are optional. |
| `authScreenConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the manifest auth screen and auth workflow configuration. |
| `AutoForm` | function | `src/ui/components/forms/auto-form/component.tsx` | Config-driven form component with multi-column layout, conditional field visibility, and section grouping.  Supports client-side validation, submission to an API endpoint, manifest-aware resource mutation (invalidation + optimistic handling), workflow lifecycle hooks (`beforeSubmit`, `afterSubmit`, `error`), and action chaining on success/error. Publishes form state to the page context when an `id` is configured. |
| `AutoFormBase` | function | `src/ui/components/forms/auto-form/standalone.tsx` | Standalone AutoFormBase -- renders a config-driven form with fields, sections, validation, and submit/reset actions. No manifest context required. |
| `AutoFormBaseProps` | interface | `src/ui/components/forms/auto-form/standalone.tsx` | No JSDoc description. |
| `AutoFormConfig` | typealias | `src/ui/components/forms/auto-form/types.ts` | Inferred type for the AutoForm component config. |
| `autoFormConfigSchema` | variable | `src/ui/components/forms/auto-form/schema.ts` | Zod schema for the AutoForm component config.  Defines a config-driven form that auto-generates fields from config or OpenAPI schema. Supports validation, submission, action chaining, multi-column layout, conditional field visibility, and field grouping. |
| `AutoFormFieldConfig` | interface | `src/ui/components/forms/auto-form/standalone.tsx` | No JSDoc description. |
| `AutoFormSectionConfig` | interface | `src/ui/components/forms/auto-form/standalone.tsx` | No JSDoc description. |
| `AvatarBase` | function | `src/ui/components/data/avatar/standalone.tsx` | Standalone Avatar — image, initials, or icon fallback. No manifest context required. |
| `AvatarBaseProps` | interface | `src/ui/components/data/avatar/standalone.tsx` | No JSDoc description. |
| `AvatarGroup` | function | `src/ui/components/data/avatar-group/component.tsx` | No JSDoc description. |
| `AvatarGroupBase` | function | `src/ui/components/data/avatar-group/standalone.tsx` | Standalone AvatarGroup — overlapping avatars with +N overflow. No manifest context required. |
| `AvatarGroupBaseProps` | interface | `src/ui/components/data/avatar-group/standalone.tsx` | No JSDoc description. |
| `AvatarGroupConfig` | typealias | `src/ui/components/data/avatar-group/types.ts` | Inferred config type from the AvatarGroup Zod schema. |
| `avatarGroupConfigSchema` | variable | `src/ui/components/data/avatar-group/schema.ts` | Zod config schema for the AvatarGroup component.  Displays a row of overlapping avatars with an optional "+N" overflow count. Commonly used for showing team members, assignees, or participants. |
| `BadgeBase` | function | `src/ui/components/data/badge/standalone.tsx` | Standalone Badge — a small label with color-coded variants. No manifest context required. |
| `BadgeBaseProps` | interface | `src/ui/components/data/badge/standalone.tsx` | No JSDoc description. |
| `BannerBase` | function | `src/ui/components/content/banner/standalone.tsx` | Standalone Banner — a full-width hero section with background, overlay, and content alignment. No manifest context required. |
| `BannerBaseProps` | interface | `src/ui/components/content/banner/standalone.tsx` | No JSDoc description. |
| `BaseComponentConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `baseComponentConfigSchema` — defaulted fields are optional. |
| `baseComponentConfigSchema` | variable | `src/ui/manifest/schema.ts` | Shared base schema applied to all manifest-driven components. |
| `bootBuiltins` | function | `src/ui/manifest/boot-builtins.ts` | Register all built-in manifest registries exactly once. |
| `BoxBase` | function | `src/ui/components/layout/box/standalone.tsx` | Standalone Box -- a generic container element with configurable HTML tag. No manifest context required. |
| `BoxBaseProps` | interface | `src/ui/components/layout/box/standalone.tsx` | No JSDoc description. |
| `BreadcrumbAutoConfig` | interface | `src/ui/manifest/breadcrumbs.ts` | Auto-breadcrumb configuration used to derive labels and optional home state from routes. |
| `BreadcrumbBase` | function | `src/ui/components/navigation/breadcrumb/standalone.tsx` | Standalone Breadcrumb — a navigation trail rendered with plain React props. No manifest context required. |
| `BreadcrumbBaseItem` | interface | `src/ui/components/navigation/breadcrumb/standalone.tsx` | No JSDoc description. |
| `BreadcrumbBaseProps` | interface | `src/ui/components/navigation/breadcrumb/standalone.tsx` | No JSDoc description. |
| `BreadcrumbItem` | interface | `src/ui/manifest/breadcrumbs.ts` | A single breadcrumb entry rendered from the matched route stack. |
| `Breakpoint` | typealias | `src/ui/hooks/use-breakpoint.ts` | All breakpoint names including `"default"` (below `sm`). |
| `buildEmojiMap` | function | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | Builds a shortcode lookup map from an array of custom emojis. |
| `buildRequestUrl` | function | `../frontend-contract/src/resources/index.ts` | No JSDoc description. |
| `BulkAction` | typealias | `src/ui/components/data/data-table/types.ts` | Inferred bulk action type. |
| `bulkActionSchema` | variable | `src/ui/components/data/data-table/schema.ts` | Schema for a bulk action on selected rows. |
| `Button` | function | `src/ui/components/forms/button/component.tsx` | No JSDoc description. |
| `ButtonBase` | function | `src/ui/components/forms/button/standalone.tsx` | Standalone ButtonBase -- a styled button that works with plain React props. No manifest context required. |
| `ButtonBaseProps` | interface | `src/ui/components/forms/button/standalone.tsx` | No JSDoc description. |
| `ButtonConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `buttonConfigSchema` — defaulted fields are optional. |
| `buttonConfigSchema` | variable | `src/ui/components/forms/button/schema.ts` | No JSDoc description. |
| `CalendarBase` | function | `src/ui/components/workflow/calendar/standalone.tsx` | Standalone CalendarBase — renders a month or week calendar grid with event pills, navigation controls, and optional week numbers. No manifest context required. |
| `CalendarBaseProps` | interface | `src/ui/components/workflow/calendar/standalone.tsx` | No JSDoc description. |
| `CalendarEventEntry` | interface | `src/ui/components/workflow/calendar/standalone.tsx` | No JSDoc description. |
| `CaptureWorkflowNode` | interface | `../frontend-contract/src/workflows/types.ts` | No JSDoc description. |
| `Card` | function | `src/ui/components/layout/card/component.tsx` | Manifest adapter — resolves config refs, renders manifest children, delegates layout to CardBase. |
| `CardBase` | function | `src/ui/components/layout/card/standalone.tsx` | Standalone Card — a styled container with optional title/subtitle and standard React children. No manifest context required. |
| `CardBaseProps` | interface | `src/ui/components/layout/card/standalone.tsx` | No JSDoc description. |
| `CardConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `cardConfigSchema` — defaulted fields are optional. |
| `cardConfigSchema` | variable | `src/ui/manifest/schema.ts` | Zod config schema for the Card component. Defines a card container with optional title, subtitle, children, gap, and suspense fallback. |
| `CarouselBase` | function | `src/ui/components/media/carousel/standalone.tsx` | Standalone CarouselBase — renders a slide carousel with auto-play, arrow navigation, and dot indicators. Pauses on hover. No manifest context required. |
| `CarouselBaseProps` | interface | `src/ui/components/media/carousel/standalone.tsx` | No JSDoc description. |
| `Chart` | function | `src/ui/components/data/chart/component.tsx` | No JSDoc description. |
| `ChartBase` | function | `src/ui/components/data/chart/standalone.tsx` | Standalone Chart — renders data-driven charts via recharts. No manifest context required. |
| `ChartBaseProps` | interface | `src/ui/components/data/chart/standalone.tsx` | No JSDoc description. |
| `ChartBaseSeries` | interface | `src/ui/components/data/chart/standalone.tsx` | No JSDoc description. |
| `ChartConfig` | typealias | `src/ui/components/data/chart/types.ts` | Inferred type for the Chart component configuration. |
| `ChartDef` | interface | `src/ui/presets/types.ts` | Chart section definition for dashboard-style presets. |
| `chartSchema` | variable | `src/ui/components/data/chart/schema.ts` | Zod schema for the Chart component configuration.  Renders a data visualization (bar, line, area, pie, donut) from an endpoint or from-ref. Uses Recharts under the hood. Colors default to `--sn-chart-1` through `--sn-chart-5` tokens. |
| `ChatWindow` | function | `src/ui/components/communication/chat-window/component.tsx` | Manifest adapter — resolves config refs, composes manifest sub-components, delegates to ChatWindowBase. |
| `ChatWindowBase` | function | `src/ui/components/communication/chat-window/standalone.tsx` | Standalone ChatWindow — composable chat container with header, message thread, typing indicator, and input slots. No manifest context required. |
| `ChatWindowBaseProps` | interface | `src/ui/components/communication/chat-window/standalone.tsx` | No JSDoc description. |
| `ChatWindowConfig` | typealias | `src/ui/components/communication/chat-window/types.ts` | Inferred config type from the ChatWindow Zod schema. |
| `chatWindowConfigSchema` | variable | `src/ui/components/communication/chat-window/schema.ts` | Zod config schema for the ChatWindow component.  A full chat interface composing a message thread, rich input, and typing indicator into a single component. |
| `clearPersistedState` | function | `src/ui/state/persist.ts` | Remove a persisted state value from the selected browser storage area. |
| `CloseModalAction` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `closeModalActionSchema` | variable | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `Code` | function | `src/ui/components/content/code/component.tsx` | Manifest adapter — resolves config refs and delegates to CodeBase. |
| `CodeBase` | function | `src/ui/components/content/code/standalone.tsx` | Standalone Code — an inline code element for displaying code snippets within flowing text. No manifest context required. |
| `CodeBaseProps` | interface | `src/ui/components/content/code/standalone.tsx` | No JSDoc description. |
| `CodeBlockBase` | function | `src/ui/components/content/code-block/standalone.tsx` | Standalone CodeBlock — displays code with syntax highlighting, optional line numbers, copy button, and title bar. No manifest context required. |
| `CodeBlockBaseProps` | interface | `src/ui/components/content/code-block/standalone.tsx` | No JSDoc description. |
| `CodeConfig` | typealias | `src/ui/components/content/code/types.ts` | Inferred config type for the Code component. |
| `codeConfigSchema` | variable | `src/ui/components/content/code/schema.ts` | Inline code primitive schema for manifest-rendered code snippets. |
| `CollapsibleBase` | function | `src/ui/components/layout/collapsible/standalone.tsx` | Standalone Collapsible -- an animated expand/collapse container with an optional trigger. No manifest context required. |
| `CollapsibleBaseProps` | interface | `src/ui/components/layout/collapsible/standalone.tsx` | No JSDoc description. |
| `ColorPicker` | function | `src/ui/components/forms/color-picker/component.tsx` | No JSDoc description. |
| `ColorPickerConfig` | typealias | `src/ui/components/forms/color-picker/types.ts` | Config for the manifest-driven color picker component. |
| `colorPickerConfigSchema` | variable | `src/ui/components/forms/color-picker/schema.ts` | Schema for color picker components with optional swatches, alpha, and change actions. |
| `ColorPickerField` | function | `src/ui/components/forms/color-picker/standalone.tsx` | Standalone ColorPickerField -- a color picker with optional swatches, alpha slider, and custom hex input. No manifest context required. |
| `ColorPickerFieldProps` | interface | `src/ui/components/forms/color-picker/standalone.tsx` | No JSDoc description. |
| `colorToOklch` | function | `src/ui/tokens/color.ts` | Convert any supported color string to OKLCH values. Supports: hex (#rgb, #rrggbb), oklch strings ("L C H"), and oklch() CSS function. |
| `Column` | function | `src/ui/components/layout/column/component.tsx` | No JSDoc description. |
| `ColumnBase` | function | `src/ui/components/layout/column/standalone.tsx` | Standalone Column -- a vertical flex container. No manifest context required. |
| `ColumnBaseProps` | interface | `src/ui/components/layout/column/standalone.tsx` | No JSDoc description. |
| `ColumnConfig` | typealias | `src/ui/components/data/data-table/types.ts` | Inferred column configuration type. |
| `columnConfigSchema` | variable | `src/ui/components/data/data-table/schema.ts` | Schema for individual column configuration. |
| `ColumnDef` | interface | `src/ui/presets/types.ts` | A single column definition for the CRUD page table. |
| `CommandPalette` | function | `src/ui/components/overlay/command-palette/component.tsx` | CommandPalette — search-driven command palette that renders static groups or fetches remote results, then dispatches manifest actions for the selected command. |
| `CommandPaletteBase` | function | `src/ui/components/overlay/command-palette/standalone.tsx` | Standalone CommandPalette — a search-driven command list with keyboard navigation. No manifest context required. |
| `CommandPaletteBaseGroup` | interface | `src/ui/components/overlay/command-palette/standalone.tsx` | No JSDoc description. |
| `CommandPaletteBaseItem` | interface | `src/ui/components/overlay/command-palette/standalone.tsx` | No JSDoc description. |
| `CommandPaletteBaseProps` | interface | `src/ui/components/overlay/command-palette/standalone.tsx` | No JSDoc description. |
| `CommandPaletteConfig` | typealias | `src/ui/components/overlay/command-palette/types.ts` | Inferred config type for the CommandPalette component. |
| `commandPaletteConfigSchema` | variable | `src/ui/components/overlay/command-palette/schema.ts` | Zod config schema for the CommandPalette component. A keyboard-driven overlay that groups commands, supports search with remote endpoints, tracks recent items, and dispatches actions on selection. |
| `CommentSection` | function | `src/ui/components/communication/comment-section/component.tsx` | Manifest adapter — resolves data endpoint, wires actions, delegates to CommentSectionBase. |
| `CommentSectionBase` | function | `src/ui/components/communication/comment-section/standalone.tsx` | Standalone CommentSection — threaded comment list with avatars, timestamps, optional delete actions, and a composable input slot. No manifest context required. |
| `CommentSectionBaseProps` | interface | `src/ui/components/communication/comment-section/standalone.tsx` | No JSDoc description. |
| `CommentSectionConfig` | typealias | `src/ui/components/communication/comment-section/types.ts` | Inferred config type from the CommentSection Zod schema. |
| `commentSectionConfigSchema` | variable | `src/ui/components/communication/comment-section/schema.ts` | Zod config schema for the CommentSection component.  Renders a comment list with nested replies and an embedded rich input for posting new comments. |
| `CompareView` | function | `src/ui/components/content/compare-view/component.tsx` | Manifest adapter — resolves config refs and delegates to CompareViewBase. |
| `CompareViewBase` | function | `src/ui/components/content/compare-view/standalone.tsx` | Standalone CompareView — a side-by-side diff viewer for comparing two text blocks. No manifest context required. |
| `CompareViewBaseProps` | interface | `src/ui/components/content/compare-view/standalone.tsx` | No JSDoc description. |
| `CompareViewConfig` | typealias | `src/ui/components/content/compare-view/types.ts` | Inferred config type from the CompareView Zod schema. |
| `compareViewConfigSchema` | variable | `src/ui/components/content/compare-view/schema.ts` | Zod config schema for the CompareView component.  Defines all manifest-settable fields for a side-by-side content comparison view with diff highlighting. |
| `CompiledManifest` | interface | `src/ui/manifest/types.ts` | Runtime manifest shape produced by `compileManifest()`. |
| `CompiledRoute` | interface | `src/ui/manifest/types.ts` | Runtime route shape produced by `compileManifest()`. |
| `compileManifest` | function | `src/ui/manifest/compiler.ts` | Parse and compile a manifest into the runtime shape. |
| `ComponentConfig` | typealias | `src/ui/manifest/types.ts` | Runtime config union for manifest-renderable components. |
| `componentConfigSchema` | variable | `src/ui/manifest/schema.ts` | Union schema covering every component config Snapshot can render from a manifest. |
| `ComponentDataResult` | interface | `src/ui/components/_base/use-component-data.ts` | Result returned by `useComponentData`. Provides the fetched data, loading/error states, and a refetch function. |
| `ComponentGroupBase` | function | `src/ui/components/_base/component-group/standalone.tsx` | Standalone ComponentGroup — a simple wrapper for pre-rendered group content. No manifest context required. |
| `ComponentGroupBaseProps` | interface | `src/ui/components/_base/component-group/standalone.tsx` | No JSDoc description. |
| `ComponentRenderer` | function | `src/ui/manifest/renderer.tsx` | Renders a single component from its manifest config. |
| `ComponentRendererProps` | interface | `src/ui/manifest/renderer.tsx` | Props for the ComponentRenderer component. |
| `componentsConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the top-level `components` section of a manifest. |
| `ComponentTokens` | typealias | `../frontend-contract/src/tokens/types.ts` | No JSDoc description. |
| `componentTokensSchema` | variable | `../frontend-contract/src/tokens/schema.ts` | No JSDoc description. |
| `ConfigDrivenComponent` | typealias | `src/ui/manifest/types.ts` | React component type that can participate in the config-driven manifest runtime. |
| `ConfirmAction` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `confirmActionSchema` | variable | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `ConfirmDialog` | function | `src/ui/actions/confirm.tsx` | Render the global confirmation dialog for requests queued through `useConfirmManager`. |
| `ConfirmDialogBase` | function | `src/ui/components/overlay/confirm-dialog/standalone.tsx` | Standalone ConfirmDialog — a confirmation dialog built on ModalBase with plain React props. No manifest context required. |
| `ConfirmDialogBaseProps` | interface | `src/ui/components/overlay/confirm-dialog/standalone.tsx` | No JSDoc description. |
| `ConfirmDialogComponent` | function | `src/ui/components/overlay/confirm-dialog/component.tsx` | Manifest-driven confirmation dialog adapter.  Resolves primitive values and actions from manifest config, then delegates all rendering to `ConfirmDialogBase`. |
| `ConfirmDialogConfig` | typealias | `src/ui/components/overlay/confirm-dialog/types.ts` | Input config type for the ConfirmDialog component. |
| `confirmDialogConfigSchema` | variable | `src/ui/components/overlay/confirm-dialog/schema.ts` | Overlay alias schema for manifest-driven confirmation dialogs. |
| `ConfirmManager` | interface | `src/ui/actions/confirm.tsx` | Imperative API for opening a confirmation dialog from manifest actions or custom UI. |
| `ConfirmOptions` | typealias | `src/ui/actions/confirm.tsx` | Options accepted when opening a confirmation dialog. |
| `ConfirmRequest` | interface | `src/ui/actions/confirm.tsx` | Internal confirm-dialog request stored in the atom-backed manager queue. |
| `ContainerBase` | function | `src/ui/components/layout/container/standalone.tsx` | Standalone Container -- a centered, max-width-constrained wrapper. No manifest context required. |
| `ContainerBaseProps` | interface | `src/ui/components/layout/container/standalone.tsx` | No JSDoc description. |
| `ContextMenu` | function | `src/ui/components/overlay/context-menu/component.tsx` | Manifest-driven context menu adapter.  Resolves primitive values and actions from manifest config, handles visibility and state publishing, then delegates all rendering to `ContextMenuBase`. |
| `ContextMenuBase` | function | `src/ui/components/overlay/context-menu/standalone.tsx` | Standalone ContextMenu — a right-click context menu with plain React props. No manifest context required. |
| `ContextMenuBaseEntry` | typealias | `src/ui/components/overlay/context-menu/standalone.tsx` | No JSDoc description. |
| `ContextMenuBaseItem` | interface | `src/ui/components/overlay/context-menu/standalone.tsx` | No JSDoc description. |
| `ContextMenuBaseProps` | interface | `src/ui/components/overlay/context-menu/standalone.tsx` | No JSDoc description. |
| `ContextMenuConfig` | typealias | `src/ui/components/overlay/context-menu/types.ts` | Inferred config type for the ContextMenu component. |
| `contextMenuConfigSchema` | variable | `src/ui/components/overlay/context-menu/schema.ts` | Zod schema for the ContextMenu component.  Defines a right-click menu with styleable trigger, panel, item, label, and separator surfaces. Visibility can be driven by a boolean or a binding reference. |
| `contrastRatio` | function | `src/ui/tokens/color.ts` | Calculate the WCAG contrast ratio between two supported color values. |
| `CopyAction` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `CopyToClipboardAction` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `copyToClipboardActionSchema` | variable | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `crudPage` | function | `src/ui/presets/crud-page.ts` | Builds a manifest `PageConfig` for a standard CRUD page.  Consumers drop the result into their manifest's `pages` record:  ```ts const manifest = {   pages: {     "/users": crudPage({       title: "Users",       listEndpoint: "GET /api/users",       createEndpoint: "POST /api/users",       deleteEndpoint: "DELETE /api/users/{id}",       columns: [         { key: "name", label: "Name" },         { key: "email", label: "Email" },         { key: "role", label: "Role", badge: true },       ],       createForm: {         fields: [           { key: "name", type: "text", label: "Name", required: true },           { key: "email", type: "email", label: "Email", required: true },         ],       },     }),   }, }; ``` |
| `CrudPageOptions` | interface | `src/ui/presets/types.ts` | Options for the `crudPage` preset factory. Produces a full CRUD page with a data table, create/edit modals, and row actions. |
| `crudPresetConfigSchema` | variable | `src/ui/presets/schemas.ts` | Validate preset config for a CRUD page assembled from list/form primitives. |
| `CUSTOM_EMOJI_CSS` | variable | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | CSS for custom emoji sizing. Custom emojis render as inline images sized to match surrounding text. |
| `customComponentDeclarationSchema` | variable | `src/ui/manifest/schema.ts` | Schema for a custom component declaration under `components.custom`. |
| `customComponentPropSchema` | variable | `src/ui/manifest/schema.ts` | Schema for a declared prop on a manifest custom component registration. |
| `CustomEmoji` | interface | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | Shape of a custom emoji entry. |
| `dashboardPage` | function | `src/ui/presets/dashboard-page.ts` | Builds a manifest `PageConfig` for a dashboard page.  Consumers drop the result into their manifest's `pages` record:  ```ts const manifest = {   pages: {     "/dashboard": dashboardPage({       title: "Overview",       stats: [         { label: "Total Users", endpoint: "GET /api/stats/users", valueKey: "count" },         { label: "Revenue", endpoint: "GET /api/stats/revenue", valueKey: "total", format: "currency" },         { label: "Orders", endpoint: "GET /api/stats/orders", valueKey: "total", format: "number" },         { label: "Conversion", endpoint: "GET /api/stats/conversion", valueKey: "rate", format: "percent" },       ],       recentActivity: "GET /api/activity",     }),   }, }; ``` |
| `DashboardPageOptions` | interface | `src/ui/presets/types.ts` | Options for the `dashboardPage` preset factory. Produces a dashboard with stat cards and an optional activity feed. |
| `dashboardPresetConfigSchema` | variable | `src/ui/presets/schemas.ts` | Validate preset config for a dashboard page with stats, charts, and activity sections. |
| `dataSourceSchema` | variable | `../frontend-contract/src/resources/index.ts` | No JSDoc description. |
| `DataTable` | function | `src/ui/components/data/data-table/component.tsx` | Config-driven DataTable component.  For simple tables (no drag-and-drop, virtual scroll, context menus, or expandable rows), delegates to the standalone DataTableBase. For advanced features, falls back to the full manifest-based rendering. |
| `DataTableBase` | function | `src/ui/components/data/data-table/standalone.tsx` | Standalone DataTable — feature-rich data table with sorting, pagination, selection, and search. No manifest context required. |
| `DataTableBaseColumn` | interface | `src/ui/components/data/data-table/standalone.tsx` | No JSDoc description. |
| `DataTableBaseProps` | interface | `src/ui/components/data/data-table/standalone.tsx` | No JSDoc description. |
| `DataTableConfig` | typealias | `src/ui/components/data/data-table/types.ts` | Inferred DataTable configuration type from the Zod schema. |
| `dataTableConfigSchema` | variable | `src/ui/components/data/data-table/schema.ts` | Zod schema for the DataTable component configuration.  Defines a config-driven data table with sorting, pagination, filtering, selection, search, row actions, and bulk actions. |
| `DatePicker` | function | `src/ui/components/forms/date-picker/component.tsx` | No JSDoc description. |
| `DatePickerConfig` | typealias | `src/ui/components/forms/date-picker/types.ts` | Config for the manifest-driven date picker component. |
| `datePickerConfigSchema` | variable | `src/ui/components/forms/date-picker/schema.ts` | Schema for date picker components covering single, range, and multi-date selection. |
| `DatePickerField` | function | `src/ui/components/forms/date-picker/standalone.tsx` | Standalone DatePickerField -- date picker supporting single, range, and multiple selection modes with presets and disabled dates. No manifest context required. |
| `DatePickerFieldProps` | interface | `src/ui/components/forms/date-picker/standalone.tsx` | No JSDoc description. |
| `debounceAction` | function | `src/ui/actions/timing.ts` | Debounce async or sync action execution by key and resolve all pending callers with the final invocation result. |
| `DefaultErrorBase` | function | `src/ui/components/feedback/default-error/standalone.tsx` | Standalone DefaultError — renders an error feedback card with optional retry button. No manifest context required. |
| `DefaultErrorBaseProps` | interface | `src/ui/components/feedback/default-error/standalone.tsx` | No JSDoc description. |
| `DefaultLoadingBase` | function | `src/ui/components/feedback/default-loading/standalone.tsx` | Standalone DefaultLoading — renders a loading spinner with label. No manifest context required. |
| `DefaultLoadingBaseProps` | interface | `src/ui/components/feedback/default-loading/standalone.tsx` | No JSDoc description. |
| `DefaultNotFoundBase` | function | `src/ui/components/feedback/default-not-found/standalone.tsx` | Standalone DefaultNotFound — renders a 404 page with title and description. No manifest context required. |
| `DefaultNotFoundBaseProps` | interface | `src/ui/components/feedback/default-not-found/standalone.tsx` | No JSDoc description. |
| `DefaultOfflineBase` | function | `src/ui/components/feedback/default-offline/standalone.tsx` | Standalone DefaultOffline — renders an offline status banner. No manifest context required. |
| `DefaultOfflineBaseProps` | interface | `src/ui/components/feedback/default-offline/standalone.tsx` | No JSDoc description. |
| `defineFlavor` | function | `src/ui/tokens/flavors.ts` | Define and register a new flavor. If a flavor with the same name already exists, it is replaced. |
| `defineManifest` | function | `src/ui/manifest/compiler.ts` | Define a manifest without compiling it. |
| `deriveDarkVariant` | function | `src/ui/tokens/color.ts` | Derive a dark mode variant of a light color. Adjusts lightness and chroma for dark mode readability: - If the color is light (L > 0.5), reduce lightness moderately - If the color is dark (L <= 0.5), increase lightness for dark backgrounds - Boost chroma slightly for vibrancy in dark mode |
| `deriveForeground` | function | `src/ui/tokens/color.ts` | Derive a foreground color that passes WCAG AA contrast (4.5:1) against the given background color. Returns a light or dark foreground. |
| `DetailCard` | function | `src/ui/components/data/detail-card/component.tsx` | No JSDoc description. |
| `DetailCardBase` | function | `src/ui/components/data/detail-card/standalone.tsx` | Standalone DetailCard — data-driven detail view with formatted fields and header actions. No manifest context required. |
| `DetailCardBaseAction` | interface | `src/ui/components/data/detail-card/standalone.tsx` | No JSDoc description. |
| `DetailCardBaseField` | interface | `src/ui/components/data/detail-card/standalone.tsx` | No JSDoc description. |
| `DetailCardBaseProps` | interface | `src/ui/components/data/detail-card/standalone.tsx` | No JSDoc description. |
| `DetailCardConfig` | typealias | `src/ui/components/data/detail-card/schema.ts` | DetailCard configuration type inferred from the schema. |
| `detailCardConfigSchema` | variable | `src/ui/components/data/detail-card/schema.ts` | Zod schema for DetailCard component configuration.  The detail card displays a single record's fields in a key-value layout. Used in drawers, modals, and detail pages. |
| `detectPlatform` | function | `src/ui/components/content/link-embed/platform.ts` | Detects the platform from a URL and extracts embed info. |
| `DividerBase` | function | `src/ui/components/primitives/divider/standalone.tsx` | Standalone Divider — renders a horizontal or vertical separator line, optionally with a centered label. No manifest context required. |
| `DividerBaseProps` | interface | `src/ui/components/primitives/divider/standalone.tsx` | No JSDoc description. |
| `DownloadAction` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `downloadActionSchema` | variable | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `DrawerBase` | function | `src/ui/components/overlay/drawer/standalone.tsx` | Standalone Drawer — a sliding panel overlay with plain React props. No manifest context required. |
| `DrawerBaseFooterAction` | interface | `src/ui/components/overlay/drawer/standalone.tsx` | No JSDoc description. |
| `DrawerBaseProps` | interface | `src/ui/components/overlay/drawer/standalone.tsx` | No JSDoc description. |
| `DrawerComponent` | function | `src/ui/components/overlay/drawer/component.tsx` | No JSDoc description. |
| `DrawerConfig` | typealias | `src/ui/components/overlay/drawer/schema.ts` | Inferred type for drawer config. |
| `drawerConfigSchema` | variable | `src/ui/components/overlay/drawer/schema.ts` | Zod schema for drawer component config. Drawers are slide-in panels from the left or right edge of the screen. Like modals, they are opened/closed via the modal manager. |
| `DropdownMenuBase` | function | `src/ui/components/overlay/dropdown-menu/standalone.tsx` | Standalone DropdownMenu — a button-triggered floating menu with plain React props. No manifest context required. |
| `DropdownMenuBaseEntry` | typealias | `src/ui/components/overlay/dropdown-menu/standalone.tsx` | No JSDoc description. |
| `DropdownMenuBaseItem` | interface | `src/ui/components/overlay/dropdown-menu/standalone.tsx` | No JSDoc description. |
| `DropdownMenuBaseProps` | interface | `src/ui/components/overlay/dropdown-menu/standalone.tsx` | No JSDoc description. |
| `DropdownMenuBaseTrigger` | interface | `src/ui/components/overlay/dropdown-menu/standalone.tsx` | No JSDoc description. |
| `EmbedBase` | function | `src/ui/components/media/embed/standalone.tsx` | Standalone Embed — a responsive iframe container for embedding external content. No manifest context required. |
| `EmbedBaseProps` | interface | `src/ui/components/media/embed/standalone.tsx` | No JSDoc description. |
| `EmojiPicker` | function | `src/ui/components/communication/emoji-picker/component.tsx` | Manifest adapter — resolves custom emoji data, wires actions/publish, delegates to EmojiPickerBase. |
| `EmojiPickerBase` | function | `src/ui/components/communication/emoji-picker/standalone.tsx` | Standalone EmojiPicker — searchable emoji grid with category tabs and custom emoji support. No manifest context required. |
| `EmojiPickerBaseProps` | interface | `src/ui/components/communication/emoji-picker/standalone.tsx` | No JSDoc description. |
| `EmojiPickerConfig` | typealias | `src/ui/components/communication/emoji-picker/types.ts` | Inferred config type from the EmojiPicker Zod schema. |
| `emojiPickerConfigSchema` | variable | `src/ui/components/communication/emoji-picker/schema.ts` | Zod config schema for the EmojiPicker component. Renders a searchable grid of emojis organized by category. |
| `EmptyStateBase` | function | `src/ui/components/data/empty-state/standalone.tsx` | Standalone EmptyState — a centered message with optional icon and action. No manifest context required. |
| `EmptyStateBaseProps` | interface | `src/ui/components/data/empty-state/standalone.tsx` | No JSDoc description. |
| `EmptyStateDef` | interface | `src/ui/presets/types.ts` | Empty-state content shown by preset-generated pages. |
| `endpointTargetSchema` | variable | `../frontend-contract/src/resources/index.ts` | No JSDoc description. |
| `EntityPicker` | function | `src/ui/components/data/entity-picker/component.tsx` | No JSDoc description. |
| `EntityPickerBase` | function | `src/ui/components/data/entity-picker/standalone.tsx` | Standalone EntityPicker — dropdown with search, single/multi select. No manifest context required. |
| `EntityPickerBaseProps` | interface | `src/ui/components/data/entity-picker/standalone.tsx` | No JSDoc description. |
| `EntityPickerConfig` | typealias | `src/ui/components/data/entity-picker/types.ts` | Inferred config type from the EntityPicker Zod schema. |
| `entityPickerConfigSchema` | variable | `src/ui/components/data/entity-picker/schema.ts` | Zod config schema for the EntityPicker component.  A searchable dropdown for selecting entities (users, documents, items) from an API endpoint. Supports single and multi-select. |
| `EntityPickerEntity` | interface | `src/ui/components/data/entity-picker/standalone.tsx` | No JSDoc description. |
| `expandPreset` | function | `src/ui/presets/expand.ts` | Validate a named preset config and expand it into the equivalent page config. |
| `ExprRef` | interface | `../frontend-contract/src/refs/from.ts` | No JSDoc description. |
| `FavoriteButton` | function | `src/ui/components/data/favorite-button/component.tsx` | No JSDoc description. |
| `FavoriteButtonBase` | function | `src/ui/components/data/favorite-button/standalone.tsx` | Standalone FavoriteButton — a toggle button with a star icon. No manifest context required. |
| `FavoriteButtonBaseProps` | interface | `src/ui/components/data/favorite-button/standalone.tsx` | No JSDoc description. |
| `FavoriteButtonConfig` | typealias | `src/ui/components/data/favorite-button/types.ts` | Inferred config type from the FavoriteButton Zod schema. |
| `favoriteButtonConfigSchema` | variable | `src/ui/components/data/favorite-button/schema.ts` | Zod config schema for the FavoriteButton component. Defines all manifest-settable fields for a star toggle button used to mark items as favorites. |
| `Feed` | function | `src/ui/components/data/feed/component.tsx` | No JSDoc description. |
| `FeedBase` | function | `src/ui/components/data/feed/standalone.tsx` | Standalone Feed — feed/activity list with grouping, pagination, and live updates. No manifest context required. |
| `FeedBaseItem` | interface | `src/ui/components/data/feed/standalone.tsx` | No JSDoc description. |
| `FeedBaseItemAction` | interface | `src/ui/components/data/feed/standalone.tsx` | No JSDoc description. |
| `FeedBaseProps` | interface | `src/ui/components/data/feed/standalone.tsx` | No JSDoc description. |
| `FeedConfig` | typealias | `src/ui/components/data/feed/types.ts` | Inferred type for the Feed component config (from Zod schema). |
| `FeedItem` | interface | `src/ui/components/data/feed/types.ts` | A single resolved feed item for rendering. |
| `feedSchema` | variable | `src/ui/components/data/feed/schema.ts` | Zod schema for the Feed component configuration.  Renders a scrollable activity/event stream from an endpoint or from-ref. Supports avatar, title, description, timestamp, badge fields, pagination, and publishes the selected item to the page context when `id` is set. |
| `FieldConfig` | typealias | `src/ui/components/forms/auto-form/types.ts` | Inferred type for a single field configuration. |
| `fieldConfigSchema` | variable | `src/ui/components/forms/auto-form/schema.ts` | Schema for an individual field configuration. |
| `FieldErrors` | typealias | `src/ui/components/forms/auto-form/types.ts` | Per-field validation error. |
| `FileUploaderBase` | function | `src/ui/components/content/file-uploader/standalone.tsx` | Standalone FileUploader — a file upload component with dropzone, button, and compact variants. No manifest context required. |
| `FileUploaderBaseProps` | interface | `src/ui/components/content/file-uploader/standalone.tsx` | No JSDoc description. |
| `FilterBar` | function | `src/ui/components/data/filter-bar/component.tsx` | No JSDoc description. |
| `FilterBarBase` | function | `src/ui/components/data/filter-bar/standalone.tsx` | Standalone FilterBar — search + filter dropdowns + active pills. No manifest context required. |
| `FilterBarBaseProps` | interface | `src/ui/components/data/filter-bar/standalone.tsx` | No JSDoc description. |
| `FilterBarConfig` | typealias | `src/ui/components/data/filter-bar/types.ts` | Inferred config type for the FilterBar component. |
| `filterBarConfigSchema` | variable | `src/ui/components/data/filter-bar/schema.ts` | No JSDoc description. |
| `FilterBarFilter` | interface | `src/ui/components/data/filter-bar/standalone.tsx` | No JSDoc description. |
| `FilterDef` | interface | `src/ui/presets/types.ts` | A filter definition for the CRUD page toolbar. |
| `FilterOption` | interface | `src/ui/presets/types.ts` | A filter option entry. |
| `Flavor` | interface | `../frontend-contract/src/tokens/types.ts` | No JSDoc description. |
| `FloatingMenuBase` | function | `src/ui/components/primitives/floating-menu/standalone.tsx` | Standalone FloatingMenu — a dropdown menu with trigger, keyboard navigation, and pre-resolved items. No manifest context required. |
| `FloatingMenuBaseItem` | interface | `src/ui/components/primitives/floating-menu/standalone.tsx` | No JSDoc description. |
| `FloatingMenuBaseLabel` | interface | `src/ui/components/primitives/floating-menu/standalone.tsx` | No JSDoc description. |
| `FloatingMenuBaseProps` | interface | `src/ui/components/primitives/floating-menu/standalone.tsx` | No JSDoc description. |
| `FloatingMenuBaseSeparator` | interface | `src/ui/components/primitives/floating-menu/standalone.tsx` | No JSDoc description. |
| `FontConfig` | typealias | `../frontend-contract/src/tokens/types.ts` | No JSDoc description. |
| `fontSchema` | variable | `../frontend-contract/src/tokens/schema.ts` | No JSDoc description. |
| `FormDef` | interface | `src/ui/presets/types.ts` | A form definition used in CRUD create/update modals and settings tabs. |
| `FormFieldDef` | interface | `src/ui/presets/types.ts` | A single form field definition. |
| `FormFieldOption` | interface | `src/ui/presets/types.ts` | An option entry for select/radio form fields. |
| `FromRef` | interface | `../frontend-contract/src/refs/from.ts` | No JSDoc description. |
| `fromRefSchema` | variable | `../frontend-contract/src/refs/schema.ts` | No JSDoc description. |
| `generateBreadcrumbs` | function | `src/ui/manifest/breadcrumbs.ts` | Generate breadcrumb items from the current matched route hierarchy. |
| `generateJsonSchema` | function | `src/ui/manifest/json-schema.ts` | Generate a JSON Schema for snapshot manifests.  The schema is intentionally conservative and focuses on the public top-level manifest contract so editors can provide autocomplete and inline validation without requiring Snapshot's full runtime schema registry at generation time. |
| `getAllFlavors` | function | `src/ui/tokens/flavors.ts` | Get all registered flavors as a record. |
| `getFlavor` | function | `src/ui/tokens/flavors.ts` | Retrieve a registered flavor by name. |
| `getRegisteredClient` | function | `src/api/client.ts` | Look up a previously registered custom client factory. |
| `getRegisteredGuards` | function | `src/ui/manifest/guard-registry.ts` | List the names of all currently registered route guards. |
| `getRegisteredLayouts` | function | `src/ui/layouts/registry.tsx` | List the names of all currently registered manifest layouts. |
| `getRegisteredSchemaTypes` | function | `src/ui/manifest/schema.ts` | Return the currently registered manifest component type names. |
| `getRegisteredWorkflowAction` | function | `src/ui/workflows/registry.ts` | Retrieve a registered runtime handler for a custom workflow action type. |
| `getSortableStyle` | function | `src/ui/hooks/use-drag-drop.ts` | CSS transform helper for sortable items. Converts the dnd-kit transform into a CSS transform string. |
| `GifEntry` | interface | `src/ui/components/communication/gif-picker/types.ts` | Shape of a GIF entry. |
| `GifPicker` | function | `src/ui/components/communication/gif-picker/component.tsx` | Manifest adapter — resolves config refs, wires actions/publish, delegates to GifPickerBase. |
| `GifPickerBase` | function | `src/ui/components/communication/gif-picker/standalone.tsx` | Standalone GifPicker — searchable GIF grid with debounced search, loading states, and optional attribution. No manifest context required. |
| `GifPickerBaseProps` | interface | `src/ui/components/communication/gif-picker/standalone.tsx` | No JSDoc description. |
| `GifPickerConfig` | typealias | `src/ui/components/communication/gif-picker/types.ts` | Inferred config type from the GifPicker Zod schema. |
| `gifPickerConfigSchema` | variable | `src/ui/components/communication/gif-picker/schema.ts` | Zod config schema for the GifPicker component.  Searchable GIF picker that queries a GIF API (Giphy/Tenor) and displays results in a masonry-style grid.  The component expects a backend proxy endpoint that handles the actual API key and returns GIF results. This avoids exposing API keys in the frontend. |
| `GlobalConfig` | typealias | `src/ui/context/types.ts` | Global state definition from the manifest. This now aliases the shared state config used by the runtime. |
| `GridBase` | function | `src/ui/components/layout/grid/standalone.tsx` | Standalone Grid -- a CSS grid container. No manifest context required. |
| `GridBaseProps` | interface | `src/ui/components/layout/grid/standalone.tsx` | No JSDoc description. |
| `Heading` | function | `src/ui/components/content/heading/component.tsx` | Manifest adapter — resolves template text, locale, and route context, then delegates to HeadingBase. |
| `HeadingBase` | function | `src/ui/components/content/heading/standalone.tsx` | Standalone Heading — a styled heading element (h1-h6) that works with plain React props. No manifest context required. |
| `HeadingBaseProps` | interface | `src/ui/components/content/heading/standalone.tsx` | No JSDoc description. |
| `HeadingConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `headingConfigSchema` — defaulted fields are optional. |
| `headingConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the built-in `heading` component. |
| `hexToOklch` | function | `src/ui/tokens/color.ts` | Convert a hex color string to OKLCH values. |
| `HighlightedText` | function | `src/ui/components/data/highlighted-text/component.tsx` | No JSDoc description. |
| `HighlightedTextBase` | function | `src/ui/components/data/highlighted-text/standalone.tsx` | Standalone HighlightedText — renders text with search query highlighting. No manifest context required. |
| `HighlightedTextBaseProps` | interface | `src/ui/components/data/highlighted-text/standalone.tsx` | No JSDoc description. |
| `HighlightedTextConfig` | typealias | `src/ui/components/data/highlighted-text/types.ts` | Inferred config type from the HighlightedText Zod schema. |
| `highlightedTextConfigSchema` | variable | `src/ui/components/data/highlighted-text/schema.ts` | Zod config schema for the HighlightedText component. Renders text with search query highlighting. Matching portions are wrapped in `<mark>` elements with a configurable highlight color. |
| `HoverCardBase` | function | `src/ui/components/overlay/hover-card/standalone.tsx` | Standalone HoverCard — a floating panel that appears on hover with plain React props. No manifest context required. |
| `HoverCardBaseProps` | interface | `src/ui/components/overlay/hover-card/standalone.tsx` | No JSDoc description. |
| `hslToOklch` | function | `src/ui/tokens/color.ts` | Convert HSL values to OKLCH. |
| `httpMethodSchema` | variable | `../frontend-contract/src/resources/index.ts` | No JSDoc description. |
| `Icon` | function | `src/ui/icons/icon.tsx` | Render a Snapshot icon from the built-in icon registry. |
| `ICON_PATHS` | variable | `src/ui/icons/paths.ts` | SVG inner content for Lucide icons. Each entry maps a kebab-case icon name to the SVG child elements (path, circle, line, rect, polyline, etc.) that belong inside a 24x24 `stroke="currentColor"` SVG container. Source: https://lucide.dev — MIT-licensed. |
| `IconButtonBase` | function | `src/ui/components/forms/icon-button/standalone.tsx` | Standalone IconButtonBase -- an icon-only button with configurable shape, size, and variant. No manifest context required. |
| `IconButtonBaseProps` | interface | `src/ui/components/forms/icon-button/standalone.tsx` | No JSDoc description. |
| `IconProps` | interface | `src/ui/icons/icon.tsx` | Props for the {@link Icon} component. |
| `IfWorkflowNode` | interface | `../frontend-contract/src/workflows/types.ts` | No JSDoc description. |
| `injectStyleSheet` | function | `src/ui/manifest/app.tsx` | Inject or update a stylesheet in the document head. |
| `InlineEdit` | function | `src/ui/components/forms/inline-edit/component.tsx` | InlineEdit component — click-to-edit text field.  Toggles between a display mode and an edit mode. Enter or blur saves the value; Escape reverts to the original value when `cancelOnEscape` is enabled. |
| `InlineEditConfig` | typealias | `src/ui/components/forms/inline-edit/types.ts` | Inferred config type for the InlineEdit component. |
| `inlineEditConfigSchema` | variable | `src/ui/components/forms/inline-edit/schema.ts` | Zod config schema for the InlineEdit component.  A click-to-edit text field that toggles between display and edit modes. Publishes `{ value, editing }` to the page context. |
| `InlineEditField` | function | `src/ui/components/forms/inline-edit/standalone.tsx` | Standalone InlineEditField -- a click-to-edit text field that toggles between display and input modes. No manifest context required. |
| `InlineEditFieldProps` | interface | `src/ui/components/forms/inline-edit/standalone.tsx` | No JSDoc description. |
| `Input` | function | `src/ui/components/forms/input/component.tsx` | Manifest adapter — resolves config refs and actions, delegates to InputField. |
| `InputConfig` | typealias | `src/ui/components/forms/input/types.ts` | Inferred config type from the Input Zod schema. |
| `inputConfigSchema` | variable | `src/ui/components/forms/input/schema.ts` | Zod config schema for the Input component.  Defines a standalone text input field with label, placeholder, validation, and optional icon. |
| `InputField` | function | `src/ui/components/forms/input/standalone.tsx` | Standalone InputField — a complete form field (label + input + helper/error) that works with plain React props. No manifest context required. |
| `InputFieldProps` | interface | `src/ui/components/forms/input/standalone.tsx` | No JSDoc description. |
| `interpolate` | function | `src/ui/actions/interpolate.ts` | Replace `{key}` placeholders with values from context. Supports nested paths: `{user.name}`, `{result.id}`. Missing keys are preserved as-is: `{unknown}` stays `{unknown}`. |
| `isFromRef` | variable | `src/ui/context/utils.ts` | No JSDoc description. |
| `isResourceRef` | function | `../frontend-contract/src/resources/index.ts` | No JSDoc description. |
| `KanbanBase` | function | `src/ui/components/workflow/kanban/standalone.tsx` | Standalone KanbanBase — renders a multi-column board with cards, WIP limits, assignee avatars, priority indicators, and optional drag-and-drop reordering. No manifest context required. |
| `KanbanBaseProps` | interface | `src/ui/components/workflow/kanban/standalone.tsx` | No JSDoc description. |
| `KanbanColumnEntry` | interface | `src/ui/components/workflow/kanban/standalone.tsx` | No JSDoc description. |
| `Layout` | function | `src/ui/components/layout/layout/component.tsx` | Manifest adapter — resolves registered custom layouts, then delegates to LayoutBase for built-in variants. |
| `LayoutBase` | function | `src/ui/components/layout/layout/standalone.tsx` | Standalone Layout -- a layout shell component that wraps page content. Renders one of six layout variants without manifest context. |
| `LayoutBaseProps` | interface | `src/ui/components/layout/layout/standalone.tsx` | No JSDoc description. |
| `LayoutBaseSlots` | typealias | `src/ui/components/layout/layout/standalone.tsx` | Named slot content map for slot-aware layouts. |
| `LayoutBaseVariant` | typealias | `src/ui/components/layout/layout/standalone.tsx` | No JSDoc description. |
| `LayoutColumnConfig` | typealias | `src/ui/components/layout/column/types.ts` | Inferred config type for the Column layout component. |
| `layoutColumnConfigSchema` | variable | `src/ui/components/layout/column/schema.ts` | Zod config schema for the Column layout component. Defines a vertical flex container with responsive gap, alignment, justify, overflow, and max-height options. |
| `LayoutConfig` | typealias | `src/ui/components/layout/layout/schema.ts` | Inferred layout config type from the Zod schema. |
| `layoutConfigSchema` | variable | `src/ui/components/layout/layout/schema.ts` | Zod schema for layout component configuration. Defines the layout shell that wraps page content. |
| `LayoutProps` | interface | `src/ui/components/layout/layout/types.ts` | Props for the Layout component. |
| `LayoutVariant` | typealias | `src/ui/components/layout/layout/types.ts` | Layout variant type extracted from the schema. |
| `LinkBase` | function | `src/ui/components/primitives/link/standalone.tsx` | Standalone Link — renders a styled anchor element with optional icon and badge. No manifest context required. |
| `LinkBaseProps` | interface | `src/ui/components/primitives/link/standalone.tsx` | No JSDoc description. |
| `LinkEmbed` | function | `src/ui/components/content/link-embed/component.tsx` | Manifest adapter — resolves config refs and delegates to LinkEmbedBase. |
| `LinkEmbedBase` | function | `src/ui/components/content/link-embed/standalone.tsx` | Standalone LinkEmbed — renders rich link previews with platform-specific embeds (YouTube, Instagram, TikTok, Twitter, GIF) or a generic card. No manifest context required. |
| `LinkEmbedBaseProps` | interface | `src/ui/components/content/link-embed/standalone.tsx` | No JSDoc description. |
| `LinkEmbedConfig` | typealias | `src/ui/components/content/link-embed/types.ts` | Inferred config type from the LinkEmbed Zod schema. |
| `linkEmbedConfigSchema` | variable | `src/ui/components/content/link-embed/schema.ts` | Zod config schema for the LinkEmbed component.  Renders rich URL previews with platform-specific renderers for YouTube, Instagram, TikTok, Twitter/X, and generic Open Graph cards. Also supports inline GIF embeds. |
| `LinkEmbedMeta` | interface | `src/ui/components/content/link-embed/standalone.tsx` | No JSDoc description. |
| `ListBase` | function | `src/ui/components/data/list/standalone.tsx` | Standalone List — renders a vertical list of items with optional icons, descriptions, badges, and click actions. No manifest context required. |
| `ListBaseItem` | interface | `src/ui/components/data/list/standalone.tsx` | No JSDoc description. |
| `ListBaseProps` | interface | `src/ui/components/data/list/standalone.tsx` | No JSDoc description. |
| `LocationInput` | function | `src/ui/components/forms/location-input/component.tsx` | No JSDoc description. |
| `LocationInputConfig` | typealias | `src/ui/components/forms/location-input/types.ts` | Config for the manifest-driven location input component. |
| `locationInputConfigSchema` | variable | `src/ui/components/forms/location-input/schema.ts` | Zod config schema for the LocationInput component.  Geocode autocomplete input that searches a backend endpoint, displays matching locations in a dropdown, and extracts coordinates on selection. Publishes `{ name, lat, lng, address }`. |
| `LocationInputField` | function | `src/ui/components/forms/location-input/standalone.tsx` | Standalone LocationInputField -- a location search input with results dropdown and optional Google Maps link. No manifest context required. |
| `LocationInputFieldProps` | interface | `src/ui/components/forms/location-input/standalone.tsx` | No JSDoc description. |
| `LocationResult` | interface | `src/ui/components/forms/location-input/standalone.tsx` | No JSDoc description. |
| `LogAction` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `ManifestApp` | function | `src/ui/manifest/app.tsx` | Render the manifest-driven application shell. |
| `ManifestAppProps` | interface | `src/ui/manifest/types.ts` | Props accepted by the `ManifestApp` component. |
| `ManifestConfig` | typealias | `src/ui/manifest/types.ts` | Raw manifest input shape accepted by `parseManifest()` before defaults are applied during compilation. |
| `manifestConfigSchema` | variable | `src/ui/manifest/schema.ts` | Top-level schema for `snapshot.manifest.json`. |
| `ManifestResourceLoader` | typealias | `src/ui/manifest/types.ts` | No JSDoc description. |
| `ManifestResourceLoaderContext` | interface | `src/ui/manifest/types.ts` | No JSDoc description. |
| `ManifestRuntimeExtensions` | interface | `src/ui/manifest/types.ts` | No JSDoc description. |
| `ManifestRuntimeProvider` | function | `src/ui/manifest/runtime.tsx` | Provides manifest runtime state, resource cache state, and mutation helpers. |
| `Markdown` | function | `src/ui/components/content/markdown/component.tsx` | Manifest adapter — resolves config refs and delegates to MarkdownBase. |
| `MarkdownBase` | function | `src/ui/components/content/markdown/standalone.tsx` | Standalone Markdown — renders markdown content with syntax highlighting and Snapshot design tokens. No manifest context required. |
| `MarkdownBaseProps` | interface | `src/ui/components/content/markdown/standalone.tsx` | No JSDoc description. |
| `MarkdownConfig` | typealias | `src/ui/components/content/markdown/types.ts` | Inferred config type from the Markdown Zod schema. |
| `markdownConfigSchema` | variable | `src/ui/components/content/markdown/schema.ts` | Zod config schema for the Markdown component.  Renders markdown content with full GFM support and syntax highlighting. |
| `meetsWcagAA` | function | `src/ui/tokens/color.ts` | Check whether two colors satisfy WCAG AA contrast for normal or large text. |
| `MessageThread` | function | `src/ui/components/communication/message-thread/component.tsx` | Manifest adapter — resolves data endpoint, wires actions/publish, delegates to MessageThreadBase. |
| `MessageThreadBase` | function | `src/ui/components/communication/message-thread/standalone.tsx` | Standalone MessageThread — scrollable message list with avatars, date separators, auto-scroll, embed rendering, and consecutive-message grouping. No manifest context required. |
| `MessageThreadBaseProps` | interface | `src/ui/components/communication/message-thread/standalone.tsx` | No JSDoc description. |
| `MessageThreadConfig` | typealias | `src/ui/components/communication/message-thread/types.ts` | Inferred config type from the MessageThread Zod schema. |
| `messageThreadConfigSchema` | variable | `src/ui/components/communication/message-thread/schema.ts` | Zod config schema for the MessageThread component.  Renders a scrollable message list with avatars, timestamps, message grouping, date separators, and optional reactions/threading. |
| `ModalBase` | function | `src/ui/components/overlay/modal/standalone.tsx` | Standalone Modal — a centered overlay dialog with plain React props. No manifest context required. |
| `ModalBaseFooterAction` | interface | `src/ui/components/overlay/modal/standalone.tsx` | No JSDoc description. |
| `ModalBaseProps` | interface | `src/ui/components/overlay/modal/standalone.tsx` | No JSDoc description. |
| `ModalComponent` | function | `src/ui/components/overlay/modal/component.tsx` | No JSDoc description. |
| `ModalConfig` | typealias | `src/ui/components/overlay/modal/schema.ts` | Inferred type for modal config. |
| `modalConfigSchema` | variable | `src/ui/components/overlay/modal/schema.ts` | Zod schema for modal component config. Modals are overlay dialogs that display child components. They are opened/closed via the modal manager (open-modal/close-modal actions). |
| `ModalManager` | interface | `src/ui/actions/modal-manager.ts` | Return type of useModalManager. |
| `MultiSelect` | function | `src/ui/components/forms/multi-select/component.tsx` | No JSDoc description. |
| `MultiSelectConfig` | typealias | `src/ui/components/forms/multi-select/types.ts` | Inferred config type from the MultiSelect Zod schema. |
| `multiSelectConfigSchema` | variable | `src/ui/components/forms/multi-select/schema.ts` | Zod config schema for the MultiSelect component.  Defines a dropdown with checkboxes for selecting multiple values, with optional search filtering and pill display. |
| `MultiSelectField` | function | `src/ui/components/forms/multi-select/standalone.tsx` | Standalone MultiSelectField -- multi-select dropdown with pill tags, inline search, and configurable max selection. No manifest context required. |
| `MultiSelectFieldOption` | interface | `src/ui/components/forms/multi-select/standalone.tsx` | No JSDoc description. |
| `MultiSelectFieldProps` | interface | `src/ui/components/forms/multi-select/standalone.tsx` | No JSDoc description. |
| `Nav` | function | `src/ui/components/layout/nav/component.tsx` | Grouped navigation component for manifest app shells.  Renders either `navigation.items` or a composable nav template, resolves translated labels at render time, applies canonical slot/state styling, and optionally renders logo and user-menu surfaces. |
| `NavBase` | function | `src/ui/components/layout/nav/standalone.tsx` | Standalone Nav -- a navigation component with items, logo, and collapse support. No manifest context required. |
| `NavBaseItem` | interface | `src/ui/components/layout/nav/standalone.tsx` | No JSDoc description. |
| `NavBaseLogo` | interface | `src/ui/components/layout/nav/standalone.tsx` | No JSDoc description. |
| `NavBaseProps` | interface | `src/ui/components/layout/nav/standalone.tsx` | No JSDoc description. |
| `NavBaseUser` | interface | `src/ui/components/layout/nav/standalone.tsx` | No JSDoc description. |
| `NavConfig` | typealias | `src/ui/components/layout/nav/schema.ts` | Runtime config type for the Nav component. |
| `navConfigSchema` | variable | `src/ui/components/layout/nav/schema.ts` | Zod schema for the grouped Nav component.  Supports either `items`-driven navigation or template composition, optional logo and user menu configuration, collapsible sidebar behavior, and canonical slot-based surface styling. |
| `NavDropdownBase` | function | `src/ui/components/layout/nav-dropdown/standalone.tsx` | Standalone NavDropdown -- a navigation dropdown with floating panel. No manifest context required. |
| `NavDropdownBaseProps` | interface | `src/ui/components/layout/nav-dropdown/standalone.tsx` | No JSDoc description. |
| `NavigateAction` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `navigateActionSchema` | variable | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `NavigationConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `navigationConfigSchema` — defaulted fields are optional. |
| `navigationConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the top-level manifest navigation configuration. |
| `NavItem` | interface | `src/ui/manifest/types.ts` | Navigation item rendered by Snapshot navigation components. |
| `NavItemConfig` | typealias | `src/ui/components/layout/nav/schema.ts` | Runtime config type for a grouped nav item, including optional child items and per-item slots. |
| `navItemSchema` | variable | `src/ui/manifest/schema.ts` | Recursive schema for navigation items used by manifest navigation surfaces. |
| `NavLinkBase` | function | `src/ui/components/layout/nav-link/standalone.tsx` | Standalone NavLink -- a navigation link with optional icon and badge. No manifest context required. |
| `NavLinkBaseProps` | interface | `src/ui/components/layout/nav-link/standalone.tsx` | No JSDoc description. |
| `NavLogoBase` | function | `src/ui/components/layout/nav-logo/standalone.tsx` | Standalone NavLogo -- a clickable brand logo/text element for navigation headers. No manifest context required. |
| `NavLogoBaseProps` | interface | `src/ui/components/layout/nav-logo/standalone.tsx` | No JSDoc description. |
| `NavSearchBase` | function | `src/ui/components/layout/nav-search/standalone.tsx` | Standalone NavSearch -- a search input with optional keyboard shortcut display. No manifest context required. |
| `NavSearchBaseProps` | interface | `src/ui/components/layout/nav-search/standalone.tsx` | No JSDoc description. |
| `NavSectionBase` | function | `src/ui/components/layout/nav-section/standalone.tsx` | Standalone NavSection -- a labeled, optionally collapsible group within navigation. No manifest context required. |
| `NavSectionBaseProps` | interface | `src/ui/components/layout/nav-section/standalone.tsx` | No JSDoc description. |
| `NavUserMenuBase` | function | `src/ui/components/layout/nav-user-menu/standalone.tsx` | Standalone NavUserMenu -- a user menu dropdown with avatar trigger. No manifest context required. |
| `NavUserMenuBaseItem` | interface | `src/ui/components/layout/nav-user-menu/standalone.tsx` | No JSDoc description. |
| `NavUserMenuBaseProps` | interface | `src/ui/components/layout/nav-user-menu/standalone.tsx` | No JSDoc description. |
| `NotificationBell` | function | `src/ui/components/data/notification-bell/component.tsx` | No JSDoc description. |
| `NotificationBellBase` | function | `src/ui/components/data/notification-bell/standalone.tsx` | Standalone NotificationBell — bell icon with unread count badge. No manifest context required. |
| `NotificationBellBaseProps` | interface | `src/ui/components/data/notification-bell/standalone.tsx` | No JSDoc description. |
| `NotificationBellConfig` | typealias | `src/ui/components/data/notification-bell/types.ts` | Inferred config type from the NotificationBell Zod schema. |
| `notificationBellConfigSchema` | variable | `src/ui/components/data/notification-bell/schema.ts` | Zod config schema for the NotificationBell component.  Defines all manifest-settable fields for a bell icon with an unread count badge. |
| `NotificationFeedBase` | function | `src/ui/components/workflow/notification-feed/standalone.tsx` | Standalone NotificationFeedBase — renders a scrollable notification list with type icons, unread indicators, relative timestamps, and a mark-all-read action. No manifest context required. |
| `NotificationFeedBaseProps` | interface | `src/ui/components/workflow/notification-feed/standalone.tsx` | No JSDoc description. |
| `OAuthButtonsBase` | function | `src/ui/components/primitives/oauth-buttons/standalone.tsx` | Standalone OAuthButtons — renders OAuth provider buttons with optional heading and auto-redirect support. No manifest context required. |
| `OAuthButtonsBaseProps` | interface | `src/ui/components/primitives/oauth-buttons/standalone.tsx` | No JSDoc description. |
| `OAuthProvider` | interface | `src/ui/components/primitives/oauth-buttons/standalone.tsx` | No JSDoc description. |
| `oklchToHex` | function | `src/ui/tokens/color.ts` | Convert OKLCH values back to a hex color string. Used for serializing runtime overrides. |
| `oklchToString` | function | `src/ui/tokens/color.ts` | Format OKLCH values as a CSS-compatible string (without the oklch() wrapper). Output format: "L C H" where L, C, H are rounded to 3 decimal places. |
| `OpenModalAction` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `openModalActionSchema` | variable | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `Outlet` | function | `src/ui/components/layout/outlet/component.tsx` | Layout outlet primitive used to render nested child routes from the compiled manifest route tree. |
| `outletComponentSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the built-in `outlet` component used by route layouts. |
| `OutletConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `outletComponentSchema` — defaulted fields are optional. |
| `OverlayConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `overlayConfigSchema` — defaulted fields are optional. |
| `overlayConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for named modal, drawer, and confirm-dialog overlay declarations. |
| `OverlayRuntimeProvider` | function | `src/ui/manifest/runtime.tsx` | Provide the current overlay runtime payload and metadata. |
| `PageConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `pageConfigSchema` — defaulted fields are optional. |
| `pageConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for a manifest page definition. |
| `PageContextProvider` | function | `src/ui/context/providers.tsx` | Provides per-page state that is destroyed on route change. |
| `PageContextProviderProps` | interface | `src/ui/context/types.ts` | Props for PageContextProvider. Wraps each page/route to provide per-page component state. |
| `PageRenderer` | function | `src/ui/manifest/renderer.tsx` | Renders a page from its manifest config. |
| `PageRendererProps` | interface | `src/ui/manifest/renderer.tsx` | Props for the PageRenderer component. |
| `PaginationDef` | interface | `src/ui/presets/types.ts` | Pagination settings for preset-generated list surfaces. |
| `PaginationState` | interface | `src/ui/components/data/data-table/types.ts` | Pagination state for the data table. |
| `ParallelWorkflowNode` | interface | `../frontend-contract/src/workflows/types.ts` | No JSDoc description. |
| `parseManifest` | function | `src/ui/manifest/compiler.ts` | Parse an unknown value into a validated manifest. |
| `parseOklchString` | function | `src/ui/tokens/color.ts` | Parse an oklch string (the CSS variable format "L C H") back to values. |
| `parseShortcodes` | function | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | Parses shortcodes in text and replaces them with `<img>` tags. |
| `PasskeyButtonBase` | function | `src/ui/components/primitives/passkey-button/standalone.tsx` | Standalone PasskeyButton — renders a passkey authentication button. No manifest context required. |
| `PasskeyButtonBaseProps` | interface | `src/ui/components/primitives/passkey-button/standalone.tsx` | No JSDoc description. |
| `Platform` | typealias | `src/ui/components/content/link-embed/platform.ts` | Platform detection and embed URL extraction. Identifies known platforms from URLs and extracts the embed-compatible URL or ID needed to render platform-specific iframes. |
| `PLATFORM_COLORS` | variable | `src/ui/components/content/link-embed/platform.ts` | Platform accent colors. |
| `PLATFORM_NAMES` | variable | `src/ui/components/content/link-embed/platform.ts` | Platform display names. |
| `PlatformInfo` | interface | `src/ui/components/content/link-embed/platform.ts` | Resolved platform metadata used to render a platform-specific embedded preview. |
| `Popover` | function | `src/ui/components/overlay/popover/component.tsx` | Manifest adapter — resolves config refs, publishes state, renders manifest children, delegates layout to PopoverBase. |
| `PopoverBase` | function | `src/ui/components/overlay/popover/standalone.tsx` | Standalone Popover — a button-triggered floating panel with plain React props. No manifest context required. |
| `PopoverBaseProps` | interface | `src/ui/components/overlay/popover/standalone.tsx` | No JSDoc description. |
| `PopoverConfig` | typealias | `src/ui/components/overlay/popover/types.ts` | Inferred config type for the Popover component. |
| `popoverConfigSchema` | variable | `src/ui/components/overlay/popover/schema.ts` | Zod schema for the Popover component.  Defines a trigger-driven floating panel with optional title, description, footer content, width, placement, and canonical slot-based styling for the trigger and panel sub-surfaces. |
| `PrefetchLink` | function | `src/ui/components/navigation/prefetch-link/component.tsx` | Manifest adapter — wires the SSR prefetch route hook into PrefetchLinkBase. |
| `PrefetchLinkBase` | function | `src/ui/components/navigation/prefetch-link/standalone.tsx` | Standalone PrefetchLink — a plain `<a>` anchor that fires a prefetch callback based on the configured strategy. No manifest or SSR context required. |
| `PrefetchLinkBaseProps` | interface | `src/ui/components/navigation/prefetch-link/standalone.tsx` | No JSDoc description. |
| `PrefetchLinkConfig` | typealias | `src/ui/components/navigation/prefetch-link/schema.ts` | The output type of `prefetchLinkSchema` — all fields fully resolved with defaults applied. This is the type received by the component implementation. |
| `prefetchLinkSchema` | variable | `src/ui/components/navigation/prefetch-link/schema.ts` | Zod schema for `<PrefetchLink>` config.  `<PrefetchLink>` is a prefetch primitive that renders a plain `<a>` tag and automatically injects `<link rel="prefetch">` tags for the route's JS chunks and CSS files when the user hovers over the link or when it enters the viewport.  It is not a router-aware component — consumers wire their own router. This avoids a peer dependency on TanStack Router. |
| `PresenceIndicator` | function | `src/ui/components/communication/presence-indicator/component.tsx` | Manifest adapter — resolves config refs and delegates to PresenceIndicatorBase. |
| `PresenceIndicatorBase` | function | `src/ui/components/communication/presence-indicator/standalone.tsx` | Standalone PresenceIndicator — displays online/offline/away/busy/dnd status with a colored dot and optional label. No manifest context required. |
| `PresenceIndicatorBaseProps` | interface | `src/ui/components/communication/presence-indicator/standalone.tsx` | No JSDoc description. |
| `PresenceIndicatorConfig` | typealias | `src/ui/components/communication/presence-indicator/types.ts` | Inferred config type from the PresenceIndicator Zod schema. |
| `presenceIndicatorConfigSchema` | variable | `src/ui/components/communication/presence-indicator/schema.ts` | Zod config schema for the PresenceIndicator component. Displays an online/offline/away/busy/dnd status dot with optional label. |
| `PricingFeatureEntry` | interface | `src/ui/components/commerce/pricing-table/standalone.tsx` | No JSDoc description. |
| `PricingTableBase` | function | `src/ui/components/commerce/pricing-table/standalone.tsx` | Standalone PricingTableBase — renders a responsive pricing comparison as either a card grid or a feature-comparison table with CTA buttons per tier. No manifest context required. |
| `PricingTableBaseProps` | interface | `src/ui/components/commerce/pricing-table/standalone.tsx` | No JSDoc description. |
| `PricingTierEntry` | interface | `src/ui/components/commerce/pricing-table/standalone.tsx` | No JSDoc description. |
| `ProgressBase` | function | `src/ui/components/data/progress/standalone.tsx` | Standalone Progress — bar or circular progress indicator. No manifest context required. |
| `ProgressBaseProps` | interface | `src/ui/components/data/progress/standalone.tsx` | No JSDoc description. |
| `PushConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `pushConfigSchema` — defaulted fields are optional. |
| `pushConfigSchema` | variable | `src/ui/manifest/schema.ts` | Manifest push-notification runtime configuration. |
| `QuickAdd` | function | `src/ui/components/forms/quick-add/component.tsx` | No JSDoc description. |
| `QuickAddConfig` | typealias | `src/ui/components/forms/quick-add/types.ts` | Inferred config type from the QuickAdd Zod schema. |
| `quickAddConfigSchema` | variable | `src/ui/components/forms/quick-add/schema.ts` | Zod config schema for the QuickAdd component.  Defines all manifest-settable fields for an inline creation bar that allows quick item entry with a text input and submit button. |
| `QuickAddField` | function | `src/ui/components/forms/quick-add/standalone.tsx` | Standalone QuickAddField -- a compact input with submit button for quickly adding items to a list. No manifest context required. |
| `QuickAddFieldProps` | interface | `src/ui/components/forms/quick-add/standalone.tsx` | No JSDoc description. |
| `RadiusScale` | typealias | `../frontend-contract/src/tokens/types.ts` | No JSDoc description. |
| `radiusSchema` | variable | `../frontend-contract/src/tokens/schema.ts` | No JSDoc description. |
| `ReactionBar` | function | `src/ui/components/communication/reaction-bar/component.tsx` | Manifest adapter — wires actions/publish and delegates to ReactionBarBase. |
| `ReactionBarBase` | function | `src/ui/components/communication/reaction-bar/standalone.tsx` | Standalone ReactionBar — row of emoji reaction pills with counts and an add-reaction button that opens an inline emoji picker. No manifest context required. |
| `ReactionBarBaseProps` | interface | `src/ui/components/communication/reaction-bar/standalone.tsx` | No JSDoc description. |
| `ReactionBarConfig` | typealias | `src/ui/components/communication/reaction-bar/types.ts` | Inferred config type from the ReactionBar Zod schema. |
| `reactionBarConfigSchema` | variable | `src/ui/components/communication/reaction-bar/schema.ts` | Zod config schema for the ReactionBar component.  Displays emoji reactions with counts and an add button. |
| `ReactionEntry` | interface | `src/ui/components/communication/reaction-bar/standalone.tsx` | No JSDoc description. |
| `readPersistedState` | function | `src/ui/state/persist.ts` | Read and JSON-decode a persisted state value, returning `undefined` on failure or absence. |
| `RefreshAction` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `refreshActionSchema` | variable | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `registerAnalyticsProvider` | function | `src/ui/analytics/registry.ts` | Register a custom analytics provider factory by name. |
| `registerBuiltInComponents` | function | `src/ui/components/register.ts` | Register all built-in config-driven components with the manifest system.  The function is idempotent so boot code can call it safely without worrying about duplicate registrations. |
| `registerClient` | function | `src/api/client.ts` | Register a named custom client factory. |
| `registerComponent` | function | `src/ui/manifest/component-registry.tsx` | Register a React component for a manifest component type string. Used by the framework for built-in components and by consumers for custom components.  Emits a dev warning if overriding an existing registration. |
| `registerComponentSchema` | function | `src/ui/manifest/schema.ts` | Register a component-specific manifest schema by component `type`. |
| `registerGuard` | function | `src/ui/manifest/guard-registry.ts` | Register a named route guard implementation for manifest resolution. |
| `registerLayout` | function | `src/ui/layouts/registry.tsx` | Register a named layout component for manifest layout resolution. |
| `registerWorkflowAction` | function | `src/ui/workflows/registry.ts` | Register a runtime handler for a custom workflow action type. |
| `relativeLuminance` | function | `src/ui/tokens/color.ts` | Compute relative luminance from OKLCH for WCAG contrast calculations. Uses sRGB relative luminance (rec. 709) from the linear RGB values. |
| `resetBootBuiltins` | function | `src/ui/manifest/boot-builtins.ts` | Reset the boot flag so tests can re-run built-in registration deterministically. |
| `resetBuiltInComponentRegistration` | function | `src/ui/components/register.ts` | Reset the built-in component registration guard so tests can rebuild the registry. |
| `ResolvedColumn` | interface | `src/ui/components/data/data-table/types.ts` | Resolved column definition used internally by the hook and component. |
| `ResolvedConfig` | typealias | `src/ui/context/types.ts` | Resolves a type where FromRef values are replaced with their resolved types. Used internally — consumers don't need to use this directly. |
| `ResolvedNavItem` | interface | `src/ui/components/layout/nav/types.ts` | A nav item enriched with computed state: active detection, visibility based on role, and resolved badge value. |
| `resolveEmojiRecords` | function | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | Resolves emoji records from the API into CustomEmoji entries. Handles the `uploadKey` → `url` resolution using a URL prefix or field mapping. |
| `resolveFrameworkStyles` | function | `src/ui/tokens/resolve.ts` | Returns a CSS string containing framework-level styles:  1. CSS reset (box-sizing, margin, padding, body defaults, font inherit) 2. Component polish CSS — data-attribute-driven styles for page layout,    data-table, stat-card, form, detail-card, and focus rings.  All values are parameterized via `--sn-*` token custom properties so the output adapts to whatever theme tokens are active. |
| `resolveGuard` | function | `src/ui/manifest/guard-registry.ts` | Resolve a previously registered route guard by name. |
| `resolveLayout` | function | `src/ui/layouts/registry.tsx` | Resolve a previously registered layout by name. |
| `resolveResponsiveValue` | function | `src/ui/hooks/use-breakpoint.ts` | Resolve a responsive value for a given breakpoint. Cascades down: if the active breakpoint isn't defined, falls back to the next smaller breakpoint, then `default`. For flat (non-object) values, returns the value directly. |
| `resolveTokens` | function | `src/ui/tokens/resolve.ts` | Resolve a theme configuration into a complete CSS string.  Pipeline: 1. Load base flavor (default: neutral) 2. Deep merge overrides onto flavor defaults 3. Convert all colors to oklch 4. Auto-derive foreground colors (contrast-aware) 5. Auto-derive dark mode colors if not provided 6. Map radius/spacing/font to CSS 7. Generate component-level tokens 8. Output CSS string with :root, .dark, and component selectors |
| `ResourceConfigMap` | typealias | `src/ui/manifest/types.ts` | Named manifest resource map keyed by resource id. |
| `resourceConfigSchema` | variable | `../frontend-contract/src/resources/index.ts` | No JSDoc description. |
| `resourceRefSchema` | variable | `../frontend-contract/src/resources/index.ts` | No JSDoc description. |
| `Responsive` | typealias | `../frontend-contract/src/tokens/types.ts` | No JSDoc description. |
| `RetryWorkflowNode` | interface | `../frontend-contract/src/workflows/types.ts` | No JSDoc description. |
| `RichInput` | function | `src/ui/components/content/rich-input/component.tsx` | Manifest adapter — resolves config refs, wires actions, and delegates to RichInputBase. |
| `RichInputBase` | function | `src/ui/components/content/rich-input/standalone.tsx` | Standalone RichInput — a rich text editor with formatting toolbar, powered by tiptap. No manifest context required. |
| `RichInputBaseProps` | interface | `src/ui/components/content/rich-input/standalone.tsx` | No JSDoc description. |
| `RichInputConfig` | typealias | `src/ui/components/content/rich-input/types.ts` | Inferred config type from the RichInput Zod schema. |
| `richInputConfigSchema` | variable | `src/ui/components/content/rich-input/schema.ts` | Zod config schema for the RichInput component.  A TipTap-based WYSIWYG editor for chat messages, comments, and posts. Users see formatted text as they type (bold, italic, mentions, etc.) rather than raw markdown. |
| `RichTextEditor` | function | `src/ui/components/content/rich-text-editor/component.tsx` | Manifest adapter — resolves config refs, wires publish, and delegates to RichTextEditorBase. |
| `RichTextEditorBase` | function | `src/ui/components/content/rich-text-editor/standalone.tsx` | Standalone RichTextEditor — a markdown editor with live preview, powered by CodeMirror. No manifest context required. |
| `RichTextEditorBaseProps` | interface | `src/ui/components/content/rich-text-editor/standalone.tsx` | No JSDoc description. |
| `RichTextEditorConfig` | typealias | `src/ui/components/content/rich-text-editor/types.ts` | Inferred config type from the RichTextEditor Zod schema. |
| `richTextEditorConfigSchema` | variable | `src/ui/components/content/rich-text-editor/schema.ts` | Zod config schema for the RichTextEditor component.  Defines all manifest-settable fields for a CodeMirror 6-based markdown editor with toolbar, preview pane, and split view support. |
| `RouteConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `routeConfigSchema` — defaulted fields are optional. |
| `routeConfigSchema` | variable | `src/ui/manifest/schema.ts` | Recursive schema for a manifest route tree node. |
| `RouteGuard` | typealias | `src/ui/manifest/types.ts` | Input shape for `routeGuardSchema` — defaulted fields are optional. |
| `RouteGuardConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `routeGuardConfigSchema` — defaulted fields are optional. |
| `routeGuardConfigSchema` | variable | `src/ui/manifest/schema.ts` | Object-form route guard schema with auth, role, and policy controls. |
| `routeGuardSchema` | variable | `src/ui/manifest/schema.ts` | Route guard schema, accepting either a named guard or inline guard config. |
| `RouteMatch` | interface | `src/ui/manifest/types.ts` | Resolved route match for the current pathname. |
| `RouteRuntimeProvider` | function | `src/ui/manifest/runtime.tsx` | Provide route runtime state to manifest-rendered components. |
| `routeTransitionSchema` | variable | `src/ui/manifest/schema.ts` | Schema for route transition metadata. |
| `RowAction` | typealias | `src/ui/components/data/data-table/types.ts` | Inferred row action type. |
| `rowActionSchema` | variable | `src/ui/components/data/data-table/schema.ts` | Schema for a per-row action button. |
| `RowBase` | function | `src/ui/components/layout/row/standalone.tsx` | Standalone Row -- a horizontal flex container. No manifest context required. |
| `RowBaseProps` | interface | `src/ui/components/layout/row/standalone.tsx` | No JSDoc description. |
| `RowConfig` | interface | `src/ui/manifest/types.ts` | Runtime config for the built-in `row` layout component. |
| `rowConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the built-in `row` layout component. |
| `RuntimeStateConfig` | typealias | `src/ui/state/types.ts` | Named state definition from the manifest. App-scope state persists for the app lifetime. Route-scope state is recreated whenever the active route changes. |
| `runWorkflow` | function | `src/ui/workflows/engine.ts` | Execute a workflow definition against the supplied runtime hooks and mutable context. |
| `RunWorkflowAction` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `runWorkflowActionSchema` | variable | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `SaveIndicator` | function | `src/ui/components/data/save-indicator/component.tsx` | No JSDoc description. |
| `SaveIndicatorBase` | function | `src/ui/components/data/save-indicator/standalone.tsx` | Standalone SaveIndicator — shows saving/saved/error status. No manifest context required. |
| `SaveIndicatorBaseProps` | interface | `src/ui/components/data/save-indicator/standalone.tsx` | No JSDoc description. |
| `SaveIndicatorConfig` | typealias | `src/ui/components/data/save-indicator/types.ts` | Inferred config type from the SaveIndicator Zod schema. |
| `saveIndicatorConfigSchema` | variable | `src/ui/components/data/save-indicator/schema.ts` | Zod config schema for the SaveIndicator component. Defines all manifest-settable fields for a save status indicator that shows idle, saving, saved, or error states. |
| `ScrollArea` | function | `src/ui/components/data/scroll-area/component.tsx` | No JSDoc description. |
| `ScrollAreaBase` | function | `src/ui/components/data/scroll-area/standalone.tsx` | Standalone ScrollArea — a scrollable container with custom-styled thin scrollbars. No manifest context required. |
| `ScrollAreaBaseProps` | interface | `src/ui/components/data/scroll-area/standalone.tsx` | No JSDoc description. |
| `ScrollAreaConfig` | typealias | `src/ui/components/data/scroll-area/types.ts` | Inferred config type for the ScrollArea component. |
| `scrollAreaConfigSchema` | variable | `src/ui/components/data/scroll-area/schema.ts` | Zod config schema for the ScrollArea component.  A scrollable container with custom-styled thin scrollbars that respect the design token system. |
| `ScrollToAction` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `scrollToActionSchema` | variable | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `SectionBase` | function | `src/ui/components/layout/section/standalone.tsx` | Standalone Section -- a full-width vertical section with optional height and alignment. No manifest context required. |
| `SectionBaseProps` | interface | `src/ui/components/layout/section/standalone.tsx` | No JSDoc description. |
| `Select` | function | `src/ui/components/forms/select/component.tsx` | No JSDoc description. |
| `SelectConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `selectConfigSchema` — defaulted fields are optional. |
| `selectConfigSchema` | variable | `src/ui/components/forms/select/schema.ts` | No JSDoc description. |
| `SelectField` | function | `src/ui/components/forms/select/standalone.tsx` | Standalone SelectField -- a complete select form field with label, options, helper/error text, and required indicator. No manifest context required. |
| `SelectFieldProps` | interface | `src/ui/components/forms/select/standalone.tsx` | No JSDoc description. |
| `Separator` | function | `src/ui/components/data/separator/component.tsx` | No JSDoc description. |
| `SeparatorBase` | function | `src/ui/components/data/separator/standalone.tsx` | Standalone Separator — a horizontal or vertical line with optional label. No manifest context required. |
| `SeparatorBaseProps` | interface | `src/ui/components/data/separator/standalone.tsx` | No JSDoc description. |
| `SeparatorConfig` | typealias | `src/ui/components/data/separator/types.ts` | Inferred config type for the Separator component. |
| `separatorConfigSchema` | variable | `src/ui/components/data/separator/schema.ts` | Zod config schema for the Separator component. A simple visual divider line, either horizontal or vertical. Optionally renders a centered label between the lines. |
| `SeriesConfig` | typealias | `src/ui/components/data/chart/types.ts` | Inferred type for a single chart series config. |
| `seriesConfigSchema` | variable | `src/ui/components/data/chart/schema.ts` | Schema for a single data series in the chart. |
| `settingsPage` | function | `src/ui/presets/settings-page.ts` | Builds a manifest `PageConfig` for a settings page.  Consumers drop the result into their manifest's `pages` record:  ```ts const manifest = {   pages: {     "/settings": settingsPage({       title: "Settings",       sections: [         {           label: "Profile",           submitEndpoint: "PATCH /api/me/profile",           dataEndpoint: "GET /api/me/profile",           fields: [             { key: "name", type: "text", label: "Name", required: true },             { key: "bio", type: "textarea", label: "Bio" },           ],         },         {           label: "Password",           submitEndpoint: "POST /api/me/password",           fields: [             { key: "currentPassword", type: "password", label: "Current Password", required: true },             { key: "newPassword", type: "password", label: "New Password", required: true },           ],         },       ],     }),   }, }; ``` |
| `SettingsPageOptions` | interface | `src/ui/presets/types.ts` | Options for the `settingsPage` preset factory. Produces a settings page with a tab per section, each containing an AutoForm. |
| `settingsPresetConfigSchema` | variable | `src/ui/presets/schemas.ts` | Validate preset config for a settings page composed from one or more submitted sections. |
| `SettingsSectionDef` | interface | `src/ui/presets/types.ts` | A single settings section (one tab in the settings page). |
| `SetValueAction` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `setValueActionSchema` | variable | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `ShowToastOptions` | interface | `src/ui/actions/toast.tsx` | User-facing toast options accepted by the toast manager. |
| `SkeletonBase` | function | `src/ui/components/data/skeleton/standalone.tsx` | Standalone Skeleton — a placeholder loading indicator. No manifest context required. |
| `SkeletonBaseProps` | interface | `src/ui/components/data/skeleton/standalone.tsx` | No JSDoc description. |
| `Slider` | function | `src/ui/components/forms/slider/component.tsx` | Render a manifest-driven slider input. |
| `SliderConfig` | typealias | `src/ui/components/forms/slider/types.ts` | Config for the manifest-driven slider component. |
| `sliderConfigSchema` | variable | `src/ui/components/forms/slider/schema.ts` | Schema for single-value and ranged slider controls with optional value display/actions. |
| `SliderField` | function | `src/ui/components/forms/slider/standalone.tsx` | Standalone SliderField -- a range slider with optional label, value display, limit labels, and dual-thumb range mode. No manifest context required. |
| `SliderFieldProps` | interface | `src/ui/components/forms/slider/standalone.tsx` | No JSDoc description. |
| `SnapshotApiContext` | variable | `src/ui/actions/executor.ts` | Backward-compatible provider shim that writes the API client into Jotai state. |
| `SnapshotImage` | function | `src/ui/components/media/image/component.tsx` | Manifest adapter — extracts config props and delegates to SnapshotImageBase. |
| `SnapshotImageBase` | function | `src/ui/components/media/image/standalone.tsx` | Standalone SnapshotImage — an optimized image component with placeholder support. No manifest context required. |
| `SnapshotImageBaseProps` | interface | `src/ui/components/media/image/standalone.tsx` | No JSDoc description. |
| `SnapshotImageConfig` | typealias | `src/ui/components/media/image/types.ts` | Inferred config type from the SnapshotImage Zod schema. This is the single source of truth for what props the `<SnapshotImage>` component accepts. Never define this type manually. |
| `snapshotImageSchema` | variable | `src/ui/components/media/image/schema.ts` | Schema for optimized image components rendered through Snapshot's image route. |
| `SortState` | interface | `src/ui/components/data/data-table/types.ts` | Sort state for the data table. |
| `SpacerBase` | function | `src/ui/components/layout/spacer/standalone.tsx` | Standalone Spacer -- an empty element that takes up space along an axis. No manifest context required. |
| `SpacerBaseProps` | interface | `src/ui/components/layout/spacer/standalone.tsx` | No JSDoc description. |
| `SpacingScale` | typealias | `../frontend-contract/src/tokens/types.ts` | No JSDoc description. |
| `spacingSchema` | variable | `../frontend-contract/src/tokens/schema.ts` | No JSDoc description. |
| `SplitPaneBase` | function | `src/ui/components/layout/split-pane/standalone.tsx` | Standalone SplitPane -- a resizable two-pane layout with a draggable divider. No manifest context required. |
| `SplitPaneBaseProps` | interface | `src/ui/components/layout/split-pane/standalone.tsx` | No JSDoc description. |
| `StackBase` | function | `src/ui/components/primitives/stack/standalone.tsx` | Standalone Stack — a flex-column layout container with token-based spacing. No manifest context required. |
| `StackBaseProps` | interface | `src/ui/components/primitives/stack/standalone.tsx` | No JSDoc description. |
| `StatCard` | function | `src/ui/components/data/stat-card/component.tsx` | No JSDoc description. |
| `StatCardBase` | function | `src/ui/components/data/stat-card/standalone.tsx` | Standalone StatCard — displays a single metric with optional trend indicator. No manifest context required. |
| `StatCardBaseProps` | interface | `src/ui/components/data/stat-card/standalone.tsx` | No JSDoc description. |
| `StatCardConfig` | typealias | `src/ui/components/data/stat-card/types.ts` | Inferred config type from the StatCard Zod schema. |
| `statCardConfigSchema` | variable | `src/ui/components/data/stat-card/schema.ts` | Zod config schema for the StatCard component.  Defines all manifest-settable fields for a stat card that displays a single metric with optional trend indicator. |
| `StatCardTrend` | interface | `src/ui/components/data/stat-card/standalone.tsx` | No JSDoc description. |
| `StatDef` | interface | `src/ui/presets/types.ts` | A single stat card definition for the dashboard page. |
| `StateConfig` | typealias | `src/ui/manifest/types.ts` | Named manifest state map keyed by state id. |
| `StateConfigMap` | typealias | `src/ui/state/types.ts` | Map of named state definitions declared by the manifest runtime. |
| `StateHookScope` | typealias | `src/ui/state/hooks.ts` | Hook-level scope override that can force app, route, or auto-discovered state resolution. |
| `StateProviderProps` | interface | `src/ui/state/types.ts` | Props accepted by the provider layer that wires manifest state into a React tree. |
| `StateScope` | typealias | `../frontend-contract/src/state/types.ts` | No JSDoc description. |
| `StateValueConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `stateValueConfigSchema` — defaulted fields are optional. |
| `stateValueConfigSchema` | variable | `../frontend-contract/src/state/schema.ts` | No JSDoc description. |
| `StepperBase` | function | `src/ui/components/navigation/stepper/standalone.tsx` | Standalone Stepper — a multi-step progress indicator with plain React props. No manifest context required. |
| `StepperBaseProps` | interface | `src/ui/components/navigation/stepper/standalone.tsx` | No JSDoc description. |
| `StepperBaseStep` | interface | `src/ui/components/navigation/stepper/standalone.tsx` | No JSDoc description. |
| `SwitchField` | function | `src/ui/components/forms/switch/standalone.tsx` | Standalone SwitchField -- a toggle switch with label, description, and configurable size and color. No manifest context required. |
| `SwitchFieldProps` | interface | `src/ui/components/forms/switch/standalone.tsx` | No JSDoc description. |
| `TabConfig` | typealias | `src/ui/components/navigation/tabs/schema.ts` | Inferred type for a single tab config. |
| `tabConfigSchema` | variable | `src/ui/components/navigation/tabs/schema.ts` | Schema for a single tab within the tabs component. |
| `TabsBase` | function | `src/ui/components/navigation/tabs/standalone.tsx` | Standalone Tabs — tabbed navigation with plain React props. No manifest context required. |
| `TabsBaseProps` | interface | `src/ui/components/navigation/tabs/standalone.tsx` | No JSDoc description. |
| `TabsBaseTab` | interface | `src/ui/components/navigation/tabs/standalone.tsx` | No JSDoc description. |
| `TabsComponent` | function | `src/ui/components/navigation/tabs/component.tsx` | Manifest adapter — resolves config refs via useTabs hook, renders manifest children in tab panels, delegates layout to TabsBase. |
| `TabsConfig` | typealias | `src/ui/components/navigation/tabs/schema.ts` | Inferred type for tabs config. |
| `tabsConfigSchema` | variable | `src/ui/components/navigation/tabs/schema.ts` | Zod schema for tabs component config. Tabs provide in-page navigation between content panels. Each tab's content is rendered via ComponentRenderer. |
| `TagSelector` | function | `src/ui/components/forms/tag-selector/component.tsx` | No JSDoc description. |
| `TagSelectorConfig` | typealias | `src/ui/components/forms/tag-selector/types.ts` | Inferred config type from the TagSelector Zod schema. |
| `tagSelectorConfigSchema` | variable | `src/ui/components/forms/tag-selector/schema.ts` | Zod config schema for the TagSelector component.  A tag input that allows selecting from predefined tags or creating new ones. Tags display as colored pills with remove buttons. |
| `TagSelectorField` | function | `src/ui/components/forms/tag-selector/standalone.tsx` | Standalone TagSelectorField -- tag pills with dropdown selection, search filtering, and optional tag creation. No manifest context required. |
| `TagSelectorFieldProps` | interface | `src/ui/components/forms/tag-selector/standalone.tsx` | No JSDoc description. |
| `TagSelectorTag` | interface | `src/ui/components/forms/tag-selector/standalone.tsx` | No JSDoc description. |
| `Textarea` | function | `src/ui/components/forms/textarea/component.tsx` | No JSDoc description. |
| `TextareaConfig` | typealias | `src/ui/components/forms/textarea/types.ts` | Inferred config type from the Textarea Zod schema. |
| `textareaConfigSchema` | variable | `src/ui/components/forms/textarea/schema.ts` | Zod config schema for the Textarea component.  Defines a multi-line text input with label, character count, validation, and configurable resize behavior. |
| `TextareaField` | function | `src/ui/components/forms/textarea/standalone.tsx` | Standalone TextareaField -- a complete textarea form field with label, character counter, validation, and helper/error text. No manifest context required. |
| `TextareaFieldProps` | interface | `src/ui/components/forms/textarea/standalone.tsx` | No JSDoc description. |
| `TextBase` | function | `src/ui/components/primitives/text/standalone.tsx` | Standalone Text — renders a styled paragraph element with token-based typography. No manifest context required. |
| `TextBaseProps` | interface | `src/ui/components/primitives/text/standalone.tsx` | No JSDoc description. |
| `ThemeColors` | typealias | `../frontend-contract/src/tokens/types.ts` | No JSDoc description. |
| `themeColorsSchema` | variable | `../frontend-contract/src/tokens/schema.ts` | No JSDoc description. |
| `ThemeConfig` | typealias | `../frontend-contract/src/tokens/types.ts` | No JSDoc description. |
| `themeConfigSchema` | variable | `../frontend-contract/src/tokens/schema.ts` | No JSDoc description. |
| `throttleAction` | function | `src/ui/actions/timing.ts` | Throttle async or sync action execution by key and drop calls inside the active throttle window. |
| `TimelineBase` | function | `src/ui/components/content/timeline/standalone.tsx` | Standalone Timeline — vertical event timeline with dot markers, connectors, date labels, and default/compact/alternating layout variants. No manifest context required. |
| `TimelineBaseProps` | interface | `src/ui/components/content/timeline/standalone.tsx` | No JSDoc description. |
| `TimelineItemEntry` | interface | `src/ui/components/content/timeline/standalone.tsx` | No JSDoc description. |
| `ToastAction` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `toastActionSchema` | variable | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `ToastConfig` | typealias | `src/ui/manifest/types.ts` | Input shape for `toastConfigSchema` — defaulted fields are optional. |
| `toastConfigSchema` | variable | `src/ui/manifest/schema.ts` | Manifest toast defaults used by the `toast` action runtime. |
| `ToastContainer` | function | `src/ui/actions/toast.tsx` | Render the active toast queue using runtime-configured placement defaults. |
| `ToastItem` | interface | `src/ui/actions/toast.tsx` | Resolved toast entry stored in the runtime queue. |
| `ToastManager` | interface | `src/ui/actions/toast.tsx` | Imperative API for enqueueing and dismissing transient toast messages. |
| `Toggle` | function | `src/ui/components/forms/toggle/component.tsx` | No JSDoc description. |
| `ToggleConfig` | typealias | `src/ui/components/forms/toggle/types.ts` | Inferred config type from the Toggle Zod schema. |
| `toggleConfigSchema` | variable | `src/ui/components/forms/toggle/schema.ts` | Zod config schema for the Toggle component.  Defines a pressed/unpressed toggle button that publishes its state. Can display text, an icon, or both. |
| `ToggleField` | function | `src/ui/components/forms/toggle/standalone.tsx` | Standalone ToggleField -- a pressable toggle button with optional icon and label. No manifest context required. |
| `ToggleFieldProps` | interface | `src/ui/components/forms/toggle/standalone.tsx` | No JSDoc description. |
| `ToggleGroupBase` | function | `src/ui/components/forms/toggle-group/standalone.tsx` | Standalone ToggleGroupBase -- a group of toggle buttons supporting single or multi-select modes. No manifest context required. |
| `ToggleGroupBaseProps` | interface | `src/ui/components/forms/toggle-group/standalone.tsx` | No JSDoc description. |
| `ToggleGroupItem` | interface | `src/ui/components/forms/toggle-group/standalone.tsx` | No JSDoc description. |
| `TokenEditor` | interface | `../frontend-contract/src/tokens/types.ts` | No JSDoc description. |
| `TooltipBase` | function | `src/ui/components/data/tooltip/standalone.tsx` | Standalone Tooltip — wraps child content and shows informational text on hover with configurable placement and delay. No manifest context required. |
| `TooltipBaseProps` | interface | `src/ui/components/data/tooltip/standalone.tsx` | No JSDoc description. |
| `toPersistedStateKey` | function | `src/ui/state/persist.ts` | Build the storage key used for persisted Snapshot state entries. |
| `TouchedFields` | typealias | `src/ui/components/forms/auto-form/types.ts` | Tracks which fields have been interacted with. |
| `TrackAction` | interface | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `trackActionSchema` | variable | `../frontend-contract/src/actions/types.ts` | No JSDoc description. |
| `TransitionWrapper` | function | `src/ui/manifest/transition-wrapper.tsx` | Apply enter transitions around routed content when a route transition config is present. |
| `TreeViewBase` | function | `src/ui/components/navigation/tree-view/standalone.tsx` | Standalone TreeView — a hierarchical tree with expand/collapse and selection. No manifest context required. |
| `TreeViewBaseItem` | interface | `src/ui/components/navigation/tree-view/standalone.tsx` | No JSDoc description. |
| `TreeViewBaseProps` | interface | `src/ui/components/navigation/tree-view/standalone.tsx` | No JSDoc description. |
| `trendConfigSchema` | variable | `src/ui/components/data/stat-card/schema.ts` | Schema for the trend indicator configuration. |
| `TryWorkflowNode` | interface | `../frontend-contract/src/workflows/types.ts` | No JSDoc description. |
| `TypingIndicator` | function | `src/ui/components/communication/typing-indicator/component.tsx` | Manifest adapter — resolves config refs and delegates to TypingIndicatorBase. |
| `TypingIndicatorBase` | function | `src/ui/components/communication/typing-indicator/standalone.tsx` | Standalone TypingIndicator — shows animated bouncing dots with user names to indicate who is currently typing. No manifest context required. |
| `TypingIndicatorBaseProps` | interface | `src/ui/components/communication/typing-indicator/standalone.tsx` | No JSDoc description. |
| `TypingIndicatorConfig` | typealias | `src/ui/components/communication/typing-indicator/types.ts` | Inferred config type from the TypingIndicator Zod schema. |
| `typingIndicatorConfigSchema` | variable | `src/ui/components/communication/typing-indicator/schema.ts` | Zod config schema for the TypingIndicator component. Displays an animated "User is typing..." indicator with bouncing dots. |
| `TypingUser` | interface | `src/ui/components/communication/typing-indicator/standalone.tsx` | A user entry for the typing indicator. |
| `UI_BREAKPOINTS` | variable | `src/ui/hooks/use-breakpoint.ts` | Breakpoint pixel thresholds (mobile-first, min-width). |
| `useActionExecutor` | function | `src/ui/actions/executor.ts` | Return the action executor bound to the active runtime, registries, overlays, workflows, and optional API client. |
| `useApiClient` | function | `src/ui/state/api.ts` | Read the active API client from the app-scope Jotai store. |
| `useAutoBreadcrumbs` | function | `src/ui/hooks/use-auto-breadcrumbs.ts` | Resolve auto-generated breadcrumb items for the current route match. |
| `useAutoForm` | function | `src/ui/components/forms/auto-form/hook.ts` | Headless hook for form state management.  Tracks field values, validation errors, and touched state. Validates on blur (per-field) and on submit (all fields). |
| `UseAutoFormResult` | interface | `src/ui/components/forms/auto-form/types.ts` | Return type for the useAutoForm headless hook. |
| `useBreakpoint` | function | `src/ui/hooks/use-breakpoint.ts` | Returns the currently active breakpoint based on window width. Uses `matchMedia` for efficient, event-driven updates (no resize polling). Returns `"default"` during SSR. |
| `useComponentData` | function | `src/ui/components/_base/use-component-data.ts` | Shared data-fetching hook for config-driven components.  Parses a data config string like `"GET /api/stats/revenue"` into method + endpoint, resolves any `FromRef` values in params via `useSubscribe`, and fetches data using the app-scope API client.  When the API client is not available (e.g., in tests or before ManifestApp provides it), the hook returns a loading state without throwing. |
| `useConfirmManager` | function | `src/ui/actions/confirm.tsx` | Return the shared confirmation manager for the current Snapshot UI tree. |
| `useDataTable` | function | `src/ui/components/data/data-table/hook.ts` | Headless hook for managing data table state.  Provides sorting, pagination, filtering, selection, and search functionality without any rendering. Resolves `FromRef` values in the `data` and `params` fields via `useSubscribe`. |
| `UseDataTableResult` | interface | `src/ui/components/data/data-table/types.ts` | Return type of the `useDataTable` headless hook. Provides all state and handlers needed to render a data table. |
| `useDetailCard` | function | `src/ui/components/data/detail-card/hook.ts` | Hook that powers the DetailCard component. Resolves FromRefs, fetches data from endpoints, formats fields, and publishes the record data for other components to subscribe to. |
| `UseDetailCardResult` | interface | `src/ui/components/data/detail-card/types.ts` | Return type of the useDetailCard hook. |
| `useDndSensors` | function | `src/ui/hooks/use-drag-drop.ts` | Pre-configured sensor setup for pointer + keyboard DnD. Pointer requires 5px distance to activate (prevents click hijacking). Keyboard uses standard coordinates for arrow key navigation. |
| `UseFeedResult` | interface | `src/ui/components/data/feed/types.ts` | Return type of the useFeed headless hook. |
| `useInfiniteScroll` | function | `src/ui/hooks/use-infinite-scroll.ts` | Observe a sentinel element and load the next page when it enters the viewport. |
| `UseInfiniteScrollOptions` | interface | `src/ui/hooks/use-infinite-scroll.ts` | Options for loading additional items when a sentinel approaches the viewport. |
| `useManifestResourceCache` | function | `src/ui/manifest/runtime.tsx` | Access the manifest resource cache runtime for loads, invalidation, and resource-driven mutations. |
| `useManifestResourceFocusRefetch` | function | `src/ui/manifest/runtime.tsx` | Invalidate a manifest resource when the window regains focus. |
| `useManifestResourceMountRefetch` | function | `src/ui/manifest/runtime.tsx` | Invalidate a manifest resource on mount when the resource opts into it. |
| `useManifestRuntime` | function | `src/ui/manifest/runtime.tsx` | Access the compiled manifest runtime. |
| `useModalManager` | function | `src/ui/actions/modal-manager.ts` | Hook to manage modal open/close state via a Jotai atom stack. Provides open, close, isOpen, and the current stack. |
| `useNav` | function | `src/ui/components/layout/nav/hook.ts` | Headless hook for nav component logic. Resolves nav items with active state, role-based visibility, badge resolution from FromRefs, and collapse toggle. |
| `UseNavResult` | interface | `src/ui/components/layout/nav/types.ts` | Return type of the useNav headless hook. |
| `useOverlayRuntime` | function | `src/ui/manifest/runtime.tsx` | Access the current overlay runtime state. |
| `usePersistedAtom` | function | `src/ui/state/use-persisted-atom.ts` | Bind a primitive atom to browser storage so its value survives page reloads. |
| `usePoll` | function | `src/ui/hooks/use-poll.ts` | Invoke a callback on an interval with optional document-visibility pausing. |
| `UsePollOptions` | interface | `src/ui/hooks/use-poll.ts` | Options controlling interval-based polling from client components. |
| `usePublish` | function | `src/ui/context/hooks.ts` | Registers a component in the page context and returns a setter function to publish values that other components can subscribe to via `{ from: "id" }`. |
| `useResetStateValue` | function | `src/ui/state/hooks.ts` | Return a callback that resets a named manifest state entry to its configured default. |
| `useResolveFrom` | function | `src/ui/context/hooks.ts` | Resolves all `FromRef` values in a config object at once. |
| `useResponsiveValue` | function | `src/ui/hooks/use-breakpoint.ts` | Resolve a responsive value to the appropriate value for the current breakpoint. Accepts either a flat value (returned as-is) or a responsive map with breakpoint keys. Falls back to the next smaller defined breakpoint. |
| `useRoutePrefetch` | function | `src/ui/manifest/use-route-prefetch.ts` | Prefetch route-scoped resources when a compiled route advertises eager endpoints. |
| `useRouteRuntime` | function | `src/ui/manifest/runtime.tsx` | Access the current route runtime state. |
| `useSetStateValue` | function | `src/ui/state/hooks.ts` | Return a setter that writes to a named manifest state entry in the resolved scope. |
| `UseStatCardResult` | interface | `src/ui/components/data/stat-card/types.ts` | Result returned by the StatCard headless hook or internal logic. Provides all the data needed to render a stat card. |
| `useStateValue` | function | `src/ui/state/hooks.ts` | Read the current value for a named manifest state entry. |
| `useSubscribe` | function | `src/ui/context/hooks.ts` | Subscribes to a value from the shared binding/state registry system. |
| `useToastManager` | function | `src/ui/actions/toast.tsx` | Return the toast manager bound to the active manifest runtime configuration. |
| `useTokenEditor` | function | `src/ui/tokens/editor.ts` | React hook for runtime token editing. Provides setToken/setFlavor/resetTokens/getTokens/subscribe for live theme customization. Changes are applied instantly via inline styles on document.documentElement. |
| `useUrlSync` | function | `src/ui/hooks/use-url-sync.ts` | Keep a slice of local state synchronized with URL query parameters. |
| `useVirtualList` | function | `src/ui/hooks/use-virtual-list.ts` | Compute the visible slice for a fixed-height virtualized list container. |
| `useWizard` | function | `src/ui/components/forms/wizard/hook.ts` | Headless hook that manages multi-step wizard state including step navigation, per-step validation, field tracking, and final submission.  Provides reactive state for the current step, accumulated data across steps, validation errors, and transition controls (next/prev/skip/reset). |
| `UseWizardResult` | interface | `src/ui/components/forms/wizard/types.ts` | Return type of the useWizard headless hook. |
| `validateContrast` | function | `src/ui/tokens/contrast-checker.ts` | Warn when manifest theme color pairs fail WCAG AA contrast. |
| `VideoBase` | function | `src/ui/components/media/video/standalone.tsx` | Standalone Video — a styled video element that works with plain React props. No manifest context required. |
| `VideoBaseProps` | interface | `src/ui/components/media/video/standalone.tsx` | No JSDoc description. |
| `VoteBase` | function | `src/ui/components/data/vote/standalone.tsx` | Standalone Vote — upvote/downvote toggle with count display. No manifest context required. |
| `VoteBaseProps` | interface | `src/ui/components/data/vote/standalone.tsx` | No JSDoc description. |
| `WaitWorkflowNode` | interface | `../frontend-contract/src/workflows/types.ts` | No JSDoc description. |
| `Wizard` | function | `src/ui/components/forms/wizard/component.tsx` | Render a multi-step form wizard with built-in validation, step state, and slot-aware styling. |
| `WizardBase` | function | `src/ui/components/forms/wizard/standalone.tsx` | Standalone WizardBase -- a multi-step form wizard with progress indicator, step navigation, field validation, and completion state. No manifest context required. |
| `WizardBaseProps` | interface | `src/ui/components/forms/wizard/standalone.tsx` | No JSDoc description. |
| `WizardConfig` | typealias | `src/ui/components/forms/wizard/types.ts` | Inferred type for the Wizard component configuration. |
| `WizardFieldConfig` | interface | `src/ui/components/forms/wizard/standalone.tsx` | No JSDoc description. |
| `wizardSchema` | variable | `src/ui/components/forms/wizard/schema.ts` | Zod schema for the Wizard component configuration.  A multi-step form flow. Each step collects fields independently. On the final step, all accumulated data is submitted to `submitEndpoint` (if set) and published to the page context via `id`. |
| `WizardState` | interface | `src/ui/components/forms/wizard/standalone.tsx` | No JSDoc description. |
| `WizardStepConfig` | typealias | `src/ui/components/forms/wizard/types.ts` | Inferred type for a single wizard step configuration. |
| `WizardStepDef` | interface | `src/ui/components/forms/wizard/standalone.tsx` | No JSDoc description. |
| `wizardStepSchema` | variable | `src/ui/components/forms/wizard/schema.ts` | Schema for a single wizard step. |
| `WorkflowActionHandler` | typealias | `../frontend-contract/src/workflows/types.ts` | No JSDoc description. |
| `WorkflowCondition` | interface | `../frontend-contract/src/workflows/types.ts` | No JSDoc description. |
| `WorkflowConditionOperator` | typealias | `../frontend-contract/src/workflows/types.ts` | No JSDoc description. |
| `workflowConditionSchema` | variable | `../frontend-contract/src/workflows/schema.ts` | No JSDoc description. |
| `WorkflowDefinition` | typealias | `../frontend-contract/src/workflows/types.ts` | No JSDoc description. |
| `workflowDefinitionSchema` | variable | `../frontend-contract/src/workflows/schema.ts` | No JSDoc description. |
| `WorkflowMap` | typealias | `../frontend-contract/src/workflows/types.ts` | No JSDoc description. |
| `WorkflowNode` | typealias | `../frontend-contract/src/workflows/types.ts` | No JSDoc description. |
| `workflowNodeSchema` | variable | `../frontend-contract/src/workflows/schema.ts` | No JSDoc description. |
| `writePersistedState` | function | `src/ui/state/persist.ts` | Serialize and store a persisted state value, ignoring browser storage failures. |

</details>

## Tokens & Flavors

| Export | Kind | Description |
|---|---|---|
| `AnalyticsProvider` | interface | Analytics provider runtime contract. |
| `AnalyticsProviderFactory` | typealias | Factory used to create analytics providers per snapshot instance. |
| `AnalyticsProviderInitConfig` | interface | Analytics provider initialization payload. |
| `colorToOklch` | function | Convert any supported color string to OKLCH values. Supports: hex (#rgb, #rrggbb), oklch strings ("L C H"), and oklch() CSS function. |
| `contrastRatio` | function | Calculate the WCAG contrast ratio between two supported color values. |
| `defineFlavor` | function | Define and register a new flavor. If a flavor with the same name already exists, it is replaced. |
| `deriveDarkVariant` | function | Derive a dark mode variant of a light color. Adjusts lightness and chroma for dark mode readability: - If the color is light (L > 0.5), reduce lightness moderately - If the color is dark (L <= 0.5), increase lightness for dark backgrounds - Boost chroma slightly for vibrancy in dark mode |
| `deriveForeground` | function | Derive a foreground color that passes WCAG AA contrast (4.5:1) against the given background color. Returns a light or dark foreground. |
| `getAllFlavors` | function | Get all registered flavors as a record. |
| `getFlavor` | function | Retrieve a registered flavor by name. |
| `hexToOklch` | function | Convert a hex color string to OKLCH values. |
| `hslToOklch` | function | Convert HSL values to OKLCH. |
| `meetsWcagAA` | function | Check whether two colors satisfy WCAG AA contrast for normal or large text. |
| `oklchToHex` | function | Convert OKLCH values back to a hex color string. Used for serializing runtime overrides. |
| `oklchToString` | function | Format OKLCH values as a CSS-compatible string (without the oklch() wrapper). Output format: "L C H" where L, C, H are rounded to 3 decimal places. |
| `parseOklchString` | function | Parse an oklch string (the CSS variable format "L C H") back to values. |
| `registerAnalyticsProvider` | function | Register a custom analytics provider factory by name. |
| `relativeLuminance` | function | Compute relative luminance from OKLCH for WCAG contrast calculations. Uses sRGB relative luminance (rec. 709) from the linear RGB values. |
| `resolveFrameworkStyles` | function | Returns a CSS string containing framework-level styles:  1. CSS reset (box-sizing, margin, padding, body defaults, font inherit) 2. Component polish CSS — data-attribute-driven styles for page layout,    data-table, stat-card, form, detail-card, and focus rings.  All values are parameterized via `--sn-*` token custom properties so the output adapts to whatever theme tokens are active. |
| `resolveTokens` | function | Resolve a theme configuration into a complete CSS string.  Pipeline: 1. Load base flavor (default: neutral) 2. Deep merge overrides onto flavor defaults 3. Convert all colors to oklch 4. Auto-derive foreground colors (contrast-aware) 5. Auto-derive dark mode colors if not provided 6. Map radius/spacing/font to CSS 7. Generate component-level tokens 8. Output CSS string with :root, .dark, and component selectors |
| `useTokenEditor` | function | React hook for runtime token editing. Provides setToken/setFlavor/resetTokens/getTokens/subscribe for live theme customization. Changes are applied instantly via inline styles on document.documentElement. |
| `validateContrast` | function | Warn when manifest theme color pairs fail WCAG AA contrast. |

### Details

#### `colorToOklch(color: string) => [number, number, number]`

Convert any supported color string to OKLCH values.
Supports: hex (#rgb, #rrggbb), oklch strings ("L C H"), and oklch() CSS function.

**Parameters:**

| Name | Description |
|------|-------------|
| `color` | Color string in any supported format |

**Returns:** Tuple of [lightness, chroma, hue]

---

#### `contrastRatio(left: string, right: string) => number`

Calculate the WCAG contrast ratio between two supported color values.

---

#### `defineFlavor(name: string, config: FlavorConfig) => Flavor`

Define and register a new flavor. If a flavor with the same name already exists,
it is replaced.

**Parameters:**

| Name | Description |
|------|-------------|
| `name` | Unique flavor identifier |
| `config` | Flavor configuration (colors, radius, spacing, font, components) |

**Returns:** The registered Flavor object

---

#### `deriveDarkVariant(lightColor: string) => string`

Derive a dark mode variant of a light color.
Adjusts lightness and chroma for dark mode readability:
- If the color is light (L > 0.5), reduce lightness moderately
- If the color is dark (L <= 0.5), increase lightness for dark backgrounds
- Boost chroma slightly for vibrancy in dark mode

**Parameters:**

| Name | Description |
|------|-------------|
| `lightColor` | Light mode color in any supported format |

**Returns:** OKLCH string for the dark mode variant

---

#### `deriveForeground(backgroundColor: string) => string`

Derive a foreground color that passes WCAG AA contrast (4.5:1) against
the given background color. Returns a light or dark foreground.

**Parameters:**

| Name | Description |
|------|-------------|
| `backgroundColor` | Background color in any supported format |

**Returns:** OKLCH string for the foreground color

---

#### `getAllFlavors() => Record<string, Flavor>`

Get all registered flavors as a record.

**Returns:** Record of flavor name to Flavor object

---

#### `getFlavor(name: string) => Flavor | undefined`

Retrieve a registered flavor by name.

**Parameters:**

| Name | Description |
|------|-------------|
| `name` | Flavor identifier |

**Returns:** The Flavor object, or undefined if not found

---

#### `hexToOklch(hex: string) => [number, number, number]`

Convert a hex color string to OKLCH values.

**Parameters:**

| Name | Description |
|------|-------------|
| `hex` | CSS hex color (e.g. "#ff0000", "#f00") |

**Returns:** Tuple of [lightness, chroma, hue]

---

#### `hslToOklch(h: number, s: number, l: number) => [number, number, number]`

Convert HSL values to OKLCH.

**Parameters:**

| Name | Description |
|------|-------------|
| `h` | Hue in degrees [0, 360) |
| `s` | Saturation [0, 100] |
| `l` | Lightness [0, 100] |

**Returns:** Tuple of [lightness, chroma, hue]

---

#### `meetsWcagAA(left: string, right: string, largeText?: boolean) => boolean`

Check whether two colors satisfy WCAG AA contrast for normal or large text.

---

#### `oklchToHex(l: number, c: number, h: number) => string`

Convert OKLCH values back to a hex color string.
Used for serializing runtime overrides.

**Parameters:**

| Name | Description |
|------|-------------|
| `l` | Lightness [0, 1] |
| `c` | Chroma [0, ~0.4] |
| `h` | Hue [0, 360) |

**Returns:** CSS hex color string (e.g. "#ff0000")

---

#### `oklchToString(l: number, c: number, h: number) => string`

Format OKLCH values as a CSS-compatible string (without the oklch() wrapper).
Output format: "L C H" where L, C, H are rounded to 3 decimal places.

**Parameters:**

| Name | Description |
|------|-------------|
| `l` | Lightness [0, 1] |
| `c` | Chroma [0, ~0.4] |
| `h` | Hue [0, 360) |

**Returns:** Formatted string like "0.637 0.237 25.465"

---

#### `parseOklchString(str: string) => [number, number, number]`

Parse an oklch string (the CSS variable format "L C H") back to values.

**Parameters:**

| Name | Description |
|------|-------------|
| `str` | OKLCH string like "0.637 0.237 25.465" |

**Returns:** Tuple of [lightness, chroma, hue]

---

#### `registerAnalyticsProvider(name: string, factory: AnalyticsProviderFactory) => void`

Register a custom analytics provider factory by name.

**Parameters:**

| Name | Description |
|------|-------------|
| `name` | Provider identifier used in `manifest.analytics.providers.*.name` |
| `factory` | Per-instance provider factory |

---

#### `relativeLuminance(color: string) => number`

Compute relative luminance from OKLCH for WCAG contrast calculations.
Uses sRGB relative luminance (rec. 709) from the linear RGB values.

---

#### `resolveFrameworkStyles(options?: { respectReducedMotion?: boolean | undefined; } | undefined) => string`

Returns a CSS string containing framework-level styles:

1. CSS reset (box-sizing, margin, padding, body defaults, font inherit)
2. Component polish CSS — data-attribute-driven styles for page layout,
   data-table, stat-card, form, detail-card, and focus rings.

All values are parameterized via `--sn-*` token custom properties so the
output adapts to whatever theme tokens are active.

---

#### `resolveTokens(config?: { mode?: "light" | "dark" | "system" | undefined; flavor?: string | undefined; flavors?: Record<string, { extends: string; colors?: { background?: string | undefined; input?: string | undefi...`

Resolve a theme configuration into a complete CSS string.

Pipeline:
1. Load base flavor (default: neutral)
2. Deep merge overrides onto flavor defaults
3. Convert all colors to oklch
4. Auto-derive foreground colors (contrast-aware)
5. Auto-derive dark mode colors if not provided
6. Map radius/spacing/font to CSS
7. Generate component-level tokens
8. Output CSS string with :root, .dark, and component selectors

**Parameters:**

| Name | Description |
|------|-------------|
| `config` | Theme configuration (flavor name + overrides) |

**Returns:** Complete CSS string ready to inject or write to a file

---

#### `useTokenEditor() => TokenEditor`

React hook for runtime token editing.

Provides setToken/setFlavor/resetTokens/getTokens/subscribe for live
theme customization. Changes are applied instantly via inline styles
on document.documentElement.

**Returns:** TokenEditor interface for runtime token manipulation

---

#### `validateContrast(theme: { mode?: "light" | "dark" | "system" | undefined; flavor?: string | undefined; flavors?: Record<string, { extends: string; colors?: { background?: string | undefined; input?: string | undefine...`

Warn when manifest theme color pairs fail WCAG AA contrast.

---

## API Client

| Export | Kind | Description |
|---|---|---|
| `getRegisteredClient` | function | Look up a previously registered custom client factory. |
| `registerClient` | function | Register a named custom client factory. |

### Details

#### `getRegisteredClient(name: string) => ClientFactory | undefined`

Look up a previously registered custom client factory.

**Parameters:**

| Name | Description |
|------|-------------|
| `name` | Registered client factory name |

**Returns:** The registered factory when found

---

#### `registerClient(name: string, factory: ClientFactory) => void`

Register a named custom client factory.

**Parameters:**

| Name | Description |
|------|-------------|
| `name` | Manifest-facing client factory name |
| `factory` | Factory that creates an ApiClient-like instance |

---

## Context & Data Binding

| Export | Kind | Description |
|---|---|---|
| `AppContextProvider` | function | Provides persistent global state that survives route changes. Initializes globals from the manifest config. |
| `AppContextProviderProps` | interface | Props for AppContextProvider. Wraps the entire app to provide persistent global state. |
| `GlobalConfig` | typealias | Global state definition from the manifest. This now aliases the shared state config used by the runtime. |
| `isFromRef` | variable | No JSDoc description. |
| `PageContextProvider` | function | Provides per-page state that is destroyed on route change. |
| `PageContextProviderProps` | interface | Props for PageContextProvider. Wraps each page/route to provide per-page component state. |
| `ResolvedConfig` | typealias | Resolves a type where FromRef values are replaced with their resolved types. Used internally — consumers don't need to use this directly. |
| `usePublish` | function | Registers a component in the page context and returns a setter function to publish values that other components can subscribe to via `{ from: "id" }`. |
| `useResolveFrom` | function | Resolves all `FromRef` values in a config object at once. |
| `useSubscribe` | function | Subscribes to a value from the shared binding/state registry system. |

### Details

#### `AppContextProvider({ globals, resources, api, children, }: AppContextProviderProps) => Element`

Provides persistent global state that survives route changes.
Initializes globals from the manifest config.

---

#### `PageContextProvider({ state, resources, api, children, }: PageContextProviderProps) => Element`

Provides per-page state that is destroyed on route change.

---

#### `usePublish(id: string | undefined) => (value: unknown) => void`

Registers a component in the page context and returns a setter function
to publish values that other components can subscribe to via `{ from: "id" }`.

---

#### `useResolveFrom<T extends Record<string, unknown>>(config: T) => ResolvedConfig<T>`

Resolves all `FromRef` values in a config object at once.

---

#### `useSubscribe(ref: unknown) => unknown`

Subscribes to a value from the shared binding/state registry system.

---

## State Runtime

| Export | Kind | Description |
|---|---|---|
| `AtomRegistry` | interface | Registry of named state atoms. Backing store is shared per scope (app or route). |
| `clearPersistedState` | function | Remove a persisted state value from the selected browser storage area. |
| `readPersistedState` | function | Read and JSON-decode a persisted state value, returning `undefined` on failure or absence. |
| `RuntimeStateConfig` | typealias | Named state definition from the manifest. App-scope state persists for the app lifetime. Route-scope state is recreated whenever the active route changes. |
| `StateConfigMap` | typealias | Map of named state definitions declared by the manifest runtime. |
| `StateHookScope` | typealias | Hook-level scope override that can force app, route, or auto-discovered state resolution. |
| `StateProviderProps` | interface | Props accepted by the provider layer that wires manifest state into a React tree. |
| `toPersistedStateKey` | function | Build the storage key used for persisted Snapshot state entries. |
| `useApiClient` | function | Read the active API client from the app-scope Jotai store. |
| `usePersistedAtom` | function | Bind a primitive atom to browser storage so its value survives page reloads. |
| `useResetStateValue` | function | Return a callback that resets a named manifest state entry to its configured default. |
| `useSetStateValue` | function | Return a setter that writes to a named manifest state entry in the resolved scope. |
| `useStateValue` | function | Read the current value for a named manifest state entry. |
| `writePersistedState` | function | Serialize and store a persisted state value, ignoring browser storage failures. |

### Details

#### `clearPersistedState(key: string, storage: PersistStorage) => void`

Remove a persisted state value from the selected browser storage area.

---

#### `readPersistedState(key: string, storage: PersistStorage) => unknown`

Read and JSON-decode a persisted state value, returning `undefined` on failure or absence.

---

#### `toPersistedStateKey(key: string) => string`

Build the storage key used for persisted Snapshot state entries.

---

#### `useApiClient() => ApiClient | null`

Read the active API client from the app-scope Jotai store.

---

#### `usePersistedAtom<T>(sourceAtom: PrimitiveAtom<T>, key: string, storage: PersistStorage) => [T, (value: T) => void]`

Bind a primitive atom to browser storage so its value survives page reloads.

---

#### `useResetStateValue(id: string, options?: { scope?: StateHookScope | undefined; } | undefined) => () => void`

Return a callback that resets a named manifest state entry to its configured default.

---

#### `useSetStateValue(id: string, options?: { scope?: StateHookScope | undefined; } | undefined) => (value: unknown) => void`

Return a setter that writes to a named manifest state entry in the resolved scope.

---

#### `useStateValue(id: string, options?: { scope?: StateHookScope | undefined; } | undefined) => unknown`

Read the current value for a named manifest state entry.

---

#### `writePersistedState(key: string, value: unknown, storage: PersistStorage) => void`

Serialize and store a persisted state value, ignoring browser storage failures.

---

## Actions

| Export | Kind | Description |
|---|---|---|
| `ConfirmDialog` | function | Render the global confirmation dialog for requests queued through `useConfirmManager`. |
| `ConfirmManager` | interface | Imperative API for opening a confirmation dialog from manifest actions or custom UI. |
| `ConfirmOptions` | typealias | Options accepted when opening a confirmation dialog. |
| `ConfirmRequest` | interface | Internal confirm-dialog request stored in the atom-backed manager queue. |
| `debounceAction` | function | Debounce async or sync action execution by key and resolve all pending callers with the final invocation result. |
| `interpolate` | function | Replace `{key}` placeholders with values from context. Supports nested paths: `{user.name}`, `{result.id}`. Missing keys are preserved as-is: `{unknown}` stays `{unknown}`. |
| `ModalManager` | interface | Return type of useModalManager. |
| `ShowToastOptions` | interface | User-facing toast options accepted by the toast manager. |
| `SnapshotApiContext` | variable | Backward-compatible provider shim that writes the API client into Jotai state. |
| `throttleAction` | function | Throttle async or sync action execution by key and drop calls inside the active throttle window. |
| `ToastContainer` | function | Render the active toast queue using runtime-configured placement defaults. |
| `ToastItem` | interface | Resolved toast entry stored in the runtime queue. |
| `ToastManager` | interface | Imperative API for enqueueing and dismissing transient toast messages. |
| `useActionExecutor` | function | Return the action executor bound to the active runtime, registries, overlays, workflows, and optional API client. |
| `useConfirmManager` | function | Return the shared confirmation manager for the current Snapshot UI tree. |
| `useModalManager` | function | Hook to manage modal open/close state via a Jotai atom stack. Provides open, close, isOpen, and the current stack. |
| `useToastManager` | function | Return the toast manager bound to the active manifest runtime configuration. |

### Details

#### `ConfirmDialog() => ReactNode`

Render the global confirmation dialog for requests queued through `useConfirmManager`.

---

#### `debounceAction<T>(key: string, fn: () => T | Promise<T>, ms: number) => Promise<T>`

Debounce async or sync action execution by key and resolve all pending callers
with the final invocation result.

---

#### `interpolate(template: string, context: Record<string, unknown>) => string`

Replace `{key}` placeholders with values from context.
Supports nested paths: `{user.name}`, `{result.id}`.
Missing keys are preserved as-is: `{unknown}` stays `{unknown}`.

**Parameters:**

| Name | Description |
|------|-------------|
| `template` | The template string with `{key}` placeholders |
| `context` | The context object to resolve values from |

**Returns:** The interpolated string

**Example:**

```ts
interpolate('/users/{id}', { id: 5 }) // → '/users/5'
interpolate('{user.name}', { user: { name: 'Jo' } }) // → 'Jo'
interpolate('{missing}', {}) // → '{missing}'
```

---

#### `throttleAction<T>(key: string, fn: () => T | Promise<T>, ms: number) => Promise<T | undefined>`

Throttle async or sync action execution by key and drop calls inside the
active throttle window.

---

#### `ToastContainer() => ReactNode`

Render the active toast queue using runtime-configured placement defaults.

---

#### `useActionExecutor() => ActionExecuteFn`

Return the action executor bound to the active runtime, registries, overlays,
workflows, and optional API client.

---

#### `useConfirmManager() => ConfirmManager`

Return the shared confirmation manager for the current Snapshot UI tree.

---

#### `useModalManager() => ModalManager`

Hook to manage modal open/close state via a Jotai atom stack.
Provides open, close, isOpen, and the current stack.

**Returns:** A ModalManager with methods to control the modal stack

**Example:**

```tsx
const { open, close, isOpen, stack } = useModalManager()
open('edit-user')
close('edit-user')
close() // closes topmost
```

---

#### `useToastManager() => ToastManager`

Return the toast manager bound to the active manifest runtime configuration.

---

## Manifest & Rendering

| Export | Kind | Description |
|---|---|---|
| `AnalyticsConfig` | typealias | Input shape for `analyticsConfigSchema` — defaulted fields are optional. |
| `analyticsConfigSchema` | variable | Manifest analytics runtime configuration. |
| `analyticsProviderSchema` | variable | Analytics provider declaration schema. |
| `AppConfig` | typealias | Input shape for `appConfigSchema` — defaulted fields are optional. |
| `appConfigSchema` | variable | Schema for the top-level manifest `app` section. |
| `AuthProviderConfig` | typealias | Input shape for `authProviderSchema` — defaulted fields are optional. |
| `authProviderSchema` | variable | Auth provider declaration schema.  Declared at `manifest.auth.providers.<name>`. |
| `AuthScreenConfig` | typealias | Input shape for `authScreenConfigSchema` — defaulted fields are optional. |
| `authScreenConfigSchema` | variable | Schema for the manifest auth screen and auth workflow configuration. |
| `BaseComponentConfig` | typealias | Input shape for `baseComponentConfigSchema` — defaulted fields are optional. |
| `baseComponentConfigSchema` | variable | Shared base schema applied to all manifest-driven components. |
| `bootBuiltins` | function | Register all built-in manifest registries exactly once. |
| `BreadcrumbAutoConfig` | interface | Auto-breadcrumb configuration used to derive labels and optional home state from routes. |
| `BreadcrumbItem` | interface | A single breadcrumb entry rendered from the matched route stack. |
| `ButtonConfig` | typealias | Input shape for `buttonConfigSchema` — defaulted fields are optional. |
| `CardConfig` | typealias | Input shape for `cardConfigSchema` — defaulted fields are optional. |
| `cardConfigSchema` | variable | Zod config schema for the Card component. Defines a card container with optional title, subtitle, children, gap, and suspense fallback. |
| `CompiledManifest` | interface | Runtime manifest shape produced by `compileManifest()`. |
| `CompiledRoute` | interface | Runtime route shape produced by `compileManifest()`. |
| `compileManifest` | function | Parse and compile a manifest into the runtime shape. |
| `ComponentConfig` | typealias | Runtime config union for manifest-renderable components. |
| `componentConfigSchema` | variable | Union schema covering every component config Snapshot can render from a manifest. |
| `ComponentRenderer` | function | Renders a single component from its manifest config. |
| `ComponentRendererProps` | interface | Props for the ComponentRenderer component. |
| `componentsConfigSchema` | variable | Schema for the top-level `components` section of a manifest. |
| `ConfigDrivenComponent` | typealias | React component type that can participate in the config-driven manifest runtime. |
| `customComponentDeclarationSchema` | variable | Schema for a custom component declaration under `components.custom`. |
| `customComponentPropSchema` | variable | Schema for a declared prop on a manifest custom component registration. |
| `defineManifest` | function | Define a manifest without compiling it. |
| `generateBreadcrumbs` | function | Generate breadcrumb items from the current matched route hierarchy. |
| `generateJsonSchema` | function | Generate a JSON Schema for snapshot manifests.  The schema is intentionally conservative and focuses on the public top-level manifest contract so editors can provide autocomplete and inline validation without requiring Snapshot's full runtime schema registry at generation time. |
| `getRegisteredGuards` | function | List the names of all currently registered route guards. |
| `getRegisteredSchemaTypes` | function | Return the currently registered manifest component type names. |
| `HeadingConfig` | typealias | Input shape for `headingConfigSchema` — defaulted fields are optional. |
| `headingConfigSchema` | variable | Schema for the built-in `heading` component. |
| `injectStyleSheet` | function | Inject or update a stylesheet in the document head. |
| `ManifestApp` | function | Render the manifest-driven application shell. |
| `ManifestAppProps` | interface | Props accepted by the `ManifestApp` component. |
| `ManifestConfig` | typealias | Raw manifest input shape accepted by `parseManifest()` before defaults are applied during compilation. |
| `manifestConfigSchema` | variable | Top-level schema for `snapshot.manifest.json`. |
| `ManifestResourceLoader` | typealias | No JSDoc description. |
| `ManifestResourceLoaderContext` | interface | No JSDoc description. |
| `ManifestRuntimeExtensions` | interface | No JSDoc description. |
| `ManifestRuntimeProvider` | function | Provides manifest runtime state, resource cache state, and mutation helpers. |
| `NavigationConfig` | typealias | Input shape for `navigationConfigSchema` — defaulted fields are optional. |
| `navigationConfigSchema` | variable | Schema for the top-level manifest navigation configuration. |
| `NavItem` | interface | Navigation item rendered by Snapshot navigation components. |
| `navItemSchema` | variable | Recursive schema for navigation items used by manifest navigation surfaces. |
| `outletComponentSchema` | variable | Schema for the built-in `outlet` component used by route layouts. |
| `OutletConfig` | typealias | Input shape for `outletComponentSchema` — defaulted fields are optional. |
| `OverlayConfig` | typealias | Input shape for `overlayConfigSchema` — defaulted fields are optional. |
| `overlayConfigSchema` | variable | Schema for named modal, drawer, and confirm-dialog overlay declarations. |
| `OverlayRuntimeProvider` | function | Provide the current overlay runtime payload and metadata. |
| `PageConfig` | typealias | Input shape for `pageConfigSchema` — defaulted fields are optional. |
| `pageConfigSchema` | variable | Schema for a manifest page definition. |
| `PageRenderer` | function | Renders a page from its manifest config. |
| `PageRendererProps` | interface | Props for the PageRenderer component. |
| `parseManifest` | function | Parse an unknown value into a validated manifest. |
| `PushConfig` | typealias | Input shape for `pushConfigSchema` — defaulted fields are optional. |
| `pushConfigSchema` | variable | Manifest push-notification runtime configuration. |
| `registerComponent` | function | Register a React component for a manifest component type string. Used by the framework for built-in components and by consumers for custom components.  Emits a dev warning if overriding an existing registration. |
| `registerComponentSchema` | function | Register a component-specific manifest schema by component `type`. |
| `registerGuard` | function | Register a named route guard implementation for manifest resolution. |
| `resetBootBuiltins` | function | Reset the boot flag so tests can re-run built-in registration deterministically. |
| `resolveGuard` | function | Resolve a previously registered route guard by name. |
| `ResourceConfigMap` | typealias | Named manifest resource map keyed by resource id. |
| `RouteConfig` | typealias | Input shape for `routeConfigSchema` — defaulted fields are optional. |
| `routeConfigSchema` | variable | Recursive schema for a manifest route tree node. |
| `RouteGuard` | typealias | Input shape for `routeGuardSchema` — defaulted fields are optional. |
| `RouteGuardConfig` | typealias | Input shape for `routeGuardConfigSchema` — defaulted fields are optional. |
| `routeGuardConfigSchema` | variable | Object-form route guard schema with auth, role, and policy controls. |
| `routeGuardSchema` | variable | Route guard schema, accepting either a named guard or inline guard config. |
| `RouteMatch` | interface | Resolved route match for the current pathname. |
| `RouteRuntimeProvider` | function | Provide route runtime state to manifest-rendered components. |
| `routeTransitionSchema` | variable | Schema for route transition metadata. |
| `RowConfig` | interface | Runtime config for the built-in `row` layout component. |
| `rowConfigSchema` | variable | Schema for the built-in `row` layout component. |
| `SelectConfig` | typealias | Input shape for `selectConfigSchema` — defaulted fields are optional. |
| `StateConfig` | typealias | Named manifest state map keyed by state id. |
| `StateValueConfig` | typealias | Input shape for `stateValueConfigSchema` — defaulted fields are optional. |
| `ToastConfig` | typealias | Input shape for `toastConfigSchema` — defaulted fields are optional. |
| `toastConfigSchema` | variable | Manifest toast defaults used by the `toast` action runtime. |
| `TransitionWrapper` | function | Apply enter transitions around routed content when a route transition config is present. |
| `useManifestResourceCache` | function | Access the manifest resource cache runtime for loads, invalidation, and resource-driven mutations. |
| `useManifestResourceFocusRefetch` | function | Invalidate a manifest resource when the window regains focus. |
| `useManifestResourceMountRefetch` | function | Invalidate a manifest resource on mount when the resource opts into it. |
| `useManifestRuntime` | function | Access the compiled manifest runtime. |
| `useOverlayRuntime` | function | Access the current overlay runtime state. |
| `useRoutePrefetch` | function | Prefetch route-scoped resources when a compiled route advertises eager endpoints. |
| `useRouteRuntime` | function | Access the current route runtime state. |

### Details

#### `bootBuiltins() => void`

Register all built-in manifest registries exactly once.

**Returns:** Nothing.

---

#### `compileManifest(manifest: unknown) => CompiledManifest`

Parse and compile a manifest into the runtime shape.

**Parameters:**

| Name | Description |
|------|-------------|
| `manifest` | Manifest JSON or object |
| `options` | Compile options |

**Returns:** The compiled manifest runtime model

---

#### `ComponentRenderer({ config }: ComponentRendererProps) => Element | null`

Renders a single component from its manifest config.

---

#### `defineManifest<TManifest extends ManifestConfig>(manifest: TManifest) => TManifest`

Define a manifest without compiling it.

**Parameters:**

| Name | Description |
|------|-------------|
| `manifest` | Manifest object to return unchanged |

**Returns:** The same manifest object, typed as `ManifestConfig`

---

#### `generateBreadcrumbs(match: RouteMatch, config: BreadcrumbAutoConfig) => BreadcrumbItem[]`

Generate breadcrumb items from the current matched route hierarchy.

---

#### `generateJsonSchema() => Record<string, unknown>`

Generate a JSON Schema for snapshot manifests.

The schema is intentionally conservative and focuses on the public top-level
manifest contract so editors can provide autocomplete and inline validation
without requiring Snapshot's full runtime schema registry at generation time.

---

#### `getRegisteredGuards() => string[]`

List the names of all currently registered route guards.

---

#### `getRegisteredSchemaTypes() => string[]`

Return the currently registered manifest component type names.

---

#### `injectStyleSheet(id: string, css: string) => void`

Inject or update a stylesheet in the document head.

**Parameters:**

| Name | Description |
|------|-------------|
| `id` | Stable style element id |
| `css` | CSS text to inject |

---

#### `ManifestApp({ manifest, apiUrl, lazyComponents, }: ManifestAppProps) => Element | null`

Render the manifest-driven application shell.

**Parameters:**

| Name | Description |
|------|-------------|
| `props` | Manifest runtime props |

**Returns:** A fully rendered manifest application

---

#### `ManifestRuntimeProvider({ manifest, api, clients, children, }: { manifest: CompiledManifest; api?: ApiClientLike | undefined; clients?: Record<string, ApiClientLike> | undefined; children: ReactNode; }) => Element`

Provides manifest runtime state, resource cache state, and mutation helpers.

**Parameters:**

| Name | Description |
|------|-------------|
| `props` | Provider props containing compiled manifest and API clients |

---

#### `OverlayRuntimeProvider({ value, children, }: { value: OverlayRuntimeValue; children: ReactNode; }) => Element`

Provide the current overlay runtime payload and metadata.

---

#### `PageRenderer({ page, routeId, state, resources, api, }: PageRendererProps) => Element`

Renders a page from its manifest config.

---

#### `parseManifest(manifest: unknown) => Record<string, any>`

Parse an unknown value into a validated manifest.

**Parameters:**

| Name | Description |
|------|-------------|
| `manifest` | Unknown input value |

**Returns:** The parsed manifest

---

#### `registerComponent(type: string, component: ConfigDrivenComponent) => void`

Register a React component for a manifest component type string.
Used by the framework for built-in components and by consumers for custom components.

Emits a dev warning if overriding an existing registration.

**Parameters:**

| Name | Description |
|------|-------------|
| `type` | The component type string (e.g. "row", "heading", "stat-card") |
| `component` | The React component that renders this type |

---

#### `registerComponentSchema(type: string, schema: ZodType<any, ZodTypeDef, any>) => void`

Register a component-specific manifest schema by component `type`.

---

#### `registerGuard(name: string, def: GuardDef) => void`

Register a named route guard implementation for manifest resolution.

---

#### `resetBootBuiltins() => void`

Reset the boot flag so tests can re-run built-in registration deterministically.

---

#### `resolveGuard(name: string) => GuardDef | undefined`

Resolve a previously registered route guard by name.

---

#### `RouteRuntimeProvider({ value, children, }: { value: RouteRuntimeValue; children: ReactNode; }) => Element`

Provide route runtime state to manifest-rendered components.

---

#### `TransitionWrapper({ config, routeKey, children, }: { config?: TransitionConfig | undefined; routeKey: string; children: ReactNode; }) => Element`

Apply enter transitions around routed content when a route transition config is present.

---

#### `useManifestResourceCache() => ManifestResourceCacheValue | null`

Access the manifest resource cache runtime for loads, invalidation, and
resource-driven mutations.

---

#### `useManifestResourceFocusRefetch(resourceName?: string | undefined, enabled?: boolean) => void`

Invalidate a manifest resource when the window regains focus.

---

#### `useManifestResourceMountRefetch(resourceName?: string | undefined, enabled?: boolean) => void`

Invalidate a manifest resource on mount when the resource opts into it.

---

#### `useManifestRuntime() => CompiledManifest | null`

Access the compiled manifest runtime.

---

#### `useOverlayRuntime() => OverlayRuntimeValue | null`

Access the current overlay runtime state.

---

#### `useRoutePrefetch(endpoints: (string | { resource: string; params?: Record<string, unknown> | undefined; })[] | undefined) => void`

Prefetch route-scoped resources when a compiled route advertises eager endpoints.

---

#### `useRouteRuntime() => RouteRuntimeValue | null`

Access the current route runtime state.

---

## Components — Data

| Export | Kind | Description |
|---|---|---|
| `AlertBase` | function | Standalone Alert — a styled alert/notification box with optional icon, action button, and dismiss. No manifest context required. |
| `AlertBaseProps` | interface | No JSDoc description. |
| `AvatarBase` | function | Standalone Avatar — image, initials, or icon fallback. No manifest context required. |
| `AvatarBaseProps` | interface | No JSDoc description. |
| `AvatarGroup` | function | No JSDoc description. |
| `AvatarGroupBase` | function | Standalone AvatarGroup — overlapping avatars with +N overflow. No manifest context required. |
| `AvatarGroupBaseProps` | interface | No JSDoc description. |
| `AvatarGroupConfig` | typealias | Inferred config type from the AvatarGroup Zod schema. |
| `avatarGroupConfigSchema` | variable | Zod config schema for the AvatarGroup component.  Displays a row of overlapping avatars with an optional "+N" overflow count. Commonly used for showing team members, assignees, or participants. |
| `BadgeBase` | function | Standalone Badge — a small label with color-coded variants. No manifest context required. |
| `BadgeBaseProps` | interface | No JSDoc description. |
| `BulkAction` | typealias | Inferred bulk action type. |
| `bulkActionSchema` | variable | Schema for a bulk action on selected rows. |
| `Chart` | function | No JSDoc description. |
| `ChartBase` | function | Standalone Chart — renders data-driven charts via recharts. No manifest context required. |
| `ChartBaseProps` | interface | No JSDoc description. |
| `ChartBaseSeries` | interface | No JSDoc description. |
| `ChartConfig` | typealias | Inferred type for the Chart component configuration. |
| `chartSchema` | variable | Zod schema for the Chart component configuration.  Renders a data visualization (bar, line, area, pie, donut) from an endpoint or from-ref. Uses Recharts under the hood. Colors default to `--sn-chart-1` through `--sn-chart-5` tokens. |
| `ColumnConfig` | typealias | Inferred column configuration type. |
| `columnConfigSchema` | variable | Schema for individual column configuration. |
| `DataTable` | function | Config-driven DataTable component.  For simple tables (no drag-and-drop, virtual scroll, context menus, or expandable rows), delegates to the standalone DataTableBase. For advanced features, falls back to the full manifest-based rendering. |
| `DataTableBase` | function | Standalone DataTable — feature-rich data table with sorting, pagination, selection, and search. No manifest context required. |
| `DataTableBaseColumn` | interface | No JSDoc description. |
| `DataTableBaseProps` | interface | No JSDoc description. |
| `DataTableConfig` | typealias | Inferred DataTable configuration type from the Zod schema. |
| `dataTableConfigSchema` | variable | Zod schema for the DataTable component configuration.  Defines a config-driven data table with sorting, pagination, filtering, selection, search, row actions, and bulk actions. |
| `DetailCard` | function | No JSDoc description. |
| `DetailCardBase` | function | Standalone DetailCard — data-driven detail view with formatted fields and header actions. No manifest context required. |
| `DetailCardBaseAction` | interface | No JSDoc description. |
| `DetailCardBaseField` | interface | No JSDoc description. |
| `DetailCardBaseProps` | interface | No JSDoc description. |
| `DetailCardConfig` | typealias | DetailCard configuration type inferred from the schema. |
| `detailCardConfigSchema` | variable | Zod schema for DetailCard component configuration.  The detail card displays a single record's fields in a key-value layout. Used in drawers, modals, and detail pages. |
| `EmptyStateBase` | function | Standalone EmptyState — a centered message with optional icon and action. No manifest context required. |
| `EmptyStateBaseProps` | interface | No JSDoc description. |
| `EntityPicker` | function | No JSDoc description. |
| `EntityPickerBase` | function | Standalone EntityPicker — dropdown with search, single/multi select. No manifest context required. |
| `EntityPickerBaseProps` | interface | No JSDoc description. |
| `EntityPickerConfig` | typealias | Inferred config type from the EntityPicker Zod schema. |
| `entityPickerConfigSchema` | variable | Zod config schema for the EntityPicker component.  A searchable dropdown for selecting entities (users, documents, items) from an API endpoint. Supports single and multi-select. |
| `EntityPickerEntity` | interface | No JSDoc description. |
| `FavoriteButton` | function | No JSDoc description. |
| `FavoriteButtonBase` | function | Standalone FavoriteButton — a toggle button with a star icon. No manifest context required. |
| `FavoriteButtonBaseProps` | interface | No JSDoc description. |
| `FavoriteButtonConfig` | typealias | Inferred config type from the FavoriteButton Zod schema. |
| `favoriteButtonConfigSchema` | variable | Zod config schema for the FavoriteButton component. Defines all manifest-settable fields for a star toggle button used to mark items as favorites. |
| `Feed` | function | No JSDoc description. |
| `FeedBase` | function | Standalone Feed — feed/activity list with grouping, pagination, and live updates. No manifest context required. |
| `FeedBaseItem` | interface | No JSDoc description. |
| `FeedBaseItemAction` | interface | No JSDoc description. |
| `FeedBaseProps` | interface | No JSDoc description. |
| `FeedConfig` | typealias | Inferred type for the Feed component config (from Zod schema). |
| `FeedItem` | interface | A single resolved feed item for rendering. |
| `feedSchema` | variable | Zod schema for the Feed component configuration.  Renders a scrollable activity/event stream from an endpoint or from-ref. Supports avatar, title, description, timestamp, badge fields, pagination, and publishes the selected item to the page context when `id` is set. |
| `FilterBar` | function | No JSDoc description. |
| `FilterBarBase` | function | Standalone FilterBar — search + filter dropdowns + active pills. No manifest context required. |
| `FilterBarBaseProps` | interface | No JSDoc description. |
| `FilterBarConfig` | typealias | Inferred config type for the FilterBar component. |
| `filterBarConfigSchema` | variable | No JSDoc description. |
| `FilterBarFilter` | interface | No JSDoc description. |
| `HighlightedText` | function | No JSDoc description. |
| `HighlightedTextBase` | function | Standalone HighlightedText — renders text with search query highlighting. No manifest context required. |
| `HighlightedTextBaseProps` | interface | No JSDoc description. |
| `HighlightedTextConfig` | typealias | Inferred config type from the HighlightedText Zod schema. |
| `highlightedTextConfigSchema` | variable | Zod config schema for the HighlightedText component. Renders text with search query highlighting. Matching portions are wrapped in `<mark>` elements with a configurable highlight color. |
| `ListBase` | function | Standalone List — renders a vertical list of items with optional icons, descriptions, badges, and click actions. No manifest context required. |
| `ListBaseItem` | interface | No JSDoc description. |
| `ListBaseProps` | interface | No JSDoc description. |
| `NotificationBell` | function | No JSDoc description. |
| `NotificationBellBase` | function | Standalone NotificationBell — bell icon with unread count badge. No manifest context required. |
| `NotificationBellBaseProps` | interface | No JSDoc description. |
| `NotificationBellConfig` | typealias | Inferred config type from the NotificationBell Zod schema. |
| `notificationBellConfigSchema` | variable | Zod config schema for the NotificationBell component.  Defines all manifest-settable fields for a bell icon with an unread count badge. |
| `PaginationState` | interface | Pagination state for the data table. |
| `ProgressBase` | function | Standalone Progress — bar or circular progress indicator. No manifest context required. |
| `ProgressBaseProps` | interface | No JSDoc description. |
| `ResolvedColumn` | interface | Resolved column definition used internally by the hook and component. |
| `RowAction` | typealias | Inferred row action type. |
| `rowActionSchema` | variable | Schema for a per-row action button. |
| `SaveIndicator` | function | No JSDoc description. |
| `SaveIndicatorBase` | function | Standalone SaveIndicator — shows saving/saved/error status. No manifest context required. |
| `SaveIndicatorBaseProps` | interface | No JSDoc description. |
| `SaveIndicatorConfig` | typealias | Inferred config type from the SaveIndicator Zod schema. |
| `saveIndicatorConfigSchema` | variable | Zod config schema for the SaveIndicator component. Defines all manifest-settable fields for a save status indicator that shows idle, saving, saved, or error states. |
| `ScrollArea` | function | No JSDoc description. |
| `ScrollAreaBase` | function | Standalone ScrollArea — a scrollable container with custom-styled thin scrollbars. No manifest context required. |
| `ScrollAreaBaseProps` | interface | No JSDoc description. |
| `ScrollAreaConfig` | typealias | Inferred config type for the ScrollArea component. |
| `scrollAreaConfigSchema` | variable | Zod config schema for the ScrollArea component.  A scrollable container with custom-styled thin scrollbars that respect the design token system. |
| `Separator` | function | No JSDoc description. |
| `SeparatorBase` | function | Standalone Separator — a horizontal or vertical line with optional label. No manifest context required. |
| `SeparatorBaseProps` | interface | No JSDoc description. |
| `SeparatorConfig` | typealias | Inferred config type for the Separator component. |
| `separatorConfigSchema` | variable | Zod config schema for the Separator component. A simple visual divider line, either horizontal or vertical. Optionally renders a centered label between the lines. |
| `SeriesConfig` | typealias | Inferred type for a single chart series config. |
| `seriesConfigSchema` | variable | Schema for a single data series in the chart. |
| `SkeletonBase` | function | Standalone Skeleton — a placeholder loading indicator. No manifest context required. |
| `SkeletonBaseProps` | interface | No JSDoc description. |
| `SortState` | interface | Sort state for the data table. |
| `StatCard` | function | No JSDoc description. |
| `StatCardBase` | function | Standalone StatCard — displays a single metric with optional trend indicator. No manifest context required. |
| `StatCardBaseProps` | interface | No JSDoc description. |
| `StatCardConfig` | typealias | Inferred config type from the StatCard Zod schema. |
| `statCardConfigSchema` | variable | Zod config schema for the StatCard component.  Defines all manifest-settable fields for a stat card that displays a single metric with optional trend indicator. |
| `StatCardTrend` | interface | No JSDoc description. |
| `TooltipBase` | function | Standalone Tooltip — wraps child content and shows informational text on hover with configurable placement and delay. No manifest context required. |
| `TooltipBaseProps` | interface | No JSDoc description. |
| `trendConfigSchema` | variable | Schema for the trend indicator configuration. |
| `useDataTable` | function | Headless hook for managing data table state.  Provides sorting, pagination, filtering, selection, and search functionality without any rendering. Resolves `FromRef` values in the `data` and `params` fields via `useSubscribe`. |
| `UseDataTableResult` | interface | Return type of the `useDataTable` headless hook. Provides all state and handlers needed to render a data table. |
| `useDetailCard` | function | Hook that powers the DetailCard component. Resolves FromRefs, fetches data from endpoints, formats fields, and publishes the record data for other components to subscribe to. |
| `UseDetailCardResult` | interface | Return type of the useDetailCard hook. |
| `UseFeedResult` | interface | Return type of the useFeed headless hook. |
| `UseStatCardResult` | interface | Result returned by the StatCard headless hook or internal logic. Provides all the data needed to render a stat card. |
| `VoteBase` | function | Standalone Vote — upvote/downvote toggle with count display. No manifest context required. |
| `VoteBaseProps` | interface | No JSDoc description. |

### Details

#### `AlertBase({ id, title, description, variant, icon: iconProp, dismissible, actionLabel, onAction, className, style, slots, children, }: AlertBaseProps) => Element | null`

Standalone Alert — a styled alert/notification box with optional icon,
action button, and dismiss. No manifest context required.

**Example:**

```tsx
<AlertBase
  variant="warning"
  title="Rate limit reached"
  description="You have exceeded the API rate limit. Please wait before retrying."
  dismissible
  actionLabel="View usage"
  onAction={() => navigate("/usage")}
/>
```

---

#### `AvatarBase({ id, src, name, alt, size, shape, color, icon, status, className, style, slots, }: AvatarBaseProps) => Element`

Standalone Avatar — image, initials, or icon fallback.
No manifest context required.

**Example:**

```tsx
<AvatarBase
  src="/avatars/jane.jpg"
  name="Jane Doe"
  size="lg"
  shape="circle"
  status="online"
/>
```

---

#### `AvatarGroup({ config }: { config: { type: "avatar-group"; data?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercas...`

---

#### `AvatarGroupBase({ id, avatars, size, max, overlap: overlapProp, className, style, slots, }: AvatarGroupBaseProps) => Element`

Standalone AvatarGroup — overlapping avatars with +N overflow.
No manifest context required.

**Example:**

```tsx
<AvatarGroupBase
  avatars={[
    { name: "Alice", src: "/avatars/alice.jpg" },
    { name: "Bob" },
    { name: "Carol", src: "/avatars/carol.jpg" },
  ]}
  size="md"
  max={3}
/>
```

---

#### `avatarGroupConfigSchema` *(variable)*

Zod config schema for the AvatarGroup component.

Displays a row of overlapping avatars with an optional "+N" overflow
count. Commonly used for showing team members, assignees, or participants.

**Example:**

```json
{
  "type": "avatar-group",
  "avatars": [
    { "name": "Alice", "src": "/avatars/alice.jpg" },
    { "name": "Bob" },
    { "name": "Charlie", "src": "/avatars/charlie.jpg" },
    { "name": "Diana" },
    { "name": "Eve" }
  ],
  "max": 3,
  "size": "md"
}
```

---

#### `BadgeBase({ id, text, color, variant, size, rounded, icon, className, style, slots, }: BadgeBaseProps) => Element`

Standalone Badge — a small label with color-coded variants.
No manifest context required.

**Example:**

```tsx
<BadgeBase
  text="Active"
  color="success"
  variant="soft"
  size="sm"
  icon="check-circle"
/>
```

---

#### `Chart({ config }: { config: { data: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase" | "trim" | "json" | ...`

---

#### `ChartBase({ id, chartType, data: rows, xKey, series, height, aspectRatio, grid: showGrid, legend: showLegend, isLoading, error, emptyMessage, hideWhenEmpty, hasNewData, onRefresh, onPointClick, loadingContent,...`

Standalone Chart — renders data-driven charts via recharts.
No manifest context required.

**Example:**

```tsx
<ChartBase
  chartType="bar"
  data={[{ month: "Jan", revenue: 4000 }, { month: "Feb", revenue: 5200 }]}
  xKey="month"
  series={[{ key: "revenue", label: "Revenue", color: "#2563eb" }]}
  height={300}
  legend
/>
```

---

#### `DataTable({ config }: { config: Record<string, any>; }) => Element`

Config-driven DataTable component.

For simple tables (no drag-and-drop, virtual scroll, context menus,
or expandable rows), delegates to the standalone DataTableBase.
For advanced features, falls back to the full manifest-based rendering.

---

#### `DataTableBase({ id, columns, rows, sort, onSortChange, pagination, onPageChange, selectable, selection, onToggleRow, onToggleAll, rowIdField, searchable, searchPlaceholder, search, onSearchChange, rowActions, bulk...`

Standalone DataTable — feature-rich data table with sorting, pagination,
selection, and search. No manifest context required.

**Example:**

```tsx
<DataTableBase
  columns={[
    { field: "name", label: "Name", sortable: true },
    { field: "status", label: "Status", format: "badge", badgeColors: { active: "green", inactive: "gray" } },
    { field: "revenue", label: "Revenue", format: "currency", divisor: 100 },
  ]}
  rows={[{ id: 1, name: "Acme", status: "active", revenue: 150000 }]}
  searchable
  selectable
/>
```

---

#### `dataTableConfigSchema` *(variable)*

Zod schema for the DataTable component configuration.

Defines a config-driven data table with sorting, pagination, filtering,
selection, search, row actions, and bulk actions.

**Example:**

```json
{
  "type": "data-table",
  "id": "users-table",
  "data": "GET /api/users",
  "columns": [
    { "field": "name", "sortable": true },
    { "field": "email" },
    { "field": "status", "format": "badge", "badgeColors": { "active": "success", "inactive": "muted" } }
  ],
  "pagination": { "type": "offset", "pageSize": 20 },
  "selectable": true,
  "searchable": true
}
```

---

#### `DetailCard({ config }: { config: Record<string, any>; }) => Element`

---

#### `DetailCardBase({ id, data, fields, title, actions, isLoading, error, emptyMessage, loadingContent, className, style, slots, }: DetailCardBaseProps) => Element`

Standalone DetailCard — data-driven detail view with formatted fields
and header actions. No manifest context required.

**Example:**

```tsx
<DetailCardBase
  title="Order Details"
  data={{ id: "ORD-123", status: "shipped", total: 4999 }}
  fields={[
    { field: "id", label: "Order ID", value: "ORD-123", copyable: true },
    { field: "status", label: "Status", value: "shipped", format: "badge" },
    { field: "total", label: "Total", value: 4999, format: "currency", divisor: 100 },
  ]}
  actions={[{ label: "Edit", icon: "pencil", onAction: () => {} }]}
/>
```

---

#### `detailCardConfigSchema` *(variable)*

Zod schema for DetailCard component configuration.

The detail card displays a single record's fields in a key-value layout.
Used in drawers, modals, and detail pages.

**Example:**

```json
{
  "type": "detail-card",
  "id": "user-detail",
  "data": { "from": "users-table.selected" },
  "title": "User Details",
  "fields": [
    { "field": "name", "label": "Full Name" },
    { "field": "email", "format": "email", "copyable": true },
    { "field": "role", "format": "badge" },
    { "field": "createdAt", "format": "date" }
  ],
  "actions": [
    { "label": "Edit", "action": { "type": "open-modal", "modal": "edit-user" } }
  ]
}
```

---

#### `EmptyStateBase({ id, title, description, icon, iconColor, size, actionLabel, onAction, className, style, slots, }: EmptyStateBaseProps) => Element`

Standalone EmptyState — a centered message with optional icon and action.
No manifest context required.

**Example:**

```tsx
<EmptyStateBase
  title="No projects yet"
  description="Create your first project to get started."
  icon="folder-plus"
  actionLabel="Create project"
  onAction={() => openCreateDialog()}
/>
```

---

#### `EntityPicker({ config }: { config: Record<string, any>; }) => Element | null`

---

#### `EntityPickerBase({ id, entities, value, label: triggerBaseLabel, multiple: isMultiple, searchable, maxHeight, isLoading, error, onChange, className, style, slots, }: EntityPickerBaseProps) => Element`

Standalone EntityPicker — dropdown with search, single/multi select.
No manifest context required.

**Example:**

```tsx
<EntityPickerBase
  label="Assign to"
  entities={[
    { label: "Alice", value: "alice", avatar: "/avatars/alice.jpg" },
    { label: "Bob", value: "bob", icon: "user" },
  ]}
  multiple
  searchable
  onChange={(selected) => setAssignees(selected)}
/>
```

---

#### `entityPickerConfigSchema` *(variable)*

Zod config schema for the EntityPicker component.

A searchable dropdown for selecting entities (users, documents, items)
from an API endpoint. Supports single and multi-select.

**Example:**

```json
{
  "type": "entity-picker",
  "id": "user-picker",
  "label": "Assign to...",
  "data": "GET /api/users",
  "labelField": "name",
  "valueField": "id",
  "descriptionField": "email",
  "avatarField": "avatar_url",
  "multiple": true
}
```

---

#### `FavoriteButton({ config }: { config: { type: "favorite-button"; color?: string | undefined; position?: "fixed" | "relative" | "absolute" | "sticky" | undefined; background?: string | { image?: string | undefined; ....`

---

#### `FavoriteButtonBase({ id, active: activeProp, size: sizeProp, onToggle, className, style, slots, }: FavoriteButtonBaseProps) => Element`

Standalone FavoriteButton — a toggle button with a star icon.
No manifest context required.

**Example:**

```tsx
<FavoriteButtonBase
  active={isFavorited}
  size="md"
  onToggle={(active) => setFavorited(active)}
/>
```

---

#### `favoriteButtonConfigSchema` *(variable)*

Zod config schema for the FavoriteButton component.

Defines all manifest-settable fields for a star toggle button
used to mark items as favorites.

**Example:**

```json
{
  "type": "favorite-button",
  "active": false,
  "size": "md",
  "toggleAction": { "type": "api", "method": "POST", "endpoint": "/api/favorites" }
}
```

---

#### `Feed({ config }: { config: Record<string, any>; }) => Element`

---

#### `FeedBase({ id, items, relativeTime, groupBy, pageSize, infinite, itemActions, isLoading, error, emptyMessage, hasNewData, onRefresh, onSelectItem, loadingContent, className, style, slots, }: FeedBaseProps) =>...`

Standalone Feed — feed/activity list with grouping, pagination, and
live updates. No manifest context required.

**Example:**

```tsx
<FeedBase
  items={[
    { key: 1, title: "New comment", description: "Alice replied to your post", timestamp: "2026-04-23T10:00:00Z", raw: {} },
    { key: 2, title: "Issue closed", badgeValue: "Done", badgeColor: "success", raw: {} },
  ]}
  relativeTime
  groupBy="day"
  onSelectItem={(item) => openDetail(item)}
/>
```

---

#### `feedSchema` *(variable)*

Zod schema for the Feed component configuration.

Renders a scrollable activity/event stream from an endpoint or from-ref.
Supports avatar, title, description, timestamp, badge fields, pagination,
and publishes the selected item to the page context when `id` is set.

**Example:**

```json
{
  "type": "feed",
  "id": "activity-feed",
  "data": "GET /api/activity",
  "itemKey": "id",
  "title": "message",
  "description": "detail",
  "timestamp": "createdAt",
  "avatar": "avatarUrl",
  "badge": { "field": "type", "colorMap": { "error": "destructive", "info": "info" } },
  "pageSize": 10
}
```

---

#### `FilterBar({ config }: { config: { type: "filter-bar"; color?: string | undefined; position?: "fixed" | "relative" | "absolute" | "sticky" | undefined; background?: string | { image?: string | undefined; ... 4 ...`

---

#### `FilterBarBase({ id, filters, showSearch, searchPlaceholder, onChange, className, style, slots, }: FilterBarBaseProps) => Element`

Standalone FilterBar — search + filter dropdowns + active pills.
No manifest context required.

**Example:**

```tsx
<FilterBarBase
  filters={[
    { key: "status", label: "Status", options: [{ label: "Active", value: "active" }, { label: "Archived", value: "archived" }] },
    { key: "role", label: "Role", multiple: true, options: [{ label: "Admin", value: "admin" }, { label: "User", value: "user" }] },
  ]}
  showSearch
  onChange={({ search, filters }) => applyFilters(search, filters)}
/>
```

---

#### `HighlightedText({ config }: { config: { type: "highlighted-text"; text: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lower...`

---

#### `HighlightedTextBase({ id, text, highlight, caseSensitive, highlightColor, className, style, slots, }: HighlightedTextBaseProps) => Element`

Standalone HighlightedText — renders text with search query highlighting.
No manifest context required.

**Example:**

```tsx
<HighlightedTextBase
  text="The quick brown fox jumps over the lazy dog"
  highlight="fox"
  highlightColor="var(--sn-color-warning)"
/>
```

---

#### `highlightedTextConfigSchema` *(variable)*

Zod config schema for the HighlightedText component.

Renders text with search query highlighting. Matching portions are
wrapped in `<mark>` elements with a configurable highlight color.

**Example:**

```json
{
  "type": "highlighted-text",
  "text": "The quick brown fox jumps over the lazy dog",
  "highlight": "fox"
}
```

---

#### `ListBase({ id, items, variant, selectable, divider: showDividerProp, limit, isLoading, error, emptyMessage, hasNewData, onRefresh, loadingContent, errorContent, emptyContent, className, style, slots, }: ListB...`

Standalone List — renders a vertical list of items with optional icons,
descriptions, badges, and click actions. No manifest context required.

**Example:**

```tsx
<ListBase
  variant="bordered"
  selectable
  items={[
    { id: "1", title: "Dashboard", icon: "layout-dashboard", onAction: () => navigate("/dashboard") },
    { id: "2", title: "Settings", icon: "settings", badge: "New", badgeColor: "primary" },
  ]}
/>
```

---

#### `NotificationBell({ config, }: { config: { type: "notification-bell"; ariaLive: "off" | "polite" | "assertive"; count?: number | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys"...`

---

#### `NotificationBellBase({ id, count, size, max, onClick, ariaLive, className, style, slots, }: NotificationBellBaseProps) => Element`

Standalone NotificationBell — bell icon with unread count badge.
No manifest context required.

**Example:**

```tsx
<NotificationBellBase
  count={5}
  size="md"
  max={99}
  onClick={() => openNotifications()}
/>
```

---

#### `notificationBellConfigSchema` *(variable)*

Zod config schema for the NotificationBell component.

Defines all manifest-settable fields for a bell icon with
an unread count badge.

**Example:**

```json
{
  "type": "notification-bell",
  "count": 5,
  "max": 99,
  "clickAction": { "type": "navigate", "to": "/notifications" }
}
```

---

#### `ProgressBase({ id, value: resolvedValue, max, label, size, variant, showValue, color, segments, className, style, slots, }: ProgressBaseProps) => Element`

Standalone Progress — bar or circular progress indicator.
No manifest context required.

**Example:**

```tsx
<ProgressBase
  value={65}
  max={100}
  label="Upload progress"
  showValue
  color="primary"
  variant="bar"
/>
```

---

#### `SaveIndicator({ config }: { config: { status: "error" | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase" | "trim" | ... 6 ...`

---

#### `SaveIndicatorBase({ id, status, showIcon, savingText, savedText, errorText, className, style, slots, }: SaveIndicatorBaseProps) => Element | null`

Standalone SaveIndicator — shows saving/saved/error status.
No manifest context required.

**Example:**

```tsx
<SaveIndicatorBase
  status="saving"
  showIcon
  savingText="Saving changes..."
  savedText="All changes saved"
/>
```

---

#### `saveIndicatorConfigSchema` *(variable)*

Zod config schema for the SaveIndicator component.

Defines all manifest-settable fields for a save status indicator
that shows idle, saving, saved, or error states.

**Example:**

```json
{
  "type": "save-indicator",
  "status": { "from": "my-form.saveStatus" },
  "savedText": "All changes saved",
  "showIcon": true
}
```

---

#### `ScrollArea({ config }: { config: { type: "scroll-area"; content?: Record<string, unknown>[] | undefined; color?: string | undefined; position?: "fixed" | "relative" | "absolute" | "sticky" | undefined; ... 56 m...`

---

#### `ScrollAreaBase({ id, orientation, maxHeight, maxWidth, showScrollbar, children, className, style, slots, }: ScrollAreaBaseProps) => Element`

Standalone ScrollArea — a scrollable container with custom-styled thin
scrollbars. No manifest context required.

**Example:**

```tsx
<ScrollAreaBase maxHeight="300px" showScrollbar="hover">
  <ul>
    {items.map((item) => (
      <li key={item.id}>{item.name}</li>
    ))}
  </ul>
</ScrollAreaBase>
```

---

#### `scrollAreaConfigSchema` *(variable)*

Zod config schema for the ScrollArea component.

A scrollable container with custom-styled thin scrollbars
that respect the design token system.

**Example:**

```json
{
  "type": "scroll-area",
  "maxHeight": "300px",
  "orientation": "vertical",
  "showScrollbar": "hover",
  "content": [
    { "type": "heading", "text": "Long list..." }
  ]
}
```

---

#### `Separator({ config }: { config: { type: "separator"; label?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase"...`

---

#### `SeparatorBase({ id, orientation, label, className, style, slots, }: SeparatorBaseProps) => Element`

Standalone Separator — a horizontal or vertical line with optional label.
No manifest context required.

**Example:**

```tsx
<SeparatorBase
  orientation="horizontal"
  label="OR"
/>
```

---

#### `separatorConfigSchema` *(variable)*

Zod config schema for the Separator component.

A simple visual divider line, either horizontal or vertical.
Optionally renders a centered label between the lines.

**Example:**

```json
{
  "type": "separator",
  "orientation": "horizontal",
  "label": "Or continue with"
}
```

---

#### `SkeletonBase({ id, variant, animated, lines, width, height, className, style, slots, }: SkeletonBaseProps) => Element`

Standalone Skeleton — a placeholder loading indicator.
No manifest context required.

**Example:**

```tsx
<SkeletonBase
  variant="card"
  animated
  width="100%"
  height="200px"
/>
```

---

#### `StatCard({ config }: { config: { data: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase" | "trim" | "json" | ...`

---

#### `StatCardBase({ id, value, label, isLoading, error, icon, iconColor, loadingVariant, trend, onClick, emptyMessage, className, style, slots, }: StatCardBaseProps) => Element`

Standalone StatCard — displays a single metric with optional trend indicator.
No manifest context required.

**Example:**

```tsx
<StatCardBase
  label="Monthly Revenue"
  value="$12,450"
  icon="dollar-sign"
  trend={{ direction: "up", value: "+8.2%", percentage: 8.2, sentiment: "positive" }}
  onClick={() => navigate("/revenue")}
/>
```

---

#### `statCardConfigSchema` *(variable)*

Zod config schema for the StatCard component.

Defines all manifest-settable fields for a stat card that displays
a single metric with optional trend indicator.

**Example:**

```json
{
  "type": "stat-card",
  "data": "GET /api/stats/revenue",
  "field": "total",
  "label": "Revenue",
  "format": "currency",
  "trend": { "field": "previousTotal", "sentiment": "up-is-good" }
}
```

---

#### `TooltipBase({ id, text, placement, delay, children, className, style, slots, }: TooltipBaseProps) => Element`

Standalone Tooltip — wraps child content and shows informational text
on hover with configurable placement and delay. No manifest context required.

**Example:**

```tsx
<TooltipBase text="Copy to clipboard" placement="top" delay={200}>
  <button onClick={handleCopy}>Copy</button>
</TooltipBase>
```

---

#### `useDataTable(config: Record<string, any>) => UseDataTableResult`

Headless hook for managing data table state.

Provides sorting, pagination, filtering, selection, and search
functionality without any rendering. Resolves `FromRef` values
in the `data` and `params` fields via `useSubscribe`.

**Parameters:**

| Name | Description |
|------|-------------|
| `config` | DataTable configuration (from Zod schema) |

**Returns:** All state and handlers needed to render a data table

**Example:**

```tsx
const table = useDataTable({
  type: 'data-table',
  data: 'GET /api/users',
  columns: 'auto',
  pagination: { type: 'offset', pageSize: 10 },
  selectable: true,
  searchable: true,
})

// table.rows — current page rows
// table.sort — current sort state
// table.setSortColumn('name') — toggle sort
// table.selectedRows — selected row objects
```

---

#### `useDetailCard(config: Record<string, any>) => UseDetailCardResult`

Hook that powers the DetailCard component.
Resolves FromRefs, fetches data from endpoints, formats fields,
and publishes the record data for other components to subscribe to.

**Parameters:**

| Name | Description |
|------|-------------|
| `config` | The DetailCard configuration |

**Returns:** Data, fields, title, loading/error state, and refetch function

**Example:**

```tsx
const { data, fields, title, isLoading, error, refetch } = useDetailCard({
  type: 'detail-card',
  data: { from: 'users-table.selected' },
  fields: 'auto',
})
```

---

#### `VoteBase({ id, value, onUpvote, onDownvote, className, style, slots, }: VoteBaseProps) => Element`

Standalone Vote — upvote/downvote toggle with count display.
No manifest context required.

**Example:**

```tsx
<VoteBase
  value={42}
  onUpvote={() => api.upvote(postId)}
  onDownvote={() => api.downvote(postId)}
/>
```

---

## Components — Forms

| Export | Kind | Description |
|---|---|---|
| `AutoForm` | function | Config-driven form component with multi-column layout, conditional field visibility, and section grouping.  Supports client-side validation, submission to an API endpoint, manifest-aware resource mutation (invalidation + optimistic handling), workflow lifecycle hooks (`beforeSubmit`, `afterSubmit`, `error`), and action chaining on success/error. Publishes form state to the page context when an `id` is configured. |
| `AutoFormBase` | function | Standalone AutoFormBase -- renders a config-driven form with fields, sections, validation, and submit/reset actions. No manifest context required. |
| `AutoFormBaseProps` | interface | No JSDoc description. |
| `AutoFormConfig` | typealias | Inferred type for the AutoForm component config. |
| `autoFormConfigSchema` | variable | Zod schema for the AutoForm component config.  Defines a config-driven form that auto-generates fields from config or OpenAPI schema. Supports validation, submission, action chaining, multi-column layout, conditional field visibility, and field grouping. |
| `AutoFormFieldConfig` | interface | No JSDoc description. |
| `AutoFormSectionConfig` | interface | No JSDoc description. |
| `Button` | function | No JSDoc description. |
| `ButtonBase` | function | Standalone ButtonBase -- a styled button that works with plain React props. No manifest context required. |
| `ButtonBaseProps` | interface | No JSDoc description. |
| `buttonConfigSchema` | variable | No JSDoc description. |
| `ColorPicker` | function | No JSDoc description. |
| `ColorPickerConfig` | typealias | Config for the manifest-driven color picker component. |
| `colorPickerConfigSchema` | variable | Schema for color picker components with optional swatches, alpha, and change actions. |
| `ColorPickerField` | function | Standalone ColorPickerField -- a color picker with optional swatches, alpha slider, and custom hex input. No manifest context required. |
| `ColorPickerFieldProps` | interface | No JSDoc description. |
| `DatePicker` | function | No JSDoc description. |
| `DatePickerConfig` | typealias | Config for the manifest-driven date picker component. |
| `datePickerConfigSchema` | variable | Schema for date picker components covering single, range, and multi-date selection. |
| `DatePickerField` | function | Standalone DatePickerField -- date picker supporting single, range, and multiple selection modes with presets and disabled dates. No manifest context required. |
| `DatePickerFieldProps` | interface | No JSDoc description. |
| `FieldConfig` | typealias | Inferred type for a single field configuration. |
| `fieldConfigSchema` | variable | Schema for an individual field configuration. |
| `FieldErrors` | typealias | Per-field validation error. |
| `IconButtonBase` | function | Standalone IconButtonBase -- an icon-only button with configurable shape, size, and variant. No manifest context required. |
| `IconButtonBaseProps` | interface | No JSDoc description. |
| `InlineEdit` | function | InlineEdit component — click-to-edit text field.  Toggles between a display mode and an edit mode. Enter or blur saves the value; Escape reverts to the original value when `cancelOnEscape` is enabled. |
| `InlineEditConfig` | typealias | Inferred config type for the InlineEdit component. |
| `inlineEditConfigSchema` | variable | Zod config schema for the InlineEdit component.  A click-to-edit text field that toggles between display and edit modes. Publishes `{ value, editing }` to the page context. |
| `InlineEditField` | function | Standalone InlineEditField -- a click-to-edit text field that toggles between display and input modes. No manifest context required. |
| `InlineEditFieldProps` | interface | No JSDoc description. |
| `Input` | function | Manifest adapter — resolves config refs and actions, delegates to InputField. |
| `InputConfig` | typealias | Inferred config type from the Input Zod schema. |
| `inputConfigSchema` | variable | Zod config schema for the Input component.  Defines a standalone text input field with label, placeholder, validation, and optional icon. |
| `InputField` | function | Standalone InputField — a complete form field (label + input + helper/error) that works with plain React props. No manifest context required. |
| `InputFieldProps` | interface | No JSDoc description. |
| `LocationInput` | function | No JSDoc description. |
| `LocationInputConfig` | typealias | Config for the manifest-driven location input component. |
| `locationInputConfigSchema` | variable | Zod config schema for the LocationInput component.  Geocode autocomplete input that searches a backend endpoint, displays matching locations in a dropdown, and extracts coordinates on selection. Publishes `{ name, lat, lng, address }`. |
| `LocationInputField` | function | Standalone LocationInputField -- a location search input with results dropdown and optional Google Maps link. No manifest context required. |
| `LocationInputFieldProps` | interface | No JSDoc description. |
| `LocationResult` | interface | No JSDoc description. |
| `MultiSelect` | function | No JSDoc description. |
| `MultiSelectConfig` | typealias | Inferred config type from the MultiSelect Zod schema. |
| `multiSelectConfigSchema` | variable | Zod config schema for the MultiSelect component.  Defines a dropdown with checkboxes for selecting multiple values, with optional search filtering and pill display. |
| `MultiSelectField` | function | Standalone MultiSelectField -- multi-select dropdown with pill tags, inline search, and configurable max selection. No manifest context required. |
| `MultiSelectFieldOption` | interface | No JSDoc description. |
| `MultiSelectFieldProps` | interface | No JSDoc description. |
| `QuickAdd` | function | No JSDoc description. |
| `QuickAddConfig` | typealias | Inferred config type from the QuickAdd Zod schema. |
| `quickAddConfigSchema` | variable | Zod config schema for the QuickAdd component.  Defines all manifest-settable fields for an inline creation bar that allows quick item entry with a text input and submit button. |
| `QuickAddField` | function | Standalone QuickAddField -- a compact input with submit button for quickly adding items to a list. No manifest context required. |
| `QuickAddFieldProps` | interface | No JSDoc description. |
| `Select` | function | No JSDoc description. |
| `selectConfigSchema` | variable | No JSDoc description. |
| `SelectField` | function | Standalone SelectField -- a complete select form field with label, options, helper/error text, and required indicator. No manifest context required. |
| `SelectFieldProps` | interface | No JSDoc description. |
| `Slider` | function | Render a manifest-driven slider input. |
| `SliderConfig` | typealias | Config for the manifest-driven slider component. |
| `sliderConfigSchema` | variable | Schema for single-value and ranged slider controls with optional value display/actions. |
| `SliderField` | function | Standalone SliderField -- a range slider with optional label, value display, limit labels, and dual-thumb range mode. No manifest context required. |
| `SliderFieldProps` | interface | No JSDoc description. |
| `SwitchField` | function | Standalone SwitchField -- a toggle switch with label, description, and configurable size and color. No manifest context required. |
| `SwitchFieldProps` | interface | No JSDoc description. |
| `TagSelector` | function | No JSDoc description. |
| `TagSelectorConfig` | typealias | Inferred config type from the TagSelector Zod schema. |
| `tagSelectorConfigSchema` | variable | Zod config schema for the TagSelector component.  A tag input that allows selecting from predefined tags or creating new ones. Tags display as colored pills with remove buttons. |
| `TagSelectorField` | function | Standalone TagSelectorField -- tag pills with dropdown selection, search filtering, and optional tag creation. No manifest context required. |
| `TagSelectorFieldProps` | interface | No JSDoc description. |
| `TagSelectorTag` | interface | No JSDoc description. |
| `Textarea` | function | No JSDoc description. |
| `TextareaConfig` | typealias | Inferred config type from the Textarea Zod schema. |
| `textareaConfigSchema` | variable | Zod config schema for the Textarea component.  Defines a multi-line text input with label, character count, validation, and configurable resize behavior. |
| `TextareaField` | function | Standalone TextareaField -- a complete textarea form field with label, character counter, validation, and helper/error text. No manifest context required. |
| `TextareaFieldProps` | interface | No JSDoc description. |
| `Toggle` | function | No JSDoc description. |
| `ToggleConfig` | typealias | Inferred config type from the Toggle Zod schema. |
| `toggleConfigSchema` | variable | Zod config schema for the Toggle component.  Defines a pressed/unpressed toggle button that publishes its state. Can display text, an icon, or both. |
| `ToggleField` | function | Standalone ToggleField -- a pressable toggle button with optional icon and label. No manifest context required. |
| `ToggleFieldProps` | interface | No JSDoc description. |
| `ToggleGroupBase` | function | Standalone ToggleGroupBase -- a group of toggle buttons supporting single or multi-select modes. No manifest context required. |
| `ToggleGroupBaseProps` | interface | No JSDoc description. |
| `ToggleGroupItem` | interface | No JSDoc description. |
| `TouchedFields` | typealias | Tracks which fields have been interacted with. |
| `useAutoForm` | function | Headless hook for form state management.  Tracks field values, validation errors, and touched state. Validates on blur (per-field) and on submit (all fields). |
| `UseAutoFormResult` | interface | Return type for the useAutoForm headless hook. |
| `useWizard` | function | Headless hook that manages multi-step wizard state including step navigation, per-step validation, field tracking, and final submission.  Provides reactive state for the current step, accumulated data across steps, validation errors, and transition controls (next/prev/skip/reset). |
| `UseWizardResult` | interface | Return type of the useWizard headless hook. |
| `Wizard` | function | Render a multi-step form wizard with built-in validation, step state, and slot-aware styling. |
| `WizardBase` | function | Standalone WizardBase -- a multi-step form wizard with progress indicator, step navigation, field validation, and completion state. No manifest context required. |
| `WizardBaseProps` | interface | No JSDoc description. |
| `WizardConfig` | typealias | Inferred type for the Wizard component configuration. |
| `WizardFieldConfig` | interface | No JSDoc description. |
| `wizardSchema` | variable | Zod schema for the Wizard component configuration.  A multi-step form flow. Each step collects fields independently. On the final step, all accumulated data is submitted to `submitEndpoint` (if set) and published to the page context via `id`. |
| `WizardState` | interface | No JSDoc description. |
| `WizardStepConfig` | typealias | Inferred type for a single wizard step configuration. |
| `WizardStepDef` | interface | No JSDoc description. |
| `wizardStepSchema` | variable | Schema for a single wizard step. |

### Details

#### `AutoForm({ config }: { config: Record<string, any>; }) => Element | null`

Config-driven form component with multi-column layout, conditional
field visibility, and section grouping.

Supports client-side validation, submission to an API endpoint,
manifest-aware resource mutation (invalidation + optimistic handling),
workflow lifecycle hooks (`beforeSubmit`, `afterSubmit`, `error`),
and action chaining on success/error. Publishes form state to the
page context when an `id` is configured.

**Parameters:**

| Name | Description |
|------|-------------|
| `props` | Component props containing the form config |

---

#### `AutoFormBase({ id, fields, sections, values, errors, touched, isSubmitting, isDirty, isValid, submitLabel: submitLabelProp, submitLoadingLabel: submitLoadingLabelProp, resetLabel: resetLabelProp, showReset, layou...`

Standalone AutoFormBase -- renders a config-driven form with fields, sections,
validation, and submit/reset actions. No manifest context required.

**Example:**

```tsx
<AutoFormBase
  fields={[
    { name: "email", type: "email", label: "Email", required: true },
    { name: "password", type: "password", label: "Password", required: true },
  ]}
  values={values}
  errors={errors}
  touched={touched}
  onFieldChange={handleChange}
  onFieldBlur={handleBlur}
  onSubmit={handleSubmit}
/>
```

---

#### `autoFormConfigSchema` *(variable)*

Zod schema for the AutoForm component config.

Defines a config-driven form that auto-generates fields from config
or OpenAPI schema. Supports validation, submission, action chaining,
multi-column layout, conditional field visibility, and field grouping.

**Example:**

```json
{
  "type": "form",
  "submit": "/api/users",
  "method": "POST",
  "columns": 2,
  "fields": [
    { "name": "firstName", "type": "text", "required": true, "span": 1 },
    { "name": "lastName", "type": "text", "required": true, "span": 1 },
    { "name": "email", "type": "email", "required": true },
    { "name": "role", "type": "select", "options": [
      { "label": "Admin", "value": "admin" },
      { "label": "User", "value": "user" }
    ]},
    { "name": "notes", "type": "textarea", "dependsOn": { "field": "role", "value": "admin" } }
  ],
  "submitLabel": "Create User",
  "onSuccess": { "type": "toast", "message": "User created!", "variant": "success" }
}
```

---

#### `Button({ config }: { config: { action: ActionConfig | ActionConfig[]; type: "button"; label: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | ... 13 more ... | undefined; tr...`

---

#### `ButtonBase({ id, label, icon, variant, size, disabled, fullWidth, onClick, type, ariaLabel, children, className, style, slots, }: ButtonBaseProps) => Element`

Standalone ButtonBase -- a styled button that works with plain React props.
No manifest context required.

**Example:**

```tsx
<ButtonBase
  label="Save"
  icon="check"
  variant="default"
  onClick={() => save()}
/>
```

---

#### `ColorPicker({ config }: { config: { type: "color-picker"; label?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowerca...`

---

#### `ColorPickerField({ id, label, defaultValue, format, showAlpha, allowCustom, swatches, onChange, className, style, slots, }: ColorPickerFieldProps) => Element`

Standalone ColorPickerField -- a color picker with optional swatches, alpha slider,
and custom hex input. No manifest context required.

**Example:**

```tsx
<ColorPickerField
  label="Brand Color"
  defaultValue="#2563eb"
  format="hex"
  swatches={["#ef4444", "#22c55e", "#3b82f6"]}
  onChange={(color) => setBrand(color)}
/>
```

---

#### `DatePicker({ config }: { config: { type: "date-picker"; label?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercas...`

---

#### `DatePickerField({ id, label, placeholder, mode, format, valueFormat, min, max, presets, disabledDates, onChange, className, style, slots, }: DatePickerFieldProps) => Element`

Standalone DatePickerField -- date picker supporting single, range, and multiple
selection modes with presets and disabled dates. No manifest context required.

**Example:**

```tsx
<DatePickerField
  label="Event Date"
  mode="range"
  valueFormat="iso"
  min="2024-01-01"
  onChange={(range) => setDateRange(range)}
/>
```

---

#### `IconButtonBase({ id, icon, ariaLabel, variant, size: sizeProp, shape, tooltip, disabled, onClick, className, style, slots, }: IconButtonBaseProps) => Element`

Standalone IconButtonBase -- an icon-only button with configurable shape,
size, and variant. No manifest context required.

**Example:**

```tsx
<IconButtonBase
  icon="trash"
  ariaLabel="Delete item"
  variant="destructive"
  size="sm"
  onClick={handleDelete}
/>
```

---

#### `InlineEdit({ config }: { config: { type: "inline-edit"; value?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercas...`

InlineEdit component — click-to-edit text field.

Toggles between a display mode and an edit mode. Enter or blur saves the
value; Escape reverts to the original value when `cancelOnEscape` is enabled.

---

#### `inlineEditConfigSchema` *(variable)*

Zod config schema for the InlineEdit component.

A click-to-edit text field that toggles between display and edit modes.
Publishes `{ value, editing }` to the page context.

**Example:**

```json
{
  "type": "inline-edit",
  "id": "title-edit",
  "value": "My Title",
  "placeholder": "Enter title",
  "saveAction": { "type": "api", "method": "PUT", "endpoint": "/api/title", "body": { "from": "title-edit" } }
}
```

---

#### `InlineEditField({ id, value: valueProp, placeholder: placeholderProp, inputType, cancelOnEscape: cancelOnEscapeProp, fontSize: fontSizeProp, onSave, className, style, slots, }: InlineEditFieldProps) => Element`

Standalone InlineEditField -- a click-to-edit text field that toggles between
display and input modes. No manifest context required.

**Example:**

```tsx
<InlineEditField
  value={title}
  placeholder="Click to edit"
  onSave={(newTitle) => updateTitle(newTitle)}
/>
```

---

#### `Input({ config }: { config: { type: "input"; value?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase" | ....`

Manifest adapter — resolves config refs and actions, delegates to InputField.

---

#### `inputConfigSchema` *(variable)*

Zod config schema for the Input component.

Defines a standalone text input field with label, placeholder,
validation, and optional icon.

**Example:**

```json
{
  "type": "input",
  "id": "email-field",
  "label": "Email",
  "inputType": "email",
  "placeholder": "you@example.com",
  "required": true,
  "helperText": "We'll never share your email"
}
```

---

#### `InputField({ id, label, placeholder, value: controlledValue, type, required, disabled, readOnly, maxLength, pattern, helperText, errorText, icon, onChange, onBlur, onFocus, onClick, onKeyDown, className, style,...`

Standalone InputField — a complete form field (label + input + helper/error)
that works with plain React props. No manifest context required.

**Example:**

```tsx
<InputField
  id="email"
  label="Email"
  type="email"
  placeholder="you@example.com"
  required
  helperText="We'll never share your email"
  onChange={(val) => setEmail(val)}
/>
```

---

#### `LocationInput({ config }: { config: { type: "location-input"; searchEndpoint: string | { resource: string; params?: Record<string, unknown> | undefined; }; value?: string | { from: string; transform?: "string" | ....`

---

#### `locationInputConfigSchema` *(variable)*

Zod config schema for the LocationInput component.

Geocode autocomplete input that searches a backend endpoint,
displays matching locations in a dropdown, and extracts
coordinates on selection. Publishes `{ name, lat, lng, address }`.

**Example:**

```json
{
  "type": "location-input",
  "id": "venue-location",
  "label": "Venue",
  "placeholder": "Search for a location...",
  "searchEndpoint": "GET /api/geocode",
  "changeAction": {
    "type": "set-value",
    "target": "map",
    "value": { "from": "venue-location" }
  }
}
```

Expected API response format:
```json
[
  {
    "name": "Central Park",
    "address": "New York, NY, USA",
    "lat": 40.7829,
    "lng": -73.9654
  }
]
```

---

#### `LocationInputField({ id, label, placeholder: placeholderProp, helperText, errorText: errorTextProp, required, disabled, value: valueProp, showMapLink, results: resultsProp, loading, onSearch, onSelect, className, style...`

Standalone LocationInputField -- a location search input with results dropdown
and optional Google Maps link. No manifest context required.

**Example:**

```tsx
<LocationInputField
  label="Venue"
  placeholder="Search for a location..."
  results={searchResults}
  onSearch={(query) => fetchLocations(query)}
  onSelect={(location) => setVenue(location)}
/>
```

---

#### `MultiSelect({ config }: { config: Record<string, any>; }) => Element | null`

---

#### `multiSelectConfigSchema` *(variable)*

Zod config schema for the MultiSelect component.

Defines a dropdown with checkboxes for selecting multiple values,
with optional search filtering and pill display.

**Example:**

```json
{
  "type": "multi-select",
  "id": "tags",
  "label": "Tags",
  "placeholder": "Select tags...",
  "options": [
    { "label": "Bug", "value": "bug", "icon": "bug" },
    { "label": "Feature", "value": "feature", "icon": "star" },
    { "label": "Docs", "value": "docs", "icon": "file-text" }
  ],
  "maxSelected": 5,
  "searchable": true
}
```

---

#### `MultiSelectField({ id, label, placeholder: placeholderProp, options: optionsProp, value: controlledValue, defaultValue, disabled, searchable, maxSelected, loading, error: errorProp, onRetry, onChange, className, styl...`

Standalone MultiSelectField -- multi-select dropdown with pill tags, inline search,
and configurable max selection. No manifest context required.

**Example:**

```tsx
<MultiSelectField
  label="Tags"
  options={[
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
  ]}
  searchable
  onChange={(selected) => setTags(selected)}
/>
```

---

#### `QuickAdd({ config }: { config: { type: "quick-add"; icon?: string | undefined; color?: string | undefined; position?: "fixed" | "relative" | "absolute" | "sticky" | undefined; background?: string | { image?: ...`

---

#### `quickAddConfigSchema` *(variable)*

Zod config schema for the QuickAdd component.

Defines all manifest-settable fields for an inline creation bar
that allows quick item entry with a text input and submit button.

**Example:**

```json
{
  "type": "quick-add",
  "placeholder": "Add a task...",
  "submitAction": { "type": "api", "method": "POST", "endpoint": "/api/tasks" },
  "clearOnSubmit": true
}
```

---

#### `QuickAddField({ id, placeholder: placeholderProp, icon: iconProp, submitOnEnter: submitOnEnterProp, showButton: showButtonProp, buttonText: buttonTextProp, clearOnSubmit: clearOnSubmitProp, onSubmit, className, st...`

Standalone QuickAddField -- a compact input with submit button for quickly
adding items to a list. No manifest context required.

**Example:**

```tsx
<QuickAddField
  placeholder="Add a task..."
  icon="plus"
  buttonText="Add"
  onSubmit={(value) => addTask(value)}
/>
```

---

#### `Select({ config }: { config: { options: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase" | "trim" | ... 6 ...`

---

#### `SelectField({ id, label, placeholder, value: controlledValue, defaultValue, required, disabled, helperText, errorText, options, loading, onChange, onBlur, onFocus, onClick, onKeyDown, className, style, slots, }:...`

Standalone SelectField -- a complete select form field with label, options,
helper/error text, and required indicator. No manifest context required.

**Example:**

```tsx
<SelectField
  label="Country"
  placeholder="Choose a country"
  options={[{ label: "USA", value: "us" }, { label: "Canada", value: "ca" }]}
  onChange={(val) => setCountry(val)}
/>
```

---

#### `Slider({ config }: { config: { type: "slider"; label?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase" | ...`

Render a manifest-driven slider input.

---

#### `SliderField({ id, label, min: minProp, max: maxProp, step, defaultValue, range, showValue, showLimits, suffix, disabled, onChange, className, style, slots, }: SliderFieldProps) => Element`

Standalone SliderField -- a range slider with optional label, value display,
limit labels, and dual-thumb range mode. No manifest context required.

**Example:**

```tsx
<SliderField
  label="Volume"
  min={0}
  max={100}
  showValue
  suffix="%"
  onChange={(val) => setVolume(val)}
/>
```

---

#### `SwitchField({ id, label, description, checked: controlledChecked, defaultChecked, disabled, size: sizeProp, color, onChange, className, style, slots, }: SwitchFieldProps) => Element`

Standalone SwitchField -- a toggle switch with label, description, and
configurable size and color. No manifest context required.

**Example:**

```tsx
<SwitchField
  label="Dark Mode"
  description="Enable dark theme across the app"
  checked={isDark}
  onChange={(on) => setDark(on)}
/>
```

---

#### `TagSelector({ config }: { config: { type: "tag-selector"; data?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercas...`

---

#### `tagSelectorConfigSchema` *(variable)*

Zod config schema for the TagSelector component.

A tag input that allows selecting from predefined tags or creating new ones.
Tags display as colored pills with remove buttons.

**Example:**

```json
{
  "type": "tag-selector",
  "id": "topic-tags",
  "label": "Topics",
  "tags": [
    { "label": "React", "value": "react", "color": "#61dafb" },
    { "label": "TypeScript", "value": "ts", "color": "#3178c6" }
  ],
  "allowCreate": true,
  "maxTags": 5
}
```

---

#### `TagSelectorField({ id, label, tags: tagsProp, value: controlledValue, defaultValue, allowCreate, maxTags, onChange, onCreate, className, style, slots, }: TagSelectorFieldProps) => Element`

Standalone TagSelectorField -- tag pills with dropdown selection, search filtering,
and optional tag creation. No manifest context required.

**Example:**

```tsx
<TagSelectorField
  label="Categories"
  tags={[
    { label: "Bug", value: "bug", color: "#ef4444" },
    { label: "Feature", value: "feature", color: "#22c55e" },
  ]}
  allowCreate
  onChange={(selected) => setCategories(selected)}
/>
```

---

#### `Textarea({ config }: { config: { type: "textarea"; value?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase" ...`

---

#### `textareaConfigSchema` *(variable)*

Zod config schema for the Textarea component.

Defines a multi-line text input with label, character count,
validation, and configurable resize behavior.

**Example:**

```json
{
  "type": "textarea",
  "id": "bio-field",
  "label": "Bio",
  "placeholder": "Tell us about yourself...",
  "rows": 5,
  "maxLength": 500,
  "resize": "vertical"
}
```

---

#### `TextareaField({ id, label, placeholder, value: controlledValue, required, disabled, readOnly, maxLength, rows, resize, helperText, errorText, onChange, onBlur, onFocus, onClick, onKeyDown, className, style, slots,...`

Standalone TextareaField -- a complete textarea form field with label,
character counter, validation, and helper/error text. No manifest context required.

**Example:**

```tsx
<TextareaField
  label="Bio"
  placeholder="Tell us about yourself..."
  maxLength={500}
  rows={5}
  onChange={(text) => setBio(text)}
/>
```

---

#### `Toggle({ config }: { config: { type: "toggle"; label?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase" | ...`

---

#### `toggleConfigSchema` *(variable)*

Zod config schema for the Toggle component.

Defines a pressed/unpressed toggle button that publishes its state.
Can display text, an icon, or both.

**Example:**

```json
{
  "type": "toggle",
  "id": "bold-toggle",
  "icon": "bold",
  "label": "Bold",
  "variant": "outline",
  "size": "sm"
}
```

---

#### `ToggleField({ id, label, icon, variant: variantProp, size: sizeProp, pressed: controlledPressed, defaultPressed, disabled, onChange, className, style, slots, }: ToggleFieldProps) => Element`

Standalone ToggleField -- a pressable toggle button with optional icon and label.
No manifest context required.

**Example:**

```tsx
<ToggleField
  icon="bold"
  label="Bold"
  variant="outline"
  pressed={isBold}
  onChange={(on) => setBold(on)}
/>
```

---

#### `ToggleGroupBase({ id, items, mode, value: controlledValue, defaultValue, variant, size, onChange, className, style, slots, }: ToggleGroupBaseProps) => Element`

Standalone ToggleGroupBase -- a group of toggle buttons supporting single
or multi-select modes. No manifest context required.

**Example:**

```tsx
<ToggleGroupBase
  items={[
    { value: "left", icon: "align-left" },
    { value: "center", icon: "align-center" },
    { value: "right", icon: "align-right" },
  ]}
  mode="single"
  variant="outline"
  onChange={(val) => setAlign(val)}
/>
```

---

#### `useAutoForm(fields: { name: string; type: "number" | "select" | "date" | "email" | "datetime" | "time" | "color" | "password" | "text" | "textarea" | "multi-select" | "checkbox" | "file" | "radio-group" | "switc...`

Headless hook for form state management.

Tracks field values, validation errors, and touched state.
Validates on blur (per-field) and on submit (all fields).

**Parameters:**

| Name | Description |
|------|-------------|
| `fields` | Array of field configurations |
| `onSubmit` | Async callback invoked with form values when validation passes |

**Returns:** Form state and handlers

**Example:**

```tsx
const form = useAutoForm(fields, async (values) => {
  await api.post('/api/users', values)
})

return (
  <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
    <input
      value={form.values.name as string}
      onChange={(e) => form.setValue('name', e.target.value)}
      onBlur={() => form.touchField('name')}
    />
    {form.touched.name && form.errors.name && <span>{form.errors.name}</span>}
    <button disabled={form.isSubmitting}>Submit</button>
  </form>
)
```

---

#### `useWizard(config: Record<string, any>) => UseWizardResult`

Headless hook that manages multi-step wizard state including step navigation,
per-step validation, field tracking, and final submission.

Provides reactive state for the current step, accumulated data across steps,
validation errors, and transition controls (next/prev/skip/reset).

**Parameters:**

| Name | Description |
|------|-------------|
| `config` | Wizard configuration from the manifest, including steps, validation rules, submit action, and transition settings. |

**Returns:** Wizard state and step-navigation controls.

**Example:**

```tsx
const wizard = useWizard(wizardConfig);

return (
  <div>
    <p>Step {wizard.currentStep + 1} of {wizard.totalSteps}</p>
    {wizard.isSubmitting && <Spinner />}
    {wizard.submitError && <p>{wizard.submitError.message}</p>}
    <button onClick={wizard.prevStep} disabled={wizard.isFirstStep}>Back</button>
    <button onClick={wizard.nextStep}>
      {wizard.isLastStep ? "Submit" : "Next"}
    </button>
  </div>
);
```

---

#### `Wizard({ config }: { config: Record<string, any>; }) => Element`

Render a multi-step form wizard with built-in validation, step state, and slot-aware styling.

---

#### `WizardBase({ id, steps, state: wizard, submitLabel: submitLabelProp, className, style, slots, }: WizardBaseProps) => Element`

Standalone WizardBase -- a multi-step form wizard with progress indicator,
step navigation, field validation, and completion state. No manifest context required.

**Example:**

```tsx
<WizardBase
  steps={[
    { title: "Account", fields: [{ name: "email", type: "email", required: true }] },
    { title: "Profile", fields: [{ name: "name", type: "text" }] },
  ]}
  state={wizardState}
  submitLabel="Create Account"
/>
```

---

## Components — Communication

| Export | Kind | Description |
|---|---|---|
| `buildEmojiMap` | function | Builds a shortcode lookup map from an array of custom emojis. |
| `ChatWindow` | function | Manifest adapter — resolves config refs, composes manifest sub-components, delegates to ChatWindowBase. |
| `ChatWindowBase` | function | Standalone ChatWindow — composable chat container with header, message thread, typing indicator, and input slots. No manifest context required. |
| `ChatWindowBaseProps` | interface | No JSDoc description. |
| `ChatWindowConfig` | typealias | Inferred config type from the ChatWindow Zod schema. |
| `chatWindowConfigSchema` | variable | Zod config schema for the ChatWindow component.  A full chat interface composing a message thread, rich input, and typing indicator into a single component. |
| `CommentSection` | function | Manifest adapter — resolves data endpoint, wires actions, delegates to CommentSectionBase. |
| `CommentSectionBase` | function | Standalone CommentSection — threaded comment list with avatars, timestamps, optional delete actions, and a composable input slot. No manifest context required. |
| `CommentSectionBaseProps` | interface | No JSDoc description. |
| `CommentSectionConfig` | typealias | Inferred config type from the CommentSection Zod schema. |
| `commentSectionConfigSchema` | variable | Zod config schema for the CommentSection component.  Renders a comment list with nested replies and an embedded rich input for posting new comments. |
| `CUSTOM_EMOJI_CSS` | variable | CSS for custom emoji sizing. Custom emojis render as inline images sized to match surrounding text. |
| `CustomEmoji` | interface | Shape of a custom emoji entry. |
| `EmojiPicker` | function | Manifest adapter — resolves custom emoji data, wires actions/publish, delegates to EmojiPickerBase. |
| `EmojiPickerBase` | function | Standalone EmojiPicker — searchable emoji grid with category tabs and custom emoji support. No manifest context required. |
| `EmojiPickerBaseProps` | interface | No JSDoc description. |
| `EmojiPickerConfig` | typealias | Inferred config type from the EmojiPicker Zod schema. |
| `emojiPickerConfigSchema` | variable | Zod config schema for the EmojiPicker component. Renders a searchable grid of emojis organized by category. |
| `GifEntry` | interface | Shape of a GIF entry. |
| `GifPicker` | function | Manifest adapter — resolves config refs, wires actions/publish, delegates to GifPickerBase. |
| `GifPickerBase` | function | Standalone GifPicker — searchable GIF grid with debounced search, loading states, and optional attribution. No manifest context required. |
| `GifPickerBaseProps` | interface | No JSDoc description. |
| `GifPickerConfig` | typealias | Inferred config type from the GifPicker Zod schema. |
| `gifPickerConfigSchema` | variable | Zod config schema for the GifPicker component.  Searchable GIF picker that queries a GIF API (Giphy/Tenor) and displays results in a masonry-style grid.  The component expects a backend proxy endpoint that handles the actual API key and returns GIF results. This avoids exposing API keys in the frontend. |
| `MessageThread` | function | Manifest adapter — resolves data endpoint, wires actions/publish, delegates to MessageThreadBase. |
| `MessageThreadBase` | function | Standalone MessageThread — scrollable message list with avatars, date separators, auto-scroll, embed rendering, and consecutive-message grouping. No manifest context required. |
| `MessageThreadBaseProps` | interface | No JSDoc description. |
| `MessageThreadConfig` | typealias | Inferred config type from the MessageThread Zod schema. |
| `messageThreadConfigSchema` | variable | Zod config schema for the MessageThread component.  Renders a scrollable message list with avatars, timestamps, message grouping, date separators, and optional reactions/threading. |
| `parseShortcodes` | function | Parses shortcodes in text and replaces them with `<img>` tags. |
| `PresenceIndicator` | function | Manifest adapter — resolves config refs and delegates to PresenceIndicatorBase. |
| `PresenceIndicatorBase` | function | Standalone PresenceIndicator — displays online/offline/away/busy/dnd status with a colored dot and optional label. No manifest context required. |
| `PresenceIndicatorBaseProps` | interface | No JSDoc description. |
| `PresenceIndicatorConfig` | typealias | Inferred config type from the PresenceIndicator Zod schema. |
| `presenceIndicatorConfigSchema` | variable | Zod config schema for the PresenceIndicator component. Displays an online/offline/away/busy/dnd status dot with optional label. |
| `ReactionBar` | function | Manifest adapter — wires actions/publish and delegates to ReactionBarBase. |
| `ReactionBarBase` | function | Standalone ReactionBar — row of emoji reaction pills with counts and an add-reaction button that opens an inline emoji picker. No manifest context required. |
| `ReactionBarBaseProps` | interface | No JSDoc description. |
| `ReactionBarConfig` | typealias | Inferred config type from the ReactionBar Zod schema. |
| `reactionBarConfigSchema` | variable | Zod config schema for the ReactionBar component.  Displays emoji reactions with counts and an add button. |
| `ReactionEntry` | interface | No JSDoc description. |
| `resolveEmojiRecords` | function | Resolves emoji records from the API into CustomEmoji entries. Handles the `uploadKey` → `url` resolution using a URL prefix or field mapping. |
| `TypingIndicator` | function | Manifest adapter — resolves config refs and delegates to TypingIndicatorBase. |
| `TypingIndicatorBase` | function | Standalone TypingIndicator — shows animated bouncing dots with user names to indicate who is currently typing. No manifest context required. |
| `TypingIndicatorBaseProps` | interface | No JSDoc description. |
| `TypingIndicatorConfig` | typealias | Inferred config type from the TypingIndicator Zod schema. |
| `typingIndicatorConfigSchema` | variable | Zod config schema for the TypingIndicator component. Displays an animated "User is typing..." indicator with bouncing dots. |
| `TypingUser` | interface | A user entry for the typing indicator. |

### Details

#### `buildEmojiMap(emojis: CustomEmoji[]) => Map<string, CustomEmoji>`

Builds a shortcode lookup map from an array of custom emojis.

---

#### `ChatWindow({ config }: { config: { data: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase" | "trim" | "json" | ...`

Manifest adapter — resolves config refs, composes manifest sub-components, delegates to ChatWindowBase.

---

#### `ChatWindowBase({ id, title, subtitle, showHeader, height, threadSlot, typingSlot, inputSlot, showTypingIndicator, className, style, slots, }: ChatWindowBaseProps) => Element`

Standalone ChatWindow — composable chat container with header, message thread,
typing indicator, and input slots. No manifest context required.

**Example:**

```tsx
<ChatWindowBase
  title="General"
  threadSlot={<MessageThreadBase messages={messages} />}
  inputSlot={<input placeholder="Type a message..." />}
/>
```

---

#### `chatWindowConfigSchema` *(variable)*

Zod config schema for the ChatWindow component.

A full chat interface composing a message thread, rich input,
and typing indicator into a single component.

**Example:**

```json
{
  "type": "chat-window",
  "title": "#general",
  "data": "GET /api/channels/general/messages",
  "sendAction": {
    "type": "api",
    "method": "POST",
    "endpoint": "/api/channels/general/messages"
  },
  "height": "600px"
}
```

---

#### `CommentSection({ config }: { config: Record<string, any>; }) => Element | null`

Manifest adapter — resolves data endpoint, wires actions, delegates to CommentSectionBase.

---

#### `CommentSectionBase({ id, comments, loading, error, emptyText, authorNameField, authorAvatarField, contentField, timestampField, sortOrder, showDelete, onDelete, inputSlot, className, style, slots, }: CommentSectionBase...`

Standalone CommentSection — threaded comment list with avatars, timestamps,
optional delete actions, and a composable input slot. No manifest context required.

**Example:**

```tsx
<CommentSectionBase
  comments={[{ author: { name: "Alice" }, content: "Great work!", timestamp: "2026-01-15T10:00:00Z" }]}
  sortOrder="newest"
  showDelete
  onDelete={(c) => console.log("delete", c)}
/>
```

---

#### `commentSectionConfigSchema` *(variable)*

Zod config schema for the CommentSection component.

Renders a comment list with nested replies and an embedded rich input
for posting new comments.

**Example:**

```json
{
  "type": "comment-section",
  "data": "GET /api/posts/123/comments",
  "inputPlaceholder": "Write a comment...",
  "submitAction": {
    "type": "api",
    "method": "POST",
    "endpoint": "/api/posts/123/comments"
  }
}
```

---

#### `EmojiPicker({ config }: { config: { type: "emoji-picker"; color?: string | undefined; position?: "fixed" | "relative" | "absolute" | "sticky" | undefined; background?: string | { image?: string | undefined; ... ...`

Manifest adapter — resolves custom emoji data, wires actions/publish, delegates to EmojiPickerBase.

---

#### `EmojiPickerBase({ id, perRow, maxHeight, categories: allowedCategories, customEmojis, onSelect, className, style, slots, }: EmojiPickerBaseProps) => Element`

Standalone EmojiPicker — searchable emoji grid with category tabs and custom emoji
support. No manifest context required.

**Example:**

```tsx
<EmojiPickerBase
  perRow={8}
  onSelect={({ emoji, name }) => console.log(emoji, name)}
/>
```

---

#### `emojiPickerConfigSchema` *(variable)*

Zod config schema for the EmojiPicker component.

Renders a searchable grid of emojis organized by category.

**Example:**

```json
{
  "type": "emoji-picker",
  "id": "emoji",
  "perRow": 8,
  "maxHeight": "300px"
}
```

---

#### `GifPicker({ config }: { config: { type: "gif-picker"; color?: string | undefined; position?: "fixed" | "relative" | "absolute" | "sticky" | undefined; background?: string | { image?: string | undefined; ... 4 ...`

Manifest adapter — resolves config refs, wires actions/publish, delegates to GifPickerBase.

---

#### `GifPickerBase({ id, columns, maxHeight, placeholder, attribution, gifs, loading, onSelect, onSearchChange, className, style, slots, }: GifPickerBaseProps) => Element`

Standalone GifPicker — searchable GIF grid with debounced search, loading states,
and optional attribution. No manifest context required.

**Example:**

```tsx
<GifPickerBase
  gifs={gifResults}
  loading={isSearching}
  onSearchChange={(q) => searchGifs(q)}
  onSelect={(gif) => insertGif(gif.url)}
/>
```

---

#### `gifPickerConfigSchema` *(variable)*

Zod config schema for the GifPicker component.

Searchable GIF picker that queries a GIF API (Giphy/Tenor) and
displays results in a masonry-style grid.

The component expects a backend proxy endpoint that handles the
actual API key and returns GIF results. This avoids exposing
API keys in the frontend.

**Example:**

```json
{
  "type": "gif-picker",
  "searchEndpoint": "GET /api/gifs/search",
  "trendingEndpoint": "GET /api/gifs/trending",
  "selectAction": {
    "type": "toast",
    "message": "GIF selected!"
  }
}
```

Expected API response format:
```json
{
  "results": [
    {
      "id": "abc123",
      "url": "https://media.giphy.com/media/abc123/giphy.gif",
      "preview": "https://media.giphy.com/media/abc123/200w.gif",
      "width": 480,
      "height": 270,
      "title": "Funny cat"
    }
  ]
}
```

---

#### `MessageThread({ config }: { config: Record<string, any>; }) => Element | null`

Manifest adapter — resolves data endpoint, wires actions/publish, delegates to MessageThreadBase.

---

#### `MessageThreadBase({ id, messages, loading, error, emptyText, contentField, authorNameField, authorAvatarField, timestampField, showTimestamps, embedsField, showEmbeds, groupByDate, maxHeight, onMessageClick, renderEmb...`

Standalone MessageThread — scrollable message list with avatars, date separators,
auto-scroll, embed rendering, and consecutive-message grouping. No manifest context required.

**Example:**

```tsx
<MessageThreadBase
  messages={[
    { id: "1", author: { name: "Alice" }, content: "Hello!", timestamp: "2026-01-15T10:00:00Z" },
    { id: "2", author: { name: "Bob" }, content: "Hi there!", timestamp: "2026-01-15T10:01:00Z" },
  ]}
  showTimestamps
  groupByDate
/>
```

---

#### `messageThreadConfigSchema` *(variable)*

Zod config schema for the MessageThread component.

Renders a scrollable message list with avatars, timestamps,
message grouping, date separators, and optional reactions/threading.

**Example:**

```json
{
  "type": "message-thread",
  "data": "GET /api/channels/general/messages",
  "showReactions": true,
  "groupByDate": true,
  "maxHeight": "500px"
}
```

---

#### `parseShortcodes(text: string, emojis: Map<string, CustomEmoji>) => string`

Parses shortcodes in text and replaces them with `<img>` tags.

**Parameters:**

| Name | Description |
|------|-------------|
| `text` | The text containing shortcodes like `:emoji_name:` |
| `emojis` | Map of shortcode → CustomEmoji |

**Returns:** HTML string with shortcodes replaced by img tags

**Example:**

```ts
const emojis = new Map([["wave", { url: "/emojis/wave.gif", ... }]]);
parseShortcodes("Hello :wave:", emojis);
// → 'Hello <img class="sn-custom-emoji" src="/emojis/wave.gif" alt=":wave:" title="wave" />'
```

---

#### `PresenceIndicator({ config, }: { config: { status: { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase" | "trim" | "json" | "first...`

Manifest adapter — resolves config refs and delegates to PresenceIndicatorBase.

---

#### `PresenceIndicatorBase({ id, status, label, showDot, showLabel, size, className, style, slots, }: PresenceIndicatorBaseProps) => Element`

Standalone PresenceIndicator — displays online/offline/away/busy/dnd status
with a colored dot and optional label. No manifest context required.

**Example:**

```tsx
<PresenceIndicatorBase status="online" size="md" />
```

---

#### `presenceIndicatorConfigSchema` *(variable)*

Zod config schema for the PresenceIndicator component.

Displays an online/offline/away/busy/dnd status dot with optional label.

**Example:**

```json
{
  "type": "presence-indicator",
  "status": "online",
  "label": "John Doe",
  "size": "md"
}
```

---

#### `ReactionBar({ config }: { config: { type: "reaction-bar"; data?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercas...`

Manifest adapter — wires actions/publish and delegates to ReactionBarBase.

---

#### `ReactionBarBase({ id, reactions, showAddButton, onReactionClick, onEmojiSelect, EmojiPickerComponent, className, style, slots, }: ReactionBarBaseProps) => Element`

Standalone ReactionBar — row of emoji reaction pills with counts and an
add-reaction button that opens an inline emoji picker. No manifest context required.

**Example:**

```tsx
<ReactionBarBase
  reactions={[
    { emoji: "\ud83d\udc4d", count: 3, active: true },
    { emoji: "\u2764\ufe0f", count: 1 },
  ]}
  onReactionClick={(emoji, wasActive) => toggleReaction(emoji)}
  onEmojiSelect={({ emoji }) => addReaction(emoji)}
/>
```

---

#### `reactionBarConfigSchema` *(variable)*

Zod config schema for the ReactionBar component.

Displays emoji reactions with counts and an add button.

**Example:**

```json
{
  "type": "reaction-bar",
  "reactions": [
    { "emoji": "\ud83d\udc4d", "count": 5, "active": true },
    { "emoji": "\u2764\ufe0f", "count": 3 },
    { "emoji": "\ud83d\ude02", "count": 2 }
  ]
}
```

---

#### `resolveEmojiRecords(records: Record<string, unknown>[], urlField?: string, urlPrefix?: string | undefined) => CustomEmoji[]`

Resolves emoji records from the API into CustomEmoji entries.
Handles the `uploadKey` → `url` resolution using a URL prefix or field mapping.

**Parameters:**

| Name | Description |
|------|-------------|
| `records` | Raw API response records |
| `urlField` | Field name containing the image URL. Default: "url" |
| `urlPrefix` | Prefix to prepend to uploadKey for URL resolution |

---

#### `TypingIndicator({ config }: { config: { type: "typing-indicator"; color?: string | undefined; position?: "fixed" | "relative" | "absolute" | "sticky" | undefined; background?: string | { image?: string | undefined; ...`

Manifest adapter — resolves config refs and delegates to TypingIndicatorBase.

---

#### `TypingIndicatorBase({ id, users, maxDisplay, className, style, slots, }: TypingIndicatorBaseProps) => Element | null`

Standalone TypingIndicator — shows animated bouncing dots with user names
to indicate who is currently typing. No manifest context required.

**Example:**

```tsx
<TypingIndicatorBase users={[{ name: "Alice" }, { name: "Bob" }]} />
```

---

#### `typingIndicatorConfigSchema` *(variable)*

Zod config schema for the TypingIndicator component.

Displays an animated "User is typing..." indicator with bouncing dots.

**Example:**

```json
{
  "type": "typing-indicator",
  "users": [{ "name": "Alice" }, { "name": "Bob" }]
}
```

---

## Components — Content

| Export | Kind | Description |
|---|---|---|
| `BannerBase` | function | Standalone Banner — a full-width hero section with background, overlay, and content alignment. No manifest context required. |
| `BannerBaseProps` | interface | No JSDoc description. |
| `Code` | function | Manifest adapter — resolves config refs and delegates to CodeBase. |
| `CodeBase` | function | Standalone Code — an inline code element for displaying code snippets within flowing text. No manifest context required. |
| `CodeBaseProps` | interface | No JSDoc description. |
| `CodeBlockBase` | function | Standalone CodeBlock — displays code with syntax highlighting, optional line numbers, copy button, and title bar. No manifest context required. |
| `CodeBlockBaseProps` | interface | No JSDoc description. |
| `CodeConfig` | typealias | Inferred config type for the Code component. |
| `codeConfigSchema` | variable | Inline code primitive schema for manifest-rendered code snippets. |
| `CompareView` | function | Manifest adapter — resolves config refs and delegates to CompareViewBase. |
| `CompareViewBase` | function | Standalone CompareView — a side-by-side diff viewer for comparing two text blocks. No manifest context required. |
| `CompareViewBaseProps` | interface | No JSDoc description. |
| `CompareViewConfig` | typealias | Inferred config type from the CompareView Zod schema. |
| `compareViewConfigSchema` | variable | Zod config schema for the CompareView component.  Defines all manifest-settable fields for a side-by-side content comparison view with diff highlighting. |
| `detectPlatform` | function | Detects the platform from a URL and extracts embed info. |
| `FileUploaderBase` | function | Standalone FileUploader — a file upload component with dropzone, button, and compact variants. No manifest context required. |
| `FileUploaderBaseProps` | interface | No JSDoc description. |
| `Heading` | function | Manifest adapter — resolves template text, locale, and route context, then delegates to HeadingBase. |
| `HeadingBase` | function | Standalone Heading — a styled heading element (h1-h6) that works with plain React props. No manifest context required. |
| `HeadingBaseProps` | interface | No JSDoc description. |
| `LinkEmbed` | function | Manifest adapter — resolves config refs and delegates to LinkEmbedBase. |
| `LinkEmbedBase` | function | Standalone LinkEmbed — renders rich link previews with platform-specific embeds (YouTube, Instagram, TikTok, Twitter, GIF) or a generic card. No manifest context required. |
| `LinkEmbedBaseProps` | interface | No JSDoc description. |
| `LinkEmbedConfig` | typealias | Inferred config type from the LinkEmbed Zod schema. |
| `linkEmbedConfigSchema` | variable | Zod config schema for the LinkEmbed component.  Renders rich URL previews with platform-specific renderers for YouTube, Instagram, TikTok, Twitter/X, and generic Open Graph cards. Also supports inline GIF embeds. |
| `LinkEmbedMeta` | interface | No JSDoc description. |
| `Markdown` | function | Manifest adapter — resolves config refs and delegates to MarkdownBase. |
| `MarkdownBase` | function | Standalone Markdown — renders markdown content with syntax highlighting and Snapshot design tokens. No manifest context required. |
| `MarkdownBaseProps` | interface | No JSDoc description. |
| `MarkdownConfig` | typealias | Inferred config type from the Markdown Zod schema. |
| `markdownConfigSchema` | variable | Zod config schema for the Markdown component.  Renders markdown content with full GFM support and syntax highlighting. |
| `Platform` | typealias | Platform detection and embed URL extraction. Identifies known platforms from URLs and extracts the embed-compatible URL or ID needed to render platform-specific iframes. |
| `PLATFORM_COLORS` | variable | Platform accent colors. |
| `PLATFORM_NAMES` | variable | Platform display names. |
| `PlatformInfo` | interface | Resolved platform metadata used to render a platform-specific embedded preview. |
| `RichInput` | function | Manifest adapter — resolves config refs, wires actions, and delegates to RichInputBase. |
| `RichInputBase` | function | Standalone RichInput — a rich text editor with formatting toolbar, powered by tiptap. No manifest context required. |
| `RichInputBaseProps` | interface | No JSDoc description. |
| `RichInputConfig` | typealias | Inferred config type from the RichInput Zod schema. |
| `richInputConfigSchema` | variable | Zod config schema for the RichInput component.  A TipTap-based WYSIWYG editor for chat messages, comments, and posts. Users see formatted text as they type (bold, italic, mentions, etc.) rather than raw markdown. |
| `RichTextEditor` | function | Manifest adapter — resolves config refs, wires publish, and delegates to RichTextEditorBase. |
| `RichTextEditorBase` | function | Standalone RichTextEditor — a markdown editor with live preview, powered by CodeMirror. No manifest context required. |
| `RichTextEditorBaseProps` | interface | No JSDoc description. |
| `RichTextEditorConfig` | typealias | Inferred config type from the RichTextEditor Zod schema. |
| `richTextEditorConfigSchema` | variable | Zod config schema for the RichTextEditor component.  Defines all manifest-settable fields for a CodeMirror 6-based markdown editor with toolbar, preview pane, and split view support. |
| `TimelineBase` | function | Standalone Timeline — vertical event timeline with dot markers, connectors, date labels, and default/compact/alternating layout variants. No manifest context required. |
| `TimelineBaseProps` | interface | No JSDoc description. |
| `TimelineItemEntry` | interface | No JSDoc description. |

### Details

#### `BannerBase({ id, height, align, background, className, style, slots, children, }: BannerBaseProps) => Element`

Standalone Banner — a full-width hero section with background, overlay,
and content alignment. No manifest context required.

**Example:**

```tsx
<BannerBase height="60vh" align="center" background={{ color: "#1a1a2e" }}>
  <h1>Welcome</h1>
  <p>Get started today</p>
</BannerBase>
```

---

#### `Code({ config }: { config: { value: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase" | "trim" | "json" |...`

Manifest adapter — resolves config refs and delegates to CodeBase.

---

#### `CodeBase({ id, value, fallback, className, style, slots, }: CodeBaseProps) => Element`

Standalone Code — an inline code element for displaying code snippets
within flowing text. No manifest context required.

**Example:**

```tsx
<CodeBase value="npm install snapshot" />
```

---

#### `CodeBlockBase({ id, code, language, title, showCopy, showLineNumbers, wrap, highlight: highlightEnabled, maxHeight, className, style, slots, }: CodeBlockBaseProps) => Element`

Standalone CodeBlock — displays code with syntax highlighting,
optional line numbers, copy button, and title bar.
No manifest context required.

**Example:**

```tsx
<CodeBlockBase code="console.log('hello');" language="javascript" title="example.js" showLineNumbers />
```

---

#### `CompareView({ config }: { config: { type: "compare-view"; left: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase...`

Manifest adapter — resolves config refs and delegates to CompareViewBase.

---

#### `CompareViewBase({ id, left, right, leftLabel, rightLabel, maxHeight, showLineNumbers, className, style, slots, }: CompareViewBaseProps) => Element`

Standalone CompareView — a side-by-side diff viewer for comparing two
text blocks. No manifest context required.

**Example:**

```tsx
<CompareViewBase left="original text" right="modified text" leftLabel="Before" rightLabel="After" />
```

---

#### `compareViewConfigSchema` *(variable)*

Zod config schema for the CompareView component.

Defines all manifest-settable fields for a side-by-side content
comparison view with diff highlighting.

**Example:**

```json
{
  "type": "compare-view",
  "left": "Original text content",
  "right": "Modified text content",
  "leftLabel": "Before",
  "rightLabel": "After"
}
```

---

#### `detectPlatform(url: string, options?: { darkMode?: boolean | undefined; } | undefined) => PlatformInfo | null`

Detects the platform from a URL and extracts embed info.

**Parameters:**

| Name | Description |
|------|-------------|
| `url` | The URL to analyze |

**Returns:** Platform info with embed ID and URL, or null for generic

---

#### `FileUploaderBase({ id, variant, label, description, maxFiles, maxSize, accept, onFilesAdded, onFileRemoved, files: controlledFiles, className, style, slots, }: FileUploaderBaseProps) => Element`

Standalone FileUploader — a file upload component with dropzone, button,
and compact variants. No manifest context required.

**Example:**

```tsx
<FileUploaderBase
  variant="dropzone"
  label="Upload your files"
  maxFiles={5}
  accept="image/*"
  onFilesAdded={(files) => handleUpload(files)}
/>
```

---

#### `Heading({ config }: { config: { type: "heading"; text: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase" | ....`

Manifest adapter — resolves template text, locale, and route context,
then delegates to HeadingBase.

---

#### `HeadingBase({ id, text, level, align, className, style, slots, }: HeadingBaseProps) => Element`

Standalone Heading — a styled heading element (h1-h6) that works with plain
React props. No manifest context required.

**Example:**

```tsx
<HeadingBase text="Welcome" level={1} align="center" />
```

---

#### `LinkEmbed({ config }: { config: { url: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase" | "trim" | "json" | ....`

Manifest adapter — resolves config refs and delegates to LinkEmbedBase.

---

#### `LinkEmbedBase({ id, url, meta, allowIframe, aspectRatio, maxWidth, className, style, slots, }: LinkEmbedBaseProps) => Element | null`

Standalone LinkEmbed — renders rich link previews with platform-specific
embeds (YouTube, Instagram, TikTok, Twitter, GIF) or a generic card.
No manifest context required.

**Example:**

```tsx
<LinkEmbedBase url="https://www.youtube.com/watch?v=xyz" />
```

---

#### `linkEmbedConfigSchema` *(variable)*

Zod config schema for the LinkEmbed component.

Renders rich URL previews with platform-specific renderers for
YouTube, Instagram, TikTok, Twitter/X, and generic Open Graph cards.
Also supports inline GIF embeds.

**Example:**

```json
{
  "type": "link-embed",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Example:**

```json
{
  "type": "link-embed",
  "url": "https://twitter.com/user/status/123",
  "meta": {
    "title": "Tweet by

---

#### `Markdown({ config }: { config: Record<string, any>; }) => Element | null`

Manifest adapter — resolves config refs and delegates to MarkdownBase.

---

#### `MarkdownBase({ id, content, maxHeight, className, style, slots, }: MarkdownBaseProps) => Element`

Standalone Markdown — renders markdown content with syntax highlighting
and Snapshot design tokens. No manifest context required.

**Example:**

```tsx
<MarkdownBase content="# Hello\n\nThis is **bold** text." />
```

---

#### `markdownConfigSchema` *(variable)*

Zod config schema for the Markdown component.

Renders markdown content with full GFM support and syntax highlighting.

**Example:**

```json
{
  "type": "markdown",
  "content": "# Hello\n\nSome **bold** text and a [link](https://example.com)."
}
```

---

#### `RichInput({ config }: { config: { type: "rich-input"; maxLength?: number | undefined; color?: string | undefined; position?: "fixed" | "relative" | "absolute" | "sticky" | undefined; background?: string | { .....`

Manifest adapter — resolves config refs, wires actions, and delegates to RichInputBase.

---

#### `RichInputBase({ id, placeholder, readonly, features, sendOnEnter, maxLength, minHeight, maxHeight, showSendButton, onSend, onChange, className, style, slots, }: RichInputBaseProps) => Element`

Standalone RichInput — a rich text editor with formatting toolbar,
powered by tiptap. No manifest context required.

**Example:**

```tsx
<RichInputBase
  placeholder="Type a message..."
  features={["bold", "italic", "link"]}
  onSend={({ html, text }) => sendMessage(html)}
/>
```

---

#### `richInputConfigSchema` *(variable)*

Zod config schema for the RichInput component.

A TipTap-based WYSIWYG editor for chat messages, comments, and posts.
Users see formatted text as they type (bold, italic, mentions, etc.)
rather than raw markdown.

**Example:**

```json
{
  "type": "rich-input",
  "id": "chat-input",
  "placeholder": "Type a message...",
  "sendOnEnter": true,
  "features": ["bold", "italic", "mention", "emoji", "code"],
  "sendAction": {
    "type": "api",
    "method": "POST",
    "endpoint": "/api/channels/general/messages",
    "body": { "from": "chat-input" }
  }
}
```

---

#### `RichTextEditor({ config }: { config: { type: "rich-text-editor"; content?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | .....`

Manifest adapter — resolves config refs, wires publish, and delegates to RichTextEditorBase.

---

#### `RichTextEditorBase({ id, content: initialContent, placeholder: placeholderText, readonly, mode: initialMode, toolbar, minHeight, maxHeight, onChange, renderPreview, className, style, slots, }: RichTextEditorBaseProps) ...`

Standalone RichTextEditor — a markdown editor with live preview,
powered by CodeMirror. No manifest context required.

**Example:**

```tsx
<RichTextEditorBase content="# Hello" onChange={(md) => save(md)} />
```

---

#### `richTextEditorConfigSchema` *(variable)*

Zod config schema for the RichTextEditor component.

Defines all manifest-settable fields for a CodeMirror 6-based markdown editor
with toolbar, preview pane, and split view support.

**Example:**

```json
{
  "type": "rich-text-editor",
  "id": "content-editor",
  "content": "# Hello\n\nStart writing...",
  "mode": "split",
  "toolbar": ["bold", "italic", "h1", "h2", "separator", "code", "link"]
}
```

---

#### `TimelineBase({ id, items, variant, showConnector, loading, error, emptyText, onItemClick, className, style, slots, }: TimelineBaseProps) => Element`

Standalone Timeline — vertical event timeline with dot markers, connectors,
date labels, and default/compact/alternating layout variants. No manifest context required.

**Example:**

```tsx
<TimelineBase
  items={[
    { title: "Project started", date: "Jan 1", icon: "rocket", color: "primary" },
    { title: "First release", date: "Mar 15", description: "v1.0 shipped to production" },
  ]}
  variant="default"
  showConnector
/>
```

---

## Components — Overlay

| Export | Kind | Description |
|---|---|---|
| `CommandPalette` | function | CommandPalette — search-driven command palette that renders static groups or fetches remote results, then dispatches manifest actions for the selected command. |
| `CommandPaletteBase` | function | Standalone CommandPalette — a search-driven command list with keyboard navigation. No manifest context required. |
| `CommandPaletteBaseGroup` | interface | No JSDoc description. |
| `CommandPaletteBaseItem` | interface | No JSDoc description. |
| `CommandPaletteBaseProps` | interface | No JSDoc description. |
| `CommandPaletteConfig` | typealias | Inferred config type for the CommandPalette component. |
| `commandPaletteConfigSchema` | variable | Zod config schema for the CommandPalette component. A keyboard-driven overlay that groups commands, supports search with remote endpoints, tracks recent items, and dispatches actions on selection. |
| `ConfirmDialogBase` | function | Standalone ConfirmDialog — a confirmation dialog built on ModalBase with plain React props. No manifest context required. |
| `ConfirmDialogBaseProps` | interface | No JSDoc description. |
| `ConfirmDialogComponent` | function | Manifest-driven confirmation dialog adapter.  Resolves primitive values and actions from manifest config, then delegates all rendering to `ConfirmDialogBase`. |
| `ConfirmDialogConfig` | typealias | Input config type for the ConfirmDialog component. |
| `confirmDialogConfigSchema` | variable | Overlay alias schema for manifest-driven confirmation dialogs. |
| `ContextMenu` | function | Manifest-driven context menu adapter.  Resolves primitive values and actions from manifest config, handles visibility and state publishing, then delegates all rendering to `ContextMenuBase`. |
| `ContextMenuBase` | function | Standalone ContextMenu — a right-click context menu with plain React props. No manifest context required. |
| `ContextMenuBaseEntry` | typealias | No JSDoc description. |
| `ContextMenuBaseItem` | interface | No JSDoc description. |
| `ContextMenuBaseProps` | interface | No JSDoc description. |
| `ContextMenuConfig` | typealias | Inferred config type for the ContextMenu component. |
| `contextMenuConfigSchema` | variable | Zod schema for the ContextMenu component.  Defines a right-click menu with styleable trigger, panel, item, label, and separator surfaces. Visibility can be driven by a boolean or a binding reference. |
| `DrawerBase` | function | Standalone Drawer — a sliding panel overlay with plain React props. No manifest context required. |
| `DrawerBaseFooterAction` | interface | No JSDoc description. |
| `DrawerBaseProps` | interface | No JSDoc description. |
| `DrawerComponent` | function | No JSDoc description. |
| `DrawerConfig` | typealias | Inferred type for drawer config. |
| `drawerConfigSchema` | variable | Zod schema for drawer component config. Drawers are slide-in panels from the left or right edge of the screen. Like modals, they are opened/closed via the modal manager. |
| `DropdownMenuBase` | function | Standalone DropdownMenu — a button-triggered floating menu with plain React props. No manifest context required. |
| `DropdownMenuBaseEntry` | typealias | No JSDoc description. |
| `DropdownMenuBaseItem` | interface | No JSDoc description. |
| `DropdownMenuBaseProps` | interface | No JSDoc description. |
| `DropdownMenuBaseTrigger` | interface | No JSDoc description. |
| `HoverCardBase` | function | Standalone HoverCard — a floating panel that appears on hover with plain React props. No manifest context required. |
| `HoverCardBaseProps` | interface | No JSDoc description. |
| `ModalBase` | function | Standalone Modal — a centered overlay dialog with plain React props. No manifest context required. |
| `ModalBaseFooterAction` | interface | No JSDoc description. |
| `ModalBaseProps` | interface | No JSDoc description. |
| `ModalComponent` | function | No JSDoc description. |
| `ModalConfig` | typealias | Inferred type for modal config. |
| `modalConfigSchema` | variable | Zod schema for modal component config. Modals are overlay dialogs that display child components. They are opened/closed via the modal manager (open-modal/close-modal actions). |
| `Popover` | function | Manifest adapter — resolves config refs, publishes state, renders manifest children, delegates layout to PopoverBase. |
| `PopoverBase` | function | Standalone Popover — a button-triggered floating panel with plain React props. No manifest context required. |
| `PopoverBaseProps` | interface | No JSDoc description. |
| `PopoverConfig` | typealias | Inferred config type for the Popover component. |
| `popoverConfigSchema` | variable | Zod schema for the Popover component.  Defines a trigger-driven floating panel with optional title, description, footer content, width, placement, and canonical slot-based styling for the trigger and panel sub-surfaces. |

### Details

#### `CommandPalette({ config }: { config: { type: "command-palette"; data?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lower...`

CommandPalette — search-driven command palette that renders static groups or fetches remote results, then dispatches manifest actions for the selected command.

---

#### `CommandPaletteBase({ id, open, onClose, onSelect, groups, placeholder, emptyMessage, maxHeight, query: controlledQuery, onQueryChange, shortcutHint, className, style, slots, }: CommandPaletteBaseProps) => Element | nul...`

Standalone CommandPalette — a search-driven command list with keyboard
navigation. No manifest context required.

**Example:**

```tsx
<CommandPaletteBase
  open={isOpen}
  onClose={() => setIsOpen(false)}
  groups={[{ label: "Actions", items: [{ label: "Search..." }] }]}
  onSelect={(item) => console.log(item.label)}
/>
```

---

#### `ConfirmDialogBase({ id, title, description, confirmLabel, cancelLabel, confirmVariant, cancelVariant, open, onClose, onConfirm, onCancel, size, className, style, slots, }: ConfirmDialogBaseProps) => Element`

Standalone ConfirmDialog — a confirmation dialog built on ModalBase with
plain React props. No manifest context required.

**Example:**

```tsx
<ConfirmDialogBase
  open={showConfirm}
  onClose={() => setShowConfirm(false)}
  title="Delete Item?"
  description="This action cannot be undone."
  onConfirm={() => deleteItem()}
/>
```

---

#### `ConfirmDialogComponent({ config, }: { config: { type: "confirm-dialog"; description?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" |...`

Manifest-driven confirmation dialog adapter.

Resolves primitive values and actions from manifest config, then delegates
all rendering to `ConfirmDialogBase`.

---

#### `ContextMenu({ config }: { config: Record<string, any>; }) => Element | null`

Manifest-driven context menu adapter.

Resolves primitive values and actions from manifest config, handles
visibility and state publishing, then delegates all rendering to
`ContextMenuBase`.

---

#### `ContextMenuBase({ id, items, onSelect, onOpenChange, children, className, style, slots, }: ContextMenuBaseProps) => Element`

Standalone ContextMenu — a right-click context menu with plain React props.
No manifest context required.

**Example:**

```tsx
<ContextMenuBase
  items={[
    { label: "Copy", icon: "copy" },
    { type: "separator" },
    { label: "Delete", destructive: true },
  ]}
  onSelect={(item) => handleAction(item.label)}
>
  <div>Right-click me</div>
</ContextMenuBase>
```

---

#### `DrawerBase({ id, title, side, size, open, onClose, trapFocus, initialFocus, returnFocus, footer, footerAlign, onOpen, className, style, slots, children, }: DrawerBaseProps) => Element | null`

Standalone Drawer — a sliding panel overlay with plain React props.
No manifest context required.

**Example:**

```tsx
<DrawerBase
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Settings"
  side="right"
>
  <p>Drawer content here</p>
</DrawerBase>
```

---

#### `DrawerComponent({ config }: { config: { type: "drawer"; content: Record<string, unknown>[]; title?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "def...`

---

#### `DropdownMenuBase({ id, trigger, items, onSelect, align, side, className, style, slots, }: DropdownMenuBaseProps) => Element`

Standalone DropdownMenu — a button-triggered floating menu with plain React props.
No manifest context required.

**Example:**

```tsx
<DropdownMenuBase
  trigger={{ label: "Options", icon: "more-vertical" }}
  items={[
    { label: "Edit", icon: "edit" },
    { type: "separator" },
    { label: "Delete", destructive: true },
  ]}
  onSelect={(item) => handleAction(item.label)}
/>
```

---

#### `HoverCardBase({ id, trigger, children, openDelay, closeDelay, side, align, width, className, style, slots, }: HoverCardBaseProps) => Element`

Standalone HoverCard — a floating panel that appears on hover with plain
React props. No manifest context required.

**Example:**

```tsx
<HoverCardBase
  trigger={<span>Hover me</span>}
  width="300px"
>
  <p>Card content</p>
</HoverCardBase>
```

---

#### `ModalBase({ id, title, size, open, onClose, trapFocus, initialFocus, returnFocus, footer, footerAlign, onOpen, className, style, slots, children, }: ModalBaseProps) => Element | null`

Standalone Modal — a centered overlay dialog with plain React props.
No manifest context required.

**Example:**

```tsx
<ModalBase
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Profile"
  footer={[
    { label: "Cancel", variant: "secondary", onClick: () => setIsOpen(false) },
    { label: "Save", onClick: handleSave },
  ]}
>
  <form>...</form>
</ModalBase>
```

---

#### `ModalComponent({ config }: { config: { type: "modal"; content: Record<string, unknown>[]; title?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "defa...`

---

#### `Popover({ config }: { config: { type: "popover"; trigger: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase" ...`

Manifest adapter — resolves config refs, publishes state, renders manifest
children, delegates layout to PopoverBase.

---

#### `PopoverBase({ id, triggerLabel, triggerIcon, triggerVariant, title, description, placement, width, onOpenChange, footer, className, style, slots, children, }: PopoverBaseProps) => Element`

Standalone Popover — a button-triggered floating panel with plain React props.
No manifest context required.

**Example:**

```tsx
<PopoverBase
  triggerLabel="Open"
  title="Settings"
  description="Configure your preferences"
>
  <form>...</form>
</PopoverBase>
```

---

## Components — Navigation

| Export | Kind | Description |
|---|---|---|
| `AccordionBase` | function | Standalone Accordion — an expandable/collapsible panel list with plain React children. No manifest context required. |
| `AccordionBaseItem` | interface | No JSDoc description. |
| `AccordionBaseProps` | interface | No JSDoc description. |
| `BreadcrumbBase` | function | Standalone Breadcrumb — a navigation trail rendered with plain React props. No manifest context required. |
| `BreadcrumbBaseItem` | interface | No JSDoc description. |
| `BreadcrumbBaseProps` | interface | No JSDoc description. |
| `PrefetchLink` | function | Manifest adapter — wires the SSR prefetch route hook into PrefetchLinkBase. |
| `PrefetchLinkBase` | function | Standalone PrefetchLink — a plain `<a>` anchor that fires a prefetch callback based on the configured strategy. No manifest or SSR context required. |
| `PrefetchLinkBaseProps` | interface | No JSDoc description. |
| `PrefetchLinkConfig` | typealias | The output type of `prefetchLinkSchema` — all fields fully resolved with defaults applied. This is the type received by the component implementation. |
| `prefetchLinkSchema` | variable | Zod schema for `<PrefetchLink>` config.  `<PrefetchLink>` is a prefetch primitive that renders a plain `<a>` tag and automatically injects `<link rel="prefetch">` tags for the route's JS chunks and CSS files when the user hovers over the link or when it enters the viewport.  It is not a router-aware component — consumers wire their own router. This avoids a peer dependency on TanStack Router. |
| `StepperBase` | function | Standalone Stepper — a multi-step progress indicator with plain React props. No manifest context required. |
| `StepperBaseProps` | interface | No JSDoc description. |
| `StepperBaseStep` | interface | No JSDoc description. |
| `TabConfig` | typealias | Inferred type for a single tab config. |
| `tabConfigSchema` | variable | Schema for a single tab within the tabs component. |
| `TabsBase` | function | Standalone Tabs — tabbed navigation with plain React props. No manifest context required. |
| `TabsBaseProps` | interface | No JSDoc description. |
| `TabsBaseTab` | interface | No JSDoc description. |
| `TabsComponent` | function | Manifest adapter — resolves config refs via useTabs hook, renders manifest children in tab panels, delegates layout to TabsBase. |
| `TabsConfig` | typealias | Inferred type for tabs config. |
| `tabsConfigSchema` | variable | Zod schema for tabs component config. Tabs provide in-page navigation between content panels. Each tab's content is rendered via ComponentRenderer. |
| `TreeViewBase` | function | Standalone TreeView — a hierarchical tree with expand/collapse and selection. No manifest context required. |
| `TreeViewBaseItem` | interface | No JSDoc description. |
| `TreeViewBaseProps` | interface | No JSDoc description. |

### Details

#### `AccordionBase({ id, items, mode, variant, iconPosition, defaultOpen, className, style, slots, }: AccordionBaseProps) => Element`

Standalone Accordion — an expandable/collapsible panel list with plain React
children. No manifest context required.

**Example:**

```tsx
<AccordionBase
  items={[
    { title: "Section 1", content: <p>Content 1</p> },
    { title: "Section 2", content: <p>Content 2</p> },
  ]}
/>
```

---

#### `BreadcrumbBase({ id, items, separator: separatorProp, maxItems, onNavigate, className, style, slots, }: BreadcrumbBaseProps) => Element`

Standalone Breadcrumb — a navigation trail rendered with plain React props.
No manifest context required.

**Example:**

```tsx
<BreadcrumbBase
  items={[
    { label: "Home", path: "/" },
    { label: "Settings", path: "/settings" },
    { label: "Profile" },
  ]}
/>
```

---

#### `PrefetchLink(config: { to: string; target?: string | undefined; color?: string | undefined; position?: "fixed" | "relative" | "absolute" | "sticky" | undefined; background?: string | { image?: string | undefined;...`

Manifest adapter — wires the SSR prefetch route hook into PrefetchLinkBase.

---

#### `PrefetchLinkBase({ id, to, prefetch, children, target, rel, onPrefetch, className, style, slots, }: PrefetchLinkBaseProps) => Element`

Standalone PrefetchLink — a plain `<a>` anchor that fires a prefetch callback
based on the configured strategy. No manifest or SSR context required.

**Example:**

```tsx
<PrefetchLinkBase
  to="/dashboard"
  onPrefetch={(to) => router.prefetch(to)}
>
  Dashboard
</PrefetchLinkBase>
```

---

#### `StepperBase({ id, steps, activeStep: controlledStep, orientation, variant, clickable, onStepChange, className, style, slots, }: StepperBaseProps) => Element`

Standalone Stepper — a multi-step progress indicator with plain React props.
No manifest context required.

**Example:**

```tsx
<StepperBase
  steps={[
    { title: "Account", content: <AccountForm /> },
    { title: "Profile", content: <ProfileForm /> },
    { title: "Review", content: <ReviewPanel /> },
  ]}
  activeStep={1}
/>
```

---

#### `TabsBase({ id, tabs, defaultTab, variant, onTabChange, className, style, slots, }: TabsBaseProps) => Element`

Standalone Tabs — tabbed navigation with plain React props.
No manifest context required.

**Example:**

```tsx
<TabsBase
  tabs={[
    { label: "Overview", content: <OverviewPanel /> },
    { label: "Details", content: <DetailsPanel /> },
  ]}
/>
```

---

#### `TabsComponent({ config }: { config: { type: "tabs"; children: { label: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowe...`

Manifest adapter — resolves config refs via useTabs hook, renders manifest
children in tab panels, delegates layout to TabsBase.

---

#### `TreeViewBase({ id, items, selectable, multiSelect, showIcon, showConnectors, onSelect: onSelectProp, emptyMessage, isLoading, error, onRetry, className, style, slots, }: TreeViewBaseProps) => Element`

Standalone TreeView — a hierarchical tree with expand/collapse and selection.
No manifest context required.

**Example:**

```tsx
<TreeViewBase
  items={[
    { label: "src", children: [
      { label: "index.ts", icon: "file" },
      { label: "utils.ts", icon: "file" },
    ]},
  ]}
  onSelect={(value) => console.log(value)}
/>
```

---

## Components — Layout

| Export | Kind | Description |
|---|---|---|
| `BoxBase` | function | Standalone Box -- a generic container element with configurable HTML tag. No manifest context required. |
| `BoxBaseProps` | interface | No JSDoc description. |
| `Card` | function | Manifest adapter — resolves config refs, renders manifest children, delegates layout to CardBase. |
| `CardBase` | function | Standalone Card — a styled container with optional title/subtitle and standard React children. No manifest context required. |
| `CardBaseProps` | interface | No JSDoc description. |
| `CollapsibleBase` | function | Standalone Collapsible -- an animated expand/collapse container with an optional trigger. No manifest context required. |
| `CollapsibleBaseProps` | interface | No JSDoc description. |
| `Column` | function | No JSDoc description. |
| `ColumnBase` | function | Standalone Column -- a vertical flex container. No manifest context required. |
| `ColumnBaseProps` | interface | No JSDoc description. |
| `ContainerBase` | function | Standalone Container -- a centered, max-width-constrained wrapper. No manifest context required. |
| `ContainerBaseProps` | interface | No JSDoc description. |
| `GridBase` | function | Standalone Grid -- a CSS grid container. No manifest context required. |
| `GridBaseProps` | interface | No JSDoc description. |
| `Layout` | function | Manifest adapter — resolves registered custom layouts, then delegates to LayoutBase for built-in variants. |
| `LayoutBase` | function | Standalone Layout -- a layout shell component that wraps page content. Renders one of six layout variants without manifest context. |
| `LayoutBaseProps` | interface | No JSDoc description. |
| `LayoutBaseSlots` | typealias | Named slot content map for slot-aware layouts. |
| `LayoutBaseVariant` | typealias | No JSDoc description. |
| `LayoutColumnConfig` | typealias | Inferred config type for the Column layout component. |
| `layoutColumnConfigSchema` | variable | Zod config schema for the Column layout component. Defines a vertical flex container with responsive gap, alignment, justify, overflow, and max-height options. |
| `LayoutConfig` | typealias | Inferred layout config type from the Zod schema. |
| `layoutConfigSchema` | variable | Zod schema for layout component configuration. Defines the layout shell that wraps page content. |
| `LayoutProps` | interface | Props for the Layout component. |
| `LayoutVariant` | typealias | Layout variant type extracted from the schema. |
| `Nav` | function | Grouped navigation component for manifest app shells.  Renders either `navigation.items` or a composable nav template, resolves translated labels at render time, applies canonical slot/state styling, and optionally renders logo and user-menu surfaces. |
| `NavBase` | function | Standalone Nav -- a navigation component with items, logo, and collapse support. No manifest context required. |
| `NavBaseItem` | interface | No JSDoc description. |
| `NavBaseLogo` | interface | No JSDoc description. |
| `NavBaseProps` | interface | No JSDoc description. |
| `NavBaseUser` | interface | No JSDoc description. |
| `NavConfig` | typealias | Runtime config type for the Nav component. |
| `navConfigSchema` | variable | Zod schema for the grouped Nav component.  Supports either `items`-driven navigation or template composition, optional logo and user menu configuration, collapsible sidebar behavior, and canonical slot-based surface styling. |
| `NavDropdownBase` | function | Standalone NavDropdown -- a navigation dropdown with floating panel. No manifest context required. |
| `NavDropdownBaseProps` | interface | No JSDoc description. |
| `NavItemConfig` | typealias | Runtime config type for a grouped nav item, including optional child items and per-item slots. |
| `NavLinkBase` | function | Standalone NavLink -- a navigation link with optional icon and badge. No manifest context required. |
| `NavLinkBaseProps` | interface | No JSDoc description. |
| `NavLogoBase` | function | Standalone NavLogo -- a clickable brand logo/text element for navigation headers. No manifest context required. |
| `NavLogoBaseProps` | interface | No JSDoc description. |
| `NavSearchBase` | function | Standalone NavSearch -- a search input with optional keyboard shortcut display. No manifest context required. |
| `NavSearchBaseProps` | interface | No JSDoc description. |
| `NavSectionBase` | function | Standalone NavSection -- a labeled, optionally collapsible group within navigation. No manifest context required. |
| `NavSectionBaseProps` | interface | No JSDoc description. |
| `NavUserMenuBase` | function | Standalone NavUserMenu -- a user menu dropdown with avatar trigger. No manifest context required. |
| `NavUserMenuBaseItem` | interface | No JSDoc description. |
| `NavUserMenuBaseProps` | interface | No JSDoc description. |
| `Outlet` | function | Layout outlet primitive used to render nested child routes from the compiled manifest route tree. |
| `ResolvedNavItem` | interface | A nav item enriched with computed state: active detection, visibility based on role, and resolved badge value. |
| `RowBase` | function | Standalone Row -- a horizontal flex container. No manifest context required. |
| `RowBaseProps` | interface | No JSDoc description. |
| `SectionBase` | function | Standalone Section -- a full-width vertical section with optional height and alignment. No manifest context required. |
| `SectionBaseProps` | interface | No JSDoc description. |
| `SpacerBase` | function | Standalone Spacer -- an empty element that takes up space along an axis. No manifest context required. |
| `SpacerBaseProps` | interface | No JSDoc description. |
| `SplitPaneBase` | function | Standalone SplitPane -- a resizable two-pane layout with a draggable divider. No manifest context required. |
| `SplitPaneBaseProps` | interface | No JSDoc description. |
| `useNav` | function | Headless hook for nav component logic. Resolves nav items with active state, role-based visibility, badge resolution from FromRefs, and collapse toggle. |
| `UseNavResult` | interface | Return type of the useNav headless hook. |

### Details

#### `BoxBase({ id, as, className, style, slots, children, }: BoxBaseProps) => Element`

Standalone Box -- a generic container element with configurable HTML tag.
No manifest context required.

**Example:**

```tsx
<BoxBase as="section">
  <p>Content here</p>
</BoxBase>
```

---

#### `Card({ config }: { config: { type: "card"; title?: string | { from: string; transform?: "string" | "number" | "boolean" | "length" | "join" | "keys" | "values" | "default" | "uppercase" | "lowercase" | .....`

Manifest adapter — resolves config refs, renders manifest children,
delegates layout to CardBase.

---

#### `CardBase({ id, title, subtitle, gap: gapProp, background, staggerDelay, className, style, slots, children, }: CardBaseProps) => Element`

Standalone Card — a styled container with optional title/subtitle and
standard React children. No manifest context required.

**Example:**

```tsx
<CardBase title="User Profile" subtitle="Account details" gap="lg">
  <p>Name: Jane Doe</p>
  <p>Email: jane@example.com</p>
</CardBase>
```

---

#### `CollapsibleBase({ id, open: controlledOpen, defaultOpen, duration: durationProp, onOpenChange, className, style, slots, trigger, children, }: CollapsibleBaseProps) => Element`

Standalone Collapsible -- an animated expand/collapse container with an optional trigger.
No manifest context required.

**Example:**

```tsx
<CollapsibleBase
  trigger={<button>Toggle</button>}
  defaultOpen={false}
  duration="fast"
>
  <p>Collapsible content here</p>
</CollapsibleBase>
```

---

#### `Column({ config }: { config: { type: "column"; children: any[]; color?: string | undefined; position?: "fixed" | "relative" | "absolute" | "sticky" | undefined; background?: string | { image?: string | unde...`

---

#### `ColumnBase({ id, gap: gapProp, align, justify, overflow, maxHeight, className, style, slots, children, }: ColumnBaseProps) => Element`

Standalone Column -- a vertical flex container.
No manifest context required.

**Example:**

```tsx
<ColumnBase gap="md" align="center">
  <p>Item 1</p>
  <p>Item 2</p>
</ColumnBase>
```

---

#### `ContainerBase({ id, maxWidth, padding, center, className, style, slots, children, }: ContainerBaseProps) => Element`

Standalone Container -- a centered, max-width-constrained wrapper.
No manifest context required.

**Example:**

```tsx
<ContainerBase maxWidth="xl" padding="md">
  <p>Centered content</p>
</ContainerBase>
```

---

#### `GridBase({ id, areas, columns, rows, gap: gapProp, className, style, slots, children, }: GridBaseProps) => Element`

Standalone Grid -- a CSS grid container.
No manifest context required.

**Example:**

```tsx
<GridBase columns={3} gap="md">
  <div>Cell 1</div>
  <div>Cell 2</div>
  <div>Cell 3</div>
</GridBase>
```

---

#### `Layout({ config, nav, slots, children }: LayoutProps) => Element`

Manifest adapter — resolves registered custom layouts, then delegates
to LayoutBase for built-in variants.

---

#### `LayoutBase({ variant, className, style, nav, layoutSlots, children, }: LayoutBaseProps) => Element`

Standalone Layout -- a layout shell component that wraps page content.
Renders one of six layout variants without manifest context.

**Example:**

```tsx
<LayoutBase variant="sidebar" nav={<MyNav />}>
  <p>Page content</p>
</LayoutBase>
```

---

#### `Nav({ config, pathname, onNavigate, variant, }: NavComponentProps) => Element`

Grouped navigation component for manifest app shells.

Renders either `navigation.items` or a composable nav template, resolves translated labels at
render time, applies canonical slot/state styling, and optionally renders logo and user-menu
surfaces.

---

#### `NavBase({ id, variant, items, logo, collapsible, pathname, onNavigate, className, style, slots, children, }: NavBaseProps) => Element`

Standalone Nav -- a navigation component with items, logo, and collapse support.
No manifest context required.

**Example:**

```tsx
<NavBase
  variant="sidebar"
  logo={{ text: "My App", path: "/" }}
  items={[
    { label: "Home", path: "/", icon: "home" },
    { label: "Settings", path: "/settings", icon: "settings" },
  ]}
  onNavigate={(path) => router.push(path)}
/>
```

---

#### `NavDropdownBase({ id, label, icon, current, disabled, align, trigger: triggerMode, width, className, style, slots, children, }: NavDropdownBaseProps) => Element`

Standalone NavDropdown -- a navigation dropdown with floating panel.
No manifest context required.

**Example:**

```tsx
<NavDropdownBase label="Products" icon="box">
  <NavLinkBase label="Widget A" path="/products/a" />
  <NavLinkBase label="Widget B" path="/products/b" />
</NavDropdownBase>
```

---

#### `NavLinkBase({ id, label, path, icon, badge, disabled, active, onNavigate, className, style, slots, }: NavLinkBaseProps) => Element`

Standalone NavLink -- a navigation link with optional icon and badge.
No manifest context required.

**Example:**

```tsx
<NavLinkBase
  label="Dashboard"
  path="/dashboard"
  icon="home"
  active
  onNavigate={(path) => router.push(path)}
/>
```

---

#### `NavLogoBase({ id, text, src, path, logoHeight, onNavigate, className, style, slots, }: NavLogoBaseProps) => Element`

Standalone NavLogo -- a clickable brand logo/text element for navigation headers.
No manifest context required.

**Example:**

```tsx
<NavLogoBase
  text="My App"
  src="/logo.png"
  path="/"
  onNavigate={(path) => router.push(path)}
/>
```

---

#### `NavSearchBase({ id, placeholder, shortcut, onSearch, onValueChange, className, style, slots, }: NavSearchBaseProps) => Element`

Standalone NavSearch -- a search input with optional keyboard shortcut display.
No manifest context required.

**Example:**

```tsx
<NavSearchBase
  placeholder="Search..."
  shortcut="Ctrl+K"
  onSearch={(value) => console.log(value)}
/>
```

---

#### `NavSectionBase({ id, label, collapsible, defaultCollapsed, className, style, slots, children, }: NavSectionBaseProps) => Element`

Standalone NavSection -- a labeled, optionally collapsible group within navigation.
No manifest context required.

**Example:**

```tsx
<NavSectionBase label="Admin" collapsible>
  <NavLinkBase label="Users" path="/admin/users" />
  <NavLinkBase label="Settings" path="/admin/settings" />
</NavSectionBase>
```

---

#### `NavUserMenuBase({ id, mode, showAvatar, showName, showEmail, userName, userEmail, userAvatar, items, className, style, slots, }: NavUserMenuBaseProps) => Element`

Standalone NavUserMenu -- a user menu dropdown with avatar trigger.
No manifest context required.

**Example:**

```tsx
<NavUserMenuBase
  userName="Jane Doe"
  userEmail="jane@example.com"
  userAvatar="/avatar.png"
  mode="full"
  showEmail
  items={[
    { label: "Profile", icon: "user", onClick: () => router.push("/profile") },
    { label: "Sign out", icon: "log-out", onClick: () => signOut() },
  ]}
/>
```

---

#### `Outlet({ config }: { config: { type: "outlet"; color?: string | undefined; position?: "fixed" | "relative" | "absolute" | "sticky" | undefined; background?: string | { image?: string | undefined; position?:...`

Layout outlet primitive used to render nested child routes from the compiled
manifest route tree.

---

#### `RowBase({ id, gap: gapProp, align, justify, wrap, overflow, maxHeight, className, style, slots, children, }: RowBaseProps) => Element`

Standalone Row -- a horizontal flex container.
No manifest context required.

**Example:**

```tsx
<RowBase gap="md" align="center" justify="between">
  <span>Left</span>
  <span>Right</span>
</RowBase>
```

---

#### `SectionBase({ id, height, align, justify, bleed, className, style, slots, children, }: SectionBaseProps) => Element`

Standalone Section -- a full-width vertical section with optional height and alignment.
No manifest context required.

**Example:**

```tsx
<SectionBase height="screen" align="center" justify="center">
  <h1>Hero content</h1>
</SectionBase>
```

---

#### `SpacerBase({ id, size: sizeProp, axis, flex, className, style, slots, }: SpacerBaseProps) => Element`

Standalone Spacer -- an empty element that takes up space along an axis.
No manifest context required.

**Example:**

```tsx
<SpacerBase size="lg" />
<SpacerBase axis="horizontal" size="md" />
```

---

#### `SplitPaneBase({ id, direction, defaultSplit, minSize, className, style, slots, first, second, }: SplitPaneBaseProps) => Element`

Standalone SplitPane -- a resizable two-pane layout with a draggable divider.
No manifest context required.

**Example:**

```tsx
<SplitPaneBase
  direction="horizontal"
  defaultSplit={40}
  first={<div>Left pane</div>}
  second={<div>Right pane</div>}
/>
```

---

#### `useNav(config: Record<string, any>, pathname: string) => UseNavResult`

Headless hook for nav component logic.
Resolves nav items with active state, role-based visibility,
badge resolution from FromRefs, and collapse toggle.

**Parameters:**

| Name | Description |
|------|-------------|
| `config` | Nav component configuration from the manifest |
| `pathname` | Current URL pathname for active route detection |

**Returns:** Resolved nav items, active item, collapse state, and user info

**Example:**

```tsx
const nav = useNav(navConfig, window.location.pathname);

return (
  <aside>
    <button onClick={nav.toggleCollapse}>
      {nav.isCollapsed ? "Expand" : "Collapse"}
    </button>
    <ul>
      {nav.items.map((item) => (
        <li key={item.id} aria-current={item.isActive ? "page" : undefined}>
          <a href={item.href}>{item.label}</a>
        </li>
      ))}
    </ul>
  </aside>
);
```

---

## Components — Media

| Export | Kind | Description |
|---|---|---|
| `CarouselBase` | function | Standalone CarouselBase — renders a slide carousel with auto-play, arrow navigation, and dot indicators. Pauses on hover. No manifest context required. |
| `CarouselBaseProps` | interface | No JSDoc description. |
| `EmbedBase` | function | Standalone Embed — a responsive iframe container for embedding external content. No manifest context required. |
| `EmbedBaseProps` | interface | No JSDoc description. |
| `SnapshotImage` | function | Manifest adapter — extracts config props and delegates to SnapshotImageBase. |
| `SnapshotImageBase` | function | Standalone SnapshotImage — an optimized image component with placeholder support. No manifest context required. |
| `SnapshotImageBaseProps` | interface | No JSDoc description. |
| `SnapshotImageConfig` | typealias | Inferred config type from the SnapshotImage Zod schema. This is the single source of truth for what props the `<SnapshotImage>` component accepts. Never define this type manually. |
| `snapshotImageSchema` | variable | Schema for optimized image components rendered through Snapshot's image route. |
| `VideoBase` | function | Standalone Video — a styled video element that works with plain React props. No manifest context required. |
| `VideoBaseProps` | interface | No JSDoc description. |

### Details

#### `CarouselBase({ id, children, autoPlay, interval: intervalMs, showArrows, showDots, className, style, slots, }: CarouselBaseProps) => Element | null`

Standalone CarouselBase — renders a slide carousel with auto-play, arrow navigation,
and dot indicators. Pauses on hover. No manifest context required.

**Example:**

```tsx
<CarouselBase autoPlay interval={3000} showArrows showDots>
  <img src="/slide1.jpg" alt="Slide 1" />
  <img src="/slide2.jpg" alt="Slide 2" />
  <img src="/slide3.jpg" alt="Slide 3" />
</CarouselBase>
```

---

#### `EmbedBase({ id, url, aspectRatio, title, className, style, slots, }: EmbedBaseProps) => Element`

Standalone Embed — a responsive iframe container for embedding external
content. No manifest context required.

**Example:**

```tsx
<EmbedBase url="https://www.youtube.com/embed/xyz" aspectRatio="16/9" title="Demo Video" />
```

---

#### `SnapshotImage({ config }: { config: { type: "image"; placeholder: "skeleton" | "empty" | "blur"; width: number; src: string; format: "avif" | "webp" | "jpeg" | "png" | "original"; quality: number; priority: boolea...`

Manifest adapter — extracts config props and delegates to SnapshotImageBase.

---

#### `SnapshotImageBase({ id, src, alt, width, height, quality, format, sizes, priority, placeholder, loading: loadingProp, aspectRatio, className, style, slots, }: SnapshotImageBaseProps) => Element`

Standalone SnapshotImage — an optimized image component with placeholder
support. No manifest context required.

**Example:**

```tsx
<SnapshotImageBase src="/photo.jpg" alt="Photo" width={800} height={600} placeholder="blur" />
```

---

#### `VideoBase({ id, src, poster, controls, autoPlay, loop, muted, className, style, slots, }: VideoBaseProps) => Element`

Standalone Video — a styled video element that works with plain React props.
No manifest context required.

**Example:**

```tsx
<VideoBase src="/video.mp4" poster="/thumb.jpg" controls />
```

---

## Components — Primitives

| Export | Kind | Description |
|---|---|---|
| `DividerBase` | function | Standalone Divider — renders a horizontal or vertical separator line, optionally with a centered label. No manifest context required. |
| `DividerBaseProps` | interface | No JSDoc description. |
| `FloatingMenuBase` | function | Standalone FloatingMenu — a dropdown menu with trigger, keyboard navigation, and pre-resolved items. No manifest context required. |
| `FloatingMenuBaseItem` | interface | No JSDoc description. |
| `FloatingMenuBaseLabel` | interface | No JSDoc description. |
| `FloatingMenuBaseProps` | interface | No JSDoc description. |
| `FloatingMenuBaseSeparator` | interface | No JSDoc description. |
| `LinkBase` | function | Standalone Link — renders a styled anchor element with optional icon and badge. No manifest context required. |
| `LinkBaseProps` | interface | No JSDoc description. |
| `OAuthButtonsBase` | function | Standalone OAuthButtons — renders OAuth provider buttons with optional heading and auto-redirect support. No manifest context required. |
| `OAuthButtonsBaseProps` | interface | No JSDoc description. |
| `OAuthProvider` | interface | No JSDoc description. |
| `PasskeyButtonBase` | function | Standalone PasskeyButton — renders a passkey authentication button. No manifest context required. |
| `PasskeyButtonBaseProps` | interface | No JSDoc description. |
| `StackBase` | function | Standalone Stack — a flex-column layout container with token-based spacing. No manifest context required. |
| `StackBaseProps` | interface | No JSDoc description. |
| `TextBase` | function | Standalone Text — renders a styled paragraph element with token-based typography. No manifest context required. |
| `TextBaseProps` | interface | No JSDoc description. |

### Details

#### `DividerBase({ label, orientation, id, className, style, slots, }: DividerBaseProps) => Element`

Standalone Divider — renders a horizontal or vertical separator line,
optionally with a centered label. No manifest context required.

**Example:**

```tsx
<DividerBase orientation="horizontal" label="OR" />
```

---

#### `FloatingMenuBase({ triggerLabel, triggerIcon, items, open: controlledOpen, align, side, id, className, style, slots, }: FloatingMenuBaseProps) => Element`

Standalone FloatingMenu — a dropdown menu with trigger, keyboard navigation,
and pre-resolved items. No manifest context required.

**Example:**

```tsx
<FloatingMenuBase
  triggerLabel="Actions"
  items={[
    { type: "item", label: "Edit", onAction: () => {} },
    { type: "separator" },
    { type: "item", label: "Delete", destructive: true, onAction: () => {} },
  ]}
/>
```

---

#### `LinkBase({ text, to, icon, badge, external, disabled, current, align, variant, onNavigate, id, className, style, slots, }: LinkBaseProps) => Element`

Standalone Link — renders a styled anchor element with optional icon and
badge. No manifest context required.

**Example:**

```tsx
<LinkBase text="Documentation" to="/docs" icon="book" variant="default" />
```

---

#### `OAuthButtonsBase({ heading, providers, providerMode, onProviderClick, id, className, style, slots, }: OAuthButtonsBaseProps) => Element | null`

Standalone OAuthButtons — renders OAuth provider buttons with optional
heading and auto-redirect support. No manifest context required.

**Example:**

```tsx
<OAuthButtonsBase
  heading="Sign in with"
  providers={[
    { name: "google", label: "Continue with Google", url: "/auth/google" },
    { name: "github", label: "Continue with GitHub", url: "/auth/github" },
  ]}
/>
```

---

#### `PasskeyButtonBase({ label, loadingLabel, loading, visible, autoPrompt, onClick, id, className, style, slots, }: PasskeyButtonBaseProps) => Element | null`

Standalone PasskeyButton — renders a passkey authentication button.
No manifest context required.

**Example:**

```tsx
<PasskeyButtonBase label="Sign in with passkey" onClick={() => startPasskey()} />
```

---

#### `StackBase({ gap, align, justify, maxWidth, overflow, maxHeight, padding, staggerDelay, id, className, style, slots, children, }: StackBaseProps) => Element`

Standalone Stack — a flex-column layout container with token-based spacing.
No manifest context required.

**Example:**

```tsx
<StackBase gap="md" align="center" padding="lg">
  <p>First item</p>
  <p>Second item</p>
</StackBase>
```

---

#### `TextBase({ value, variant, size, weight, align, id, className, style, slots, }: TextBaseProps) => Element`

Standalone Text — renders a styled paragraph element with token-based
typography. No manifest context required.

**Example:**

```tsx
<TextBase value="Hello, world!" variant="muted" size="sm" />
```

---

## Component Utilities

| Export | Kind | Description |
|---|---|---|
| `ComponentDataResult` | interface | Result returned by `useComponentData`. Provides the fetched data, loading/error states, and a refetch function. |
| `ComponentGroupBase` | function | Standalone ComponentGroup — a simple wrapper for pre-rendered group content. No manifest context required. |
| `ComponentGroupBaseProps` | interface | No JSDoc description. |
| `useComponentData` | function | Shared data-fetching hook for config-driven components.  Parses a data config string like `"GET /api/stats/revenue"` into method + endpoint, resolves any `FromRef` values in params via `useSubscribe`, and fetches data using the app-scope API client.  When the API client is not available (e.g., in tests or before ManifestApp provides it), the hook returns a loading state without throwing. |

### Details

#### `ComponentGroupBase({ id, className, style, slots, children, }: ComponentGroupBaseProps) => Element`

Standalone ComponentGroup — a simple wrapper for pre-rendered group content.
No manifest context required.

**Example:**

```tsx
<ComponentGroupBase id="my-group">
  <MyComponentA />
  <MyComponentB />
</ComponentGroupBase>
```

---

#### `useComponentData(dataConfig: string | FromRef | { resource: string; params?: Record<string, unknown> | undefined; }, params?: Record<string, unknown> | undefined, options?: ComponentDataOptions | undefined) => Compon...`

Shared data-fetching hook for config-driven components.

Parses a data config string like `"GET /api/stats/revenue"` into method + endpoint,
resolves any `FromRef` values in params via `useSubscribe`, and fetches data
using the app-scope API client.

When the API client is not available (e.g., in tests or before ManifestApp provides it),
the hook returns a loading state without throwing.

**Parameters:**

| Name | Description |
|------|-------------|
| `dataConfig` | Endpoint string or FromRef. Example: `"GET /api/stats/revenue"` |
| `params` | Optional query parameters, may contain FromRef values |

**Returns:** Data, loading state, error, and refetch function

---

## Page Presets

| Export | Kind | Description |
|---|---|---|
| `ActivityFeedDef` | interface | Feed section definition for dashboard-style presets. |
| `AuthBrandingDef` | interface | Branding and background options for the auth page preset. |
| `authPage` | function | Build a manifest page config for a common auth screen. |
| `AuthPageOptions` | interface | Options for the `authPage` preset factory. |
| `authPresetConfigSchema` | variable | Validate preset config for auth screens such as login, register, and password recovery. |
| `ChartDef` | interface | Chart section definition for dashboard-style presets. |
| `ColumnDef` | interface | A single column definition for the CRUD page table. |
| `crudPage` | function | Builds a manifest `PageConfig` for a standard CRUD page.  Consumers drop the result into their manifest's `pages` record:  ```ts const manifest = {   pages: {     "/users": crudPage({       title: "Users",       listEndpoint: "GET /api/users",       createEndpoint: "POST /api/users",       deleteEndpoint: "DELETE /api/users/{id}",       columns: [         { key: "name", label: "Name" },         { key: "email", label: "Email" },         { key: "role", label: "Role", badge: true },       ],       createForm: {         fields: [           { key: "name", type: "text", label: "Name", required: true },           { key: "email", type: "email", label: "Email", required: true },         ],       },     }),   }, }; ``` |
| `CrudPageOptions` | interface | Options for the `crudPage` preset factory. Produces a full CRUD page with a data table, create/edit modals, and row actions. |
| `crudPresetConfigSchema` | variable | Validate preset config for a CRUD page assembled from list/form primitives. |
| `dashboardPage` | function | Builds a manifest `PageConfig` for a dashboard page.  Consumers drop the result into their manifest's `pages` record:  ```ts const manifest = {   pages: {     "/dashboard": dashboardPage({       title: "Overview",       stats: [         { label: "Total Users", endpoint: "GET /api/stats/users", valueKey: "count" },         { label: "Revenue", endpoint: "GET /api/stats/revenue", valueKey: "total", format: "currency" },         { label: "Orders", endpoint: "GET /api/stats/orders", valueKey: "total", format: "number" },         { label: "Conversion", endpoint: "GET /api/stats/conversion", valueKey: "rate", format: "percent" },       ],       recentActivity: "GET /api/activity",     }),   }, }; ``` |
| `DashboardPageOptions` | interface | Options for the `dashboardPage` preset factory. Produces a dashboard with stat cards and an optional activity feed. |
| `dashboardPresetConfigSchema` | variable | Validate preset config for a dashboard page with stats, charts, and activity sections. |
| `EmptyStateDef` | interface | Empty-state content shown by preset-generated pages. |
| `expandPreset` | function | Validate a named preset config and expand it into the equivalent page config. |
| `FilterDef` | interface | A filter definition for the CRUD page toolbar. |
| `FilterOption` | interface | A filter option entry. |
| `FormDef` | interface | A form definition used in CRUD create/update modals and settings tabs. |
| `FormFieldDef` | interface | A single form field definition. |
| `FormFieldOption` | interface | An option entry for select/radio form fields. |
| `PaginationDef` | interface | Pagination settings for preset-generated list surfaces. |
| `settingsPage` | function | Builds a manifest `PageConfig` for a settings page.  Consumers drop the result into their manifest's `pages` record:  ```ts const manifest = {   pages: {     "/settings": settingsPage({       title: "Settings",       sections: [         {           label: "Profile",           submitEndpoint: "PATCH /api/me/profile",           dataEndpoint: "GET /api/me/profile",           fields: [             { key: "name", type: "text", label: "Name", required: true },             { key: "bio", type: "textarea", label: "Bio" },           ],         },         {           label: "Password",           submitEndpoint: "POST /api/me/password",           fields: [             { key: "currentPassword", type: "password", label: "Current Password", required: true },             { key: "newPassword", type: "password", label: "New Password", required: true },           ],         },       ],     }),   }, }; ``` |
| `SettingsPageOptions` | interface | Options for the `settingsPage` preset factory. Produces a settings page with a tab per section, each containing an AutoForm. |
| `settingsPresetConfigSchema` | variable | Validate preset config for a settings page composed from one or more submitted sections. |
| `SettingsSectionDef` | interface | A single settings section (one tab in the settings page). |
| `StatDef` | interface | A single stat card definition for the dashboard page. |

### Details

#### `authPage(options: AuthPageOptions) => { content: any[]; title?: string | undefined; roles?: string[] | undefined; breadcrumb?: string | undefined; }`

Build a manifest page config for a common auth screen.

---

#### `crudPage(options: CrudPageOptions) => { content: any[]; title?: string | undefined; roles?: string[] | undefined; breadcrumb?: string | undefined; }`

Builds a manifest `PageConfig` for a standard CRUD page.

Consumers drop the result into their manifest's `pages` record:

```ts
const manifest = {
  pages: {
    "/users": crudPage({
      title: "Users",
      listEndpoint: "GET /api/users",
      createEndpoint: "POST /api/users",
      deleteEndpoint: "DELETE /api/users/{id}",
      columns: [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role", badge: true },
      ],
      createForm: {
        fields: [
          { key: "name", type: "text", label: "Name", required: true },
          { key: "email", type: "email", label: "Email", required: true },
        ],
      },
    }),
  },
};
```

**Parameters:**

| Name | Description |
|------|-------------|
| `options` | High-level CRUD page options |

**Returns:** A valid manifest `PageConfig`

---

#### `CrudPageOptions` *(interface)*

Options for the `crudPage` preset factory.

Produces a full CRUD page with a data table, create/edit modals, and row actions.

**Example:**

```ts
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

---

#### `dashboardPage(options: DashboardPageOptions) => { content: any[]; title?: string | undefined; roles?: string[] | undefined; breadcrumb?: string | undefined; }`

Builds a manifest `PageConfig` for a dashboard page.

Consumers drop the result into their manifest's `pages` record:

```ts
const manifest = {
  pages: {
    "/dashboard": dashboardPage({
      title: "Overview",
      stats: [
        { label: "Total Users", endpoint: "GET /api/stats/users", valueKey: "count" },
        { label: "Revenue", endpoint: "GET /api/stats/revenue", valueKey: "total", format: "currency" },
        { label: "Orders", endpoint: "GET /api/stats/orders", valueKey: "total", format: "number" },
        { label: "Conversion", endpoint: "GET /api/stats/conversion", valueKey: "rate", format: "percent" },
      ],
      recentActivity: "GET /api/activity",
    }),
  },
};
```

**Parameters:**

| Name | Description |
|------|-------------|
| `options` | High-level dashboard page options |

**Returns:** A valid manifest `PageConfig`

---

#### `DashboardPageOptions` *(interface)*

Options for the `dashboardPage` preset factory.

Produces a dashboard with stat cards and an optional activity feed.

**Example:**

```ts
const myDashboard = dashboardPage({
  title: "Overview",
  stats: [
    { label: "Total Users", endpoint: "GET /api/stats/users", valueKey: "count" },
    { label: "Revenue", endpoint: "GET /api/stats/revenue", valueKey: "total", format: "currency" },
  ],
});
```

---

#### `expandPreset(preset: string, presetConfig: unknown) => { content: any[]; title?: string | undefined; roles?: string[] | undefined; breadcrumb?: string | undefined; }`

Validate a named preset config and expand it into the equivalent page config.

---

#### `settingsPage(options: SettingsPageOptions) => { content: any[]; title?: string | undefined; roles?: string[] | undefined; breadcrumb?: string | undefined; }`

Builds a manifest `PageConfig` for a settings page.

Consumers drop the result into their manifest's `pages` record:

```ts
const manifest = {
  pages: {
    "/settings": settingsPage({
      title: "Settings",
      sections: [
        {
          label: "Profile",
          submitEndpoint: "PATCH /api/me/profile",
          dataEndpoint: "GET /api/me/profile",
          fields: [
            { key: "name", type: "text", label: "Name", required: true },
            { key: "bio", type: "textarea", label: "Bio" },
          ],
        },
        {
          label: "Password",
          submitEndpoint: "POST /api/me/password",
          fields: [
            { key: "currentPassword", type: "password", label: "Current Password", required: true },
            { key: "newPassword", type: "password", label: "New Password", required: true },
          ],
        },
      ],
    }),
  },
};
```

**Parameters:**

| Name | Description |
|------|-------------|
| `options` | High-level settings page options |

**Returns:** A valid manifest `PageConfig`

---

#### `SettingsPageOptions` *(interface)*

Options for the `settingsPage` preset factory.

Produces a settings page with a tab per section, each containing an AutoForm.

**Example:**

```ts
const mySettings = settingsPage({
  title: "Settings",
  sections: [
    {
      label: "Profile",
      submitEndpoint: "PATCH /api/me/profile",
      fields: [
        { key: "name", type: "text", label: "Name", required: true },
        { key: "email", type: "email", label: "Email", required: true },
      ],
    },
  ],
});
```

---

## Hooks & Utilities

| Export | Kind | Description |
|---|---|---|
| `Breakpoint` | typealias | All breakpoint names including `"default"` (below `sm`). |
| `getSortableStyle` | function | CSS transform helper for sortable items. Converts the dnd-kit transform into a CSS transform string. |
| `resolveResponsiveValue` | function | Resolve a responsive value for a given breakpoint. Cascades down: if the active breakpoint isn't defined, falls back to the next smaller breakpoint, then `default`. For flat (non-object) values, returns the value directly. |
| `UI_BREAKPOINTS` | variable | Breakpoint pixel thresholds (mobile-first, min-width). |
| `useAutoBreadcrumbs` | function | Resolve auto-generated breadcrumb items for the current route match. |
| `useBreakpoint` | function | Returns the currently active breakpoint based on window width. Uses `matchMedia` for efficient, event-driven updates (no resize polling). Returns `"default"` during SSR. |
| `useDndSensors` | function | Pre-configured sensor setup for pointer + keyboard DnD. Pointer requires 5px distance to activate (prevents click hijacking). Keyboard uses standard coordinates for arrow key navigation. |
| `useInfiniteScroll` | function | Observe a sentinel element and load the next page when it enters the viewport. |
| `UseInfiniteScrollOptions` | interface | Options for loading additional items when a sentinel approaches the viewport. |
| `usePoll` | function | Invoke a callback on an interval with optional document-visibility pausing. |
| `UsePollOptions` | interface | Options controlling interval-based polling from client components. |
| `useResponsiveValue` | function | Resolve a responsive value to the appropriate value for the current breakpoint. Accepts either a flat value (returned as-is) or a responsive map with breakpoint keys. Falls back to the next smaller defined breakpoint. |
| `useUrlSync` | function | Keep a slice of local state synchronized with URL query parameters. |
| `useVirtualList` | function | Compute the visible slice for a fixed-height virtualized list container. |

### Details

#### `getSortableStyle(transform: Transform | null, transition: string | undefined, isDragging: boolean) => CSSProperties`

CSS transform helper for sortable items.
Converts the dnd-kit transform into a CSS transform string.

---

#### `resolveResponsiveValue<T>(value: T | { default: T; sm?: T | undefined; md?: T | undefined; lg?: T | undefined; xl?: T | undefined; "2xl"?: T | undefined; }, breakpoint: Breakpoint) => T`

Resolve a responsive value for a given breakpoint.

Cascades down: if the active breakpoint isn't defined, falls back to the
next smaller breakpoint, then `default`. For flat (non-object) values,
returns the value directly.

**Parameters:**

| Name | Description |
|------|-------------|
| `value` | A flat value or a responsive breakpoint map |
| `breakpoint` | The active breakpoint to resolve for |

**Returns:** The resolved value for the given breakpoint

---

#### `useAutoBreadcrumbs(config?: BreadcrumbAutoConfig | undefined) => BreadcrumbItem[]`

Resolve auto-generated breadcrumb items for the current route match.

---

#### `useBreakpoint() => Breakpoint`

Returns the currently active breakpoint based on window width.

Uses `matchMedia` for efficient, event-driven updates (no resize polling).
Returns `"default"` during SSR.

---

#### `useDndSensors() => SensorDescriptor<SensorOptions>[]`

Pre-configured sensor setup for pointer + keyboard DnD.
Pointer requires 5px distance to activate (prevents click hijacking).
Keyboard uses standard coordinates for arrow key navigation.

---

#### `useInfiniteScroll({ hasNextPage, isLoading, loadNextPage, threshold, }: UseInfiniteScrollOptions) => RefObject<HTMLDivElement | null>`

Observe a sentinel element and load the next page when it enters the viewport.

---

#### `usePoll({ interval, pauseWhenHidden, onPoll, enabled, }: UsePollOptions) => void`

Invoke a callback on an interval with optional document-visibility pausing.

---

#### `useResponsiveValue<T>(value: T | { default: T; sm?: T | undefined; md?: T | undefined; lg?: T | undefined; xl?: T | undefined; "2xl"?: T | undefined; }) => T`

Resolve a responsive value to the appropriate value for the current breakpoint.

Accepts either a flat value (returned as-is) or a responsive map with
breakpoint keys. Falls back to the next smaller defined breakpoint.

**Parameters:**

| Name | Description |
|------|-------------|
| `value` | A flat value or responsive breakpoint map |

**Returns:** The resolved value for the current viewport width

---

#### `useUrlSync(options: UseUrlSyncOptions) => void`

Keep a slice of local state synchronized with URL query parameters.

---

#### `useVirtualList({ totalCount, itemHeight, overscan, }: UseVirtualListOptions) => UseVirtualListResult`

Compute the visible slice for a fixed-height virtualized list container.

---

## Icons

| Export | Kind | Description |
|---|---|---|
| `Icon` | function | Render a Snapshot icon from the built-in icon registry. |
| `ICON_PATHS` | variable | SVG inner content for Lucide icons. Each entry maps a kebab-case icon name to the SVG child elements (path, circle, line, rect, polyline, etc.) that belong inside a 24x24 `stroke="currentColor"` SVG container. Source: https://lucide.dev — MIT-licensed. |
| `IconProps` | interface | Props for the {@link Icon} component. |

### Details

#### `Icon({ name, size, color, className, label, }: IconProps) => Element`

Render a Snapshot icon from the built-in icon registry.

---

## Workflows

| Export | Kind | Description |
|---|---|---|
| `getRegisteredWorkflowAction` | function | Retrieve a registered runtime handler for a custom workflow action type. |
| `registerWorkflowAction` | function | Register a runtime handler for a custom workflow action type. |
| `runWorkflow` | function | Execute a workflow definition against the supplied runtime hooks and mutable context. |

### Details

#### `getRegisteredWorkflowAction(type: string) => WorkflowActionHandler | undefined`

Retrieve a registered runtime handler for a custom workflow action type.

**Parameters:**

| Name | Description |
|------|-------------|
| `type` | Custom workflow action type name |

**Returns:** The registered handler when available

---

#### `registerWorkflowAction(type: string, handler: WorkflowActionHandler) => void`

Register a runtime handler for a custom workflow action type.

**Parameters:**

| Name | Description |
|------|-------------|
| `type` | Custom workflow action type name |
| `handler` | Runtime handler invoked by the workflow engine |

---

#### `runWorkflow(definition: WorkflowDefinition, options: { workflows?: WorkflowMap | undefined; context?: Record<string, unknown> | undefined; resolveValue: (value: unknown, context: Record<...>) => unknown; execute...`

Execute a workflow definition against the supplied runtime hooks and mutable context.

---

## Other

| Export | Kind | Description |
|---|---|---|
| `ActionBase` | interface | No JSDoc description. |
| `ActionConfig` | typealias | No JSDoc description. |
| `ActionExecuteFn` | typealias | No JSDoc description. |
| `actionSchema` | variable | No JSDoc description. |
| `ApiAction` | interface | No JSDoc description. |
| `apiActionSchema` | variable | No JSDoc description. |
| `AssignWorkflowNode` | interface | No JSDoc description. |
| `AuditLogBase` | function | Standalone AuditLogBase — renders a filterable, paginated timeline of audit log entries with user avatars, relative timestamps, and expandable detail panels. No manifest context required. |
| `AuditLogBaseProps` | interface | No JSDoc description. |
| `AuditLogFilterEntry` | interface | No JSDoc description. |
| `buildRequestUrl` | function | No JSDoc description. |
| `CalendarBase` | function | Standalone CalendarBase — renders a month or week calendar grid with event pills, navigation controls, and optional week numbers. No manifest context required. |
| `CalendarBaseProps` | interface | No JSDoc description. |
| `CalendarEventEntry` | interface | No JSDoc description. |
| `CaptureWorkflowNode` | interface | No JSDoc description. |
| `CloseModalAction` | interface | No JSDoc description. |
| `closeModalActionSchema` | variable | No JSDoc description. |
| `ComponentTokens` | typealias | No JSDoc description. |
| `componentTokensSchema` | variable | No JSDoc description. |
| `ConfirmAction` | interface | No JSDoc description. |
| `confirmActionSchema` | variable | No JSDoc description. |
| `CopyAction` | interface | No JSDoc description. |
| `CopyToClipboardAction` | interface | No JSDoc description. |
| `copyToClipboardActionSchema` | variable | No JSDoc description. |
| `dataSourceSchema` | variable | No JSDoc description. |
| `DefaultErrorBase` | function | Standalone DefaultError — renders an error feedback card with optional retry button. No manifest context required. |
| `DefaultErrorBaseProps` | interface | No JSDoc description. |
| `DefaultLoadingBase` | function | Standalone DefaultLoading — renders a loading spinner with label. No manifest context required. |
| `DefaultLoadingBaseProps` | interface | No JSDoc description. |
| `DefaultNotFoundBase` | function | Standalone DefaultNotFound — renders a 404 page with title and description. No manifest context required. |
| `DefaultNotFoundBaseProps` | interface | No JSDoc description. |
| `DefaultOfflineBase` | function | Standalone DefaultOffline — renders an offline status banner. No manifest context required. |
| `DefaultOfflineBaseProps` | interface | No JSDoc description. |
| `DownloadAction` | interface | No JSDoc description. |
| `downloadActionSchema` | variable | No JSDoc description. |
| `endpointTargetSchema` | variable | No JSDoc description. |
| `ExprRef` | interface | No JSDoc description. |
| `Flavor` | interface | No JSDoc description. |
| `FontConfig` | typealias | No JSDoc description. |
| `fontSchema` | variable | No JSDoc description. |
| `FromRef` | interface | No JSDoc description. |
| `fromRefSchema` | variable | No JSDoc description. |
| `getRegisteredLayouts` | function | List the names of all currently registered manifest layouts. |
| `httpMethodSchema` | variable | No JSDoc description. |
| `IfWorkflowNode` | interface | No JSDoc description. |
| `isResourceRef` | function | No JSDoc description. |
| `KanbanBase` | function | Standalone KanbanBase — renders a multi-column board with cards, WIP limits, assignee avatars, priority indicators, and optional drag-and-drop reordering. No manifest context required. |
| `KanbanBaseProps` | interface | No JSDoc description. |
| `KanbanColumnEntry` | interface | No JSDoc description. |
| `LogAction` | interface | No JSDoc description. |
| `NavigateAction` | interface | No JSDoc description. |
| `navigateActionSchema` | variable | No JSDoc description. |
| `NotificationFeedBase` | function | Standalone NotificationFeedBase — renders a scrollable notification list with type icons, unread indicators, relative timestamps, and a mark-all-read action. No manifest context required. |
| `NotificationFeedBaseProps` | interface | No JSDoc description. |
| `OpenModalAction` | interface | No JSDoc description. |
| `openModalActionSchema` | variable | No JSDoc description. |
| `ParallelWorkflowNode` | interface | No JSDoc description. |
| `PricingFeatureEntry` | interface | No JSDoc description. |
| `PricingTableBase` | function | Standalone PricingTableBase — renders a responsive pricing comparison as either a card grid or a feature-comparison table with CTA buttons per tier. No manifest context required. |
| `PricingTableBaseProps` | interface | No JSDoc description. |
| `PricingTierEntry` | interface | No JSDoc description. |
| `RadiusScale` | typealias | No JSDoc description. |
| `radiusSchema` | variable | No JSDoc description. |
| `RefreshAction` | interface | No JSDoc description. |
| `refreshActionSchema` | variable | No JSDoc description. |
| `registerBuiltInComponents` | function | Register all built-in config-driven components with the manifest system.  The function is idempotent so boot code can call it safely without worrying about duplicate registrations. |
| `registerLayout` | function | Register a named layout component for manifest layout resolution. |
| `resetBuiltInComponentRegistration` | function | Reset the built-in component registration guard so tests can rebuild the registry. |
| `resolveLayout` | function | Resolve a previously registered layout by name. |
| `resourceConfigSchema` | variable | No JSDoc description. |
| `resourceRefSchema` | variable | No JSDoc description. |
| `Responsive` | typealias | No JSDoc description. |
| `RetryWorkflowNode` | interface | No JSDoc description. |
| `RunWorkflowAction` | interface | No JSDoc description. |
| `runWorkflowActionSchema` | variable | No JSDoc description. |
| `ScrollToAction` | interface | No JSDoc description. |
| `scrollToActionSchema` | variable | No JSDoc description. |
| `SetValueAction` | interface | No JSDoc description. |
| `setValueActionSchema` | variable | No JSDoc description. |
| `SpacingScale` | typealias | No JSDoc description. |
| `spacingSchema` | variable | No JSDoc description. |
| `StateScope` | typealias | No JSDoc description. |
| `stateValueConfigSchema` | variable | No JSDoc description. |
| `ThemeColors` | typealias | No JSDoc description. |
| `themeColorsSchema` | variable | No JSDoc description. |
| `ThemeConfig` | typealias | No JSDoc description. |
| `themeConfigSchema` | variable | No JSDoc description. |
| `ToastAction` | interface | No JSDoc description. |
| `toastActionSchema` | variable | No JSDoc description. |
| `TokenEditor` | interface | No JSDoc description. |
| `TrackAction` | interface | No JSDoc description. |
| `trackActionSchema` | variable | No JSDoc description. |
| `TryWorkflowNode` | interface | No JSDoc description. |
| `WaitWorkflowNode` | interface | No JSDoc description. |
| `WorkflowActionHandler` | typealias | No JSDoc description. |
| `WorkflowCondition` | interface | No JSDoc description. |
| `WorkflowConditionOperator` | typealias | No JSDoc description. |
| `workflowConditionSchema` | variable | No JSDoc description. |
| `WorkflowDefinition` | typealias | No JSDoc description. |
| `workflowDefinitionSchema` | variable | No JSDoc description. |
| `WorkflowMap` | typealias | No JSDoc description. |
| `WorkflowNode` | typealias | No JSDoc description. |
| `workflowNodeSchema` | variable | No JSDoc description. |

### Details

#### `AuditLogBase({ id, items: allItems, loading, error, userField, actionField, timestampField, detailsField, filters, pagination, className, style, slots, }: AuditLogBaseProps) => Element`

Standalone AuditLogBase — renders a filterable, paginated timeline of audit log entries
with user avatars, relative timestamps, and expandable detail panels. No manifest context required.

**Example:**

```tsx
<AuditLogBase
  items={[{ user: "Jane", action: "updated record", timestamp: "2026-04-01T12:00:00Z" }]}
  filters={[{ field: "action", label: "Action", options: ["created", "updated", "deleted"] }]}
  detailsField="changes"
  pagination={10}
/>
```

---

#### `buildRequestUrl(endpoint: string, params?: Record<string, unknown>, pathParams?: Record<string, unknown>) => string`

---

#### `CalendarBase({ id, view, events, loading, error, todayLabel, showWeekNumbers, onDateClick, onEventClick, className, style, slots, }: CalendarBaseProps) => Element`

Standalone CalendarBase — renders a month or week calendar grid with event pills,
navigation controls, and optional week numbers. No manifest context required.

**Example:**

```tsx
<CalendarBase
  view="month"
  events={[{ title: "Standup", date: new Date(), color: "primary", allDay: false, raw: {} }]}
  showWeekNumbers
  onDateClick={(date) => console.log(date)}
  onEventClick={(event) => console.log(event.title)}
/>
```

---

#### `DefaultErrorBase({ title, description, showRetry, retryLabel, onRetry, id, className, style, slots, }: DefaultErrorBaseProps) => Element`

Standalone DefaultError — renders an error feedback card with optional
retry button. No manifest context required.

**Example:**

```tsx
<DefaultErrorBase
  title="Something went wrong"
  description="Please try again later."
  showRetry
  onRetry={() => window.location.reload()}
/>
```

---

#### `DefaultLoadingBase({ label, size, id, className, style, slots, }: DefaultLoadingBaseProps) => Element`

Standalone DefaultLoading — renders a loading spinner with label.
No manifest context required.

**Example:**

```tsx
<DefaultLoadingBase label="Loading your data..." size="md" />
```

---

#### `DefaultNotFoundBase({ title, description, id, className, style, slots, }: DefaultNotFoundBaseProps) => Element`

Standalone DefaultNotFound — renders a 404 page with title and description.
No manifest context required.

**Example:**

```tsx
<DefaultNotFoundBase
  title="Page not found"
  description="The page you are looking for does not exist."
/>
```

---

#### `DefaultOfflineBase({ title, description, id, className, style, slots, }: DefaultOfflineBaseProps) => Element`

Standalone DefaultOffline — renders an offline status banner.
No manifest context required.

**Example:**

```tsx
<DefaultOfflineBase
  title="You're offline"
  description="Reconnect to continue working."
/>
```

---

#### `getRegisteredLayouts() => string[]`

List the names of all currently registered manifest layouts.

---

#### `isResourceRef(value: unknown) => value is { resource: string; params?: Record<string, unknown> | undefined; }`

---

#### `KanbanBase({ id, columns, items: rawItems, loading, error, columnField, titleField, descriptionField, assigneeField, priorityField, sortable, emptyMessage, onCardClick, onReorder, onDndChange, className, style,...`

Standalone KanbanBase — renders a multi-column board with cards, WIP limits,
assignee avatars, priority indicators, and optional drag-and-drop reordering. No manifest context required.

**Example:**

```tsx
<KanbanBase
  columns={[
    { key: "todo", title: "To Do", color: "info" },
    { key: "in-progress", title: "In Progress", color: "warning", limit: 3 },
    { key: "done", title: "Done", color: "success" },
  ]}
  items={[{ id: "1", title: "Task A", status: "todo", assignee: "Jane" }]}
  sortable
  onCardClick={(item) => console.log(item)}
/>
```

---

#### `NotificationFeedBase({ id, items, loading, error, titleField, messageField, timestampField, readField, typeField, showMarkAllRead, maxHeight, emptyMessage, clickable, onItemClick, onMarkAllRead, className, style, slots, ...`

Standalone NotificationFeedBase — renders a scrollable notification list with type icons,
unread indicators, relative timestamps, and a mark-all-read action. No manifest context required.

**Example:**

```tsx
<NotificationFeedBase
  items={[
    { id: 1, title: "Deploy succeeded", message: "v2.4.0 is live", type: "success", read: false, timestamp: "2026-04-23T10:00:00Z" },
  ]}
  clickable
  maxHeight="400px"
  onItemClick={(item) => console.log(item)}
  onMarkAllRead={() => markAllRead()}
/>
```

---

#### `PricingTableBase({ id, tiers, variant, currency, columns, className, style, slots, }: PricingTableBaseProps) => Element`

Standalone PricingTableBase — renders a responsive pricing comparison as either
a card grid or a feature-comparison table with CTA buttons per tier. No manifest context required.

**Example:**

```tsx
<PricingTableBase
  variant="cards"
  currency="$"
  tiers={[
    { name: "Free", price: 0, period: "/month", features: [{ text: "1 project" }], onAction: () => signup("free") },
    { name: "Pro", price: 29, period: "/month", highlighted: true, badge: "Popular", features: [{ text: "Unlimited projects" }], onAction: () => signup("pro") },
  ]}
/>
```

---

#### `registerBuiltInComponents(force?: boolean) => void`

Register all built-in config-driven components with the manifest system.

The function is idempotent so boot code can call it safely without worrying
about duplicate registrations.

---

#### `registerLayout(name: string, layout: RegisteredLayout) => void`

Register a named layout component for manifest layout resolution.

---

#### `resetBuiltInComponentRegistration() => void`

Reset the built-in component registration guard so tests can rebuild the registry.

---

#### `resolveLayout(name: string) => RegisteredLayout | undefined`

Resolve a previously registered layout by name.

---
