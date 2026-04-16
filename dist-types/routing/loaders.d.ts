import type { QueryClient } from "@tanstack/react-query";
import type { ApiClient } from "../api/client";
import type { AuthContract } from "../auth/contract";
interface RouterContext {
    context: {
        queryClient: QueryClient;
    };
}
interface LoaderConfig {
    loginPath?: string;
    homePath?: string;
    onUnauthenticated?: () => void;
    staleTime?: number;
}
/**
 * Create router before-load guards bound to a single snapshot instance.
 */
export declare function createLoaders(config: LoaderConfig, api: ApiClient, contract: AuthContract): {
    protectedBeforeLoad: ({ context, }: RouterContext) => Promise<void>;
    guestBeforeLoad: ({ context }: RouterContext) => Promise<void>;
};
export {};
