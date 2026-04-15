import type { ReactNode } from "react";
import { useRef } from "react";
import { atom } from "jotai";
import { useAtomValue, useStore } from "jotai/react";
import type { ApiClient } from "../../api/client";

export const apiClientAtom = atom<ApiClient | null>(null);
apiClientAtom.debugLabel = "snapshot:api-client";

/** Read the active API client from the app-scope Jotai store. */
export function useApiClient(): ApiClient | null {
  return useAtomValue(apiClientAtom);
}

/**
 * Backward-compatible provider shim for tests and external wrappers.
 * This writes the client into the shared Jotai store instead of React context.
 */
export function SnapshotApiProvider({
  value,
  children,
}: {
  value: ApiClient | null;
  children: ReactNode;
}) {
  const store = useStore();
  const lastValueRef = useRef<ApiClient | null | undefined>(undefined);

  if (lastValueRef.current !== value) {
    store.set(apiClientAtom, value);
    lastValueRef.current = value;
  }

  return <>{children}</>;
}
