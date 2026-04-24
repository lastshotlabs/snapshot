---
title: Login Page
description: Complete login page with email/password, OAuth, MFA, and passkeys.
draft: false
---

A production-ready login page with all auth methods. Copy this into your project and customize.

```tsx
import { createSnapshot, isMfaChallenge } from "@lastshotlabs/snapshot";
import {
  InputField, ButtonBase, CardBase, OAuthButtonsBase,
  PasskeyButtonBase, RowBase, ColumnBase,
} from "@lastshotlabs/snapshot/ui";
import { useState } from "react";

const snap = createSnapshot({
  apiUrl: "/api",
  manifest: {
    app: {
      auth: {
        loginPath: "/login",
        homePath: "/",
        oauth: {
          providers: {
            google: { clientId: "YOUR_GOOGLE_CLIENT_ID", scopes: ["email", "profile"] },
            github: { clientId: "YOUR_GITHUB_CLIENT_ID", scopes: ["user:email"] },
          },
          redirectUri: "/auth/callback",
        },
      },
    },
  },
});

export function LoginPage() {
  const { mutate: login, isPending, isError } = snap.useLogin();
  const { mutate: verify, isPending: verifying } = snap.useMfaVerify();
  const challenge = snap.usePendingMfaChallenge();
  const { mutate: getPasskeyOptions } = snap.usePasskeyLoginOptions();
  const { mutate: passkeyLogin } = snap.usePasskeyLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [view, setView] = useState<"login" | "forgot">("login");

  // MFA verification screen
  if (challenge) {
    return (
      <CenteredCard title="Two-factor authentication">
        <p>Enter the code from your authenticator app.</p>
        <form onSubmit={(e) => { e.preventDefault(); verify({ code: mfaCode, method: challenge.mfaMethods[0] }); }}>
          <InputField label="Verification code" value={mfaCode} onChange={setMfaCode} />
          <ButtonBase label="Verify" type="submit" disabled={verifying} fullWidth />
        </form>
      </CenteredCard>
    );
  }

  // Forgot password screen
  if (view === "forgot") {
    return <ForgotPasswordView onBack={() => setView("login")} />;
  }

  // Login screen
  return (
    <CenteredCard title="Sign in">
      <form onSubmit={(e) => { e.preventDefault(); login({ email, password }); }}>
        <ColumnBase gap="md">
          <InputField label="Email" type="email" value={email} onChange={setEmail} required />
          <InputField label="Password" type="password" value={password} onChange={setPassword} required />
          {isError && <p style={{ color: "var(--sn-color-error)" }}>Invalid email or password</p>}
          <ButtonBase label="Sign in" type="submit" disabled={isPending} fullWidth />
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
          getPasskeyOptions({}, {
            onSuccess: async (response) => {
              const assertion = await navigator.credentials.get({ publicKey: response.options as any });
              if (assertion) {
                passkeyLogin({
                  id: assertion.id,
                  rawId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))),
                  response: {
                    authenticatorData: btoa(String.fromCharCode(
                      ...new Uint8Array(assertion.response.authenticatorData))),
                    clientDataJSON: btoa(String.fromCharCode(
                      ...new Uint8Array(assertion.response.clientDataJSON))),
                    signature: btoa(String.fromCharCode(
                      ...new Uint8Array(assertion.response.signature))),
                  },
                });
              }
            },
          });
        }}
      />

      <RowBase justify="between">
        <ButtonBase label="Forgot password?" variant="link" onClick={() => setView("forgot")} />
        <ButtonBase label="Create account" variant="link" onClick={() => navigate("/register")} />
      </RowBase>
    </CenteredCard>
  );
}

function ForgotPasswordView({ onBack }: { onBack: () => void }) {
  const { mutate: forgot, isSuccess, isPending } = snap.useForgotPassword();
  const [email, setEmail] = useState("");

  if (isSuccess) {
    return (
      <CenteredCard title="Check your email">
        <p>We sent a password reset link to {email}.</p>
        <ButtonBase label="Back to sign in" variant="outline" onClick={onBack} />
      </CenteredCard>
    );
  }

  return (
    <CenteredCard title="Reset password">
      <form onSubmit={(e) => { e.preventDefault(); forgot({ email }); }}>
        <InputField label="Email" type="email" value={email} onChange={setEmail} required />
        <ButtonBase label="Send reset link" type="submit" disabled={isPending} fullWidth />
      </form>
      <ButtonBase label="Back to sign in" variant="link" onClick={onBack} />
    </CenteredCard>
  );
}

function CenteredCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <CardBase title={title} style={{ width: "100%", maxWidth: "400px" }} gap="lg">
        {children}
      </CardBase>
    </div>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1rem 0" }}>
      <hr style={{ flex: 1 }} />
      <span style={{ color: "var(--sn-color-muted)", fontSize: "0.875rem" }}>or</span>
      <hr style={{ flex: 1 }} />
    </div>
  );
}
```

## What this includes

- Email/password login with error handling
- MFA verification when challenge is returned
- Google and GitHub OAuth buttons
- Passkey/WebAuthn login
- Forgot password flow
- Centered card layout
- Navigation between login, forgot password, and register

## Customizing

- Add more OAuth providers by adding to the `providers` array
- Remove passkey support by deleting the `PasskeyButtonBase` section
- Add registration by creating a similar component with `snap.useRegister()`
- Customize colors with the manifest `theme.colors` config

## Related

- [Authentication guide](/guides/authentication/) -- detailed hook documentation
- [Forms guide](/guides/forms/) -- input component details
- [Theming guide](/guides/theming-and-styling/) -- customize appearance
