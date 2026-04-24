---
title: Component Reference
description: Complete auto-generated reference for all Snapshot UI components — config fields, types, defaults, and slots.
draft: false
---

This reference is auto-generated from the Zod schemas in each component's `schema.ts` file.
It documents every component-specific config field, default, available slots, and manifest type alias.

All components also accept the [base component fields](/reference/manifest#base-component-fields) (60 fields including `id`, `tokens`, `visible`, `className`, `style`, `padding`, `margin`, `gap`, layout, typography, and interactive states).

Total components: **114** across 13 domains.

## Table of Contents

- [Layout](#layout) (19)
- [Forms](#forms) (18)
- [Data Display](#data) (23)
- [Content](#content) (11)
- [Navigation](#navigation) (6)
- [Overlays](#overlay) (8)
- [Media](#media) (4)
- [Communication](#communication) (8)
- [Workflow](#workflow) (4)
- [Commerce](#commerce) (1)
- [Feedback States](#feedback) (4)
- [Primitives](#primitives) (7)
- [_base](#_base) (1)

---

## Layout

### `box`

**Manifest type:** `box`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `as` | `"div" \| "section" \| "article" \| "aside" \| "header" \| "footer" \| "main" \| "nav" \| "span"` | — | No |
| `children` | `{ type: string }[]` | — | No |

---

### `card`

**Manifest type:** `card`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `title` | `string \| FromRef` | — | No |
| `subtitle` | `string \| FromRef` | — | No |
| `children` | `{ type: string }[]` | `[]` | No |

---

### `collapsible`

**Manifest type:** `collapsible`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `open` | `boolean \| FromRef \| { expr: string }` | — | No |
| `defaultOpen` | `boolean` | — | No |
| `trigger` | `{ type: string }` | — | No |
| `children` | `{ type: string }[]` | — | **Yes** |
| `duration` | `"instant" \| "fast" \| "normal" \| "slow"` | — | No |
| `publishTo` | `string` | — | No |

**Slots:** `root`, `trigger`, `content`

---

### `column`

**Manifest type:** `column`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `children` | `{ type: string }[]` | — | **Yes** |
| `justify` | `"start" \| "center" \| "end" \| "between" \| "around"` | — | No |
| `align` | `"start" \| "center" \| "end" \| "stretch"` | — | No |

---

### `container`

**Manifest type:** `container`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `center` | `boolean` | `true` | No |
| `children` | `{ type: string }[]` | — | **Yes** |

---

### `grid`

**Manifest type:** `grid`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `areas` | `string[] \| object` | — | No |
| `rows` | `string` | — | No |
| `columns` | `string \| number \| object` | — | No |
| `children` | `{ type: string }[]` | — | **Yes** |

---

### `layout`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `variant` | `string` | `"sidebar"` | No |
| `sidebarWidth` | `string` | — | No |

---

### `nav`

Zod schema for the grouped Nav component.Supports either `items`-driven navigation or template composition, optional logo and user menuconfiguration, collapsible sidebar behavior, and canonical slot-based surface styling.

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `items` | `object[]` | — | No |
| `template` | `{ type: string }[]` | — | No |
| `collapsible` | `boolean` | — | No |
| `userMenu` | `boolean \| { showAvatar: boolean, showEmail: boolean, items: object[] }` | — | No |
| `logo` | `{ src: string, text: string \| TRef, path: string }` | — | No |

**Slots:** `root`, `brand`, `brandIcon`, `brandLabel`, `toggle`, `list`, `item`, `itemLabel`, `itemIcon`, `itemBadge`, `dropdown`, `dropdownItem`, `dropdownItemLabel`, `dropdownItemIcon`, `dropdownItemBadge`, `userMenu`, `userMenuTrigger`, `userMenuItem`, `userAvatar`

---

### `nav-dropdown`

**Manifest type:** `nav-dropdown`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string \| FromRef` | — | **Yes** |
| `icon` | `string` | — | No |
| `trigger` | `"click" \| "hover"` | — | No |
| `current` | `boolean` | — | No |
| `disabled` | `boolean` | — | No |
| `align` | `"start" \| "center" \| "end"` | — | No |
| `items` | `{ type: string }[]` | — | **Yes** |
| `roles` | `string[]` | — | No |
| `authenticated` | `boolean` | — | No |

**Slots:** `root`, `trigger`, `triggerLabel`, `triggerIcon`, `panel`, `item`, `itemLabel`, `itemIcon`, `separator`, `label`

---

### `nav-link`

**Manifest type:** `nav-link`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string \| FromRef` | — | **Yes** |
| `path` | `string` | — | **Yes** |
| `icon` | `string` | — | No |
| `badge` | `number \| FromRef` | — | No |
| `matchChildren` | `boolean` | — | No |
| `disabled` | `boolean \| FromRef` | — | No |
| `roles` | `string[]` | — | No |
| `authenticated` | `boolean` | — | No |

**Slots:** `root`, `label`, `icon`, `badge`

---

### `nav-logo`

**Manifest type:** `nav-logo`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `src` | `string` | — | No |
| `text` | `string \| FromRef` | — | No |
| `path` | `string` | — | No |
| `logoHeight` | `string` | — | No |

**Slots:** `root`, `icon`, `label`

---

### `nav-search`

**Manifest type:** `nav-search`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `placeholder` | `string \| FromRef` | — | No |
| `onSearch` | `object` | — | No |
| `shortcut` | `string` | — | No |
| `publishTo` | `string` | — | No |

**Slots:** `root`, `input`, `shortcut`

---

### `nav-section`

**Manifest type:** `nav-section`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string \| FromRef` | — | No |
| `collapsible` | `boolean` | — | No |
| `defaultCollapsed` | `boolean` | — | No |
| `items` | `{ type: string }[]` | — | **Yes** |

**Slots:** `root`, `header`, `headerLabel`, `headerIcon`, `content`

---

### `nav-user-menu`

**Manifest type:** `nav-user-menu`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `showAvatar` | `boolean` | — | No |
| `showEmail` | `boolean` | — | No |
| `showName` | `boolean` | — | No |
| `mode` | `"full" \| "compact"` | — | No |
| `items` | `object[]` | — | No |

**Slots:** `root`, `trigger`, `triggerLabel`, `triggerIcon`, `avatar`, `avatarImage`, `email`, `panel`, `item`, `itemLabel`, `itemIcon`, `separator`, `label`

---

### `outlet`

**Manifest type:** `outlet`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `fallback` | `{ type: string }[]` | — | No |

---

### `row`

**Manifest type:** `row`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `children` | `{ type: string }[]` | — | **Yes** |
| `justify` | `"start" \| "center" \| "end" \| "between" \| "around"` | — | No |
| `align` | `"start" \| "center" \| "end" \| "stretch"` | — | No |
| `wrap` | `boolean` | — | No |

---

### `section`

**Manifest type:** `section`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `align` | `"start" \| "center" \| "end" \| "stretch"` | — | No |
| `justify` | `"start" \| "center" \| "end" \| "between" \| "around"` | — | No |
| `bleed` | `boolean` | — | No |
| `children` | `{ type: string }[]` | `[]` | No |

---

### `spacer`

**Manifest type:** `spacer`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| string` | `"md"` | No |
| `axis` | `"horizontal" \| "vertical"` | `"vertical"` | No |

---

### `split-pane`

**Manifest type:** `split-pane`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `direction` | `"horizontal" \| "vertical"` | — | No |
| `defaultSplit` | `number` | — | No |
| `minSize` | `number` | — | No |
| `children` | `{ type: string }[]` | — | **Yes** |

**Slots:** `root`, `pane`, `firstPane`, `secondPane`, `divider`

---

## Forms

### `auto-form`

**Manifest types:** `auto-form`, `form`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | No |
| `submit` | `EndpointTarget` | — | **Yes** |
| `method` | `"POST" \| "PUT" \| "PATCH"` | — | No |
| `fields` | `"auto" \| object[]` | — | **Yes** |
| `sections` | `object[]` | — | No |
| `columns` | `number` | — | No |
| `submitLabel` | `string \| FromRef` | — | No |
| `submitLoadingLabel` | `string \| FromRef` | — | No |
| `submitVariant` | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive" \| "link"` | — | No |
| `submitSize` | `"sm" \| "md" \| "lg"` | — | No |
| `submitFullWidth` | `boolean` | — | No |
| `submitIcon` | `string` | — | No |
| `resetOnSubmit` | `boolean` | — | No |
| `on` | `object` | — | No |
| `onSuccess` | `object \| ... \| object \| ...[]` | — | No |
| `onError` | `object \| ... \| object \| ...[]` | — | No |
| `autoSubmit` | `boolean` | — | No |
| `autoSubmitWhen` | `string` | — | No |
| `autoSubmitDelay` | `number` | — | No |
| `layout` | `"vertical" \| "horizontal" \| "grid"` | `"vertical"` | No |

**Slots:** `field`, `fieldCell`, `label`, `description`, `inputWrapper`, `input`, `options`, `option`, `optionLabel`, `helper`, `error`, `requiredIndicator`, `inlineAction`, `passwordToggle`, `switchTrack`, `switchThumb`

---

### `button`

**Manifest type:** `button`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string \| FromRef` | — | **Yes** |
| `icon` | `string` | — | No |
| `variant` | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive" \| "link"` | — | No |
| `size` | `"sm" \| "md" \| "lg" \| "icon"` | — | No |
| `action` | `object \| ... \| object \| ...[]` | — | **Yes** |
| `disabled` | `boolean \| FromRef` | — | No |
| `fullWidth` | `boolean` | — | No |

**Slots:** `root`, `label`, `icon`, `leadingIcon`

---

### `color-picker`

**Manifest type:** `color-picker`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `format` | `"hex" \| "rgb" \| "hsl"` | `"hex"` | No |
| `defaultValue` | `string` | — | No |
| `swatches` | `string[]` | — | No |
| `allowCustom` | `boolean` | `true` | No |
| `showAlpha` | `boolean` | `false` | No |
| `label` | `string \| FromRef` | — | No |
| `on` | `object` | — | No |

---

### `date-picker`

**Manifest type:** `date-picker`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `mode` | `"single" \| "range" \| "multiple"` | `"single"` | No |
| `label` | `string \| FromRef` | — | No |
| `placeholder` | `string \| FromRef` | — | No |
| `min` | `string` | — | No |
| `max` | `string` | — | No |
| `disabledDates` | `string \| { dayOfWeek: number[] }[]` | — | No |
| `presets` | `{ label: string \| FromRef, start: string, end: string }[]` | — | No |
| `format` | `string` | — | No |
| `valueFormat` | `"iso" \| "unix" \| "locale"` | `"iso"` | No |
| `on` | `object` | — | No |

---

### `icon-button`

**Manifest type:** `icon-button`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `icon` | `string` | — | **Yes** |
| `size` | `"xs" \| "sm" \| "md" \| "lg"` | — | No |
| `variant` | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive"` | — | No |
| `shape` | `"circle" \| "square"` | — | No |
| `action` | `object` | — | No |
| `disabled` | `boolean \| FromRef` | — | No |
| `tooltip` | `string` | — | No |

---

### `inline-edit`

Zod config schema for the InlineEdit component.A click-to-edit text field that toggles between display and edit modes.Publishes `{ value, editing }` to the page context.```json{  "type": "inline-edit",  "id": "title-edit",  "value": "My Title",  "placeholder": "Enter title",  "saveAction": { "type": "api", "method": "PUT", "endpoint": "/api/title", "body": { "from": "title-edit" } }}```

**Manifest type:** `inline-edit`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `value` | `string \| FromRef` | — | No |
| `placeholder` | `string \| FromRef` | — | No |
| `inputType` | `"text" \| "number"` | — | No |
| `saveAction` | `object` | — | No |
| `cancelOnEscape` | `boolean` | — | No |

**Slots:** `root`, `display`, `displayText`, `displayIcon`, `input`

---

### `input`

Zod config schema for the Input component.Defines a standalone text input field with label, placeholder,validation, and optional icon.```json{  "type": "input",  "id": "email-field",  "label": "Email",  "inputType": "email",  "placeholder": "you  "required": true,  "helperText": "We'll never share your email"}```

**Manifest type:** `input`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string \| FromRef` | — | No |
| `placeholder` | `string \| FromRef` | — | No |
| `value` | `string \| FromRef` | — | No |
| `inputType` | `"text" \| "email" \| "password" \| "number" \| "url" \| "tel" \| "search"` | — | No |
| `required` | `boolean` | — | No |
| `disabled` | `boolean \| FromRef` | — | No |
| `readonly` | `boolean \| FromRef` | — | No |
| `maxLength` | `number` | — | No |
| `pattern` | `string` | — | No |
| `helperText` | `string \| FromRef` | — | No |
| `errorText` | `string \| FromRef` | — | No |
| `icon` | `string` | — | No |
| `on` | `object` | — | No |

---

### `location-input`

Zod config schema for the LocationInput component.Geocode autocomplete input that searches a backend endpoint,displays matching locations in a dropdown, and extractscoordinates on selection. Publishes `{ name, lat, lng, address }`.```json{  "type": "location-input",  "id": "venue-location",  "label": "Venue",  "placeholder": "Search for a location...",  "searchEndpoint": "GET /api/geocode",  "changeAction": {    "type": "set-value",    "target": "map",    "value": { "from": "venue-location" }  }}```Expected API response format:```json[  {    "name": "Central Park",    "address": "New York, NY, USA",    "lat": 40.7829,    "lng": -73.9654  }]```

**Manifest type:** `location-input`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string \| FromRef` | — | No |
| `placeholder` | `string \| FromRef` | — | No |
| `value` | `string \| FromRef` | — | No |
| `searchEndpoint` | `EndpointTarget` | — | **Yes** |
| `nameField` | `string` | — | No |
| `addressField` | `string` | — | No |
| `latField` | `string` | — | No |
| `lngField` | `string` | — | No |
| `debounceMs` | `number` | — | No |
| `minChars` | `number` | — | No |
| `showMapLink` | `boolean` | — | No |
| `on` | `object` | — | No |
| `disabled` | `boolean \| FromRef` | — | No |
| `required` | `boolean` | — | No |
| `helperText` | `string \| FromRef` | — | No |
| `errorText` | `string \| FromRef` | — | No |

---

### `multi-select`

Zod config schema for the MultiSelect component.Defines a dropdown with checkboxes for selecting multiple values,with optional search filtering and pill display.```json{  "type": "multi-select",  "id": "tags",  "label": "Tags",  "placeholder": "Select tags...",  "options": [    { "label": "Bug", "value": "bug", "icon": "bug" },    { "label": "Feature", "value": "feature", "icon": "star" },    { "label": "Docs", "value": "docs", "icon": "file-text" }  ],  "maxSelected": 5,  "searchable": true}```

**Manifest type:** `multi-select`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string \| FromRef` | — | No |
| `placeholder` | `string \| FromRef` | — | No |
| `options` | `object[]` | — | No |
| `data` | `DataSource` | — | No |
| `labelField` | `string` | — | No |
| `valueField` | `string` | — | No |
| `value` | `string[] \| FromRef` | — | No |
| `maxSelected` | `number` | — | No |
| `searchable` | `boolean` | — | No |
| `disabled` | `boolean \| FromRef` | — | No |
| `on` | `object` | — | No |

---

### `quick-add`

Zod config schema for the QuickAdd component.Defines all manifest-settable fields for an inline creation barthat allows quick item entry with a text input and submit button.```json{  "type": "quick-add",  "placeholder": "Add a task...",  "submitAction": { "type": "api", "method": "POST", "endpoint": "/api/tasks" },  "clearOnSubmit": true}```

**Manifest type:** `quick-add`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `placeholder` | `string \| FromRef` | — | No |
| `icon` | `string` | — | No |
| `on` | `{ submit: object \| ... \| ...[] }` | — | No |
| `submitOnEnter` | `boolean` | — | No |
| `showButton` | `boolean` | — | No |
| `buttonText` | `string \| FromRef` | — | No |
| `clearOnSubmit` | `boolean` | — | No |

---

### `select`

**Manifest type:** `select`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `options` | `{ label: string \| FromRef, value: string }[] \| DataSource` | — | **Yes** |
| `valueField` | `string` | — | No |
| `labelField` | `string` | — | No |
| `default` | `string \| FromRef` | — | No |
| `placeholder` | `string \| FromRef` | — | No |
| `on` | `object` | — | No |

---

### `slider`

**Manifest type:** `slider`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `min` | `number` | `0` | No |
| `max` | `number` | `100` | No |
| `step` | `number` | `1` | No |
| `defaultValue` | `number \| [number, number]` | — | No |
| `range` | `boolean` | `false` | No |
| `label` | `string \| FromRef` | — | No |
| `showValue` | `boolean` | `false` | No |
| `showLimits` | `boolean` | `false` | No |
| `suffix` | `string \| FromRef` | — | No |
| `on` | `object` | — | No |
| `disabled` | `boolean \| FromRef` | — | No |

---

### `switch`

Zod config schema for the Switch component.Defines all manifest-settable fields for a toggle switchthat controls a boolean value.```json{  "type": "switch",  "label": "Enable notifications",  "description": "Receive email alerts for new activity",  "defaultChecked": false,  "color": "success"}```

**Manifest type:** `switch`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string \| FromRef` | — | No |
| `description` | `string \| FromRef` | — | No |
| `defaultChecked` | `boolean` | — | No |
| `disabled` | `boolean \| FromRef` | — | No |
| `size` | `"sm" \| "md" \| "lg"` | — | No |
| `on` | `object` | — | No |

---

### `tag-selector`

Zod config schema for the TagSelector component.A tag input that allows selecting from predefined tags or creating new ones.Tags display as colored pills with remove buttons.```json{  "type": "tag-selector",  "id": "topic-tags",  "label": "Topics",  "tags": [    { "label": "React", "value": "react", "color": "#61dafb" },    { "label": "TypeScript", "value": "ts", "color": "#3178c6" }  ],  "allowCreate": true,  "maxTags": 5}```

**Manifest type:** `tag-selector`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string \| FromRef` | — | No |
| `tags` | `{ label: string \| FromRef, value: string, color: string }[]` | — | No |
| `data` | `DataSource` | — | No |
| `labelField` | `string` | — | No |
| `valueField` | `string` | — | No |
| `colorField` | `string` | — | No |
| `value` | `string[] \| FromRef` | — | No |
| `allowCreate` | `boolean` | — | No |
| `createAction` | `object` | — | No |
| `on` | `object` | — | No |
| `maxTags` | `number` | — | No |

---

### `textarea`

Zod config schema for the Textarea component.Defines a multi-line text input with label, character count,validation, and configurable resize behavior.```json{  "type": "textarea",  "id": "bio-field",  "label": "Bio",  "placeholder": "Tell us about yourself...",  "rows": 5,  "maxLength": 500,  "resize": "vertical"}```

**Manifest type:** `textarea`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string \| FromRef` | — | No |
| `placeholder` | `string \| FromRef` | — | No |
| `value` | `string \| FromRef` | — | No |
| `rows` | `number` | — | No |
| `maxLength` | `number` | — | No |
| `required` | `boolean` | — | No |
| `disabled` | `boolean \| FromRef` | — | No |
| `readonly` | `boolean \| FromRef` | — | No |
| `helperText` | `string \| FromRef` | — | No |
| `errorText` | `string \| FromRef` | — | No |
| `resize` | `"none" \| "vertical" \| "horizontal" \| "both"` | — | No |
| `on` | `object` | — | No |

---

### `toggle`

Zod config schema for the Toggle component.Defines a pressed/unpressed toggle button that publishes its state.Can display text, an icon, or both.```json{  "type": "toggle",  "id": "bold-toggle",  "icon": "bold",  "label": "Bold",  "variant": "outline",  "size": "sm"}```

**Manifest type:** `toggle`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string \| FromRef` | — | No |
| `icon` | `string` | — | No |
| `pressed` | `boolean \| FromRef` | — | No |
| `variant` | `"default" \| "outline"` | — | No |
| `size` | `"sm" \| "md" \| "lg"` | — | No |
| `disabled` | `boolean \| FromRef` | — | No |
| `on` | `object` | — | No |

---

### `toggle-group`

**Manifest type:** `toggle-group`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `mode` | `"single" \| "multiple"` | — | No |
| `items` | `object[]` | — | **Yes** |
| `defaultValue` | `string \| string[]` | — | No |
| `value` | `string \| string[] \| FromRef` | — | No |
| `size` | `"sm" \| "md" \| "lg"` | — | No |
| `variant` | `"outline" \| "ghost"` | — | No |
| `publishTo` | `string` | — | No |
| `on` | `object` | — | No |

**Slots:** `root`, `item`, `itemLabel`, `itemIcon`, `indicator`

---

### `wizard`

**Manifest type:** `wizard`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `steps` | `object[]` | — | **Yes** |
| `submitEndpoint` | `EndpointTarget` | — | No |
| `submitLabel` | `string \| FromRef` | `"Submit"` | No |
| `onComplete` | `object` | — | No |
| `allowSkip` | `boolean` | `false` | No |

**Slots:** `root`, `progress`, `steps`, `step`, `stepMarker`, `stepBody`, `stepLabel`, `stepDescription`, `stepConnector`, `panel`, `header`, `title`, `description`, `completionState`, `completionTitle`, `completionDescription`, `submitError`, `actions`, `actionGroup`, `backButton`, `nextButton`, `submitButton`

---

## Data Display

### `alert`

Zod config schema for the Alert component.Defines all manifest-settable fields for a notification banner/alertwith icon, title, description, and optional action button.```json{  "type": "alert",  "title": "Success",  "description": "Your changes have been saved.",  "variant": "success",  "dismissible": true}```

**Manifest type:** `alert`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `title` | `string \| FromRef` | — | No |
| `description` | `string \| FromRef` | — | **Yes** |
| `variant` | `"info" \| "success" \| "warning" \| "destructive" \| "default"` | — | No |
| `icon` | `string` | — | No |
| `dismissible` | `boolean` | — | No |
| `action` | `object` | — | No |
| `actionLabel` | `string \| FromRef` | — | No |

---

### `avatar`

Zod config schema for the Avatar component.
Defines all manifest-settable fields for a user/entity avatar
with image, initials, or icon fallback and optional status dot.

```json
{
  "type": "avatar",
  "src": "https://example.com/photo.jpg",
  "name": "Jane Doe",
  "size": "lg",
  "status": "online"
}
```

**Manifest type:** `avatar`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `src` | `string \| FromRef` | — | No |
| `alt` | `string` | — | No |
| `name` | `string \| FromRef` | — | No |
| `icon` | `string` | — | No |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | — | No |
| `shape` | `"circle" \| "square"` | — | No |
| `status` | `"online" \| "offline" \| "busy" \| "away"` | — | No |

---

### `avatar-group`

Zod config schema for the AvatarGroup component.Displays a row of overlapping avatars with an optional "+N" overflowcount. Commonly used for showing team members, assignees, or participants.```json{  "type": "avatar-group",  "avatars": [    { "name": "Alice", "src": "/avatars/alice.jpg" },    { "name": "Bob" },    { "name": "Charlie", "src": "/avatars/charlie.jpg" },    { "name": "Diana" },    { "name": "Eve" }  ],  "max": 3,  "size": "md"}```

**Manifest type:** `avatar-group`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `avatars` | `{ name: string, src: string }[]` | — | No |
| `data` | `DataSource` | — | No |
| `nameField` | `string` | — | No |
| `srcField` | `string` | — | No |
| `max` | `number` | — | No |
| `size` | `"sm" \| "md" \| "lg"` | — | No |
| `overlap` | `number` | — | No |

---

### `badge`

Zod config schema for the Badge component.
Defines all manifest-settable fields for a badge/pill element
used for labels, statuses, and counts.

```json
{
  "type": "badge",
  "text": "Active",
  "color": "success",
  "variant": "soft"
}
```

**Manifest type:** `badge`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `text` | `string \| FromRef` | — | **Yes** |
| `variant` | `"solid" \| "soft" \| "outline" \| "dot"` | — | No |
| `size` | `"xs" \| "sm" \| "md" \| "lg"` | — | No |
| `icon` | `string` | — | No |
| `rounded` | `boolean` | — | No |

---

### `chart`

**Manifest type:** `chart`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | **Yes** |
| `chartType` | `"bar" \| "line" \| "area" \| "pie" \| "donut" \| "sparkline" \| "funnel" \| "radar" \| "treemap" \| "scatter"` | `"bar"` | No |
| `xKey` | `string` | — | **Yes** |
| `xLookup` | `{ resource: string, valueField: string, labelField: string }` | — | No |
| `series` | `object[]` | — | **Yes** |
| `aspectRatio` | `string` | — | No |
| `legend` | `boolean` | `true` | No |
| `grid` | `boolean` | `true` | No |
| `emptyMessage` | `string \| FromRef` | `"No data"` | No |
| `empty` | `object` | — | No |
| `hideWhenEmpty` | `boolean` | `false` | No |
| `loading` | `object` | — | No |
| `live` | `boolean \| { event: string, debounce: number, indicator: boolean }` | — | No |
| `onClick` | `object \| ... \| object \| ...[]` | — | No |
| `poll` | `{ interval: number, pauseWhenHidden: boolean }` | — | No |

**Slots:** `root`, `legend`, `legendItem`, `tooltip`, `series`, `axis`, `grid`

---

### `data-table`

**Manifest type:** `data-table`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | **Yes** |
| `params` | `Record<string, unknown \| FromRef>` | — | No |
| `columns` | `"auto" \| object[]` | — | **Yes** |
| `pagination` | `object \| false` | — | No |
| `selectable` | `boolean` | — | No |
| `searchable` | `boolean \| { placeholder: string \| FromRef, fields: string[] }` | — | No |
| `actions` | `object[]` | — | No |
| `bulkActions` | `object[]` | — | No |
| `draggable` | `boolean` | — | No |
| `onReorder` | `object` | — | No |
| `reorderAction` | `object` | — | No |
| `dragGroup` | `string` | — | No |
| `dropTargets` | `string[]` | — | No |
| `onDrop` | `object` | — | No |
| `contextMenu` | `object \| { type: "separator", slots: { separator: SlotStyle } } \| { type: "label", text: string \|...` | — | No |
| `poll` | `{ interval: number, pauseWhenHidden: boolean }` | — | No |
| `urlSync` | `boolean \| { params: Record<string, string>, replace: boolean }` | — | No |
| `clientFilter` | `{ field: string, operator: "equals" \| "contains" \| "startsWith" \| "endsWith" \| "gt" \| "lt" \| "gte...` | — | No |
| `clientSort` | `{ field: string, direction: "asc" \| "desc" }[]` | — | No |
| `live` | `boolean \| { event: string, debounce: number, indicator: boolean }` | — | No |
| `loading` | `object` | — | No |
| `empty` | `object` | — | No |
| `emptyMessage` | `string \| FromRef` | — | No |
| `virtualize` | `boolean \| { itemHeight: number, overscan: number }` | — | No |
| `expandable` | `boolean` | — | No |
| `expandedContent` | `Record<string, unknown>[]` | — | No |
| `rowClickAction` | `object` | — | No |
| `density` | `"compact" \| "default" \| "comfortable"` | — | No |
| `toolbar` | `object[]` | — | No |

**Slots:** `root`, `toolbar`, `headerRow`, `headerCell`, `row`, `cell`, `actionsCell`, `bulkActions`, `emptyState`, `loadingState`, `errorState`, `pagination`

---

### `detail-card`

**Manifest type:** `detail-card`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | **Yes** |
| `params` | `Record<string, unknown \| FromRef>` | — | No |
| `title` | `string \| FromRef` | — | No |
| `fields` | `"auto" \| object[]` | `"auto"` | No |
| `actions` | `object[]` | — | No |
| `emptyState` | `string \| FromRef` | — | No |
| `empty` | `object` | — | No |
| `error` | `object` | — | No |
| `loading` | `object` | — | No |

**Slots:** `actionButton`

---

### `empty-state`

Zod config schema for the EmptyState component.Defines all manifest-settable fields for a placeholder shownwhen there is no data to display.```json{  "type": "empty-state",  "title": "No results found",  "description": "Try adjusting your search or filters.",  "icon": "search",  "actionLabel": "Clear filters",  "action": { "type": "set-value", "target": "filters", "value": {} }}```

**Manifest type:** `empty-state`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `title` | `string \| FromRef` | — | **Yes** |
| `description` | `string \| FromRef` | — | No |
| `icon` | `string` | — | No |
| `action` | `object` | — | No |
| `actionLabel` | `string \| FromRef` | — | No |
| `size` | `"sm" \| "md" \| "lg"` | — | No |
| `iconColor` | `string` | — | No |

---

### `entity-picker`

Zod config schema for the EntityPicker component.A searchable dropdown for selecting entities (users, documents, items)from an API endpoint. Supports single and multi-select.```json{  "type": "entity-picker",  "id": "user-picker",  "label": "Assign to...",  "data": "GET /api/users",  "labelField": "name",  "valueField": "id",  "descriptionField": "email",  "avatarField": "avatar_url",  "multiple": true}```

**Manifest type:** `entity-picker`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string \| FromRef` | — | No |
| `data` | `DataSource` | — | **Yes** |
| `labelField` | `string` | — | No |
| `valueField` | `string` | — | No |
| `descriptionField` | `string` | — | No |
| `iconField` | `string` | — | No |
| `avatarField` | `string` | — | No |
| `searchable` | `boolean` | — | No |
| `multiple` | `boolean` | — | No |
| `value` | `string \| string[] \| FromRef` | — | No |
| `changeAction` | `object` | — | No |
| `error` | `object` | — | No |

---

### `favorite-button`

Zod config schema for the FavoriteButton component.
Defines all manifest-settable fields for a star toggle button
used to mark items as favorites.

```json
{
  "type": "favorite-button",
  "active": false,
  "size": "md",
  "toggleAction": { "type": "api", "method": "POST", "endpoint": "/api/favorites" }
}
```

**Manifest type:** `favorite-button`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `size` | `"sm" \| "md" \| "lg"` | — | No |
| `toggleAction` | `object` | — | No |

---

### `feed`

Zod schema for the Feed component configuration.Renders a scrollable activity/event stream from an endpoint or from-ref.Supports avatar, title, description, timestamp, badge fields, pagination,and publishes the selected item to the page context when `id` is set.```json{  "type": "feed",  "id": "activity-feed",  "data": "GET /api/activity",  "itemKey": "id",  "title": "message",  "description": "detail",  "timestamp": "createdAt",  "avatar": "avatarUrl",  "badge": { "field": "type", "colorMap": { "error": "destructive", "info": "info" } },  "pageSize": 10}```

**Manifest type:** `feed`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | **Yes** |
| `itemKey` | `string` | `"id"` | No |
| `avatar` | `string` | — | No |
| `title` | `string` | — | **Yes** |
| `description` | `string` | — | No |
| `timestamp` | `string` | — | No |
| `badge` | `{ field: string, colorMap: Record<string, string> }` | — | No |
| `emptyMessage` | `string \| FromRef` | `"No activity yet"` | No |
| `pageSize` | `number` | `20` | No |
| `infinite` | `boolean` | — | No |
| `relativeTime` | `boolean` | `false` | No |
| `groupBy` | `"date" \| "week" \| "month"` | — | No |
| `itemActions` | `object[]` | — | No |
| `loading` | `object` | — | No |
| `empty` | `object` | — | No |
| `live` | `boolean \| { event: string, debounce: number, indicator: boolean }` | — | No |

---

### `filter-bar`

**Manifest type:** `filter-bar`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `searchPlaceholder` | `string \| FromRef` | — | No |
| `showSearch` | `boolean` | — | No |
| `filters` | `object[]` | — | No |
| `changeAction` | `object` | — | No |

---

### `highlighted-text`

Zod config schema for the HighlightedText component.
Renders text with search query highlighting. Matching portions are
wrapped in `<mark>` elements with a configurable highlight color.

```json
{
  "type": "highlighted-text",
  "text": "The quick brown fox jumps over the lazy dog",
  "highlight": "fox"
}
```

**Manifest type:** `highlighted-text`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `text` | `string \| FromRef` | — | **Yes** |
| `highlight` | `string \| FromRef` | — | No |
| `highlightColor` | `string` | — | No |
| `caseSensitive` | `boolean` | — | No |

---

### `list`

**Manifest type:** `list`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | No |
| `items` | `object[]` | — | No |
| `titleField` | `string` | — | No |
| `descriptionField` | `string` | — | No |
| `iconField` | `string` | — | No |
| `limit` | `number` | — | No |
| `variant` | `"default" \| "bordered" \| "card"` | — | No |
| `divider` | `boolean` | — | No |
| `selectable` | `boolean` | — | No |
| `sortable` | `boolean` | — | No |
| `draggable` | `boolean` | — | No |
| `reorderAction` | `object` | — | No |
| `onReorder` | `object` | — | No |
| `dragGroup` | `string` | — | No |
| `dropTargets` | `string[]` | — | No |
| `onDrop` | `object` | — | No |
| `contextMenu` | `object \| { type: "separator", slots: { separator: SlotStyle } } \| { type: "label", text: string \|...` | — | No |
| `poll` | `{ interval: number, pauseWhenHidden: boolean }` | — | No |
| `clientFilter` | `{ field: string, operator: "equals" \| "contains" \| "startsWith" \| "endsWith" \| "gt" \| "lt" \| "gte...` | — | No |
| `clientSort` | `{ field: string, direction: "asc" \| "desc" }[]` | — | No |
| `live` | `boolean \| { event: string, debounce: number, indicator: boolean }` | — | No |
| `loading` | `object` | — | No |
| `empty` | `object` | — | No |
| `virtualize` | `boolean \| { itemHeight: number, overscan: number }` | — | No |
| `emptyMessage` | `string \| FromRef` | — | No |
| `error` | `object` | — | No |

**Slots:** `item`, `itemBody`, `itemLink`, `itemHandle`, `itemTitle`, `itemDescription`, `itemIcon`, `itemBadge`, `divider`

---

### `notification-bell`

Zod config schema for the NotificationBell component.Defines all manifest-settable fields for a bell icon withan unread count badge.```json{  "type": "notification-bell",  "count": 5,  "max": 99,  "clickAction": { "type": "navigate", "to": "/notifications" }}```

**Manifest type:** `notification-bell`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `count` | `number \| FromRef` | — | No |
| `max` | `number` | — | No |
| `size` | `"sm" \| "md" \| "lg"` | — | No |
| `clickAction` | `unknown` | — | No |

---

### `progress`

Zod config schema for the Progress component.Defines all manifest-settable fields for a progress bar/ringthat displays determinate or indeterminate progress.```json{  "type": "progress",  "value": 65,  "label": "Upload progress",  "showValue": true,  "color": "primary"}```

**Manifest type:** `progress`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `value` | `number \| FromRef` | — | No |
| `max` | `number` | — | No |
| `label` | `string \| FromRef` | — | No |
| `showValue` | `boolean` | — | No |
| `size` | `"sm" \| "md" \| "lg"` | — | No |
| `variant` | `"bar" \| "circular"` | — | No |
| `segments` | `number` | — | No |

---

### `save-indicator`

Zod config schema for the SaveIndicator component.
Defines all manifest-settable fields for a save status indicator
that shows idle, saving, saved, or error states.

```json
{
  "type": "save-indicator",
  "status": { "from": "my-form.saveStatus" },
  "savedText": "All changes saved",
  "showIcon": true
}
```

**Manifest type:** `save-indicator`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `status` | `"idle" \| "saving" \| "saved" \| "error" \| FromRef` | — | **Yes** |
| `savedText` | `string` | — | No |
| `savingText` | `string` | — | No |
| `errorText` | `string` | — | No |
| `showIcon` | `boolean` | — | No |

---

### `scroll-area`

Zod config schema for the ScrollArea component.A scrollable container with custom-styled thin scrollbarsthat respect the design token system.```json{  "type": "scroll-area",  "maxHeight": "300px",  "orientation": "vertical",  "showScrollbar": "hover",  "content": [    { "type": "heading", "text": "Long list..." }  ]}```

**Manifest type:** `scroll-area`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `orientation` | `"vertical" \| "horizontal" \| "both"` | — | No |
| `showScrollbar` | `"always" \| "hover" \| "auto"` | — | No |
| `content` | `Record<string, unknown>[]` | — | No |

---

### `separator`

Zod config schema for the Separator component.
A simple visual divider line, either horizontal or vertical.
Optionally renders a centered label between the lines.

```json
{
  "type": "separator",
  "orientation": "horizontal",
  "label": "Or continue with"
}
```

**Manifest type:** `separator`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `orientation` | `"horizontal" \| "vertical"` | — | No |
| `label` | `string \| FromRef` | — | No |

---

### `skeleton`

Zod config schema for the Skeleton component.
Defines all manifest-settable fields for a loading placeholder
that can substitute any content shape.

```json
{
  "type": "skeleton",
  "variant": "text",
  "lines": 4,
  "animated": true
}
```

**Manifest type:** `skeleton`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `variant` | `"text" \| "circular" \| "rectangular" \| "card"` | — | No |
| `lines` | `number` | — | No |
| `animated` | `boolean` | — | No |

---

### `stat-card`

Zod config schema for the StatCard component.Defines all manifest-settable fields for a stat card that displaysa single metric with optional trend indicator.```json{  "type": "stat-card",  "data": "GET /api/stats/revenue",  "field": "total",  "label": "Revenue",  "format": "currency",  "trend": { "field": "previousTotal", "sentiment": "up-is-good" }}```

**Manifest type:** `stat-card`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | **Yes** |
| `params` | `Record<string, unknown \| FromRef>` | — | No |
| `field` | `string` | — | No |
| `label` | `string \| FromRef` | — | No |
| `format` | `"number" \| "currency" \| "percent" \| "compact" \| "decimal"` | — | No |
| `currency` | `string` | — | No |
| `decimals` | `number` | — | No |
| `prefix` | `string` | — | No |
| `suffix` | `string` | — | No |
| `divisor` | `number` | — | No |
| `icon` | `string` | — | No |
| `iconColor` | `string` | — | No |
| `trend` | `{ field: string, sentiment: "up-is-good" \| "up-is-bad", format: "percent" \| "absolute" }` | — | No |
| `action` | `object` | — | No |
| `loading` | `"skeleton" \| "pulse" \| "spinner"` | — | No |
| `error` | `object` | — | No |
| `poll` | `{ interval: number, pauseWhenHidden: boolean }` | — | No |
| `empty` | `object` | — | No |
| `live` | `boolean \| { event: string, debounce: number, indicator: boolean }` | — | No |

---

### `tooltip`

Zod config schema for the Tooltip component.
Wraps child components and shows a tooltip on hover with
configurable placement and delay.

```json
{
  "type": "tooltip",
  "text": "Click to view details",
  "placement": "top",
  "content": [{ "type": "button", "label": "View", "action": { "type": "navigate", "to": "/details" } }]
}
```

**Manifest type:** `tooltip`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `text` | `string \| FromRef` | — | **Yes** |
| `content` | `{ type: string }[]` | — | **Yes** |
| `placement` | `"top" \| "bottom" \| "left" \| "right"` | — | No |
| `delay` | `number` | — | No |

**Slots:** `root`, `content`, `arrow`

---

### `vote`

**Manifest type:** `vote`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `value` | `number \| FromRef` | — | No |
| `upAction` | `object` | — | No |
| `downAction` | `object` | — | No |

---

## Content

### `banner`

**Manifest type:** `banner`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `align` | `"left" \| "center" \| "right"` | — | No |
| `children` | `unknown[]` | — | No |

---

### `code`

Inline code primitive schema for manifest-rendered code snippets.

**Manifest type:** `code`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `value` | `string \| FromRef` | — | **Yes** |
| `fallback` | `string` | — | No |

---

### `code-block`

Zod config schema for the CodeBlock component.Defines all manifest-settable fields for a code display blockwith optional copy button and line numbers.```json{  "type": "code-block",  "code": "const x = 42;",  "language": "typescript",  "showLineNumbers": true,  "title": "example.ts"}```

**Manifest type:** `code-block`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `code` | `string \| FromRef` | — | **Yes** |
| `language` | `string` | — | No |
| `highlight` | `boolean` | — | No |
| `showLineNumbers` | `boolean` | — | No |
| `showCopy` | `boolean` | — | No |
| `title` | `string \| FromRef` | — | No |
| `wrap` | `boolean` | — | No |

---

### `compare-view`

Zod config schema for the CompareView component.Defines all manifest-settable fields for a side-by-side contentcomparison view with diff highlighting.```json{  "type": "compare-view",  "left": "Original text content",  "right": "Modified text content",  "leftLabel": "Before",  "rightLabel": "After"}```

**Manifest type:** `compare-view`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `left` | `string \| FromRef` | — | **Yes** |
| `right` | `string \| FromRef` | — | **Yes** |
| `leftLabel` | `string \| FromRef` | — | No |
| `rightLabel` | `string \| FromRef` | — | No |
| `showLineNumbers` | `boolean` | — | No |

---

### `file-uploader`

Zod config schema for the FileUploader component.Renders a drag-and-drop file upload zone with file list,progress tracking, and optional endpoint upload.```json{  "type": "file-uploader",  "accept": "image/*,.pdf",  "maxSize": 5242880,  "maxFiles": 5,  "label": "Upload documents",  "description": "PDF or images up to 5MB each",  "uploadEndpoint": "POST /api/uploads"}```

**Manifest type:** `file-uploader`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `accept` | `string` | — | No |
| `maxSize` | `number` | — | No |
| `maxFiles` | `number` | — | No |
| `label` | `string \| FromRef` | — | No |
| `description` | `string \| FromRef` | — | No |
| `variant` | `"dropzone" \| "button" \| "compact"` | — | No |
| `uploadEndpoint` | `EndpointTarget` | — | No |
| `onUpload` | `object` | — | No |

---

### `heading`

**Manifest type:** `heading`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `text` | `string \| EnvRef \| FromRef \| Expr \| TRef` | — | **Yes** |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | — | No |
| `align` | `"left" \| "center" \| "right"` | — | No |
| `fallback` | `string` | — | No |

---

### `link-embed`

Zod config schema for the LinkEmbed component.Renders rich URL previews with platform-specific renderers forYouTube, Instagram, TikTok, Twitter/X, and generic Open Graph cards.Also supports inline GIF embeds.```json{  "type": "link-embed",  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}``````json{  "type": "link-embed",  "url": "https://twitter.com/user/status/123",  "meta": {    "title": "Tweet by     "description": "Hello world!",    "image": "https://pbs.twimg.com/...",    "siteName": "Twitter",    "favicon": "https://abs.twimg.com/favicons/twitter.3.ico"  }}```

**Manifest type:** `link-embed`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `url` | `string \| FromRef` | — | **Yes** |
| `meta` | `object` | — | No |
| `allowIframe` | `boolean` | — | No |
| `aspectRatio` | `string` | — | No |

---

### `markdown`

Zod config schema for the Markdown component.Renders markdown content with full GFM support and syntax highlighting.```json{  "type": "markdown",  "content": "# Hello\n\nSome **bold** text and a [link](https://example.com)."}```

**Manifest type:** `markdown`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `content` | `string \| FromRef` | — | **Yes** |

---

### `rich-input`

Zod config schema for the RichInput component.A TipTap-based WYSIWYG editor for chat messages, comments, and posts.Users see formatted text as they type (bold, italic, mentions, etc.)rather than raw markdown.```json{  "type": "rich-input",  "id": "chat-input",  "placeholder": "Type a message...",  "sendOnEnter": true,  "features": ["bold", "italic", "mention", "emoji", "code"],  "sendAction": {    "type": "api",    "method": "POST",    "endpoint": "/api/channels/general/messages",    "body": { "from": "chat-input" }  }}```

**Manifest type:** `rich-input`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `placeholder` | `string \| FromRef` | — | No |
| `features` | `"bold" \| "italic" \| "underline" \| "strike" \| "code" \| "code-block" \| "link" \| "bullet-list" \| "or...` | — | No |
| `mentionData` | `DataSource` | — | No |
| `mentionDisplayField` | `string` | — | No |
| `mentionValueField` | `string` | — | No |
| `sendAction` | `object` | — | No |
| `sendOnEnter` | `boolean` | — | No |
| `maxLength` | `number` | — | No |
| `readonly` | `boolean \| FromRef` | — | No |

---

### `rich-text-editor`

Zod config schema for the RichTextEditor component.Defines all manifest-settable fields for a CodeMirror 6-based markdown editorwith toolbar, preview pane, and split view support.```json{  "type": "rich-text-editor",  "id": "content-editor",  "content": "# Hello\n\nStart writing...",  "mode": "split",  "toolbar": ["bold", "italic", "h1", "h2", "separator", "code", "link"]}```

**Manifest type:** `rich-text-editor`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `content` | `string \| FromRef` | — | No |
| `placeholder` | `string \| FromRef` | — | No |
| `mode` | `"edit" \| "preview" \| "split"` | — | No |
| `readonly` | `boolean \| FromRef` | — | No |
| `toolbar` | `boolean \| "bold" \| "italic" \| "strikethrough" \| "h1" \| "h2" \| "h3" \| "bullet-list" \| "ordered-lis...` | — | No |

---

### `timeline`

**Manifest type:** `timeline`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | No |
| `items` | `object[]` | — | No |
| `dateField` | `string` | — | No |
| `titleField` | `string` | — | No |
| `descriptionField` | `string` | — | No |
| `variant` | `"default" \| "alternating" \| "compact"` | — | No |
| `showConnector` | `boolean` | — | No |
| `action` | `object` | — | No |
| `error` | `object` | — | No |

**Slots:** `item`, `markerColumn`, `marker`, `connector`, `body`, `header`, `titleGroup`, `itemIcon`, `title`, `description`, `meta`, `content`

---

## Navigation

### `accordion`

**Manifest type:** `accordion`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `items` | `object[]` | — | **Yes** |
| `mode` | `"single" \| "multiple"` | — | No |
| `defaultOpen` | `number \| number[]` | — | No |
| `variant` | `"default" \| "bordered" \| "separated"` | — | No |
| `iconPosition` | `"left" \| "right"` | — | No |

**Slots:** `root`, `item`, `trigger`, `triggerLabel`, `triggerIcon`, `content`

---

### `breadcrumb`

**Manifest type:** `breadcrumb`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `source` | `"manual" \| "route"` | — | No |
| `items` | `object[]` | — | No |
| `includeHome` | `boolean` | — | No |
| `separator` | `"slash" \| "chevron" \| "dot" \| "arrow"` | — | No |
| `maxItems` | `number` | — | No |
| `action` | `object` | — | No |

**Slots:** `root`, `list`, `item`, `link`, `current`, `separator`, `icon`

---

### `prefetch-link`

Zod schema for `<PrefetchLink>` config.`<PrefetchLink>` is a prefetch primitive that renders a plain `<a>` tag andautomatically injects `<link rel="prefetch">` tags for the route's JS chunksand CSS files when the user hovers over the link or when it enters the viewport.It is not a router-aware component — consumers wire their own router.This avoids a peer dependency on TanStack Router.

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `to` | `string` | — | **Yes** |
| `prefetch` | `"hover" \| "visible" \| "viewport" \| "eager" \| "none"` | `"hover"` | No |
| `children` | `unknown` | — | No |
| `target` | `string` | — | No |
| `rel` | `string` | — | No |

**Slots:** `root`

---

### `stepper`

**Manifest type:** `stepper`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `steps` | `object[]` | — | **Yes** |
| `activeStep` | `number \| FromRef` | — | No |
| `orientation` | `"horizontal" \| "vertical"` | — | No |
| `variant` | `"default" \| "simple" \| "dots"` | — | No |
| `clickable` | `boolean` | — | No |

**Slots:** `root`, `track`, `item`, `marker`, `label`, `description`, `textGroup`, `connector`, `content`

---

### `tabs`

**Manifest type:** `tabs`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `children` | `object[]` | — | **Yes** |
| `defaultTab` | `number` | `0` | No |
| `urlSync` | `boolean \| { params: Record<string, string>, replace: boolean }` | — | No |
| `variant` | `"default" \| "underline" \| "pills"` | `"default"` | No |

**Slots:** `root`, `list`, `tab`, `tabLabel`, `tabIcon`, `panel`

---

### `tree-view`

**Manifest type:** `tree-view`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | No |
| `items` | `object[]` | — | No |
| `selectable` | `boolean` | — | No |
| `multiSelect` | `boolean` | — | No |
| `showIcon` | `boolean` | — | No |
| `showConnectors` | `boolean` | — | No |
| `action` | `object` | — | No |
| `error` | `object` | — | No |

**Slots:** `root`, `loadingState`, `loadingItem`, `loadingMarker`, `loadingLabel`, `loadingLabelSecondary`, `errorState`, `emptyState`, `item`, `row`, `label`, `icon`, `badge`, `connector`, `disclosure`, `children`

---

## Overlays

### `command-palette`

**Manifest type:** `command-palette`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `placeholder` | `string \| FromRef` | — | No |
| `groups` | `{ label: string \| FromRef, items: object[] }[]` | — | No |
| `data` | `DataSource` | — | No |
| `autoRegisterShortcuts` | `boolean` | `true` | No |
| `searchEndpoint` | `{ endpoint: EndpointTarget, debounce: number, minLength: number }` | — | No |
| `recentItems` | `{ enabled: boolean, maxItems: number }` | — | No |
| `shortcut` | `string` | `"ctrl+k"` | No |
| `emptyMessage` | `string \| FromRef` | — | No |

**Slots:** `item`, `itemLabel`, `itemIcon`

---

### `confirm-dialog`

Overlay alias schema for manifest-driven confirmation dialogs.

**Manifest type:** `confirm-dialog`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `title` | `string \| FromRef` | — | No |
| `description` | `string \| FromRef` | — | No |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | — | No |
| `confirmLabel` | `string \| FromRef` | `"Confirm"` | No |
| `cancelLabel` | `string \| FromRef` | `"Cancel"` | No |
| `confirmVariant` | `"default" \| "secondary" \| "destructive" \| "ghost"` | `"default"` | No |
| `cancelVariant` | `"default" \| "secondary" \| "destructive" \| "ghost"` | `"secondary"` | No |
| `confirmAction` | `object \| ... \| object \| ...[]` | — | No |
| `cancelAction` | `object \| ... \| object \| ...[]` | — | No |
| `dismissOnConfirm` | `boolean` | `true` | No |
| `dismissOnCancel` | `boolean` | `true` | No |
| `onOpen` | `string \| ... \| object \| ...[]` | — | No |
| `onClose` | `string \| ... \| object \| ...[]` | — | No |
| `urlParam` | `string` | — | No |
| `trapFocus` | `boolean` | `true` | No |
| `initialFocus` | `string` | — | No |
| `returnFocus` | `boolean` | `true` | No |

---

### `context-menu`

Zod schema for the ContextMenu component.Defines a right-click menu with styleable trigger, panel, item, label, and separator surfaces.Visibility can be driven by a boolean or a binding reference.

**Manifest type:** `context-menu`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `items` | `object \| { type: "separator", slots: { separator: SlotStyle } } \| { type: "label", text: string \|...` | — | No |
| `triggerText` | `string \| FromRef` | — | No |

**Slots:** `root`, `trigger`, `panel`, `item`, `itemLabel`, `itemIcon`, `separator`, `label`

---

### `drawer`

Zod schema for drawer component config.Drawers are slide-in panels from the left or right edge of the screen.Like modals, they are opened/closed via the modal manager.

**Manifest type:** `drawer`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `title` | `string \| FromRef` | — | No |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"md"` | No |
| `side` | `"left" \| "right"` | `"right"` | No |
| `trigger` | `FromRef` | — | No |
| `content` | `Record<string, unknown>[]` | — | **Yes** |
| `onOpen` | `string \| ... \| object \| ...[]` | — | No |
| `onClose` | `string \| ... \| object \| ...[]` | — | No |
| `urlParam` | `string` | — | No |
| `trapFocus` | `boolean` | `true` | No |
| `initialFocus` | `string` | — | No |
| `returnFocus` | `boolean` | `true` | No |
| `footer` | `{ actions: object[], align: "left" \| "center" \| "right" }` | — | No |

**Slots:** `root`, `overlay`, `panel`, `header`, `title`, `closeButton`, `body`, `footer`, `footerAction`

---

### `dropdown-menu`

**Manifest type:** `dropdown-menu`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `trigger` | `{ label: string \| FromRef, icon: string, variant: "default" \| "secondary" \| "outline" \| "ghost" \|...` | — | **Yes** |
| `items` | `object \| { type: "separator", slots: { separator: SlotStyle } } \| { type: "label", text: string \|...` | — | **Yes** |
| `align` | `"start" \| "center" \| "end"` | — | No |
| `side` | `"top" \| "bottom"` | — | No |

**Slots:** `root`, `trigger`, `triggerLabel`, `triggerIcon`, `panel`, `item`, `itemLabel`, `itemIcon`, `separator`, `label`

---

### `hover-card`

**Manifest type:** `hover-card`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `trigger` | `{ type: string }` | — | **Yes** |
| `content` | `{ type: string }[]` | — | **Yes** |
| `align` | `"start" \| "center" \| "end"` | — | No |
| `side` | `"top" \| "bottom" \| "left" \| "right"` | — | No |
| `openDelay` | `number` | — | No |
| `closeDelay` | `number` | — | No |

**Slots:** `root`, `panel`, `content`

---

### `modal`

Zod schema for modal component config.Modals are overlay dialogs that display child components.They are opened/closed via the modal manager (open-modal/close-modal actions).

**Manifest type:** `modal`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `title` | `string \| FromRef` | — | No |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"md"` | No |
| `trigger` | `FromRef` | — | No |
| `content` | `Record<string, unknown>[]` | — | **Yes** |
| `onOpen` | `string \| ... \| object \| ...[]` | — | No |
| `onClose` | `string \| ... \| object \| ...[]` | — | No |
| `urlParam` | `string` | — | No |
| `trapFocus` | `boolean` | `true` | No |
| `initialFocus` | `string` | — | No |
| `returnFocus` | `boolean` | `true` | No |
| `footer` | `{ actions: object[], align: "left" \| "center" \| "right" }` | — | No |

**Slots:** `root`, `overlay`, `panel`, `header`, `title`, `closeButton`, `body`, `footer`, `footerAction`

---

### `popover`

Zod schema for the Popover component.Defines a trigger-driven floating panel with optional title, description, footer content, width,placement, and canonical slot-based styling for the trigger and panel sub-surfaces.

**Manifest type:** `popover`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `trigger` | `string \| FromRef` | — | **Yes** |
| `triggerIcon` | `string` | — | No |
| `triggerVariant` | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive" \| "link"` | — | No |
| `title` | `string \| FromRef` | — | No |
| `description` | `string \| FromRef` | — | No |
| `content` | `unknown[]` | — | No |
| `footer` | `unknown[]` | — | No |
| `placement` | `"top" \| "bottom"` | — | No |

**Slots:** `root`, `trigger`, `triggerLabel`, `triggerIcon`, `panel`, `content`, `header`, `title`, `description`, `footer`, `closeButton`

---

## Media

### `carousel`

**Manifest type:** `carousel`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `autoPlay` | `boolean` | — | No |
| `interval` | `number` | — | No |
| `showDots` | `boolean` | — | No |
| `showArrows` | `boolean` | — | No |
| `children` | `{ type: string }[]` | — | No |

**Slots:** `root`, `viewport`, `track`, `slide`, `controls`, `prevButton`, `nextButton`, `indicator`, `indicatorItem`

---

### `embed`

**Manifest type:** `embed`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `url` | `string \| FromRef` | — | **Yes** |
| `aspectRatio` | `string \| FromRef` | — | No |
| `title` | `string \| FromRef` | — | No |

---

### `image`

**Manifest type:** `image`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `src` | `string` | — | **Yes** |
| `quality` | `number` | `75` | No |
| `format` | `"avif" \| "webp" \| "jpeg" \| "png" \| "original"` | `"original"` | No |
| `sizes` | `string` | — | No |
| `priority` | `boolean` | `false` | No |
| `placeholder` | `"blur" \| "empty" \| "skeleton"` | `"empty"` | No |
| `loading` | `"lazy" \| "eager"` | — | No |
| `aspectRatio` | `string` | — | No |
| `alt` | `string` | — | **Yes** |

---

### `video`

**Manifest type:** `video`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `src` | `string` | — | **Yes** |
| `poster` | `string` | — | No |
| `controls` | `boolean` | — | No |
| `autoPlay` | `boolean` | — | No |
| `loop` | `boolean` | — | No |
| `muted` | `boolean` | — | No |

---

## Communication

### `chat-window`

Zod config schema for the ChatWindow component.A full chat interface composing a message thread, rich input,and typing indicator into a single component.```json{  "type": "chat-window",  "title": "#general",  "data": "GET /api/channels/general/messages",  "sendAction": {    "type": "api",    "method": "POST",    "endpoint": "/api/channels/general/messages"  },  "height": "600px"}```

**Manifest type:** `chat-window`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | **Yes** |
| `contentField` | `string` | — | No |
| `authorNameField` | `string` | — | No |
| `authorAvatarField` | `string` | — | No |
| `timestampField` | `string` | — | No |
| `title` | `string \| FromRef` | — | No |
| `subtitle` | `string \| FromRef` | — | No |
| `showHeader` | `boolean` | — | No |
| `inputPlaceholder` | `string \| FromRef` | — | No |
| `inputFeatures` | `string[]` | — | No |
| `mentionData` | `DataSource` | — | No |
| `sendAction` | `object` | — | No |
| `showTypingIndicator` | `boolean` | — | No |
| `showReactions` | `boolean` | — | No |

---

### `comment-section`

Zod config schema for the CommentSection component.Renders a comment list with nested replies and an embedded rich inputfor posting new comments.```json{  "type": "comment-section",  "data": "GET /api/posts/123/comments",  "inputPlaceholder": "Write a comment...",  "submitAction": {    "type": "api",    "method": "POST",    "endpoint": "/api/posts/123/comments"  }}```

**Manifest type:** `comment-section`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | **Yes** |
| `contentField` | `string` | — | No |
| `authorNameField` | `string` | — | No |
| `authorAvatarField` | `string` | — | No |
| `timestampField` | `string` | — | No |
| `inputPlaceholder` | `string \| FromRef` | — | No |
| `inputFeatures` | `string[]` | — | No |
| `submitAction` | `object` | — | No |
| `deleteAction` | `object` | — | No |
| `sortOrder` | `"newest" \| "oldest"` | — | No |
| `emptyMessage` | `string \| FromRef` | — | No |

---

### `emoji-picker`

Zod config schema for the EmojiPicker component.
Renders a searchable grid of emojis organized by category.

```json
{
  "type": "emoji-picker",
  "id": "emoji",
  "perRow": 8,
  "maxHeight": "300px"
}
```

**Manifest type:** `emoji-picker`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `categories` | `"smileys" \| "people" \| "animals" \| "food" \| "travel" \| "activities" \| "objects" \| "symbols" \| "fl...` | — | No |
| `perRow` | `number` | — | No |
| `customEmojis` | `object[]` | — | No |
| `customEmojiData` | `DataSource` | — | No |
| `emojiUrlField` | `string` | — | No |
| `emojiUrlPrefix` | `string` | — | No |
| `selectAction` | `object` | — | No |

---

### `gif-picker`

Zod config schema for the GifPicker component.Searchable GIF picker that queries a GIF API (Giphy/Tenor) anddisplays results in a masonry-style grid.The component expects a backend proxy endpoint that handles theactual API key and returns GIF results. This avoids exposingAPI keys in the frontend.```json{  "type": "gif-picker",  "searchEndpoint": "GET /api/gifs/search",  "trendingEndpoint": "GET /api/gifs/trending",  "selectAction": {    "type": "toast",    "message": "GIF selected!"  }}```Expected API response format:```json{  "results": [    {      "id": "abc123",      "url": "https://media.giphy.com/media/abc123/giphy.gif",      "preview": "https://media.giphy.com/media/abc123/200w.gif",      "width": 480,      "height": 270,      "title": "Funny cat"    }  ]}```

**Manifest type:** `gif-picker`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `searchEndpoint` | `EndpointTarget` | — | No |
| `trendingEndpoint` | `EndpointTarget` | — | No |
| `gifs` | `object[]` | — | No |
| `urlField` | `string` | — | No |
| `previewField` | `string` | — | No |
| `titleField` | `string` | — | No |
| `selectAction` | `object` | — | No |
| `columns` | `number` | — | No |
| `placeholder` | `string \| FromRef` | — | No |
| `attribution` | `string \| FromRef` | — | No |

---

### `message-thread`

Zod config schema for the MessageThread component.Renders a scrollable message list with avatars, timestamps,message grouping, date separators, and optional reactions/threading.```json{  "type": "message-thread",  "data": "GET /api/channels/general/messages",  "showReactions": true,  "groupByDate": true,  "maxHeight": "500px"}```

**Manifest type:** `message-thread`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | **Yes** |
| `contentField` | `string` | — | No |
| `authorField` | `string` | — | No |
| `authorNameField` | `string` | — | No |
| `authorAvatarField` | `string` | — | No |
| `timestampField` | `string` | — | No |
| `reactionsField` | `string` | — | No |
| `embedsField` | `string` | — | No |
| `showEmbeds` | `boolean` | — | No |
| `showReactions` | `boolean` | — | No |
| `showTimestamps` | `boolean` | — | No |
| `groupByDate` | `boolean` | — | No |
| `messageAction` | `object` | — | No |
| `emptyMessage` | `string \| FromRef` | — | No |

---

### `presence-indicator`

Zod config schema for the PresenceIndicator component.
Displays an online/offline/away/busy/dnd status dot with optional label.

```json
{
  "type": "presence-indicator",
  "status": "online",
  "label": "John Doe",
  "size": "md"
}
```

**Manifest type:** `presence-indicator`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `status` | `"online" \| "offline" \| "away" \| "busy" \| "dnd" \| FromRef` | — | **Yes** |
| `label` | `string \| FromRef` | — | No |
| `showDot` | `boolean` | — | No |
| `showLabel` | `boolean` | — | No |
| `size` | `"sm" \| "md" \| "lg"` | — | No |

---

### `reaction-bar`

Zod config schema for the ReactionBar component.Displays emoji reactions with counts and an add button.```json{  "type": "reaction-bar",  "reactions": [    { "emoji": "\ud83d\udc4d", "count": 5, "active": true },    { "emoji": "\u2764\ufe0f", "count": 3 },    { "emoji": "\ud83d\ude02", "count": 2 }  ]}```

**Manifest type:** `reaction-bar`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `reactions` | `{ emoji: string, count: number, active: boolean }[]` | — | No |
| `data` | `DataSource` | — | No |
| `addAction` | `object` | — | No |
| `removeAction` | `object` | — | No |
| `showAddButton` | `boolean` | — | No |

---

### `typing-indicator`

Zod config schema for the TypingIndicator component.
Displays an animated "User is typing..." indicator with bouncing dots.

```json
{
  "type": "typing-indicator",
  "users": [{ "name": "Alice" }, { "name": "Bob" }]
}
```

**Manifest type:** `typing-indicator`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `users` | `{ name: string, avatar: string }[] \| FromRef` | — | No |
| `maxDisplay` | `number` | — | No |

---

## Workflow

### `audit-log`

**Manifest type:** `audit-log`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | **Yes** |
| `userField` | `string` | — | No |
| `actionField` | `string` | — | No |
| `timestampField` | `string` | — | No |
| `detailsField` | `string` | — | No |
| `iconField` | `string` | — | No |
| `pagination` | `boolean \| { pageSize: number }` | — | No |
| `filters` | `{ field: string, label: string \| FromRef, options: string \| FromRef[] }[]` | — | No |

---

### `calendar`

**Manifest type:** `calendar`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | No |
| `events` | `object[]` | — | No |
| `view` | `"month" \| "week"` | — | No |
| `titleField` | `string` | — | No |
| `dateField` | `string` | — | No |
| `colorField` | `string` | — | No |
| `eventAction` | `object` | — | No |
| `dateAction` | `object` | — | No |
| `showWeekNumbers` | `boolean` | — | No |
| `todayLabel` | `string \| FromRef` | — | No |

---

### `kanban`

**Manifest type:** `kanban`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | No |
| `columns` | `object[]` | — | **Yes** |
| `columnField` | `string` | — | No |
| `titleField` | `string` | — | No |
| `descriptionField` | `string` | — | No |
| `assigneeField` | `string` | — | No |
| `priorityField` | `string` | — | No |
| `cardAction` | `object` | — | No |
| `sortable` | `boolean` | — | No |
| `reorderAction` | `object` | — | No |
| `emptyMessage` | `string \| FromRef` | — | No |

**Slots:** `root`, `column`, `columnHeader`, `columnTitle`, `columnCount`, `columnBody`, `card`, `cardTitle`, `cardDescription`, `cardMeta`, `emptyState`

---

### `notification-feed`

Zod config schema for the NotificationFeed component.Renders a scrollable list of notifications with read/unread states,type-based icons, relative timestamps, and mark-as-read actions.

**Manifest type:** `notification-feed`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `data` | `DataSource` | — | **Yes** |
| `titleField` | `string` | — | No |
| `messageField` | `string` | — | No |
| `timestampField` | `string` | — | No |
| `readField` | `string` | — | No |
| `typeField` | `string` | — | No |
| `markReadAction` | `object` | — | No |
| `itemAction` | `object` | — | No |
| `showMarkAllRead` | `boolean` | — | No |
| `emptyMessage` | `string \| FromRef` | — | No |

**Slots:** `root`, `header`, `headerContent`, `title`, `unreadBadge`, `markAllButton`, `list`, `loadingState`, `loadingItem`, `loadingIcon`, `loadingBody`, `loadingTitle`, `loadingMessage`, `errorState`, `item`, `itemBody`, `itemIcon`, `itemIconGlyph`, `itemTitle`, `itemMessage`, `itemTimestamp`, `emptyState`

---

## Commerce

### `pricing-table`

Zod schema for a single feature in a pricing tier./
const pricingFeatureSchema = z
  .object({
    /** Feature description text. */
    text: z.union([z.string(), fromRefSchema]),
    /** Whether this feature is included in the tier. Default: true. */
    included: z.boolean().optional(),
  })
  .strict();

/**Zod schema for a single pricing tier (plan)./
const pricingTierSchema = z
  .object({
    /** Tier display name (e.g., "Starter", "Pro", "Enterprise"). */
    name: z.union([z.string(), fromRefSchema]),
    /** Price value — string for custom formatting (e.g., "Custom") or number. */
    price: z.union([z.string(), z.number(), fromRefSchema]),
    /** Billing period label (e.g., "/month", "/year"). */
    period: z.union([z.string(), fromRefSchema]).optional(),
    /** Short description of the tier. */
    description: z.union([z.string(), fromRefSchema]).optional(),
    /** List of features with inclusion indicators. */
    features: z.array(pricingFeatureSchema),
    /** Whether this tier should be visually highlighted. */
    highlighted: z.boolean().optional(),
    /** Badge text displayed on the tier (e.g., "Most Popular"). */
    badge: z.union([z.string(), fromRefSchema]).optional(),
    /** Action dispatched when the CTA button is clicked. */
    action: actionSchema.optional(),
    /** CTA button label. Default: "Get Started". */
    actionLabel: z.union([z.string(), fromRefSchema]).optional(),
  })
  .strict();

/**Zod config schema for the PricingTable component.Renders a comparison table of pricing tiers with features,highlights, badges, and CTA buttons.```json{  "type": "pricing-table",  "currency": "$",  "variant": "cards",  "tiers": [    {      "name": "Starter",      "price": 9,      "period": "/month",      "features": [        { "text": "5 projects", "included": true },        { "text": "API access", "included": false }      ],      "actionLabel": "Start Free"    },    {      "name": "Pro",      "price": 29,      "period": "/month",      "highlighted": true,      "badge": "Most Popular",      "features": [        { "text": "Unlimited projects", "included": true },        { "text": "API access", "included": true }      ]    }  ]}```

**Manifest type:** `pricing-table`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `tiers` | `object[]` | — | **Yes** |
| `currency` | `string \| FromRef` | — | No |
| `columns` | `"auto" \| "2" \| "3" \| "4"` | — | No |
| `variant` | `"cards" \| "table"` | — | No |

---

## Feedback States

### `default-error`

**Manifest type:** `error-page`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `title` | `string \| FromRef` | — | No |
| `description` | `string \| FromRef` | — | No |
| `showRetry` | `boolean` | — | No |
| `retryLabel` | `string \| FromRef` | — | No |

---

### `default-loading`

**Manifest type:** `spinner`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `size` | `"sm" \| "md" \| "lg"` | — | No |
| `label` | `string \| FromRef` | — | No |

---

### `default-not-found`

**Manifest type:** `not-found`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `title` | `string \| FromRef` | — | No |
| `description` | `string \| FromRef` | — | No |
| `homeLabel` | `string \| FromRef` | — | No |

---

### `default-offline`

**Manifest type:** `offline-banner`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `title` | `string \| FromRef` | — | No |
| `description` | `string \| FromRef` | — | No |

---

## Primitives

### `divider`

**Manifest type:** `divider`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string \| FromRef \| EnvRef \| { expr: string } \| TRef` | — | No |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | No |

**Slots:** `root`, `label`, `lineStart`, `lineEnd`

---

### `floating-menu`

**Manifest type:** `floating-menu`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `open` | `boolean` | — | No |
| `align` | `"start" \| "center" \| "end"` | — | No |
| `side` | `"top" \| "bottom"` | — | No |
| `triggerLabel` | `string \| FromRef \| EnvRef \| { expr: string } \| TRef` | — | No |
| `triggerIcon` | `string` | — | No |
| `items` | `object \| { type: "separator", slots: { separator: SlotStyle } } \| { type: "label", text: string \|...` | — | No |

**Slots:** `root`, `trigger`, `panel`, `item`, `itemLabel`, `itemIcon`, `separator`, `label`

---

### `link`

**Manifest type:** `link`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `text` | `string \| FromRef \| EnvRef \| { expr: string } \| TRef` | — | **Yes** |
| `to` | `string \| FromRef \| EnvRef \| { expr: string }` | — | **Yes** |
| `icon` | `string` | — | No |
| `badge` | `string \| number \| FromRef \| EnvRef \| { expr: string } \| TRef` | — | No |
| `external` | `boolean` | `false` | No |
| `disabled` | `boolean` | — | No |
| `current` | `boolean` | — | No |
| `matchChildren` | `boolean` | `true` | No |
| `align` | `"left" \| "center" \| "right"` | `"left"` | No |
| `variant` | `"default" \| "muted" \| "button" \| "navigation"` | `"default"` | No |

**Slots:** `root`, `label`, `icon`, `badge`

---

### `oauth-buttons`

**Manifest type:** `oauth-buttons`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `heading` | `string \| FromRef \| EnvRef \| { expr: string } \| TRef` | — | No |

**Slots:** `root`, `heading`, `providerGroup`, `provider`, `providerIcon`, `providerLabel`, `providerDescription`

---

### `passkey-button`

**Manifest type:** `passkey-button`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `label` | `string \| FromRef \| EnvRef \| { expr: string } \| TRef` | `"Sign in with passkey"` | No |
| `onSuccess` | `object \| ... \| object \| ...[]` | — | No |
| `onError` | `object \| ... \| object \| ...[]` | — | No |

**Slots:** `root`, `label`

---

### `stack`

**Manifest type:** `stack`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `children` | `{ type: string }[]` | — | **Yes** |
| `align` | `"stretch" \| "start" \| "center" \| "end"` | `"stretch"` | No |
| `justify` | `"start" \| "center" \| "end" \| "between" \| "around"` | `"start"` | No |

**Slots:** `root`, `item`

---

### `text`

**Manifest type:** `text`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `value` | `string \| FromRef \| EnvRef \| { expr: string } \| TRef` | — | **Yes** |
| `variant` | `"default" \| "muted" \| "subtle"` | `"default"` | No |
| `size` | `"xs" \| "sm" \| "md" \| "lg"` | `"md"` | No |
| `weight` | `"light" \| "normal" \| "medium" \| "semibold" \| "bold"` | `"normal"` | No |
| `align` | `"left" \| "center" \| "right"` | `"left"` | No |

**Slots:** `root`

---

## _base

### `component-group`

**Manifest type:** `component-group`

| Field | Type | Default | Required |
|-------|------|---------|----------|
| `group` | `string` | — | **Yes** |
| `overrides` | `Record<string, Record<string, unknown>>` | — | No |

---
