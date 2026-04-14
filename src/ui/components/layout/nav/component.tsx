'use client';

import { useEffect, useRef, useState } from "react";
import { useSubscribe } from "../../../context";
import { ComponentWrapper } from "../../_base/component-wrapper";
import { resolveSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import {
  FloatingMenuStyles,
  FloatingPanel,
  MenuItem,
} from "../../primitives/floating-menu";
import { useActionExecutor } from "../../../actions/executor";
import { renderIcon } from "../../../icons/render";
import { resolveRuntimeLocale, resolveTRef } from "../../../i18n/resolve";
import { isTRef, type I18nConfig, type TRef } from "../../../i18n/schema";
import { useManifestRuntime } from "../../../manifest/runtime";
import { ComponentRenderer } from "../../../manifest/renderer";
import type { ComponentConfig } from "../../../manifest/types";
import { useNav } from "./hook";
import type { NavConfig } from "./schema";
import type { AuthUser, ResolvedNavItem } from "./types";

function SurfaceStyles({ css }: { css?: string }) {
  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null;
}

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

function AvatarSurface({
  user,
  surfaceId,
  slot,
}: {
  user: AuthUser;
  surfaceId: string;
  slot?: Record<string, unknown>;
}) {
  const avatarSurface = resolveSurfacePresentation({
    surfaceId,
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
    componentSurface: slot,
  });

  return (
    <>
      <span
        data-snapshot-id={surfaceId}
        className={avatarSurface.className}
        style={avatarSurface.style}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name ?? "User"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          (user.name?.charAt(0)?.toUpperCase() ?? "U")
        )}
      </span>
      <SurfaceStyles css={avatarSurface.scopedCss} />
    </>
  );
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLLIElement>(null);
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

  return (
    <li ref={containerRef} style={isTopNav ? { position: "relative" } : undefined}>
      <ButtonControl
        variant="ghost"
        disabled={item.isDisabled}
        ariaCurrent={item.isActive && item.path ? "page" : undefined}
        onClick={() => {
          if (item.isDisabled) {
            return;
          }

          if (isTopNav && hasChildren) {
            setDropdownOpen((value) => !value);
            return;
          }

          if (item.path) {
            onNavigate?.(item.path);
          }
        }}
        surfaceId={`${itemId}-button`}
        surfaceConfig={buttonSlot}
        itemSurfaceConfig={item.slots?.item}
        activeStates={[
          ...(item.isActive ? (["current"] as const) : []),
          ...(dropdownOpen ? (["open"] as const) : []),
        ]}
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
        {item.resolvedBadge !== null && item.resolvedBadge > 0 ? (
          <span
            data-snapshot-id={`${itemId}-badge`}
            className={badgeSurface.className}
            style={badgeSurface.style}
          >
            {item.resolvedBadge}
          </span>
        ) : null}
        {hasChildren ? <span aria-hidden="true">▾</span> : null}
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

      {isTopNav && hasChildren ? (
        <FloatingPanel
          open={dropdownOpen}
          onClose={() => setDropdownOpen(false)}
          containerRef={containerRef}
          side="bottom"
          align="start"
          surfaceId={`${itemId}-dropdown`}
          slot={slots?.dropdown}
        >
          {item.children?.filter((child) => child.isVisible).map((child, index) => (
            <MenuItem
              key={child.path ?? `${itemId}-dropdown-${index}`}
              label={resolveNavText(child.label, locale, i18n)}
              icon={child.icon}
              onClick={() => {
                setDropdownOpen(false);
                if (child.path) {
                  onNavigate?.(child.path);
                }
              }}
              disabled={child.isDisabled}
              current={child.isActive}
              surfaceId={`${itemId}-dropdown-item-${index}`}
              slot={slots?.dropdownItem ?? child.slots?.dropdownItem}
              labelSlot={slots?.dropdownItemLabel ?? child.slots?.dropdownItemLabel}
              iconSlot={slots?.dropdownItemIcon ?? child.slots?.dropdownItemIcon}
            />
          ))}
        </FloatingPanel>
      ) : null}
    </li>
  );
}

