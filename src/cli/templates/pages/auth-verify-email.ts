export function generateVerifyEmailPageComponent(): string {
  return `import { useEffect } from 'react'
import { useHead } from '@unhead/react'
import { Route } from '../../routes/_guest/auth/verify-email'
import { useVerifyEmail, useResendVerification, formatAuthError } from '@lib/snapshot'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card'

export function VerifyEmailPage() {
  useHead({ title: 'Verify email' })
  const { token } = Route.useSearch()
  const verifyEmail = useVerifyEmail()
  const resend = useResendVerification()

  useEffect(() => {
    if (token) {
      verifyEmail.mutate({ token })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email verification</CardTitle>
        </CardHeader>
        <CardContent>
          {verifyEmail.isPending && (
            <p className="text-sm text-muted-foreground">Verifying your email...</p>
          )}
          {verifyEmail.isSuccess && (
            <p className="text-sm text-muted-foreground">
              Your email has been verified. You can now sign in.
            </p>
          )}
          {verifyEmail.isError && (
            <p className="text-destructive text-sm">{formatAuthError(verifyEmail.error, 'verify-email')}</p>
          )}
        </CardContent>
      </Card>
    )
  }

  // No token — show "check your email" + resend option (optimistic success)
  const resendSubmitted = resend.isSuccess || resend.isError
  return (
    <Card>
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          We sent you a verification link. Click it to verify your email address.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {resendSubmitted ? (
          <p className="text-sm text-muted-foreground">If that email is registered, a new verification link has been sent.</p>
        ) : (
          <Button
            variant="outline"
            disabled={resend.isPending}
            onClick={() => {
              const email = prompt('Enter your email address to resend the verification link:')
              if (email) resend.mutate({ email })
            }}
          >
            {resend.isPending ? 'Sending...' : 'Resend verification email'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
`;
}
