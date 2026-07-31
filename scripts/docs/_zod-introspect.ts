/**
 * Zod schema introspection utility for documentation generation.
 *
 * Walks a ZodType tree at runtime and produces structured field
 * descriptions suitable for rendering as markdown reference tables.
 */

import type { z } from "zod";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: unknown;
  enumValues?: string[];
  children?: SchemaField[];
}

// ── Known schema identity map ────────────────────────────────────────────────

/**
 * Map of schema instances to friendly display names. When the walker
 * encounters one of these schemas, it returns the friendly name
 * instead of expanding the full structure.
 */
const knownSchemas = new WeakMap<object, string>();

export function registerKnownSchema(schema: z.ZodType, name: string): void {
  knownSchemas.set(schema, name);
}

// ── Unwrap helpers ───────────────────────────────────────────────────────────

function unwrapEffects(schema: z.ZodType): z.ZodType {
  let s = schema;
  while ((s as any)._def?.typeName === "ZodEffects") {
    s = (s as any)._def.schema;
  }
  return s;
}

function getTypeName(schema: z.ZodType): string {
  return (schema as any)._def?.typeName ?? "Unknown";
}

function getDef(schema: z.ZodType): any {
  return (schema as any)._def;
}

// ── Type description ─────────────────────────────────────────────────────────

const MAX_DEPTH = 4;

/**
 * Produce a concise, human-readable type string for a Zod schema.
 *
 * Examples:
 *   z.string()                  → "string"
 *   z.enum(["a","b"])           → `"a" \| "b"`
 *   z.union([z.string(), ref]) → "string | FromRef"
 *   z.array(z.string())        → "string[]"
 */
export function describeType(schema: z.ZodType, depth = 0): string {
  if (depth > MAX_DEPTH) return "...";

  // Check known schema identity first
  const known = knownSchemas.get(schema);
  if (known) return known;

  const raw = unwrapEffects(schema);
  const rawKnown = knownSchemas.get(raw);
  if (rawKnown) return rawKnown;

  const tn = getTypeName(raw);
  const def = getDef(raw);

  switch (tn) {
    case "ZodString":
      return "string";
    case "ZodNumber":
      return "number";
    case "ZodBoolean":
      return "boolean";
    case "ZodNull":
      return "null";
    case "ZodUndefined":
      return "undefined";
    case "ZodAny":
    case "ZodUnknown":
      return "unknown";
    case "ZodNever":
      return "never";
    case "ZodVoid":
      return "void";

    case "ZodLiteral":
      return typeof def.value === "string"
        ? `"${def.value}"`
        : String(def.value);

    case "ZodEnum":
      return (def.values as string[]).map((v: string) => `"${v}"`).join(" | ");

    case "ZodNativeEnum":
      return "enum";

    case "ZodOptional":
      return describeType(def.innerType, depth);

    case "ZodNullable":
      return `${describeType(def.innerType, depth)} | null`;

    case "ZodDefault": {
      return describeType(def.innerType, depth);
    }

    case "ZodArray":
      return `${describeType(def.type, depth + 1)}[]`;

    case "ZodTuple":
      return `[${(def.items as z.ZodType[]).map((t) => describeType(t, depth + 1)).join(", ")}]`;

    case "ZodRecord": {
      const valType = describeType(def.valueType, depth + 1);
      return `Record<string, ${valType}>`;
    }

    case "ZodMap":
      return "Map";

    case "ZodSet":
      return "Set";

    case "ZodUnion": {
      const opts = (def.options as z.ZodType[]).map((o) =>
        describeType(o, depth + 1),
      );
      // Deduplicate (common with responsive schemas that repeat)
      const unique = [...new Set(opts)];
      return unique.join(" | ");
    }

    case "ZodDiscriminatedUnion": {
      const opts = (def.options as z.ZodType[]).map((o) =>
        describeType(o, depth + 1),
      );
      const unique = [...new Set(opts)];
      return unique.join(" | ");
    }

    case "ZodIntersection":
      return `${describeType(def.left, depth + 1)} & ${describeType(def.right, depth + 1)}`;

    case "ZodObject": {
      const shape = getObjectShape(raw);
      if (!shape) return "object";
      const keys = Object.keys(shape);
      if (keys.length === 0) return "object";
      if (keys.length <= 3 && depth < MAX_DEPTH) {
        const parts = keys.map(
          (k) => `${k}: ${describeType(shape[k], depth + 1)}`,
        );
        return `{ ${parts.join(", ")} }`;
      }
      return "object";
    }

    case "ZodLazy": {
      if (depth > 2) return "...";
      try {
        const resolved = def.getter();
        return describeType(resolved, depth + 1);
      } catch {
        return "...";
      }
    }

    case "ZodEffects":
      return describeType(def.schema, depth);

    case "ZodCatch":
      return describeType(def.innerType, depth);

    case "ZodBranded":
      return describeType(def.type, depth);

    case "ZodPipeline":
      return describeType(def.out, depth);

    case "ZodPromise":
      return `Promise<${describeType(def.type, depth + 1)}>`;

    case "ZodFunction":
      return "Function";

    case "ZodDate":
      return "Date";

    default:
      return "unknown";
  }
}

