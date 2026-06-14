import { readFileSync } from "node:fs";
import path from "node:path";
import * as ts from "typescript";
import { repoPath } from "./_common.ts";

const entrypoints = [
  {
    source: repoPath("src", "index.ts"),
    reference: repoPath(
      "apps",
      "docs",
      "src",
      "content",
      "docs",
      "reference",
      "sdk.md",
    ),
  },
  {
    source: repoPath("src", "ui.ts"),
    reference: repoPath(
      "apps",
      "docs",
      "src",
      "content",
      "docs",
      "reference",
      "ui",
      "index.md",
    ),
  },
  {
    source: repoPath("src", "ssr", "index.ts"),
    reference: repoPath(
      "apps",
      "docs",
      "src",
      "content",
      "docs",
      "reference",
      "ssr.md",
    ),
  },
  {
    source: repoPath("src", "vite", "index.ts"),
    reference: repoPath(
      "apps",
      "docs",
      "src",
      "content",
      "docs",
      "reference",
      "vite.md",
    ),
  },
];

const generatedReferenceDocs = [
  ...entrypoints.map((entrypoint) => entrypoint.reference),
  repoPath(
    "apps",
    "docs",
    "src",
    "content",
    "docs",
    "reference",
    "components.md",
  ),
  repoPath(
    "apps",
    "docs",
    "src",
    "content",
    "docs",
    "reference",
    "cli.md",
  ),
];

const configPath = ts.findConfigFile(
  repoPath(),
  ts.sys.fileExists,
  "tsconfig.json",
);
if (!configPath) {
  throw new Error("Could not locate tsconfig.json");
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  path.dirname(configPath),
);
const program = ts.createProgram({
  rootNames: parsed.fileNames,
  options: parsed.options,
});
const checker = program.getTypeChecker();

let hasError = false;
let verifiedExports = 0;
let generatedFallbackExports = 0;
let referenceCoveredExports = 0;

for (const entrypoint of entrypoints) {
  const sourceFile = program.getSourceFile(entrypoint.source);
  if (!sourceFile) {
    console.error(`[docs:coverage] Missing source file: ${entrypoint.source}`);
    hasError = true;
    continue;
  }

  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) {
    console.error(
      `[docs:coverage] Missing module symbol for: ${entrypoint.source}`,
    );
    hasError = true;
    continue;
  }

  let referenceDoc = "";
  try {
    referenceDoc = readFileSync(entrypoint.reference, "utf8");
  } catch {
    console.error(
      `[docs:coverage] Missing generated reference doc: ${path.relative(repoPath(), entrypoint.reference).replace(/\\/g, "/")}`,
    );
    hasError = true;
  }

  for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
    const target =
      symbol.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol;
    const declarations =
      target.getDeclarations() ?? symbol.getDeclarations() ?? [];
    const declarationFile = declarations[0]?.getSourceFile().fileName;

    if (!declarationFile || declarationFile.includes("node_modules")) {
      continue;
    }

    const declarationRel = path
      .relative(repoPath(), declarationFile)
      .replace(/\\/g, "/");
    if (declarationRel.startsWith("..") || path.isAbsolute(declarationRel)) {
      continue;
    }

    if (
      referenceDoc &&
      !referenceDoc.includes(`| \`${symbol.getName()}\` |`) &&
      !referenceDoc.includes(`#### \`${symbol.getName()}`)
    ) {
      console.error(
        `[docs:coverage] Missing generated reference entry for ${symbol.getName()} exported from ${path.relative(repoPath(), entrypoint.source).replace(/\\/g, "/")}`,
      );
      hasError = true;
      continue;
    }
    referenceCoveredExports += 1;

    const docs = ts
      .displayPartsToString(target.getDocumentationComment(checker))
      .trim();
    if (!docs) {
      if (
        path.relative(repoPath(), entrypoint.source).replace(/\\/g, "/") ===
          "src/ui.ts" &&
        declarationRel.startsWith("src/ui/components/")
      ) {
        generatedFallbackExports += 1;
        continue;
      }

      console.error(
        `[docs:coverage] Missing JSDoc for ${symbol.getName()} exported from ${path.relative(repoPath(), entrypoint.source).replace(/\\/g, "/")}`,
      );
      hasError = true;
      continue;
    }

    verifiedExports += 1;
  }
}

for (const docPath of generatedReferenceDocs) {
  let contents = "";
  try {
    contents = readFileSync(docPath, "utf8");
  } catch {
    console.error(
      `[docs:coverage] Missing generated doc: ${path.relative(repoPath(), docPath).replace(/\\/g, "/")}`,
    );
    hasError = true;
    continue;
  }

  if (/No JSDoc description|No description/i.test(contents)) {
    console.error(
      `[docs:coverage] Generated doc still contains missing-description placeholders: ${path.relative(repoPath(), docPath).replace(/\\/g, "/")}`,
    );
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

console.log(
  `[docs:coverage] Verified ${referenceCoveredExports} generated reference entries, ${verifiedExports} JSDoc-backed exports, and ${generatedFallbackExports} generated component fallback descriptions across ${entrypoints.length} entrypoints.`,
);
