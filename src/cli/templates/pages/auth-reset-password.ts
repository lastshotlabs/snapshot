export function generateResetPasswordPageComponent(): string {
  return `import { useState } from 'react'
import { useHead } from '@unhead/react'
import { Link } from '@tanstack/react-router'
import { Route } from '../../routes/_guest/auth/reset-password'
import { useResetPassword, formatAuthError } from '@lib/snapshot'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card'

export function ResetPasswordPage() {
  useHead({ title: 'Set new password' })
  const { token } = Route.useSearch()
  const resetPassword = useResetPassword()
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
    resetPassword.mutate({ token, password })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set new password</CardTitle>
        <CardDescription>Choose a strong password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {resetPassword.isSuccess ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Your password has been updated.</p>
            <Link to="/auth/login" className="text-sm text-foreground underline underline-offset-4 hover:text-foreground/80">
              Sign in →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required />
            </div>
            {passwordError && (
              <p className="text-destructive text-sm">{passwordError}</p>
            )}
            {resetPassword.isError && (
              <p className="text-destructive text-sm">{formatAuthError(resetPassword.error, 'reset-password')}</p>
            )}
            <Button type="submit" disabled={resetPassword.isPending}>
              {resetPassword.isPending ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
`;
}
