import { ApiError } from "./error";
import { getCsrfToken, isMutatingMethod } from "../auth/csrf";
import type { RequestOptions } from "../types";
import type { TokenStorage } from "../auth/storage";
import type { AuthContract } from "../auth/contract";

/**
 * API client surface shared by the runtime and generated clients.
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
 * Factory contract for custom clients.
 */
export type ClientFactory = (
  apiUrl: string,
  bootstrap: CustomClientBootstrap,
) => ApiClientLike;

const clientFactories = new Map<string, ClientFactory>();

/**
 * Register a named custom client factory.
 *
 * @param name - Client factory name
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
  private refreshInFlight: Promise<boolean> | null = null;

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

    if (response.status === 404) {
      return null as T;
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

  /**
   * Attempt to renew the session with whatever refresh credential this auth
   * mode has: the stored refresh token in `token` mode, or the httpOnly
   * `refresh_token` cookie in `cookie` mode (the browser attaches it — the
   * client never reads it, so "no readable token" is the NORMAL cookie-mode
   * state, not a reason to skip). Single-flight: concurrent 401s share one
   * round-trip, which also keeps server-side token rotation from racing
   * itself.
   *
   * @returns true when the server issued a fresh session credential.
   */
  tryRefreshSession(): Promise<boolean> {
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.doRefreshSession().finally(() => {
        this.refreshInFlight = null;
      });
    }
    return this.refreshInFlight;
  }

  private async doRefreshSession(): Promise<boolean> {
    const refreshToken = this.storage?.getRefreshToken() ?? null;
    if (this.authMode === "token" && !refreshToken) return false;

    try {
      const csrf = getCsrfToken(this.contract.csrfCookieName);
      const response = await fetch(
        `${this.baseUrl}${this.contract.endpoints.refresh}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(csrf ? { [this.contract.headers.csrf]: csrf } : {}),
          },
          body: JSON.stringify(refreshToken ? { refreshToken } : {}),
          credentials: "include",
        },
      );
      if (!response.ok) return false;
      const data = await response.json().catch(() => null);
      if (data?.token) this.storage?.set(data.token);
      if (data?.refreshToken) this.storage?.setRefreshToken(data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  /** The user token that would be attached to a request sent right now. */
  private currentUserToken(): string | null {
    if (this.authMode !== "token") return null;
    return this.storage?.get() ?? null;
  }

  private async executeRequest<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    let tokenUsed = this.currentUserToken();
    let response = await this.rawFetch(method, path, body, options);

    if (response.status === 401 && this.authMode === "token") {
      // The stored credential may have CHANGED while this request was in
      // flight — a login or a guest-session mint landing after the headers
      // were built. That 401 is about the old credential, not the new one:
      // retry once with the current token instead of treating it as a real
      // authentication failure. Without this, the stale 401 below would
      // clear a token that never failed — which is how a guest mint, an
      // in-flight tokenless request and a `useUser` refetch chained into an
      // unbounded mint storm (hundreds of fresh guest identities per minute).
      const tokenNow = this.currentUserToken();
      if (tokenNow !== tokenUsed) {
        tokenUsed = tokenNow;
        response = await this.rawFetch(method, path, body, options);
      }
    }

    if (response.status === 401) {
      // Refresh works in BOTH auth modes: token mode sends the stored
      // refresh token, cookie mode leans on the httpOnly refresh cookie.
      // (Cookie mode previously never refreshed at all, so every session
      // hard-died at access-token expiry mid-visit.)
      if (
        path !== this.contract.endpoints.refresh &&
        (await this.tryRefreshSession())
      ) {
        // Retry the original request once with the renewed credential. A
        // retry that STILL 401s means the renewed session is no good either
        // — fall through to the cleanup below instead of throwing early,
        // so `onUnauthenticated` fires exactly like an unrefreshable 401.
        const retryResponse = await this.rawFetch(method, path, body, options);
        if (retryResponse.status !== 401) {
          return this.handleResponse<T>(retryResponse);
        }
        response = retryResponse;
      }

      // Cleanup applies only to the credential that actually failed. If the
      // stored token changed again since the failing attempt went out, this
      // 401 is stale: clearing here would clobber a newer session, and the
      // unauthenticated handler would bounce a user who IS authenticated.
      if (this.currentUserToken() === tokenUsed) {
        this.storage?.clear();
        this.storage?.clearRefreshToken();
        if (!options?.suppressUnauthenticated) {
          this.onUnauthenticated?.();
        }
      }
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
