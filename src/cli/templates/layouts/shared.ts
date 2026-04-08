export function generateAuthLayout(): string {
  return `export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
`;
}

export function generatePendingComponent(): string {
  return `export function PendingComponent() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}
`;
}

export function generateErrorComponent(): string {
  return `import { useRouter } from '@tanstack/react-router'

export function ErrorComponent({ error }: { error: Error }) {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <p className="text-destructive">{error.message}</p>
      <button
        onClick={() => router.invalidate()}
        className="text-sm underline"
      >
        Try again
      </button>
    </div>
  )
}
`;
}

export function generateNotFoundComponent(): string {
  return `import { Link } from '@tanstack/react-router'

export function NotFoundComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Link to="/" className="text-sm underline">Go home</Link>
    </div>
  )
}
`;
}

export function generatePageTransition(): string {
  return `import { Outlet, useRouterState } from '@tanstack/react-router'

export function PageTransition() {
  const isPending = useRouterState({ select: (s) => s.status === 'pending' })
  return (
    <div className={\`transition-opacity duration-150 \${isPending ? 'opacity-0' : 'opacity-100'}\`}>
      <Outlet />
    </div>
  )
}
`;
}
