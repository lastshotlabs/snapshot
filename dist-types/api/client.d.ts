import type { RequestOptions } from "../types";
import type { TokenStorage } from "../auth/storage";
import type { AuthContract } from "../auth/contract";
/**
 * API client surface required by manifest runtime resources.
 */
export interface ApiClientLike {
    request<T>(method: string, path: string, body?: unknown, options?: RequestOptions): Promise<T>;
    get<T>(path: string, options?: RequestOptions): Promise<T>;
    post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>;
    put<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>;
    patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>;
    delete<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
}
/**
 * Bootstrap values exposed to custom client factories.
 */
export interface CustomClientBootstrap {
    env?: Record<string, string | undefined>;
    bearerToken?: string;
}
/**
 * Factory contract for manifest-declared custom clients.
 */
export type ClientFactory = (apiUrl: string, bootstrap: CustomClientBootstrap) => ApiClientLike;
/**
 * Register a named custom client factory.
 *
 * @param name - Manifest-facing client factory name
 * @param factory - Factory that creates an ApiClient-like instance
 */
export declare function registerClient(name: string, factory: ClientFactory): void;
/**
 * Look up a previously registered custom client factory.
 *
 * @param name - Registered client factory name
 * @returns The registered factory when found
 */
export declare function getRegisteredClient(name: string): ClientFactory | undefined;
interface ApiClientConfig {
    apiUrl: string;
    auth?: "cookie" | "token";
    bearerToken?: string;
    onUnauthenticated?: () => void;
    onForbidden?: () => void;
    contract: AuthContract;
    defaultHeadersProvider?: () => Record<string, string> | undefined;
}
/**
 * Per-instance API client bound to a single snapshot bootstrap.
 */
export declare class ApiClient implements ApiClientLike {
    private readonly baseUrl;
    private readonly authMode;
    private readonly bearerToken;
    private readonly contract;
    private defaultHeadersProvider?;
    private storage;
    private onUnauthenticated;
    private onForbidden;
    constructor(config: ApiClientConfig);
    setStorage(storage: TokenStorage): void;
    setDefaultHeadersProvider(provider?: () => Record<string, string> | undefined): void;
    private buildHeaders;
    private rawFetch;
    private handleResponse;
    private executeRequest;
    request<T>(method: string, path: string, body?: unknown, options?: RequestOptions): Promise<T>;
    get<T>(path: string, options?: RequestOptions): Promise<T>;
    post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>;
    put<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>;
    patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>;
    delete<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
}
export {};
