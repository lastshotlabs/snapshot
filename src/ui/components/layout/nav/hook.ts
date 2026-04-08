import { useState, useMemo, useCallback } from "react";
import { useSubscribe } from "../../../context/index";
import type { NavConfig, NavItemConfig } from "./schema";
import type { AuthUser, ResolvedNavItem, UseNavResult } from "./types";

/**
 * Resolve a single nav item: compute active state, visibility, and badge value.
 */
function resolveNavItem(
  item: NavItemConfig,
  pathname: string,
  userRoles: string[],
  subscribedBadge: unknown,
): ResolvedNavItem {
  const isActive = item.path
    ? pathname === item.path || pathname.startsWith(item.path + "/")
    : false;
  const isVisible =
    !item.roles ||
    item.roles.length === 0 ||
    item.roles.some((role: string) => userRoles.includes(role));

  let resolvedBadge: number | null = null;
  if (typeof item.badge === "number") {
    resolvedBadge = item.badge;
  } else if (typeof subscribedBadge === "number") {
    resolvedBadge = subscribedBadge;
  }

  const resolvedChildren = item.children?.map((child: NavItemConfig) =>
    resolveNavItem(child, pathname, userRoles, undefined),
  );

  return {
    ...item,
    isActive,
    isVisible,
    resolvedBadge,
    children: resolvedChildren,
  };
}

/**
 * Recursively find the first active item in a resolved nav tree.
 */
function findActiveItem(items: ResolvedNavItem[]): ResolvedNavItem | null {
  for (const item of items) {
    if (item.isActive && item.isVisible) return item;
    if (item.children) {
      const child = findActiveItem(item.children);
      if (child) return child;
    }
  }
  return null;
}

/**
 * Headless hook for nav component logic.
 * Resolves nav items with active state, role-based visibility,
 * badge resolution from FromRefs, and collapse toggle.
 *
 * @param config - Nav component configuration from the manifest
 * @param pathname - Current URL pathname for active route detection
 * @returns Resolved nav items, active item, collapse state, and user info
 */
export function useNav(config: NavConfig, pathname: string): UseNavResult {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Read global.user from AppContext for role filtering and user menu
  const rawUser = useSubscribe({ from: "global.user" });
  const user = (rawUser as AuthUser) ?? null;

  const userRoles = useMemo(() => {
    if (!user) return [] as string[];
    const roles: string[] = [];
    if (user.role) roles.push(user.role);
    if (user.roles) roles.push(...user.roles);
    return roles;
  }, [user]);

  // Subscribe to badge FromRefs using a fixed number of useSubscribe calls (max 10)
  // to avoid hooks-in-loop violations. Items beyond 10 won't get live badge updates.
  const badgeRef = (index: number) => {
    const item = config.items[index];
    if (
      item &&
      typeof item.badge === "object" &&
      item.badge !== null &&
      "from" in item.badge
    ) {
      return item.badge;
    }
    return undefined;
  };
  const b0 = useSubscribe(badgeRef(0));
  const b1 = useSubscribe(badgeRef(1));
  const b2 = useSubscribe(badgeRef(2));
  const b3 = useSubscribe(badgeRef(3));
  const b4 = useSubscribe(badgeRef(4));
  const b5 = useSubscribe(badgeRef(5));
  const b6 = useSubscribe(badgeRef(6));
  const b7 = useSubscribe(badgeRef(7));
  const b8 = useSubscribe(badgeRef(8));
  const b9 = useSubscribe(badgeRef(9));
  const badgeValues: unknown[] = [b0, b1, b2, b3, b4, b5, b6, b7, b8, b9].slice(
    0,
    config.items.length,
  );

  const items = useMemo(() => {
    return config.items.map((item, index) =>
      resolveNavItem(item, pathname, userRoles, badgeValues[index]),
    );
    // badgeValues is intentionally spread to avoid array reference instability
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.items, pathname, userRoles, ...badgeValues]);

  const activeItem = useMemo(() => findActiveItem(items), [items]);

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return {
    items,
    activeItem,
    isCollapsed,
    toggle,
    user,
  };
}
