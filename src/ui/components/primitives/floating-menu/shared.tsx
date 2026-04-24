'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { ButtonControl } from "../../forms/button";
import {
  resolveSurfacePresentation,
  type RuntimeSurfaceState,
} from "../../_base/style-surfaces";

const ANIMATION_DURATION = 150;

type SurfaceConfig = Record<string, unknown>;

function resolveSlotSurface(params: {
  surfaceId?: string;
  implementationBase?: Record<string, unknown>;
  componentSurface?: Record<string, unknown>;
  itemSurface?: Record<string, unknown>;
  activeStates?: RuntimeSurfaceState[];
}) {
  return resolveSurfacePresentation(params);
}

// ── FloatingPanel ────────────────────────────────────────────────────────────

export interface FloatingPanelProps {
  /** Whether the panel is visible. */
  open: boolean;
  /** Called when the panel should close. */
  onClose: () => void;
  /** Ref to the container element for outside-click detection. */
  containerRef: RefObject<HTMLElement | null>;
  /** Which side of the trigger to position on. */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment along the cross axis. */
  align?: "start" | "center" | "end";
  /** Whether to animate open/close transitions. */
  animate?: boolean;
  /** Minimum width of the panel. */
  minWidth?: string;
  /** ARIA role for the panel element. */
  role?: string;
  /** Additional data-* attributes for the panel. */
  dataAttributes?: Record<string, string>;
  /** Inline style applied to the panel. */
  style?: CSSProperties;
  /** CSS class name applied to the panel. */
  className?: string;
  /** Surface ID for style scoping. */
  surfaceId?: string;
  /** Surface slot overrides. */
  slot?: SurfaceConfig;
  /** Active interaction states for surface styling. */
  activeStates?: RuntimeSurfaceState[];
  /** Test ID for the panel element. */
  testId?: string;
  /** Content rendered inside the panel. */
  children: ReactNode;
}

/**
 * Positioned floating panel with animation, outside-click dismissal, and Escape key handling.
 * Used internally by FloatingMenuBase, DropdownMenuBase, and other overlay components.
 *
 * @example
 * ```tsx
 * <FloatingPanel open={isOpen} onClose={() => setOpen(false)} containerRef={ref}>
 *   <MenuItem label="Edit" onClick={handleEdit} />
 * </FloatingPanel>
 * ```
 */
export function FloatingPanel({
  open,
  onClose,
  containerRef,
  side = "bottom",
  align = "start",
  animate: enableAnimation = true,
  minWidth = "11rem",
  role = "menu",
  dataAttributes,
  style,
  className,
  surfaceId,
  slot,
  activeStates,
  testId,
  children,
}: FloatingPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const stableClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (open) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setMounted(true);
      if (enableAnimation) {
        openTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) {
            openTimerRef.current = null;
            return;
          }
          setAnimating(true);
          openTimerRef.current = null;
        }, 10);
      } else {
        setAnimating(true);
      }
    } else {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
      setAnimating(false);
      if (enableAnimation && mounted) {
        closeTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) {
            closeTimerRef.current = null;
            return;
          }
          setMounted(false);
          closeTimerRef.current = null;
        }, ANIMATION_DURATION);
      } else {
        setMounted(false);
      }
    }
  }, [enableAnimation, mounted, open]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
      }
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handler = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        stableClose();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [containerRef, open, stableClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        stableClose();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, stableClose]);

  if (!mounted) {
    return null;
  }

  const alignsVertically = side === "left" || side === "right";
  const alignStyle: CSSProperties = alignsVertically
    ? align === "end"
      ? { bottom: 0 }
      : align === "center"
        ? { top: "50%" }
        : { top: 0 }
    : align === "end"
      ? { right: 0 }
      : align === "center"
        ? { left: "50%" }
        : { left: 0 };

  const sideStyle: CSSProperties =
    side === "top"
      ? { bottom: "100%", marginBottom: "var(--sn-spacing-xs, 0.25rem)" }
      : side === "left"
        ? { right: "100%", marginRight: "var(--sn-spacing-xs, 0.25rem)" }
        : side === "right"
          ? { left: "100%", marginLeft: "var(--sn-spacing-xs, 0.25rem)" }
          : { top: "100%", marginTop: "var(--sn-spacing-xs, 0.25rem)" };

  const centerTranslate =
    align === "center"
      ? alignsVertically
        ? "translateY(-50%) "
        : "translateX(-50%) "
      : "";
  const transformOrigin =
    side === "top"
      ? "bottom"
      : side === "left"
        ? "right"
        : side === "right"
          ? "left"
          : "top";
  const animationStyle: CSSProperties = enableAnimation
    ? {
        opacity: animating ? 1 : 0,
        transform: `${centerTranslate}${animating ? "scale(1)" : "scale(0.95)"}`,
        transformOrigin,
        transition: `opacity var(--sn-duration-fast, ${ANIMATION_DURATION}ms) var(--sn-ease-default, ease), transform var(--sn-duration-fast, ${ANIMATION_DURATION}ms) var(--sn-ease-default, ease)`,
      }
    : align === "center"
      ? {
          transform: alignsVertically ? "translateY(-50%)" : "translateX(-50%)",
        }
      : {};

  const panelSurface = resolveSlotSurface({
    surfaceId,
    implementationBase: {
      position: "absolute",
      zIndex: "var(--sn-z-index-popover, 50)",
      minWidth,
      maxWidth: "min(22rem, calc(100vw - 1rem))",
      listStyle: "none",
      margin: 0,
      padding: "var(--sn-spacing-2xs, 0.25rem)",
      background: "var(--sn-color-popover, var(--sn-color-card, #ffffff))",
      color:
        "var(--sn-color-popover-foreground, var(--sn-color-card-foreground, #111827))",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "var(--sn-radius-lg, 0.75rem)",
      boxShadow:
        "var(--sn-shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1))",
      overflow: "hidden",
      style: {
        backdropFilter: "blur(8px)",
        isolation: "isolate",
      },
    },
    componentSurface: slot,
    itemSurface:
      className || style
        ? {
            className,
            style,
          }
        : undefined,
    activeStates: open ? ["open", ...(activeStates ?? [])] : activeStates,
  });

  return (
    <>
      <div
        role={role}
        className={panelSurface.className}
        data-floating-panel=""
        data-snapshot-id={surfaceId}
        data-testid={testId}
        {...(dataAttributes ?? {})}
        style={{
          ...alignStyle,
          ...sideStyle,
          ...animationStyle,
          ...(panelSurface.style ?? {}),
        }}
      >
        {children}
      </div>
      <SurfaceStyles css={panelSurface.scopedCss} />
    </>
  );
}

