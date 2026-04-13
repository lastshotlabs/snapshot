import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import {
  dataSourceSchema,
  endpointTargetSchema,
} from "../../_base/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

export const commandPaletteSlotNames = [
  "root",
  "trigger",
  "panel",
  "search",
  "searchInput",
  "list",
  "item",
  "itemLabel",
  "itemIcon",
  "groupLabel",
  "emptyState",
] as const;

export const commandPaletteItemSlotNames = [
  "item",
  "itemLabel",
  "itemIcon",
] as const;

const commandItemSchema = z
  .object({
    label: z.string(),
    icon: z.string().optional(),
    shortcut: z.string().optional(),
    action: actionSchema.optional(),
    description: z.string().optional(),
  })
  .strict();

const commandGroupSchema = z
  .object({
    label: z.string(),
    items: z.array(commandItemSchema),
  })
  .strict();

export const commandPaletteConfigSchema = extendComponentSchema({
  type: z.literal("command-palette"),
  placeholder: z.string().optional(),
  groups: z.array(commandGroupSchema).optional(),
  data: dataSourceSchema.optional(),
  autoRegisterShortcuts: z.boolean().default(true),
  searchEndpoint: z
    .object({
      endpoint: endpointTargetSchema,
      debounce: z.number().int().positive().default(300),
      minLength: z.number().int().nonnegative().default(2),
    })
    .optional(),
  recentItems: z
    .object({
      enabled: z.boolean().default(false),
      maxItems: z.number().int().positive().default(5),
    })
    .optional(),
  shortcut: z.string().default("ctrl+k"),
  emptyMessage: z.string().optional(),
  maxHeight: z.string().optional(),
  slots: slotsSchema(commandPaletteSlotNames).optional(),
}).strict();
