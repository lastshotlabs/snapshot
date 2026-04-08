import type { ScaffoldConfig } from "../types";

// shadcn v4 neutral palette (default + dark themes)
const NEUTRAL_LIGHT = `
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.145 0 0);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.145 0 0);
    --primary: oklch(0.205 0 0);
    --primary-foreground: oklch(0.985 0 0);
    --secondary: oklch(0.97 0 0);
    --secondary-foreground: oklch(0.205 0 0);
    --muted: oklch(0.97 0 0);
    --muted-foreground: oklch(0.556 0 0);
    --accent: oklch(0.97 0 0);
    --accent-foreground: oklch(0.205 0 0);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.922 0 0);
    --input: oklch(0.922 0 0);
    --ring: oklch(0.708 0 0);
    --radius: 0.625rem;
    --chart-1: oklch(0.646 0.222 41.116);
    --chart-2: oklch(0.6 0.118 184.704);
    --chart-3: oklch(0.398 0.07 227.392);
    --chart-4: oklch(0.828 0.189 84.429);
    --chart-5: oklch(0.769 0.188 70.08);`;

const NEUTRAL_DARK = `
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
    --card: oklch(0.205 0 0);
    --card-foreground: oklch(0.985 0 0);
    --popover: oklch(0.205 0 0);
    --popover-foreground: oklch(0.985 0 0);
    --primary: oklch(0.922 0 0);
    --primary-foreground: oklch(0.205 0 0);
    --secondary: oklch(0.269 0 0);
    --secondary-foreground: oklch(0.985 0 0);
    --muted: oklch(0.269 0 0);
    --muted-foreground: oklch(0.708 0 0);
    --accent: oklch(0.269 0 0);
    --accent-foreground: oklch(0.985 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 15%);
    --ring: oklch(0.556 0 0);
    --chart-1: oklch(0.488 0.243 264.376);
    --chart-2: oklch(0.696 0.17 162.48);
    --chart-3: oklch(0.769 0.188 70.08);
    --chart-4: oklch(0.627 0.265 303.9);
    --chart-5: oklch(0.645 0.246 16.439);`;

// Slate/muted palette (minimal theme)
const MINIMAL_LIGHT = `
    --background: oklch(0.99 0 0);
    --foreground: oklch(0.2 0.01 264);
    --card: oklch(0.99 0 0);
    --card-foreground: oklch(0.2 0.01 264);
    --popover: oklch(0.99 0 0);
    --popover-foreground: oklch(0.2 0.01 264);
    --primary: oklch(0.3 0.02 264);
    --primary-foreground: oklch(0.97 0 0);
    --secondary: oklch(0.96 0.005 264);
    --secondary-foreground: oklch(0.3 0.02 264);
    --muted: oklch(0.96 0.005 264);
    --muted-foreground: oklch(0.58 0.01 264);
    --accent: oklch(0.94 0.008 264);
    --accent-foreground: oklch(0.3 0.02 264);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.9 0.005 264);
    --input: oklch(0.9 0.005 264);
    --ring: oklch(0.7 0.01 264);
    --radius: 0.25rem;
    --chart-1: oklch(0.55 0.12 240);
    --chart-2: oklch(0.6 0.1 180);
    --chart-3: oklch(0.5 0.08 220);
    --chart-4: oklch(0.65 0.09 200);
    --chart-5: oklch(0.45 0.1 260);`;

