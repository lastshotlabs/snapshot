import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

export const voteConfigSchema = extendComponentSchema({
  type: z.literal("vote"),
  value: z.union([z.number(), fromRefSchema]).optional(),
  upAction: actionSchema.optional(),
  downAction: actionSchema.optional(),
  slots: slotsSchema(["root", "upvote", "value", "downvote"]).optional(),
}).strict();
