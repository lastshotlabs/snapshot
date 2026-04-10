import type {
  CustomWorkflowActionDeclaration,
  CustomWorkflowActionDeclarationMap,
  WorkflowActionHandler,
} from "./types";

const workflowActionRegistry = new Map<string, WorkflowActionHandler>();
const declaredCustomActionRegistry = new Map<
  string,
  CustomWorkflowActionDeclaration
>();

/**
 * Register a runtime handler for a custom workflow action type.
 *
 * @param type - Custom workflow action type name
 * @param handler - Runtime handler invoked by the workflow engine
 */
export function registerWorkflowAction(
  type: string,
  handler: WorkflowActionHandler,
): void {
  workflowActionRegistry.set(type, handler);
}

/**
 * Retrieve a registered runtime handler for a custom workflow action type.
 *
 * @param type - Custom workflow action type name
 * @returns The registered handler when available
 */
export function getRegisteredWorkflowAction(
  type: string,
): WorkflowActionHandler | undefined {
  return workflowActionRegistry.get(type);
}

/**
 * Replace the manifest-declared custom action schema registry.
 *
 * Called by the manifest compiler once per compilation pass.
 *
 * @param declarations - Parsed `manifest.workflows.actions.custom` declarations
 */
export function setDeclaredCustomActionSchemas(
  declarations: CustomWorkflowActionDeclarationMap,
): void {
  declaredCustomActionRegistry.clear();
  for (const [name, declaration] of Object.entries(declarations)) {
    declaredCustomActionRegistry.set(name, declaration);
  }
}

/**
 * Retrieve the manifest-declared schema for a custom workflow action type.
 *
 * @param name - Custom workflow action type name
 * @returns The declared schema when available
 */
export function getDeclaredCustomActionSchema(
  name: string,
): CustomWorkflowActionDeclaration | undefined {
  return declaredCustomActionRegistry.get(name);
}
