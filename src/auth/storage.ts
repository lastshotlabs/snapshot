import type { SnapshotConfig } from "../types";

export interface TokenStorage {
  get: () => string | null;
  set: (token: string) => void;
  clear: () => void;
  getRefreshToken: () => string | null;
  setRefreshToken: (token: string) => void;
  clearRefreshToken: () => void;
}

function createLocalStorageStorage(key: string): TokenStorage {
  const refreshKey = `${key}-refresh`;
  return {
    get: () => localStorage.getItem(key),
    set: (token) => localStorage.setItem(key, token),
    clear: () => localStorage.removeItem(key),
    getRefreshToken: () => localStorage.getItem(refreshKey),
    setRefreshToken: (token) => localStorage.setItem(refreshKey, token),
    clearRefreshToken: () => localStorage.removeItem(refreshKey),
  };
}

function createSessionStorageStorage(key: string): TokenStorage {
  const refreshKey = `${key}-refresh`;
  return {
    get: () => sessionStorage.getItem(key),
    set: (token) => sessionStorage.setItem(key, token),
    clear: () => sessionStorage.removeItem(key),
    getRefreshToken: () => sessionStorage.getItem(refreshKey),
    setRefreshToken: (token) => sessionStorage.setItem(refreshKey, token),
    clearRefreshToken: () => sessionStorage.removeItem(refreshKey),
  };
}

function createMemoryStorage(): TokenStorage {
  let token: string | null = null;
  let refreshValue: string | null = null;
  return {
    get: () => token,
    set: (t) => {
      token = t;
    },
    clear: () => {
      token = null;
    },
    getRefreshToken: () => refreshValue,
    setRefreshToken: (t) => {
      refreshValue = t;
    },
    clearRefreshToken: () => {
      refreshValue = null;
    },
  };
}

function createNoopStorage(): TokenStorage {
  return {
    get: () => null,
    set: () => {},
    clear: () => {},
    getRefreshToken: () => null,
    setRefreshToken: () => {},
    clearRefreshToken: () => {},
  };
}

export function createTokenStorage(
  config: Pick<SnapshotConfig, "auth" | "tokenStorage" | "tokenKey">,
): TokenStorage {
  if (config.auth === "cookie") return createNoopStorage();

  const key = config.tokenKey ?? "x-user-token";
  const type = config.tokenStorage ?? "sessionStorage";

  switch (type) {
    case "sessionStorage":
      return createSessionStorageStorage(key);
    case "memory":
      return createMemoryStorage();
    case "localStorage":
    default:
      return createLocalStorageStorage(key);
  }
}
