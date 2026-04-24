---
title: Authentication
description: Login, registration, MFA, OAuth, passkeys, and session management.
draft: false
---

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";
import { InputField, ButtonBase, CardBase } from "@lastshotlabs/snapshot/ui";
import { useState } from "react";

const snap = createSnapshot({ apiUrl: "/api", manifest: {
  app: { auth: { loginPath: "/login", homePath: "/" } },
}});

function LoginPage() {
  const { mutate: login, isPending, isError } = snap.useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <CardBase title="Sign in">
      <form onSubmit={(e) => { e.preventDefault(); login({ email, password }); }}>
        <InputField label="Email" type="email" value={email} onChange={setEmail} />
        <InputField label="Password" type="password" value={password} onChange={setPassword} />
        {isError && <p>Invalid credentials</p>}
        <ButtonBase label="Sign in" type="submit" disabled={isPending} />
      </form>
    </CardBase>
  );
}
```

## Core auth hooks

### useUser

Fetches the current authenticated user. Caches for 5 minutes.

```tsx
const { user, isLoading, isError } = snap.useUser();
// user is AuthUser | null — null when logged out
```

### useLogin

Posts credentials to `/auth/login`. Returns a TanStack Query mutation.

```tsx
const { mutate: login, isPending, isError } = snap.useLogin();

login({ email, password });
// On success: stores tokens, caches user, navigates to homePath
// If MFA required: returns MfaChallenge instead of AuthUser
```

To redirect somewhere other than `homePath`:

```tsx
login({ email, password, redirectTo: "/onboarding" });
```

### useLogout

Clears tokens and cache, navigates to `loginPath`.

```tsx
const { mutate: logout } = snap.useLogout();
logout(); // clears all cached data and navigates to loginPath
logout({ redirectTo: "/goodbye" }); // custom redirect
```

### useRegister

Posts to `/auth/register`. On success, stores tokens and navigates to `homePath`.

```tsx
const { mutate: register, isPending } = snap.useRegister();
register({ email, password, name: "Alice" });
```

### useForgotPassword

Posts to `/auth/forgot-password`. No navigation side effects.

```tsx
const { mutate: forgot, isSuccess } = snap.useForgotPassword();
forgot({ email });
// Show "check your email" message on success
```

## MFA (Multi-Factor Authentication)

When `useLogin()` returns an MFA challenge instead of a user, use `isMfaChallenge` to detect it and `useMfaVerify` to complete login.

```tsx
import { isMfaChallenge } from "@lastshotlabs/snapshot";

function LoginWithMfa() {
  const { mutate: login } = snap.useLogin();
  const { mutate: verify } = snap.useMfaVerify();
  const challenge = snap.usePendingMfaChallenge();
  const [code, setCode] = useState("");

  if (challenge) {
    return (
      <form onSubmit={(e) => { e.preventDefault(); verify({ code, method: challenge.method }); }}>
        <InputField label="Verification code" value={code} onChange={setCode} />
        <ButtonBase label="Verify" type="submit" />
      </form>
    );
  }

  return <LoginForm onSubmit={(creds) => login(creds)} />;
}
```

### MFA setup hooks

| Hook | Purpose |
|------|---------|
| `useMfaSetup()` | Start TOTP setup, get QR code and backup codes |
| `useMfaVerifySetup()` | Confirm TOTP setup with first code |
| `useMfaDisable()` | Disable MFA (requires password) |
| `useMfaRecoveryCodes()` | Regenerate recovery codes (requires password) |
| `useMfaMethods()` | Query enabled MFA methods |
| `useMfaResend()` | Resend OTP code |
| `useMfaEmailOtpEnable()` | Enable email OTP method |
| `useMfaEmailOtpVerifySetup()` | Confirm email OTP setup |
| `useMfaEmailOtpDisable()` | Disable email OTP (requires password) |

## OAuth

### Redirect to OAuth provider

```tsx
const url = snap.getOAuthUrl("google");
window.location.href = url;
// URL is built from manifest auth.oauth config (clientId, scopes, redirectUri)
```

### Exchange OAuth code for session

After the provider redirects back with a `code` parameter:

```tsx
function OAuthCallback() {
  const { mutate: exchange } = snap.useOAuthExchange();
  const code = new URLSearchParams(window.location.search).get("code");
  const provider = "google";

  useEffect(() => {
    if (code) exchange({ code, provider });
  }, [code]);

  return <p>Signing in...</p>;
}
```

### Built-in OAuth buttons

```tsx
import { OAuthButtonsBase } from "@lastshotlabs/snapshot/ui";

