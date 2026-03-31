import { useMemo } from "react";
import type { ApiClient } from "../../api/client";
import { token } from "../../tokens/utils";
import { useDataSource } from "../data-binding";
import type { FeedConfig } from "./feed.schema";

interface FeedProps {
  config: FeedConfig;
  api: ApiClient;
  id?: string;
}

/**
 * Config-driven activity feed — displays a list of items with title,
 * description, timestamp, and optional avatar.
 */
export function Feed({ config, api }: FeedProps) {
  const { data, isLoading, isError } = useDataSource(api, {
    source: config.data,
  });

  const items = useMemo(() => {
    if (!data) return [];
    const arr = Array.isArray(data)
      ? (data as Record<string, unknown>[])
      : typeof data === "object" && "data" in (data as Record<string, unknown>)
        ? ((data as Record<string, unknown>).data as Record<string, unknown>[])
        : [];
    return config.limit ? arr.slice(0, config.limit) : arr;
  }, [data, config.limit]);

  if (isLoading) {
    return (
      <div style={{ padding: token("spacing.4"), color: token("colors.muted-foreground") }}>
        Loading...
      </div>
    );
  }

  if (isError || items.length === 0) {
    return (
      <div style={{ padding: token("spacing.4"), color: token("colors.muted-foreground") }}>
        {config.emptyState ?? "No items"}
      </div>
    );
  }

  const titleField = config.titleField ?? "title";
  const descField = config.descriptionField ?? "description";
  const timeField = config.timestampField ?? "createdAt";
  const avatarField = config.avatarField;

  return (
    <div className={config.className}>
      {items.map((item, i) => (
        <div
          key={(item.id as string) ?? i}
          style={{
            display: "flex",
            gap: token("spacing.3"),
            padding: `${token("spacing.3")} 0`,
            borderBottom: i < items.length - 1 ? `1px solid ${token("colors.border")}` : undefined,
          }}
        >
          {avatarField && item[avatarField] && (
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: token("radius.full"),
                backgroundColor: token("colors.muted"),
                backgroundImage: `url(${item[avatarField]})`,
                backgroundSize: "cover",
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: token("typography.fontSize.sm"),
                fontWeight: token("typography.fontWeight.medium"),
                color: token("colors.foreground"),
              }}
            >
              {String(item[titleField] ?? "")}
            </div>
            {item[descField] && (
              <div
                style={{
                  fontSize: token("typography.fontSize.xs"),
                  color: token("colors.muted-foreground"),
                  marginTop: token("spacing.0.5"),
                }}
              >
                {String(item[descField])}
              </div>
            )}
          </div>
          {item[timeField] && (
            <div
              style={{
                fontSize: token("typography.fontSize.xs"),
                color: token("colors.muted-foreground"),
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {formatRelativeTime(item[timeField] as string | number)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function formatRelativeTime(timestamp: string | number): string {
  const date = new Date(timestamp);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
