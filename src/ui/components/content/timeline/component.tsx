import { useEffect, useMemo } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { useComponentData } from "../../_base/use-component-data";
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

    // API data: expect an array at the top level or in a "data"/"items" field
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
 * Timeline component — a vertical timeline of events with optional
 * connector line, colored dots, and child content.
 *
 * Supports static items or dynamic data from an API endpoint.
 * Items can include nested component content rendered via ComponentRenderer.
 *
 * @param props - Component props containing the timeline configuration
 *
 * @example
 * ```json
 * {
 *   "type": "timeline",
 *   "items": [
 *     { "title": "Created", "date": "2024-01-01", "color": "primary" },
 *     { "title": "Updated", "date": "2024-01-15", "color": "info" }
 *   ]
 * }
 * ```
 */
export function Timeline({ config }: { config: TimelineConfig }) {
  const { items, isLoading, error, refetch } = useTimelineItems(config);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const visible = useSubscribe(config.visible ?? true);

  // Publish items when data changes
  useEffect(() => {
    if (publish && items.length > 0) {
      publish({ items, count: items.length });
    }
  }, [publish, items]);

  const variant = config.variant ?? "default";
  const showConnector = config.showConnector ?? true;
  const isCompact = variant === "compact";
  const isAlternating = variant === "alternating";

  const handleItemClick = config.action
    ? (item: TimelineItem, index: number) =>
        void execute(config.action!, { ...item, index })
    : undefined;

  if (visible === false) return null;

  // Loading state
  if (isLoading) {
    return (
      <div
        data-snapshot-component="timeline"
        data-testid="timeline"
        className={config.className}
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
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        data-snapshot-component="timeline"
        data-testid="timeline"
        className={config.className}
      >
        <div
          data-testid="timeline-error"
          style={{ color: "var(--sn-color-destructive, #dc2626)" }}
        >
          <span style={{ fontSize: "var(--sn-font-size-sm, 0.875rem)" }}>
            Failed to load timeline
          </span>
          <button
            onClick={() => refetch()}
            style={{
              marginLeft: "var(--sn-spacing-sm, 0.5rem)",
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              padding: 0,
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div
        data-snapshot-component="timeline"
        data-testid="timeline"
        className={config.className}
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
      </div>
    );
  }

  return (
    <div
      data-snapshot-component="timeline"
      data-testid="timeline"
      className={config.className}
      style={{
        position: "relative",
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      {items.map((item, index) => {
        const dotColor = item.color
          ? `var(--sn-color-${item.color}, #2563eb)`
          : "var(--sn-color-primary, #2563eb)";
        const dotSize = isCompact ? 8 : 12;
        const isRight = isAlternating && index % 2 === 1;

        return (
          <div
            key={index}
            data-testid="timeline-item"
            onClick={
              handleItemClick ? () => handleItemClick(item, index) : undefined
            }
            onKeyDown={
              handleItemClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleItemClick(item, index);
                  }
                : undefined
            }
            role={handleItemClick ? "button" : undefined}
            tabIndex={handleItemClick ? 0 : undefined}
            style={{
              display: "flex",
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
              cursor: handleItemClick ? "pointer" : undefined,
            }}
          >
            {/* Dot + connector column */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
                width: dotSize,
              }}
            >
              {/* Dot */}
              <div
                data-testid="timeline-dot"
                style={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: "var(--sn-radius-full, 9999px)",
                  backgroundColor: dotColor,
                  flexShrink: 0,
                  marginTop: isCompact ? 4 : 2,
                }}
              />
              {/* Connector line */}
              {showConnector && index < items.length - 1 && (
                <div
                  data-testid="timeline-connector"
                  style={{
                    width: 2,
                    flex: 1,
                    backgroundColor: "var(--sn-color-border, #e5e7eb)",
                    marginTop: "var(--sn-spacing-xs, 0.25rem)",
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Header row: title + date */}
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
                    style={{
                      fontSize: "var(--sn-font-size-sm, 0.875rem)",
                      fontWeight: "var(--sn-font-weight-semibold, 600)",
                      color: "var(--sn-color-foreground, #111827)",
                    }}
                  >
                    {item.title}
                  </span>
                </div>
                {item.date && (
                  <span
                    data-testid="timeline-date"
                    style={{
                      fontSize: "var(--sn-font-size-xs, 0.75rem)",
                      color: "var(--sn-color-muted-foreground, #6b7280)",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {item.date}
                  </span>
                )}
              </div>

              {/* Description */}
              {item.description && !isCompact && (
                <p
                  data-testid="timeline-description"
                  style={{
                    fontSize: "var(--sn-font-size-sm, 0.875rem)",
                    color: "var(--sn-color-muted-foreground, #6b7280)",
                    margin: 0,
                    marginTop: "var(--sn-spacing-xs, 0.25rem)",
                  }}
                >
                  {item.description}
                </p>
              )}

              {/* Child content */}
              {item.content && !isCompact && (
                <div
                  style={{
                    marginTop: "var(--sn-spacing-sm, 0.5rem)",
                  }}
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
          </div>
        );
      })}
    </div>
  );
}
