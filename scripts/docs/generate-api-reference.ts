import path from "node:path";
import * as ts from "typescript";
import {
  escapeCell,
  markdownPage,
  repoPath,
  relToRepo,
  writeDoc,
} from "./_common.ts";

// ── Types ────────────────────────────────────────────────────────────────────

type ExportInfo = {
  name: string;
  kind: string;
  sourcePath: string;
  description: string;
  signature?: string;
  params?: { name: string; description: string }[];
  returns?: string;
  examples?: string[];
};

type MemberInfo = {
  name: string;
  type: string;
  description: string;
};

type GroupRule = {
  label: string;
  test: (sourcePath: string) => boolean;
};

type Surface = {
  label: string;
  file: string;
  output: string;
  description: string;
  groups: GroupRule[];
  /** Interface names whose members should be expanded in the detailed view. */
  expandInterfaces?: string[];
};

// ── Group Definitions ────────────────────────────────────────────────────────

const sdkGroups: GroupRule[] = [
  { label: "Factory", test: (p) => p.startsWith("src/create-snapshot") },
  { label: "API Client", test: (p) => p.startsWith("src/api/") },
  {
    label: "Auth",
    test: (p) =>
      p.startsWith("src/auth/") ||
      (p.startsWith("src/types") && /Auth|Login|Register|Logout|Forgot|Mfa|OAuth|WebAuthn|Passkey|Session|Password|Verification|Token(?!Storage)/.test(p)),
  },
  { label: "Community", test: (p) => p.startsWith("src/community/") },
  { label: "Webhooks", test: (p) => p.startsWith("src/webhooks/") },
  { label: "Plugins", test: (p) => p.startsWith("src/plugin") },
  { label: "Push Notifications", test: (p) => p.startsWith("src/push/") },
  { label: "Realtime", test: (p) => p.startsWith("src/sse/") || p.startsWith("src/ws/") },
  { label: "Schema Generation", test: (p) => p.startsWith("src/schema-generator") },
  { label: "Core Types", test: () => true },
];

const uiGroups: GroupRule[] = [
  {
    label: "Tokens & Flavors",
    test: (p) => p.startsWith("src/ui/tokens/") || p.startsWith("src/ui/analytics/"),
  },
  { label: "API Client", test: (p) => p.startsWith("src/api/") },
  { label: "Context & Data Binding", test: (p) => p.startsWith("src/ui/context/") },
  { label: "State Runtime", test: (p) => p.startsWith("src/ui/state/") },
  { label: "Actions", test: (p) => p.startsWith("src/ui/actions/") },
  { label: "Components — Data", test: (p) => p.startsWith("src/ui/components/data/") },
  { label: "Components — Forms", test: (p) => p.startsWith("src/ui/components/forms/") },
  {
    label: "Components — Communication",
    test: (p) => p.startsWith("src/ui/components/communication/"),
  },
  { label: "Components — Content", test: (p) => p.startsWith("src/ui/components/content/") },
  { label: "Components — Overlay", test: (p) => p.startsWith("src/ui/components/overlay/") },
  {
    label: "Components — Navigation",
    test: (p) => p.startsWith("src/ui/components/navigation/"),
  },
  { label: "Components — Layout", test: (p) => p.startsWith("src/ui/components/layout/") },
  { label: "Components — Media", test: (p) => p.startsWith("src/ui/components/media/") },
  {
    label: "Components — Primitives",
    test: (p) => p.startsWith("src/ui/components/primitives/"),
  },
  { label: "Component Utilities", test: (p) => p.startsWith("src/ui/components/_base/") },
  { label: "Hooks & Utilities", test: (p) => p.startsWith("src/ui/hooks/") },
  { label: "Icons", test: (p) => p.startsWith("src/ui/icons/") },
  { label: "Workflows", test: (p) => p.startsWith("src/ui/workflows/") },
  { label: "Other", test: () => true },
];

// ── Surface Definitions ──────────────────────────────────────────────────────

