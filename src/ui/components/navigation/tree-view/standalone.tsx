'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { renderIcon } from "../../../icons/render";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";

// ── Standalone Props ──────────────────────────────────────────���───────────────

export interface TreeViewBaseItem {
  /** Display label for the node. */
  label: string;
  /** Unique value identifier (falls back to path key). */
  value?: string;
  /** Icon name rendered before the label. */
  icon?: string;
  /** Badge text displayed after the label. */
  badge?: string;
  /** Whether the node is initially expanded. */
  expanded?: boolean;
  /** Whether the node is disabled. */
  disabled?: boolean;
  /** Child nodes. */
  children?: TreeViewBaseItem[];
  /** Per-item slot overrides. */
  slots?: Record<string, Record<string, unknown>>;
}

export interface TreeViewBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Tree data. */
  items: TreeViewBaseItem[];
  /** Whether items are selectable. */
  selectable?: boolean;
  /** Whether multiple items can be selected. */
  multiSelect?: boolean;
  /** Whether to show item icons. */
  showIcon?: boolean;
  /** Whether to show tree connectors. */
  showConnectors?: boolean;
  /** Called when an item is selected. */
  onSelect?: (value: string) => void;
  /** Empty state message. */
  emptyMessage?: string;
  /** Whether remote data is loading. Shows a skeleton UI when true. */
  isLoading?: boolean;
  /** Error content to display. When provided, shows an error state instead of the tree. */
  error?: ReactNode;
  /** Called when the user requests a retry from the error state. */
  onRetry?: () => void;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getNodeKey(item: TreeViewBaseItem, pathKey: string): string {
  return item.value ?? pathKey;
}

function collectExpandedKeys(
  items: TreeViewBaseItem[],
  parentPath: string,
): Set<string> {
  const keys = new Set<string>();
  items.forEach((item, index) => {
    const pathKey = `${parentPath}-${index}`;
    const nodeKey = getNodeKey(item, pathKey);
    if (item.expanded) {
      keys.add(nodeKey);
    }
    if (item.children) {
      for (const key of collectExpandedKeys(item.children, pathKey)) {
        keys.add(key);
      }
    }
  });
  return keys;
}

function buildExpansionSignature(items: TreeViewBaseItem[]): string {
  return JSON.stringify(
    items.map((item) => ({
      value: item.value,
      expanded: item.expanded === true,
      children: item.children ? buildExpansionSignature(item.children) : null,
    })),
  );
}

// ── TreeNode subcomponent ───────────────────────────────────────────────────

interface TreeNodeProps {
  rootId: string;
  item: TreeViewBaseItem;
  depth: number;
  selected: Set<string>;
  expanded: Set<string>;
  onToggle: (value: string) => void;
  onSelect: (value: string) => void;
  selectable: boolean;
  showIcon: boolean;
  showConnectors: boolean;
  pathKey: string;
  slots?: Record<string, Record<string, unknown>>;
}

