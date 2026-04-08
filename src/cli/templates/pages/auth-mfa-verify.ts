import type { ScaffoldConfig } from "../../types";

export function generateMfaVerifyPageComponent(config: ScaffoldConfig): string {
  // Both hardened and prototype use the in-memory pending challenge flow
  return `import { useState } from 'react'
import { useHead } from '@unhead/react'
import { Link } from '@tanstack/react-router'
import { useMfaVerify, useMfaResend, usePendingMfaChallenge } from '@lib/snapshot'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card'

export function MfaVerifyPage() {
  useHead({ title: 'Two-factor authentication' })
  const pendingChallenge = usePendingMfaChallenge()
  const [useRecovery, setUseRecovery] = useState(false)
  const verify = useMfaVerify()
  const resend = useMfaResend()

  if (!pendingChallenge) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Your MFA challenge has expired or is no longer valid. Please{' '}
            <Link to="/auth/login" className="text-foreground underline underline-offset-4 hover:text-foreground/80">
              sign in
            </Link>{' '}
            again.
          </p>
        </CardContent>
      </Card>
    )
  }

  const availableMethods = pendingChallenge.mfaMethods

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const method = useRecovery ? 'recovery' : (availableMethods[0] ?? 'totp')
    verify.mutate({ code: data.get('code') as string, method })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{useRecovery ? 'Recovery code' : 'Two-factor authentication'}</CardTitle>
        <CardDescription>
          {useRecovery
            ? 'Enter one of your recovery codes.'
            : 'Enter the 6-digit code from your authenticator app or email.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">{useRecovery ? 'Recovery code' : 'Verification code'}</Label>
            <Input
              id="code"
              name="code"
              type="text"
              inputMode={useRecovery ? 'text' : 'numeric'}
              placeholder={useRecovery ? 'xxxxxxxx-xxxx' : '000000'}
              autoComplete="one-time-code"
              maxLength={useRecovery ? 20 : 6}
              required
              autoFocus
            />
          </div>
          {verify.isError && (
            <p className="text-destructive text-sm">{verify.error.message}</p>
          )}
          <Button type="submit" disabled={verify.isPending}>
            {verify.isPending ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <button
            type="button"
            onClick={() => setUseRecovery(!useRecovery)}
            className="text-muted-foreground hover:text-foreground text-left transition-colors"
          >
            {useRecovery ? 'Use authenticator code instead' : 'Use a recovery code instead'}
          </button>
          {!useRecovery && availableMethods.includes('emailOtp') && (
            <button
              type="button"
              onClick={() => resend.mutate({ mfaToken: pendingChallenge.mfaToken })}
              disabled={resend.isPending || resend.isSuccess}
              className="text-muted-foreground hover:text-foreground text-left transition-colors disabled:opacity-50"
            >
              {resend.isPending ? 'Sending...' : resend.isSuccess ? 'Code sent' : 'Resend email code'}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
`;
}
