'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { SlotOverrides } from "../../_base/types";
import { BUTTON_INTERACTIVE_CSS, getButtonStyle } from "../../_base/button-styles";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Duration tokens ──────────────────────────────────────────────────────────

const DURATION_MAP: Record<string, number> = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
};

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface CollapsibleBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Controlled open state. When undefined, the component manages its own state. */
  open?: boolean;
  /** Default open state for uncontrolled mode. */
  defaultOpen?: boolean;
  /** Animation duration token ("instant", "fast", "normal", "slow") or ms number. */
  duration?: string;
  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, trigger, content). */
  slots?: SlotOverrides;
  /** Trigger element rendered before the collapsible content. */
  trigger?: ReactNode;
  /** React children rendered inside the collapsible content. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Collapsible -- an animated expand/collapse container with an optional trigger.
 * Works with plain React props.
 *
 * @example
 * ```tsx
 * <CollapsibleBase
 *   trigger={<button>Toggle</button>}
 *   defaultOpen={false}
 *   duration="fast"
 * >
 *   <p>Collapsible content here</p>
 * </CollapsibleBase>
 * ```
 */
export function CollapsibleBase({
  id,
  open: controlledOpen,
  defaultOpen = false,
  duration: durationProp,
  onOpenChange,
  className,
  style,
  slots,
  trigger,
  children,
}: CollapsibleBaseProps) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string>(isOpen ? "auto" : "0px");
  const duration = DURATION_MAP[durationProp ?? "fast"] ?? 150;
  const rootId = id ?? "collapsible";

  useEffect(() => {
    const element = contentRef.current;
    if (!element) {
      return;
    }
    if (isOpen) {
      setHeight(`${element.scrollHeight}px`);
      const timer = setTimeout(() => setHeight("auto"), duration);
      return () => clearTimeout(timer);
    }

    setHeight(`${element.scrollHeight}px`);
    const rafId = requestAnimationFrame(() => setHeight("0px"));
    return () => cancelAnimationFrame(rafId);
  }, [duration, isOpen]);

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const contentSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-content`,
    implementationBase: {
      overflow: "hidden",
      transition: `height ${duration}ms var(--sn-ease-default, ease)`,
    },
    componentSurface: slots?.content,
    activeStates: isOpen ? ["open"] : [],
  });
  const triggerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger`,
    implementationBase: {
      ...getButtonStyle("ghost", "sm", false),
      display: "block",
      width: "100%",
      minHeight: "auto",
      padding: 0,
      backgroundColor: "transparent",
      backgroundImage: "none",
      borderWidth: 0,
      borderStyle: "solid",
      borderColor: "transparent",
      borderRadius: "inherit",
      textAlign: "inherit",
      color: "inherit",
      cursor: "pointer",
      style: {
        font: "inherit",
      },
    },
    componentSurface: slots?.trigger,
    activeStates: isOpen ? ["open"] : [],
  });

  const toggle = () => {
    if (!isControlled) {
      const next = !internalOpen;
      setInternalOpen(next);
      onOpenChange?.(next);
    } else {
      onOpenChange?.(!controlledOpen);
    }
  };

  return (
    <div
      data-snapshot-component="collapsible"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      {trigger ? (
        <div
          role="button"
          tabIndex={0}
          data-sn-button=""
          data-variant="ghost"
          data-size="sm"
          data-open={isOpen ? "true" : undefined}
          data-snapshot-id={`${rootId}-trigger`}
          onClick={toggle}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              toggle();
            }
          }}
          aria-expanded={isOpen}
          className={triggerSurface.className}
          style={triggerSurface.style}
        >
          {trigger}
        </div>
      ) : null}
      <div
        ref={contentRef}
        data-collapsible-content=""
        data-snapshot-id={`${rootId}-content`}
        data-open={isOpen ? "true" : undefined}
        className={contentSurface.className}
        style={{
          ...(contentSurface.style ?? {}),
          height,
        }}
      >
        {children}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={triggerSurface.scopedCss} />
      <SurfaceStyles css={contentSurface.scopedCss} />
      <SurfaceStyles css={BUTTON_INTERACTIVE_CSS} />
    </div>
  );
}
