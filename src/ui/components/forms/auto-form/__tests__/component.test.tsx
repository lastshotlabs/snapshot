// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  renderHook,
  render,
  screen,
  act,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { createElement } from "react";
import { Provider } from "jotai/react";
import { SnapshotApiContext } from "../../../../actions/executor";
import {
  ManifestRuntimeProvider,
  RouteRuntimeProvider,
} from "../../../../manifest/runtime";
import {
  PageRegistryContext,
  AppRegistryContext,
} from "../../../../context/providers";
import { AtomRegistryImpl } from "../../../../context/registry";
import { useAutoForm, validateField } from "../hook";
import { AutoForm } from "../component";
import type { FieldConfig, AutoFormConfig } from "../types";
import type { AtomRegistry } from "../../../../context/types";

vi.mock("../../../../manifest/runtime", async () => {
  const actual = await vi.importActual<typeof import("../../../../manifest/runtime")>(
    "../../../../manifest/runtime",
  );
  return {
    ...actual,
    useManifestResourceMountRefetch: () => undefined,
    useManifestResourcePolling: () => undefined,
    useManifestResourceFocusRefetch: () => undefined,
  };
});

afterEach(() => {
  cleanup();
});

// --- Mock API client ---
function createMockApi() {
  return {
    get: vi.fn().mockResolvedValue({ id: 1 }),
    post: vi.fn().mockResolvedValue({ id: 1, email: "test@test.com" }),
    put: vi.fn().mockResolvedValue({ id: 1 }),
    patch: vi.fn().mockResolvedValue({ id: 1 }),
    delete: vi.fn().mockResolvedValue(undefined),
    setStorage: vi.fn(),
  };
}

function createWrapper(options: {
  api?: ReturnType<typeof createMockApi>;
  pageRegistry?: AtomRegistry;
  resources?: Record<
    string,
    { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; endpoint: string }
  >;
  routeRuntime?: {
    currentPath: string;
    currentRoute?: { id: string; path: string } | null;
    params?: Record<string, string>;
    query?: Record<string, string>;
  };
}) {
  const { api, pageRegistry, resources, routeRuntime } = options;
  return function Wrapper({ children }: { children: React.ReactNode }) {
    const content = routeRuntime
      ? createElement(
          RouteRuntimeProvider,
          {
            value: {
              currentPath: routeRuntime.currentPath,
              currentRoute: (routeRuntime.currentRoute ?? null) as never,
              match: {
                route: (routeRuntime.currentRoute ?? null) as never,
                params: routeRuntime.params ?? {},
                parents: [],
                activeRoutes: routeRuntime.currentRoute
                  ? [routeRuntime.currentRoute as never]
                  : [],
              },
              params: routeRuntime.params ?? {},
              query: routeRuntime.query ?? {},
              navigate: vi.fn(),
              isPreloading: false,
            },
            children,
          },
        )
      : children;

    return createElement(
      Provider,
      null,
      createElement(ManifestRuntimeProvider, {
        api: api as unknown as import("../../../../../api/client").ApiClient,
        manifest: {
          raw: { routes: [{ id: "test", path: "/", content: [] }], resources },
          app: {},
          resources,
          routes: [],
          routeMap: {},
          firstRoute: null,
        } as never,
        children: createElement(
          SnapshotApiContext.Provider,
          {
            value:
              api as unknown as import("../../../../../api/client").ApiClient,
          },
          createElement(
            PageRegistryContext.Provider,
            { value: pageRegistry ?? null },
            createElement(
              AppRegistryContext.Provider,
              { value: null },
              content,
            ),
          ),
        ),
      }),
    );
  };
}

// --- validateField unit tests ---

