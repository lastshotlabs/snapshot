import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { workflowDefinitionSchema } from "../../../workflows/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

export const drawerSlotNames = [
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

/**
 * Zod schema for drawer component config.
 * Drawers are slide-in panels from the left or right edge of the screen.
 * Like modals, they are opened/closed via the modal manager.
 */
export const drawerConfigSchema = extendComponentSchema({
  type: z.literal("drawer"),
  /** Drawer title. Can be static or a FromRef. */
  title: z.union([z.string(), fromRefSchema]).optional(),
  /** Drawer size. */
  size: z.enum(["sm", "md", "lg", "xl", "full"]).default("md"),
  /** Which side the drawer slides in from. */
  side: z.enum(["left", "right"]).default("right"),
  /** FromRef trigger — when resolved value is truthy, drawer auto-opens. */
  trigger: fromRefSchema.optional(),
  /** Child components rendered inside the drawer body. */
  content: z.array(z.record(z.unknown())),
  /** Workflow or action(s) run when the drawer opens. */
  onOpen: z.union([z.string().min(1), workflowDefinitionSchema]).optional(),
  /** Workflow or action(s) run when the drawer closes. */
  onClose: z.union([z.string().min(1), workflowDefinitionSchema]).optional(),
  /** URL query parameter used for deep-linking this drawer. */
  urlParam: z.string().optional(),
  /** Trap keyboard focus while the drawer is open. */
  trapFocus: z.boolean().default(true),
  /** CSS selector for the first element to receive focus. */
  initialFocus: z.string().optional(),
  /** Return focus to the previously focused element on close. */
  returnFocus: z.boolean().default(true),
  /** Footer with action buttons. */
  footer: z
    .object({
      /** Action buttons rendered in the footer. */
      actions: z.array(
        z.object({
          /** Button label text. */
          label: z.union([z.string(), fromRefSchema]),
          /** Button visual variant. */
          variant: z
            .enum(["default", "secondary", "destructive", "ghost"])
            .optional(),
          /** Action to dispatch on click. */
          action: z.union([actionSchema, z.array(actionSchema)]).optional(),
          /** Close the drawer after the action executes. Default: false. */
          dismiss: z.boolean().optional(),
        }),
      ),
      /** Footer alignment. Default: "right". */
      align: z.enum(["left", "center", "right"]).optional(),
    })
    .optional(),
  slots: slotsSchema(drawerSlotNames).optional(),
}).strict();

/** Inferred type for drawer config. */
export type DrawerConfig = z.input<typeof drawerConfigSchema>;
