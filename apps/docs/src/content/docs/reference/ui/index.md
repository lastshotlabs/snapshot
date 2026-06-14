---
title: UI Reference
description: Generated from src/ui.ts and the declarations it re-exports.
draft: false
---

Generated from `src/ui.ts`.

## Contents

- [Tokens & Flavors](#tokens-flavors) (18)
- [Context & Data Binding](#context-data-binding) (11)
- [State Runtime](#state-runtime) (15)
- [Actions](#actions) (15)
- [Components — Data](#components-data) (61)
- [Components — Forms](#components-forms) (83)
- [Components — Communication](#components-communication) (23)
- [Components — Content](#components-content) (30)
- [Components — Overlay](#components-overlay) (29)
- [Components — Navigation](#components-navigation) (17)
- [Components — Layout](#components-layout) (44)
- [Components — Media](#components-media) (8)
- [Components — Primitives](#components-primitives) (19)
- [Component Utilities](#component-utilities) (4)
- [Hooks & Utilities](#hooks-utilities) (12)
- [Icons](#icons) (3)
- [Other](#other) (63)

<details>
<summary><strong>All exports (alphabetical)</strong></summary>

| Export | Kind | Source | Description |
|---|---|---|---|
| `AccordionBase` | function | `src/ui/components/navigation/accordion/standalone.tsx` | Standalone Accordion — an expandable/collapsible panel list with plain React children. Works with plain React props. |
| `AccordionBaseItem` | interface | `src/ui/components/navigation/accordion/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `AccordionBaseProps` | interface | `src/ui/components/navigation/accordion/standalone.tsx` | Props accepted by the AccordionBase standalone component. |
| `ActionConfig` | typealias | `../frontend-contract/src/actions/types.ts` | Configuration type for action config. |
| `ActionExecuteFn` | typealias | `../frontend-contract/src/actions/types.ts` | Type definition exported by the Snapshot UI runtime. |
| `AlertBase` | function | `src/ui/components/data/alert/standalone.tsx` | Standalone Alert — a styled alert/notification box with optional icon, action button, and dismiss. Works with plain React props. |
| `AlertBaseProps` | interface | `src/ui/components/data/alert/standalone.tsx` | Props accepted by the AlertBase standalone component. |
| `AppContextProvider` | function | `src/ui/context/providers.tsx` | Provides persistent global state that survives route changes. Initializes globals from runtime config. |
| `AppContextProviderProps` | interface | `src/ui/context/types.ts` | Props for AppContextProvider. Wraps the entire app to provide persistent global state. |
| `AtomRegistry` | interface | `src/ui/state/types.ts` | Registry of named state atoms. Backing store is shared per scope (app or route). |
| `AuditLogBase` | function | `src/ui/components/workflow/audit-log/standalone.tsx` | Standalone AuditLogBase — renders a filterable, paginated timeline of audit log entries with user avatars, relative timestamps, and expandable detail panels. Works with plain React props. |
| `AuditLogBaseProps` | interface | `src/ui/components/workflow/audit-log/standalone.tsx` | Props accepted by the AuditLogBase standalone component. |
| `AuditLogFilterEntry` | interface | `src/ui/components/workflow/audit-log/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `AutoFormBase` | function | `src/ui/components/forms/auto-form/standalone.tsx` | Standalone AutoFormBase -- renders a schema-driven form with fields, sections, validation, and submit/reset actions. Works with plain React props. |
| `AutoFormBaseProps` | interface | `src/ui/components/forms/auto-form/standalone.tsx` | Props accepted by the AutoFormBase standalone component. |
| `AutoFormFieldConfig` | interface | `src/ui/components/forms/auto-form/standalone.tsx` | Configuration type for auto form field config. |
| `AutoFormFieldOption` | interface | `src/ui/components/forms/auto-form/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `AutoFormFieldValidation` | interface | `src/ui/components/forms/auto-form/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `AutoFormSectionConfig` | interface | `src/ui/components/forms/auto-form/standalone.tsx` | Configuration type for auto form section config. |
| `AvatarBase` | function | `src/ui/components/data/avatar/standalone.tsx` | Standalone Avatar — image, initials, or icon fallback. Works with plain React props. |
| `AvatarBaseProps` | interface | `src/ui/components/data/avatar/standalone.tsx` | Props accepted by the AvatarBase standalone component. |
| `AvatarGroupBase` | function | `src/ui/components/data/avatar-group/standalone.tsx` | Standalone AvatarGroup — overlapping avatars with +N overflow. Works with plain React props. |
| `AvatarGroupBaseAvatar` | interface | `src/ui/components/data/avatar-group/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `AvatarGroupBaseProps` | interface | `src/ui/components/data/avatar-group/standalone.tsx` | Props accepted by the AvatarGroupBase standalone component. |
| `BadgeBase` | function | `src/ui/components/data/badge/standalone.tsx` | Standalone Badge — a small label with color-coded variants. Works with plain React props. |
| `BadgeBaseProps` | interface | `src/ui/components/data/badge/standalone.tsx` | Props accepted by the BadgeBase standalone component. |
| `BannerBase` | function | `src/ui/components/content/banner/standalone.tsx` | Standalone Banner — a full-width hero section with background, overlay, and content alignment. Works with plain React props. |
| `BannerBaseProps` | interface | `src/ui/components/content/banner/standalone.tsx` | Props accepted by the BannerBase standalone component. |
| `BoxBase` | function | `src/ui/components/layout/box/standalone.tsx` | Standalone Box -- a generic container element with configurable HTML tag. Works with plain React props. |
| `BoxBaseProps` | interface | `src/ui/components/layout/box/standalone.tsx` | Props accepted by the BoxBase standalone component. |
| `BreadcrumbBase` | function | `src/ui/components/navigation/breadcrumb/standalone.tsx` | Standalone Breadcrumb — a navigation trail rendered with plain React props. Works with plain React props. |
| `BreadcrumbBaseItem` | interface | `src/ui/components/navigation/breadcrumb/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `BreadcrumbBaseProps` | interface | `src/ui/components/navigation/breadcrumb/standalone.tsx` | Props accepted by the BreadcrumbBase standalone component. |
| `Breakpoint` | typealias | `src/ui/hooks/use-breakpoint.ts` | All breakpoint names including `"default"` (below `sm`). |
| `buildEmojiMap` | function | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | Builds a shortcode lookup map from an array of custom emojis. |
| `buildRequestUrl` | function | `../frontend-contract/src/resources/index.ts` | Function exported by the Snapshot UI runtime. |
| `ButtonBase` | function | `src/ui/components/forms/button/standalone.tsx` | Standalone ButtonBase -- a styled button that works with plain React props. Works with plain React props. |
| `ButtonBaseProps` | interface | `src/ui/components/forms/button/standalone.tsx` | Props accepted by the ButtonBase standalone component. |
| `ButtonControl` | function | `src/ui/components/forms/button/control.tsx` | Low-level styled button element with surface resolution and accessibility attributes. Used internally by ButtonBase and other components that need a styled `<button>`. Works with plain React props. |
| `ButtonControlProps` | interface | `src/ui/components/forms/button/types.ts` | Props accepted by the ButtonControl component. |
| `CalendarBase` | function | `src/ui/components/workflow/calendar/standalone.tsx` | Standalone CalendarBase — renders a month or week calendar grid with event pills, navigation controls, and optional week numbers. Works with plain React props. |
| `CalendarBaseProps` | interface | `src/ui/components/workflow/calendar/standalone.tsx` | Props accepted by the CalendarBase standalone component. |
| `CalendarEventEntry` | interface | `src/ui/components/workflow/calendar/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `CardBase` | function | `src/ui/components/layout/card/standalone.tsx` | Standalone Card — a styled container with optional title/subtitle and standard React children. Works with plain React props. |
| `CardBaseProps` | interface | `src/ui/components/layout/card/standalone.tsx` | Props accepted by the CardBase standalone component. |
| `CarouselBase` | function | `src/ui/components/media/carousel/standalone.tsx` | Standalone CarouselBase — renders a slide carousel with auto-play, arrow navigation, and dot indicators. Pauses on hover. Works with plain React props. |
| `CarouselBaseProps` | interface | `src/ui/components/media/carousel/standalone.tsx` | Props accepted by the CarouselBase standalone component. |
| `ChartBase` | function | `src/ui/components/data/chart/standalone.tsx` | Standalone Chart — renders data-driven charts via recharts. Works with plain React props. |
| `ChartBaseProps` | interface | `src/ui/components/data/chart/standalone.tsx` | Props accepted by the ChartBase standalone component. |
| `ChartBaseSeries` | interface | `src/ui/components/data/chart/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `ChatWindowBase` | function | `src/ui/components/communication/chat-window/standalone.tsx` | Standalone ChatWindow — composable chat container with header, message thread, typing indicator, and input slots. Works with plain React props. |
| `ChatWindowBaseProps` | interface | `src/ui/components/communication/chat-window/standalone.tsx` | Props accepted by the ChatWindowBase standalone component. |
| `clearPersistedState` | function | `src/ui/state/persist.ts` | Remove a persisted state value from the selected browser storage area. |
| `CodeBase` | function | `src/ui/components/content/code/standalone.tsx` | Standalone Code — an inline code element for displaying code snippets within flowing text. Works with plain React props. |
| `CodeBaseProps` | interface | `src/ui/components/content/code/standalone.tsx` | Props accepted by the CodeBase standalone component. |
| `CodeBlockBase` | function | `src/ui/components/content/code-block/standalone.tsx` | Standalone CodeBlock — displays code with syntax highlighting, optional line numbers, copy button, and title bar. Works with plain React props. |
| `CodeBlockBaseProps` | interface | `src/ui/components/content/code-block/standalone.tsx` | Props accepted by the CodeBlockBase standalone component. |
| `CollapsibleBase` | function | `src/ui/components/layout/collapsible/standalone.tsx` | Standalone Collapsible -- an animated expand/collapse container with an optional trigger. Works with plain React props. |
| `CollapsibleBaseProps` | interface | `src/ui/components/layout/collapsible/standalone.tsx` | Props accepted by the CollapsibleBase standalone component. |
| `collectDependentResources` | function | `../frontend-contract/src/resources/index.ts` | Function exported by the Snapshot UI runtime. |
| `ColorPickerBase` | variable | `src/ui/components/forms/color-picker/standalone.tsx` | Exported variable from the Snapshot UI runtime. |
| `ColorPickerBaseProps` | typealias | `src/ui/components/forms/color-picker/standalone.tsx` | Props accepted by the ColorPickerBase standalone component. |
| `ColorPickerField` | function | `src/ui/components/forms/color-picker/standalone.tsx` | Standalone ColorPickerField -- a color picker with optional swatches, alpha slider, and custom hex input. Works with plain React props. |
| `ColorPickerFieldProps` | interface | `src/ui/components/forms/color-picker/standalone.tsx` | Props accepted by the ColorPickerField component. |
| `colorToOklch` | function | `src/ui/tokens/color.ts` | Convert any supported color string to OKLCH values. Supports: hex (#rgb, #rrggbb), oklch strings ("L C H"), and oklch() CSS function. |
| `ColumnBase` | function | `src/ui/components/layout/column/standalone.tsx` | Standalone Column -- a vertical flex container. Works with plain React props. |
| `ColumnBaseProps` | interface | `src/ui/components/layout/column/standalone.tsx` | Props accepted by the ColumnBase standalone component. |
| `CommandPaletteBase` | function | `src/ui/components/overlay/command-palette/standalone.tsx` | Standalone CommandPalette — a search-driven command list with keyboard navigation. Works with plain React props. |
| `CommandPaletteBaseGroup` | interface | `src/ui/components/overlay/command-palette/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `CommandPaletteBaseItem` | interface | `src/ui/components/overlay/command-palette/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `CommandPaletteBaseProps` | interface | `src/ui/components/overlay/command-palette/standalone.tsx` | Props accepted by the CommandPaletteBase standalone component. |
| `CommentSectionBase` | function | `src/ui/components/communication/comment-section/standalone.tsx` | Standalone CommentSection — threaded comment list with avatars, timestamps, optional delete actions, and a composable input slot. Works with plain React props. |
| `CommentSectionBaseProps` | interface | `src/ui/components/communication/comment-section/standalone.tsx` | Props accepted by the CommentSectionBase standalone component. |
| `CompareViewBase` | function | `src/ui/components/content/compare-view/standalone.tsx` | Standalone CompareView — a side-by-side diff viewer for comparing two text blocks. Works with plain React props. |
| `CompareViewBaseProps` | interface | `src/ui/components/content/compare-view/standalone.tsx` | Props accepted by the CompareViewBase standalone component. |
| `ComponentDataResult` | interface | `src/ui/components/_base/use-component-data.ts` | Result returned by `useComponentData`. Provides the fetched data, loading/error states, and a refetch function. |
| `ComponentGroupBase` | function | `src/ui/components/_base/component-group/standalone.tsx` | Standalone ComponentGroup — a simple wrapper for pre-rendered group content. Works with plain React props. |
| `ComponentGroupBaseProps` | interface | `src/ui/components/_base/component-group/standalone.tsx` | Props accepted by the ComponentGroupBase standalone component. |
| `ComponentTokens` | typealias | `../frontend-contract/src/tokens/types.ts` | Type definition exported by the Snapshot UI runtime. |
| `ConfirmDialog` | function | `src/ui/actions/confirm.tsx` | Render the global confirmation dialog for requests queued through `useConfirmManager`. |
| `ConfirmDialogBase` | function | `src/ui/components/overlay/confirm-dialog/standalone.tsx` | Standalone ConfirmDialog — a confirmation dialog built on ModalBase with plain React props. Works with plain React props. |
| `ConfirmDialogBaseProps` | interface | `src/ui/components/overlay/confirm-dialog/standalone.tsx` | Props accepted by the ConfirmDialogBase standalone component. |
| `ConfirmManager` | interface | `src/ui/actions/confirm.tsx` | Imperative API for opening a confirmation dialog from app actions or custom UI. |
| `ConfirmOptions` | typealias | `src/ui/actions/confirm.tsx` | Options accepted when opening a confirmation dialog. |
| `ConfirmRequest` | interface | `src/ui/actions/confirm.tsx` | Internal confirm-dialog request stored in the atom-backed manager queue. |
| `ContainerBase` | function | `src/ui/components/layout/container/standalone.tsx` | Standalone Container -- a centered, max-width-constrained wrapper. Works with plain React props. |
| `ContainerBaseProps` | interface | `src/ui/components/layout/container/standalone.tsx` | Props accepted by the ContainerBase standalone component. |
| `ContextMenuBase` | function | `src/ui/components/overlay/context-menu/standalone.tsx` | Standalone ContextMenu — a right-click context menu with plain React props. Works with plain React props. |
| `ContextMenuBaseEntry` | typealias | `src/ui/components/overlay/context-menu/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `ContextMenuBaseItem` | interface | `src/ui/components/overlay/context-menu/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `ContextMenuBaseLabel` | interface | `src/ui/components/overlay/context-menu/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `ContextMenuBaseProps` | interface | `src/ui/components/overlay/context-menu/standalone.tsx` | Props accepted by the ContextMenuBase standalone component. |
| `ContextMenuBaseSeparator` | interface | `src/ui/components/overlay/context-menu/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `contrastRatio` | function | `src/ui/tokens/color.ts` | Calculate the WCAG contrast ratio between two supported color values. |
| `CUSTOM_EMOJI_CSS` | variable | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | CSS for custom emoji sizing. Custom emojis render as inline images sized to match surrounding text. |
| `CustomEmoji` | interface | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | Shape of a custom emoji entry. |
| `dataSourceSchema` | variable | `../frontend-contract/src/resources/index.ts` | Zod schema for validating data source schema. |
| `DataTableBase` | function | `src/ui/components/data/data-table/standalone.tsx` | Standalone DataTable — feature-rich data table with sorting, pagination, selection, and search. Works with plain React props. |
| `DataTableBaseBulkAction` | interface | `src/ui/components/data/data-table/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `DataTableBaseColumn` | interface | `src/ui/components/data/data-table/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `DataTableBasePagination` | interface | `src/ui/components/data/data-table/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `DataTableBaseProps` | interface | `src/ui/components/data/data-table/standalone.tsx` | Props accepted by the DataTableBase standalone component. |
| `DataTableBaseRowAction` | interface | `src/ui/components/data/data-table/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `DataTableBaseSort` | interface | `src/ui/components/data/data-table/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `DatePickerBase` | variable | `src/ui/components/forms/date-picker/standalone.tsx` | Exported variable from the Snapshot UI runtime. |
| `DatePickerBaseProps` | typealias | `src/ui/components/forms/date-picker/standalone.tsx` | Props accepted by the DatePickerBase standalone component. |
| `DatePickerDisabledEntry` | interface | `src/ui/components/forms/date-picker/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `DatePickerField` | function | `src/ui/components/forms/date-picker/standalone.tsx` | Standalone DatePickerField -- date picker supporting single, range, and multiple selection modes with presets and disabled dates. Works with plain React props. |
| `DatePickerFieldProps` | interface | `src/ui/components/forms/date-picker/standalone.tsx` | Props accepted by the DatePickerField component. |
| `DatePickerPreset` | interface | `src/ui/components/forms/date-picker/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `debounceAction` | function | `src/ui/actions/timing.ts` | Debounce async or sync action execution by key and resolve all pending callers with the final invocation result. |
| `DefaultErrorBase` | function | `src/ui/components/feedback/default-error/standalone.tsx` | Standalone DefaultError — renders an error feedback card with optional retry button. Works with plain React props. |
| `DefaultErrorBaseProps` | interface | `src/ui/components/feedback/default-error/standalone.tsx` | Props accepted by the DefaultErrorBase standalone component. |
| `DefaultLoadingBase` | function | `src/ui/components/feedback/default-loading/standalone.tsx` | Standalone DefaultLoading — renders a loading spinner with label. Works with plain React props. |
| `DefaultLoadingBaseProps` | interface | `src/ui/components/feedback/default-loading/standalone.tsx` | Props accepted by the DefaultLoadingBase standalone component. |
| `DefaultNotFoundBase` | function | `src/ui/components/feedback/default-not-found/standalone.tsx` | Standalone DefaultNotFound — renders a 404 page with title and description. Works with plain React props. |
| `DefaultNotFoundBaseProps` | interface | `src/ui/components/feedback/default-not-found/standalone.tsx` | Props accepted by the DefaultNotFoundBase standalone component. |
| `DefaultOfflineBase` | function | `src/ui/components/feedback/default-offline/standalone.tsx` | Standalone DefaultOffline — renders an offline status banner. Works with plain React props. |
| `DefaultOfflineBaseProps` | interface | `src/ui/components/feedback/default-offline/standalone.tsx` | Props accepted by the DefaultOfflineBase standalone component. |
| `defineFlavor` | function | `src/ui/tokens/flavors.ts` | Define and register a new flavor. If a flavor with the same name already exists, it is replaced. |
| `deriveDarkVariant` | function | `src/ui/tokens/color.ts` | Derive a dark mode variant of a light color. Adjusts lightness and chroma for dark mode readability: - If the color is light (L > 0.5), reduce lightness moderately - If the color is dark (L <= 0.5), increase lightness for dark backgrounds - Boost chroma slightly for vibrancy in dark mode |
| `deriveForeground` | function | `src/ui/tokens/color.ts` | Derive a foreground color that passes WCAG AA contrast (4.5:1) against the given background color. Returns a light or dark foreground. |
| `DetailCardBase` | function | `src/ui/components/data/detail-card/standalone.tsx` | Standalone DetailCard — data-driven detail view with formatted fields and header actions. Works with plain React props. |
| `DetailCardBaseAction` | interface | `src/ui/components/data/detail-card/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `DetailCardBaseField` | interface | `src/ui/components/data/detail-card/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `DetailCardBaseProps` | interface | `src/ui/components/data/detail-card/standalone.tsx` | Props accepted by the DetailCardBase standalone component. |
| `detectPlatform` | function | `src/ui/components/content/link-embed/platform.ts` | Detects the platform from a URL and extracts embed info. |
| `DividerBase` | function | `src/ui/components/primitives/divider/standalone.tsx` | Standalone Divider — renders a horizontal or vertical separator line, optionally with a centered label. Works with plain React props. |
| `DividerBaseProps` | interface | `src/ui/components/primitives/divider/standalone.tsx` | Props accepted by the DividerBase standalone component. |
| `DrawerBase` | function | `src/ui/components/overlay/drawer/standalone.tsx` | Standalone Drawer — a sliding panel overlay with plain React props. Works with plain React props. |
| `DrawerBaseFooterAction` | interface | `src/ui/components/overlay/drawer/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `DrawerBaseProps` | interface | `src/ui/components/overlay/drawer/standalone.tsx` | Props accepted by the DrawerBase standalone component. |
| `DropdownMenuBase` | function | `src/ui/components/overlay/dropdown-menu/standalone.tsx` | Standalone DropdownMenu — a button-triggered floating menu with plain React props. Works with plain React props. |
| `DropdownMenuBaseEntry` | typealias | `src/ui/components/overlay/dropdown-menu/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `DropdownMenuBaseItem` | interface | `src/ui/components/overlay/dropdown-menu/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `DropdownMenuBaseLabel` | interface | `src/ui/components/overlay/dropdown-menu/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `DropdownMenuBaseProps` | interface | `src/ui/components/overlay/dropdown-menu/standalone.tsx` | Props accepted by the DropdownMenuBase standalone component. |
| `DropdownMenuBaseSeparator` | interface | `src/ui/components/overlay/dropdown-menu/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `DropdownMenuBaseTrigger` | interface | `src/ui/components/overlay/dropdown-menu/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `EmbedBase` | function | `src/ui/components/media/embed/standalone.tsx` | Standalone Embed — a responsive iframe container for embedding external content. Works with plain React props. |
| `EmbedBaseProps` | interface | `src/ui/components/media/embed/standalone.tsx` | Props accepted by the EmbedBase standalone component. |
| `EmojiPickerBase` | function | `src/ui/components/communication/emoji-picker/standalone.tsx` | Standalone EmojiPicker — searchable emoji grid with category tabs and custom emoji support. Works with plain React props. |
| `EmojiPickerBaseProps` | interface | `src/ui/components/communication/emoji-picker/standalone.tsx` | Props accepted by the EmojiPickerBase standalone component. |
| `EmptyStateBase` | function | `src/ui/components/data/empty-state/standalone.tsx` | Standalone EmptyState — a centered message with optional icon and action. Works with plain React props. |
| `EmptyStateBaseProps` | interface | `src/ui/components/data/empty-state/standalone.tsx` | Props accepted by the EmptyStateBase standalone component. |
| `EndpointTarget` | typealias | `../frontend-contract/src/resources/index.ts` | Type definition exported by the Snapshot UI runtime. |
| `endpointTargetSchema` | variable | `../frontend-contract/src/resources/index.ts` | Zod schema for validating endpoint target schema. |
| `EntityPickerBase` | function | `src/ui/components/data/entity-picker/standalone.tsx` | Standalone EntityPicker — dropdown with search, single/multi select. Works with plain React props. |
| `EntityPickerBaseProps` | interface | `src/ui/components/data/entity-picker/standalone.tsx` | Props accepted by the EntityPickerBase standalone component. |
| `EntityPickerEntity` | interface | `src/ui/components/data/entity-picker/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `ExprRef` | interface | `../frontend-contract/src/refs/from.ts` | Type definition exported by the Snapshot UI runtime. |
| `extractResourceRefs` | function | `../frontend-contract/src/resources/index.ts` | Function exported by the Snapshot UI runtime. |
| `FavoriteButtonBase` | function | `src/ui/components/data/favorite-button/standalone.tsx` | Standalone FavoriteButton — a toggle button with a star icon. Works with plain React props. |
| `FavoriteButtonBaseProps` | interface | `src/ui/components/data/favorite-button/standalone.tsx` | Props accepted by the FavoriteButtonBase standalone component. |
| `FeedBase` | function | `src/ui/components/data/feed/standalone.tsx` | Standalone Feed — feed/activity list with grouping, pagination, and live updates. Works with plain React props. |
| `FeedBaseItem` | interface | `src/ui/components/data/feed/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `FeedBaseItemAction` | interface | `src/ui/components/data/feed/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `FeedBaseProps` | interface | `src/ui/components/data/feed/standalone.tsx` | Props accepted by the FeedBase standalone component. |
| `FileUploaderBase` | function | `src/ui/components/content/file-uploader/standalone.tsx` | Standalone FileUploader — a file upload component with dropzone, button, and compact variants. Works with plain React props. |
| `FileUploaderBaseProps` | interface | `src/ui/components/content/file-uploader/standalone.tsx` | Props accepted by the FileUploaderBase standalone component. |
| `FilterBarBase` | function | `src/ui/components/data/filter-bar/standalone.tsx` | Standalone FilterBar — search + filter dropdowns + active pills. Works with plain React props. |
| `FilterBarBaseProps` | interface | `src/ui/components/data/filter-bar/standalone.tsx` | Props accepted by the FilterBarBase standalone component. |
| `FilterBarFilter` | interface | `src/ui/components/data/filter-bar/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `Flavor` | interface | `../frontend-contract/src/tokens/types.ts` | Type definition exported by the Snapshot UI runtime. |
| `FloatingMenuBase` | function | `src/ui/components/primitives/floating-menu/standalone.tsx` | Standalone FloatingMenu — a dropdown menu with trigger, keyboard navigation, and pre-resolved items. Works with plain React props. |
| `FloatingMenuBaseEntry` | typealias | `src/ui/components/primitives/floating-menu/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `FloatingMenuBaseItem` | interface | `src/ui/components/primitives/floating-menu/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `FloatingMenuBaseLabel` | interface | `src/ui/components/primitives/floating-menu/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `FloatingMenuBaseProps` | interface | `src/ui/components/primitives/floating-menu/standalone.tsx` | Props accepted by the FloatingMenuBase standalone component. |
| `FloatingMenuBaseSeparator` | interface | `src/ui/components/primitives/floating-menu/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `FontConfig` | typealias | `../frontend-contract/src/tokens/types.ts` | Configuration type for font config. |
| `FromRef` | interface | `../frontend-contract/src/refs/from.ts` | Type definition exported by the Snapshot UI runtime. |
| `getAllFlavors` | function | `src/ui/tokens/flavors.ts` | Get all registered flavors as a record. |
| `getFlavor` | function | `src/ui/tokens/flavors.ts` | Retrieve a registered flavor by name. |
| `getResourceInvalidationTargets` | function | `../frontend-contract/src/resources/index.ts` | Function exported by the Snapshot UI runtime. |
| `getSortableStyle` | function | `src/ui/hooks/use-drag-drop.ts` | CSS transform helper for sortable items. Converts the dnd-kit transform into a CSS transform string. |
| `GifPickerBase` | function | `src/ui/components/communication/gif-picker/standalone.tsx` | Standalone GifPicker — searchable GIF grid with debounced search, loading states, and optional attribution. Works with plain React props. |
| `GifPickerBaseProps` | interface | `src/ui/components/communication/gif-picker/standalone.tsx` | Props accepted by the GifPickerBase standalone component. |
| `GlobalConfig` | typealias | `src/ui/context/types.ts` | Global state definition for the UI context. This now aliases the shared state config used by the runtime. |
| `GridBase` | function | `src/ui/components/layout/grid/standalone.tsx` | Standalone Grid -- a CSS grid container. Works with plain React props. |
| `GridBaseProps` | interface | `src/ui/components/layout/grid/standalone.tsx` | Props accepted by the GridBase standalone component. |
| `HeadingBase` | function | `src/ui/components/content/heading/standalone.tsx` | Standalone Heading — a styled heading element (h1-h6) that works with plain React props. Works with plain React props. |
| `HeadingBaseProps` | interface | `src/ui/components/content/heading/standalone.tsx` | Props accepted by the HeadingBase standalone component. |
| `hexToOklch` | function | `src/ui/tokens/color.ts` | Convert a hex color string to OKLCH values. |
| `HighlightedTextBase` | function | `src/ui/components/data/highlighted-text/standalone.tsx` | Standalone HighlightedText — renders text with search query highlighting. Works with plain React props. |
| `HighlightedTextBaseProps` | interface | `src/ui/components/data/highlighted-text/standalone.tsx` | Props accepted by the HighlightedTextBase standalone component. |
| `HoverCardBase` | function | `src/ui/components/overlay/hover-card/standalone.tsx` | Standalone HoverCard — a floating panel that appears on hover with plain React props. Works with plain React props. |
| `HoverCardBaseProps` | interface | `src/ui/components/overlay/hover-card/standalone.tsx` | Props accepted by the HoverCardBase standalone component. |
| `hslToOklch` | function | `src/ui/tokens/color.ts` | Convert HSL values to OKLCH. |
| `HttpMethod` | typealias | `../frontend-contract/src/resources/index.ts` | Type definition exported by the Snapshot UI runtime. |
| `httpMethodSchema` | variable | `../frontend-contract/src/resources/index.ts` | Zod schema for validating http method schema. |
| `Icon` | function | `src/ui/icons/icon.tsx` | Render a Snapshot icon from the built-in icon registry. |
| `ICON_PATHS` | variable | `src/ui/icons/paths.ts` | SVG inner content for Lucide icons. Each entry maps a kebab-case icon name to the SVG child elements (path, circle, line, rect, polyline, etc.) that belong inside a 24x24 `stroke="currentColor"` SVG container. Source: https://lucide.dev — MIT-licensed. |
| `IconButtonBase` | function | `src/ui/components/forms/icon-button/standalone.tsx` | Standalone IconButtonBase -- an icon-only button with configurable shape, size, and variant. Works with plain React props. |
| `IconButtonBaseProps` | interface | `src/ui/components/forms/icon-button/standalone.tsx` | Props accepted by the IconButtonBase standalone component. |
| `IconProps` | interface | `src/ui/icons/icon.tsx` | Props for the {@link Icon} component. |
| `InlineEditBase` | variable | `src/ui/components/forms/inline-edit/standalone.tsx` | Exported variable from the Snapshot UI runtime. |
| `InlineEditBaseProps` | typealias | `src/ui/components/forms/inline-edit/standalone.tsx` | Props accepted by the InlineEditBase standalone component. |
| `InlineEditField` | function | `src/ui/components/forms/inline-edit/standalone.tsx` | Standalone InlineEditField -- a click-to-edit text field that toggles between display and input modes. Works with plain React props. |
| `InlineEditFieldProps` | interface | `src/ui/components/forms/inline-edit/standalone.tsx` | Props accepted by the InlineEditField component. |
| `InputBase` | variable | `src/ui/components/forms/input/standalone.tsx` | Exported variable from the Snapshot UI runtime. |
| `InputBaseProps` | typealias | `src/ui/components/forms/input/standalone.tsx` | Props accepted by the InputBase standalone component. |
| `InputControl` | function | `src/ui/components/forms/input/control.tsx` | Low-level styled input element with surface resolution and state management. Used internally by InputField and other components that need a styled `<input>`. Works with plain React props. |
| `InputControlProps` | interface | `src/ui/components/forms/input/types.ts` | Props accepted by the InputControl component. |
| `InputField` | function | `src/ui/components/forms/input/standalone.tsx` | Standalone InputField — a complete form field (label + input + helper/error) that works with plain React props. Works with plain React props. |
| `InputFieldProps` | interface | `src/ui/components/forms/input/standalone.tsx` | Props accepted by the InputField component. |
| `interpolate` | function | `src/ui/actions/interpolate.ts` | Replace `{key}` placeholders with values from context. Supports nested paths: `{user.name}`, `{result.id}`. Missing keys are preserved as-is: `{unknown}` stays `{unknown}`. |
| `isFromRef` | variable | `src/ui/context/utils.ts` | Type guard for Snapshot binding references resolved from page, app, or resource state. |
| `isOptimisticResourceTarget` | function | `../frontend-contract/src/resources/index.ts` | Function exported by the Snapshot UI runtime. |
| `isQueryKeyInvalidationTarget` | function | `../frontend-contract/src/resources/index.ts` | Function exported by the Snapshot UI runtime. |
| `isResourceRef` | function | `../frontend-contract/src/resources/index.ts` | Function exported by the Snapshot UI runtime. |
| `KanbanBase` | function | `src/ui/components/workflow/kanban/standalone.tsx` | Standalone KanbanBase — renders a multi-column board with cards, WIP limits, assignee avatars, priority indicators, and optional drag-and-drop reordering. Works with plain React props. |
| `KanbanBaseProps` | interface | `src/ui/components/workflow/kanban/standalone.tsx` | Props accepted by the KanbanBase standalone component. |
| `KanbanColumnEntry` | interface | `src/ui/components/workflow/kanban/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `LayoutBase` | function | `src/ui/components/layout/layout/standalone.tsx` | Standalone Layout -- a layout shell component that wraps page content. Renders one of six layout variants with plain React props. |
| `LayoutBaseProps` | interface | `src/ui/components/layout/layout/standalone.tsx` | Props accepted by the LayoutBase standalone component. |
| `LayoutBaseSlots` | typealias | `src/ui/components/layout/layout/standalone.tsx` | Named slot content map for slot-aware layouts. |
| `LayoutBaseVariant` | typealias | `src/ui/components/layout/layout/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `LinkBase` | function | `src/ui/components/primitives/link/standalone.tsx` | Standalone Link — renders a styled anchor element with optional icon and badge. Works with plain React props. |
| `LinkBaseProps` | interface | `src/ui/components/primitives/link/standalone.tsx` | Props accepted by the LinkBase standalone component. |
| `LinkEmbedBase` | function | `src/ui/components/content/link-embed/standalone.tsx` | Standalone LinkEmbed — renders rich link previews with platform-specific embeds (YouTube, Instagram, TikTok, Twitter, GIF) or a generic card. Works with plain React props. |
| `LinkEmbedBaseProps` | interface | `src/ui/components/content/link-embed/standalone.tsx` | Props accepted by the LinkEmbedBase standalone component. |
| `LinkEmbedMeta` | interface | `src/ui/components/content/link-embed/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `ListBase` | function | `src/ui/components/data/list/standalone.tsx` | Standalone List — renders a vertical list of items with optional icons, descriptions, badges, and click actions. Works with plain React props. |
| `ListBaseItem` | interface | `src/ui/components/data/list/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `ListBaseProps` | interface | `src/ui/components/data/list/standalone.tsx` | Props accepted by the ListBase standalone component. |
| `LocationInputBase` | variable | `src/ui/components/forms/location-input/standalone.tsx` | Exported variable from the Snapshot UI runtime. |
| `LocationInputBaseProps` | typealias | `src/ui/components/forms/location-input/standalone.tsx` | Props accepted by the LocationInputBase standalone component. |
| `LocationInputField` | function | `src/ui/components/forms/location-input/standalone.tsx` | Standalone LocationInputField -- a location search input with results dropdown and optional Google Maps link. Works with plain React props. |
| `LocationInputFieldProps` | interface | `src/ui/components/forms/location-input/standalone.tsx` | Props accepted by the LocationInputField component. |
| `LocationResult` | interface | `src/ui/components/forms/location-input/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `MarkdownBase` | function | `src/ui/components/content/markdown/standalone.tsx` | Standalone Markdown — renders markdown content with syntax highlighting and Snapshot design tokens. Works with plain React props. |
| `MarkdownBaseProps` | interface | `src/ui/components/content/markdown/standalone.tsx` | Props accepted by the MarkdownBase standalone component. |
| `meetsWcagAA` | function | `src/ui/tokens/color.ts` | Check whether two colors satisfy WCAG AA contrast for normal or large text. |
| `MessageThreadBase` | function | `src/ui/components/communication/message-thread/standalone.tsx` | Standalone MessageThread — scrollable message list with avatars, date separators, auto-scroll, embed rendering, and consecutive-message grouping. Works with plain React props. |
| `MessageThreadBaseProps` | interface | `src/ui/components/communication/message-thread/standalone.tsx` | Props accepted by the MessageThreadBase standalone component. |
| `ModalBase` | function | `src/ui/components/overlay/modal/standalone.tsx` | Standalone Modal — a centered overlay dialog with plain React props. Works with plain React props. |
| `ModalBaseFooterAction` | interface | `src/ui/components/overlay/modal/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `ModalBaseProps` | interface | `src/ui/components/overlay/modal/standalone.tsx` | Props accepted by the ModalBase standalone component. |
| `ModalManager` | interface | `src/ui/actions/modal-manager.ts` | Return type of useModalManager. |
| `MultiSelectBase` | variable | `src/ui/components/forms/multi-select/standalone.tsx` | Exported variable from the Snapshot UI runtime. |
| `MultiSelectBaseProps` | typealias | `src/ui/components/forms/multi-select/standalone.tsx` | Props accepted by the MultiSelectBase standalone component. |
| `MultiSelectField` | function | `src/ui/components/forms/multi-select/standalone.tsx` | Standalone MultiSelectField -- multi-select dropdown with pill tags, inline search, and configurable max selection. Works with plain React props. |
| `MultiSelectFieldOption` | interface | `src/ui/components/forms/multi-select/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `MultiSelectFieldProps` | interface | `src/ui/components/forms/multi-select/standalone.tsx` | Props accepted by the MultiSelectField component. |
| `NavBase` | function | `src/ui/components/layout/nav/standalone.tsx` | Standalone Nav -- a navigation component with items, logo, and collapse support. Works with plain React props. |
| `NavBaseItem` | interface | `src/ui/components/layout/nav/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `NavBaseLogo` | interface | `src/ui/components/layout/nav/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `NavBaseProps` | interface | `src/ui/components/layout/nav/standalone.tsx` | Props accepted by the NavBase standalone component. |
| `NavBaseUser` | interface | `src/ui/components/layout/nav/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `NavDropdownBase` | function | `src/ui/components/layout/nav-dropdown/standalone.tsx` | Standalone NavDropdown -- a navigation dropdown with floating panel. Works with plain React props. |
| `NavDropdownBaseProps` | interface | `src/ui/components/layout/nav-dropdown/standalone.tsx` | Props accepted by the NavDropdownBase standalone component. |
| `NavLinkBase` | function | `src/ui/components/layout/nav-link/standalone.tsx` | Standalone NavLink -- a navigation link with optional icon and badge. Works with plain React props. |
| `NavLinkBaseProps` | interface | `src/ui/components/layout/nav-link/standalone.tsx` | Props accepted by the NavLinkBase standalone component. |
| `NavLogoBase` | function | `src/ui/components/layout/nav-logo/standalone.tsx` | Standalone NavLogo -- a clickable brand logo/text element for navigation headers. Works with plain React props. |
| `NavLogoBaseProps` | interface | `src/ui/components/layout/nav-logo/standalone.tsx` | Props accepted by the NavLogoBase standalone component. |
| `NavSearchBase` | function | `src/ui/components/layout/nav-search/standalone.tsx` | Standalone NavSearch -- a search input with optional keyboard shortcut display. Works with plain React props. |
| `NavSearchBaseProps` | interface | `src/ui/components/layout/nav-search/standalone.tsx` | Props accepted by the NavSearchBase standalone component. |
| `NavSectionBase` | function | `src/ui/components/layout/nav-section/standalone.tsx` | Standalone NavSection -- a labeled, optionally collapsible group within navigation. Works with plain React props. |
| `NavSectionBaseProps` | interface | `src/ui/components/layout/nav-section/standalone.tsx` | Props accepted by the NavSectionBase standalone component. |
| `NavUserMenuBase` | function | `src/ui/components/layout/nav-user-menu/standalone.tsx` | Standalone NavUserMenu -- a user menu dropdown with avatar trigger. Works with plain React props. |
| `NavUserMenuBaseItem` | interface | `src/ui/components/layout/nav-user-menu/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `NavUserMenuBaseProps` | interface | `src/ui/components/layout/nav-user-menu/standalone.tsx` | Props accepted by the NavUserMenuBase standalone component. |
| `NotificationBellBase` | function | `src/ui/components/data/notification-bell/standalone.tsx` | Standalone NotificationBell — bell icon with unread count badge. Works with plain React props. |
| `NotificationBellBaseProps` | interface | `src/ui/components/data/notification-bell/standalone.tsx` | Props accepted by the NotificationBellBase standalone component. |
| `NotificationFeedBase` | function | `src/ui/components/workflow/notification-feed/standalone.tsx` | Standalone NotificationFeedBase — renders a scrollable notification list with type icons, unread indicators, relative timestamps, and a mark-all-read action. Works with plain React props. |
| `NotificationFeedBaseProps` | interface | `src/ui/components/workflow/notification-feed/standalone.tsx` | Props accepted by the NotificationFeedBase standalone component. |
| `OAuthButtonsBase` | function | `src/ui/components/primitives/oauth-buttons/standalone.tsx` | Standalone OAuthButtons — renders OAuth provider buttons with optional heading and auto-redirect support. Works with plain React props. |
| `OAuthButtonsBaseProps` | interface | `src/ui/components/primitives/oauth-buttons/standalone.tsx` | Props accepted by the OAuthButtonsBase standalone component. |
| `OAuthProvider` | interface | `src/ui/components/primitives/oauth-buttons/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `oklchToHex` | function | `src/ui/tokens/color.ts` | Convert OKLCH values back to a hex color string. Used for serializing runtime overrides. |
| `oklchToString` | function | `src/ui/tokens/color.ts` | Format OKLCH values as a CSS-compatible string (without the oklch() wrapper). Output format: "L C H" where L, C, H are rounded to 3 decimal places. |
| `OptimisticConfig` | typealias | `../frontend-contract/src/resources/index.ts` | Configuration type for optimistic config. |
| `optimisticConfigSchema` | variable | `../frontend-contract/src/resources/index.ts` | Zod schema for validating optimistic config schema. |
| `OptimisticTarget` | typealias | `../frontend-contract/src/resources/index.ts` | Type definition exported by the Snapshot UI runtime. |
| `optimisticTargetSchema` | variable | `../frontend-contract/src/resources/index.ts` | Zod schema for validating optimistic target schema. |
| `OutletBase` | function | `src/ui/components/layout/outlet/standalone.tsx` | Standalone OutletBase — a router-agnostic mount point for child routes or manually-supplied content. Works with plain React props. Pass router-rendered content as `children`. When children is empty, `fallback` is rendered instead. |
| `OutletBaseProps` | interface | `src/ui/components/layout/outlet/standalone.tsx` | Props accepted by the OutletBase standalone component. |
| `PageContextProvider` | function | `src/ui/context/providers.tsx` | Provides per-page state that is destroyed on route change. |
| `PageContextProviderProps` | interface | `src/ui/context/types.ts` | Props for PageContextProvider. Wraps each page/route to provide per-page component state. |
| `parseOklchString` | function | `src/ui/tokens/color.ts` | Parse an oklch string (the CSS variable format "L C H") back to values. |
| `parseShortcodes` | function | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | Parses shortcodes in text and replaces them with `<img>` tags. |
| `PasskeyButtonBase` | function | `src/ui/components/primitives/passkey-button/standalone.tsx` | Standalone PasskeyButton — renders a passkey authentication button. Works with plain React props. |
| `PasskeyButtonBaseProps` | interface | `src/ui/components/primitives/passkey-button/standalone.tsx` | Props accepted by the PasskeyButtonBase standalone component. |
| `Platform` | typealias | `src/ui/components/content/link-embed/platform.ts` | Platform detection and embed URL extraction. Identifies known platforms from URLs and extracts the embed-compatible URL or ID needed to render platform-specific iframes. |
| `PLATFORM_COLORS` | variable | `src/ui/components/content/link-embed/platform.ts` | Platform accent colors. |
| `PLATFORM_NAMES` | variable | `src/ui/components/content/link-embed/platform.ts` | Platform display names. |
| `PlatformInfo` | interface | `src/ui/components/content/link-embed/platform.ts` | Resolved platform metadata used to render a platform-specific embedded preview. |
| `PopoverBase` | function | `src/ui/components/overlay/popover/standalone.tsx` | Standalone Popover — a button-triggered floating panel with plain React props. Works with plain React props. |
| `PopoverBaseProps` | interface | `src/ui/components/overlay/popover/standalone.tsx` | Props accepted by the PopoverBase standalone component. |
| `PrefetchLinkBase` | function | `src/ui/components/navigation/prefetch-link/standalone.tsx` | Standalone PrefetchLink — a plain `<a>` anchor that fires a prefetch callback based on the configured strategy. Works without SSR context. |
| `PrefetchLinkBaseProps` | interface | `src/ui/components/navigation/prefetch-link/standalone.tsx` | Props accepted by the PrefetchLinkBase standalone component. |
| `PresenceIndicatorBase` | function | `src/ui/components/communication/presence-indicator/standalone.tsx` | Standalone PresenceIndicator — displays online/offline/away/busy/dnd status with a colored dot and optional label. Works with plain React props. |
| `PresenceIndicatorBaseProps` | interface | `src/ui/components/communication/presence-indicator/standalone.tsx` | Props accepted by the PresenceIndicatorBase standalone component. |
| `PricingFeatureEntry` | interface | `src/ui/components/commerce/pricing-table/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `PricingTableBase` | function | `src/ui/components/commerce/pricing-table/standalone.tsx` | Standalone PricingTableBase — renders a responsive pricing comparison as either a card grid or a feature-comparison table with CTA buttons per tier. Works with plain React props. |
| `PricingTableBaseProps` | interface | `src/ui/components/commerce/pricing-table/standalone.tsx` | Props accepted by the PricingTableBase standalone component. |
| `PricingTierEntry` | interface | `src/ui/components/commerce/pricing-table/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `ProgressBase` | function | `src/ui/components/data/progress/standalone.tsx` | Standalone Progress — bar or circular progress indicator. Works with plain React props. |
| `ProgressBaseProps` | interface | `src/ui/components/data/progress/standalone.tsx` | Props accepted by the ProgressBase standalone component. |
| `QuickAddBase` | variable | `src/ui/components/forms/quick-add/standalone.tsx` | Exported variable from the Snapshot UI runtime. |
| `QuickAddBaseProps` | typealias | `src/ui/components/forms/quick-add/standalone.tsx` | Props accepted by the QuickAddBase standalone component. |
| `QuickAddField` | function | `src/ui/components/forms/quick-add/standalone.tsx` | Standalone QuickAddField -- a compact input with submit button for quickly adding items to a list. Works with plain React props. |
| `QuickAddFieldProps` | interface | `src/ui/components/forms/quick-add/standalone.tsx` | Props accepted by the QuickAddField component. |
| `RadiusScale` | typealias | `../frontend-contract/src/tokens/types.ts` | Type definition exported by the Snapshot UI runtime. |
| `ReactionBarBase` | function | `src/ui/components/communication/reaction-bar/standalone.tsx` | Standalone ReactionBar — row of emoji reaction pills with counts and an add-reaction button that opens an inline emoji picker. Works with plain React props. |
| `ReactionBarBaseProps` | interface | `src/ui/components/communication/reaction-bar/standalone.tsx` | Props accepted by the ReactionBarBase standalone component. |
| `ReactionEntry` | interface | `src/ui/components/communication/reaction-bar/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `readPersistedState` | function | `src/ui/state/persist.ts` | Read and JSON-decode a persisted state value, returning `undefined` on failure or absence. |
| `relativeLuminance` | function | `src/ui/tokens/color.ts` | Compute relative luminance from OKLCH for WCAG contrast calculations. Uses sRGB relative luminance (rec. 709) from the linear RGB values. |
| `ResolvedConfig` | typealias | `src/ui/context/types.ts` | Resolves a type where FromRef values are replaced with their resolved types. Used internally — consumers don't need to use this directly. |
| `ResolvedRequest` | interface | `../frontend-contract/src/resources/index.ts` | Type definition exported by the Snapshot UI runtime. |
| `resolveEmojiRecords` | function | `src/ui/components/communication/emoji-picker/custom-emoji.ts` | Resolves emoji records from the API into CustomEmoji entries. Handles the `uploadKey` → `url` resolution using a URL prefix or field mapping. |
| `resolveEndpointTarget` | function | `../frontend-contract/src/resources/index.ts` | Function exported by the Snapshot UI runtime. |
| `resolveFrameworkStyles` | function | `src/ui/tokens/resolve.ts` | Returns a CSS string containing framework-level styles: 1. CSS reset (box-sizing, margin, padding, body defaults, font inherit) 2. Component polish CSS — data-attribute-driven styles for page layout,    data-table, stat-card, form, detail-card, and focus rings. All values are parameterized via `--sn-*` token custom properties so the output adapts to whatever theme tokens are active. |
| `resolveResponsiveValue` | function | `src/ui/hooks/use-breakpoint.ts` | Resolve a responsive value for a given breakpoint. Cascades down: if the active breakpoint isn't defined, falls back to the next smaller breakpoint, then `default`. For flat (non-object) values, returns the value directly. |
| `resolveTokens` | function | `src/ui/tokens/resolve.ts` | Resolve a theme configuration into a complete CSS string. Pipeline: 1. Load base flavor (default: neutral) 2. Deep merge overrides onto flavor defaults 3. Convert all colors to oklch 4. Auto-derive foreground colors (contrast-aware) 5. Auto-derive dark mode colors if not provided 6. Map radius/spacing/font to CSS 7. Generate component-level tokens 8. Output CSS string with :root, .dark, and component selectors |
| `ResourceConfig` | typealias | `../frontend-contract/src/resources/index.ts` | Configuration type for resource config. |
| `resourceConfigSchema` | variable | `../frontend-contract/src/resources/index.ts` | Zod schema for validating resource config schema. |
| `ResourceInvalidationTarget` | typealias | `../frontend-contract/src/resources/index.ts` | Type definition exported by the Snapshot UI runtime. |
| `resourceInvalidationTargetSchema` | variable | `../frontend-contract/src/resources/index.ts` | Zod schema for validating resource invalidation target schema. |
| `ResourceMap` | typealias | `../frontend-contract/src/resources/index.ts` | Type definition exported by the Snapshot UI runtime. |
| `resourceParamSchema` | variable | `../frontend-contract/src/resources/index.ts` | Zod schema for validating resource param schema. |
| `ResourceRef` | typealias | `../frontend-contract/src/resources/index.ts` | Type definition exported by the Snapshot UI runtime. |
| `resourceRefSchema` | variable | `../frontend-contract/src/resources/index.ts` | Zod schema for validating resource ref schema. |
| `Responsive` | typealias | `../frontend-contract/src/tokens/types.ts` | Type definition exported by the Snapshot UI runtime. |
| `RichInputBase` | variable | `src/ui/components/content/rich-input/standalone.tsx` | Standalone RichInput — a rich text editor with formatting toolbar, powered by tiptap. Works with plain React props. |
| `RichInputBaseHandle` | interface | `src/ui/components/content/rich-input/standalone.tsx` | Imperative handle exposed via `ref`. Use this when an external surface (emoji picker, GIF picker, slash-command menu) needs to insert content at the user's current cursor position without going through the controlled-value path (which clobbers the cursor). |
| `RichInputBaseProps` | interface | `src/ui/components/content/rich-input/standalone.tsx` | Props accepted by the RichInputBase standalone component. |
| `RichTextEditorBase` | function | `src/ui/components/content/rich-text-editor/standalone.tsx` | Standalone RichTextEditor — a markdown editor with live preview, powered by CodeMirror. Works with plain React props. |
| `RichTextEditorBaseProps` | interface | `src/ui/components/content/rich-text-editor/standalone.tsx` | Props accepted by the RichTextEditorBase standalone component. |
| `RowBase` | function | `src/ui/components/layout/row/standalone.tsx` | Standalone Row -- a horizontal flex container. Works with plain React props. |
| `RowBaseProps` | interface | `src/ui/components/layout/row/standalone.tsx` | Props accepted by the RowBase standalone component. |
| `RuntimeStateConfig` | typealias | `src/ui/state/types.ts` | Named state definition. App-scope state persists for the app lifetime. Route-scope state is recreated whenever the active route changes. |
| `SaveIndicatorBase` | function | `src/ui/components/data/save-indicator/standalone.tsx` | Standalone SaveIndicator — shows saving/saved/error status. Works with plain React props. |
| `SaveIndicatorBaseProps` | interface | `src/ui/components/data/save-indicator/standalone.tsx` | Props accepted by the SaveIndicatorBase standalone component. |
| `ScrollAreaBase` | function | `src/ui/components/data/scroll-area/standalone.tsx` | Standalone ScrollArea — a scrollable container with custom-styled thin scrollbars. Works with plain React props. |
| `ScrollAreaBaseProps` | interface | `src/ui/components/data/scroll-area/standalone.tsx` | Props accepted by the ScrollAreaBase standalone component. |
| `SectionBase` | function | `src/ui/components/layout/section/standalone.tsx` | Standalone Section -- a full-width vertical section with optional height and alignment. Works with plain React props. |
| `SectionBaseProps` | interface | `src/ui/components/layout/section/standalone.tsx` | Props accepted by the SectionBase standalone component. |
| `SelectBase` | variable | `src/ui/components/forms/select/standalone.tsx` | Exported variable from the Snapshot UI runtime. |
| `SelectBaseProps` | typealias | `src/ui/components/forms/select/standalone.tsx` | Props accepted by the SelectBase standalone component. |
| `SelectControl` | function | `src/ui/components/forms/select/control.tsx` | Low-level styled select element with surface resolution and state management. Used internally by SelectField and other components that need a styled `<select>`. Works with plain React props. |
| `SelectControlProps` | interface | `src/ui/components/forms/select/types.ts` | Props accepted by the SelectControl component. |
| `SelectField` | function | `src/ui/components/forms/select/standalone.tsx` | Standalone SelectField -- a complete select form field with label, options, helper/error text, and required indicator. Works with plain React props. |
| `SelectFieldProps` | interface | `src/ui/components/forms/select/standalone.tsx` | Props accepted by the SelectField component. |
| `SeparatorBase` | function | `src/ui/components/data/separator/standalone.tsx` | Standalone Separator — a horizontal or vertical line with optional label. Works with plain React props. |
| `SeparatorBaseProps` | interface | `src/ui/components/data/separator/standalone.tsx` | Props accepted by the SeparatorBase standalone component. |
| `ShowToastOptions` | interface | `src/ui/actions/toast.tsx` | User-facing toast options accepted by the toast manager. |
| `SkeletonBase` | function | `src/ui/components/data/skeleton/standalone.tsx` | Standalone Skeleton — a placeholder loading indicator. Works with plain React props. |
| `SkeletonBaseProps` | interface | `src/ui/components/data/skeleton/standalone.tsx` | Props accepted by the SkeletonBase standalone component. |
| `SliderBase` | variable | `src/ui/components/forms/slider/standalone.tsx` | Exported variable from the Snapshot UI runtime. |
| `SliderBaseProps` | typealias | `src/ui/components/forms/slider/standalone.tsx` | Props accepted by the SliderBase standalone component. |
| `SliderField` | function | `src/ui/components/forms/slider/standalone.tsx` | Standalone SliderField -- a range slider with optional label, value display, limit labels, and dual-thumb range mode. Works with plain React props. |
| `SliderFieldProps` | interface | `src/ui/components/forms/slider/standalone.tsx` | Props accepted by the SliderField component. |
| `SnapshotApiProvider` | function | `src/ui/state/api.ts` | Backward-compatible provider shim for tests and external wrappers. This writes the client into the shared Jotai store instead of React context. |
| `SnapshotImageBase` | function | `src/ui/components/media/image/standalone.tsx` | Standalone SnapshotImage — an optimized image component with placeholder support. Works with plain React props. |
| `SnapshotImageBaseProps` | interface | `src/ui/components/media/image/standalone.tsx` | Props accepted by the SnapshotImageBase standalone component. |
| `SpacerBase` | function | `src/ui/components/layout/spacer/standalone.tsx` | Standalone Spacer -- an empty element that takes up space along an axis. Works with plain React props. |
| `SpacerBaseProps` | interface | `src/ui/components/layout/spacer/standalone.tsx` | Props accepted by the SpacerBase standalone component. |
| `SpacingScale` | typealias | `../frontend-contract/src/tokens/types.ts` | Type definition exported by the Snapshot UI runtime. |
| `SplitPaneBase` | function | `src/ui/components/layout/split-pane/standalone.tsx` | Standalone SplitPane -- a resizable two-pane layout with a draggable divider. Works with plain React props. |
| `SplitPaneBaseProps` | interface | `src/ui/components/layout/split-pane/standalone.tsx` | Props accepted by the SplitPaneBase standalone component. |
| `StackBase` | function | `src/ui/components/primitives/stack/standalone.tsx` | Standalone Stack — a flex-column layout container with token-based spacing. Works with plain React props. |
| `StackBaseProps` | interface | `src/ui/components/primitives/stack/standalone.tsx` | Props accepted by the StackBase standalone component. |
| `StatCardBase` | function | `src/ui/components/data/stat-card/standalone.tsx` | Standalone StatCard — displays a single metric with optional trend indicator. Works with plain React props. |
| `StatCardBaseProps` | interface | `src/ui/components/data/stat-card/standalone.tsx` | Props accepted by the StatCardBase standalone component. |
| `StatCardTrend` | interface | `src/ui/components/data/stat-card/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `StateConfigMap` | typealias | `src/ui/state/types.ts` | Map of named state definitions. |
| `StateHookScope` | typealias | `src/ui/state/hooks.ts` | Hook-level scope override that can force app, route, or auto-discovered state resolution. |
| `StateProviderProps` | interface | `src/ui/state/types.ts` | Props accepted by the provider layer that wires named state into a React tree. |
| `StateScope` | typealias | `../frontend-contract/src/state/types.ts` | Type definition exported by the Snapshot UI runtime. |
| `StepperBase` | function | `src/ui/components/navigation/stepper/standalone.tsx` | Standalone Stepper — a multi-step progress indicator with plain React props. Works with plain React props. |
| `StepperBaseProps` | interface | `src/ui/components/navigation/stepper/standalone.tsx` | Props accepted by the StepperBase standalone component. |
| `StepperBaseStep` | interface | `src/ui/components/navigation/stepper/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `SwitchBase` | variable | `src/ui/components/forms/switch/standalone.tsx` | Exported variable from the Snapshot UI runtime. |
| `SwitchBaseProps` | typealias | `src/ui/components/forms/switch/standalone.tsx` | Props accepted by the SwitchBase standalone component. |
| `SwitchField` | function | `src/ui/components/forms/switch/standalone.tsx` | Standalone SwitchField -- a toggle switch with label, description, and configurable size and color. Works with plain React props. |
| `SwitchFieldProps` | interface | `src/ui/components/forms/switch/standalone.tsx` | Props accepted by the SwitchField component. |
| `TabsBase` | function | `src/ui/components/navigation/tabs/standalone.tsx` | Standalone Tabs — tabbed navigation with plain React props. Works with plain React props. |
| `TabsBaseProps` | interface | `src/ui/components/navigation/tabs/standalone.tsx` | Props accepted by the TabsBase standalone component. |
| `TabsBaseTab` | interface | `src/ui/components/navigation/tabs/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `TagSelectorBase` | variable | `src/ui/components/forms/tag-selector/standalone.tsx` | Exported variable from the Snapshot UI runtime. |
| `TagSelectorBaseProps` | typealias | `src/ui/components/forms/tag-selector/standalone.tsx` | Props accepted by the TagSelectorBase standalone component. |
| `TagSelectorField` | function | `src/ui/components/forms/tag-selector/standalone.tsx` | Standalone TagSelectorField -- tag pills with dropdown selection, search filtering, and optional tag creation. Works with plain React props. |
| `TagSelectorFieldProps` | interface | `src/ui/components/forms/tag-selector/standalone.tsx` | Props accepted by the TagSelectorField component. |
| `TagSelectorTag` | interface | `src/ui/components/forms/tag-selector/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `TextareaBase` | variable | `src/ui/components/forms/textarea/standalone.tsx` | Exported variable from the Snapshot UI runtime. |
| `TextareaBaseProps` | typealias | `src/ui/components/forms/textarea/standalone.tsx` | Props accepted by the TextareaBase standalone component. |
| `TextareaControl` | function | `src/ui/components/forms/textarea/control.tsx` | Low-level styled textarea element with surface resolution and state management. Used internally by TextareaField and other components that need a styled `<textarea>`. Works with plain React props. |
| `TextareaControlProps` | interface | `src/ui/components/forms/textarea/types.ts` | Props accepted by the TextareaControl component. |
| `TextareaField` | function | `src/ui/components/forms/textarea/standalone.tsx` | Standalone TextareaField -- a complete textarea form field with label, character counter, validation, and helper/error text. Works with plain React props. |
| `TextareaFieldProps` | interface | `src/ui/components/forms/textarea/standalone.tsx` | Props accepted by the TextareaField component. |
| `TextBase` | function | `src/ui/components/primitives/text/standalone.tsx` | Standalone Text — renders a styled paragraph element with token-based typography. Works with plain React props. |
| `TextBaseProps` | interface | `src/ui/components/primitives/text/standalone.tsx` | Props accepted by the TextBase standalone component. |
| `ThemeColors` | typealias | `../frontend-contract/src/tokens/types.ts` | Type definition exported by the Snapshot UI runtime. |
| `ThemeConfig` | typealias | `../frontend-contract/src/tokens/types.ts` | Configuration type for theme config. |
| `throttleAction` | function | `src/ui/actions/timing.ts` | Throttle async or sync action execution by key and drop calls inside the active throttle window. |
| `TimelineBase` | function | `src/ui/components/content/timeline/standalone.tsx` | Standalone Timeline — vertical event timeline with dot markers, connectors, date labels, and default/compact/alternating layout variants. Works with plain React props. |
| `TimelineBaseProps` | interface | `src/ui/components/content/timeline/standalone.tsx` | Props accepted by the TimelineBase standalone component. |
| `TimelineItemEntry` | interface | `src/ui/components/content/timeline/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `ToastContainer` | function | `src/ui/actions/toast.tsx` | Render the active toast queue. |
| `ToastItem` | interface | `src/ui/actions/toast.tsx` | Resolved toast entry stored in the runtime queue. |
| `ToastManager` | interface | `src/ui/actions/toast.tsx` | Imperative API for enqueueing and dismissing transient toast messages. |
| `ToggleBase` | variable | `src/ui/components/forms/toggle/standalone.tsx` | Exported variable from the Snapshot UI runtime. |
| `ToggleBaseProps` | typealias | `src/ui/components/forms/toggle/standalone.tsx` | Props accepted by the ToggleBase standalone component. |
| `ToggleField` | function | `src/ui/components/forms/toggle/standalone.tsx` | Standalone ToggleField -- a pressable toggle button with optional icon and label. Works with plain React props. |
| `ToggleFieldProps` | interface | `src/ui/components/forms/toggle/standalone.tsx` | Props accepted by the ToggleField component. |
| `ToggleGroupBase` | function | `src/ui/components/forms/toggle-group/standalone.tsx` | Standalone ToggleGroupBase -- a group of toggle buttons supporting single or multi-select modes. Works with plain React props. |
| `ToggleGroupBaseProps` | interface | `src/ui/components/forms/toggle-group/standalone.tsx` | Props accepted by the ToggleGroupBase standalone component. |
| `ToggleGroupItem` | interface | `src/ui/components/forms/toggle-group/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `TokenEditor` | interface | `../frontend-contract/src/tokens/types.ts` | Type definition exported by the Snapshot UI runtime. |
| `TooltipBase` | function | `src/ui/components/data/tooltip/standalone.tsx` | Standalone Tooltip — wraps child content and shows informational text on hover with configurable placement and delay. Works with plain React props. |
| `TooltipBaseProps` | interface | `src/ui/components/data/tooltip/standalone.tsx` | Props accepted by the TooltipBase standalone component. |
| `toPersistedStateKey` | function | `src/ui/state/persist.ts` | Build the storage key used for persisted Snapshot state entries. |
| `TreeViewBase` | function | `src/ui/components/navigation/tree-view/standalone.tsx` | Standalone TreeView — a hierarchical tree with expand/collapse and selection. Works with plain React props. |
| `TreeViewBaseItem` | interface | `src/ui/components/navigation/tree-view/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `TreeViewBaseProps` | interface | `src/ui/components/navigation/tree-view/standalone.tsx` | Props accepted by the TreeViewBase standalone component. |
| `TypingIndicatorBase` | function | `src/ui/components/communication/typing-indicator/standalone.tsx` | Standalone TypingIndicator — shows animated bouncing dots with user names to indicate who is currently typing. Works with plain React props. |
| `TypingIndicatorBaseProps` | interface | `src/ui/components/communication/typing-indicator/standalone.tsx` | Props accepted by the TypingIndicatorBase standalone component. |
| `TypingUser` | interface | `src/ui/components/communication/typing-indicator/standalone.tsx` | A user entry for the typing indicator. |
| `UI_BREAKPOINTS` | variable | `src/ui/hooks/use-breakpoint.ts` | Breakpoint pixel thresholds (mobile-first, min-width). |
| `useApiClient` | function | `src/ui/state/api.ts` | Read the active API client from the app-scope Jotai store. |
| `useBreakpoint` | function | `src/ui/hooks/use-breakpoint.ts` | Returns the currently active breakpoint based on window width. Uses `matchMedia` for efficient, event-driven updates (no resize polling). Returns `"default"` during SSR. |
| `useComponentData` | function | `src/ui/components/_base/use-component-data.ts` | Shared data-fetching hook for Snapshot UI components. Parses a data config string like `"GET /api/stats/revenue"` into method + endpoint, resolves any `FromRef` values in params via `useSubscribe`, and fetches data using the app-scope API client. When the API client is not available (e.g., in tests or before a provider supplies it), the hook returns a loading state without throwing. |
| `useConfirmManager` | function | `src/ui/actions/confirm.tsx` | Return the shared confirmation manager for the current Snapshot UI tree. |
| `useDndSensors` | function | `src/ui/hooks/use-drag-drop.ts` | Pre-configured sensor setup for pointer + keyboard DnD. Pointer requires 5px distance to activate (prevents click hijacking). Keyboard uses standard coordinates for arrow key navigation. |
| `useInfiniteScroll` | function | `src/ui/hooks/use-infinite-scroll.ts` | Observe a sentinel element and load the next page when it enters the viewport. |
| `UseInfiniteScrollOptions` | interface | `src/ui/hooks/use-infinite-scroll.ts` | Options for loading additional items when a sentinel approaches the viewport. |
| `useModalManager` | function | `src/ui/actions/modal-manager.ts` | Hook to manage modal open/close state via a Jotai atom stack. Provides open, close, isOpen, and the current stack. |
| `usePersistedAtom` | function | `src/ui/state/use-persisted-atom.ts` | Bind a primitive atom to browser storage so its value survives page reloads. |
| `usePoll` | function | `src/ui/hooks/use-poll.ts` | Invoke a callback on an interval with optional document-visibility pausing. |
| `UsePollOptions` | interface | `src/ui/hooks/use-poll.ts` | Options controlling interval-based polling from client components. |
| `usePublish` | function | `src/ui/context/hooks.ts` | Registers a component in the page context and returns a setter function to publish values that other components can subscribe to via `{ from: "id" }`. |
| `useResetStateValue` | function | `src/ui/state/hooks.ts` | Return a callback that resets a named state entry to its configured default. |
| `useResolveFrom` | function | `src/ui/context/hooks.ts` | Resolves all `FromRef` values in a config object at once. |
| `useResolveFromMany` | function | `src/ui/context/hooks.ts` | Resolves an array of values that may contain `FromRef`s. Stable across renders regardless of array length — use this when the number of items is dynamic (e.g., a list of nav items, params object) and a per-item `useSubscribe` would violate the rules of hooks. Internally uses a single subscription to the page registry store and re-evaluates when any subscribed atom changes. |
| `useResponsiveValue` | function | `src/ui/hooks/use-breakpoint.ts` | Resolve a responsive value to the appropriate value for the current breakpoint. Accepts either a flat value (returned as-is) or a responsive map with breakpoint keys. Falls back to the next smaller defined breakpoint. |
| `useSetStateValue` | function | `src/ui/state/hooks.ts` | Return a setter that writes to a named state entry in the resolved scope. |
| `useStateValue` | function | `src/ui/state/hooks.ts` | Read the current value for a named state entry. |
| `useSubscribe` | function | `src/ui/context/hooks.ts` | Subscribes to a value from the shared binding/state registry system. |
| `useToastManager` | function | `src/ui/actions/toast.tsx` | Return the toast manager. |
| `useTokenEditor` | function | `src/ui/tokens/editor.ts` | React hook for runtime token editing. Provides setToken/setFlavor/resetTokens/getTokens/subscribe for live theme customization. Changes are applied instantly via inline styles on document.documentElement. |
| `useUrlSync` | function | `src/ui/hooks/use-url-sync.ts` | Keep a slice of local state synchronized with URL query parameters. |
| `validateContrast` | function | `src/ui/tokens/contrast-checker.ts` | Warn when theme color pairs fail WCAG AA contrast. |
| `VideoBase` | function | `src/ui/components/media/video/standalone.tsx` | Standalone Video — a styled video element that works with plain React props. Works with plain React props. |
| `VideoBaseProps` | interface | `src/ui/components/media/video/standalone.tsx` | Props accepted by the VideoBase standalone component. |
| `VoteBase` | function | `src/ui/components/data/vote/standalone.tsx` | Standalone Vote — upvote/downvote toggle with count display. Works with plain React props. |
| `VoteBaseProps` | interface | `src/ui/components/data/vote/standalone.tsx` | Props accepted by the VoteBase standalone component. |
| `WizardBase` | function | `src/ui/components/forms/wizard/standalone.tsx` | Standalone WizardBase -- a multi-step form wizard with progress indicator, step navigation, field validation, and completion state. Works with plain React props. |
| `WizardBaseProps` | interface | `src/ui/components/forms/wizard/standalone.tsx` | Props accepted by the WizardBase standalone component. |
| `WizardFieldConfig` | interface | `src/ui/components/forms/wizard/standalone.tsx` | Configuration type for wizard field config. |
| `WizardState` | interface | `src/ui/components/forms/wizard/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `WizardStepDef` | interface | `src/ui/components/forms/wizard/standalone.tsx` | Type definition exported by the Snapshot UI runtime. |
| `writePersistedState` | function | `src/ui/state/persist.ts` | Serialize and store a persisted state value, ignoring browser storage failures. |

</details>

## Tokens & Flavors

| Export | Kind | Description |
|---|---|---|
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
| `relativeLuminance` | function | Compute relative luminance from OKLCH for WCAG contrast calculations. Uses sRGB relative luminance (rec. 709) from the linear RGB values. |
| `resolveFrameworkStyles` | function | Returns a CSS string containing framework-level styles: 1. CSS reset (box-sizing, margin, padding, body defaults, font inherit) 2. Component polish CSS — data-attribute-driven styles for page layout,    data-table, stat-card, form, detail-card, and focus rings. All values are parameterized via `--sn-*` token custom properties so the output adapts to whatever theme tokens are active. |
| `resolveTokens` | function | Resolve a theme configuration into a complete CSS string. Pipeline: 1. Load base flavor (default: neutral) 2. Deep merge overrides onto flavor defaults 3. Convert all colors to oklch 4. Auto-derive foreground colors (contrast-aware) 5. Auto-derive dark mode colors if not provided 6. Map radius/spacing/font to CSS 7. Generate component-level tokens 8. Output CSS string with :root, .dark, and component selectors |
| `useTokenEditor` | function | React hook for runtime token editing. Provides setToken/setFlavor/resetTokens/getTokens/subscribe for live theme customization. Changes are applied instantly via inline styles on document.documentElement. |
| `validateContrast` | function | Warn when theme color pairs fail WCAG AA contrast. |

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

#### `resolveTokens(config?: { flavor?: string | undefined; flavors?: Record<string, { extends: string; displayName?: string | undefined; colors?: { input?: string | undefined; muted?: string | undefined; border?: strin...`

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

#### `validateContrast(theme: { flavor?: string | undefined; flavors?: Record<string, { extends: string; displayName?: string | undefined; colors?: { input?: string | undefined; muted?: string | undefined; border?: string ...`

Warn when theme color pairs fail WCAG AA contrast.

---

## Context & Data Binding

| Export | Kind | Description |
|---|---|---|
| `AppContextProvider` | function | Provides persistent global state that survives route changes. Initializes globals from runtime config. |
| `AppContextProviderProps` | interface | Props for AppContextProvider. Wraps the entire app to provide persistent global state. |
| `GlobalConfig` | typealias | Global state definition for the UI context. This now aliases the shared state config used by the runtime. |
| `isFromRef` | variable | Type guard for Snapshot binding references resolved from page, app, or resource state. |
| `PageContextProvider` | function | Provides per-page state that is destroyed on route change. |
| `PageContextProviderProps` | interface | Props for PageContextProvider. Wraps each page/route to provide per-page component state. |
| `ResolvedConfig` | typealias | Resolves a type where FromRef values are replaced with their resolved types. Used internally — consumers don't need to use this directly. |
| `usePublish` | function | Registers a component in the page context and returns a setter function to publish values that other components can subscribe to via `{ from: "id" }`. |
| `useResolveFrom` | function | Resolves all `FromRef` values in a config object at once. |
| `useResolveFromMany` | function | Resolves an array of values that may contain `FromRef`s. Stable across renders regardless of array length — use this when the number of items is dynamic (e.g., a list of nav items, params object) and a per-item `useSubscribe` would violate the rules of hooks. Internally uses a single subscription to the page registry store and re-evaluates when any subscribed atom changes. |
| `useSubscribe` | function | Subscribes to a value from the shared binding/state registry system. |

### Details

#### `AppContextProvider({ globals, resources, api, children, }: AppContextProviderProps) => Element`

Provides persistent global state that survives route changes.
Initializes globals from runtime config.

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

#### `useResolveFromMany(values: readonly unknown[]) => unknown[]`

Resolves an array of values that may contain `FromRef`s. Stable across
renders regardless of array length — use this when the number of items
is dynamic (e.g., a list of nav items, params object) and a per-item
`useSubscribe` would violate the rules of hooks.

Internally uses a single subscription to the page registry store and
re-evaluates when any subscribed atom changes.

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
| `RuntimeStateConfig` | typealias | Named state definition. App-scope state persists for the app lifetime. Route-scope state is recreated whenever the active route changes. |
| `SnapshotApiProvider` | function | Backward-compatible provider shim for tests and external wrappers. This writes the client into the shared Jotai store instead of React context. |
| `StateConfigMap` | typealias | Map of named state definitions. |
| `StateHookScope` | typealias | Hook-level scope override that can force app, route, or auto-discovered state resolution. |
| `StateProviderProps` | interface | Props accepted by the provider layer that wires named state into a React tree. |
| `toPersistedStateKey` | function | Build the storage key used for persisted Snapshot state entries. |
| `useApiClient` | function | Read the active API client from the app-scope Jotai store. |
| `usePersistedAtom` | function | Bind a primitive atom to browser storage so its value survives page reloads. |
| `useResetStateValue` | function | Return a callback that resets a named state entry to its configured default. |
| `useSetStateValue` | function | Return a setter that writes to a named state entry in the resolved scope. |
| `useStateValue` | function | Read the current value for a named state entry. |
| `writePersistedState` | function | Serialize and store a persisted state value, ignoring browser storage failures. |

### Details

#### `clearPersistedState(key: string, storage: PersistStorage) => void`

Remove a persisted state value from the selected browser storage area.

---

#### `readPersistedState(key: string, storage: PersistStorage) => unknown`

Read and JSON-decode a persisted state value, returning `undefined` on failure or absence.

---

#### `SnapshotApiProvider({ value, children, }: { value: ApiClient | null; children?: ReactNode; }) => FunctionComponentElement<FragmentProps>`

Backward-compatible provider shim for tests and external wrappers.
This writes the client into the shared Jotai store instead of React context.

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

Return a callback that resets a named state entry to its configured default.

---

#### `useSetStateValue(id: string, options?: { scope?: StateHookScope | undefined; } | undefined) => (value: unknown) => void`

Return a setter that writes to a named state entry in the resolved scope.

---

#### `useStateValue(id: string, options?: { scope?: StateHookScope | undefined; } | undefined) => unknown`

Read the current value for a named state entry.

---

#### `writePersistedState(key: string, value: unknown, storage: PersistStorage) => void`

Serialize and store a persisted state value, ignoring browser storage failures.

---

## Actions

| Export | Kind | Description |
|---|---|---|
| `ConfirmDialog` | function | Render the global confirmation dialog for requests queued through `useConfirmManager`. |
| `ConfirmManager` | interface | Imperative API for opening a confirmation dialog from app actions or custom UI. |
| `ConfirmOptions` | typealias | Options accepted when opening a confirmation dialog. |
| `ConfirmRequest` | interface | Internal confirm-dialog request stored in the atom-backed manager queue. |
| `debounceAction` | function | Debounce async or sync action execution by key and resolve all pending callers with the final invocation result. |
| `interpolate` | function | Replace `{key}` placeholders with values from context. Supports nested paths: `{user.name}`, `{result.id}`. Missing keys are preserved as-is: `{unknown}` stays `{unknown}`. |
| `ModalManager` | interface | Return type of useModalManager. |
| `ShowToastOptions` | interface | User-facing toast options accepted by the toast manager. |
| `throttleAction` | function | Throttle async or sync action execution by key and drop calls inside the active throttle window. |
| `ToastContainer` | function | Render the active toast queue. |
| `ToastItem` | interface | Resolved toast entry stored in the runtime queue. |
| `ToastManager` | interface | Imperative API for enqueueing and dismissing transient toast messages. |
| `useConfirmManager` | function | Return the shared confirmation manager for the current Snapshot UI tree. |
| `useModalManager` | function | Hook to manage modal open/close state via a Jotai atom stack. Provides open, close, isOpen, and the current stack. |
| `useToastManager` | function | Return the toast manager. |

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

Render the active toast queue.

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

Return the toast manager.

---

## Components — Data

| Export | Kind | Description |
|---|---|---|
| `AlertBase` | function | Standalone Alert — a styled alert/notification box with optional icon, action button, and dismiss. Works with plain React props. |
| `AlertBaseProps` | interface | Props accepted by the AlertBase standalone component. |
| `AvatarBase` | function | Standalone Avatar — image, initials, or icon fallback. Works with plain React props. |
| `AvatarBaseProps` | interface | Props accepted by the AvatarBase standalone component. |
| `AvatarGroupBase` | function | Standalone AvatarGroup — overlapping avatars with +N overflow. Works with plain React props. |
| `AvatarGroupBaseAvatar` | interface | Type definition exported by the Snapshot UI runtime. |
| `AvatarGroupBaseProps` | interface | Props accepted by the AvatarGroupBase standalone component. |
| `BadgeBase` | function | Standalone Badge — a small label with color-coded variants. Works with plain React props. |
| `BadgeBaseProps` | interface | Props accepted by the BadgeBase standalone component. |
| `ChartBase` | function | Standalone Chart — renders data-driven charts via recharts. Works with plain React props. |
| `ChartBaseProps` | interface | Props accepted by the ChartBase standalone component. |
| `ChartBaseSeries` | interface | Type definition exported by the Snapshot UI runtime. |
| `DataTableBase` | function | Standalone DataTable — feature-rich data table with sorting, pagination, selection, and search. Works with plain React props. |
| `DataTableBaseBulkAction` | interface | Type definition exported by the Snapshot UI runtime. |
| `DataTableBaseColumn` | interface | Type definition exported by the Snapshot UI runtime. |
| `DataTableBasePagination` | interface | Type definition exported by the Snapshot UI runtime. |
| `DataTableBaseProps` | interface | Props accepted by the DataTableBase standalone component. |
| `DataTableBaseRowAction` | interface | Type definition exported by the Snapshot UI runtime. |
| `DataTableBaseSort` | interface | Type definition exported by the Snapshot UI runtime. |
| `DetailCardBase` | function | Standalone DetailCard — data-driven detail view with formatted fields and header actions. Works with plain React props. |
| `DetailCardBaseAction` | interface | Type definition exported by the Snapshot UI runtime. |
| `DetailCardBaseField` | interface | Type definition exported by the Snapshot UI runtime. |
| `DetailCardBaseProps` | interface | Props accepted by the DetailCardBase standalone component. |
| `EmptyStateBase` | function | Standalone EmptyState — a centered message with optional icon and action. Works with plain React props. |
| `EmptyStateBaseProps` | interface | Props accepted by the EmptyStateBase standalone component. |
| `EntityPickerBase` | function | Standalone EntityPicker — dropdown with search, single/multi select. Works with plain React props. |
| `EntityPickerBaseProps` | interface | Props accepted by the EntityPickerBase standalone component. |
| `EntityPickerEntity` | interface | Type definition exported by the Snapshot UI runtime. |
| `FavoriteButtonBase` | function | Standalone FavoriteButton — a toggle button with a star icon. Works with plain React props. |
| `FavoriteButtonBaseProps` | interface | Props accepted by the FavoriteButtonBase standalone component. |
| `FeedBase` | function | Standalone Feed — feed/activity list with grouping, pagination, and live updates. Works with plain React props. |
| `FeedBaseItem` | interface | Type definition exported by the Snapshot UI runtime. |
| `FeedBaseItemAction` | interface | Type definition exported by the Snapshot UI runtime. |
| `FeedBaseProps` | interface | Props accepted by the FeedBase standalone component. |
| `FilterBarBase` | function | Standalone FilterBar — search + filter dropdowns + active pills. Works with plain React props. |
| `FilterBarBaseProps` | interface | Props accepted by the FilterBarBase standalone component. |
| `FilterBarFilter` | interface | Type definition exported by the Snapshot UI runtime. |
| `HighlightedTextBase` | function | Standalone HighlightedText — renders text with search query highlighting. Works with plain React props. |
| `HighlightedTextBaseProps` | interface | Props accepted by the HighlightedTextBase standalone component. |
| `ListBase` | function | Standalone List — renders a vertical list of items with optional icons, descriptions, badges, and click actions. Works with plain React props. |
| `ListBaseItem` | interface | Type definition exported by the Snapshot UI runtime. |
| `ListBaseProps` | interface | Props accepted by the ListBase standalone component. |
| `NotificationBellBase` | function | Standalone NotificationBell — bell icon with unread count badge. Works with plain React props. |
| `NotificationBellBaseProps` | interface | Props accepted by the NotificationBellBase standalone component. |
| `ProgressBase` | function | Standalone Progress — bar or circular progress indicator. Works with plain React props. |
| `ProgressBaseProps` | interface | Props accepted by the ProgressBase standalone component. |
| `SaveIndicatorBase` | function | Standalone SaveIndicator — shows saving/saved/error status. Works with plain React props. |
| `SaveIndicatorBaseProps` | interface | Props accepted by the SaveIndicatorBase standalone component. |
| `ScrollAreaBase` | function | Standalone ScrollArea — a scrollable container with custom-styled thin scrollbars. Works with plain React props. |
| `ScrollAreaBaseProps` | interface | Props accepted by the ScrollAreaBase standalone component. |
| `SeparatorBase` | function | Standalone Separator — a horizontal or vertical line with optional label. Works with plain React props. |
| `SeparatorBaseProps` | interface | Props accepted by the SeparatorBase standalone component. |
| `SkeletonBase` | function | Standalone Skeleton — a placeholder loading indicator. Works with plain React props. |
| `SkeletonBaseProps` | interface | Props accepted by the SkeletonBase standalone component. |
| `StatCardBase` | function | Standalone StatCard — displays a single metric with optional trend indicator. Works with plain React props. |
| `StatCardBaseProps` | interface | Props accepted by the StatCardBase standalone component. |
| `StatCardTrend` | interface | Type definition exported by the Snapshot UI runtime. |
| `TooltipBase` | function | Standalone Tooltip — wraps child content and shows informational text on hover with configurable placement and delay. Works with plain React props. |
| `TooltipBaseProps` | interface | Props accepted by the TooltipBase standalone component. |
| `VoteBase` | function | Standalone Vote — upvote/downvote toggle with count display. Works with plain React props. |
| `VoteBaseProps` | interface | Props accepted by the VoteBase standalone component. |

### Details

#### `AlertBase({ id, title, description, variant, icon: iconProp, dismissible, actionLabel, onAction, className, style, slots, children, }: AlertBaseProps) => Element | null`

Standalone Alert — a styled alert/notification box with optional icon,
action button, and dismiss. Works with plain React props.

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
Works with plain React props.

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

#### `AvatarGroupBase({ id, avatars, size, max, overlap: overlapProp, className, style, slots, }: AvatarGroupBaseProps) => Element`

Standalone AvatarGroup — overlapping avatars with +N overflow.
Works with plain React props.

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

#### `BadgeBase({ id, text, color, variant, size, rounded, icon, className, style, slots, }: BadgeBaseProps) => Element`

Standalone Badge — a small label with color-coded variants.
Works with plain React props.

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

#### `ChartBase({ id, chartType, data: rows, xKey, series, height, aspectRatio, grid: showGrid, legend: showLegend, isLoading, error, emptyMessage, hideWhenEmpty, hasNewData, onRefresh, onPointClick, loadingContent,...`

Standalone Chart — renders data-driven charts via recharts.
Works with plain React props.

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

#### `DataTableBase({ id, columns, rows, sort, onSortChange, pagination, onPageChange, selectable, selection, onToggleRow, onToggleAll, rowIdField, searchable, searchPlaceholder, search, onSearchChange, rowActions, bulk...`

Standalone DataTable — feature-rich data table with sorting, pagination,
selection, and search. Works with plain React props.

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

#### `DetailCardBase({ id, data, fields, title, actions, isLoading, error, emptyMessage, loadingContent, className, style, slots, }: DetailCardBaseProps) => Element`

Standalone DetailCard — data-driven detail view with formatted fields
and header actions. Works with plain React props.

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

#### `EmptyStateBase({ id, title, description, icon, iconColor, size, actionLabel, onAction, className, style, slots, }: EmptyStateBaseProps) => Element`

Standalone EmptyState — a centered message with optional icon and action.
Works with plain React props.

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

#### `EntityPickerBase({ id, entities, value, label: triggerBaseLabel, multiple: isMultiple, searchable, maxHeight, isLoading, error, onChange, className, style, slots, }: EntityPickerBaseProps) => Element`

Standalone EntityPicker — dropdown with search, single/multi select.
Works with plain React props.

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

#### `FavoriteButtonBase({ id, active: activeProp, size: sizeProp, onToggle, className, style, slots, }: FavoriteButtonBaseProps) => Element`

Standalone FavoriteButton — a toggle button with a star icon.
Works with plain React props.

**Example:**

```tsx
<FavoriteButtonBase
  active={isFavorited}
  size="md"
  onToggle={(active) => setFavorited(active)}
/>
```

---

#### `FeedBase({ id, items, relativeTime, groupBy, pageSize, infinite, itemActions, isLoading, error, emptyMessage, hasNewData, onRefresh, onSelectItem, loadingContent, className, style, slots, }: FeedBaseProps) =>...`

Standalone Feed — feed/activity list with grouping, pagination, and
live updates. Works with plain React props.

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

#### `FilterBarBase({ id, filters, showSearch, searchPlaceholder, onChange, className, style, slots, }: FilterBarBaseProps) => Element`

Standalone FilterBar — search + filter dropdowns + active pills.
Works with plain React props.

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

#### `HighlightedTextBase({ id, text, highlight, caseSensitive, highlightColor, className, style, slots, }: HighlightedTextBaseProps) => Element`

Standalone HighlightedText — renders text with search query highlighting.
Works with plain React props.

**Example:**

```tsx
<HighlightedTextBase
  text="The quick brown fox jumps over the lazy dog"
  highlight="fox"
  highlightColor="var(--sn-color-warning)"
/>
```

---

#### `ListBase({ id, items, variant, selectable, divider: showDividerProp, limit, isLoading, error, emptyMessage, hasNewData, onRefresh, loadingContent, errorContent, emptyContent, className, style, slots, }: ListB...`

Standalone List — renders a vertical list of items with optional icons,
descriptions, badges, and click actions. Works with plain React props.

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

#### `NotificationBellBase({ id, count, size, max, onClick, ariaLive, className, style, slots, }: NotificationBellBaseProps) => Element`

Standalone NotificationBell — bell icon with unread count badge.
Works with plain React props.

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

#### `ProgressBase({ id, value: resolvedValue, max, label, size, variant, showValue, color, segments, className, style, slots, }: ProgressBaseProps) => Element`

Standalone Progress — bar or circular progress indicator.
Works with plain React props.

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

#### `SaveIndicatorBase({ id, status, showIcon, savingText, savedText, errorText, className, style, slots, }: SaveIndicatorBaseProps) => Element | null`

Standalone SaveIndicator — shows saving/saved/error status.
Works with plain React props.

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

#### `ScrollAreaBase({ id, orientation, maxHeight, maxWidth, showScrollbar, children, className, style, slots, }: ScrollAreaBaseProps) => Element`

Standalone ScrollArea — a scrollable container with custom-styled thin
scrollbars. Works with plain React props.

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

#### `SeparatorBase({ id, orientation, label, className, style, slots, }: SeparatorBaseProps) => Element`

Standalone Separator — a horizontal or vertical line with optional label.
Works with plain React props.

**Example:**

```tsx
<SeparatorBase
  orientation="horizontal"
  label="OR"
/>
```

---

#### `SkeletonBase({ id, variant, animated, lines, width, height, className, style, slots, }: SkeletonBaseProps) => Element`

Standalone Skeleton — a placeholder loading indicator.
Works with plain React props.

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

#### `StatCardBase({ id, value, label, isLoading, error, icon, iconColor, loadingVariant, trend, onClick, emptyMessage, className, style, slots, }: StatCardBaseProps) => Element`

Standalone StatCard — displays a single metric with optional trend indicator.
Works with plain React props.

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

#### `TooltipBase({ id, text, placement, delay, children, className, style, slots, }: TooltipBaseProps) => Element`

Standalone Tooltip — wraps child content and shows informational text
on hover with configurable placement and delay. Works with plain React props.

**Example:**

```tsx
<TooltipBase text="Copy to clipboard" placement="top" delay={200}>
  <button onClick={handleCopy}>Copy</button>
</TooltipBase>
```

---

#### `VoteBase({ id, value, onUpvote, onDownvote, className, style, slots, }: VoteBaseProps) => Element`

Standalone Vote — upvote/downvote toggle with count display.
Works with plain React props.

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
| `AutoFormBase` | function | Standalone AutoFormBase -- renders a schema-driven form with fields, sections, validation, and submit/reset actions. Works with plain React props. |
| `AutoFormBaseProps` | interface | Props accepted by the AutoFormBase standalone component. |
| `AutoFormFieldConfig` | interface | Configuration type for auto form field config. |
| `AutoFormFieldOption` | interface | Type definition exported by the Snapshot UI runtime. |
| `AutoFormFieldValidation` | interface | Type definition exported by the Snapshot UI runtime. |
| `AutoFormSectionConfig` | interface | Configuration type for auto form section config. |
| `ButtonBase` | function | Standalone ButtonBase -- a styled button that works with plain React props. Works with plain React props. |
| `ButtonBaseProps` | interface | Props accepted by the ButtonBase standalone component. |
| `ButtonControl` | function | Low-level styled button element with surface resolution and accessibility attributes. Used internally by ButtonBase and other components that need a styled `<button>`. Works with plain React props. |
| `ButtonControlProps` | interface | Props accepted by the ButtonControl component. |
| `ColorPickerBase` | variable | Exported variable from the Snapshot UI runtime. |
| `ColorPickerBaseProps` | typealias | Props accepted by the ColorPickerBase standalone component. |
| `ColorPickerField` | function | Standalone ColorPickerField -- a color picker with optional swatches, alpha slider, and custom hex input. Works with plain React props. |
| `ColorPickerFieldProps` | interface | Props accepted by the ColorPickerField component. |
| `DatePickerBase` | variable | Exported variable from the Snapshot UI runtime. |
| `DatePickerBaseProps` | typealias | Props accepted by the DatePickerBase standalone component. |
| `DatePickerDisabledEntry` | interface | Type definition exported by the Snapshot UI runtime. |
| `DatePickerField` | function | Standalone DatePickerField -- date picker supporting single, range, and multiple selection modes with presets and disabled dates. Works with plain React props. |
| `DatePickerFieldProps` | interface | Props accepted by the DatePickerField component. |
| `DatePickerPreset` | interface | Type definition exported by the Snapshot UI runtime. |
| `IconButtonBase` | function | Standalone IconButtonBase -- an icon-only button with configurable shape, size, and variant. Works with plain React props. |
| `IconButtonBaseProps` | interface | Props accepted by the IconButtonBase standalone component. |
| `InlineEditBase` | variable | Exported variable from the Snapshot UI runtime. |
| `InlineEditBaseProps` | typealias | Props accepted by the InlineEditBase standalone component. |
| `InlineEditField` | function | Standalone InlineEditField -- a click-to-edit text field that toggles between display and input modes. Works with plain React props. |
| `InlineEditFieldProps` | interface | Props accepted by the InlineEditField component. |
| `InputBase` | variable | Exported variable from the Snapshot UI runtime. |
| `InputBaseProps` | typealias | Props accepted by the InputBase standalone component. |
| `InputControl` | function | Low-level styled input element with surface resolution and state management. Used internally by InputField and other components that need a styled `<input>`. Works with plain React props. |
| `InputControlProps` | interface | Props accepted by the InputControl component. |
| `InputField` | function | Standalone InputField — a complete form field (label + input + helper/error) that works with plain React props. Works with plain React props. |
| `InputFieldProps` | interface | Props accepted by the InputField component. |
| `LocationInputBase` | variable | Exported variable from the Snapshot UI runtime. |
| `LocationInputBaseProps` | typealias | Props accepted by the LocationInputBase standalone component. |
| `LocationInputField` | function | Standalone LocationInputField -- a location search input with results dropdown and optional Google Maps link. Works with plain React props. |
| `LocationInputFieldProps` | interface | Props accepted by the LocationInputField component. |
| `LocationResult` | interface | Type definition exported by the Snapshot UI runtime. |
| `MultiSelectBase` | variable | Exported variable from the Snapshot UI runtime. |
| `MultiSelectBaseProps` | typealias | Props accepted by the MultiSelectBase standalone component. |
| `MultiSelectField` | function | Standalone MultiSelectField -- multi-select dropdown with pill tags, inline search, and configurable max selection. Works with plain React props. |
| `MultiSelectFieldOption` | interface | Type definition exported by the Snapshot UI runtime. |
| `MultiSelectFieldProps` | interface | Props accepted by the MultiSelectField component. |
| `QuickAddBase` | variable | Exported variable from the Snapshot UI runtime. |
| `QuickAddBaseProps` | typealias | Props accepted by the QuickAddBase standalone component. |
| `QuickAddField` | function | Standalone QuickAddField -- a compact input with submit button for quickly adding items to a list. Works with plain React props. |
| `QuickAddFieldProps` | interface | Props accepted by the QuickAddField component. |
| `SelectBase` | variable | Exported variable from the Snapshot UI runtime. |
| `SelectBaseProps` | typealias | Props accepted by the SelectBase standalone component. |
| `SelectControl` | function | Low-level styled select element with surface resolution and state management. Used internally by SelectField and other components that need a styled `<select>`. Works with plain React props. |
| `SelectControlProps` | interface | Props accepted by the SelectControl component. |
| `SelectField` | function | Standalone SelectField -- a complete select form field with label, options, helper/error text, and required indicator. Works with plain React props. |
| `SelectFieldProps` | interface | Props accepted by the SelectField component. |
| `SliderBase` | variable | Exported variable from the Snapshot UI runtime. |
| `SliderBaseProps` | typealias | Props accepted by the SliderBase standalone component. |
| `SliderField` | function | Standalone SliderField -- a range slider with optional label, value display, limit labels, and dual-thumb range mode. Works with plain React props. |
| `SliderFieldProps` | interface | Props accepted by the SliderField component. |
| `SwitchBase` | variable | Exported variable from the Snapshot UI runtime. |
| `SwitchBaseProps` | typealias | Props accepted by the SwitchBase standalone component. |
| `SwitchField` | function | Standalone SwitchField -- a toggle switch with label, description, and configurable size and color. Works with plain React props. |
| `SwitchFieldProps` | interface | Props accepted by the SwitchField component. |
| `TagSelectorBase` | variable | Exported variable from the Snapshot UI runtime. |
| `TagSelectorBaseProps` | typealias | Props accepted by the TagSelectorBase standalone component. |
| `TagSelectorField` | function | Standalone TagSelectorField -- tag pills with dropdown selection, search filtering, and optional tag creation. Works with plain React props. |
| `TagSelectorFieldProps` | interface | Props accepted by the TagSelectorField component. |
| `TagSelectorTag` | interface | Type definition exported by the Snapshot UI runtime. |
| `TextareaBase` | variable | Exported variable from the Snapshot UI runtime. |
| `TextareaBaseProps` | typealias | Props accepted by the TextareaBase standalone component. |
| `TextareaControl` | function | Low-level styled textarea element with surface resolution and state management. Used internally by TextareaField and other components that need a styled `<textarea>`. Works with plain React props. |
| `TextareaControlProps` | interface | Props accepted by the TextareaControl component. |
| `TextareaField` | function | Standalone TextareaField -- a complete textarea form field with label, character counter, validation, and helper/error text. Works with plain React props. |
| `TextareaFieldProps` | interface | Props accepted by the TextareaField component. |
| `ToggleBase` | variable | Exported variable from the Snapshot UI runtime. |
| `ToggleBaseProps` | typealias | Props accepted by the ToggleBase standalone component. |
| `ToggleField` | function | Standalone ToggleField -- a pressable toggle button with optional icon and label. Works with plain React props. |
| `ToggleFieldProps` | interface | Props accepted by the ToggleField component. |
| `ToggleGroupBase` | function | Standalone ToggleGroupBase -- a group of toggle buttons supporting single or multi-select modes. Works with plain React props. |
| `ToggleGroupBaseProps` | interface | Props accepted by the ToggleGroupBase standalone component. |
| `ToggleGroupItem` | interface | Type definition exported by the Snapshot UI runtime. |
| `WizardBase` | function | Standalone WizardBase -- a multi-step form wizard with progress indicator, step navigation, field validation, and completion state. Works with plain React props. |
| `WizardBaseProps` | interface | Props accepted by the WizardBase standalone component. |
| `WizardFieldConfig` | interface | Configuration type for wizard field config. |
| `WizardState` | interface | Type definition exported by the Snapshot UI runtime. |
| `WizardStepDef` | interface | Type definition exported by the Snapshot UI runtime. |

### Details

#### `AutoFormBase({ id, fields, sections, values, errors, touched, isSubmitting, isDirty, isValid, submitLabel: submitLabelProp, submitLoadingLabel: submitLoadingLabelProp, resetLabel: resetLabelProp, showReset, layou...`

Standalone AutoFormBase -- renders a schema-driven form with fields, sections,
validation, and submit/reset actions. Works with plain React props.

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

#### `ButtonBase({ id, label, icon, variant, size, disabled, fullWidth, onClick, type, ariaLabel, children, className, style, slots, }: ButtonBaseProps) => Element`

Standalone ButtonBase -- a styled button that works with plain React props.
Works with plain React props.

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

#### `ButtonControl({ id, children, type, variant, size, disabled, fullWidth, onClick, onKeyDown, onFocus, onBlur, onPointerDown, onPointerUp, onPointerEnter, onPointerLeave, onTouchStart, onTouchEnd, className, style, ...`

Low-level styled button element with surface resolution and accessibility attributes.
Used internally by ButtonBase and other components that need a styled `<button>`.
Works with plain React props.

**Example:**

```tsx
<ButtonControl variant="default" size="sm" onClick={handleClick}>
  Save
</ButtonControl>
```

---

#### `ColorPickerField({ id, label, defaultValue, format, showAlpha, allowCustom, swatches, onChange, className, style, slots, }: ColorPickerFieldProps) => Element`

Standalone ColorPickerField -- a color picker with optional swatches, alpha slider,
and custom hex input. Works with plain React props.

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

#### `DatePickerField({ id, label, placeholder, mode, format, valueFormat, min, max, presets, disabledDates, onChange, className, style, slots, }: DatePickerFieldProps) => Element`

Standalone DatePickerField -- date picker supporting single, range, and multiple
selection modes with presets and disabled dates. Works with plain React props.

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
size, and variant. Works with plain React props.

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

#### `InlineEditField({ id, value: valueProp, placeholder: placeholderProp, inputType, cancelOnEscape: cancelOnEscapeProp, fontSize: fontSizeProp, onSave, className, style, slots, }: InlineEditFieldProps) => Element`

Standalone InlineEditField -- a click-to-edit text field that toggles between
display and input modes. Works with plain React props.

**Example:**

```tsx
<InlineEditField
  value={title}
  placeholder="Click to edit"
  onSave={(newTitle) => updateTitle(newTitle)}
/>
```

---

#### `InputControl({ inputRef, inputId, name, type, value, checked, placeholder, autoComplete, autoFocus, disabled, readOnly, accept, multiple, list, min, max, step, maxLength, pattern, required, ariaInvalid, ariaDescr...`

Low-level styled input element with surface resolution and state management.
Used internally by InputField and other components that need a styled `<input>`.
Works with plain React props.

**Example:**

```tsx
<InputControl
  surfaceId="email-input"
  type="email"
  placeholder="you@example.com"
  onChangeText={(val) => setEmail(val)}
/>
```

---

#### `InputField({ id, label, placeholder, value: controlledValue, type, required, disabled, readOnly, maxLength, pattern, helperText, errorText, icon, onChange, onBlur, onFocus, onClick, onKeyDown, onMouseEnter, onM...`

Standalone InputField — a complete form field (label + input + helper/error)
that works with plain React props. Works with plain React props.

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

#### `LocationInputField({ id, label, placeholder: placeholderProp, helperText, errorText: errorTextProp, required, disabled, value: valueProp, showMapLink, results: resultsProp, loading, onSearch, onSelect, className, style...`

Standalone LocationInputField -- a location search input with results dropdown
and optional Google Maps link. Works with plain React props.

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

#### `MultiSelectField({ id, label, placeholder: placeholderProp, options: optionsProp, value: controlledValue, defaultValue, disabled, searchable, maxSelected, loading, error: errorProp, onRetry, onChange, className, styl...`

Standalone MultiSelectField -- multi-select dropdown with pill tags, inline search,
and configurable max selection. Works with plain React props.

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

#### `QuickAddField({ id, placeholder: placeholderProp, icon: iconProp, submitOnEnter: submitOnEnterProp, showButton: showButtonProp, buttonText: buttonTextProp, clearOnSubmit: clearOnSubmitProp, onSubmit, className, st...`

Standalone QuickAddField -- a compact input with submit button for quickly
adding items to a list. Works with plain React props.

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

#### `SelectControl({ selectRef, selectId, name, value, disabled, required, ariaInvalid, ariaDescribedBy, ariaLabel, onChangeValue, onBlur, onFocus, onClick, onKeyDown, onMouseEnter, onMouseLeave, onPointerDown, onPoint...`

Low-level styled select element with surface resolution and state management.
Used internally by SelectField and other components that need a styled `<select>`.
Works with plain React props.

**Example:**

```tsx
<SelectControl surfaceId="role-select" value={role} onChangeValue={setRole}>
  <option value="admin">Admin</option>
  <option value="member">Member</option>
</SelectControl>
```

---

#### `SelectField({ id, label, placeholder, value: controlledValue, defaultValue, required, disabled, helperText, errorText, options, loading, onChange, onBlur, onFocus, onClick, onKeyDown, className, style, slots, }:...`

Standalone SelectField -- a complete select form field with label, options,
helper/error text, and required indicator. Works with plain React props.

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

#### `SliderField({ id, label, min: minProp, max: maxProp, step, defaultValue, range, showValue, showLimits, suffix, disabled, onChange, className, style, slots, }: SliderFieldProps) => Element`

Standalone SliderField -- a range slider with optional label, value display,
limit labels, and dual-thumb range mode. Works with plain React props.

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
configurable size and color. Works with plain React props.

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

#### `TagSelectorField({ id, label, tags: tagsProp, value: controlledValue, defaultValue, allowCreate, maxTags, onChange, onCreate, className, style, slots, }: TagSelectorFieldProps) => Element`

Standalone TagSelectorField -- tag pills with dropdown selection, search filtering,
and optional tag creation. Works with plain React props.

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

#### `TextareaControl({ textareaRef, textareaId, name, value, rows, placeholder, disabled, readOnly, maxLength, required, resize, ariaInvalid, ariaDescribedBy, ariaLabel, onChangeText, onBlur, onFocus, onClick, onKeyDown,...`

Low-level styled textarea element with surface resolution and state management.
Used internally by TextareaField and other components that need a styled `<textarea>`.
Works with plain React props.

**Example:**

```tsx
<TextareaControl
  surfaceId="bio-textarea"
  rows={4}
  placeholder="Tell us about yourself"
  onChangeText={(val) => setBio(val)}
/>
```

---

#### `TextareaField({ id, label, placeholder, value: controlledValue, required, disabled, readOnly, maxLength, rows, resize, helperText, errorText, onChange, onBlur, onFocus, onClick, onKeyDown, className, style, slots,...`

Standalone TextareaField -- a complete textarea form field with label,
character counter, validation, and helper/error text. Works with plain React props.

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

#### `ToggleField({ id, label, icon, variant: variantProp, size: sizeProp, pressed: controlledPressed, defaultPressed, disabled, onChange, className, style, slots, }: ToggleFieldProps) => Element`

Standalone ToggleField -- a pressable toggle button with optional icon and label.
Works with plain React props.

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
or multi-select modes. Works with plain React props.

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

#### `WizardBase({ id, steps, state: wizard, submitLabel: submitLabelProp, className, style, slots, }: WizardBaseProps) => Element`

Standalone WizardBase -- a multi-step form wizard with progress indicator,
step navigation, field validation, and completion state. Works with plain React props.

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
| `ChatWindowBase` | function | Standalone ChatWindow — composable chat container with header, message thread, typing indicator, and input slots. Works with plain React props. |
| `ChatWindowBaseProps` | interface | Props accepted by the ChatWindowBase standalone component. |
| `CommentSectionBase` | function | Standalone CommentSection — threaded comment list with avatars, timestamps, optional delete actions, and a composable input slot. Works with plain React props. |
| `CommentSectionBaseProps` | interface | Props accepted by the CommentSectionBase standalone component. |
| `CUSTOM_EMOJI_CSS` | variable | CSS for custom emoji sizing. Custom emojis render as inline images sized to match surrounding text. |
| `CustomEmoji` | interface | Shape of a custom emoji entry. |
| `EmojiPickerBase` | function | Standalone EmojiPicker — searchable emoji grid with category tabs and custom emoji support. Works with plain React props. |
| `EmojiPickerBaseProps` | interface | Props accepted by the EmojiPickerBase standalone component. |
| `GifPickerBase` | function | Standalone GifPicker — searchable GIF grid with debounced search, loading states, and optional attribution. Works with plain React props. |
| `GifPickerBaseProps` | interface | Props accepted by the GifPickerBase standalone component. |
| `MessageThreadBase` | function | Standalone MessageThread — scrollable message list with avatars, date separators, auto-scroll, embed rendering, and consecutive-message grouping. Works with plain React props. |
| `MessageThreadBaseProps` | interface | Props accepted by the MessageThreadBase standalone component. |
| `parseShortcodes` | function | Parses shortcodes in text and replaces them with `<img>` tags. |
| `PresenceIndicatorBase` | function | Standalone PresenceIndicator — displays online/offline/away/busy/dnd status with a colored dot and optional label. Works with plain React props. |
| `PresenceIndicatorBaseProps` | interface | Props accepted by the PresenceIndicatorBase standalone component. |
| `ReactionBarBase` | function | Standalone ReactionBar — row of emoji reaction pills with counts and an add-reaction button that opens an inline emoji picker. Works with plain React props. |
| `ReactionBarBaseProps` | interface | Props accepted by the ReactionBarBase standalone component. |
| `ReactionEntry` | interface | Type definition exported by the Snapshot UI runtime. |
| `resolveEmojiRecords` | function | Resolves emoji records from the API into CustomEmoji entries. Handles the `uploadKey` → `url` resolution using a URL prefix or field mapping. |
| `TypingIndicatorBase` | function | Standalone TypingIndicator — shows animated bouncing dots with user names to indicate who is currently typing. Works with plain React props. |
| `TypingIndicatorBaseProps` | interface | Props accepted by the TypingIndicatorBase standalone component. |
| `TypingUser` | interface | A user entry for the typing indicator. |

### Details

#### `buildEmojiMap(emojis: CustomEmoji[]) => Map<string, CustomEmoji>`

Builds a shortcode lookup map from an array of custom emojis.

---

#### `ChatWindowBase({ id, title, subtitle, showHeader, height, threadSlot, typingSlot, inputSlot, showTypingIndicator, className, style, slots, }: ChatWindowBaseProps) => Element`

Standalone ChatWindow — composable chat container with header, message thread,
typing indicator, and input slots. Works with plain React props.

**Example:**

```tsx
<ChatWindowBase
  title="General"
  threadSlot={<MessageThreadBase messages={messages} />}
  inputSlot={<input placeholder="Type a message..." />}
/>
```

---

#### `CommentSectionBase({ id, comments, loading, error, emptyText, authorNameField, authorAvatarField, contentField, timestampField, sortOrder, showDelete, onDelete, inputSlot, className, style, slots, }: CommentSectionBase...`

Standalone CommentSection — threaded comment list with avatars, timestamps,
optional delete actions, and a composable input slot. Works with plain React props.

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

#### `EmojiPickerBase({ id, perRow, maxHeight, categories: allowedCategories, customEmojis, onSelect, className, style, slots, }: EmojiPickerBaseProps) => Element`

Standalone EmojiPicker — searchable emoji grid with category tabs and custom emoji
support. Works with plain React props.

**Example:**

```tsx
<EmojiPickerBase
  perRow={8}
  onSelect={({ emoji, name }) => console.log(emoji, name)}
/>
```

---

#### `GifPickerBase({ id, columns, maxHeight, placeholder, attribution, gifs, loading, onSelect, onSearchChange, className, style, slots, }: GifPickerBaseProps) => Element`

Standalone GifPicker — searchable GIF grid with debounced search, loading states,
and optional attribution. Works with plain React props.

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

#### `MessageThreadBase({ id, messages, loading, error, emptyText, contentField, authorNameField, authorAvatarField, timestampField, showTimestamps, embedsField, showEmbeds, groupByDate, maxHeight, onMessageClick, renderEmb...`

Standalone MessageThread — scrollable message list with avatars, date separators,
auto-scroll, embed rendering, and consecutive-message grouping. Works with plain React props.

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

#### `PresenceIndicatorBase({ id, status, label, showDot, showLabel, size, className, style, slots, }: PresenceIndicatorBaseProps) => Element`

Standalone PresenceIndicator — displays online/offline/away/busy/dnd status
with a colored dot and optional label. Works with plain React props.

**Example:**

```tsx
<PresenceIndicatorBase status="online" size="md" />
```

---

#### `ReactionBarBase({ id, reactions, showAddButton, onReactionClick, onEmojiSelect, EmojiPickerComponent, className, style, slots, }: ReactionBarBaseProps) => Element`

Standalone ReactionBar — row of emoji reaction pills with counts and an
add-reaction button that opens an inline emoji picker. Works with plain React props.

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

#### `TypingIndicatorBase({ id, users, maxDisplay, className, style, slots, }: TypingIndicatorBaseProps) => Element | null`

Standalone TypingIndicator — shows animated bouncing dots with user names
to indicate who is currently typing. Works with plain React props.

**Example:**

```tsx
<TypingIndicatorBase users={[{ name: "Alice" }, { name: "Bob" }]} />
```

---

## Components — Content

| Export | Kind | Description |
|---|---|---|
| `BannerBase` | function | Standalone Banner — a full-width hero section with background, overlay, and content alignment. Works with plain React props. |
| `BannerBaseProps` | interface | Props accepted by the BannerBase standalone component. |
| `CodeBase` | function | Standalone Code — an inline code element for displaying code snippets within flowing text. Works with plain React props. |
| `CodeBaseProps` | interface | Props accepted by the CodeBase standalone component. |
| `CodeBlockBase` | function | Standalone CodeBlock — displays code with syntax highlighting, optional line numbers, copy button, and title bar. Works with plain React props. |
| `CodeBlockBaseProps` | interface | Props accepted by the CodeBlockBase standalone component. |
| `CompareViewBase` | function | Standalone CompareView — a side-by-side diff viewer for comparing two text blocks. Works with plain React props. |
| `CompareViewBaseProps` | interface | Props accepted by the CompareViewBase standalone component. |
| `detectPlatform` | function | Detects the platform from a URL and extracts embed info. |
| `FileUploaderBase` | function | Standalone FileUploader — a file upload component with dropzone, button, and compact variants. Works with plain React props. |
| `FileUploaderBaseProps` | interface | Props accepted by the FileUploaderBase standalone component. |
| `HeadingBase` | function | Standalone Heading — a styled heading element (h1-h6) that works with plain React props. Works with plain React props. |
| `HeadingBaseProps` | interface | Props accepted by the HeadingBase standalone component. |
| `LinkEmbedBase` | function | Standalone LinkEmbed — renders rich link previews with platform-specific embeds (YouTube, Instagram, TikTok, Twitter, GIF) or a generic card. Works with plain React props. |
| `LinkEmbedBaseProps` | interface | Props accepted by the LinkEmbedBase standalone component. |
| `LinkEmbedMeta` | interface | Type definition exported by the Snapshot UI runtime. |
| `MarkdownBase` | function | Standalone Markdown — renders markdown content with syntax highlighting and Snapshot design tokens. Works with plain React props. |
| `MarkdownBaseProps` | interface | Props accepted by the MarkdownBase standalone component. |
| `Platform` | typealias | Platform detection and embed URL extraction. Identifies known platforms from URLs and extracts the embed-compatible URL or ID needed to render platform-specific iframes. |
| `PLATFORM_COLORS` | variable | Platform accent colors. |
| `PLATFORM_NAMES` | variable | Platform display names. |
| `PlatformInfo` | interface | Resolved platform metadata used to render a platform-specific embedded preview. |
| `RichInputBase` | variable | Standalone RichInput — a rich text editor with formatting toolbar, powered by tiptap. Works with plain React props. |
| `RichInputBaseHandle` | interface | Imperative handle exposed via `ref`. Use this when an external surface (emoji picker, GIF picker, slash-command menu) needs to insert content at the user's current cursor position without going through the controlled-value path (which clobbers the cursor). |
| `RichInputBaseProps` | interface | Props accepted by the RichInputBase standalone component. |
| `RichTextEditorBase` | function | Standalone RichTextEditor — a markdown editor with live preview, powered by CodeMirror. Works with plain React props. |
| `RichTextEditorBaseProps` | interface | Props accepted by the RichTextEditorBase standalone component. |
| `TimelineBase` | function | Standalone Timeline — vertical event timeline with dot markers, connectors, date labels, and default/compact/alternating layout variants. Works with plain React props. |
| `TimelineBaseProps` | interface | Props accepted by the TimelineBase standalone component. |
| `TimelineItemEntry` | interface | Type definition exported by the Snapshot UI runtime. |

### Details

#### `BannerBase({ id, height, align, background, className, style, slots, children, }: BannerBaseProps) => Element`

Standalone Banner — a full-width hero section with background, overlay,
and content alignment. Works with plain React props.

**Example:**

```tsx
<BannerBase height="60vh" align="center" background={{ color: "#1a1a2e" }}>
  <h1>Welcome</h1>
  <p>Get started today</p>
</BannerBase>
```

---

#### `CodeBase({ id, value, fallback, className, style, slots, }: CodeBaseProps) => Element`

Standalone Code — an inline code element for displaying code snippets
within flowing text. Works with plain React props.

**Example:**

```tsx
<CodeBase value="npm install snapshot" />
```

---

#### `CodeBlockBase({ id, code, language, title, showCopy, showLineNumbers, wrap, highlight: highlightEnabled, maxHeight, className, style, slots, }: CodeBlockBaseProps) => Element`

Standalone CodeBlock — displays code with syntax highlighting,
optional line numbers, copy button, and title bar.
Works with plain React props.

**Example:**

```tsx
<CodeBlockBase code="console.log('hello');" language="javascript" title="example.js" showLineNumbers />
```

---

#### `CompareViewBase({ id, left, right, leftLabel, rightLabel, maxHeight, showLineNumbers, className, style, slots, }: CompareViewBaseProps) => Element`

Standalone CompareView — a side-by-side diff viewer for comparing two
text blocks. Works with plain React props.

**Example:**

```tsx
<CompareViewBase left="original text" right="modified text" leftLabel="Before" rightLabel="After" />
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

#### `FileUploaderBase({ id, variant, label, description, maxFiles, maxSize, accept, onFilesAdded, onFileRemoved, onUpload: _onUpload, onProgress: _onProgress, onError: _onError, onComplete: _onComplete, files: controlledF...`

Standalone FileUploader — a file upload component with dropzone, button,
and compact variants. Works with plain React props.

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

#### `HeadingBase({ id, text, level, align, className, style, slots, }: HeadingBaseProps) => Element`

Standalone Heading — a styled heading element (h1-h6) that works with plain
React props. Works with plain React props.

**Example:**

```tsx
<HeadingBase text="Welcome" level={1} align="center" />
```

---

#### `LinkEmbedBase({ id, url, meta, allowIframe, aspectRatio, maxWidth, className, style, slots, }: LinkEmbedBaseProps) => Element | null`

Standalone LinkEmbed — renders rich link previews with platform-specific
embeds (YouTube, Instagram, TikTok, Twitter, GIF) or a generic card.
Works with plain React props.

**Example:**

```tsx
<LinkEmbedBase url="https://www.youtube.com/watch?v=xyz" />
```

---

#### `MarkdownBase({ id, content, maxHeight, className, style, slots, }: MarkdownBaseProps) => Element`

Standalone Markdown — renders markdown content with syntax highlighting
and Snapshot design tokens. Works with plain React props.

**Example:**

```tsx
<MarkdownBase content="# Hello\n\nThis is **bold** text." />
```

---

#### `RichInputBase` *(variable)*

Standalone RichInput — a rich text editor with formatting toolbar,
powered by tiptap. Works with plain React props.

**Example:**

```tsx
<RichInputBase
  placeholder="Type a message..."
  features={["bold", "italic", "link"]}
  onSend={({ html, text }) => sendMessage(html)}
/>
```

---

#### `RichInputBaseHandle` *(interface)*

Imperative handle exposed via `ref`. Use this when an external surface
(emoji picker, GIF picker, slash-command menu) needs to insert content
at the user's current cursor position without going through the
controlled-value path (which clobbers the cursor).

**Example:**

```tsx
const editorRef = useRef<RichInputBaseHandle>(null);
<RichInputBase ref={editorRef} ... />
<button onClick={() => editorRef.current?.insertText('👍')}>👍</button>
```

---

#### `RichTextEditorBase({ id, content: initialContent, placeholder: placeholderText, readonly, mode: initialMode, toolbar, minHeight, maxHeight, onChange, renderPreview, className, style, slots, }: RichTextEditorBaseProps) ...`

Standalone RichTextEditor — a markdown editor with live preview,
powered by CodeMirror. Works with plain React props.

**Example:**

```tsx
<RichTextEditorBase content="# Hello" onChange={(md) => save(md)} />
```

---

#### `TimelineBase({ id, items, variant, showConnector, loading, error, emptyText, onItemClick, className, style, slots, }: TimelineBaseProps) => Element`

Standalone Timeline — vertical event timeline with dot markers, connectors,
date labels, and default/compact/alternating layout variants. Works with plain React props.

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
| `CommandPaletteBase` | function | Standalone CommandPalette — a search-driven command list with keyboard navigation. Works with plain React props. |
| `CommandPaletteBaseGroup` | interface | Type definition exported by the Snapshot UI runtime. |
| `CommandPaletteBaseItem` | interface | Type definition exported by the Snapshot UI runtime. |
| `CommandPaletteBaseProps` | interface | Props accepted by the CommandPaletteBase standalone component. |
| `ConfirmDialogBase` | function | Standalone ConfirmDialog — a confirmation dialog built on ModalBase with plain React props. Works with plain React props. |
| `ConfirmDialogBaseProps` | interface | Props accepted by the ConfirmDialogBase standalone component. |
| `ContextMenuBase` | function | Standalone ContextMenu — a right-click context menu with plain React props. Works with plain React props. |
| `ContextMenuBaseEntry` | typealias | Type definition exported by the Snapshot UI runtime. |
| `ContextMenuBaseItem` | interface | Type definition exported by the Snapshot UI runtime. |
| `ContextMenuBaseLabel` | interface | Type definition exported by the Snapshot UI runtime. |
| `ContextMenuBaseProps` | interface | Props accepted by the ContextMenuBase standalone component. |
| `ContextMenuBaseSeparator` | interface | Type definition exported by the Snapshot UI runtime. |
| `DrawerBase` | function | Standalone Drawer — a sliding panel overlay with plain React props. Works with plain React props. |
| `DrawerBaseFooterAction` | interface | Type definition exported by the Snapshot UI runtime. |
| `DrawerBaseProps` | interface | Props accepted by the DrawerBase standalone component. |
| `DropdownMenuBase` | function | Standalone DropdownMenu — a button-triggered floating menu with plain React props. Works with plain React props. |
| `DropdownMenuBaseEntry` | typealias | Type definition exported by the Snapshot UI runtime. |
| `DropdownMenuBaseItem` | interface | Type definition exported by the Snapshot UI runtime. |
| `DropdownMenuBaseLabel` | interface | Type definition exported by the Snapshot UI runtime. |
| `DropdownMenuBaseProps` | interface | Props accepted by the DropdownMenuBase standalone component. |
| `DropdownMenuBaseSeparator` | interface | Type definition exported by the Snapshot UI runtime. |
| `DropdownMenuBaseTrigger` | interface | Type definition exported by the Snapshot UI runtime. |
| `HoverCardBase` | function | Standalone HoverCard — a floating panel that appears on hover with plain React props. Works with plain React props. |
| `HoverCardBaseProps` | interface | Props accepted by the HoverCardBase standalone component. |
| `ModalBase` | function | Standalone Modal — a centered overlay dialog with plain React props. Works with plain React props. |
| `ModalBaseFooterAction` | interface | Type definition exported by the Snapshot UI runtime. |
| `ModalBaseProps` | interface | Props accepted by the ModalBase standalone component. |
| `PopoverBase` | function | Standalone Popover — a button-triggered floating panel with plain React props. Works with plain React props. |
| `PopoverBaseProps` | interface | Props accepted by the PopoverBase standalone component. |

### Details

#### `CommandPaletteBase({ id, open, onClose, onSelect, groups, placeholder, emptyMessage, maxHeight, query: controlledQuery, onQueryChange, shortcutHint, className, style, slots, }: CommandPaletteBaseProps) => Element | nul...`

Standalone CommandPalette — a search-driven command list with keyboard
navigation. Works with plain React props.

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
plain React props. Works with plain React props.

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

#### `ContextMenuBase({ id, items, onSelect, onOpenChange, children, className, style, slots, }: ContextMenuBaseProps) => Element`

Standalone ContextMenu — a right-click context menu with plain React props.
Works with plain React props.

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
Works with plain React props.

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

#### `DropdownMenuBase({ id, trigger, items, onSelect, align, side, className, style, slots, }: DropdownMenuBaseProps) => Element`

Standalone DropdownMenu — a button-triggered floating menu with plain React props.
Works with plain React props.

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
React props. Works with plain React props.

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
Works with plain React props.

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

#### `PopoverBase({ id, triggerLabel, triggerIcon, triggerVariant, title, description, placement, width, onOpenChange, footer, className, style, slots, children, }: PopoverBaseProps) => Element`

Standalone Popover — a button-triggered floating panel with plain React props.
Works with plain React props.

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
| `AccordionBase` | function | Standalone Accordion — an expandable/collapsible panel list with plain React children. Works with plain React props. |
| `AccordionBaseItem` | interface | Type definition exported by the Snapshot UI runtime. |
| `AccordionBaseProps` | interface | Props accepted by the AccordionBase standalone component. |
| `BreadcrumbBase` | function | Standalone Breadcrumb — a navigation trail rendered with plain React props. Works with plain React props. |
| `BreadcrumbBaseItem` | interface | Type definition exported by the Snapshot UI runtime. |
| `BreadcrumbBaseProps` | interface | Props accepted by the BreadcrumbBase standalone component. |
| `PrefetchLinkBase` | function | Standalone PrefetchLink — a plain `<a>` anchor that fires a prefetch callback based on the configured strategy. Works without SSR context. |
| `PrefetchLinkBaseProps` | interface | Props accepted by the PrefetchLinkBase standalone component. |
| `StepperBase` | function | Standalone Stepper — a multi-step progress indicator with plain React props. Works with plain React props. |
| `StepperBaseProps` | interface | Props accepted by the StepperBase standalone component. |
| `StepperBaseStep` | interface | Type definition exported by the Snapshot UI runtime. |
| `TabsBase` | function | Standalone Tabs — tabbed navigation with plain React props. Works with plain React props. |
| `TabsBaseProps` | interface | Props accepted by the TabsBase standalone component. |
| `TabsBaseTab` | interface | Type definition exported by the Snapshot UI runtime. |
| `TreeViewBase` | function | Standalone TreeView — a hierarchical tree with expand/collapse and selection. Works with plain React props. |
| `TreeViewBaseItem` | interface | Type definition exported by the Snapshot UI runtime. |
| `TreeViewBaseProps` | interface | Props accepted by the TreeViewBase standalone component. |

### Details

#### `AccordionBase({ id, items, mode, variant, iconPosition, defaultOpen, className, style, slots, }: AccordionBaseProps) => Element`

Standalone Accordion — an expandable/collapsible panel list with plain React
children. Works with plain React props.

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
Works with plain React props.

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

#### `PrefetchLinkBase({ id, to, prefetch, children, target, rel, onPrefetch, className, style, slots, }: PrefetchLinkBaseProps) => Element`

Standalone PrefetchLink — a plain `<a>` anchor that fires a prefetch callback
based on the configured strategy. Works without SSR context.

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
Works with plain React props.

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
Works with plain React props.

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

#### `TreeViewBase({ id, items, selectable, multiSelect, showIcon, showConnectors, onSelect: onSelectProp, emptyMessage, isLoading, error, onRetry, className, style, slots, }: TreeViewBaseProps) => Element`

Standalone TreeView — a hierarchical tree with expand/collapse and selection.
Works with plain React props.

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
| `BoxBase` | function | Standalone Box -- a generic container element with configurable HTML tag. Works with plain React props. |
| `BoxBaseProps` | interface | Props accepted by the BoxBase standalone component. |
| `CardBase` | function | Standalone Card — a styled container with optional title/subtitle and standard React children. Works with plain React props. |
| `CardBaseProps` | interface | Props accepted by the CardBase standalone component. |
| `CollapsibleBase` | function | Standalone Collapsible -- an animated expand/collapse container with an optional trigger. Works with plain React props. |
| `CollapsibleBaseProps` | interface | Props accepted by the CollapsibleBase standalone component. |
| `ColumnBase` | function | Standalone Column -- a vertical flex container. Works with plain React props. |
| `ColumnBaseProps` | interface | Props accepted by the ColumnBase standalone component. |
| `ContainerBase` | function | Standalone Container -- a centered, max-width-constrained wrapper. Works with plain React props. |
| `ContainerBaseProps` | interface | Props accepted by the ContainerBase standalone component. |
| `GridBase` | function | Standalone Grid -- a CSS grid container. Works with plain React props. |
| `GridBaseProps` | interface | Props accepted by the GridBase standalone component. |
| `LayoutBase` | function | Standalone Layout -- a layout shell component that wraps page content. Renders one of six layout variants with plain React props. |
| `LayoutBaseProps` | interface | Props accepted by the LayoutBase standalone component. |
| `LayoutBaseSlots` | typealias | Named slot content map for slot-aware layouts. |
| `LayoutBaseVariant` | typealias | Type definition exported by the Snapshot UI runtime. |
| `NavBase` | function | Standalone Nav -- a navigation component with items, logo, and collapse support. Works with plain React props. |
| `NavBaseItem` | interface | Type definition exported by the Snapshot UI runtime. |
| `NavBaseLogo` | interface | Type definition exported by the Snapshot UI runtime. |
| `NavBaseProps` | interface | Props accepted by the NavBase standalone component. |
| `NavBaseUser` | interface | Type definition exported by the Snapshot UI runtime. |
| `NavDropdownBase` | function | Standalone NavDropdown -- a navigation dropdown with floating panel. Works with plain React props. |
| `NavDropdownBaseProps` | interface | Props accepted by the NavDropdownBase standalone component. |
| `NavLinkBase` | function | Standalone NavLink -- a navigation link with optional icon and badge. Works with plain React props. |
| `NavLinkBaseProps` | interface | Props accepted by the NavLinkBase standalone component. |
| `NavLogoBase` | function | Standalone NavLogo -- a clickable brand logo/text element for navigation headers. Works with plain React props. |
| `NavLogoBaseProps` | interface | Props accepted by the NavLogoBase standalone component. |
| `NavSearchBase` | function | Standalone NavSearch -- a search input with optional keyboard shortcut display. Works with plain React props. |
| `NavSearchBaseProps` | interface | Props accepted by the NavSearchBase standalone component. |
| `NavSectionBase` | function | Standalone NavSection -- a labeled, optionally collapsible group within navigation. Works with plain React props. |
| `NavSectionBaseProps` | interface | Props accepted by the NavSectionBase standalone component. |
| `NavUserMenuBase` | function | Standalone NavUserMenu -- a user menu dropdown with avatar trigger. Works with plain React props. |
| `NavUserMenuBaseItem` | interface | Type definition exported by the Snapshot UI runtime. |
| `NavUserMenuBaseProps` | interface | Props accepted by the NavUserMenuBase standalone component. |
| `OutletBase` | function | Standalone OutletBase — a router-agnostic mount point for child routes or manually-supplied content. Works with plain React props. Pass router-rendered content as `children`. When children is empty, `fallback` is rendered instead. |
| `OutletBaseProps` | interface | Props accepted by the OutletBase standalone component. |
| `RowBase` | function | Standalone Row -- a horizontal flex container. Works with plain React props. |
| `RowBaseProps` | interface | Props accepted by the RowBase standalone component. |
| `SectionBase` | function | Standalone Section -- a full-width vertical section with optional height and alignment. Works with plain React props. |
| `SectionBaseProps` | interface | Props accepted by the SectionBase standalone component. |
| `SpacerBase` | function | Standalone Spacer -- an empty element that takes up space along an axis. Works with plain React props. |
| `SpacerBaseProps` | interface | Props accepted by the SpacerBase standalone component. |
| `SplitPaneBase` | function | Standalone SplitPane -- a resizable two-pane layout with a draggable divider. Works with plain React props. |
| `SplitPaneBaseProps` | interface | Props accepted by the SplitPaneBase standalone component. |

### Details

#### `BoxBase({ id, as, className, style, slots, children, }: BoxBaseProps) => Element`

Standalone Box -- a generic container element with configurable HTML tag.
Works with plain React props.

**Example:**

```tsx
<BoxBase as="section">
  <p>Content here</p>
</BoxBase>
```

---

#### `CardBase({ id, title, subtitle, gap: gapProp, background, staggerDelay, className, style, slots, children, }: CardBaseProps) => Element`

Standalone Card — a styled container with optional title/subtitle and
standard React children. Works with plain React props.

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
Works with plain React props.

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

#### `ColumnBase({ id, gap: gapProp, align, justify, overflow, maxHeight, className, style, slots, children, }: ColumnBaseProps) => Element`

Standalone Column -- a vertical flex container.
Works with plain React props.

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
Works with plain React props.

**Example:**

```tsx
<ContainerBase maxWidth="xl" padding="md">
  <p>Centered content</p>
</ContainerBase>
```

---

#### `GridBase({ id, areas, columns, rows, gap: gapProp, className, style, slots, children, }: GridBaseProps) => Element`

Standalone Grid -- a CSS grid container.
Works with plain React props.

**Example:**

```tsx
<GridBase columns={3} gap="md">
  <div>Cell 1</div>
  <div>Cell 2</div>
  <div>Cell 3</div>
</GridBase>
```

---

#### `LayoutBase({ variant, className, style, nav, layoutSlots, children, }: LayoutBaseProps) => Element`

Standalone Layout -- a layout shell component that wraps page content.
Renders one of six layout variants with plain React props.

**Example:**

```tsx
<LayoutBase variant="sidebar" nav={<MyNav />}>
  <p>Page content</p>
</LayoutBase>
```

---

#### `NavBase({ id, variant, items, logo, collapsible, pathname, onNavigate, className, style, slots, children, renderItem, renderLogo, footer, collapsed, onToggleCollapse, }: NavBaseProps) => Element`

Standalone Nav -- a navigation component with items, logo, and collapse support.
Works with plain React props.

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
Works with plain React props.

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
Works with plain React props.

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
Works with plain React props.

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
Works with plain React props.

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
Works with plain React props.

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
Works with plain React props.

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

#### `OutletBase({ id, children, fallback, className, style, slots, }: OutletBaseProps) => Element`

Standalone OutletBase — a router-agnostic mount point for child routes or
manually-supplied content. Works with plain React props.

Pass router-rendered content as `children`. When children is empty,
`fallback` is rendered instead.

**Example:**

```tsx
<OutletBase fallback={<EmptyState title="Pick a section" />}>
  {currentRouteContent}
</OutletBase>
```

---

#### `RowBase({ id, gap: gapProp, align, justify, wrap, overflow, maxHeight, className, style, slots, children, }: RowBaseProps) => Element`

Standalone Row -- a horizontal flex container.
Works with plain React props.

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
Works with plain React props.

**Example:**

```tsx
<SectionBase height="screen" align="center" justify="center">
  <h1>Hero content</h1>
</SectionBase>
```

---

#### `SpacerBase({ id, size: sizeProp, axis, flex, className, style, slots, }: SpacerBaseProps) => Element`

Standalone Spacer -- an empty element that takes up space along an axis.
Works with plain React props.

**Example:**

```tsx
<SpacerBase size="lg" />
<SpacerBase axis="horizontal" size="md" />
```

---

#### `SplitPaneBase({ id, direction, defaultSplit, minSize, className, style, slots, first, second, }: SplitPaneBaseProps) => Element`

Standalone SplitPane -- a resizable two-pane layout with a draggable divider.
Works with plain React props.

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

## Components — Media

| Export | Kind | Description |
|---|---|---|
| `CarouselBase` | function | Standalone CarouselBase — renders a slide carousel with auto-play, arrow navigation, and dot indicators. Pauses on hover. Works with plain React props. |
| `CarouselBaseProps` | interface | Props accepted by the CarouselBase standalone component. |
| `EmbedBase` | function | Standalone Embed — a responsive iframe container for embedding external content. Works with plain React props. |
| `EmbedBaseProps` | interface | Props accepted by the EmbedBase standalone component. |
| `SnapshotImageBase` | function | Standalone SnapshotImage — an optimized image component with placeholder support. Works with plain React props. |
| `SnapshotImageBaseProps` | interface | Props accepted by the SnapshotImageBase standalone component. |
| `VideoBase` | function | Standalone Video — a styled video element that works with plain React props. Works with plain React props. |
| `VideoBaseProps` | interface | Props accepted by the VideoBase standalone component. |

### Details

#### `CarouselBase({ id, children, autoPlay, interval: intervalMs, showArrows, showDots, className, style, slots, }: CarouselBaseProps) => Element | null`

Standalone CarouselBase — renders a slide carousel with auto-play, arrow navigation,
and dot indicators. Pauses on hover. Works with plain React props.

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
content. Works with plain React props.

**Example:**

```tsx
<EmbedBase url="https://www.youtube.com/embed/xyz" aspectRatio="16/9" title="Demo Video" />
```

---

#### `SnapshotImageBase({ id, src, alt, width, height, quality, format, sizes, priority, placeholder, loading: loadingProp, aspectRatio, className, style, slots, }: SnapshotImageBaseProps) => Element`

Standalone SnapshotImage — an optimized image component with placeholder
support. Works with plain React props.

**Example:**

```tsx
<SnapshotImageBase src="/photo.jpg" alt="Photo" width={800} height={600} placeholder="blur" />
```

---

#### `VideoBase({ id, src, poster, controls, autoPlay, loop, muted, className, style, slots, }: VideoBaseProps) => Element`

Standalone Video — a styled video element that works with plain React props.
Works with plain React props.

**Example:**

```tsx
<VideoBase src="/video.mp4" poster="/thumb.jpg" controls />
```

---

## Components — Primitives

| Export | Kind | Description |
|---|---|---|
| `DividerBase` | function | Standalone Divider — renders a horizontal or vertical separator line, optionally with a centered label. Works with plain React props. |
| `DividerBaseProps` | interface | Props accepted by the DividerBase standalone component. |
| `FloatingMenuBase` | function | Standalone FloatingMenu — a dropdown menu with trigger, keyboard navigation, and pre-resolved items. Works with plain React props. |
| `FloatingMenuBaseEntry` | typealias | Type definition exported by the Snapshot UI runtime. |
| `FloatingMenuBaseItem` | interface | Type definition exported by the Snapshot UI runtime. |
| `FloatingMenuBaseLabel` | interface | Type definition exported by the Snapshot UI runtime. |
| `FloatingMenuBaseProps` | interface | Props accepted by the FloatingMenuBase standalone component. |
| `FloatingMenuBaseSeparator` | interface | Type definition exported by the Snapshot UI runtime. |
| `LinkBase` | function | Standalone Link — renders a styled anchor element with optional icon and badge. Works with plain React props. |
| `LinkBaseProps` | interface | Props accepted by the LinkBase standalone component. |
| `OAuthButtonsBase` | function | Standalone OAuthButtons — renders OAuth provider buttons with optional heading and auto-redirect support. Works with plain React props. |
| `OAuthButtonsBaseProps` | interface | Props accepted by the OAuthButtonsBase standalone component. |
| `OAuthProvider` | interface | Type definition exported by the Snapshot UI runtime. |
| `PasskeyButtonBase` | function | Standalone PasskeyButton — renders a passkey authentication button. Works with plain React props. |
| `PasskeyButtonBaseProps` | interface | Props accepted by the PasskeyButtonBase standalone component. |
| `StackBase` | function | Standalone Stack — a flex-column layout container with token-based spacing. Works with plain React props. |
| `StackBaseProps` | interface | Props accepted by the StackBase standalone component. |
| `TextBase` | function | Standalone Text — renders a styled paragraph element with token-based typography. Works with plain React props. |
| `TextBaseProps` | interface | Props accepted by the TextBase standalone component. |

### Details

#### `DividerBase({ label, orientation, id, className, style, slots, }: DividerBaseProps) => Element`

Standalone Divider — renders a horizontal or vertical separator line,
optionally with a centered label. Works with plain React props.

**Example:**

```tsx
<DividerBase orientation="horizontal" label="OR" />
```

---

#### `FloatingMenuBase({ triggerLabel, triggerIcon, items, open: controlledOpen, align, side, id, className, style, slots, }: FloatingMenuBaseProps) => Element`

Standalone FloatingMenu — a dropdown menu with trigger, keyboard navigation,
and pre-resolved items. Works with plain React props.

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
badge. Works with plain React props.

**Example:**

```tsx
<LinkBase text="Documentation" to="/docs" icon="book" variant="default" />
```

---

#### `OAuthButtonsBase({ heading, providers, providerMode, onProviderClick, id, className, style, slots, }: OAuthButtonsBaseProps) => Element | null`

Standalone OAuthButtons — renders OAuth provider buttons with optional
heading and auto-redirect support. Works with plain React props.

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
Works with plain React props.

**Example:**

```tsx
<PasskeyButtonBase label="Sign in with passkey" onClick={() => startPasskey()} />
```

---

#### `StackBase({ gap, align, justify, maxWidth, overflow, maxHeight, padding, staggerDelay, id, className, style, slots, children, }: StackBaseProps) => Element`

Standalone Stack — a flex-column layout container with token-based spacing.
Works with plain React props.

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
typography. Works with plain React props.

**Example:**

```tsx
<TextBase value="Hello, world!" variant="muted" size="sm" />
```

---

## Component Utilities

| Export | Kind | Description |
|---|---|---|
| `ComponentDataResult` | interface | Result returned by `useComponentData`. Provides the fetched data, loading/error states, and a refetch function. |
| `ComponentGroupBase` | function | Standalone ComponentGroup — a simple wrapper for pre-rendered group content. Works with plain React props. |
| `ComponentGroupBaseProps` | interface | Props accepted by the ComponentGroupBase standalone component. |
| `useComponentData` | function | Shared data-fetching hook for Snapshot UI components. Parses a data config string like `"GET /api/stats/revenue"` into method + endpoint, resolves any `FromRef` values in params via `useSubscribe`, and fetches data using the app-scope API client. When the API client is not available (e.g., in tests or before a provider supplies it), the hook returns a loading state without throwing. |

### Details

#### `ComponentGroupBase({ id, className, style, slots, children, }: ComponentGroupBaseProps) => Element`

Standalone ComponentGroup — a simple wrapper for pre-rendered group content.
Works with plain React props.

**Example:**

```tsx
<ComponentGroupBase id="my-group">
  <MyComponentA />
  <MyComponentB />
</ComponentGroupBase>
```

---

#### `useComponentData(dataConfig: string | FromRef | { resource: string; params?: Record<string, unknown> | undefined; }, params?: Record<string, unknown> | undefined, options?: ComponentDataOptions | undefined) => Compon...`

Shared data-fetching hook for Snapshot UI components.

Parses a data config string like `"GET /api/stats/revenue"` into method + endpoint,
resolves any `FromRef` values in params via `useSubscribe`, and fetches data
using the app-scope API client.

When the API client is not available (e.g., in tests or before a provider supplies it),
the hook returns a loading state without throwing.

**Parameters:**

| Name | Description |
|------|-------------|
| `dataConfig` | Endpoint string or FromRef. Example: `"GET /api/stats/revenue"` |
| `params` | Optional query parameters, may contain FromRef values |

**Returns:** Data, loading state, error, and refetch function

---

## Hooks & Utilities

| Export | Kind | Description |
|---|---|---|
| `Breakpoint` | typealias | All breakpoint names including `"default"` (below `sm`). |
| `getSortableStyle` | function | CSS transform helper for sortable items. Converts the dnd-kit transform into a CSS transform string. |
| `resolveResponsiveValue` | function | Resolve a responsive value for a given breakpoint. Cascades down: if the active breakpoint isn't defined, falls back to the next smaller breakpoint, then `default`. For flat (non-object) values, returns the value directly. |
| `UI_BREAKPOINTS` | variable | Breakpoint pixel thresholds (mobile-first, min-width). |
| `useBreakpoint` | function | Returns the currently active breakpoint based on window width. Uses `matchMedia` for efficient, event-driven updates (no resize polling). Returns `"default"` during SSR. |
| `useDndSensors` | function | Pre-configured sensor setup for pointer + keyboard DnD. Pointer requires 5px distance to activate (prevents click hijacking). Keyboard uses standard coordinates for arrow key navigation. |
| `useInfiniteScroll` | function | Observe a sentinel element and load the next page when it enters the viewport. |
| `UseInfiniteScrollOptions` | interface | Options for loading additional items when a sentinel approaches the viewport. |
| `usePoll` | function | Invoke a callback on an interval with optional document-visibility pausing. |
| `UsePollOptions` | interface | Options controlling interval-based polling from client components. |
| `useResponsiveValue` | function | Resolve a responsive value to the appropriate value for the current breakpoint. Accepts either a flat value (returned as-is) or a responsive map with breakpoint keys. Falls back to the next smaller defined breakpoint. |
| `useUrlSync` | function | Keep a slice of local state synchronized with URL query parameters. |

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

## Other

| Export | Kind | Description |
|---|---|---|
| `ActionConfig` | typealias | Configuration type for action config. |
| `ActionExecuteFn` | typealias | Type definition exported by the Snapshot UI runtime. |
| `AuditLogBase` | function | Standalone AuditLogBase — renders a filterable, paginated timeline of audit log entries with user avatars, relative timestamps, and expandable detail panels. Works with plain React props. |
| `AuditLogBaseProps` | interface | Props accepted by the AuditLogBase standalone component. |
| `AuditLogFilterEntry` | interface | Type definition exported by the Snapshot UI runtime. |
| `buildRequestUrl` | function | Function exported by the Snapshot UI runtime. |
| `CalendarBase` | function | Standalone CalendarBase — renders a month or week calendar grid with event pills, navigation controls, and optional week numbers. Works with plain React props. |
| `CalendarBaseProps` | interface | Props accepted by the CalendarBase standalone component. |
| `CalendarEventEntry` | interface | Type definition exported by the Snapshot UI runtime. |
| `collectDependentResources` | function | Function exported by the Snapshot UI runtime. |
| `ComponentTokens` | typealias | Type definition exported by the Snapshot UI runtime. |
| `dataSourceSchema` | variable | Zod schema for validating data source schema. |
| `DefaultErrorBase` | function | Standalone DefaultError — renders an error feedback card with optional retry button. Works with plain React props. |
| `DefaultErrorBaseProps` | interface | Props accepted by the DefaultErrorBase standalone component. |
| `DefaultLoadingBase` | function | Standalone DefaultLoading — renders a loading spinner with label. Works with plain React props. |
| `DefaultLoadingBaseProps` | interface | Props accepted by the DefaultLoadingBase standalone component. |
| `DefaultNotFoundBase` | function | Standalone DefaultNotFound — renders a 404 page with title and description. Works with plain React props. |
| `DefaultNotFoundBaseProps` | interface | Props accepted by the DefaultNotFoundBase standalone component. |
| `DefaultOfflineBase` | function | Standalone DefaultOffline — renders an offline status banner. Works with plain React props. |
| `DefaultOfflineBaseProps` | interface | Props accepted by the DefaultOfflineBase standalone component. |
| `EndpointTarget` | typealias | Type definition exported by the Snapshot UI runtime. |
| `endpointTargetSchema` | variable | Zod schema for validating endpoint target schema. |
| `ExprRef` | interface | Type definition exported by the Snapshot UI runtime. |
| `extractResourceRefs` | function | Function exported by the Snapshot UI runtime. |
| `Flavor` | interface | Type definition exported by the Snapshot UI runtime. |
| `FontConfig` | typealias | Configuration type for font config. |
| `FromRef` | interface | Type definition exported by the Snapshot UI runtime. |
| `getResourceInvalidationTargets` | function | Function exported by the Snapshot UI runtime. |
| `HttpMethod` | typealias | Type definition exported by the Snapshot UI runtime. |
| `httpMethodSchema` | variable | Zod schema for validating http method schema. |
| `isOptimisticResourceTarget` | function | Function exported by the Snapshot UI runtime. |
| `isQueryKeyInvalidationTarget` | function | Function exported by the Snapshot UI runtime. |
| `isResourceRef` | function | Function exported by the Snapshot UI runtime. |
| `KanbanBase` | function | Standalone KanbanBase — renders a multi-column board with cards, WIP limits, assignee avatars, priority indicators, and optional drag-and-drop reordering. Works with plain React props. |
| `KanbanBaseProps` | interface | Props accepted by the KanbanBase standalone component. |
| `KanbanColumnEntry` | interface | Type definition exported by the Snapshot UI runtime. |
| `NotificationFeedBase` | function | Standalone NotificationFeedBase — renders a scrollable notification list with type icons, unread indicators, relative timestamps, and a mark-all-read action. Works with plain React props. |
| `NotificationFeedBaseProps` | interface | Props accepted by the NotificationFeedBase standalone component. |
| `OptimisticConfig` | typealias | Configuration type for optimistic config. |
| `optimisticConfigSchema` | variable | Zod schema for validating optimistic config schema. |
| `OptimisticTarget` | typealias | Type definition exported by the Snapshot UI runtime. |
| `optimisticTargetSchema` | variable | Zod schema for validating optimistic target schema. |
| `PricingFeatureEntry` | interface | Type definition exported by the Snapshot UI runtime. |
| `PricingTableBase` | function | Standalone PricingTableBase — renders a responsive pricing comparison as either a card grid or a feature-comparison table with CTA buttons per tier. Works with plain React props. |
| `PricingTableBaseProps` | interface | Props accepted by the PricingTableBase standalone component. |
| `PricingTierEntry` | interface | Type definition exported by the Snapshot UI runtime. |
| `RadiusScale` | typealias | Type definition exported by the Snapshot UI runtime. |
| `ResolvedRequest` | interface | Type definition exported by the Snapshot UI runtime. |
| `resolveEndpointTarget` | function | Function exported by the Snapshot UI runtime. |
| `ResourceConfig` | typealias | Configuration type for resource config. |
| `resourceConfigSchema` | variable | Zod schema for validating resource config schema. |
| `ResourceInvalidationTarget` | typealias | Type definition exported by the Snapshot UI runtime. |
| `resourceInvalidationTargetSchema` | variable | Zod schema for validating resource invalidation target schema. |
| `ResourceMap` | typealias | Type definition exported by the Snapshot UI runtime. |
| `resourceParamSchema` | variable | Zod schema for validating resource param schema. |
| `ResourceRef` | typealias | Type definition exported by the Snapshot UI runtime. |
| `resourceRefSchema` | variable | Zod schema for validating resource ref schema. |
| `Responsive` | typealias | Type definition exported by the Snapshot UI runtime. |
| `SpacingScale` | typealias | Type definition exported by the Snapshot UI runtime. |
| `StateScope` | typealias | Type definition exported by the Snapshot UI runtime. |
| `ThemeColors` | typealias | Type definition exported by the Snapshot UI runtime. |
| `ThemeConfig` | typealias | Configuration type for theme config. |
| `TokenEditor` | interface | Type definition exported by the Snapshot UI runtime. |

### Details

#### `AuditLogBase({ id, items: allItems, loading, error, userField, actionField, timestampField, detailsField, filters, pagination, className, style, slots, }: AuditLogBaseProps) => Element`

Standalone AuditLogBase — renders a filterable, paginated timeline of audit log entries
with user avatars, relative timestamps, and expandable detail panels. Works with plain React props.

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

Function exported by the Snapshot UI runtime.

---

#### `CalendarBase({ id, view, events, initialDate, loading, error, todayLabel, showWeekNumbers, onDateClick, onEventClick, className, style, slots, }: CalendarBaseProps) => Element`

Standalone CalendarBase — renders a month or week calendar grid with event pills,
navigation controls, and optional week numbers. Works with plain React props.

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

#### `collectDependentResources(resourceName: string, resources?: ResourceMap | undefined, visited?: Set<string>) => string[]`

Function exported by the Snapshot UI runtime.

---

#### `DefaultErrorBase({ title, description, showRetry, retryLabel, onRetry, id, className, style, slots, }: DefaultErrorBaseProps) => Element`

Standalone DefaultError — renders an error feedback card with optional
retry button. Works with plain React props.

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
Works with plain React props.

**Example:**

```tsx
<DefaultLoadingBase label="Loading your data..." size="md" />
```

---

#### `DefaultNotFoundBase({ title, description, id, className, style, slots, }: DefaultNotFoundBaseProps) => Element`

Standalone DefaultNotFound — renders a 404 page with title and description.
Works with plain React props.

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
Works with plain React props.

**Example:**

```tsx
<DefaultOfflineBase
  title="You're offline"
  description="Reconnect to continue working."
/>
```

---

#### `extractResourceRefs(value: unknown, results?: { resource: string; params?: Record<string, unknown> | undefined; }[]) => { resource: string; params?: Record<string, unknown> | undefined; }[]`

Function exported by the Snapshot UI runtime.

---

#### `getResourceInvalidationTargets(resourceName: string, resources?: ResourceMap | undefined) => string[]`

Function exported by the Snapshot UI runtime.

---

#### `isOptimisticResourceTarget(value: string | { resource: string; params?: Record<string, unknown> | undefined; }) => value is { resource: string; params?: Record<string, unknown> | undefined; }`

Function exported by the Snapshot UI runtime.

---

#### `isQueryKeyInvalidationTarget(value: string | { key: string[]; }) => value is { key: string[]; }`

Function exported by the Snapshot UI runtime.

---

#### `isResourceRef(value: unknown) => value is { resource: string; params?: Record<string, unknown> | undefined; }`

Function exported by the Snapshot UI runtime.

---

#### `KanbanBase({ id, columns, items: rawItems, loading, error, columnField, titleField, descriptionField, assigneeField, priorityField, sortable, emptyMessage, onCardClick, onReorder, onDndChange, className, style,...`

Standalone KanbanBase — renders a multi-column board with cards, WIP limits,
assignee avatars, priority indicators, and optional drag-and-drop reordering. Works with plain React props.

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
unread indicators, relative timestamps, and a mark-all-read action. Works with plain React props.

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
a card grid or a feature-comparison table with CTA buttons per tier. Works with plain React props.

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

#### `resolveEndpointTarget(target: string | { resource: string; params?: Record<string, unknown> | undefined; }, resources?: ResourceMap | undefined, params?: Record<string, unknown> | undefined, fallbackMethod?: "GET" | ... 3...`

Function exported by the Snapshot UI runtime.

---
