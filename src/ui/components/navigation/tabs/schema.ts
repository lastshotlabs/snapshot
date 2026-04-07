import { z } from "zod";
import { baseComponentConfigSchema } from "../../../manifest/schema";

/**
 * Schema for a single tab within the tabs component.
 */
export const tabConfigSchema = z.object({
  /** Display label for the tab. */
  label: z.string(),
  /** Optional icon name (e.g. Lucide icon). */
  icon: z.string().optional(),
  /** Child components rendered when this tab is active. */
  content: z.array(z.record(z.unknown())),
  /** Whether this tab is disabled. */
  disabled: z.boolean().optional(),
});

/** Inferred type for a single tab config. */
export type TabConfig = z.infer<typeof tabConfigSchema>;

/**
 * Zod schema for tabs component config.
 * Tabs provide in-page navigation between content panels.
 * Each tab's content is rendered via ComponentRenderer.
 */
export const tabsConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("tabs"),
  /** Array of tab definitions. */
  children: z.array(tabConfigSchema).min(1),
  /** Index of the initially active tab. */
  defaultTab: z.number().default(0),
  /** Visual variant for the tab bar. */
  variant: z.enum(["default", "underline", "pills"]).default("default"),
});

/** Inferred type for tabs config. */
export type TabsConfig = z.infer<typeof tabsConfigSchema>;
