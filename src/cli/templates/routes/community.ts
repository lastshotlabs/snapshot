export function generateCommunityContainersRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { CommunityContainersPage } from '@pages/community/CommunityContainersPage'

export const Route = createFileRoute('/_authenticated/community/')({
  component: CommunityContainersPage,
})
`;
}

export function generateCommunityThreadListRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { CommunityThreadListPage } from '@pages/community/CommunityThreadListPage'

export const Route = createFileRoute('/_authenticated/community/$containerId')({
  component: function RouteComponent() {
    const { containerId } = Route.useParams()
    return <CommunityThreadListPage containerId={containerId} />
  },
})
`;
}

export function generateCommunityThreadRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { CommunityThreadPage } from '@pages/community/CommunityThreadPage'

export const Route = createFileRoute('/_authenticated/community/$containerId/$threadId')({
  component: function RouteComponent() {
    const { containerId, threadId } = Route.useParams()
    return <CommunityThreadPage containerId={containerId} threadId={threadId} />
  },
})
`;
}
