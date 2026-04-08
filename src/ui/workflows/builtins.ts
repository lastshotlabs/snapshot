import type { RunWorkflowAction } from "../actions/types";
import type { IfWorkflowNode, WorkflowDefinition, WorkflowNode } from "./types";

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
