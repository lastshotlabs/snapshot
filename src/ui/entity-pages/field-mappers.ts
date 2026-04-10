import type { EntityFieldMeta } from "./bunshot-types";
import { formatEnumLabel } from "./utils";

/**
 * Display mapping for detail-card fields.
 */
export interface FieldDisplayConfig {
  /** Detail-card field format. */
  readonly type: "text" | "number" | "badge" | "date" | "boolean" | "list";
  /** Badge color mapping for enum values. */
  readonly variants?: Readonly<Record<string, string>>;
}

/**
 * Input mapping for AutoForm fields.
 */
export interface FieldInputConfig {
  /** AutoForm field type. */
  readonly inputType:
    | "text"
    | "number"
    | "checkbox"
    | "date"
    | "select"
    | "textarea";
  /** HTML input type hint when applicable. */
  readonly htmlType?: "text" | "number";
  /** Select options for enum fields. */
  readonly options?: readonly { readonly label: string; readonly value: string }[];
}

/**
 * Column mapping for DataTable columns.
 */
export interface FieldColumnConfig {
  /** DataTable format hint. */
  readonly columnType?: "number" | "boolean" | "date" | "badge" | "code";
  /** Badge color mapping for enum values. */
  readonly variants?: Readonly<Record<string, string>>;
  /** Alignment hint. */
  readonly align?: "left" | "center" | "right";
}

const BADGE_VARIANT_CYCLE = [
  "success",
  "warning",
  "info",
  "destructive",
  "primary",
  "secondary",
  "muted",
] as const;

/**
 * Maps an entity field to its display configuration.
 *
 * @param field - Entity field metadata.
 * @returns Display configuration for detail-card rendering.
 */
export function mapFieldToDisplay(field: EntityFieldMeta): FieldDisplayConfig {
  switch (field.type) {
    case "number":
    case "integer":
      return { type: "number" };
    case "boolean":
      return { type: "boolean" };
    case "date":
      return { type: "date" };
    case "enum":
      return {
        type: "badge",
        variants: buildBadgeVariants(field.enumValues),
      };
    case "string[]":
      return { type: "list" };
    case "json":
    case "string":
    default:
      return { type: "text" };
  }
}

/**
 * Maps an entity field to its AutoForm input configuration.
 *
 * @param field - Entity field metadata.
 * @returns Input configuration for form rendering.
 */
export function mapFieldToInput(field: EntityFieldMeta): FieldInputConfig {
  switch (field.type) {
    case "number":
    case "integer":
      return { inputType: "number", htmlType: "number" };
    case "boolean":
      return { inputType: "checkbox" };
    case "date":
      return { inputType: "date" };
    case "enum":
      return {
        inputType: "select",
        options: field.enumValues?.map((value) => ({
          label: formatEnumLabel(value),
          value,
        })),
      };
    case "json":
    case "string[]":
      return { inputType: "textarea" };
    case "string":
    default:
      return { inputType: "text", htmlType: "text" };
  }
}

/**
 * Maps an entity field to its DataTable column configuration.
 *
 * @param field - Entity field metadata.
 * @returns Column configuration for table rendering.
 */
export function mapFieldToColumn(field: EntityFieldMeta): FieldColumnConfig {
  switch (field.type) {
    case "number":
    case "integer":
      return { columnType: "number", align: "right" };
    case "boolean":
      return { columnType: "boolean", align: "center" };
    case "date":
      return { columnType: "date" };
    case "enum":
      return {
        columnType: "badge",
        variants: buildBadgeVariants(field.enumValues),
      };
    case "json":
      return { columnType: "code" };
    case "string":
    case "string[]":
    default:
      return {};
  }
}

function buildBadgeVariants(
  values: readonly string[] | undefined,
): Readonly<Record<string, string>> | undefined {
  if (!values || values.length === 0) {
    return undefined;
  }

  return Object.fromEntries(
    values.map((value, index) => [
      value,
      BADGE_VARIANT_CYCLE[index % BADGE_VARIANT_CYCLE.length]!,
    ]),
  );
}
