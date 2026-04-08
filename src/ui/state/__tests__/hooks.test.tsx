/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  AppStateProvider,
  RouteStateProvider,
  useResetStateValue,
  useSetStateValue,
  useStateValue,
} from "../index";
import type { ApiClient } from "../../../api/client";

function StateProbe() {
  const session = useStateValue("session");
  const filter = useStateValue("filter");
  const user = useStateValue("user");
  const setSession = useSetStateValue("session");
  const setFilter = useSetStateValue("filter");
  const resetFilter = useResetStateValue("filter");

  return (
    <div>
      <div data-testid="session">{String(session)}</div>
      <div data-testid="filter">{String(filter)}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : ""}</div>
      <button onClick={() => setSession("Grace")}>set-session</button>
      <button onClick={() => setFilter("open")}>set-filter</button>
      <button onClick={() => resetFilter()}>reset-filter</button>
    </div>
  );
}

function createMockApi(responses: Record<string, unknown> = {}): ApiClient {
  return {
    get: vi.fn(async (endpoint: string) => responses[endpoint]),
    post: vi.fn(async (endpoint: string) => responses[endpoint]),
    put: vi.fn(async (endpoint: string) => responses[endpoint]),
    patch: vi.fn(async (endpoint: string) => responses[endpoint]),
    delete: vi.fn(async (endpoint: string) => responses[endpoint]),
  } as unknown as ApiClient;
}

function StateHarness({
  routeKey,
  api,
}: {
  routeKey: string;
  api?: ApiClient;
}) {
  return (
    <AppStateProvider state={{ session: { default: "Ada" } }} api={api}>
      <RouteStateProvider
        key={routeKey}
        state={{
          filter: { scope: "route", default: "all" },
          user: { scope: "route", data: { resource: "current-user" } },
        }}
        resources={{
          "current-user": {
            method: "GET",
            endpoint: "/api/me",
          },
        }}
        api={api}
      >
        <StateProbe />
      </RouteStateProvider>
    </AppStateProvider>
  );
}

describe("state runtime", () => {
  it("keeps app scope values across route remounts while resetting route scope", () => {
    const { rerender } = render(<StateHarness routeKey="users" />);

    expect(screen.getByTestId("session").textContent).toBe("Ada");
    expect(screen.getByTestId("filter").textContent).toBe("all");

    fireEvent.click(screen.getByText("set-session"));
    fireEvent.click(screen.getByText("set-filter"));

    expect(screen.getByTestId("session").textContent).toBe("Grace");
    expect(screen.getByTestId("filter").textContent).toBe("open");

    rerender(<StateHarness routeKey="settings" />);

    expect(screen.getByTestId("session").textContent).toBe("Grace");
    expect(screen.getByTestId("filter").textContent).toBe("all");
  });

  it("resets a named state value back to its default", () => {
    render(<StateHarness routeKey="users" />);

    fireEvent.click(screen.getByText("set-filter"));
    expect(screen.getByTestId("filter").textContent).toBe("open");

    fireEvent.click(screen.getByText("reset-filter"));
    expect(screen.getByTestId("filter").textContent).toBe("all");
  });

  it("loads route-scoped state from a named resource", async () => {
    const api = createMockApi({
      "/api/me": { id: 1, name: "Ada" },
    });

    render(<StateHarness routeKey="users" api={api} />);

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toContain('"name":"Ada"');
    });
  });
});