// ── Object field extraction ──────────────────────────────────────────────────

function getObjectShape(schema: z.ZodType): Record<string, z.ZodType> | null {
  const raw = unwrapEffects(schema);
  const def = getDef(raw);
  if (getTypeName(raw) !== "ZodObject") return null;
  const shape = typeof def.shape === "function" ? def.shape() : raw.shape;
  return shape ?? null;
}

function isOptional(schema: z.ZodType): boolean {
  const tn = getTypeName(schema);
  if (tn === "ZodOptional") return true;
  if (tn === "ZodDefault") return true; // has default → effectively optional
  if (tn === "ZodEffects") return isOptional(getDef(schema).schema);
  return false;
}

function getDefault(schema: z.ZodType): unknown | undefined {
  const tn = getTypeName(schema);
  if (tn === "ZodDefault") {
    try {
      return getDef(schema).defaultValue();
    } catch {
      return undefined;
    }
  }
  if (tn === "ZodOptional") return getDefault(getDef(schema).innerType);
  if (tn === "ZodEffects") return getDefault(getDef(schema).schema);
  return undefined;
}

function getEnumValues(schema: z.ZodType): string[] | undefined {
  const raw = unwrapEffects(schema);
  const tn = getTypeName(raw);
  if (tn === "ZodEnum") return getDef(raw).values;
  if (tn === "ZodOptional" || tn === "ZodDefault")
    return getEnumValues(getDef(raw).innerType);
  return undefined;
}

/**
 * Extract structured field descriptions from a ZodObject schema.
 *
 * @param schema    Any ZodType — if not an object, returns empty array.
 * @param depth     Current recursion depth (for nested objects).
 * @param exclude   Field names to skip (e.g. base component fields).
 */
export function extractFields(
  schema: z.ZodType,
  depth = 0,
  exclude?: Set<string>,
): SchemaField[] {
  if (depth > MAX_DEPTH) return [];

  // Resolve ZodLazy before extracting
  let resolved = unwrapEffects(schema);
  if (getTypeName(resolved) === "ZodLazy") {
    try {
      resolved = getDef(resolved).getter();
      resolved = unwrapEffects(resolved);
    } catch {
      return [];
    }
  }

  const shape = getObjectShape(resolved);
  if (!shape) return [];

  const fields: SchemaField[] = [];

  for (const [name, fieldSchema] of Object.entries(shape)) {
    if (exclude?.has(name)) continue;

    const field: SchemaField = {
      name,
      type: describeType(fieldSchema, depth),
      required: !isOptional(fieldSchema),
    };

    const def = getDefault(fieldSchema);
    if (def !== undefined) {
      field.defaultValue = def;
    }

    const enums = getEnumValues(fieldSchema);
    if (enums) {
      field.enumValues = enums;
    }

    // Recurse into nested objects (but not known schemas)
    const innerSchema = unwrapOptionalAndDefault(fieldSchema);
    const innerUnwrapped = unwrapEffects(innerSchema);
    if (
      getTypeName(innerUnwrapped) === "ZodObject" &&
      !knownSchemas.has(innerSchema) &&
      !knownSchemas.has(innerUnwrapped) &&
      depth < MAX_DEPTH
    ) {
      const children = extractFields(innerUnwrapped, depth + 1);
      if (children.length > 0) {
        field.children = children;
      }
    }

    fields.push(field);
  }

  return fields;
}

