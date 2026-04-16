/**
 * Manifest Zod schemas.
 *
 * Defines the validation schemas for the snapshot manifest format
 * (`snapshot.manifest.json`). Uses a dynamic component schema registry
 * so each component phase can register its own schema.
 */

import { z } from "zod";
import { exprRefSchema, fromRefSchema } from "@lastshotlabs/frontend-contract/refs";
import { stateValueConfigSchema } from "@lastshotlabs/frontend-contract/state";
import { themeConfigSchema } from "../tokens/schema";
import { workflowConditionSchema } from "../workflows/schema";
import {
  componentAnimationSchema,
  componentBackgroundSchema,
  componentTransitionSchema,
  componentZIndexSchema,
  hoverConfigSchema,
  focusConfigSchema,
  activeConfigSchema,
  exitAnimationSchema,
  spacingEnum,
  slotsSchema,
} from "../components/_base/schema";
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
import { confirmDialogConfigSchema } from "../components/overlay/confirm-dialog/schema";
import { envRefSchema } from "./env";
import { i18nConfigSchema, tRefSchema } from "../i18n/schema";

export { fromRefSchema } from "@lastshotlabs/frontend-contract/refs";
export { stateValueConfigSchema };

/**
 * Accept either a literal string or an environment reference.
 */
export const stringOrEnvRef = z.union([z.string(), envRefSchema]);

/**
 * An expression value evaluated safely through the Snapshot AST parser.
 */
export const exprSchema = exprRefSchema;

