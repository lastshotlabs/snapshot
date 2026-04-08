import path from "node:path";
import { text, select, multiselect, confirm, isCancel } from "@clack/prompts";
import { slugify } from "./utils";
import type { ScaffoldConfig } from "./types";

export const RECOMMENDED_COMPONENTS = [
  "button",
  "input",
  "card",
  "dialog",
  "form",
  "label",
  "badge",
  "avatar",
  "skeleton",
  "separator",
  "sonner",
  "dropdown-menu",
  "select",
  "sheet",
  "tabs",
];

const ALL_COMPONENTS = [
  ...RECOMMENDED_COMPONENTS,
  "table",
  "popover",
  "tooltip",
  "accordion",
  "alert",
  "calendar",
  "checkbox",
  "radio-group",
  "switch",
  "textarea",
  "progress",
  "slider",
];

interface PromptOptions {
  projectNameArg?: string;
  outputDirArg?: string;
  skipPrompts: boolean;
}

export async function runPrompts(
  opts: PromptOptions,
): Promise<ScaffoldConfig | null> {
  const { projectNameArg, outputDirArg, skipPrompts } = opts;

  // Project name — always prompt if not provided via arg
  let projectName: string;
  if (projectNameArg) {
    projectName = projectNameArg;
  } else {
    const val = await text({
      message: "Project name",
      placeholder: "My App",
      validate: (v) => {
        if (!v?.trim()) return "Project name is required";
      },
    });
    if (isCancel(val)) return null;
    projectName = val as string;
  }

  if (skipPrompts) {
    const packageName = slugify(projectName);
    const dir = outputDirArg
      ? path.resolve(process.cwd(), outputDirArg)
      : path.join(process.cwd(), packageName);
    return {
      projectName,
      packageName,
      dir,
      securityProfile: "hardened",
      layout: "top-nav",
      theme: "default",
      authPages: true,
      mfaPages: true,
      passkeyPages: true,
      components: RECOMMENDED_COMPONENTS,
      webSocket: true,
      communityPages: false,
      sse: false,
      mailPlugin: false,
      gitInit: true,
    };
  }

  // Package name
  const pkgVal = await text({
    message: "Package name",
    initialValue: slugify(projectName),
    validate: (v) => {
      if (!v?.trim()) return "Package name is required";
    },
  });
  if (isCancel(pkgVal)) return null;
  const packageName = pkgVal as string;

  // Output directory
  const dir = outputDirArg
    ? path.resolve(process.cwd(), outputDirArg)
    : path.join(process.cwd(), packageName);

  // Security profile
  const securityVal = await select({
    message: "Security profile",
    options: [
      { value: "hardened", label: "Hardened (recommended)" },
      { value: "prototype", label: "Prototype (local dev only)" },
    ],
    initialValue: "hardened",
  });
  if (isCancel(securityVal)) return null;
  const securityProfile = securityVal as ScaffoldConfig["securityProfile"];

  // Layout
  const layoutVal = await select({
    message: "Layout",
    options: [
      { value: "minimal", label: "Minimal", hint: "no nav — just a shell" },
      { value: "top-nav", label: "Top nav", hint: "header with nav links" },
      {
        value: "sidebar",
        label: "Sidebar",
        hint: "collapsible sidebar + header",
      },
    ],
    initialValue: "top-nav",
  });
  if (isCancel(layoutVal)) return null;
  const layout = layoutVal as ScaffoldConfig["layout"];

  // Theme
  const themeVal = await select({
    message: "Theme",
    options: [
      { value: "default", label: "Default", hint: "shadcn neutral" },
      { value: "dark", label: "Dark", hint: "dark mode default" },
      {
        value: "minimal",
        label: "Minimal",
        hint: "reduced radius, muted palette",
      },
      { value: "vibrant", label: "Vibrant", hint: "saturated, high contrast" },
    ],
    initialValue: "default",
  });
  if (isCancel(themeVal)) return null;
  const theme = themeVal as ScaffoldConfig["theme"];

  // Auth pages
  const authVal = await confirm({
    message: "Include auth pages?",
    initialValue: true,
  });
  if (isCancel(authVal)) return null;
  const authPages = authVal as boolean;

  // MFA pages (only if auth pages enabled)
  let mfaPages = false;
  if (authPages) {
    const mfaVal = await confirm({
      message: "Include MFA pages?",
      initialValue: false,
    });
    if (isCancel(mfaVal)) return null;
    mfaPages = mfaVal as boolean;
  }

  // Passkey pages (only if auth pages enabled)
  let passkeyPages = false;
  if (authPages) {
    const passkeyVal = await confirm({
      message: "Include passkey login pages?",
      initialValue: false,
    });
    if (isCancel(passkeyVal)) return null;
    passkeyPages = passkeyVal as boolean;
  }

  // shadcn components
  const componentsVal = await multiselect({
    message: "shadcn components",
    options: ALL_COMPONENTS.map((c) => ({ value: c, label: c })),
    initialValues: RECOMMENDED_COMPONENTS,
    required: false,
  });
  if (isCancel(componentsVal)) return null;
  const components = componentsVal as string[];

  // WebSocket
  const wsVal = await confirm({
    message: "WebSocket support?",
    initialValue: true,
  });
  if (isCancel(wsVal)) return null;
  const webSocket = wsVal as boolean;

  // Community pages
  const communityVal = await confirm({
    message: "Include community pages? (thread list, thread detail)",
    initialValue: false,
  });
  if (isCancel(communityVal)) return null;
  const communityPages = communityVal as boolean;

  // SSE onramp
  const sseVal = await confirm({
    message: "Include SSE (Server-Sent Events) onramp code?",
    initialValue: false,
  });
  if (isCancel(sseVal)) return null;
  const sse = sseVal as boolean;

  // Mail plugin (bunshot-mail)
  const mailVal = await confirm({
    message:
      "Scaffold bunshot-mail plugin config? (Resend + auth delivery events)",
    initialValue: false,
  });
  if (isCancel(mailVal)) return null;
  const mailPlugin = mailVal as boolean;

  // Git init
  const gitVal = await confirm({
    message: "Git init?",
    initialValue: true,
  });
  if (isCancel(gitVal)) return null;
  const gitInit = gitVal as boolean;

  return {
    projectName,
    packageName,
    dir,
    securityProfile,
    layout,
    theme,
    authPages,
    mfaPages,
    passkeyPages,
    components,
    webSocket,
    communityPages,
    sse,
    mailPlugin,
    gitInit,
  };
}
