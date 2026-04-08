export function generateVerifyEmailPage(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { VerifyEmailPage } from '@pages/auth/VerifyEmailPage'

export const Route = createFileRoute('/_guest/auth/verify-email')({
  validateSearch: z.object({
    token: z.string().optional(),
  }),
  component: VerifyEmailPage,
})
`;
}
