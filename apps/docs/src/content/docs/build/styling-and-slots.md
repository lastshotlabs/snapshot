---
title: Styling and Slots
description: The canonical styling model for Snapshot UI surfaces.
draft: false
---

Snapshot styles visible UI surfaces through named `slots`.

Each slot uses the same universal style vocabulary as a component root. That means grouped components and primitive components follow one declarative model instead of maintaining separate visual APIs.

This page documents two things:

- the canonical platform model for `slots` and runtime `states`
- the current product contract implemented in source

The examples on this page are representative, not exhaustive. Use generated reference docs and current component source for the full surface inventory.

Use this guide when you need to answer three questions:

- which part of a component is actually styleable
- how per-component defaults and per-item overrides merge
- when to use slots instead of theme component overrides

## Canonical model

The source of truth for the slot model lives in:

- `src/ui/components/_base/schema.ts`
- `src/ui/components/_base/style-surfaces.ts`

`src/ui/components/_base/schema.ts` defines the shared contract:

- `styleableElementFields`
- `styleableElementSchema`
- `statefulElementSchema`
- `slotsSchema(...)`

That contract is what allows a slot to accept the same kinds of fields as a component root:

- layout and spacing such as `padding`, `margin`, `gap`, `width`, `height`
- paint and typography such as `bg`, `color`, `border`, `shadow`, `fontSize`, `fontWeight`
- responsive values for supported layout and typography fields
- interactive style props such as `hover`, `focus`, and `active`
- slot-scoped state overrides under `states`

The canonical slot state names are:

- `hover`
- `focus`
- `open`
- `selected`
- `current`
- `active`
- `completed`
- `invalid`
- `disabled`

If a component exposes named slots, those slots should be the primary customization path.

## Merge order

The runtime merge logic lives in `src/ui/components/_base/style-surfaces.ts`.

Snapshot resolves each visible surface in this order:

1. implementation defaults
2. component-level slot config
3. item-level slot config
4. component-level state overrides for active states
5. item-level state overrides for active states

Current state precedence is:

1. `hover`
2. `focus`
3. `open`
4. `selected`
5. `current`
6. `active`
7. `completed`
8. `invalid`
9. `disabled`

Two practical consequences follow from that contract:

- item-specific visual policy wins over shared component defaults
- stateful visuals such as `current` or `disabled` belong in `states`, not in ad hoc component-specific props

## Primitive-first rule

Snapshot is using a primitive-first styling system across its slot-enabled surfaces.

That means:

- primitives are the capability source
- grouped components add semantics and defaults
- grouped components do not get a private styling model

Representative surfaces in source include:

- `src/ui/components/forms/button`
- `src/ui/components/primitives/floating-menu`
- `src/ui/components/layout/nav`
- `src/ui/components/layout/nav-link`
- `src/ui/components/layout/nav-dropdown`
- `src/ui/components/layout/nav-section`
- `src/ui/components/layout/nav-user-menu`
- `src/ui/components/overlay/dropdown-menu`
- `src/ui/components/overlay/context-menu`
- `src/ui/components/overlay/popover`

For those families, the path is:

- theme tokens for global system defaults
- named `slots` for per-surface customization
- per-item `slots` when a grouped component needs local overrides

## Theme tokens versus slots

Theme configuration still owns global design-system concerns such as colors, radius, spacing, typography, and supported component token surfaces.

The theme schema lives in:

- `src/ui/tokens/schema.ts`

One important change is already enforced in source: obsolete nav-specific visual component tokens are rejected. The token schema tests assert that `theme.overrides.components.nav` is not a valid path anymore.

Use this rule of thumb:

- use `theme` when you want app-wide defaults
- use `slots` when you want to style a concrete render surface

If you are styling nav, menus, buttons, or popovers, prefer `slots`.

## Source-backed examples

### Button slots

The button schema currently exposes these slots:

- `root`
- `label`
- `icon`
- `leadingIcon`

Example:

```json
{
  "type": "button",
  "id": "save-button",
  "label": "Save changes",
  "icon": "save",
  "variant": "default",
  "action": { "type": "toast", "message": "Saved" },
  "slots": {
    "root": {
      "paddingX": "lg",
      "borderRadius": "full",
      "states": {
        "disabled": {
          "opacity": 0.5
        }
      }
    },
    "label": {
      "fontWeight": "semibold"
    },
    "icon": {
      "color": "var(--sn-color-primary-foreground)"
    }
  }
}
```

### Grouped nav defaults plus item overrides

The nav schema currently exposes top-level slots such as `item`, `itemLabel`, `itemIcon`, `itemBadge`, `dropdownItem`, and `userMenuTrigger`.

Each nav item can also provide item-level `slots` for the item surfaces it owns.

Example:

```json
{
  "navigation": {
    "mode": "sidebar",
    "slots": {
      "item": {
        "paddingX": "md",
        "paddingY": "sm",
        "borderRadius": "md",
        "states": {
          "current": {
            "bg": "var(--sn-color-accent)",
            "color": "var(--sn-color-accent-foreground)"
          },
          "disabled": {
            "opacity": 0.45
          }
        }
      },
      "itemIcon": {
        "color": "var(--sn-color-muted-foreground)"
      }
    },
    "items": [
      {
        "label": "Home",
        "path": "/",
        "icon": "house"
      },
      {
        "label": "Billing",
        "path": "/billing",
        "icon": "credit-card",
        "slots": {
          "item": {
            "border": "1px solid var(--sn-color-border)"
          },
          "itemBadge": {
            "bg": "var(--sn-color-warning)",
            "color": "var(--sn-color-warning-foreground)"
          }
        }
      }
    ]
  }
}
```

### Floating menu labels, separators, and items

The floating menu primitive currently exposes these slots:

- `root`
- `trigger`
- `panel`
- `item`
- `itemLabel`
- `itemIcon`
- `separator`
- `label`

Example:

```json
{
  "type": "floating-menu",
  "id": "project-actions",
  "triggerLabel": "Actions",
  "items": [
    {
      "type": "label",
      "text": "Project"
    },
    {
      "type": "item",
      "label": "Rename",
      "icon": "pencil"
    },
    {
      "type": "separator"
    },
    {
      "type": "item",
      "label": "Archive",
      "disabled": true,
      "slots": {
        "item": {
          "states": {
            "disabled": {
              "opacity": 0.5
            }
          }
        }
      }
    }
  ],
  "slots": {
    "panel": {
      "padding": "sm",
      "border": "1px solid var(--sn-color-border)",
      "shadow": "lg"
    },
    "label": {
      "fontSize": "xs",
      "color": "var(--sn-color-muted-foreground)"
    },
    "separator": {
      "border": "1px solid var(--sn-color-border)"
    }
  }
}
```

## What to rely on right now

The slot/state model in this guide is the stable architectural path and is already implemented in source.

This guide reflects the active platform contract. Pair it with generated reference and current source when you need the exact shape of a specific component family.

For exact field-level API shape on a specific component, pair this guide with:

- [Component Catalog](/reference/components/)
- [UI Reference](/reference/ui/)

If a component-specific guide and generated reference disagree, trust the current schema and generated reference.
