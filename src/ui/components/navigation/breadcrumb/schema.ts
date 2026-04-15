import { z } from "zod";
import { extendComponentSchema, slotsSchema } from "../../_base/schema";
import { actionSchema } from "../../../actions/types";

export const breadcrumbSlotNames = [
  "root",
  "list",
  "item",
  "link",
  "current",
  "separator",
  "icon",
] as const;

/**
 * Schema for a single breadcrumb item.
 */
export const breadcrumbItemSchema = z.object({
  /** Display label for the breadcrumb segment. */
  label: z.string(),
  /** Route path for navigation. Omit for the current (last) item. */
  path: z.string().optional(),
  /** Optional icon name displayed before the label. */
  icon: z.string().optional(),
  slots: slotsSchema(["item", "link", "current", "icon"]).optional(),
});

/**
 * Zod config schema for the Breadcrumb component.
 *
 * Renders a navigation breadcrumb trail showing the user's
 * location within the application hierarchy.
 *
 * @example
 * ```json
 * {
 *   "type": "breadcrumb",
 *   "separator": "chevron",
 *   "items": [
 *     { "label": "Home", "path": "/" },
 *     { "label": "Users", "path": "/users" },
 *     { "label": "John Doe" }
 *   ]
 * }
 * ```
 */
export const breadcrumbConfigSchema = extendComponentSchema({
    /** Component type discriminator. */
    type: z.literal("breadcrumb"),
    /** Source for breadcrumb items. */
    source: z.enum(["manual", "route"]).optional(),
    /** Array of breadcrumb items from root to current page. */
    items: z.array(breadcrumbItemSchema).min(1).optional(),
    /** Include the app home route when deriving breadcrumbs from the current route. */
    includeHome: z.boolean().optional(),
    /** Separator character between items. */
    separator: z.enum(["slash", "chevron", "dot", "arrow"]).optional(),
    /** Maximum visible items before collapsing middle items with ellipsis. */
    maxItems: z.number().optional(),
    /** Action dispatched on breadcrumb item click. */
    action: actionSchema.optional(),
    slots: slotsSchema(breadcrumbSlotNames).optional(),
  })
  .superRefine((config: { source?: "manual" | "route"; items?: unknown[] }, ctx: z.RefinementCtx) => {
    if ((config.source ?? "manual") !== "manual") {
      return;
    }

    if (!config.items) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: 'Breadcrumb items are required when source is "manual".',
      });
      return;
    }

    if (config.items.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: 'Breadcrumb items cannot be an empty array when source is "manual".',
      });
    }
  });
