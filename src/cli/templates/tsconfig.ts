import { ALIASES } from "./aliases";

/** Root tsconfig — project references + paths for tooling (shadcn, etc.) */
export function generateTsConfigRoot(): string {
  const paths: Record<string, string[]> = {
    "@/*": ["./src/*"],
  };
  for (const alias of ALIASES) {
    paths[`@${alias}/*`] = [`./src/${alias}/*`];
  }

  return (
    JSON.stringify(
      {
        files: [],
        references: [
          { path: "./tsconfig.app.json" },
          { path: "./tsconfig.node.json" },
        ],
        compilerOptions: { paths },
      },
      null,
      2,
    ) + "\n"
  );
}

/** App tsconfig — covers src/ */
export function generateTsConfigApp(): string {
  const paths: Record<string, string[]> = {
    "@/*": ["./src/*"],
  };
  for (const alias of ALIASES) {
    paths[`@${alias}/*`] = [`./src/${alias}/*`];
  }

  return (
    JSON.stringify(
      {
        compilerOptions: {
          tsBuildInfoFile: "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
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
          paths,
        },
        include: ["src", "src/routeTree.gen.ts"],
      },
      null,
      2,
    ) + "\n"
  );
}

/** Node tsconfig — covers vite.config.ts */
export function generateTsConfigNode(): string {
  return (
    JSON.stringify(
      {
        compilerOptions: {
          tsBuildInfoFile: "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
          target: "ES2022",
          lib: ["ES2022"],
          module: "ESNext",
          moduleResolution: "bundler",
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: "force",
          noEmit: true,
          strict: true,
          skipLibCheck: true,
          noUncheckedIndexedAccess: true,
        },
        include: ["vite.config.ts"],
      },
      null,
      2,
    ) + "\n"
  );
}
