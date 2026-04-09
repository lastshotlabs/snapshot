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
  user: AuthUser | null,
  userRoles: string[],
  subscribedBadge: unknown,
  subscribedVisible: unknown,
  subscribedDisabled: unknown,
): ResolvedNavItem {
  const isActive = item.path
    ? pathname === item.path || pathname.startsWith(item.path + "/")
    : false;
  const resolvedVisible =
    typeof item.visible === "boolean"
      ? item.visible
      : typeof subscribedVisible === "boolean"
        ? subscribedVisible
        : true;
  const resolvedDisabled =
    typeof item.disabled === "boolean"
      ? item.disabled
      : typeof subscribedDisabled === "boolean"
        ? subscribedDisabled
        : false;
  const matchesAuth =
    item.authenticated === undefined
      ? true
      : item.authenticated
        ? Boolean(user)
        : !user;
  const matchesRole =
    !item.roles ||
    item.roles.length === 0 ||
    item.roles.some((role: string) => userRoles.includes(role));
  const isVisible = resolvedVisible && matchesAuth && matchesRole;

  let resolvedBadge: number | null = null;
  if (typeof item.badge === "number") {
    resolvedBadge = item.badge;
  } else if (typeof subscribedBadge === "number") {
    resolvedBadge = subscribedBadge;
  }

  const resolvedChildren = item.children?.map((child: NavItemConfig) =>
    resolveNavItem(
      child,
      pathname,
      user,
      userRoles,
      undefined,
      undefined,
      undefined,
    ),
  );

  return {
    ...item,
    isActive,
    isVisible,
    isDisabled: resolvedDisabled,
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
  const visibilityRef = (index: number) => {
    const item = config.items[index];
    if (
      item &&
      typeof item.visible === "object" &&
      item.visible !== null &&
      "from" in item.visible
    ) {
      return item.visible;
    }
    return undefined;
  };
  const v0 = useSubscribe(visibilityRef(0));
  const v1 = useSubscribe(visibilityRef(1));
  const v2 = useSubscribe(visibilityRef(2));
  const v3 = useSubscribe(visibilityRef(3));
  const v4 = useSubscribe(visibilityRef(4));
  const v5 = useSubscribe(visibilityRef(5));
  const v6 = useSubscribe(visibilityRef(6));
  const v7 = useSubscribe(visibilityRef(7));
  const v8 = useSubscribe(visibilityRef(8));
  const v9 = useSubscribe(visibilityRef(9));
  const visibilityValues: unknown[] = [v0, v1, v2, v3, v4, v5, v6, v7, v8, v9].slice(
    0,
    config.items.length,
  );
  const disabledRef = (index: number) => {
    const item = config.items[index];
    if (
      item &&
      typeof item.disabled === "object" &&
      item.disabled !== null &&
      "from" in item.disabled
    ) {
      return item.disabled;
    }
    return undefined;
  };
  const d0 = useSubscribe(disabledRef(0));
  const d1 = useSubscribe(disabledRef(1));
  const d2 = useSubscribe(disabledRef(2));
  const d3 = useSubscribe(disabledRef(3));
  const d4 = useSubscribe(disabledRef(4));
  const d5 = useSubscribe(disabledRef(5));
  const d6 = useSubscribe(disabledRef(6));
  const d7 = useSubscribe(disabledRef(7));
  const d8 = useSubscribe(disabledRef(8));
  const d9 = useSubscribe(disabledRef(9));
  const disabledValues: unknown[] = [d0, d1, d2, d3, d4, d5, d6, d7, d8, d9].slice(
    0,
    config.items.length,
  );

  const items = useMemo(() => {
    return config.items.map((item, index) =>
      resolveNavItem(
        item,
        pathname,
        user,
        userRoles,
        badgeValues[index],
        visibilityValues[index],
        disabledValues[index],
      ),
    );
    // badgeValues is intentionally spread to avoid array reference instability
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config.items,
    pathname,
    user,
    userRoles,
    ...badgeValues,
    ...visibilityValues,
    ...disabledValues,
  ]);

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
