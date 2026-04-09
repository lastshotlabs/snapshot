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
export { resolveTokens } from "./ui/tokens/resolve";
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
  confirmActionSchema,
  toastActionSchema,
  runWorkflowActionSchema,
} from "./ui/actions/index";
export type {
  ActionConfig,
  ActionExecuteFn,
  NavigateAction,
  ApiAction,
  OpenModalAction,
  CloseModalAction,
  RefreshAction,
  SetValueAction,
  DownloadAction,
  ConfirmAction,
  ToastAction,
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
  statCardConfigSchema,
  trendConfigSchema,
} from "./ui/components/data/stat-card/index";
export type {
  StatCardConfig,
  UseStatCardResult,
} from "./ui/components/data/stat-card/index";

// Shared component utilities
export { useComponentData } from "./ui/components/_base/use-component-data";
export type { ComponentDataResult } from "./ui/components/_base/use-component-data";

// Manifest & Rendering
export {
  ManifestApp,
  PageRenderer,
  ComponentRenderer,
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
  registerWorkflowAction,
  getRegisteredWorkflowAction,
  getRegisteredSchemaTypes,
  injectStyleSheet,
  ManifestRuntimeProvider,
  OverlayRuntimeProvider,
  RouteRuntimeProvider,
  useManifestRuntime,
  useManifestResourceCache,
  useOverlayRuntime,
  useRouteRuntime,
  manifestConfigSchema,
  appConfigSchema,
  pageConfigSchema,
  routeConfigSchema,
  overlayConfigSchema,
  componentConfigSchema,
  navItemSchema,
  navigationConfigSchema,
  authScreenConfigSchema,
  resourceConfigSchema,
  resourceRefSchema,
  stateValueConfigSchema,
  workflowConditionSchema,
  workflowDefinitionSchema,
  workflowNodeSchema,
  baseComponentConfigSchema,
  rowConfigSchema,
  headingConfigSchema,
  buttonConfigSchema,
  selectConfigSchema,
  customComponentConfigSchema,
  fromRefSchema,
} from "./ui/manifest/index";
export type {
  AppConfig,
  CompiledManifest,
  CompiledRoute,
  ManifestConfig,
  NavItem,
  NavigationConfig,
  AuthScreenConfig,
  PageConfig,
  RouteConfig,
  ResourceConfigMap,
  OverlayConfig,
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
  CustomComponentConfig,
  ComponentConfig,
  ManifestAppProps,
  ConfigDrivenComponent,
  ComponentRendererProps,
  PageRendererProps,
} from "./ui/manifest/index";

// Layout & Nav Components
export {
  Layout,
  layoutConfigSchema,
} from "./ui/components/layout/layout/index";
export type {
  LayoutConfig,
  LayoutProps,
  LayoutVariant,
} from "./ui/components/layout/layout/index";
export { Nav, navConfigSchema, useNav } from "./ui/components/layout/nav/index";
export type {
  NavConfig,
  NavItemConfig,
  ResolvedNavItem,
  UseNavResult,
} from "./ui/components/layout/nav/index";

// DataTable
export { DataTable } from "./ui/components/data/data-table/index";
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
export { DetailCard } from "./ui/components/data/detail-card/index";
export { detailCardConfigSchema } from "./ui/components/data/detail-card/schema";
export { useDetailCard } from "./ui/components/data/detail-card/hook";
export type {
  DetailCardConfig,
  UseDetailCardResult,
} from "./ui/components/data/detail-card/types";

// AutoForm
export { AutoForm } from "./ui/components/forms/auto-form/index";
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
  modalConfigSchema,
} from "./ui/components/overlay/modal";
export type { ModalConfig } from "./ui/components/overlay/modal";

// Components — Drawer
export {
  DrawerComponent,
  drawerConfigSchema,
} from "./ui/components/overlay/drawer";
export type { DrawerConfig } from "./ui/components/overlay/drawer";

// Components — Tabs
export {
  TabsComponent,
  tabsConfigSchema,
  tabConfigSchema,
} from "./ui/components/navigation/tabs";
export type { TabsConfig, TabConfig } from "./ui/components/navigation/tabs";

