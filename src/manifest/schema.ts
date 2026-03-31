import { z } from "zod";

// ── Handler reference ────────────────────────────────────────────────────────
// Same pattern as bunshot: { handler: "name", params?: {} }
// Used for custom components, formatters, validators, guards, actions.

export const handlerRefSchema = z.object({
  handler: z.string(),
  params: z.record(z.unknown()).optional(),
});

export type HandlerRef = z.infer<typeof handlerRefSchema>;

// ── Data source reference ────────────────────────────────────────────────────

const fromRefSchema = z.object({ from: z.string() });

const dataSourceRefSchema = z.union([
  z.string(),
  z.object({
    endpoint: z.string(),
    params: z.record(z.union([z.string(), fromRefSchema])).optional(),
    pollInterval: z.number().optional(),
  }),
]);

// ── Action reference ─────────────────────────────────────────────────────────

const actionRefSchema: z.ZodType = z.lazy(() =>
  z
    .object({
      action: z.string(),
    })
    .catchall(z.unknown()),
);

// ── Column config ────────────────────────────────────────────────────────────

const columnSchema = z.object({
  field: z.string(),
  label: z.string().optional(),
  sortable: z.boolean().optional(),
  width: z.string().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  /** Named formatter from the handler registry, or inline format string. */
  format: z.union([z.string(), handlerRefSchema]).optional(),
  visible: z.boolean().optional(),
});

// ── Form field config ────────────────────────────────────────────────────────

const formFieldSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  type: z
    .enum([
      "text",
      "email",
      "password",
      "number",
      "textarea",
      "select",
      "checkbox",
      "toggle",
      "date",
      "datetime",
      "hidden",
    ])
    .optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  disabled: z.boolean().optional(),
  defaultValue: z.unknown().optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  /** Named validator from the handler registry. */
  validate: z.union([z.string(), handlerRefSchema]).optional(),
  visible: z.union([z.boolean(), z.object({ when: z.string(), equals: z.unknown() })]).optional(),
  span: z.number().optional(),
});

// ── Component config ─────────────────────────────────────────────────────────

const componentConfigSchema: z.ZodType = z.lazy(() =>
  z
    .object({
      type: z.string(),
      id: z.string().optional(),
      className: z.string().optional(),
      visible: z
        .union([z.boolean(), z.object({ default: z.boolean() }).catchall(z.boolean())])
        .optional(),

      // Data binding
      data: dataSourceRefSchema.optional(),

      // Columns (table)
      columns: z.union([z.literal("auto"), z.array(columnSchema)]).optional(),

      // Fields (form)
      fields: z.union([z.literal("auto"), z.array(formFieldSchema)]).optional(),

      // Actions (row actions, button actions)
      actions: z.array(actionRefSchema).optional(),

      // Success/error actions (form)
      onSuccess: actionRefSchema.optional(),
      onError: actionRefSchema.optional(),

      // Children (layout components)
      children: z.array(componentConfigSchema).optional(),

      // Sidebar layout
      sidebar: z.array(componentConfigSchema).optional(),
      content: z.array(componentConfigSchema).optional(),

      // Custom component via handler ref
      component: z.union([z.string(), handlerRefSchema]).optional(),

      // Pagination
      pagination: z
        .object({
          type: z.enum(["cursor", "offset"]).optional(),
          pageSize: z.number().optional(),
        })
        .optional(),
    })
    .catchall(z.unknown()),
);

// ── Page definition ──────────────────────────────────────────────────────────

const pageConfigSchema = z.object({
  layout: z.union([z.enum(["sidebar", "topnav", "full", "split"]), handlerRefSchema]).optional(),
  title: z.string().optional(),
  roles: z.array(z.string()).optional(),
  /** Named guard from the handler registry. Applied as a route guard. */
  guard: z.union([z.string(), handlerRefSchema]).optional(),
  components: z.array(componentConfigSchema),
});

// ── Nav item ─────────────────────────────────────────────────────────────────

