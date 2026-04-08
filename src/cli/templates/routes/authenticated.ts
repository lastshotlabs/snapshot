export function generateAuthenticatedRoute(): string {
  return `import { createFileRoute, Outlet } from '@tanstack/react-router'
import { protectedBeforeLoad } from '@lib/snapshot'
import { RootLayout } from '@components/layout/RootLayout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: protectedBeforeLoad,
  component: () => (
    <RootLayout>
      <Outlet />
    </RootLayout>
  ),
})
`;
}
