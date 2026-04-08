import type { ScaffoldConfig } from "../types";

const BASE_COLOR: Record<ScaffoldConfig["theme"], string> = {
  default: "neutral",
  dark: "neutral",
  minimal: "slate",
  vibrant: "violet",
};

export function generateComponentsJson(config: ScaffoldConfig): string {
  const json = {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "default",
    rsc: false,
    tsx: true,
    tailwind: {
      config: "",
      css: "src/styles/globals.css",
      baseColor: BASE_COLOR[config.theme],
      cssVariables: true,
      prefix: "",
    },
    aliases: {
      components: "@/components",
      utils: "@/lib/utils",
      ui: "@/components/ui",
      lib: "@/lib",
      hooks: "@/hooks",
    },
    iconLibrary: "lucide",
  };
  return JSON.stringify(json, null, 2) + "\n";
}
