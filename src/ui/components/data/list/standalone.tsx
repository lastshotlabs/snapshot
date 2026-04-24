'use client';

import React, { useMemo, useState, type ReactNode } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { ButtonControl } from "../../forms/button";
import {
  mergeClassNames,
  mergeStyles,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";

// ── Types ───���─────────────────────────────────────────────────────────────────

export interface ListBaseItem {
  /** Unique identifier for the item. */
  id?: string;
  /** Item title text. */
  title: string;
  /** Optional description shown below the title. */
  description?: string;
  /** Optional icon name. */
  icon?: string;
  /** Optional badge text. */
  badge?: string;
  /** Color token for the badge. */
  badgeColor?: string;
  /** Navigation URL (wraps item in a link). */
  href?: string;
  /** Click handler for the item. */
  onAction?: () => void;
  /** Slot overrides for this item's sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface ListBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** List items. */
  items: ListBaseItem[];
  /** Visual variant. */
  variant?: "default" | "bordered" | "card";
  /** Whether items are selectable/clickable. */
  selectable?: boolean;
  /** Whether to show dividers between items. */
  divider?: boolean;
  /** Maximum number of items to show. */
  limit?: number;
  /** Whether the list is loading. */
  isLoading?: boolean;
  /** Error message. */
  error?: string | null;
  /** Empty state message. */
  emptyMessage?: string;
  /** Whether new data is available. */
  hasNewData?: boolean;
  /** Callback to refresh data. */
  onRefresh?: () => void;
  /** Custom loading content. */
  loadingContent?: ReactNode;
  /** Custom error content. */
  errorContent?: ReactNode;
  /** Custom empty content. */
  emptyContent?: ReactNode;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, list, item, itemIcon, itemTitle, itemDescription, itemBadge, divider). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ListSkeleton({
  rootId,
  index,
  itemSurface,
  iconSurface,
  bodySurface,
  titleSurface,
  descriptionSurface,
}: {
  rootId: string;
  index: number;
  itemSurface: ReturnType<typeof resolveSurfacePresentation>;
  iconSurface: ReturnType<typeof resolveSurfacePresentation>;
  bodySurface: ReturnType<typeof resolveSurfacePresentation>;
  titleSurface: ReturnType<typeof resolveSurfacePresentation>;
  descriptionSurface: ReturnType<typeof resolveSurfacePresentation>;
}) {
  return (
    <div
      data-snapshot-id={`${rootId}-loading-item-${index}`}
      className={itemSurface.className}
      style={itemSurface.style}
    >
      <div
        data-snapshot-id={`${rootId}-loading-icon-${index}`}
        className={iconSurface.className}
        style={iconSurface.style}
      />
      <div
        data-snapshot-id={`${rootId}-loading-body-${index}`}
        className={bodySurface.className}
        style={bodySurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-loading-title-${index}`}
          className={titleSurface.className}
          style={titleSurface.style}
        />
        <div
          data-snapshot-id={`${rootId}-loading-description-${index}`}
          className={descriptionSurface.className}
          style={descriptionSurface.style}
        />
      </div>
    </div>
  );
}

function ListItem({
  rootId,
  itemIndex,
  item,
  selectable,
  showDivider,
  isCard,
  slots,
}: {
  rootId: string;
  itemIndex: number;
  item: ListBaseItem;
  selectable: boolean;
  showDivider: boolean;
  isCard: boolean;
  slots?: Record<string, Record<string, unknown>>;
}) {
  const isClickable = selectable && (item.onAction != null || item.href != null);
  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item-${itemIndex}`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
      transition: `background-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)`,
      ...(isClickable
        ? { hover: { bg: "var(--sn-color-accent, #f3f4f6)" }, focus: { ring: true } }
        : {}),
      ...(isCard
        ? {
            border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            borderRadius: "var(--sn-radius-md, 0.5rem)",
            boxShadow: "var(--sn-shadow-sm, 0 1px 2px rgba(0,0,0,0.05))",
            backgroundColor: "var(--sn-color-card, #ffffff)",
          }
        : {}),
      ...(isClickable ? { cursor: "pointer" } : {}),
    },
    componentSurface: slots?.item,
    itemSurface: item.slots?.item,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item-icon-${itemIndex}`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      flexShrink: 0,
      display: "inline-flex",
      alignItems: "center",
    },
    componentSurface: slots?.itemIcon,
    itemSurface: item.slots?.itemIcon,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item-title-${itemIndex}`,
    implementationBase: {
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      fontWeight: "var(--sn-font-weight-medium, 500)" as unknown as number,
      color: "var(--sn-color-foreground, #111827)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    componentSurface: slots?.itemTitle,
    itemSurface: item.slots?.itemTitle,
  });
  const bodySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item-body-${itemIndex}`,
    implementationBase: { flex: 1, minWidth: 0 },
    componentSurface: slots?.itemBody,
    itemSurface: item.slots?.itemBody,
  });
  const descriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item-description-${itemIndex}`,
    implementationBase: {
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    componentSurface: slots?.itemDescription,
    itemSurface: item.slots?.itemDescription,
  });
  const badgeSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item-badge-${itemIndex}`,
    implementationBase: item.badge
      ? {
          display: "inline-flex",
          alignItems: "center",
          padding: "0 var(--sn-spacing-xs, 0.25rem)",
          borderRadius: "var(--sn-radius-full, 9999px)",
          fontSize: "var(--sn-font-size-xs, 0.75rem)",
          fontWeight: "var(--sn-font-weight-semibold, 600)",
          backgroundColor: `var(--sn-color-${item.badgeColor ?? "primary"}, #2563eb)`,
          color: `var(--sn-color-${item.badgeColor ?? "primary"}-foreground, #ffffff)`,
          lineHeight: "var(--sn-leading-normal, 1.5)",
        }
      : undefined,
    componentSurface: slots?.itemBadge,
    itemSurface: item.slots?.itemBadge,
  });
  const linkSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item-link-${itemIndex}`,
    implementationBase: { textDecoration: "none", color: "inherit" },
    componentSurface: slots?.itemLink,
    itemSurface: item.slots?.itemLink,
  });
  const dividerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-divider-${itemIndex}`,
    implementationBase: { height: "1px", backgroundColor: "var(--sn-color-border, #e5e7eb)" },
    componentSurface: slots?.divider,
    itemSurface: item.slots?.divider,
  });

  const handleClick = () => {
    item.onAction?.();
  };

  const content = (
    <div
      data-list-item=""
      data-testid="list-item"
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={
        isClickable
          ? (e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }
          : undefined
      }
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      data-snapshot-id={`${rootId}-item-${itemIndex}`}
      className={itemSurface.className}
      style={itemSurface.style}
    >
      {item.icon && (
        <span
          aria-hidden="true"
          data-snapshot-id={`${rootId}-item-icon-${itemIndex}`}
          className={iconSurface.className}
          style={iconSurface.style}
        >
          <Icon name={item.icon} size={20} />
        </span>
      )}
      <div
        data-snapshot-id={`${rootId}-item-body-${itemIndex}`}
        className={bodySurface.className}
        style={bodySurface.style}
      >
        <div
          data-snapshot-id={`${rootId}-item-title-${itemIndex}`}
          className={titleSurface.className}
          style={titleSurface.style}
        >
          {item.title}
        </div>
        {item.description ? (
          <div
            data-snapshot-id={`${rootId}-item-description-${itemIndex}`}
            className={descriptionSurface.className}
            style={descriptionSurface.style}
          >
            {item.description}
          </div>
        ) : null}
      </div>
      {item.badge ? (
        <span
          data-snapshot-id={`${rootId}-item-badge-${itemIndex}`}
          className={badgeSurface.className}
          style={badgeSurface.style}
        >
          {item.badge}
        </span>
      ) : null}
    </div>
  );

  return (
    <div role="listitem">
      {item.href && !item.onAction ? (
        <a
          href={item.href}
          data-snapshot-id={`${rootId}-item-link-${itemIndex}`}
          className={linkSurface.className}
          style={linkSurface.style}
        >
          {content}
        </a>
      ) : (
        content
      )}
      {showDivider && (
        <div
          data-snapshot-id={`${rootId}-divider-${itemIndex}`}
          className={dividerSurface.className}
          style={dividerSurface.style}
        />
      )}
      <SurfaceStyles css={itemSurface.scopedCss} />
      <SurfaceStyles css={bodySurface.scopedCss} />
      <SurfaceStyles css={linkSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={descriptionSurface.scopedCss} />
      <SurfaceStyles css={badgeSurface.scopedCss} />
      <SurfaceStyles css={dividerSurface.scopedCss} />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone List — renders a vertical list of items with optional icons,
 * descriptions, badges, and click actions. No manifest context required.
 *
 * @example
 * ```tsx
 * <ListBase
 *   variant="bordered"
 *   selectable
 *   items={[
 *     { id: "1", title: "Dashboard", icon: "layout-dashboard", onAction: () => navigate("/dashboard") },
 *     { id: "2", title: "Settings", icon: "settings", badge: "New", badgeColor: "primary" },
 *   ]}
 * />
 * ```
 */
export function ListBase({
  id,
  items,
  variant = "default",
  selectable = false,
  divider: showDividerProp,
  limit,
  isLoading = false,
  error,
  emptyMessage = "No items",
  hasNewData = false,
  onRefresh,
  loadingContent,
  errorContent,
  emptyContent,
  className,
  style,
  slots,
}: ListBaseProps) {
  const rootId = id ?? "list";
  const isCard = variant === "card";
  const showDivider = showDividerProp !== false && !isCard;

  const limitedItems = useMemo(
    () => (limit && limit > 0 ? items.slice(0, limit) : items),
    [limit, items],
  );

  const containerStyle: React.CSSProperties =
    variant === "bordered"
      ? {
          border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
          borderRadius: "var(--sn-radius-md, 0.5rem)",
          overflow: "hidden",
        }
      : variant === "card"
        ? { display: "flex", flexDirection: "column", gap: "var(--sn-spacing-sm, 0.5rem)" }
        : {};

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: containerStyle as Record<string, unknown>,
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    implementationBase: {},
    componentSurface: slots?.list,
  });
  const liveBannerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-liveBanner`,
    implementationBase: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      gap: "0.75rem", padding: "0.75rem 1rem", marginBottom: "0.75rem",
      borderRadius: "var(--sn-radius-md, 0.5rem)", backgroundColor: "var(--sn-color-secondary, #f3f4f6)",
    },
    componentSurface: slots?.liveBanner,
  });
  const liveTextSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-liveText`,
    implementationBase: {},
    componentSurface: slots?.liveText,
  });
  const loadingSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadingState`,
    implementationBase: {},
    componentSurface: slots?.loadingState,
  });
  const loadingItemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadingItem`,
    implementationBase: {
      display: "flex", alignItems: "center", gap: "var(--sn-spacing-sm, 0.5rem)",
      padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
    },
    componentSurface: slots?.loadingItem,
  });
  const loadingIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadingIcon`,
    implementationBase: {
      width: "2rem", height: "2rem", borderRadius: "var(--sn-radius-sm, 0.25rem)",
      backgroundColor: "var(--sn-color-muted, #e5e7eb)",
    },
    componentSurface: slots?.loadingIcon,
  });
  const loadingBodySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadingBody`,
    implementationBase: { flex: 1 },
    componentSurface: slots?.loadingBody,
  });
  const loadingTitleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadingTitle`,
    implementationBase: {
      height: "0.75rem", width: "40%", backgroundColor: "var(--sn-color-muted, #e5e7eb)",
      borderRadius: "var(--sn-radius-sm, 0.25rem)", marginBottom: "var(--sn-spacing-xs, 0.25rem)",
    },
    componentSurface: slots?.loadingTitle,
  });
  const loadingDescriptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadingDescription`,
    implementationBase: {
      height: "0.625rem", width: "60%", backgroundColor: "var(--sn-color-muted, #e5e7eb)",
      borderRadius: "var(--sn-radius-sm, 0.25rem)",
    },
    componentSurface: slots?.loadingDescription,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-errorState`,
    implementationBase: {},
    componentSurface: slots?.errorState,
  });
  const emptySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-emptyState`,
    implementationBase: {},
    componentSurface: slots?.emptyState,
  });
  const emptyMessageSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-emptyMessage`,
    implementationBase: {
      padding: "var(--sn-spacing-lg, 1.5rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      textAlign: "center",
    },
    componentSurface: slots?.emptyMessage,
  });

  return (
    <div
      data-snapshot-component="list"
      data-testid="list"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {hasNewData ? (
        <div
          data-snapshot-id={`${rootId}-live-banner`}
          className={liveBannerSurface.className}
          style={liveBannerSurface.style}
        >
          <span
            data-snapshot-id={`${rootId}-live-text`}
            className={liveTextSurface.className}
            style={liveTextSurface.style}
          >
            New items available
          </span>
          <ButtonControl type="button" onClick={onRefresh} variant="outline" size="sm">
            Refresh
          </ButtonControl>
        </div>
      ) : null}

      {isLoading && (
        loadingContent ? (
          <div
            data-testid="list-loading"
            data-snapshot-id={`${rootId}-loading`}
            className={loadingSurface.className}
            style={loadingSurface.style}
          >
            {loadingContent}
          </div>
        ) : (
          <div
            data-testid="list-loading"
            data-snapshot-id={`${rootId}-loading`}
            className={loadingSurface.className}
            style={loadingSurface.style}
          >
            {[0, 1, 2].map((i) => (
              <ListSkeleton
                key={i}
                rootId={rootId}
                index={i}
                itemSurface={loadingItemSurface}
                iconSurface={loadingIconSurface}
                bodySurface={loadingBodySurface}
                titleSurface={loadingTitleSurface}
                descriptionSurface={loadingDescriptionSurface}
              />
            ))}
          </div>
        )
      )}

      {!isLoading && error && (
        errorContent ?? (
          <div
            data-testid="list-error"
            data-snapshot-id={`${rootId}-error`}
            className={errorSurface.className}
            style={errorSurface.style}
          >
            <span style={{ color: "var(--sn-color-destructive, #dc2626)" }}>
              {error}
            </span>
          </div>
        )
      )}

      {!isLoading && !error && limitedItems.length === 0 && (
        emptyContent ?? (
          <div
            data-testid="list-empty"
            data-snapshot-id={`${rootId}-empty`}
            className={mergeClassNames(
              emptySurface.className,
              emptyMessageSurface.className,
            )}
            style={mergeStyles(emptySurface.style, emptyMessageSurface.style)}
          >
            {emptyMessage}
          </div>
        )
      )}

      {!isLoading && !error && limitedItems.length > 0 && (
        <div
          role="list"
          data-snapshot-id={`${rootId}-list`}
          className={listSurface.className}
          style={listSurface.style}
        >
          {limitedItems.map((item, index) => (
            <ListItem
              key={item.id ?? index}
              rootId={rootId}
              itemIndex={index}
              item={item}
              selectable={selectable}
              showDivider={showDivider && index < limitedItems.length - 1}
              isCard={isCard}
              slots={slots}
            />
          ))}
        </div>
      )}

      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={listSurface.scopedCss} />
      <SurfaceStyles css={liveBannerSurface.scopedCss} />
      <SurfaceStyles css={liveTextSurface.scopedCss} />
      <SurfaceStyles css={loadingSurface.scopedCss} />
      <SurfaceStyles css={loadingItemSurface.scopedCss} />
      <SurfaceStyles css={loadingIconSurface.scopedCss} />
      <SurfaceStyles css={loadingBodySurface.scopedCss} />
      <SurfaceStyles css={loadingTitleSurface.scopedCss} />
      <SurfaceStyles css={loadingDescriptionSurface.scopedCss} />
      <SurfaceStyles css={errorSurface.scopedCss} />
      <SurfaceStyles css={emptySurface.scopedCss} />
      <SurfaceStyles css={emptyMessageSurface.scopedCss} />
    </div>
  );
}
