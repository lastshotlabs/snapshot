/**
 * Manifest Zod schemas.
 *
 * Defines the validation schemas for the snapshot manifest format
 * (`snapshot.manifest.json`). Uses a dynamic component schema registry
 * so each component phase can register its own schema.
 */

import { z } from "zod";
import { getMissingAuthScreenIds } from "./auth-routes";
import { themeConfigSchema } from "../tokens/schema";
import {
  workflowConditionSchema,
  workflowDefinitionSchema,
} from "../workflows/schema";
import {
  dataSourceSchema,
  endpointTargetSchema,
  extractResourceRefs,
  resourceConfigSchema,
} from "./resources";
import { spinnerConfigSchema } from "../components/feedback/default-loading";
import { errorPageConfigSchema } from "../components/feedback/default-error";
import { notFoundConfigSchema } from "../components/feedback/default-not-found";
import { offlineBannerConfigSchema } from "../components/feedback/default-offline";
import { envRefSchema } from "./env";

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

/**
 * Accept either a literal string or an environment reference.
 */
export const stringOrEnvRef = z.union([z.string(), envRefSchema]);

const authEndpointConfigSchema = z
  .object({
    me: stringOrEnvRef.optional(),
    login: stringOrEnvRef.optional(),
    logout: stringOrEnvRef.optional(),
    register: stringOrEnvRef.optional(),
    forgotPassword: stringOrEnvRef.optional(),
    refresh: stringOrEnvRef.optional(),
    resetPassword: stringOrEnvRef.optional(),
    verifyEmail: stringOrEnvRef.optional(),
    resendVerification: stringOrEnvRef.optional(),
    setPassword: stringOrEnvRef.optional(),
    deleteAccount: stringOrEnvRef.optional(),
    cancelDeletion: stringOrEnvRef.optional(),
    sessions: stringOrEnvRef.optional(),
    mfaVerify: stringOrEnvRef.optional(),
    mfaSetup: stringOrEnvRef.optional(),
    mfaVerifySetup: stringOrEnvRef.optional(),
    mfaDisable: stringOrEnvRef.optional(),
    mfaRecoveryCodes: stringOrEnvRef.optional(),
    mfaEmailOtpEnable: stringOrEnvRef.optional(),
    mfaEmailOtpVerifySetup: stringOrEnvRef.optional(),
    mfaEmailOtpDisable: stringOrEnvRef.optional(),
    mfaResend: stringOrEnvRef.optional(),
    mfaMethods: stringOrEnvRef.optional(),
    webauthnRegisterOptions: stringOrEnvRef.optional(),
    webauthnRegister: stringOrEnvRef.optional(),
    webauthnCredentials: stringOrEnvRef.optional(),
    webauthnDisable: stringOrEnvRef.optional(),
    passkeyLoginOptions: stringOrEnvRef.optional(),
    passkeyLogin: stringOrEnvRef.optional(),
    oauthExchange: stringOrEnvRef.optional(),
  })
  .strict();

const authHeadersConfigSchema = z
  .object({
    userToken: stringOrEnvRef.optional(),
    csrf: stringOrEnvRef.optional(),
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
  text: z.union([stringOrEnvRef, fromRefSchema]),
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
  label: stringOrEnvRef,
  icon: z.string().optional(),
  variant: z
    .enum(["default", "secondary", "outline", "ghost", "destructive", "link"])
    .optional(),
  size: z.enum(["sm", "md", "lg", "icon"]).optional(),
  action: z.union([actionConfigSchema, z.array(actionConfigSchema)]),
  disabled: z.union([z.boolean(), fromRefSchema]).optional(),
});

const selectOptionSchema = z.object({
  label: stringOrEnvRef,
  value: z.string(),
});

export const selectConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("select"),
  options: z.union([z.array(selectOptionSchema), dataSourceSchema]),
  valueField: z.string().optional(),
  labelField: z.string().optional(),
  default: stringOrEnvRef.optional(),
  placeholder: stringOrEnvRef.optional(),
});

const customComponentPropTypeSchema = z.enum(["string", "number", "boolean"]);

export const customComponentPropSchema = z
  .object({
    type: customComponentPropTypeSchema,
    required: z.boolean().optional(),
    default: z
      .union([z.string(), z.number(), z.boolean(), z.null()])
      .optional(),
  })
  .strict();

