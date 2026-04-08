import type { ScaffoldConfig } from "../types";

export function generateEnv(config: ScaffoldConfig): string {
  const wsLine = config.webSocket
    ? "\nVITE_WS_URL=ws://localhost:3000/chat"
    : "";

  if (config.securityProfile === "hardened") {
    return `VITE_API_URL=http://localhost:3000${wsLine}
`;
  }

  // prototype
  return `VITE_API_URL=http://localhost:3000
# WARNING: Static API credentials should not be deployed to production.
VITE_BEARER_TOKEN=
# Set to true to allow running this prototype on non-localhost origins (not recommended for production).
VITE_ALLOW_PROTOTYPE_DEPLOYMENT=${wsLine}
`;
}
