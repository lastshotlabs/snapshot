import type { PageConfig } from "../manifest/types";
import type { EntityPageMapResult } from "./mapper";
import type {
  EntityFormPageDeclaration,
  PageLoaderResult,
  PageData,
} from "./bunshot-types";
import { mapFieldToInput } from "./field-mappers";
import {
  buildEntityApiPath,
  buildEntityRecordApiPath,
  formatFieldLabel,
  getPrimaryFieldName,
  normalizeRecordForFields,
  normalizeValueForForm,
  resolvePageTitle,
  toResultInterpolationPath,
} from "./utils";

/**
 * Maps an entity-form page declaration to Snapshot page config.
 *
 * @param result - Page loader result from bunshot.
 * @returns Snapshot page config, resources, state, and overlays.
 */
export function mapEntityFormPage(
  result: PageLoaderResult,
): EntityPageMapResult {
  const declaration =
    result.declaration.declaration as EntityFormPageDeclaration;
  const meta = result.entityMeta[declaration.entity];
  const isEdit = declaration.operation === "update";
  const existingItem = isEdit
    ? (result.data as Extract<PageData, { type: "form-edit" }>).item
    : null;
  const defaults = !isEdit
    ? (result.data as Extract<PageData, { type: "form-create" }>).defaults
    : {};
  const apiPath = buildEntityApiPath(declaration.entity);
  const primaryField = getPrimaryFieldName(meta);

  const content: Array<Record<string, unknown>> = [
    {
      type: "row",
      justify: declaration.cancel ? "between" : "start",
      align: "center",
      children: [
        {
          type: "heading",
          level: 1,
          text: resolvePageTitle(declaration.title, existingItem),
        },
        ...(declaration.cancel
          ? [
              {
                type: "button",
                label: "Cancel",
                variant: "ghost",
                action: {
                  type: "navigate",
                  to: declaration.cancel.to,
                },
              },
            ]
          : []),
      ],
    },
  ];

  const fields = declaration.fields.map((fieldName) => {
    const fieldMeta = meta?.fields[fieldName];
    const override = declaration.fieldConfig?.[fieldName];
    const inputConfig = fieldMeta
      ? mapFieldToInput(fieldMeta)
      : { inputType: "text" as const };
    const resolvedType = resolveFormFieldType(
      override?.inputType,
      inputConfig.inputType,
    );
    const fieldConfig: Record<string, unknown> = {
      name: fieldName,
      label: override?.label ?? formatFieldLabel(fieldName),
      type: resolvedType,
      required: fieldMeta ? !fieldMeta.optional : true,
      disabled: override?.readOnly ?? Boolean(fieldMeta?.immutable && isEdit),
    };

    if (override?.placeholder) {
      fieldConfig.placeholder = override.placeholder;
    }

    if (override?.helpText) {
      fieldConfig.helperText = override.helpText;
    }

    if (inputConfig.options) {
      fieldConfig.options = inputConfig.options;
    }

    const defaultValue =
      !isEdit && override?.defaultValue !== undefined
        ? override.defaultValue
        : !isEdit && defaults[fieldName] !== undefined
          ? normalizeValueForForm(fieldMeta, defaults[fieldName])
          : undefined;

    if (defaultValue !== undefined) {
      fieldConfig.default = defaultValue;
    }

    return fieldConfig;
  });

  const onSuccess = declaration.redirect
    ? {
        type: "navigate",
        to: toResultInterpolationPath(declaration.redirect.to),
      }
    : {
        type: "toast",
        message: `${declaration.entity} ${isEdit ? "updated" : "created"} successfully.`,
        variant: "success",
      };

  const submitTarget =
    isEdit && existingItem
      ? buildEntityRecordApiPath(declaration.entity, existingItem, primaryField)
      : apiPath;

  content.push({
    type: "form",
    id: `${declaration.entity.toLowerCase()}-form`,
    ...(isEdit ? { data: { from: "entityPageData.item" } } : undefined),
    submit: submitTarget,
    method: isEdit ? "PATCH" : "POST",
    fields,
    submitLabel: isEdit
      ? `Update ${declaration.entity}`
      : `Create ${declaration.entity}`,
    onSuccess,
    onError: {
      type: "toast",
      message: `Failed to ${isEdit ? "update" : "create"} ${declaration.entity.toLowerCase()}.`,
      variant: "error",
    },
  });

  return {
    page: {
      title: resolvePageTitle(declaration.title, existingItem),
      content: content as PageConfig["content"],
    },
    resources: {},
    state:
      isEdit && existingItem
        ? {
            entityPageData: {
              scope: "route",
              default: {
                item: normalizeRecordForFields(
                  existingItem,
                  declaration.fields,
                  meta,
                  "form",
                ),
              },
            },
          }
        : {},
    overlays: {},
  };
}

function resolveFormFieldType(
  overrideType: string | undefined,
  fallbackType:
    | "text"
    | "number"
    | "checkbox"
    | "date"
    | "select"
    | "textarea",
): "text" | "email" | "password" | "number" | "textarea" | "select" | "checkbox" | "date" | "file" {
  switch (overrideType) {
    case "email":
    case "password":
    case "file":
    case "text":
    case "number":
    case "textarea":
    case "select":
    case "checkbox":
    case "date":
      return overrideType;
    case "switch":
      return "checkbox";
    case "datetime":
      return "date";
    case "tag-selector":
      return "textarea";
    case "input":
      return "text";
    default:
      return fallbackType;
  }
}