// Components — RichTextEditor
export {
  RichTextEditor,
  richTextEditorConfigSchema,
} from "./ui/components/content/rich-text-editor/index";
export type { RichTextEditorConfig } from "./ui/components/content/rich-text-editor/index";

// Components — RichInput (TipTap WYSIWYG)
export {
  RichInput,
  richInputConfigSchema,
} from "./ui/components/content/rich-input/index";
export type { RichInputConfig } from "./ui/components/content/rich-input/index";

// Components — EmojiPicker
export {
  EmojiPicker,
  emojiPickerConfigSchema,
} from "./ui/components/communication/emoji-picker/index";
export type { EmojiPickerConfig } from "./ui/components/communication/emoji-picker/index";

// Components — ReactionBar
export {
  ReactionBar,
  reactionBarConfigSchema,
} from "./ui/components/communication/reaction-bar/index";
export type { ReactionBarConfig } from "./ui/components/communication/reaction-bar/index";

// Components — PresenceIndicator
export {
  PresenceIndicator,
  presenceIndicatorConfigSchema,
} from "./ui/components/communication/presence-indicator/index";
export type { PresenceIndicatorConfig } from "./ui/components/communication/presence-indicator/index";

// Components — TypingIndicator
export {
  TypingIndicator,
  typingIndicatorConfigSchema,
} from "./ui/components/communication/typing-indicator/index";
export type { TypingIndicatorConfig } from "./ui/components/communication/typing-indicator/index";

// Components — MessageThread
export {
  MessageThread,
  messageThreadConfigSchema,
} from "./ui/components/communication/message-thread/index";
export type { MessageThreadConfig } from "./ui/components/communication/message-thread/index";

// Components — CommentSection
export {
  CommentSection,
  commentSectionConfigSchema,
} from "./ui/components/communication/comment-section/index";
export type { CommentSectionConfig } from "./ui/components/communication/comment-section/index";

// Components — ChatWindow
export {
  ChatWindow,
  chatWindowConfigSchema,
} from "./ui/components/communication/chat-window/index";
export type { ChatWindowConfig } from "./ui/components/communication/chat-window/index";

// Components — Popover
export {
  Popover,
  popoverConfigSchema,
} from "./ui/components/overlay/popover/index";
export type { PopoverConfig } from "./ui/components/overlay/popover/index";

// Components — Separator
export {
  Separator,
  separatorConfigSchema,
} from "./ui/components/data/separator/index";
export type { SeparatorConfig } from "./ui/components/data/separator/index";

// Components — Command Palette
export {
  CommandPalette,
  commandPaletteConfigSchema,
} from "./ui/components/overlay/command-palette/index";
export type { CommandPaletteConfig } from "./ui/components/overlay/command-palette/index";

// Components — Input
export { Input, inputConfigSchema } from "./ui/components/forms/input/index";
export type { InputConfig } from "./ui/components/forms/input/index";

// Components — Textarea
export {
  Textarea,
  textareaConfigSchema,
} from "./ui/components/forms/textarea/index";
export type { TextareaConfig } from "./ui/components/forms/textarea/index";

// Components — Toggle
export { Toggle, toggleConfigSchema } from "./ui/components/forms/toggle/index";
export type { ToggleConfig } from "./ui/components/forms/toggle/index";

// Components — MultiSelect
export {
  MultiSelect,
  multiSelectConfigSchema,
} from "./ui/components/forms/multi-select/index";
export type { MultiSelectConfig } from "./ui/components/forms/multi-select/index";

// Components — ContextMenu
export {
  ContextMenu,
  contextMenuConfigSchema,
} from "./ui/components/overlay/context-menu/index";
export type { ContextMenuConfig } from "./ui/components/overlay/context-menu/index";

// Components — ScrollArea
export {
  ScrollArea,
  scrollAreaConfigSchema,
} from "./ui/components/data/scroll-area/index";
export type { ScrollAreaConfig } from "./ui/components/data/scroll-area/index";

// Components — FilterBar
export {
  FilterBar,
  filterBarConfigSchema,
} from "./ui/components/data/filter-bar/index";
export type { FilterBarConfig } from "./ui/components/data/filter-bar/index";

// Components — InlineEdit
export {
  InlineEdit,
  inlineEditConfigSchema,
} from "./ui/components/forms/inline-edit/index";
export type { InlineEditConfig } from "./ui/components/forms/inline-edit/index";

