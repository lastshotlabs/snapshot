export function generateForgotPasswordPage(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordPage } from '@pages/auth/ForgotPasswordPage'

export const Route = createFileRoute('/_guest/auth/forgot-password')({
  component: ForgotPasswordPage,
})
`;
}
