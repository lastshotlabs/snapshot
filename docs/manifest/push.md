# Manifest Push

Push settings live in `manifest.push`.

```json
{
  "push": {
    "vapidPublicKey": { "env": "PUSH_VAPID_PUBLIC_KEY" },
    "serviceWorkerPath": "/sw.js",
    "applicationServerKey": { "env": "PUSH_APPLICATION_SERVER_KEY" }
  }
}
```

Fields:

- `vapidPublicKey`: required
- `serviceWorkerPath`: optional, defaults to `/sw.js`
- `applicationServerKey`: optional, falls back to `vapidPublicKey`

`usePushNotifications()` reads these values from the manifest runtime context,
so no code-side key wiring is required when running inside `ManifestApp`.
