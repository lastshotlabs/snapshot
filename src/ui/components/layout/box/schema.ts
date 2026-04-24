import { z } from "zod";
import { componentConfigSchema } from "../../../manifest/schema";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";

export const boxConfigSchema = extendComponentSchema({
  type: z.literal("box"),
  as: z
    .enum([
      "div",
      "section",
      "article",
      "aside",
      "header",
      "footer",
      "main",
      "nav",
      "span",
    ])
    .optional(),
  children: z.array(componentConfigSchema).optional(),
  slots: slotsSchema(["root"]).optional(),
}).strict();
