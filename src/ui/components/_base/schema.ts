import { z } from "zod";
import {
  exprRefSchema,
  fromRefSchema,
} from "@lastshotlabs/frontend-contract/refs";

export const componentTokenOverridesSchema = z.record(z.string());

export const componentZIndexSchema = z.union([
  z.enum([
    "base",
    "dropdown",
    "sticky",
    "overlay",
    "modal",
    "popover",
    "toast",
  ]),
  z.number(),
]);

export const componentAnimationSchema = z
  .object({
    enter: z.enum([
      "fade",
      "fade-up",
      "fade-down",
      "slide-left",
      "slide-right",
      "scale",
      "bounce",
    ]),
    duration: z
      .union([z.enum(["instant", "fast", "normal", "slow"]), z.number()])
      .optional(),
    delay: z.number().optional(),
    easing: z
      .union([z.enum(["default", "in", "out", "in-out", "spring"]), z.string()])
      .optional(),
    stagger: z.number().optional(),
  })
  .strict();

export const componentGradientStopSchema = z
  .object({
    color: z.string(),
    position: z.string().optional(),
  })
  .strict();

export const componentGradientSchema = z
  .object({
    type: z.enum(["linear", "radial", "conic"]).default("linear"),
    direction: z.string().optional(),
    stops: z.array(componentGradientStopSchema).min(2),
  })
  .strict();

export const componentBackgroundSchema = z.union([
  z.string(),
  z
    .object({
      image: z.string().optional(),
      overlay: z.string().optional(),
      gradient: componentGradientSchema.optional(),
      position: z.string().optional(),
      size: z.enum(["cover", "contain", "auto"]).optional(),
      fixed: z.boolean().optional(),
    })
    .strict(),
]);

export const componentTransitionSchema = z.union([
  z.enum(["all", "colors", "opacity", "shadow", "transform"]),
  z
    .object({
      property: z.string().default("all"),
      duration: z
        .union([z.enum(["instant", "fast", "normal", "slow"]), z.number()])
        .optional(),
      easing: z
        .union([
          z.enum(["default", "in", "out", "in-out", "spring"]),
          z.string(),
        ])
        .optional(),
    })
    .strict(),
]);

export const spacingEnum = z.enum([
  "none",
  "2xs",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
]);
const radiusEnum = z.enum(["none", "xs", "sm", "md", "lg", "xl", "full"]);
const shadowEnum = z.enum(["none", "xs", "sm", "md", "lg", "xl"]);
const colorRef = z.string();
const fontSizeEnum = z.enum([
  "xs",
  "sm",
  "base",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
]);
const fontWeightEnum = z.enum([
  "light",
  "normal",
  "medium",
  "semibold",
  "bold",
]);

function responsiveValue<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.union([
    valueSchema,
    z
      .object({
        default: valueSchema,
        sm: valueSchema.optional(),
        md: valueSchema.optional(),
        lg: valueSchema.optional(),
        xl: valueSchema.optional(),
        "2xl": valueSchema.optional(),
      })
      .strict(),
  ]);
}

const responsiveSpacing = responsiveValue(z.union([spacingEnum, z.string()]));
const responsiveString = responsiveValue(z.string());
const responsiveFontSize = responsiveValue(z.union([fontSizeEnum, z.string()]));
const responsiveDisplay = responsiveValue(
  z.enum([
    "flex",
    "grid",
    "block",
    "inline",
    "inline-flex",
    "inline-grid",
    "none",
  ]),
);
const responsiveFlexDirection = responsiveValue(
  z.enum(["row", "column", "row-reverse", "column-reverse"]),
);

export const hoverConfigSchema = z
  .object({
    bg: z.string().optional(),
    color: z.string().optional(),
    shadow: z.union([shadowEnum, z.string()]).optional(),
    borderRadius: z.union([radiusEnum, z.string()]).optional(),
    border: z.string().optional(),
    opacity: z.number().min(0).max(1).optional(),
    transform: z.string().optional(),
    scale: z.number().optional(),
  })
  .strict();

