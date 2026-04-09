import { z } from "zod";
import { actionSchema } from "../actions/types";

export const workflowConditionSchema: z.ZodType = z
  .object({
    left: z.unknown(),
    operator: z
      .enum(["truthy", "falsy", "equals", "not-equals", "exists"])
      .optional(),
    right: z.unknown().optional(),
  })
  .strict();

export const workflowNodeSchema: z.ZodType = z.lazy(() =>
  z.union([
    actionSchema,
    z
      .object({
        type: z.literal("if"),
        id: z.string().optional(),
        when: workflowConditionSchema.optional(),
        condition: workflowConditionSchema,
        then: z.union([workflowNodeSchema, z.array(workflowNodeSchema)]),
        else: z
          .union([workflowNodeSchema, z.array(workflowNodeSchema)])
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
          .array(z.union([workflowNodeSchema, z.array(workflowNodeSchema)]))
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
        step: z.union([workflowNodeSchema, z.array(workflowNodeSchema)]),
        onFailure: z
          .union([workflowNodeSchema, z.array(workflowNodeSchema)])
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
  ]),
);

export const workflowDefinitionSchema: z.ZodType = z.union([
  workflowNodeSchema,
  z.array(workflowNodeSchema),
]);
