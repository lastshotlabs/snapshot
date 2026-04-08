import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import {
  baseComponentConfigSchema,
  fromRefSchema,
} from "../../../manifest/schema";

/**
 * Zod schema for modal component config.
 * Modals are overlay dialogs that display child components.
 * They are opened/closed via the modal manager (open-modal/close-modal actions).
 */
export const modalConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("modal"),
  /** Modal title. Can be static or a FromRef. */
  title: z.union([z.string(), fromRefSchema]).optional(),
  /** Modal size. */
  size: z.enum(["sm", "md", "lg", "xl", "full"]).default("md"),
  /** FromRef trigger — when resolved value is truthy, modal auto-opens. */
  trigger: fromRefSchema.optional(),
  /** Child components rendered inside the modal body. */
  content: z.array(z.record(z.unknown())),
  /** Inline style overrides. */
  style: z.record(z.union([z.string(), z.number()])).optional(),
  /** Additional CSS class name. */
  className: z.string().optional(),
  /** Footer with action buttons. */
  footer: z
    .object({
      /** Action buttons rendered in the footer. */
      actions: z.array(
        z.object({
          /** Button label text. */
          label: z.string(),
          /** Button visual variant. */
          variant: z
            .enum(["default", "secondary", "destructive", "ghost"])
            .optional(),
          /** Action to dispatch on click. */
          action: actionSchema.optional(),
          /** Close the modal after the action executes. Default: false. */
          dismiss: z.boolean().optional(),
        }),
      ),
      /** Footer alignment. Default: "right". */
      align: z.enum(["left", "center", "right"]).optional(),
    })
    .optional(),
});

/** Inferred type for modal config. */
export type ModalConfig = z.infer<typeof modalConfigSchema>;
