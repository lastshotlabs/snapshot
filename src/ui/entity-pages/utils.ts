import type {
  EntityFieldMeta,
  EntityMeta,
  PageDeclarationBase,
  PageTitleField,
  PageTitleTemplate,
} from "./bunshot-types";

/**
 * Converts a field or enum token into a readable label.
 *
 * @param name - Field or enum token.
 * @returns Humanized label text.
 */
export function formatFieldLabel(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Formats an enum token for display.
 *
 * @param value - Raw enum value.
 * @returns Humanized enum label.
 */
export function formatEnumLabel(value: string): string {
  return formatFieldLabel(value.toLowerCase());
}

/**
 * Builds the conventional entity collection API path.
 *
 * @param entityName - Entity name from the declaration.
 * @returns Conventional entity collection path.
 */
export function buildEntityApiPath(entityName: string): string {
  const lower = entityName.toLowerCase();
  if (lower.endsWith("s")) {
    return `/${lower}`;
  }
  if (lower.endsWith("y")) {
    return `/${lower.slice(0, -1)}ies`;
  }
  return `/${lower}s`;
}

/**
 * Builds the conventional entity record API path.
 *
 * @param entityName - Entity name from the declaration.
 * @param record - Loaded entity record.
 * @param primaryField - Primary key field name.
 * @returns Conventional entity record path.
 */
export function buildEntityRecordApiPath(
  entityName: string,
  record: Readonly<Record<string, unknown>>,
  primaryField = "id",
): string {
  const id = record[primaryField];
  if (id === undefined || id === null || id === "") {
    throw new Error(
      `[snapshot] Record for "${entityName}" has no "${primaryField}" value.`,
    );
  }
  return `${buildEntityApiPath(entityName)}/${encodeURIComponent(String(id))}`;
}

/**
 * Resolves a bunshot page title declaration against an optional record.
 *
 * @param title - Static, field-based, or template title declaration.
 * @param item - Optional loaded entity record.
 * @returns Resolved title string.
 */
export function resolvePageTitle(
  title: PageDeclarationBase["title"],
  item: Readonly<Record<string, unknown>> | null,
): string {
  if (typeof title === "string") {
    return title;
  }

  if (isFieldTitle(title)) {
    return item != null ? String(item[title.field] ?? "") : "";
  }

  return item != null
    ? title.template.replace(/\{(\w+)\}/g, (_match, key: string) =>
        String(item[key] ?? ""),
      )
    : title.template;
}

/**
 * Converts a redirect template such as `/posts/{id}` into the action executor's
 * result-aware interpolation shape (`/posts/{result.id}`).
 *
 * @param path - Redirect path template.
 * @returns Path template suitable for action interpolation.
 */
export function toResultInterpolationPath(path: string): string {
  return path.replace(/\{(\w+)\}/g, "{result.$1}");
}

/**
 * Returns the primary key field name for an entity.
 *
 * @param meta - Entity metadata.
 * @returns Primary key field name, defaulting to `id`.
 */
export function getPrimaryFieldName(meta?: EntityMeta): string {
  if (!meta) {
    return "id";
  }

  for (const [fieldName, fieldMeta] of Object.entries(meta.fields)) {
    if (fieldMeta.primary) {
      return fieldName;
    }
  }

  return "id";
}

/**
 * Normalizes a field value for display-oriented components.
 *
 * @param field - Entity field metadata.
 * @param value - Raw record value.
 * @returns Display-safe field value.
 */
export function normalizeValueForDisplay(
  field: EntityFieldMeta | undefined,
  value: unknown,
): unknown {
  if (!field || value == null) {
    return value;
  }

  switch (field.type) {
    case "json":
      return typeof value === "string" ? value : JSON.stringify(value, null, 2);
    case "string[]":
      return Array.isArray(value) ? value.map(String) : value;
    default:
      return value;
  }
}

/**
 * Normalizes a field value for AutoForm inputs.
 *
 * @param field - Entity field metadata.
 * @param value - Raw record value.
 * @returns Form-safe default value.
 */
export function normalizeValueForForm(
  field: EntityFieldMeta | undefined,
  value: unknown,
): unknown {
  if (!field || value == null) {
    return value;
  }

  switch (field.type) {
    case "json":
      return typeof value === "string" ? value : JSON.stringify(value, null, 2);
    case "string[]":
      return Array.isArray(value) ? value.join(", ") : value;
    default:
      return value;
  }
}

/**
 * Normalizes a record for a subset of known entity fields.
 *
 * @param record - Raw record to normalize.
 * @param fields - Field names to include.
 * @param meta - Entity metadata used for per-field normalization.
 * @param mode - Normalization mode.
 * @returns Normalized record.
 */
export function normalizeRecordForFields(
  record: Readonly<Record<string, unknown>>,
  fields: readonly string[],
  meta: EntityMeta | undefined,
  mode: "display" | "form",
): Record<string, unknown> {
  return Object.fromEntries(
    fields.map((fieldName) => {
      const fieldMeta = meta?.fields[fieldName];
      const value = record[fieldName];
      return [
        fieldName,
        mode === "form"
          ? normalizeValueForForm(fieldMeta, value)
          : normalizeValueForDisplay(fieldMeta, value),
      ];
    }),
  );
}

/**
 * Builds filter dropdown options from loaded rows.
 *
 * @param items - Loaded rows.
 * @param fieldName - Field to inspect.
 * @returns Unique filter options.
 */
export function buildFilterOptionsFromItems(
  items: readonly Readonly<Record<string, unknown>>[],
  fieldName: string,
): Array<{ label: string; value: string }> {
  const values = new Set<string>();

  for (const item of items) {
    const raw = item[fieldName];
    if (Array.isArray(raw)) {
      for (const entry of raw) {
        if (entry != null) {
          values.add(String(entry));
        }
      }
      continue;
    }

    if (raw != null && raw !== "") {
      values.add(String(raw));
    }
  }

  return [...values]
    .sort((left, right) => left.localeCompare(right))
    .map((value) => ({
      label: formatEnumLabel(value),
      value,
    }));
}

/**
 * Picks a plausible timestamp field for feed rendering.
 *
 * @param fields - Candidate field names.
 * @returns Timestamp field name if present.
 */
export function inferTimestampField(
  fields: readonly string[],
): string | undefined {
  const preferred = ["createdAt", "updatedAt", "timestamp", "date"];
  return preferred.find((field) => fields.includes(field));
}

function isFieldTitle(
  title: PageDeclarationBase["title"],
): title is PageTitleField {
  return typeof title === "object" && title !== null && "field" in title;
}

/**
 * Returns true when a title declaration is a template-based title.
 *
 * @param title - Title declaration.
 * @returns Whether the title is template-based.
 */
export function isTemplateTitle(
  title: PageDeclarationBase["title"],
): title is PageTitleTemplate {
  return typeof title === "object" && title !== null && "template" in title;
}
