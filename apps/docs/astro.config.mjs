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
          label: "Start Here",
          items: [
            { label: "Choose Your Path", link: "/start-here/" },
            { label: "Capabilities", link: "/start-here/capabilities/" },
          ],
        },
        {
          label: "Build",
          items: [
            { label: "Manifest Apps", link: "/build/manifest-apps/" },
            { label: "Styling and Slots", link: "/build/styling-and-slots/" },
            { label: "SDK Apps", link: "/build/sdk-apps/" },
          ],
        },
        {
          label: "Integrate",
          items: [
            { label: "SSR and RSC", link: "/integrate/ssr-rsc/" },
            {
              label: "Community and Realtime",
              link: "/integrate/community-and-realtime/",
            },
            { label: "Content and Media", link: "/integrate/content-and-media/" },
          ],
        },
        {
          label: "Examples",
          items: [{ label: "Examples and Showcase", link: "/examples/" }],
        },
        {
          label: "Reference",
          items: [
            { label: "Reference Overview", link: "/reference/" },
            { label: "SDK", link: "/reference/sdk/" },
            { label: "UI", link: "/reference/ui/" },
            { label: "SSR", link: "/reference/ssr/" },
            { label: "Vite", link: "/reference/vite/" },
            { label: "Manifest", link: "/reference/manifest/" },
            { label: "Components", link: "/reference/components/" },
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
