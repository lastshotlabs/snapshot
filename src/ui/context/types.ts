import type { PrimitiveAtom } from "jotai";
import type { createStore } from "jotai/vanilla";
import type { ReactNode } from "react";

/** The Jotai store type, derived from the createStore return type. */
export type JotaiStore = ReturnType<typeof createStore>;
import type { ApiClient } from "../../api/client";

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
}

/**
 * The atom registry interface — maps component ids to their published Jotai atoms.
 * Each registry backs either a page context (per-route) or app context (global).
 */
export interface AtomRegistry {
  /** Register an atom for a component id. Idempotent — returns existing atom if already registered. */
  register(id: string): PrimitiveAtom<unknown>;
  /** Get the atom for a component id. Returns undefined if not registered. */
  get(id: string): PrimitiveAtom<unknown> | undefined;
  /** Remove a component's atom. Called on unmount. */
  unregister(id: string): void;
  /** Get all registered component ids. For debugging/dev tools. */
  keys(): string[];
  /** The Jotai store backing this registry. */
  readonly store: JotaiStore;
}

/**
 * Global state definition from the manifest.
 * Defines a persistent value that survives route changes.
 */
export interface GlobalConfig {
  /** Endpoint to fetch initial value from. Format: "GET /api/users" or just "/api/users". Fetched on app mount. */
  data?: string;
  /** Static default value (used until endpoint responds, or if no endpoint). */
  default?: unknown;
}

/**
 * Props for AppContextProvider.
 * Wraps the entire app to provide persistent global state.
 */
export interface AppContextProviderProps {
  /** Global state definitions from manifest. Keyed by id. */
  globals?: Record<string, GlobalConfig>;
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
