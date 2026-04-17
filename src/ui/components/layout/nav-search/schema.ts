import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";
import { actionSchema } from "../../../actions/types";

export const navSearchSlotNames = ["root", "input", "shortcut"] as const;

export const navSearchConfigSchema = extendComponentSchema({
  type: z.literal("nav-search"),
  placeholder: z.union([z.string(), fromRefSchema]).optional(),
  onSearch: actionSchema.optional(),
  shortcut: z.string().optional(),
  publishTo: z.string().optional(),
  slots: slotsSchema(navSearchSlotNames).optional(),
}).strict();
