'use client';

import { useEffect, useState } from "react";
import { useSubscribe } from "../../../context";
import { renderIcon } from "../../../icons/render";
import { resolveRuntimeLocale, resolveTRef } from "../../../i18n/resolve";
import { isTRef, type I18nConfig, type TRef } from "../../../i18n/schema";
import { ComponentRenderer } from "../../../manifest/renderer";
import { useManifestRuntime } from "../../../manifest/runtime";
import type { ComponentConfig } from "../../../manifest/types";
import { ComponentWrapper } from "../../_base/component-wrapper";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  resolveSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { FloatingMenuStyles } from "../../primitives/floating-menu";
import { NavDropdown } from "../nav-dropdown";
import { NavLink } from "../nav-link";
import { NavLogo } from "../nav-logo";
import { NavUserMenu } from "../nav-user-menu";
import { useNav } from "./hook";
import type { NavConfig } from "./schema";
import type { ResolvedNavItem } from "./types";

function resolveNavText(
  value: string | TRef | undefined,
  locale: string | undefined,
  i18n: I18nConfig | undefined,
): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (isTRef(value)) {
    return resolveTRef(value, locale, i18n);
  }

  return "";
}

function resolvePositiveBadge(item: ResolvedNavItem): number | undefined {
  return item.resolvedBadge !== null && item.resolvedBadge > 0
    ? item.resolvedBadge
    : undefined;
}

function buildGroupedNavLinkConfig(
  item: ResolvedNavItem,
  id: string,
  slots: NavConfig["slots"],
) {
  return {
    type: "nav-link" as const,
    id,
    label: item.label,
    path: item.path ?? "/",
    icon: item.icon,
    badge: resolvePositiveBadge(item),
    disabled: item.isDisabled,
    active: item.isActive,
    matchChildren: true,
    slots: {
      root: slots?.item ?? item.slots?.item,
      label: slots?.itemLabel ?? item.slots?.itemLabel,
      icon: slots?.itemIcon ?? item.slots?.itemIcon,
      badge: slots?.itemBadge ?? item.slots?.itemBadge,
    },
  };
}

function buildGroupedDropdownLinkConfig(
  item: ResolvedNavItem,
  id: string,
  slots: NavConfig["slots"],
) {
  return {
    type: "nav-link" as const,
    id,
    label: item.label,
    path: item.path ?? "/",
    icon: item.icon,
    badge: resolvePositiveBadge(item),
    disabled: item.isDisabled,
    active: item.isActive,
    matchChildren: true,
    slots: {
      root: slots?.dropdownItem ?? item.slots?.dropdownItem,
      label: slots?.dropdownItemLabel ?? item.slots?.dropdownItemLabel,
      icon: slots?.dropdownItemIcon ?? item.slots?.dropdownItemIcon,
      badge: slots?.dropdownItemBadge ?? item.slots?.dropdownItemBadge,
    },
  };
}

