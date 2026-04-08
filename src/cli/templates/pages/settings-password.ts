export function generateSettingsPasswordPageComponent(): string {
  return `import { useHead } from '@unhead/react'
import { useSetPassword } from '@lib/snapshot'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card'

export function SettingsPasswordPage() {
  useHead({ title: 'Change password' })
  const setPassword = useSetPassword()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setPassword.mutate({
      currentPassword: data.get('currentPassword') as string,
      newPassword: data.get('newPassword') as string,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>Update your account password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" name="newPassword" type="password" required autoComplete="new-password" minLength={8} />
          </div>
          {setPassword.isError && (
            <p className="text-destructive text-sm">{setPassword.error.message}</p>
          )}
          {setPassword.isSuccess && (
            <p className="text-sm text-green-600">Password updated.</p>
          )}
          <Button type="submit" disabled={setPassword.isPending}>
            {setPassword.isPending ? 'Saving...' : 'Update password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
`;
}
