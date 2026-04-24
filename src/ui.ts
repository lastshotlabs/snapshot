/**
 * @lastshotlabs/snapshot/ui
 *
 * Config-driven UI entry point. Everything needed to build applications
 * from a JSON manifest — components, tokens, flavors, page rendering,
 * context system, actions, and headless hooks.
 *
 * SDK consumers who write their own React import from '@lastshotlabs/snapshot'.
 * Config-driven consumers import from '@lastshotlabs/snapshot/ui'.
 */

// Tokens & Flavors
export { resolveTokens, resolveFrameworkStyles } from "./ui/tokens/resolve";
export { validateContrast } from "./ui/tokens/contrast-checker";
export { useTokenEditor } from "./ui/tokens/editor";
export { defineFlavor, getFlavor, getAllFlavors } from "./ui/tokens/flavors";
export {
  themeColorsSchema,
  radiusSchema,
  spacingSchema,
  fontSchema,
  componentTokensSchema,
  themeConfigSchema,
} from "./ui/tokens/schema";
export {
  hexToOklch,
  hslToOklch,
  oklchToString,
  oklchToHex,
  deriveForeground,
  deriveDarkVariant,
  colorToOklch,
  parseOklchString,
  relativeLuminance,
  contrastRatio,
  meetsWcagAA,
} from "./ui/tokens/color";
export type {
  ThemeConfig,
  ThemeColors,
  Flavor,
  ComponentTokens,
  TokenEditor,
  RadiusScale,
  SpacingScale,
  FontConfig,
  Responsive,
} from "./ui/tokens/types";
export { registerAnalyticsProvider } from "./ui/analytics/registry";
export { registerClient, getRegisteredClient } from "./api/client";
export type {
  AnalyticsProvider,
  AnalyticsProviderFactory,
  AnalyticsProviderInitConfig,
} from "./ui/analytics/types";

// Context & Data Binding
export {
  PageContextProvider,
  AppContextProvider,
  usePublish,
  useSubscribe,
  useResolveFrom,
  isFromRef,
} from "./ui/context/index";
export type {
  ExprRef,
  FromRef,
  AtomRegistry,
  GlobalConfig,
  AppContextProviderProps,
  PageContextProviderProps,
  ResolvedConfig,
} from "./ui/context/types";

// State Runtime
export {
  useStateValue,
  useSetStateValue,
  useResetStateValue,
  useApiClient,
} from "./ui/state/index";
export type {
  StateScope,
  StateHookScope,
  StateConfig as RuntimeStateConfig,
  StateConfigMap,
  StateProviderProps,
} from "./ui/state/index";

// Actions
export {
  useActionExecutor,
  SnapshotApiContext,
  useModalManager,
  useToastManager,
  ToastContainer,
  useConfirmManager,
  ConfirmDialog,
  interpolate,
  actionSchema,
  navigateActionSchema,
  apiActionSchema,
  openModalActionSchema,
  closeModalActionSchema,
  refreshActionSchema,
  setValueActionSchema,
  downloadActionSchema,
  copyToClipboardActionSchema,
  confirmActionSchema,
  scrollToActionSchema,
  toastActionSchema,
  trackActionSchema,
  runWorkflowActionSchema,
  debounceAction,
  throttleAction,
} from "./ui/actions/index";
export type {
  ActionConfig,
  ActionExecuteFn,
  ActionBase,
  NavigateAction,
  ApiAction,
  OpenModalAction,
  CloseModalAction,
  RefreshAction,
  SetValueAction,
  DownloadAction,
  CopyAction,
  CopyToClipboardAction,
  ConfirmAction,
  ScrollToAction,
  ToastAction,
  LogAction,
  TrackAction,
  RunWorkflowAction,
  ModalManager,
  ToastItem,
  ShowToastOptions,
  ToastManager,
  ConfirmRequest,
  ConfirmOptions,
  ConfirmManager,
} from "./ui/actions/index";

// Components — StatCard
export {
  StatCard,
  StatCardBase,
  statCardConfigSchema,
  trendConfigSchema,
} from "./ui/components/data/stat-card/index";
export type {
  StatCardConfig,
  UseStatCardResult,
  StatCardBaseProps,
  StatCardTrend,
} from "./ui/components/data/stat-card/index";

// Shared component utilities
export { useComponentData } from "./ui/components/_base/use-component-data";
export type { ComponentDataResult } from "./ui/components/_base/use-component-data";
export {
  registerBuiltInComponents,
  resetBuiltInComponentRegistration,
} from "./ui/components/register";