const surfaces: Surface[] = [
  {
    label: "SDK",
    file: repoPath("src", "index.ts"),
    output: "reference/sdk.md",
    description:
      "Generated from src/index.ts and the declarations it re-exports.",
    groups: sdkGroups,
    expandInterfaces: ["SnapshotInstance", "SnapshotConfig"],
  },
  {
    label: "UI",
    file: repoPath("src", "ui.ts"),
    output: "reference/ui/index.md",
    description: "Generated from src/ui.ts and the declarations it re-exports.",
    groups: uiGroups,
  },
  {
    label: "SSR",
    file: repoPath("src", "ssr", "index.ts"),
    output: "reference/ssr.md",
    description:
      "Generated from src/ssr/index.ts and the declarations it re-exports.",
    groups: [],
  },
  {
    label: "Vite",
    file: repoPath("src", "vite", "index.ts"),
    output: "reference/vite.md",
    description:
      "Generated from src/vite/index.ts and the declarations it re-exports.",
    groups: [],
  },
];

// ── TypeScript Helpers ───────────────────────────────────────────────────────

function getProgram(): ts.Program {
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
  return ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options,
  });
}

function resolveSymbol(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): ts.Symbol {
  return symbol.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol;
}

function getDeclarationKind(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): string {
  const target = resolveSymbol(symbol, checker);
  const declaration = target.declarations?.[0];
  if (!declaration) return "unknown";
  const kind = ts.SyntaxKind[declaration.kind] ?? "unknown";
  return kind
    .replace(/Declaration$/, "")
    .replace(/Signature$/, "")
    .replace(/^JSDoc/, "")
    .toLowerCase();
}

function getDocString(symbol: ts.Symbol, checker: ts.TypeChecker): string {
  const target = resolveSymbol(symbol, checker);
  return (
    ts.displayPartsToString(target.getDocumentationComment(checker)).trim() ||
    getFallbackDocString(target, checker)
  );
}

function splitIdentifier(name: string): string {
  return name
    .replace(/ConfigSchema$/, " config schema")
    .replace(/Schema$/, " schema")
    .replace(/BaseProps$/, " base props")
    .replace(/Props$/, " props")
    .replace(/Config$/, " config")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .toLowerCase();
}

function getFallbackDocString(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): string {
  const name = symbol.getName();
  const readableName = splitIdentifier(name);
  const kind = getDeclarationKind(symbol, checker);

  if (/BaseProps$/.test(name)) {
    return `Props accepted by the ${name.replace(/BaseProps$/, "Base")} standalone component.`;
  }

  if (/Props$/.test(name)) {
    return `Props accepted by the ${name.replace(/Props$/, "")} component.`;
  }

  if (/ConfigSchema$|Schema$/.test(name)) {
    return `Zod schema for validating ${readableName}.`;
  }

  if (/Config$/.test(name)) {
    return `Configuration type for ${readableName}.`;
  }

  if (/^use[A-Z]/.test(name)) {
    return `React hook exported by the Snapshot UI runtime.`;
  }

  if (kind === "function") {
    return `Function exported by the Snapshot UI runtime.`;
  }

  if (kind === "interface" || kind === "typealias") {
    return `Type definition exported by the Snapshot UI runtime.`;
  }

  return `Exported ${kind} from the Snapshot UI runtime.`;
}

function getSourcePath(symbol: ts.Symbol, checker: ts.TypeChecker): string {
  const target = resolveSymbol(symbol, checker);
  const declaration = target.declarations?.[0];
  if (!declaration) return "unknown";
  return relToRepo(declaration.getSourceFile().fileName);
}

function isRepoOwnedExport(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): boolean {
  const sourcePath = getSourcePath(symbol, checker);
  return sourcePath !== "unknown" && !sourcePath.startsWith("node_modules/");
}

function getSignature(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): string | undefined {
  const target = resolveSymbol(symbol, checker);
  const decl = target.declarations?.[0];
  if (!decl) return undefined;
  const type = checker.getTypeOfSymbolAtLocation(target, decl);
  const sigs = type.getCallSignatures();
  if (sigs.length === 0) return undefined;
  // Use default truncation. NoTruncation blows up large component signatures.
  return checker.signatureToString(
    sigs[0],
    undefined,
    ts.TypeFormatFlags.WriteArrowStyleSignature,
  );
}

function getJsDocTags(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): ts.JSDocTagInfo[] {
  return resolveSymbol(symbol, checker).getJsDocTags(checker);
}

