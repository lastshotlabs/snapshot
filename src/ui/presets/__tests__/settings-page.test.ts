import { describe, it, expect } from "vitest";
// Register the component schemas needed by the preset under test.
import { registerComponentSchema } from "../../manifest/schema";
import { autoFormConfigSchema } from "../../components/forms/auto-form/schema";
import { tabsConfigSchema } from "../../components/navigation/tabs/schema";
registerComponentSchema("form", autoFormConfigSchema);
registerComponentSchema("tabs", tabsConfigSchema);
import { pageConfigSchema } from "../../manifest/schema";
import { settingsPage } from "../settings-page";
import type { SettingsPageOptions } from "../types";

// ── Fixtures ─────────────────────────────────────────────────────────────────

const minimalOptions: SettingsPageOptions = {
  title: "Settings",
  sections: [
    {
      label: "Profile",
      submitEndpoint: "PATCH /api/me/profile",
      fields: [
        { key: "name", type: "text", label: "Name", required: true },
        { key: "email", type: "email", label: "Email", required: true },
      ],
    },
  ],
};

const fullOptions: SettingsPageOptions = {
  title: "Account Settings",
  sections: [
    {
      label: "Profile",
      submitEndpoint: "PATCH /api/me/profile",
      dataEndpoint: "GET /api/me/profile",
      method: "PATCH",
      icon: "user",
      submitLabel: "Update Profile",
      fields: [
        {
          key: "name",
          type: "text",
          label: "Full Name",
          required: true,
          placeholder: "Enter your name",
        },
        {
          key: "bio",
          type: "textarea",
          label: "Bio",
          placeholder: "Tell us about yourself",
        },
        {
          key: "timezone",
          type: "select",
          label: "Timezone",
          options: [
            { label: "UTC", value: "UTC" },
            { label: "US/Eastern", value: "America/New_York" },
          ],
        },
      ],
    },
    {
      label: "Password",
      submitEndpoint: "POST /api/me/password",
      method: "POST",
      icon: "lock",
      fields: [
        {
          key: "currentPassword",
          type: "password",
          label: "Current Password",
          required: true,
        },
        {
          key: "newPassword",
          type: "password",
          label: "New Password",
          required: true,
        },
        {
          key: "confirmPassword",
          type: "password",
          label: "Confirm Password",
          required: true,
        },
      ],
    },
    {
      label: "Notifications",
      submitEndpoint: "PUT /api/me/notifications",
      method: "PUT",
      icon: "bell",
      fields: [
        {
          key: "emailNotifications",
          type: "toggle",
          label: "Email Notifications",
        },
        {
          key: "pushNotifications",
          type: "toggle",
          label: "Push Notifications",
        },
        { key: "marketingEmails", type: "toggle", label: "Marketing Emails" },
      ],
    },
  ],
  id: "account-settings",
};

// ── Helper ────────────────────────────────────────────────────────────────────

function getTabs(
  result: ReturnType<typeof settingsPage>,
): Record<string, unknown> {
  const tabs = result.content.find(
    (c) => (c as Record<string, unknown>).type === "tabs",
  ) as Record<string, unknown> | undefined;
  if (!tabs) throw new Error("Tabs component not found in page content");
  return tabs;
}

function getTab(
  tabs: Record<string, unknown>,
  index: number,
): Record<string, unknown> {
  const children = tabs.children as Record<string, unknown>[];
  const tab = children[index];
  if (!tab) throw new Error(`Tab at index ${index} not found`);
  return tab;
}

