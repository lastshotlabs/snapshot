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
  registerComponent,
  getRegisteredComponent,
  getRegisteredTypes,
  registerComponentSchema,
  getComponentSchema,
  componentConfigSchema,
  baseComponentConfigSchema,
  fromRefSchema,
  ComponentRenderer,
} from "./ui/manifest/index";
export type {
  ConfigDrivenComponent,
  ComponentConfig,
} from "./ui/manifest/index";

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

// Register all built-in components
import "./ui/components/register";

// Headless Hooks (Level 2/3)
// export { useDataTable } from './ui/hooks/use-data-table'
// export { useAutoForm } from './ui/hooks/use-auto-form'
// export { usePageContext } from './ui/hooks/use-page-context'
// export { useAppContext } from './ui/hooks/use-app-context'

// Types
// export type { ManifestConfig, PageConfig } from './ui/manifest/types'
