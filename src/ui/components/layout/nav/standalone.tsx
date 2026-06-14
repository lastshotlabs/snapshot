'use client';

import {
  Fragment,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { SlotOverrides } from "../../_base/types";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { FloatingMenuStyles } from "../../primitives/floating-menu";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface NavBaseItem {
  /** Item label text. */
  label: string;
  /** Navigation path. */
  path?: string;
  /** Icon name. */
  icon?: string;
  /** Badge count. */
  badge?: number;
  /** Whether the item is disabled. */
  disabled?: boolean;
  /** Whether the item is currently active (overrides auto-detection). */
  active?: boolean;
  /** Whether the item is visible. Default: true. */
  visible?: boolean;
  /** Nested child items. */
  children?: NavBaseItem[];
}

export interface NavBaseLogo {
  /** Logo text label. */
  text?: string;
  /** Logo image source URL. */
  src?: string;
  /** Navigation path when the logo is clicked. */
  path?: string;
}

export interface NavBaseUser {
  /** User display name. */
  name?: string;
  /** User email address. */
  email?: string;
  /** User avatar URL. */
  avatar?: string;
}

export interface NavBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Navigation variant. Default: "sidebar". */
  variant?: "sidebar" | "top-nav";
  /** Navigation items to render. */
  items?: NavBaseItem[];
  /** Logo configuration. */
  logo?: NavBaseLogo;
  /** Whether the nav is collapsible (sidebar only). Default: true. */
  collapsible?: boolean;
  /** Current URL pathname for active route detection. */
  pathname?: string;
  /** Callback fired on navigation. */
  onNavigate?: (path: string) => void;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: SlotOverrides;
  /** React children rendered inside the nav (for template mode). */
  children?: ReactNode;
  /**
   * Custom item renderer. When provided, called for each item instead of the
   * built-in `<NavEntryBase>`. Receives the item, its index, and a sensible
   * default rendering you can fall back to.
   */
  renderItem?: (
    item: NavBaseItem,
    index: number,
    defaultNode: ReactNode,
  ) => ReactNode;
  /** Custom logo renderer; replaces the built-in logo block when provided. */
  renderLogo?: (logo: NavBaseLogo | undefined) => ReactNode;
  /** Optional content rendered after the items list (e.g., user menu). */
  footer?: ReactNode;
  /** Whether the nav is currently collapsed (controlled). */
  collapsed?: boolean;
  /** Called when collapse state should change. */
  onToggleCollapse?: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function matchesPath(currentPath: string, itemPath: string): boolean {
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

// ── Shared Logo Block ────────────────────────────────────────────────────────

function NavLogoBlock({
  logo,
  onNavigate,
  collapsed,
}: {
  logo?: NavBaseLogo;
  onNavigate?: (path: string) => void;
  collapsed?: boolean;
}) {
  if (!logo) return null;

  const content = (
    <>
      {logo.src && (
        <img
          src={logo.src}
          alt={logo.text ?? "Logo"}
          style={{
            height: "var(--sn-nav-logo-height, 1.5rem)",
            width: "auto",
            flexShrink: 0,
          }}
        />
      )}
      {logo.text && (
        <span
          data-nav-label=""
          style={{
            fontSize: "var(--sn-font-size-lg, 1.125rem)",
            fontWeight: "var(--sn-font-weight-semibold, 600)" as any,
            whiteSpace: "nowrap",
            overflow: "hidden",
            ...(collapsed ? { opacity: 0, width: 0 } : {}),
          }}
        >
          {logo.text}
        </span>
      )}
    </>
  );

  const sharedStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--sn-spacing-sm, 0.5rem)",
    textDecoration: "none",
    color: "inherit",
    flexShrink: 0,
  };

  if (logo.path) {
    return (
      <a
        data-snapshot-component="nav-logo"
        href={logo.path}
        onClick={(e) => {
          e.preventDefault();
          onNavigate?.(logo.path!);
        }}
        style={{ ...sharedStyle, cursor: "pointer" }}
      >
        {content}
      </a>
    );
  }

  return (
    <div data-snapshot-component="nav-logo" style={sharedStyle}>
      {content}
    </div>
  );
}

// ── Nav Entry ────────────────────────────────────────────────────────────────

