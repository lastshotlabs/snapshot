/**
 * Generates the comprehensive component reference page.
 *
 * The UI package is code-first: component docs are derived from the exported
 * React component functions, prop types, and helper exports in each component
 * directory.
 */

import path from "node:path";
import { statSync } from "node:fs";
import * as ts from "typescript";
import { collectComponentDirectories } from "./component-inventory.ts";
import {
  escapeCell,
  markdownPage,
  relToRepo,
  repoPath,
  writeDoc,
} from "./_common.ts";

const DOMAIN_ORDER = [
  "layout",
  "forms",
  "data",
  "content",
  "navigation",
  "overlay",
  "media",
  "communication",
  "workflow",
  "commerce",
  "feedback",
  "primitives",
  "_base",
];

const DOMAIN_LABELS: Record<string, string> = {
  layout: "Layout",
  forms: "Forms",
  data: "Data Display",
  content: "Content",
  navigation: "Navigation",
  overlay: "Overlays",
  media: "Media",
  communication: "Communication",
  workflow: "Workflow",
  commerce: "Commerce",
  feedback: "Feedback States",
  primitives: "Primitives",
  _base: "Base Utilities",
};

interface ExportSummary {
  name: string;
  kind: string;
  source: string;
  doc: string;
  symbol: ts.Symbol;
}

interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  doc: string;
}

interface ComponentInfo {
  name: string;
  domain: string;
  relativeDir: string;
  description: string;
  componentExports: ExportSummary[];
  typeExports: ExportSummary[];
  helperExports: ExportSummary[];
  props: PropInfo[];
}

function getProgram(): ts.Program {
  const configPath = ts.findConfigFile(
    repoPath(),
    ts.sys.fileExists,
    "tsconfig.json",
  );
  if (!configPath) throw new Error("Could not locate tsconfig.json");

  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath),
  );

  return ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options,
  });
}

function resolveSymbol(symbol: ts.Symbol, checker: ts.TypeChecker): ts.Symbol {
  return symbol.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol;
}

function sourcePath(symbol: ts.Symbol, checker: ts.TypeChecker): string {
  const target = resolveSymbol(symbol, checker);
  const declaration = target.declarations?.[0];
  return declaration ? relToRepo(declaration.getSourceFile().fileName) : "";
}

function kindOf(symbol: ts.Symbol, checker: ts.TypeChecker): string {
  const target = resolveSymbol(symbol, checker);
  const declaration = target.declarations?.[0];
  if (!declaration) return "export";

  if (ts.isFunctionDeclaration(declaration)) return "component";
  if (ts.isVariableDeclaration(declaration)) return "value";
  if (ts.isInterfaceDeclaration(declaration)) return "interface";
  if (ts.isTypeAliasDeclaration(declaration)) return "type";
  if (ts.isClassDeclaration(declaration)) return "class";

  return (ts.SyntaxKind[declaration.kind] ?? "export")
    .replace(/Declaration$/, "")
    .replace(/Signature$/, "")
    .toLowerCase();
}

function docOf(symbol: ts.Symbol, checker: ts.TypeChecker): string {
  const target = resolveSymbol(symbol, checker);
  return ts.displayPartsToString(target.getDocumentationComment(checker)).trim();
}

function getExports(
  program: ts.Program,
  checker: ts.TypeChecker,
  indexPath: string,
): ExportSummary[] {
  const sourceFile = program.getSourceFile(indexPath);
  if (!sourceFile) return [];

  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) return [];

  return checker
    .getExportsOfModule(moduleSymbol)
    .filter((symbol) => symbol.getName() !== "default")
    .map((symbol) => {
      const target = resolveSymbol(symbol, checker);
      return {
        name: symbol.getName(),
        kind: kindOf(target, checker),
        source: sourcePath(target, checker),
        doc: docOf(target, checker),
        symbol: target,
      };
    })
    .filter((entry) => entry.source && !entry.source.includes("node_modules"))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function isReactComponentExport(entry: ExportSummary): boolean {
  if (!/^[A-Z]/.test(entry.name)) return false;
  if (entry.kind !== "component" && entry.kind !== "value") return false;
  return entry.source.endsWith("standalone.tsx") || entry.source.endsWith("control.tsx");
}

