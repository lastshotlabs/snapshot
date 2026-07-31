import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { addComponent, listComponents } from "../add";

const tempDirs: string[] = [];

async function fixtureRegistry(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "snapshot-registry-"));
  tempDirs.push(root);
  await mkdir(path.join(root, "files/components/forms/button"), {
    recursive: true,
  });
  await writeFile(
    path.join(root, "files/components/forms/button/standalone.tsx"),
    "export const Button = () => null;\n",
  );
  await writeFile(
    path.join(root, "manifest.json"),
    JSON.stringify({
      version: 1,
      components: {
        button: {
          entry: "components/forms/button/standalone.tsx",
          files: ["components/forms/button/standalone.tsx"],
          dependencies: ["react"],
        },
      },
    }),
  );
  return root;
}

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});

describe("component source registry", () => {
  it("lists and copies a component source graph", async () => {
    const registryRoot = await fixtureRegistry();
    const cwd = await mkdtemp(path.join(os.tmpdir(), "snapshot-add-"));
    tempDirs.push(cwd);
    expect(await listComponents(registryRoot)).toEqual(["button"]);

    const result = await addComponent({ name: "button", cwd, registryRoot });
    expect(result.dependencies).toEqual(["react"]);
    expect(
      await readFile(
        path.join(cwd, "src/components/snapshot/button.ts"),
        "utf8",
      ),
    ).toContain("components/forms/button/standalone");
  });

  it("refuses to overwrite owned source unless explicitly requested", async () => {
    const registryRoot = await fixtureRegistry();
    const cwd = await mkdtemp(path.join(os.tmpdir(), "snapshot-add-conflict-"));
    tempDirs.push(cwd);
    await addComponent({ name: "button", cwd, registryRoot });
    await expect(
      addComponent({ name: "button", cwd, registryRoot }),
    ).rejects.toThrow("Refusing to overwrite");
  });
});
