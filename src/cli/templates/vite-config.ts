import { ALIASES } from "./aliases";

export function generateViteConfig(): string {
  const aliasLines = ALIASES.map(
    (a) => `      '@${a}': path.resolve(__dirname, './src/${a}'),`,
  ).join("\n");

  return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import { snapshotSync } from '@lastshotlabs/snapshot/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
    snapshotSync({ file: 'schema.json' }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom', '@tanstack/react-router', '@tanstack/react-query', 'jotai'],
    alias: {
      '@': path.resolve(__dirname, './src'),
${aliasLines}
    },
  },
})
`;
}
