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
import { workflowConditionSchema } from "../workflows/schema";
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
import { i18nConfigSchema, tRefSchema } from "../i18n/schema";

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

const textWithFromRefSchema = z.union([
  stringOrEnvRef,
  fromRefSchema,
  tRefSchema,
]);
const textOrTRefSchema = z.union([stringOrEnvRef, tRefSchema]);
const plainTextOrTRefSchema = z.union([z.string(), tRefSchema]);
const overlayTitleSchema = z.union([z.string(), fromRefSchema, tRefSchema]);

const policyRefOrLiteralSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  fromRefSchema,
  envRefSchema,
]);

/** Policy reference used by guards and component visibility. */
export const policyRefSchema = z
  .object({
    policy: z.string().min(1),
  })
  .strict();

/** Manifest policy expression schema. */
export const policyExprSchema: z.ZodType = z.lazy(() =>
  z.union([
    z.string(),
    z.object({ all: z.array(policyExprSchema) }).strict(),
    z.object({ any: z.array(policyExprSchema) }).strict(),
    z.object({ not: policyExprSchema }).strict(),
    z
      .object({
        equals: z.tuple([policyRefOrLiteralSchema, policyRefOrLiteralSchema]),
      })
      .strict(),
    z
      .object({
        "not-equals": z.tuple([
          policyRefOrLiteralSchema,
          policyRefOrLiteralSchema,
        ]),
      })
      .strict(),
    z.object({ exists: policyRefOrLiteralSchema }).strict(),
    z.object({ truthy: policyRefOrLiteralSchema }).strict(),
    z.object({ falsy: policyRefOrLiteralSchema }).strict(),
    z
      .object({
        in: z.tuple([
          policyRefOrLiteralSchema,
          z.array(policyRefOrLiteralSchema),
        ]),
      })
      .strict(),
  ]),
);

/** Top-level named policies schema. */
export const policiesSchema = z.record(policyExprSchema);

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
    .union([
      z.boolean(),
      responsiveSchema(z.boolean()),
      fromRefSchema,
      policyRefSchema,
    ])
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
  text: textWithFromRefSchema,
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
  label: textOrTRefSchema,
  icon: z.string().optional(),
  variant: z
    .enum(["default", "secondary", "outline", "ghost", "destructive", "link"])
    .optional(),
  size: z.enum(["sm", "md", "lg", "icon"]).optional(),
  action: z.union([actionConfigSchema, z.array(actionConfigSchema)]),
  disabled: z.union([z.boolean(), fromRefSchema]).optional(),
});

const selectOptionSchema = z.object({
  label: textOrTRefSchema,
  value: z.string(),
});

export const selectConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("select"),
  options: z.union([z.array(selectOptionSchema), dataSourceSchema]),
  valueField: z.string().optional(),
  labelField: z.string().optional(),
  default: textOrTRefSchema.optional(),
  placeholder: textOrTRefSchema.optional(),
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
 * Manifest toast defaults used by the `toast` action runtime.
 */
export const toastConfigSchema = z
  .object({
    position: z
      .enum([
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ])
      .default("bottom-right"),
    duration: z.number().int().nonnegative().default(4000),
    variants: z
      .record(
        z
          .object({
            icon: z.string().optional(),
            color: z.string().optional(),
            duration: z.number().int().nonnegative().optional(),
          })
          .strict(),
      )
      .optional(),
  })
  .strict();

/**
 * Analytics provider declaration schema.
 */
export const analyticsProviderSchema = z
  .object({
    type: z.enum(["ga4", "posthog", "plausible", "custom"]),
    name: z.string().optional(),
    apiKey: stringOrEnvRef.optional(),
    config: z.record(z.unknown()).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.type === "custom" && !value.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom analytics providers require a name field",
      });
    }
  });

/**
 * Manifest analytics runtime configuration.
 */
export const analyticsConfigSchema = z
  .object({
    providers: z.record(analyticsProviderSchema),
  })
  .strict();

/**
 * Manifest push-notification runtime configuration.
 */
export const pushConfigSchema = z
  .object({
    vapidPublicKey: stringOrEnvRef,
    serviceWorkerPath: z.string().default("/sw.js"),
    applicationServerKey: stringOrEnvRef.optional(),
  })
  .strict();

const customWorkflowActionInputTypeSchema = z.enum([
  "string",
  "number",
  "boolean",
]);

/**
 * Schema for a single manifest-declared custom workflow action input.
 */
