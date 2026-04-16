import type { RunWorkflowAction } from "../actions/types";
import type { AssignWorkflowNode, CaptureWorkflowNode, IfWorkflowNode, ParallelWorkflowNode, RetryWorkflowNode, TryWorkflowNode, WaitWorkflowNode, WorkflowDefinition, WorkflowNode } from "./types";
/**
 * Register SSR middleware workflow actions in the workflow action registry.
 *
 * Safe to call multiple times.
 */
export declare function registerSsrMiddlewareWorkflowActions(): void;
export declare function normalizeWorkflowDefinition(definition: WorkflowDefinition): WorkflowNode[];
export declare function isIfWorkflowNode(node: WorkflowNode): node is IfWorkflowNode;
export declare function isRunWorkflowAction(node: WorkflowNode): node is RunWorkflowAction;
export declare function isWaitWorkflowNode(node: WorkflowNode): node is WaitWorkflowNode;
export declare function isParallelWorkflowNode(node: WorkflowNode): node is ParallelWorkflowNode;
export declare function isRetryWorkflowNode(node: WorkflowNode): node is RetryWorkflowNode;
export declare function isAssignWorkflowNode(node: WorkflowNode): node is AssignWorkflowNode;
export declare function isTryWorkflowNode(node: WorkflowNode): node is TryWorkflowNode;
export declare function isCaptureWorkflowNode(node: WorkflowNode): node is CaptureWorkflowNode;
