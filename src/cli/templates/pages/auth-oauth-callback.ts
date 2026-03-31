import type { ScaffoldConfig } from "../../types";

export function generateOAuthCallbackPageComponent(_config: ScaffoldConfig): string {
  // Cookie-based OAuth flow — Bunshot establishes the session cookie server-side
  // during the provider callback and redirects back with only success/error status.
  return `import { useEffect } from 'react'
import { useHead } from '@unhead/react'
import { useNavigate, Link } from '@tanstack/react-router'
import { Route } from '../../routes/_guest/auth/oauth/callback'
import { useUser, queryClient } from '@lib/snapshot'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { Button } from '@components/ui/button'

export function OAuthCallbackPage() {
  useHead({ title: 'Signing in...' })
  const { error } = Route.useSearch()
  const navigate = useNavigate()
  const { user } = useUser()

  useEffect(() => {
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (user) {
      navigate({ to: '/' })
    }
  }, [user, navigate])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sign in failed</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-destructive text-sm">{error}</p>
          <Button asChild variant="outline">
            <Link to="/auth/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signing in...</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Please wait while we complete your sign in.</p>
      </CardContent>
    </Card>
  )
}
`;
}
