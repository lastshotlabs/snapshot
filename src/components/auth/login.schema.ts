import { z } from "zod";

export const loginConfigSchema = z.object({
  type: z.literal("login"),
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  showRegisterLink: z.boolean().optional(),
  registerPath: z.string().optional(),
  showForgotPassword: z.boolean().optional(),
  forgotPasswordPath: z.string().optional(),
  showPasskeyLogin: z.boolean().optional(),
  showOAuth: z.boolean().optional(),
  oauthProviders: z.array(z.enum(["google", "apple", "microsoft", "github"])).optional(),
  redirectTo: z.string().optional(),
  className: z.string().optional(),
});

export type LoginConfig = z.infer<typeof loginConfigSchema>;
