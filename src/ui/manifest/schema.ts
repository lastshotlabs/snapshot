/**
 * Manifest Zod schemas.
 *
 * Defines the validation schemas for the snapshot manifest format
 * (`snapshot.manifest.json`). Uses a dynamic component schema registry
 * so each component phase can register its own schema.
 */

import { z } from "zod";
import { themeConfigSchema } from "../tokens/schema";

/** Zod schema for a FromRef value. */
export const fromRefSchema = z
  .object({
    from: z.string(),
    transform: z
      .enum([
        "uppercase",
        "lowercase",
        "trim",
        "length",
        "number",
        "boolean",
        "string",
        "json",
        "keys",
        "values",
        "first",
        "last",
        "count",
        "sum",
        "join",
        "split",
        "default",
      ])
      .optional(),
    transformArg: z.union([z.string(), z.number()]).optional(),
  })
  .strict();

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

const componentSchemaRegistry = new Map<string, z.ZodType>();

export function registerComponentSchema(type: string, schema: z.ZodType): void {
  componentSchemaRegistry.set(type, schema);
}

export function getRegisteredSchemaTypes(): string[] {
  return [...componentSchemaRegistry.keys()];
}

export const baseComponentConfigSchema = z.object({
  type: z.string(),
  id: z.string().optional(),
  visible: z
    .union([z.boolean(), responsiveSchema(z.boolean()), fromRefSchema])
    .optional(),
  className: z.string().optional(),
  style: z.record(z.union([z.string(), z.number()])).optional(),
  span: responsiveSchema(z.number().int().min(1).max(12)).optional(),
});

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

const actionConfigSchema: z.ZodType = z.lazy(() =>
  z
    .object({
      type: z.string(),
    })
    .passthrough(),
);

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

const selectOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const selectConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("select"),
  options: z.union([z.array(selectOptionSchema), z.string()]),
  valueField: z.string().optional(),
  labelField: z.string().optional(),
  default: z.string().optional(),
  placeholder: z.string().optional(),
});

export const customComponentConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("custom"),
  component: z.string(),
  props: z.record(z.unknown()).optional(),
});

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

registerComponentSchema("row", rowConfigSchema);
registerComponentSchema("heading", headingConfigSchema);
registerComponentSchema("button", buttonConfigSchema);
registerComponentSchema("select", selectConfigSchema);
registerComponentSchema("custom", customComponentConfigSchema);

export const navItemSchema: z.ZodType = z.lazy(() =>
  z
    .object({
      label: z.string(),
      path: z.string().startsWith("/"),
      icon: z.string().optional(),
      roles: z.array(z.string()).optional(),
      badge: z.union([z.number(), fromRefSchema]).optional(),
      children: z.array(navItemSchema).optional(),
    })
    .strict(),
);

export const navigationConfigSchema = z
  .object({
    mode: z.enum(["sidebar", "top-nav"]).optional(),
    items: z.array(navItemSchema).min(1),
  })
  .strict();

export const authScreenConfigSchema = z
  .object({
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
  })
  .strict();

export const layoutSchema = z.enum([
  "sidebar",
  "top-nav",
  "minimal",
  "full-width",
]);

export const pageConfigSchema = z
  .object({
    layout: layoutSchema.optional(),
    title: z.string().optional(),
    content: z.array(componentConfigSchema).min(1),
    roles: z.array(z.string()).optional(),
    breadcrumb: z.string().optional(),
  })
  .strict();

export const routeConfigSchema = pageConfigSchema
  .extend({
    id: z.string().min(1),
    path: z.string().startsWith("/"),
  })
  .strict();

export const stateValueConfigSchema = z
  .object({
    data: z.string().optional(),
    default: z.unknown().optional(),
  })
  .strict();

export const appConfigSchema = z
  .object({
    title: z.string().optional(),
    shell: layoutSchema.optional(),
    home: z.string().startsWith("/").optional(),
    notFound: z.string().startsWith("/").optional(),
  })
  .strict();

function collectNavPaths(items: z.infer<typeof navItemSchema>[]): string[] {
  const paths: string[] = [];
  for (const item of items) {
    paths.push(item.path);
    if (item.children) {
      paths.push(...collectNavPaths(item.children));
    }
  }
  return paths;
}

export const manifestConfigSchema = z
  .object({
    $schema: z.string().optional(),
    app: appConfigSchema.optional(),
    theme: themeConfigSchema.optional(),
    state: z.record(stateValueConfigSchema).optional(),
    navigation: navigationConfigSchema.optional(),
    auth: authScreenConfigSchema.optional(),
    resources: z.record(z.unknown()).optional(),
    workflows: z.record(z.unknown()).optional(),
    overlays: z.record(z.unknown()).optional(),
    presets: z.record(z.unknown()).optional(),
    policies: z.record(z.unknown()).optional(),
    i18n: z.record(z.unknown()).optional(),
    routes: z.array(routeConfigSchema).min(1),
  })
  .strict()
  .superRefine((data, ctx) => {
    const routeIds = new Set<string>();
    const routePaths = new Set<string>();

    data.routes.forEach((route, index) => {
      if (routeIds.has(route.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["routes", index, "id"],
          message: `Duplicate route id "${route.id}"`,
        });
      } else {
        routeIds.add(route.id);
      }

      if (routePaths.has(route.path)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["routes", index, "path"],
          message: `Duplicate route path "${route.path}"`,
        });
      } else {
        routePaths.add(route.path);
      }
    });

    if (data.app?.home && !routePaths.has(data.app.home)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["app", "home"],
        message: `App home route "${data.app.home}" does not exist`,
      });
    }

    if (data.app?.notFound && !routePaths.has(data.app.notFound)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["app", "notFound"],
        message: `App notFound route "${data.app.notFound}" does not exist`,
      });
    }

    if (data.navigation) {
      const navPaths = collectNavPaths(data.navigation.items);
      navPaths.forEach((navPath, index) => {
        if (!routePaths.has(navPath)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["navigation", "items", index],
            message: `Navigation path "${navPath}" does not match any route`,
          });
        }
      });
    }
  });
