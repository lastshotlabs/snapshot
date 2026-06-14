---
title: Login Page
description: Complete login page with email/password, OAuth, MFA, and passkeys.
draft: false
---

A production-ready login page with every auth method. Copy this into your project and customize.

## The full login page

```tsx
import { createSnapshot, isMfaChallenge } from "@lastshotlabs/snapshot";
import {
  InputField, ButtonBase, CardBase, OAuthButtonsBase,
  PasskeyButtonBase, RowBase, ColumnBase, AlertBase,
} from "@lastshotlabs/snapshot/ui";
import { useState, useEffect } from "react";

const snap = createSnapshot({
  apiUrl: "/api",
  loginPath: "/login",
  homePath: "/",
  auth: {
    providers: {
      google: {
        type: "google",
        clientId: "YOUR_GOOGLE_CLIENT_ID",
        scopes: ["email", "profile"],
        callbackPath: "/auth/callback",
      },
      github: {
        type: "github",
        clientId: "YOUR_GITHUB_CLIENT_ID",
        scopes: ["user:email"],
        callbackPath: "/auth/callback",
      },
    },
  },
});

export function LoginPage() {
  const { mutate: login, isPending, error: loginError, reset } = snap.useLogin();
  const { mutate: verify, isPending: verifying, error: verifyError } = snap.useMfaVerify();
  const challenge = snap.usePendingMfaChallenge();
  const { mutate: getPasskeyOptions } = snap.usePasskeyLoginOptions();
  const { mutate: passkeyLogin } = snap.usePasskeyLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [view, setView] = useState<"login" | "forgot" | "register">("login");

  // ── MFA verification ──────────────────────────────────────────────────
  if (challenge) {
    return (
      <CenteredCard title="Two-factor authentication">
        <p style={{ color: "var(--sn-color-muted-foreground)" }}>
          Enter the code from your {challenge.mfaMethods[0] === "totp" ? "authenticator app" : "email"}.
        </p>
        <form onSubmit={(e) => {
          e.preventDefault();
          verify({ code: mfaCode, method: challenge.mfaMethods[0] });
        }}>
          <ColumnBase gap="md">
            <InputField
              label="Verification code"
              value={mfaCode}
              onChange={setMfaCode}
              placeholder="000000"
              maxLength={6}
            />
            {verifyError && (
              <AlertBase severity="error">{snap.formatAuthError(verifyError)}</AlertBase>
            )}
            <ButtonBase label={verifying ? "Verifying..." : "Verify"} type="submit" disabled={verifying || !mfaCode} fullWidth />
          </ColumnBase>
        </form>
      </CenteredCard>
    );
  }

  // ── Forgot password ───────────────────────────────────────────────────
  if (view === "forgot") {
    return <ForgotPasswordView onBack={() => setView("login")} />;
  }

  // ── Registration ──────────────────────────────────────────────────────
  if (view === "register") {
    return <RegisterView onBack={() => setView("login")} />;
  }

  // ── Login ─────────────────────────────────────────────────────────────
  return (
    <CenteredCard title="Sign in">
      <form onSubmit={(e) => {
        e.preventDefault();
        reset(); // clear previous errors
        setPasskeyError(null);
        login({ email, password });
      }}>
        <ColumnBase gap="md">
          <InputField label="Email" type="email" value={email} onChange={setEmail} required />
          <InputField label="Password" type="password" value={password} onChange={setPassword} required />
          {loginError && (
            <AlertBase severity="error">{snap.formatAuthError(loginError)}</AlertBase>
          )}
          <ButtonBase label={isPending ? "Signing in..." : "Sign in"} type="submit" disabled={isPending} fullWidth />
        </ColumnBase>
      </form>

      <Divider />

      <OAuthButtonsBase
        providers={[
          { name: "google", label: "Continue with Google", url: snap.getOAuthUrl("google") },
          { name: "github", label: "Continue with GitHub", url: snap.getOAuthUrl("github") },
        ]}
        onProviderClick={(url) => {
          window.location.href = url;
        }}
      />

      <PasskeyButtonBase
        label="Sign in with passkey"
        onClick={() => {
          setPasskeyError(null);
          getPasskeyOptions({}, {
            onSuccess: async (response) => {
              try {
                const assertion = await navigator.credentials.get({
                  publicKey: response.options as any,
                });
                if (assertion) {
                  const rawId = new Uint8Array((assertion as any).rawId);
                  const authData = new Uint8Array((assertion as any).response.authenticatorData);
                  const clientData = new Uint8Array((assertion as any).response.clientDataJSON);
                  const sig = new Uint8Array((assertion as any).response.signature);
                  passkeyLogin({
                    id: assertion.id,
                    rawId: btoa(String.fromCharCode(...rawId)),
                    response: {
                      authenticatorData: btoa(String.fromCharCode(...authData)),
                      clientDataJSON: btoa(String.fromCharCode(...clientData)),
                      signature: btoa(String.fromCharCode(...sig)),
                    },
                  });
                }
              } catch (err) {
                if ((err as Error).name !== "NotAllowedError") {
                  setPasskeyError("Passkey authentication failed. Try another method.");
                }
                // NotAllowedError = user cancelled the prompt, not an error
              }
            },
            onError: () => {
              setPasskeyError("Could not start passkey login. Your browser may not support it.");
            },
          });
        }}
      />

      {passkeyError && (
        <AlertBase severity="error">{passkeyError}</AlertBase>
      )}

      <RowBase justify="between">
        <ButtonBase label="Forgot password?" variant="link" onClick={() => setView("forgot")} />
        <ButtonBase label="Create account" variant="link" onClick={() => setView("register")} />
      </RowBase>
    </CenteredCard>
  );
}

// ── Registration Form ─────────────────────────────────────────────────────

function RegisterView({ onBack }: { onBack: () => void }) {
  const { mutate: register, isPending, error } = snap.useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const passwordMismatch = confirm.length > 0 && confirm !== password;

  return (
    <CenteredCard title="Create account">
      <form onSubmit={(e) => {
        e.preventDefault();
        if (passwordMismatch) return;
        register({ name, email, password });
      }}>
        <ColumnBase gap="md">
          <InputField label="Full name" value={name} onChange={setName} required />
          <InputField label="Email" type="email" value={email} onChange={setEmail} required />
          <InputField label="Password" type="password" value={password} onChange={setPassword} required />
          <InputField
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={setConfirm}
            required
            errorText={passwordMismatch ? "Passwords don't match" : undefined}
          />
          {error && (
            <AlertBase severity="error">{snap.formatAuthError(error)}</AlertBase>
          )}
          <ButtonBase
            label={isPending ? "Creating account..." : "Create account"}
            type="submit"
            disabled={isPending || passwordMismatch}
            fullWidth
          />
        </ColumnBase>
      </form>
      <ButtonBase label="Already have an account? Sign in" variant="link" onClick={onBack} />
    </CenteredCard>
  );
}

// ── Forgot Password ───────────────────────────────────────────────────────

function ForgotPasswordView({ onBack }: { onBack: () => void }) {
  const { mutate: forgot, isSuccess, isPending, error } = snap.useForgotPassword();
  const [email, setEmail] = useState("");

  if (isSuccess) {
    return (
      <CenteredCard title="Check your email">
        <p>We sent a password reset link to <strong>{email}</strong>. It expires in 1 hour.</p>
        <ButtonBase label="Back to sign in" variant="outline" onClick={onBack} fullWidth />
      </CenteredCard>
    );
  }

  return (
    <CenteredCard title="Reset password">
      <p style={{ color: "var(--sn-color-muted-foreground)" }}>
        Enter your email and we'll send a reset link.
      </p>
      <form onSubmit={(e) => { e.preventDefault(); forgot({ email }); }}>
        <ColumnBase gap="md">
          <InputField label="Email" type="email" value={email} onChange={setEmail} required />
          {error && (
            <AlertBase severity="error">{snap.formatAuthError(error)}</AlertBase>
          )}
          <ButtonBase label={isPending ? "Sending..." : "Send reset link"} type="submit" disabled={isPending || !email} fullWidth />
        </ColumnBase>
      </form>
      <ButtonBase label="Back to sign in" variant="link" onClick={onBack} />
    </CenteredCard>
  );
}

// ── OAuth Callback Page ───────────────────────────────────────────────────

/**
 * Mount this component at your redirectUri (e.g. /auth/callback).
 * It reads the `code` and `provider` params, exchanges them for a session,
 * and redirects to homePath on success.
 */
export function OAuthCallbackPage() {
  const { mutate: exchange, error, isPending } = snap.useOAuthExchange();
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const provider = params.get("provider") ?? params.get("state") ?? "google";

  useEffect(() => {
    if (code) exchange({ code, provider });
  }, []);

  if (error) {
    return (
      <CenteredCard title="Sign-in failed">
        <AlertBase severity="error">{snap.formatAuthError(error)}</AlertBase>
        <ButtonBase label="Try again" onClick={() => window.location.href = "/login"} fullWidth />
      </CenteredCard>
    );
  }

  return (
    <CenteredCard title="Signing you in...">
      <p style={{ color: "var(--sn-color-muted-foreground)" }}>
        {isPending ? "Completing sign-in..." : "Redirecting..."}
      </p>
    </CenteredCard>
  );
}

// ── Shared Components ─────────────────────────────────────────────────────

function CenteredCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "1rem" }}>
      <CardBase title={title} style={{ width: "100%", maxWidth: "420px" }} gap="lg">
        {children}
      </CardBase>
    </div>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "0.5rem 0" }}>
      <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--sn-color-border)" }} />
      <span style={{ color: "var(--sn-color-muted-foreground)", fontSize: "0.875rem" }}>or</span>
      <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--sn-color-border)" }} />
    </div>
  );
}
```

