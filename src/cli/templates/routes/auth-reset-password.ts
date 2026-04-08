export function generateResetPasswordPage(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ResetPasswordPage } from '@pages/auth/ResetPasswordPage'

export const Route = createFileRoute('/_guest/auth/reset-password')({
  validateSearch: z.object({
    token: z.string(),
  }),
  component: ResetPasswordPage,
})
`;
}
