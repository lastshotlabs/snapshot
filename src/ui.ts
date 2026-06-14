/**
 * @lastshotlabs/snapshot/ui
 *
 * Code-first UI entry point. Exports standalone React components, tokens,
 * context/state helpers, actions, icons, and hooks.
 */

// Tokens
export { resolveTokens, resolveFrameworkStyles } from "./ui/tokens/resolve";
export { validateContrast } from "./ui/tokens/contrast-checker";
export { useTokenEditor } from "./ui/tokens/editor";
export { defineFlavor, getFlavor, getAllFlavors } from "./ui/tokens/flavors";
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

// Context, state, and resources
export {
  PageContextProvider,
  AppContextProvider,
  usePublish,
  useSubscribe,
  useResolveFrom,
  useResolveFromMany,
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
export {
  useStateValue,
  useSetStateValue,
  useResetStateValue,
  useApiClient,
  SnapshotApiProvider,
  clearPersistedState,
  readPersistedState,
  toPersistedStateKey,
  writePersistedState,
  usePersistedAtom,
} from "./ui/state/index";
export type {
  StateScope,
  StateHookScope,
  StateConfig as RuntimeStateConfig,
  StateConfigMap,
  StateProviderProps,
} from "./ui/state/index";
export * from "./ui/resources";

// Actions
export {
  useModalManager,
  useToastManager,
  ToastContainer,
  useConfirmManager,
  ConfirmDialog,
  interpolate,
  debounceAction,
  throttleAction,
} from "./ui/actions/index";
export type {
  ActionConfig,
  ActionExecuteFn,
  ModalManager,
  ToastItem,
  ShowToastOptions,
  ToastManager,
  ConfirmRequest,
  ConfirmOptions,
  ConfirmManager,
} from "./ui/actions/index";

// Icons
export { Icon, ICON_PATHS } from "./ui/icons/index";
export type { IconProps } from "./ui/icons/index";

// Hooks
export { useUrlSync } from "./ui/hooks/use-url-sync";
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

// Component helpers
export { useComponentData } from "./ui/components/_base/use-component-data";
export type { ComponentDataResult } from "./ui/components/_base/use-component-data";
export { ButtonControl } from "./ui/components/forms/button/control";
export type { ButtonControlProps } from "./ui/components/forms/button/types";
export { InputControl } from "./ui/components/forms/input/control";
export type { InputControlProps } from "./ui/components/forms/input/types";
export { SelectControl } from "./ui/components/forms/select/control";
export type { SelectControlProps } from "./ui/components/forms/select/types";
export { TextareaControl } from "./ui/components/forms/textarea/control";
export type { TextareaControlProps } from "./ui/components/forms/textarea/types";
export {
  parseShortcodes,
  buildEmojiMap,
  resolveEmojiRecords,
  CUSTOM_EMOJI_CSS,
} from "./ui/components/communication/emoji-picker/custom-emoji";
export type { CustomEmoji } from "./ui/components/communication/emoji-picker/custom-emoji";
export { detectPlatform, PLATFORM_COLORS, PLATFORM_NAMES } from "./ui/components/content/link-embed/platform";
export type { Platform, PlatformInfo } from "./ui/components/content/link-embed/platform";

// Standalone components
export * from "./ui/components/_base/component-group/standalone";
export * from "./ui/components/commerce/pricing-table/standalone";
export * from "./ui/components/communication/chat-window/standalone";
export * from "./ui/components/communication/comment-section/standalone";
export * from "./ui/components/communication/emoji-picker/standalone";
export * from "./ui/components/communication/gif-picker/standalone";
export * from "./ui/components/communication/message-thread/standalone";
export * from "./ui/components/communication/presence-indicator/standalone";
export * from "./ui/components/communication/reaction-bar/standalone";
export * from "./ui/components/communication/typing-indicator/standalone";
export * from "./ui/components/content/banner/standalone";
export * from "./ui/components/content/code-block/standalone";
export * from "./ui/components/content/code/standalone";
export * from "./ui/components/content/compare-view/standalone";
export * from "./ui/components/content/file-uploader/standalone";
export * from "./ui/components/content/heading/standalone";
export * from "./ui/components/content/link-embed/standalone";
export * from "./ui/components/content/markdown/standalone";
export * from "./ui/components/content/rich-input/standalone";
export * from "./ui/components/content/rich-text-editor/standalone";
export * from "./ui/components/content/timeline/standalone";
export * from "./ui/components/data/alert/standalone";
export * from "./ui/components/data/avatar-group/standalone";
export * from "./ui/components/data/avatar/standalone";
export * from "./ui/components/data/badge/standalone";
export * from "./ui/components/data/chart/standalone";
export * from "./ui/components/data/data-table/standalone";
export * from "./ui/components/data/detail-card/standalone";
export * from "./ui/components/data/empty-state/standalone";
export * from "./ui/components/data/entity-picker/standalone";
export * from "./ui/components/data/favorite-button/standalone";
export * from "./ui/components/data/feed/standalone";
export * from "./ui/components/data/filter-bar/standalone";
export * from "./ui/components/data/highlighted-text/standalone";
export * from "./ui/components/data/list/standalone";
export * from "./ui/components/data/notification-bell/standalone";
export * from "./ui/components/data/progress/standalone";
export * from "./ui/components/data/save-indicator/standalone";
export * from "./ui/components/data/scroll-area/standalone";
export * from "./ui/components/data/separator/standalone";
export * from "./ui/components/data/skeleton/standalone";
export * from "./ui/components/data/stat-card/standalone";
export * from "./ui/components/data/tooltip/standalone";
export * from "./ui/components/data/vote/standalone";
export * from "./ui/components/feedback/default-error/standalone";
export * from "./ui/components/feedback/default-loading/standalone";
export * from "./ui/components/feedback/default-not-found/standalone";
export * from "./ui/components/feedback/default-offline/standalone";
export * from "./ui/components/forms/auto-form/standalone";
export * from "./ui/components/forms/button/standalone";
export * from "./ui/components/forms/color-picker/standalone";
export * from "./ui/components/forms/date-picker/standalone";
export * from "./ui/components/forms/icon-button/standalone";
export * from "./ui/components/forms/inline-edit/standalone";
export * from "./ui/components/forms/input/standalone";
export * from "./ui/components/forms/location-input/standalone";
export * from "./ui/components/forms/multi-select/standalone";
export * from "./ui/components/forms/quick-add/standalone";
export * from "./ui/components/forms/select/standalone";
export * from "./ui/components/forms/slider/standalone";
export * from "./ui/components/forms/switch/standalone";
export * from "./ui/components/forms/tag-selector/standalone";
export * from "./ui/components/forms/textarea/standalone";
export * from "./ui/components/forms/toggle-group/standalone";
export * from "./ui/components/forms/toggle/standalone";
export * from "./ui/components/forms/wizard/standalone";
export * from "./ui/components/layout/box/standalone";
export * from "./ui/components/layout/card/standalone";
export * from "./ui/components/layout/collapsible/standalone";
export * from "./ui/components/layout/column/standalone";
export * from "./ui/components/layout/container/standalone";
export * from "./ui/components/layout/grid/standalone";
export * from "./ui/components/layout/layout/standalone";
export * from "./ui/components/layout/nav-dropdown/standalone";
export * from "./ui/components/layout/nav-link/standalone";
export * from "./ui/components/layout/nav-logo/standalone";
export * from "./ui/components/layout/nav-search/standalone";
export * from "./ui/components/layout/nav-section/standalone";
export * from "./ui/components/layout/nav-user-menu/standalone";
export * from "./ui/components/layout/nav/standalone";
export * from "./ui/components/layout/outlet/standalone";
export * from "./ui/components/layout/row/standalone";
export * from "./ui/components/layout/section/standalone";
export * from "./ui/components/layout/spacer/standalone";
export * from "./ui/components/layout/split-pane/standalone";
export * from "./ui/components/media/carousel/standalone";
export * from "./ui/components/media/embed/standalone";
export * from "./ui/components/media/image/standalone";
export * from "./ui/components/media/video/standalone";
export * from "./ui/components/navigation/accordion/standalone";
export * from "./ui/components/navigation/breadcrumb/standalone";
export * from "./ui/components/navigation/prefetch-link/standalone";
export * from "./ui/components/navigation/stepper/standalone";
export * from "./ui/components/navigation/tabs/standalone";
export * from "./ui/components/navigation/tree-view/standalone";
export * from "./ui/components/overlay/command-palette/standalone";
export * from "./ui/components/overlay/confirm-dialog/standalone";
export * from "./ui/components/overlay/context-menu/standalone";
export * from "./ui/components/overlay/drawer/standalone";
export * from "./ui/components/overlay/dropdown-menu/standalone";
export * from "./ui/components/overlay/hover-card/standalone";
export * from "./ui/components/overlay/modal/standalone";
export * from "./ui/components/overlay/popover/standalone";
export * from "./ui/components/primitives/divider/standalone";
export * from "./ui/components/primitives/floating-menu/standalone";
export * from "./ui/components/primitives/link/standalone";
export * from "./ui/components/primitives/oauth-buttons/standalone";
export * from "./ui/components/primitives/passkey-button/standalone";
export * from "./ui/components/primitives/stack/standalone";
export * from "./ui/components/primitives/text/standalone";
export * from "./ui/components/workflow/audit-log/standalone";
export * from "./ui/components/workflow/calendar/standalone";
export * from "./ui/components/workflow/kanban/standalone";
export * from "./ui/components/workflow/notification-feed/standalone";