// Manifest & Rendering
export {
  ManifestApp,
  PageRenderer,
  ComponentRenderer,
  bootBuiltins,
  resetBootBuiltins,
  TransitionWrapper,
  compileManifest,
  defineManifest,
  parseManifest,
  buildRequestUrl,
  dataSourceSchema,
  endpointTargetSchema,
  httpMethodSchema,
  isResourceRef,
  runWorkflow,
  registerComponent,
  registerComponentSchema,
  registerLayout,
  resolveLayout,
  getRegisteredLayouts,
  registerGuard,
  resolveGuard,
  getRegisteredGuards,
  registerWorkflowAction,
  getRegisteredWorkflowAction,
  getRegisteredSchemaTypes,
  injectStyleSheet,
  generateJsonSchema,
  ManifestRuntimeProvider,
  OverlayRuntimeProvider,
  RouteRuntimeProvider,
  useManifestResourceFocusRefetch,
  useManifestResourceMountRefetch,
  useManifestRuntime,
  useManifestResourceCache,
  useOverlayRuntime,
  useRouteRuntime,
  useRoutePrefetch,
  useVirtualList,
  manifestConfigSchema,
  appConfigSchema,
  toastConfigSchema,
  analyticsConfigSchema,
  analyticsProviderSchema,
  pushConfigSchema,
  pageConfigSchema,
  routeGuardConfigSchema,
  routeGuardSchema,
  routeTransitionSchema,
  routeConfigSchema,
  outletComponentSchema,
  overlayConfigSchema,
  componentConfigSchema,
  navItemSchema,
  navigationConfigSchema,
  authScreenConfigSchema,
  authProviderSchema,
  resourceConfigSchema,
  resourceRefSchema,
  stateValueConfigSchema,
  workflowConditionSchema,
  workflowDefinitionSchema,
  workflowNodeSchema,
  baseComponentConfigSchema,
  rowConfigSchema,
  headingConfigSchema,
  cardConfigSchema,
  componentsConfigSchema,
  customComponentDeclarationSchema,
  customComponentPropSchema,
  fromRefSchema,
} from "./ui/manifest/index";
export type {
  AppConfig,
  ToastConfig,
  AnalyticsConfig,
  PushConfig,
  CompiledManifest,
  CompiledRoute,
  RouteMatch,
  ManifestConfig,
  NavItem,
  NavigationConfig,
  AuthScreenConfig,
  AuthProviderConfig,
  PageConfig,
  RouteGuard,
  RouteGuardConfig,
  RouteConfig,
  ResourceConfigMap,
  ManifestRuntimeExtensions,
  ManifestResourceLoader,
  ManifestResourceLoaderContext,
  OverlayConfig,
  AssignWorkflowNode,
  CaptureWorkflowNode,
  ParallelWorkflowNode,
  RetryWorkflowNode,
  TryWorkflowNode,
  WaitWorkflowNode,
  WorkflowCondition,
  WorkflowConditionOperator,
  WorkflowDefinition,
  WorkflowMap,
  WorkflowNode,
  IfWorkflowNode,
  WorkflowActionHandler,
  StateConfig,
  StateValueConfig,
  BaseComponentConfig,
  RowConfig,
  HeadingConfig,
  ButtonConfig,
  SelectConfig,
  CardConfig,
  OutletConfig,
  ComponentConfig,
  ManifestAppProps,
  ConfigDrivenComponent,
  ComponentRendererProps,
  PageRendererProps,
} from "./ui/manifest/index";

// Layout & Nav Components
export {
  Layout,
  LayoutBase,
  layoutConfigSchema,
} from "./ui/components/layout/layout/index";
export type {
  LayoutConfig,
  LayoutProps,
  LayoutVariant,
  LayoutBaseProps,
  LayoutBaseSlots,
  LayoutBaseVariant,
} from "./ui/components/layout/layout/index";
export { Nav, NavBase, navConfigSchema, useNav } from "./ui/components/layout/nav/index";
export type {
  NavConfig,
  NavItemConfig,
  ResolvedNavItem,
  UseNavResult,
  NavBaseProps,
  NavBaseItem,
  NavBaseLogo,
  NavBaseUser,
} from "./ui/components/layout/nav/index";
export { Card, CardBase } from "./ui/components/layout/card/index";
export type { CardBaseProps } from "./ui/components/layout/card/index";
export {
  Column,
  ColumnBase,
  columnConfigSchema as layoutColumnConfigSchema,
} from "./ui/components/layout/column/index";
export type {
  ColumnConfig as LayoutColumnConfig,
  ColumnBaseProps,
} from "./ui/components/layout/column/index";
export { Outlet } from "./ui/components/layout/outlet/index";

// DataTable
export { DataTable, DataTableBase } from "./ui/components/data/data-table/index";
export type { DataTableBaseProps, DataTableBaseColumn } from "./ui/components/data/data-table/index";
export {
  dataTableConfigSchema,
  columnConfigSchema,
  rowActionSchema,
  bulkActionSchema,
} from "./ui/components/data/data-table/schema";
export { useDataTable } from "./ui/components/data/data-table/hook";
export type {
  DataTableConfig,
  ColumnConfig,
  RowAction,
  BulkAction,
  SortState,
  PaginationState,
  ResolvedColumn,
  UseDataTableResult,
} from "./ui/components/data/data-table/types";

