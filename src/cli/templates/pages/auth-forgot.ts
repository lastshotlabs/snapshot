export function generateForgotPasswordPageComponent(): string {
  return `import { Link } from '@tanstack/react-router'
import { useHead } from '@unhead/react'
import { useForgotPassword } from '@lib/snapshot'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card'

export function ForgotPasswordPage() {
  useHead({ title: 'Reset password' })
  const forgotPassword = useForgotPassword()
  const submitted = forgotPassword.isSuccess || forgotPassword.isError

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    forgotPassword.mutate({ email: data.get('email') as string })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>
          Enter your email and we'll send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <p className="text-sm text-muted-foreground">
            If that email is registered, you'll receive a password reset link shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <Button type="submit" disabled={forgotPassword.isPending}>
              {forgotPassword.isPending ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        )}
        <div className="mt-4 text-sm">
          <Link to="/auth/login" className="text-muted-foreground hover:text-foreground">
            Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
`;
}
