---
title: Forms and Validation
description: Build forms with 18 field components, validation, auto-forms, and multi-step wizards.
draft: false
---

```tsx
import { createSnapshot } from "@lastshotlabs/snapshot";
import {
  InputField, SelectField, ButtonBase, CardBase, ColumnBase, AlertBase,
} from "@lastshotlabs/snapshot/ui";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const snap = createSnapshot({ apiUrl: "/api" });

function CreateProjectForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [tier, setTier] = useState("free");

  const { mutate, isPending, isSuccess, error, reset } = useMutation({
    mutationFn: (data: { name: string; tier: string }) =>
      snap.api.post("/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/projects"] });
      setName("");
      setTier("free");
    },
  });

  return (
    <CardBase title="New Project">
      <form onSubmit={(e) => { e.preventDefault(); reset(); mutate({ name, tier }); }}>
        <ColumnBase gap="md">
          <InputField label="Project name" value={name} onChange={setName} required placeholder="My project" />
          <SelectField
            label="Tier"
            value={tier}
            onChange={setTier}
            options={[
              { label: "Free", value: "free" },
              { label: "Pro", value: "pro" },
              { label: "Enterprise", value: "enterprise" },
            ]}
          />
          {isSuccess && <AlertBase severity="success">Project created</AlertBase>}
          {error && <AlertBase severity="error">{(error as Error).message}</AlertBase>}
          <ButtonBase
            label={isPending ? "Creating..." : "Create project"}
            type="submit"
            disabled={isPending || !name}
            fullWidth
          />
        </ColumnBase>
      </form>
    </CardBase>
  );
}
```

This pattern -- form state, mutation, loading button, error display, success feedback, and cache invalidation -- applies to every form you build with Snapshot.

## Text inputs

### InputField

Text input with label, validation, and helper text.

```tsx
<InputField
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  required
  placeholder="you@example.com"
  helperText="We'll never share your email"
  errorText={errors.email}
/>
```

**Key props:** `type` ("text" | "email" | "password" | "number" | "url" | "tel" | "search"), `required`, `disabled`, `readOnly`, `maxLength`, `pattern`, `placeholder`, `helperText`, `errorText`, `onChange`.

### TextareaField

Multi-line text with character counter.

```tsx
<TextareaField
  label="Description"
  value={desc}
  onChange={setDesc}
  maxLength={500}
  rows={4}
  resize="vertical"
/>
```

## Selection

### SelectField

Dropdown with static options.

```tsx
<SelectField
  label="Country"
  value={country}
  onChange={setCountry}
  placeholder="Choose a country"
  options={[
    { label: "United States", value: "us" },
    { label: "Canada", value: "ca" },
    { label: "Mexico", value: "mx" },
  ]}
/>
```

### MultiSelectField

Multi-select with search and pills.

```tsx
<MultiSelectField
  label="Tags"
  options={[
    { label: "React", value: "react" },
    { label: "TypeScript", value: "ts" },
    { label: "Node", value: "node" },
  ]}
  value={selectedTags}
  onChange={setSelectedTags}
  searchable
  maxSelected={5}
/>
```

### TagSelectorField

Tag picker with optional creation.

```tsx
<TagSelectorField
  tags={[
    { id: "bug", label: "Bug", color: "#ef4444" },
    { id: "feature", label: "Feature", color: "#3b82f6" },
  ]}
  value={selectedIds}
  onChange={setSelectedIds}
  allowCreate
  onCreate={(label) => addNewTag(label)}
/>
```

### EntityPickerBase

Entity selection dropdown with search and avatars.

```tsx
import { EntityPickerBase } from "@lastshotlabs/snapshot/ui";

<EntityPickerBase
  entities={users.map((u) => ({
    label: u.name,
    value: u.id,
    avatar: u.avatarUrl,
    description: u.email,
  }))}
  value={assignee}
  onChange={setAssignee}
  searchable
/>
```

## Toggles and switches

### SwitchField

Toggle switch with label and description.

```tsx
<SwitchField
  label="Email notifications"
  description="Receive updates about your projects"
  checked={notifications}
  onChange={setNotifications}
/>
```

### ToggleField

Pressable toggle button.

```tsx
<ToggleField
  label="Bold"
  icon="bold"
  pressed={isBold}
  onChange={setIsBold}
/>
```

### ToggleGroupBase

Group of toggles with single or multi-select.

```tsx
<ToggleGroupBase
  items={[
    { value: "left", label: "Left", icon: "align-left" },
    { value: "center", label: "Center", icon: "align-center" },
    { value: "right", label: "Right", icon: "align-right" },
  ]}
  value={alignment}
  onChange={setAlignment}
  mode="single"
/>
```

