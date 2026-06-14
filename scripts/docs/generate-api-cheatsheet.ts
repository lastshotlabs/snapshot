import path from "node:path";
import { writeFileSync, mkdirSync } from "node:fs";
import * as ts from "typescript";
import { repoPath, relToRepo } from "./_common.ts";

/**
 * Generate docs/api-cheatsheet.md — a condensed single-file API reference
 * for fast agent and human consumption. Auto-generated from source.
 */

// ── TS Setup ─────────────────────────────────────────────────────────────────

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
  return ts.createProgram({ rootNames: parsed.fileNames, options: parsed.options });
}

function resolveSymbol(s: ts.Symbol, c: ts.TypeChecker): ts.Symbol {
  return s.flags & ts.SymbolFlags.Alias ? c.getAliasedSymbol(s) : s;
}

function docOf(s: ts.Symbol, c: ts.TypeChecker): string {
  const t = resolveSymbol(s, c);
  return ts.displayPartsToString(t.getDocumentationComment(c)).trim();
}

function sigOf(s: ts.Symbol, c: ts.TypeChecker): string | undefined {
  const t = resolveSymbol(s, c);
  const d = t.declarations?.[0];
  if (!d) return undefined;
  const type = c.getTypeOfSymbolAtLocation(t, d);
  const sigs = type.getCallSignatures();
  if (sigs.length === 0) return undefined;
  return c.signatureToString(sigs[0], undefined, ts.TypeFormatFlags.WriteArrowStyleSignature);
}

function sourcePath(s: ts.Symbol, c: ts.TypeChecker): string {
  const t = resolveSymbol(s, c);
  const d = t.declarations?.[0];
  if (!d) return "unknown";
  return relToRepo(d.getSourceFile().fileName);
}

function kindOf(s: ts.Symbol, c: ts.TypeChecker): string {
  const t = resolveSymbol(s, c);
  const d = t.declarations?.[0];
  if (!d) return "unknown";
  return (ts.SyntaxKind[d.kind] ?? "unknown")
    .replace(/Declaration$/, "")
    .replace(/Signature$/, "")
    .replace(/^JSDoc/, "")
    .toLowerCase();
}

// ── Cheatsheet line formatters ───────────────────────────────────────────────

function funcLine(name: string, sig: string | undefined, doc: string): string {
  const desc = doc && doc !== "No JSDoc description." ? ` — ${firstSentence(doc)}` : "";
  const sigStr = sig ? `${name}${sig}` : name;
  // Truncate very long signatures
  const display = sigStr.length > 120 ? sigStr.slice(0, 117) + "..." : sigStr;
  return `- \`${display}\`${desc}`;
}

function typeLine(name: string, kind: string, doc: string): string {
  const desc = doc && doc !== "No JSDoc description." ? ` — ${firstSentence(doc)}` : "";
  return `- \`${name}\` *(${kind})*${desc}`;
}

function memberLine(name: string, type: string, doc: string): string {
  const desc = doc && doc !== "No JSDoc description." && doc
    ? ` — ${firstSentence(doc)}`
    : "";
  const typeStr = type.length > 80 ? type.slice(0, 77) + "..." : type;
  return `- \`${name}\`: \`${typeStr}\`${desc}`;
}

function firstSentence(text: string): string {
  const cleaned = text.replace(/\r?\n/g, " ").trim();
  const dot = cleaned.indexOf(". ");
  return dot > 0 ? cleaned.slice(0, dot + 1) : cleaned;
}

// ── Main generation ──────────────────────────────────────────────────────────

type ExportEntry = {
  name: string;
  kind: string;
  source: string;
  doc: string;
  sig?: string;
};

function getModuleExports(
  program: ts.Program,
  checker: ts.TypeChecker,
  filePath: string,
): ExportEntry[] {
  const sf = program.getSourceFile(filePath);
  if (!sf) throw new Error(`Missing: ${filePath}`);
  const mod = checker.getSymbolAtLocation(sf);
  if (!mod) throw new Error(`No module symbol: ${filePath}`);
  return checker
    .getExportsOfModule(mod)
    .filter((s) => {
      const p = sourcePath(s, checker);
      return p !== "unknown" && !p.startsWith("node_modules/");
    })
    .filter((s) => s.getName() !== "default")
    .map((s) => ({
      name: s.getName(),
      kind: kindOf(s, checker),
      source: sourcePath(s, checker),
      doc: docOf(s, checker),
      sig: sigOf(s, checker),
    }));
}

