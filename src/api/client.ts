import { ApiError } from "./error";
import { getCsrfToken, isMutatingMethod } from "../auth/csrf";
import type { RequestOptions } from "../types";
import type { TokenStorage } from "../auth/storage";
import type { AuthContract } from "../auth/contract";

/**
 * API client surface required by manifest runtime resources.
 */
export interface ApiClientLike {
  request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T>;
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
export type ClientFactory = (
  apiUrl: string,
  bootstrap: CustomClientBootstrap,
) => ApiClientLike;

const clientFactories = new Map<string, ClientFactory>();

/**
 * Register a named custom client factory.
 *
 * @param name - Manifest-facing client factory name
 * @param factory - Factory that creates an ApiClient-like instance
 */
export function registerClient(name: string, factory: ClientFactory): void {
  clientFactories.set(name, factory);
}

/**
 * Look up a previously registered custom client factory.
 *
 * @param name - Registered client factory name
 * @returns The registered factory when found
 */
export function getRegisteredClient(name: string): ClientFactory | undefined {
  return clientFactories.get(name);
}

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
export class ApiClient implements ApiClientLike {
  private readonly baseUrl: string;
  private readonly authMode: "cookie" | "token";
  private readonly bearerToken: string | undefined;
  private readonly contract: AuthContract;
  private defaultHeadersProvider?: () => Record<string, string> | undefined;
  private storage: TokenStorage | null = null;
  private onUnauthenticated: (() => void) | undefined;
  private onForbidden: (() => void) | undefined;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.apiUrl.replace(/\/$/, "");
    this.authMode = config.auth ?? "cookie";
    this.bearerToken = config.bearerToken;
    this.contract = config.contract;
    this.defaultHeadersProvider = config.defaultHeadersProvider;
    this.onUnauthenticated = config.onUnauthenticated;
    this.onForbidden = config.onForbidden;

    if (this.bearerToken && typeof window !== "undefined") {
      console.warn(
        "[snapshot] bearerToken is a static API credential. " +
          "It should not be used in browser deployments. " +
          "See the snapshot security docs for the recommended cookie-auth model.",
      );
    }

    if (this.authMode === "token" && typeof window !== "undefined") {
      console.warn(
        "[snapshot] Cookie mode is recommended for browser deployments. " +
          "token auth mode is less secure in browser contexts.",
      );
    }
  }

  setStorage(storage: TokenStorage) {
    this.storage = storage;
  }

  setDefaultHeadersProvider(
    provider?: () => Record<string, string> | undefined,
  ): void {
    this.defaultHeadersProvider = provider;
  }

  private buildHeaders(
    method: string,
    overrides?: Record<string, string>,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      ...(this.defaultHeadersProvider?.() ?? {}),
      "Content-Type": "application/json",
      ...overrides,
    };

    // API-level bearer token (always sent, independent of user auth mode)
    if (this.bearerToken) {
      headers["Authorization"] = `Bearer ${this.bearerToken}`;
    }

    if (this.authMode === "cookie") {
      if (isMutatingMethod(method)) {
        const csrf = getCsrfToken(this.contract.csrfCookieName);
        if (csrf) headers[this.contract.headers.csrf] = csrf;
      }
      return headers;
    }

    const userToken = this.storage?.get();
    if (userToken) {
      headers[this.contract.headers.userToken] = userToken;
    }

    if (
      typeof process !== "undefined" &&
      process.env?.["NODE_ENV"] !== "production" &&
      !this.bearerToken &&
      !userToken
    ) {
      console.warn(
        "[snapshot] No auth credentials attached to request. " +
          "Set bearerToken in createSnapshot config or ensure a user token is stored.",
      );
    }

    return headers;
  }

  private async rawFetch(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers = this.buildHeaders(method, options?.headers);

    const init: RequestInit = { method, headers };
    if (this.authMode === "cookie") init.credentials = "include";
    if (body !== undefined) init.body = JSON.stringify(body);
    if (options?.signal) init.signal = options.signal;

    return fetch(url, init);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 403) {
      const body = await response.json().catch(() => null);
      this.onForbidden?.();
      throw new ApiError(403, body);
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new ApiError(response.status, body);
    }

    // Handle empty responses (204 No Content etc.)
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  private async executeRequest<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const response = await this.rawFetch(method, path, body, options);

    if (response.status === 401) {
      const refreshToken = this.storage?.getRefreshToken();

      const refreshEndpoint = this.contract.endpoints.refresh;

      if (refreshToken && path !== refreshEndpoint) {
        // Attempt token refresh using a raw fetch to avoid infinite loops
        try {
          const refreshResponse = await fetch(
            `${this.baseUrl}${refreshEndpoint}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
              credentials: "include",
            },
          );

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            this.storage?.set(refreshData.token);
            if (refreshData.refreshToken) {
              this.storage?.setRefreshToken(refreshData.refreshToken);
            }
            // Retry the original request once with the new token
            const retryResponse = await this.rawFetch(
              method,
              path,
              body,
              options,
            );
            return this.handleResponse<T>(retryResponse);
          }
        } catch {
          // refresh failed — fall through to cleanup
        }
      }

      this.storage?.clear();
      this.storage?.clearRefreshToken();
      this.onUnauthenticated?.();
      const errBody = await response.json().catch(() => null);
      throw new ApiError(401, errBody);
    }

    return this.handleResponse<T>(response);
  }

  request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.executeRequest<T>(method, path, body, options);
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.executeRequest<T>("GET", path, undefined, options);
  }

  post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.executeRequest<T>("POST", path, body, options);
  }

  put<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.executeRequest<T>("PUT", path, body, options);
  }

  patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.executeRequest<T>("PATCH", path, body, options);
  }

  delete<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.executeRequest<T>("DELETE", path, body, options);
  }
}