const textWithFromRefSchema = z.union([
  stringOrEnvRef,
  fromRefSchema,
  exprSchema,
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
    oauthStart: stringOrEnvRef.optional(),
    oauthCallback: stringOrEnvRef.optional(),
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

/**
 * Register a component-specific manifest schema by component `type`.
 */
export function registerComponentSchema(type: string, schema: z.ZodType): void {
  componentSchemaRegistry.set(type, schema);
}

/**
 * Return the currently registered manifest component type names.
 */
export function getRegisteredSchemaTypes(): string[] {
  return [...componentSchemaRegistry.keys()];
}

export function getRegisteredSchemas(): Map<string, z.ZodType> {
  return new Map(componentSchemaRegistry);
}

/**
 * Shared base schema applied to all manifest-driven components.
 */
export const baseComponentConfigSchema = z.object({
  type: z.string(),
  id: z.string().optional(),
  tokens: z.record(z.string()).optional(),
  visibleWhen: z.string().optional(),
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
  sticky: z
    .union([
      z.boolean(),
      z
        .object({
          top: z.string().optional(),
          zIndex: componentZIndexSchema.optional(),
        })
        .strict(),
    ])
    .optional(),
  zIndex: componentZIndexSchema.optional(),
  animation: componentAnimationSchema.optional(),
  glass: z.boolean().optional(),
  background: componentBackgroundSchema.optional(),
  transition: componentTransitionSchema.optional(),
  ariaLabel: z.string().optional(),
  ariaDescribedBy: z.string().optional(),
  role: z.string().optional(),
  ariaLive: z.enum(["off", "polite", "assertive"]).optional(),

  // ── Universal style props ───────────────────────────────────────────────
  padding: responsiveSchema(z.union([spacingEnum, z.string()])).optional(),
  paddingX: responsiveSchema(z.union([spacingEnum, z.string()])).optional(),
  paddingY: responsiveSchema(z.union([spacingEnum, z.string()])).optional(),
  margin: responsiveSchema(z.union([spacingEnum, z.string()])).optional(),
  marginX: responsiveSchema(z.union([spacingEnum, z.string()])).optional(),
  marginY: responsiveSchema(z.union([spacingEnum, z.string()])).optional(),
  gap: responsiveSchema(z.union([spacingEnum, z.string()])).optional(),
  width: responsiveSchema(z.string()).optional(),
  minWidth: responsiveSchema(z.string()).optional(),
  maxWidth: responsiveSchema(z.string()).optional(),
  height: responsiveSchema(z.string()).optional(),
  minHeight: responsiveSchema(z.string()).optional(),
  maxHeight: responsiveSchema(z.string()).optional(),
  bg: z.union([z.string(), componentBackgroundSchema]).optional(),
  color: z.string().optional(),
  borderRadius: z
    .union([z.enum(["none", "xs", "sm", "md", "lg", "xl", "full"]), z.string()])
    .optional(),
  border: z.string().optional(),
  shadow: z
    .union([z.enum(["none", "xs", "sm", "md", "lg", "xl"]), z.string()])
    .optional(),
  opacity: z.number().min(0).max(1).optional(),
  overflow: z.enum(["auto", "hidden", "scroll", "visible"]).optional(),
  cursor: z.string().optional(),
  position: z.enum(["relative", "absolute", "fixed", "sticky"]).optional(),
  inset: z.string().optional(),
  display: responsiveSchema(
    z.enum([
      "flex",
      "grid",
      "block",
      "inline",
      "inline-flex",
      "inline-grid",
      "none",
    ]),
  ).optional(),
  flexDirection: responsiveSchema(
    z.enum(["row", "column", "row-reverse", "column-reverse"]),
  ).optional(),
  alignItems: z
    .enum(["start", "center", "end", "stretch", "baseline"])
    .optional(),
  justifyContent: z
    .enum(["start", "center", "end", "between", "around", "evenly"])
    .optional(),
  flexWrap: z.enum(["wrap", "nowrap", "wrap-reverse"]).optional(),
  flex: z.string().optional(),
  gridTemplateColumns: z.string().optional(),
  gridTemplateRows: z.string().optional(),
  gridColumn: z.string().optional(),
  gridRow: z.string().optional(),
  textAlign: z.enum(["left", "center", "right", "justify"]).optional(),
  fontSize: responsiveSchema(
    z.union([
      z.enum(["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]),
      z.string(),
    ]),
  ).optional(),
  fontWeight: z
    .union([
      z.enum(["light", "normal", "medium", "semibold", "bold"]),
      z.number(),
    ])
    .optional(),
  lineHeight: z
    .union([
      z.enum(["none", "tight", "snug", "normal", "relaxed", "loose"]),
      z.string(),
    ])
    .optional(),
  letterSpacing: z
    .union([z.enum(["tight", "normal", "wide"]), z.string()])
    .optional(),

  // ── Interactive state props ─────────────────────────────────────────────
  hover: hoverConfigSchema.optional(),
  focus: focusConfigSchema.optional(),
  active: activeConfigSchema.optional(),

  // ── Exit animation ──────────────────────────────────────────────────────
  exitAnimation: exitAnimationSchema.optional(),
});

export const urlSyncConfigSchema = z.union([
  z.boolean(),
  z
    .object({
      params: z.record(z.string(), z.string()),
      replace: z.boolean().default(true),
    })
    .strict(),
]);

export const clientFilterSchema = z
  .object({
    field: z.string(),
    operator: z.enum([
      "equals",
      "contains",
      "startsWith",
      "endsWith",
      "gt",
      "lt",
      "gte",
      "lte",
      "in",
      "notEquals",
    ]),
    value: z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.unknown()),
      fromRefSchema,
      exprSchema,
    ]),
  })
  .strict();

export const clientSortSchema = z
  .object({
    field: z.string(),
    direction: z.enum(["asc", "desc"]).default("asc"),
  })
  .strict();

export const liveConfigSchema = z.union([
  z.boolean(),
  z
    .object({
      event: z.string().min(1).default("*"),
      debounce: z.number().int().positive().optional(),
      indicator: z.boolean().default(false),
    })
    .strict(),
]);

export const loadingConfigSchema = z
  .object({
    disabled: z.boolean().optional(),
    variant: z
      .enum(["auto", "table", "list", "card", "text", "chart", "stat"])
      .default("auto"),
    rows: z.number().int().positive().optional(),
    count: z.number().int().positive().optional(),
    delay: z.number().int().nonnegative().default(100),
  })
  .strict();

const actionConfigSchema: z.ZodType = z.lazy(() =>
  z
    .object({
      type: z.string(),
    })
    .passthrough(),
);

export const emptyStateConfigSchema = z
  .object({
    icon: z.string().optional(),
    title: z.string().default("No data"),
    description: z.string().optional(),
    action: z
      .object({
        label: z.string(),
        action: z.union([actionConfigSchema, z.array(actionConfigSchema)]),
        icon: z.string().optional(),
        variant: z.enum(["default", "primary", "outline"]).default("primary"),
      })
      .strict()
      .optional(),
  })
  .strict();

export const errorStateConfigSchema = z
  .object({
    /** Heading text. Default: "Something went wrong". */
    title: z.string().optional(),
    /** Supporting text shown below the title. */
    description: z.string().optional(),
    /**
     * Show a retry button. Pass `true` for the default label ("Retry") or
     * `{ label: "..." }` to customise it.
     */
    retry: z
      .union([z.boolean(), z.object({ label: z.string() }).strict()])
      .optional(),
    /** Icon name. Default: "circle-alert". */
    icon: z.string().optional(),
  })
  .strict();

/**
 * Suspense fallback descriptor used by layout-like manifest components.
 * Supports built-in loading placeholders or a custom component payload.
 */
export const suspenseFallbackSchema = z
  .object({
    type: z.enum(["skeleton", "spinner", "custom"]),
    variant: z.enum(["card", "list", "text", "table"]).optional(),
    count: z.number().int().positive().optional(),
    component: z.record(z.unknown()).optional(),
  })
  .strict();

/**
 * Schema for the built-in `row` layout component.
 */
export const rowConfigSchema: z.ZodType = z.lazy(() =>
  baseComponentConfigSchema.extend({
    type: z.literal("row"),
    gap: responsiveSchema(
      z.enum(["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl"]),
    ).optional(),
    justify: z.enum(["start", "center", "end", "between", "around"]).optional(),
    align: z.enum(["start", "center", "end", "stretch"]).optional(),
    wrap: z.boolean().optional(),
    overflow: z.enum(["auto", "hidden", "scroll", "visible"]).optional(),
    maxHeight: z.string().optional(),
    suspense: suspenseFallbackSchema.optional(),
    children: z.array(componentConfigSchema).min(1),
  }),
);

/**
 * Schema for the built-in `heading` component.
 */
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
  align: z.enum(["left", "center", "right"]).optional(),
  fallback: z.string().optional(),
  slots: slotsSchema(["root"]).optional(),
});

