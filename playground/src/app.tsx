import React, { useState, useEffect, useCallback } from "react";
import {
  resolveTokens,
  useTokenEditor,
  getAllFlavors,
  PageContextProvider,
  AppContextProvider,
  usePublish,
  SnapshotApiContext,
  ComponentRenderer,
} from "@lastshotlabs/snapshot/ui";
import { TokenEditorSidebar } from "./token-editor";
import { ComponentShowcase } from "./showcase";

// Inject initial tokens
const initialCss = resolveTokens({ flavor: "neutral" });
const style = document.createElement("style");
style.id = "snapshot-tokens";
style.textContent = initialCss;
document.head.appendChild(style);

// Register built-in components by importing the side-effect module
import "@lastshotlabs/snapshot/ui";

// Mock API client for the playground
const mockApi = {
  get: async (url: string) => {
    // Simulate API responses for demo components
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
        { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "active", joined: "2025-01-15" },
        { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Editor", status: "active", joined: "2025-02-20" },
        { id: 3, name: "Carol Davis", email: "carol@example.com", role: "Viewer", status: "inactive", joined: "2025-03-10" },
        { id: 4, name: "Dave Wilson", email: "dave@example.com", role: "Editor", status: "active", joined: "2025-04-01" },
        { id: 5, name: "Eve Brown", email: "eve@example.com", role: "Admin", status: "active", joined: "2025-04-05" },
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
  post: async () => ({ success: true }),
  put: async () => ({ success: true }),
  patch: async () => ({ success: true }),
  delete: async () => ({ success: true }),
};

export function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <SnapshotApiContext.Provider value={mockApi as any}>
      <div className="playground">
        <TokenEditorSidebar />
        <div className="playground__main">
          <div className="playground__header">
            <h1>Snapshot Playground</h1>
            <button
              className="dark-toggle"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
          <PageContextProvider>
            <ComponentShowcase />
          </PageContextProvider>
        </div>
      </div>
    </SnapshotApiContext.Provider>
  );
}
