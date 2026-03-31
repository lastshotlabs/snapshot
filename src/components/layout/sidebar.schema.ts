import { z } from "zod";

export const sidebarLayoutConfigSchema = z.object({
  type: z.literal("sidebar-layout"),
  id: z.string().optional(),
  sidebarWidth: z.string().optional(),
  sidebarPosition: z.enum(["left", "right"]).optional(),
  gap: z.string().optional(),
  className: z.string().optional(),
  sidebar: z.array(z.record(z.unknown())),
  content: z.array(z.record(z.unknown())),
});

export type SidebarLayoutConfig = z.infer<typeof sidebarLayoutConfigSchema>;
