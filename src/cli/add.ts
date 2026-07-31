import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type RegistryComponent = {
  entry: string;
  files: string[];
  dependencies: string[];
};

type RegistryManifest = {
  version: number;
  components: Record<string, RegistryComponent>;
};

export interface AddComponentOptions {
  name: string;
  cwd?: string;
  targetDir?: string;
  overwrite?: boolean;
  dryRun?: boolean;
  registryRoot?: string;
}

export interface AddComponentResult {
  name: string;
  targetDir: string;
  files: string[];
  dependencies: string[];
}

export function defaultRegistryRoot(): string {
  return fileURLToPath(new URL("../../registry", import.meta.url));
}

export async function listComponents(
  registryRoot = defaultRegistryRoot(),
): Promise<string[]> {
  const manifest = JSON.parse(
    await readFile(path.join(registryRoot, "manifest.json"), "utf8"),
  ) as RegistryManifest;
  return Object.keys(manifest.components).sort();
}

export async function addComponent(
  options: AddComponentOptions,
): Promise<AddComponentResult> {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const registryRoot = options.registryRoot ?? defaultRegistryRoot();
  const manifest = JSON.parse(
    await readFile(path.join(registryRoot, "manifest.json"), "utf8"),
  ) as RegistryManifest;
  const component = manifest.components[options.name];
  if (!component) {
    throw new Error(
      `Unknown component "${options.name}". Run snapshot add --list to see available components.`,
    );
  }

  const targetDir = path.resolve(
    cwd,
    options.targetDir ?? "src/components/snapshot",
  );
  const files = [...component.files];
  const generatedEntry = `${options.name}.ts`;
  if (component.entry !== generatedEntry) files.push(generatedEntry);

  const conflicts = files.filter(
    (file) => existsSync(path.join(targetDir, file)) && !options.overwrite,
  );
  if (conflicts.length > 0) {
    throw new Error(
      `Refusing to overwrite existing files:\n${conflicts.map((file) => `- ${file}`).join("\n")}\nRe-run with --overwrite to replace them.`,
    );
  }

  if (!options.dryRun) {
    for (const file of component.files) {
      const source = path.join(registryRoot, "files", file);
      const destination = path.join(targetDir, file);
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(source, destination);
    }
    if (component.entry !== generatedEntry) {
      const entryWithoutExtension = component.entry.replace(
        /\.(tsx?|mts|cts|jsx?)$/,
        "",
      );
      await mkdir(targetDir, { recursive: true });
      await writeFile(
        path.join(targetDir, generatedEntry),
        `export * from "./${entryWithoutExtension}";\n`,
      );
    }
  }

  return {
    name: options.name,
    targetDir,
    files: files.sort(),
    dependencies: component.dependencies,
  };
}
