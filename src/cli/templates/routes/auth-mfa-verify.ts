import type { ScaffoldConfig } from "../../types";

export function generateMfaVerifyPage(_config: ScaffoldConfig): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { MfaVerifyPage } from '@pages/auth/MfaVerifyPage'

export const Route = createFileRoute('/_guest/auth/mfa-verify')({
  component: MfaVerifyPage,
})
`;
}
