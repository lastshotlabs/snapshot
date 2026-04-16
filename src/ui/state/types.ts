import type { WritableAtom } from "jotai";
import type { createStore } from "jotai/vanilla";
import type { ReactNode } from "react";
import type {
  StateConfigMap as SharedStateConfigMap,
  StateValueConfig,
} from "@lastshotlabs/frontend-contract/state";
export type { StateScope } from "@lastshotlabs/frontend-contract/state";
import type { ApiClient } from "../../api/client";
import type { ResourceMap } from "../manifest/resources";

/** The Jotai store type, derived from the createStore return type. */
export type JotaiStore = ReturnType<typeof createStore>;

export type StateAtom = WritableAtom<unknown, [unknown], void>;

/**
 * Registry of named state atoms.
 * Backing store is shared per scope (app or route).
 */
export interface AtomRegistry {
  register(id: string, atomOverride?: StateAtom): StateAtom;
  get(id: string): StateAtom | undefined;
  unregister(id: string): void;
  keys(): string[];
  readonly store: JotaiStore;
}

/**
 * Named state definition from the manifest.
 * App-scope state persists for the app lifetime.
 * Route-scope state is recreated whenever the active route changes.
 */
export type StateConfig = StateValueConfig;

/** Map of named state definitions declared by the manifest runtime. */
export type StateConfigMap = SharedStateConfigMap;

/** Props accepted by the provider layer that wires manifest state into a React tree. */
export interface StateProviderProps {
  state?: StateConfigMap;
  resources?: ResourceMap;
  api?: ApiClient;
  children: ReactNode;
}