## Specialized inputs

### SliderField

Range slider with optional dual-thumb mode.

```tsx
<SliderField
  min={0}
  max={100}
  defaultValue={50}
  suffix="%"
  showValue
  onChange={setValue}
/>

{/* Price range */}
<SliderField min={0} max={1000} range defaultValue={[200, 800]} suffix="$" showLimits />
```

### DatePickerField

Date picker supporting single, range, and multiple selection.

```tsx
<DatePickerField
  mode="single"
  format="MMM dd, yyyy"
  onChange={setDate}
/>

{/* Date range */}
<DatePickerField
  mode="range"
  min="2024-01-01"
  max="2024-12-31"
  presets={[
    { label: "Last 7 days", start: "2024-03-17", end: "2024-03-24" },
    { label: "Last 30 days", start: "2024-02-23", end: "2024-03-24" },
  ]}
  onChange={setRange}
/>
```

### ColorPickerField

Color picker with swatches and alpha slider.

```tsx
<ColorPickerField
  defaultValue="#3b82f6"
  format="hex"
  showAlpha
  swatches={["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"]}
  onChange={setColor}
/>
```

### LocationInputField

Location search with results dropdown.

```tsx
<LocationInputField
  value={location}
  placeholder="Search for a place"
  results={searchResults}
  loading={isSearching}
  showMapLink
  onSearch={(query) => searchPlaces(query)}
  onSelect={(result) => setLocation(result.label)}
/>
```

## Buttons

### ButtonBase

```tsx
<ButtonBase label="Save" icon="check" variant="default" onClick={save} />
<ButtonBase label="Delete" variant="destructive" onClick={del} />
<ButtonBase label="Cancel" variant="outline" onClick={cancel} />
<ButtonBase label="Learn more" variant="link" onClick={learn} />
```

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`

**Sizes:** `sm`, `md`, `lg`, `icon`

### IconButtonBase

Icon-only button with tooltip.

```tsx
<IconButtonBase icon="trash" ariaLabel="Delete" variant="ghost" shape="circle" onClick={del} />
<IconButtonBase icon="edit" ariaLabel="Edit" size="sm" tooltip="Edit item" onClick={edit} />
```

## Inline editing

### InlineEditField

Click-to-edit text field.

```tsx
<InlineEditField
  value={title}
  placeholder="Click to edit"
  onSave={(newValue) => updateTitle(newValue)}
/>
```

### QuickAddField

Compact input for quick item addition.

```tsx
<QuickAddField
  placeholder="Add a task..."
  icon="plus"
  submitOnEnter
  clearOnSubmit
  onSubmit={(value) => addTask(value)}
/>
```

## Auto-generated forms

### AutoFormBase

Renders a full form from a field config array. Handles layout, validation display, and submit/reset.

```tsx
import { AutoFormBase } from "@lastshotlabs/snapshot/ui";

<AutoFormBase
  fields={[
    { name: "name", label: "Full Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "role", label: "Role", type: "select", options: [
      { label: "Admin", value: "admin" },
      { label: "Member", value: "member" },
    ]},
    { name: "bio", label: "Bio", type: "textarea" },
  ]}
  values={formValues}
  errors={formErrors}
  touched={touched}
  onFieldChange={(name, value) => setFormValues((prev) => ({ ...prev, [name]: value }))}
  onFieldBlur={(name) => setTouched((prev) => ({ ...prev, [name]: true }))}
  onSubmit={() => submitForm(formValues)}
  layout="vertical"
/>
```

## Multi-step wizards

### WizardBase

Multi-step form wizard with progress indicator.

```tsx
import { WizardBase } from "@lastshotlabs/snapshot/ui";

<WizardBase
  state={wizardState}
  steps={[
    {
      title: "Account",
      fields: [
        { name: "email", label: "Email", type: "email", required: true },
        { name: "password", label: "Password", type: "password", required: true },
      ],
    },
    {
      title: "Profile",
      description: "Tell us about yourself",
      fields: [
        { name: "name", label: "Full Name", type: "text", required: true },
        { name: "bio", label: "Bio", type: "textarea" },
        { name: "role", label: "Role", type: "select", options: [
          { label: "Developer", value: "dev" },
          { label: "Designer", value: "design" },
        ]},
      ],
      allowSkip: true,
    },
    {
      title: "Confirm",
      submitLabel: "Complete Setup",
      fields: [],
    },
  ]}
  submitLabel="Complete Setup"
