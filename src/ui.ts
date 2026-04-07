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
// export { executeAction } from './ui/actions/executor'

// Manifest & Rendering
// export { ManifestApp } from './ui/manifest/manifest-app'
// export { PageRenderer } from './ui/manifest/page-renderer'
// export { manifestSchema } from './ui/manifest/schema'

// Headless Hooks (Level 2/3)
// export { useDataTable } from './ui/hooks/use-data-table'
// export { useAutoForm } from './ui/hooks/use-auto-form'
// export { usePageContext } from './ui/hooks/use-page-context'
// export { useAppContext } from './ui/hooks/use-app-context'

// Types
// export type { ActionConfig } from './ui/actions/types'
// export type { ManifestConfig, PageConfig } from './ui/manifest/types'
