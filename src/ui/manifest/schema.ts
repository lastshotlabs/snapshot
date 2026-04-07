/**
 * Manifest Zod schemas.
 *
 * Defines the validation schemas for the snapshot manifest format
 * (`snapshot.manifest.json`). Uses a dynamic component schema registry
 * so each component phase can register its own schema.
 */

import { z } from "zod";
import { themeConfigSchema } from "../tokens/schema";

// ── FromRef schema ──────────────────────────────────────────────────────────

/** Zod schema for a FromRef value — a reference to another component's published value. */
export const fromRefSchema = z
  .object({
    from: z.string(),
  })
  .strict();

// ── Responsive helper ───────────────────────────────────────────────────────

/**
 * Creates a Zod schema for a responsive value — either a flat value or a breakpoint map.
 *
 * @param valueSchema - The schema for the flat value
 * @returns A union schema accepting flat value or responsive breakpoint map
 */
function responsiveSchema<T extends z.ZodTypeAny>(
  valueSchema: T,
): z.ZodUnion<
  [
    T,
    z.ZodObject<{
      default: T;
      sm: z.ZodOptional<T>;
      md: z.ZodOptional<T>;
      lg: z.ZodOptional<T>;
      xl: z.ZodOptional<T>;
      "2xl": z.ZodOptional<T>;
    }>,
  ]
> {
  return z.union([
    valueSchema,
    z.object({
      default: valueSchema,
      sm: valueSchema.optional(),
      md: valueSchema.optional(),
      lg: valueSchema.optional(),
      xl: valueSchema.optional(),
      "2xl": valueSchema.optional(),
    }),
  ]);
}

// ── Component schema registry ───────────────────────────────────────────────

const componentSchemaRegistry = new Map<string, z.ZodType>();

/**
 * Register a Zod schema for a component type string.
 * Used by built-in structural components and by consumer-defined component phases.
 *
 * @param type - The component type string (e.g. "row", "heading", "stat-card")
 * @param schema - The Zod schema that validates this component's config
 */
export function registerComponentSchema(type: string, schema: z.ZodType): void {
  componentSchemaRegistry.set(type, schema);
}

/**
 * Get all registered component type names.
 * Useful for error messages and debugging.
 *
 * @returns Array of registered component type strings
 */
export function getRegisteredSchemaTypes(): string[] {
  return [...componentSchemaRegistry.keys()];
}

// ── Base component config ───────────────────────────────────────────────────

/** Zod schema for config fields shared by all components. */
export const baseComponentConfigSchema = z.object({
  /** Component type discriminator. */
  type: z.string(),
  /** Unique id for the from-ref system. */
  id: z.string().optional(),
  /** Responsive visibility. */
  visible: z
    .union([z.boolean(), responsiveSchema(z.boolean()), fromRefSchema])
    .optional(),
  /** Additional CSS class. */
  className: z.string().optional(),
  /** Grid span when inside a row. */
  span: responsiveSchema(z.number().int().min(1).max(12)).optional(),
});

// ── Structural component schemas ────────────────────────────────────────────

/** Zod schema for the Row layout container. */
export const rowConfigSchema: z.ZodType = z.lazy(() =>
  baseComponentConfigSchema.extend({
    type: z.literal("row"),
    gap: responsiveSchema(z.enum(["xs", "sm", "md", "lg", "xl"])).optional(),
    justify: z.enum(["start", "center", "end", "between", "around"]).optional(),
    align: z.enum(["start", "center", "end", "stretch"]).optional(),
    wrap: z.boolean().optional(),
    children: z.array(componentConfigSchema).min(1),
  }),
);

/** Zod schema for the Heading component. */
export const headingConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("heading"),
  text: z.union([z.string(), fromRefSchema]),
  level: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
    ])
    .optional(),
});

// ── Action config schema (simplified for Phase 4) ───────────────────────────

/** Simplified action config schema for Phase 4 structural components. */
const actionConfigSchema: z.ZodType = z.lazy(() =>
  z
    .object({
      type: z.string(),
    })
    .passthrough(),
);

