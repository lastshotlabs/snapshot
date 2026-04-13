'use client';

import { useEffect, useMemo, type CSSProperties } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { AutoErrorState } from "../../_base/auto-error-state";
import { useComponentData } from "../../_base/use-component-data";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ComponentRenderer } from "../../../manifest/renderer";
import { Icon } from "../../../icons/icon";
import type { ComponentConfig } from "../../../manifest/types";
import type { TimelineConfig, TimelineItem } from "./types";

function SurfaceStyles({ css }: { css?: string }) {
  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null;
}

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
          style={{ padding: "var(--sn-spacing-md, 1rem)" }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "var(--sn-spacing-md, 1rem)",
                marginBottom: "var(--sn-spacing-lg, 1.5rem)",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "var(--sn-radius-full, 9999px)",
                  backgroundColor: "var(--sn-color-muted, #e5e7eb)",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: "var(--sn-font-size-sm, 0.875rem)",
                    width: "40%",
                    backgroundColor: "var(--sn-color-muted, #e5e7eb)",
                    borderRadius: "var(--sn-radius-sm, 0.25rem)",
                    marginBottom: "var(--sn-spacing-xs, 0.25rem)",
                  }}
                />
                <div
                  style={{
                    height: "var(--sn-font-size-xs, 0.75rem)",
                    width: "60%",
                    backgroundColor: "var(--sn-color-muted, #e5e7eb)",
                    borderRadius: "var(--sn-radius-sm, 0.25rem)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <SurfaceStyles css={rootSurface.scopedCss} />
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
        <div data-testid="timeline-error">
          <AutoErrorState
            config={config.error ?? {}}
            onRetry={config.error?.retry !== undefined ? refetch : undefined}
          />
        </div>
        <SurfaceStyles css={rootSurface.scopedCss} />
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
          style={{
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            padding: "var(--sn-spacing-lg, 1.5rem)",
            textAlign: "center",
          }}
        >
          No events to display
        </div>
        <SurfaceStyles css={rootSurface.scopedCss} />
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
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
                width: dotSize,
              }}
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

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "var(--sn-spacing-sm, 0.5rem)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--sn-spacing-xs, 0.25rem)",
                  }}
                >
                  {item.icon && (
                    <span
                      style={{
                        fontSize: "var(--sn-font-size-sm, 0.875rem)",
                        color: dotColor,
                        display: "inline-flex",
                        alignItems: "center",
                      }}
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
            <SurfaceStyles css={markerSurface.scopedCss} />
            <SurfaceStyles css={connectorSurface.scopedCss} />
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
