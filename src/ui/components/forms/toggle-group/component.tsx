"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { useSubscribe, usePublish } from "../../../context/index";
import { useActionExecutor } from "../../../actions/executor";
import { renderIcon } from "../../../icons/render";
import { ButtonControl } from "../button";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { ToggleGroupConfig } from "./types";


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

function ToggleItem({
  rootId,
  index,
  item,
  selected,
  variant,
  sizeConfig,
  isLast,
  role,
  onToggle,
  rootSlot,
  indicatorSlot,
}: {
  rootId: string;
  index: number;
  item: ToggleGroupConfig["items"][number];
  selected: boolean;
  variant: string;
  sizeConfig: (typeof SIZE_MAP)[string];
  isLast: boolean;
  role: "checkbox" | "radio";
  onToggle: () => void;
  rootSlot?: ToggleGroupConfig["slots"];
  indicatorSlot?: ToggleGroupConfig["slots"];
}) {
  const subscribedDisabled = useSubscribe(
    item.disabled != null &&
      typeof item.disabled === "object" &&
      "from" in item.disabled
      ? item.disabled
      : undefined,
  );
  const itemDisabled =
    typeof item.disabled === "boolean"
      ? item.disabled
      : subscribedDisabled === true;

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
    componentSurface: indicatorSlot?.indicator,
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
 * Render a single- or multi-select toggle group that can publish selection state into the Snapshot context graph.
 */
export function ToggleGroup({ config }: { config: ToggleGroupConfig }) {
  const execute = useActionExecutor();
  const controlledValue = useSubscribe(
    config.value != null &&
      typeof config.value === "object" &&
      "from" in config.value
      ? config.value
      : undefined,
  );

  const initialValue =
    config.defaultValue ?? (config.mode === "multiple" ? [] : "");
  const [internalValue, setInternalValue] = useState<string | string[]>(
    initialValue,
  );
  const publish = usePublish(config.publishTo);

  const currentValue: string | string[] =
    controlledValue !== undefined
      ? (controlledValue as string | string[])
      : internalValue;

  const isSelected = (value: string): boolean => {
    if (Array.isArray(currentValue)) return currentValue.includes(value);
    return currentValue === value;
  };

  const handleToggle = (value: string) => {
    let next: string | string[];
    if (config.mode === "multiple") {
      const arr = Array.isArray(currentValue) ? currentValue : [];
      next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
    } else {
      next = currentValue === value ? "" : value;
    }
    setInternalValue(next);
    if (config.publishTo) publish(next);
    if (config.onChange) {
      void execute(config.onChange as Parameters<typeof execute>[0]);
    }
  };

  const size = config.size ?? "md";
  const variant = config.variant ?? "outline";
  const sizeConfig = SIZE_MAP[size] ?? SIZE_MAP["md"]!;
  const itemRole = config.mode === "multiple" ? "checkbox" : "radio";
  const rootId = config.id ?? config.publishTo ?? "toggle-group";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      display: "inline-flex",
      borderRadius: "var(--sn-radius-md, 0.375rem)",
      border:
        variant === "outline" ? "1px solid var(--sn-color-border)" : undefined,
      overflow: "hidden",
    } as Record<string, unknown>,
    componentSurface: config,
    itemSurface: config.slots?.root,
  });

  return (
    <div
      role="group"
      data-snapshot-component="toggle-group"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style as CSSProperties}
    >
      {config.items.map((item, i) => (
        <ToggleItem
          key={item.value}
          rootId={rootId}
          index={i}
          item={item}
          selected={isSelected(item.value)}
          variant={variant}
          sizeConfig={sizeConfig}
          isLast={i === config.items.length - 1}
          role={itemRole}
          onToggle={() => handleToggle(item.value)}
          rootSlot={config.slots}
          indicatorSlot={config.slots}
        />
      ))}
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
