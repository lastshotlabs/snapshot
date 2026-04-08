import type { ScaffoldConfig } from "../../types";

export function generateRootLayoutTopNav(): string {
  return `import { TopNav } from './TopNav'

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <TopNav />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
`;
}

export function generateTopNav(config: ScaffoldConfig): string {
  return `import { Link } from '@tanstack/react-router'
import { useTheme, useUser, useLogout } from '@lib/snapshot'

export function TopNav() {
  const { user } = useUser()
  const logout = useLogout()
  const { theme, toggle } = useTheme()

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-foreground">
          ${config.projectName}
        </Link>
        <nav className="flex items-center gap-4">
          <button
            onClick={toggle}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          {user ? (
            <button
              onClick={() => logout.mutate()}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
`;
}
