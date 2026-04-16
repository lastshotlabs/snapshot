"use client";

import { useRef, useState } from "react";
import { useSubscribe } from "../../../context/index";
import { resolveRuntimeLocale, resolveTRef } from "../../../i18n/resolve";
import { isTRef, type I18nConfig, type TRef } from "../../../i18n/schema";
import { useManifestRuntime } from "../../../manifest/runtime";
import { ButtonControl } from "../../forms/button";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import {
  FloatingMenuStyles,
  FloatingPanel,
  MenuItem,
} from "../../primitives/floating-menu";
import { useActionExecutor } from "../../../actions/executor";
import type { NavUserMenuConfig } from "./types";

type NavUserMenuItem = NonNullable<NavUserMenuConfig["items"]>[number];

function resolveMenuText(
  value: string | TRef,
  locale: string | undefined,
  i18n: I18nConfig | undefined,
): string {
  if (typeof value === "string") {
    return value;
  }

  if (isTRef(value)) {
    return resolveTRef(value, locale, i18n);
  }

  return "";
}

export function NavUserMenu({ config }: { config: NavUserMenuConfig }) {
  const manifest = useManifestRuntime();
  const rawUser = useSubscribe({ from: "global.user" });
  const localeState = useSubscribe({ from: "global.locale" });
  const user = rawUser as {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
    roles?: string[];
  } | null;
  const execute = useActionExecutor();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);

  if (!user) {
    return null;
  }

  const showAvatar = config.showAvatar !== false;
  const showName = config.showName !== false;
  const showEmail = config.showEmail ?? false;
  const mode = config.mode ?? "compact";

  const userRoles = [...(user.role ? [user.role] : []), ...(user.roles ?? [])];
  const menuItems = (config.items ?? []).filter((item: NavUserMenuItem) =>
    item.roles?.length
      ? item.roles.some((role: string) => userRoles.includes(role))
      : true,
  );

  const rootId = config.id ?? "nav-user-menu";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "relative",
      display: "inline-flex",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const avatarSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-avatar`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "2rem",
      height: "2rem",
      borderRadius: "var(--sn-radius-full, 9999px)",
      overflow: "hidden",
      flexShrink: 0,
      background: "var(--sn-color-muted)",
      color: "var(--sn-color-muted-foreground)",
    },
    componentSurface: config.slots?.avatar,
  });
  const triggerLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger-label`,
    implementationBase: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    componentSurface: config.slots?.triggerLabel,
  });
  const avatarImageSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-avatar-image`,
    implementationBase: {
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
      },
    },
    componentSurface: config.slots?.avatarImage,
  });
  const emailSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-email`,
    implementationBase: {
      style: {
        padding: "0.5rem 0.75rem",
        fontSize: "0.75rem",
      },
    },
    componentSurface: config.slots?.email,
  });

  return (
    <div
      ref={containerRef}
      data-snapshot-component="nav-user-menu"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <FloatingMenuStyles />
      <ButtonControl
        variant="ghost"
        onClick={() => setIsOpen((value) => !value)}
        surfaceId={`${rootId}-trigger`}
        surfaceConfig={config.slots?.trigger}
        activeStates={isOpen ? ["open"] : []}
      >
        {showAvatar ? (
          <span
            data-snapshot-id={`${rootId}-avatar`}
            className={avatarSurface.className}
            style={avatarSurface.style}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name ?? "User"}
                data-snapshot-id={`${rootId}-avatar-image`}
                className={avatarImageSurface.className}
                style={avatarImageSurface.style}
              />
            ) : (
              (user.name?.charAt(0)?.toUpperCase() ?? "U")
            )}
          </span>
        ) : null}
        {mode === "full" && showName && user.name ? (
          <span
            data-snapshot-id={`${rootId}-trigger-label`}
            className={triggerLabelSurface.className}
            style={triggerLabelSurface.style}
          >
            {user.name}
          </span>
        ) : null}
      </ButtonControl>

      <FloatingPanel
        open={isOpen}
        onClose={() => setIsOpen(false)}
        containerRef={containerRef}
        align="end"
        surfaceId={`${rootId}-panel`}
        slot={config.slots?.panel}
      >
        {showEmail && user.email ? (
          <div
            data-snapshot-id={`${rootId}-email`}
            className={emailSurface.className}
            style={emailSurface.style}
          >
            {user.email}
          </div>
        ) : null}
        {menuItems.map((item: NavUserMenuItem, index: number) => (
          <MenuItem
            key={`${rootId}-item-${index}`}
            label={resolveMenuText(item.label, activeLocale, manifest?.raw.i18n)}
            icon={item.icon}
            onClick={() => {
              setIsOpen(false);
              void execute(item.action as Parameters<typeof execute>[0]);
            }}
            surfaceId={`${rootId}-item-${index}`}
            slot={config.slots?.item ?? item.slots?.item}
            labelSlot={config.slots?.itemLabel ?? item.slots?.itemLabel}
            iconSlot={config.slots?.itemIcon ?? item.slots?.itemIcon}
          />
        ))}
      </FloatingPanel>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={avatarSurface.scopedCss} />
      <SurfaceStyles css={avatarImageSurface.scopedCss} />
      <SurfaceStyles css={emailSurface.scopedCss} />
      <SurfaceStyles css={triggerLabelSurface.scopedCss} />
    </div>
  );
}
