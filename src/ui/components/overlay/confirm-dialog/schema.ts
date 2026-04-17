import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { fromRefSchema } from "../../_base/types";
import { workflowDefinitionSchema } from "../../../workflows/schema";
import { extendComponentSchema } from "../../_base/schema";
import { slotsSchema } from "../../_base/schema";

const confirmDialogSlotNames = [
  "root",
  "overlay",
  "panel",
  "header",
  "title",
  "closeButton",
  "body",
  "footer",
  "footerAction",
] as const;

const footerVariantSchema = z.enum([
  "default",
  "secondary",
  "destructive",
  "ghost",
]);

/**
 * Overlay alias schema for manifest-driven confirmation dialogs.
 */
export const confirmDialogConfigSchema = extendComponentSchema({
    type: z.literal("confirm-dialog"),
    title: z.union([z.string(), fromRefSchema]).optional(),
    description: z.union([z.string(), fromRefSchema]).optional(),
    size: z.enum(["sm", "md", "lg", "xl", "full"]).optional(),
    confirmLabel: z.union([z.string(), fromRefSchema]).default("Confirm"),
    cancelLabel: z.union([z.string(), fromRefSchema]).default("Cancel"),
    confirmVariant: footerVariantSchema.default("default"),
    cancelVariant: footerVariantSchema.default("secondary"),
    confirmAction: z.union([actionSchema, z.array(actionSchema)]).optional(),
    cancelAction: z.union([actionSchema, z.array(actionSchema)]).optional(),
    dismissOnConfirm: z.boolean().default(true),
    dismissOnCancel: z.boolean().default(true),
    onOpen: z.union([z.string().min(1), workflowDefinitionSchema]).optional(),
    onClose: z.union([z.string().min(1), workflowDefinitionSchema]).optional(),
    urlParam: z.string().optional(),
    trapFocus: z.boolean().default(true),
    initialFocus: z.string().optional(),
    returnFocus: z.boolean().default(true),
    slots: slotsSchema(confirmDialogSlotNames).optional(),
  }).strict();