// ── MenuItem ─────────────────────────────────────────────────────────────────

export interface MenuItemProps {
  /** Display text for the menu item. */
  label: string;
  /** Icon name rendered before the label. */
  icon?: string;
  /** Click handler for the menu item. */
  onClick?: () => void;
  /** Whether the item is disabled. */
  disabled?: boolean;
  /** Whether the item is styled as destructive. */
  destructive?: boolean;
  /** ARIA role for the item. */
  role?: string;
  /** Whether the item is in an active state. */
  active?: boolean;
  /** Whether the item represents the current page/location. */
  current?: boolean;
  /** Whether the item is selected. */
  selected?: boolean;
  /** Inline style applied to the item. */
  style?: CSSProperties;
  /** CSS class name applied to the item. */
  className?: string;
  /** Surface ID for style scoping. */
  surfaceId?: string;
  /** Surface slot overrides for the item. */
  slot?: SurfaceConfig;
  /** Surface slot overrides for the label. */
  labelSlot?: SurfaceConfig;
  /** Surface slot overrides for the icon. */
  iconSlot?: SurfaceConfig;
  /** Tab order. */
  tabIndex?: number;
  /** Ref callback for the underlying button element. */
  buttonRef?:
    | RefObject<HTMLButtonElement | null>
    | ((node: HTMLButtonElement | null) => void);
}

/**
 * Styled menu item button with icon, label, and interaction states.
 * Used inside FloatingPanel for dropdown and context menus.
 *
 * @example
 * ```tsx
 * <MenuItem label="Delete" icon="trash" destructive onClick={handleDelete} />
 * ```
 */