// DetailCard
export { DetailCard, DetailCardBase } from "./ui/components/data/detail-card/index";
export type { DetailCardBaseProps, DetailCardBaseField, DetailCardBaseAction } from "./ui/components/data/detail-card/index";
export { detailCardConfigSchema } from "./ui/components/data/detail-card/schema";
export { useDetailCard } from "./ui/components/data/detail-card/hook";
export type {
  DetailCardConfig,
  UseDetailCardResult,
} from "./ui/components/data/detail-card/types";

// AutoForm
export { AutoForm, AutoFormBase } from "./ui/components/forms/auto-form/index";
export type { AutoFormBaseProps, AutoFormFieldConfig, AutoFormSectionConfig } from "./ui/components/forms/auto-form/index";
export {
  autoFormConfigSchema,
  fieldConfigSchema,
} from "./ui/components/forms/auto-form/schema";
export { useAutoForm } from "./ui/components/forms/auto-form/hook";
export type {
  AutoFormConfig,
  FieldConfig,
  FieldErrors,
  TouchedFields,
  UseAutoFormResult,
} from "./ui/components/forms/auto-form/types";

// Components — Modal
export {
  ModalComponent,
  ModalBase,
  modalConfigSchema,
} from "./ui/components/overlay/modal";
export type { ModalConfig, ModalBaseProps, ModalBaseFooterAction } from "./ui/components/overlay/modal";

// Components — Drawer
export {
  DrawerComponent,
  DrawerBase,
  drawerConfigSchema,
} from "./ui/components/overlay/drawer";
export type { DrawerConfig, DrawerBaseProps, DrawerBaseFooterAction } from "./ui/components/overlay/drawer";

// Components — Tabs
export {
  TabsComponent,
  TabsBase,
  tabsConfigSchema,
  tabConfigSchema,
} from "./ui/components/navigation/tabs";
export type { TabsConfig, TabConfig, TabsBaseProps, TabsBaseTab } from "./ui/components/navigation/tabs";

// Components — PrefetchLink
export {
  PrefetchLink,
  PrefetchLinkBase,
  prefetchLinkSchema,
} from "./ui/components/navigation/prefetch-link/index";
export type { PrefetchLinkConfig, PrefetchLinkBaseProps } from "./ui/components/navigation/prefetch-link/index";

// Components — RichTextEditor
export {
  RichTextEditor,
  RichTextEditorBase,
  richTextEditorConfigSchema,
} from "./ui/components/content/rich-text-editor/index";
export type { RichTextEditorConfig, RichTextEditorBaseProps } from "./ui/components/content/rich-text-editor/index";

// Components — Heading
export { Heading, HeadingBase } from "./ui/components/content/heading/index";
export type { HeadingBaseProps } from "./ui/components/content/heading/index";

// Components — Code
export { Code, CodeBase, codeConfigSchema } from "./ui/components/content/code/index";
export type { CodeConfig, CodeBaseProps } from "./ui/components/content/code/index";

// Components — RichInput (TipTap WYSIWYG)
export {
  RichInput,
  RichInputBase,
  richInputConfigSchema,
} from "./ui/components/content/rich-input/index";
export type { RichInputConfig, RichInputBaseProps } from "./ui/components/content/rich-input/index";

// Components — EmojiPicker
export {
  EmojiPicker,
  EmojiPickerBase,
  emojiPickerConfigSchema,
} from "./ui/components/communication/emoji-picker/index";
export type { EmojiPickerConfig, EmojiPickerBaseProps } from "./ui/components/communication/emoji-picker/index";

// Components — ReactionBar
export {
  ReactionBar,
  ReactionBarBase,
  reactionBarConfigSchema,
} from "./ui/components/communication/reaction-bar/index";
export type { ReactionBarConfig, ReactionBarBaseProps, ReactionEntry } from "./ui/components/communication/reaction-bar/index";

// Components — PresenceIndicator
export {
  PresenceIndicator,
  PresenceIndicatorBase,
  presenceIndicatorConfigSchema,
} from "./ui/components/communication/presence-indicator/index";
export type { PresenceIndicatorConfig, PresenceIndicatorBaseProps } from "./ui/components/communication/presence-indicator/index";

// Components — TypingIndicator
export {
  TypingIndicator,
  TypingIndicatorBase,
  typingIndicatorConfigSchema,
} from "./ui/components/communication/typing-indicator/index";
export type { TypingIndicatorConfig, TypingIndicatorBaseProps, TypingUser } from "./ui/components/communication/typing-indicator/index";