function extractExamples(tags: ts.JSDocTagInfo[]): string[] {
  return tags
    .filter((t) => t.name === "example")
    .map((t) => ts.displayPartsToString(t.text).trim())
    .filter(Boolean);
}

function extractParams(
  tags: ts.JSDocTagInfo[],
): { name: string; description: string }[] {
  return tags
    .filter((t) => t.name === "param")
    .map((t) => {
      const text = ts.displayPartsToString(t.text).trim();
      const match = text.match(/^(\w+)\s*[-–—]\s*(.*)/s);
      if (match) return { name: match[1], description: match[2].trim() };
      const spaceIdx = text.indexOf(" ");
      if (spaceIdx > 0) {
        return {
          name: text.slice(0, spaceIdx),
          description: text.slice(spaceIdx + 1).trim(),
        };
      }
      return { name: text, description: "" };
    });
}

function extractReturns(tags: ts.JSDocTagInfo[]): string | undefined {
  const tag = tags.find((t) => t.name === "returns" || t.name === "return");
  if (!tag) return undefined;
  return ts.displayPartsToString(tag.text).trim() || undefined;
}

function getInterfaceMembers(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): MemberInfo[] {
  const target = resolveSymbol(symbol, checker);
  const decl = target.declarations?.[0];
  if (!decl) return [];

  const type = checker.getDeclaredTypeOfSymbol(target);
  if (!type || !type.getProperties) return [];

  const props = type.getProperties();
  return props.map((prop) => {
    const propType = checker.getTypeOfSymbolAtLocation(prop, decl);
    const typeStr = checker.typeToString(
      propType,
      undefined,
      ts.TypeFormatFlags.NoTruncation,
    );
    const doc = ts
      .displayPartsToString(prop.getDocumentationComment(checker))
      .trim();
    return { name: prop.getName(), type: typeStr, description: doc };
  });
}

// ── Export Info Builder ──────────────────────────────────────────────────────

function buildExportInfo(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): ExportInfo {
  const tags = getJsDocTags(symbol, checker);
  return {
    name: symbol.getName(),
    kind: getDeclarationKind(symbol, checker),
    sourcePath: getSourcePath(symbol, checker),
    description: getDocString(symbol, checker),
    signature: getSignature(symbol, checker),
    params: extractParams(tags),
    returns: extractReturns(tags),
    examples: extractExamples(tags),
  };
}

// ── Grouping ─────────────────────────────────────────────────────────────────

/** For SDK Auth group, we need name-based matching for src/types exports. */
const AUTH_TYPE_NAMES = new Set([
  "AuthUser", "LoginBody", "LoginVars", "LoginResult", "LoginResponse",
  "RegisterBody", "RegisterVars", "LogoutVars", "ForgotPasswordBody",
  "MfaMethod", "MfaChallenge", "MfaVerifyBody", "MfaSetupResponse",
  "MfaVerifySetupBody", "MfaVerifySetupResponse", "MfaDisableBody",
  "MfaRecoveryCodesBody", "MfaRecoveryCodesResponse",
  "MfaEmailOtpEnableResponse", "MfaEmailOtpVerifySetupBody",
  "MfaEmailOtpDisableBody", "MfaResendBody", "MfaMethodsResponse",
  "ResetPasswordBody", "VerifyEmailBody", "ResendVerificationBody",
  "SetPasswordBody", "DeleteAccountBody", "RefreshTokenBody",
  "RefreshTokenResponse", "Session", "OAuthProvider", "OAuthExchangeBody",
  "OAuthExchangeResponse", "WebAuthnRegisterOptionsResponse",
  "WebAuthnRegisterBody", "WebAuthnCredential", "PasskeyLoginOptionsBody",
  "PasskeyLoginOptionsResponse", "PasskeyLoginBody", "PasskeyLoginVars",
  "AuthErrorContext", "AuthErrorConfig",
]);

const REALTIME_TYPE_NAMES = new Set([
  "SocketHook", "SseConfig", "SseEndpointConfig", "SseHookResult",
  "SseEventHookResult",
]);

const COMMUNITY_TYPE_NAMES = new Set([
  "CommunityNotification", "CommunityNotificationType",
  "UseCommunityNotificationsOpts", "UseCommunityNotificationsResult",
]);

