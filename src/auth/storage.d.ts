/**
 * Per-instance token storage used by Snapshot auth flows.
 */
export interface TokenStorage {
    get: () => string | null;
    set: (token: string) => void;
    clear: () => void;
    getRefreshToken: () => string | null;
    setRefreshToken: (token: string) => void;
    clearRefreshToken: () => void;
}
/**
 * Token storage settings used by the bootstrap runtime.
 */
interface TokenStorageConfig {
    auth?: "cookie" | "token";
    tokenStorage?: "localStorage" | "sessionStorage" | "memory";
    tokenKey?: string;
}
/**
 * Create the token storage implementation for the current auth mode.
 *
 * @param config - Auth/bootstrap token storage options
 * @returns A per-instance token storage backend
 */
export declare function createTokenStorage(config: TokenStorageConfig): TokenStorage;
export {};
