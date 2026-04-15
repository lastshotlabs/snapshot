'use client';

import { useCallback, useEffect, useState } from "react";
import { ButtonControl } from "../components/forms/button";

interface InspectorState {
  type: string;
  id?: string;
  config: Record<string, unknown>;
  element: HTMLElement;
}

/**
 * Development inspector for manifest-rendered components.
 */
export function ComponentInspector() {
  const [inspected, setInspected] = useState<InspectorState | null>(null);

  const handleClick = useCallback((event: MouseEvent) => {
    if (!event.altKey) {
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const componentElement = target.closest(
      "[data-snapshot-component]",
    ) as HTMLElement | null;
    if (!componentElement) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    let config: Record<string, unknown> = {};
    const configValue = componentElement.getAttribute("data-snapshot-config");
    if (configValue) {
      try {
        config = JSON.parse(configValue) as Record<string, unknown>;
      } catch {
        config = { raw: configValue };
      }
    }

    setInspected({
      type:
        componentElement.getAttribute("data-snapshot-component") ?? "unknown",
      id:
        componentElement.getAttribute("data-snapshot-id") ??
        componentElement.getAttribute("data-component-id") ??
        undefined,
      config,
      element: componentElement,
    });
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [handleClick]);

  useEffect(() => {
    if (!inspected) {
      return;
    }

    const { element } = inspected;
    const previousOutline = element.style.outline;
    const previousOffset = element.style.outlineOffset;
    element.style.outline =
      "2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb))";
    element.style.outlineOffset = "2px";

    return () => {
      element.style.outline = previousOutline;
      element.style.outlineOffset = previousOffset;
    };
  }, [inspected]);

  if (!inspected) {
    return null;
  }

  return (
    <div
      data-snapshot-inspector=""
      style={{
        position: "fixed",
        right: "var(--sn-spacing-lg, 1.5rem)",
        bottom: "var(--sn-spacing-lg, 1.5rem)",
        width: "min(32rem, calc(100vw - 2rem))",
        maxHeight: "min(70vh, 42rem)",
        overflow: "auto",
        zIndex: 99998,
        border: "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        background: "var(--sn-color-card, #ffffff)",
        color: "var(--sn-color-foreground, #111827)",
        boxShadow: "var(--sn-shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.1))",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--sn-spacing-md, 1rem)",
          padding: "var(--sn-spacing-md, 1rem)",
          borderBottom:
            "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
        }}
      >
        <div>
          <strong>{inspected.type}</strong>
          {inspected.id ? ` #${inspected.id}` : ""}
        </div>
        <ButtonControl
          type="button"
          onClick={() => setInspected(null)}
          variant="ghost"
          size="icon"
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "var(--sn-font-size-lg, 1.125rem)",
          }}
        >
          {"\u00D7"}
        </ButtonControl>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "var(--sn-spacing-md, 1rem)",
          fontFamily:
            "var(--sn-font-mono, ui-monospace, SFMono-Regular, monospace)",
          fontSize: "var(--sn-font-size-xs, 0.75rem)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {JSON.stringify(inspected.config, null, 2)}
      </pre>
    </div>
  );
}