function UserMenu({
  rootId,
  config,
  user,
  slots,
  isTopNav,
  locale,
  i18n,
}: {
  rootId: string;
  config: Extract<NavConfig["userMenu"], Record<string, unknown>>;
  user: AuthUser;
  slots: NavConfig["slots"];
  isTopNav: boolean;
  locale: string | undefined;
  i18n: I18nConfig | undefined;
}) {
  const execute = useActionExecutor();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const showAvatar = config.showAvatar !== false;
  const showEmail = config.showEmail ?? false;
  const menuItems = config.items ?? [];

  return (
    <div
      ref={containerRef}
      style={isTopNav ? { marginLeft: "auto", position: "relative" } : { position: "relative" }}
    >
      <ButtonControl
        variant="ghost"
        onClick={() => setOpen((value) => !value)}
        surfaceId={`${rootId}-trigger`}
        surfaceConfig={slots?.userMenuTrigger}
        activeStates={open ? ["open"] : []}
      >
        {showAvatar ? (
          <AvatarSurface
            user={user}
            surfaceId={`${rootId}-avatar`}
            slot={slots?.userAvatar}
          />
        ) : null}
        {!isTopNav && user.name ? <span>{user.name}</span> : null}
      </ButtonControl>
      <FloatingPanel
        open={open}
        onClose={() => setOpen(false)}
        containerRef={containerRef}
        side="bottom"
        align="end"
        surfaceId={`${rootId}-panel`}
        slot={slots?.userMenu}
      >
        {showEmail && user.email ? (
          <div style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem" }}>
            {user.email}
          </div>
        ) : null}
        {menuItems.map((item, index) => (
          <MenuItem
            key={`${rootId}-item-${index}`}
            label={resolveNavText(item.label, locale, i18n)}
            icon={item.icon}
            onClick={() => {
              setOpen(false);
              void execute(item.action);
            }}
            surfaceId={`${rootId}-item-${index}`}
            slot={slots?.userMenuItem ?? item.slots?.item}
            labelSlot={item.slots?.itemLabel}
            iconSlot={item.slots?.itemIcon}
          />
        ))}
      </FloatingPanel>
    </div>
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
  const effectiveLogoText = resolveNavText(
    effectiveLogo?.text,
    activeLocale,
    manifest?.raw.i18n,
  );

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
  const brandSurface = resolveSurfacePresentation({
    surfaceId: `${config.id ?? "nav"}-brand`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      cursor: effectiveLogo?.path ? "pointer" : undefined,
    },
    componentSurface: config.slots?.brand,
  });
  const brandIconSurface = resolveSurfacePresentation({
    surfaceId: `${config.id ?? "nav"}-brand-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
    },
    componentSurface: config.slots?.brandIcon,
  });
  const brandLabelSurface = resolveSurfacePresentation({
    surfaceId: `${config.id ?? "nav"}-brand-label`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      fontWeight: 600,
    },
    componentSurface: config.slots?.brandLabel,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${config.id ?? "nav"}-list`,
    implementationBase: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: isTopNav ? "flex" : "block",
      gap: isTopNav ? "0.25rem" : undefined,
    },
    componentSurface: config.slots?.list,
  });

  if (hasTemplate) {
    const templateItems = (config as Record<string, unknown>).template as ComponentConfig[];
    return (
      <ComponentWrapper type="nav" config={rootConfig}>
        <nav aria-label="Main navigation">
          {templateItems.map((child, index) => (
            <ComponentRenderer key={child.id ?? `nav-template-${index}`} config={child} />
          ))}
        </nav>
      </ComponentWrapper>
    );
  }

  return (
    <ComponentWrapper type="nav" config={rootConfig}>
      <nav aria-label="Main navigation" data-variant={variant} data-collapsed={isCollapsed ? "true" : undefined}>
        {effectiveLogo ? (
          <div
            data-snapshot-id={`${config.id ?? "nav"}-brand`}
            className={brandSurface.className}
            style={brandSurface.style}
            onClick={() => {
              if (effectiveLogo.path) {
                onNavigate?.(effectiveLogo.path);
              }
            }}
          >
            {effectiveLogo.src ? (
              <img
                src={effectiveLogo.src}
                alt={effectiveLogoText || "Logo"}
                data-snapshot-id={`${config.id ?? "nav"}-brand-icon`}
                className={brandIconSurface.className}
                style={brandIconSurface.style}
              />
            ) : null}
            {effectiveLogoText ? (
              <span
                data-snapshot-id={`${config.id ?? "nav"}-brand-label`}
                className={brandLabelSurface.className}
                style={brandLabelSurface.style}
              >
                {effectiveLogoText}
              </span>
            ) : null}
          </div>
        ) : null}

        {config.collapsible !== false && !isTopNav ? (
          <ButtonControl variant="ghost" onClick={toggle} surfaceId={`${config.id ?? "nav"}-toggle`}>
            {isCollapsed ? "☰" : "✕"}
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
          <UserMenu
            rootId={`${config.id ?? "nav"}-user-menu`}
            config={
              typeof config.userMenu === "object" ? config.userMenu : {}
            }
            user={user}
            slots={config.slots}
            isTopNav={isTopNav}
            locale={activeLocale}
            i18n={manifest?.raw.i18n}
          />
        ) : null}

        <FloatingMenuStyles />
        <SurfaceStyles css={brandSurface.scopedCss} />
        <SurfaceStyles css={brandIconSurface.scopedCss} />
        <SurfaceStyles css={brandLabelSurface.scopedCss} />
        <SurfaceStyles css={listSurface.scopedCss} />
      </nav>
    </ComponentWrapper>
  );
}
