import type { SnapshotConfig, SnapshotInstance } from "./types";
/**
 * Create a per-instance snapshot runtime from bootstrap config and a manifest.
 *
 * Resolves manifest env refs, builds per-instance runtime managers, and wires
 * manifest-driven auth/realtime workflow dispatch events.
 *
 * @param config - Four-field bootstrap config
 * @returns A fully initialized snapshot instance
 *
 * @example
 * ```ts
 * import { createSnapshot } from '@lastshotlabs/snapshot';
 * import manifest from './manifest.json';
 *
 * const snap = createSnapshot({
 *   apiUrl: 'https://api.example.com',
 *   manifest,
 * });
 *
 * // Use hooks in your React components
 * function App() {
 *   const { user } = snap.useUser();
 *   return user ? <div>Hello {user.email}</div> : <LoginForm />;
 * }
 * ```
 */
export declare function createSnapshot<TWSEvents extends Record<string, unknown> = Record<string, unknown>>(config: SnapshotConfig): SnapshotInstance<TWSEvents>;
