import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import {
  baseComponentConfigSchema,
  fromRefSchema,
} from "../../../manifest/schema";

/**
 * Zod schema for drawer component config.
 * Drawers are slide-in panels from the left or right edge of the screen.
 * Like modals, they are opened/closed via the modal manager.
 */
export const drawerConfigSchema = baseComponentConfigSchema.extend({
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
          /** Close the drawer after the action executes. Default: false. */
          dismiss: z.boolean().optional(),
        }),
      ),
      /** Footer alignment. Default: "right". */
      align: z.enum(["left", "center", "right"]).optional(),
    })
    .optional(),
});

/** Inferred type for drawer config. */
export type DrawerConfig = z.infer<typeof drawerConfigSchema>;
