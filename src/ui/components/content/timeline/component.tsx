'use client';

import { useEffect, useMemo, type CSSProperties } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { AutoErrorState } from "../../_base/auto-error-state";
import { useComponentData } from "../../_base/use-component-data";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ComponentRenderer } from "../../../manifest/renderer";
import { Icon } from "../../../icons/icon";
import type { ComponentConfig } from "../../../manifest/types";
import type { TimelineConfig, TimelineItem } from "./types";

/**
 * Resolve timeline items from either static config or API data.
 */
function useTimelineItems(config: TimelineConfig): {
  items: TimelineItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const hasEndpoint = config.data !== undefined;
  const { data, isLoading, error, refetch } = useComponentData(
    hasEndpoint ? config.data! : "SKIP",
  );

  const items = useMemo((): TimelineItem[] => {
    if (!hasEndpoint) return config.items ?? [];
    if (!data) return [];

    const rawItems = Array.isArray(data)
      ? data
      : Array.isArray((data as Record<string, unknown>)["data"])
        ? ((data as Record<string, unknown>)["data"] as unknown[])
        : Array.isArray((data as Record<string, unknown>)["items"])
          ? ((data as Record<string, unknown>)["items"] as unknown[])
          : [];

    return rawItems.map((item: unknown) => {
      const record = item as Record<string, unknown>;
      return {
        title: String(record[config.titleField ?? "title"] ?? ""),
        description: record[config.descriptionField ?? "description"] as
          | string
          | undefined,
        date: record[config.dateField ?? "date"] as string | undefined,
      };
    });
  }, [data, hasEndpoint, config]);

  return {
    items,
    isLoading: hasEndpoint ? isLoading : false,
    error: hasEndpoint ? error : null,
    refetch,
  };
}

/**
 * Timeline component: grouped timeline sugar over canonical visible surfaces.
 */