function getInterfaceMembers(
  program: ts.Program,
  checker: ts.TypeChecker,
  filePath: string,
  interfaceName: string,
): { name: string; type: string; doc: string }[] {
  const sf = program.getSourceFile(filePath);
  if (!sf) return [];
  const mod = checker.getSymbolAtLocation(sf);
  if (!mod) return [];
  const sym = checker.getExportsOfModule(mod).find((s) => s.getName() === interfaceName);
  if (!sym) return [];
  const target = resolveSymbol(sym, checker);
  const decl = target.declarations?.[0];
  if (!decl) return [];
  const type = checker.getDeclaredTypeOfSymbol(target);
  return type.getProperties().map((p) => {
    const pType = checker.getTypeOfSymbolAtLocation(p, decl);
    return {
      name: p.getName(),
      type: checker.typeToString(pType),
      doc: ts.displayPartsToString(p.getDocumentationComment(checker)).trim(),
    };
  });
}

// ── Group helpers ────────────────────────────────────────────────────────────

function groupBy(
  entries: ExportEntry[],
  rules: [string, (e: ExportEntry) => boolean][],
): Map<string, ExportEntry[]> {
  const groups = new Map<string, ExportEntry[]>();
  for (const [label] of rules) groups.set(label, []);
  groups.set("Other", []);

  for (const entry of entries) {
    let placed = false;
    for (const [label, test] of rules) {
      if (test(entry)) {
        groups.get(label)!.push(entry);
        placed = true;
        break;
      }
    }
    if (!placed) groups.get("Other")!.push(entry);
  }

  for (const [key, val] of groups) {
    if (val.length === 0) groups.delete(key);
  }
  return groups;
}

function renderGroup(label: string, entries: ExportEntry[]): string {
  const lines = [`### ${label}`];
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.kind === "function" || e.kind === "variable") {
      lines.push(funcLine(e.name, e.sig, e.doc));
    } else {
      lines.push(typeLine(e.name, e.kind, e.doc));
    }
  }
  return lines.join("\n");
}

// ── SDK Section ──────────────────────────────────────────────────────────────

const AUTH_TYPE_RE = /Auth|Login|Register|Logout|Forgot|Mfa|OAuth|WebAuthn|Passkey|Session|Password|Verification|Token(?!Storage)/;
const SSE_TYPE_NAMES = new Set(["SocketHook", "SseConfig", "SseEndpointConfig", "SseHookResult", "SseEventHookResult"]);
const COMMUNITY_TYPE_NAMES = new Set(["CommunityNotification", "CommunityNotificationType", "UseCommunityNotificationsOpts", "UseCommunityNotificationsResult"]);

const sdkRules: [string, (e: ExportEntry) => boolean][] = [
  ["Factory", (e) => e.source.startsWith("src/create-snapshot")],
  ["API Client", (e) => e.source.startsWith("src/api/")],
  ["Auth", (e) => e.source.startsWith("src/auth/") || (e.source.startsWith("src/types") && AUTH_TYPE_RE.test(e.name))],
  ["Community", (e) => e.source.startsWith("src/community/") || (e.source.startsWith("src/types") && COMMUNITY_TYPE_NAMES.has(e.name))],
  ["Webhooks", (e) => e.source.startsWith("src/webhooks/")],
  ["Plugins", (e) => e.source.startsWith("src/plugin")],
  ["Push Notifications", (e) => e.source.startsWith("src/push/")],
  ["Realtime", (e) => e.source.startsWith("src/sse/") || e.source.startsWith("src/ws/") || (e.source.startsWith("src/types") && SSE_TYPE_NAMES.has(e.name))],
  ["Schema Generation", (e) => e.source.startsWith("src/schema-generator")],
];

