export function generateSnapshotConfig(): string {
  const config = {
    apiDir: "src/api",
    hooksDir: "src/hooks/api",
    typesPath: "src/types/api.ts",
    snapshotImport: "@lib/snapshot",
  };
  return JSON.stringify(config, null, 2) + "\n";
}
