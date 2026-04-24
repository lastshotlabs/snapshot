'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
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
  slots?: Record<string, Record<string, unknown>>;
  /** React children rendered inside the nav (for template mode). */
  children?: ReactNode;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function matchesPath(currentPath: string, itemPath: string): boolean {
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

function NavEntryBase({
  item,
  rootId,
  isTopNav,
  currentPath,
  onNavigate,
  slots,
}: {
  item: NavBaseItem;
  rootId: string;
  isTopNav: boolean;
  currentPath: string;
  onNavigate?: (path: string) => void;
  slots?: Record<string, Record<string, unknown>>;
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
    },
    componentSurface: slots?.itemLabel,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
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
      borderRadius: "var(--sn-radius-full, 9999px)",
      background: "var(--sn-color-primary)",
      color: "var(--sn-color-primary-foreground)",
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
        {hasChildren ? <span aria-hidden="true">v</span> : null}
      </ButtonControl>
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={badgeSurface.scopedCss} />

      {!isTopNav && hasChildren ? (
        <ul style={{ listStyle: "none", margin: 0, paddingLeft: "0.75rem" }}>
          {item.children?.map((child, index) => (
            <NavEntryBase
              key={child.path ?? `${itemId}-child-${index}`}
              item={child}
              rootId={`${itemId}-child-${index}`}
              isTopNav={false}
              currentPath={currentPath}
              onNavigate={onNavigate}
              slots={slots}
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
 * No manifest context required.
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
}: NavBaseProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPath, setCurrentPath] = useState(pathname ?? "/");
  const isTopNav = variant === "top-nav";
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
      display: isTopNav ? "flex" : "block",
      gap: isTopNav ? "0.25rem" : undefined,
      alignItems: isTopNav ? "center" : undefined,
      flexWrap: isTopNav ? "nowrap" : undefined,
      overflow: "visible",
    },
    componentSurface: slots?.list,
  });
  const toggleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-toggle`,
    implementationBase: {},
    componentSurface: slots?.toggle,
    activeStates: isCollapsed ? ["active"] : [],
  });

  // Template mode: render children directly
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

  return (
    <nav
      data-snapshot-component="nav"
      aria-label="Main navigation"
      data-variant={variant}
      data-collapsed={isCollapsed ? "true" : undefined}
      style={!isTopNav ? {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        padding: "var(--sn-spacing-sm, 0.5rem)",
        gap: "var(--sn-spacing-xs, 0.25rem)",
      } : {
        display: "flex",
        alignItems: "center",
        gap: "var(--sn-spacing-xs, 0.25rem)",
      }}
    >
      {!isTopNav ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "var(--sn-nav-header-justify, space-between)",
          marginBottom: "var(--sn-spacing-xs, 0.25rem)",
        }}>
          {logo ? (
            logo.path ? (
              <a
                data-snapshot-component="nav-logo"
                href={logo.path}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.(logo.path!);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sn-spacing-sm, 0.5rem)",
                  cursor: "pointer",
                  textDecoration: "none",
                  color: "inherit",
                  flexShrink: 0,
                }}
              >
                {logo.src && (
                  <img
                    src={logo.src}
                    alt={logo.text ?? "Logo"}
                    style={{
                      height: "var(--sn-spacing-lg, 1.5rem)",
                      width: "auto",
                    }}
                  />
                )}
                {logo.text && (
                  <span style={{
                    fontSize: "var(--sn-font-size-lg, 1.125rem)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}>
                    {logo.text}
                  </span>
                )}
              </a>
            ) : (
              <div
                data-snapshot-component="nav-logo"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sn-spacing-sm, 0.5rem)",
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                {logo.src && (
                  <img
                    src={logo.src}
                    alt={logo.text ?? "Logo"}
                    style={{
                      height: "var(--sn-spacing-lg, 1.5rem)",
                      width: "auto",
                    }}
                  />
                )}
                {logo.text && (
                  <span style={{
                    fontSize: "var(--sn-font-size-lg, 1.125rem)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}>
                    {logo.text}
                  </span>
                )}
              </div>
            )
          ) : null}
          {collapsible ? (
            <ButtonControl
              variant="ghost"
              onClick={() => setIsCollapsed((prev) => !prev)}
              surfaceId={`${rootId}-toggle`}
              surfaceConfig={toggleSurface.resolvedConfigForWrapper}
              activeStates={isCollapsed ? ["active"] : []}
              ariaLabel={isCollapsed ? "Expand navigation" : "Collapse navigation"}
            >
              {renderIcon(isCollapsed ? "panel-right" : "panel-left", 16)}
            </ButtonControl>
          ) : null}
        </div>
      ) : (
        <>
          {logo ? (
            logo.path ? (
              <a
                data-snapshot-component="nav-logo"
                href={logo.path}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.(logo.path!);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sn-spacing-sm, 0.5rem)",
                  cursor: "pointer",
                  textDecoration: "none",
                  color: "inherit",
                  flexShrink: 0,
                }}
              >
                {logo.src && (
                  <img
                    src={logo.src}
                    alt={logo.text ?? "Logo"}
                    style={{
                      height: "var(--sn-spacing-lg, 1.5rem)",
                      width: "auto",
                    }}
                  />
                )}
                {logo.text && (
                  <span style={{
                    fontSize: "var(--sn-font-size-lg, 1.125rem)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}>
                    {logo.text}
                  </span>
                )}
              </a>
            ) : (
              <div
                data-snapshot-component="nav-logo"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sn-spacing-sm, 0.5rem)",
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              >
                {logo.src && (
                  <img
                    src={logo.src}
                    alt={logo.text ?? "Logo"}
                    style={{
                      height: "var(--sn-spacing-lg, 1.5rem)",
                      width: "auto",
                    }}
                  />
                )}
                {logo.text && (
                  <span style={{
                    fontSize: "var(--sn-font-size-lg, 1.125rem)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}>
                    {logo.text}
                  </span>
                )}
              </div>
            )
          ) : null}
        </>
      )}

      <ul
        data-snapshot-id={`${rootId}-list`}
        className={listSurface.className}
        style={listSurface.style}
      >
        {items.filter((item) => item.visible !== false).map((item, index) => (
          <NavEntryBase
            key={item.path ?? `${rootId}-item-${index}`}
            item={item}
            rootId={`${rootId}-item-${index}`}
            isTopNav={isTopNav}
            currentPath={currentPath}
            onNavigate={onNavigate}
            slots={slots}
          />
        ))}
      </ul>

      <FloatingMenuStyles />
      <SurfaceStyles css={toggleSurface.scopedCss} />
      <SurfaceStyles css={listSurface.scopedCss} />
    </nav>
  );
}
