"use client";

import { useSubscribe } from "../../../context/index";
import { useRouteRuntime } from "../../../manifest/runtime";
import { NavLinkBase } from "./standalone";
import type { NavLinkConfig } from "./types";

function isFromRef(value: unknown): value is { from: string } {
  return typeof value === "object" && value !== null && "from" in value;
}

export function NavLink({
  config,
  onNavigate,
}: {
  config: NavLinkConfig;
  onNavigate?: (path: string) => void;
}) {
  const routeRuntime = useRouteRuntime();

  const resolvedLabel = useSubscribe(isFromRef(config.label) ? config.label : undefined);
  const label = typeof config.label === "string"
    ? config.label
    : typeof resolvedLabel === "string"
      ? resolvedLabel
      : undefined;

  const resolvedBadge = useSubscribe(isFromRef(config.badge) ? config.badge : undefined);
  const badge = typeof config.badge === "number"
    ? config.badge
    : typeof resolvedBadge === "number"
      ? resolvedBadge
      : undefined;

  const resolvedDisabled = useSubscribe(isFromRef(config.disabled) ? config.disabled : undefined);
  const isDisabled =
    typeof config.disabled === "boolean"
      ? config.disabled
      : typeof resolvedDisabled === "boolean"
        ? resolvedDisabled
        : false;

  const resolvedActive = useSubscribe(isFromRef(config.active) ? config.active : undefined);
  const isActive =
    typeof config.active === "boolean"
      ? config.active
      : typeof resolvedActive === "boolean"
        ? resolvedActive
        : undefined;

  const rawUser = useSubscribe({ from: "global.user" });
  const user = rawUser as { role?: string; roles?: string[] } | null;
  if (config.authenticated === true && !user) {
    return null;
  }
  if (config.authenticated === false && user) {
    return null;
  }
  if (config.roles?.length) {
    const userRoles = [...(user?.role ? [user.role] : []), ...(user?.roles ?? [])];
    if (!config.roles.some((role) => userRoles.includes(role))) {
      return null;
    }
  }

  const handleNavigate = onNavigate ?? ((path: string) => routeRuntime?.navigate(path));

  return (
    <NavLinkBase
      id={config.id}
      label={label}
      path={config.path}
      icon={config.icon}
      badge={badge}
      disabled={isDisabled}
      active={isActive}
      matchChildren={config.matchChildren}
      onNavigate={handleNavigate}
      className={config.className}
      style={config.style}
      slots={config.slots}
    />
  );
}