function getForm(tab: Record<string, unknown>): Record<string, unknown> {
  const content = tab.content as Record<string, unknown>[];
  const form = content[0];
  if (!form) throw new Error("Form not found in tab content");
  return form;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("settingsPage", () => {
  it("returns a valid PageConfig for minimal options", () => {
    const result = settingsPage(minimalOptions);
    expect(() => pageConfigSchema.parse(result)).not.toThrow();
  });

  it("returns a valid PageConfig for full options", () => {
    const result = settingsPage(fullOptions);
    expect(() => pageConfigSchema.parse(result)).not.toThrow();
  });

  it("sets the page title from options", () => {
    const result = settingsPage(fullOptions);
    expect(result.title).toBe("Account Settings");
  });

  it("produces a heading component", () => {
    const result = settingsPage(fullOptions);
    const heading = result.content.find(
      (c) => (c as Record<string, unknown>).type === "heading",
    ) as Record<string, unknown> | undefined;
    expect(heading?.text).toBe("Account Settings");
  });

  it("produces a tabs component", () => {
    const result = settingsPage(fullOptions);
    const tabs = result.content.find(
      (c) => (c as Record<string, unknown>).type === "tabs",
    );
    expect(tabs).toBeDefined();
  });

  it("creates one tab per section", () => {
    const result = settingsPage(fullOptions);
    const tabs = getTabs(result);
    const children = tabs.children as Record<string, unknown>[];
    expect(children).toHaveLength(3);
  });

  it("sets tab labels from section labels", () => {
    const result = settingsPage(fullOptions);
    const tabs = getTabs(result);
    const children = tabs.children as Record<string, unknown>[];
    expect(children.map((c) => c.label)).toEqual([
      "Profile",
      "Password",
      "Notifications",
    ]);
  });

  it("places an AutoForm in each tab's content", () => {
    const result = settingsPage(fullOptions);
    const tabs = getTabs(result);
    const children = tabs.children as Record<string, unknown>[];
    for (const tab of children) {
      const content = tab.content as Record<string, unknown>[];
      expect(content[0]?.type).toBe("form");
    }
  });

  it("sets the form submit endpoint from section submitEndpoint", () => {
    const result = settingsPage(fullOptions);
    const tabs = getTabs(result);
    const form = getForm(getTab(tabs, 0));
    expect(form.submit).toBe("PATCH /api/me/profile");
  });

  it("sets the form data endpoint when dataEndpoint is provided", () => {
    const result = settingsPage(fullOptions);
    const tabs = getTabs(result);
    const form = getForm(getTab(tabs, 0));
    expect(form.data).toBe("GET /api/me/profile");
  });

  it("uses custom submitLabel when provided", () => {
    const result = settingsPage(fullOptions);
    const tabs = getTabs(result);
    const form = getForm(getTab(tabs, 0));
    expect(form.submitLabel).toBe("Update Profile");
  });

  it("defaults submitLabel to 'Save Changes'", () => {
    const result = settingsPage(minimalOptions);
    const tabs = getTabs(result);
    const form = getForm(getTab(tabs, 0));
    expect(form.submitLabel).toBe("Save Changes");
  });

  it("maps toggle fields to checkbox type for AutoForm compatibility", () => {
    const result = settingsPage(fullOptions);
    const tabs = getTabs(result);
    const form = getForm(getTab(tabs, 2));
    const fields = form.fields as Record<string, unknown>[];
    expect(fields.every((f) => f.type === "checkbox")).toBe(true);
  });

  it("uses custom id prefix for tabs id when provided", () => {
    const result = settingsPage(fullOptions);
    const tabs = getTabs(result);
    expect(tabs.id).toBe("account-settings-tabs");
  });

  it("defaults tabs id to slugified title", () => {
    const result = settingsPage({ ...minimalOptions, title: "My Settings" });
    const tabs = getTabs(result);
    expect(tabs.id).toBe("my-settings-tabs");
  });

  it("sets tab icons when provided", () => {
    const result = settingsPage(fullOptions);
    const tabs = getTabs(result);
    const profileTab = getTab(tabs, 0);
    expect(profileTab.icon).toBe("user");
  });

  it("uses HTTP method from section when provided", () => {
    const result = settingsPage(fullOptions);
    const tabs = getTabs(result);
    const form = getForm(getTab(tabs, 1));
    expect(form.method).toBe("POST");
  });

  it("defaults method to PATCH when not specified", () => {
    const result = settingsPage(minimalOptions);
    const tabs = getTabs(result);
    const form = getForm(getTab(tabs, 0));
    expect(form.method).toBe("PATCH");
  });
});
