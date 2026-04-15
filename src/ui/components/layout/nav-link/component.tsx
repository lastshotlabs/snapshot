"use client";

import type { CSSProperties } from "react";
import { useSubscribe } from "../../../context/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { Link } from "../../primitives/link";
import type { LinkConfig } from "../../primitives/link/types";
import type { NavLinkConfig } from "./types";

export function NavLink({
  config,
  onNavigate,
}: {
  config: NavLinkConfig;
  onNavigate?: (path: string) => void;
}) {
  const resolvedDisabled = useSubscribe(
    typeof config.disabled === "object" &&
      config.disabled !== null &&
      "from" in config.disabled
      ? config.disabled
      : undefined,
  );
  const isDisabled =
    typeof config.disabled === "boolean"
      ? config.disabled
      : typeof resolvedDisabled === "boolean"
        ? resolvedDisabled
        : false;

  const resolvedActive = useSubscribe(
    typeof config.active === "object" &&
      config.active !== null &&
      "from" in config.active
      ? config.active
      : undefined,
  );
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

  const linkSlots = config.slots as LinkConfig["slots"];
  const rootId = config.id ?? config.path;
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-nav-link`,
    implementationBase: {
      display: "contents",
    },
    componentSurface: config,
  });

  return (
    <div
      data-snapshot-component="nav-link"
      data-snapshot-id={`${rootId}-nav-link`}
      className={rootSurface.className}
      style={{
        ...(rootSurface.style ?? {}),
        ...((config.style as CSSProperties | undefined) ?? {}),
      }}
    >
      <Link
        config={{
          type: "link",
          id: config.id ?? config.path,
          text: config.label,
          to: config.path,
          icon: config.icon,
          badge: config.badge,
          variant: "navigation",
          disabled: isDisabled,
          current: isActive,
          matchChildren: config.matchChildren ?? true,
          slots: linkSlots,
        }}
        onNavigate={onNavigate}
      />
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
