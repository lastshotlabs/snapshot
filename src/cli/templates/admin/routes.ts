export function generateRootRoute(): string {
  return `import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { QueryProvider } from '@lib/snapshot'
import { CapabilitiesProvider } from '@lib/capabilities'
import type { QueryClient } from '@tanstack/react-query'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => (
    <QueryProvider>
      <CapabilitiesProvider>
        <Outlet />
      </CapabilitiesProvider>
    </QueryProvider>
  ),
})
`;
}

export function generateIndexRoute(): string {
  return `import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/users' })
  },
})
`;
}

export function generateAuthenticatedRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { protectedBeforeLoad } from '@lib/snapshot'
import { AdminLayout } from '@components/admin/AdminLayout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: protectedBeforeLoad,
  component: AdminLayout,
})
`;
}

export function generateUsersRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { UsersPage } from '@pages/admin/UsersPage'

export const Route = createFileRoute('/_authenticated/users')({
  component: UsersPage,
})
`;
}

export function generateUserDetailRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { UserDetailPage } from '@pages/admin/UserDetailPage'

export const Route = createFileRoute('/_authenticated/users/\$userId')({
  component: UserDetailPage,
})
`;
}

export function generateUserSessionsRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { UserSessionsPage } from '@pages/admin/UserSessionsPage'

export const Route = createFileRoute('/_authenticated/users/\$userId/sessions')({
  component: UserSessionsPage,
})
`;
}

export function generateUserAuditLogRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { UserAuditLogPage } from '@pages/admin/UserAuditLogPage'

export const Route = createFileRoute('/_authenticated/users/\$userId/audit-log')({
  component: UserAuditLogPage,
})
`;
}

export function generateAuditLogRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { AuditLogPage } from '@pages/admin/AuditLogPage'

export const Route = createFileRoute('/_authenticated/audit-log')({
  component: AuditLogPage,
})
`;
}

export function generateGroupsRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { GroupsPage } from '@pages/admin/GroupsPage'

export const Route = createFileRoute('/_authenticated/groups')({
  component: GroupsPage,
})
`;
}

export function generateOrgsRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { OrgsPage } from '@pages/admin/OrgsPage'

export const Route = createFileRoute('/_authenticated/orgs')({
  component: OrgsPage,
})
`;
}

export function generateCapabilitiesRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { CapabilitiesPage } from '@pages/admin/CapabilitiesPage'

export const Route = createFileRoute('/_authenticated/capabilities')({
  component: CapabilitiesPage,
})
`;
}
