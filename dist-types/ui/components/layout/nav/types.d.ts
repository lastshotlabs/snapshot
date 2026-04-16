import type { NavItemConfig } from "./schema";
/**
 * A nav item enriched with computed state:
 * active detection, visibility based on role, and resolved badge value.
 */
export interface ResolvedNavItem extends NavItemConfig {
    /** Whether this item matches the current route. */
    isActive: boolean;
    /** Whether this item is visible to the current user (role-based). */
    isVisible: boolean;
    /** Whether the item is disabled. */
    isDisabled: boolean;
    /** Resolved badge count (from static value or FromRef). Null if no badge. */
    resolvedBadge: number | null;
    /** Resolved children with the same enrichments. */
    children?: ResolvedNavItem[];
}
/**
 * User info shape expected from `global.user` in AppContext.
 * Minimal contract: the nav only needs name, email, avatar, and role.
 */
export interface AuthUser {
    /** User display name. */
    name?: string;
    /** User email address. */
    email?: string;
    /** Avatar URL. */
    avatar?: string;
    /** User role for nav item visibility filtering. */
    role?: string;
    /** User roles array (alternative to single role). */
    roles?: string[];
}
/**
 * Return type of the useNav headless hook.
 */
export interface UseNavResult {
    /** Resolved nav items with active/visible state. */
    items: ResolvedNavItem[];
    /** Currently active item (matching current route). */
    activeItem: ResolvedNavItem | null;
    /** Whether sidebar is collapsed (mobile). */
    isCollapsed: boolean;
    /** Toggle sidebar collapse. */
    toggle: () => void;
    /** Current user info (from global.user). */
    user: AuthUser | null;
}
