import React, { useState, useMemo, useCallback } from "react";
import { useComponentData } from "../../_base/use-component-data";
import { useSubscribe } from "../../../context/hooks";
import { formatRelativeTime, getInitials } from "../../_base/utils";
import type { AuditLogConfig } from "./types";

// ── Skeleton ───────────────────────────────────────────────────────────────

function SkeletonEntry() {
  return (
    <div
      data-audit-skeleton
      style={{
        display: "flex",
        gap: "var(--sn-spacing-sm, 8px)",
        padding: "var(--sn-spacing-md, 12px) 0",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "var(--sn-radius-full, 9999px)",
          backgroundColor: "var(--sn-color-muted, #e5e7eb)",
          opacity: 0.5,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: "1em",
            width: "60%",
            borderRadius: "var(--sn-radius-xs, 2px)",
            backgroundColor: "var(--sn-color-muted, #e5e7eb)",
            opacity: 0.5,
            marginBottom: "var(--sn-spacing-xs, 4px)",
          }}
        />
        <div
          style={{
            height: "0.75em",
            width: "30%",
            borderRadius: "var(--sn-radius-xs, 2px)",
            backgroundColor: "var(--sn-color-muted, #e5e7eb)",
            opacity: 0.3,
          }}
        />
      </div>
    </div>
  );
}

// ── Details renderer ───────────────────────────────────────────────────────

