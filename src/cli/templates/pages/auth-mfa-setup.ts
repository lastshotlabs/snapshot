import type { ScaffoldConfig } from "../../types";

export function generateMfaSetupPageComponent(_config: ScaffoldConfig): string {
  return `import { useState } from 'react'
import { useHead } from '@unhead/react'
import { Link } from '@tanstack/react-router'
import QRCode from 'react-qr-code'
import { useMfaSetup, useMfaVerifySetup } from '@lib/snapshot'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card'

export function MfaSetupPage() {
  useHead({ title: 'Set up authenticator' })
  const setup = useMfaSetup()
  const verifySetup = useMfaVerifySetup()
  const [copied, setCopied] = useState(false)

  function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    verifySetup.mutate({ code: data.get('code') as string })
  }

  function handleCopy() {
    navigator.clipboard.writeText(verifySetup.data!.recoveryCodes.join('\\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Step 3: Recovery codes
  if (verifySetup.isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Save your recovery codes</CardTitle>
          <CardDescription>
            Store these codes in a safe place. Each code can only be used once.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 rounded-md border bg-muted p-4 font-mono text-sm">
            {verifySetup.data.recoveryCodes.map((code) => (
              <span key={code}>{code}</span>
            ))}
          </div>
          <Button variant="outline" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy codes'}
          </Button>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Done — go to dashboard
          </Link>
        </CardContent>
      </Card>
    )
  }

  // Step 2: QR code + verify
  if (setup.isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scan the QR code</CardTitle>
          <CardDescription>
            Scan this code with your authenticator app, then enter the 6-digit code below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex justify-center rounded-md border bg-white p-4">
            <QRCode value={setup.data.uri} size={200} />
          </div>
          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground">
              Can't scan? Enter this key manually
            </summary>
            <code className="mt-2 block break-all rounded bg-muted px-3 py-2 font-mono text-xs">
              {setup.data.secret}
            </code>
          </details>
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                autoComplete="one-time-code"
                maxLength={6}
                required
                autoFocus
              />
            </div>
            {verifySetup.isError && (
              <p className="text-destructive text-sm">{verifySetup.error.message}</p>
            )}
            <Button type="submit" disabled={verifySetup.isPending}>
              {verifySetup.isPending ? 'Verifying...' : 'Verify & enable'}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  // Step 1: Initiate
  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with a TOTP authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {setup.isError && (
          <p className="text-destructive text-sm">{setup.error.message}</p>
        )}
        <Button onClick={() => setup.mutate()} disabled={setup.isPending}>
          {setup.isPending ? 'Generating...' : 'Set up authenticator'}
        </Button>
      </CardContent>
    </Card>
  )
}
`;
}
