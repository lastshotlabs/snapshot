import { describe, it, expect } from "vitest";
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";
import { runSync } from "../sync";

// sync.ts exports: runSync, consoleLogger, SyncLogger (interface), BackendConfig (interface), SyncOptions (interface)
// The internal functions (generateOperation, generateTagFiles, schemaToTs, etc.) are NOT exported.
// Unit testing of the parser/generator internals is not possible without exporting them.
//
// To enable unit testing of internals, the following would need to be exported from sync.ts:
//   - schemaToTs(schema, depth?) — converts a SchemaObject to a TypeScript type string
//   - schemaToZod(schema, componentSchemas, visiting?) — converts a SchemaObject to a Zod schema string
//   - generateOperation(method, pathStr, op, pathLevelParams, componentSchemas, zod?) — generates api + hook code for one operation
//   - generateTagFiles(ops, slug, componentSchemas, zod?, importPaths?) — generates full api/hooks file content for a tag
//   - generateTypesContent(schemas, hasPaginated) — generates the types file content
//   - plainFnName(method, pathStr, operationId?) — derives the plain function name
//   - hookName(method, fnName) — derives the hook function name
//   - isPaginatedSchema(schema) — detects pagination envelope shape

describe.skip("schemaToTs (not exported)", () => {
  it('would convert a string schema to "string"', () => {
    // const result = schemaToTs({ type: 'string' })
    // expect(result).toBe('string')
  });

  it("would convert an object schema with properties to an interface body", () => {
    // const result = schemaToTs({ type: 'object', properties: { id: { type: 'string' } }, required: ['id'] })
    // expect(result).toContain('id: string')
  });
});

describe.skip("generateOperation (not exported)", () => {
  it("would generate a plain async function for GET /users", () => {
    // const result = generateOperation('get', '/users', { responses: { '200': { ... } } }, [], {})
    // expect(result.apiCode).toContain('export const getUsers')
  });

  it("would generate a mutation hook for POST /users", () => {
    // const result = generateOperation('post', '/users', { responses: { '201': {} }, requestBody: { ... } }, [], {})
    // expect(result.hookCode).toContain('useMutation')
  });
});

// ── Integration test ───────────────────────────────────────────────────────────

describe("runSync integration", () => {
  it("generates output files from a local schema fixture", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "snapshot-sync-test-"),
    );

    const fixtureSchema = path.resolve(
      __dirname,
      "fixtures/sample-schema.json",
    );

    try {
      await runSync({
        filePath: fixtureSchema,
        cwd: tmpDir,
        logger: {
          info: () => {},
          success: () => {},
          warn: () => {},
          error: () => {},
        },
      });

      const apiDir = path.join(tmpDir, "src/api");
      const hooksDir = path.join(tmpDir, "src/hooks/api");

      const apiFiles = await fs.readdir(apiDir);
      const hooksFiles = await fs.readdir(hooksDir);

      expect(apiFiles.length).toBeGreaterThan(0);
      expect(hooksFiles.length).toBeGreaterThan(0);

      // Expect a generated file for the 'index' tag (no tags in fixture → falls back to 'index')
      expect(apiFiles).toContain("index.ts");
      expect(hooksFiles).toContain("index.ts");
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  it("generates valid identifiers and URLs for colon-style path params", async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "snapshot-sync-colon-test-"),
    );
    const schemaPath = path.join(tmpDir, "openapi.json");

    const schema = {
      openapi: "3.0.0",
      info: {
        title: "Colon Params API",
        version: "1.0.0",
      },
      paths: {
        "/api/summary/:month": {
          get: {
            tags: ["cashflow"],
            summary: "Get monthly summary",
            parameters: [
              {
                name: "month",
                in: "path",
                required: true,
                schema: { type: "string" },
              },
            ],
            responses: {
              "200": {
                description: "Monthly summary",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      required: ["month"],
                      properties: {
                        month: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "/api/ledger-entries/:id": {
          get: {
            tags: ["cashflow"],
            summary: "Get ledger entry",
            responses: {
              "200": {
                description: "Ledger entry",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      required: ["id"],
                      properties: {
                        id: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    try {
      await fs.writeFile(schemaPath, JSON.stringify(schema), "utf8");
      await fs.writeFile(
        path.join(tmpDir, "package.json"),
        JSON.stringify({ snapshot: { prefetchDir: "src/server/prefetch" } }),
        "utf8",
      );

      await runSync({
        filePath: schemaPath,
        cwd: tmpDir,
        logger: {
          info: () => {},
          success: () => {},
          warn: () => {},
          error: () => {},
        },
      });

      const apiContent = await fs.readFile(
        path.join(tmpDir, "src/api/cashflow.ts"),
        "utf8",
      );
      const hooksContent = await fs.readFile(
        path.join(tmpDir, "src/hooks/api/cashflow.ts"),
        "utf8",
      );
      const prefetchContent = await fs.readFile(
        path.join(
          tmpDir,
          "src/server/prefetch/prefetchGetApiSummaryByMonth.ts",
        ),
        "utf8",
      );

      expect(apiContent).toContain(
        "export const getApiSummaryByMonth = (month: string)",
      );
      expect(apiContent).toContain("`/api/summary/${month}`");
      expect(apiContent).toContain(
        "export const getApiLedgerEntriesById = (id: string)",
      );
      expect(apiContent).toContain("`/api/ledger-entries/${id}`");
      expect(apiContent).not.toContain("getApiSummary:month");

      expect(hooksContent).toContain(
        "queryKey: ['api', 'summary', params.month]",
      );
      expect(hooksContent).toContain(
        "queryKey: ['api', 'ledger-entries', params.id]",
      );

      expect(prefetchContent).toContain(
        "export const prefetchGetApiSummaryByMonth = cache(async (month: string)",
      );
      expect(prefetchContent).toContain(
        "Query key matches `useGetApiSummaryByMonthQuery`: `['api', 'summary', month]`",
      );
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
