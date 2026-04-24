'use client';

import { useState, useMemo, useCallback, type CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { formatRelativeTime, getInitials } from "../../_base/utils";
import { ButtonControl } from "../../forms/button";
import { SelectControl } from "../../forms/select";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface AuditLogFilterEntry {
  /** Data field name to filter on. */
  field: string;
  /** Human-readable label for the filter dropdown. */
  label: string;
  /** Available option values for this filter. */
  options: string[];
}

export interface AuditLogBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Data items to display. */
  items: Record<string, unknown>[];
  /** Whether data is currently loading. */
  loading?: boolean;
  /** Error object, if any. */
  error?: { message: string } | null;
  /** Field name that holds the user/actor value. Default: "user". */
  userField?: string;
  /** Field name that holds the action description. Default: "action". */
  actionField?: string;
  /** Field name that holds the timestamp value. Default: "timestamp". */
  timestampField?: string;
  /** Field name that holds the expandable details object. */
  detailsField?: string;
  /** Filter definitions for the filter bar. */
  filters?: AuditLogFilterEntry[];
  /** Pagination config. false disables, number sets pageSize. Default: 20. */
  pagination?: false | number;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── SkeletonEntry ─────────────────────────────────────────────────────────────

function SkeletonEntry({
  rootId,
  index,
  slots,
}: {
  rootId: string;
  index: number;
  slots?: Record<string, Record<string, unknown>>;
}) {
  const itemId = `${rootId}-loading-${index}`;
  const itemSurface = resolveSurfacePresentation({
    surfaceId: itemId,
    implementationBase: {
      display: "flex",
      gap: "sm",
      paddingY: "md",
    },
    componentSurface: slots?.loadingItem,
  });
  const avatarSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-avatar`,
    implementationBase: {
      bg: "var(--sn-color-muted, #e5e7eb)",
      opacity: 0.5,
      style: {
        width: "32px",
        height: "32px",
        borderRadius: "var(--sn-radius-full, 9999px)",
        flexShrink: 0,
      },
    },
    componentSurface: slots?.loadingAvatar,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-title`,
    implementationBase: {
      bg: "var(--sn-color-muted, #e5e7eb)",
      opacity: 0.5,
      borderRadius: "xs",
      style: {
        height: "1em",
        width: "60%",
        marginBottom: "var(--sn-spacing-xs, 4px)",
      },
    },
    componentSurface: slots?.loadingTitle,
  });
  const bodySurface = resolveSurfacePresentation({
    surfaceId: `${itemId}-body`,
    implementationBase: {
      bg: "var(--sn-color-muted, #e5e7eb)",
      opacity: 0.3,
      borderRadius: "xs",
      style: {
        height: "0.75em",
        width: "30%",
      },
    },
    componentSurface: slots?.loadingBody,
  });

  return (
    <>
      <div
        data-snapshot-id={itemId}
        className={itemSurface.className}
        style={itemSurface.style}
      >
        <div
          data-snapshot-id={`${itemId}-avatar`}
          className={avatarSurface.className}
          style={avatarSurface.style}
        />
        <div style={{ flex: 1 }}>
          <div
            data-snapshot-id={`${itemId}-title`}
            className={titleSurface.className}
            style={titleSurface.style}
          />
          <div
            data-snapshot-id={`${itemId}-body`}
            className={bodySurface.className}
            style={bodySurface.style}
          />
        </div>
      </div>
      <SurfaceStyles css={itemSurface.scopedCss} />
      <SurfaceStyles css={avatarSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={bodySurface.scopedCss} />
    </>
  );
}

// ── DetailsSection ────────────────────────────────────────────────────────────

