import type { NavConfig } from "./schema";
interface NavComponentProps {
    config: NavConfig;
    pathname?: string;
    onNavigate?: (path: string) => void;
    variant?: "sidebar" | "top-nav";
}
/**
 * Grouped navigation component for manifest app shells.
 *
 * Renders either `navigation.items` or a composable nav template, resolves translated labels at
 * render time, applies canonical slot/state styling, and optionally renders logo and user-menu
 * surfaces.
 */
export declare function Nav({ config, pathname, onNavigate, variant, }: NavComponentProps): import("react/jsx-runtime").JSX.Element;
export {};
