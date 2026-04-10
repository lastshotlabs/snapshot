# Manifest Auth

Snapshot auth is fully manifest-driven.

## Session

```json
{
  "auth": {
    "screens": ["login"],
    "session": {
      "mode": "token",
      "storage": "sessionStorage",
      "key": "snapshot.token"
    }
  }
}
```

- `mode`: `cookie` or `token` (default `cookie`)
- `storage`: `localStorage` | `sessionStorage` | `memory` (default `sessionStorage`)
- `key`: token key (default `snapshot.token`)

## Providers

OAuth providers are declared once in `auth.providers` and referenced by name in
screen options:

```json
{
  "auth": {
    "providers": {
      "google": {
        "type": "google",
        "clientId": { "env": "GOOGLE_ID" },
        "scopes": ["openid", "email"],
        "callbackPath": "/auth/callback/google"
      }
    },
    "screenOptions": {
      "login": {
        "providers": ["google"]
      }
    }
  }
}
```

For custom providers use:

```json
{
  "type": "custom",
  "name": "my-provider-name"
}
```

## MFA + WebAuthn

`auth.mfa` and `auth.webauthn` provide shared runtime config:

```json
{
  "auth": {
    "mfa": {
      "issuer": "Snapshot",
      "period": 30,
      "methods": ["totp", "webauthn"]
    },
    "webauthn": {
      "rpId": "example.com",
      "rpName": "Example App",
      "attestation": "none"
    }
  }
}
```

`useMfaSetup()` reads `auth.mfa`, and `useWebAuthnRegisterOptions()` reads
`auth.webauthn`.

## Contract

Use `auth.contract` to override default auth endpoints/headers:

```json
{
  "auth": {
    "contract": {
      "endpoints": {
        "me": "/custom/auth/me"
      },
      "headers": {
        "csrf": "x-custom-csrf"
      },
      "csrfCookieName": "custom_csrf"
    }
  }
}
```

## Redirects and Handlers

```json
{
  "auth": {
    "redirects": {
      "authenticated": "/dashboard",
      "afterLogin": "/reports",
      "afterRegister": "/welcome",
      "afterMfa": "/dashboard",
      "unauthenticated": "/login",
      "forbidden": "/403"
    },
    "on": {
      "unauthenticated": "auth-401",
      "forbidden": "auth-403",
      "logout": "auth-logout"
    }
  }
}
```

Every `auth.on.*` value must reference a workflow in `manifest.workflows`.