describe("validateField", () => {
  it("returns error for required empty field", () => {
    const field: FieldConfig = { name: "email", type: "email", required: true };
    expect(validateField(field, "")).toBeDefined();
    expect(validateField(field, undefined)).toBeDefined();
    expect(validateField(field, null)).toBeDefined();
  });

  it("returns undefined for required non-empty field", () => {
    const field: FieldConfig = { name: "email", type: "email", required: true };
    expect(validateField(field, "test@test.com")).toBeUndefined();
  });

  it("skips validation for empty optional field", () => {
    const field: FieldConfig = {
      name: "bio",
      type: "textarea",
      validation: { minLength: 10 },
    };
    expect(validateField(field, "")).toBeUndefined();
  });

  it("validates minLength", () => {
    const field: FieldConfig = {
      name: "name",
      type: "text",
      validation: { minLength: 3 },
    };
    expect(validateField(field, "ab")).toBeDefined();
    expect(validateField(field, "abc")).toBeUndefined();
  });

  it("validates maxLength", () => {
    const field: FieldConfig = {
      name: "name",
      type: "text",
      validation: { maxLength: 5 },
    };
    expect(validateField(field, "abcdef")).toBeDefined();
    expect(validateField(field, "abcde")).toBeUndefined();
  });

  it("validates min for numbers", () => {
    const field: FieldConfig = {
      name: "age",
      type: "number",
      validation: { min: 18 },
    };
    expect(validateField(field, 17)).toBeDefined();
    expect(validateField(field, 18)).toBeUndefined();
  });

  it("validates max for numbers", () => {
    const field: FieldConfig = {
      name: "age",
      type: "number",
      validation: { max: 100 },
    };
    expect(validateField(field, 101)).toBeDefined();
    expect(validateField(field, 100)).toBeUndefined();
  });

  it("validates pattern", () => {
    const field: FieldConfig = {
      name: "code",
      type: "text",
      validation: { pattern: "^[A-Z]{3}$" },
    };
    expect(validateField(field, "abc")).toBeDefined();
    expect(validateField(field, "ABC")).toBeUndefined();
  });

  it("uses custom message when provided", () => {
    const field: FieldConfig = {
      name: "code",
      type: "text",
      required: true,
      validation: { message: "Code is required" },
    };
    expect(validateField(field, "")).toBe("Code is required");
  });
});

// --- useAutoForm hook tests ---

describe("useAutoForm", () => {
  const fields: FieldConfig[] = [
    { name: "email", type: "email", required: true },
    { name: "name", type: "text", default: "John" },
    { name: "agree", type: "checkbox" },
  ];

  it("initializes with default values", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useAutoForm(fields, onSubmit));

    expect(result.current.values.email).toBe("");
    expect(result.current.values.name).toBe("John");
    expect(result.current.values.agree).toBe(false);
  });

  it("sets a single value", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useAutoForm(fields, onSubmit));

    act(() => {
      result.current.setValue("email", "test@test.com");
    });

    expect(result.current.values.email).toBe("test@test.com");
  });

  it("sets multiple values", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useAutoForm(fields, onSubmit));

    act(() => {
      result.current.setValues({ email: "a@b.com", name: "Alice" });
    });

    expect(result.current.values.email).toBe("a@b.com");
    expect(result.current.values.name).toBe("Alice");
  });

  it("tracks dirty state", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useAutoForm(fields, onSubmit));

    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.setValue("email", "changed@test.com");
    });

    expect(result.current.isDirty).toBe(true);
  });

  it("validates on touch (blur)", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useAutoForm(fields, onSubmit));

    act(() => {
      result.current.touchField("email");
    });

    expect(result.current.touched.email).toBe(true);
    expect(result.current.errors.email).toBeDefined();
  });

  it("does not call onSubmit when validation fails", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useAutoForm(fields, onSubmit));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    // All fields should be touched
    expect(result.current.touched.email).toBe(true);
  });

  it("calls onSubmit when validation passes", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutoForm(fields, onSubmit));

    act(() => {
      result.current.setValue("email", "test@test.com");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      email: "test@test.com",
      name: "John",
      agree: false,
    });
  });

  it("resets form to initial values", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useAutoForm(fields, onSubmit));

    act(() => {
      result.current.setValue("email", "changed@test.com");
      result.current.touchField("email");
    });

    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.values.email).toBe("");
    expect(result.current.values.name).toBe("John");
    expect(result.current.touched).toEqual({});
    expect(result.current.errors).toEqual({});
    expect(result.current.isDirty).toBe(false);
  });

  it("reports isValid correctly", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useAutoForm(fields, onSubmit));

    // Email is required but empty
    expect(result.current.isValid).toBe(false);

    act(() => {
      result.current.setValue("email", "valid@test.com");
    });

    expect(result.current.isValid).toBe(true);
  });
});

