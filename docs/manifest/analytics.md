# Manifest Analytics

Configure analytics providers in `manifest.analytics.providers`.

```json
{
  "analytics": {
    "providers": {
      "product": {
        "type": "posthog",
        "apiKey": { "env": "POSTHOG_KEY" },
        "config": { "api_host": "https://us.i.posthog.com" }
      }
    }
  }
}
```

Built-in provider `type` values:

- `ga4`
- `posthog`
- `plausible`

Custom providers use:

```json
{
  "type": "custom",
  "name": "my-tracker"
}
```

Register custom providers in code:

```ts
import { registerAnalyticsProvider } from "@lastshotlabs/snapshot/ui";

registerAnalyticsProvider("my-tracker", () => ({
  init() {},
  track(event, props) {
    console.log(event, props);
  },
}));
```

Then emit events with the `track` action:

```json
{ "type": "track", "event": "user.signup", "props": { "plan": "pro" } }
```
