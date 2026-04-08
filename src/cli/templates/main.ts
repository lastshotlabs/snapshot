import type { ScaffoldConfig } from "../types";

export function generateMain(config: ScaffoldConfig): string {
  const hasTooltip = config.components.includes("tooltip");

  const tooltipImport = hasTooltip
    ? `import { TooltipProvider } from '@components/ui/tooltip'\n`
    : "";

  const inner = hasTooltip
    ? `      <TooltipProvider>\n        <RouterProvider router={router} />\n      </TooltipProvider>`
    : `      <RouterProvider router={router} />`;

  return `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryProvider } from '@lib/snapshot'
import { router } from '@lib/router'
${tooltipImport}import '@styles/globals.css'

// StrictMode double-invokes effects in dev.
// WebSocket will connect, disconnect, reconnect on mount — expected, not a bug.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
${inner}
    </QueryProvider>
  </StrictMode>
)
`;
}