const eventActionValueSchema = z.union([
  actionConfigSchema,
  z.array(actionConfigSchema),
]);

export const eventActionMapSchema = z.record(eventActionValueSchema);

export const shortcutConfigSchema = z
  .object({
    label: z.string().optional(),
    action: z.union([actionConfigSchema, z.array(actionConfigSchema)]),
    disabled: z.union([z.boolean(), policyExprSchema]).optional(),
  })
  .strict();

export const shortcutsConfigSchema = z.record(shortcutConfigSchema);

/**
 * Schema for the built-in `button` component.
 */
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
  /** Stretch button to fill its container. Default false (content width). */
  fullWidth: z.boolean().optional(),
});

const selectOptionSchema = z.object({
  label: textOrTRefSchema,
  value: z.string(),
});

/**
 * Schema for the built-in `select` component.
 */
export const selectConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("select"),
  options: z.union([z.array(selectOptionSchema), dataSourceSchema]),
  valueField: z.string().optional(),
  labelField: z.string().optional(),
  default: textOrTRefSchema.optional(),
  placeholder: textOrTRefSchema.optional(),
});

/** Zod config schema for the Card component. Defines a card container with optional title, subtitle, children, gap, and suspense fallback. */
export const cardConfigSchema = baseComponentConfigSchema
  .extend({
    type: z.literal("card"),
    title: textWithFromRefSchema.optional(),
    subtitle: textWithFromRefSchema.optional(),
    children: z.array(z.lazy(() => componentConfigSchema)).default([]),
    gap: responsiveSchema(z.string()).optional(),
    suspense: suspenseFallbackSchema.optional(),
  })
  .strict();

