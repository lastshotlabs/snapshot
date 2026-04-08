/**
 * Pure template function for generating a starter snapshot.manifest.json.
 *
 * Returns a JSON string — no filesystem access, no side effects.
 */

/** Options controlling what the generated manifest includes. */
export interface ManifestInitOptions {
  /** Flavor preset name (e.g. "neutral", "violet"). */
  flavor: string;
  /** Whether to include auth screen configuration. */
  includeAuth: boolean;
  /** Whether to include sidebar navigation items. */
  includeSidebar: boolean;
}

/**
 * Generate a snapshot.manifest.json string from the given options.
 *
 * @param options - Configuration controlling manifest content
 * @returns A formatted JSON string ready to write to disk
 */
export function generateManifestJson(options: ManifestInitOptions): string {
  const manifest: Record<string, unknown> = {
    $schema: "./node_modules/@lastshotlabs/snapshot/manifest-schema.json",
    app: {
      title: "Snapshot App",
      shell: options.includeSidebar ? "sidebar" : "minimal",
      home: "/dashboard",
    },
    theme: {
      flavor: options.flavor,
    },
  };

  if (options.includeSidebar) {
    manifest.navigation = {
      mode: "sidebar",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: "layout-dashboard" },
        { label: "Settings", path: "/settings", icon: "settings" },
      ],
    };
  }

  if (options.includeAuth) {
    manifest.auth = {
      screens: ["login", "register"],
      branding: {
        title: "Welcome",
        description: "Sign in to continue",
      },
    };
  }

  manifest.routes = [
    {
      id: "dashboard",
      path: "/dashboard",
      layout: options.includeSidebar ? "sidebar" : "minimal",
      title: "Dashboard",
      content: [
        {
          type: "heading",
          text: "Dashboard",
          level: 1,
        },
        {
          type: "row",
          gap: "md",
          children: [
            {
              type: "heading",
              text: "Total Users: 0",
              level: 3,
            },
            {
              type: "heading",
              text: "Active Sessions: 0",
              level: 3,
            },
            {
              type: "heading",
              text: "Revenue: $0",
              level: 3,
            },
          ],
        },
      ],
    },
    {
      id: "settings",
      path: "/settings",
      layout: options.includeSidebar ? "sidebar" : "minimal",
      title: "Settings",
      content: [
        {
          type: "heading",
          text: "Settings",
          level: 1,
        },
      ],
    },
  ];

  return JSON.stringify(manifest, null, 2) + "\n";
}
