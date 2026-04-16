/**
 * Shared manifest schema generator.
 *
 * Extracts the core generation logic from the build script so that consumer
 * apps can call `generateManifestSchema({ plugins, outPath })` to get a
 * schema that includes their custom component types.
 *
 * Pipeline:
 *   1. zodToJsonSchema with $refStrategy "root"  → no warnings, clean $ref
 *   2. resolveAtRiskRefs                          → inline only the $refs
 *      whose targets will be invalidated by step 3
 *   3. replaceComponentConfigs                    → swap component config
 *      placeholders with the discriminated union
 *   4. injectIconEnums                            → inject icon enum values
 *   5. JSON.stringify                             → write to disk
 *
 * Steps 1-2 guarantee that no $ref target is invalidated by step 3.
 * The remaining $refs stay compact and valid.
 */

import { writeFileSync } from "node:fs";
import { zodToJsonSchema } from "zod-to-json-schema";

import {
  manifestConfigSchema,
  getRegisteredSchemas,
} from "./ui/manifest/schema";
import type { SnapshotPlugin } from "./plugin";
import { registerComponentSchema } from "./ui/manifest/schema";
import { registerComponent } from "./ui/manifest/component-registry";
import { bootBuiltins } from "./ui/manifest/boot-builtins";

// ── Component config field names that hold component configs ────────────────
const COMPONENT_ARRAY_FIELDS = new Set([
  "content",
  "children",
  "items",
  "template",
  "fallback",
]);

const COMPONENT_SINGLE_FIELDS = new Set([
  "trigger",
  "render",
  "loading",
  "error",
  "notFound",
  "offline",
]);

const ALL_COMPONENT_FIELDS = new Set([
  ...COMPONENT_ARRAY_FIELDS,
  ...COMPONENT_SINGLE_FIELDS,
]);
const COMPONENT_UNION_DEFINITION = "SnapshotComponentConfig";

const MAX_DEPTH = 80;

interface GenerateOptions {
  plugins?: SnapshotPlugin[];
  outPath: string;
  iconNames?: string[];
}

// ── Per-component $ref resolution ───────────────────────────────────────────

/**
 * Generate a single component's JSON Schema as a named root definition.
 *
 * Emitting components this way keeps recursive action/workflow structures
 * compact and valid. The manifest schema later hoists these definitions into
 * its own `definitions` bag and builds the discriminated union from shared
 * `$ref` pointers instead of duplicating every component schema.
 */
function generateComponentSchema(
  zodSchema: import("zod").ZodType,
  definitionName: string,
): Record<string, unknown> {
  return zodToJsonSchema(zodSchema, {
    $refStrategy: "root",
    name: definitionName,
    errorMessages: false,
  }) as Record<string, unknown>;
}

// ── Manifest-level targeted $ref resolution ─────────────────────────────────

/**
 * Check whether a JSON Pointer path goes through a component config field
 * that replaceComponentConfigs will restructure.
 *
 * Example: `#/properties/app/properties/loading/anyOf/0`
 *   → "loading" is in COMPONENT_SINGLE_FIELDS → at risk → true
 *
 * Example: `#/properties/action/anyOf/0`
 *   → "action" is NOT a component config field → safe → false
 */
function refTargetIsAtRisk(refPath: string): boolean {
  const parts = refPath.replace(/^#\//, "").split("/");
  for (let i = 0; i < parts.length - 1; i++) {
    if (parts[i] === "properties" && ALL_COMPONENT_FIELDS.has(parts[i + 1]!)) {
      return true;
    }
  }
  return false;
}

/**
 * Pre-resolve $ref pointers whose targets will be invalidated by
 * replaceComponentConfigs. Only these refs are inlined; all others stay
 * as compact $ref pointers.
 *
 * Also breaks JS object sharing from zodToJsonSchema by serializing/parsing
 * the tree first, so downstream WeakSet/identity-based traversals work
 * correctly.
 */
function resolveAtRiskRefs(
  rawSchema: Record<string, unknown>,
): Record<string, unknown> {
  // Break JS object sharing / potential cycles from zodToJsonSchema
  const seen = new WeakSet<object>();
  const str = JSON.stringify(rawSchema, (_key, value: unknown) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return undefined;
      seen.add(value);
    }
    return value;
  });
  const root = JSON.parse(str) as Record<string, unknown>;

  // Navigate a JSON Pointer path in the root tree
  function navigatePath(pointer: string): unknown {
    if (pointer === "#") return root;
    const parts = pointer
      .replace(/^#\//, "")
      .split("/")
      .map((p) => p.replace(/~1/g, "/").replace(/~0/g, "~"));
    let current: unknown = root;
    for (const part of parts) {
      if (current == null || typeof current !== "object") return undefined;
      if (Array.isArray(current)) {
        current = current[parseInt(part, 10)];
      } else {
        current = (current as Record<string, unknown>)[part];
      }
    }
    return current;
  }

  const resolving = new Set<string>();

  function walk(node: unknown, depth: number): unknown {
    if (depth > MAX_DEPTH || node == null || typeof node !== "object")
      return node;
    if (Array.isArray(node))
      return node.map((item) => walk(item, depth + 1));

    const obj = node as Record<string, unknown>;

    if (typeof obj["$ref"] === "string") {
      const ref = obj["$ref"] as string;

      // Safe ref — leave it as a pointer
      if (!refTargetIsAtRisk(ref)) return obj;

      // At-risk ref — inline the target
      if (resolving.has(ref)) return {};
      const target = navigatePath(ref);
      if (target != null && typeof target === "object") {
        resolving.add(ref);
        const resolved = walk(
          JSON.parse(JSON.stringify(target)),
          depth + 1,
        );
        resolving.delete(ref);
        return resolved;
      }
      return {};
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = walk(value, depth + 1);
    }
    return result;
  }

  return walk(root, 0) as Record<string, unknown>;
}

