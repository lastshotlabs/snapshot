import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { RendererContext } from "./renderer";

const RendererCtx = createContext<RendererContext | null>(null);

/**
 * Provides RendererContext to all descendant components.
 * Place this inside your jotai Provider so usePageContextAccessors() works.
 */
export function RendererProvider({
  context,
  children,
}: {
  context: RendererContext;
  children: ReactNode;
}) {
  return <RendererCtx.Provider value={context}>{children}</RendererCtx.Provider>;
}

/**
 * Reads the RendererContext from the nearest RendererProvider.
 * Used by generated pages instead of reading from router context.
 */
export function useRendererContext(): RendererContext {
  const ctx = useContext(RendererCtx);
  if (!ctx) {
    throw new Error(
      "[snapshot] useRendererContext() called outside <RendererProvider>. " +
        "Wrap your router outlet with <RendererProvider context={...}>.",
    );
  }
  return ctx;
}
