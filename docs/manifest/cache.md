# Manifest Cache

`resources` can declare cache invalidation and optimistic update behavior directly in
the manifest.

## Invalidation Rules

`invalidates` accepts either another resource name or an explicit query key:

```json
{
  "resources": {
    "create-user": {
      "method": "POST",
      "endpoint": "/api/users",
      "invalidates": [
        "users-list",
        { "key": ["GET", "/api/stats/users"] }
      ]
    }
  }
}
```

- String entries invalidate a resource and its dependent resources.
- `{ "key": [...] }` entries invalidate a specific cached query key.

## Optimistic Updates

`optimistic` applies a cache write before the mutation request:

```json
{
  "resources": {
    "create-comment": {
      "method": "POST",
      "endpoint": "/api/comments",
      "optimistic": {
        "target": "comments-list",
        "merge": "append"
      }
    }
  }
}
```

Supported `merge` modes:

- `append`
- `prepend`
- `replace` (requires `idField`)
- `patch` (requires `idField` for list targets)
- `remove` (requires `idField` for list targets)

For `replace`, `patch`, and `remove`, set `idField`:

```json
{
  "optimistic": {
    "target": "users-list",
    "merge": "remove",
    "idField": "id"
  }
}
```

If the request fails, Snapshot restores the exact pre-mutation cache snapshot instead of
refetching immediately.
