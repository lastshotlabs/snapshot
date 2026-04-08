export function generateSettingsEmailOtpPageComponent(): string {
  return `import { useState } from 'react'
import { useHead } from '@unhead/react'
import { useMfaEmailOtpEnable, useMfaEmailOtpVerifySetup, useMfaEmailOtpDisable, useMfaMethods } from '@lib/snapshot'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card'

export function SettingsEmailOtpPage() {
  useHead({ title: 'Email OTP' })
  const { methods } = useMfaMethods()
  const enable = useMfaEmailOtpEnable()
  const verifySetup = useMfaEmailOtpVerifySetup()
  const disable = useMfaEmailOtpDisable()
  const [step, setStep] = useState<'idle' | 'verify'>('idle')
  const [disablePassword, setDisablePassword] = useState('')

  const isEnabled = methods?.includes('emailOtp') ?? false

  async function handleEnable() {
    await enable.mutateAsync()
    setStep('verify')
  }

  function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    verifySetup.mutate({ code: data.get('code') as string })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email OTP</CardTitle>
        <CardDescription>
          {isEnabled
            ? 'Email one-time passwords are enabled for your account.'
            : 'Receive one-time codes by email as a second factor.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!isEnabled && step === 'idle' && (
          <>
            {enable.isError && <p className="text-destructive text-sm">{enable.error.message}</p>}
            <Button onClick={handleEnable} disabled={enable.isPending}>
              {enable.isPending ? 'Sending...' : 'Enable email OTP'}
            </Button>
          </>
        )}
        {step === 'verify' && (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">A verification code was sent to your email. Enter it below to confirm setup.</p>
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input id="code" name="code" type="text" inputMode="numeric" placeholder="000000" maxLength={6} required autoFocus />
            </div>
            {verifySetup.isError && <p className="text-destructive text-sm">{verifySetup.error.message}</p>}
            {verifySetup.isSuccess && <p className="text-sm text-green-600">Email OTP enabled.</p>}
            <Button type="submit" disabled={verifySetup.isPending}>
              {verifySetup.isPending ? 'Verifying...' : 'Verify'}
            </Button>
          </form>
        )}
        {isEnabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="disablePassword">Password</Label>
              <Input
                id="disablePassword"
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter your password to disable"
                autoComplete="current-password"
              />
            </div>
            {disable.isError && <p className="text-destructive text-sm">{disable.error.message}</p>}
            <Button
              variant="destructive"
              onClick={() => disable.mutate({ password: disablePassword })}
              disabled={disable.isPending || !disablePassword}
            >
              {disable.isPending ? 'Disabling...' : 'Disable email OTP'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
`;
}
