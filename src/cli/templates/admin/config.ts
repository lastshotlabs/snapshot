import type { AdminScaffoldConfig } from "../../types";

export function generatePackageJson(config: AdminScaffoldConfig): string {
  const pkg = {
    name: config.packageName,
    version: "0.0.1",
    private: true,
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc && vite build",
      preview: "vite preview",
      typecheck: "tsc",
      sync: "bunx snapshot sync",
    },
    dependencies: {
      "@tanstack/react-query": "^5.0.0",
      "@tanstack/react-router": "^1.0.0",
      "@tanstack/router-plugin": "^1.0.0",
      clsx: "^2.0.0",
      "class-variance-authority": "^0.7.0",
      "tailwind-merge": "^3.0.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
    devDependencies: {
      "@tailwindcss/vite": "^4.0.0",
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
      "@vitejs/plugin-react": "^4.0.0",
      tailwindcss: "^4.0.0",
      typescript: "^5.0.0",
      vite: "^6.0.0",
    },
  };
  return JSON.stringify(pkg, null, 2) + "\n";
}

export function generateTsConfig(): string {
  return (
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          useDefineForClassFields: true,
          lib: ["ES2020", "DOM", "DOM.Iterable"],
          types: ["vite/client"],
          module: "ESNext",
          skipLibCheck: true,
          moduleResolution: "bundler",
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: "force",
          noEmit: true,
          jsx: "react-jsx",
          strict: true,
          noUncheckedIndexedAccess: true,
          paths: {
            "@/*": ["./src/*"],
            "@lib/*": ["./src/lib/*"],
            "@components/*": ["./src/components/*"],
            "@pages/*": ["./src/pages/*"],
            "@hooks/*": ["./src/hooks/*"],
            "@api/*": ["./src/api/*"],
          },
        },
        include: ["src", "src/routeTree.gen.ts"],
      },
      null,
      2,
    ) + "\n"
  );
}

export function generateViteConfig(): string {
  return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    dedupe: ['react', 'react-dom', '@tanstack/react-router', '@tanstack/react-query'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@api': path.resolve(__dirname, './src/api'),
    },
  },
})
`;
}

export function generateEnvFile(config: AdminScaffoldConfig): string {
  return `VITE_API_URL=http://localhost:3000
# Admin credentials (if your backend requires a static admin token for dev)
# VITE_ADMIN_TOKEN=
`;
}

export function generateSnapshotConfig(_config: AdminScaffoldConfig): string {
  const cfg = {
    apiDir: "src/api",
    hooksDir: "src/hooks/api",
    typesPath: "src/types/api.ts",
    snapshotImport: "@lib/snapshot",
  };
  return JSON.stringify(cfg, null, 2) + "\n";
}

export function generateGitignore(): string {
  return `node_modules/
dist/
.env
.env.local
*.local
routeTree.gen.ts
`;
}
