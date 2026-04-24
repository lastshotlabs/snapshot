'use client';

import React, { useCallback } from "react";
import type { CSSProperties, ReactNode } from "react";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DetailCardBaseField {
  /** Data field key in the record. */
  field: string;
  /** Display label for this field. */
  label: string;
  /** The field value to render. */
  value: unknown;
  /** Display format for the value. */
  format?: "text" | "boolean" | "date" | "datetime" | "number" | "currency" | "badge" | "email" | "url" | "link" | "image" | "list";
  /** Whether the value can be copied to clipboard. */
  copyable?: boolean;
  /** Divisor for currency formatting (e.g. 100 for cents-to-dollars). */
  divisor?: number;
  /** Slot overrides for this field's sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

export interface DetailCardBaseAction {
  /** Action button label. */
  label: string;
  /** Optional icon name. */
  icon?: string;
  /** Callback when the action button is clicked. */
  onAction: () => void;
  /** Slot overrides for this action's sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Standalone Props ────���─────────────────────────────────────────────────────

export interface DetailCardBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Record data to display (null = empty state). */
  data: Record<string, unknown> | null;
  /** Fields to display. */
  fields: DetailCardBaseField[];
  /** Card title. */
  title?: string;
  /** Header actions. */
  actions?: DetailCardBaseAction[];
  /** Whether data is loading. */
  isLoading?: boolean;
  /** Error message or node. */
  error?: ReactNode;
  /** Empty state message. */
  emptyMessage?: string;
  /** Custom loading content. */
  loadingContent?: ReactNode;

  // ── Style / Slot overrides ────────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (panel, header, title, actions, fields, field, fieldLabel, fieldValue). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Helpers ─────��─────────────────────────────────────────────────────────────

async function copyToClipboard(value: unknown): Promise<void> {
  if (value != null && typeof navigator?.clipboard?.writeText === "function") {
    await navigator.clipboard.writeText(String(value));
  }
}

function FormattedFieldValue({
  rootId,
  field,
  fieldIndex,
  componentSlots,
}: {
  rootId: string;
  field: DetailCardBaseField;
  fieldIndex: number;
  componentSlots?: Record<string, Record<string, unknown>>;
}) {
  const { value, format } = field;
  const fieldSlots = field.slots;
  const emptyValueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field-empty-value-${fieldIndex}`,
    implementationBase: { color: "var(--sn-color-muted-foreground, #64748b)" },
    componentSurface: componentSlots?.emptyValue,
    itemSurface: fieldSlots?.emptyValue,
  });
  const booleanValueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field-boolean-value-${fieldIndex}`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #94a3b8)",
      states: { active: { color: "var(--sn-color-success, #22c55e)" } },
    },
    componentSurface: componentSlots?.booleanValue,
    itemSurface: fieldSlots?.booleanValue,
    activeStates: value ? ["active"] : [],
  });
  const badgeValueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field-badge-value-${fieldIndex}`,
    implementationBase: {
      display: "inline-block",
      padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
      borderRadius: "var(--sn-radius-full, 9999px)",
      bg: "var(--sn-color-secondary, #f1f5f9)",
      color: "var(--sn-color-secondary-foreground, #0f172a)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      fontWeight: "var(--sn-font-weight-medium, 500)",
    },
    componentSurface: componentSlots?.badgeValue,
    itemSurface: fieldSlots?.badgeValue,
  });
  const linkValueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field-link-value-${fieldIndex}`,
    implementationBase: { color: "var(--sn-color-primary, #3b82f6)" },
    componentSurface: componentSlots?.linkValue,
    itemSurface: fieldSlots?.linkValue,
  });
  const imageValueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field-image-value-${fieldIndex}`,
    implementationBase: {
      display: "block",
      width: "var(--sn-spacing-3xl, 3rem)",
      height: "var(--sn-spacing-3xl, 3rem)",
      borderRadius: "var(--sn-radius-full, 9999px)",
      style: { objectFit: "cover" },
    },
    componentSurface: componentSlots?.imageValue,
    itemSurface: fieldSlots?.imageValue,
  });

  let content: React.ReactNode = null;

  if (value != null) {
    switch (format) {
      case "boolean":
        content = (
          <span
            data-snapshot-id={`${rootId}-field-boolean-value-${fieldIndex}`}
            className={booleanValueSurface.className}
            style={booleanValueSurface.style}
          >
            {value ? "Yes" : "No"}
          </span>
        );
        break;
      case "date":
        content = <span>{new Date(value as string | number).toLocaleDateString()}</span>;
        break;
      case "datetime":
        content = <span>{new Date(value as string | number).toLocaleString()}</span>;
        break;
      case "number":
        content = <span>{Number(value).toLocaleString()}</span>;
        break;
      case "currency": {
        const divisor = field.divisor;
        const adjusted = divisor && divisor !== 1 ? Number(value) / divisor : Number(value);
        content = (
          <span>
            {adjusted.toLocaleString(undefined, { style: "currency", currency: "USD" })}
          </span>
        );
        break;
      }
      case "badge":
        content = (
          <span
            data-snapshot-id={`${rootId}-field-badge-value-${fieldIndex}`}
            className={badgeValueSurface.className}
            style={badgeValueSurface.style}
          >
            {String(value)}
          </span>
        );
        break;
      case "email":
        content = (
          <a
            href={`mailto:${String(value)}`}
            data-snapshot-id={`${rootId}-field-link-value-${fieldIndex}`}
            className={linkValueSurface.className}
            style={linkValueSurface.style}
          >
            {String(value)}
          </a>
        );
        break;
      case "url":
      case "link":
        content = (
          <a
            href={String(value)}
            target="_blank"
            rel="noopener noreferrer"
            data-snapshot-id={`${rootId}-field-link-value-${fieldIndex}`}
            className={linkValueSurface.className}
            style={linkValueSurface.style}
          >
            {String(value)}
          </a>
        );
        break;
      case "image":
        content = (
          <img
            src={String(value)}
            alt=""
            data-snapshot-id={`${rootId}-field-image-value-${fieldIndex}`}
            className={imageValueSurface.className}
            style={imageValueSurface.style}
          />
        );
        break;
      case "list":
        content = Array.isArray(value)
          ? <span>{value.join(", ")}</span>
          : <span>{String(value)}</span>;
        break;
      case "text":
      default:
        content = Array.isArray(value)
          ? <span>{value.map((e) => String(e)).join(", ")}</span>
          : <span>{String(value)}</span>;
        break;
    }
  }

  return (
    <>
      {value == null ? (
        <span
          data-snapshot-id={`${rootId}-field-empty-value-${fieldIndex}`}
          className={emptyValueSurface.className}
          style={emptyValueSurface.style}
        >
          --
        </span>
      ) : (
        content
      )}
      <SurfaceStyles css={emptyValueSurface.scopedCss} />
      <SurfaceStyles css={booleanValueSurface.scopedCss} />
      <SurfaceStyles css={badgeValueSurface.scopedCss} />
      <SurfaceStyles css={linkValueSurface.scopedCss} />
      <SurfaceStyles css={imageValueSurface.scopedCss} />
    </>
  );
}

function FieldRow({
  rootId,
  field,
  fieldIndex,
  componentSlots,
}: {
  rootId: string;
  field: DetailCardBaseField;
  fieldIndex: number;
  componentSlots?: Record<string, Record<string, unknown>>;
}) {
  const fieldSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field-${fieldIndex}`,
    implementationBase: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 10rem) minmax(0, 1fr)",
      alignItems: "start",
      style: { gap: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)" },
    },
    componentSurface: componentSlots?.field,
    itemSurface: field.slots?.field,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field-label-${fieldIndex}`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #64748b)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      fontWeight: 500,
      style: { margin: 0 },
    },
    componentSurface: componentSlots?.fieldLabel,
    itemSurface: field.slots?.fieldLabel,
  });
  const valueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field-value-${fieldIndex}`,
    implementationBase: {
      color: "var(--sn-color-foreground, #0f172a)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      style: { margin: 0, gap: "var(--sn-spacing-xs, 0.25rem)" },
    },
    componentSurface: componentSlots?.fieldValue,
    itemSurface: field.slots?.fieldValue,
  });
  const copyButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-copy-button-${fieldIndex}`,
    implementationBase: {
      style: { minHeight: "1.5rem", padding: "0.125rem 0.375rem", fontSize: "var(--sn-font-size-xs, 0.75rem)" },
    },
    componentSurface: componentSlots?.copyButton,
    itemSurface: field.slots?.copyButton,
  });

  return (
    <div
      data-snapshot-id={`${rootId}-field-${fieldIndex}`}
      className={fieldSurface.className}
      style={fieldSurface.style}
    >
      <dt
        data-snapshot-id={`${rootId}-field-label-${fieldIndex}`}
        className={labelSurface.className}
        style={labelSurface.style}
      >
        {field.label}
      </dt>
      <dd
        data-snapshot-id={`${rootId}-field-value-${fieldIndex}`}
        className={valueSurface.className}
        style={valueSurface.style}
      >
        <FormattedFieldValue
          rootId={rootId}
          field={field}
          fieldIndex={fieldIndex}
          componentSlots={componentSlots}
        />
        {field.copyable ? (
          <ButtonControl
            surfaceId={`${rootId}-copy-button-${fieldIndex}`}
            surfaceConfig={copyButtonSurface.resolvedConfigForWrapper}
            variant="ghost"
            size="sm"
            testId={`copy-${field.field}`}
            onClick={() => void copyToClipboard(field.value)}
            ariaLabel={`Copy ${field.label}`}
          >
            Copy
          </ButtonControl>
        ) : null}
      </dd>
      <SurfaceStyles css={fieldSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={valueSurface.scopedCss} />
      <SurfaceStyles css={copyButtonSurface.scopedCss} />
    </div>
  );
}

function DetailCardSkeleton({
  rootId,
  componentSlots,
}: {
  rootId: string;
  componentSlots?: Record<string, Record<string, unknown>>;
}) {
  const skeletonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-skeleton`,
    implementationBase: {
      border: "var(--sn-card-border, 1px solid #e2e8f0)",
      borderRadius: "lg",
      padding: "var(--sn-card-padding, var(--sn-spacing-lg, 1.5rem))",
      bg: "var(--sn-color-surface, #ffffff)",
    },
    componentSurface: componentSlots?.skeleton,
  });
  const skeletonRowSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-skeleton-row`,
    implementationBase: { display: "flex", gap: "md", style: { marginBottom: "var(--sn-spacing-sm, 0.5rem)" } },
    componentSurface: componentSlots?.skeletonRow,
  });
  const skeletonLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-skeleton-label`,
    implementationBase: { width: "6rem", height: "1rem", borderRadius: "sm", bg: "var(--sn-color-muted, #e2e8f0)" },
    componentSurface: componentSlots?.skeletonLabel,
  });
  const skeletonValueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-skeleton-value`,
    implementationBase: { flex: "1", height: "1rem", borderRadius: "sm", bg: "var(--sn-color-muted, #e2e8f0)" },
    componentSurface: componentSlots?.skeletonValue,
  });

  return (
    <div
      data-testid="detail-card-skeleton"
      data-snapshot-id={`${rootId}-skeleton`}
      className={skeletonSurface.className}
      style={skeletonSurface.style}
    >
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          data-snapshot-id={`${rootId}-skeleton-row-${n}`}
          className={skeletonRowSurface.className}
          style={skeletonRowSurface.style}
        >
          <div
            data-snapshot-id={`${rootId}-skeleton-label-${n}`}
            className={skeletonLabelSurface.className}
            style={skeletonLabelSurface.style}
          />
          <div
            data-snapshot-id={`${rootId}-skeleton-value-${n}`}
            className={skeletonValueSurface.className}
            style={skeletonValueSurface.style}
          />
        </div>
      ))}
      <SurfaceStyles css={skeletonSurface.scopedCss} />
      <SurfaceStyles css={skeletonRowSurface.scopedCss} />
      <SurfaceStyles css={skeletonLabelSurface.scopedCss} />
      <SurfaceStyles css={skeletonValueSurface.scopedCss} />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone DetailCard — data-driven detail view with formatted fields
 * and header actions. No manifest context required.
 *
 * @example
 * ```tsx
 * <DetailCardBase
 *   title="Order Details"
 *   data={{ id: "ORD-123", status: "shipped", total: 4999 }}
 *   fields={[
 *     { field: "id", label: "Order ID", value: "ORD-123", copyable: true },
 *     { field: "status", label: "Status", value: "shipped", format: "badge" },
 *     { field: "total", label: "Total", value: 4999, format: "currency", divisor: 100 },
 *   ]}
 *   actions={[{ label: "Edit", icon: "pencil", onAction: () => {} }]}
 * />
 * ```
 */
export function DetailCardBase({
  id,
  data,
  fields,
  title,
  actions,
  isLoading = false,
  error,
  emptyMessage = "Select an item to view details",
  loadingContent,
  className,
  style,
  slots,
}: DetailCardBaseProps) {
  const rootId = id ?? "detail-card";

  const panelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-panel`,
    implementationBase: {
      display: "flex", flexDirection: "column", gap: "md",
      border: "var(--sn-card-border, 1px solid #e2e8f0)", borderRadius: "lg",
      padding: "var(--sn-card-padding, var(--sn-spacing-lg, 1.5rem))",
      style: { boxShadow: "var(--sn-card-shadow, 0 1px 3px rgba(0,0,0,0.1))", backgroundColor: "var(--sn-color-surface, #ffffff)" },
    },
    componentSurface: slots?.panel,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex", justifyContent: "between", alignItems: "center", gap: "sm",
      style: { paddingBottom: "var(--sn-spacing-sm, 0.5rem)", borderBottom: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e2e8f0)" },
    },
    componentSurface: slots?.header,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      color: "var(--sn-color-foreground, #0f172a)", fontSize: "var(--sn-font-size-lg, 1.125rem)", fontWeight: 600,
      style: { margin: 0 },
    },
    componentSurface: slots?.title,
  });
  const actionsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-actions`,
    implementationBase: { display: "flex", justifyContent: "end", flexWrap: "wrap", gap: "xs" },
    componentSurface: slots?.actions,
  });
  const fieldsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-fields`,
    implementationBase: { display: "flex", flexDirection: "column", gap: "sm", style: { margin: 0 } },
    componentSurface: slots?.fields,
  });
  const loadingSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading`,
    componentSurface: slots?.loadingState,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error`,
    componentSurface: slots?.errorState,
  });
  const emptySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-empty`,
    componentSurface: slots?.emptyState,
  });

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {},
    componentSurface: className || style ? { className, style } : undefined,
  });

  return (
    <div
      data-snapshot-component="detail-card"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {isLoading ? (
        <div
          data-snapshot-id={`${rootId}-loading`}
          data-testid="detail-card-loading"
          className={loadingSurface.className}
          style={loadingSurface.style}
        >
          {loadingContent ?? <DetailCardSkeleton rootId={rootId} componentSlots={slots} />}
        </div>
      ) : error ? (
        <div
          data-testid="detail-card-error"
          data-snapshot-id={`${rootId}-error`}
          className={errorSurface.className}
          style={errorSurface.style}
        >
          {error}
        </div>
      ) : !data ? (
        <div
          data-testid="detail-card-empty"
          data-snapshot-id={`${rootId}-empty`}
          className={emptySurface.className}
          style={emptySurface.style}
        >
          {emptyMessage}
        </div>
      ) : (
        <div
          data-snapshot-id={`${rootId}-panel`}
          className={panelSurface.className}
          style={panelSurface.style}
        >
          {title || (actions && actions.length > 0) ? (
            <div
              data-snapshot-id={`${rootId}-header`}
              className={headerSurface.className}
              style={headerSurface.style}
            >
              {title ? (
                <h3
                  data-snapshot-id={`${rootId}-title`}
                  className={titleSurface.className}
                  style={titleSurface.style}
                >
                  {title}
                </h3>
              ) : <span />}
              {actions && actions.length > 0 ? (
                <div
                  data-snapshot-id={`${rootId}-actions`}
                  className={actionsSurface.className}
                  style={actionsSurface.style}
                >
                  {actions.map((actionDef, index) => (
                    <ButtonControl
                      key={`${actionDef.label || "action"}-${index}`}
                      surfaceId={`${rootId}-action-button-${index}`}
                      surfaceConfig={slots?.actionButton}
                      itemSurfaceConfig={actionDef.slots?.actionButton}
                      variant="outline"
                      size="sm"
                      onClick={actionDef.onAction}
                    >
                      {actionDef.icon ? renderIcon(actionDef.icon, 16) : null}
                      <span>{actionDef.label}</span>
                    </ButtonControl>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <dl
            data-snapshot-id={`${rootId}-fields`}
            className={fieldsSurface.className}
            style={fieldsSurface.style}
          >
            {fields.map((field, index) => (
              <FieldRow
                key={field.field}
                rootId={rootId}
                fieldIndex={index}
                field={field}
                componentSlots={slots}
              />
            ))}
          </dl>
        </div>
      )}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={panelSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={actionsSurface.scopedCss} />
      <SurfaceStyles css={fieldsSurface.scopedCss} />
      <SurfaceStyles css={loadingSurface.scopedCss} />
      <SurfaceStyles css={errorSurface.scopedCss} />
      <SurfaceStyles css={emptySurface.scopedCss} />
    </div>
  );
}
