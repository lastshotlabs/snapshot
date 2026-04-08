import React from "react";
import { useActionExecutor } from "../../../actions/executor";
import type { BreadcrumbConfig, BreadcrumbItemConfig } from "./types";

/** Separator character lookup. */
const SEPARATORS: Record<string, string> = {
  slash: "/",
  chevron: "\u203A", // ›
  dot: "\u00B7", // ·
  arrow: "\u2192", // →
};

/**
 * Computes the visible items when maxItems is set.
 * Shows the first item, an ellipsis placeholder, and the last (maxItems - 1) items.
 */
function collapseItems(
  items: BreadcrumbItemConfig[],
  maxItems: number,
): Array<BreadcrumbItemConfig | { label: "..."; collapsed: true }> {
  if (items.length <= maxItems) return items;

  const tail = items.slice(-(maxItems - 1));
  return [items[0]!, { label: "...", collapsed: true } as never, ...tail];
}

/**
 * Breadcrumb component — renders a navigation breadcrumb trail.
 *
 * Shows the user's current location within the application hierarchy.
 * The last item is rendered as non-interactive (current page).
 * Supports collapsing middle items when maxItems is exceeded.
 *
 * @param props.config - The breadcrumb config from the manifest
 */
export function BreadcrumbComponent({ config }: { config: BreadcrumbConfig }) {
  const execute = useActionExecutor();
  const separator = SEPARATORS[config.separator ?? "chevron"] ?? "\u203A";

  const visibleItems =
    config.maxItems != null
      ? collapseItems(config.items, config.maxItems)
      : config.items;

  return (
    <nav
      aria-label="Breadcrumb"
      data-snapshot-component="breadcrumb"
      data-testid="breadcrumb"
      className={config.className}
      style={{
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      <style>{`
        [data-snapshot-component="breadcrumb"] a:focus {
          outline: none;
        }
        [data-snapshot-component="breadcrumb"] a:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
          border-radius: var(--sn-radius-sm, 0.25rem);
        }
      `}</style>
      <ol
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sn-spacing-xs, 0.25rem)",
          listStyle: "none",
          margin: 0,
          padding: 0,
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          flexWrap: "wrap",
        }}
      >
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const isCollapsed = "collapsed" in item;

          return (
            <li
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sn-spacing-xs, 0.25rem)",
              }}
            >
              {/* Separator (before every item except the first) */}
              {index > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    color: "var(--sn-color-muted-foreground, #9ca3af)",
                    userSelect: "none",
                  }}
                >
                  {separator}
                </span>
              )}

              {isCollapsed ? (
                <span
                  style={{
                    color: "var(--sn-color-muted-foreground, #9ca3af)",
                  }}
                >
                  ...
                </span>
              ) : isLast ? (
                /* Current page — not a link */
                <span
                  aria-current="page"
                  style={{
                    color: "var(--sn-color-foreground, #111827)",
                    fontWeight:
                      "var(--sn-font-weight-medium, 500)" as unknown as number,
                  }}
                >
                  {item.icon && (
                    <span
                      aria-hidden="true"
                      style={{
                        marginRight: "var(--sn-spacing-xs, 0.25rem)",
                      }}
                    >
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </span>
              ) : (
                /* Clickable breadcrumb item */
                <a
                  href={(item as BreadcrumbItemConfig).path ?? "#"}
                  onClick={(e) => {
                    if (config.action) {
                      e.preventDefault();
                      void execute(config.action);
                    }
                  }}
                  style={{
                    color: "var(--sn-color-muted-foreground, #6b7280)",
                    textDecoration: "none",
                    cursor: "pointer",
                    transition: `color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--sn-color-foreground, #111827)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--sn-color-muted-foreground, #6b7280)";
                  }}
                >
                  {(item as BreadcrumbItemConfig).icon && (
                    <span
                      aria-hidden="true"
                      style={{
                        marginRight: "var(--sn-spacing-xs, 0.25rem)",
                      }}
                    >
                      {(item as BreadcrumbItemConfig).icon}
                    </span>
                  )}
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
