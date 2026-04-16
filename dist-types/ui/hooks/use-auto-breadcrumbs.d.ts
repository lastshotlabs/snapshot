import { type BreadcrumbAutoConfig, type BreadcrumbItem } from "../manifest/breadcrumbs";
/**
 * Resolve auto-generated breadcrumb items for the current route match.
 */
export declare function useAutoBreadcrumbs(config?: BreadcrumbAutoConfig): BreadcrumbItem[];