// Components — MessageThread
export {
  MessageThread,
  MessageThreadBase,
  messageThreadConfigSchema,
} from "./ui/components/communication/message-thread/index";
export type { MessageThreadConfig, MessageThreadBaseProps } from "./ui/components/communication/message-thread/index";

// Components — CommentSection
export {
  CommentSection,
  CommentSectionBase,
  commentSectionConfigSchema,
} from "./ui/components/communication/comment-section/index";
export type { CommentSectionConfig, CommentSectionBaseProps } from "./ui/components/communication/comment-section/index";

// Components — ChatWindow
export {
  ChatWindow,
  ChatWindowBase,
  chatWindowConfigSchema,
} from "./ui/components/communication/chat-window/index";
export type { ChatWindowConfig, ChatWindowBaseProps } from "./ui/components/communication/chat-window/index";

// Components — Popover
export {
  Popover,
  PopoverBase,
  popoverConfigSchema,
} from "./ui/components/overlay/popover/index";
export type { PopoverConfig, PopoverBaseProps } from "./ui/components/overlay/popover/index";

// Components — Separator
export {
  Separator,
  SeparatorBase,
  separatorConfigSchema,
} from "./ui/components/data/separator/index";
export type { SeparatorConfig, SeparatorBaseProps } from "./ui/components/data/separator/index";

// Components — Command Palette
export {
  CommandPalette,
  CommandPaletteBase,
  commandPaletteConfigSchema,
} from "./ui/components/overlay/command-palette/index";
export type { CommandPaletteConfig, CommandPaletteBaseProps, CommandPaletteBaseGroup, CommandPaletteBaseItem } from "./ui/components/overlay/command-palette/index";

// Components — Button
export { Button, ButtonBase, buttonConfigSchema } from "./ui/components/forms/button/index";
export type { ButtonBaseProps } from "./ui/components/forms/button/index";

// Components — Input
export { Input, InputField, inputConfigSchema } from "./ui/components/forms/input/index";
export type { InputConfig, InputFieldProps } from "./ui/components/forms/input/index";
export { Select, SelectField, selectConfigSchema } from "./ui/components/forms/select/index";
export type { SelectFieldProps } from "./ui/components/forms/select/index";
export {
  DatePicker,
  DatePickerField,
  datePickerConfigSchema,
} from "./ui/components/forms/date-picker";
export type { DatePickerConfig, DatePickerFieldProps } from "./ui/components/forms/date-picker";
export { Slider, SliderField, sliderConfigSchema } from "./ui/components/forms/slider";
export type { SliderConfig, SliderFieldProps } from "./ui/components/forms/slider";
export {
  ColorPicker,
  ColorPickerField,
  colorPickerConfigSchema,
} from "./ui/components/forms/color-picker";
export type { ColorPickerConfig, ColorPickerFieldProps } from "./ui/components/forms/color-picker";

// Components — Textarea
export {
  Textarea,
  TextareaField,
  textareaConfigSchema,
} from "./ui/components/forms/textarea/index";
export type { TextareaConfig, TextareaFieldProps } from "./ui/components/forms/textarea/index";

// Components — Toggle
export { Toggle, ToggleField, toggleConfigSchema } from "./ui/components/forms/toggle/index";
export type { ToggleConfig, ToggleFieldProps } from "./ui/components/forms/toggle/index";

// Components — MultiSelect
export {
  MultiSelect,
  MultiSelectField,
  multiSelectConfigSchema,
} from "./ui/components/forms/multi-select/index";
export type { MultiSelectConfig, MultiSelectFieldProps, MultiSelectFieldOption } from "./ui/components/forms/multi-select/index";

// Components — ContextMenu
export {
  ContextMenu,
  ContextMenuBase,
  contextMenuConfigSchema,
} from "./ui/components/overlay/context-menu/index";
export type { ContextMenuConfig, ContextMenuBaseProps, ContextMenuBaseItem, ContextMenuBaseEntry } from "./ui/components/overlay/context-menu/index";

// Components — ConfirmDialog
export {
  ConfirmDialogComponent,
  ConfirmDialogBase,
  confirmDialogConfigSchema,
} from "./ui/components/overlay/confirm-dialog/index";
export type { ConfirmDialogConfig, ConfirmDialogBaseProps } from "./ui/components/overlay/confirm-dialog/index";

// Components — ScrollArea
export {
  ScrollArea,
  ScrollAreaBase,
  scrollAreaConfigSchema,
} from "./ui/components/data/scroll-area/index";
export type { ScrollAreaConfig, ScrollAreaBaseProps } from "./ui/components/data/scroll-area/index";

// Components — FilterBar
export {
  FilterBar,
  FilterBarBase,
  filterBarConfigSchema,
} from "./ui/components/data/filter-bar/index";
export type { FilterBarConfig, FilterBarBaseProps, FilterBarFilter } from "./ui/components/data/filter-bar/index";

