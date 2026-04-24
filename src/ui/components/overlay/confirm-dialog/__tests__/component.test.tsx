// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialogComponent } from "../component";

const refValues: Record<string, unknown> = {
  "state.dialog.confirm": "Delete forever {route.params.id}",
  "state.dialog.cancel": "Keep it for {route.path}",
};

function resolveRefs<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((entry) => resolveRefs(entry)) as T;
  }

  if (value && typeof value === "object") {
    if ("from" in (value as Record<string, unknown>)) {
      return refValues[(value as unknown as { from: string }).from] as T;
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        resolveRefs(entry),
      ]),
    ) as T;
  }

  return value;
}

vi.mock("../../../../context/hooks", async () => {
  const actual = await vi.importActual("../../../../context/hooks");

  return {
    ...actual,
    useSubscribe: (value: unknown) =>
      value && typeof value === "object" && "from" in (value as Record<string, unknown>)
        ? refValues[(value as { from: string }).from]
        : value,
    useResolveFrom: resolveRefs,
  };
});

vi.mock("../../../../manifest/runtime", async () => {
  const actual = await vi.importActual("../../../../manifest/runtime");

  return {
    ...actual,
    useManifestRuntime: () => ({
      raw: { routes: [] },
      app: {},
      auth: {},
    }),
    useRouteRuntime: () => ({
      currentRoute: { id: "dialog" },
      currentPath: "/dialog/delete",
      params: { id: "delete" },
      query: {},
    }),
  };
});

vi.mock("../../../../actions/executor", () => ({
  useActionExecutor: () => vi.fn(),
}));

vi.mock("../../../../actions/modal-manager", () => ({
  useModalManager: () => ({
    isOpen: () => true,
    open: vi.fn(),
    close: vi.fn(),
    getPayload: () => undefined,
    getResult: () => undefined,
  }),
}));

describe("ConfirmDialogComponent", () => {
  it("renders confirm dialog with title, description, and button labels", () => {
    render(
      <ConfirmDialogComponent
        config={{
          type: "confirm-dialog",
          id: "delete-confirmation",
          className: "confirm-root-class",
          style: { opacity: 0.85 },
          title: "Delete item",
          description: "This action cannot be undone.",
          confirmLabel: "Delete",
          cancelLabel: "Keep",
          confirmAction: { type: "close-modal", modal: "delete-confirmation" },
        }}
      />,
    );

    expect(screen.getByText("Delete item")).toBeDefined();
    expect(screen.getByText("This action cannot be undone.")).toBeDefined();
    expect(screen.getByText("Delete")).toBeDefined();
    expect(screen.getByText("Keep")).toBeDefined();
  });

  it("resolves ref-backed footer labels before rendering", () => {
    render(
      <ConfirmDialogComponent
        config={{
          type: "confirm-dialog",
          title: "Delete item",
          confirmLabel: { from: "state.dialog.confirm" } as never,
          cancelLabel: { from: "state.dialog.cancel" } as never,
        }}
      />,
    );

    expect(screen.getByText("Delete forever delete")).toBeDefined();
    expect(screen.getByText("Keep it for /dialog/delete")).toBeDefined();
  });
});
