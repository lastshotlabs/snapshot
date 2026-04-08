import { useCallback } from "react";
import { ComponentWrapper } from "../../_base/component-wrapper";
import { useActionExecutor } from "../../../actions/executor";
import { useDetailCard } from "./hook";
import type { DetailCardConfig } from "./schema";
import type { ResolvedField } from "./types";
import type { ActionConfig } from "../../../actions/types";

/**
 * Format a value for display based on its format type.
 */
function formatValue(field: ResolvedField): React.ReactNode {
  const { value, format } = field;

  if (value == null) {
    return (
      <span style={{ color: "var(--sn-color-muted-foreground, #64748b)" }}>
        --
      </span>
    );
  }

  switch (format) {
    case "boolean":
      return (
        <span
          style={{
            color: value
              ? "var(--sn-color-success, #22c55e)"
              : "var(--sn-color-muted-foreground, #94a3b8)",
          }}
        >
          {value ? "Yes" : "No"}
        </span>
      );

    case "date":
      return (
        <span>{new Date(value as string | number).toLocaleDateString()}</span>
      );

    case "datetime":
      return <span>{new Date(value as string | number).toLocaleString()}</span>;

    case "number":
      return <span>{Number(value).toLocaleString()}</span>;

    case "currency":
      return (
        <span>
          {Number(value).toLocaleString(undefined, {
            style: "currency",
            currency: "USD",
          })}
        </span>
      );

    case "badge":
      return (
        <span
          style={{
            display: "inline-block",
            padding:
              "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
            borderRadius: "var(--sn-radius-full, 9999px)",
            backgroundColor: "var(--sn-color-secondary, #f1f5f9)",
            color: "var(--sn-color-secondary-foreground, #0f172a)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            fontWeight: 500,
          }}
        >
          {String(value)}
        </span>
      );

    case "email":
      return (
        <a
          href={`mailto:${String(value)}`}
          style={{ color: "var(--sn-color-primary, #3b82f6)" }}
        >
          {String(value)}
        </a>
      );

    case "url":
    case "link":
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--sn-color-primary, #3b82f6)" }}
        >
          {String(value)}
        </a>
      );

    case "image":
      return (
        <img
          src={String(value)}
          alt=""
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "var(--sn-radius-full, 9999px)",
            objectFit: "cover",
          }}
        />
      );

    case "list":
      if (Array.isArray(value)) {
        return <span>{value.join(", ")}</span>;
      }
      return <span>{String(value)}</span>;

    case "text":
    default:
      return <span>{String(value)}</span>;
  }
}

/**
 * Copy a value to the clipboard.
 */
async function copyToClipboard(value: unknown): Promise<void> {
  if (value != null && typeof navigator?.clipboard?.writeText === "function") {
    await navigator.clipboard.writeText(String(value));
  }
}

/**
 * DetailCard — displays a single record's fields in a key-value card layout.
 * Used in drawers, modals, and detail pages.
 *
 * Features:
 * - Fetches its own data from an endpoint or subscribes via FromRef
 * - Supports auto-detection of field types or explicit field configuration
 * - Loading skeleton, error state, and empty state
 * - Action buttons in the card header
 * - Publishes record data via id for other components to subscribe to
 * - Copyable field values
 *
 * @param props - Component props containing the DetailCard config
 *
 * @example
 * ```json
 * {
 *   "type": "detail-card",
 *   "id": "user-detail",
 *   "data": { "from": "users-table.selected" },
 *   "title": "User Details",
 *   "fields": [
 *     { "field": "name", "label": "Full Name" },
 *     { "field": "email", "format": "email", "copyable": true }
 *   ]
 * }
 * ```
 */
