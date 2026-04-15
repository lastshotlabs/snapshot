import type { ReactNode } from "react";
import type { ApiClient } from "../../api/client";
import type { ExprRef, FromRef } from "@lastshotlabs/frontend-contract/refs";
import type {
  StateConfigMap,
  StateValueConfig,
} from "@lastshotlabs/frontend-contract/state";
import type { ResourceMap } from "../manifest/resources";
import type { AtomRegistry, JotaiStore } from "../state/types";

/** Backwards-compatible alias for the shared state registry interface. */
export type { AtomRegistry, JotaiStore };
export type { ExprRef, FromRef };

/**
 * Global state definition from the manifest.
 * This now aliases the shared state config used by the runtime.
 */
export type GlobalConfig = StateValueConfig;

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
  [K in keyof T]: T[K] extends FromRef | ExprRef ? unknown : T[K];
};
