// snapshot/src/ssr/__tests__/action-client.test.ts
import { afterEach, describe, expect, test, vi } from "vitest";
import { __callServerAction__ } from '../action-client';

// ─── Fetch mock helpers ───────────────────────────────────────────────────────

type FetchResponse = {
  status?: number;
  redirected?: boolean;
  url?: string;
  body: object;
};

let fetchMock: ReturnType<typeof vi.fn>;

function mockFetch(response: FetchResponse) {
  const { status = 200, redirected = false, url = '/_snapshot/action', body } = response;
  fetchMock = vi.fn(async () => ({
    status,
    redirected,
    url,
    ok: status >= 200 && status < 300,
    json: async () => body,
  }));
  globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;
}

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('__callServerAction__() — JSON mode', () => {
  test('sends POST to /_snapshot/action with JSON body', async () => {
    mockFetch({ body: { result: { id: '123' } } });

    const result = await __callServerAction__('createPost', 'posts', [{ title: 'Hello' }]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/_snapshot/action');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['content-type']).toBe('application/json');

    const parsedBody = JSON.parse(init.body as string) as {
      module: string;
      action: string;
      args: unknown[];
    };
    expect(parsedBody.module).toBe('posts');
    expect(parsedBody.action).toBe('createPost');
    expect(parsedBody.args).toEqual([{ title: 'Hello' }]);

    expect(result).toEqual({ id: '123' });
  });

  test('throws Error when server returns { error }', async () => {
    mockFetch({ body: { error: 'Validation failed' } });

    await expect(
      __callServerAction__('createPost', 'posts', []),
    ).rejects.toThrow('Validation failed');
  });

  test('handles { redirect } by assigning window.location.href', async () => {
    mockFetch({ body: { redirect: '/dashboard' } });

    const locationSpy = { href: '' };
    Object.defineProperty(globalThis, 'window', {
      value: { location: locationSpy },
      writable: true,
      configurable: true,
    });

    const result = await __callServerAction__('deletePost', 'posts', ['id-1']);
    expect(locationSpy.href).toBe('/dashboard');
    expect(result).toBeUndefined();
  });

  test('returns result for empty args array', async () => {
    mockFetch({ body: { result: null } });
    const result = await __callServerAction__('getStats', 'stats', []);
    expect(result).toBeNull();
  });
});

describe('__callServerAction__() — FormData mode', () => {
  test('sends FormData body when first arg is FormData', async () => {
    mockFetch({ body: { result: { ok: true } } });

    const fd = new FormData();
    fd.append('title', 'My Post');

    await __callServerAction__('createPost', 'posts', [fd]);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    // Content-Type is NOT set manually for FormData (boundary is auto-set by the browser).
    expect(
      (init.headers as Record<string, string> | undefined)?.['content-type'],
    ).toBeUndefined();

    // Body must be a FormData instance.
    expect(init.body instanceof FormData).toBe(true);

    const sentFd = init.body as FormData;
    // _module and _action must be appended.
    expect(sentFd.get('_module')).toBe('posts');
    expect(sentFd.get('_action')).toBe('createPost');
    // Original fields must be preserved.
    expect(sentFd.get('title')).toBe('My Post');
  });
});

describe('__callServerAction__() — redirect response', () => {
  test('handles server-side redirect (30x response)', async () => {
    mockFetch({
      status: 302,
      redirected: true,
      url: '/login',
      body: {},
    });

    const locationSpy = { href: '' };
    Object.defineProperty(globalThis, 'window', {
      value: { location: locationSpy },
      writable: true,
      configurable: true,
    });

    const result = await __callServerAction__('protectedAction', 'auth', []);
    expect(locationSpy.href).toBe('/login');
    expect(result).toBeUndefined();
  });
});