// Components — Markdown
export {
  Markdown,
  markdownConfigSchema,
} from "./ui/components/content/markdown/index";
export type { MarkdownConfig } from "./ui/components/content/markdown/index";

// Components — TagSelector
export {
  TagSelector,
  tagSelectorConfigSchema,
} from "./ui/components/forms/tag-selector/index";
export type { TagSelectorConfig } from "./ui/components/forms/tag-selector/index";

// Components — EntityPicker
export {
  EntityPicker,
  entityPickerConfigSchema,
} from "./ui/components/data/entity-picker/index";
export type { EntityPickerConfig } from "./ui/components/data/entity-picker/index";

// Components — HighlightedText
export {
  HighlightedText,
  highlightedTextConfigSchema,
} from "./ui/components/data/highlighted-text/index";
export type { HighlightedTextConfig } from "./ui/components/data/highlighted-text/index";

// Components — FavoriteButton
export {
  FavoriteButton,
  favoriteButtonConfigSchema,
} from "./ui/components/data/favorite-button/index";
export type { FavoriteButtonConfig } from "./ui/components/data/favorite-button/index";

// Components — NotificationBell
export {
  NotificationBell,
  notificationBellConfigSchema,
} from "./ui/components/data/notification-bell/index";
export type { NotificationBellConfig } from "./ui/components/data/notification-bell/index";

// Components — SaveIndicator
export {
  SaveIndicator,
  saveIndicatorConfigSchema,
} from "./ui/components/data/save-indicator/index";
export type { SaveIndicatorConfig } from "./ui/components/data/save-indicator/index";

// Components — CompareView
export {
  CompareView,
  compareViewConfigSchema,
} from "./ui/components/content/compare-view/index";
export type { CompareViewConfig } from "./ui/components/content/compare-view/index";

// Components — QuickAdd
export {
  QuickAdd,
  quickAddConfigSchema,
} from "./ui/components/forms/quick-add/index";
export type { QuickAddConfig } from "./ui/components/forms/quick-add/index";

// Components — LocationInput
export {
  LocationInput,
  locationInputConfigSchema,
} from "./ui/components/forms/location-input/index";
export type { LocationInputConfig } from "./ui/components/forms/location-input/index";

// Components — AvatarGroup
export {
  AvatarGroup,
  avatarGroupConfigSchema,
} from "./ui/components/data/avatar-group/index";
export type { AvatarGroupConfig } from "./ui/components/data/avatar-group/index";

// Components — LinkEmbed
export {
  LinkEmbed,
  linkEmbedConfigSchema,
  detectPlatform,
  PLATFORM_COLORS,
  PLATFORM_NAMES,
} from "./ui/components/content/link-embed/index";
export type {
  LinkEmbedConfig,
  Platform,
  PlatformInfo,
} from "./ui/components/content/link-embed/index";

// Components — GifPicker
export {
  GifPicker,
  gifPickerConfigSchema,
} from "./ui/components/communication/gif-picker/index";
export type {
  GifPickerConfig,
  GifEntry,
} from "./ui/components/communication/gif-picker/index";

// Components — Feed
export { Feed, feedSchema } from "./ui/components/data/feed/index";
export type {
  FeedConfig,
  FeedItem,
  UseFeedResult,
} from "./ui/components/data/feed/types";

// Components — Chart
export {
  Chart,
  chartSchema,
  seriesConfigSchema,
} from "./ui/components/data/chart/index";
export type {
  ChartConfig,
  SeriesConfig,
} from "./ui/components/data/chart/types";

// Components — Wizard
export {
  Wizard,
  wizardSchema,
  wizardStepSchema,
  useWizard,
} from "./ui/components/forms/wizard/index";
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
export { crudPage, dashboardPage, settingsPage } from "./ui/presets/index";
export type {
  CrudPageOptions,
  DashboardPageOptions,
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

// Register all built-in components
import "./ui/components/register";

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

// Headless Hooks (Level 2/3)
// export { useDataTable } from './ui/hooks/use-data-table'
// export { useAutoForm } from './ui/hooks/use-auto-form'
// export { usePageContext } from './ui/hooks/use-page-context'
// export { useAppContext } from './ui/hooks/use-app-context'
