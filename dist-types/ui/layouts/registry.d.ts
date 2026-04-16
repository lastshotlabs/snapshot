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
/** Register a named layout component for manifest layout resolution. */
export declare function registerLayout(name: string, layout: RegisteredLayout): void;
/** Resolve a previously registered layout by name. */
export declare function resolveLayout(name: string): RegisteredLayout | undefined;
/** List the names of all currently registered manifest layouts. */
export declare function getRegisteredLayouts(): string[];
