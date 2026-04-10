# Manifest Auth

Snapshot auth is configured in the manifest. During B2, the session settings
move under `manifest.auth.session`.

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

### Fields

- `mode` controls whether Snapshot uses cookie auth or token auth.
- `storage` controls where tokens are stored when `mode` is `token`.
- `key` sets the token storage key.

### Defaults

- `mode`: `cookie`
- `storage`: `sessionStorage`
- `key`: `snapshot.token`

When the session block is omitted, Snapshot keeps cookie mode and no-op token
storage behavior for the current bootstrap defaults.

## Contract

Use `manifest.auth.contract` to override the API contract JSON that Snapshot
merges into its built-in auth contract.

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

All values are plain JSON overrides. Snapshot keeps the built-in defaults for
anything you omit.

## Redirects

`manifest.auth.redirects` controls auth flow paths that the runtime uses when it
needs to send the user somewhere after auth-related checks.

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
    }
  }
}
```

## Handlers

`manifest.auth.on` maps auth events to workflow names. Use this when you want
the manifest to run side effects on 401/403/logout instead of hardcoding those
callbacks in TypeScript.

```json
{
  "auth": {
    "on": {
      "unauthenticated": "auth-401",
      "forbidden": "auth-403",
      "logout": "auth-logout"
    }
  }
}
```

Each value must name a workflow in `manifest.workflows`.
