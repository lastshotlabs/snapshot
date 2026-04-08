import type { ScaffoldConfig } from "../../types";

export function generateMfaSetupPage(_config: ScaffoldConfig): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { MfaSetupPage } from '@pages/auth/MfaSetupPage'

export const Route = createFileRoute('/_authenticated/mfa-setup')({
  component: MfaSetupPage,
})
`;
}
