import { atom } from "jotai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MfaChallenge } from "../../types";
import { createWebAuthnHooks } from "../webauthn-hooks";

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

const mockSetQueryData = vi.fn();
const mockInvalidateQueries = vi.fn();
let capturedMutationConfig: Record<string, unknown> = {};

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useMutation: vi.fn((cfg) => {
      capturedMutationConfig = cfg;
      return { mutate: vi.fn() };
    }),
    useQueryClient: () => ({
      setQueryData: mockSetQueryData,
      invalidateQueries: mockInvalidateQueries,
    }),
    useQuery: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      isError: false,
    })),
  };
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockUser = { id: "user-1", email: "test@example.com" };

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

function makeApi(loginResponse = { token: "tok", userId: "user-1" }) {
  return {
    post: vi.fn().mockResolvedValue(loginResponse),
    get: vi.fn().mockResolvedValue(mockUser),
    delete: vi.fn().mockResolvedValue({}),
  };
}

const pendingMfaChallengeAtom = atom<MfaChallenge | null>(null);

// ── Tests ────────────────────────────────────────────────────────────────────

describe("usePasskeyLogin", () => {
  let storage: ReturnType<typeof makeStorage>;
  let api: ReturnType<typeof makeApi>;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedMutationConfig = {};
    storage = makeStorage();
    api = makeApi();
  });

  function setup(configOverrides = {}) {
    const config = {
      auth: "cookie" as const,
      mfaPath: "/auth/mfa",
      homePath: "/home",
      ...configOverrides,
    };
    createWebAuthnHooks({ api, storage, config, pendingMfaChallengeAtom });
    return { config };
  }

  it("fetches /auth/me (not fabricated user)", async () => {
    setup();
    // Access the last registered mutationFn (usePasskeyLogin is last)
    const mutationFn = capturedMutationConfig.mutationFn as Function;
    const result = await mutationFn({
      passkeyToken: "pt",
      assertionResponse: {},
    });
    expect(api.get).toHaveBeenCalledWith("/auth/me");
    expect(result).toEqual(mockUser);
  });

  it("uses setQueryData, not invalidateQueries", async () => {
    setup();
    const onSuccess = capturedMutationConfig.onSuccess as Function;
    await onSuccess(mockUser, { passkeyToken: "pt", assertionResponse: {} });
    expect(mockSetQueryData).toHaveBeenCalledWith(["auth", "me"], mockUser);
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  it("uses router navigate, not window.location.href", async () => {
    setup();
    const onSuccess = capturedMutationConfig.onSuccess as Function;
    await onSuccess(mockUser, { passkeyToken: "pt", assertionResponse: {} });
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/home" });
  });

  it("redirectTo override works", async () => {
    setup();
    const onSuccess = capturedMutationConfig.onSuccess as Function;
    await onSuccess(mockUser, {
      passkeyToken: "pt",
      assertionResponse: {},
      redirectTo: "/dashboard",
    });
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard" });
  });

  it("MFA challenge path matches useLogin", async () => {
    const mfaResponse = {
      mfaRequired: true,
      mfaToken: "mfa-tok",
      mfaMethods: ["totp"],
    };
    api = makeApi(mfaResponse as any);
    setup();
    const mutationFn = capturedMutationConfig.mutationFn as Function;
    const result = await mutationFn({
      passkeyToken: "pt",
      assertionResponse: {},
    });
    expect(result).toEqual({ mfaToken: "mfa-tok", mfaMethods: ["totp"] });

    const onSuccess = capturedMutationConfig.onSuccess as Function;
    await onSuccess(result, { passkeyToken: "pt", assertionResponse: {} });
    expect(mockSetAtom).toHaveBeenCalledWith({
      mfaToken: "mfa-tok",
      mfaMethods: ["totp"],
    });
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/auth/mfa" });
  });

  it("redirectTo is stripped from request body", async () => {
    setup();
    const mutationFn = capturedMutationConfig.mutationFn as Function;
    await mutationFn({
      passkeyToken: "pt",
      assertionResponse: {},
      redirectTo: "/somewhere",
    });
    const postedBody = (api.post as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(postedBody).not.toHaveProperty("redirectTo");
    expect(postedBody).toHaveProperty("passkeyToken", "pt");
  });
});
