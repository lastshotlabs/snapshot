import type { ActionConfig } from "../actions/types";

export type WorkflowConditionOperator =
  | "truthy"
  | "falsy"
  | "equals"
  | "not-equals"
  | "exists";

export interface WorkflowCondition {
  left: unknown;
  operator?: WorkflowConditionOperator;
  right?: unknown;
}

export interface WorkflowBaseNode {
  id?: string;
  when?: WorkflowCondition;
}

export interface IfWorkflowNode extends WorkflowBaseNode {
  type: "if";
  condition: WorkflowCondition;
  then: WorkflowDefinition;
  else?: WorkflowDefinition;
}

export interface WaitWorkflowNode extends WorkflowBaseNode {
  type: "wait";
  duration: number;
}

export interface ParallelWorkflowNode extends WorkflowBaseNode {
  type: "parallel";
  branches: WorkflowDefinition[];
}

export type WorkflowNode =
  | ActionConfig
  | IfWorkflowNode
  | WaitWorkflowNode
  | ParallelWorkflowNode;
export type WorkflowDefinition = WorkflowNode | WorkflowNode[];
export type WorkflowMap = Record<string, WorkflowDefinition>;

export interface WorkflowExecutionRuntime {
  context: Record<string, unknown>;
  resolveValue: (value: unknown, context: Record<string, unknown>) => unknown;
  executeAction: (
    action: ActionConfig,
    context: Record<string, unknown>,
  ) => Promise<void>;
  getWorkflow: (name: string) => WorkflowDefinition | undefined;
  runDefinition: (
    definition: WorkflowDefinition,
    context?: Record<string, unknown>,
  ) => Promise<void>;
}

export interface CustomWorkflowNode extends WorkflowBaseNode {
  type: string;
  [key: string]: unknown;
}

export type WorkflowActionHandler = (
  node: CustomWorkflowNode,
  runtime: WorkflowExecutionRuntime,
) => Promise<void>;
