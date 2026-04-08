export function generateSettingsPageComponent(): string {
  return `import { useHead } from '@unhead/react'
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card'

export function SettingsPage() {
  useHead({ title: 'Settings' })

  const links = [
    { to: '/settings/password', label: 'Password', description: 'Change your password' },
    { to: '/settings/sessions', label: 'Sessions', description: 'Manage active sessions' },
    { to: '/settings/delete-account', label: 'Delete account', description: 'Permanently delete your account' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your account settings</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex flex-col gap-0.5 rounded-md border px-4 py-3 hover:bg-muted transition-colors"
          >
            <span className="text-sm font-medium">{link.label}</span>
            <span className="text-xs text-muted-foreground">{link.description}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
`;
}