// ── UI Section ───────────────────────────────────────────────────────────────

const uiRules: [string, (e: ExportEntry) => boolean][] = [
  ["Tokens & Flavors", (e) => e.source.startsWith("src/ui/tokens/") || e.source.startsWith("src/ui/analytics/") || e.source.startsWith("src/api/")],
  ["Context & Data Binding", (e) => e.source.startsWith("src/ui/context/")],
  ["State Runtime", (e) => e.source.startsWith("src/ui/state/")],
  ["Actions", (e) => e.source.startsWith("src/ui/actions/")],
  ["Data Components", (e) => e.source.startsWith("src/ui/components/data/")],
  ["Form Components", (e) => e.source.startsWith("src/ui/components/forms/")],
  ["Communication Components", (e) => e.source.startsWith("src/ui/components/communication/")],
  ["Content Components", (e) => e.source.startsWith("src/ui/components/content/")],
  ["Overlay Components", (e) => e.source.startsWith("src/ui/components/overlay/")],
  ["Navigation Components", (e) => e.source.startsWith("src/ui/components/navigation/")],
  ["Layout Components", (e) => e.source.startsWith("src/ui/components/layout/")],
  ["Media Components", (e) => e.source.startsWith("src/ui/components/media/")],
  ["Hooks & Utilities", (e) => e.source.startsWith("src/ui/hooks/") || e.source.startsWith("src/ui/components/_base/")],
  ["Icons", (e) => e.source.startsWith("src/ui/icons/")],
  ["Workflows", (e) => e.source.startsWith("src/ui/workflows/")],
];

// ── Build Cheatsheet ─────────────────────────────────────────────────────────