function NavEntryBase({
  item,
  rootId,
  isTopNav,
  currentPath,
  onNavigate,
  slots,
  collapsed,
  depth = 0,
}: {
  item: NavBaseItem;
  rootId: string;
  isTopNav: boolean;
  currentPath: string;
  onNavigate?: (path: string) => void;
  slots?: SlotOverrides;
  collapsed?: boolean;
  depth?: number;
}) {
  const isVisible = item.visible !== false;
  if (!isVisible) return null;

  const isActive = item.active ?? (item.path ? matchesPath(currentPath, item.path) : false);
  const hasChildren = Boolean(item.children?.length);
  const itemId = item.path ? `${rootId}-${item.path}` : rootId;

  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-label`,
    implementationBase: {
      flex: 1,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      transition: "opacity var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      ...(collapsed ? { opacity: 0, width: 0, overflow: "hidden" } : {}),
    },
    componentSurface: slots?.itemLabel,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
      width: "1.25rem",
      height: "1.25rem",
      justifyContent: "center",
      color: isActive
        ? "var(--sn-color-primary, #2563eb)"
        : "var(--sn-color-muted-foreground, #6b7280)",
      transition: "color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
    },
    componentSurface: slots?.itemIcon,
  });
  const badgeSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-badge`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "1.25rem",
      height: "1.25rem",
      padding: "0 var(--sn-spacing-xs, 0.25rem)",
      borderRadius: "var(--sn-radius-full, 9999px)",
      background: "color-mix(in oklch, var(--sn-color-primary, #2563eb) 14%, var(--sn-color-card, #ffffff))",
      color: "var(--sn-color-primary, #2563eb)",
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
      fontWeight: "var(--sn-font-weight-semibold, 600)" as any,
      lineHeight: 1,
      ...(collapsed ? { display: "none" } : {}),
    },
    componentSurface: slots?.itemBadge,
  });

  return (
    <li style={isTopNav ? { position: "relative" } : undefined}>
      <ButtonControl
        variant="ghost"
        disabled={item.disabled}
        ariaCurrent={isActive && item.path ? "page" : undefined}
        onClick={() => {
          if (item.disabled) return;
          if (item.path) onNavigate?.(item.path);
        }}
        surfaceId={`${itemId}-button`}
        surfaceConfig={slots?.item}
        activeStates={isActive ? ["current"] : []}
        style={depth > 0 ? { paddingLeft: `calc(var(--sn-spacing-sm, 0.5rem) + ${depth} * var(--sn-spacing-md, 0.75rem))` } : undefined}
      >
        {item.icon ? (
          <span
            data-snapshot-id={`${itemId}-icon`}
            className={iconSurface.className}
            style={iconSurface.style}
          >
            {renderIcon(item.icon, 18)}
          </span>
        ) : null}
        <span
          data-snapshot-id={`${itemId}-label`}
          data-nav-label=""
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {item.label}
        </span>
        {item.badge != null && item.badge > 0 ? (
          <span
            data-snapshot-id={`${itemId}-badge`}
            className={badgeSurface.className}
            style={badgeSurface.style}
          >
            {item.badge}
          </span>
        ) : null}
        {hasChildren && !collapsed ? (
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              transition: "transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
            }}
          >
            {renderIcon("chevron-down", 14)}
          </span>
        ) : null}
      </ButtonControl>
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={badgeSurface.scopedCss} />

      {!isTopNav && hasChildren && !collapsed ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {item.children?.map((child, index) => (
            <NavEntryBase
              key={child.path ?? `${itemId}-child-${index}`}
              item={child}
              rootId={`${itemId}-child-${index}`}
              isTopNav={false}
              currentPath={currentPath}
              onNavigate={onNavigate}
              slots={slots}
              collapsed={collapsed}
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Nav -- a navigation component with items, logo, and collapse support.
 * Works with plain React props.
 *
 * @example
 * ```tsx
 * <NavBase
 *   variant="sidebar"
 *   logo={{ text: "My App", path: "/" }}
 *   items={[
 *     { label: "Home", path: "/", icon: "home" },
 *     { label: "Settings", path: "/settings", icon: "settings" },
 *   ]}
 *   onNavigate={(path) => router.push(path)}
 * />
 * ```
 */
export function NavBase({
  id,
  variant = "sidebar",
  items = [],
  logo,
  collapsible = true,
  pathname,
  onNavigate,
  className,
  style,
  slots,
  children,
  renderItem,
  renderLogo,
  footer,
  collapsed,
  onToggleCollapse,
}: NavBaseProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = collapsed ?? internalCollapsed;
  const setIsCollapsed = (next: boolean | ((prev: boolean) => boolean)) => {
    if (onToggleCollapse) {
      onToggleCollapse();
      return;
    }
    setInternalCollapsed(next);
  };
  const [currentPath, setCurrentPath] = useState(pathname ?? "/");
  const isTopNav = variant === "top-nav";
  const isSidebar = !isTopNav;
  const rootId = id ?? "nav";

  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname);
      return;
    }

    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
      const handler = () => setCurrentPath(window.location.pathname);
      window.addEventListener("popstate", handler);
      return () => window.removeEventListener("popstate", handler);
    }
  }, [pathname]);

  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    implementationBase: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: isTopNav ? "row" : "column",
      gap: "var(--sn-spacing-2xs, 0.125rem)",
      alignItems: isTopNav ? "center" : undefined,
      flexWrap: isTopNav ? "nowrap" : undefined,
      flex: isSidebar ? 1 : undefined,
      overflow: isSidebar ? "auto" : "visible",
    },
    componentSurface: slots?.list,
  });
  const toggleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-toggle`,
    implementationBase: {},
    componentSurface: slots?.toggle,
    activeStates: isCollapsed ? ["active"] : [],
  });

  if (children) {
    return (
      <nav
        data-snapshot-component="nav"
        aria-label="Main navigation"
        className={className}
        style={style}
      >
        {children}
      </nav>
    );
  }

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: isSidebar
      ? {
          display: "flex",
          flexDirection: "column",
          style: {
            height: "100%",
            width: isCollapsed
              ? "var(--sn-nav-collapsed-width, 3.5rem)"
              : "var(--sn-nav-expanded-width, 14rem)",
            padding: "var(--sn-spacing-sm, 0.5rem)",
            gap: "var(--sn-spacing-xs, 0.25rem)",
            transition:
              "width var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
            overflow: "hidden",
          },
        }
      : {
          display: "flex",
          alignItems: "center",
          style: {
            gap: "var(--sn-spacing-xs, 0.25rem)",
            padding:
              "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
          },
        },
    componentSurface:
      className || style ? { className, style: style as Record<string, string | number> } : undefined,
    itemSurface: slots?.root,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      style: {
        justifyContent: isCollapsed ? "center" : "space-between",
        padding: isSidebar
          ? "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-2xs, 0.125rem)"
          : undefined,
        marginBottom: isSidebar
          ? "var(--sn-spacing-xs, 0.25rem)"
          : undefined,
        flexShrink: 0,
      },
    },
    componentSurface: slots?.header,
  });

  const itemList = items.filter((item) => item.visible !== false);

  return (
    <nav
      data-snapshot-component="nav"
      aria-label="Main navigation"
      data-variant={variant}
      data-collapsed={isCollapsed ? "true" : undefined}
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {/* Header: logo + collapse toggle */}
      <div
        data-snapshot-id={`${rootId}-header`}
        className={headerSurface.className}
        style={headerSurface.style}
      >
        {renderLogo
          ? renderLogo(logo)
          : <NavLogoBlock logo={logo} onNavigate={onNavigate} collapsed={isCollapsed} />
        }
        {isSidebar && collapsible ? (
          <ButtonControl
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed((prev) => !prev)}
            surfaceId={`${rootId}-toggle`}
            surfaceConfig={toggleSurface.resolvedConfigForWrapper}
            activeStates={isCollapsed ? ["active"] : []}
            ariaLabel={isCollapsed ? "Expand navigation" : "Collapse navigation"}
            style={{
              width: "var(--sn-nav-toggle-size, 1.75rem)",
              height: "var(--sn-nav-toggle-size, 1.75rem)",
              minHeight: "var(--sn-nav-toggle-size, 1.75rem)",
              flexShrink: 0,
            }}
          >
            {renderIcon(isCollapsed ? "panel-right" : "panel-left", 16)}
          </ButtonControl>
        ) : null}
      </div>

      {/* Item list */}
      <ul
        data-snapshot-id={`${rootId}-list`}
        className={listSurface.className}
        style={listSurface.style}
      >
        {itemList.map((item, index) => {
          const defaultNode = (
            <NavEntryBase
              key={item.path ?? `${rootId}-item-${index}`}
              item={item}
              rootId={`${rootId}-item-${index}`}
              isTopNav={isTopNav}
              currentPath={currentPath}
              onNavigate={onNavigate}
              slots={slots}
              collapsed={isCollapsed}
            />
          );
          if (renderItem) {
            return (
              <Fragment key={item.path ?? `${rootId}-item-${index}`}>
                {renderItem(item, index, defaultNode)}
              </Fragment>
            );
          }
          return defaultNode;
        })}
      </ul>

      {/* Footer */}
      {footer ? (
        <div
          data-snapshot-id={`${rootId}-footer`}
          style={{ flexShrink: 0, marginTop: "auto" }}
        >
          {footer}
        </div>
      ) : null}

      <FloatingMenuStyles />
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={toggleSurface.scopedCss} />
      <SurfaceStyles css={listSurface.scopedCss} />
    </nav>
  );
}
