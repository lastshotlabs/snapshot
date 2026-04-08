/**
 * Generates a starter bunshot-mail plugin config file.
 *
 * Writes to src-server/plugins/mail.ts alongside the scaffolded frontend.
 * Copy this file into your bunshot backend (src/plugins/ or similar).
 */

export function generateMailPlugin(): string {
  return `import {
  createMailPlugin,
  createResendProvider,
  createRawHtmlRenderer,
  adaptAuthTemplates,
} from '@lastshotlabs/bunshot-mail'

/**
 * Mail plugin — wires bunshot-auth delivery events to Resend.
 *
 * Copy this file into your bunshot backend (e.g. src/plugins/mail.ts) and
 * register the plugin with your app:
 *
 *   import { mailPlugin } from './plugins/mail'
 *   await mailPlugin.setup(app, {}, bus)
 *
 * Requires RESEND_API_KEY in your backend .env.
 */

const templates = await adaptAuthTemplates()

export const mailPlugin = createMailPlugin({
  provider: createResendProvider({
    apiKey: process.env.RESEND_API_KEY ?? '',
  }),

  renderer: createRawHtmlRenderer({ templates }),

  from: { name: 'My App', email: 'noreply@example.com' },

  subscriptions: [
    {
      event: 'auth:delivery.email_verification',
      template: 'email_verification',
      subject: 'Verify your email',
      recipientMapper: (p) => p.email,
      dataMapper: (p) => ({ token: p.token, userId: p.userId }),
    },
    {
      event: 'auth:delivery.password_reset',
      template: 'password_reset',
      subject: 'Reset your password',
      recipientMapper: (p) => p.email,
      dataMapper: (p) => ({ token: p.token }),
    },
    {
      event: 'auth:delivery.magic_link',
      template: 'magic_link',
      subject: 'Your magic link',
      recipientMapper: (p) => p.identifier,
      dataMapper: (p) => ({ link: p.link }),
    },
    {
      event: 'auth:delivery.email_otp',
      template: 'email_otp',
      subject: 'Your verification code',
      recipientMapper: (p) => p.email,
      dataMapper: (p) => ({ code: p.code }),
    },
    {
      event: 'auth:delivery.account_deletion',
      template: 'account_deletion',
      subject: 'Your account deletion request',
      recipientMapper: (p) => p.email,
      dataMapper: (p) => ({ cancelToken: p.cancelToken, gracePeriodSeconds: p.gracePeriodSeconds }),
    },
    {
      event: 'auth:delivery.welcome',
      template: 'welcome_email',
      subject: 'Welcome!',
      recipientMapper: (p) => p.email,
      dataMapper: (p) => ({ identifier: p.identifier }),
    },
  ],
})
`;
}