const MINIMAL_DARK = `
    --background: oklch(0.15 0.01 264);
    --foreground: oklch(0.97 0 0);
    --card: oklch(0.19 0.01 264);
    --card-foreground: oklch(0.97 0 0);
    --popover: oklch(0.19 0.01 264);
    --popover-foreground: oklch(0.97 0 0);
    --primary: oklch(0.88 0.005 264);
    --primary-foreground: oklch(0.19 0.01 264);
    --secondary: oklch(0.25 0.01 264);
    --secondary-foreground: oklch(0.97 0 0);
    --muted: oklch(0.25 0.01 264);
    --muted-foreground: oklch(0.65 0.01 264);
    --accent: oklch(0.25 0.01 264);
    --accent-foreground: oklch(0.97 0 0);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 10%);
    --input: oklch(1 0 0 / 12%);
    --ring: oklch(0.5 0.01 264);
    --radius: 0.25rem;
    --chart-1: oklch(0.55 0.12 240);
    --chart-2: oklch(0.6 0.1 180);
    --chart-3: oklch(0.65 0.09 200);
    --chart-4: oklch(0.5 0.08 220);
    --chart-5: oklch(0.45 0.1 260);`;

// Violet/indigo saturated palette (vibrant theme)
const VIBRANT_LIGHT = `
    --background: oklch(1 0 0);
    --foreground: oklch(0.16 0.04 285);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.16 0.04 285);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.16 0.04 285);
    --primary: oklch(0.52 0.24 285);
    --primary-foreground: oklch(0.98 0 0);
    --secondary: oklch(0.94 0.04 285);
    --secondary-foreground: oklch(0.3 0.12 285);
    --muted: oklch(0.96 0.02 285);
    --muted-foreground: oklch(0.52 0.06 285);
    --accent: oklch(0.92 0.06 285);
    --accent-foreground: oklch(0.3 0.12 285);
    --destructive: oklch(0.577 0.245 27.325);
    --border: oklch(0.88 0.04 285);
    --input: oklch(0.88 0.04 285);
    --ring: oklch(0.52 0.24 285);
    --radius: 0.625rem;
    --chart-1: oklch(0.52 0.24 285);
    --chart-2: oklch(0.6 0.2 200);
    --chart-3: oklch(0.55 0.22 310);
    --chart-4: oklch(0.65 0.18 160);
    --chart-5: oklch(0.58 0.2 40);`;

const VIBRANT_DARK = `
    --background: oklch(0.13 0.03 285);
    --foreground: oklch(0.97 0.01 285);
    --card: oklch(0.18 0.04 285);
    --card-foreground: oklch(0.97 0.01 285);
    --popover: oklch(0.18 0.04 285);
    --popover-foreground: oklch(0.97 0.01 285);
    --primary: oklch(0.68 0.22 285);
    --primary-foreground: oklch(0.13 0.03 285);
    --secondary: oklch(0.25 0.06 285);
    --secondary-foreground: oklch(0.97 0.01 285);
    --muted: oklch(0.24 0.05 285);
    --muted-foreground: oklch(0.68 0.08 285);
    --accent: oklch(0.28 0.08 285);
    --accent-foreground: oklch(0.97 0.01 285);
    --destructive: oklch(0.704 0.191 22.216);
    --border: oklch(1 0 0 / 12%);
    --input: oklch(1 0 0 / 15%);
    --ring: oklch(0.68 0.22 285);
    --chart-1: oklch(0.68 0.22 285);
    --chart-2: oklch(0.65 0.18 200);
    --chart-3: oklch(0.62 0.2 310);
    --chart-4: oklch(0.68 0.16 160);
    --chart-5: oklch(0.65 0.18 40);`;

const THEMES: Record<ScaffoldConfig["theme"], { light: string; dark: string }> =
  {
    default: { light: NEUTRAL_LIGHT, dark: NEUTRAL_DARK },
    dark: { light: NEUTRAL_LIGHT, dark: NEUTRAL_DARK },
    minimal: { light: MINIMAL_LIGHT, dark: MINIMAL_DARK },
    vibrant: { light: VIBRANT_LIGHT, dark: VIBRANT_DARK },
  };

export function generateGlobalsCss(config: ScaffoldConfig): string {
  const { light, dark } = THEMES[config.theme];
  return `@import "tailwindcss";

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius: var(--radius);
}

@layer base {
  :root {${light}
  }

  .dark {${dark}
  }

  html {
    color-scheme: light;
  }

  html.dark {
    color-scheme: dark;
  }
}
`;
}