// Components — InlineEdit
export {
  InlineEdit,
  InlineEditField,
  inlineEditConfigSchema,
} from "./ui/components/forms/inline-edit/index";
export type { InlineEditConfig, InlineEditFieldProps } from "./ui/components/forms/inline-edit/index";

// Components — Markdown
export {
  Markdown,
  MarkdownBase,
  markdownConfigSchema,
} from "./ui/components/content/markdown/index";
export type { MarkdownConfig, MarkdownBaseProps } from "./ui/components/content/markdown/index";

// Components — TagSelector
export {
  TagSelector,
  TagSelectorField,
  tagSelectorConfigSchema,
} from "./ui/components/forms/tag-selector/index";
export type { TagSelectorConfig, TagSelectorFieldProps, TagSelectorTag } from "./ui/components/forms/tag-selector/index";

// Components — EntityPicker
export {
  EntityPicker,
  EntityPickerBase,
  entityPickerConfigSchema,
} from "./ui/components/data/entity-picker/index";
export type { EntityPickerConfig, EntityPickerBaseProps, EntityPickerEntity } from "./ui/components/data/entity-picker/index";

// Components — HighlightedText
export {
  HighlightedText,
  HighlightedTextBase,
  highlightedTextConfigSchema,
} from "./ui/components/data/highlighted-text/index";
export type { HighlightedTextConfig, HighlightedTextBaseProps } from "./ui/components/data/highlighted-text/index";

// Components — FavoriteButton
export {
  FavoriteButton,
  FavoriteButtonBase,
  favoriteButtonConfigSchema,
} from "./ui/components/data/favorite-button/index";
export type { FavoriteButtonConfig, FavoriteButtonBaseProps } from "./ui/components/data/favorite-button/index";

// Components — NotificationBell
export {
  NotificationBell,
  NotificationBellBase,
  notificationBellConfigSchema,
} from "./ui/components/data/notification-bell/index";
export type { NotificationBellConfig, NotificationBellBaseProps } from "./ui/components/data/notification-bell/index";

// Components — SaveIndicator
export {
  SaveIndicator,
  SaveIndicatorBase,
  saveIndicatorConfigSchema,
} from "./ui/components/data/save-indicator/index";
export type { SaveIndicatorConfig, SaveIndicatorBaseProps } from "./ui/components/data/save-indicator/index";

// Components — CompareView
export {
  CompareView,
  CompareViewBase,
  compareViewConfigSchema,
} from "./ui/components/content/compare-view/index";
export type { CompareViewConfig, CompareViewBaseProps } from "./ui/components/content/compare-view/index";

// Components — QuickAdd
export {
  QuickAdd,
  QuickAddField,
  quickAddConfigSchema,
} from "./ui/components/forms/quick-add/index";
export type { QuickAddConfig, QuickAddFieldProps } from "./ui/components/forms/quick-add/index";

// Components — LocationInput
export {
  LocationInput,
  LocationInputField,
  locationInputConfigSchema,
} from "./ui/components/forms/location-input/index";
export type { LocationInputConfig, LocationInputFieldProps, LocationResult } from "./ui/components/forms/location-input/index";

// Components — AvatarGroup
export {
  AvatarGroup,
  AvatarGroupBase,
  avatarGroupConfigSchema,
} from "./ui/components/data/avatar-group/index";
export type { AvatarGroupConfig, AvatarGroupBaseProps } from "./ui/components/data/avatar-group/index";

// Components — LinkEmbed
export {
  LinkEmbed,
  LinkEmbedBase,
  linkEmbedConfigSchema,
  detectPlatform,
  PLATFORM_COLORS,
  PLATFORM_NAMES,
} from "./ui/components/content/link-embed/index";
export type {
  LinkEmbedConfig,
  Platform,
  PlatformInfo,
  LinkEmbedBaseProps,
  LinkEmbedMeta,
} from "./ui/components/content/link-embed/index";

// Components — GifPicker
export {
  GifPicker,
  GifPickerBase,
  gifPickerConfigSchema,
} from "./ui/components/communication/gif-picker/index";
export type {
  GifPickerConfig,
  GifEntry,
  GifPickerBaseProps,
} from "./ui/components/communication/gif-picker/index";

// Components — Feed
export { Feed, FeedBase, feedSchema } from "./ui/components/data/feed/index";
export type { FeedBaseProps, FeedBaseItem, FeedBaseItemAction } from "./ui/components/data/feed/index";
export type {
  FeedConfig,
  FeedItem,
  UseFeedResult,
} from "./ui/components/data/feed/types";

