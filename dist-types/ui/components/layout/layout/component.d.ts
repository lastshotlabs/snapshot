import type { LayoutProps } from "./types";
/**
 * Layout shell component that wraps page content.
 * Renders one of five layout variants based on the config:
 * - **sidebar**: fixed sidebar (collapsible on mobile) + main content area
 * - **top-nav**: horizontal nav bar + content below
 * - **stacked**: vertical header/sidebar/main/footer sections
 * - **minimal**: centered content, no nav (auth pages, onboarding)
 * - **full-width**: edge-to-edge, no nav (landing pages)
 *
 * @param props - Layout configuration, optional nav element, and children
 */
export declare function Layout({ config, nav, slots, children }: LayoutProps): import("react/jsx-runtime").JSX.Element;
