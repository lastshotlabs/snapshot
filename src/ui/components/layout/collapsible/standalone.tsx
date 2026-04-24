'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
  slots?: Record<string, Record<string, unknown>>;
  /** Trigger element rendered before the collapsible content. */
  trigger?: ReactNode;
  /** React children rendered inside the collapsible content. */
  children?: ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone Collapsible -- an animated expand/collapse container with an optional trigger.
 * No manifest context required.
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
    requestAnimationFrame(() => setHeight("0px"));
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
        <button
          type="button"
          data-sn-button=""
          onClick={toggle}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              toggle();
            }
          }}
          aria-expanded={isOpen}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "block",
            width: "100%",
            textAlign: "inherit",
            font: "inherit",
            color: "inherit",
          }}
        >
          {trigger}
        </button>
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
      <SurfaceStyles css={contentSurface.scopedCss} />
    </div>
  );
}
