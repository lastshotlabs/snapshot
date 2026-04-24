'use client';

import React from "react";
import type { CSSProperties, MouseEventHandler } from "react";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface BreadcrumbBaseItem {
  /** Display label. */
  label: string;
  /** Navigation path / href. */
  path?: string;
  /** Icon name rendered before the label. */
  icon?: string;
  /** Per-item slot overrides. */
  slots?: Record<string, Record<string, unknown>>;
}

export interface BreadcrumbBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Breadcrumb items. */
  items: BreadcrumbBaseItem[];
  /** Visual separator between items. */
  separator?: "slash" | "chevron" | "dot" | "arrow" | string;
  /** Maximum visible items — remainder are collapsed. */
  maxItems?: number;
  /** Called when a breadcrumb link is clicked. Receives the item. */
  onNavigate?: (item: BreadcrumbBaseItem, event: React.MouseEvent<HTMLAnchorElement>) => void;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const SEPARATORS: Record<string, string> = {
  slash: "/",
  chevron: "\u203A",
  dot: "\u00B7",
  arrow: "\u2192",
};

function collapseItems(
  items: BreadcrumbBaseItem[],
  maxItems: number,
): Array<BreadcrumbBaseItem | { label: "..."; collapsed: true }> {
  if (items.length <= maxItems) return items;
  const tail = items.slice(-(maxItems - 1));
  return [items[0]!, { label: "...", collapsed: true } as never, ...tail];
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Breadcrumb — a navigation trail rendered with plain React props.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <BreadcrumbBase
 *   items={[
 *     { label: "Home", path: "/" },
 *     { label: "Settings", path: "/settings" },
 *     { label: "Profile" },
 *   ]}
 * />
 * ```
 */
export function BreadcrumbBase({
  id,
  items,
  separator: separatorProp = "chevron",
  maxItems,
  onNavigate,
  className,
  style,
  slots,
}: BreadcrumbBaseProps) {
  const separator = SEPARATORS[separatorProp] ?? separatorProp;
  const visibleItems =
    maxItems != null ? collapseItems(items, maxItems) : items;
  const rootId = id ?? "breadcrumb";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "xs",
      fontSize: "sm",
      flexWrap: "wrap",
      style: {
        listStyle: "none",
        margin: 0,
        padding: 0,
      },
    },
    componentSurface: slots?.list,
  });

  const handleNavigate = (
    event: React.MouseEvent<HTMLAnchorElement>,
    item: BreadcrumbBaseItem,
  ) => {
    if (onNavigate) {
      event.preventDefault();
      onNavigate(item, event);
      return;
    }
  };

  return (
    <nav
      aria-label="Breadcrumb"
      data-snapshot-component="breadcrumb"
      data-testid="breadcrumb"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <ol
        data-snapshot-id={`${rootId}-list`}
        className={listSurface.className}
        style={listSurface.style}
      >
        {visibleItems.map(
          (
            item: BreadcrumbBaseItem | { label: "..."; collapsed: true },
            index: number,
          ) => {
            const isLast = index === visibleItems.length - 1;
            const isCollapsed = "collapsed" in item;
            const itemSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-item-${index}`,
              implementationBase: {
                display: "flex",
                alignItems: "center",
                gap: "xs",
              },
              componentSurface: slots?.item,
              itemSurface: !isCollapsed ? item.slots?.item : undefined,
            });
            const separatorSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-separator-${index}`,
              implementationBase: {
                color: "var(--sn-color-muted-foreground, #6b7280)",
              },
              componentSurface: slots?.separator,
            });
            const iconSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-icon-${index}`,
              implementationBase: {
                display: "inline-flex",
                alignItems: "center",
                style: { flexShrink: 0 },
              },
              componentSurface: slots?.icon,
              itemSurface: !isCollapsed ? item.slots?.icon : undefined,
            });
            const linkSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-link-${index}`,
              implementationBase: {
                color: "var(--sn-color-muted-foreground, #6b7280)",
                display: "inline-flex",
                alignItems: "center",
                gap: "xs",
                hover: {
                  color: "var(--sn-color-foreground, #111827)",
                },
                focus: {
                  ring: true,
                  color: "var(--sn-color-foreground, #111827)",
                },
                style: {
                  textDecoration: "none",
                },
              },
              componentSurface: slots?.link,
              itemSurface: !isCollapsed ? item.slots?.link : undefined,
              activeStates: isLast ? ["current"] : [],
            });
            const currentSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-current-${index}`,
              implementationBase: {
                color: "var(--sn-color-foreground, #111827)",
                display: "inline-flex",
                alignItems: "center",
                gap: "xs",
              },
              componentSurface: slots?.current,
              itemSurface: !isCollapsed ? item.slots?.current : undefined,
              activeStates: isLast ? ["current"] : [],
            });

            return (
              <li
                key={index}
                data-snapshot-id={`${rootId}-item-${index}`}
                className={itemSurface.className}
                style={itemSurface.style}
              >
                {index > 0 ? (
                  <span
                    aria-hidden="true"
                    data-snapshot-id={`${rootId}-separator-${index}`}
                    className={separatorSurface.className}
                    style={separatorSurface.style}
                  >
                    {separator}
                  </span>
                ) : null}

                {isCollapsed ? (
                  <span className={linkSurface.className} style={linkSurface.style}>
                    ...
                  </span>
                ) : isLast ? (
                  <span
                    aria-current="page"
                    data-snapshot-id={`${rootId}-current-${index}`}
                    className={currentSurface.className}
                    style={currentSurface.style}
                  >
                    {item.icon ? (
                      <span
                        aria-hidden="true"
                        data-snapshot-id={`${rootId}-icon-${index}`}
                        className={iconSurface.className}
                        style={iconSurface.style}
                      >
                        {renderIcon(item.icon, 14)}
                      </span>
                    ) : null}
                    {String(item.label)}
                  </span>
                ) : (
                  <a
                    href={(item as BreadcrumbBaseItem).path ?? "#"}
                    onClick={(event) =>
                      handleNavigate(event, item as BreadcrumbBaseItem)
                    }
                    data-snapshot-id={`${rootId}-link-${index}`}
                    className={linkSurface.className}
                    style={linkSurface.style}
                  >
                    {(item as BreadcrumbBaseItem).icon ? (
                      <span
                        aria-hidden="true"
                        data-snapshot-id={`${rootId}-icon-${index}`}
                        className={iconSurface.className}
                        style={iconSurface.style}
                      >
                        {renderIcon((item as BreadcrumbBaseItem).icon, 14)}
                      </span>
                    ) : null}
                    {String(item.label)}
                  </a>
                )}
                <SurfaceStyles css={itemSurface.scopedCss} />
                <SurfaceStyles css={separatorSurface.scopedCss} />
                <SurfaceStyles css={iconSurface.scopedCss} />
                <SurfaceStyles css={linkSurface.scopedCss} />
                <SurfaceStyles css={currentSurface.scopedCss} />
              </li>
            );
          },
        )}
      </ol>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={listSurface.scopedCss} />
    </nav>
  );
}
