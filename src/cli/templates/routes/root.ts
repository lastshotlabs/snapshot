import type { ScaffoldConfig } from "../../types";

export function generateRootRoute(config: ScaffoldConfig): string {
  return `import { createRootRouteWithContext } from '@tanstack/react-router'
import { useHead } from '@unhead/react'
import { UnheadProvider, createHead } from '@unhead/react/client'
import { PageTransition } from '@components/layout/PageTransition'
import type { QueryClient } from '@tanstack/react-query'

const head = createHead()

function RootDocument() {
  useHead({ titleTemplate: '%s | ${config.projectName}' })
  return <PageTransition />
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => (
    <UnheadProvider head={head}>
      <RootDocument />
    </UnheadProvider>
  ),
})
`;
}
