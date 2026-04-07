/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AtomRegistryImpl } from "../../../../context/registry";
import {
  PageRegistryContext,
  AppRegistryContext,
} from "../../../../context/providers";
import { SnapshotApiContext } from "../../../../actions/executor";
import { DetailCard } from "../component";
import type { DetailCardConfig } from "../schema";

// Mock action executor
const mockExecute = vi.fn();
vi.mock("../../../../actions/executor", async () => {
  const actual = await vi.importActual("../../../../actions/executor");
  return {
    ...actual,
    useActionExecutor: () => mockExecute,
  };
});

/**
 * Test wrapper providing all required contexts.
 */
function createTestWrapper(
  pageRegistry: AtomRegistryImpl,
  apiClient?: unknown,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AppRegistryContext.Provider value={null}>
          <PageRegistryContext.Provider value={pageRegistry}>
            <SnapshotApiContext.Provider value={apiClient as never}>
              {children}
            </SnapshotApiContext.Provider>
          </PageRegistryContext.Provider>
        </AppRegistryContext.Provider>
      </QueryClientProvider>
    );
  };
}

const baseConfig: DetailCardConfig = {
  type: "detail-card",
  data: { from: "source" },
  fields: "auto",
};

describe("DetailCard", () => {
  let registry: AtomRegistryImpl;

  beforeEach(() => {
    registry = new AtomRegistryImpl();
    mockExecute.mockReset();
  });

  it("renders empty state when data is null", () => {
    const Wrapper = createTestWrapper(registry);
    render(
      <Wrapper>
        <DetailCard config={baseConfig} />
      </Wrapper>,
    );

    expect(screen.getByTestId("detail-card-empty")).toBeTruthy();
    expect(screen.getByText("Select an item to view details")).toBeTruthy();
  });

  it("renders custom empty state message", () => {
    const Wrapper = createTestWrapper(registry);
    render(
      <Wrapper>
        <DetailCard
          config={{ ...baseConfig, emptyState: "Pick a user first" }}
        />
      </Wrapper>,
    );

    expect(screen.getByText("Pick a user first")).toBeTruthy();
  });

  it("renders fields from FromRef data with auto fields", () => {
    const Wrapper = createTestWrapper(registry);
    const atom = registry.register("source");
    registry.store.set(atom, {
      name: "Alice",
      email: "alice@example.com",
      active: true,
    });

    render(
      <Wrapper>
        <DetailCard config={baseConfig} />
      </Wrapper>,
    );

    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Email")).toBeTruthy();
    expect(screen.getByText("alice@example.com")).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.getByText("Yes")).toBeTruthy();
  });

  it("renders explicit field configuration", () => {
    const Wrapper = createTestWrapper(registry);
    const atom = registry.register("source");
    registry.store.set(atom, {
      name: "Alice",
      email: "alice@example.com",
      role: "admin",
      age: 30,
    });

    render(
      <Wrapper>
        <DetailCard
          config={{
            ...baseConfig,
            fields: [
              { field: "name", label: "Full Name" },
              { field: "email", format: "email" },
              { field: "role", format: "badge" },
            ],
          }}
        />
      </Wrapper>,
    );

    expect(screen.getByText("Full Name")).toBeTruthy();
    expect(screen.getByText("Alice")).toBeTruthy();
    // Email should be rendered as a mailto link
    const emailLink = screen.getByText("alice@example.com");
    expect(emailLink.tagName).toBe("A");
    expect(emailLink.getAttribute("href")).toBe("mailto:alice@example.com");
    // Role should be rendered as a badge
    expect(screen.getByText("admin")).toBeTruthy();
    // Age should NOT appear since it's not in the field list
    expect(screen.queryByText("Age")).toBeNull();
  });

  it("renders a title when provided", () => {
    const Wrapper = createTestWrapper(registry);
    const atom = registry.register("source");
    registry.store.set(atom, { name: "Alice" });

    render(
      <Wrapper>
        <DetailCard config={{ ...baseConfig, title: "User Details" }} />
      </Wrapper>,
    );

    expect(screen.getByText("User Details")).toBeTruthy();
  });

  it("renders action buttons", () => {
    const Wrapper = createTestWrapper(registry);
    const atom = registry.register("source");
    registry.store.set(atom, { name: "Alice" });

    const config: DetailCardConfig = {
      ...baseConfig,
      title: "User",
      actions: [
        {
          label: "Edit",
          action: { type: "open-modal", modal: "edit-user" },
        },
        {
          label: "Delete",
          action: { type: "confirm", message: "Are you sure?" },
        },
      ],
    };

    render(
      <Wrapper>
        <DetailCard config={config} />
      </Wrapper>,
    );

    expect(screen.getByText("Edit")).toBeTruthy();
    expect(screen.getByText("Delete")).toBeTruthy();
  });

  it("dispatches actions when action buttons are clicked", () => {
    const Wrapper = createTestWrapper(registry);
    const atom = registry.register("source");
    registry.store.set(atom, { name: "Alice" });

    const actionDef = { type: "open-modal" as const, modal: "edit-user" };
    const config: DetailCardConfig = {
      ...baseConfig,
      actions: [{ label: "Edit", action: actionDef }],
    };

    render(
      <Wrapper>
        <DetailCard config={config} />
      </Wrapper>,
    );

    act(() => {
      screen.getByText("Edit").click();
    });

    expect(mockExecute).toHaveBeenCalledWith(actionDef, { name: "Alice" });
  });

  it("renders null values as dashes", () => {
    const Wrapper = createTestWrapper(registry);
    const atom = registry.register("source");
    registry.store.set(atom, { name: "Alice", phone: null });

    render(
      <Wrapper>
        <DetailCard config={baseConfig} />
      </Wrapper>,
    );

    expect(screen.getByText("--")).toBeTruthy();
  });

  it("renders boolean values as Yes/No", () => {
    const Wrapper = createTestWrapper(registry);
    const atom = registry.register("source");
    registry.store.set(atom, { active: true, verified: false });

    render(
      <Wrapper>
        <DetailCard config={baseConfig} />
      </Wrapper>,
    );

    expect(screen.getByText("Yes")).toBeTruthy();
    expect(screen.getByText("No")).toBeTruthy();
  });

  it("renders copyable fields with a copy button", () => {
    const Wrapper = createTestWrapper(registry);
    const atom = registry.register("source");
    registry.store.set(atom, { email: "alice@example.com" });

    render(
      <Wrapper>
        <DetailCard
          config={{
            ...baseConfig,
            fields: [{ field: "email", format: "email", copyable: true }],
          }}
        />
      </Wrapper>,
    );

    expect(screen.getByTestId("copy-email")).toBeTruthy();
  });

  it("renders number format with locale formatting", () => {
    const Wrapper = createTestWrapper(registry);
    const atom = registry.register("source");
    registry.store.set(atom, { count: 1234567 });

    render(
      <Wrapper>
        <DetailCard
          config={{
            ...baseConfig,
            fields: [{ field: "count", format: "number" }],
          }}
        />
      </Wrapper>,
    );

    // Locale-formatted number
    expect(screen.getByText("1,234,567")).toBeTruthy();
  });

  it("renders url format as a link", () => {
    const Wrapper = createTestWrapper(registry);
    const atom = registry.register("source");
    registry.store.set(atom, { website: "https://example.com" });

    render(
      <Wrapper>
        <DetailCard
          config={{
            ...baseConfig,
            fields: [{ field: "website", format: "url" }],
          }}
        />
      </Wrapper>,
    );

    const link = screen.getByText("https://example.com");
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("https://example.com");
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("renders image format as an img tag", () => {
    const Wrapper = createTestWrapper(registry);
    const atom = registry.register("source");
    registry.store.set(atom, { avatar: "https://example.com/avatar.png" });

    render(
      <Wrapper>
        <DetailCard
          config={{
            ...baseConfig,
            fields: [{ field: "avatar", format: "image" }],
          }}
        />
      </Wrapper>,
    );

    const img = document.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("src")).toBe("https://example.com/avatar.png");
  });

  it("renders list format as comma-separated values", () => {
    const Wrapper = createTestWrapper(registry);
    const atom = registry.register("source");
    registry.store.set(atom, { tags: ["react", "typescript", "node"] });

    render(
      <Wrapper>
        <DetailCard
          config={{
            ...baseConfig,
            fields: [{ field: "tags", format: "list" }],
          }}
        />
      </Wrapper>,
    );

    expect(screen.getByText("react, typescript, node")).toBeTruthy();
  });

  it("publishes data when id is set", () => {
    const Wrapper = createTestWrapper(registry);
    const sourceAtom = registry.register("source");
    registry.store.set(sourceAtom, { name: "Alice", id: 1 });

    render(
      <Wrapper>
        <DetailCard
          config={{
            ...baseConfig,
            id: "user-detail",
          }}
        />
      </Wrapper>,
    );

    // The component should have published the data
    const publishedAtom = registry.get("user-detail");
    expect(publishedAtom).toBeTruthy();
    expect(registry.store.get(publishedAtom!)).toEqual({
      name: "Alice",
      id: 1,
    });
  });

  it("applies data-snapshot-component attribute", () => {
    const Wrapper = createTestWrapper(registry);
    render(
      <Wrapper>
        <DetailCard config={baseConfig} />
      </Wrapper>,
    );

    const el = document.querySelector(
      '[data-snapshot-component="detail-card"]',
    );
    expect(el).toBeTruthy();
  });

  it("renders with endpoint data via query", async () => {
    const mockApi = {
      get: vi.fn().mockResolvedValue({ name: "Bob", role: "user" }),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    const Wrapper = createTestWrapper(registry, mockApi);

    render(
      <Wrapper>
        <DetailCard
          config={{
            type: "detail-card",
            data: "GET /api/users/1",
            fields: "auto",
          }}
        />
      </Wrapper>,
    );

    // Should show loading initially
    expect(screen.getByTestId("detail-card-skeleton")).toBeTruthy();

    // Wait for data to load
    await vi.waitFor(() => {
      expect(screen.getByText("Bob")).toBeTruthy();
    });

    expect(mockApi.get).toHaveBeenCalledWith("/api/users/1");
  });
});
