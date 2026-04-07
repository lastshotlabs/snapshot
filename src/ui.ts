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
  ModalManager,
  ToastItem,
  ShowToastOptions,
  ToastManager,
  ConfirmRequest,
  ConfirmOptions,
  ConfirmManager,
} from "./ui/actions/index";

// Manifest & Rendering
export {
  ManifestApp,
  PageRenderer,
  ComponentRenderer,
  registerComponent,
  registerComponentSchema,
  getRegisteredSchemaTypes,
  injectStyleSheet,
  manifestConfigSchema,
  pageConfigSchema,
  componentConfigSchema,
  navItemSchema,
  authScreenConfigSchema,
  baseComponentConfigSchema,
  rowConfigSchema,
  headingConfigSchema,
  buttonConfigSchema,
  selectConfigSchema,
  customComponentConfigSchema,
  fromRefSchema,
} from "./ui/manifest/index";
export type {
  ManifestConfig,
  NavItem,
  AuthScreenConfig,
  PageConfig,
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

// Headless Hooks (Level 2/3)
// export { useDataTable } from './ui/hooks/use-data-table'
// export { useAutoForm } from './ui/hooks/use-auto-form'
// export { usePageContext } from './ui/hooks/use-page-context'
// export { useAppContext } from './ui/hooks/use-app-context'