// ── Component union builder ─────────────────────────────────────────────────

function toDefinitionName(typeName: string): string {
  return `SnapshotComponent_${typeName.replace(/[^a-zA-Z0-9_]/g, "_")}`;
}

function buildComponentUnion(
  iconNames: string[],
): { schema: Record<string, unknown>; definitions: Record<string, unknown> } | null {
  const registeredSchemas = getRegisteredSchemas();
  if (registeredSchemas.size === 0) {
    return null;
  }

  const componentRefs: Record<string, unknown>[] = [];
  const componentDefinitions: Record<string, unknown> = {};

  for (const [typeName, zodSchema] of registeredSchemas) {
    try {
      const definitionName = toDefinitionName(typeName);
      const jsonSchema = generateComponentSchema(zodSchema, definitionName);
      const definitions =
        (jsonSchema["definitions"] as Record<string, unknown> | undefined) ?? {};
      const rootDefinition = definitions[definitionName];
      if (!rootDefinition || typeof rootDefinition !== "object") {
        continue;
      }
      const componentSchema = rootDefinition as Record<string, unknown>;

      // Ensure type is set to const for discriminator
      const properties =
        (componentSchema["properties"] as Record<string, unknown>) ?? {};
      properties["type"] = { type: "string", const: typeName };
      componentSchema["properties"] = properties;

      // Inject icon enum on icon fields
      if (iconNames.length > 0 && properties["icon"]) {
        const iconProp = properties["icon"] as Record<string, unknown>;
        if (iconProp["type"] === "string" && !iconProp["enum"]) {
          properties["icon"] = {
            ...iconProp,
            type: "string" as const,
            enum: [...iconNames],
          };
        }
      }

      componentDefinitions[definitionName] = componentSchema;
      componentRefs.push({
        $ref: `#/definitions/${definitionName}`,
      });
    } catch {
      if (
        typeof process !== "undefined" &&
        process.env?.["NODE_ENV"] !== "production"
      ) {
        console.warn(
          `[snapshot] Skipping schema generation for component "${typeName}"`,
        );
      }
    }
  }

  if (componentRefs.length === 0) {
    return null;
  }

  return {
    schema: {
      oneOf: componentRefs,
      discriminator: { propertyName: "type" },
    },
    definitions: componentDefinitions,
  };
}

function installComponentUnionDefinition(
  rootSchema: Record<string, unknown>,
  union: Record<string, unknown>,
  componentDefinitions: Record<string, unknown>,
): Record<string, unknown> {
  const definitions =
    (rootSchema["definitions"] as Record<string, unknown> | undefined) ?? {};
  for (const [definitionName, definition] of Object.entries(componentDefinitions)) {
    definitions[definitionName] = definition;
  }
  definitions[COMPONENT_UNION_DEFINITION] = union;
  rootSchema["definitions"] = definitions;
  return {
    $ref: `#/definitions/${COMPONENT_UNION_DEFINITION}`,
  };
}

// ── Post-processing ─────────────────────────────────────────────────────────

/**
 * Walk the schema tree and replace generic component config placeholders
 * with the discriminated component union.
 *
 * After injecting a union at a node, the traversal skips that subtree.
 * The injected union contains field names like "content" and "children"
 * (they describe the schema of those fields), but they must NOT be replaced
 * again — they are schema descriptions, not component config placeholders.
 */
