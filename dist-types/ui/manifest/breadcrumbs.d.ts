import type { RouteMatch } from "./types";
/** A single breadcrumb entry rendered from the matched route stack. */
export interface BreadcrumbItem {
    label: string;
    path?: string;
    icon?: string;
    isCurrent: boolean;
}
/** Auto-breadcrumb configuration used to derive labels and optional home state from routes. */
export interface BreadcrumbAutoConfig {
    auto: boolean;
    home?: {
        label: string;
        icon?: string;
        href: string;
    };
    separator: string;
    labels?: Record<string, string>;
}
/**
 * Generate breadcrumb items from the current matched route hierarchy.
 */
export declare function generateBreadcrumbs(match: RouteMatch, config: BreadcrumbAutoConfig): BreadcrumbItem[];
