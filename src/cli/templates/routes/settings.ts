export function generateSettingsIndexRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@pages/settings/SettingsPage'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsPage,
})
`;
}

export function generateSettingsPasswordRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { SettingsPasswordPage } from '@pages/settings/SettingsPasswordPage'

export const Route = createFileRoute('/_authenticated/settings/password')({
  component: SettingsPasswordPage,
})
`;
}

export function generateSettingsSessionsRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { SettingsSessionsPage } from '@pages/settings/SettingsSessionsPage'

export const Route = createFileRoute('/_authenticated/settings/sessions')({
  component: SettingsSessionsPage,
})
`;
}

export function generateSettingsDeleteAccountRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { SettingsDeleteAccountPage } from '@pages/settings/SettingsDeleteAccountPage'

export const Route = createFileRoute('/_authenticated/settings/delete-account')({
  component: SettingsDeleteAccountPage,
})
`;
}

export function generateSettingsEmailOtpRoute(): string {
  return `import { createFileRoute } from '@tanstack/react-router'
import { SettingsEmailOtpPage } from '@pages/settings/SettingsEmailOtpPage'

export const Route = createFileRoute('/_authenticated/settings/email-otp')({
  component: SettingsEmailOtpPage,
})
`;
}
