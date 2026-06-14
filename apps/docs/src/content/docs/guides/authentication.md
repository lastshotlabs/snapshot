---
title: Authentication
description: Login, registration, MFA, OAuth, passkeys, and session management.
draft: false
---

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";
import { InputField, ButtonBase, CardBase, ColumnBase, AlertBase } from "@lastshotlabs/snapshot/ui";
import { useState, useEffect } from "react";

const snap = createSnapshot({
  apiUrl: "/api",
  loginPath: "/login",
  homePath: "/",
});

function LoginPage() {
  const { mutate: login, isPending, error, reset } = snap.useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <CardBase title="Sign in">
      <form onSubmit={(e) => { e.preventDefault(); reset(); login({ email, password }); }}>
        <ColumnBase gap="md">
          <InputField label="Email" type="email" value={email} onChange={setEmail} required />
          <InputField label="Password" type="password" value={password} onChange={setPassword} required />
          {error && <AlertBase severity="error">{snap.formatAuthError(error)}</AlertBase>}
          <ButtonBase label={isPending ? "Signing in..." : "Sign in"} type="submit" disabled={isPending} fullWidth />
        </ColumnBase>
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
function RegisterForm() {
  const { mutate: register, isPending, error } = snap.useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const mismatch = confirm.length > 0 && confirm !== password;

  return (
    <CardBase title="Create account">
      <form onSubmit={(e) => {
        e.preventDefault();
        if (!mismatch) register({ name, email, password });
      }}>
        <ColumnBase gap="md">
          <InputField label="Full name" value={name} onChange={setName} required />
          <InputField label="Email" type="email" value={email} onChange={setEmail} required />
          <InputField label="Password" type="password" value={password} onChange={setPassword} required />
          <InputField
            label="Confirm password" type="password" value={confirm} onChange={setConfirm} required
            errorText={mismatch ? "Passwords don't match" : undefined}
          />
          {error && <AlertBase severity="error">{snap.formatAuthError(error)}</AlertBase>}
          <ButtonBase label={isPending ? "Creating..." : "Create account"} type="submit" disabled={isPending || mismatch} fullWidth />
        </ColumnBase>
      </form>
    </CardBase>
  );
}
```

### useForgotPassword and useResetPassword

`useForgotPassword` sends a reset link. `useResetPassword` completes the reset using the token from that link.

```tsx
function ForgotPasswordPage() {
  const { mutate: forgot, isSuccess, isPending, error } = snap.useForgotPassword();
  const [email, setEmail] = useState("");

  if (isSuccess) {
    return (
      <CardBase title="Check your email">
        <p>We sent a reset link to <strong>{email}</strong>. It expires in 1 hour.</p>
      </CardBase>
    );
  }

  return (
    <CardBase title="Reset password">
      <form onSubmit={(e) => { e.preventDefault(); forgot({ email }); }}>
        <ColumnBase gap="md">
          <InputField label="Email" type="email" value={email} onChange={setEmail} required />
          {error && <AlertBase severity="error">{snap.formatAuthError(error)}</AlertBase>}
          <ButtonBase label={isPending ? "Sending..." : "Send reset link"} type="submit" disabled={isPending} fullWidth />
        </ColumnBase>
      </form>
    </CardBase>
  );
}
```

Mount a reset page at the URL in your reset emails (e.g. `/auth/reset?token=...`):

```tsx
function ResetPasswordPage() {
  const { mutate: resetPassword, isPending, isSuccess, error } = snap.useResetPassword();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = confirm.length > 0 && confirm !== password;

  if (isSuccess) {
    return (
      <CardBase title="Password reset">
        <AlertBase severity="success">Your password has been reset.</AlertBase>
        <ButtonBase label="Sign in" onClick={() => (window.location.href = "/login")} fullWidth />
      </CardBase>
    );
  }

  return (
    <CardBase title="Set new password">
      <form onSubmit={(e) => { e.preventDefault(); if (!mismatch) resetPassword({ token, password }); }}>
        <ColumnBase gap="md">
          <InputField label="New password" type="password" value={password} onChange={setPassword} required />
          <InputField label="Confirm password" type="password" value={confirm} onChange={setConfirm} required
            errorText={mismatch ? "Passwords don't match" : undefined} />
          {error && <AlertBase severity="error">{snap.formatAuthError(error)}</AlertBase>}
          <ButtonBase label={isPending ? "Resetting..." : "Reset password"} type="submit" disabled={isPending || mismatch} fullWidth />
        </ColumnBase>
      </form>
    </CardBase>
  );
}
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
      <form onSubmit={(e) => { e.preventDefault(); verify({ code, method: challenge.mfaMethods[0] }); }}>
        <InputField label="Verification code" value={code} onChange={setCode} />
        <ButtonBase label="Verify" type="submit" />
      </form>
    );
  }

  return <LoginForm onSubmit={(creds) => login(creds)} />;
}
```

### MFA setup flow

Enable TOTP (authenticator app) for a user in their settings:

```tsx
function MfaSetup() {
  const { mutate: startSetup, data: setupData, isPending: starting } = snap.useMfaSetup();
  const { mutate: verifySetup, isPending: verifying, error } = snap.useMfaVerifySetup();
  const [code, setCode] = useState("");

  // Step 1: Start setup — returns QR code URI and backup codes
  if (!setupData) {
    return (
      <ButtonBase
        label={starting ? "Setting up..." : "Enable two-factor authentication"}
        onClick={() => startSetup()}
        disabled={starting}
      />
    );
  }

  // Step 2: User scans QR code and enters first code to confirm
  return (
    <ColumnBase gap="md">
      <p>Scan this QR code with your authenticator app:</p>
      <img src={setupData.qrCodeUrl} alt="TOTP QR code" style={{ width: 200, height: 200 }} />
      <p style={{ fontSize: "0.875rem", color: "var(--sn-color-muted-foreground)" }}>
        Or enter this key manually: <code>{setupData.secret}</code>
      </p>
      <form onSubmit={(e) => { e.preventDefault(); verifySetup({ code }); }}>
        <InputField label="Enter the 6-digit code" value={code} onChange={setCode} maxLength={6} />
        {error && <AlertBase severity="error">{snap.formatAuthError(error)}</AlertBase>}
        <ButtonBase label={verifying ? "Verifying..." : "Confirm"} type="submit" disabled={verifying} />
      </form>
      <details>
        <summary>Backup codes (save these somewhere safe)</summary>
        <pre>{setupData.recoveryCodes?.join("\n")}</pre>
      </details>
    </ColumnBase>
  );
}
```

### All MFA hooks

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
// URL is built from auth.providers config (clientId, scopes, callbackPath)
```

