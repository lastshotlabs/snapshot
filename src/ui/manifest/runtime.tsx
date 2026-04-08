import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { CompiledManifest } from "./types";

export const ManifestRuntimeContext = createContext<CompiledManifest | null>(
  null,
);

export function ManifestRuntimeProvider({
  manifest,
  children,
}: {
  manifest: CompiledManifest;
  children: ReactNode;
}) {
  return (
    <ManifestRuntimeContext.Provider value={manifest}>
      {children}
    </ManifestRuntimeContext.Provider>
  );
}

export function useManifestRuntime(): CompiledManifest | null {
  return useContext(ManifestRuntimeContext);
}
