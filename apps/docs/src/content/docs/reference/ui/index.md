---
title: UI Reference
description: Generated from src/ui.ts and the declarations it re-exports.
draft: false
---

Generated from `src/ui.ts`.

| Export | Kind | Source | Description |
|---|---|---|---|
| `ActionBase` | interface | `src/ui/actions/types.ts` | Shared timing controls available on every action. |
| `ActionConfig` | typealias | `src/ui/actions/types.ts` | All possible action configs. Discriminated union on `type`. |
| `ActionExecuteFn` | typealias | `src/ui/actions/types.ts` | The execute function returned by useActionExecutor. |
| `actionSchema` | variable | `src/ui/actions/types.ts` | Discriminated union schema for all action types. Uses z.union (not z.discriminatedUnion) because some member schemas use z.lazy() for recursion, which is incompatible with z.discriminatedUnion's type requirements. |
| `ActivityFeedDef` | interface | `src/ui/presets/types.ts` | Feed section definition for dashboard-style presets. |
| `AnalyticsConfig` | typealias | `src/ui/manifest/types.ts` | Resolved runtime view of `analyticsConfigSchema`. |
| `analyticsConfigSchema` | variable | `src/ui/manifest/schema.ts` | Manifest analytics runtime configuration. |
| `AnalyticsProvider` | interface | `src/ui/analytics/types.ts` | Analytics provider runtime contract. |
| `AnalyticsProviderFactory` | typealias | `src/ui/analytics/types.ts` | Factory used to create analytics providers per snapshot instance. |
| `AnalyticsProviderInitConfig` | interface | `src/ui/analytics/types.ts` | Analytics provider initialization payload. |
| `analyticsProviderSchema` | variable | `src/ui/manifest/schema.ts` | Analytics provider declaration schema. |
| `ApiAction` | interface | `src/ui/actions/types.ts` | Call an API endpoint. |
| `apiActionSchema` | variable | `src/ui/actions/types.ts` | Schema for api action. Uses z.lazy() for recursive onSuccess/onError. |
| `AppConfig` | typealias | `src/ui/manifest/types.ts` | Resolved runtime view of `appConfigSchema`. |
| `appConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the top-level manifest `app` section. |
| `AppContextProvider` | function | `src/ui/context/providers.tsx` | Provides persistent global state that survives route changes. Initializes globals from the manifest config. |
| `AppContextProviderProps` | interface | `src/ui/context/types.ts` | Props for AppContextProvider. Wraps the entire app to provide persistent global state. |
| `AssignWorkflowNode` | interface | `src/ui/workflows/types.ts` | Write values into the workflow execution context. |
| `AtomRegistry` | interface | `src/ui/state/types.ts` | Registry of named state atoms. Backing store is shared per scope (app or route). |
| `AuthBrandingDef` | interface | `src/ui/presets/types.ts` | Branding and background options for the auth page preset. |
| `authPage` | function | `src/ui/presets/auth-page.ts` | Build a manifest page config for a common auth screen. |
| `AuthPageOptions` | interface | `src/ui/presets/types.ts` | Options for the `authPage` preset factory. |
| `authPresetConfigSchema` | variable | `src/ui/presets/schemas.ts` | Validate preset config for auth screens such as login, register, and password recovery. |
| `AuthProviderConfig` | typealias | `src/ui/manifest/types.ts` | Resolved runtime view of `authProviderSchema`. |
| `authProviderSchema` | variable | `src/ui/manifest/schema.ts` | Auth provider declaration schema. Declared at `manifest.auth.providers.<name>`. |
| `AuthScreenConfig` | typealias | `src/ui/manifest/types.ts` | Resolved runtime view of `authScreenConfigSchema`. |
| `authScreenConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the manifest auth screen and auth workflow configuration. |
| `AutoForm` | function | `src/ui/components/forms/auto-form/component.tsx` | Config-driven form component with multi-column layout, conditional field visibility, and section grouping.  Supports client-side validation, submission to an API endpoint, manifest-aware resource mutation (invalidation + optimistic handling), workflow lifecycle hooks (`beforeSubmit`, `afterSubmit`, `error`), and action chaining on success/error. Publishes form state to the page context when an `id` is configured. |
| `AutoFormConfig` | typealias | `src/ui/components/forms/auto-form/types.ts` | Inferred type for the AutoForm component config. |
| `autoFormConfigSchema` | variable | `src/ui/components/forms/auto-form/schema.ts` | Zod schema for the AutoForm component config.  Defines a config-driven form that auto-generates fields from config or OpenAPI schema. Supports validation, submission, action chaining, multi-column layout, conditional field visibility, and field grouping. |
| `AvatarGroup` | function | `src/ui/components/data/avatar-group/component.tsx` | AvatarGroup — displays a row of overlapping avatars with "+N" overflow. Supports static `avatars` array or API-loaded data. Each avatar shows an image or initials fallback with a deterministic background color. |
| `AvatarGroupConfig` | typealias | `src/ui/components/data/avatar-group/types.ts` | Inferred config type from the AvatarGroup Zod schema. |
| `avatarGroupConfigSchema` | variable | `src/ui/components/data/avatar-group/schema.ts` | Zod config schema for the AvatarGroup component. Displays a row of overlapping avatars with an optional "+N" overflow count. Commonly used for showing team members, assignees, or participants. |
| `BaseComponentConfig` | typealias | `src/ui/manifest/types.ts` | Resolved runtime view of `baseComponentConfigSchema`. |
| `baseComponentConfigSchema` | variable | `src/ui/manifest/schema.ts` | Shared base schema applied to all manifest-driven components. |
| `bootBuiltins` | function | `src/ui/manifest/boot-builtins.ts` | Register all built-in manifest registries exactly once. |
| `BreadcrumbAutoConfig` | interface | `src/ui/manifest/breadcrumbs.ts` | Auto-breadcrumb configuration used to derive labels and optional home state from routes. |
| `BreadcrumbItem` | interface | `src/ui/manifest/breadcrumbs.ts` | A single breadcrumb entry rendered from the matched route stack. |
| `Breakpoint` | typealias | `src/ui/hooks/use-breakpoint.ts` | All breakpoint names including `"default"` (below `sm`). |
| `buildEmojiMap` | function | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | Builds a shortcode lookup map from an array of custom emojis. |
| `buildRequestUrl` | function | `src/ui/manifest/resources.ts` | Interpolate path params and append remaining params as a query string. |
| `BulkAction` | typealias | `src/ui/components/data/data-table/types.ts` | Inferred bulk action type. |
| `bulkActionSchema` | variable | `src/ui/components/data/data-table/schema.ts` | Schema for a bulk action on selected rows. |
| `ButtonConfig` | typealias | `src/ui/manifest/types.ts` | Resolved runtime view of `buttonConfigSchema`. |
| `buttonConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the built-in `button` component. |
| `CaptureWorkflowNode` | interface | `src/ui/workflows/types.ts` | Execute an action and capture its result into the workflow context. |
| `Chart` | function | `src/ui/components/data/chart/component.tsx` | Render a config-driven chart with manifest data sources, live refresh, and slot-aware styling. |
| `ChartConfig` | typealias | `src/ui/components/data/chart/types.ts` | Inferred type for the Chart component configuration. |
| `ChartDef` | interface | `src/ui/presets/types.ts` | Chart section definition for dashboard-style presets. |
| `chartSchema` | variable | `src/ui/components/data/chart/schema.ts` | Zod schema for the Chart component configuration.  Renders a data visualization (bar, line, area, pie, donut) from an endpoint or from-ref. Uses Recharts under the hood. Colors default to `--sn-chart-1` through `--sn-chart-5` tokens. |
| `ChatWindow` | function | `src/ui/components/communication/chat-window/component.tsx` | ChatWindow — full chat interface composing a message thread, rich input, and typing indicator. Provides a Discord/Slack-style chat experience in a single config-driven component. |
| `ChatWindowConfig` | typealias | `src/ui/components/communication/chat-window/types.ts` | Inferred config type from the ChatWindow Zod schema. |
| `chatWindowConfigSchema` | variable | `src/ui/components/communication/chat-window/schema.ts` | Zod config schema for the ChatWindow component. A full chat interface composing a message thread, rich input, and typing indicator into a single component. |
| `clearPersistedState` | function | `src/ui/state/persist.ts` | Remove a persisted state value from the selected browser storage area. |
| `CloseModalAction` | interface | `src/ui/actions/types.ts` | Close a modal or drawer. |
| `closeModalActionSchema` | variable | `src/ui/actions/types.ts` | Schema for close-modal action. |
| `ColorPicker` | function | `src/ui/components/forms/color-picker/component.tsx` | Render a manifest-driven color picker input. |
| `ColorPickerConfig` | typealias | `src/ui/components/forms/color-picker/types.ts` | Config for the manifest-driven color picker component. |
| `colorPickerConfigSchema` | variable | `src/ui/components/forms/color-picker/schema.ts` | Schema for color picker components with optional swatches, alpha, and change actions. |
| `colorToOklch` | function | `src/ui/tokens/color.ts` | Convert any supported color string to OKLCH values. Supports: hex (#rgb, #rrggbb), oklch strings ("L C H"), and oklch() CSS function. |
| `ColumnConfig` | typealias | `src/ui/components/data/data-table/types.ts` | Inferred column configuration type. |
| `columnConfigSchema` | variable | `src/ui/components/data/data-table/schema.ts` | Schema for individual column configuration. |
| `ColumnDef` | interface | `src/ui/presets/types.ts` | A single column definition for the CRUD page table. |
| `CommandPalette` | function | `src/ui/components/overlay/command-palette/component.tsx` | No JSDoc description. |
| `CommandPaletteConfig` | typealias | `src/ui/components/overlay/command-palette/types.ts` | Inferred config type for the CommandPalette component. |
| `commandPaletteConfigSchema` | variable | `src/ui/components/overlay/command-palette/schema.ts` | No JSDoc description. |
| `CommentSection` | function | `src/ui/components/communication/comment-section/component.tsx` | CommentSection — displays a list of comments with author avatars, timestamps, and an embedded rich input for posting new comments. |
| `CommentSectionConfig` | typealias | `src/ui/components/communication/comment-section/types.ts` | Inferred config type from the CommentSection Zod schema. |
| `commentSectionConfigSchema` | variable | `src/ui/components/communication/comment-section/schema.ts` | Zod config schema for the CommentSection component. Renders a comment list with nested replies and an embedded rich input for posting new comments. |
| `CompareView` | function | `src/ui/components/content/compare-view/component.tsx` | CompareView component — a config-driven side-by-side diff viewer for comparing two text values. Uses a simple LCS-based line diff algorithm. Removed lines are highlighted in red, added lines in green, and unchanged lines render normally. Supports synced scrolling between panes. |
| `CompareViewConfig` | typealias | `src/ui/components/content/compare-view/types.ts` | Inferred config type from the CompareView Zod schema. |
| `compareViewConfigSchema` | variable | `src/ui/components/content/compare-view/schema.ts` | Zod config schema for the CompareView component. Defines all manifest-settable fields for a side-by-side content comparison view with diff highlighting. |
| `CompiledManifest` | interface | `src/ui/manifest/types.ts` | Runtime manifest shape produced by `compileManifest()`. |
| `CompiledRoute` | interface | `src/ui/manifest/types.ts` | Runtime route shape produced by `compileManifest()`. |
| `compileManifest` | function | `src/ui/manifest/compiler.ts` | Parse and compile a manifest into the runtime shape. |
| `ComponentConfig` | typealias | `src/ui/manifest/types.ts` | Runtime config union for manifest-renderable components. |
| `componentConfigSchema` | variable | `src/ui/manifest/schema.ts` | Union schema covering every component config Snapshot can render from a manifest. |
| `ComponentDataResult` | interface | `src/ui/components/_base/use-component-data.ts` | Result returned by `useComponentData`. Provides the fetched data, loading/error states, and a refetch function. |
| `ComponentRenderer` | function | `src/ui/manifest/renderer.tsx` | Renders a single component from its manifest config. |
| `ComponentRendererProps` | interface | `src/ui/manifest/renderer.tsx` | Props for the ComponentRenderer component. |
| `componentsConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the top-level `components` section of a manifest. |
| `ComponentTokens` | typealias | `src/ui/tokens/types.ts` | Component-level token overrides. Per-component styling knobs. |
| `componentTokensSchema` | variable | `src/ui/tokens/schema.ts` | Zod schema for component-level token overrides. |
| `ConfigDrivenComponent` | typealias | `src/ui/manifest/types.ts` | React component type that can participate in the config-driven manifest runtime. |
| `ConfirmAction` | interface | `src/ui/actions/types.ts` | Show a confirmation dialog. Stops the chain if cancelled. |
| `confirmActionSchema` | variable | `src/ui/actions/types.ts` | Schema for confirm action. |
| `ConfirmDialog` | function | `src/ui/actions/confirm.tsx` | Render the global confirmation dialog for requests queued through `useConfirmManager`. |
| `ConfirmManager` | interface | `src/ui/actions/confirm.tsx` | Imperative API for opening a confirmation dialog from manifest actions or custom UI. |
| `ConfirmOptions` | typealias | `src/ui/actions/confirm.tsx` | Options accepted when opening a confirmation dialog. |
| `ConfirmRequest` | interface | `src/ui/actions/confirm.tsx` | Internal confirm-dialog request stored in the atom-backed manager queue. |
| `ContextMenu` | function | `src/ui/components/overlay/context-menu/component.tsx` | Render a right-click context menu backed by the shared context-menu portal runtime. |
| `ContextMenuConfig` | typealias | `src/ui/components/overlay/context-menu/types.ts` | Inferred config type for the ContextMenu component. |
| `contextMenuConfigSchema` | variable | `src/ui/components/overlay/context-menu/schema.ts` | Zod schema for the ContextMenu component. Defines a right-click menu with styleable trigger, panel, item, label, and separator surfaces. Visibility can be driven by a boolean or a binding reference. |
| `contrastRatio` | function | `src/ui/tokens/color.ts` | Calculate the WCAG contrast ratio between two supported color values. |
| `CopyAction` | interface | `src/ui/actions/types.ts` | Copy plain text and optionally continue with follow-up actions. |
| `CopyToClipboardAction` | interface | `src/ui/actions/types.ts` | Copy plain text and optionally show a simple confirmation toast. |
| `copyToClipboardActionSchema` | variable | `src/ui/actions/types.ts` | Schema for the `copy-to-clipboard` action. |
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
| `dataSourceSchema` | variable | `src/ui/manifest/resources.ts` | Data source accepted by data-aware manifest components. |
| `DataTable` | function | `src/ui/components/data/data-table/component.tsx` | Config-driven DataTable component.  Renders an HTML table with sorting, pagination, filtering, selection, search, row actions, and bulk actions. All behavior is driven by the `DataTableConfig` schema.  Publishes state via `usePublish` when `id` is set: `{ selected, selectedRows, selectedIds, filters, sort, page, search, data }` |
| `DataTableConfig` | typealias | `src/ui/components/data/data-table/types.ts` | Inferred DataTable configuration type from the Zod schema. |
| `dataTableConfigSchema` | variable | `src/ui/components/data/data-table/schema.ts` | Zod schema for the DataTable component configuration.  Defines a config-driven data table with sorting, pagination, filtering, selection, search, row actions, and bulk actions. |
| `DatePicker` | function | `src/ui/components/forms/date-picker/component.tsx` | Render a manifest-driven date picker input. |
| `DatePickerConfig` | typealias | `src/ui/components/forms/date-picker/types.ts` | Config for the manifest-driven date picker component. |
| `datePickerConfigSchema` | variable | `src/ui/components/forms/date-picker/schema.ts` | Schema for date picker components covering single, range, and multi-date selection. |
| `debounceAction` | function | `src/ui/actions/timing.ts` | Debounce async or sync action execution by key and resolve all pending callers with the final invocation result. |
| `defineFlavor` | function | `src/ui/tokens/flavors.ts` | Define and register a new flavor. If a flavor with the same name already exists, it is replaced. |
| `defineManifest` | function | `src/ui/manifest/compiler.ts` | Define a manifest without compiling it. |
| `deriveDarkVariant` | function | `src/ui/tokens/color.ts` | Derive a dark mode variant of a light color. Adjusts lightness and chroma for dark mode readability: - If the color is light (L > 0.5), reduce lightness moderately - If the color is dark (L <= 0.5), increase lightness for dark backgrounds - Boost chroma slightly for vibrancy in dark mode |
| `deriveForeground` | function | `src/ui/tokens/color.ts` | Derive a foreground color that passes WCAG AA contrast (4.5:1) against the given background color. Returns a light or dark foreground. |
| `DetailCard` | function | `src/ui/components/data/detail-card/component.tsx` | No JSDoc description. |
| `DetailCardConfig` | typealias | `src/ui/components/data/detail-card/schema.ts` | DetailCard configuration type inferred from the schema. |
| `detailCardConfigSchema` | variable | `src/ui/components/data/detail-card/schema.ts` | Zod schema for DetailCard component configuration.  The detail card displays a single record's fields in a key-value layout. Used in drawers, modals, and detail pages. |
| `detectPlatform` | function | `src/ui/components/content/link-embed/platform.ts` | Detects the platform from a URL and extracts embed info. |
| `DownloadAction` | interface | `src/ui/actions/types.ts` | Download a file from an endpoint. |
| `downloadActionSchema` | variable | `src/ui/actions/types.ts` | Schema for download action. |
| `DrawerComponent` | function | `src/ui/components/overlay/drawer/component.tsx` | Drawer component — renders a slide-in panel from the left or right edge.  Controlled by the modal manager (open-modal/close-modal actions). Content is rendered via ComponentRenderer for recursive composition. Supports FromRef trigger for auto-open behavior. |
| `DrawerConfig` | typealias | `src/ui/components/overlay/drawer/schema.ts` | Inferred type for drawer config. |
| `drawerConfigSchema` | variable | `src/ui/components/overlay/drawer/schema.ts` | Zod schema for drawer component config. Drawers are slide-in panels from the left or right edge of the screen. Like modals, they are opened/closed via the modal manager. |
| `EmojiPicker` | function | `src/ui/components/communication/emoji-picker/component.tsx` | EmojiPicker — searchable grid of emojis organized by category. Publishes `{ emoji, name }` when an emoji is selected. |
| `EmojiPickerConfig` | typealias | `src/ui/components/communication/emoji-picker/types.ts` | Inferred config type from the EmojiPicker Zod schema. |
| `emojiPickerConfigSchema` | variable | `src/ui/components/communication/emoji-picker/schema.ts` | Zod config schema for the EmojiPicker component. Renders a searchable grid of emojis organized by category. |
| `EmptyStateDef` | interface | `src/ui/presets/types.ts` | Empty-state content shown by preset-generated pages. |
| `endpointTargetSchema` | variable | `src/ui/manifest/resources.ts` | Endpoint target accepted by actions and resource-aware components. |
| `EntityPicker` | function | `src/ui/components/data/entity-picker/component.tsx` | Render a searchable entity picker from manifest-provided options or data. |
| `EntityPickerConfig` | typealias | `src/ui/components/data/entity-picker/types.ts` | Inferred config type from the EntityPicker Zod schema. |
| `entityPickerConfigSchema` | variable | `src/ui/components/data/entity-picker/schema.ts` | Zod config schema for the EntityPicker component. A searchable dropdown for selecting entities (users, documents, items) from an API endpoint. Supports single and multi-select. |
| `expandPreset` | function | `src/ui/presets/expand.ts` | Validate a named preset config and expand it into the equivalent page config. |
| `FavoriteButton` | function | `src/ui/components/data/favorite-button/component.tsx` | FavoriteButton component — a config-driven star toggle for marking favorites. Renders a star icon that toggles between active (filled/warning color) and inactive (muted foreground) states. Dispatches an optional action on toggle and publishes its active state. |
| `FavoriteButtonConfig` | typealias | `src/ui/components/data/favorite-button/types.ts` | Inferred config type from the FavoriteButton Zod schema. |
| `favoriteButtonConfigSchema` | variable | `src/ui/components/data/favorite-button/schema.ts` | Zod config schema for the FavoriteButton component. Defines all manifest-settable fields for a star toggle button used to mark items as favorites. |
| `Feed` | function | `src/ui/components/data/feed/component.tsx` | Render an activity feed with grouping, empty states, live refresh, and optional infinite scrolling. |
| `FeedConfig` | typealias | `src/ui/components/data/feed/types.ts` | Inferred type for the Feed component config (from Zod schema). |
| `FeedItem` | interface | `src/ui/components/data/feed/types.ts` | A single resolved feed item for rendering. |
| `feedSchema` | variable | `src/ui/components/data/feed/schema.ts` | Zod schema for the Feed component configuration.  Renders a scrollable activity/event stream from an endpoint or from-ref. Supports avatar, title, description, timestamp, badge fields, pagination, and publishes the selected item to the page context when `id` is set. |
| `FieldConfig` | typealias | `src/ui/components/forms/auto-form/types.ts` | Inferred type for a single field configuration. |
| `fieldConfigSchema` | variable | `src/ui/components/forms/auto-form/schema.ts` | Schema for an individual field configuration. |
| `FieldErrors` | typealias | `src/ui/components/forms/auto-form/types.ts` | Per-field validation error. |
| `FilterBar` | function | `src/ui/components/data/filter-bar/component.tsx` | FilterBar component — search input + filter dropdowns + active filter pills. Publishes `{ search, filters }` to the page context so other components (e.g., data tables) can subscribe and react to filter changes. |
| `FilterBarConfig` | typealias | `src/ui/components/data/filter-bar/types.ts` | Inferred config type for the FilterBar component. |
| `filterBarConfigSchema` | variable | `src/ui/components/data/filter-bar/schema.ts` | Zod config schema for the FilterBar component. Renders a search input + filter dropdowns + active filter pills. Publishes `{ search, filters }` to the page context. |
| `FilterDef` | interface | `src/ui/presets/types.ts` | A filter definition for the CRUD page toolbar. |
| `FilterOption` | interface | `src/ui/presets/types.ts` | A filter option entry. |
| `Flavor` | interface | `src/ui/tokens/types.ts` | Named theme preset. Provides a complete set of design tokens. |
| `FontConfig` | typealias | `src/ui/tokens/types.ts` | Font configuration. |
| `fontSchema` | variable | `src/ui/tokens/schema.ts` | Zod schema for font configuration. |
| `FormDef` | interface | `src/ui/presets/types.ts` | A form definition used in CRUD create/update modals and settings tabs. |
| `FormFieldDef` | interface | `src/ui/presets/types.ts` | A single form field definition. |
| `FormFieldOption` | interface | `src/ui/presets/types.ts` | An option entry for select/radio form fields. |
| `FromRef` | interface | `src/ui/context/types.ts` | A reference to another component's published value. Used in config objects to wire components together reactively. |
| `fromRefSchema` | variable | `src/ui/manifest/schema.ts` | Zod schema for a FromRef value. |
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
| `GifPicker` | function | `src/ui/components/communication/gif-picker/component.tsx` | GifPicker — searchable GIF grid with support for API-powered search or static GIF data. Displays a masonry-style grid of GIF previews. |
| `GifPickerConfig` | typealias | `src/ui/components/communication/gif-picker/types.ts` | Inferred config type from the GifPicker Zod schema. |
| `gifPickerConfigSchema` | variable | `src/ui/components/communication/gif-picker/schema.ts` | Zod config schema for the GifPicker component. Searchable GIF picker that queries a GIF API (Giphy/Tenor) and displays results in a masonry-style grid. The component expects a backend proxy endpoint that handles the actual API key and returns GIF results. This avoids exposing API keys in the frontend. |
| `GlobalConfig` | typealias | `src/ui/context/types.ts` | Global state definition from the manifest. This now aliases the shared state config used by the runtime. |
| `HeadingConfig` | typealias | `src/ui/manifest/types.ts` | Resolved runtime view of `headingConfigSchema`. |
| `headingConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the built-in `heading` component. |
| `hexToOklch` | function | `src/ui/tokens/color.ts` | Convert a hex color string to OKLCH values. |
| `HighlightedText` | function | `src/ui/components/data/highlighted-text/component.tsx` | HighlightedText component — renders text with search query highlighting. Splits the text by the highlight query and wraps matching portions in `<mark>` elements. Lightweight and purely presentational. |
| `HighlightedTextConfig` | typealias | `src/ui/components/data/highlighted-text/types.ts` | Inferred config type from the HighlightedText Zod schema. |
| `highlightedTextConfigSchema` | variable | `src/ui/components/data/highlighted-text/schema.ts` | Zod config schema for the HighlightedText component. Renders text with search query highlighting. Matching portions are wrapped in `<mark>` elements with a configurable highlight color. |
| `hslToOklch` | function | `src/ui/tokens/color.ts` | Convert HSL values to OKLCH. |
| `httpMethodSchema` | variable | `src/ui/manifest/resources.ts` | Supported HTTP methods for manifest resources and endpoint targets. |
| `Icon` | function | `src/ui/icons/icon.tsx` | Render a Snapshot icon from the built-in icon registry. |
| `ICON_PATHS` | variable | `src/ui/icons/paths.ts` | SVG inner content for Lucide icons. Each entry maps a kebab-case icon name to the SVG child elements (path, circle, line, rect, polyline, etc.) that belong inside a 24x24 `stroke="currentColor"` SVG container. Source: https://lucide.dev — MIT-licensed. |
| `IconProps` | interface | `src/ui/icons/icon.tsx` | Props for the {@link Icon} component. |
| `IfWorkflowNode` | interface | `src/ui/workflows/types.ts` | Branch workflow execution based on a condition. |
| `injectStyleSheet` | function | `src/ui/manifest/app.tsx` | Inject or update a stylesheet in the document head. |
| `InlineEdit` | function | `src/ui/components/forms/inline-edit/component.tsx` | InlineEdit component — click-to-edit text field. Toggles between a display mode and an edit mode. Enter or blur saves the value; Escape reverts to the original value when `cancelOnEscape` is enabled. |
| `InlineEditConfig` | typealias | `src/ui/components/forms/inline-edit/types.ts` | Inferred config type for the InlineEdit component. |
| `inlineEditConfigSchema` | variable | `src/ui/components/forms/inline-edit/schema.ts` | Zod config schema for the InlineEdit component. A click-to-edit text field that toggles between display and edit modes. Publishes `{ value, editing }` to the page context. |
| `Input` | function | `src/ui/components/forms/input/component.tsx` | Config-driven Input component — a standalone text input field with label, placeholder, validation, optional icon, and helper/error text. Publishes `{ value: string }` to the page context when an `id` is set. Supports debounced `changeAction` execution on value change. |
| `InputConfig` | typealias | `src/ui/components/forms/input/types.ts` | Inferred config type from the Input Zod schema. |
| `inputConfigSchema` | variable | `src/ui/components/forms/input/schema.ts` | Zod config schema for the Input component. Defines a standalone text input field with label, placeholder, validation, and optional icon. |
| `interpolate` | function | `src/ui/actions/interpolate.ts` | Replace `{key}` placeholders with values from context. Supports nested paths: `{user.name}`, `{result.id}`. Missing keys are preserved as-is: `{unknown}` stays `{unknown}`. |
| `isFromRef` | function | `src/ui/context/utils.ts` | Type guard for FromRef values. A FromRef is an object with a single `from` string property. |
| `isResourceRef` | function | `src/ui/manifest/resources.ts` | Return `true` when a value is a manifest resource reference object. |
| `Layout` | function | `src/ui/components/layout/layout/component.tsx` | Layout shell component that wraps page content. Renders one of five layout variants based on the config: - **sidebar**: fixed sidebar (collapsible on mobile) + main content area - **top-nav**: horizontal nav bar + content below - **stacked**: vertical header/sidebar/main/footer sections - **minimal**: centered content, no nav (auth pages, onboarding) - **full-width**: edge-to-edge, no nav (landing pages) |
| `LayoutConfig` | typealias | `src/ui/components/layout/layout/schema.ts` | Inferred layout config type from the Zod schema. |
| `layoutConfigSchema` | variable | `src/ui/components/layout/layout/schema.ts` | Zod schema for layout component configuration. Defines the layout shell that wraps page content. |
| `LayoutProps` | interface | `src/ui/components/layout/layout/types.ts` | Props for the Layout component. |
| `LayoutVariant` | typealias | `src/ui/components/layout/layout/types.ts` | Layout variant type extracted from the schema. |
| `LinkEmbed` | function | `src/ui/components/content/link-embed/component.tsx` | LinkEmbed — renders rich URL previews with platform-specific renderers. Supports YouTube, Instagram, TikTok, Twitter/X iframes, inline GIF images, and generic Open Graph cards for all other URLs. |
| `LinkEmbedConfig` | typealias | `src/ui/components/content/link-embed/types.ts` | Inferred config type from the LinkEmbed Zod schema. |
| `linkEmbedConfigSchema` | variable | `src/ui/components/content/link-embed/schema.ts` | Zod config schema for the LinkEmbed component. Renders rich URL previews with platform-specific renderers for YouTube, Instagram, TikTok, Twitter/X, and generic Open Graph cards. Also supports inline GIF embeds. |
| `LocationInput` | function | `src/ui/components/forms/location-input/component.tsx` | LocationInput — geocode autocomplete input. Searches a backend endpoint as the user types, displays matching locations in a dropdown, and publishes `{ name, lat, lng, address }` on selection. Optionally shows a Google Maps link after selection. |
| `LocationInputConfig` | typealias | `src/ui/components/forms/location-input/types.ts` | Inferred config type from the LocationInput Zod schema. |
| `locationInputConfigSchema` | variable | `src/ui/components/forms/location-input/schema.ts` | Zod config schema for the LocationInput component. Geocode autocomplete input that searches a backend endpoint, displays matching locations in a dropdown, and extracts coordinates on selection. Publishes `{ name, lat, lng, address }`. |
| `LogAction` | interface | `src/ui/actions/types.ts` | Emit a structured client-side log entry. |
| `ManifestApp` | function | `src/ui/manifest/app.tsx` | Render the manifest-driven application shell. |
| `ManifestAppProps` | interface | `src/ui/manifest/types.ts` | Props accepted by the `ManifestApp` component. |
| `ManifestConfig` | typealias | `src/ui/manifest/types.ts` | Raw manifest input shape accepted by `parseManifest()` before defaults are applied during compilation. |
| `manifestConfigSchema` | variable | `src/ui/manifest/schema.ts` | Top-level schema for `snapshot.manifest.json`. |
| `ManifestRuntimeProvider` | function | `src/ui/manifest/runtime.tsx` | Provides manifest runtime state, resource cache state, and mutation helpers. |
| `Markdown` | function | `src/ui/components/content/markdown/component.tsx` | Markdown component — renders markdown content with full GFM support and syntax highlighting powered by rehype-highlight. Uses `--sn-*` design tokens for all typography, colors, and spacing. |
| `MarkdownConfig` | typealias | `src/ui/components/content/markdown/types.ts` | Inferred config type from the Markdown Zod schema. |
| `markdownConfigSchema` | variable | `src/ui/components/content/markdown/schema.ts` | Zod config schema for the Markdown component. Renders markdown content with full GFM support and syntax highlighting. |
| `meetsWcagAA` | function | `src/ui/tokens/color.ts` | Check whether two colors satisfy WCAG AA contrast for normal or large text. |
| `MessageThread` | function | `src/ui/components/communication/message-thread/component.tsx` | MessageThread — scrollable message list with avatars, timestamps, message grouping, and date separators. Renders HTML content from TipTap or other sources with sanitization. |
| `MessageThreadConfig` | typealias | `src/ui/components/communication/message-thread/types.ts` | Inferred config type from the MessageThread Zod schema. |
| `messageThreadConfigSchema` | variable | `src/ui/components/communication/message-thread/schema.ts` | Zod config schema for the MessageThread component. Renders a scrollable message list with avatars, timestamps, message grouping, date separators, and optional reactions/threading. |
| `ModalComponent` | function | `src/ui/components/overlay/modal/component.tsx` | Modal component — renders an overlay dialog with child components.  Controlled by the modal manager (open-modal/close-modal actions). Content is rendered via ComponentRenderer for recursive composition. Supports FromRef trigger for auto-open behavior. |
| `ModalConfig` | typealias | `src/ui/components/overlay/modal/schema.ts` | Inferred type for modal config. |
| `modalConfigSchema` | variable | `src/ui/components/overlay/modal/schema.ts` | Zod schema for modal component config. Modals are overlay dialogs that display child components. They are opened/closed via the modal manager (open-modal/close-modal actions). |
| `ModalManager` | interface | `src/ui/actions/modal-manager.ts` | Return type of useModalManager. |
| `MultiSelect` | function | `src/ui/components/forms/multi-select/component.tsx` | Config-driven MultiSelect component — a dropdown with checkboxes for selecting multiple values. Supports static options, API-loaded options, search filtering, max selection limits, and pill display for selected items. Publishes `{ value: string[] }` to the page context when an `id` is set. |
| `MultiSelectConfig` | typealias | `src/ui/components/forms/multi-select/types.ts` | Inferred config type from the MultiSelect Zod schema. |
| `multiSelectConfigSchema` | variable | `src/ui/components/forms/multi-select/schema.ts` | Zod config schema for the MultiSelect component. Defines a dropdown with checkboxes for selecting multiple values, with optional search filtering and pill display. |
| `Nav` | function | `src/ui/components/layout/nav/component.tsx` | Grouped navigation component for manifest app shells. Renders either `navigation.items` or a composable nav template, resolves translated labels at render time, applies canonical slot/state styling, and optionally renders logo and user-menu surfaces. |
| `NavConfig` | typealias | `src/ui/components/layout/nav/schema.ts` | Runtime config type for the Nav component. |
| `navConfigSchema` | variable | `src/ui/components/layout/nav/schema.ts` | Zod schema for the grouped Nav component. Supports either `items`-driven navigation or template composition, optional logo and user menu configuration, collapsible sidebar behavior, and canonical slot-based surface styling. |
| `NavigateAction` | interface | `src/ui/actions/types.ts` | Navigate to a route. |
| `navigateActionSchema` | variable | `src/ui/actions/types.ts` | Schema for navigate action. |
| `NavigationConfig` | typealias | `src/ui/manifest/types.ts` | Runtime view of `navigationConfigSchema`. Navigation labels remain locale-resolved at render time. |
| `navigationConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the top-level manifest navigation configuration. |
| `NavItem` | interface | `src/ui/manifest/types.ts` | Navigation item rendered by Snapshot navigation components. |
| `NavItemConfig` | typealias | `src/ui/components/layout/nav/schema.ts` | Runtime config type for a grouped nav item, including optional child items and per-item slots. |
| `navItemSchema` | variable | `src/ui/manifest/schema.ts` | Recursive schema for navigation items used by manifest navigation surfaces. |
| `NotificationBell` | function | `src/ui/components/data/notification-bell/component.tsx` | NotificationBell component — a config-driven bell icon with unread count badge. Shows a bell icon with an optional red badge displaying the unread count. Badge is hidden when count is 0 or undefined. Counts exceeding `max` are displayed as "{max}+". |
| `NotificationBellConfig` | typealias | `src/ui/components/data/notification-bell/types.ts` | Inferred config type from the NotificationBell Zod schema. |
| `notificationBellConfigSchema` | variable | `src/ui/components/data/notification-bell/schema.ts` | Zod config schema for the NotificationBell component.  Defines all manifest-settable fields for a bell icon with an unread count badge. |
| `oklchToHex` | function | `src/ui/tokens/color.ts` | Convert OKLCH values back to a hex color string. Used for serializing runtime overrides. |
| `oklchToString` | function | `src/ui/tokens/color.ts` | Format OKLCH values as a CSS-compatible string (without the oklch() wrapper). Output format: "L C H" where L, C, H are rounded to 3 decimal places. |
| `OpenModalAction` | interface | `src/ui/actions/types.ts` | Open a modal or drawer by id. |
| `openModalActionSchema` | variable | `src/ui/actions/types.ts` | Schema for open-modal action. |
| `outletComponentSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the built-in `outlet` component used by route layouts. |
| `OverlayConfig` | typealias | `src/ui/manifest/types.ts` | Resolved runtime view of `overlayConfigSchema`. |
| `overlayConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for named modal and drawer overlay declarations. |
| `OverlayRuntimeProvider` | function | `src/ui/manifest/runtime.tsx` | Provide the current overlay runtime payload and metadata. |
| `PageConfig` | typealias | `src/ui/manifest/types.ts` | Resolved runtime view of `pageConfigSchema`. |
| `pageConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for a manifest page definition. |
| `PageContextProvider` | function | `src/ui/context/providers.tsx` | Provides per-page state that is destroyed on route change. |
| `PageContextProviderProps` | interface | `src/ui/context/types.ts` | Props for PageContextProvider. Wraps each page/route to provide per-page component state. |
| `PageRenderer` | function | `src/ui/manifest/renderer.tsx` | Renders a page from its manifest config. |
| `PageRendererProps` | interface | `src/ui/manifest/renderer.tsx` | Props for the PageRenderer component. |
| `PaginationDef` | interface | `src/ui/presets/types.ts` | Pagination settings for preset-generated list surfaces. |
| `PaginationState` | interface | `src/ui/components/data/data-table/types.ts` | Pagination state for the data table. |
| `ParallelWorkflowNode` | interface | `src/ui/workflows/types.ts` | Run multiple workflow definitions in parallel. |
| `parseManifest` | function | `src/ui/manifest/compiler.ts` | Parse an unknown value into a validated manifest. |
| `parseOklchString` | function | `src/ui/tokens/color.ts` | Parse an oklch string (the CSS variable format "L C H") back to values. |
| `parseShortcodes` | function | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | Parses shortcodes in text and replaces them with `<img>` tags. |
| `Platform` | typealias | `src/ui/components/content/link-embed/platform.ts` | Platform detection and embed URL extraction. Identifies known platforms from URLs and extracts the embed-compatible URL or ID needed to render platform-specific iframes. |
| `PLATFORM_COLORS` | variable | `src/ui/components/content/link-embed/platform.ts` | Platform accent colors. |
| `PLATFORM_NAMES` | variable | `src/ui/components/content/link-embed/platform.ts` | Platform display names. |
| `PlatformInfo` | interface | `src/ui/components/content/link-embed/platform.ts` | Resolved platform metadata used to render a platform-specific embedded preview. |
| `Popover` | function | `src/ui/components/overlay/popover/component.tsx` | Floating panel component triggered by a button-like control. Uses the shared floating panel primitive, applies canonical slot styling to trigger and content surfaces, and publishes `{ isOpen }` when an `id` is configured. |
| `PopoverConfig` | typealias | `src/ui/components/overlay/popover/types.ts` | Inferred config type for the Popover component. |
| `popoverConfigSchema` | variable | `src/ui/components/overlay/popover/schema.ts` | Zod schema for the Popover component. Defines a trigger-driven floating panel with optional title, description, footer content, width, placement, and canonical slot-based styling for the trigger and panel sub-surfaces. |
| `PrefetchLink` | function | `src/ui/components/navigation/prefetch-link/component.tsx` | `<PrefetchLink>` — a prefetch primitive that renders a plain `<a>` anchor and automatically injects `<link rel="prefetch">` tags for the matching route's JS chunks and CSS files.  Prefetch is triggered by the `prefetch` config field: - `'hover'`    — prefetch when the user mouses over the link (default) - `'viewport'` — prefetch as soon as the link scrolls into view - `'none'`     — no automatic prefetching  This component renders a plain `<a>` tag and does **not** import TanStack Router's `<Link>`. It is a prefetch primitive — consumers wire their own router. This design avoids a peer dependency on TanStack Router in the component library. |
| `PrefetchLinkConfig` | typealias | `src/ui/components/navigation/prefetch-link/schema.ts` | The output type of `prefetchLinkSchema` — all fields fully resolved with defaults applied. This is the type received by the component implementation. |
| `prefetchLinkSchema` | variable | `src/ui/components/navigation/prefetch-link/schema.ts` | Zod schema for `<PrefetchLink>` config.  `<PrefetchLink>` is a prefetch primitive that renders a plain `<a>` tag and automatically injects `<link rel="prefetch">` tags for the route's JS chunks and CSS files when the user hovers over the link or when it enters the viewport.  It is not a router-aware component — consumers wire their own router. This avoids a peer dependency on TanStack Router. |
| `PresenceIndicator` | function | `src/ui/components/communication/presence-indicator/component.tsx` | PresenceIndicator — displays online/offline/away/busy/dnd status with a colored dot and optional label. |
| `PresenceIndicatorConfig` | typealias | `src/ui/components/communication/presence-indicator/types.ts` | Inferred config type from the PresenceIndicator Zod schema. |
| `presenceIndicatorConfigSchema` | variable | `src/ui/components/communication/presence-indicator/schema.ts` | Zod config schema for the PresenceIndicator component. Displays an online/offline/away/busy/dnd status dot with optional label. |
| `PushConfig` | typealias | `src/ui/manifest/types.ts` | Resolved runtime view of `pushConfigSchema`. |
| `pushConfigSchema` | variable | `src/ui/manifest/schema.ts` | Manifest push-notification runtime configuration. |
| `QuickAdd` | function | `src/ui/components/forms/quick-add/component.tsx` | QuickAdd component — a config-driven inline creation bar for quick item entry. Renders a horizontal bar with an optional icon, text input, and submit button. Enter key submits by default. Dispatches `submitAction` with `{ value }` payload and publishes the current input value. |
| `QuickAddConfig` | typealias | `src/ui/components/forms/quick-add/types.ts` | Inferred config type from the QuickAdd Zod schema. |
| `quickAddConfigSchema` | variable | `src/ui/components/forms/quick-add/schema.ts` | Zod config schema for the QuickAdd component. Defines all manifest-settable fields for an inline creation bar that allows quick item entry with a text input and submit button. |
| `RadiusScale` | typealias | `src/ui/tokens/types.ts` | Border radius scale. |
| `radiusSchema` | variable | `src/ui/tokens/schema.ts` | Zod schema for border radius scale. |
| `ReactionBar` | function | `src/ui/components/communication/reaction-bar/component.tsx` | ReactionBar — displays emoji reactions with counts and an optional add button that opens an emoji picker popover. |
| `ReactionBarConfig` | typealias | `src/ui/components/communication/reaction-bar/types.ts` | Inferred config type from the ReactionBar Zod schema. |
| `reactionBarConfigSchema` | variable | `src/ui/components/communication/reaction-bar/schema.ts` | Zod config schema for the ReactionBar component. Displays emoji reactions with counts and an add button. |
| `readPersistedState` | function | `src/ui/state/persist.ts` | Read and JSON-decode a persisted state value, returning `undefined` on failure or absence. |
| `RefreshAction` | interface | `src/ui/actions/types.ts` | Re-fetch a component's data. |
| `refreshActionSchema` | variable | `src/ui/actions/types.ts` | Schema for refresh action. |
| `registerAnalyticsProvider` | function | `src/ui/analytics/registry.ts` | Register a custom analytics provider factory by name. |
| `registerBuiltInComponents` | function | `src/ui/components/register.ts` | Register all built-in config-driven components with the manifest system. The function is idempotent so boot code can call it safely without worrying about duplicate registrations. |
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
| `resourceConfigSchema` | variable | `src/ui/manifest/resources.ts` | Schema for a manifest resource declaration. |
| `resourceRefSchema` | variable | `src/ui/manifest/resources.ts` | Reference to a named manifest resource with optional parameter overrides. |
| `Responsive` | typealias | `src/ui/tokens/types.ts` | A breakpoint-aware value. Flat value or responsive map. |
| `RetryWorkflowNode` | interface | `src/ui/workflows/types.ts` | Retry a workflow definition with optional delay and backoff. |
| `RichInput` | function | `src/ui/components/content/rich-input/component.tsx` | RichInput component — TipTap-based WYSIWYG editor for chat messages, comments, and posts. Users see formatted text as they type. Publishes `{ html, text, mentions }` to the page context when content changes. |
| `RichInputConfig` | typealias | `src/ui/components/content/rich-input/types.ts` | Inferred config type from the RichInput Zod schema. |
| `richInputConfigSchema` | variable | `src/ui/components/content/rich-input/schema.ts` | Zod config schema for the RichInput component. A TipTap-based WYSIWYG editor for chat messages, comments, and posts. Users see formatted text as they type (bold, italic, mentions, etc.) rather than raw markdown. |
| `RichTextEditor` | function | `src/ui/components/content/rich-text-editor/component.tsx` | RichTextEditor component — a CodeMirror 6-based markdown editor with toolbar, preview pane, and split view support.  Fetches initial content from config or via from-ref, publishes the current markdown content to the page context when the editor has an id. |
| `RichTextEditorConfig` | typealias | `src/ui/components/content/rich-text-editor/types.ts` | Inferred config type from the RichTextEditor Zod schema. |
| `richTextEditorConfigSchema` | variable | `src/ui/components/content/rich-text-editor/schema.ts` | Zod config schema for the RichTextEditor component. Defines all manifest-settable fields for a CodeMirror 6-based markdown editor with toolbar, preview pane, and split view support. |
| `RouteConfig` | typealias | `src/ui/manifest/types.ts` | Resolved runtime view of `routeConfigSchema`. |
| `routeConfigSchema` | variable | `src/ui/manifest/schema.ts` | Recursive schema for a manifest route tree node. |
| `RouteGuard` | typealias | `src/ui/manifest/types.ts` | Resolved runtime view of `routeGuardSchema`. |
| `RouteGuardConfig` | typealias | `src/ui/manifest/types.ts` | Resolved runtime view of `routeGuardConfigSchema`. |
| `routeGuardConfigSchema` | variable | `src/ui/manifest/schema.ts` | Object-form route guard schema with auth, role, and policy controls. |
| `routeGuardSchema` | variable | `src/ui/manifest/schema.ts` | Route guard schema, accepting either a named guard or inline guard config. |
| `RouteMatch` | interface | `src/ui/manifest/types.ts` | Resolved route match for the current pathname. |
| `RouteRuntimeProvider` | function | `src/ui/manifest/runtime.tsx` | Provide route runtime state to manifest-rendered components. |
| `routeTransitionSchema` | variable | `src/ui/manifest/schema.ts` | Schema for route transition metadata. |
| `RowAction` | typealias | `src/ui/components/data/data-table/types.ts` | Inferred row action type. |
| `rowActionSchema` | variable | `src/ui/components/data/data-table/schema.ts` | Schema for a per-row action button. |
| `RowConfig` | interface | `src/ui/manifest/types.ts` | Runtime config for the built-in `row` layout component. |
| `rowConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the built-in `row` layout component. |
| `RuntimeStateConfig` | interface | `src/ui/state/types.ts` | Named state definition from the manifest. App-scope state persists for the app lifetime. Route-scope state is recreated whenever the active route changes. |
| `runWorkflow` | function | `src/ui/workflows/engine.ts` | Execute a workflow definition against the supplied runtime hooks and mutable context. |
| `RunWorkflowAction` | interface | `src/ui/actions/types.ts` | Run a named manifest workflow. |
| `runWorkflowActionSchema` | variable | `src/ui/actions/types.ts` | Schema for run-workflow action. |
| `SaveIndicator` | function | `src/ui/components/data/save-indicator/component.tsx` | SaveIndicator component — a config-driven inline status indicator showing idle, saving, saved, or error states. - idle: nothing rendered - saving: spinning loader icon + saving text - saved: check icon + saved text (success color) - error: alert-circle icon + error text (destructive color) |
| `SaveIndicatorConfig` | typealias | `src/ui/components/data/save-indicator/types.ts` | Inferred config type from the SaveIndicator Zod schema. |
| `saveIndicatorConfigSchema` | variable | `src/ui/components/data/save-indicator/schema.ts` | Zod config schema for the SaveIndicator component. Defines all manifest-settable fields for a save status indicator that shows idle, saving, saved, or error states. |
| `ScrollArea` | function | `src/ui/components/data/scroll-area/component.tsx` | ScrollArea component — a scrollable container with custom-styled thin scrollbars. Supports vertical, horizontal, or bidirectional scrolling. Scrollbar visibility can be always, hover-only, or auto. Uses a scoped `<style>` tag for webkit scrollbar pseudo-element styling. |
| `ScrollAreaConfig` | typealias | `src/ui/components/data/scroll-area/types.ts` | Inferred config type for the ScrollArea component. |
| `scrollAreaConfigSchema` | variable | `src/ui/components/data/scroll-area/schema.ts` | Zod config schema for the ScrollArea component. A scrollable container with custom-styled thin scrollbars that respect the design token system. |
| `ScrollToAction` | interface | `src/ui/actions/types.ts` | Show a toast notification. |
| `scrollToActionSchema` | variable | `src/ui/actions/types.ts` | Schema for the `scroll-to` action. |
| `SelectConfig` | typealias | `src/ui/manifest/types.ts` | Resolved runtime view of `selectConfigSchema`. |
| `selectConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for the built-in `select` component. |
| `Separator` | function | `src/ui/components/data/separator/component.tsx` | Separator component — a simple visual divider line (horizontal or vertical). Renders a thin line using the border color token. When a label is provided, it renders centered text flanked by lines on each side (common for "or" dividers, date separators, etc.). |
| `SeparatorConfig` | typealias | `src/ui/components/data/separator/types.ts` | Inferred config type for the Separator component. |
| `separatorConfigSchema` | variable | `src/ui/components/data/separator/schema.ts` | Zod config schema for the Separator component. A simple visual divider line, either horizontal or vertical. Optionally renders a centered label between the lines. |
| `SeriesConfig` | typealias | `src/ui/components/data/chart/types.ts` | Inferred type for a single chart series config. |
| `seriesConfigSchema` | variable | `src/ui/components/data/chart/schema.ts` | Schema for a single data series in the chart. |
| `settingsPage` | function | `src/ui/presets/settings-page.ts` | Builds a manifest `PageConfig` for a settings page.  Consumers drop the result into their manifest's `pages` record:  ```ts const manifest = {   pages: {     "/settings": settingsPage({       title: "Settings",       sections: [         {           label: "Profile",           submitEndpoint: "PATCH /api/me/profile",           dataEndpoint: "GET /api/me/profile",           fields: [             { key: "name", type: "text", label: "Name", required: true },             { key: "bio", type: "textarea", label: "Bio" },           ],         },         {           label: "Password",           submitEndpoint: "POST /api/me/password",           fields: [             { key: "currentPassword", type: "password", label: "Current Password", required: true },             { key: "newPassword", type: "password", label: "New Password", required: true },           ],         },       ],     }),   }, }; ``` |
| `SettingsPageOptions` | interface | `src/ui/presets/types.ts` | Options for the `settingsPage` preset factory. Produces a settings page with a tab per section, each containing an AutoForm. |
| `settingsPresetConfigSchema` | variable | `src/ui/presets/schemas.ts` | Validate preset config for a settings page composed from one or more submitted sections. |
| `SettingsSectionDef` | interface | `src/ui/presets/types.ts` | A single settings section (one tab in the settings page). |
| `SetValueAction` | interface | `src/ui/actions/types.ts` | Set another component's published value. |
| `setValueActionSchema` | variable | `src/ui/actions/types.ts` | Schema for set-value action. |
| `ShowToastOptions` | interface | `src/ui/actions/toast.tsx` | User-facing toast options accepted by the toast manager. |
| `Slider` | function | `src/ui/components/forms/slider/component.tsx` | Render a manifest-driven slider input. |
| `SliderConfig` | typealias | `src/ui/components/forms/slider/types.ts` | Config for the manifest-driven slider component. |
| `sliderConfigSchema` | variable | `src/ui/components/forms/slider/schema.ts` | Schema for single-value and ranged slider controls with optional value display/actions. |
| `SnapshotApiContext` | variable | `src/ui/actions/executor.ts` | API client context consumed by built-in `api`, `download`, and related runtime actions. |
| `SnapshotImage` | function | `src/ui/components/media/image/component.tsx` | Render a manifest-driven image component with Snapshot styling tokens. |
| `SnapshotImageConfig` | typealias | `src/ui/components/media/image/types.ts` | Inferred config type from the SnapshotImage Zod schema. This is the single source of truth for what props the `<SnapshotImage>` component accepts. Never define this type manually. |
| `snapshotImageSchema` | variable | `src/ui/components/media/image/schema.ts` | Schema for optimized image components rendered through Snapshot's image route. |
| `SortState` | interface | `src/ui/components/data/data-table/types.ts` | Sort state for the data table. |
| `SpacingScale` | typealias | `src/ui/tokens/types.ts` | Spacing density. Affects padding, gaps, and margins globally. |
| `spacingSchema` | variable | `src/ui/tokens/schema.ts` | Zod schema for spacing density. |
| `StatCard` | function | `src/ui/components/data/stat-card/component.tsx` | StatCard component — a data-fetching card that displays a single metric with optional trend indicator.  Fetches data from the configured endpoint, formats the value according to the format config, and optionally shows a trend arrow with color coding based on sentiment. |
| `StatCardConfig` | typealias | `src/ui/components/data/stat-card/types.ts` | Inferred config type from the StatCard Zod schema. |
| `statCardConfigSchema` | variable | `src/ui/components/data/stat-card/schema.ts` | Zod config schema for the StatCard component.  Defines all manifest-settable fields for a stat card that displays a single metric with optional trend indicator. |
| `StatDef` | interface | `src/ui/presets/types.ts` | A single stat card definition for the dashboard page. |
| `StateConfig` | typealias | `src/ui/manifest/types.ts` | Named manifest state map keyed by state id. |
| `StateConfigMap` | typealias | `src/ui/state/types.ts` | Map of named state definitions declared by the manifest runtime. |
| `StateHookScope` | typealias | `src/ui/state/hooks.ts` | Hook-level scope override that can force app, route, or auto-discovered state resolution. |
| `StateProviderProps` | interface | `src/ui/state/types.ts` | Props accepted by the provider layer that wires manifest state into a React tree. |
| `StateScope` | typealias | `src/ui/state/types.ts` | Lifetime scope for manifest state: shared across the app or recreated per route. |
| `StateValueConfig` | typealias | `src/ui/manifest/types.ts` | Runtime state declaration for a single named manifest state value. |
| `stateValueConfigSchema` | variable | `src/ui/manifest/schema.ts` | Schema for a named manifest state value declaration. |
| `TabConfig` | typealias | `src/ui/components/navigation/tabs/schema.ts` | Inferred type for a single tab config. |
| `tabConfigSchema` | variable | `src/ui/components/navigation/tabs/schema.ts` | Schema for a single tab within the tabs component. |
| `TabsComponent` | function | `src/ui/components/navigation/tabs/component.tsx` | Tabs component — renders a tab bar with content panels.  Each tab's content is rendered via ComponentRenderer for recursive composition. Publishes `{ activeTab, label }` when the component has an id. Lazy-renders tab content: only mounts a tab when first activated, then keeps it mounted. |
| `TabsConfig` | typealias | `src/ui/components/navigation/tabs/schema.ts` | Inferred type for tabs config. |
| `tabsConfigSchema` | variable | `src/ui/components/navigation/tabs/schema.ts` | Zod schema for tabs component config. Tabs provide in-page navigation between content panels. Each tab's content is rendered via ComponentRenderer. |
| `TagSelector` | function | `src/ui/components/forms/tag-selector/component.tsx` | TagSelector component — a tag input for selecting and creating tags. Displays selected tags as colored pills with remove buttons. Includes a text input for searching available tags and optionally creating new ones. |
| `TagSelectorConfig` | typealias | `src/ui/components/forms/tag-selector/types.ts` | Inferred config type from the TagSelector Zod schema. |
| `tagSelectorConfigSchema` | variable | `src/ui/components/forms/tag-selector/schema.ts` | Zod config schema for the TagSelector component. A tag input that allows selecting from predefined tags or creating new ones. Tags display as colored pills with remove buttons. |
| `Textarea` | function | `src/ui/components/forms/textarea/component.tsx` | Config-driven Textarea component — a multi-line text input with label, character count, validation, and configurable resize. Publishes `{ value: string }` to the page context when an `id` is set. Shows a character count indicator when `maxLength` is configured. |
| `TextareaConfig` | typealias | `src/ui/components/forms/textarea/types.ts` | Inferred config type from the Textarea Zod schema. |
| `textareaConfigSchema` | variable | `src/ui/components/forms/textarea/schema.ts` | Zod config schema for the Textarea component. Defines a multi-line text input with label, character count, validation, and configurable resize behavior. |
| `ThemeColors` | typealias | `src/ui/tokens/types.ts` | Semantic color tokens. Each generates a CSS custom property. |
| `themeColorsSchema` | variable | `src/ui/tokens/schema.ts` | Zod schema for semantic color tokens. Each generates a CSS custom property. |
| `ThemeConfig` | typealias | `src/ui/tokens/types.ts` | Theme configuration in the manifest. |
| `themeConfigSchema` | variable | `src/ui/tokens/schema.ts` | Zod schema for the full theme configuration in the manifest. |
| `throttleAction` | function | `src/ui/actions/timing.ts` | Throttle async or sync action execution by key and drop calls inside the active throttle window. |
| `ToastAction` | interface | `src/ui/actions/types.ts` | Show a toast notification. |
| `toastActionSchema` | variable | `src/ui/actions/types.ts` | Schema for toast action. Uses z.lazy() for recursive action. |
| `ToastConfig` | typealias | `src/ui/manifest/types.ts` | Resolved runtime view of `toastConfigSchema`. |
| `toastConfigSchema` | variable | `src/ui/manifest/schema.ts` | Manifest toast defaults used by the `toast` action runtime. |
| `ToastContainer` | function | `src/ui/actions/toast.tsx` | Render the active toast queue using runtime-configured placement defaults. |
| `ToastItem` | interface | `src/ui/actions/toast.tsx` | Resolved toast entry stored in the runtime queue. |
| `ToastManager` | interface | `src/ui/actions/toast.tsx` | Imperative API for enqueueing and dismissing transient toast messages. |
| `Toggle` | function | `src/ui/components/forms/toggle/component.tsx` | Config-driven Toggle component — a pressed/unpressed toggle button. When pressed, displays with primary background and foreground colors. When unpressed, uses transparent background. Publishes `{ pressed: boolean }` to the page context when an `id` is set. |
| `ToggleConfig` | typealias | `src/ui/components/forms/toggle/types.ts` | Inferred config type from the Toggle Zod schema. |
| `toggleConfigSchema` | variable | `src/ui/components/forms/toggle/schema.ts` | Zod config schema for the Toggle component. Defines a pressed/unpressed toggle button that publishes its state. Can display text, an icon, or both. |
| `TokenEditor` | interface | `src/ui/tokens/types.ts` | Return type of useTokenEditor(). |
| `toPersistedStateKey` | function | `src/ui/state/persist.ts` | Build the storage key used for persisted Snapshot state entries. |
| `TouchedFields` | typealias | `src/ui/components/forms/auto-form/types.ts` | Tracks which fields have been interacted with. |
| `TrackAction` | interface | `src/ui/actions/types.ts` | Track an analytics event through all manifest-configured providers. |
| `trackActionSchema` | variable | `src/ui/actions/types.ts` | Schema for track action. |
| `TransitionWrapper` | function | `src/ui/manifest/transition-wrapper.tsx` | Apply enter transitions around routed content when a route transition config is present. |
| `trendConfigSchema` | variable | `src/ui/components/data/stat-card/schema.ts` | Schema for the trend indicator configuration. |
| `TryWorkflowNode` | interface | `src/ui/workflows/types.ts` | Execute a workflow definition with optional catch and finally handlers. |
| `TypingIndicator` | function | `src/ui/components/communication/typing-indicator/component.tsx` | TypingIndicator — shows animated bouncing dots with user names to indicate who is currently typing. |
| `TypingIndicatorConfig` | typealias | `src/ui/components/communication/typing-indicator/types.ts` | Inferred config type from the TypingIndicator Zod schema. |
| `typingIndicatorConfigSchema` | variable | `src/ui/components/communication/typing-indicator/schema.ts` | Zod config schema for the TypingIndicator component. Displays an animated "User is typing..." indicator with bouncing dots. |
| `UI_BREAKPOINTS` | variable | `src/ui/hooks/use-breakpoint.ts` | Breakpoint pixel thresholds (mobile-first, min-width). |
| `useActionExecutor` | function | `src/ui/actions/executor.ts` | Return the action executor bound to the active runtime, registries, overlays, workflows, and optional API client. |
| `useAutoBreadcrumbs` | function | `src/ui/hooks/use-auto-breadcrumbs.ts` | Resolve auto-generated breadcrumb items for the current route match. |
| `useAutoForm` | function | `src/ui/components/forms/auto-form/hook.ts` | Headless hook for form state management.  Tracks field values, validation errors, and touched state. Validates on blur (per-field) and on submit (all fields). |
| `UseAutoFormResult` | interface | `src/ui/components/forms/auto-form/types.ts` | Return type for the useAutoForm headless hook. |
| `useBreakpoint` | function | `src/ui/hooks/use-breakpoint.ts` | Returns the currently active breakpoint based on window width. Uses `matchMedia` for efficient, event-driven updates (no resize polling). Returns `"default"` during SSR. |
| `useComponentData` | function | `src/ui/components/_base/use-component-data.ts` | Shared data-fetching hook for config-driven components.  Parses a data config string like `"GET /api/stats/revenue"` into method + endpoint, resolves any `FromRef` values in params via `useSubscribe`, and fetches data using the API client from `SnapshotApiContext`.  When the API client is not available (e.g., in tests or before ManifestApp provides it), the hook returns a loading state without throwing. |
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
| `useWizard` | function | `src/ui/components/forms/wizard/hook.ts` | Manage wizard step state, validation, submission, and transition flow. |
| `UseWizardResult` | interface | `src/ui/components/forms/wizard/types.ts` | Return type of the useWizard headless hook. |
| `validateContrast` | function | `src/ui/tokens/contrast-checker.ts` | Warn when manifest theme color pairs fail WCAG AA contrast. |
| `WaitWorkflowNode` | interface | `src/ui/workflows/types.ts` | Pause workflow execution for a duration in milliseconds. |
| `Wizard` | function | `src/ui/components/forms/wizard/component.tsx` | Render a multi-step form wizard with built-in validation, step state, and slot-aware styling. |
| `WizardConfig` | typealias | `src/ui/components/forms/wizard/types.ts` | Inferred type for the Wizard component configuration. |
| `wizardSchema` | variable | `src/ui/components/forms/wizard/schema.ts` | Zod schema for the Wizard component configuration.  A multi-step form flow. Each step collects fields independently. On the final step, all accumulated data is submitted to `submitEndpoint` (if set) and published to the page context via `id`. |
| `WizardStepConfig` | typealias | `src/ui/components/forms/wizard/types.ts` | Inferred type for a single wizard step configuration. |
| `wizardStepSchema` | variable | `src/ui/components/forms/wizard/schema.ts` | Schema for a single wizard step. |
| `WorkflowActionHandler` | typealias | `src/ui/workflows/types.ts` | Handler signature for registered custom workflow actions. |
| `WorkflowCondition` | interface | `src/ui/workflows/types.ts` | Simple conditional expression used by workflow nodes. |
| `WorkflowConditionOperator` | typealias | `src/ui/workflows/types.ts` | Supported condition operators for manifest workflows. |
| `workflowConditionSchema` | variable | `src/ui/workflows/schema.ts` | Schema for conditional expressions used by workflow control-flow nodes. |
| `WorkflowDefinition` | typealias | `src/ui/workflows/types.ts` | A single workflow node or a sequential list of nodes. |
| `workflowDefinitionSchema` | variable | `src/ui/workflows/schema.ts` | Schema for a workflow definition expressed as one node or a sequential node list. |
| `WorkflowMap` | typealias | `src/ui/workflows/types.ts` | Named workflow map keyed by workflow id. |
| `WorkflowNode` | typealias | `src/ui/workflows/types.ts` | Any node that can appear inside a workflow definition. |
| `workflowNodeSchema` | variable | `src/ui/workflows/schema.ts` | Recursive schema describing every built-in workflow node and action node shape. |
| `writePersistedState` | function | `src/ui/state/persist.ts` | Serialize and store a persisted state value, ignoring browser storage failures. |