function TreeNode({
  rootId,
  item,
  depth,
  selected,
  expanded,
  onToggle,
  onSelect,
  selectable,
  showIcon,
  showConnectors,
  pathKey,
  slots,
}: TreeNodeProps) {
  const nodeKey = getNodeKey(item, pathKey);
  const hasChildren = Boolean(item.children?.length);
  const isExpanded = expanded.has(nodeKey);
  const isSelected = selected.has(nodeKey);
  const isDisabled = item.disabled ?? false;
  const rowStates = [
    ...(isSelected ? (["selected", "current"] as const) : []),
    ...(isExpanded ? (["open"] as const) : []),
    ...(isDisabled ? (["disabled"] as const) : []),
  ];

  const itemSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-item-${pathKey}`,
    componentSurface: slots?.item,
    itemSurface: item.slots?.item,
    activeStates: rowStates,
  });
  const rowSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-row-${pathKey}`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sn-spacing-xs, 0.25rem)",
      width: "100%",
      padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
      paddingLeft: `calc(${depth} * var(--sn-spacing-lg, 1.5rem) + var(--sn-spacing-sm, 0.5rem))`,
      cursor: isDisabled ? "not-allowed" : "pointer",
      opacity: isDisabled ? "var(--sn-opacity-disabled, 0.5)" : 1,
      backgroundColor: isSelected
        ? "var(--sn-color-accent, #f1f5f9)"
        : "transparent",
      color: isSelected
        ? "var(--sn-color-accent-foreground, #0f172a)"
        : "var(--sn-color-foreground, #111827)",
      borderRadius: "var(--sn-radius-sm, 0.25rem)",
      fontSize: "var(--sn-font-size-sm, 0.875rem)",
      userSelect: "none",
      position: "relative",
      appearance: "none",
      border: "none",
      outline: "none",
      textAlign: "left",
      states: {
        selected: {
          bg: "var(--sn-color-accent, #f1f5f9)",
          color: "var(--sn-color-accent-foreground, #0f172a)",
        },
        current: {
          bg: "var(--sn-color-accent, #f1f5f9)",
          color: "var(--sn-color-accent-foreground, #0f172a)",
        },
        disabled: {
          opacity: "var(--sn-opacity-disabled, 0.5)",
          cursor: "not-allowed",
        },
      },
    } as Record<string, unknown>,
    componentSurface: slots?.row,
    itemSurface: item.slots?.row,
    activeStates: rowStates,
  });
  const connectorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-connector-${pathKey}`,
    implementationBase: {
      position: "absolute",
      left: `calc(${depth - 1} * var(--sn-spacing-lg, 1.5rem) + var(--sn-spacing-sm, 0.5rem) + 8px)`,
      top: 0,
      width: "var(--sn-spacing-md, 1rem)",
      height: "50%",
      borderLeft:
        "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
      borderBottom:
        "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
      borderBottomLeftRadius: "var(--sn-radius-xs, 0.125rem)",
      pointerEvents: "none",
    } as Record<string, unknown>,
    componentSurface: slots?.connector,
    itemSurface: item.slots?.connector,
  });
  const disclosureSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-disclosure-${pathKey}`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 16,
      height: 16,
      flexShrink: 0,
      transition:
        "transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      transform: "rotate(0deg)",
      states: {
        open: {
          transform: "rotate(90deg)",
        },
      },
    } as Record<string, unknown>,
    componentSurface: slots?.disclosure,
    itemSurface: item.slots?.disclosure,
    activeStates: [
      ...(isExpanded ? (["open"] as const) : []),
      ...(isDisabled ? (["disabled"] as const) : []),
    ],
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-icon-${pathKey}`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      flexShrink: 0,
      color: "var(--sn-color-muted-foreground, #6b7280)",
    } as Record<string, unknown>,
    componentSurface: slots?.icon,
    itemSurface: item.slots?.icon,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label-${pathKey}`,
    implementationBase: {
      flex: 1,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    } as Record<string, unknown>,
    componentSurface: slots?.label,
    itemSurface: item.slots?.label,
    activeStates: rowStates,
  });
  const badgeSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-badge-${pathKey}`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 var(--sn-spacing-xs, 0.25rem)",
      borderRadius: "var(--sn-radius-full, 9999px)",
      backgroundColor: "var(--sn-color-secondary, #f3f4f6)",
      color: "var(--sn-color-secondary-foreground, #374151)",
      fontSize: "var(--sn-font-size-xs, 0.75rem)",
      lineHeight: 1.5,
    } as Record<string, unknown>,
    componentSurface: slots?.badge,
    itemSurface: item.slots?.badge,
  });
  const childrenSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-children-${pathKey}`,
    componentSurface: slots?.children,
    itemSurface: item.slots?.children,
    activeStates: isExpanded ? ["open"] : [],
  });

  const handleClick = () => {
    if (isDisabled) {
      return;
    }

    if (hasChildren) {
      onToggle(nodeKey);
    }
    if (selectable) {
      onSelect(nodeKey);
    }
  };

  return (
    <div
      data-testid="tree-node"
      data-depth={depth}
      data-snapshot-id={`${rootId}-item-${pathKey}`}
      className={itemSurface.className}
      style={itemSurface.style}
    >
      <ButtonControl
        type="button"
        disabled={isDisabled}
        testId="tree-node-row"
        onClick={handleClick}
        role="treeitem"
        tabIndex={isDisabled ? -1 : isSelected ? 0 : -1}
        ariaExpanded={hasChildren ? isExpanded : undefined}
        ariaSelected={selectable ? isSelected : undefined}
        variant="ghost"
        size="sm"
        surfaceId={`${rootId}-row-${pathKey}`}
        surfaceConfig={rowSurface.resolvedConfigForWrapper}
        activeStates={rowStates}
      >
        {showConnectors && depth > 0 ? (
          <span
            data-testid="tree-connector"
            data-snapshot-id={`${rootId}-connector-${pathKey}`}
            className={connectorSurface.className}
            style={connectorSurface.style}
            aria-hidden="true"
          />
        ) : null}
        {hasChildren ? (
          <span
            data-testid="tree-chevron"
            data-snapshot-id={`${rootId}-disclosure-${pathKey}`}
            className={disclosureSurface.className}
            style={disclosureSurface.style}
            aria-hidden="true"
          >
            {"\u25B6"}
          </span>
        ) : (
          <span
            data-snapshot-id={`${rootId}-disclosure-${pathKey}`}
            className={disclosureSurface.className}
            style={disclosureSurface.style}
            aria-hidden="true"
          />
        )}
        {showIcon && item.icon ? (
          <span
            data-testid="tree-icon"
            data-snapshot-id={`${rootId}-icon-${pathKey}`}
            className={iconSurface.className}
            style={iconSurface.style}
            aria-hidden="true"
          >
            {renderIcon(item.icon, 14)}
          </span>
        ) : null}
        <span
          data-testid="tree-label"
          data-snapshot-id={`${rootId}-label-${pathKey}`}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {String(item.label)}
        </span>
        {item.badge ? (
          <span
            data-testid="tree-badge"
            data-snapshot-id={`${rootId}-badge-${pathKey}`}
            className={badgeSurface.className}
            style={badgeSurface.style}
          >
            {String(item.badge)}
          </span>
        ) : null}
      </ButtonControl>

      {hasChildren && isExpanded ? (
        <div
          data-testid="tree-children"
          role="group"
          data-snapshot-id={`${rootId}-children-${pathKey}`}
          className={childrenSurface.className}
          style={childrenSurface.style}
        >
          {item.children!.map((child, childIndex) => {
            const childPathKey = `${pathKey}-${childIndex}`;
            return (
              <TreeNode
                key={getNodeKey(child, childPathKey)}
                rootId={rootId}
                item={child}
                depth={depth + 1}
                selected={selected}
                expanded={expanded}
                onToggle={onToggle}
                onSelect={onSelect}
                selectable={selectable}
                showIcon={showIcon}
                showConnectors={showConnectors}
                pathKey={childPathKey}
                slots={slots}
              />
            );
          })}
        </div>
      ) : null}
      <SurfaceStyles css={itemSurface.scopedCss} />
      <SurfaceStyles css={rowSurface.scopedCss} />
      <SurfaceStyles css={connectorSurface.scopedCss} />
      <SurfaceStyles css={disclosureSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={badgeSurface.scopedCss} />
      <SurfaceStyles css={childrenSurface.scopedCss} />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone TreeView — a hierarchical tree with expand/collapse and selection.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <TreeViewBase
 *   items={[
 *     { label: "src", children: [
 *       { label: "index.ts", icon: "file" },
 *       { label: "utils.ts", icon: "file" },
 *     ]},
 *   ]}
 *   onSelect={(value) => console.log(value)}
 * />
 * ```
 */
export function TreeViewBase({
  id,
  items,
  selectable = true,
  multiSelect = false,
  showIcon = true,
  showConnectors = true,
  onSelect: onSelectProp,
  emptyMessage = "No items to display",
  isLoading = false,
  error,
  onRetry,
  className,
  style,
  slots,
}: TreeViewBaseProps) {
  const rootId = id ?? "tree-view";
  const expansionSignature = useMemo(
    () => buildExpansionSignature(items),
    [items],
  );

  const [expanded, setExpanded] = useState<Set<string>>(() =>
    collectExpandedKeys(items, "root"),
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    setExpanded((previous) => {
      const next = new Set(previous);
      for (const key of collectExpandedKeys(items, "root")) {
        next.add(key);
      }
      return next;
    });
  }, [expansionSignature]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = useCallback((nodeKey: string) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(nodeKey)) {
        next.delete(nodeKey);
      } else {
        next.add(nodeKey);
      }
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (nodeKey: string) => {
      if (!selectable) {
        return;
      }

      setSelected((previous) => {
        const next = new Set(multiSelect ? previous : []);
        if (next.has(nodeKey)) {
          next.delete(nodeKey);
        } else {
          next.add(nodeKey);
        }
        return next;
      });

      onSelectProp?.(nodeKey);
    },
    [multiSelect, onSelectProp, selectable],
  );

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });

  // Loading skeleton
  if (isLoading) {
    const loadingStateSurface = resolveSurfacePresentation({
      surfaceId: `${rootId}-loading-state`,
      implementationBase: {
        padding: "var(--sn-spacing-md, 1rem)",
      },
      componentSurface: slots?.loadingState,
    });
    const loadingItemSurface = resolveSurfacePresentation({
      surfaceId: `${rootId}-loading-item`,
      implementationBase: {
        display: "flex",
        alignItems: "center",
        gap: "var(--sn-spacing-sm, 0.5rem)",
        style: {
          padding: "var(--sn-spacing-xs, 0.25rem) 0",
        },
      },
      componentSurface: slots?.loadingItem,
    });
    const loadingMarkerSurface = resolveSurfacePresentation({
      surfaceId: `${rootId}-loading-marker`,
      implementationBase: {
        style: {
          width: "var(--sn-font-size-sm, 0.875rem)",
          height: "var(--sn-font-size-sm, 0.875rem)",
          borderRadius: "var(--sn-radius-sm, 0.25rem)",
          backgroundColor: "var(--sn-color-muted, #e5e7eb)",
        },
      },
      componentSurface: slots?.loadingMarker,
    });
    const loadingLabelSurface = resolveSurfacePresentation({
      surfaceId: `${rootId}-loading-label`,
      implementationBase: {
        style: {
          height: "var(--sn-font-size-sm, 0.875rem)",
          width: "40%",
          backgroundColor: "var(--sn-color-muted, #e5e7eb)",
          borderRadius: "var(--sn-radius-sm, 0.25rem)",
        },
      },
      componentSurface: slots?.loadingLabel,
    });
    const loadingLabelSecondarySurface = resolveSurfacePresentation({
      surfaceId: `${rootId}-loading-label-secondary`,
      implementationBase: {
        style: {
          height: "var(--sn-font-size-sm, 0.875rem)",
          width: "60%",
          backgroundColor: "var(--sn-color-muted, #e5e7eb)",
          borderRadius: "var(--sn-radius-sm, 0.25rem)",
        },
      },
      componentSurface: slots?.loadingLabelSecondary,
    });

    return (
      <div
        data-snapshot-component="tree-view"
        data-testid="tree-view"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-testid="tree-view-loading"
          data-snapshot-id={`${rootId}-loading-state`}
          className={loadingStateSurface.className}
          style={loadingStateSurface.style}
        >
          {[0, 1, 2].map((index) => {
            const loadingItemRowSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-loading-item-${index}`,
              implementationBase: loadingItemSurface.resolvedConfigForWrapper,
              itemSurface: {
                style: {
                  paddingLeft: `calc(${index === 2 ? 1 : 0} * var(--sn-spacing-lg, 1.5rem))`,
                },
              },
            });
            const loadingLabelRowSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-loading-label-${index}`,
              implementationBase: loadingLabelSurface.resolvedConfigForWrapper,
              itemSurface: {
                width: `${40 + index * 20}%`,
              },
            });
            const loadingLabelSecondaryRowSurface = resolveSurfacePresentation({
              surfaceId: `${rootId}-loading-label-secondary-${index}`,
              implementationBase: loadingLabelSecondarySurface.resolvedConfigForWrapper,
              itemSurface: {
                width: `${55 + index * 10}%`,
                style: {
                  opacity: "var(--sn-opacity-disabled, 0.5)",
                },
              },
            });

            return (
              <div
                key={index}
                data-snapshot-id={`${rootId}-loading-item-${index}`}
                className={loadingItemRowSurface.className}
                style={loadingItemRowSurface.style}
              >
                <div
                  data-snapshot-id={`${rootId}-loading-marker-${index}`}
                  className={loadingMarkerSurface.className}
                  style={loadingMarkerSurface.style}
                />
                <div
                  data-snapshot-id={`${rootId}-loading-label-${index}`}
                  className={loadingLabelRowSurface.className}
                  style={loadingLabelRowSurface.style}
                />
                <div
                  data-snapshot-id={`${rootId}-loading-label-secondary-${index}`}
                  className={loadingLabelSecondaryRowSurface.className}
                  style={loadingLabelSecondaryRowSurface.style}
                />
                <SurfaceStyles css={loadingItemRowSurface.scopedCss} />
                <SurfaceStyles css={loadingLabelRowSurface.scopedCss} />
                <SurfaceStyles css={loadingLabelSecondaryRowSurface.scopedCss} />
              </div>
            );
          })}
        </div>
        <SurfaceStyles css={rootSurface.scopedCss} />
        <SurfaceStyles css={loadingStateSurface.scopedCss} />
        <SurfaceStyles css={loadingItemSurface.scopedCss} />
        <SurfaceStyles css={loadingMarkerSurface.scopedCss} />
        <SurfaceStyles css={loadingLabelSurface.scopedCss} />
        <SurfaceStyles css={loadingLabelSecondarySurface.scopedCss} />
      </div>
    );
  }

  // Error state
  if (error) {
    const errorStateSurface = resolveSurfacePresentation({
      surfaceId: `${rootId}-error-state`,
      implementationBase: {},
      componentSurface: slots?.errorState,
    });

    return (
      <div
        data-snapshot-component="tree-view"
        data-testid="tree-view"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-testid="tree-view-error"
          data-snapshot-id={`${rootId}-error-state`}
          className={errorStateSurface.className}
          style={errorStateSurface.style}
        >
          {error}
        </div>
        <SurfaceStyles css={rootSurface.scopedCss} />
        <SurfaceStyles css={errorStateSurface.scopedCss} />
      </div>
    );
  }

  if (items.length === 0) {
    const emptyStateSurface = resolveSurfacePresentation({
      surfaceId: `${rootId}-empty-state`,
      implementationBase: {
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        color: "var(--sn-color-muted-foreground, #6b7280)",
        style: {
          padding: "var(--sn-spacing-lg, 1.5rem)",
          textAlign: "center",
        },
      },
      componentSurface: slots?.emptyState,
    });

    return (
      <div
        data-snapshot-component="tree-view"
        data-testid="tree-view"
        data-snapshot-id={`${rootId}-root`}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <div
          data-testid="tree-view-empty"
          data-snapshot-id={`${rootId}-empty-state`}
          className={emptyStateSurface.className}
          style={emptyStateSurface.style}
        >
          {emptyMessage}
        </div>
        <SurfaceStyles css={rootSurface.scopedCss} />
        <SurfaceStyles css={emptyStateSurface.scopedCss} />
      </div>
    );
  }

  return (
    <div
      data-snapshot-component="tree-view"
      data-testid="tree-view"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
      role="tree"
    >
      {items.map((item, index) => {
        const pathKey = `root-${index}`;
        return (
          <TreeNode
            key={getNodeKey(item, pathKey)}
            rootId={rootId}
            item={item}
            depth={0}
            selected={selected}
            expanded={expanded}
            onToggle={handleToggle}
            onSelect={handleSelect}
            selectable={selectable}
            showIcon={showIcon}
            showConnectors={showConnectors}
            pathKey={pathKey}
            slots={slots}
          />
        );
      })}
      <SurfaceStyles css={rootSurface.scopedCss} />
    </div>
  );
}
