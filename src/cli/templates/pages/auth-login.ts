import type { ScaffoldConfig } from "../../types";

export function generateLoginPageComponent(config: ScaffoldConfig): string {
  if (config.passkeyPages) {
    return `import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useHead } from '@unhead/react'
import { startAuthentication } from '@simplewebauthn/browser'
import { useLogin, usePasskeyLoginOptions, usePasskeyLogin, formatAuthError } from '@lib/snapshot'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'

export function LoginPage() {
  useHead({ title: 'Sign in' })
  const login = useLogin()
  const loginOptions = usePasskeyLoginOptions()
  const passkeyLogin = usePasskeyLogin()
  const [email, setEmail] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    login.mutate({
      email: data.get('email') as string,
      password: data.get('password') as string,
    })
  }

  async function handlePasskeyLogin() {
    try {
      const { options, passkeyToken } = await loginOptions.mutateAsync({ identifier: email || undefined })
      const assertionResponse = await startAuthentication(options as any)
      await passkeyLogin.mutateAsync({ passkeyToken, assertionResponse })
    } catch (e: any) {
      if (e?.name === 'NotAllowedError') return
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in to ${config.projectName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          {login.isError && (
            <p className="text-destructive text-sm">{formatAuthError(login.error, 'login')}</p>
          )}
          <Button type="submit" disabled={login.isPending}>
            {login.isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        {typeof window !== 'undefined' && !!window.PublicKeyCredential && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
            {passkeyLogin.isError && (
              <p className="text-destructive text-sm">{formatAuthError(passkeyLogin.error, 'login')}</p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handlePasskeyLogin}
              disabled={loginOptions.isPending || passkeyLogin.isPending}
            >
              {loginOptions.isPending || passkeyLogin.isPending ? 'Signing in...' : 'Sign in with passkey'}
            </Button>
          </div>
        )}
        {/* To add OAuth: import { getOAuthUrl } from '@lib/snapshot' and link to getOAuthUrl('google') */}
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <Link to="/auth/register" className="text-muted-foreground hover:text-foreground">
            Create account
          </Link>
          <Link to="/auth/forgot-password" className="text-muted-foreground hover:text-foreground">
            Forgot password?
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
`;
  }

  return `import { Link } from '@tanstack/react-router'
import { useHead } from '@unhead/react'
import { useLogin, formatAuthError } from '@lib/snapshot'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'

export function LoginPage() {
  useHead({ title: 'Sign in' })
  const login = useLogin()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    login.mutate({
      email: data.get('email') as string,
      password: data.get('password') as string,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in to ${config.projectName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          {login.isError && (
            <p className="text-destructive text-sm">{formatAuthError(login.error, 'login')}</p>
          )}
          <Button type="submit" disabled={login.isPending}>
            {login.isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        {/* To add OAuth: import { getOAuthUrl } from '@lib/snapshot' and link to getOAuthUrl('google') */}
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <Link to="/auth/register" className="text-muted-foreground hover:text-foreground">
            Create account
          </Link>
          <Link to="/auth/forgot-password" className="text-muted-foreground hover:text-foreground">
            Forgot password?
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
`;
}