function assignGroup(info: ExportInfo, groups: GroupRule[]): string {
  // Name-based overrides for types exported from src/types.ts (SDK surface)
  if (info.sourcePath.startsWith("src/types")) {
    if (AUTH_TYPE_NAMES.has(info.name)) return "Auth";
    if (REALTIME_TYPE_NAMES.has(info.name)) return "Realtime";
    if (COMMUNITY_TYPE_NAMES.has(info.name)) return "Community";
  }

  for (const g of groups) {
    if (g.test(info.sourcePath)) return g.label;
  }
  return "Other";
}

function groupExports(
  exports: ExportInfo[],
  groups: GroupRule[],
): Map<string, ExportInfo[]> {
  const grouped = new Map<string, ExportInfo[]>();
  // Initialize in group order so output order matches definition order
  for (const g of groups) {
    grouped.set(g.label, []);
  }
  for (const exp of exports) {
    const label = assignGroup(exp, groups);
    const list = grouped.get(label);
    if (list) {
      list.push(exp);
    } else {
      grouped.set(label, [exp]);
    }
  }
  // Remove empty groups
  for (const [key, val] of grouped) {
    if (val.length === 0) grouped.delete(key);
  }
  return grouped;
}

// ── Rendering ────────────────────────────────────────────────────────────────

function renderQuickRefTable(exports: ExportInfo[]): string {
  const rows = exports.map((e) => {
    const desc = escapeCell(e.description);
    return `| \`${escapeCell(e.name)}\` | ${escapeCell(e.kind)} | \`${escapeCell(e.sourcePath)}\` | ${desc} |`;
  });
  return [
    "| Export | Kind | Source | Description |",
    "|---|---|---|---|",
    ...rows,
  ].join("\n");
}