## What this includes

- **Email/password login** with `formatAuthError` error display
- **MFA verification** with TOTP and email OTP support
- **Google and GitHub OAuth** with proper `OAuthProvider` objects
- **Passkey/WebAuthn login** with try-catch for browser errors
- **Registration form** with password confirmation
- **Forgot password flow** with success confirmation
- **OAuth callback page** that exchanges the auth code for a session

## Adding the OAuth callback route

Mount `OAuthCallbackPage` at whatever path you set for the provider `callbackPath`. With TanStack Router:

```tsx
// routes/auth/callback.tsx
import { createFileRoute } from "@tanstack/react-router";
import { OAuthCallbackPage } from "./login";

export const Route = createFileRoute("/auth/callback")({
  component: OAuthCallbackPage,
});
```

## Customizing

- **Add providers** -- add objects to the `providers` array with `{ name, label, url }`
- **Remove passkeys** -- delete the `PasskeyButtonBase` section
- **Remove OAuth** -- delete the `OAuthButtonsBase` section and OAuth config
- **Custom redirect** -- pass `redirectTo` to `login()`: `login({ email, password, redirectTo: "/onboarding" })`
- **Email verification** -- after registration, redirect to a verification page that calls `snap.useVerifyEmail()`

## Related

- [Authentication guide](/guides/authentication/) -- detailed hook documentation
- [Forms guide](/guides/forms/) -- input component details
- [Settings Page recipe](/recipes/settings-page/) -- password change, sessions, account deletion