export const sectionConfigSchema = z
  .object({
    type: z.literal("section"),
    id: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    children: z.array(z.lazy(() => componentConfigSchema)).default([]),
    gap: z.union([z.string(), responsiveSchema(z.string())]).optional(),
    divider: z.boolean().optional(),
    suspense: suspenseFallbackSchema.optional(),
    className: z.string().optional(),
    style: z.record(z.union([z.string(), z.number()])).optional(),
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
  })
  .strict();

export const containerConfigSchema = z
  .object({
    type: z.literal("container"),
    id: z.string().optional(),
    maxWidth: z.string().optional(),
    children: z.array(z.lazy(() => componentConfigSchema)).default([]),
    suspense: suspenseFallbackSchema.optional(),
    className: z.string().optional(),
    style: z.record(z.union([z.string(), z.number()])).optional(),
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
  })
  .strict();

export const backgroundConfigSchema = z
  .object({
    image: z.string().optional(),
    position: z.string().optional(),
    size: z.string().optional(),
    overlay: z.string().optional(),
  })
  .strict();

export const gridConfigSchema = z
  .object({
    type: z.literal("grid"),
    id: z.string().optional(),
    columns: z
      .union([
        z.number(),
        z.string(),
        responsiveSchema(z.union([z.number(), z.string()])),
      ])
      .optional(),
    template: z.string().optional(),
    rows: z.string().optional(),
    areas: z.array(z.string()).optional(),
    gap: z.union([z.string(), responsiveSchema(z.string())]).optional(),
    children: z.array(z.lazy(() => componentConfigSchema)).default([]),
    background: backgroundConfigSchema.optional(),
    suspense: suspenseFallbackSchema.optional(),
    className: z.string().optional(),
    style: z.record(z.union([z.string(), z.number()])).optional(),
    visible: z.union([z.boolean(), fromRefSchema]).optional(),
  })
  .strict();

export const spacerConfigSchema = z
  .object({
    type: z.literal("spacer"),
    size: z.string().optional(),
    flex: z.boolean().optional(),
    className: z.string().optional(),
    style: z.record(z.union([z.string(), z.number()])).optional(),
  })
  .strict();

const customComponentPropTypeSchema = z.enum(["string", "number", "boolean"]);

/**
 * Schema for a declared prop on a manifest custom component registration.
 */
export const customComponentPropSchema = z
  .object({
    type: customComponentPropTypeSchema,
    required: z.boolean().optional(),
    default: z
      .union([z.string(), z.number(), z.boolean(), z.null()])
      .optional(),
  })
  .strict();

/**
 * Schema for a custom component declaration under `components.custom`.
 */
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