function NavEntry({
  item,
  rootId,
  slots,
  onNavigate,
  isTopNav,
  locale,
  i18n,
}: {
  item: ResolvedNavItem;
  rootId: string;
  slots: NavConfig["slots"];
  onNavigate?: (path: string) => void;
  isTopNav: boolean;
  locale: string | undefined;
  i18n: I18nConfig | undefined;
}) {
  const hasChildren = Boolean(item.children?.length);
  const itemId = item.path ? `${rootId}-${item.path}` : rootId;
  const label = resolveNavText(item.label, locale, i18n);
  const buttonSlot = slots?.item;
  const labelSlot = slots?.itemLabel;
  const iconSlot = slots?.itemIcon;
  const badgeSlot = slots?.itemBadge;

  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-label`,
    implementationBase: {
      flex: 1,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    componentSurface: labelSlot,
    itemSurface: item.slots?.itemLabel,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
    },
    componentSurface: iconSlot,
    itemSurface: item.slots?.itemIcon,
  });
  const badgeSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-badge`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "1.25rem",
      height: "1.25rem",
      borderRadius: "var(--sn-radius-full, 9999px)",
      background: "var(--sn-color-primary)",
      color: "var(--sn-color-primary-foreground)",
    },
    componentSurface: badgeSlot,
    itemSurface: item.slots?.itemBadge,
  });

  if (!item.isVisible) {
    return null;
  }

  if (!hasChildren && item.path) {
    return (
      <li style={isTopNav ? { position: "relative" } : undefined}>
        <NavLink
          config={buildGroupedNavLinkConfig(item, itemId, slots)}
          onNavigate={onNavigate}
        />
      </li>
    );
  }

  if (isTopNav && hasChildren) {
    return (
      <li style={{ position: "relative" }}>
        <NavDropdown
          config={{
            type: "nav-dropdown",
            id: itemId,
            label,
            icon: item.icon,
            current: item.isActive,
            disabled: item.isDisabled,
            align: "start",
            trigger: "click",
            slots: {
              trigger: slots?.item ?? item.slots?.item,
              triggerLabel: slots?.itemLabel ?? item.slots?.itemLabel,
              triggerIcon: slots?.itemIcon ?? item.slots?.itemIcon,
              panel: slots?.dropdown,
              item: slots?.dropdownItem,
              itemLabel: slots?.dropdownItemLabel,
              itemIcon: slots?.dropdownItemIcon,
            },
            items:
              item.children
                ?.filter((child) => child.isVisible)
                .map((child, index) =>
                  buildGroupedDropdownLinkConfig(
                    child,
                    `${itemId}-dropdown-item-${index}`,
                    slots,
                  ),
                ) ?? [],
          }}
          onNavigate={onNavigate}
        />
      </li>
    );
  }

  return (
    <li style={isTopNav ? { position: "relative" } : undefined}>
      <ButtonControl
        variant="ghost"
        disabled={item.isDisabled}
        ariaCurrent={item.isActive && item.path ? "page" : undefined}
        onClick={() => {
          if (item.isDisabled) {
            return;
          }

          if (item.path) {
            onNavigate?.(item.path);
          }
        }}
        surfaceId={`${itemId}-button`}
        surfaceConfig={buttonSlot}
        itemSurfaceConfig={item.slots?.item}
        activeStates={item.isActive ? ["current"] : []}
      >
        {item.icon ? (
          <span
            data-snapshot-id={`${itemId}-icon`}
            className={iconSurface.className}
            style={iconSurface.style}
          >
            {renderIcon(item.icon, 16)}
          </span>
        ) : null}
        <span
          data-snapshot-id={`${itemId}-label`}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {label}
        </span>
        {resolvePositiveBadge(item) ? (
          <span
            data-snapshot-id={`${itemId}-badge`}
            className={badgeSurface.className}
            style={badgeSurface.style}
          >
            {item.resolvedBadge}
          </span>
        ) : null}
        {hasChildren ? <span aria-hidden="true">v</span> : null}
      </ButtonControl>
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={badgeSurface.scopedCss} />

      {!isTopNav && hasChildren ? (
        <ul style={{ listStyle: "none", margin: 0, paddingLeft: "0.75rem" }}>
          {item.children?.map((child, index) => (
            <NavEntry
              key={child.path ?? `${itemId}-child-${index}`}
              item={child}
              rootId={`${itemId}-child-${index}`}
              slots={slots}
              onNavigate={onNavigate}
              isTopNav={false}
              locale={locale}
              i18n={i18n}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

interface NavComponentProps {
  config: NavConfig;
  pathname?: string;
  onNavigate?: (path: string) => void;
  variant?: "sidebar" | "top-nav";
}

/**
 * Grouped navigation component for manifest app shells.
 *
 * Renders either `navigation.items` or a composable nav template, resolves translated labels at
 * render time, applies canonical slot/state styling, and optionally renders logo and user-menu
 * surfaces.
 */
export function Nav({
  config,
  pathname,
  onNavigate,
  variant = "sidebar",
}: NavComponentProps) {
  const manifest = useManifestRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const [currentPath, setCurrentPath] = useState(pathname ?? "/");
  const { items, isCollapsed, toggle, user } = useNav(config, currentPath);
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);
  const effectiveLogo =
    config.logo ??
    (manifest?.app?.title
      ? {
          text: manifest.app.title,
          path: manifest.app.home ?? "/",
        }
      : undefined);

  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname);
      return;
    }

    setCurrentPath(window.location.pathname);
    const handler = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [pathname]);

  const isTopNav = variant === "top-nav";
  const hasTemplate = Array.isArray((config as Record<string, unknown>).template);
  const rootConfig =
    resolveSurfaceConfig({
      componentSurface: config,
      itemSurface: config.slots?.root,
    }).resolvedConfigForWrapper ?? config;
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${config.id ?? "nav"}-list`,
    implementationBase: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: isTopNav ? "flex" : "block",
      gap: isTopNav ? "0.25rem" : undefined,
      alignItems: isTopNav ? "center" : undefined,
      flexWrap: isTopNav ? "nowrap" : undefined,
      overflow: "visible",
    },
    componentSurface: config.slots?.list,
  });

  if (hasTemplate) {
    const templateItems = (config as Record<string, unknown>).template as ComponentConfig[];
    return (
      <ComponentWrapper type="nav" config={rootConfig}>
        <nav aria-label="Main navigation">
          {templateItems.map((child, index) => (
            <ComponentRenderer
              key={child.id ?? `nav-template-${index}`}
              config={child}
            />
          ))}
        </nav>
      </ComponentWrapper>
    );
  }

  return (
    <ComponentWrapper type="nav" config={rootConfig}>
      <nav
        aria-label="Main navigation"
        data-variant={variant}
        data-collapsed={isCollapsed ? "true" : undefined}
      >
        {effectiveLogo ? (
          <NavLogo
            config={{
              type: "nav-logo",
              id: `${config.id ?? "nav"}-brand`,
              src: effectiveLogo.src,
              text: resolveNavText(
                effectiveLogo.text,
                activeLocale,
                manifest?.raw.i18n,
              ),
              path: effectiveLogo.path,
              slots: {
                root: config.slots?.brand,
                icon: config.slots?.brandIcon,
                label: config.slots?.brandLabel,
              },
            }}
            onNavigate={onNavigate}
          />
        ) : null}

        {config.collapsible !== false && !isTopNav ? (
          <ButtonControl
            variant="ghost"
            onClick={toggle}
            surfaceId={`${config.id ?? "nav"}-toggle`}
          >
            {isCollapsed ? "Menu" : "Close"}
          </ButtonControl>
        ) : null}

        <ul
          data-snapshot-id={`${config.id ?? "nav"}-list`}
          className={listSurface.className}
          style={listSurface.style}
        >
          {items.filter((item) => item.isVisible).map((item, index) => (
            <NavEntry
              key={item.path ?? `${config.id ?? "nav"}-item-${index}`}
              item={item}
              rootId={`${config.id ?? "nav"}-item-${index}`}
              slots={config.slots}
              onNavigate={onNavigate}
              isTopNav={isTopNav}
              locale={activeLocale}
              i18n={manifest?.raw.i18n}
            />
          ))}
        </ul>

        {user && config.userMenu !== false ? (
          <div style={isTopNav ? { marginLeft: "auto" } : undefined}>
            <NavUserMenu
              config={{
                type: "nav-user-menu",
                id: `${config.id ?? "nav"}-user-menu`,
                mode: isTopNav ? "compact" : "full",
                showAvatar:
                  typeof config.userMenu === "object"
                    ? config.userMenu.showAvatar
                    : undefined,
                showEmail:
                  typeof config.userMenu === "object"
                    ? config.userMenu.showEmail
                    : undefined,
                showName: !isTopNav,
                items:
                  typeof config.userMenu === "object"
                    ? config.userMenu.items
                    : undefined,
                slots: {
                  trigger: config.slots?.userMenuTrigger,
                  avatar: config.slots?.userAvatar,
                  panel: config.slots?.userMenu,
                  item: config.slots?.userMenuItem,
                },
              }}
            />
          </div>
        ) : null}

        <FloatingMenuStyles />
        <SurfaceStyles css={listSurface.scopedCss} />
      </nav>
    </ComponentWrapper>
  );
}
