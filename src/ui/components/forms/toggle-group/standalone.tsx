"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { renderIcon } from "../../../icons/render";
import { ButtonControl } from "../button";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface ToggleGroupItem {
  /** Unique value for this toggle item. */
  value: string;
  /** Label text displayed inside the item button. */
  label?: string;
  /** Icon name rendered beside the label. */
  icon?: string;
  /** Whether this individual item is disabled. */
  disabled?: boolean;
  /** Slot overrides for this item's sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

export interface ToggleGroupBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Array of toggle items to render in the group. */
  items: ToggleGroupItem[];
  /** Selection mode: single exclusive or multiple simultaneous. */
  mode?: "single" | "multiple";
  /** Controlled selected value(s). */
  value?: string | string[];
  /** Initial selected value(s) (uncontrolled). */
  defaultValue?: string | string[];
  /** Visual variant of the group container. */
  variant?: "outline" | "ghost";
  /** Size applied to all items in the group. */
  size?: "sm" | "md" | "lg";
  /** Called when the selection changes. */
  onChange?: (value: string | string[]) => void;

  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

const SIZE_MAP: Record<
  string,
  { height: string; fontSize: string; padding: string; iconSize: number }
> = {
  sm: {
    height: "2rem",
    fontSize: "var(--sn-font-size-xs, 0.75rem)",
    padding: "0 var(--sn-spacing-sm, 0.5rem)",
    iconSize: 14,
  },
  md: {
    height: "2.5rem",
    fontSize: "var(--sn-font-size-sm, 0.875rem)",
    padding: "0 var(--sn-spacing-md, 0.75rem)",
    iconSize: 16,
  },
  lg: {
    height: "3rem",
    fontSize: "var(--sn-font-size-base, 1rem)",
    padding: "0 var(--sn-spacing-lg, 1rem)",
    iconSize: 18,
  },
};

function StandaloneToggleItem({
  rootId,
  index,
  item,
  selected,
  variant,
  sizeConfig,
  isLast,
  onToggle,
  rootSlot,
}: {
  rootId: string;
  index: number;
  item: ToggleGroupItem;
  selected: boolean;
  variant: string;
  sizeConfig: (typeof SIZE_MAP)[string];
  isLast: boolean;
  onToggle: () => void;
  rootSlot?: Record<string, Record<string, unknown>>;
}) {
  const itemDisabled = item.disabled ?? false;

  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item-${index}`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--sn-spacing-xs, 0.25rem)",
      height: sizeConfig.height,
      padding: sizeConfig.padding,
      fontSize: sizeConfig.fontSize,
      fontFamily: "inherit",
      fontWeight: selected ? 600 : 400,
      background: selected ? "var(--sn-color-accent)" : "transparent",
      color: selected ? "var(--sn-color-accent-foreground)" : "inherit",
      borderRight:
        variant === "outline" && !isLast
          ? "1px solid var(--sn-color-border)"
          : undefined,
      opacity: itemDisabled ? 0.5 : 1,
    } as Record<string, unknown>,
    componentSurface: rootSlot?.item,
    itemSurface: item.slots?.item,
    activeStates: [
      ...(selected ? ["selected"] : []),
      ...(itemDisabled ? ["disabled"] : []),
    ] as Array<"selected" | "disabled">,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item-label-${index}`,
    componentSurface: rootSlot?.itemLabel,
    itemSurface: item.slots?.itemLabel,
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item-icon-${index}`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
    },
    componentSurface: rootSlot?.itemIcon,
    itemSurface: item.slots?.itemIcon,
  });
  const indicatorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-indicator-${index}`,
    implementationBase: {
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      pointerEvents: "none",
      boxShadow: selected
        ? "inset 0 0 0 1px var(--sn-color-primary, #2563eb)"
        : "none",
    } as Record<string, unknown>,
    componentSurface: rootSlot?.indicator,
    activeStates: selected ? ["selected"] : [],
  });

  return (
    <>
      <ButtonControl
        variant="ghost"
        disabled={itemDisabled}
        onClick={onToggle}
        surfaceId={`${rootId}-item-${index}`}
        surfaceConfig={itemSurface.resolvedConfigForWrapper}
        activeStates={
          [
            ...(selected ? ["selected"] : []),
            ...(itemDisabled ? ["disabled"] : []),
          ] as Array<"selected" | "disabled">
        }
        ariaLabel={item.label ?? item.value}
      >
        <span
          data-snapshot-id={`${rootId}-indicator-${index}`}
          className={indicatorSurface.className}
          style={indicatorSurface.style}
        />
        {item.icon ? (
          <span
            data-snapshot-id={`${rootId}-item-icon-${index}`}
            className={iconSurface.className}
            style={iconSurface.style}
          >
            {renderIcon(item.icon, sizeConfig.iconSize)}
          </span>
        ) : null}
        {item.label ? (
          <span
            data-snapshot-id={`${rootId}-item-label-${index}`}
            className={labelSurface.className}
            style={labelSurface.style}
          >
            {item.label}
          </span>
        ) : null}
      </ButtonControl>
      <SurfaceStyles css={itemSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={indicatorSurface.scopedCss} />
    </>
  );
}

/**
 * Standalone ToggleGroupBase -- a group of toggle buttons supporting single
 * or multi-select modes. No manifest context required.
 *
 * @example
 * ```tsx
 * <ToggleGroupBase
 *   items={[
 *     { value: "left", icon: "align-left" },
 *     { value: "center", icon: "align-center" },
 *     { value: "right", icon: "align-right" },
 *   ]}
 *   mode="single"
 *   variant="outline"
 *   onChange={(val) => setAlign(val)}
 * />
 * ```
 */
export function ToggleGroupBase({
  id,
  items,
  mode = "single",
  value: controlledValue,
  defaultValue,
  variant = "outline",
  size = "md",
  onChange,
  className,
  style,
  slots,
}: ToggleGroupBaseProps) {
  const initialValue = defaultValue ?? (mode === "multiple" ? [] : "");
  const [internalValue, setInternalValue] = useState<string | string[]>(initialValue);

  const currentValue: string | string[] =
    controlledValue !== undefined ? controlledValue : internalValue;

  const isSelected = (value: string): boolean => {
    if (Array.isArray(currentValue)) return currentValue.includes(value);
    return currentValue === value;
  };

  const handleToggle = (value: string) => {
    let next: string | string[];
    if (mode === "multiple") {
      const arr = Array.isArray(currentValue) ? currentValue : [];
      next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
    } else {
      next = currentValue === value ? "" : value;
    }
    setInternalValue(next);
    onChange?.(next);
  };

  const sizeConfig = SIZE_MAP[size] ?? SIZE_MAP["md"]!;
  const rootId = id ?? "toggle-group";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "inline-flex",
      borderRadius: "var(--sn-radius-md, 0.375rem)",
      border:
        variant === "outline" ? "1px solid var(--sn-color-border)" : undefined,
      overflow: "hidden",
    } as Record<string, unknown>,
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  return (
    <div
      role="group"
      data-snapshot-component="toggle-group"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style as CSSProperties}
    >
      {items.map((item, i) => (
        <StandaloneToggleItem
          key={item.value}
          rootId={rootId}
          index={i}
          item={item}
          selected={isSelected(item.value)}
          variant={variant}
          sizeConfig={sizeConfig}
          isLast={i === items.length - 1}
          onToggle={() => handleToggle(item.value)}
          rootSlot={slots}
        />
      ))}
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
