import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { useComponentData } from "../../_base/use-component-data";
import { Icon } from "../../../icons/index";
import type { EntityPickerConfig } from "./types";

/** Resolved entity shape used internally. */
interface ResolvedEntity {
  label: string;
  value: string;
  description?: string;
  icon?: string;
  avatar?: string;
}

/**
 * EntityPicker component — a searchable dropdown for selecting entities.
 *
 * Fetches entities from an API endpoint and presents them in a filterable
 * popover list. Supports single and multi-select with avatar/icon display.
 *
 * @param props - Component props containing the entity picker configuration
 *
 * @example
 * ```json
 * {
 *   "type": "entity-picker",
 *   "id": "assignee",
 *   "data": "GET /api/users",
 *   "labelField": "name",
 *   "valueField": "id",
 *   "multiple": false
 * }
 * ```
 */
export function EntityPicker({ config }: { config: EntityPickerConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const resolvedValue = useSubscribe(config.value ?? (config.multiple ? [] : ""));
  const executeAction = useActionExecutor();
  const publish = usePublish(config.id);
  const { data: apiData, isLoading } = useComponentData(config.data);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isMultiple = config.multiple ?? false;
  const searchable = config.searchable ?? true;
  const labelField = config.labelField ?? "name";
  const valueField = config.valueField ?? "id";
  const maxHeight = config.maxHeight ?? "300px";

  // Sync external value
  useEffect(() => {
    if (Array.isArray(resolvedValue)) {
      setSelected(resolvedValue as string[]);
    } else if (typeof resolvedValue === "string" && resolvedValue) {
      setSelected([resolvedValue]);
    }
  }, [resolvedValue]);

  // Build entities from API data
  const entities: ResolvedEntity[] = useMemo(() => {
    if (!apiData) return [];
    const items = Array.isArray(apiData)
      ? apiData
      : Array.isArray((apiData as Record<string, unknown>).data)
        ? ((apiData as Record<string, unknown>).data as Record<string, unknown>[])
        : [];

    return (items as Record<string, unknown>[]).map((item) => ({
      label: String(item[labelField] ?? ""),
      value: String(item[valueField] ?? ""),
      description: config.descriptionField
        ? String(item[config.descriptionField] ?? "")
        : undefined,
      icon: config.iconField ? String(item[config.iconField] ?? "") : undefined,
      avatar: config.avatarField
        ? String(item[config.avatarField] ?? "")
        : undefined,
    }));
  }, [apiData, labelField, valueField, config.descriptionField, config.iconField, config.avatarField]);

  // Filter by search
  const filtered = useMemo(() => {
    if (!search) return entities;
    const q = search.toLowerCase();
    return entities.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)),
    );
  }, [entities, search]);

  // Publish and notify
  const updateSelection = useCallback(
    (newSelected: string[]) => {
      setSelected(newSelected);
      const publishValue = isMultiple ? newSelected : (newSelected[0] ?? "");
      if (publish) publish({ value: publishValue });
      if (config.changeAction) {
        void executeAction(config.changeAction, { value: publishValue });
      }
    },
    [isMultiple, publish, config.changeAction, executeAction],
  );

  const toggleEntity = useCallback(
    (value: string) => {
      if (isMultiple) {
        const next = selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value];
        updateSelection(next);
      } else {
        updateSelection([value]);
        setIsOpen(false);
      }
    },
    [isMultiple, selected, updateSelection],
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchable) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchable]);

  if (visible === false) return null;

  // Build trigger label
  const selectedEntities = entities.filter((e) => selected.includes(e.value));
  const triggerLabel =
    selectedEntities.length === 0
      ? (config.label ?? "Select...")
      : isMultiple
        ? `${selectedEntities.length} selected`
        : (selectedEntities[0]?.label ?? "");

  return (
    <div
      data-snapshot-component="entity-picker"
      data-testid="entity-picker"
      className={config.className}
      ref={containerRef}
      style={{
        position: "relative",
        fontFamily: "var(--sn-font-sans, system-ui, sans-serif)",
        display: "inline-block",
      }}
    >
      {/* Trigger button */}
      <button
        data-testid="entity-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--sn-spacing-sm, 0.5rem)",
          padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
          border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
          borderRadius: "var(--sn-radius-md, 0.5rem)",
          backgroundColor: "var(--sn-color-input, #ffffff)",
          color: selectedEntities.length > 0
            ? "var(--sn-color-foreground, #111827)"
            : "var(--sn-color-muted-foreground, #6b7280)",
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          cursor: "pointer",
          minWidth: "160px",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {triggerLabel}
        </span>
        <span
          style={{
            fontSize: "var(--sn-font-size-xs, 0.75rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {isOpen ? "\u25B2" : "\u25BC"}
        </span>
      </button>

      {/* Dropdown popover */}
      {isOpen && (
        <div
          data-testid="entity-picker-dropdown"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "var(--sn-spacing-2xs, 0.125rem)",
            minWidth: "240px",
            width: "100%",
            backgroundColor: "var(--sn-color-popover, #ffffff)",
            border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
            borderRadius: "var(--sn-radius-md, 0.5rem)",
            boxShadow: "var(--sn-shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1))",
            zIndex: "var(--sn-z-index-dropdown, 100)" as string,
            overflow: "hidden",
          }}
        >
          {/* Search input */}
          {searchable && (
            <div
              style={{
                padding: "var(--sn-spacing-sm, 0.5rem)",
                borderBottom: "1px solid var(--sn-color-border, #e5e7eb)",
              }}
            >
              <input
                ref={searchInputRef}
                data-testid="entity-picker-search"
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                  border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
                  borderRadius: "var(--sn-radius-sm, 0.25rem)",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                  color: "var(--sn-color-foreground, #111827)",
                  backgroundColor: "var(--sn-color-input, #ffffff)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {/* Entity list */}
          <div
            style={{
              maxHeight,
              overflowY: "auto",
            }}
          >
            {isLoading && (
              <div
                data-testid="entity-picker-loading"
                style={{
                  padding: "var(--sn-spacing-md, 0.75rem)",
                  textAlign: "center",
                  color: "var(--sn-color-muted-foreground, #6b7280)",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                }}
              >
                Loading...
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <div
                data-testid="entity-picker-empty"
                style={{
                  padding: "var(--sn-spacing-md, 0.75rem)",
                  textAlign: "center",
                  color: "var(--sn-color-muted-foreground, #6b7280)",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                }}
              >
                No results found
              </div>
            )}

            {filtered.map((entity) => {
              const isSelected = selected.includes(entity.value);
              return (
                <button
                  key={entity.value}
                  data-testid="entity-picker-item"
                  onClick={() => toggleEntity(entity.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--sn-spacing-sm, 0.5rem)",
                    width: "100%",
                    padding:
                      "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
                    border: "none",
                    background: isSelected
                      ? "var(--sn-color-secondary, #f1f5f9)"
                      : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "var(--sn-font-size-sm, 0.875rem)",
                    color: "var(--sn-color-foreground, #111827)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "var(--sn-color-secondary, #f1f5f9)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "transparent";
                    }
                  }}
                >
                  {/* Selection indicator */}
                  {isMultiple && (
                    <span
                      style={{
                        width: "1rem",
                        height: "1rem",
                        borderRadius: "var(--sn-radius-xs, 0.125rem)",
                        border: `var(--sn-border-default, 1px) solid ${
                          isSelected
                            ? "var(--sn-color-primary, #2563eb)"
                            : "var(--sn-color-border, #e5e7eb)"
                        }`,
                        backgroundColor: isSelected
                          ? "var(--sn-color-primary, #2563eb)"
                          : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "var(--sn-font-size-xs, 0.75rem)",
                        color: "var(--sn-color-primary-foreground, #ffffff)",
                        flexShrink: 0,
                      }}
                    >
                      {isSelected ? "\u2713" : ""}
                    </span>
                  )}

                  {/* Avatar */}
                  {entity.avatar && (
                    <img
                      src={entity.avatar}
                      alt=""
                      style={{
                        width: "1.5rem",
                        height: "1.5rem",
                        borderRadius: "var(--sn-radius-full, 9999px)",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  )}

                  {/* Icon */}
                  {!entity.avatar && entity.icon && (
                    <span
                      style={{
                        flexShrink: 0,
                        color: "var(--sn-color-muted-foreground, #6b7280)",
                      }}
                    >
                      <Icon name={entity.icon} size={16} />
                    </span>
                  )}

                  {/* Label + description */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: "var(--sn-font-weight-medium, 500)" as string,
                      }}
                    >
                      {entity.label}
                    </div>
                    {entity.description && (
                      <div
                        style={{
                          fontSize: "var(--sn-font-size-xs, 0.75rem)",
                          color: "var(--sn-color-muted-foreground, #6b7280)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entity.description}
                      </div>
                    )}
                  </div>

                  {/* Single-select check */}
                  {!isMultiple && isSelected && (
                    <span
                      style={{
                        color: "var(--sn-color-primary, #2563eb)",
                        flexShrink: 0,
                      }}
                    >
                      \u2713
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
