import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

const filterOptionSchema = z
  .object({
    label: z.string(),
    value: z.string(),
  })
  .strict();

const filterDefinitionSchema = z
  .object({
    key: z.string(),
    label: z.string(),
    options: z.array(filterOptionSchema),
    multiple: z.boolean().optional(),
  })
  .strict();

export const filterBarConfigSchema = extendComponentSchema({
  type: z.literal("filter-bar"),
  searchPlaceholder: z.string().optional(),
  showSearch: z.boolean().optional(),
  filters: z.array(filterDefinitionSchema).optional(),
  changeAction: actionSchema.optional(),
  slots: slotsSchema([
    "root",
    "toolbar",
    "search",
    "searchIcon",
    "searchInput",
    "filterButton",
    "dropdown",
    "option",
    "optionIndicator",
    "optionLabel",
    "pill",
    "pillLabel",
    "pillRemove",
    "clearButton",
  ]).optional(),
}).strict();
