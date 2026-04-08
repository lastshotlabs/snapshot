import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../cli/sync", () => ({
  runSync: vi.fn().mockResolvedValue(undefined),
  consoleLogger: {},
}));

vi.mock("node:fs/promises", () => ({
  access: vi.fn(),
}));

import { snapshotSync } from "../index";
import { runSync } from "../../cli/sync";
import * as fsPromises from "node:fs/promises";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("snapshotSync plugin", () => {
  it("buildStart skips sync and warns when schema file does not exist", async () => {
    vi.mocked(fsPromises.access).mockRejectedValue(new Error("ENOENT"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const plugin = snapshotSync({ file: "schema.json" });
    await (plugin as any).buildStart({});

    expect(runSync).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("schema.json"),
    );
    warnSpy.mockRestore();
  });

  it("buildStart runs sync when schema file exists", async () => {
    vi.mocked(fsPromises.access).mockResolvedValue(undefined);

    const plugin = snapshotSync({ file: "schema.json" });
    await (plugin as any).buildStart({});

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
    (plugin as any).configureServer(mockServer);

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
    (plugin as any).configureServer(mockServer);

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
    (plugin as any).configureServer(mockServer);

    await handlers["change"]!("/project/schema.json");

    expect(runSync).toHaveBeenCalledOnce();
  });
});
