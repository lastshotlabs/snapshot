import { z } from "zod";

/**
 * Slot declaration supported by layout variants that expose named slot areas.
 */
export const layoutSlotSchema = z
  .object({
    /** Slot name. */
    name: z.string().min(1),
    /** Whether this slot must be populated by the route. */
    required: z.boolean().default(false),
  })
  .strict();

/**
 * Zod schema for layout component configuration.
 * Defines the layout shell that wraps page content.
 */
export const layoutConfigSchema = z
  .object({
    /** Component type discriminator. */
    type: z.literal("layout"),
    /** Optional component id for context publishing. */
    id: z.string().optional(),
    /** Layout variant determines the overall page structure. */
    variant: z
      .enum(["sidebar", "top-nav", "stacked", "minimal", "full-width"])
      .default("sidebar"),
    /** Custom sidebar width (CSS value). Default: 16rem. */
    sidebarWidth: z.string().optional(),
    /** Optional slot declarations supported by this layout. */
    slots: z.array(layoutSlotSchema).optional(),
    /** Optional CSS class name. */
    className: z.string().optional(),
    /** Optional inline styles applied to the root layout element. */
    style: z.record(z.union([z.string(), z.number()])).optional(),
  })
  .strict();

/** Inferred layout config type from the Zod schema. */
export type LayoutConfig = z.infer<typeof layoutConfigSchema>;