### Exchange OAuth code for session

After the provider redirects back with a `code` parameter, mount a callback page that exchanges it for a session:

```tsx
function OAuthCallback() {
  const { mutate: exchange, error, isPending } = snap.useOAuthExchange();
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const provider = params.get("provider") ?? "google";

  useEffect(() => {
    if (code) exchange({ code, provider });
  }, [code]);

  if (error) {
    return (
      <CardBase title="Sign-in failed">
        <AlertBase severity="error">{snap.formatAuthError(error)}</AlertBase>
        <ButtonBase label="Try again" onClick={() => (window.location.href = "/login")} />
      </CardBase>
    );
  }

  return <p>{isPending ? "Completing sign-in..." : "Redirecting..."}</p>;
}
```

### Built-in OAuth buttons

```tsx
import { OAuthButtonsBase } from "@lastshotlabs/snapshot/ui";

<OAuthButtonsBase
  providers={[
    { name: "google", label: "Continue with Google", url: snap.getOAuthUrl("google") },
    { name: "github", label: "Continue with GitHub", url: snap.getOAuthUrl("github") },
    { name: "discord", label: "Continue with Discord", url: snap.getOAuthUrl("discord") },
  ]}
  onProviderClick={(url) => {
    window.location.href = url;
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

The WebAuthn browser API can throw if the user cancels or the device doesn't support it. Always wrap in try-catch:

```tsx
import { PasskeyButtonBase } from "@lastshotlabs/snapshot/ui";

