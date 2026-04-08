export function generatePasskeyManagePageComponent(): string {
  return `import { useState } from 'react'
import { useHead } from '@unhead/react'
import { startRegistration } from '@simplewebauthn/browser'
import {
  useWebAuthnRegisterOptions,
  useWebAuthnRegister,
  useWebAuthnCredentials,
  useWebAuthnRemoveCredential,
} from '@lib/snapshot'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card'

export function PasskeyManagePage() {
  useHead({ title: 'Passkeys' })
  const credentials = useWebAuthnCredentials()
  const registerOptions = useWebAuthnRegisterOptions()
  const register = useWebAuthnRegister()
  const remove = useWebAuthnRemoveCredential()
  const [addError, setAddError] = useState<string | null>(null)

  async function handleAddPasskey() {
    setAddError(null)
    try {
      const { options, registrationToken } = await registerOptions.mutateAsync()
      const attestationResponse = await startRegistration(options as any)
      await register.mutateAsync({ registrationToken, attestationResponse })
    } catch (e: any) {
      if (e?.name === 'NotAllowedError') return
      setAddError(e?.message ?? 'Registration failed')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passkeys</CardTitle>
        <CardDescription>
          Sign in with Windows Hello, Face ID, Touch ID, or a hardware security key — no password needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {credentials.isLoading && (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
        {credentials.credentials?.length === 0 && (
          <p className="text-sm text-muted-foreground">No passkeys registered yet.</p>
        )}
        {credentials.credentials?.map((cred) => (
          <div
            key={cred.credentialId}
            className="flex items-center justify-between rounded-md border px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{cred.name ?? 'Passkey'}</p>
              <p className="text-xs text-muted-foreground">
                Added {new Date(cred.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => remove.mutate(cred.credentialId)}
              disabled={remove.isPending}
            >
              Remove
            </Button>
          </div>
        ))}
        {addError && <p className="text-destructive text-sm">{addError}</p>}
        <Button
          onClick={handleAddPasskey}
          disabled={registerOptions.isPending || register.isPending}
        >
          {registerOptions.isPending || register.isPending ? 'Registering...' : 'Add passkey'}
        </Button>
      </CardContent>
    </Card>
  )
}
`;
}