export const customComponentDeclarationSchema = z
  .object({
    props: z.record(customComponentPropSchema).optional(),
  })
  .strict();

/**
 * Manifest auth contract overrides.
 */
export const authContractSchema = z
  .object({
    endpoints: authEndpointConfigSchema.optional(),
    headers: authHeadersConfigSchema.optional(),
    csrfCookieName: stringOrEnvRef.optional(),
  })
  .strict();

/**
 * Manifest realtime WebSocket configuration.
 */
export const realtimeWsSchema = z
  .object({
    url: stringOrEnvRef.optional(),
    autoReconnect: z.boolean().default(true),
    reconnectOnLogin: z.boolean().default(true),
    reconnectOnFocus: z.boolean().default(true),
    maxReconnectAttempts: z.number().int().nonnegative().optional(),
    reconnectBaseDelay: z.number().int().nonnegative().optional(),
    reconnectMaxDelay: z.number().int().nonnegative().optional(),
    on: z
      .object({
        connected: z.string().optional(),
        disconnected: z.string().optional(),
        reconnecting: z.string().optional(),
        reconnectFailed: z.string().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

/**
 * Manifest realtime SSE endpoint configuration.
 */
export const realtimeSseEndpointSchema = z
  .object({
    withCredentials: z.boolean().optional(),
    on: z
      .object({
        connected: z.string().optional(),
        error: z.string().optional(),
        closed: z.string().optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

/**
 * Manifest realtime configuration.
 */
export const realtimeConfigSchema = z
  .object({
    ws: realtimeWsSchema.optional(),
    sse: z
      .object({
        endpoints: z.record(realtimeSseEndpointSchema),
        reconnectOnLogin: z.boolean().default(true),
      })
      .strict()
      .optional(),
  })
  .strict();

export const componentsConfigSchema = z
  .object({
    custom: z.record(customComponentDeclarationSchema).optional(),
  })
  .strict();

function buildCustomComponentSchema(
  type: string,
  declaration: z.infer<typeof customComponentDeclarationSchema>,
): z.ZodType {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [propName, propSchema] of Object.entries(
    declaration.props ?? {},
  )) {
    let propType: z.ZodTypeAny;
    switch (propSchema.type) {
      case "string":
        propType = z.string();
        break;
      case "number":
        propType = z.number();
        break;
      case "boolean":
        propType = z.boolean();
        break;
    }

    if (propSchema.default !== undefined) {
      propType = propType.default(propSchema.default as never);
    } else if (!propSchema.required) {
      propType = propType.optional();
    }

    shape[propName] = propType;
  }

  return baseComponentConfigSchema
    .extend({
      type: z.literal(type),
    })
    .extend(shape)
    .strict();
}

function registerManifestCustomComponentSchemas(
  customComponents: Record<
    string,
    z.infer<typeof customComponentDeclarationSchema>
  >,
): Map<string, z.ZodType> {
  const previousSchemas = new Map(componentSchemaRegistry);
  for (const [type, declaration] of Object.entries(customComponents)) {
    registerComponentSchema(
      type,
      buildCustomComponentSchema(type, declaration),
    );
  }
  return previousSchemas;
}

function restoreComponentSchemaRegistry(
  previousSchemas: Map<string, z.ZodType>,
): void {
  componentSchemaRegistry.clear();
  for (const [type, schema] of previousSchemas) {
    componentSchemaRegistry.set(type, schema);
  }
}

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
    } else {
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
registerComponentSchema("spinner", spinnerConfigSchema);
registerComponentSchema("error-page", errorPageConfigSchema);
registerComponentSchema("not-found", notFoundConfigSchema);
registerComponentSchema("offline-banner", offlineBannerConfigSchema);

export const navItemSchema: z.ZodType = z.lazy(() =>
  z
    .object({
      label: z.string(),
      path: z.string().startsWith("/"),
      icon: z.string().optional(),
      visible: z.union([z.boolean(), fromRefSchema]).optional(),
      disabled: z.union([z.boolean(), fromRefSchema]).optional(),
      authenticated: z.boolean().optional(),
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

const authScreenNameSchema = z.enum([
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verify-email",
  "mfa",
]);

const authScreenLinkSchema = z
  .object({
    label: stringOrEnvRef,
    path: z.string().startsWith("/").optional(),
    screen: authScreenNameSchema.optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.path && !data.screen) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Auth links must define either path or screen",
        path: [],
      });
    }
  });

const authFieldConfigSchema = z
  .object({
    label: stringOrEnvRef.optional(),
    placeholder: stringOrEnvRef.optional(),
  })
  .strict();

const authProviderNameSchema = z.enum([
  "google",
  "github",
  "apple",
  "microsoft",
]);

const authProviderConfigSchema = z
  .object({
    provider: authProviderNameSchema,
    label: stringOrEnvRef.optional(),
    description: stringOrEnvRef.optional(),
    autoRedirect: z.boolean().optional(),
  })
  .strict();

const authProviderListSchema = z.array(
  z.union([authProviderNameSchema, authProviderConfigSchema]),
);

/**
 * Manifest auth session settings.
 */
export const authSessionSchema = z
  .object({
    mode: z.enum(["cookie", "token"]).default("cookie"),
    storage: z
      .enum(["localStorage", "sessionStorage", "memory"])
      .default("sessionStorage"),
    key: z.string().default("snapshot.token"),
  })
  .strict();

const authScreenSectionSchema = z.enum([
  "form",
  "providers",
  "passkey",
  "links",
]);

const authScreenOptionsSchema = z
  .object({
    title: stringOrEnvRef.optional(),
    description: stringOrEnvRef.optional(),
    submitLabel: stringOrEnvRef.optional(),
    successMessage: stringOrEnvRef.optional(),
    sections: z.array(authScreenSectionSchema).min(1).optional(),
    labels: z
      .object({
        providersHeading: stringOrEnvRef.optional(),
        passkeyButton: stringOrEnvRef.optional(),
        method: stringOrEnvRef.optional(),
        resend: stringOrEnvRef.optional(),
      })
      .strict()
      .optional(),
    providers: z.union([authProviderListSchema, z.literal(false)]).optional(),
    providerMode: z.enum(["buttons", "auto"]).optional(),
    passkey: z
      .union([
        z.boolean(),
        z
          .object({
            enabled: z.boolean().optional(),
            autoPrompt: z.boolean().optional(),
          })
          .strict(),
      ])
      .optional(),
    fields: z
      .object({
        email: authFieldConfigSchema.optional(),
        password: authFieldConfigSchema.optional(),
        name: authFieldConfigSchema.optional(),
        code: authFieldConfigSchema.optional(),
        method: authFieldConfigSchema.optional(),
      })
      .strict()
      .optional(),
    links: z.array(authScreenLinkSchema).optional(),
  })
  .strict();

const authWorkflowNameSchema = stringOrEnvRef;

const authWorkflowHooksSchema = z
  .object({
    unauthenticated: authWorkflowNameSchema.optional(),
    forbidden: authWorkflowNameSchema.optional(),
    logout: authWorkflowNameSchema.optional(),
  })
  .strict();

export const authScreenConfigSchema = z
  .object({
    screens: z.array(authScreenNameSchema).min(1),
    session: authSessionSchema.optional(),
    contract: authContractSchema.optional(),
    providers: authProviderListSchema.optional(),
    providerMode: z.enum(["buttons", "auto"]).optional(),
    passkey: z
      .union([
        z.boolean(),
        z
          .object({
            enabled: z.boolean().optional(),
            autoPrompt: z.boolean().optional(),
          })
          .strict(),
      ])
      .optional(),
    branding: z
      .object({
        logo: stringOrEnvRef.optional(),
        title: stringOrEnvRef.optional(),
        description: stringOrEnvRef.optional(),
      })
      .optional(),
    redirects: z
      .object({
        authenticated: stringOrEnvRef.optional(),
        afterLogin: stringOrEnvRef.optional(),
        afterRegister: stringOrEnvRef.optional(),
        afterMfa: stringOrEnvRef.optional(),
        unauthenticated: stringOrEnvRef.optional(),
        forbidden: stringOrEnvRef.optional(),
      })
      .strict()
      .optional(),
    on: authWorkflowHooksSchema.optional(),
    screenOptions: z
      .object({
        login: authScreenOptionsSchema.optional(),
        register: authScreenOptionsSchema.optional(),
        "forgot-password": authScreenOptionsSchema.optional(),
        "reset-password": authScreenOptionsSchema.optional(),
        "verify-email": authScreenOptionsSchema.optional(),
        mfa: authScreenOptionsSchema.optional(),
      })
      .strict()
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
    title: stringOrEnvRef.optional(),
    content: z.array(componentConfigSchema).min(1),
    roles: z.array(z.string()).optional(),
    breadcrumb: z.string().optional(),
  })
  .strict();

export const routeConfigSchema = pageConfigSchema
  .extend({
    id: z.string().min(1),
    path: z.string().startsWith("/"),
    preload: z.array(endpointTargetSchema).optional(),
    refreshOnEnter: z.array(z.string().min(1)).optional(),
    invalidateOnLeave: z.array(z.string().min(1)).optional(),
    enter: z.union([z.string().min(1), workflowDefinitionSchema]).optional(),
    leave: z.union([z.string().min(1), workflowDefinitionSchema]).optional(),
    guard: z
      .object({
        authenticated: z.boolean().optional(),
        roles: z.array(z.string()).optional(),
        condition: workflowConditionSchema.optional(),
        redirectTo: z.string().startsWith("/").optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const stateValueConfigSchema = z
  .object({
    scope: z.enum(["app", "route"]).optional(),
    data: endpointTargetSchema.optional(),
    default: z.unknown().optional(),
  })
  .strict();

/**
 * Manifest cache defaults for TanStack Query.
 */
export const appCacheSchema = z
  .object({
    staleTime: z
      .number()
      .int()
      .nonnegative()
      .default(5 * 60 * 1000),
    gcTime: z
      .number()
      .int()
      .nonnegative()
      .default(10 * 60 * 1000),
    retry: z.number().int().nonnegative().default(1),
  })
  .strict();

export const appConfigSchema = z
  .object({
    apiUrl: stringOrEnvRef.optional(),
    title: stringOrEnvRef.optional(),
    shell: layoutSchema.default("full-width"),
    cache: appCacheSchema.optional(),
    home: z.string().startsWith("/").optional(),
    loading: z.union([componentConfigSchema, stringOrEnvRef]).optional(),
    error: z.union([componentConfigSchema, stringOrEnvRef]).optional(),
    notFound: stringOrEnvRef.optional(),
    offline: z.union([componentConfigSchema, stringOrEnvRef]).optional(),
  })
  .strict();

/**
 * Server-side rendering configuration for the manifest app.
 *
 * When `rsc` is enabled, the manifest renderer loads `rsc-manifest.json`
 * once at startup and passes it to `renderPage()` for two-pass RSC rendering.
 */
export const manifestSsrConfigSchema = z
  .object({
    rsc: z.boolean().optional().default(false),
    rscManifestPath: z
      .string()
      .optional()
      .default("./dist/server/rsc-manifest.json"),
  })
  .strict();

const overlayFooterActionSchema = z
  .object({
    label: stringOrEnvRef,
    variant: z
      .enum(["default", "secondary", "destructive", "ghost"])
      .optional(),
    action: z
      .union([actionConfigSchema, z.array(actionConfigSchema)])
      .optional(),
    dismiss: z.boolean().optional(),
  })
  .strict();

export const overlayConfigSchema: z.ZodType = z.union([
  z
    .object({
      type: z.literal("modal"),
      title: z.union([z.string(), fromRefSchema]).optional(),
      size: z.enum(["sm", "md", "lg", "xl", "full"]).optional(),
      content: z.array(componentConfigSchema).min(1),
      onOpen: z.union([z.string().min(1), workflowDefinitionSchema]).optional(),
      onClose: z
        .union([z.string().min(1), workflowDefinitionSchema])
        .optional(),
      className: z.string().optional(),
      style: z.record(z.union([z.string(), z.number()])).optional(),
      footer: z
        .object({
          actions: z.array(overlayFooterActionSchema).optional(),
          align: z.enum(["left", "center", "right"]).optional(),
        })
        .optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal("drawer"),
      title: z.union([z.string(), fromRefSchema]).optional(),
      size: z.enum(["sm", "md", "lg", "xl", "full"]).optional(),
      side: z.enum(["left", "right"]).optional(),
      content: z.array(componentConfigSchema).min(1),
      onOpen: z.union([z.string().min(1), workflowDefinitionSchema]).optional(),
      onClose: z
        .union([z.string().min(1), workflowDefinitionSchema])
        .optional(),
      className: z.string().optional(),
      style: z.record(z.union([z.string(), z.number()])).optional(),
      footer: z
        .object({
          actions: z.array(overlayFooterActionSchema).optional(),
          align: z.enum(["left", "center", "right"]).optional(),
        })
        .optional(),
    })
    .strict(),
]);

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
    components: componentsConfigSchema.optional(),
    theme: themeConfigSchema.optional(),
    ssr: manifestSsrConfigSchema.optional(),
    state: z.record(stateValueConfigSchema).optional(),
    navigation: navigationConfigSchema.optional(),
    auth: authScreenConfigSchema.optional(),
    realtime: realtimeConfigSchema.optional(),
    resources: z.record(resourceConfigSchema).optional(),
    workflows: z.record(workflowDefinitionSchema).optional(),
    overlays: z.record(overlayConfigSchema).optional(),
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

    if (
      typeof data.app?.loading === "string" &&
      !routeIds.has(data.app.loading)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["app", "loading"],
        message: `App loading route id "${data.app.loading}" does not exist`,
      });
    }

    if (typeof data.app?.error === "string" && !routeIds.has(data.app.error)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["app", "error"],
        message: `App error route id "${data.app.error}" does not exist`,
      });
    }

    if (
      typeof data.app?.notFound === "string" &&
      !routeIds.has(data.app.notFound)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["app", "notFound"],
        message: `App notFound route id "${data.app.notFound}" does not exist`,
      });
    }

    if (
      typeof data.app?.offline === "string" &&
      !routeIds.has(data.app.offline)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["app", "offline"],
        message: `App offline route id "${data.app.offline}" does not exist`,
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

    const missingAuthScreens = getMissingAuthScreenIds({
      auth: data.auth,
      routes: data.routes,
    });
    missingAuthScreens.forEach((screen) => {
      const screenIndex = data.auth?.screens.indexOf(screen) ?? -1;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["auth", "screens", screenIndex >= 0 ? screenIndex : 0],
        message: `Auth screen "${screen}" is enabled but no route has id "${screen}". Add { "id": "${screen}", "path": "/your-path", ... } to routes.`,
      });
    });

    const resourceNames = new Set(Object.keys(data.resources ?? {}));
    Object.entries(data.resources ?? {}).forEach(([name, resource]) => {
      for (const dependency of resource.dependsOn ?? []) {
        if (!resourceNames.has(dependency)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["resources", name, "dependsOn"],
            message: `Unknown resource dependency "${dependency}"`,
          });
        }
      }
      for (const target of resource.invalidates ?? []) {
        if (!resourceNames.has(target)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["resources", name, "invalidates"],
            message: `Unknown invalidation target "${target}"`,
          });
        }
      }
    });
    const resourceRefs = extractResourceRefs(data);
    resourceRefs.forEach((resourceRef, index) => {
      if (!resourceNames.has(resourceRef.resource)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["resources", index],
          message: `Unknown resource "${resourceRef.resource}"`,
        });
      }
    });
  });

function extractDeclaredCustomComponents(
  manifest: unknown,
): Record<string, z.infer<typeof customComponentDeclarationSchema>> {
  if (!manifest || typeof manifest !== "object") {
    return {};
  }

  const components = (manifest as { components?: unknown }).components;
  if (!components || typeof components !== "object") {
    return {};
  }

  const custom = (components as { custom?: unknown }).custom;
  if (!custom || typeof custom !== "object") {
    return {};
  }

  const result: Record<
    string,
    z.infer<typeof customComponentDeclarationSchema>
  > = {};

  for (const [type, declaration] of Object.entries(custom)) {
    const parsed = customComponentDeclarationSchema.safeParse(declaration);
    if (parsed.success) {
      result[type] = parsed.data;
    }
  }

  return result;
}

export function withManifestCustomComponents<T>(
  manifest: unknown,
  callback: () => T,
): T {
  const previousSchemas = registerManifestCustomComponentSchemas(
    extractDeclaredCustomComponents(manifest),
  );

  try {
    return callback();
  } finally {
    restoreComponentSchemaRegistry(previousSchemas);
  }
}
