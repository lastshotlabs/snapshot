import type { AdminScaffoldConfig } from "../../types";

export function generateCapabilitiesLib(): string {
  return `import { createContext, useContext, useEffect, useState } from 'react'

export interface ManagedUserCapabilities {
  canSuspendUsers: boolean
  canUnsuspendUsers: boolean
  canUpdateProfile: boolean
  canDeleteUsers: boolean
  canManageRoles: boolean
  canListSessions: boolean
  canRevokeAllSessions: boolean
  canRevokeSingleSession: boolean
  // Provider names (optional for backward compatibility with older backends)
  accessProvider?: string
  managedUserProvider?: string
  [key: string]: boolean | string | undefined
}

const defaultCapabilities: ManagedUserCapabilities = {
  canSuspendUsers: false,
  canUnsuspendUsers: false,
  canUpdateProfile: false,
  canDeleteUsers: false,
  canManageRoles: false,
  canListSessions: false,
  canRevokeAllSessions: false,
  canRevokeSingleSession: false,
}

interface CapabilitiesContextValue {
  capabilities: ManagedUserCapabilities
  isLoading: boolean
}

const CapabilitiesContext = createContext<CapabilitiesContextValue>({
  capabilities: defaultCapabilities,
  isLoading: true,
})

export function CapabilitiesProvider({ children }: { children: React.ReactNode }) {
  const [capabilities, setCapabilities] = useState<ManagedUserCapabilities>(defaultCapabilities)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ?? ''
    fetch(\`\${apiUrl}/admin/capabilities\`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data: ManagedUserCapabilities) => {
        setCapabilities({ ...defaultCapabilities, ...data })
      })
      .catch(() => {
        // Capabilities unavailable — all boolean gates default to false
        setCapabilities(defaultCapabilities)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <CapabilitiesContext.Provider value={{ capabilities, isLoading }}>
      {children}
    </CapabilitiesContext.Provider>
  )
}

export function useCapabilities(): CapabilitiesContextValue {
  return useContext(CapabilitiesContext)
}
`;
}

export function generateSnapshotLib(config: AdminScaffoldConfig): string {
  const webhookExports = config.webhookAdminPages
    ? `  useWebhookEndpoints,\n  useWebhookEndpoint,\n  useWebhookDeliveries,\n  useCreateWebhookEndpoint,\n  useUpdateWebhookEndpoint,\n  useDeleteWebhookEndpoint,\n  useTestWebhookEndpoint,`
    : "";

  return `import { createSnapshot } from '@lastshotlabs/snapshot'

export const snapshot = createSnapshot({
  apiUrl: import.meta.env.VITE_API_URL,
  loginPath: '/auth/login',
  homePath: '/users',
  forbiddenPath: '/403',
})

export const {
  useUser,
  useLogin,
  useLogout,
  useTheme,
${webhookExports}
  protectedBeforeLoad,
  guestBeforeLoad,
  QueryProvider,
  api,
  queryClient,
  tokenStorage,
} = snapshot
`;
}

export function generateRouterLib(): string {
  return `import { createRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen'
import { snapshot } from './snapshot'

export const router = createRouter({
  routeTree,
  context: { queryClient: snapshot.queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
`;
}
