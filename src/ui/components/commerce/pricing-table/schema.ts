import { z } from "zod";
import { actionSchema } from "../../../actions/types";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { fromRefSchema } from "../../_base/types";

/**
 * Zod schema for a single feature in a pricing tier.
 */
const pricingFeatureSchema = z
  .object({
    /** Feature description text. */
    text: z.union([z.string(), fromRefSchema]),
    /** Whether this feature is included in the tier. Default: true. */
    included: z.boolean().optional(),
  })
  .strict();

/**
 * Zod schema for a single pricing tier (plan).
 */
const pricingTierSchema = z
  .object({
    /** Tier display name (e.g., "Starter", "Pro", "Enterprise"). */
    name: z.union([z.string(), fromRefSchema]),
    /** Price value — string for custom formatting (e.g., "Custom") or number. */
    price: z.union([z.string(), z.number(), fromRefSchema]),
    /** Billing period label (e.g., "/month", "/year"). */
    period: z.union([z.string(), fromRefSchema]).optional(),
    /** Short description of the tier. */
    description: z.union([z.string(), fromRefSchema]).optional(),
    /** List of features with inclusion indicators. */
    features: z.array(pricingFeatureSchema),
    /** Whether this tier should be visually highlighted. */
    highlighted: z.boolean().optional(),
    /** Badge text displayed on the tier (e.g., "Most Popular"). */
    badge: z.union([z.string(), fromRefSchema]).optional(),
    /** Action dispatched when the CTA button is clicked. */
    action: actionSchema.optional(),
    /** CTA button label. Default: "Get Started". */
    actionLabel: z.union([z.string(), fromRefSchema]).optional(),
  })
  .strict();

/**
 * Zod config schema for the PricingTable component.
 *
 * Renders a comparison table of pricing tiers with features,
 * highlights, badges, and CTA buttons.
 *
 * @example
 * ```json
 * {
 *   "type": "pricing-table",
 *   "currency": "$",
 *   "variant": "cards",
 *   "tiers": [
 *     {
 *       "name": "Starter",
 *       "price": 9,
 *       "period": "/month",
 *       "features": [
 *         { "text": "5 projects", "included": true },
 *         { "text": "API access", "included": false }
 *       ],
 *       "actionLabel": "Start Free"
 *     },
 *     {
 *       "name": "Pro",
 *       "price": 29,
 *       "period": "/month",
 *       "highlighted": true,
 *       "badge": "Most Popular",
 *       "features": [
 *         { "text": "Unlimited projects", "included": true },
 *         { "text": "API access", "included": true }
 *       ]
 *     }
 *   ]
 * }
 * ```
 */
export const pricingTableConfigSchema: z.ZodType<Record<string, any>> = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("pricing-table"),
    /** Pricing tiers to display. */
    tiers: z.array(pricingTierSchema),
    /** Currency symbol prepended to numeric prices. Default: "$". */
    currency: z.union([z.string(), fromRefSchema]).optional(),
    /** Number of columns. Default: "auto" (based on tier count). */
    columns: z.enum(["auto", "2", "3", "4"]).optional(),
    /** Visual layout variant. Default: "cards". */
    variant: z.enum(["cards", "table"]).optional(),
    slots: slotsSchema([
      "root",
      "grid",
      "card",
      "badge",
      "tierName",
      "priceRow",
      "price",
      "period",
      "description",
      "featureList",
      "featureItem",
      "featureIcon",
      "featureText",
      "cta",
      "tableScroll",
      "table",
      "headerCell",
      "headerTierName",
      "headerPrice",
      "featureCell",
      "valueCell",
      "ctaCell",
    ]).optional(),
  })
  .strict();
