import { z } from "zod";

const navItemSchema = z.object({
  label: z.string(),
  path: z.string(),
  icon: z.string().optional(),
  roles: z.array(z.string()).optional(),
  badge: z.union([z.string(), z.number()]).optional(),
  children: z
    .array(
      z.object({
        label: z.string(),
        path: z.string(),
        icon: z.string().optional(),
        roles: z.array(z.string()).optional(),
      }),
    )
    .optional(),
});

export const navConfigSchema = z.object({
  type: z.literal("nav"),
  id: z.string().optional(),
  items: z.array(navItemSchema),
  orientation: z.enum(["horizontal", "vertical"]).optional(),
  className: z.string().optional(),
});

export type NavConfig = z.infer<typeof navConfigSchema>;
export type NavItemConfig = z.infer<typeof navItemSchema>;