// Components — Chart
export {
  Chart,
  ChartBase,
  chartSchema,
  seriesConfigSchema,
} from "./ui/components/data/chart/index";
export type { ChartBaseProps, ChartBaseSeries } from "./ui/components/data/chart/index";
export type {
  ChartConfig,
  SeriesConfig,
} from "./ui/components/data/chart/types";

// Components — Wizard
export {
  Wizard,
  WizardBase,
  wizardSchema,
  wizardStepSchema,
  useWizard,
} from "./ui/components/forms/wizard/index";
export type { WizardBaseProps, WizardState, WizardStepDef, WizardFieldConfig } from "./ui/components/forms/wizard/index";
export type {
  WizardConfig,
  WizardStepConfig,
  UseWizardResult,
} from "./ui/components/forms/wizard/types";

// Custom Emoji Utilities
export {
  parseShortcodes,
  buildEmojiMap,
  resolveEmojiRecords,
  CUSTOM_EMOJI_CSS,
} from "./ui/components/communication/emoji-picker/index";
export type { CustomEmoji } from "./ui/components/communication/emoji-picker/index";

// Icons
export { Icon, ICON_PATHS } from "./ui/icons/index";
export type { IconProps } from "./ui/icons/index";

// Page Presets
export {
  authPage,
  crudPage,
  dashboardPage,
  expandPreset,
  settingsPage,
  authPresetConfigSchema,
  crudPresetConfigSchema,
  dashboardPresetConfigSchema,
  settingsPresetConfigSchema,
} from "./ui/presets/index";
export type {
  ActivityFeedDef,
  AuthBrandingDef,
  AuthPageOptions,
  ChartDef,
  CrudPageOptions,
  DashboardPageOptions,
  EmptyStateDef,
  PaginationDef,
  SettingsPageOptions,
  ColumnDef,
  FormDef,
  FormFieldDef,
  FormFieldOption,
  FilterDef,
  FilterOption,
  StatDef,
  SettingsSectionDef,
} from "./ui/presets/types";
export { useUrlSync } from "./ui/hooks/use-url-sync";
export {
  clearPersistedState,
  readPersistedState,
  toPersistedStateKey,
  writePersistedState,
} from "./ui/state/persist";
export { usePersistedAtom } from "./ui/state/use-persisted-atom";

// Components — SnapshotImage
export {
  SnapshotImage,
  SnapshotImageBase,
  snapshotImageSchema,
} from "./ui/components/media/image/index";
export type { SnapshotImageConfig, SnapshotImageBaseProps } from "./ui/components/media/image/index";

// Drag and Drop
export {
  DndContext,
  SortableContext,
  DragOverlay,
  closestCenter,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
  useDndSensors,
  getSortableStyle,
  PointerSensor,
  KeyboardSensor,
  CSS as DndCSS,
} from "./ui/hooks/use-drag-drop";
export type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "./ui/hooks/use-drag-drop";

// Breakpoint & Responsive
export {
  useBreakpoint,
  useResponsiveValue,
  resolveResponsiveValue,
  BREAKPOINTS as UI_BREAKPOINTS,
} from "./ui/hooks/use-breakpoint";
export type { Breakpoint } from "./ui/hooks/use-breakpoint";
export { usePoll } from "./ui/hooks/use-poll";
export type { UsePollOptions } from "./ui/hooks/use-poll";
export { useInfiniteScroll } from "./ui/hooks/use-infinite-scroll";
export type { UseInfiniteScrollOptions } from "./ui/hooks/use-infinite-scroll";
export { useAutoBreadcrumbs } from "./ui/hooks/use-auto-breadcrumbs";
export {
  generateBreadcrumbs,
  type BreadcrumbAutoConfig,
  type BreadcrumbItem,
} from "./ui/manifest/breadcrumbs";

// ── Standalone Component Library ──────────────────────────────────────────────
// Pure React components with plain props — no manifest context required.

// Layout — Box
export { BoxBase } from "./ui/components/layout/box/index";
export type { BoxBaseProps } from "./ui/components/layout/box/index";

// Layout — Container
export { ContainerBase } from "./ui/components/layout/container/index";
export type { ContainerBaseProps } from "./ui/components/layout/container/index";

// Layout — Row
export { RowBase } from "./ui/components/layout/row/index";
export type { RowBaseProps } from "./ui/components/layout/row/index";

// Layout — Grid
export { GridBase } from "./ui/components/layout/grid/index";
export type { GridBaseProps } from "./ui/components/layout/grid/index";

// Layout — Section
export { SectionBase } from "./ui/components/layout/section/index";
export type { SectionBaseProps } from "./ui/components/layout/section/index";

// Layout — Spacer
export { SpacerBase } from "./ui/components/layout/spacer/index";
export type { SpacerBaseProps } from "./ui/components/layout/spacer/index";

// Layout — SplitPane
export { SplitPaneBase } from "./ui/components/layout/split-pane/index";
export type { SplitPaneBaseProps } from "./ui/components/layout/split-pane/index";

