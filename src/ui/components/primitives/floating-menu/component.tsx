'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useResolveFrom, useSubscribe } from "../../../context";
import { resolveRuntimeLocale } from "../../../i18n/resolve";
import { renderIcon } from "../../../icons/render";
import { useManifestRuntime, useRouteRuntime } from "../../../manifest/runtime";
import { ButtonControl } from "../../forms/button";
import {
  resolveSurfacePresentation,
  type RuntimeSurfaceState,
} from "../../_base/style-surfaces";
import { resolvePrimitiveValue } from "../resolve-value";
import type { FloatingMenuConfig, FloatingMenuEntry } from "./types";

const ANIMATION_DURATION = 150;

type SurfaceConfig = Record<string, unknown>;

function SurfaceStyles({ css }: { css?: string }) {
  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null;
}

function resolveSlotSurface(params: {
  surfaceId?: string;
  implementationBase?: Record<string, unknown>;
  componentSurface?: Record<string, unknown>;
  itemSurface?: Record<string, unknown>;
  activeStates?: RuntimeSurfaceState[];
}) {
  return resolveSurfacePresentation(params);
}

export interface FloatingPanelProps {
  open: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLElement | null>;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  animate?: boolean;
  minWidth?: string;
  role?: string;
  dataAttributes?: Record<string, string>;
  style?: CSSProperties;
  className?: string;
  surfaceId?: string;
  slot?: SurfaceConfig;
  activeStates?: RuntimeSurfaceState[];
  testId?: string;
  children: ReactNode;
}

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
          setMounted(false);
          closeTimerRef.current = null;
        }, ANIMATION_DURATION);
      } else {
        setMounted(false);
      }
    }
  }, [enableAnimation, mounted, open]);

  useEffect(() => {
    return () => {
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

  const alignStyle: CSSProperties =
    align === "end"
      ? { right: 0 }
      : align === "center"
        ? { left: "50%" }
        : { left: 0 };

  const sideStyle: CSSProperties =
    side === "top"
      ? { bottom: "100%", marginBottom: "var(--sn-spacing-xs, 0.25rem)" }
      : { top: "100%", marginTop: "var(--sn-spacing-xs, 0.25rem)" };

  const centerTranslate = align === "center" ? "translateX(-50%) " : "";
  const animationStyle: CSSProperties = enableAnimation
    ? {
        opacity: animating ? 1 : 0,
        transform: `${centerTranslate}${animating ? "scale(1)" : "scale(0.95)"}`,
        transformOrigin: side === "top" ? "bottom" : "top",
        transition: `opacity var(--sn-duration-fast, ${ANIMATION_DURATION}ms) var(--sn-ease-default, ease), transform var(--sn-duration-fast, ${ANIMATION_DURATION}ms) var(--sn-ease-default, ease)`,
      }
    : align === "center"
      ? { transform: "translateX(-50%)" }
      : {};

  const panelSurface = resolveSlotSurface({
    surfaceId,
    implementationBase: {
      position: "absolute",
      zIndex: "var(--sn-z-index-dropdown, 50)",
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
    },
    componentSurface: slot,
    activeStates: open ? ["open", ...(activeStates ?? [])] : activeStates,
  });

  return (
    <>
      <div
        role={role}
        className={[className, panelSurface.className].filter(Boolean).join(" ")}
        data-floating-panel=""
        data-snapshot-id={surfaceId}
        data-testid={testId}
        {...(dataAttributes ?? {})}
        style={{
          ...alignStyle,
          ...sideStyle,
          ...animationStyle,
          ...(panelSurface.style ?? {}),
          ...(style ?? {}),
        }}
      >
        {children}
      </div>
      <SurfaceStyles css={panelSurface.scopedCss} />
    </>
  );
}

export function FloatingMenu({ config }: { config: FloatingMenuConfig }) {
  const execute = useActionExecutor();
  const [isOpen, setIsOpen] = useState(Boolean(config.open));
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const manifest = useManifestRuntime();
  const routeRuntime = useRouteRuntime();
  const localeState = useSubscribe({ from: "global.locale" });
  const activeLocale = resolveRuntimeLocale(manifest?.raw.i18n, localeState);

  useEffect(() => {
    if (typeof config.open === "boolean") {
      setIsOpen(config.open);
      if (!config.open) {
        setFocusedIndex(-1);
      }
    }
  }, [config.open]);

  const rootId = config.id ?? "floating-menu";
  const resolvedConfig = useResolveFrom({
    triggerLabel: config.triggerLabel,
    items: config.items ?? [],
  });
  const items = (resolvedConfig.items ?? []) as FloatingMenuEntry[];
  const align = config.align ?? "start";
  const side = config.side ?? "bottom";
  const templateOptions = {
    context: {
      app: manifest?.app ?? {},
      auth: manifest?.auth ?? {},
      route: {
        ...(routeRuntime?.currentRoute ?? {}),
        path: routeRuntime?.currentPath,
        params: routeRuntime?.params,
        query: routeRuntime?.query,
      },
    },
    locale: activeLocale,
    i18n: manifest?.raw.i18n,
  };
  const triggerLabel = resolvePrimitiveValue(
    resolvedConfig.triggerLabel ?? config.triggerLabel ?? "Open menu",
    templateOptions,
  );
  const rootSurface = resolveSlotSurface({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "relative",
      display: "inline-block",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });

  const actionableIndices = items
    .map((item, index) =>
      item.type === "item" && item.disabled !== true ? index : -1,
    )
    .filter((index) => index !== -1);

  const open = useCallback((nextFocusedIndex = -1) => {
    setIsOpen(true);
    setFocusedIndex(nextFocusedIndex);
  }, []);

  const close = useCallback((restoreFocus = true) => {
    setIsOpen(false);
    setFocusedIndex(-1);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  const handleItemClick = useCallback(
    (entry: FloatingMenuEntry) => {
      if (entry.type !== "item" || entry.disabled) {
        return;
      }

      if (entry.action) {
        void execute(entry.action as Parameters<typeof execute>[0]);
      }
      close();
    },
    [close, execute],
  );

  useEffect(() => {
    if (!isOpen || focusedIndex < 0) {
      return;
    }

    itemRefs.current[focusedIndex]?.focus();
  }, [focusedIndex, isOpen]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (!isOpen) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          open(actionableIndices[0] ?? -1);
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          open(actionableIndices[actionableIndices.length - 1] ?? -1);
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(actionableIndices[0] ?? -1);
        }
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const currentPosition = actionableIndices.indexOf(focusedIndex);
        const nextPosition =
          currentPosition === -1 || currentPosition >= actionableIndices.length - 1
            ? 0
            : currentPosition + 1;
        setFocusedIndex(actionableIndices[nextPosition] ?? -1);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const currentPosition = actionableIndices.indexOf(focusedIndex);
        const previousPosition =
          currentPosition <= 0
            ? actionableIndices.length - 1
            : currentPosition - 1;
        setFocusedIndex(actionableIndices[previousPosition] ?? -1);
        return;
      }

      if ((event.key === "Enter" || event.key === " ") && focusedIndex >= 0) {
        event.preventDefault();
        const entry = items[focusedIndex];
        if (entry) {
          handleItemClick(entry);
        }
      }
    },
    [actionableIndices, focusedIndex, handleItemClick, isOpen, items, open],
  );

  return (
    <>
      <div
        ref={containerRef}
        data-snapshot-component="floating-menu"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <FloatingMenuStyles />
        <ButtonControl
          buttonRef={triggerRef}
          variant="ghost"
          onClick={() => (isOpen ? close() : open())}
          onKeyDown={handleKeyDown}
          surfaceId={`${rootId}-trigger`}
          surfaceConfig={config.slots?.trigger}
          ariaLabel={triggerLabel}
          ariaExpanded={isOpen}
          ariaHasPopup="menu"
          activeStates={isOpen ? ["open"] : []}
        >
          {config.triggerIcon ? renderIcon(config.triggerIcon, 16) : null}
          {triggerLabel}
        </ButtonControl>

        <FloatingPanel
          open={isOpen}
          onClose={close}
          containerRef={containerRef}
          side={side}
          align={align}
          surfaceId={`${rootId}-panel`}
          slot={config.slots?.panel}
          activeStates={isOpen ? ["open"] : []}
        >
          <div onKeyDown={handleKeyDown}>
            {items.map((entry, index) => {
              if (entry.type === "separator") {
                return (
                  <MenuSeparator
                    key={`separator-${index}`}
                    surfaceId={`${rootId}-separator-${index}`}
                    slot={entry.slots?.separator ?? config.slots?.separator}
                  />
                );
              }

              if (entry.type === "label") {
                return (
                  <MenuLabel
                    key={`label-${index}`}
                    text={resolvePrimitiveValue(entry.text, templateOptions)}
                    surfaceId={`${rootId}-label-${index}`}
                    slot={entry.slots?.label ?? config.slots?.label}
                  />
                );
              }

              return (
                <MenuItem
                  key={`item-${index}`}
                  label={resolvePrimitiveValue(entry.label, templateOptions)}
                  icon={entry.icon}
                  onClick={() => handleItemClick(entry)}
                  disabled={entry.disabled}
                  destructive={entry.destructive}
                  active={focusedIndex === index}
                  tabIndex={focusedIndex === index ? 0 : -1}
                  buttonRef={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  surfaceId={`${rootId}-item-${index}`}
                  slot={entry.slots?.item ?? config.slots?.item}
                  labelSlot={entry.slots?.itemLabel ?? config.slots?.itemLabel}
                  iconSlot={entry.slots?.itemIcon ?? config.slots?.itemIcon}
                />
              );
            })}
          </div>
        </FloatingPanel>
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
    </>
  );
}

export interface MenuItemProps {
  label: string;
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  role?: string;
  active?: boolean;
  current?: boolean;
  selected?: boolean;
  style?: CSSProperties;
  className?: string;
  surfaceId?: string;
  slot?: SurfaceConfig;
  labelSlot?: SurfaceConfig;
  iconSlot?: SurfaceConfig;
  tabIndex?: number;
  buttonRef?:
    | RefObject<HTMLButtonElement | null>
    | ((node: HTMLButtonElement | null) => void);
}

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

  const itemClassName = [className, itemSurface.className].filter(Boolean).join(" ");

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        role={role}
        data-menu-item=""
        data-snapshot-id={surfaceId}
        data-active={active ? "true" : undefined}
        data-current={current ? "true" : undefined}
        data-selected={selected ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
        tabIndex={tabIndex}
        className={itemClassName || undefined}
        style={{
          ...(itemSurface.style ?? {}),
          ...(style ?? {}),
          ...(destructive
            ? { color: "var(--sn-color-destructive, #dc2626)" }
            : undefined),
        }}
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
      </button>
      <SurfaceStyles css={itemSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
    </>
  );
}

export function MenuSeparator({
  surfaceId,
  slot,
}: {
  surfaceId?: string;
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

export function MenuLabel({
  text,
  surfaceId,
  slot,
}: {
  text: string;
  surfaceId?: string;
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

export function FloatingMenuStyles() {
  return (
    <style>{`
      [data-floating-panel] {
        backdrop-filter: blur(8px);
      }
      [data-floating-panel] [data-menu-item] {
        transition: background-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
                    color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease),
                    opacity var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease);
      }
      [data-floating-panel] [data-menu-item]:not(:disabled):hover {
        background: var(--sn-color-accent, #f3f4f6);
      }
      [data-floating-panel] [data-menu-item][data-active="true"],
      [data-floating-panel] [data-menu-item][data-current="true"],
      [data-floating-panel] [data-menu-item][data-selected="true"] {
        background: color-mix(in oklch, var(--sn-color-accent, #f3f4f6) 92%, transparent);
        color: var(--sn-color-foreground, #111827);
      }
      [data-floating-panel] [data-menu-item][data-current="true"],
      [data-floating-panel] [data-menu-item][data-selected="true"] {
        font-weight: var(--sn-font-weight-semibold, 600);
      }
      [data-floating-panel] [data-menu-item][data-disabled="true"] {
        opacity: var(--sn-opacity-disabled, 0.5);
      }
      [data-floating-panel] [data-menu-item]:focus { outline: none; }
      [data-floating-panel] [data-menu-item]:focus-visible {
        outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
        outline-offset: -2px;
      }
    `}</style>
  );
}
