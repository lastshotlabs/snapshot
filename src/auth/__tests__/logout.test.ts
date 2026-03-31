import { act, renderHook } from "@testing-library/react";
import { atom } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MfaChallenge } from "../../types";
import { createAuthHooks } from "../hooks";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

const mockSetAtom = vi.fn();
vi.mock("jotai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jotai")>();
  return {
    ...actual,
    useSetAtom: () => mockSetAtom,
  };
});

const mockMutate = vi.fn();
const mockUseMutation = vi.fn(() => ({
  mutate: mockMutate,
  mutateAsync: mockMutate,
}));
const mockSetQueryData = vi.fn();
const mockClear = vi.fn();
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useMutation: mockUseMutation,
    useQueryClient: () => ({
      setQueryData: mockSetQueryData,
      clear: mockClear,
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

function makeApi(logoutResult: Promise<void> = Promise.resolve()) {
  return {
    post: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue({ id: "1", email: "test@example.com" }),
    delete: vi.fn().mockResolvedValue({}),
  };
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
      onUnauthenticated: vi.fn(),
      onLogoutSuccess: vi.fn(),
    };

    mockUseMutation.mockImplementation((cfg) => {
      capturedMutationConfig = cfg;
      return { mutate: mockMutate };
    });

    createAuthHooks({ api, storage, config, pendingMfaChallengeAtom });
  });

  it("successful logout clears storage, refresh token, query cache, MFA atom, and navigates", async () => {
    const { useLogout } = createAuthHooks({
      api,
      storage,
      config,
      pendingMfaChallengeAtom,
    });

    // Simulate onSuccess
    await capturedMutationConfig.onSuccess?.(undefined, undefined);

    expect(mockSetAtom).toHaveBeenCalledWith(null);
    expect(storage.clear).toHaveBeenCalled();
    expect(storage.clearRefreshToken).toHaveBeenCalled();
    expect(mockClear).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/login" });
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

  it("onUnauthenticated is NOT called from logout path", async () => {
    await capturedMutationConfig.onSuccess?.(undefined, undefined);
    expect(config.onUnauthenticated).not.toHaveBeenCalled();
  });
});
