import { ACTION_TYPES, type ActionConfig } from "../actions/types";
import { getRegisteredWorkflowAction } from "./registry";
import {
  isParallelWorkflowNode,
  isIfWorkflowNode,
  isRunWorkflowAction,
  isWaitWorkflowNode,
  normalizeWorkflowDefinition,
} from "./builtins";
import type {
  WorkflowCondition,
  WorkflowDefinition,
  WorkflowExecutionRuntime,
  WorkflowMap,
  WorkflowNode,
} from "./types";

function evaluateCondition(
  condition: WorkflowCondition,
  runtime: WorkflowExecutionRuntime,
  context: Record<string, unknown>,
): boolean {
  const left = runtime.resolveValue(condition.left, context);
  const right = runtime.resolveValue(condition.right, context);
  const operator = condition.operator ?? "truthy";

  switch (operator) {
    case "falsy":
      return !left;
    case "equals":
      return left === right;
    case "not-equals":
      return left !== right;
    case "exists":
      return left !== undefined && left !== null;
    default:
      return Boolean(left);
  }
}

function delay(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

export async function runWorkflow(
  definition: WorkflowDefinition,
  options: {
    workflows?: WorkflowMap;
    context?: Record<string, unknown>;
    resolveValue: (value: unknown, context: Record<string, unknown>) => unknown;
    executeAction: (
      action: ActionConfig,
      context: Record<string, unknown>,
    ) => Promise<void>;
  },
): Promise<void> {
  const workflows = options.workflows ?? {};

  const runDefinition = async (
    nextDefinition: WorkflowDefinition,
    nextContext: Record<string, unknown>,
  ): Promise<void> => {
    const runtime: WorkflowExecutionRuntime = {
      context: nextContext,
      resolveValue: options.resolveValue,
      executeAction: options.executeAction,
      getWorkflow: (name) => workflows[name],
      runDefinition: (nestedDefinition, nestedContext) =>
        runDefinition(nestedDefinition, {
          ...nextContext,
          ...(nestedContext ?? {}),
        }),
    };

    for (const node of normalizeWorkflowDefinition(nextDefinition)) {
      if (
        "when" in node &&
        node.when &&
        !evaluateCondition(node.when, runtime, nextContext)
      ) {
        continue;
      }

      if (isIfWorkflowNode(node)) {
        const branch = evaluateCondition(node.condition, runtime, nextContext)
          ? node.then
          : node.else;
        if (branch) {
          await runDefinition(branch, nextContext);
        }
        continue;
      }

      if (isWaitWorkflowNode(node)) {
        await delay(node.duration);
        continue;
      }

      if (isParallelWorkflowNode(node)) {
        await Promise.all(
          node.branches.map((branch) => runDefinition(branch, nextContext)),
        );
        continue;
      }

      if (isRunWorkflowAction(node)) {
        const workflow = workflows[node.workflow];
        if (!workflow) {
          throw new Error(`Unknown workflow "${node.workflow}"`);
        }

        const input =
          node.input && typeof node.input === "object"
            ? (options.resolveValue(node.input, nextContext) as Record<
                string,
                unknown
              >)
            : {};

        await runDefinition(workflow, {
          ...nextContext,
          ...input,
        });
        continue;
      }

      if (ACTION_TYPES.includes(node.type)) {
        await options.executeAction(node as ActionConfig, nextContext);
        continue;
      }

      const customHandler = getRegisteredWorkflowAction(node.type);
      if (!customHandler) {
        throw new Error(`Unknown workflow node type "${node.type}"`);
      }

      await customHandler(
        node as unknown as import("./types").CustomWorkflowNode,
        runtime,
      );
    }
  };

  await runDefinition(definition, options.context ?? {});
}
