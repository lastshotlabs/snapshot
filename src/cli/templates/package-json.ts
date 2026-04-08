import type { ScaffoldConfig } from "../types";

declare const __SNAPSHOT_VERSION__: string;

export function generatePackageJson(config: ScaffoldConfig): string {
  const dependencies: Record<string, string> = {
    "@lastshotlabs/snapshot": `^${__SNAPSHOT_VERSION__}`,
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-router": "^1.0.0",
    "@tanstack/router-plugin": "^1.0.0",
    "@unhead/react": "^2.0.0",
    clsx: "^2.0.0",
    "class-variance-authority": "^0.7.0",
    jotai: "^2.0.0",
    zod: "^3.0.0",
    react: "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.0.0",
  };

  if (config.mfaPages) {
    dependencies["react-qr-code"] = "^2.0.0";
  }

  if (config.passkeyPages) {
    dependencies["@simplewebauthn/browser"] = "^13.0.0";
  }

  const pkg = {
    name: config.packageName,
    version: "0.1.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc -b && vite build",
      preview: "vite preview",
      typecheck: "tsc -b",
      sync: "bunx snapshot sync",
    },
    dependencies,
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
