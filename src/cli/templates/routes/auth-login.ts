import type { ScaffoldConfig } from "../../types";

export function generateLoginPage(_config: ScaffoldConfig): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '@pages/auth/LoginPage'

export const Route = createFileRoute('/_guest/auth/login')({
  component: LoginPage,
})
`;
}
