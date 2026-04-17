"use client";

import { useEffect, useRef, useState } from "react";
import { usePublish, useSubscribe } from "../../../context/index";
import { useActionExecutor } from "../../../actions/executor";
import { SurfaceStyles } from "../../_base/surface-styles";
import { extractSurfaceConfig, resolveSurfacePresentation } from "../../_base/style-surfaces";
import { InputControl } from "../../forms/input";
import type { NavSearchConfig } from "./types";

export function NavSearch({ config }: { config: NavSearchConfig }) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const publish = usePublish(config.publishTo);
  const resolvedPlaceholder = useSubscribe(config.placeholder) as string | undefined;
  const execute = useActionExecutor();

  // Publish search value to state
  useEffect(() => {
    if (config.publishTo) publish(value);
  }, [value, config.publishTo, publish]);

  // Keyboard shortcut to focus
  useEffect(() => {
    if (!config.shortcut || typeof window === "undefined") return;
    const shortcut = config.shortcut.toLowerCase();
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      if (shortcut === "ctrl+k" && ctrl && key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (shortcut === "/" && key === "/" && !isTypingContext(e)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [config.shortcut]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (config.onSearch) {
      void execute(config.onSearch as Parameters<typeof execute>[0]);
    }
  };

  const rootId = config.id ?? "nav-search";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      position: "relative",
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const inputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-input`,
    implementationBase: {
      width: "100%",
      minHeight: "2rem",
      padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
      border: "1px solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "var(--sn-radius-md, 0.375rem)",
      background: "var(--sn-color-background, #fff)",
      color: "var(--sn-color-foreground, #111827)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      fontFamily: "inherit",
      outline: "none",
      transition:
        "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      focus: {
        borderColor: "var(--sn-color-primary, #2563eb)",
        ring: true,
      },
    },
    componentSurface: config.slots?.input,
  });
  const shortcutSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-shortcut`,
    implementationBase: {
      position: "absolute",
      right: "var(--sn-spacing-sm, 0.5rem)",
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      pointerEvents: "none",
      opacity: value ? 0 : 0.6,
    },
    componentSurface: config.slots?.shortcut,
  });

  return (
    <form
      onSubmit={handleSubmit}
      data-snapshot-component="nav-search"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <InputControl
        inputRef={inputRef}
        type="search"
        placeholder={resolvedPlaceholder ?? "Search..."}
        value={value}
        onChangeText={setValue}
        surfaceId={`${rootId}-input`}
        surfaceConfig={inputSurface.resolvedConfigForWrapper}
        ariaLabel={resolvedPlaceholder ?? "Search"}
      />
      {config.shortcut && (
        <kbd
          data-snapshot-id={`${rootId}-shortcut`}
          className={shortcutSurface.className}
          style={shortcutSurface.style}
        >
          {config.shortcut}
        </kbd>
      )}
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={inputSurface.scopedCss} />
      <SurfaceStyles css={shortcutSurface.scopedCss} />
    </form>
  );
}

function isTypingContext(e: KeyboardEvent): boolean {
  const tag = (e.target as HTMLElement)?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}
