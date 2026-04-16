import type { z } from "zod";
import type { pricingTableConfigSchema } from "./schema";
/** Inferred config type from the PricingTable Zod schema. */
export type PricingTableConfig = z.input<typeof pricingTableConfigSchema>;
