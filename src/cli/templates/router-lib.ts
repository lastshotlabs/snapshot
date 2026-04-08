export function generateRouterLib(): string {
  return `import { createRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'
import { snapshot } from './snapshot'
import { PendingComponent } from '@components/layout/PendingComponent'
import { ErrorComponent } from '@components/layout/ErrorComponent'
import { NotFoundComponent } from '@components/layout/NotFoundComponent'

export const router = createRouter({
  routeTree,
  context: { queryClient: snapshot.queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  defaultPendingComponent: PendingComponent,
  defaultErrorComponent: ErrorComponent,
  defaultNotFoundComponent: NotFoundComponent,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
`;
}
