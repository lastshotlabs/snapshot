import type { ApiClient } from "../api/client";
import type { ApiError } from "../api/error";
import type { TokenStorage } from "./storage";
import type { OAuthProvider, OAuthExchangeBody, OAuthExchangeResponse } from "../types";
import type { AuthContract } from "../auth/contract";
interface OAuthHooksConfig {
    auth?: "cookie" | "token";
    homePath?: string;
    providers?: Record<string, {
        type: "google" | "github" | "microsoft" | "apple" | "facebook" | "discord" | "custom";
        clientId?: string;
        scopes?: string[];
        callbackPath?: string;
        name?: string;
    }>;
}
interface OAuthHooksOptions {
    api: ApiClient;
    storage: TokenStorage;
    config: OAuthHooksConfig;
    contract: AuthContract;
    onLoginSuccess?: () => void;
}
/**
 * Create OAuth-related hooks bound to a single snapshot instance.
 */
export declare function createOAuthHooks({ api, storage, config, contract, onLoginSuccess, }: OAuthHooksOptions): {
    getOAuthUrl: (provider: OAuthProvider) => string;
    getLinkUrl: (provider: OAuthProvider) => string;
    useOAuthExchange: () => import("@tanstack/react-query").UseMutationResult<OAuthExchangeResponse, ApiError, OAuthExchangeBody, unknown>;
    useOAuthUnlink: () => import("@tanstack/react-query").UseMutationResult<void, ApiError, OAuthProvider, unknown>;
};
export {};