/>
```

WizardBase uses field configs (same shape as AutoFormBase fields) rather than custom React content per step. Each step receives its values, validation, and touched state through the `state` prop, so you can keep wizard state in React state, a form library, or a route loader.

## Complete form patterns

### Form with validation and API submission

A contact form with client-side validation, server submission, and feedback:

```tsx
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate, isPending, isSuccess, error: serverError, reset } = useMutation({
    mutationFn: (data: typeof form) => snap.api.post("/contact", data),
    onSuccess: () => setForm({ name: "", email: "", message: "" }),
  });

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.includes("@")) next.email = "Enter a valid email";
    if (form.message.length < 10) next.message = "Message must be at least 10 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <CardBase title="Contact Us">
      <form onSubmit={(e) => { e.preventDefault(); reset(); if (validate()) mutate(form); }}>
        <ColumnBase gap="md">
          <InputField label="Name" value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            errorText={errors.name} required />
          <InputField label="Email" type="email" value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            errorText={errors.email} required />
          <TextareaField label="Message" value={form.message}
            onChange={(v) => setForm({ ...form, message: v })}
            errorText={errors.message} rows={4} maxLength={500} required />
          {isSuccess && <AlertBase severity="success">Message sent! We'll get back to you soon.</AlertBase>}
          {serverError && <AlertBase severity="error">{(serverError as Error).message}</AlertBase>}
          <ButtonBase label={isPending ? "Sending..." : "Send message"} type="submit" disabled={isPending} fullWidth />
        </ColumnBase>
      </form>
    </CardBase>
  );
}
```

### Edit form with existing data

Pre-fill a form with fetched data and save changes:

```tsx
function EditProjectForm({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useQuery<{ name: string; tier: string; description: string }>({
    queryKey: [`/projects/${projectId}`],
    queryFn: () => snap.api.get(`/projects/${projectId}`),
  });
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<typeof project | null>(null);

  // Sync draft when data loads or project changes
  useEffect(() => {
    if (project) setDraft({ ...project });
  }, [project?.name]);

  const active = draft ?? project;

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: (data: typeof project) => snap.api.patch(`/projects/${projectId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/projects/${projectId}`] }),
  });

  if (isLoading || !active) return null;

  return (
    <CardBase title="Edit Project">
      <form onSubmit={(e) => { e.preventDefault(); mutate(active); }}>
        <ColumnBase gap="md">
          <InputField label="Name" value={active.name} onChange={(v) => setDraft({ ...active, name: v })} />
          <SelectField label="Tier" value={active.tier} onChange={(v) => setDraft({ ...active, tier: v })}
            options={[
              { label: "Free", value: "free" }, { label: "Pro", value: "pro" }, { label: "Enterprise", value: "enterprise" },
            ]} />
          <TextareaField label="Description" value={active.description} onChange={(v) => setDraft({ ...active, description: v })} rows={3} />
          {isSuccess && <AlertBase severity="success">Saved</AlertBase>}
          {error && <AlertBase severity="error">{(error as Error).message}</AlertBase>}
          <RowBase justify="end" gap="sm">
            <ButtonBase label="Reset" variant="outline" onClick={() => setDraft(project ? { ...project } : null)} />
            <ButtonBase label={isPending ? "Saving..." : "Save"} type="submit" disabled={isPending} />
          </RowBase>
        </ColumnBase>
      </form>
    </CardBase>
  );
}
```

## All form components

| Component | Description |
|-----------|-------------|
| `InputField` | Text input with label and validation |
| `TextareaField` | Multi-line text with character counter |
| `SelectField` | Dropdown with static options |
| `MultiSelectField` | Multi-select with search and pills |
| `SwitchField` | Toggle switch with label |
| `SliderField` | Range slider with dual-thumb mode |
| `DatePickerField` | Date/range picker with presets |
| `ColorPickerField` | Color picker with swatches |
| `TagSelectorField` | Tag picker with creation |
| `ToggleField` | Pressable toggle button |
| `ToggleGroupBase` | Toggle button group |
| `LocationInputField` | Location search input |
| `InlineEditField` | Click-to-edit text |
| `QuickAddField` | Compact add input |
| `AutoFormBase` | Config-driven form |
| `WizardBase` | Multi-step wizard |
| `ButtonBase` | Styled button |
| `IconButtonBase` | Icon-only button |

## Next steps

- [Data Tables and Lists](/guides/data-tables/) -- display and interact with data
- [Overlays and Modals](/guides/overlays/) -- modal forms and confirmation dialogs
- [Theming and Styling](/guides/theming-and-styling/) -- customize form appearance with slots
