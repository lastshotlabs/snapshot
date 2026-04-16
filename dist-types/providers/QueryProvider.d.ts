import type { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
export interface QueryProviderProps {
    client: QueryClient;
    children: ReactNode;
}
export declare function QueryProviderInner({ client, children }: QueryProviderProps): import("react/jsx-runtime").JSX.Element;
