import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

export interface QueryProviderProps {
  client: QueryClient;
  children: ReactNode;
}

// Internal component — apps use the pre-bound version returned by createSnapshot
export function QueryProviderInner({ client, children }: QueryProviderProps) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
