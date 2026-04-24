'use client';

import type { CSSProperties, ReactNode } from "react";
import { Icon } from "../../../icons/icon";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface TimelineItemEntry {
  /** Title text for the timeline event. */
  title: string;
  /** Optional description displayed below the title. Hidden in compact variant. */
  description?: string;
  /** Date string displayed opposite the title. */
  date?: string;
  /** Icon name rendered next to the title. */
  icon?: string;
  /** Color token name for the dot marker (e.g. "primary", "success"). */
  color?: string;
  /** Slot overrides scoped to this individual timeline item. */
  slots?: Record<string, Record<string, unknown>>;
  /** Custom ReactNode content rendered below description. Hidden in compact variant. */
  children?: ReactNode;
}

export interface TimelineBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Array of timeline event entries to render. */
  items: TimelineItemEntry[];
  /** Layout variant. Default: "default". */
  variant?: "default" | "compact" | "alternating";
  /** Whether to show vertical connectors between items. Default: true. */
  showConnector?: boolean;
  /** Loading state displays skeleton placeholders. */
  loading?: boolean;
  /** Error content displayed in place of items. */
  error?: ReactNode;
  /** Text shown when items array is empty. Default: "No events to display". */
  emptyText?: string;
  /** Called when a timeline item is clicked. */
  onItemClick?: (item: TimelineItemEntry, index: number) => void;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Timeline — vertical event timeline with dot markers, connectors,
 * date labels, and default/compact/alternating layout variants. No manifest context required.
 *
 * @example
 * ```tsx
 * <TimelineBase
 *   items={[
 *     { title: "Project started", date: "Jan 1", icon: "rocket", color: "primary" },
 *     { title: "First release", date: "Mar 15", description: "v1.0 shipped to production" },
 *   ]}
 *   variant="default"
 *   showConnector
 * />
 * ```
 */