<OAuthButtonsBase
  providers={["google", "github", "discord"]}
  onProviderClick={(provider) => {
    window.location.href = snap.getOAuthUrl(provider);
  }}
/>
```

### Unlink an OAuth provider

```tsx
const { mutate: unlink } = snap.useOAuthUnlink();
unlink("google"); // removes the linked OAuth account
```

## Passkeys (WebAuthn)

### Register a passkey

```tsx
const { mutate: getOptions } = snap.useWebAuthnRegisterOptions();
const { mutate: register } = snap.useWebAuthnRegister();

// Step 1: Get registration challenge from server
getOptions(undefined, {
  onSuccess: async (options) => {
    // Step 2: Create credential with browser API
    const credential = await navigator.credentials.create({ publicKey: options });
    // Step 3: Send credential to server
    register({
      id: credential.id,
      rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
      response: { /* attestation response */ },
      type: credential.type,
    });
  },
});
```

### Login with passkey

```tsx
import { PasskeyButtonBase } from "@lastshotlabs/snapshot/ui";

const { mutate: getLoginOptions } = snap.usePasskeyLoginOptions();
const { mutate: passkeyLogin } = snap.usePasskeyLogin();

<PasskeyButtonBase
  label="Sign in with passkey"
  onClick={() => {
    getLoginOptions({}, {
      onSuccess: async (options) => {
        const assertion = await navigator.credentials.get({ publicKey: options });
        passkeyLogin({
          id: assertion.id,
          rawId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))),
          response: { /* assertion response */ },
        });
      },
    });
  }}
/>
```

### Manage passkeys

```tsx
const { credentials, isLoading } = snap.useWebAuthnCredentials();
const { mutate: remove } = snap.useWebAuthnRemoveCredential();

// List credentials
credentials?.map((cred) => (
  <div key={cred.id}>
    {cred.name} <ButtonBase label="Remove" onClick={() => remove(cred.id)} />
  </div>
));
```

## Account management

| Hook | Purpose | Parameters |
|------|---------|------------|
| `useResetPassword()` | Reset password | `{ email }` or `{ userId }` |
| `useVerifyEmail()` | Verify email address | `{ token }` |
| `useResendVerification()` | Resend verification email | `{ email }` |
| `useSetPassword()` | Change password | `{ password, currentPassword? }` |
| `useDeleteAccount()` | Delete account | `{ password }` |
| `useCancelDeletion()` | Cancel pending deletion | (none) |
| `useRefreshToken()` | Refresh access token | `{ refreshToken? }` |
| `useSessions()` | List active sessions | (query hook) |
| `useRevokeSession()` | Revoke a session | session ID string |

## Route guards

For TanStack Router, Snapshot provides route guard functions:

```tsx
import { createFileRoute } from "@tanstack/react-router";

// Protected route — redirects unauthenticated users to loginPath
export const Route = createFileRoute("/dashboard")({
  beforeLoad: snap.protectedBeforeLoad,
  component: Dashboard,
});

// Guest route — redirects authenticated users to homePath
export const Route = createFileRoute("/login")({
  beforeLoad: snap.guestBeforeLoad,
  component: LoginPage,
});
```

## Auth error formatting

```tsx
const formatted = snap.formatAuthError(error);
// Returns a user-friendly error message based on the error type
```

## Next steps

- [Forms and Validation](/guides/forms/) -- build forms with Snapshot's 18 field components
- [Layout and Navigation](/guides/layout-and-navigation/) -- add navigation with auth-aware user menus
- [Login Page recipe](/recipes/login-page/) -- complete login page with all auth methods