function typeToString(
  checker: ts.TypeChecker,
  type: ts.Type,
  node?: ts.Node,
): string {
  return checker.typeToString(
    type,
    node,
    ts.TypeFormatFlags.NoTruncation |
      ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType,
  );
}

function getPropsForComponent(
  checker: ts.TypeChecker,
  entry: ExportSummary,
): PropInfo[] {
  const declaration = entry.symbol.declarations?.[0];
  if (!declaration) return [];

  const componentType = checker.getTypeOfSymbolAtLocation(
    entry.symbol,
    declaration,
  );
  const signature = componentType.getCallSignatures()[0];
  const propsParam = signature?.parameters[0];
  if (!propsParam) return [];

  const propsDeclaration = propsParam.valueDeclaration ?? declaration;
  const propsType = checker.getTypeOfSymbolAtLocation(
    propsParam,
    propsDeclaration,
  );

  return propsType
    .getProperties()
    .map((prop) => {
      const propDeclaration = prop.valueDeclaration ?? propsDeclaration;
      const propType = checker.getTypeOfSymbolAtLocation(prop, propDeclaration);

      return {
        name: prop.getName(),
        type: typeToString(checker, propType, propDeclaration),
        required: !(prop.flags & ts.SymbolFlags.Optional),
        doc: ts
          .displayPartsToString(prop.getDocumentationComment(checker))
          .trim(),
      };
    })
    .sort((left, right) => {
      if (left.required !== right.required) return left.required ? -1 : 1;
      return left.name.localeCompare(right.name);
    });
}

function fallbackDescription(relativeDir: string): string {
  return `${titleCase(relativeDir)} is a code-first Snapshot UI component exported from the UI package.`;
}