/** Zod schema for the Button component. */
export const buttonConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("button"),
  label: z.string(),
  icon: z.string().optional(),
  variant: z
    .enum(["default", "secondary", "outline", "ghost", "destructive", "link"])
    .optional(),
  size: z.enum(["sm", "md", "lg", "icon"]).optional(),
  action: z.union([actionConfigSchema, z.array(actionConfigSchema)]),
  disabled: z.union([z.boolean(), fromRefSchema]).optional(),
});

/** Zod schema for select option items. */
const selectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

/** Zod schema for the Select dropdown component. */
export const selectConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("select"),
  options: z.union([z.array(selectOptionSchema), z.string()]),
  valueField: z.string().optional(),
  labelField: z.string().optional(),
  default: z.string().optional(),
  placeholder: z.string().optional(),
});

/** Zod schema for the custom component escape hatch. */
export const customComponentConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("custom"),
  component: z.string(),
  props: z.record(z.unknown()).optional(),
});

// ── Component config schema (delegates to registry) ─────────────────────────

/**
 * Zod schema that validates any component config by delegating to the
 * registered schema for that component's `type` field. Uses passthrough
 * to preserve all fields, then superRefine to run the type-specific schema.
 */
export const componentConfigSchema: z.ZodType = z
  .object({ type: z.string() })
  .passthrough()
  .superRefine((data, ctx) => {
    const schema = componentSchemaRegistry.get(data.type);
    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue(issue);
        }
      }
    } else if (data.type !== "custom") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown component type "${data.type}". Available types: ${[...componentSchemaRegistry.keys()].join(", ")}`,
      });
    }
  });

// ── Register built-in structural components ─────────────────────────────────

registerComponentSchema("row", rowConfigSchema);
registerComponentSchema("heading", headingConfigSchema);
registerComponentSchema("button", buttonConfigSchema);
registerComponentSchema("select", selectConfigSchema);
registerComponentSchema("custom", customComponentConfigSchema);

// ── Navigation schema ───────────────────────────────────────────────────────

/** Zod schema for a navigation item. */
export const navItemSchema: z.ZodType = z.lazy(() =>
  z.object({
    label: z.string(),
    path: z.string(),
    icon: z.string().optional(),
    roles: z.array(z.string()).optional(),
    badge: z.union([z.number(), fromRefSchema]).optional(),
    children: z.array(navItemSchema).optional(),
  }),
);

// ── Auth screen schema ──────────────────────────────────────────────────────

/** Zod schema for auth screen configuration. */
export const authScreenConfigSchema = z.object({
  screens: z
    .array(
      z.enum([
        "login",
        "register",
        "forgot-password",
        "reset-password",
        "verify-email",
        "mfa",
      ]),
    )
    .min(1),
  providers: z
    .array(z.enum(["google", "github", "apple", "microsoft"]))
    .optional(),
  passkey: z.boolean().optional(),
  branding: z
    .object({
      logo: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
});

// ── Page schema ─────────────────────────────────────────────────────────────

/** Zod schema for a page definition. */
export const pageConfigSchema = z.object({
  layout: z.enum(["sidebar", "top-nav", "minimal", "full-width"]).optional(),
  title: z.string().optional(),
  content: z.array(componentConfigSchema).min(1),
  roles: z.array(z.string()).optional(),
  breadcrumb: z.string().optional(),
});

// ── Global config schema ────────────────────────────────────────────────────

const globalConfigSchema = z.object({
  data: z.string().optional(),
  default: z.unknown().optional(),
});

// ── Manifest schema ─────────────────────────────────────────────────────────

/** Zod schema for the complete manifest configuration. */
export const manifestConfigSchema = z.object({
  $schema: z.string().optional(),
  theme: themeConfigSchema.optional(),
  globals: z.record(globalConfigSchema).optional(),
  nav: z.array(navItemSchema).optional(),
  auth: authScreenConfigSchema.optional(),
  pages: z.record(pageConfigSchema),
});
