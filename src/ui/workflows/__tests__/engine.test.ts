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
    const calls: Array<{ action: ActionConfig; context: Record<string, unknown> }> = [];
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
            return value.replace("{name}", String(context["name"] ?? "")).replace(
              "{label}",
              String(context["label"] ?? ""),
            );
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
});