export const focusConfigSchema = z
  .object({
    bg: z.string().optional(),
    color: z.string().optional(),
    shadow: z.union([shadowEnum, z.string()]).optional(),
    ring: z.union([z.boolean(), z.string()]).optional(),
    outline: z.string().optional(),
  })
  .strict();

export const activeConfigSchema = z
  .object({
    bg: z.string().optional(),
    color: z.string().optional(),
    transform: z.string().optional(),
    scale: z.number().optional(),
  })
  .strict();

export const styleableElementFields = {
  className: z.string().optional(),
  style: z.record(z.union([z.string(), z.number()])).optional(),
  padding: responsiveSpacing.optional(),
  paddingX: responsiveSpacing.optional(),
  paddingY: responsiveSpacing.optional(),
  margin: responsiveSpacing.optional(),
  marginX: responsiveSpacing.optional(),
  marginY: responsiveSpacing.optional(),
  gap: responsiveSpacing.optional(),
  width: responsiveString.optional(),
  minWidth: responsiveString.optional(),
  maxWidth: responsiveString.optional(),
  height: responsiveString.optional(),
  minHeight: responsiveString.optional(),
  maxHeight: responsiveString.optional(),
  bg: z.union([colorRef, componentBackgroundSchema]).optional(),
  color: colorRef.optional(),
  borderRadius: z.union([radiusEnum, z.string()]).optional(),
  border: z.string().optional(),
  shadow: z.union([shadowEnum, z.string()]).optional(),
  opacity: z.number().min(0).max(1).optional(),
  overflow: z.enum(["auto", "hidden", "scroll", "visible"]).optional(),
  cursor: z.string().optional(),
  position: z.enum(["relative", "absolute", "fixed", "sticky"]).optional(),
  inset: z.string().optional(),
  display: responsiveDisplay.optional(),
  flexDirection: responsiveFlexDirection.optional(),
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
  fontSize: responsiveFontSize.optional(),
  fontWeight: z.union([fontWeightEnum, z.number()]).optional(),
  lineHeight: z
    .union([
      z.enum(["none", "tight", "snug", "normal", "relaxed", "loose"]),
      z.string(),
    ])
    .optional(),
  letterSpacing: z
    .union([z.enum(["tight", "normal", "wide"]), z.string()])
    .optional(),
  hover: hoverConfigSchema.optional(),
  focus: focusConfigSchema.optional(),
  active: activeConfigSchema.optional(),
} as const;

export const styleableElementSchema = z.object(styleableElementFields).strict();

export const slotStateNameSchema = z.enum([
  "hover",
  "focus",
  "open",
  "selected",
  "current",
  "active",
  "completed",
  "invalid",
  "disabled",
]);

export const statefulElementSchema = styleableElementSchema.extend({
  states: z
    .record(slotStateNameSchema, styleableElementSchema.partial())
    .optional(),
});

export function slotsSchema<const T extends readonly [string, ...string[]]>(
  slotNames: T,
) {
  return z
    .object(
      Object.fromEntries(
        slotNames.map((slot) => [slot, statefulElementSchema.optional()]),
      ) as Record<T[number], z.ZodOptional<typeof statefulElementSchema>>,
    )
    .strict();
}

export const exitAnimationSchema = z
  .object({
    preset: z
      .enum([
        "fade",
        "fade-up",
        "fade-down",
        "slide-left",
        "slide-right",
        "scale",
      ])
      .optional(),
    duration: z.enum(["instant", "fast", "normal", "slow"]).optional(),
  })
  .strict();

export const extendedBaseComponentSchema = z.object({
  id: z.string().optional(),
  tokens: componentTokenOverridesSchema.optional(),
  visibleWhen: z.string().optional(),
  visible: z.union([z.boolean(), fromRefSchema, exprRefSchema]).optional(),
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
  exitAnimation: exitAnimationSchema.optional(),
  span: responsiveValue(z.number().int().min(1).max(12)).optional(),
  slots: slotsSchema(["root"]).optional(),
  ...styleableElementFields,
});

export function extendComponentSchema<T extends z.ZodRawShape>(shape: T) {
  return extendedBaseComponentSchema.extend(shape);
}
