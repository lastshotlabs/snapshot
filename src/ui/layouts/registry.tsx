import type { ComponentType, ReactNode } from "react";

export interface RegisteredLayoutProps {
  config: Record<string, unknown>;
  nav?: ReactNode;
  slots?: Record<string, ReactNode>;
  children: ReactNode;
}

export interface RegisteredLayout {
  component: ComponentType<RegisteredLayoutProps>;
}

const layoutRegistry = new Map<string, RegisteredLayout>();

/** Register a named layout component for code-first layout resolution. */
export function registerLayout(name: string, layout: RegisteredLayout): void {
  layoutRegistry.set(name, layout);
}

/** Resolve a previously registered layout by name. */
export function resolveLayout(name: string): RegisteredLayout | undefined {
  return layoutRegistry.get(name);
}

/** List the names of all currently registered layouts. */
export function getRegisteredLayouts(): string[] {
  return [...layoutRegistry.keys()];
}
