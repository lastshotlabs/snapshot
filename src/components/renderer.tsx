import React from "react";
import type { ApiClient } from "../api/client";
import type { ComponentConfig } from "../manifest/schema";
import type { ActionContext } from "./actions";
import { useModalState } from "./page-context";
import type { ComponentRegistry } from "./registry";

// ── Types ────────────────────────────────────────────────────────────────────

export interface RendererContext {
  registry: ComponentRegistry;
  api: ApiClient;
  actionContext: ActionContext;
}

// ── Renderer ─────────────────────────────────────────────────────────────────

/**
 * Renders a component config tree by resolving each type from the registry.
 *
 * Handles:
 * - Standard components (resolved by `config.type`)
 * - Custom component overrides (`config.component` handler ref)
 * - Sidebar-layout split children (`config.sidebar` + `config.content`)
 * - Modal components (injects isOpen/onClose from modal state)
 * - Nested children (`config.children`)
 */
export function ComponentRenderer({
  config,
  context,
}: {
  config: ComponentConfig;
  context: RendererContext;
}) {
  const customComponentName = config.component
    ? typeof config.component === "string"
      ? config.component
      : (config.component as { handler: string }).handler
    : null;

  const resolveType = customComponentName ?? config.type;
  const entry = context.registry.resolve(resolveType);

  if (!entry) {
    if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
      console.warn(
        `[snapshot] Component type "${resolveType}" not found in registry. ` +
          `Available: ${context.registry.list().join(", ")}`,
      );
    }
    return null;
  }

  const { component: Component } = entry;

  const componentProps: Record<string, unknown> = {
    config,
    id: config.id,
    api: context.api,
    actionContext: context.actionContext,
  };

  // Modal components need isOpen/onClose from the shared modal state
  if (config.type === "modal" && config.id) {
    return (
      <ModalWrapper
        id={config.id}
        component={Component}
        componentProps={componentProps}
        context={context}
      />
    );
  }

  // Sidebar-layout has separate sidebar/content branches
  if (
    config.sidebar &&
    Array.isArray(config.sidebar) &&
    config.content &&
    Array.isArray(config.content)
  ) {
    return (
      <Component
        {...componentProps}
        sidebarChildren={
          <ComponentTreeRenderer configs={config.sidebar as ComponentConfig[]} context={context} />
        }
        contentChildren={
          <ComponentTreeRenderer configs={config.content as ComponentConfig[]} context={context} />
        }
      />
    );
  }

  // Standard children
  const childConfigs =
    config.children && Array.isArray(config.children) ? (config.children as ComponentConfig[]) : [];

  if (childConfigs.length > 0) {
    return (
      <Component {...componentProps}>
        {childConfigs.map((child, i) => (
          <ComponentRenderer
            key={child.id ?? `${config.type}-child-${i}`}
            config={child}
            context={context}
          />
        ))}
      </Component>
    );
  }

  return <Component {...componentProps} />;
}

/**
 * Wrapper for modal components that injects isOpen/onClose from shared modal state.
 */
function ModalWrapper({
  id,
  component: Component,
  componentProps,
  context,
}: {
  id: string;
  component: React.ComponentType<Record<string, unknown>>;
  componentProps: Record<string, unknown>;
  context: RendererContext;
}) {
  const { isOpen } = useModalState(id);

  const childConfigs =
    (componentProps.config as ComponentConfig).children &&
    Array.isArray((componentProps.config as ComponentConfig).children)
      ? ((componentProps.config as ComponentConfig).children as ComponentConfig[])
      : [];

  return (
    <Component
      {...componentProps}
      isOpen={isOpen}
      onClose={() => context.actionContext.closeModal(id)}
    >
      {childConfigs.map((child, i) => (
        <ComponentRenderer key={child.id ?? `modal-child-${i}`} config={child} context={context} />
      ))}
    </Component>
  );
}

/**
 * Renders an array of component configs.
 */
export function ComponentTreeRenderer({
  configs,
  context,
}: {
  configs: ComponentConfig[];
  context: RendererContext;
}) {
  return (
    <>
      {configs.map((config, i) => (
        <ComponentRenderer key={config.id ?? `root-${i}`} config={config} context={context} />
      ))}
    </>
  );
}
