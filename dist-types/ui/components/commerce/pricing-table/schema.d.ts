import { z } from "zod";
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
export declare const pricingTableConfigSchema: z.ZodType<Record<string, any>>;