export function MenuItem({
  label,
  icon,
  onClick,
  disabled = false,
  destructive = false,
  role = "menuitem",
  active = false,
  current = false,
  selected = false,
  style,
  className,
  surfaceId,
  slot,
  labelSlot,
  iconSlot,
  tabIndex,
  buttonRef,
}: MenuItemProps) {
  const activeStates: RuntimeSurfaceState[] = [];
  if (selected) {
    activeStates.push("selected");
  }
  if (current) {
    activeStates.push("current");
  }
  if (active) {
    activeStates.push("active");
  }
  if (disabled) {
    activeStates.push("disabled");
  }

  const itemSurface = resolveSlotSurface({
    surfaceId,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      width: "100%",
      minHeight: "2.25rem",
      padding: "var(--sn-spacing-xs, 0.5rem) var(--sn-spacing-sm, 0.75rem)",
      border: "none",
      background: "transparent",
      textAlign: "left",
      fontFamily: "inherit",
      appearance: "none",
      borderRadius: "var(--sn-radius-md, 0.375rem)",
      cursor: disabled ? "not-allowed" : "pointer",
      userSelect: "none",
      whiteSpace: "nowrap",
      overflow: "hidden",
      color: destructive
        ? "var(--sn-color-destructive, #dc2626)"
        : "var(--sn-color-foreground, #111827)",
      transition:
        "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease), color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease), opacity var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      hover: disabled
        ? undefined
        : {
            bg: "var(--sn-color-accent, #f3f4f6)",
          },
      focus: {
        ring: true,
      },
      states: {
        active: {
          bg: "color-mix(in oklch, var(--sn-color-accent, #f3f4f6) 92%, transparent)",
          color: "var(--sn-color-foreground, #111827)",
        },
        current: {
          bg: "color-mix(in oklch, var(--sn-color-accent, #f3f4f6) 92%, transparent)",
          color: "var(--sn-color-foreground, #111827)",
          fontWeight: "var(--sn-font-weight-semibold, 600)",
        },
        selected: {
          bg: "color-mix(in oklch, var(--sn-color-accent, #f3f4f6) 92%, transparent)",
          color: "var(--sn-color-foreground, #111827)",
          fontWeight: "var(--sn-font-weight-semibold, 600)",
        },
        disabled: {
          opacity: "var(--sn-opacity-disabled, 0.5)",
        },
      },
    },
    componentSurface: slot,
    activeStates,
  });
  const labelSurface = resolveSlotSurface({
    surfaceId: surfaceId ? `${surfaceId}-label` : undefined,
    implementationBase: {
      flex: 1,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    componentSurface: labelSlot,
  });
  const iconSurface = resolveSlotSurface({
    surfaceId: surfaceId ? `${surfaceId}-icon` : undefined,
    implementationBase: {
      display: "inline-flex",
      flexShrink: 0,
    },
    componentSurface: iconSlot,
  });

  return (
    <>
      <ButtonControl
        buttonRef={buttonRef}
        type="button"
        role={role}
        ariaCurrent={current || undefined}
        ariaSelected={selected || undefined}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
        tabIndex={tabIndex}
        surfaceId={surfaceId}
        surfaceConfig={itemSurface.resolvedConfigForWrapper}
        className={className}
        style={style}
        variant="ghost"
        size="sm"
        activeStates={activeStates}
      >
        {icon ? (
          <span
            data-menu-item-icon=""
            data-snapshot-id={surfaceId ? `${surfaceId}-icon` : undefined}
            className={iconSurface.className}
            style={iconSurface.style}
          >
            {renderIcon(icon, 16)}
          </span>
        ) : null}
        <span
          data-menu-item-label=""
          data-snapshot-id={surfaceId ? `${surfaceId}-label` : undefined}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {label}
        </span>
      </ButtonControl>
      <SurfaceStyles css={itemSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
    </>
  );
}

// ── MenuSeparator ────────────────────────────────────────────────────────────

/**
 * Horizontal divider line between menu items.
 *
 * @example
 * ```tsx
 * <MenuItem label="Edit" />
 * <MenuSeparator />
 * <MenuItem label="Delete" destructive />
 * ```
 */
export function MenuSeparator({
  surfaceId,
  slot,
}: {
  /** Surface ID for style scoping. */
  surfaceId?: string;
  /** Surface slot overrides. */
  slot?: SurfaceConfig;
}) {
  const separatorSurface = resolveSlotSurface({
    surfaceId,
    implementationBase: {
      height: "1px",
      backgroundColor: "var(--sn-color-border, #e5e7eb)",
      margin: "var(--sn-spacing-xs, 0.25rem) 0",
    },
    componentSurface: slot,
  });

  return (
    <>
      <div
        role="separator"
        data-menu-separator=""
        data-snapshot-id={surfaceId}
        className={separatorSurface.className}
        style={separatorSurface.style}
      />
      <SurfaceStyles css={separatorSurface.scopedCss} />
    </>
  );
}

// ── MenuLabel ────────────────────────────────────────────────────────────────

/**
 * Non-interactive label heading within a menu group.
 *
 * @example
 * ```tsx
 * <MenuLabel text="Actions" />
 * <MenuItem label="Edit" />
 * ```
 */
export function MenuLabel({
  text,
  surfaceId,
  slot,
}: {
  /** Label text displayed as a group heading. */
  text: string;
  /** Surface ID for style scoping. */
  surfaceId?: string;
  /** Surface slot overrides. */
  slot?: SurfaceConfig;
}) {
  const labelSurface = resolveSlotSurface({
    surfaceId,
    implementationBase: {
      padding: "var(--sn-spacing-xs, 0.5rem) var(--sn-spacing-sm, 0.75rem)",
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
      fontWeight: 600,
      color: "var(--sn-color-muted-foreground, #6b7280)",
      userSelect: "none",
    },
    componentSurface: slot,
  });

  return (
    <>
      <div
        data-menu-label=""
        data-snapshot-id={surfaceId}
        className={labelSurface.className}
        style={labelSurface.style}
      >
        {text}
      </div>
      <SurfaceStyles css={labelSurface.scopedCss} />
    </>
  );
}

/** @deprecated No-op placeholder for backwards compatibility. */
export function FloatingMenuStyles() {
  return null;
}
