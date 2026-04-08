import type { ScaffoldConfig } from "../types";

const DARK_INIT_SCRIPT = `\n    <script>if(!localStorage.getItem('snapshot-theme')){localStorage.setItem('snapshot-theme','dark');document.documentElement.classList.add('dark')}else if(localStorage.getItem('snapshot-theme')==='dark'){document.documentElement.classList.add('dark')}</script>`;

export function generateIndexHtml(config: ScaffoldConfig): string {
  const darkScript = config.theme === "dark" ? DARK_INIT_SCRIPT : "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />${darkScript}
    <title>${config.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}
