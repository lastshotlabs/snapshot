import type { ScaffoldConfig } from "../../types";

export function generateRegisterPageComponent(config: ScaffoldConfig): string {
  return `import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useHead } from '@unhead/react'
import { useRegister, formatAuthError } from '@lib/snapshot'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'

export function RegisterPage() {
  useHead({ title: 'Create account' })
  const register = useRegister()
  const [passwordError, setPasswordError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const password = data.get('password') as string
    const confirmPassword = data.get('confirmPassword') as string
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    setPasswordError(null)
    register.mutate({
      email: data.get('email') as string,
      password,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your ${config.projectName} account</CardTitle>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required />
          </div>
          {passwordError && (
            <p className="text-destructive text-sm">{passwordError}</p>
          )}
          {register.isError && (
            <p className="text-destructive text-sm">{formatAuthError(register.error, 'register')}</p>
          )}
          <Button type="submit" disabled={register.isPending}>
            {register.isPending ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
        <div className="mt-4 text-sm">
          <Link to="/auth/login" className="text-muted-foreground hover:text-foreground">
            Already have an account? Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
`;
}
