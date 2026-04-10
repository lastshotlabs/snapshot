# Policies

`manifest.policies` declares named boolean policy expressions that can be reused by route guards and component visibility.

## Shape

```json
{
  "policies": {
    "is-admin": { "equals": [{ "from": "global.user.role" }, "admin"] },
    "can-edit": { "all": ["is-admin", { "truthy": { "from": "page.editable" } }] }
  }
}
```

## Expressions

- `string`: reference another named policy
- `all`, `any`, `not`
- `equals`, `not-equals`
- `exists`, `truthy`, `falsy`
- `in`

## Refs

Policy operands may use literals, `FromRef`, and `EnvRef`.

## Route guards

Routes can point to a named policy with:

```json
{
  "guard": {
    "policy": "can-edit"
  }
}
```

## Visibility

Component `visible` supports the same policy reference form:

```json
{
  "type": "button",
  "visible": { "policy": "is-admin" }
}
```
