import { z } from "zod";
import {
  exprRefSchema,
  fromRefSchema,
} from "@lastshotlabs/frontend-contract/refs";
import {
  activeConfigSchema,
  componentAnimationSchema,
  componentBackgroundSchema,
  componentDisplaySchema,
  componentFlexDirectionSchema,
  componentPositionSchema,
  componentTokenOverridesSchema,
  componentTransitionSchema,
  componentZIndexSchema,
  exitAnimationSchema,
  focusConfigSchema,
  hoverConfigSchema,
  responsiveValue,
  sharedBaseComponentSchema,
  spacingEnum,
  slotStateNameSchema,
  styleableElementFields as sharedStyleableElementFields,
} from "@lastshotlabs/frontend-contract/components";

export {
  activeConfigSchema,
  componentAnimationSchema,
  componentBackgroundSchema,
  componentTokenOverridesSchema,
  componentTransitionSchema,
  componentZIndexSchema,
  exitAnimationSchema,
  focusConfigSchema,
  hoverConfigSchema,
  spacingEnum,
  slotStateNameSchema,
};

export const styleableElementFields = {
  ...sharedStyleableElementFields,
  className: z.string().optional(),
  style: z.record(z.union([z.string(), z.number()])).optional(),
  cursor: z.string().optional(),
  backgroundColor: z.string().optional(),
  gridTemplateColumns: z.string().optional(),
  gridTemplateRows: z.string().optional(),
  gridColumn: z.string().optional(),
  gridRow: z.string().optional(),
  display: responsiveValue(componentDisplaySchema).optional(),
  flexDirection: responsiveValue(componentFlexDirectionSchema).optional(),
  position: componentPositionSchema.optional(),
  inset: z.union([z.string(), z.number()]).optional(),
} as const;

export const styleableElementSchema = z.object(styleableElementFields).strict();

export const statefulElementSchema = styleableElementSchema.extend({
  states: z.record(slotStateNameSchema, styleableElementSchema.partial()).optional(),
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

export const extendedBaseComponentSchema = z.object({
  id: sharedBaseComponentSchema.shape.id,
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
  span: sharedBaseComponentSchema.shape.span,
  slots: slotsSchema(["root"]).optional(),
  ...styleableElementFields,
});

export function extendComponentSchema<T extends z.ZodRawShape>(shape: T) {
  return extendedBaseComponentSchema.extend(shape);
}
