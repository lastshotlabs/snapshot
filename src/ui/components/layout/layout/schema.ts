import { z } from "zod";

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
      .enum(["sidebar", "top-nav", "minimal", "full-width"])
      .default("sidebar"),
    /** Custom sidebar width (CSS value). Default: 16rem. */
    sidebarWidth: z.string().optional(),
    /** Optional inline styles applied to the root layout element. */
    style: z.record(z.union([z.string(), z.number()])).optional(),
  })
  .strict();

/** Inferred layout config type from the Zod schema. */
export type LayoutConfig = z.infer<typeof layoutConfigSchema>;
