'use client';

import { useCallback } from "react";
import { useActionExecutor } from "../../../actions/executor";
import type { ActionConfig } from "../../../actions/types";
import { renderIcon } from "../../../icons/render";
import { AutoErrorState } from "../../_base/auto-error-state";
import { ComponentWrapper } from "../../_base/component-wrapper";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { useDetailCard } from "./hook";
import type { DetailCardConfig } from "./schema";
import type { ResolvedField } from "./types";

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
            fontWeight:
              "var(--sn-font-weight-medium, 500)" as unknown as number,
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
            width: "var(--sn-spacing-3xl, 3rem)",
            height: "var(--sn-spacing-3xl, 3rem)",
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

async function copyToClipboard(value: unknown): Promise<void> {
  if (value != null && typeof navigator?.clipboard?.writeText === "function") {
    await navigator.clipboard.writeText(String(value));
  }
}

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

function DetailCardEmpty({ message }: { message: string }) {
  return (
    <div
      data-testid="detail-card-empty"
      style={{
        padding: "var(--sn-spacing-lg, 1.5rem)",
        textAlign: "center",
        color: "var(--sn-color-muted-foreground, #64748b)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        border:
          "var(--sn-border-default, 1px) dashed var(--sn-color-border, #e2e8f0)",
        borderRadius: "var(--sn-radius-lg, 0.5rem)",
      }}
    >
      {message}
    </div>
  );
}

function FieldRow({
  rootId,
  field,
  fieldIndex,
  componentSlots,
}: {
  rootId: string;
  field: ResolvedField;
  fieldIndex: number;
  componentSlots?: DetailCardConfig["slots"];
}) {
  const fieldSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field-${fieldIndex}`,
    implementationBase: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 10rem) minmax(0, 1fr)",
      alignItems: "start",
      style: {
        gap: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 1rem)",
      },
    },
    componentSurface: componentSlots?.field,
    itemSurface: field.slots?.field as Record<string, unknown> | undefined,
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
    itemSurface: field.slots?.fieldLabel as Record<string, unknown> | undefined,
  });
  const valueSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field-value-${fieldIndex}`,
    implementationBase: {
      color: "var(--sn-color-foreground, #0f172a)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      style: {
        margin: 0,
        gap: "var(--sn-spacing-xs, 0.25rem)",
      },
    },
    componentSurface: componentSlots?.fieldValue,
    itemSurface: field.slots?.fieldValue as Record<string, unknown> | undefined,
  });
  const copyButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-copy-button-${fieldIndex}`,
    implementationBase: {
      style: {
        minHeight: "1.5rem",
        padding: "0.125rem 0.375rem",
        fontSize: "var(--sn-font-size-xs, 0.75rem)",
      },
    },
    componentSurface: componentSlots?.copyButton,
    itemSurface: field.slots?.copyButton as Record<string, unknown> | undefined,
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
        {formatValue(field)}
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

/** DetailCard — data-driven detail view that resolves fields from a record resource and renders them inside a configurable card surface with formatted values, copy-to-clipboard, and header actions. */
export function DetailCard({ config }: { config: DetailCardConfig }) {
  const { data, fields, title, isLoading, error } = useDetailCard(config);
  const execute = useActionExecutor();
  const rootId = config.id ?? "detail-card";

  const panelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-panel`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "md",
      border: "var(--sn-card-border, 1px solid #e2e8f0)",
      borderRadius: "lg",
      padding: "var(--sn-card-padding, var(--sn-spacing-lg, 1.5rem))",
      style: {
        boxShadow: "var(--sn-card-shadow, 0 1px 3px rgba(0,0,0,0.1))",
        backgroundColor: "var(--sn-color-surface, #ffffff)",
      },
    },
    componentSurface: config.slots?.panel,
  });
  const headerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-header`,
    implementationBase: {
      display: "flex",
      justifyContent: "between",
      alignItems: "center",
      gap: "sm",
      style: {
        paddingBottom: "var(--sn-spacing-sm, 0.5rem)",
        borderBottom:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e2e8f0)",
      },
    },
    componentSurface: config.slots?.header,
  });
  const titleSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-title`,
    implementationBase: {
      color: "var(--sn-color-foreground, #0f172a)",
      fontSize: "var(--sn-font-size-lg, 1.125rem)",
      fontWeight: 600,
      style: { margin: 0 },
    },
    componentSurface: config.slots?.title,
  });
  const actionsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-actions`,
    implementationBase: {
      display: "flex",
      justifyContent: "end",
      flexWrap: "wrap",
      gap: "xs",
    },
    componentSurface: config.slots?.actions,
  });
  const fieldsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-fields`,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "sm",
      style: { margin: 0 },
    },
    componentSurface: config.slots?.fields,
  });
  const loadingSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading`,
    componentSurface: config.slots?.loadingState,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error`,
    componentSurface: config.slots?.errorState,
  });
  const emptySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-empty`,
    componentSurface: config.slots?.emptyState,
  });

  const handleAction = useCallback(
    (action: ActionConfig | ActionConfig[]) => {
      void execute(action, data ? { ...data } : {});
    },
    [data, execute],
  );

  return (
    <ComponentWrapper type="detail-card" id={config.id} config={config}>
      {isLoading ? (
        <div
          data-snapshot-id={`${rootId}-loading`}
          className={loadingSurface.className}
          style={loadingSurface.style}
        >
          <DetailCardSkeleton />
        </div>
      ) : error ? (
        <div
          data-testid="detail-card-error"
          data-snapshot-id={`${rootId}-error`}
          className={errorSurface.className}
          style={errorSurface.style}
        >
          <AutoErrorState config={config.error ?? {}} />
        </div>
      ) : !data ? (
        <div
          data-snapshot-id={`${rootId}-empty`}
          className={emptySurface.className}
          style={emptySurface.style}
        >
          <DetailCardEmpty
            message={config.emptyState ?? "Select an item to view details"}
          />
        </div>
      ) : (
        <div
          data-snapshot-id={`${rootId}-panel`}
          className={panelSurface.className}
          style={panelSurface.style}
        >
          {title || (config.actions && config.actions.length > 0) ? (
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
              {config.actions && config.actions.length > 0 ? (
                <div
                  data-snapshot-id={`${rootId}-actions`}
                  className={actionsSurface.className}
                  style={actionsSurface.style}
                >
                  {config.actions.map(
                    (
                      actionDef: NonNullable<DetailCardConfig["actions"]>[number],
                      index: number,
                    ) => (
                    <ButtonControl
                      key={`${actionDef.label}-${index}`}
                      surfaceId={`${rootId}-action-button-${index}`}
                      surfaceConfig={config.slots?.actionButton}
                      itemSurfaceConfig={actionDef.slots?.actionButton}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(actionDef.action)}
                    >
                      {actionDef.icon ? renderIcon(actionDef.icon, 16) : null}
                      <span>{actionDef.label}</span>
                    </ButtonControl>
                    ),
                  )}
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
                componentSlots={config.slots}
              />
            ))}
          </dl>
        </div>
      )}
      <SurfaceStyles css={panelSurface.scopedCss} />
      <SurfaceStyles css={headerSurface.scopedCss} />
      <SurfaceStyles css={titleSurface.scopedCss} />
      <SurfaceStyles css={actionsSurface.scopedCss} />
      <SurfaceStyles css={fieldsSurface.scopedCss} />
      <SurfaceStyles css={loadingSurface.scopedCss} />
      <SurfaceStyles css={errorSurface.scopedCss} />
      <SurfaceStyles css={emptySurface.scopedCss} />
    </ComponentWrapper>
  );
}
