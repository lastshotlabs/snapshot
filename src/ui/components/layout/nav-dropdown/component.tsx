"use client";

import { useMemo } from "react";
import { useResolveFrom, useSubscribe } from "../../../context/index";
import { ComponentRenderer } from "../../../manifest/renderer";
import { useRouteRuntime } from "../../../manifest/runtime";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { NavLink } from "../nav-link";
import type { NavLinkConfig } from "../nav-link/types";
import { NavDropdownBase } from "./standalone";
import type { NavDropdownConfig } from "./types";

function isNavLinkConfig(config: unknown): config is NavLinkConfig {
  return (
    typeof config === "object" &&
    config !== null &&
    "type" in config &&
    (config as { type?: string }).type === "nav-link"
  );
}

function matchesCurrentRoute(currentPath: string | undefined, item: NavLinkConfig): boolean {
  if (typeof currentPath !== "string" || typeof item.path !== "string") {
    return false;
  }

  return item.matchChildren !== false
    ? currentPath === item.path || currentPath.startsWith(`${item.path}/`)
    : currentPath === item.path;
}

function inheritNavLinkSlots(
  item: NavLinkConfig,
  slots: NavDropdownConfig["slots"],
): NavLinkConfig {
  return {
    ...item,
    slots: {
      ...item.slots,
      root: item.slots?.root ?? slots?.item,
      label: item.slots?.label ?? slots?.itemLabel,
      icon: item.slots?.icon ?? slots?.itemIcon,
    },
  };
}

export function NavDropdown({
  config,
  onNavigate,
}: {
  config: NavDropdownConfig;
  onNavigate?: (path: string) => void;
}) {
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ label: config.label });
  const label =
    resolveOptionalPrimitiveValue(resolvedConfig.label, primitiveOptions) ?? "";
  const routeRuntime = useRouteRuntime();

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

  const inferredCurrent = useMemo(
    () => config.items.some((item) => isNavLinkConfig(item) && matchesCurrentRoute(routeRuntime?.currentPath, item)),
    [config.items, routeRuntime?.currentPath],
  );
  const isCurrent = config.current ?? inferredCurrent;

  return (
    <NavDropdownBase
      id={config.id}
      label={label}
      icon={config.icon}
      current={isCurrent}
      disabled={config.disabled}
      align={config.align === "center" ? "start" : config.align}
      trigger={config.trigger}
      width={config.width}
      className={config.className}
      style={config.style}
      slots={config.slots}
    >
      {config.items.map((item, index) =>
        isNavLinkConfig(item) ? (
          <NavLink
            key={(item as { id?: string }).id ?? index}
            config={inheritNavLinkSlots(item, config.slots)}
            onNavigate={onNavigate}
          />
        ) : (
          <ComponentRenderer key={(item as { id?: string }).id ?? index} config={item} />
        ),
      )}
    </NavDropdownBase>
  );
}
