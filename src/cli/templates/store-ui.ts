import type { ScaffoldConfig } from "../types";

export function generateStoreUi(config: ScaffoldConfig): string {
  const sidebarAtom =
    config.layout === "sidebar"
      ? `\nexport const sidebarOpenAtom = atom(false)\n`
      : "";

  const wsAtom = config.webSocket
    ? `\nexport const wsConnectedAtom = atom(false)\n`
    : "";

  const hasExports = config.layout === "sidebar" || config.webSocket;
  const fallback = !hasExports ? "\nexport {}\n" : "";

  return `import { atom } from 'jotai'
${sidebarAtom}${wsAtom}${fallback}`;
}
