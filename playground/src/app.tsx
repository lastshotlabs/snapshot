import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider, createStore } from "jotai";
import {
  resolveTokens,
  SnapshotApiContext,
  ToastContainer,
  ConfirmDialog,
} from "@lastshotlabs/snapshot/ui";
import { TokenEditorSidebar } from "./token-editor";
import { ComponentShowcase } from "./showcase";

// Inject initial tokens
const initialCss = resolveTokens({ flavor: "neutral" });
const style = document.createElement("style");
style.id = "snapshot-tokens";
style.textContent = initialCss;
document.head.appendChild(style);

// Create providers once
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 60_000,
    },
  },
});
const jotaiStore = createStore();

// Mock API client matching the interface components expect
const mockApi = {
  get: async (url: string) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 300));

    if (url.includes("/stats/revenue")) {
      return { value: 128450, change: 12.5 };
    }
    if (url.includes("/stats/users")) {
      return { value: 3842, change: -2.1 };
    }
    if (url.includes("/stats/orders")) {
      return { value: 956, change: 8.3 };
    }
    if (url.includes("/stats/conversion")) {
      return { value: 0.034, change: 1.2 };
    }
    if (url.includes("/users")) {
      return [
        {
          id: 1,
          name: "Alice Johnson",
          email: "alice@example.com",
          role: "Admin",
          status: "active",
          joined: "2025-01-15",
        },
        {
          id: 2,
          name: "Bob Smith",
          email: "bob@example.com",
          role: "Editor",
          status: "active",
          joined: "2025-02-20",
        },
        {
          id: 3,
          name: "Carol Davis",
          email: "carol@example.com",
          role: "Viewer",
          status: "inactive",
          joined: "2025-03-10",
        },
        {
          id: 4,
          name: "Dave Wilson",
          email: "dave@example.com",
          role: "Editor",
          status: "active",
          joined: "2025-04-01",
        },
        {
          id: 5,
          name: "Eve Brown",
          email: "eve@example.com",
          role: "Admin",
          status: "active",
          joined: "2025-04-05",
        },
      ];
    }
    if (url.includes("/tasks")) {
      return [
        {
          id: 1,
          title: "Design token system",
          description: "Implement CSS custom properties",
          status: "done",
          assignee: "Alice",
          priority: "high",
        },
        {
          id: 2,
          title: "Build icon renderer",
          description: "Lucide SVG integration",
          status: "done",
          assignee: "Bob",
          priority: "high",
        },
        {
          id: 3,
          title: "Responsive breakpoints",
          description: "Media query generation",
          status: "review",
          assignee: "Carol",
          priority: "medium",
        },
        {
          id: 4,
          title: "Component library",
          description: "30+ enterprise components",
          status: "in-progress",
          assignee: "Dave",
          priority: "high",
        },
        {
          id: 5,
          title: "Playground update",
          description: "Showcase all components",
          status: "in-progress",
          assignee: "Eve",
          priority: "medium",
        },
        {
          id: 6,
          title: "Documentation",
          description: "Update docs with new APIs",
          status: "todo",
          priority: "low",
        },
        {
          id: 7,
          title: "Test coverage",
          description: "Unit + integration tests",
          status: "todo",
          priority: "medium",
        },
      ];
    }
    if (url.includes("/audit-log")) {
      return [
        {
          id: 1,
          user: "Alice",
          action: "updated profile settings",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          details: {
            field: "email",
            old: "old@email.com",
            new: "new@email.com",
          },
        },
        {
          id: 2,
          user: "Bob",
          action: "created new project",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 3,
          user: "Carol",
          action: "deleted document report.pdf",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 4,
          user: "Dave",
          action: "changed role from Editor to Admin",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          details: { role: { old: "Editor", new: "Admin" } },
        },
      ];
    }
    if (url.includes("/notifications")) {
      return [
        {
          id: "n1",
          title: "New comment on your PR",
          message:
            "Alice commented on PR #42: 'Looks great, just one suggestion...'",
          timestamp: new Date(Date.now() - 600000).toISOString(),
          read: false,
          type: "info",
        },
        {
          id: "n2",
          title: "Build succeeded",
          message: "Deploy #241 to production completed successfully.",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          type: "success",
        },
        {
          id: "n3",
          title: "Security alert",
          message: "A new login was detected from an unfamiliar device.",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true,
          type: "warning",
        },
        {
          id: "n4",
          title: "Invitation accepted",
          message: "Bob Smith accepted your team invitation.",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: true,
          type: "info",
        },
        {
          id: "n5",
          title: "Build failed",
          message: "Build #240 failed: TypeScript error in src/index.ts.",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          read: true,
          type: "error",
        },
      ];
    }
    if (url.includes("/messages")) {
      return [
        {
          id: "t1",
          content:
            "<p>Hey, can you review the latest changes to the token system?</p>",
          author: { name: "Alice Johnson", avatar: null },
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "t2",
          content:
            "<p>Sure! I'll take a look this afternoon. Anything specific to focus on?</p>",
          author: { name: "Bob Smith", avatar: null },
          timestamp: new Date(Date.now() - 7000000).toISOString(),
        },
        {
          id: "t3",
          content:
            "<p>Mainly the dark mode color derivation. I refactored how overrides merge with <code>darkColors</code>.</p>",
          author: { name: "Alice Johnson", avatar: null },
          timestamp: new Date(Date.now() - 6800000).toISOString(),
        },
        {
          id: "t4",
          content:
            "<p>Got it. I'll pay extra attention to the foreground pair contrast ratios.</p>",
          author: { name: "Bob Smith", avatar: null },
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
    }
    if (url.includes("/entities") || url.includes("/team-members")) {
      return [
        {
          id: "u1",
          name: "Alice Johnson",
          email: "alice@example.com",
          avatar_url: null,
        },
        {
          id: "u2",
          name: "Bob Smith",
          email: "bob@example.com",
          avatar_url: null,
        },
        {
          id: "u3",
          name: "Carol Davis",
          email: "carol@example.com",
          avatar_url: null,
        },
        {
          id: "u4",
          name: "Dave Wilson",
          email: "dave@example.com",
          avatar_url: null,
        },
        {
          id: "u5",
          name: "Eve Brown",
          email: "eve@example.com",
          avatar_url: null,
        },
      ];
    }
    if (url.includes("/user/")) {
      return {
        id: 1,
        name: "Alice Johnson",
        email: "alice@example.com",
        role: "Admin",
        status: "active",
        joined: "2025-01-15",
        department: "Engineering",
        location: "San Francisco, CA",
        phone: "+1 (555) 123-4567",
        verified: true,
      };
    }
    return {};
  },
  post: async (_url: string, _body: unknown) => {
    await new Promise((r) => setTimeout(r, 500));
    return { success: true };
  },
  put: async (_url: string, _body: unknown) => {
    await new Promise((r) => setTimeout(r, 500));
    return { success: true };
  },
  patch: async (_url: string, _body: unknown) => {
    await new Promise((r) => setTimeout(r, 500));
    return { success: true };
  },
  delete: async (_url: string) => {
    await new Promise((r) => setTimeout(r, 500));
    return { success: true };
  },
};

export function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={jotaiStore}>
        <SnapshotApiContext.Provider value={mockApi as any}>
          <div className="playground">
            <TokenEditorSidebar darkMode={darkMode} />
            <div className="playground__main">
              <header className="playground__header">
                <div className="playground__header-copy">
                  <p className="playground__eyebrow">Snapshot UI audit</p>
                  <h1>Component Playground</h1>
                  <p>
                    Inspect coverage, interaction states, token behavior, and
                    responsive density across the full config-driven surface.
                  </p>
                </div>
                <button
                  className="dark-toggle"
                  aria-pressed={darkMode}
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? "Switch to light" : "Switch to dark"}
                </button>
              </header>
              <ComponentShowcase />
            </div>
            <ToastContainer />
            <ConfirmDialog />
          </div>
        </SnapshotApiContext.Provider>
      </JotaiProvider>
    </QueryClientProvider>
  );
}