function replaceComponentConfigs(
  node: unknown,
  componentConfigRef: Record<string, unknown>,
  depth: number = 0,
): void {
  if (depth > MAX_DEPTH) return;
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((item) =>
      replaceComponentConfigs(item, componentConfigRef, depth + 1),
    );
    return;
  }

  const obj = node as Record<string, unknown>;
  const properties = obj["properties"] as Record<string, unknown> | undefined;

  if (properties) {
    for (const [key, value] of Object.entries(properties)) {
      if (!value || typeof value !== "object") continue;
      const prop = value as Record<string, unknown>;

      // Array fields that hold component configs
      if (COMPONENT_ARRAY_FIELDS.has(key)) {
        if (prop["type"] === "array" && prop["items"]) {
          const items = prop["items"] as Record<string, unknown>;
          if (
            items["type"] === "object" ||
            items["anyOf"] ||
            items["allOf"] ||
            items["additionalProperties"] !== undefined
          ) {
            prop["items"] = { ...componentConfigRef };
          }
        }
      }

      // Single fields that hold a component config
      if (COMPONENT_SINGLE_FIELDS.has(key)) {
        if (
          prop["type"] === "object" ||
          prop["anyOf"] ||
          prop["allOf"] ||
          prop["additionalProperties"] !== undefined
        ) {
          properties[key] = { ...componentConfigRef };
        }
      }
    }
  }
  for (const val of Object.values(obj)) {
    replaceComponentConfigs(val, componentConfigRef, depth + 1);
  }
}

function injectIconEnums(
  node: unknown,
  iconEnum: Record<string, unknown>,
  depth: number = 0,
): void {
  if (depth > MAX_DEPTH) return;
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((item) => injectIconEnums(item, iconEnum, depth + 1));
    return;
  }
  const obj = node as Record<string, unknown>;

  if (obj["icon"] && typeof obj["icon"] === "object") {
    const iconProp = obj["icon"] as Record<string, unknown>;
    if (iconProp["type"] === "string" && !iconProp["enum"]) {
      obj["icon"] = { ...iconProp, ...iconEnum };
    }
  }

  for (const val of Object.values(obj)) {
    injectIconEnums(val, iconEnum, depth + 1);
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate a JSON Schema for the snapshot manifest and write it to disk.
 *
 * When called without plugins, produces the built-in schema. Consumer apps
 * call this with their plugins to get a schema that includes custom types.
 *
 * @param options - Generation options
 *
 * @example
 * ```ts
 * // Generate the built-in schema only
 * generateManifestSchema({ outPath: './manifest.schema.json' });
 *
 * // Include custom plugin types in the schema
 * generateManifestSchema({
 *   plugins: [myPlugin],
 *   outPath: './manifest.schema.json',
 *   iconNames: ['home', 'settings', 'user'],
 * });
 * ```
 */
export function generateManifestSchema(options: GenerateOptions): void {
  bootBuiltins();

  // Register plugin schemas so they appear in the discriminated union
  if (options.plugins) {
    for (const plugin of options.plugins) {
      if (!plugin.components) continue;
      for (const [typeName, entry] of Object.entries(plugin.components)) {
        registerComponent(
          typeName,
          entry.component as Parameters<typeof registerComponent>[1],
        );
        registerComponentSchema(typeName, entry.schema);
      }
    }
  }

  const iconNames = options.iconNames ?? [];

  // Generate the base manifest schema with "root" strategy — handles recursive
  // Zod types via $ref without warnings. Then selectively resolve only the
  // $ref pointers whose targets will be invalidated by replaceComponentConfigs.
  // All other $refs stay as compact pointers.
  const rawWithRefs = zodToJsonSchema(manifestConfigSchema, {
    $refStrategy: "root",
    errorMessages: false,
    markdownDescription: true,
  }) as Record<string, unknown>;
  const rawSchema = resolveAtRiskRefs(rawWithRefs);

  // Build discriminated union of all component schemas
  const componentUnion = buildComponentUnion(iconNames);

  // Replace generic component config placeholders with discriminated union
  if (componentUnion) {
    const componentConfigRef = installComponentUnionDefinition(
      rawSchema,
      componentUnion.schema,
      componentUnion.definitions,
    );
    replaceComponentConfigs(rawSchema, componentConfigRef);
  }

  // Inject icon enums on remaining icon fields
  if (iconNames.length > 0) {
    injectIconEnums(rawSchema, { type: "string", enum: iconNames });
  }

  // Inject meta
  rawSchema["$schema"] = "http://json-schema.org/draft-07/schema#";
  rawSchema["title"] = "Snapshot Manifest";
  rawSchema["description"] =
    "Configuration schema for snapshot.manifest.json — the Snapshot frontend manifest file.";

  writeFileSync(options.outPath, JSON.stringify(rawSchema, null, 2));
}
