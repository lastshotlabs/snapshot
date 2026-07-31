import { createElement, type ReactNode } from "react";
import { CenteredLayout } from "./centered/component";
import { registerLayout } from "./registry";

let builtInLayoutsRegistered = false;

function wrapLayout(
  Component: (props: {
    config: Record<string, unknown>;
    children: ReactNode;
  }) => ReactNode,
) {
  return function RegisteredLayout({
    config,
    children,
  }: {
    config: Record<string, unknown>;
    children: ReactNode;
  }) {
    return createElement(Component, { config, children });
  };
}

export function registerBuiltInLayouts(): void {
  if (builtInLayoutsRegistered) {
    return;
  }

  builtInLayoutsRegistered = true;
  registerLayout("centered", {
    component: wrapLayout(CenteredLayout) as unknown as Parameters<
      typeof registerLayout
    >[1]["component"],
  });
}
