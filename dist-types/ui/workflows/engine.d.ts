import { type ActionConfig } from "../actions/types";
import type { WorkflowDefinition, WorkflowMap } from "./types";
/** Execute a workflow definition against the supplied runtime hooks and mutable context. */
export declare function runWorkflow(definition: WorkflowDefinition, options: {
    workflows?: WorkflowMap;
    context?: Record<string, unknown>;
    resolveValue: (value: unknown, context: Record<string, unknown>) => unknown;
    executeAction: (action: ActionConfig, context: Record<string, unknown>) => Promise<unknown>;
}): Promise<void>;