function renderExportDetail(
  exp: ExportInfo,
  checker: ts.TypeChecker,
  program: ts.Program,
  expandInterfaces?: Set<string>,
): string {
  const lines: string[] = [];

  // Heading — function with signature or name with kind
  // Truncate very long signatures from large component prop types.
  const MAX_SIG = 200;
  if (exp.kind === "function" && exp.signature) {
    const sig = exp.signature.length > MAX_SIG
      ? exp.signature.slice(0, MAX_SIG) + "..."
      : exp.signature;
    lines.push(`#### \`${exp.name}${sig}\``);
  } else {
    lines.push(`#### \`${exp.name}\` *(${exp.kind})*`);
  }
  lines.push("");

  // Description
  if (exp.description !== "No JSDoc description.") {
    lines.push(exp.description);
    lines.push("");
  }

  // Params
  if (exp.params && exp.params.length > 0) {
    lines.push("**Parameters:**");
    lines.push("");
    lines.push("| Name | Description |");
    lines.push("|------|-------------|");
    for (const p of exp.params) {
      lines.push(`| \`${escapeCell(p.name)}\` | ${escapeCell(p.description)} |`);
    }
    lines.push("");
  }

  // Returns
  if (exp.returns) {
    lines.push(`**Returns:** ${exp.returns}`);
    lines.push("");
  }

  // Interface member expansion
  if (
    expandInterfaces?.has(exp.name) &&
    (exp.kind === "interface" || exp.kind === "typealias")
  ) {
    const sourceFile = program.getSourceFile(
      path.resolve(repoPath(), exp.sourcePath),
    );
    if (sourceFile) {
      const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
      if (moduleSymbol) {
        const sym = checker
          .getExportsOfModule(moduleSymbol)
          .find((s) => s.getName() === exp.name);
        if (sym) {
          const members = getInterfaceMembers(sym, checker);
          if (members.length > 0) {
            lines.push("**Members:**");
            lines.push("");
            lines.push("| Name | Type | Description |");
            lines.push("|------|------|-------------|");
            for (const m of members) {
              const desc = m.description
                ? escapeCell(m.description)
                : "";
              const mType = escapeCell(
                m.type.length > 80 ? m.type.slice(0, 77) + "..." : m.type,
              );
              lines.push(
                `| \`${escapeCell(m.name)}\` | \`${mType}\` | ${desc} |`,
              );
            }
            lines.push("");
          }
        }
      }
    }
  }

  // Examples
  if (exp.examples && exp.examples.length > 0) {
    for (const ex of exp.examples) {
      lines.push("**Example:**");
      lines.push("");
      // If the example already has a code fence, use as-is; otherwise wrap it
      if (ex.startsWith("```")) {
        lines.push(ex);
      } else {
        lines.push("```ts");
        lines.push(ex);
        lines.push("```");
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

function renderGroupedSections(
  grouped: Map<string, ExportInfo[]>,
  checker: ts.TypeChecker,
  program: ts.Program,
  expandInterfaces?: string[],
): string {
  const expandSet = expandInterfaces
    ? new Set(expandInterfaces)
    : undefined;
  const sections: string[] = [];

  for (const [group, exports] of grouped) {
    const lines: string[] = [`## ${group}`, ""];

    // Group-level summary table
    lines.push("| Export | Kind | Description |");
    lines.push("|---|---|---|");
    for (const exp of exports) {
      lines.push(
        `| \`${escapeCell(exp.name)}\` | ${escapeCell(exp.kind)} | ${escapeCell(exp.description)} |`,
      );
    }
    lines.push("");

    // Detailed entries for exports that have rich JSDoc (signature, params, examples)
    const richExports = exports.filter(
      (e) =>
        (e.kind === "function" && e.signature) ||
        (e.params && e.params.length > 0) ||
        (e.examples && e.examples.length > 0) ||
        (e.returns) ||
        expandSet?.has(e.name),
    );

    if (richExports.length > 0) {
      lines.push("### Details");
      lines.push("");
      for (const exp of richExports) {
        lines.push(
          renderExportDetail(exp, checker, program, expandSet),
        );
        lines.push("---");
        lines.push("");
      }
    }

    sections.push(lines.join("\n"));
  }

  return sections.join("\n");
}

// ── Main ─────────────────────────────────────────────────────────────────────

function renderSurface(program: ts.Program, surface: Surface): void {
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(surface.file);
  if (!sourceFile) {
    throw new Error(`Missing source file: ${surface.file}`);
  }

  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) {
    throw new Error(`Missing module symbol for: ${surface.file}`);
  }

  const rawExports = checker
    .getExportsOfModule(moduleSymbol)
    .filter((symbol) => isRepoOwnedExport(symbol, checker))
    .filter((symbol) => symbol.getName() !== "default")
    .sort((a, b) => a.getName().localeCompare(b.getName()));

  const exports = rawExports.map((s) => buildExportInfo(s, checker));

  // Build page content
  const parts: string[] = [
    `Generated from \`${relToRepo(surface.file)}\`.`,
    "",
  ];

  if (surface.groups.length > 0) {
    // Grouped output: quick-ref table + grouped detailed sections
    const grouped = groupExports(exports, surface.groups);

    // Table of contents
    parts.push("## Contents");
    parts.push("");
    for (const [group, items] of grouped) {
      const anchor = group.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
      parts.push(`- [${group}](#${anchor}) (${items.length})`);
    }
    parts.push("");

    // Full alphabetical quick-reference (collapsed)
    parts.push("<details>");
    parts.push("<summary><strong>All exports (alphabetical)</strong></summary>");
    parts.push("");
    parts.push(renderQuickRefTable(exports));
    parts.push("");
    parts.push("</details>");
    parts.push("");

    // Grouped detailed sections
    parts.push(
      renderGroupedSections(
        grouped,
        checker,
        program,
        surface.expandInterfaces,
      ),
    );
  } else {
    // Flat output for small surfaces (SSR, Vite)
    parts.push(renderQuickRefTable(exports));
    parts.push("");

    // Still add detailed entries for exports with rich JSDoc
    const richExports = exports.filter(
      (e) =>
        (e.kind === "function" && e.signature) ||
        (e.params && e.params.length > 0) ||
        (e.examples && e.examples.length > 0) ||
        e.returns,
    );

    if (richExports.length > 0) {
      parts.push("## Details");
      parts.push("");
      for (const exp of richExports) {
        parts.push(renderExportDetail(exp, checker, program));
        parts.push("---");
        parts.push("");
      }
    }
  }

  writeDoc(
    surface.output,
    markdownPage(
      `${surface.label} Reference`,
      surface.description,
      parts.join("\n"),
    ),
  );
}

export function generateApiReference(): void {
  const program = getProgram();
  for (const surface of surfaces) {
    renderSurface(program, surface);
  }
}

if (import.meta.main) {
  generateApiReference();
}
