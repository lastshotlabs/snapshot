import type { PageConfig, ResourceConfigMap } from "../manifest/types";
import type { EntityPageMapResult } from "./mapper";
import type {
  EntityDetailPageDeclaration,
  PageLoaderResult,
  PageData,
} from "./bunshot-types";
import { mapFieldToColumn, mapFieldToDisplay } from "./field-mappers";
import {
  buildEntityApiPath,
  buildEntityRecordApiPath,
  formatFieldLabel,
  getPrimaryFieldName,
  normalizeRecordForFields,
  resolvePageTitle,
} from "./utils";

/**
 * Maps an entity-detail page declaration to Snapshot page config.
 *
 * @param result - Page loader result from bunshot.
 * @returns Snapshot page config, resources, state, and overlays.
 */
export function mapEntityDetailPage(
  result: PageLoaderResult,
): EntityPageMapResult {
  const declaration = result.declaration
    .declaration as EntityDetailPageDeclaration;
  const meta = result.entityMeta[declaration.entity];
  const data = result.data as Extract<PageData, { type: "detail" }>;
  const item = data.item;
  const primaryField = getPrimaryFieldName(meta);
  const content: Array<Record<string, unknown>> = [];
  const resources: ResourceConfigMap = {};
  const actionButtons: Array<Record<string, unknown>> = [];

  if (declaration.actions?.back) {
    actionButtons.push({
      type: "button",
      label: "Back",
      variant: "ghost",
      action: {
        type: "navigate",
        to: declaration.actions.back,
      },
    });
  }

  if (declaration.actions?.edit) {
    actionButtons.push({
      type: "button",
      label: "Edit",
      variant: "secondary",
      action: {
        type: "navigate",
        to: declaration.actions.edit,
      },
    });
  }

  if (declaration.actions?.delete) {
    actionButtons.push({
      type: "button",
      label: "Delete",
      variant: "destructive",
      action: [
        {
          type: "confirm",
          message: `Delete this ${declaration.entity.toLowerCase()}?`,
          confirmLabel: "Delete",
          variant: "destructive",
        },
        {
          type: "api",
          method: "DELETE",
          endpoint: buildEntityRecordApiPath(
            declaration.entity,
            item,
            primaryField,
          ),
          onSuccess: declaration.actions.back
            ? {
                type: "navigate",
                to: declaration.actions.back,
              }
            : {
                type: "toast",
                message: `${declaration.entity} deleted.`,
                variant: "success",
              },
          onError: {
            type: "toast",
            message: `Failed to delete ${declaration.entity.toLowerCase()}.`,
            variant: "error",
          },
        },
      ],
    });
  }

  content.push({
    type: "row",
    justify: "between",
    align: "center",
    children: [
      {
        type: "heading",
        level: 1,
        text: resolvePageTitle(declaration.title, item),
      },
      ...(actionButtons.length > 0
        ? [
            {
              type: "row",
              gap: "sm",
              children: actionButtons,
            },
          ]
        : []),
    ],
  });

  const sections =
    declaration.sections ??
    (declaration.fields
      ? [{ fields: declaration.fields }]
      : [
          {
            fields: Object.entries(meta?.fields ?? {})
              .filter(([, fieldMeta]) => !fieldMeta.primary)
              .map(([fieldName]) => fieldName),
          },
        ]);

  for (const section of sections) {
    if (section.label) {
      content.push({
        type: "heading",
        level: 2,
        text: section.label,
      });
    }

    content.push({
      type: "detail-card",
      data: { from: "entityPageData.item" },
      fields: section.fields.map((fieldName) => {
        const fieldMeta = meta?.fields[fieldName];
        const displayConfig = fieldMeta
          ? mapFieldToDisplay(fieldMeta)
          : { type: "text" as const };
        return {
          field: fieldName,
          label: formatFieldLabel(fieldName),
          format: displayConfig.type,
          copyable: fieldMeta?.primary === true || fieldMeta?.type === "string",
        };
      }),
    });
  }

  for (const related of declaration.related ?? []) {
    const relatedMeta = result.entityMeta[related.entity];
    const relatedResourceKey = `related-${related.entity.toLowerCase()}`;
    const relatedPrimaryField = getPrimaryFieldName(relatedMeta);
    const relatedColumns = related.fields.map((fieldName) => {
      const fieldMeta = relatedMeta?.fields[fieldName];
      const columnConfig = fieldMeta ? mapFieldToColumn(fieldMeta) : {};
      return {
        field: fieldName,
        label: formatFieldLabel(fieldName),
        sortable: true,
        ...(columnConfig.columnType
          ? { format: columnConfig.columnType }
          : undefined),
        ...(columnConfig.variants
          ? { badgeColors: columnConfig.variants }
          : undefined),
        ...(columnConfig.align ? { align: columnConfig.align } : undefined),
      };
    });

    content.push({
      type: "heading",
      level: 2,
      text: related.label ?? formatFieldLabel(related.entity),
    });
    content.push({
      type: "data-table",
      id: `${related.entity.toLowerCase()}-related-table`,
      data: { resource: relatedResourceKey },
      columns: relatedColumns,
      pagination: false,
      searchable: false,
      emptyMessage: `No related ${related.entity.toLowerCase()} records.`,
      rowClickAction: {
        type: "navigate",
        to: `${buildEntityApiPath(related.entity)}/{${relatedPrimaryField}}`,
      },
      density: "compact",
    });

    resources[relatedResourceKey] = {
      method: "GET",
      endpoint: buildEntityApiPath(related.entity),
      params: {
        [related.foreignKey]: String(item[primaryField] ?? ""),
        limit: related.limit ?? 10,
      },
    };
  }

  return {
    page: {
      title: resolvePageTitle(declaration.title, item),
      content: content as PageConfig["content"],
    },
    resources,
    state: {
      entityPageData: {
        scope: "route",
        default: {
          item: normalizeRecordForFields(
            item,
            Object.keys(meta?.fields ?? item),
            meta,
            "display",
          ),
        },
      },
    },
    overlays: {},
  };
}
