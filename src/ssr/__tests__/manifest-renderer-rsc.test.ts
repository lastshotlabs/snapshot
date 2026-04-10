import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ManifestConfig } from "../../ui/manifest/types";
import { createManifestRenderer } from "../manifest-renderer";
import { renderPage } from "../render";

vi.mock("../render", () => ({
  renderPage: vi.fn(
    async () =>
      new Response("<html></html>", {
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
  ),
}));

describe("createManifestRenderer - RSC manifest auto-load", () => {
  beforeEach(() => {
    vi.mocked(renderPage).mockClear();
  });

  it("loads rsc-manifest.json from manifest.ssr and passes rscOptions to renderPage", async () => {
    const previousCwd = process.cwd();
    const tempDir = mkdtempSync(path.join(tmpdir(), "snapshot-rsc-"));

    try {
      process.chdir(tempDir);

      const manifestPath = path.join(tempDir, "mock-rsc-manifest.json");
      writeFileSync(
        manifestPath,
        JSON.stringify({
          components: {
            "src/components/Foo.tsx#default": "assets/Foo.js",
          },
        }),
        "utf-8",
      );

      const manifest: ManifestConfig = {
        ssr: {
          rsc: true,
          rscManifestPath: "./mock-rsc-manifest.json",
        },
        routes: [
          {
            id: "home",
            path: "/",
            title: "Home",
            content: [{ type: "heading", text: "Home" }],
          },
        ],
      };

      const renderer = createManifestRenderer({ manifest });
      const match = {
        filePath: "manifest:home",
        metaFilePath: null,
        params: {},
        query: {},
        url: new URL("http://localhost/"),
      };

      await renderer.render(match, { headTags: "", assetTags: "" }, {});

      expect(renderPage).toHaveBeenCalledTimes(1);
      const rscOptions = vi.mocked(renderPage).mock.calls[0]?.[4];
      expect(rscOptions).toEqual({
        manifest: {
          components: {
            "src/components/Foo.tsx#default": "assets/Foo.js",
          },
        },
      });
    } finally {
      process.chdir(previousCwd);
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
