export function generatePasskeyManagePage(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { PasskeyManagePage } from '@pages/auth/PasskeyManagePage'

export const Route = createFileRoute('/_authenticated/passkey')({
  component: PasskeyManagePage,
})
`;
}