export const customWorkflowActionInputSchema = z
  .object({
    type: customWorkflowActionInputTypeSchema,
    required: z.boolean().optional(),
    default: z
      .union([z.string(), z.number(), z.boolean(), z.null()])
      .optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.default === undefined || value.default === null) {
      return;
    }

    if (value.type === "string" && typeof value.default !== "string") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom workflow input default must be a string.",
      });
    }
    if (value.type === "number" && typeof value.default !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom workflow input default must be a number.",
      });
    }
    if (value.type === "boolean" && typeof value.default !== "boolean") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom workflow input default must be a boolean.",
      });
    }
  });

/**
 * Schema for a manifest-declared custom workflow action.
 */
export const customWorkflowActionDeclarationSchema = z
  .object({
    input: z.record(customWorkflowActionInputSchema).optional(),
  })
  .strict();

const customWorkflowControlFlowNodeTypeSet = new Set<string>([
  "if",
  "wait",
  "parallel",
  "retry",
  "assign",
  "try",
  "capture",
]);

const customWorkflowNodeSchema = z
  .object({
    type: z.string().min(1),
    id: z.string().optional(),
    when: workflowConditionSchema.optional(),
  })
  .passthrough()
  .superRefine((node, ctx) => {
    if (customWorkflowControlFlowNodeTypeSet.has(node.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Workflow node "${node.type}" must use its built-in schema shape.`,
      });
    }
  });

const manifestWorkflowNodeSchema: z.ZodType = z.lazy(() =>
  z.union([
    customWorkflowNodeSchema,
    z
      .object({
        type: z.literal("if"),
        id: z.string().optional(),
        when: workflowConditionSchema.optional(),
        condition: workflowConditionSchema,
        then: z.union([
          manifestWorkflowNodeSchema,
          z.array(manifestWorkflowNodeSchema),
        ]),
        else: z
          .union([
            manifestWorkflowNodeSchema,
            z.array(manifestWorkflowNodeSchema),
          ])
          .optional(),
      })
      .strict(),
    z
      .object({
        type: z.literal("wait"),
        id: z.string().optional(),
        when: workflowConditionSchema.optional(),
        duration: z.number().int().min(0),
      })
      .strict(),
    z
      .object({
        type: z.literal("parallel"),
        id: z.string().optional(),
        when: workflowConditionSchema.optional(),
        branches: z
          .array(
            z.union([
              manifestWorkflowNodeSchema,
              z.array(manifestWorkflowNodeSchema),
            ]),
          )
          .min(1),
      })
      .strict(),
    z
      .object({
        type: z.literal("retry"),
        id: z.string().optional(),
        when: workflowConditionSchema.optional(),
        attempts: z.number().int().min(1),
        delayMs: z.number().int().min(0).optional(),
        backoffMultiplier: z.number().positive().optional(),
        step: z.union([
          manifestWorkflowNodeSchema,
          z.array(manifestWorkflowNodeSchema),
        ]),
        onFailure: z
          .union([
            manifestWorkflowNodeSchema,
            z.array(manifestWorkflowNodeSchema),
          ])
          .optional(),
      })
      .strict(),
    z
      .object({
        type: z.literal("assign"),
        id: z.string().optional(),
        when: workflowConditionSchema.optional(),
        values: z.record(z.unknown()),
      })
      .strict(),
    z
      .object({
        type: z.literal("try"),
        id: z.string().optional(),
        when: workflowConditionSchema.optional(),
        step: z.union([
          manifestWorkflowNodeSchema,
          z.array(manifestWorkflowNodeSchema),
        ]),
        catch: z
          .union([
            manifestWorkflowNodeSchema,
            z.array(manifestWorkflowNodeSchema),
          ])
          .optional(),
        finally: z
          .union([
            manifestWorkflowNodeSchema,
            z.array(manifestWorkflowNodeSchema),
          ])
          .optional(),
      })
      .strict(),
    z
      .object({
        type: z.literal("capture"),
        id: z.string().optional(),
        when: workflowConditionSchema.optional(),
        action: actionConfigSchema,
        as: z.string().min(1),
      })
      .strict(),
  ]),
);

const manifestWorkflowDefinitionSchema: z.ZodType = z.union([
  manifestWorkflowNodeSchema,
  z.array(manifestWorkflowNodeSchema),
]);

const workflowActionsSchema = z
  .object({
    custom: z.record(customWorkflowActionDeclarationSchema).optional(),
  })
  .strict();

/**
 * Schema for manifest workflow definitions plus action declarations.
 */
export const workflowsConfigSchema = z
  .object({
    actions: workflowActionsSchema.optional(),
  })
  .catchall(manifestWorkflowDefinitionSchema);

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
 * Manifest client declaration for per-resource backend selection.
 */
export const clientConfigSchema = z
  .object({
    apiUrl: stringOrEnvRef,
    contract: authContractSchema.optional(),
    custom: z.string().min(1).optional(),
  })
  .strict();

/**
 * Named client registry in the manifest.
 */
export const clientsSchema = z.record(clientConfigSchema);

/**
 * Manifest realtime WebSocket configuration.
 *
 * `events` is merged into `on` so runtime workflow resolution can treat
 * lifecycle hooks and event hooks uniformly.
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
      .catchall(z.string())
      .optional(),
    events: z.record(z.string()).optional(),
  })
  .strict()
  .transform((value) => ({
    ...value,
    on: {
      ...(value.on ?? {}),
      ...(value.events ?? {}),
    },
  }));

/**
 * Manifest realtime SSE endpoint configuration.
 *
 * `events` is merged into `on` so runtime workflow resolution can treat
 * lifecycle hooks and event hooks uniformly.
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
      .catchall(z.string())
      .optional(),
    events: z.record(z.string()).optional(),
  })
  .strict()
  .transform((value) => ({
    ...value,
    on: {
      ...(value.on ?? {}),
      ...(value.events ?? {}),
    },
  }));

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
      label: plainTextOrTRefSchema,
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
    label: textOrTRefSchema,
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
    label: textOrTRefSchema.optional(),
    placeholder: textOrTRefSchema.optional(),
  })
  .strict();

const authProviderTypeSchema = z.enum([
  "google",
  "github",
  "microsoft",
  "apple",
  "facebook",
  "discord",
  "custom",
]);

/**
 * Auth provider declaration schema.
 *
 * Declared at `manifest.auth.providers.<name>`.
 */
export const authProviderSchema = z
  .object({
    type: authProviderTypeSchema,
    clientId: stringOrEnvRef.optional(),
    clientSecret: stringOrEnvRef.optional(),
    scopes: z.array(z.string()).optional(),
    callbackPath: z.string().optional(),
    label: textOrTRefSchema.optional(),
    description: textOrTRefSchema.optional(),
    autoRedirect: z.boolean().optional(),
    name: z.string().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.type === "custom" && !value.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom OAuth providers require a name field",
      });
    }
  });

const authProviderRefListSchema = z.array(z.string());

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
    title: textOrTRefSchema.optional(),
    description: textOrTRefSchema.optional(),
    submitLabel: textOrTRefSchema.optional(),
    successMessage: textOrTRefSchema.optional(),
    sections: z.array(authScreenSectionSchema).min(1).optional(),
    labels: z
      .object({
        providersHeading: textOrTRefSchema.optional(),
        passkeyButton: textOrTRefSchema.optional(),
        method: textOrTRefSchema.optional(),
        resend: textOrTRefSchema.optional(),
      })
      .strict()
      .optional(),
    providers: authProviderRefListSchema.optional(),
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
    providers: z.record(authProviderSchema).optional(),
    providerMode: z.enum(["buttons", "auto"]).optional(),
    mfa: z
      .object({
        issuer: z.string().optional(),
        period: z.number().int().positive().default(30),
        methods: z
          .array(z.enum(["totp", "email", "sms", "webauthn"]))
          .optional(),
      })
      .strict()
      .optional(),
    webauthn: z
      .object({
        rpId: z.string().optional(),
        rpName: z.string().optional(),
        attestation: z.enum(["none", "indirect", "direct"]).default("none"),
      })
      .strict()
      .optional(),
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
        title: textOrTRefSchema.optional(),
        description: textOrTRefSchema.optional(),
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
  "stacked",
  "minimal",
  "full-width",
]);

export const pageConfigSchema = z
  .object({
    title: textOrTRefSchema.optional(),
    content: z.array(componentConfigSchema).min(1),
    roles: z.array(z.string()).optional(),
    breadcrumb: plainTextOrTRefSchema.optional(),
  })
  .strict();

/**
 * Slot declaration for a route layout.
 */
export const routeLayoutSlotSchema = z
  .object({
    name: z.string().min(1),
    required: z.boolean().default(false),
    fallback: componentConfigSchema.optional(),
  })
  .strict();

/**
 * Route layout declaration.
 *
 * Supports built-in layout names and object form for explicit props/slots.
 */
export const routeLayoutSchema = z.union([
  layoutSchema,
  z
    .object({
      type: z.string().min(1),
      props: z.record(z.unknown()).optional(),
      slots: z.array(routeLayoutSlotSchema).optional(),
    })
    .strict(),
]);

export const routeConfigSchema = pageConfigSchema
  .extend({
    id: z.string().min(1),
    path: z.string().startsWith("/"),
    layouts: z.array(routeLayoutSchema).optional(),
    slots: z.record(z.array(componentConfigSchema)).optional(),
    preload: z.array(endpointTargetSchema).optional(),
    refreshOnEnter: z.array(z.string().min(1)).optional(),
    invalidateOnLeave: z.array(z.string().min(1)).optional(),
    enter: z
      .union([z.string().min(1), manifestWorkflowDefinitionSchema])
      .optional(),
    leave: z
      .union([z.string().min(1), manifestWorkflowDefinitionSchema])
      .optional(),
    guard: z
      .object({
        authenticated: z.boolean().optional(),
        roles: z.array(z.string()).optional(),
        policy: z.string().min(1).optional(),
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
    title: textOrTRefSchema.optional(),
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
    middleware: z
      .array(
        z
          .object({
            match: z.string().optional(),
            workflow: z.string().min(1),
          })
          .strict(),
      )
      .optional(),
  })
  .strict();

const overlayFooterActionSchema = z
  .object({
    label: textOrTRefSchema,
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
      title: overlayTitleSchema.optional(),
      size: z.enum(["sm", "md", "lg", "xl", "full"]).optional(),
      content: z.array(componentConfigSchema).min(1),
      onOpen: z
        .union([z.string().min(1), manifestWorkflowDefinitionSchema])
        .optional(),
      onClose: z
        .union([z.string().min(1), manifestWorkflowDefinitionSchema])
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
      title: overlayTitleSchema.optional(),
      size: z.enum(["sm", "md", "lg", "xl", "full"]).optional(),
      side: z.enum(["left", "right"]).optional(),
      content: z.array(componentConfigSchema).min(1),
      onOpen: z
        .union([z.string().min(1), manifestWorkflowDefinitionSchema])
        .optional(),
      onClose: z
        .union([z.string().min(1), manifestWorkflowDefinitionSchema])
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

const lazyManifestConfigSchema: z.ZodType = z.lazy(() => manifestConfigSchema);

/**
 * Inheritance flags for mounted sub-manifests.
 */
export const subAppInheritSchema = z
  .object({
    theme: z.boolean().default(true),
    i18n: z.boolean().default(true),
    policies: z.boolean().default(true),
    state: z.boolean().default(false),
  })
  .strict();

/**
 * Sub-application mount configuration.
 */
export const subAppConfigSchema = z
  .object({
    mountPath: z.string().startsWith("/"),
    manifest: z.union([z.string().min(1), lazyManifestConfigSchema]),
    inherit: subAppInheritSchema.optional(),
  })
  .strict();

/**
 * Named sub-application map keyed by sub-app id.
 */
export const subAppsSchema = z.record(subAppConfigSchema);

export const manifestConfigSchema = z
  .object({
    $schema: z.string().optional(),
    app: appConfigSchema.optional(),
    components: componentsConfigSchema.optional(),
    theme: themeConfigSchema.optional(),
    toast: toastConfigSchema.optional(),
    analytics: analyticsConfigSchema.optional(),
    push: pushConfigSchema.optional(),
    ssr: manifestSsrConfigSchema.optional(),
    state: z.record(stateValueConfigSchema).optional(),
    navigation: navigationConfigSchema.optional(),
    auth: authScreenConfigSchema.optional(),
    realtime: realtimeConfigSchema.optional(),
    clients: clientsSchema.optional(),
    resources: z.record(resourceConfigSchema).optional(),
    workflows: workflowsConfigSchema.optional(),
    overlays: z.record(overlayConfigSchema).optional(),
    presets: z.record(z.unknown()).optional(),
    policies: policiesSchema.optional(),
    i18n: i18nConfigSchema.optional(),
    subApps: subAppsSchema.optional(),
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
        if (typeof target !== "string") {
          continue;
        }

        if (!resourceNames.has(target)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["resources", name, "invalidates"],
            message: `Unknown invalidation target "${target}"`,
          });
        }
      }

      const optimisticTarget = resource.optimistic?.target;
      if (optimisticTarget) {
        const targetResource =
          typeof optimisticTarget === "string"
            ? optimisticTarget
            : optimisticTarget.resource;
        if (!resourceNames.has(targetResource)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["resources", name, "optimistic", "target"],
            message: `Unknown optimistic target resource "${targetResource}"`,
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
