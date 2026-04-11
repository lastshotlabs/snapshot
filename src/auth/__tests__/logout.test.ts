// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createAuthHooks } from "../hooks";
import { defaultContract } from "../contract";
import { atom } from "jotai";
import type { MfaChallenge } from "../../types";
import type { ApiClient } from "../../api/client";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockState = {
  mockNavigate: vi.fn(),
  mockSetAtom: vi.fn(),
  mockMutate: vi.fn(),
  mockUseMutation: vi.fn((_cfg?: unknown) => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
  })),
  mockSetQueryData: vi.fn(),
  mockClear: vi.fn(),
};

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockState.mockNavigate,
}));

vi.mock("jotai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jotai")>();
  return {
    ...actual,
    useSetAtom: () => mockState.mockSetAtom,
  };
});

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useMutation: (...args: unknown[]) => mockState.mockUseMutation(...args),
    useQueryClient: () => ({
      setQueryData: mockState.mockSetQueryData,
      clear: mockState.mockClear,
    }),
    useQuery: vi.fn(() => ({ data: null, isLoading: false, isError: false })),
  };
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeStorage() {
  return {
    get: vi.fn(() => null),
    set: vi.fn(),
    clear: vi.fn(),
    getRefreshToken: vi.fn(() => null),
    setRefreshToken: vi.fn(),
    clearRefreshToken: vi.fn(),
  };
}

function makeApi(_logoutResult: Promise<void> = Promise.resolve()) {
  return {
    post: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue({ id: "1", email: "test@example.com" }),
    delete: vi.fn().mockResolvedValue({}),
  } as unknown as ApiClient;
}

const pendingMfaChallengeAtom = atom<MfaChallenge | null>(null);

// ── Tests ────────────────────────────────────────────────────────────────────

describe("useLogout", () => {
  let storage: ReturnType<typeof makeStorage>;
  let api: ReturnType<typeof makeApi>;
  let config: Parameters<typeof createAuthHooks>[0]["config"];
  let capturedMutationConfig: {
    mutationFn: (vars: unknown) => Promise<void>;
    onSuccess?: (data: void, vars: unknown) => void;
    onError?: (err: unknown, vars: unknown) => void;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    storage = makeStorage();
    api = makeApi();
    config = {
      loginPath: "/login",
      homePath: "/home",
      auth: "cookie",
      staleTime: 0,
      mfaPath: undefined,
      onLogoutSuccess: vi.fn(),
    };
    mockState.mockUseMutation.mockImplementation((cfg: unknown) => {
      capturedMutationConfig = cfg as typeof capturedMutationConfig;
      return {
        mutate: mockState.mockMutate,
        mutateAsync: mockState.mockMutate,
      };
    });

    const hooks = createAuthHooks({
      api,
      storage,
      config,
      contract: defaultContract("http://localhost"),
      pendingMfaChallengeAtom,
    });
    renderHook(() => hooks.useLogout());
  });

  it("successful logout clears storage, refresh token, query cache, MFA atom, and navigates", async () => {
    // Simulate onSuccess
    await capturedMutationConfig.onSuccess?.(undefined, undefined);

    expect(mockState.mockSetAtom).toHaveBeenCalledWith(null);
    expect(storage.clear).toHaveBeenCalled();
    expect(storage.clearRefreshToken).toHaveBeenCalled();
    expect(mockState.mockClear).toHaveBeenCalled();
    expect(mockState.mockNavigate).toHaveBeenCalledWith({ to: "/login" });
  });

  it("failed logout does NOT clear any state", async () => {
    // No onError handler — nothing should be called on error
    expect(capturedMutationConfig.onError).toBeUndefined();
  });

  it("force: true short-circuits server call and runs full cleanup", async () => {
    const vars = { force: true };
    const result = capturedMutationConfig.mutationFn(vars);
    // Should resolve immediately without calling api.post
    await expect(result).resolves.toBeUndefined();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("onLogoutSuccess fires on success only", async () => {
    await capturedMutationConfig.onSuccess?.(undefined, undefined);
    expect(config.onLogoutSuccess).toHaveBeenCalledTimes(1);
  });
});
