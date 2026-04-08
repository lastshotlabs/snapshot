export function generateSettingsSessionsPageComponent(): string {
  return `import { useHead } from '@unhead/react'
import { useSessions, useRevokeSession } from '@lib/snapshot'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card'

export function SettingsSessionsPage() {
  useHead({ title: 'Sessions' })
  const { sessions, isLoading } = useSessions()
  const revoke = useRevokeSession()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>Manage devices that are signed in to your account</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {sessions?.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between rounded-md border px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{session.userAgent ?? 'Unknown device'}</p>
              <p className="text-xs text-muted-foreground">
                Last active {new Date(session.lastActiveAt).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => revoke.mutate(session.id)}
              disabled={revoke.isPending}
            >
              Revoke
            </Button>
          </div>
        ))}
        {sessions?.length === 0 && (
          <p className="text-sm text-muted-foreground">No active sessions found.</p>
        )}
      </CardContent>
    </Card>
  )
}
`;
}
