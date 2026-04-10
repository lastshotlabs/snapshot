import type { RunWorkflowAction } from "../actions/types";
import {
  halt as haltSsrMiddleware,
  redirect as redirectSsrMiddleware,
  rewrite as rewriteSsrMiddleware,
  setHeader as setHeaderSsrMiddleware,
  setStatus as setStatusSsrMiddleware,
} from "./builtins/ssr-middleware";
import { registerWorkflowAction } from "./registry";
import type {
  AssignWorkflowNode,
  CaptureWorkflowNode,
  IfWorkflowNode,
  ParallelWorkflowNode,
  RetryWorkflowNode,
  TryWorkflowNode,
  WaitWorkflowNode,
  WorkflowDefinition,
  WorkflowNode,
} from "./types";

let ssrMiddlewareBuiltinsRegistered = false;

/**
 * Register SSR middleware workflow actions in the workflow action registry.
 *
 * Safe to call multiple times.
 */
export function registerSsrMiddlewareWorkflowActions(): void {
  if (ssrMiddlewareBuiltinsRegistered) {
    return;
  }

  ssrMiddlewareBuiltinsRegistered = true;

  registerWorkflowAction("set-status", async (node, runtime) => {
    setStatusSsrMiddleware(
      {
        status: Number(runtime.resolveValue(node["status"], runtime.context)),
      },
      { input: runtime.context as { ssr?: unknown } },
    );
  });
  registerWorkflowAction("redirect", async (node, runtime) => {
    redirectSsrMiddleware(
      {
        url: String(runtime.resolveValue(node["url"], runtime.context)),
        permanent: Boolean(
          runtime.resolveValue(node["permanent"], runtime.context),
        ),
      },
      { input: runtime.context as { ssr?: unknown } },
    );
  });
  registerWorkflowAction("rewrite", async (node, runtime) => {
    rewriteSsrMiddleware(
      { url: String(runtime.resolveValue(node["url"], runtime.context)) },
      { input: runtime.context as { ssr?: unknown } },
    );
  });
  registerWorkflowAction("set-header", async (node, runtime) => {
    setHeaderSsrMiddleware(
      {
        name: String(runtime.resolveValue(node["name"], runtime.context)),
        value: String(runtime.resolveValue(node["value"], runtime.context)),
      },
      { input: runtime.context as { ssr?: unknown } },
    );
  });
  registerWorkflowAction("halt", async (_node, runtime) => {
    haltSsrMiddleware({}, { input: runtime.context as { ssr?: unknown } });
  });
}

export function normalizeWorkflowDefinition(
  definition: WorkflowDefinition,
): WorkflowNode[] {
  return Array.isArray(definition) ? definition : [definition];
}

export function isIfWorkflowNode(node: WorkflowNode): node is IfWorkflowNode {
  return node.type === "if";
}

export function isRunWorkflowAction(
  node: WorkflowNode,
): node is RunWorkflowAction {
  return node.type === "run-workflow";
}

export function isWaitWorkflowNode(node: WorkflowNode): node is WaitWorkflowNode {
  return node.type === "wait";
}

export function isParallelWorkflowNode(
  node: WorkflowNode,
): node is ParallelWorkflowNode {
  return node.type === "parallel";
}

export function isRetryWorkflowNode(
  node: WorkflowNode,
): node is RetryWorkflowNode {
  return node.type === "retry";
}

export function isAssignWorkflowNode(
  node: WorkflowNode,
): node is AssignWorkflowNode {
  return node.type === "assign";
}

export function isTryWorkflowNode(node: WorkflowNode): node is TryWorkflowNode {
  return node.type === "try";
}

export function isCaptureWorkflowNode(
  node: WorkflowNode,
): node is CaptureWorkflowNode {
  return node.type === "capture";
}
