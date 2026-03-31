import { z } from "zod";

export const forgotPasswordConfigSchema = z.object({
  type: z.literal("forgot-password"),
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  showLoginLink: z.boolean().optional(),
  loginPath: z.string().optional(),
  successMessage: z.string().optional(),
  className: z.string().optional(),
});

export type ForgotPasswordConfig = z.infer<typeof forgotPasswordConfigSchema>;