function DetailsSection({
  rootId,
  entryId,
  details,
  slots,
}: {
  rootId: string;
  entryId: string;
  details: Record<string, unknown>;
  slots?: Record<string, Record<string, unknown>>;
}) {
  const detailsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-entry-${entryId}-details`,
    implementationBase: {
      padding: "sm",
      borderRadius: "sm",
      bg: "var(--sn-color-muted, #f1f5f9)",
      fontSize: "xs",
      style: {
        marginTop: "var(--sn-spacing-xs, 4px)",
      },
    },
    componentSurface: slots?.details,
  });
  const rowSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-entry-${entryId}-detailsRow`,
    implementationBase: {
      style: {
        marginBottom: "var(--sn-spacing-2xs, 2px)",
      },
    },
    componentSurface: slots?.detailsRow,
  });
  const keySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-entry-${entryId}-detailsKey`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #64748b)",
    },
    componentSurface: slots?.detailsKey,
  });
  const valueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-entry-${entryId}-detailsValue`,
    implementationBase: {
      color: "var(--sn-color-foreground, #0f172a)",
    },
    componentSurface: slots?.detailsValue,
  });
  const changesOldSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-entry-${entryId}-changesOld`,
    implementationBase: {
      color: "var(--sn-color-destructive, #ef4444)",
    },
    componentSurface: slots?.changesOld,
  });
  const changesNewSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-entry-${entryId}-changesNew`,
    implementationBase: {
      color: "var(--sn-color-success, #22c55e)",
    },
    componentSurface: slots?.changesNew,
  });

  const entries = Object.entries(details);
  if (entries.length === 0) return null;

  const hasOldNew = "old" in details && "new" in details;

  return (
    <>
      <div
        data-snapshot-id={`${rootId}-entry-${entryId}-details`}
        className={detailsSurface.className}
        style={detailsSurface.style}
      >
        {hasOldNew ? (
          <>
            <div
              data-snapshot-id={`${rootId}-entry-${entryId}-changesOld`}
              className={changesOldSurface.className}
              style={changesOldSurface.style}
            >
              - {JSON.stringify(details.old)}
            </div>
            <div
              data-snapshot-id={`${rootId}-entry-${entryId}-changesNew`}
              className={changesNewSurface.className}
              style={changesNewSurface.style}
            >
              + {JSON.stringify(details.new)}
            </div>
          </>
        ) : (
          entries.map(([key, value]) => (
            <div
              key={key}
              data-snapshot-id={`${rootId}-entry-${entryId}-detailsRow`}
              className={rowSurface.className}
              style={rowSurface.style}
            >
              <span
                data-snapshot-id={`${rootId}-entry-${entryId}-detailsKey`}
                className={keySurface.className}
                style={keySurface.style}
              >
                {key}:
              </span>{" "}
              <span
                data-snapshot-id={`${rootId}-entry-${entryId}-detailsValue`}
                className={valueSurface.className}
                style={valueSurface.style}
              >
                {typeof value === "object" ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))
        )}
      </div>
      <SurfaceStyles css={detailsSurface.scopedCss} />
      <SurfaceStyles css={rowSurface.scopedCss} />
      <SurfaceStyles css={keySurface.scopedCss} />
      <SurfaceStyles css={valueSurface.scopedCss} />
      <SurfaceStyles css={changesOldSurface.scopedCss} />
      <SurfaceStyles css={changesNewSurface.scopedCss} />
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone AuditLogBase — renders a filterable, paginated timeline of audit log entries
 * with user avatars, relative timestamps, and expandable detail panels. No manifest context required.
 *
 * @example
 * ```tsx
 * <AuditLogBase
 *   items={[{ user: "Jane", action: "updated record", timestamp: "2026-04-01T12:00:00Z" }]}
 *   filters={[{ field: "action", label: "Action", options: ["created", "updated", "deleted"] }]}
 *   detailsField="changes"
 *   pagination={10}
 * />
 * ```
 */
export function AuditLogBase({
  id,
  items: allItems,
  loading = false,
  error,
  userField = "user",
  actionField = "action",
  timestampField = "timestamp",
  detailsField,
  filters = [],
  pagination = 20,
  className,
  style,
  slots,
}: AuditLogBaseProps) {
  const rootId = id ?? "audit-log";
  const pageSize = pagination === false ? Infinity : pagination;

  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const filteredItems = useMemo(() => {
    let items = allItems;
    for (const [field, value] of Object.entries(activeFilters)) {
      if (value) {
        items = items.filter((item) => String(item[field] ?? "") === value);
      }
    }
    return items;
  }, [activeFilters, allItems]);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount],
  );

  const hasMore = visibleCount < filteredItems.length;

  const toggleDetails = useCallback((index: number) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const handleFilterChange = useCallback(
    (field: string, value: string) => {
      setActiveFilters((previous) => ({ ...previous, [field]: value }));
      setVisibleCount(pageSize);
    },
    [pageSize],
  );

  const loadMore = useCallback(() => {
    setVisibleCount((count: number) => count + pageSize);
  }, [pageSize]);

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {},
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const filtersSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-filters`,
    implementationBase: {
      display: "flex",
      gap: "sm",
      flexWrap: "wrap",
      style: {
        marginBottom: "var(--sn-spacing-md, 12px)",
      },
    },
    componentSurface: slots?.filters,
  });
  const errorStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-errorState`,
    implementationBase: {
      padding: "md",
      textAlign: "center",
      fontSize: "sm",
      color: "var(--sn-color-destructive, #ef4444)",
    },
    componentSurface: slots?.errorState,
  });
  const emptyStateSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-emptyState`,
    implementationBase: {
      padding: "lg",
      textAlign: "center",
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #94a3b8)",
    },
    componentSurface: slots?.emptyState,
  });
  const entriesSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-entries`,
    implementationBase: {},
    componentSurface: slots?.entries,
  });
  const loadMoreWrapperSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadMoreWrapper`,
    implementationBase: {
      padding: "md",
      textAlign: "center",
    },
    componentSurface: slots?.loadMoreWrapper,
  });
  const loadMoreButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loadMoreButton`,
    implementationBase: {
      paddingY: "sm",
      paddingX: "lg",
      borderRadius: "md",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
      bg: "var(--sn-color-card, #fff)",
      color: "var(--sn-color-foreground, #0f172a)",
      cursor: "pointer",
      fontSize: "sm",
      hover: {
        bg: "var(--sn-color-accent, var(--sn-color-muted))",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
    },
    componentSurface: slots?.loadMoreButton,
  });

  return (
    <>
      <div
        data-snapshot-component="audit-log"
        data-snapshot-id={rootId}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {filters.length > 0 ? (
          <div
            data-audit-filters
            data-snapshot-id={`${rootId}-filters`}
            className={filtersSurface.className}
            style={filtersSurface.style}
          >
            {filters.map((filter) => {
              const filterSurface = resolveSurfacePresentation({
                surfaceId: `${rootId}-filter-${filter.field}`,
                implementationBase: {
                  borderRadius: "sm",
                  border:
                    "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
                  bg: "var(--sn-color-card, #fff)",
                  color: "var(--sn-color-foreground, #0f172a)",
                  fontSize: "sm",
                  focus: {
                    ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
                  },
                  style: {
                    padding:
                      "var(--sn-spacing-xs, 4px) var(--sn-spacing-sm, 8px)",
                  },
                },
                componentSurface: slots?.filterSelect,
              });

              return (
                <div key={filter.field}>
                  <SelectControl
                    value={activeFilters[filter.field] ?? ""}
                    onChangeValue={(value) => handleFilterChange(filter.field, value)}
                    ariaLabel={filter.label}
                    surfaceId={`${rootId}-filter-${filter.field}`}
                    surfaceConfig={filterSurface.resolvedConfigForWrapper}
                  >
                    <option value="">{filter.label}</option>
                    {filter.options.map((option: string) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </SelectControl>
                </div>
              );
            })}
          </div>
        ) : null}

        {loading ? (
          <div>
            <SkeletonEntry rootId={rootId} index={0} slots={slots} />
            <SkeletonEntry rootId={rootId} index={1} slots={slots} />
            <SkeletonEntry rootId={rootId} index={2} slots={slots} />
          </div>
        ) : null}

        {error ? (
          <div
            data-audit-error
            role="alert"
            data-snapshot-id={`${rootId}-errorState`}
            className={errorStateSurface.className}
            style={errorStateSurface.style}
          >
            Error: {error.message}
          </div>
        ) : null}

        {!loading && !error && filteredItems.length === 0 ? (
          <div
            data-audit-empty
            data-snapshot-id={`${rootId}-emptyState`}
            className={emptyStateSurface.className}
            style={emptyStateSurface.style}
          >
            No log entries
          </div>
        ) : null}

        {!loading && !error ? (
          <div
            data-audit-entries
            data-snapshot-id={`${rootId}-entries`}
            className={entriesSurface.className}
            style={entriesSurface.style}
          >
            {visibleItems.map((item, index) => {
              const user = String(item[userField] ?? "");
              const action = String(item[actionField] ?? "");
              const rawTimestamp = item[timestampField];
              const timestamp = rawTimestamp
                ? new Date(String(rawTimestamp))
                : null;
              const details =
                detailsField &&
                item[detailsField] != null &&
                typeof item[detailsField] === "object"
                  ? (item[detailsField] as Record<string, unknown>)
                  : undefined;
              const isExpanded = expandedIds.has(index);
              const entryId = String(index);

              const entrySurface = resolveSurfacePresentation({
                surfaceId: `${rootId}-entry-${entryId}`,
                implementationBase: {
                  display: "flex",
                  gap: "sm",
                  paddingY: "md",
                  style: {
                    borderBottom:
                      "var(--sn-border-default, 1px) solid var(--sn-color-border, #e2e8f0)",
                    transition:
                      "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
                  },
                },
                componentSurface: slots?.entry,
              });
              const avatarSurface = resolveSurfacePresentation({
                surfaceId: `${rootId}-entry-${entryId}-avatar`,
                implementationBase: {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "xs",
                  fontWeight: "semibold",
                  color: "var(--sn-color-primary-foreground, #fff)",
                  bg: "var(--sn-color-primary, #2563eb)",
                  style: {
                    width: "32px",
                    height: "32px",
                    borderRadius: "var(--sn-radius-full, 9999px)",
                    flexShrink: 0,
                  },
                },
                componentSurface: slots?.avatar,
              });
              const contentSurface = resolveSurfacePresentation({
                surfaceId: `${rootId}-entry-${entryId}-content`,
                implementationBase: {
                  flex: "1",
                  style: {
                    minWidth: 0,
                  },
                },
                componentSurface: slots?.content,
              });
              const actionTextSurface = resolveSurfacePresentation({
                surfaceId: `${rootId}-entry-${entryId}-actionText`,
                implementationBase: {
                  fontSize: "sm",
                  color: "var(--sn-color-foreground, #0f172a)",
                },
                componentSurface: slots?.actionText,
              });
              const userNameSurface = resolveSurfacePresentation({
                surfaceId: `${rootId}-entry-${entryId}-userName`,
                implementationBase: {
                  fontWeight: "semibold",
                },
                componentSurface: slots?.userName,
              });
              const timestampSurface = resolveSurfacePresentation({
                surfaceId: `${rootId}-entry-${entryId}-timestamp`,
                implementationBase: {
                  fontSize: "xs",
                  color: "var(--sn-color-muted-foreground, #64748b)",
                  style: {
                    marginTop: "var(--sn-spacing-2xs, 2px)",
                  },
                },
                componentSurface: slots?.timestamp,
              });
              const toggleButtonSurface = resolveSurfacePresentation({
                surfaceId: `${rootId}-entry-${entryId}-toggleButton`,
                implementationBase: {
                  color: "var(--sn-color-primary, #2563eb)",
                  cursor: "pointer",
                  fontSize: "xs",
                  hover: {
                    bg: "var(--sn-color-accent, var(--sn-color-muted))",
                  },
                  focus: {
                    ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
                  },
                  style: {
                    background: "none",
                    border: "none",
                    padding: 0,
                    marginTop: "var(--sn-spacing-xs, 4px)",
                  },
                },
                componentSurface: slots?.toggleButton,
              });

              return (
                <div key={index}>
                  <div
                    data-audit-entry
                    data-snapshot-id={`${rootId}-entry-${entryId}`}
                    className={entrySurface.className}
                    style={entrySurface.style}
                  >
                    <div
                      data-audit-avatar
                      data-snapshot-id={`${rootId}-entry-${entryId}-avatar`}
                      className={avatarSurface.className}
                      style={avatarSurface.style}
                    >
                      {getInitials(user || "?")}
                    </div>
                    <div
                      data-snapshot-id={`${rootId}-entry-${entryId}-content`}
                      className={contentSurface.className}
                      style={contentSurface.style}
                    >
                      <div
                        data-snapshot-id={`${rootId}-entry-${entryId}-actionText`}
                        className={actionTextSurface.className}
                        style={actionTextSurface.style}
                      >
                        <span
                          data-snapshot-id={`${rootId}-entry-${entryId}-userName`}
                          className={userNameSurface.className}
                          style={userNameSurface.style}
                        >
                          {user}
                        </span>{" "}
                        {action}
                      </div>
                      {timestamp ? (
                        <div
                          data-snapshot-id={`${rootId}-entry-${entryId}-timestamp`}
                          className={timestampSurface.className}
                          style={timestampSurface.style}
                          title={timestamp.toLocaleString()}
                        >
                          {formatRelativeTime(timestamp, { includeTime: true })}
                        </div>
                      ) : null}
                      {details ? (
                        <>
                          <ButtonControl
                            type="button"
                            ariaExpanded={isExpanded}
                            onClick={() => toggleDetails(index)}
                            surfaceId={`${rootId}-entry-${entryId}-toggleButton`}
                            surfaceConfig={toggleButtonSurface.resolvedConfigForWrapper}
                            variant="ghost"
                            size="sm"
                          >
                            {isExpanded ? "Hide details" : "Show details"}
                          </ButtonControl>
                          {isExpanded ? (
                            <DetailsSection
                              rootId={rootId}
                              entryId={entryId}
                              details={details}
                              slots={slots}
                            />
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </div>
                  <SurfaceStyles css={entrySurface.scopedCss} />
                  <SurfaceStyles css={avatarSurface.scopedCss} />
                  <SurfaceStyles css={contentSurface.scopedCss} />
                  <SurfaceStyles css={actionTextSurface.scopedCss} />
                  <SurfaceStyles css={userNameSurface.scopedCss} />
                  <SurfaceStyles css={timestampSurface.scopedCss} />
                </div>
              );
            })}
          </div>
        ) : null}

        {hasMore && pagination !== false ? (
          <div
            data-snapshot-id={`${rootId}-loadMoreWrapper`}
            className={loadMoreWrapperSurface.className}
            style={loadMoreWrapperSurface.style}
          >
            <ButtonControl
              type="button"
              onClick={loadMore}
              surfaceId={`${rootId}-loadMoreButton`}
              surfaceConfig={loadMoreButtonSurface.resolvedConfigForWrapper}
              variant="outline"
              size="sm"
            >
              Load more
            </ButtonControl>
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={filtersSurface.scopedCss} />
      <SurfaceStyles css={errorStateSurface.scopedCss} />
      <SurfaceStyles css={emptyStateSurface.scopedCss} />
      <SurfaceStyles css={entriesSurface.scopedCss} />
      <SurfaceStyles css={loadMoreWrapperSurface.scopedCss} />
    </>
  );
}