function unwrapOptionalAndDefault(schema: z.ZodType): z.ZodType {
  let s = schema;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    const tn = getTypeName(s);
    if (tn === "ZodOptional" || tn === "ZodDefault") {
      s = getDef(s).innerType;
    } else if (tn === "ZodEffects") {
      s = getDef(s).schema;
    } else {
      break;
    }
  }
  return s;
}

// ── Union member expansion ───────────────────────────────────────────────────

/**
 * If a schema is a union of objects (e.g. overlay types), return each
 * variant with its discriminator value and fields.
 */
export interface UnionVariant {
  discriminator: string;
  discriminatorValue: string;
  fields: SchemaField[];
}

export function extractUnionVariants(
  schema: z.ZodType,
  discriminatorField = "type",
  exclude?: Set<string>,
): UnionVariant[] | null {
  const raw = unwrapEffects(schema);
  const tn = getTypeName(raw);
  if (tn !== "ZodUnion" && tn !== "ZodDiscriminatedUnion") return null;

  const options: z.ZodType[] = getDef(raw).options;
  const variants: UnionVariant[] = [];

  for (const option of options) {
    const unwrapped = unwrapEffects(option);
    const shape = getObjectShape(unwrapped);
    if (!shape) continue;

    const discField = shape[discriminatorField];
    if (!discField) continue;

    const discInner = unwrapOptionalAndDefault(discField);
    const discTn = getTypeName(discInner);
    let value = "unknown";
    if (discTn === "ZodLiteral") {
      value = String(getDef(discInner).value);
    }

    const fields = extractFields(unwrapped, 0, exclude);
    variants.push({
      discriminator: discriminatorField,
      discriminatorValue: value,
      fields,
    });
  }

  return variants.length > 0 ? variants : null;
}

// ── Markdown formatting ──────────────────────────────────────────────────────

function escapeCell(value: string): string {
  return value
    .replace(/\|/g, "\\|")
    .replace(/\r?\n+/g, " ")
    .trim();
}

function formatDefault(value: unknown): string {
  if (value === undefined) return "—";
  if (typeof value === "string") return `\`"${value}"\``;
  if (typeof value === "boolean" || typeof value === "number")
    return `\`${value}\``;
  if (value === null) return "`null`";
  if (typeof value === "object") {
    try {
      return `\`${JSON.stringify(value)}\``;
    } catch {
      return "—";
    }
  }
  return `\`${String(value)}\``;
}

/**
 * Render a SchemaField array as a markdown table.
 */
export function fieldsToMarkdownTable(fields: SchemaField[]): string {
  if (fields.length === 0) return "";

  const lines: string[] = [];
  lines.push("| Field | Type | Default | Required |");
  lines.push("|-------|------|---------|----------|");

  for (const f of fields) {
    // Enums always show all values; other types truncate at 100 chars
    const maxLen = f.enumValues ? 200 : 100;
    const type = escapeCell(
      f.type.length > maxLen ? f.type.slice(0, maxLen - 3) + "..." : f.type,
    );
    const def = formatDefault(f.defaultValue);
    const req = f.required ? "**Yes**" : "No";
    lines.push(`| \`${f.name}\` | \`${type}\` | ${def} | ${req} |`);
  }

  return lines.join("\n");
}

/**
 * Render fields and then recursively render any nested children as
 * sub-sections under the given heading depth.
 */
export function fieldsToMarkdownSections(
  fields: SchemaField[],
  parentPath: string,
  headingLevel: number,
): string {
  const parts: string[] = [];

  // Main table
  parts.push(fieldsToMarkdownTable(fields));

  // Nested subsections
  for (const f of fields) {
    if (f.children && f.children.length > 0) {
      const path = parentPath ? `${parentPath}.${f.name}` : f.name;
      const heading = "#".repeat(Math.min(headingLevel, 6));
      parts.push("");
      parts.push(`${heading} \`${path}\``);
      parts.push("");
      parts.push(fieldsToMarkdownSections(f.children, path, headingLevel + 1));
    }
  }

  return parts.join("\n");
}
