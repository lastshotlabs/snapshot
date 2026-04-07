import { z } from "zod";
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
});

/** Inferred type for drawer config. */
export type DrawerConfig = z.infer<typeof drawerConfigSchema>;
