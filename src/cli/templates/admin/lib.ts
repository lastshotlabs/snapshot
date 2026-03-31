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
  const imports: string[] = ["createSnapshot", "createAuthPlugin"];
  const plugins: string[] = [];

  plugins.push(`  createAuthPlugin({
    loginPath: '/auth/login',
    homePath: '/users',
    forbiddenPath: '/403',
  }),`);

  if (config.webhookAdminPages) {
    imports.push("createWebhookPlugin");
    plugins.push("  createWebhookPlugin(),");
  }

  const webhookExports = config.webhookAdminPages
    ? `
  // Webhooks
  useWebhookEndpoints,
  useWebhookEndpoint,
  useWebhookDeliveries,
  useCreateWebhookEndpoint,
  useUpdateWebhookEndpoint,
  useDeleteWebhookEndpoint,
  useTestWebhookEndpoint,`
    : "";

  return `import { ${imports.join(", ")} } from '@lastshotlabs/snapshot'

export const snapshot = createSnapshot(
  {
    apiUrl: import.meta.env.VITE_API_URL,
  },
${plugins.join("\n")}
)

export const {
  // Core
  useUser,
  useLogin,
  useLogout,
  useTheme,
  QueryProvider,
  api,
  queryClient,
  tokenStorage,

  // Routing
  protectedBeforeLoad,
  guestBeforeLoad,${webhookExports}
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
