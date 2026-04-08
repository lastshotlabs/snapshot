import type { ScaffoldConfig } from "../../types";

export function generateOAuthCallbackPage(config: ScaffoldConfig): string {
  if (config.securityProfile === "prototype") {
    return `import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { OAuthCallbackPage } from '@pages/auth/OAuthCallbackPage'

export const Route = createFileRoute('/_guest/auth/oauth/callback')({
  validateSearch: z.object({
    code: z.string().optional(),
    error: z.string().optional(),
  }),
  component: OAuthCallbackPage,
})
`;
  }

  // hardened
  return `import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { OAuthCallbackPage } from '@pages/auth/OAuthCallbackPage'

export const Route = createFileRoute('/_guest/auth/oauth/callback')({
  validateSearch: z.object({
    success: z.boolean().optional(),
    error: z.string().optional(),
  }),
  component: OAuthCallbackPage,
})
`;
}
