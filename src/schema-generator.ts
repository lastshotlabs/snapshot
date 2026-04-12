/**
 * Shared manifest schema generator.
 *
 * Extracts the core generation logic from the build script so that consumer
 * apps can call `generateManifestSchema({ plugins, outPath })` to get a
 * schema that includes their custom component types.
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

const COMPONENT_SINGLE_FIELDS = new Set(["trigger", "render"]);

interface GenerateOptions {
  plugins?: SnapshotPlugin[];
  outPath: string;
  iconNames?: string[];
}

function buildComponentUnion(
  iconNames: string[],
): Record<string, unknown> | null {
  const registeredSchemas = getRegisteredSchemas();
  if (registeredSchemas.size === 0) {
    return null;
  }

  const iconEnum =
    iconNames.length > 0
      ? { type: "string" as const, enum: iconNames }
      : undefined;

  const componentSchemas: Record<string, unknown>[] = [];

  for (const [typeName, zodSchema] of registeredSchemas) {
    try {
      const jsonSchema = zodToJsonSchema(zodSchema, {
        $refStrategy: "none",
        errorMessages: false,
      }) as Record<string, unknown>;

      // Ensure type is set to const for discriminator
      const properties =
        (jsonSchema["properties"] as Record<string, unknown>) ?? {};
      properties["type"] = { type: "string", const: typeName };
      jsonSchema["properties"] = properties;

      // Inject icon enum on icon fields
      if (iconEnum && properties["icon"]) {
        const iconProp = properties["icon"] as Record<string, unknown>;
        if (iconProp["type"] === "string" && !iconProp["enum"]) {
          properties["icon"] = { ...iconProp, ...iconEnum };
        }
      }

      componentSchemas.push(jsonSchema);
    } catch {
      // Skip components with exotic Zod types that zodToJsonSchema can't handle
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

  if (componentSchemas.length === 0) {
    return null;
  }

  return {
    oneOf: componentSchemas,
    discriminator: { propertyName: "type" },
  };
}

function replaceComponentConfigs(
  node: unknown,
  union: Record<string, unknown>,
  visited: WeakSet<object> = new WeakSet(),
): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((item) => replaceComponentConfigs(item, union, visited));
    return;
  }

  const obj = node as Record<string, unknown>;
  if (visited.has(obj)) return;
  visited.add(obj);

  const properties = obj["properties"] as Record<string, unknown> | undefined;

  if (properties) {
    for (const [key, value] of Object.entries(properties)) {
      if (!value || typeof value !== "object") continue;
      const prop = value as Record<string, unknown>;

      // Array fields that hold component configs
      if (COMPONENT_ARRAY_FIELDS.has(key)) {
        if (prop["type"] === "array" && prop["items"]) {
          const items = prop["items"] as Record<string, unknown>;
          // Replace if items looks like a generic object (passthrough)
          if (
            items["type"] === "object" ||
            items["anyOf"] ||
            items["allOf"] ||
            items["additionalProperties"] !== undefined
          ) {
            prop["items"] = union;
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
          properties[key] = union;
        }
      }
    }
  }

  // Recurse into all sub-objects
  for (const val of Object.values(obj)) {
    replaceComponentConfigs(val, union, visited);
  }
}

function injectIconEnums(
  node: unknown,
  iconEnum: Record<string, unknown>,
  visited: WeakSet<object> = new WeakSet(),
): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((item) => injectIconEnums(item, iconEnum, visited));
    return;
  }
  const obj = node as Record<string, unknown>;
  if (visited.has(obj)) return;
  visited.add(obj);

  if (obj["icon"] && typeof obj["icon"] === "object") {
    const iconProp = obj["icon"] as Record<string, unknown>;
    if (iconProp["type"] === "string" && !iconProp["enum"]) {
      obj["icon"] = { ...iconProp, ...iconEnum };
    }
  }

  for (const val of Object.values(obj)) {
    injectIconEnums(val, iconEnum, visited);
  }
}

/**
 * Generate a JSON Schema for the snapshot manifest and write it to disk.
 *
 * When called without plugins, produces the built-in schema. Consumer apps
 * call this with their plugins to get a schema that includes custom types.
 *
 * @param options - Generation options
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

  // Generate the base manifest schema
  const rawSchema = zodToJsonSchema(manifestConfigSchema, {
    $refStrategy: "root",
    errorMessages: false,
    markdownDescription: true,
  }) as Record<string, unknown>;

  // Build discriminated union of all component schemas
  const componentUnion = buildComponentUnion(iconNames);

  // Replace generic component config placeholders with discriminated union
  if (componentUnion) {
    replaceComponentConfigs(rawSchema, componentUnion);
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

  // Serialize with cycle detection — zodToJsonSchema with $refStrategy "root"
  // can produce actual object cycles for recursive Zod types.
  const seen = new WeakSet<object>();
  const json = JSON.stringify(
    rawSchema,
    (_key, value: unknown) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return {};
        seen.add(value);
      }
      return value;
    },
    2,
  );
  writeFileSync(options.outPath, json);
}
