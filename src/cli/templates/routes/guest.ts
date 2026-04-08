export function generateGuestRoute(): string {
  return `import { createFileRoute, Outlet } from '@tanstack/react-router'
import { guestBeforeLoad } from '@lib/snapshot'
import { AuthLayout } from '@components/layout/AuthLayout'

export const Route = createFileRoute('/_guest')({
  beforeLoad: guestBeforeLoad,
  component: () => (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  ),
})
`;
}