export function DetailCard({ config }: { config: DetailCardConfig }) {
  const { data, fields, title, isLoading, error } = useDetailCard(config);
  const execute = useActionExecutor();

  const handleAction = useCallback(
    (action: ActionConfig | ActionConfig[]) => {
      void execute(action, data ? { ...data } : {});
    },
    [execute, data],
  );

  return (
    <ComponentWrapper
      type="detail-card"
      className={config.className}
      style={config.style}
    >
      <style>{`
[data-snapshot-component="detail-card"] button:hover { background-color: var(--sn-color-secondary, #f3f4f6); }
[data-snapshot-component="detail-card"] button:focus { outline: none; }
[data-snapshot-component="detail-card"] button:focus-visible { outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb)); outline-offset: var(--sn-ring-offset, 2px); }
      `}</style>
      {isLoading ? (
        <DetailCardSkeleton />
      ) : error ? (
        <DetailCardError error={error} />
      ) : !data ? (
        <DetailCardEmpty
          message={config.emptyState ?? "Select an item to view details"}
        />
      ) : (
        <div
          style={{
            border: "var(--sn-card-border, 1px solid #e2e8f0)",
            borderRadius: "var(--sn-radius-lg, 0.5rem)",
            boxShadow: "var(--sn-card-shadow, 0 1px 3px rgba(0,0,0,0.1))",
            padding: "var(--sn-card-padding, var(--sn-spacing-lg, 1.5rem))",
            backgroundColor: "var(--sn-color-surface, #ffffff)",
          }}
        >
          {/* Header */}
          {(title || (config.actions && config.actions.length > 0)) && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--sn-spacing-md, 1rem)",
                paddingBottom: "var(--sn-spacing-sm, 0.5rem)",
                borderBottom: "1px solid var(--sn-color-border, #e2e8f0)",
              }}
            >
              {title && (
                <h3
                  style={{
                    margin: 0,
                    fontSize: "var(--sn-font-size-lg, 1.125rem)",
                    fontWeight: 600,
                    color: "var(--sn-color-foreground, #0f172a)",
                  }}
                >
                  {title}
                </h3>
              )}
              {config.actions && config.actions.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "var(--sn-spacing-xs, 0.25rem)",
                  }}
                >
                  {config.actions.map((actionDef, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAction(actionDef.action)}
                      style={{
                        padding:
                          "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                        borderRadius: "var(--sn-radius-md, 0.375rem)",
                        border: "1px solid var(--sn-color-border, #e2e8f0)",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: "var(--sn-font-size-sm, 0.875rem)",
                        color: "var(--sn-color-foreground, #0f172a)",
                      }}
                    >
                      {actionDef.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fields */}
          <dl
            style={{
              margin: 0,
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
              alignItems: "baseline",
            }}
          >
            {fields.map((field) => (
              <FieldRow key={field.field} field={field} />
            ))}
          </dl>
        </div>
      )}
    </ComponentWrapper>
  );
}

/**
 * A single key-value row in the detail card.
 */
function FieldRow({ field }: { field: ResolvedField }) {
  return (
    <>
      <dt
        style={{
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          color: "var(--sn-color-muted-foreground, #64748b)",
          fontWeight: 500,
        }}
      >
        {field.label}
      </dt>
      <dd
        style={{
          margin: 0,
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          color: "var(--sn-color-foreground, #0f172a)",
          display: "flex",
          alignItems: "center",
          gap: "var(--sn-spacing-xs, 0.25rem)",
        }}
      >
        {formatValue(field)}
        {field.copyable && (
          <button
            type="button"
            onClick={() => void copyToClipboard(field.value)}
            title="Copy to clipboard"
            data-testid={`copy-${field.field}`}
            style={{
              padding: "2px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--sn-color-muted-foreground, #64748b)",
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
            }}
          >
            Copy
          </button>
        )}
      </dd>
    </>
  );
}

/**
 * Loading skeleton for the detail card.
 */
function DetailCardSkeleton() {
  return (
    <div
      data-testid="detail-card-skeleton"
      style={{
        border: "var(--sn-card-border, 1px solid #e2e8f0)",
        borderRadius: "var(--sn-radius-lg, 0.5rem)",
        padding: "var(--sn-card-padding, var(--sn-spacing-lg, 1.5rem))",
        backgroundColor: "var(--sn-color-surface, #ffffff)",
      }}
    >
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          style={{
            display: "flex",
            gap: "var(--sn-spacing-md, 1rem)",
            marginBottom: "var(--sn-spacing-sm, 0.5rem)",
          }}
        >
          <div
            style={{
              width: "6rem",
              height: "1rem",
              borderRadius: "var(--sn-radius-sm, 0.25rem)",
              backgroundColor: "var(--sn-color-muted, #e2e8f0)",
            }}
          />
          <div
            style={{
              flex: 1,
              height: "1rem",
              borderRadius: "var(--sn-radius-sm, 0.25rem)",
              backgroundColor: "var(--sn-color-muted, #e2e8f0)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Error state for the detail card.
 */
function DetailCardError({ error }: { error: Error }) {
  return (
    <div
      role="alert"
      data-testid="detail-card-error"
      style={{
        padding: "var(--sn-spacing-md, 1rem)",
        border: "1px solid var(--sn-color-destructive, #ef4444)",
        borderRadius: "var(--sn-radius-md, 0.375rem)",
        color: "var(--sn-color-destructive, #ef4444)",
        backgroundColor:
          "color-mix(in oklch, var(--sn-color-destructive, #ef4444) 10%, var(--sn-color-card, #ffffff))",
      }}
    >
      Failed to load details: {error.message}
    </div>
  );
}

/**
 * Empty state for the detail card (e.g., no row selected).
 */
function DetailCardEmpty({ message }: { message: string }) {
  return (
    <div
      data-testid="detail-card-empty"
      style={{
        padding: "var(--sn-spacing-lg, 1.5rem)",
        textAlign: "center",
        color: "var(--sn-color-muted-foreground, #64748b)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        border: "1px dashed var(--sn-color-border, #e2e8f0)",
        borderRadius: "var(--sn-radius-lg, 0.5rem)",
      }}
    >
      {message}
    </div>
  );
}
