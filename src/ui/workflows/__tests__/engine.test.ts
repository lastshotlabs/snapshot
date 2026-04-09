import { describe, expect, it, vi } from "vitest";
import { runWorkflow } from "../engine";
import type { ActionConfig } from "../../actions/types";

describe("runWorkflow", () => {
  it("executes workflow nodes sequentially", async () => {
    const calls: ActionConfig[] = [];
    const executeAction = vi.fn(async (action: ActionConfig) => {
      calls.push(action);
    });

    await runWorkflow(
      [
        { type: "toast", message: "one" },
        { type: "toast", message: "two" },
      ],
      {
        executeAction,
        resolveValue: (value) => value,
      },
    );

    expect(executeAction).toHaveBeenCalledTimes(2);
    expect(calls[0]).toMatchObject({
      type: "toast",
      message: "one",
    });
    expect(calls[1]).toMatchObject({
      type: "toast",
      message: "two",
    });
  });

  it("supports conditional workflow branches", async () => {
    const calls: ActionConfig[] = [];
    const executeAction = vi.fn(async (action: ActionConfig) => {
      calls.push(action);
    });

    await runWorkflow(
      {
        type: "if",
        condition: {
          left: { from: "result.ok" },
          operator: "equals",
          right: true,
        },
        then: { type: "toast", message: "success" },
        else: { type: "toast", message: "failure" },
      },
      {
        context: { result: { ok: true } },
        executeAction,
        resolveValue: (value, context) => {
          if (
            value &&
            typeof value === "object" &&
            "from" in (value as Record<string, unknown>)
          ) {
            return context["result"] &&
              typeof context["result"] === "object" &&
              "ok" in (context["result"] as Record<string, unknown>)
              ? (context["result"] as Record<string, unknown>)["ok"]
              : undefined;
          }
          return value;
        },
      },
    );

    expect(executeAction).toHaveBeenCalledTimes(1);
    expect(calls[0]).toMatchObject({
      type: "toast",
      message: "success",
    });
  });

  it("runs named workflows with merged input context", async () => {
    const calls: Array<{
      action: ActionConfig;
      context: Record<string, unknown>;
    }> = [];
    const executeAction = vi.fn(
      async (action: ActionConfig, context: Record<string, unknown>) => {
        calls.push({ action, context });
      },
    );

    await runWorkflow(
      {
        type: "run-workflow",
        workflow: "child",
        input: {
          label: "{name}",
        },
      },
      {
        context: { name: "Ada" },
        workflows: {
          child: {
            type: "toast",
            message: "{label}",
          },
        },
        executeAction,
        resolveValue: (value, context) => {
          if (typeof value === "string") {
            return value
              .replace("{name}", String(context["name"] ?? ""))
              .replace("{label}", String(context["label"] ?? ""));
          }
          if (value && typeof value === "object") {
            return Object.fromEntries(
              Object.entries(value as Record<string, unknown>).map(
                ([key, nested]) => [
                  key,
                  typeof nested === "string"
                    ? nested.replace("{name}", String(context["name"] ?? ""))
                    : nested,
                ],
              ),
            );
          }
          return value;
        },
      },
    );

    expect(executeAction).toHaveBeenCalledTimes(1);
    expect(calls[0]?.action).toMatchObject({
      type: "toast",
      message: "{label}",
    });
    expect(calls[0]?.context).toMatchObject({
      name: "Ada",
      label: "Ada",
    });
  });

  it("supports wait nodes", async () => {
    vi.useFakeTimers();
    const executeAction = vi.fn(async () => {});

    const runPromise = runWorkflow(
      [
        { type: "wait", duration: 100 },
        { type: "toast", message: "done" },
      ],
      {
        executeAction,
        resolveValue: (value) => value,
      },
    );

    expect(executeAction).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(100);
    await runPromise;

    expect(executeAction).toHaveBeenCalledTimes(1);
    expect(executeAction).toHaveBeenCalledWith(
      { type: "toast", message: "done" },
      {},
    );
    vi.useRealTimers();
  });

  it("supports parallel branches", async () => {
    const calls: ActionConfig[] = [];
    const executeAction = vi.fn(async (action: ActionConfig) => {
      calls.push(action);
    });

    await runWorkflow(
      {
        type: "parallel",
        branches: [
          [
            { type: "toast", message: "left-1" },
            { type: "toast", message: "left-2" },
          ],
          { type: "toast", message: "right" },
        ],
      },
      {
        executeAction,
        resolveValue: (value) => value,
      },
    );

    expect(executeAction).toHaveBeenCalledTimes(3);
    expect(calls).toEqual(
      expect.arrayContaining([
        { type: "toast", message: "left-1" },
        { type: "toast", message: "left-2" },
        { type: "toast", message: "right" },
      ]),
    );
  });

  it("retries a failing step until it succeeds", async () => {
    const calls: ActionConfig[] = [];
    const executeAction = vi.fn(async (action: ActionConfig) => {
      calls.push(action);
      if (calls.length < 3) {
        throw new Error("temporary");
      }
    });

    await runWorkflow(
      {
        type: "retry",
        attempts: 3,
        step: { type: "toast", message: "retry-me" },
      },
      {
        executeAction,
        resolveValue: (value) => value,
      },
    );

    expect(executeAction).toHaveBeenCalledTimes(3);
    expect(calls).toEqual([
      { type: "toast", message: "retry-me" },
      { type: "toast", message: "retry-me" },
      { type: "toast", message: "retry-me" },
    ]);
  });

  it("runs onFailure after exhausting retries", async () => {
    const calls: Array<{
      action: ActionConfig;
      context: Record<string, unknown>;
    }> = [];
    const executeAction = vi.fn(
      async (action: ActionConfig, context: Record<string, unknown>) => {
        calls.push({ action, context });
        if (action.type === "toast" && action.message === "retry-me") {
          throw new Error("still failing");
        }
      },
    );

    await runWorkflow(
      {
        type: "retry",
        attempts: 2,
        step: { type: "toast", message: "retry-me" },
        onFailure: { type: "toast", message: "fallback" },
      },
      {
        executeAction,
        resolveValue: (value) => value,
      },
    );

    expect(executeAction).toHaveBeenCalledTimes(3);
    expect(calls[2]?.action).toEqual({ type: "toast", message: "fallback" });
    expect(calls[2]?.context.error).toBeInstanceOf(Error);
  });

  it("assigns values into workflow context for later nodes", async () => {
    const calls: Array<{
      action: ActionConfig;
      context: Record<string, unknown>;
    }> = [];
    const executeAction = vi.fn(
      async (action: ActionConfig, context: Record<string, unknown>) => {
        calls.push({ action, context });
      },
    );

    await runWorkflow(
      [
        {
          type: "assign",
          values: {
            greeting: "{name}",
            role: "{user.role}",
          },
        },
        { type: "toast", message: "hello" },
      ],
      {
        context: {
          name: "Ada",
          user: { role: "admin" },
        },
        executeAction,
        resolveValue: (value, context) => {
          if (typeof value === "string") {
            return value
              .replace("{name}", String(context["name"] ?? ""))
              .replace(
                "{user.role}",
                String(
                  context["user"] &&
                    typeof context["user"] === "object" &&
                    "role" in (context["user"] as Record<string, unknown>)
                    ? (context["user"] as Record<string, unknown>)["role"]
                    : "",
                ),
              );
          }
          if (value && typeof value === "object") {
            return Object.fromEntries(
              Object.entries(value as Record<string, unknown>).map(
                ([key, nested]) => [
                  key,
                  typeof nested === "string"
                    ? nested
                        .replace("{name}", String(context["name"] ?? ""))
                        .replace(
                          "{user.role}",
                          String(
                            context["user"] &&
                              typeof context["user"] === "object" &&
                              "role" in (context["user"] as Record<string, unknown>)
                              ? (context["user"] as Record<string, unknown>)["role"]
                              : "",
                          ),
                        )
                    : nested,
                ],
              ),
            );
          }
          return value;
        },
      },
    );

    expect(executeAction).toHaveBeenCalledTimes(1);
    expect(calls[0]?.context).toMatchObject({
      name: "Ada",
      greeting: "Ada",
      role: "admin",
    });
  });

  it("supports try/catch branches with error context", async () => {
    const calls: Array<{
      action: ActionConfig;
      context: Record<string, unknown>;
    }> = [];
    const executeAction = vi.fn(
      async (action: ActionConfig, context: Record<string, unknown>) => {
        calls.push({ action, context });
        if (action.type === "toast" && action.message === "explode") {
          throw new Error("boom");
        }
      },
    );

    await runWorkflow(
      {
        type: "try",
        step: { type: "toast", message: "explode" },
        catch: { type: "toast", message: "caught" },
      },
      {
        executeAction,
        resolveValue: (value) => value,
      },
    );

    expect(executeAction).toHaveBeenCalledTimes(2);
    expect(calls[1]?.action).toEqual({ type: "toast", message: "caught" });
    expect(calls[1]?.context.error).toBeInstanceOf(Error);
  });

  it("runs finally blocks after successful try steps", async () => {
    const calls: ActionConfig[] = [];
    const executeAction = vi.fn(async (action: ActionConfig) => {
      calls.push(action);
    });

    await runWorkflow(
      {
        type: "try",
        step: { type: "toast", message: "step" },
        finally: { type: "toast", message: "cleanup" },
      },
      {
        executeAction,
        resolveValue: (value) => value,
      },
    );

    expect(calls).toEqual([
      { type: "toast", message: "step" },
      { type: "toast", message: "cleanup" },
    ]);
  });
});
