import type { ActionConfig } from "../actions/types";
export type WorkflowConditionOperator = "truthy" | "falsy" | "equals" | "not-equals" | "exists";
export interface WorkflowCondition {
    left: unknown;
    operator?: WorkflowConditionOperator;
    right?: unknown;
}
/** Primitive input kinds supported by manifest-declared custom workflow actions. */
export type CustomWorkflowActionInputType = "string" | "number" | "boolean";
/** Schema declaration for a single custom workflow action input. */
export interface CustomWorkflowActionInputSchema {
    type: CustomWorkflowActionInputType;
    required?: boolean;
    default?: string | number | boolean | null;
}
/** Manifest declaration for a custom workflow action. */
export interface CustomWorkflowActionDeclaration {
    input?: Record<string, CustomWorkflowActionInputSchema>;
}
/** Map of custom workflow action names to manifest declarations. */
export type CustomWorkflowActionDeclarationMap = Record<string, CustomWorkflowActionDeclaration>;
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
export interface RetryWorkflowNode extends WorkflowBaseNode {
    type: "retry";
    attempts: number;
    delayMs?: number;
    backoffMultiplier?: number;
    step: WorkflowDefinition;
    onFailure?: WorkflowDefinition;
}
export interface AssignWorkflowNode extends WorkflowBaseNode {
    type: "assign";
    values: Record<string, unknown>;
}
export interface TryWorkflowNode extends WorkflowBaseNode {
    type: "try";
    step: WorkflowDefinition;
    catch?: WorkflowDefinition;
    finally?: WorkflowDefinition;
}
export interface CaptureWorkflowNode extends WorkflowBaseNode {
    type: "capture";
    action: ActionConfig;
    as: string;
}
export type WorkflowNode = ActionConfig | IfWorkflowNode | WaitWorkflowNode | ParallelWorkflowNode | RetryWorkflowNode | AssignWorkflowNode | TryWorkflowNode | CaptureWorkflowNode;
export type WorkflowDefinition = WorkflowNode | WorkflowNode[];
export type WorkflowMap = Record<string, WorkflowDefinition>;
export interface WorkflowExecutionRuntime {
    context: Record<string, unknown>;
    resolveValue: (value: unknown, context: Record<string, unknown>) => unknown;
    executeAction: (action: ActionConfig, context: Record<string, unknown>) => Promise<unknown>;
    getWorkflow: (name: string) => WorkflowDefinition | undefined;
    runDefinition: (definition: WorkflowDefinition, context?: Record<string, unknown>) => Promise<void>;
}
export interface CustomWorkflowNode extends WorkflowBaseNode {
    type: string;
    [key: string]: unknown;
}
export type WorkflowActionHandler = (node: CustomWorkflowNode, runtime: WorkflowExecutionRuntime) => Promise<void>;
