export function generateSettingsDeleteAccountPageComponent(): string {
  return `import { useState } from 'react'
import { useHead } from '@unhead/react'
import { useDeleteAccount, useCancelDeletion, useUser } from '@lib/snapshot'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card'

export function SettingsDeleteAccountPage() {
  useHead({ title: 'Delete account' })
  const { user } = useUser()
  const deleteAccount = useDeleteAccount()
  const cancelDeletion = useCancelDeletion()
  const [confirm, setConfirm] = useState('')

  const pendingDeletion = user?.deletionScheduledAt != null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
        <CardDescription>
          {pendingDeletion
            ? 'Your account is scheduled for deletion.'
            : 'Permanently delete your account and all associated data.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {pendingDeletion ? (
          <>
            <p className="text-sm text-muted-foreground">
              Scheduled for deletion on{' '}
              {new Date(user!.deletionScheduledAt!).toLocaleDateString()}.
            </p>
            {cancelDeletion.isError && (
              <p className="text-destructive text-sm">{cancelDeletion.error.message}</p>
            )}
            <Button
              variant="outline"
              onClick={() => cancelDeletion.mutate()}
              disabled={cancelDeletion.isPending}
            >
              {cancelDeletion.isPending ? 'Cancelling...' : 'Cancel deletion'}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="confirm">Type your email to confirm</Label>
              <Input
                id="confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={user?.email ?? 'your@email.com'}
                autoComplete="off"
              />
            </div>
            {deleteAccount.isError && (
              <p className="text-destructive text-sm">{deleteAccount.error.message}</p>
            )}
            <Button
              variant="destructive"
              onClick={() => deleteAccount.mutate()}
              disabled={deleteAccount.isPending || confirm !== user?.email}
            >
              {deleteAccount.isPending ? 'Deleting...' : 'Delete account'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
`;
}
