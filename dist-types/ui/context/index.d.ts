export { AtomRegistryImpl } from "./registry";
export { AppContextProvider, PageContextProvider } from "./providers";
export { usePublish, useSubscribe, useResolveFrom } from "./hooks";
export { getNestedValue, isFromRef, parseDataString, extractFromRefs, applyResolved, } from "./utils";
export type { ExprRef, FromRef, AtomRegistry, GlobalConfig, AppContextProviderProps, PageContextProviderProps, ResolvedConfig, JotaiStore, } from "./types";
/**
 * App-level locale atom used by i18n-aware runtime helpers.
 */
export declare const localeAtom: import("jotai").PrimitiveAtom<string | null> & {
    init: string | null;
};