export function Timeline({ config }: { config: TimelineConfig }) {
  const { items, isLoading, error, refetch } = useTimelineItems(config);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);

  useEffect(() => {
    if (publish && items.length > 0) {
      publish({ items, count: items.length });
    }
  }, [publish, items]);

  const variant = config.variant ?? "default";
  const showConnector = config.showConnector ?? true;
  const isCompact = variant === "compact";
  const isAlternating = variant === "alternating";
  const rootId = config.id ?? "timeline";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "relative",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const loadingStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-state`,
    implementationBase: {
      padding: "var(--sn-spacing-md, 1rem)",
    },
    componentSurface: config.slots?.loadingState,
  });
  const loadingItemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-item`,
    implementationBase: {
      display: "flex",
      gap: "var(--sn-spacing-md, 1rem)",
      style: {
        marginBottom: "var(--sn-spacing-lg, 1.5rem)",
      },
    },
    componentSurface: config.slots?.loadingItem,
  });
  const loadingMarkerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-marker`,
    implementationBase: {
      style: {
        width: 12,
        height: 12,
        borderRadius: "var(--sn-radius-full, 9999px)",
        backgroundColor: "var(--sn-color-muted, #e5e7eb)",
        flexShrink: 0,
      },
    },
    componentSurface: config.slots?.loadingMarker,
  });
  const loadingBodySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-body`,
    implementationBase: {
      flex: 1,
    },
    componentSurface: config.slots?.loadingBody,
  });
  const loadingTitleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-title`,
    implementationBase: {
      style: {
        height: "var(--sn-font-size-sm, 0.875rem)",
        width: "40%",
        backgroundColor: "var(--sn-color-muted, #e5e7eb)",
        borderRadius: "var(--sn-radius-sm, 0.25rem)",
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
      },
    },
    componentSurface: config.slots?.loadingTitle,
  });
  const loadingMetaSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading-meta`,
    implementationBase: {
      style: {
        height: "var(--sn-font-size-xs, 0.75rem)",
        width: "60%",
        backgroundColor: "var(--sn-color-muted, #e5e7eb)",
        borderRadius: "var(--sn-radius-sm, 0.25rem)",
      },
    },
    componentSurface: config.slots?.loadingMeta,
  });
  const errorStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error-state`,
    implementationBase: {},
    componentSurface: config.slots?.errorState,
  });
  const emptyStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-empty-state`,
    implementationBase: {
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        padding: "var(--sn-spacing-lg, 1.5rem)",
        textAlign: "center",
      },
    },
    componentSurface: config.slots?.emptyState,
  });

  const handleItemClick = config.action
    ? (item: TimelineItem, index: number) =>
        void execute(config.action!, { ...item, index })
    : undefined;

  if (visible === false) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        data-snapshot-component="timeline"
        data-testid="timeline"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-testid="timeline-loading"
          data-snapshot-id={`${rootId}-loading-state`}
          className={loadingStateSurface.className}
          style={loadingStateSurface.style}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              data-snapshot-id={`${rootId}-loading-item-${i}`}
              className={loadingItemSurface.className}
              style={loadingItemSurface.style}
            >
              <div
                data-snapshot-id={`${rootId}-loading-marker-${i}`}
                className={loadingMarkerSurface.className}
                style={loadingMarkerSurface.style}
              />
              <div
                data-snapshot-id={`${rootId}-loading-body-${i}`}
                className={loadingBodySurface.className}
                style={loadingBodySurface.style}
              >
                <div
                  data-snapshot-id={`${rootId}-loading-title-${i}`}
                  className={loadingTitleSurface.className}
                  style={loadingTitleSurface.style}
                />
                <div
                  data-snapshot-id={`${rootId}-loading-meta-${i}`}
                  className={loadingMetaSurface.className}
                  style={loadingMetaSurface.style}
                />
              </div>
            </div>
          ))}
        </div>
        <SurfaceStyles css={rootSurface.scopedCss} />
        <SurfaceStyles css={loadingStateSurface.scopedCss} />
        <SurfaceStyles css={loadingItemSurface.scopedCss} />
        <SurfaceStyles css={loadingMarkerSurface.scopedCss} />
        <SurfaceStyles css={loadingBodySurface.scopedCss} />
        <SurfaceStyles css={loadingTitleSurface.scopedCss} />
        <SurfaceStyles css={loadingMetaSurface.scopedCss} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        data-snapshot-component="timeline"
        data-testid="timeline"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-testid="timeline-error"
          data-snapshot-id={`${rootId}-error-state`}
          className={errorStateSurface.className}
          style={errorStateSurface.style}
        >
          <AutoErrorState
            config={config.error ?? {}}
            onRetry={config.error?.retry !== undefined ? refetch : undefined}
          />
        </div>
        <SurfaceStyles css={rootSurface.scopedCss} />
        <SurfaceStyles css={errorStateSurface.scopedCss} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        data-snapshot-component="timeline"
        data-testid="timeline"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-testid="timeline-empty"
          data-snapshot-id={`${rootId}-empty-state`}
          className={emptyStateSurface.className}
          style={emptyStateSurface.style}
        >
          No events to display
        </div>
        <SurfaceStyles css={rootSurface.scopedCss} />
        <SurfaceStyles css={emptyStateSurface.scopedCss} />
      </div>
    );
  }

  return (
    <div
      data-snapshot-component="timeline"
      data-testid="timeline"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {items.map((item, index) => {
        const dotColor = item.color
          ? `var(--sn-color-${item.color}, #2563eb)`
          : "var(--sn-color-primary, #2563eb)";
        const dotSize = isCompact ? 8 : 12;
        const isRight = isAlternating && index % 2 === 1;
        const itemSlots = item.slots;
        const itemSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-item-${index}`,
          implementationBase: {
            display: "flex",
            cursor: handleItemClick ? "pointer" : undefined,
            hover: handleItemClick
              ? {
                  bg: "var(--sn-color-accent, var(--sn-color-muted))",
                }
              : undefined,
            focus: handleItemClick
              ? {
                  ring: true,
                }
              : undefined,
            states: {
              current: {
                bg: "var(--sn-color-accent, var(--sn-color-muted))",
              },
            },
            style: {
              flexDirection: isRight ? "row-reverse" : "row",
              gap: isCompact
                ? "var(--sn-spacing-sm, 0.5rem)"
                : "var(--sn-spacing-md, 1rem)",
              paddingBottom:
                index < items.length - 1
                  ? isCompact
                    ? "var(--sn-spacing-sm, 0.5rem)"
                    : "var(--sn-spacing-lg, 1.5rem)"
                  : undefined,
            },
          },
          componentSurface: config.slots?.item,
          itemSurface: itemSlots?.item,
        });
        const markerSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-item-${index}-marker`,
          implementationBase: {
            style: {
              width: dotSize,
              height: dotSize,
              borderRadius: "var(--sn-radius-full, 9999px)",
              backgroundColor: dotColor,
              flexShrink: 0,
              marginTop: isCompact ? 4 : 2,
            } as CSSProperties,
          },
          componentSurface: config.slots?.marker,
          itemSurface: itemSlots?.marker,
        });
        const connectorSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-item-${index}-connector`,
          implementationBase: {
            style: {
              width: "var(--sn-border-thick, 2px)",
              flex: 1,
              backgroundColor: "var(--sn-color-border, #e5e7eb)",
              marginTop: "var(--sn-spacing-xs, 0.25rem)",
            } as CSSProperties,
          },
          componentSurface: config.slots?.connector,
          itemSurface: itemSlots?.connector,
        });
        const markerColumnSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-item-${index}-marker-column`,
          implementationBase: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            style: {
              flexShrink: 0,
              width: dotSize,
            },
          },
          componentSurface: config.slots?.markerColumn,
          itemSurface: itemSlots?.markerColumn,
        });
        const bodySurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-item-${index}-body`,
          implementationBase: {
            flex: 1,
            minWidth: 0,
          },
          componentSurface: config.slots?.body,
          itemSurface: itemSlots?.body,
        });
        const headerSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-item-${index}-header`,
          implementationBase: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "var(--sn-spacing-sm, 0.5rem)",
          },
          componentSurface: config.slots?.header,
          itemSurface: itemSlots?.header,
        });
        const titleGroupSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-item-${index}-title-group`,
          implementationBase: {
            display: "flex",
            alignItems: "center",
            gap: "var(--sn-spacing-xs, 0.25rem)",
          },
          componentSurface: config.slots?.titleGroup,
          itemSurface: itemSlots?.titleGroup,
        });
        const itemIconSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-item-${index}-icon`,
          implementationBase: {
            display: "inline-flex",
            alignItems: "center",
            style: {
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: dotColor,
            },
          },
          componentSurface: config.slots?.itemIcon,
          itemSurface: itemSlots?.itemIcon,
        });
        const titleSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-item-${index}-title`,
          implementationBase: {
            fontSize: "sm",
            fontWeight: "semibold",
            color: "var(--sn-color-foreground, #111827)",
          },
          componentSurface: config.slots?.title,
          itemSurface: itemSlots?.title,
        });
        const metaSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-item-${index}-meta`,
          implementationBase: {
            fontSize: "xs",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            style: {
              whiteSpace: "nowrap",
              flexShrink: 0,
            } as CSSProperties,
          },
          componentSurface: config.slots?.meta,
          itemSurface: itemSlots?.meta,
        });
        const descriptionSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-item-${index}-description`,
          implementationBase: {
            fontSize: "sm",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            style: {
              margin: 0,
              marginTop: "var(--sn-spacing-xs, 0.25rem)",
            } as CSSProperties,
          },
          componentSurface: config.slots?.description,
          itemSurface: itemSlots?.description,
        });
        const contentSurface = resolveSurfacePresentation({
          surfaceId: `${rootId}-item-${index}-content`,
          implementationBase: {
            style: {
              marginTop: "var(--sn-spacing-sm, 0.5rem)",
            } as CSSProperties,
          },
          componentSurface: config.slots?.content,
          itemSurface: itemSlots?.content,
        });

        return (
          <div
            key={index}
            data-testid="timeline-item"
            data-snapshot-id={`${rootId}-item-${index}`}
            className={itemSurface.className}
            onClick={handleItemClick ? () => handleItemClick(item, index) : undefined}
            onKeyDown={
              handleItemClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleItemClick(item, index);
                    }
                  }
                : undefined
            }
            role={handleItemClick ? "button" : undefined}
            tabIndex={handleItemClick ? 0 : undefined}
            style={itemSurface.style}
          >
            <div
              data-snapshot-id={`${rootId}-item-${index}-marker-column`}
              className={markerColumnSurface.className}
              style={markerColumnSurface.style}
            >
              <div
                data-testid="timeline-dot"
                data-snapshot-id={`${rootId}-item-${index}-marker`}
                className={markerSurface.className}
                style={markerSurface.style}
              />
              {showConnector && index < items.length - 1 && (
                <div
                  data-testid="timeline-connector"
                  data-snapshot-id={`${rootId}-item-${index}-connector`}
                  className={connectorSurface.className}
                  style={connectorSurface.style}
                />
              )}
            </div>

            <div
              data-snapshot-id={`${rootId}-item-${index}-body`}
              className={bodySurface.className}
              style={bodySurface.style}
            >
              <div
                data-snapshot-id={`${rootId}-item-${index}-header`}
                className={headerSurface.className}
                style={headerSurface.style}
              >
                <div
                  data-snapshot-id={`${rootId}-item-${index}-title-group`}
                  className={titleGroupSurface.className}
                  style={titleGroupSurface.style}
                >
                  {item.icon && (
                    <span
                      data-snapshot-id={`${rootId}-item-${index}-icon`}
                      className={itemIconSurface.className}
                      style={itemIconSurface.style}
                      aria-hidden="true"
                    >
                      <Icon name={item.icon} size={14} />
                    </span>
                  )}
                  <span
                    data-testid="timeline-title"
                    data-snapshot-id={`${rootId}-item-${index}-title`}
                    className={titleSurface.className}
                    style={titleSurface.style}
                  >
                    {item.title}
                  </span>
                </div>
                {item.date && (
                  <span
                    data-testid="timeline-date"
                    data-snapshot-id={`${rootId}-item-${index}-meta`}
                    className={metaSurface.className}
                    style={metaSurface.style}
                  >
                    {item.date}
                  </span>
                )}
              </div>

              {item.description && !isCompact && (
                <p
                  data-testid="timeline-description"
                  data-snapshot-id={`${rootId}-item-${index}-description`}
                  className={descriptionSurface.className}
                  style={descriptionSurface.style}
                >
                  {item.description}
                </p>
              )}

              {item.content && !isCompact && (
                <div
                  data-snapshot-id={`${rootId}-item-${index}-content`}
                  className={contentSurface.className}
                  style={contentSurface.style}
                >
                  {item.content.map((child, childIndex) => (
                    <ComponentRenderer
                      key={
                        (child as ComponentConfig).id ??
                        `timeline-${index}-child-${childIndex}`
                      }
                      config={child as ComponentConfig}
                    />
                  ))}
                </div>
              )}
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
