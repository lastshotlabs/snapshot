import type { ScaffoldConfig } from "../../types";

export function generateRegisterPage(_config: ScaffoldConfig): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { RegisterPage } from '@pages/auth/RegisterPage'

export const Route = createFileRoute('/_guest/auth/register')({
  component: RegisterPage,
})
`;
}
