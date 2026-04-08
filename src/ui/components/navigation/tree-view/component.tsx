import { useState, useEffect, useCallback, useMemo } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { useComponentData } from "../../_base/use-component-data";
import type { TreeViewConfig, TreeItemInput } from "./types";

/**
 * Props for the internal TreeNode recursive renderer.
 */
interface TreeNodeProps {
  item: TreeItemInput;
  depth: number;
  selected: Set<string>;
  expanded: Set<string>;
  onToggle: (value: string) => void;
  onSelect: (value: string) => void;
  selectable: boolean;
  showIcon: boolean;
  showConnectors: boolean;
  /** Path key for nodes without explicit values. */
  pathKey: string;
}

/**
 * Get a unique key for a tree node.
 */
function getNodeKey(item: TreeItemInput, pathKey: string): string {
  return item.value ?? pathKey;
}

/**
 * Recursive tree node renderer.
 */
function TreeNode({
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
}: TreeNodeProps) {
  const nodeKey = getNodeKey(item, pathKey);
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expanded.has(nodeKey);
  const isSelected = selected.has(nodeKey);
  const isDisabled = item.disabled ?? false;

  const handleClick = () => {
    if (isDisabled) return;
    if (hasChildren) {
      onToggle(nodeKey);
    }
    if (selectable) {
      onSelect(nodeKey);
    }
  };

  return (
    <div data-testid="tree-node" data-depth={depth}>
      {/* Node row */}
      <div
        data-testid="tree-node-row"
        data-selected={isSelected ? "" : undefined}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        role={selectable ? "treeitem" : undefined}
        tabIndex={isDisabled ? -1 : isSelected ? 0 : -1}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={selectable ? isSelected : undefined}
        aria-disabled={isDisabled}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sn-spacing-xs, 0.25rem)",
          padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
          paddingLeft: `calc(${depth} * var(--sn-spacing-lg, 1.5rem) + var(--sn-spacing-sm, 0.5rem))`,
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.5 : 1,
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
        }}
      >
        {/* Connector lines */}
        {showConnectors && depth > 0 && (
          <div
            data-testid="tree-connector"
            style={{
              position: "absolute",
              left: `calc(${depth - 1} * var(--sn-spacing-lg, 1.5rem) + var(--sn-spacing-sm, 0.5rem) + 8px)`,
              top: 0,
              bottom: 0,
              width: "var(--sn-spacing-md, 1rem)",
              borderLeft: "1px solid var(--sn-color-border, #e5e7eb)",
              borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
              borderBottomLeftRadius: "var(--sn-radius-xs, 0.125rem)",
              height: "50%",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Expand/collapse chevron */}
        {hasChildren ? (
          <span
            data-testid="tree-chevron"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
              flexShrink: 0,
              transition:
                "transform var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
            }}
            aria-hidden="true"
          >
            {"\u25B6"}
          </span>
        ) : (
          <span
            style={{
              width: 16,
              height: 16,
              flexShrink: 0,
            }}
          />
        )}

        {/* Icon */}
        {showIcon && item.icon && (
          <span
            data-testid="tree-icon"
            style={{
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {item.icon}
          </span>
        )}

        {/* Label */}
        <span data-testid="tree-label">{item.label}</span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div data-testid="tree-children" role="group">
          {item.children!.map((child, childIndex) => {
            const childPathKey = `${pathKey}-${childIndex}`;
            return (
              <TreeNode
                key={getNodeKey(child, childPathKey)}
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
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Collect initially expanded node keys from item config.
 */
function collectExpandedKeys(
  items: TreeItemInput[],
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

/**
 * TreeView component — a hierarchical expandable tree with selectable nodes.
 *
 * Supports static items or dynamic data from an API endpoint.
 * Nodes can be expanded/collapsed, selected (single or multi),
 * and trigger actions on selection.
 *
 * @param props - Component props containing the tree view configuration
 *
 * @example
 * ```json
 * {
 *   "type": "tree-view",
 *   "items": [
 *     {
 *       "label": "Documents",
 *       "icon": "folder",
 *       "children": [
 *         { "label": "report.pdf", "icon": "file", "value": "report" }
 *       ]
 *     }
 *   ]
 * }
 * ```
 */
export function TreeView({ config }: { config: TreeViewConfig }) {
  const hasEndpoint = config.data !== undefined;
  const { data, isLoading, error, refetch } = useComponentData(
    hasEndpoint ? config.data! : "SKIP",
  );

  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const visible = useSubscribe(config.visible ?? true);

  const selectable = config.selectable ?? true;
  const multiSelect = config.multiSelect ?? false;
  const showIcon = config.showIcon ?? true;
  const showConnectors = config.showConnectors ?? true;

  // Resolve items from static config or API data
  const items = useMemo((): TreeItemInput[] => {
    if (!hasEndpoint) return config.items ?? [];
    if (!data) return [];

    const rawItems = Array.isArray(data)
      ? data
      : Array.isArray((data as Record<string, unknown>)["data"])
        ? ((data as Record<string, unknown>)["data"] as TreeItemInput[])
        : Array.isArray((data as Record<string, unknown>)["items"])
          ? ((data as Record<string, unknown>)["items"] as TreeItemInput[])
          : [];

    return rawItems as TreeItemInput[];
  }, [data, hasEndpoint, config.items]);

  // Expanded state
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    collectExpandedKeys(items, "root"),
  );

  // Selected state
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Re-compute expanded keys when items change
  useEffect(() => {
    if (items.length > 0) {
      setExpanded((prev) => {
        const initial = collectExpandedKeys(items, "root");
        // Merge: keep user toggled + initial
        const merged = new Set(prev);
        for (const key of initial) {
          merged.add(key);
        }
        return merged;
      });
    }
  }, [items]);

  // Publish selected value(s)
  useEffect(() => {
    if (publish) {
      const selectedArray = [...selected];
      publish(
        multiSelect
          ? { selected: selectedArray }
          : { selected: selectedArray[0] ?? null },
      );
    }
  }, [publish, selected, multiSelect]);

  const handleToggle = useCallback((nodeKey: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
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
      if (!selectable) return;

      setSelected((prev) => {
        const next = new Set(multiSelect ? prev : []);
        if (next.has(nodeKey)) {
          next.delete(nodeKey);
        } else {
          next.add(nodeKey);
        }
        return next;
      });

      if (config.action) {
        void execute(config.action, { value: nodeKey });
      }
    },
    [selectable, multiSelect, config.action, execute],
  );

  if (visible === false) return null;

  // Loading state
  if (isLoading && hasEndpoint) {
    return (
      <div
        data-snapshot-component="tree-view"
        data-testid="tree-view"
        className={config.className}
      >
        <div
          data-testid="tree-view-loading"
          style={{ padding: "var(--sn-spacing-md, 1rem)" }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sn-spacing-sm, 0.5rem)",
                padding: "var(--sn-spacing-xs, 0.25rem) 0",
                paddingLeft: `calc(${i === 2 ? 1 : 0} * var(--sn-spacing-lg, 1.5rem))`,
              }}
            >
              <div
                style={{
                  width: "var(--sn-font-size-sm, 0.875rem)",
                  height: "var(--sn-font-size-sm, 0.875rem)",
                  borderRadius: "var(--sn-radius-sm, 0.25rem)",
                  backgroundColor: "var(--sn-color-muted, #e5e7eb)",
                }}
              />
              <div
                style={{
                  height: "var(--sn-font-size-sm, 0.875rem)",
                  width: `${40 + i * 20}%`,
                  backgroundColor: "var(--sn-color-muted, #e5e7eb)",
                  borderRadius: "var(--sn-radius-sm, 0.25rem)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && hasEndpoint) {
    return (
      <div
        data-snapshot-component="tree-view"
        data-testid="tree-view"
        className={config.className}
      >
        <div
          data-testid="tree-view-error"
          style={{ color: "var(--sn-color-destructive, #dc2626)" }}
        >
          <span style={{ fontSize: "var(--sn-font-size-sm, 0.875rem)" }}>
            Failed to load tree
          </span>
          <button
            onClick={() => refetch()}
            style={{
              marginLeft: "var(--sn-spacing-sm, 0.5rem)",
              fontSize: "var(--sn-font-size-xs, 0.75rem)",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              padding: 0,
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div
        data-snapshot-component="tree-view"
        data-testid="tree-view"
        className={config.className}
      >
        <div
          data-testid="tree-view-empty"
          style={{
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            padding: "var(--sn-spacing-lg, 1.5rem)",
            textAlign: "center",
          }}
        >
          No items to display
        </div>
      </div>
    );
  }

  return (
    <div
      data-snapshot-component="tree-view"
      data-testid="tree-view"
      className={config.className}
      role="tree"
      style={{
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      <style>{`
        [data-snapshot-component="tree-view"] [data-testid="tree-node-row"]:not([aria-disabled="true"]):hover {
          background: var(--sn-color-secondary, #f3f4f6);
        }
        [data-snapshot-component="tree-view"] [data-testid="tree-node-row"]:focus {
          outline: none;
        }
        [data-snapshot-component="tree-view"] [data-testid="tree-node-row"]:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
        }
        [data-snapshot-component="tree-view"] [data-testid="tree-chevron"]:focus {
          outline: none;
        }
        [data-snapshot-component="tree-view"] [data-testid="tree-chevron"]:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
        }
      `}</style>
      {items.map((item, index) => {
        const pathKey = `root-${index}`;
        return (
          <TreeNode
            key={getNodeKey(item, pathKey)}
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
          />
        );
      })}
    </div>
  );
}
