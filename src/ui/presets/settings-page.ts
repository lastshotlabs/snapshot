/**
 * `settingsPage` preset factory.
 *
 * Composes a settings page from high-level options and returns a valid
 * manifest `PageConfig`. The generated page includes:
 *
 * - A page heading
 * - A Tabs component with one tab per section
 * - Each tab contains an AutoForm for that section's fields
 */

import type { PageConfig } from "../manifest/types";
import type {
  SettingsPageOptions,
  SettingsSectionDef,
  FormFieldDef,
} from "./types";

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Converts a title to a slug suitable for component IDs.
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Maps a preset FormFieldDef to the AutoForm field config shape.
 * The AutoForm uses `name` instead of `key`, and `checkbox` for toggle.
 */
function mapFormField(field: FormFieldDef): Record<string, unknown> {
  const mapped: Record<string, unknown> = {
    name: field.key,
    type: field.type === "toggle" ? "checkbox" : field.type,
    label: field.label,
  };

  if (field.required !== undefined) mapped.required = field.required;
  if (field.placeholder !== undefined) mapped.placeholder = field.placeholder;
  if (field.options !== undefined) mapped.options = field.options;

  return mapped;
}

/**
 * Maps a SettingsSectionDef to a Tabs `children` tab entry.
 */
function mapSection(section: SettingsSectionDef): Record<string, unknown> {
  const formFields = section.fields.map(mapFormField);

  const formConfig: Record<string, unknown> = {
    type: "form",
    submit: section.submitEndpoint,
    method: section.method ?? "PATCH",
    fields: formFields,
    submitLabel: section.submitLabel ?? "Save Changes",
    onSuccess: {
      type: "toast",
      message: `${section.label} settings saved`,
      variant: "success",
    },
  };

  if (section.dataEndpoint) {
    formConfig.data = section.dataEndpoint;
  }

  const tab: Record<string, unknown> = {
    label: section.label,
    content: [formConfig],
  };

  if (section.icon) {
    tab.icon = section.icon;
  }

  return tab;
}

// ── settingsPage factory ─────────────────────────────────────────────────────

/**
 * Builds a manifest `PageConfig` for a settings page.
 *
 * Consumers drop the result into their manifest's `pages` record:
 *
 * ```ts
 * const manifest = {
 *   pages: {
 *     "/settings": settingsPage({
 *       title: "Settings",
 *       sections: [
 *         {
 *           label: "Profile",
 *           submitEndpoint: "PATCH /api/me/profile",
 *           dataEndpoint: "GET /api/me/profile",
 *           fields: [
 *             { key: "name", type: "text", label: "Name", required: true },
 *             { key: "bio", type: "textarea", label: "Bio" },
 *           ],
 *         },
 *         {
 *           label: "Password",
 *           submitEndpoint: "POST /api/me/password",
 *           fields: [
 *             { key: "currentPassword", type: "password", label: "Current Password", required: true },
 *             { key: "newPassword", type: "password", label: "New Password", required: true },
 *           ],
 *         },
 *       ],
 *     }),
 *   },
 * };
 * ```
 *
 * @param options - High-level settings page options
 * @returns A valid manifest `PageConfig`
 */
export function settingsPage(options: SettingsPageOptions): PageConfig {
  const slug = options.id ?? slugify(options.title);

  const content: Record<string, unknown>[] = [];

  // Page heading
  content.push({
    type: "heading",
    text: options.title,
    level: 1,
  });

  // Tabs — one tab per section
  const tabs = options.sections.map(mapSection);

  content.push({
    type: "tabs",
    id: `${slug}-tabs`,
    children: tabs,
    defaultTab: 0,
    variant: "underline",
  });

  return {
    title: options.title,
    content: content as PageConfig["content"],
  };
}
