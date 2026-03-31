import { z } from "zod";

export const registerConfigSchema = z.object({
  type: z.literal("register"),
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  showLoginLink: z.boolean().optional(),
  loginPath: z.string().optional(),
  showOAuth: z.boolean().optional(),
  oauthProviders: z.array(z.enum(["google", "apple", "microsoft", "github"])).optional(),
  extraFields: z
    .array(
      z.object({
        name: z.string(),
        label: z.string().optional(),
        type: z.enum(["text", "select"]).optional(),
        required: z.boolean().optional(),
        placeholder: z.string().optional(),
        options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      }),
    )
    .optional(),
  redirectTo: z.string().optional(),
  className: z.string().optional(),
});

export type RegisterConfig = z.infer<typeof registerConfigSchema>;