const navItemSchema: z.ZodType = z.lazy(() =>
  z.object({
    label: z.string(),
    path: z.string(),
    icon: z.string().optional(),
    roles: z.array(z.string()).optional(),
    badge: z.union([z.string(), z.number()]).optional(),
    children: z.array(navItemSchema).optional(),
  }),
);

// ── Auth config ──────────────────────────────────────────────────────────────

const authScreenSchema = z.enum([
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verify-email",
  "mfa",
  "mfa-setup",
  "passkey-login",
]);

const authConfigSchema = z.object({
  screens: z.array(authScreenSchema),
  redirect: z.string().optional(),
  loginPath: z.string().optional(),
  homePath: z.string().optional(),
  forbiddenPath: z.string().optional(),
  mfaPath: z.string().optional(),
  mfaSetupPath: z.string().optional(),
  contract: z.record(z.unknown()).optional(),
});

// ── Theme config ─────────────────────────────────────────────────────────────

const themeConfigSchema = z.object({
  preset: z.string().optional(),
  categories: z.record(z.string()).optional(),
  overrides: z.record(z.unknown()).optional(),
});

// ── Feature config ───────────────────────────────────────────────────────────

const featureConfigSchema = z.object({
  feature: z.string(),
  config: z.record(z.unknown()).optional(),
});

// ── API config ───────────────────────────────────────────────────────────────

const apiConfigSchema = z.object({
  baseUrl: z.string(),
  auth: z.enum(["cookie", "token"]).optional(),
  bearerToken: z.string().optional(),
  tokenStorage: z.enum(["localStorage", "sessionStorage", "memory"]).optional(),
  staleTime: z.number().optional(),
  gcTime: z.number().optional(),
  retry: z.number().optional(),
});

// ── WS config ────────────────────────────────────────────────────────────────

const wsConfigSchema = z.object({
  url: z.string(),
  autoReconnect: z.boolean().optional(),
  reconnectOnLogin: z.boolean().optional(),
  reconnectOnFocus: z.boolean().optional(),
  maxReconnectAttempts: z.number().optional(),
  reconnectBaseDelay: z.number().optional(),
  reconnectMaxDelay: z.number().optional(),
});

// ── SSE config ───────────────────────────────────────────────────────────────

const sseEndpointSchema = z.object({
  withCredentials: z.boolean().optional(),
});

const sseConfigSchema = z.object({
  endpoints: z.record(sseEndpointSchema),
  reconnectOnLogin: z.boolean().optional(),
});

// ── Environment overrides ────────────────────────────────────────────────────

const environmentOverrideSchema = z
  .object({
    api: apiConfigSchema.partial().optional(),
    ws: wsConfigSchema.partial().optional(),
    sse: sseConfigSchema.partial().optional(),
    theme: themeConfigSchema.partial().optional(),
  })
  .catchall(z.unknown());

// ── Full manifest ────────────────────────────────────────────────────────────

export const frontendManifestSchema = z.object({
  manifestVersion: z.literal(1),

  meta: z
    .object({
      name: z.string().optional(),
      version: z.string().optional(),
    })
    .optional(),

  theme: themeConfigSchema.optional(),

  auth: authConfigSchema.optional(),

  nav: z.array(navItemSchema).optional(),

  pages: z.record(pageConfigSchema),

  features: z.array(featureConfigSchema).optional(),

  api: apiConfigSchema,

  ws: wsConfigSchema.optional(),
  sse: sseConfigSchema.optional(),

  environments: z.record(environmentOverrideSchema).optional(),
});

export type FrontendManifest = z.infer<typeof frontendManifestSchema>;
export type PageConfig = z.infer<typeof pageConfigSchema>;
export type ComponentConfig = z.infer<typeof componentConfigSchema>;
export type NavItem = z.infer<typeof navItemSchema>;
export type AuthScreen = z.infer<typeof authScreenSchema>;
export type AuthConfig = z.infer<typeof authConfigSchema>;
export type ThemeConfig = z.infer<typeof themeConfigSchema>;
export type FeatureConfig = z.infer<typeof featureConfigSchema>;
export type EnvironmentOverride = z.infer<typeof environmentOverrideSchema>;
