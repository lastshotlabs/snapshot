# Bootstrap and Env Refs

Snapshot starts with a small bootstrap surface and resolves environment values
before it compiles the manifest runtime model.

## Bootstrap Shape

`SnapshotConfig` now has only four fields:

```ts
{
  apiUrl: string;
  env?: Record<string, string | undefined>;
  bearerToken?: string;
  manifest: ManifestConfig;
}
```

The manifest can override the bootstrap API URL with `manifest.app.apiUrl`
when you need a per-environment runtime value inside the manifest itself.

## Env References

Anywhere the manifest accepts a string, it can also accept:

```json
{ "env": "API_URL" }
```

You can also provide a fallback:

```json
{ "env": "API_URL", "default": "https://api.example.com" }
```

At compile time, Snapshot looks up the named key in the active env source. The
default source reads `import.meta.env` first and then falls back to
`process.env`.

If the env variable is missing and no default is provided, compilation fails
with a clear error.

## Why It Exists

This keeps deployment-specific values out of application code. The manifest can
stay portable while still adapting to different environments without manual
rewiring.

## App Cache

The manifest also controls Snapshot's default query cache behavior through
`manifest.app.cache`.

```json
{
  "app": {
    "cache": {
      "staleTime": 60000,
      "gcTime": 120000,
      "retry": 3
    }
  }
}
```

If omitted, Snapshot uses the current factory defaults:

- `staleTime`: `300000`
- `gcTime`: `600000`
- `retry`: `1`

For auth-specific manifest fields such as `session`, `contract`, `redirects`,
and `on`, see [manifest auth](./auth.md).
