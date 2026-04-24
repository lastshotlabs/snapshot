import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://snapshot.lastshotlabs.dev",
  integrations: [
    starlight({
      title: "Snapshot Docs",
      description:
        "Source-backed documentation for Snapshot's SDK, manifest UI, SSR, Vite, CLI, and contributor workflows.",
      disable404Route: true,
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/lastshotlabs/snapshot",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Installation", link: "/start-here/installation/" },
            { label: "Quick Start", link: "/start-here/" },
            { label: "Core Concepts", link: "/start-here/core-concepts/" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "Authentication", link: "/guides/authentication/" },
            { label: "Forms and Validation", link: "/guides/forms/" },
            { label: "Data Tables and Lists", link: "/guides/data-tables/" },
            {
              label: "Layout and Navigation",
              link: "/guides/layout-and-navigation/",
            },
            { label: "Overlays and Modals", link: "/guides/overlays/" },
            {
              label: "Theming and Styling",
              link: "/guides/theming-and-styling/",
            },
            { label: "Community and Chat", link: "/guides/community-and-chat/" },
            { label: "Realtime", link: "/guides/realtime/" },
            {
              label: "File Uploads and Media",
              link: "/guides/file-uploads-and-media/",
            },
            {
              label: "Component Overview",
              link: "/build/component-library/",
            },
          ],
        },
        {
          label: "Recipes",
          items: [
            { label: "Login Page", link: "/recipes/login-page/" },
            { label: "Admin Dashboard", link: "/recipes/admin-dashboard/" },
            { label: "Chat Application", link: "/recipes/chat-app/" },
            { label: "Settings Page", link: "/recipes/settings-page/" },
          ],
        },
        {
          label: "Manifest Mode",
          items: [
            {
              label: "Manifest Quick Start",
              link: "/manifest/quick-start/",
            },
            { label: "Manifest Examples", link: "/manifest/examples/" },
            { label: "Presets", link: "/manifest/presets/" },
            {
              label: "Manifest App Patterns",
              link: "/build/manifest-apps/",
            },
            {
              label: "Full App Examples",
              link: "/examples/",
            },
            {
              label: "Styling and Slots",
              link: "/build/styling-and-slots/",
            },
          ],
        },
        {
          label: "Server Integration",
          items: [
            { label: "SSR and RSC", link: "/server/ssr-rsc/" },
            { label: "Vite Plugin", link: "/server/vite/" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "Reference Overview", link: "/reference/" },
            { label: "SDK", link: "/reference/sdk/" },
            { label: "Component Library", link: "/reference/components/" },
            { label: "UI", link: "/reference/ui/" },
            { label: "SSR", link: "/reference/ssr/" },
            { label: "Vite", link: "/reference/vite/" },
            { label: "Manifest", link: "/reference/manifest/" },
            { label: "CLI", link: "/reference/cli/" },
          ],
        },
        {
          label: "Contribute",
          items: [
            { label: "Contributor Flow", link: "/contribute/overview/" },
            { label: "Contributor Testing", link: "/contribute/testing/" },
            { label: "Agent Flow", link: "/contribute/agent-flow/" },
          ],
        },
      ],
    }),
  ],
});
