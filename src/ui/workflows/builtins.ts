import type { RunWorkflowAction } from "../actions/types";
import type {
  IfWorkflowNode,
  ParallelWorkflowNode,
  WaitWorkflowNode,
  WorkflowDefinition,
  WorkflowNode,
} from "./types";

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