// --- AutoForm component tests ---

describe("AutoForm", () => {
  let mockApi: ReturnType<typeof createMockApi>;
  let pageRegistry: AtomRegistryImpl;

  const baseConfig: AutoFormConfig = {
    type: "form",
    submit: "/api/users",
    fields: [
      { name: "email", type: "email", label: "Email", required: true },
      { name: "name", type: "text", label: "Name" },
    ],
  };

  beforeEach(() => {
    mockApi = createMockApi();
    pageRegistry = new AtomRegistryImpl();
  });

  it("renders fields with labels", () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    render(createElement(AutoForm, { config: baseConfig }), { wrapper });

    expect(screen.getByLabelText(/Email/)).toBeDefined();
    expect(screen.getByLabelText(/Name/)).toBeDefined();
  });

  it("renders submit button with default label", () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    render(createElement(AutoForm, { config: baseConfig }), { wrapper });

    expect(screen.getByText("Submit")).toBeDefined();
  });

  it("renders submit button with custom label", () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    render(
      createElement(AutoForm, {
        config: { ...baseConfig, submitLabel: "Create User" },
      }),
      { wrapper },
    );

    expect(screen.getByText("Create User")).toBeDefined();
  });

  it("renders select field with options", () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const config: AutoFormConfig = {
      type: "form",
      submit: "/api/users",
      fields: [
        {
          name: "role",
          type: "select",
          label: "Role",
          options: [
            { label: "Admin", value: "admin" },
            { label: "User", value: "user" },
          ],
        },
      ],
    };
    render(createElement(AutoForm, { config }), { wrapper });

    expect(screen.getByLabelText("Role")).toBeDefined();
    expect(screen.getByText("Admin")).toBeDefined();
    expect(screen.getByText("User")).toBeDefined();
  });

  it("renders checkbox field", () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const config: AutoFormConfig = {
      type: "form",
      submit: "/api/users",
      fields: [{ name: "agree", type: "checkbox", label: "I agree" }],
    };
    render(createElement(AutoForm, { config }), { wrapper });

    expect(screen.getByLabelText("I agree")).toBeDefined();
  });

  it("renders textarea field", () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const config: AutoFormConfig = {
      type: "form",
      submit: "/api/users",
      fields: [{ name: "bio", type: "textarea", label: "Bio" }],
    };
    render(createElement(AutoForm, { config }), { wrapper });

    expect(screen.getByLabelText("Bio")).toBeDefined();
  });

  it("shows validation error on blur", async () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    render(createElement(AutoForm, { config: baseConfig }), { wrapper });

    const emailInput = screen.getByLabelText(/Email/);

    await act(async () => {
      fireEvent.blur(emailInput);
    });

    expect(screen.getByRole("alert")).toBeDefined();
  });

  it("submits form values to API", async () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    render(createElement(AutoForm, { config: baseConfig }), { wrapper });

    const emailInput = screen.getByLabelText(/Email/);
    const nameInput = screen.getByLabelText(/Name/);

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@test.com" } });
      fireEvent.change(nameInput, { target: { value: "Test User" } });
    });

    const submitButton = screen.getByText("Submit");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockApi.post).toHaveBeenCalledWith("/api/users", {
      email: "test@test.com",
      name: "Test User",
    });
  });

  it("uses PUT method when configured", async () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const config: AutoFormConfig = {
      ...baseConfig,
      method: "PUT",
    };
    render(createElement(AutoForm, { config }), { wrapper });

    const emailInput = screen.getByLabelText(/Email/);
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    });

    const submitButton = screen.getByText("Submit");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockApi.put).toHaveBeenCalled();
  });

  it("uses PATCH method when configured", async () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const config: AutoFormConfig = {
      ...baseConfig,
      method: "PATCH",
    };
    render(createElement(AutoForm, { config }), { wrapper });

    const emailInput = screen.getByLabelText(/Email/);
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    });

    const submitButton = screen.getByText("Submit");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockApi.patch).toHaveBeenCalled();
  });

  it("does not submit when validation fails", async () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    render(createElement(AutoForm, { config: baseConfig }), { wrapper });

    const submitButton = screen.getByText("Submit");
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it("renders nothing for fields: 'auto'", () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const config: AutoFormConfig = {
      type: "form",
      submit: "/api/users",
      fields: "auto",
    };
    render(createElement(AutoForm, { config }), { wrapper });

    // Only the submit button should render
    expect(screen.getByText("Submit")).toBeDefined();
  });

  it("publishes form state when id is set", async () => {
    const config: AutoFormConfig = {
      ...baseConfig,
      id: "user-form",
    };
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    render(createElement(AutoForm, { config }), { wrapper });

    // The component should have registered and published state
    const atom = pageRegistry.get("user-form");
    expect(atom).toBeDefined();

    const published = pageRegistry.store.get(atom!);
    expect(published).toBeDefined();
    expect(typeof published).toBe("object");
    if (published && typeof published === "object") {
      const state = published as Record<string, unknown>;
      expect(state).toHaveProperty("values");
      expect(state).toHaveProperty("isDirty");
      expect(state).toHaveProperty("isValid");
      expect(state).toHaveProperty("errors");
    }
  });

  it("sets data-snapshot-component attribute", () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const { container } = render(
      createElement(AutoForm, { config: baseConfig }),
      { wrapper },
    );

    const form = container.querySelector("form");
    expect(form?.getAttribute("data-snapshot-component")).toBe("form");
  });

  it("renders number input", () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const config: AutoFormConfig = {
      type: "form",
      submit: "/api/items",
      fields: [{ name: "quantity", type: "number", label: "Quantity" }],
    };
    render(createElement(AutoForm, { config }), { wrapper });

    const input = screen.getByLabelText("Quantity");
    expect(input.getAttribute("type")).toBe("number");
  });

  it("renders date input", () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const config: AutoFormConfig = {
      type: "form",
      submit: "/api/events",
      fields: [{ name: "date", type: "date", label: "Date" }],
    };
    render(createElement(AutoForm, { config }), { wrapper });

    const input = screen.getByLabelText("Date");
    expect(input.getAttribute("type")).toBe("date");
  });

  it("renders password input", () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const config: AutoFormConfig = {
      type: "form",
      submit: "/api/auth",
      fields: [{ name: "password", type: "password", label: "Password" }],
    };
    render(createElement(AutoForm, { config }), { wrapper });

    const input = screen.getByLabelText("Password");
    expect(input.getAttribute("type")).toBe("password");
  });

  it("uses field name as label fallback", () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const config: AutoFormConfig = {
      type: "form",
      submit: "/api/users",
      fields: [{ name: "username", type: "text" }],
    };
    render(createElement(AutoForm, { config }), { wrapper });

    expect(screen.getByLabelText("username")).toBeDefined();
  });

  it("submits through a named resource target", async () => {
    const wrapper = createWrapper({
      api: mockApi,
      pageRegistry,
      resources: {
        "users.update": {
          method: "PUT",
          endpoint: "/api/users/1",
        },
      },
    });
    const config: AutoFormConfig = {
      type: "form",
      submit: { resource: "users.update" },
      fields: [
        { name: "email", type: "email", label: "Email", required: true },
      ],
    };
    render(createElement(AutoForm, { config }), { wrapper });

    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Email/), {
        target: { value: "ada@example.com" },
      });
      fireEvent.click(screen.getByText("Submit"));
    });

    expect(mockApi.put).toHaveBeenCalledWith("/api/users/1", {
      email: "ada@example.com",
    });
  });

  it("interpolates submit path params from prefetched row values", async () => {
    const selectedAtom = pageRegistry.register("transactions-table");
    pageRegistry.store.set(selectedAtom, {
      selected: {
        id: "txn-123",
        amount: 25,
      },
    });

    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const config: AutoFormConfig = {
      type: "form",
      data: { from: "transactions-table.selected" },
      submit: "/api/transactions/{id}",
      method: "PUT",
      fields: [
        { name: "id", type: "text", label: "Transaction ID" },
        { name: "amount", type: "number", label: "Amount" },
      ],
    };
    render(createElement(AutoForm, { config }), { wrapper });

    expect(await screen.findByDisplayValue("txn-123")).toBeDefined();

    await act(async () => {
      fireEvent.click(screen.getByText("Submit"));
    });

    expect(mockApi.put).toHaveBeenCalledWith("/api/transactions/txn-123", {
      id: "txn-123",
      amount: 25,
    });
  });

  it("loads initial values from a named resource", async () => {
    mockApi.get.mockResolvedValueOnce({ email: "prefill@example.com" });
    const wrapper = createWrapper({
      api: mockApi,
      pageRegistry,
      resources: {
        "users.current": {
          method: "GET",
          endpoint: "/api/users/current",
        },
      },
    });
    const config: AutoFormConfig = {
      type: "form",
      data: { resource: "users.current" },
      submit: "/api/users",
      fields: [{ name: "email", type: "email", label: "Email" }],
    };
    render(createElement(AutoForm, { config }), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe(
      "prefill@example.com",
    );
  });

  it("loads select options from a named resource", async () => {
    mockApi.get.mockResolvedValueOnce([
      { id: "admin", name: "Admin" },
      { id: "user", name: "User" },
    ]);
    const wrapper = createWrapper({
      api: mockApi,
      pageRegistry,
      resources: {
        roles: {
          method: "GET",
          endpoint: "/api/roles",
        },
      },
    });
    const config: AutoFormConfig = {
      type: "form",
      submit: "/api/users",
      fields: [
        {
          name: "role",
          type: "select",
          label: "Role",
          options: { resource: "roles" },
        },
      ],
    };
    render(createElement(AutoForm, { config }), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Admin")).toBeDefined();
    expect(screen.getByText("User")).toBeDefined();
  });

  it("supports custom select value and label fields", async () => {
    mockApi.get.mockResolvedValueOnce([
      { code: "a", displayName: "Alpha" },
      { code: "b", displayName: "Beta" },
    ]);
    const wrapper = createWrapper({
      api: mockApi,
      pageRegistry,
      resources: {
        roles: {
          method: "GET",
          endpoint: "/api/roles",
        },
      },
    });
    const config: AutoFormConfig = {
      type: "form",
      submit: "/api/users",
      fields: [
        {
          name: "role",
          type: "select",
          label: "Role",
          options: { resource: "roles" },
          labelField: "displayName",
          valueField: "code",
        },
      ],
    };
    render(createElement(AutoForm, { config }), { wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText("Alpha")).toBeDefined();
    expect(screen.getByText("Beta")).toBeDefined();
  });

  it("auto-submits once when autoSubmitWhen is true for pristine default values", async () => {
    const wrapper = createWrapper({
      api: mockApi,
      pageRegistry,
      routeRuntime: {
        currentPath: "/verify-email",
        currentRoute: { id: "verify-email", path: "/verify-email" },
        query: { token: "verify-123" },
      },
    });
    const config: AutoFormConfig = {
      type: "form",
      submit: "/api/verify-email",
      autoSubmit: true,
      autoSubmitWhen: "defined(route.query.token)",
      autoSubmitDelay: 0,
      fields: [
        {
          name: "token",
          type: "text",
          default: "{route.query.token}",
          visible: false,
        },
      ],
    };

    render(createElement(AutoForm, { config }), { wrapper });

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith("/api/verify-email", {
        token: "verify-123",
      });
    });

    expect(mockApi.post).toHaveBeenCalledTimes(1);
  });

  it("applies canonical section and field group slots", () => {
    const wrapper = createWrapper({ api: mockApi, pageRegistry });
    const config: AutoFormConfig = {
      ...baseConfig,
      id: "user-form",
      fields: [],
      sections: [
        {
          title: "Profile",
          description: "Manage your account",
          collapsible: true,
          fields: [
            {
              name: "password",
              type: "password",
              label: "Password",
              inlineAction: {
                label: "Forgot password?",
                to: "/forgot-password",
              },
              slots: {
                field: { className: "field-slot" },
                inputWrapper: { className: "input-wrapper-slot" },
                input: { className: "input-slot" },
              },
            },
            {
              name: "role",
              type: "radio-group",
              label: "Role",
              options: [
                { label: "Admin", value: "admin" },
                { label: "User", value: "user" },
              ],
            },
          ],
          slots: {
            section: { className: "section-slot" },
            sectionHeader: { className: "section-header-slot" },
            sectionToggle: { className: "section-toggle-slot" },
            sectionTitle: { className: "section-title-slot" },
            sectionDescription: { className: "section-description-slot" },
          },
        },
      ],
      slots: {
        root: { className: "form-root-slot" },
        inlineAction: { className: "inline-action-slot" },
        passwordToggle: { className: "password-toggle-slot" },
        options: { className: "options-slot" },
        option: { className: "option-slot" },
        optionLabel: { className: "option-label-slot" },
        submitButton: { className: "submit-slot" },
      },
    };

    const { container } = render(createElement(AutoForm, { config }), { wrapper });

    expect(container.querySelector('[data-snapshot-id="user-form-root"]')?.className).toContain(
      "form-root-slot",
    );
    expect(container.querySelector('[data-snapshot-id="user-form-section-Profile"]')?.className).toContain(
      "section-slot",
    );
    expect(container.querySelector('[data-snapshot-id="user-form-section-header-Profile"]')?.className).toContain(
      "section-header-slot",
    );
    expect(container.querySelector('[data-snapshot-id="user-form-section-toggle-Profile"]')?.className).toContain(
      "section-toggle-slot",
    );
    expect(container.querySelector('[data-snapshot-id="user-form-section-title-Profile"]')?.className).toContain(
      "section-title-slot",
    );
    expect(container.querySelector('[data-snapshot-id="user-form-section-description-Profile"]')?.className).toContain(
      "section-description-slot",
    );
    expect(container.querySelector('[data-snapshot-id="user-form-field-password"]')?.className).toContain(
      "field-slot",
    );
    expect(container.querySelector('[data-snapshot-id="user-form-inputWrapper-password"]')?.className).toContain(
      "input-wrapper-slot",
    );
    expect(screen.getByLabelText("Password").className).toContain("input-slot");
    expect(screen.getByText("Forgot password?").closest("button")?.className).toContain(
      "inline-action-slot",
    );
    expect(screen.getByLabelText("Show password").className).toContain(
      "password-toggle-slot",
    );
    expect(container.querySelector('[data-snapshot-id="user-form-options-role"]')?.className).toContain(
      "options-slot",
    );
    expect(container.querySelector('[data-snapshot-id="user-form-option-role-admin"]')?.className).toContain(
      "option-slot",
    );
    expect(container.querySelector('[data-snapshot-id="user-form-optionLabel-role-admin"]')?.className).toContain(
      "option-label-slot",
    );
    expect(screen.getByText("Submit").closest("button")?.className).toContain(
      "submit-slot",
    );
  });
});