// Layout — Collapsible
export { CollapsibleBase } from "./ui/components/layout/collapsible/index";
export type { CollapsibleBaseProps } from "./ui/components/layout/collapsible/index";

// Data — Avatar
export { AvatarBase } from "./ui/components/data/avatar/index";
export type { AvatarBaseProps } from "./ui/components/data/avatar/index";

// Data — Badge
export { BadgeBase } from "./ui/components/data/badge/index";
export type { BadgeBaseProps } from "./ui/components/data/badge/index";

// Data — Alert
export { AlertBase } from "./ui/components/data/alert/index";
export type { AlertBaseProps } from "./ui/components/data/alert/index";

// Data — Progress
export { ProgressBase } from "./ui/components/data/progress/index";
export type { ProgressBaseProps } from "./ui/components/data/progress/index";

// Data — Tooltip
export { TooltipBase } from "./ui/components/data/tooltip/index";
export type { TooltipBaseProps } from "./ui/components/data/tooltip/index";

// Data — Skeleton
export { SkeletonBase } from "./ui/components/data/skeleton/index";
export type { SkeletonBaseProps } from "./ui/components/data/skeleton/index";

// Data — EmptyState
export { EmptyStateBase } from "./ui/components/data/empty-state/index";
export type { EmptyStateBaseProps } from "./ui/components/data/empty-state/index";

// Data — List
export { ListBase } from "./ui/components/data/list/index";
export type { ListBaseProps, ListBaseItem } from "./ui/components/data/list/index";

// Data — Vote
export { VoteBase } from "./ui/components/data/vote/index";
export type { VoteBaseProps } from "./ui/components/data/vote/index";

// Content — Banner
export { BannerBase } from "./ui/components/content/banner/index";
export type { BannerBaseProps } from "./ui/components/content/banner/index";

// Content — CodeBlock
export { CodeBlockBase } from "./ui/components/content/code-block/index";
export type { CodeBlockBaseProps } from "./ui/components/content/code-block/index";

// Content — Timeline
export { TimelineBase } from "./ui/components/content/timeline/index";
export type { TimelineBaseProps, TimelineItemEntry } from "./ui/components/content/timeline/index";

// Navigation — Accordion
export { AccordionBase } from "./ui/components/navigation/accordion/index";
export type { AccordionBaseProps, AccordionBaseItem } from "./ui/components/navigation/accordion/index";

// Navigation — Breadcrumb
export { BreadcrumbBase } from "./ui/components/navigation/breadcrumb/index";
export type { BreadcrumbBaseProps, BreadcrumbBaseItem } from "./ui/components/navigation/breadcrumb/index";

// Navigation — Stepper
export { StepperBase } from "./ui/components/navigation/stepper/index";
export type { StepperBaseProps, StepperBaseStep } from "./ui/components/navigation/stepper/index";

// Navigation — TreeView
export { TreeViewBase } from "./ui/components/navigation/tree-view/index";
export type { TreeViewBaseProps, TreeViewBaseItem } from "./ui/components/navigation/tree-view/index";

// Overlay — DropdownMenu
export { DropdownMenuBase } from "./ui/components/overlay/dropdown-menu/index";
export type { DropdownMenuBaseProps, DropdownMenuBaseTrigger, DropdownMenuBaseEntry, DropdownMenuBaseItem } from "./ui/components/overlay/dropdown-menu/index";

// Overlay — HoverCard
export { HoverCardBase } from "./ui/components/overlay/hover-card/index";
export type { HoverCardBaseProps } from "./ui/components/overlay/hover-card/index";

// Media — Video
export { VideoBase } from "./ui/components/media/video/index";
export type { VideoBaseProps } from "./ui/components/media/video/index";

// Media — Carousel
export { CarouselBase } from "./ui/components/media/carousel/index";
export type { CarouselBaseProps } from "./ui/components/media/carousel/index";

// Media — Embed
export { EmbedBase } from "./ui/components/media/embed/index";
export type { EmbedBaseProps } from "./ui/components/media/embed/index";

// Workflow — Calendar
export { CalendarBase } from "./ui/components/workflow/calendar/index";
export type { CalendarBaseProps, CalendarEventEntry } from "./ui/components/workflow/calendar/index";

// Workflow — Kanban
export { KanbanBase } from "./ui/components/workflow/kanban/index";
export type { KanbanBaseProps, KanbanColumnEntry } from "./ui/components/workflow/kanban/index";

// Workflow — AuditLog
export { AuditLogBase } from "./ui/components/workflow/audit-log/index";
export type { AuditLogBaseProps, AuditLogFilterEntry } from "./ui/components/workflow/audit-log/index";

