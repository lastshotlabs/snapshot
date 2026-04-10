import type { PageConfig } from "../manifest/types";
import type { EntityPageMapResult } from "./mapper";
import type {
  EntityListPageDeclaration,
  PageLoaderResult,
  PageData,
} from "./bunshot-types";
import { mapFieldToColumn } from "./field-mappers";
import {
  buildEntityApiPath,
  buildFilterOptionsFromItems,
  formatFieldLabel,
  normalizeRecordForFields,
  resolvePageTitle,
} from "./utils";

/**
 * Maps an entity-list page declaration to Snapshot page config.
 *
 * @param result - Page loader result from bunshot.
 * @returns Snapshot page config, resources, state, and overlays.
 */
export function mapEntityListPage(
  result: PageLoaderResult,
): EntityPageMapResult {
  const declaration = result.declaration
    .declaration as EntityListPageDeclaration;
  const meta = result.entityMeta[declaration.entity];
  const data = result.data as Extract<PageData, { type: "list" }>;
  const resourceKey = `${declaration.entity.toLowerCase()}-list`;
  const apiPath = buildEntityApiPath(declaration.entity);
  const tableId = `${declaration.entity.toLowerCase()}-table`;
  const normalizedItems = data.items.map((item) =>
    normalizeRecordForFields(item, declaration.fields, meta, "display"),
  );

  const content: Array<Record<string, unknown>> = [];
  const headerChildren: Array<Record<string, unknown>> = [
    {
      type: "heading",
      level: 1,
      text: resolvePageTitle(declaration.title, null),
    },
  ];

  if (declaration.actions?.create) {
    headerChildren.push({
      type: "button",
      label: "Create",
      variant: "default",
      action: {
        type: "navigate",
        to: declaration.actions.create,
      },
    });
  }

  content.push({
    type: "row",
    justify: "between",
    align: "center",
    children: headerChildren,
  });

  if (
    declaration.searchable ||
    (declaration.filters != null && declaration.filters.length > 0)
  ) {
    content.push({
      type: "filter-bar",
      id: `${declaration.entity.toLowerCase()}-filters`,
      showSearch: declaration.searchable ?? false,
      searchPlaceholder: declaration.searchable
        ? `Search ${declaration.entity.toLowerCase()}...`
        : undefined,
      filters: (declaration.filters ?? []).map((filterConfig) => {
        const fieldMeta = meta?.fields[filterConfig.field];
        const options =
          fieldMeta?.type === "enum" && fieldMeta.enumValues
            ? fieldMeta.enumValues.map((value) => ({
                label: formatFieldLabel(value),
                value,
              }))
            : fieldMeta?.type === "boolean"
              ? [
                  { label: "Yes", value: "true" },
                  { label: "No", value: "false" },
                ]
              : buildFilterOptionsFromItems(data.items, filterConfig.field);

        return {
          key: filterConfig.field,
          label: filterConfig.label ?? formatFieldLabel(filterConfig.field),
          options,
          multiple: filterConfig.operator === "in",
        };
      }),
    });
  }

  const columns = declaration.fields.map((fieldName) => {
    const fieldMeta = meta?.fields[fieldName];
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

  const tableConfig: Record<string, unknown> = {
    type: "data-table",
    id: tableId,
    data: { from: "entityPageData.items" },
    columns,
    pagination: {
      type: "offset",
      pageSize: data.pageSize,
    },
    searchable: declaration.searchable ? true : undefined,
    emptyMessage: `No ${declaration.entity.toLowerCase()} records found.`,
  };

  if (declaration.rowClick) {
    tableConfig.rowClickAction = {
      type: "navigate",
      to: declaration.rowClick,
    };
  }

  if (declaration.actions?.bulkDelete) {
    tableConfig.selectable = true;
    tableConfig.bulkActions = [
      {
        label: "Delete {count}",
        action: [
          {
            type: "confirm",
            message: `Delete selected ${declaration.entity.toLowerCase()} records?`,
            confirmLabel: "Delete",
            variant: "destructive",
          },
          {
            type: "api",
            method: "DELETE",
            endpoint: `${apiPath}/batch`,
            body: { ids: { from: "selectedIds" } },
            invalidates: [resourceKey],
            onSuccess: {
              type: "toast",
              message: `${declaration.entity} records deleted.`,
              variant: "success",
            },
            onError: {
              type: "toast",
              message: `Failed to delete ${declaration.entity.toLowerCase()} records.`,
              variant: "error",
            },
          },
        ],
      },
    ];
  }

  content.push(tableConfig);

  return {
    page: {
      title: resolvePageTitle(declaration.title, null),
      content: content as PageConfig["content"],
    },
    resources: {
      [resourceKey]: {
        method: "GET",
        endpoint: apiPath,
        params: {
          page: 1,
          pageSize: declaration.pageSize ?? data.pageSize,
          ...(declaration.defaultSort
            ? {
                sort: declaration.defaultSort.field,
                order: declaration.defaultSort.order,
              }
            : {}),
        },
      },
    },
    state: {
      entityPageData: {
        scope: "route",
        default: {
          items: normalizedItems,
          total: data.total,
          page: data.page,
          pageSize: data.pageSize,
        },
      },
    },
    overlays: {},
  };
}