function DetailsSection({ details }: { details: Record<string, unknown> }) {
  const entries = Object.entries(details);
  if (entries.length === 0) return null;

  // Check if it's a before/after changes format
  const record = details;
  const hasOldNew = "old" in record && "new" in record;

  if (hasOldNew) {
    return (
      <div
        data-audit-changes
        style={{
          fontSize: "var(--sn-font-size-xs, 0.75rem)",
          padding: "var(--sn-spacing-sm, 8px)",
          backgroundColor: "var(--sn-color-muted, #f1f5f9)",
          borderRadius: "var(--sn-radius-sm, 4px)",
          marginTop: "var(--sn-spacing-xs, 4px)",
        }}
      >
        <div style={{ color: "var(--sn-color-destructive, #ef4444)" }}>
          - {JSON.stringify(record["old"])}
        </div>
        <div style={{ color: "var(--sn-color-success, #22c55e)" }}>
          + {JSON.stringify(record["new"])}
        </div>
      </div>
    );
  }

  return (
    <div
      data-audit-details
      style={{
        fontSize: "var(--sn-font-size-xs, 0.75rem)",
        padding: "var(--sn-spacing-sm, 8px)",
        backgroundColor: "var(--sn-color-muted, #f1f5f9)",
        borderRadius: "var(--sn-radius-sm, 4px)",
        marginTop: "var(--sn-spacing-xs, 4px)",
      }}
    >
      {entries.map(([key, value]) => (
        <div key={key} style={{ marginBottom: "2px" }}>
          <span
            style={{
              color: "var(--sn-color-muted-foreground, #64748b)",
            }}
          >
            {key}:
          </span>{" "}
          <span style={{ color: "var(--sn-color-foreground, #0f172a)" }}>
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

/**
 * Config-driven AuditLog component.
 *
 * Renders a vertical list of log entries with user avatars, relative
 * timestamps, collapsible details, filter dropdowns, and pagination.
 *
 * @param props - Component props containing the AuditLog configuration
 */
export function AuditLog({ config }: { config: AuditLogConfig }) {
  const { data, isLoading, error } = useComponentData(config.data, undefined);
  const visible = useSubscribe(config.visible ?? true);

  const userField = config.userField ?? "user";
  const actionField = config.actionField ?? "action";
  const timestampField = config.timestampField ?? "timestamp";

  // Filter state
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    {},
  );

  // Expanded details state
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Pagination state
  const pageSize = useMemo(() => {
    if (config.pagination === false) return Infinity;
    if (typeof config.pagination === "object")
      return config.pagination.pageSize;
    return 20;
  }, [config.pagination]);

  const [visibleCount, setVisibleCount] = useState(pageSize);

  // Extract items
  const allItems: Record<string, unknown>[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    for (const key of ["data", "items", "results", "entries", "logs"]) {
      if (Array.isArray(data[key]))
        return data[key] as Record<string, unknown>[];
    }
    return [];
  }, [data]);

  // Filter items
  const filteredItems = useMemo(() => {
    let items = allItems;
    for (const [field, value] of Object.entries(activeFilters)) {
      if (value) {
        items = items.filter((item) => String(item[field] ?? "") === value);
      }
    }
    return items;
  }, [allItems, activeFilters]);

  // Paginated items
  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount],
  );

  const hasMore = visibleCount < filteredItems.length;

  const toggleDetails = useCallback((idx: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }, []);

  const handleFilterChange = useCallback(
    (field: string, value: string) => {
      setActiveFilters((prev) => ({ ...prev, [field]: value }));
      setVisibleCount(pageSize);
    },
    [pageSize],
  );

  const loadMore = useCallback(() => {
    setVisibleCount((c) => c + pageSize);
  }, [pageSize]);

  if (visible === false) return null;

  return (
    <div
      data-snapshot-component="audit-log"
      className={config.className}
      style={{
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      {/* Filter bar */}
      {config.filters && config.filters.length > 0 && (
        <div
          data-audit-filters
          style={{
            display: "flex",
            gap: "var(--sn-spacing-sm, 8px)",
            marginBottom: "var(--sn-spacing-md, 12px)",
            flexWrap: "wrap",
          }}
        >
          {config.filters.map((filter) => (
            <select
              key={filter.field}
              value={activeFilters[filter.field] ?? ""}
              onChange={(e) => handleFilterChange(filter.field, e.target.value)}
              aria-label={filter.label}
              style={{
                padding: "var(--sn-spacing-xs, 4px) var(--sn-spacing-sm, 8px)",
                borderRadius: "var(--sn-radius-sm, 4px)",
                border: "1px solid var(--sn-color-border, #d1d5db)",
                backgroundColor: "var(--sn-color-card, #fff)",
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
                color: "var(--sn-color-foreground, #0f172a)",
              }}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div>
          <SkeletonEntry />
          <SkeletonEntry />
          <SkeletonEntry />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          data-audit-error
          role="alert"
          style={{
            padding: "var(--sn-spacing-md, 12px)",
            color: "var(--sn-color-destructive, #ef4444)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            textAlign: "center",
          }}
        >
          Error: {error.message}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredItems.length === 0 && (
        <div
          data-audit-empty
          style={{
            padding: "var(--sn-spacing-lg, 16px)",
            color: "var(--sn-color-muted-foreground, #94a3b8)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            textAlign: "center",
          }}
        >
          No log entries
        </div>
      )}

      {/* Entries */}
      {!isLoading && !error && (
        <div data-audit-entries>
          {visibleItems.map((item, idx) => {
            const user = String(item[userField] ?? "");
            const action = String(item[actionField] ?? "");
            const rawTimestamp = item[timestampField];
            const timestamp = rawTimestamp
              ? new Date(String(rawTimestamp))
              : null;
            const details: Record<string, unknown> | undefined =
              config.detailsField &&
              item[config.detailsField] != null &&
              typeof item[config.detailsField] === "object"
                ? (item[config.detailsField] as Record<string, unknown>)
                : undefined;
            const isExpanded = expandedIds.has(idx);

            return (
              <div
                key={idx}
                data-audit-entry
                style={{
                  display: "flex",
                  gap: "var(--sn-spacing-sm, 8px)",
                  padding: "var(--sn-spacing-md, 12px) 0",
                  borderBottom: "1px solid var(--sn-color-border, #e2e8f0)",
                  transition:
                    "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
                }}
              >
                {/* Avatar */}
                <div
                  data-audit-avatar
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "var(--sn-radius-full, 9999px)",
                    backgroundColor: "var(--sn-color-primary, #2563eb)",
                    color: "var(--sn-color-primary-foreground, #fff)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "var(--sn-font-size-xs, 0.75rem)",
                    fontWeight:
                      "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
                    flexShrink: 0,
                  }}
                >
                  {getInitials(user || "?")}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Action text */}
                  <div
                    style={{
                      fontSize: "var(--sn-font-size-sm, 0.875rem)",
                      color: "var(--sn-color-foreground, #0f172a)",
                    }}
                  >
                    <span
                      style={{
                        fontWeight:
                          "var(--sn-font-weight-semibold, 600)" as React.CSSProperties["fontWeight"],
                      }}
                    >
                      {user}
                    </span>{" "}
                    {action}
                  </div>

                  {/* Timestamp */}
                  {timestamp && (
                    <div
                      style={{
                        fontSize: "var(--sn-font-size-xs, 0.75rem)",
                        color: "var(--sn-color-muted-foreground, #64748b)",
                        marginTop: "2px",
                      }}
                      title={timestamp.toLocaleString()}
                    >
                      {formatRelativeTime(timestamp, { includeTime: true })}
                    </div>
                  )}

                  {/* Expandable details */}
                  {details && (
                    <>
                      <button
                        data-audit-toggle
                        aria-expanded={isExpanded}
                        onClick={() => toggleDetails(idx)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          fontSize: "var(--sn-font-size-xs, 0.75rem)",
                          color: "var(--sn-color-primary, #2563eb)",
                          marginTop: "var(--sn-spacing-xs, 4px)",
                        }}
                      >
                        {isExpanded ? "Hide details" : "Show details"}
                      </button>

                      {isExpanded && <DetailsSection details={details} />}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load more */}
      {hasMore && config.pagination !== false && (
        <div
          style={{
            textAlign: "center",
            padding: "var(--sn-spacing-md, 12px)",
          }}
        >
          <button
            data-audit-load-more
            onClick={loadMore}
            style={{
              padding: "var(--sn-spacing-sm, 8px) var(--sn-spacing-lg, 16px)",
              borderRadius: "var(--sn-radius-md, 6px)",
              border: "1px solid var(--sn-color-border, #d1d5db)",
              backgroundColor: "var(--sn-color-card, #fff)",
              cursor: "pointer",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-foreground, #0f172a)",
            }}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
