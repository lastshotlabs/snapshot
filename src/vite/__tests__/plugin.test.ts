import type { Plugin, ViteDevServer } from "vite";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { accessMock } = vi.hoisted(() => ({
  accessMock: vi.fn(),
}));

vi.mock("../../cli/sync", () => ({
  runSync: vi.fn().mockResolvedValue(undefined),
  consoleLogger: {},
}));

vi.mock("node:fs/promises", () => ({
  access: accessMock,
}));

import { snapshotSync } from "../index";
import { runSync } from "../../cli/sync";

function unwrapHook<T extends (...args: never[]) => unknown>(
  hook: T | { handler: T } | undefined,
): T {
  expect(hook).toBeDefined();
  return typeof hook === "function" ? hook : hook!.handler;
}

beforeEach(() => {
  vi.clearAllMocks();
  accessMock.mockReset();
});

describe("snapshotSync plugin", () => {
  it("buildStart skips sync and warns when schema file does not exist", async () => {
    accessMock.mockRejectedValue(new Error("ENOENT"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const plugin = snapshotSync({ file: "schema.json" });
    const buildStartHook = unwrapHook(plugin.buildStart);
    await buildStartHook.call(
      {} as ThisParameterType<typeof buildStartHook>,
      {} as Parameters<typeof buildStartHook>[0],
    );

    expect(runSync).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("schema.json"),
    );
    warnSpy.mockRestore();
  });

  it("buildStart runs sync when schema file exists", async () => {
    accessMock.mockResolvedValue(undefined);

    const plugin = snapshotSync({ file: "schema.json" });
    const buildStartHook = unwrapHook(plugin.buildStart);
    await buildStartHook.call(
      {} as ThisParameterType<typeof buildStartHook>,
      {} as Parameters<typeof buildStartHook>[0],
    );

    expect(runSync).toHaveBeenCalledOnce();
  });

  it("configureServer registers both change and add event handlers", () => {
    const registeredEvents: string[] = [];
    const mockServer = {
      watcher: {
        add: vi.fn(),
        on: vi.fn((event: string) => {
          registeredEvents.push(event);
        }),
      },
    };

    const plugin = snapshotSync({ file: "schema.json" });
    const configureServerHook = unwrapHook(plugin.configureServer);
    configureServerHook.call(
      {} as ThisParameterType<typeof configureServerHook>,
      mockServer as unknown as ViteDevServer,
    );

    expect(registeredEvents).toContain("change");
    expect(registeredEvents).toContain("add");
  });

  it("'add' event triggers runSync for matching file", async () => {
    const handlers: Record<string, Function> = {};
    const mockServer = {
      watcher: {
        add: vi.fn(),
        on: vi.fn((event: string, handler: Function) => {
          handlers[event] = handler;
        }),
      },
    };

    const plugin = snapshotSync({ file: "schema.json" });
    const configureServerHook = unwrapHook(plugin.configureServer);
    configureServerHook.call(
      {} as ThisParameterType<typeof configureServerHook>,
      mockServer as unknown as ViteDevServer,
    );

    await handlers["add"]!("/project/schema.json");

    expect(runSync).toHaveBeenCalledOnce();
  });

  it("'change' event triggers runSync for matching file", async () => {
    const handlers: Record<string, Function> = {};
    const mockServer = {
      watcher: {
        add: vi.fn(),
        on: vi.fn((event: string, handler: Function) => {
          handlers[event] = handler;
        }),
      },
    };

    const plugin = snapshotSync({ file: "schema.json" });
    const configureServerHook = unwrapHook(plugin.configureServer);
    configureServerHook.call(
      {} as ThisParameterType<typeof configureServerHook>,
      mockServer as unknown as ViteDevServer,
    );

    await handlers["change"]!("/project/schema.json");

    expect(runSync).toHaveBeenCalledOnce();
  });
});
