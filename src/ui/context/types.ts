import type { ReactNode } from "react";
import type { ApiClient } from "../../api/client";
import type { ResourceMap } from "../manifest/resources";
import type {
  AtomRegistry,
  JotaiStore,
  StateConfig as RuntimeStateConfig,
  StateConfigMap,
} from "../state/types";

/**
 * A reference to another component's published value.
 * Used in config objects to wire components together reactively.
 *
 * @example
 * ```ts
 * // Reference a page-level component's value
 * { from: "users-table.selected" }
 *
 * // Reference a nested field
 * { from: "users-table.selected.name" }
 *
 * // Reference a global value
 * { from: "global.user" }
 * ```
 */
export interface FromRef {
  /** Dot-path reference. Examples: "component-id", "component-id.field", "global.user.name" */
  from: string;
  /** Optional transform to apply to the resolved value before returning it. */
  transform?:
    | "uppercase"
    | "lowercase"
    | "trim"
    | "length"
    | "number"
    | "boolean"
    | "string"
    | "json"
    | "keys"
    | "values"
    | "first"
    | "last"
    | "count"
    | "sum"
    | "join"
    | "split"
    | "default";
  /** Optional argument for transforms that accept one (e.g. join separator, split delimiter, default fallback). */
  transformArg?: string | number;
}

/** Backwards-compatible alias for the shared state registry interface. */
export type { AtomRegistry, JotaiStore };

/**
 * Global state definition from the manifest.
 * This now aliases the shared state config used by the runtime.
 */
export type GlobalConfig = RuntimeStateConfig;

/**
 * Props for AppContextProvider.
 * Wraps the entire app to provide persistent global state.
 */
export interface AppContextProviderProps {
  /** Global state definitions from manifest. Keyed by id. */
  globals?: Record<string, GlobalConfig>;
  /** Named manifest resources available to global state loaders. */
  resources?: ResourceMap;
  /** The API client instance (from createSnapshot) for fetching global data. */
  api?: ApiClient;
  /** React children. */
  children: ReactNode;
}

/**
 * Props for PageContextProvider.
 * Wraps each page/route to provide per-page component state.
 */
export interface PageContextProviderProps {
  /** Named route-scope state definitions. */
  state?: StateConfigMap;
  /** Named manifest resources available to route state loaders. */
  resources?: ResourceMap;
  /** API client for route state loaders. */
  api?: ApiClient;
  /** React children. */
  children: ReactNode;
}

/**
 * Resolves a type where FromRef values are replaced with their resolved types.
 * Used internally — consumers don't need to use this directly.
 */
export type ResolvedConfig<T> = {
  [K in keyof T]: T[K] extends FromRef ? unknown : T[K];
};