export function TimelineBase({
  id,
  items,
  variant = "default",
  showConnector = true,
  loading = false,
  error,
  emptyText = "No events to display",
  onItemClick,
  className,
  style,
  slots,
}: TimelineBaseProps) {
  const isCompact = variant === "compact";
  const isAlternating = variant === "alternating";
  const rootId = id ?? "timeline";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: { position: "relative" },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  if (loading) {
    const loadingStateSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-loading-state`, implementationBase: { padding: "var(--sn-spacing-md, 1rem)" }, componentSurface: slots?.loadingState });
    const loadingItemSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-loading-item`, implementationBase: { display: "flex", gap: "var(--sn-spacing-md, 1rem)", style: { marginBottom: "var(--sn-spacing-lg, 1.5rem)" } }, componentSurface: slots?.loadingItem });
    const loadingMarkerSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-loading-marker`, implementationBase: { style: { width: 12, height: 12, borderRadius: "var(--sn-radius-full, 9999px)", backgroundColor: "var(--sn-color-muted, #e5e7eb)", flexShrink: 0 } }, componentSurface: slots?.loadingMarker });
    const loadingBodySurface = resolveSurfacePresentation({ surfaceId: `${rootId}-loading-body`, implementationBase: { flex: 1 }, componentSurface: slots?.loadingBody });
    const loadingTitleSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-loading-title`, implementationBase: { style: { height: "var(--sn-font-size-sm, 0.875rem)", width: "40%", backgroundColor: "var(--sn-color-muted, #e5e7eb)", borderRadius: "var(--sn-radius-sm, 0.25rem)", marginBottom: "var(--sn-spacing-xs, 0.25rem)" } }, componentSurface: slots?.loadingTitle });
    const loadingMetaSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-loading-meta`, implementationBase: { style: { height: "var(--sn-font-size-xs, 0.75rem)", width: "60%", backgroundColor: "var(--sn-color-muted, #e5e7eb)", borderRadius: "var(--sn-radius-sm, 0.25rem)" } }, componentSurface: slots?.loadingMeta });

    return (
      <div data-snapshot-component="timeline" data-testid="timeline" data-snapshot-id={`${rootId}-root`} className={rootSurface.className} style={rootSurface.style}>
        <div data-testid="timeline-loading" data-snapshot-id={`${rootId}-loading-state`} className={loadingStateSurface.className} style={loadingStateSurface.style}>
          {[0, 1, 2].map((i) => (
            <div key={i} data-snapshot-id={`${rootId}-loading-item-${i}`} className={loadingItemSurface.className} style={loadingItemSurface.style}>
              <div data-snapshot-id={`${rootId}-loading-marker-${i}`} className={loadingMarkerSurface.className} style={loadingMarkerSurface.style} />
              <div data-snapshot-id={`${rootId}-loading-body-${i}`} className={loadingBodySurface.className} style={loadingBodySurface.style}>
                <div data-snapshot-id={`${rootId}-loading-title-${i}`} className={loadingTitleSurface.className} style={loadingTitleSurface.style} />
                <div data-snapshot-id={`${rootId}-loading-meta-${i}`} className={loadingMetaSurface.className} style={loadingMetaSurface.style} />
              </div>
            </div>
          ))}
        </div>
        <SurfaceStyles css={rootSurface.scopedCss} />
        <SurfaceStyles css={loadingStateSurface.scopedCss} />
      </div>
    );
  }

  if (error) {
    return (
      <div data-snapshot-component="timeline" data-testid="timeline" data-snapshot-id={`${rootId}-root`} className={rootSurface.className} style={rootSurface.style}>
        <div data-testid="timeline-error">{error}</div>
        <SurfaceStyles css={rootSurface.scopedCss} />
      </div>
    );
  }

  if (items.length === 0) {
    const emptyStateSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-empty-state`, implementationBase: { fontSize: "var(--sn-font-size-sm, 0.875rem)", color: "var(--sn-color-muted-foreground, #6b7280)", style: { padding: "var(--sn-spacing-lg, 1.5rem)", textAlign: "center" } }, componentSurface: slots?.emptyState });
    return (
      <div data-snapshot-component="timeline" data-testid="timeline" data-snapshot-id={`${rootId}-root`} className={rootSurface.className} style={rootSurface.style}>
        <div data-testid="timeline-empty" data-snapshot-id={`${rootId}-empty-state`} className={emptyStateSurface.className} style={emptyStateSurface.style}>{emptyText}</div>
        <SurfaceStyles css={rootSurface.scopedCss} />
        <SurfaceStyles css={emptyStateSurface.scopedCss} />
      </div>
    );
  }

  return (
    <div data-snapshot-component="timeline" data-testid="timeline" data-snapshot-id={`${rootId}-root`} className={rootSurface.className} style={rootSurface.style}>
      {items.map((item, index) => {
        const dotColor = item.color ? `var(--sn-color-${item.color}, #2563eb)` : "var(--sn-color-primary, #2563eb)";
        const dotSize = isCompact ? 8 : 12;
        const isRight = isAlternating && index % 2 === 1;
        const itemSlots = item.slots;
        const itemSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-item-${index}`,
          implementationBase: { display: "flex", cursor: onItemClick ? "pointer" : undefined, hover: onItemClick ? { bg: "var(--sn-color-accent, var(--sn-color-muted))" } : undefined, focus: onItemClick ? { ring: true } : undefined, style: { flexDirection: isRight ? "row-reverse" : "row", gap: isCompact ? "var(--sn-spacing-sm, 0.5rem)" : "var(--sn-spacing-md, 1rem)", paddingBottom: index < items.length - 1 ? (isCompact ? "var(--sn-spacing-sm, 0.5rem)" : "var(--sn-spacing-lg, 1.5rem)") : undefined } },
          componentSurface: slots?.item,
          itemSurface: itemSlots?.item,
        });
        const markerSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-item-${index}-marker`, implementationBase: { style: { width: dotSize, height: dotSize, borderRadius: "var(--sn-radius-full, 9999px)", backgroundColor: dotColor, flexShrink: 0, marginTop: isCompact ? 4 : 2 } as CSSProperties }, componentSurface: slots?.marker, itemSurface: itemSlots?.marker });
        const connectorSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-item-${index}-connector`, implementationBase: { style: { width: "var(--sn-border-thick, 2px)", flex: 1, backgroundColor: "var(--sn-color-border, #e5e7eb)", marginTop: "var(--sn-spacing-xs, 0.25rem)" } as CSSProperties }, componentSurface: slots?.connector, itemSurface: itemSlots?.connector });
        const markerColumnSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-item-${index}-marker-column`, implementationBase: { display: "flex", flexDirection: "column", alignItems: "center", style: { flexShrink: 0, width: dotSize } }, componentSurface: slots?.markerColumn, itemSurface: itemSlots?.markerColumn });
        const bodySurface = resolveSurfacePresentation({ surfaceId: `${rootId}-item-${index}-body`, implementationBase: { flex: 1, minWidth: 0 }, componentSurface: slots?.body, itemSurface: itemSlots?.body });
        const headerSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-item-${index}-header`, implementationBase: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--sn-spacing-sm, 0.5rem)" }, componentSurface: slots?.header, itemSurface: itemSlots?.header });
        const titleGroupSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-item-${index}-title-group`, implementationBase: { display: "flex", alignItems: "center", gap: "var(--sn-spacing-xs, 0.25rem)" }, componentSurface: slots?.titleGroup, itemSurface: itemSlots?.titleGroup });
        const itemIconSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-item-${index}-icon`, implementationBase: { display: "inline-flex", alignItems: "center", style: { fontSize: "var(--sn-font-size-sm, 0.875rem)", color: dotColor } }, componentSurface: slots?.itemIcon, itemSurface: itemSlots?.itemIcon });
        const titleSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-item-${index}-title`, implementationBase: { fontSize: "sm", fontWeight: "semibold", color: "var(--sn-color-foreground, #111827)" }, componentSurface: slots?.title, itemSurface: itemSlots?.title });
        const metaSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-item-${index}-meta`, implementationBase: { fontSize: "xs", color: "var(--sn-color-muted-foreground, #6b7280)", style: { whiteSpace: "nowrap", flexShrink: 0 } as CSSProperties }, componentSurface: slots?.meta, itemSurface: itemSlots?.meta });
        const descriptionSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-item-${index}-description`, implementationBase: { fontSize: "sm", color: "var(--sn-color-muted-foreground, #6b7280)", style: { margin: 0, marginTop: "var(--sn-spacing-xs, 0.25rem)" } as CSSProperties }, componentSurface: slots?.description, itemSurface: itemSlots?.description });
        const contentSurface = resolveSurfacePresentation({ surfaceId: `${rootId}-item-${index}-content`, implementationBase: { style: { marginTop: "var(--sn-spacing-sm, 0.5rem)" } as CSSProperties }, componentSurface: slots?.content, itemSurface: itemSlots?.content });

        return (
          <div key={index} data-testid="timeline-item" data-snapshot-id={`${rootId}-item-${index}`} className={itemSurface.className} onClick={onItemClick ? () => onItemClick(item, index) : undefined} onKeyDown={onItemClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onItemClick(item, index); } } : undefined} role={onItemClick ? "button" : undefined} tabIndex={onItemClick ? 0 : undefined} style={itemSurface.style}>
            <div data-snapshot-id={`${rootId}-item-${index}-marker-column`} className={markerColumnSurface.className} style={markerColumnSurface.style}>
              <div data-testid="timeline-dot" data-snapshot-id={`${rootId}-item-${index}-marker`} className={markerSurface.className} style={markerSurface.style} />
              {showConnector && index < items.length - 1 && <div data-testid="timeline-connector" data-snapshot-id={`${rootId}-item-${index}-connector`} className={connectorSurface.className} style={connectorSurface.style} />}
            </div>
            <div data-snapshot-id={`${rootId}-item-${index}-body`} className={bodySurface.className} style={bodySurface.style}>
              <div data-snapshot-id={`${rootId}-item-${index}-header`} className={headerSurface.className} style={headerSurface.style}>
                <div data-snapshot-id={`${rootId}-item-${index}-title-group`} className={titleGroupSurface.className} style={titleGroupSurface.style}>
                  {item.icon && <span data-snapshot-id={`${rootId}-item-${index}-icon`} className={itemIconSurface.className} style={itemIconSurface.style} aria-hidden="true"><Icon name={item.icon} size={14} /></span>}
                  <span data-testid="timeline-title" data-snapshot-id={`${rootId}-item-${index}-title`} className={titleSurface.className} style={titleSurface.style}>{item.title}</span>
                </div>
                {item.date && <span data-testid="timeline-date" data-snapshot-id={`${rootId}-item-${index}-meta`} className={metaSurface.className} style={metaSurface.style}>{item.date}</span>}
              </div>
              {item.description && !isCompact && <p data-testid="timeline-description" data-snapshot-id={`${rootId}-item-${index}-description`} className={descriptionSurface.className} style={descriptionSurface.style}>{item.description}</p>}
              {item.children && !isCompact && <div data-snapshot-id={`${rootId}-item-${index}-content`} className={contentSurface.className} style={contentSurface.style}>{item.children}</div>}
            </div>
            <SurfaceStyles css={itemSurface.scopedCss} />
            <SurfaceStyles css={markerColumnSurface.scopedCss} />
            <SurfaceStyles css={markerSurface.scopedCss} />
            <SurfaceStyles css={connectorSurface.scopedCss} />
            <SurfaceStyles css={bodySurface.scopedCss} />
            <SurfaceStyles css={headerSurface.scopedCss} />
            <SurfaceStyles css={titleGroupSurface.scopedCss} />
            <SurfaceStyles css={itemIconSurface.scopedCss} />
            <SurfaceStyles css={titleSurface.scopedCss} />
            <SurfaceStyles css={metaSurface.scopedCss} />
            <SurfaceStyles css={descriptionSurface.scopedCss} />
            <SurfaceStyles css={contentSurface.scopedCss} />
          </div>
        );
      })}
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