export function generateApiCheatsheet(): void {
  const program = getProgram();
  const checker = program.getTypeChecker();

  const lines: string[] = [
    "# Snapshot API Cheatsheet",
    "",
    "> Auto-generated from source. For full details see the reference pages under `apps/docs/src/content/docs/reference/`.",
    "",
  ];

  // ── SDK Section ──────────────────────────────────────────────────────────

  lines.push("## SDK (`@lastshotlabs/snapshot`)");
  lines.push("");

  const sdkExports = getModuleExports(program, checker, repoPath("src", "index.ts"));
  const sdkGroups = groupBy(sdkExports, sdkRules);
  for (const [label, entries] of sdkGroups) {
    lines.push(renderGroup(label, entries));
    lines.push("");
  }

  // ── SnapshotInstance Hook Surface ────────────────────────────────────────

  lines.push("## SnapshotInstance Hook Surface");
  lines.push("");
  lines.push("These are the hooks and methods available on the object returned by `createSnapshot()`.");
  lines.push("");

  const instanceMembers = getInterfaceMembers(
    program, checker, repoPath("src", "types.ts"), "SnapshotInstance",
  );

  // Sub-group instance members by their comment sections in source
  const instanceGroups: [string, string[]][] = [
    ["Auth", ["useUser", "useLogin", "useLogout", "useRegister", "useForgotPassword", "isMfaChallenge", "formatAuthError"]],
    ["Theme", ["useTheme"]],
    ["MFA", ["usePendingMfaChallenge", "useMfaVerify", "useMfaSetup", "useMfaVerifySetup", "useMfaDisable", "useMfaRecoveryCodes", "useMfaEmailOtpEnable", "useMfaEmailOtpVerifySetup", "useMfaEmailOtpDisable", "useMfaResend", "useMfaMethods"]],
    ["Account", ["useResetPassword", "useVerifyEmail", "useResendVerification", "useSetPassword", "useDeleteAccount", "useCancelDeletion", "useRefreshToken", "useSessions", "useRevokeSession"]],
    ["OAuth", ["useOAuthExchange", "useOAuthUnlink", "getOAuthUrl", "getLinkUrl"]],
    ["WebAuthn & Passkeys", ["useWebAuthnRegisterOptions", "useWebAuthnRegister", "useWebAuthnCredentials", "useWebAuthnRemoveCredential", "useWebAuthnDisable", "usePasskeyLoginOptions", "usePasskeyLogin"]],
    ["Realtime", ["useSocket", "useRoom", "useRoomEvent", "useSSE", "useSseEvent", "onSseEvent", "useCommunityNotifications"]],
    ["Community", [
      "useContainers", "useContainer", "useCreateContainer", "useUpdateContainer", "useDeleteContainer",
      "useContainerThreads", "useContainerThread", "useCreateThread", "useUpdateThread", "useDeleteThread",
      "usePublishThread", "useLockThread", "usePinThread", "useUnpinThread",
      "useThreadReplies", "useReply", "useCreateReply", "useUpdateReply", "useDeleteReply",
      "useThreadReactions", "useReplyReactions", "useAddThreadReaction", "useRemoveThreadReaction",
      "useAddReplyReaction", "useRemoveReplyReaction",
      "useContainerMembers", "useContainerModerators", "useContainerOwners",
      "useAddMember", "useRemoveMember", "useAssignModerator", "useRemoveModerator",
      "useAssignOwner", "useRemoveOwner",
      "useNotifications", "useNotificationsUnreadCount", "useMarkNotificationRead", "useMarkAllNotificationsRead",
      "useReports", "useReport", "useCreateReport", "useResolveReport", "useDismissReport",
      "useBans", "useCheckBan", "useCreateBan", "useRemoveBan",
      "useSearchThreads", "useSearchReplies",
    ]],
    ["Webhooks", [
      "useWebhookEndpoints", "useWebhookEndpoint", "useCreateWebhookEndpoint",
      "useUpdateWebhookEndpoint", "useDeleteWebhookEndpoint",
      "useWebhookDeliveries", "useWebhookDelivery", "useTestWebhookEndpoint",
    ]],
    ["Infrastructure", ["api", "tokenStorage", "queryClient", "useWebSocketManager", "bootstrap"]],
    ["Routing", ["protectedBeforeLoad", "guestBeforeLoad", "protect", "guest", "setNavigator"]],
    ["Scaffold", ["QueryProvider"]],
  ];

  const memberMap = new Map(instanceMembers.map((m) => [m.name, m]));

  for (const [groupLabel, names] of instanceGroups) {
    lines.push(`### ${groupLabel}`);
    for (const name of names) {
      const m = memberMap.get(name);
      if (m) {
        lines.push(memberLine(m.name, m.type, m.doc));
      }
    }
    lines.push("");
  }

  // ── UI Section ───────────────────────────────────────────────────────────

  lines.push("## UI (`@lastshotlabs/snapshot/ui`)");
  lines.push("");

  const uiExports = getModuleExports(program, checker, repoPath("src", "ui.ts"));
  const uiGrouped = groupBy(uiExports, uiRules);
  for (const [label, entries] of uiGrouped) {
    lines.push(renderGroup(label, entries));
    lines.push("");
  }

  // ── SSR Section ──────────────────────────────────────────────────────────

  lines.push("## SSR (`@lastshotlabs/snapshot/ssr`)");
  lines.push("");

  const ssrExports = getModuleExports(program, checker, repoPath("src", "ssr", "index.ts"));
  for (const e of ssrExports.sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.kind === "function" || e.kind === "variable") {
      lines.push(funcLine(e.name, e.sig, e.doc));
    } else {
      lines.push(typeLine(e.name, e.kind, e.doc));
    }
  }
  lines.push("");

  // ── Vite Section ─────────────────────────────────────────────────────────

  lines.push("## Vite (`@lastshotlabs/snapshot/vite`)");
  lines.push("");

  const viteExports = getModuleExports(program, checker, repoPath("src", "vite", "index.ts"));
  for (const e of viteExports.sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.kind === "function" || e.kind === "variable") {
      lines.push(funcLine(e.name, e.sig, e.doc));
    } else {
      lines.push(typeLine(e.name, e.kind, e.doc));
    }
  }
  lines.push("");

  // ── Write ────────────────────────────────────────────────────────────────

  const outPath = repoPath("docs", "api-cheatsheet.md");
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, lines.join("\n").trim() + "\n", "utf8");
}

if (import.meta.main) {
  generateApiCheatsheet();
}
