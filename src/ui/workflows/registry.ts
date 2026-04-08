import type { WorkflowActionHandler } from "./types";

const workflowActionRegistry = new Map<string, WorkflowActionHandler>();

export function registerWorkflowAction(
  type: string,
  handler: WorkflowActionHandler,
): void {
  workflowActionRegistry.set(type, handler);
}

export function getRegisteredWorkflowAction(
  type: string,
): WorkflowActionHandler | undefined {
  return workflowActionRegistry.get(type);
}
