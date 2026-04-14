import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { actionSchema } from "../../../actions/types";

export const navSearchSlotNames = ["root", "input", "shortcut"] as const;

export const navSearchConfigSchema = extendComponentSchema({
  type: z.literal("nav-search"),
  placeholder: z.string().optional(),
  onSearch: actionSchema.optional(),
  shortcut: z.string().optional(),
  publishTo: z.string().optional(),
  slots: slotsSchema(navSearchSlotNames).optional(),
}).strict();
