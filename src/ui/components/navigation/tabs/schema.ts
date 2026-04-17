import { z } from "zod";
import {
  urlSyncConfigSchema,
} from "../../../manifest/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

export const tabsSlotNames = [
  "root",
  "list",
  "tab",
  "tabLabel",
  "tabIcon",
  "panel",
] as const;

/**
 * Schema for a single tab within the tabs component.
 */
export const tabConfigSchema = z.object({
  /** Display label for the tab. */
  label: z.union([z.string(), fromRefSchema]),
  /** Optional icon name (e.g. Lucide icon). */
  icon: z.string().optional(),
  /** Child components rendered when this tab is active. */
  content: z.array(z.record(z.unknown())),
  /** Whether this tab is disabled. */
  disabled: z.boolean().optional(),
  slots: slotsSchema(["tab", "tabLabel", "tabIcon", "panel"]).optional(),
});

/** Inferred type for a single tab config. */
export type TabConfig = z.input<typeof tabConfigSchema>;

/**
 * Zod schema for tabs component config.
 * Tabs provide in-page navigation between content panels.
 * Each tab's content is rendered via ComponentRenderer.
 */
export const tabsConfigSchema = extendComponentSchema({
  type: z.literal("tabs"),
  /** Array of tab definitions. */
  children: z.array(tabConfigSchema).min(1),
  /** Index of the initially active tab. */
  defaultTab: z.number().default(0),
  /** Sync active tab state into URL query params. */
  urlSync: urlSyncConfigSchema.optional(),
  /** Visual variant for the tab bar. */
  variant: z.enum(["default", "underline", "pills"]).default("default"),
  slots: slotsSchema(tabsSlotNames).optional(),
});

/** Inferred type for tabs config. */
export type TabsConfig = z.input<typeof tabsConfigSchema>;