function PasskeyLogin() {
  const { mutate: getLoginOptions } = snap.usePasskeyLoginOptions();
  const { mutate: passkeyLogin } = snap.usePasskeyLogin();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <PasskeyButtonBase
        label="Sign in with passkey"
        onClick={() => {
          setError(null);
          getLoginOptions({}, {
            onSuccess: async (response) => {
              try {
                const assertion = await navigator.credentials.get({
                  publicKey: response.options as any,
                });
                if (assertion) {
                  passkeyLogin({
                    id: assertion.id,
                    rawId: btoa(String.fromCharCode(...new Uint8Array((assertion as any).rawId))),
                    response: {
                      authenticatorData: btoa(String.fromCharCode(
                        ...new Uint8Array((assertion as any).response.authenticatorData))),
                      clientDataJSON: btoa(String.fromCharCode(
                        ...new Uint8Array((assertion as any).response.clientDataJSON))),
                      signature: btoa(String.fromCharCode(
                        ...new Uint8Array((assertion as any).response.signature))),
                    },
                  });
                }
              } catch (err) {
                if ((err as Error).name !== "NotAllowedError") {
                  setError("Passkey authentication failed. Try another sign-in method.");
                }
              }
            },
            onError: () => setError("Could not start passkey login."),
          });
        }}
      />
      {error && <AlertBase severity="error">{error}</AlertBase>}
    </>
  );
}
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

## Email verification

Mount a verification page at the URL in your verification emails (e.g. `/auth/verify?token=...`):

```tsx
function VerifyEmailPage() {
  const { mutate: verify, isPending, isSuccess, error } = snap.useVerifyEmail();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const { mutate: resend, isPending: resending, isSuccess: resent } = snap.useResendVerification();
  const { user } = snap.useUser();

  useEffect(() => {
    if (token) verify({ token });
  }, [token]);

  if (isSuccess) {
    return (
      <CardBase title="Email verified">
        <AlertBase severity="success">Your email has been verified.</AlertBase>
        <ButtonBase label="Go to dashboard" onClick={() => (window.location.href = "/")} fullWidth />
      </CardBase>
    );
  }

  return (
    <CardBase title="Verify your email">
      {isPending && <p>Verifying...</p>}
      {error && (
        <ColumnBase gap="md">
          <AlertBase severity="error">{snap.formatAuthError(error)}</AlertBase>
          {resent
            ? <AlertBase severity="success">Verification email sent</AlertBase>
            : <ButtonBase
                label={resending ? "Sending..." : "Resend verification email"}
                variant="outline"
                onClick={() => resend({ email: user?.email ?? "" })}
                disabled={resending}
                fullWidth
              />
          }
        </ColumnBase>
      )}
    </CardBase>
  );
}
```

## Account management

### Change password

```tsx
function ChangePassword() {
  const { mutate: setPassword, isPending, isSuccess, error, reset } = snap.useSetPassword();
  const [current, setCurrent] = useState("");
  const [newPwd, setNewPwd] = useState("");

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      setPassword({ password: newPwd, currentPassword: current }, {
        onSuccess: () => { setCurrent(""); setNewPwd(""); },
      });
    }}>
      <ColumnBase gap="md">
        <InputField label="Current password" type="password" value={current} onChange={(v) => { setCurrent(v); reset(); }} />
        <InputField label="New password" type="password" value={newPwd} onChange={setNewPwd} />
        {isSuccess && <AlertBase severity="success">Password updated</AlertBase>}
        {error && <AlertBase severity="error">{snap.formatAuthError(error)}</AlertBase>}
        <ButtonBase label={isPending ? "Updating..." : "Update password"} type="submit" disabled={isPending || !current || !newPwd} />
      </ColumnBase>
    </form>
  );
}
```

### Session management

```tsx
function ActiveSessions() {
  const { sessions, isLoading } = snap.useSessions();
  const { mutate: revoke } = snap.useRevokeSession();

  if (isLoading) return <p>Loading sessions...</p>;

  return (
    <ColumnBase gap="sm">
      {sessions?.map((s) => (
        <RowBase key={s.id} justify="between" align="center">
          <span>{s.device} — {s.ip} {s.current && "(current)"}</span>
          {!s.current && (
            <ButtonBase label="Revoke" variant="destructive" size="sm" onClick={() => revoke(s.id)} />
          )}
        </RowBase>
      ))}
    </ColumnBase>
  );
}
```

### All account hooks

| Hook | Purpose | Parameters |
|------|---------|------------|
| `useResetPassword()` | Reset password with token | `{ token, password }` |
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
