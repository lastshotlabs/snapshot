import type { PrimitiveAtom } from "jotai";
import type { createStore } from "jotai/vanilla";
import type { ReactNode } from "react";
import type { ApiClient } from "../../api/client";
import type { EndpointTarget, ResourceMap } from "../manifest/resources";

/** The Jotai store type, derived from the createStore return type. */
export type JotaiStore = ReturnType<typeof createStore>;

/**
 * Registry of named state atoms.
 * Backing store is shared per scope (app or route).
 */
export interface AtomRegistry {
  register(id: string): PrimitiveAtom<unknown>;
  get(id: string): PrimitiveAtom<unknown> | undefined;
  unregister(id: string): void;
  keys(): string[];
  readonly store: JotaiStore;
}

export type StateScope = "app" | "route";

/**
 * Named state definition from the manifest.
 * App-scope state persists for the app lifetime.
 * Route-scope state is recreated whenever the active route changes.
 */
export interface StateConfig {
  scope?: StateScope;
  data?: EndpointTarget;
  default?: unknown;
}

export type StateConfigMap = Record<string, StateConfig>;

export interface StateProviderProps {
  state?: StateConfigMap;
  resources?: ResourceMap;
  api?: ApiClient;
  children: ReactNode;
}