// Workflow — NotificationFeed
export { NotificationFeedBase } from "./ui/components/workflow/notification-feed/index";
export type { NotificationFeedBaseProps } from "./ui/components/workflow/notification-feed/index";

// Commerce — PricingTable
export { PricingTableBase } from "./ui/components/commerce/pricing-table/index";
export type { PricingTableBaseProps, PricingTierEntry, PricingFeatureEntry } from "./ui/components/commerce/pricing-table/index";

// Primitives — Text
export { TextBase } from "./ui/components/primitives/text/index";
export type { TextBaseProps } from "./ui/components/primitives/text/index";

// Primitives — Link
export { LinkBase } from "./ui/components/primitives/link/index";
export type { LinkBaseProps } from "./ui/components/primitives/link/index";

// Primitives — Divider
export { DividerBase } from "./ui/components/primitives/divider/index";
export type { DividerBaseProps } from "./ui/components/primitives/divider/index";

// Primitives — Stack
export { StackBase } from "./ui/components/primitives/stack/index";
export type { StackBaseProps } from "./ui/components/primitives/stack/index";

// Primitives — OAuthButtons
export { OAuthButtonsBase } from "./ui/components/primitives/oauth-buttons/index";
export type { OAuthButtonsBaseProps, OAuthProvider } from "./ui/components/primitives/oauth-buttons/index";

// Primitives — PasskeyButton
export { PasskeyButtonBase } from "./ui/components/primitives/passkey-button/index";
export type { PasskeyButtonBaseProps } from "./ui/components/primitives/passkey-button/index";

// Primitives — FloatingMenu
export { FloatingMenuBase } from "./ui/components/primitives/floating-menu/index";
export type { FloatingMenuBaseProps, FloatingMenuBaseItem, FloatingMenuBaseSeparator, FloatingMenuBaseLabel } from "./ui/components/primitives/floating-menu/index";

// Forms — IconButton
export { IconButtonBase } from "./ui/components/forms/icon-button/index";
export type { IconButtonBaseProps } from "./ui/components/forms/icon-button/index";

// Feedback — DefaultError
export { DefaultErrorBase } from "./ui/components/feedback/default-error/index";
export type { DefaultErrorBaseProps } from "./ui/components/feedback/default-error/index";

// Feedback — DefaultLoading
export { DefaultLoadingBase } from "./ui/components/feedback/default-loading/index";
export type { DefaultLoadingBaseProps } from "./ui/components/feedback/default-loading/index";

// Feedback — DefaultNotFound
export { DefaultNotFoundBase } from "./ui/components/feedback/default-not-found/index";
export type { DefaultNotFoundBaseProps } from "./ui/components/feedback/default-not-found/index";

// Feedback — DefaultOffline
export { DefaultOfflineBase } from "./ui/components/feedback/default-offline/index";
export type { DefaultOfflineBaseProps } from "./ui/components/feedback/default-offline/index";

// Content — FileUploader
export { FileUploaderBase } from "./ui/components/content/file-uploader/index";
export type { FileUploaderBaseProps } from "./ui/components/content/file-uploader/index";

// Forms — Switch
export { SwitchField } from "./ui/components/forms/switch/index";
export type { SwitchFieldProps } from "./ui/components/forms/switch/index";

// Forms — ToggleGroup
export { ToggleGroupBase } from "./ui/components/forms/toggle-group/index";
export type { ToggleGroupBaseProps, ToggleGroupItem } from "./ui/components/forms/toggle-group/index";

// Layout — NavDropdown
export { NavDropdownBase } from "./ui/components/layout/nav-dropdown/index";
export type { NavDropdownBaseProps } from "./ui/components/layout/nav-dropdown/index";

// Layout — NavLink
export { NavLinkBase } from "./ui/components/layout/nav-link/index";
export type { NavLinkBaseProps } from "./ui/components/layout/nav-link/index";

// Layout — NavLogo
export { NavLogoBase } from "./ui/components/layout/nav-logo/index";
export type { NavLogoBaseProps } from "./ui/components/layout/nav-logo/index";

// Layout — NavSearch
export { NavSearchBase } from "./ui/components/layout/nav-search/index";
export type { NavSearchBaseProps } from "./ui/components/layout/nav-search/index";

// Layout — NavSection
export { NavSectionBase } from "./ui/components/layout/nav-section/index";
export type { NavSectionBaseProps } from "./ui/components/layout/nav-section/index";

// Layout — NavUserMenu
export { NavUserMenuBase } from "./ui/components/layout/nav-user-menu/index";
export type { NavUserMenuBaseProps, NavUserMenuBaseItem } from "./ui/components/layout/nav-user-menu/index";

// Base — ComponentGroup
export { ComponentGroupBase } from "./ui/components/_base/component-group/index";
export type { ComponentGroupBaseProps } from "./ui/components/_base/component-group/index";