function titleCase(value: string): string {
  return value
    .split(/[/-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function fileExists(filePath: string): boolean {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function extractComponentInfo(
  program: ts.Program,
  checker: ts.TypeChecker,
  entry: ReturnType<typeof collectComponentDirectories>[number],
): ComponentInfo | null {
  const indexPath = path.join(entry.absoluteDir, "index.ts");
  const indexTsxPath = path.join(entry.absoluteDir, "index.tsx");
  const resolvedIndexPath = fileExists(indexPath) ? indexPath : indexTsxPath;
  if (!fileExists(resolvedIndexPath)) return null;

  const exports = getExports(program, checker, resolvedIndexPath);
  const componentExports = exports.filter(isReactComponentExport);
  const typeExports = exports.filter(
    (summary) => summary.kind === "interface" || summary.kind === "type",
  );
  const helperExports = exports.filter(
    (summary) =>
      !componentExports.includes(summary) && !typeExports.includes(summary),
  );
  const primaryComponent =
    componentExports.find((summary) => summary.name.endsWith("Base")) ??
    componentExports[0];

  if (!primaryComponent && exports.length === 0) return null;

  return {
    name: entry.componentName,
    domain: entry.domain,
    relativeDir: entry.relativeDir,
    description:
      primaryComponent?.doc ||
      typeExports.find((summary) => summary.name.endsWith("Props"))?.doc ||
      fallbackDescription(entry.relativeDir),
    componentExports,
    typeExports,
    helperExports,
    props: primaryComponent
      ? getPropsForComponent(checker, primaryComponent)
      : [],
  };
}

function renderExportsTable(exports: ExportSummary[]): string {
  if (exports.length === 0) return "";

  const lines = ["| Export | Kind | Source | Summary |", "| --- | --- | --- | --- |"];
  for (const summary of exports) {
    lines.push(
      `| \`${escapeCell(summary.name)}\` | ${escapeCell(summary.kind)} | \`${escapeCell(summary.source)}\` | ${escapeCell(summary.doc)} |`,
    );
  }

  return lines.join("\n");
}

function renderPropsTable(props: PropInfo[]): string {
  if (props.length === 0) {
    return "This component does not expose a documented standalone prop object.";
  }

  const lines = ["| Prop | Type | Required | Summary |", "| --- | --- | --- | --- |"];
  for (const prop of props) {
    lines.push(
      `| \`${escapeCell(prop.name)}\` | \`${escapeCell(prop.type)}\` | ${prop.required ? "Yes" : "No"} | ${escapeCell(prop.doc)} |`,
    );
  }

  return lines.join("\n");
}

export async function generateComponentReference(): Promise<void> {
  const program = getProgram();
  const checker = program.getTypeChecker();
  const directories = collectComponentDirectories();
  const components = directories
    .map((entry) => extractComponentInfo(program, checker, entry))
    .filter((entry): entry is ComponentInfo => Boolean(entry));

  const byDomain = new Map<string, ComponentInfo[]>();
  for (const component of components) {
    const list = byDomain.get(component.domain) ?? [];
    list.push(component);
    byDomain.set(component.domain, list);
  }

  for (const list of byDomain.values()) {
    list.sort((left, right) => left.relativeDir.localeCompare(right.relativeDir));
  }

  const orderedDomains = DOMAIN_ORDER.filter((domain) => byDomain.has(domain));
  for (const domain of byDomain.keys()) {
    if (!orderedDomains.includes(domain)) orderedDomains.push(domain);
  }

  const toc: string[] = [];
  const sections: string[] = [];
  let totalComponents = 0;

  for (const domain of orderedDomains) {
    const domainComponents = byDomain.get(domain);
    if (!domainComponents?.length) continue;

    const label = DOMAIN_LABELS[domain] ?? titleCase(domain);
    toc.push(`- [${label}](#${label.toLowerCase().replace(/\s+/g, "-")}) (${domainComponents.length})`);
    totalComponents += domainComponents.length;

    const sectionLines = [`## ${label}`, ""];
    for (const component of domainComponents) {
      sectionLines.push(`### \`${component.relativeDir}\``);
      sectionLines.push("");
      sectionLines.push(component.description);
      sectionLines.push("");

      if (component.componentExports.length > 0) {
        sectionLines.push("#### Components");
        sectionLines.push("");
        sectionLines.push(renderExportsTable(component.componentExports));
        sectionLines.push("");
      }

      sectionLines.push("#### Props");
      sectionLines.push("");
      sectionLines.push(renderPropsTable(component.props));
      sectionLines.push("");

      if (component.typeExports.length > 0) {
        sectionLines.push("#### Types");
        sectionLines.push("");
        sectionLines.push(renderExportsTable(component.typeExports));
        sectionLines.push("");
      }

      if (component.helperExports.length > 0) {
        sectionLines.push("#### Helpers");
        sectionLines.push("");
        sectionLines.push(renderExportsTable(component.helperExports));
        sectionLines.push("");
      }

      sectionLines.push("---");
      sectionLines.push("");
    }

    sections.push(sectionLines.join("\n"));
  }

  const body = `
This reference is auto-generated from the code-first component exports under \`src/ui/components\`.
It documents the React component exports, standalone prop surfaces, related types, and helper exports for each component directory.

Total components: **${totalComponents}** across ${orderedDomains.length} domains.

## Table of Contents

${toc.join("\n")}

---

${sections.join("\n")}
`.trim();

  writeDoc(
    "reference/components.md",
    markdownPage(
      "Component Reference",
      "Complete auto-generated reference for Snapshot UI components, props, types, and helpers.",
      body,
    ),
  );
}

if (import.meta.main) {
  await generateComponentReference();
}