export const observabilityConfigSchema = z
  .object({
    audit: z
      .object({
        sink: z.string().min(1),
      })
      .strict()
      .optional(),
    errors: z
      .object({
        sink: z.string().min(1),
        include: z.array(z.string()).optional(),
      })
      .strict()
      .optional(),
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
    /**
     * The field in the /me response to use as the canonical user ID.
     * Defaults to "userId" to match bunshot's /auth/me response shape.
     * Override to "id" or any other field name for non-bunshot backends.
     */
    userIdField: z.string().min(1).default("userId"),
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
    auth: z
      .object({
        strategy: z.enum(["query-param", "first-message"]),
        paramName: z.string().default("token"),
      })
      .strict()
      .optional(),
    reconnect: z
      .object({
        enabled: z.boolean().default(true),
        maxAttempts: z.number().int().positive().default(10),
        baseDelay: z.number().int().positive().default(1000),
        maxDelay: z.number().int().positive().default(30000),
      })
      .strict()
      .optional(),
    heartbeat: z
      .object({
        enabled: z.boolean().default(false),
        interval: z.number().int().positive().default(30000),
        message: z.string().default("ping"),
      })
      .strict()
      .optional(),
    on: z
      .object({
        connected: z.string().optional(),
        disconnected: z.string().optional(),
        reconnecting: z.string().optional(),
        reconnectFailed: z.string().optional(),
      })
      .catchall(z.string())
      .optional(),
    events: z.record(z.union([z.string(), eventActionValueSchema])).optional(),
    eventActions: z.record(eventActionValueSchema).optional(),
  })
  .strict()
  .transform((value) => ({
    ...value,
    autoReconnect: value.reconnect?.enabled ?? value.autoReconnect,
    maxReconnectAttempts:
      value.reconnect?.maxAttempts ?? value.maxReconnectAttempts,
    reconnectBaseDelay: value.reconnect?.baseDelay ?? value.reconnectBaseDelay,
    reconnectMaxDelay: value.reconnect?.maxDelay ?? value.reconnectMaxDelay,
    on: {
      ...(value.on ?? {}),
      ...Object.fromEntries(
        Object.entries(value.events ?? {}).filter(
          ([, eventValue]) => typeof eventValue === "string",
        ),
      ),
    },
    eventActions: {
      ...(value.eventActions ?? {}),
      ...Object.fromEntries(
        Object.entries(value.events ?? {}).filter(
          ([, eventValue]) => typeof eventValue !== "string",
        ),
      ),
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
    events: z.record(z.union([z.string(), eventActionValueSchema])).optional(),
    eventActions: z.record(eventActionValueSchema).optional(),
  })
  .strict()
  .transform((value) => ({
    ...value,
    on: {
      ...(value.on ?? {}),
      ...Object.fromEntries(
        Object.entries(value.events ?? {}).filter(
          ([, eventValue]) => typeof eventValue === "string",
        ),
      ),
    },
    eventActions: {
      ...(value.eventActions ?? {}),
      ...Object.fromEntries(
        Object.entries(value.events ?? {}).filter(
          ([, eventValue]) => typeof eventValue !== "string",
        ),
      ),
    },
  }));

export const presenceConfigSchema = z
  .object({
    enabled: z.boolean().default(false),
    channel: z.string().min(1),
    heartbeatInterval: z.number().int().positive().default(10000),
    offlineThreshold: z.number().int().positive().default(30000),
    userData: z.record(z.unknown()).optional(),
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
    presence: presenceConfigSchema.optional(),
  })
  .strict();

/**
 * Schema for the top-level `components` section of a manifest.
 */
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

/**
 * All field names defined in baseComponentConfigSchema.
 *
 * Used to strip base fields before validating with component-specific schemas
 * that don't extend the base (standalone `.strict()` schemas). Components that
 * DO extend the base handle these fields via their `.extend()` override.
 */
const baseFieldNames = new Set(Object.keys(baseComponentConfigSchema.shape));

/**
 * Union schema covering every component config Snapshot can render from a manifest.
 */
export const componentConfigSchema: z.ZodType = z
  .object({ type: z.string() })
  .passthrough()
  .superRefine((data, ctx) => {
    const schema = componentSchemaRegistry.get(data.type);
    if (!schema) {
      const baseResult = baseComponentConfigSchema.safeParse(data);
      if (!baseResult.success) {
        for (const issue of baseResult.error.issues) {
          ctx.addIssue(issue);
        }
      }
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown component type "${data.type}". Available types: ${[...componentSchemaRegistry.keys()].join(", ")}`,
      });
      return;
    }

    // Try full validation first (works for schemas that extend the base).
    const fullResult = schema.safeParse(data);
    if (fullResult.success) return;

    // If full validation failed with unrecognized base keys, the schema is
    // standalone — fall back to two-phase: validate base, then component
    // with base fields stripped.
    const hasBaseKeyError = fullResult.error.issues.some(
      (i) =>
        i.code === "unrecognized_keys" &&
        (i as { keys?: string[] }).keys?.every((k) => baseFieldNames.has(k)),
    );

    if (hasBaseKeyError) {
      // Phase 1: validate base fields (don't early-return on failure so
      // component overrides like chart's height still get checked).
      const baseResult = baseComponentConfigSchema.safeParse(data);

      // Phase 2: strip base fields, validate component-specific fields.
      const componentData = Object.fromEntries(
        Object.entries(data).filter(
          ([key]) => !baseFieldNames.has(key) || key === "type",
        ),
      );
      const componentResult = schema.safeParse(componentData);

      // Report base errors, but skip fields the component schema overrides.
      if (!baseResult.success) {
        const componentRejects = new Set(
          componentResult.success
            ? []
            : componentResult.error.issues.map((i) => String(i.path[0])),
        );
        for (const issue of baseResult.error.issues) {
          const field = String(issue.path[0] ?? "");
          if (componentRejects.has(field)) continue;
          ctx.addIssue(issue);
        }
      }
      if (!componentResult.success) {
        for (const issue of componentResult.error.issues) {
          ctx.addIssue(issue);
        }
      }
    } else {
      // No base-key mismatch — report full validation errors directly.
      for (const issue of fullResult.error.issues) {
        ctx.addIssue(issue);
      }
    }
  });

registerComponentSchema("row", rowConfigSchema);
registerComponentSchema("heading", headingConfigSchema);
registerComponentSchema("button", buttonConfigSchema);
registerComponentSchema("select", selectConfigSchema);
registerComponentSchema("card", cardConfigSchema);
registerComponentSchema("section", sectionConfigSchema);
registerComponentSchema("container", containerConfigSchema);
registerComponentSchema("grid", gridConfigSchema);
registerComponentSchema("spacer", spacerConfigSchema);
registerComponentSchema("spinner", spinnerConfigSchema);
registerComponentSchema("error-page", errorPageConfigSchema);
registerComponentSchema("not-found", notFoundConfigSchema);
registerComponentSchema("offline-banner", offlineBannerConfigSchema);

/**
 * Recursive schema for navigation items used by manifest navigation surfaces.
 */
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
      slots: slotsSchema([
        "item",
        "itemLabel",
        "itemIcon",
        "itemBadge",
        "dropdownItem",
        "dropdownItemLabel",
        "dropdownItemIcon",
      ]).optional(),
      children: z.array(navItemSchema).optional(),
    })
    .strict(),
);

/**
 * Schema for the top-level manifest navigation configuration.
 */
export const navigationConfigSchema: z.ZodType<Record<string, any>> = z
  .object({
    mode: z.enum(["sidebar", "top-nav"]).optional(),
    items: z.array(navItemSchema).optional(),
    template: z.array(componentConfigSchema).optional(),
    collapsible: z.boolean().optional(),
    userMenu: z
      .union([
        z.boolean(),
        z
          .object({
            showAvatar: z.boolean().optional(),
            showEmail: z.boolean().optional(),
            items: z
              .array(
                z
                  .object({
                    label: plainTextOrTRefSchema,
                    icon: z.string().optional(),
                    action: actionConfigSchema,
                    roles: z.array(z.string()).optional(),
                    slots: slotsSchema([
                      "item",
                      "itemLabel",
                      "itemIcon",
                    ]).optional(),
                  })
                  .strict(),
              )
              .optional(),
          })
          .strict(),
      ])
      .optional(),
    logo: z
      .object({
        src: z.string().optional(),
        text: plainTextOrTRefSchema.optional(),
        path: z.string().startsWith("/").optional(),
      })
      .strict()
      .optional(),
    className: z.string().optional(),
    style: z.record(z.union([z.string(), z.number()])).optional(),
    slots: slotsSchema([
      "root",
      "brand",
      "brandIcon",
      "brandLabel",
      "list",
      "item",
      "itemLabel",
      "itemIcon",
      "itemBadge",
      "dropdown",
      "dropdownItem",
      "dropdownItemLabel",
      "dropdownItemIcon",
      "userMenu",
      "userMenuTrigger",
      "userMenuItem",
      "userAvatar",
    ]).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.items && !data.template) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Navigation must define either 'items' (legacy mode) or 'template' (composable mode)",
      });
    }
  });

const authScreenNameSchema = z.enum([
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verify-email",
  "mfa",
  "sso-callback",
]);

const authScreenModeSchema = z.union([z.literal("default"), z.literal(false)]);

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

/**
 * Schema for the manifest auth screen and auth workflow configuration.
 */
export const authScreenConfigSchema = z
  .object({
    screens: z
      .union([
        z.array(authScreenNameSchema),
        z.record(authScreenNameSchema, authScreenModeSchema),
      ])
      .optional(),
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

export const layoutSchema = z.string().min(1);

/**
 * Schema for a manifest page definition.
 */
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

/**
 * Object-form route guard schema with auth, role, and policy controls.
 */
export const routeGuardConfigSchema = z
  .object({
    name: z.string().min(1).optional(),
    authenticated: z.boolean().optional(),
    roles: z.array(z.string()).optional(),
    policy: z.string().min(1).optional(),
    redirectTo: z.string().min(1).optional(),
    render: componentConfigSchema.optional(),
  })
  .strict();

/**
 * Route guard schema, accepting either a named guard or inline guard config.
 */
export const routeGuardSchema = z.union([
  z.string().min(1),
  routeGuardConfigSchema,
]);

/**
 * Schema for route transition metadata.
 */
export const routeTransitionSchema = z
  .object({
    enter: z.string().default("fade-in"),
    exit: z.string().default("fade-out"),
    duration: z.number().int().positive().default(200),
    easing: z.string().default("ease"),
  })
  .strict();

/**
 * Schema for the built-in `outlet` component used by route layouts.
 */
export const outletComponentSchema = baseComponentConfigSchema
  .extend({
    type: z.literal("outlet"),
    fallback: z.array(componentConfigSchema).optional(),
    slots: slotsSchema(["root"]).optional(),
  })
  .strict();

registerComponentSchema("outlet", outletComponentSchema);

/**
 * Recursive schema for a manifest route tree node.
 */
export const routeConfigSchema: z.ZodType = z.lazy(() =>
  z
    .object({
      id: z.string().min(1),
      path: z.string().min(1),
      title: textOrTRefSchema.optional(),
      content: z.array(componentConfigSchema).min(1).optional(),
      roles: z.array(z.string()).optional(),
      breadcrumb: plainTextOrTRefSchema.optional(),
      shell: z.literal(false).optional(),
      layouts: z.array(routeLayoutSchema).optional(),
      slots: z.record(z.array(componentConfigSchema)).optional(),
      preload: z.array(endpointTargetSchema).optional(),
      prefetch: z.array(endpointTargetSchema).optional(),
      refreshOnEnter: z.array(z.string().min(1)).optional(),
      invalidateOnLeave: z.array(z.string().min(1)).optional(),
      enter: z
        .union([z.string().min(1), manifestWorkflowDefinitionSchema])
        .optional(),
      leave: z
        .union([z.string().min(1), manifestWorkflowDefinitionSchema])
        .optional(),
      guard: routeGuardSchema.optional(),
      events: eventActionMapSchema.optional(),
      transition: routeTransitionSchema.optional(),
      preset: z.string().optional(),
      presetConfig: z.record(z.unknown()).optional(),
      children: z.array(routeConfigSchema).optional(),
    })
    .strict()
    .refine(
      (data) => {
        if (data.preset && data.content) {
          return false;
        }
        return Boolean(data.preset || data.content);
      },
      {
        message: "Route must define either content or preset, but not both.",
      },
    ),
);

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

/**
 * Schema for the top-level manifest `app` section.
 */
export const appConfigSchema = z
  .object({
    apiUrl: stringOrEnvRef.optional(),
    title: textOrTRefSchema.optional(),
    shell: layoutSchema.default("full-width"),
    headers: z.record(z.union([stringOrEnvRef, fromRefSchema])).optional(),
    cache: appCacheSchema.optional(),
    home: z.string().startsWith("/").optional(),
    loading: z.union([componentConfigSchema, stringOrEnvRef]).optional(),
    error: z.union([componentConfigSchema, stringOrEnvRef]).optional(),
    notFound: stringOrEnvRef.optional(),
    offline: z.union([componentConfigSchema, stringOrEnvRef]).optional(),
    breadcrumbs: z
      .object({
        auto: z.boolean().default(false),
        home: z
          .object({
            label: z.string().default("Home"),
            icon: z.string().optional(),
            href: z.string().default("/"),
          })
          .strict()
          .optional(),
        separator: z.string().default("/"),
        labels: z.record(z.string(), z.string()).optional(),
      })
      .strict()
      .optional(),
    currencyDivisor: z.number().positive().default(1),
    a11y: z
      .object({
        respectReducedMotion: z.boolean().default(true),
        skipLinks: z
          .array(
            z
              .object({
                label: z.string(),
                target: z.string().min(1),
              })
              .strict(),
          )
          .optional(),
      })
      .strict()
      .optional(),
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

/**
 * Schema for named modal, drawer, and confirm-dialog overlay declarations.
 */
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
      urlParam: z.string().optional(),
      trapFocus: z.boolean().default(true),
      initialFocus: z.string().optional(),
      returnFocus: z.boolean().default(true),
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
      urlParam: z.string().optional(),
      trapFocus: z.boolean().default(true),
      initialFocus: z.string().optional(),
      returnFocus: z.boolean().default(true),
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
  confirmDialogConfigSchema,
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

function normalizeDeclaredRouteSegment(path: string): string {
  if (!path) {
    return "/";
  }

  if (path === "/") {
    return "/";
  }

  const trimmed = path.replace(/\/+$/, "");
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function joinDeclaredRoutePath(parentPath: string, childPath: string): string {
  const normalizedParent = normalizeDeclaredRouteSegment(parentPath);
  const normalizedChild = normalizeDeclaredRouteSegment(childPath);

  if (normalizedParent === "/") {
    return normalizedChild;
  }

  if (normalizedChild === "/") {
    return normalizedParent;
  }

  return `${normalizedParent}${normalizedChild}`.replace(/\/{2,}/g, "/");
}

type ManifestRouteIssueTarget = {
  route: z.infer<typeof routeConfigSchema>;
  path: (string | number)[];
  fullPath: string;
  isRoot: boolean;
};

function flattenDeclaredRoutes(
  routes: z.infer<typeof routeConfigSchema>[],
  parentPath = "",
  parentIssuePath: Array<string | number> = ["routes"],
): ManifestRouteIssueTarget[] {
  const flattened: ManifestRouteIssueTarget[] = [];

  routes.forEach((route, index) => {
    const isRoot = parentPath.length === 0;
    const fullPath = isRoot
      ? normalizeDeclaredRouteSegment(route.path)
      : joinDeclaredRoutePath(parentPath, route.path);
    const issuePath = [...parentIssuePath, index] as Array<string | number>;

    flattened.push({
      route,
      path: issuePath,
      fullPath,
      isRoot,
    });

    if (route.children?.length) {
      flattened.push(
        ...flattenDeclaredRoutes(route.children, fullPath, [
          ...issuePath,
          "children",
        ]),
      );
    }
  });

  return flattened;
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

/**
 * Top-level schema for `snapshot.manifest.json`.
 */
export const manifestConfigSchema: z.ZodType<Record<string, any>> = z
  .object({
    $schema: z.string().optional(),
    app: appConfigSchema.optional(),
    components: componentsConfigSchema.optional(),
    theme: themeConfigSchema.optional(),
    toast: toastConfigSchema.optional(),
    analytics: analyticsConfigSchema.optional(),
    observability: observabilityConfigSchema.optional(),
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
    shortcuts: shortcutsConfigSchema.optional(),
    componentGroups: z
      .record(
        z
          .object({
            description: z.string().optional(),
            components: z.array(componentConfigSchema).min(1),
          })
          .strict(),
      )
      .optional(),
    routes: z.array(routeConfigSchema).min(1),
  })
  .strict()
  .superRefine((data, ctx) => {
    const routeIds = new Set<string>();
    const routePaths = new Set<string>();
    const flattenedRoutes = flattenDeclaredRoutes(data.routes);

    flattenedRoutes.forEach(({ route, path, fullPath, isRoot }) => {
      if (routeIds.has(route.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [...path, "id"],
          message: `Duplicate route id "${route.id}"`,
        });
      } else {
        routeIds.add(route.id);
      }

      if (isRoot && !route.path.startsWith("/")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [...path, "path"],
          message: "Top-level route paths must start with '/'.",
        });
      }

      if (routePaths.has(fullPath)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [...path, "path"],
          message: `Duplicate route path "${fullPath}"`,
        });
      } else {
        routePaths.add(fullPath);
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

    if (data.navigation?.items) {
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
