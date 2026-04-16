'use client';

import React, { useCallback, useRef, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { ButtonControl } from "../../forms/button";
import {
  FloatingMenuStyles,
  FloatingPanel,
  MenuItem,
  MenuLabel,
  MenuSeparator,
} from "../../primitives/floating-menu";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import type { DropdownMenuConfig } from "./types";

type DropdownMenuItem = DropdownMenuConfig["items"][number];

export function DropdownMenu({ config }: { config: DropdownMenuConfig }) {
  const execute = useActionExecutor();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const variant = config.trigger.variant ?? "default";
  const align = config.align ?? "start";
  const side = config.side ?? "bottom";
  const rootId = config.id ?? "dropdown-menu";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "relative",
      display: "inline-block",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const triggerLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger-label`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
    },
    componentSurface: config.slots?.triggerLabel,
  });
  const triggerIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger-icon`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
    },
    componentSurface: config.slots?.triggerIcon,
  });

  const actionableIndices = config.items
    .map((item: DropdownMenuItem, index: number) =>
      item.type === "item" && !item.disabled ? index : -1,
    )
    .filter((index: number) => index !== -1);

  const open = useCallback(() => {
    setIsOpen(true);
    setFocusedIndex(-1);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  const handleItemClick = useCallback(
    (index: number) => {
      const item = config.items[index];
      if (!item || item.type !== "item" || item.disabled) {
        return;
      }

      void execute(item.action);
      close();
    },
    [close, config.items, execute],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const currentPosition = actionableIndices.indexOf(focusedIndex);
        const nextPosition =
          currentPosition < actionableIndices.length - 1 ? currentPosition + 1 : 0;
        setFocusedIndex(actionableIndices[nextPosition] ?? 0);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const currentPosition = actionableIndices.indexOf(focusedIndex);
        const previousPosition =
          currentPosition > 0 ? currentPosition - 1 : actionableIndices.length - 1;
        setFocusedIndex(actionableIndices[previousPosition] ?? 0);
        return;
      }

      if ((event.key === "Enter" || event.key === " ") && focusedIndex >= 0) {
        event.preventDefault();
        handleItemClick(focusedIndex);
      }
    },
    [actionableIndices, focusedIndex, handleItemClick, isOpen, open],
  );

  return (
    <div
      ref={containerRef}
      data-snapshot-component="dropdown-menu"
      data-testid="dropdown-menu"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <FloatingMenuStyles />
      <ButtonControl
        variant={variant}
        onClick={() => (isOpen ? close() : open())}
        surfaceId={`${rootId}-trigger`}
        surfaceConfig={config.slots?.trigger}
        testId="dropdown-menu-trigger"
        ariaExpanded={isOpen}
        ariaHasPopup="menu"
        activeStates={isOpen ? ["open"] : []}
      >
        {config.trigger.icon ? (
          <span
            data-snapshot-id={`${rootId}-trigger-icon`}
            className={triggerIconSurface.className}
            style={triggerIconSurface.style}
          >
            {renderIcon(config.trigger.icon, 16)}
          </span>
        ) : null}
        {config.trigger.label ? (
          <span
            data-snapshot-id={`${rootId}-trigger-label`}
            className={triggerLabelSurface.className}
            style={triggerLabelSurface.style}
          >
            {config.trigger.label}
          </span>
        ) : null}
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
        <div onKeyDown={handleKeyDown} data-testid="dropdown-menu-content">
          {config.items.map((entry: DropdownMenuItem, index: number) => {
            if (entry.type === "separator") {
              return (
                <MenuSeparator
                  key={`separator-${index}`}
                  surfaceId={`${rootId}-separator-${index}`}
                  slot={config.slots?.separator}
                />
              );
            }

            if (entry.type === "label") {
              return (
                <MenuLabel
                  key={`label-${index}`}
                  text={entry.text}
                  surfaceId={`${rootId}-label-${index}`}
                  slot={entry.slots?.label ?? config.slots?.label}
                />
              );
            }

            return (
              <MenuItem
                key={`item-${index}`}
                label={entry.label}
                icon={entry.icon}
                onClick={() => handleItemClick(index)}
                disabled={entry.disabled}
                destructive={entry.destructive}
                active={focusedIndex === index}
                surfaceId={`${rootId}-item-${index}`}
                slot={entry.slots?.item ?? config.slots?.item}
                labelSlot={entry.slots?.itemLabel ?? config.slots?.itemLabel}
                iconSlot={entry.slots?.itemIcon ?? config.slots?.itemIcon}
              />
            );
          })}
        </div>
      </FloatingPanel>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={triggerLabelSurface.scopedCss} />
      <SurfaceStyles css={triggerIconSurface.scopedCss} />
    </div>
  );
}
