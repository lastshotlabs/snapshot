import type { CustomWorkflowActionDeclaration, CustomWorkflowActionDeclarationMap, WorkflowActionHandler } from "./types";
/**
 * Register a runtime handler for a custom workflow action type.
 *
 * @param type - Custom workflow action type name
 * @param handler - Runtime handler invoked by the workflow engine
 */
export declare function registerWorkflowAction(type: string, handler: WorkflowActionHandler): void;
/**
 * Retrieve a registered runtime handler for a custom workflow action type.
 *
 * @param type - Custom workflow action type name
 * @returns The registered handler when available
 */
export declare function getRegisteredWorkflowAction(type: string): WorkflowActionHandler | undefined;
/**
 * Replace the manifest-declared custom action schema registry.
 *
 * Called by the manifest compiler once per compilation pass.
 *
 * @param declarations - Parsed `manifest.workflows.actions.custom` declarations
 */
export declare function setDeclaredCustomActionSchemas(declarations: CustomWorkflowActionDeclarationMap): void;
/**
 * Retrieve the manifest-declared schema for a custom workflow action type.
 *
 * @param name - Custom workflow action type name
 * @returns The declared schema when available
 */
export declare function getDeclaredCustomActionSchema(name: string): CustomWorkflowActionDeclaration | undefined;
