import type { AuthContract } from "../auth/contract";
import { getCsrfToken, isMutatingMethod } from "../auth/csrf";
import type { TokenStorage } from "../auth/storage";
import { warnOnce } from "../auth/warnings";
import type { RequestOptions } from "../types";
import { ApiError } from "./error";

// ── Config ───────────────────────────────────────────────────────────────────

export interface ApiClientConfig {
  apiUrl: string;
  auth?: "cookie" | "token";
  bearerToken?: string;
}

// ── Client ───────────────────────────────────────────────────────────────────

export class ApiClient {
  private readonly baseUrl: string;
  private readonly authMode: "cookie" | "token";
  private readonly bearerToken: string | undefined;
  private contract: AuthContract | null = null;
  private storage: TokenStorage | null = null;
  private onUnauthenticated: (() => void) | undefined;
  private onForbidden: (() => void) | undefined;
  private onMfaSetupRequired: (() => void) | undefined;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.apiUrl.replace(/\/$/, "");
    this.authMode = config.auth ?? "cookie";
    this.bearerToken = config.bearerToken;

    if (this.bearerToken && typeof window !== "undefined") {
      console.warn(
        "[snapshot] bearerToken is a static API credential. " +
          "It should not be used in browser deployments. " +
          "See the snapshot security docs for the recommended cookie-auth model.",
      );
    }

    if (this.authMode === "token" && typeof window !== "undefined") {
      warnOnce(
        "auth-mode:token-in-browser",
        "[snapshot] Cookie mode is recommended for browser deployments. " +
          "token auth mode is less secure in browser contexts.",
      );
    }
  }

  setStorage(storage: TokenStorage) {
    this.storage = storage;
  }

  setContract(contract: AuthContract) {
    this.contract = contract;
  }

  setCallbacks(callbacks: {
    onUnauthenticated?: () => void;
    onForbidden?: () => void;
    onMfaSetupRequired?: () => void;
  }) {
    if (callbacks.onUnauthenticated) this.onUnauthenticated = callbacks.onUnauthenticated;
    if (callbacks.onForbidden) this.onForbidden = callbacks.onForbidden;
    if (callbacks.onMfaSetupRequired) this.onMfaSetupRequired = callbacks.onMfaSetupRequired;
  }

  private buildHeaders(method: string, overrides?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...overrides,
    };

    // API-level bearer token (always sent, independent of user auth mode)
    if (this.bearerToken) {
      headers["Authorization"] = `Bearer ${this.bearerToken}`;
    }

    if (this.authMode === "cookie") {
      if (this.contract && isMutatingMethod(method)) {
        const csrf = getCsrfToken(this.contract.csrfCookieName);
        if (csrf) headers[this.contract.headers.csrf] = csrf;
      }
      return headers;
    }

    const userToken = this.storage?.get();
    if (userToken && this.contract) {
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
          "Set bearerToken in config or ensure a user token is stored.",
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
      if (
        body &&
        typeof body === "object" &&
        "code" in body &&
        (body as Record<string, unknown>).code === "MFA_SETUP_REQUIRED"
      ) {
        if (!this.onMfaSetupRequired) {
          warnOnce(
            "mfa-setup-required:no-path",
            "[snapshot] MFA_SETUP_REQUIRED returned but no mfaSetupPath configured.",
          );
        }
        this.onMfaSetupRequired?.();
      } else {
        this.onForbidden?.();
      }
      throw new ApiError(403, body);
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new ApiError(response.status, body);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const response = await this.rawFetch(method, path, body, options);

    if (response.status === 401) {
      const refreshToken = this.storage?.getRefreshToken();
      const refreshEndpoint = this.contract?.endpoints.refresh;

      if (refreshToken && refreshEndpoint && path !== refreshEndpoint) {
        try {
          const refreshResponse = await fetch(`${this.baseUrl}${refreshEndpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
            credentials: "include",
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            this.storage?.set(refreshData.token);
            if (refreshData.refreshToken) {
              this.storage?.setRefreshToken(refreshData.refreshToken);
            }
            const retryResponse = await this.rawFetch(method, path, body, options);
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

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", path, undefined, options);
  }

  post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("POST", path, body, options);
  }

  put<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("PUT", path, body, options);
  }

  patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("PATCH", path, body, options);
  }

  delete<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", path, body, options);
  }
}
