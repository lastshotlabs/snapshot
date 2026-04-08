import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { useComponentData } from "../../_base/use-component-data";
import { Icon } from "../../../icons/index";
import type { MultiSelectConfig, MultiSelectOption } from "./types";

/**
 * Config-driven MultiSelect component — a dropdown with checkboxes
 * for selecting multiple values.
 *
 * Supports static options, API-loaded options, search filtering,
 * max selection limits, and pill display for selected items.
 * Publishes `{ value: string[] }` to the page context when an `id` is set.
 *
 * @param props - Component props containing the multi-select config
 *
 * @example
 * ```json
 * {
 *   "type": "multi-select",
 *   "id": "assigned-users",
 *   "label": "Assign to",
 *   "data": "GET /api/users",
 *   "labelField": "name",
 *   "valueField": "id",
 *   "searchable": true,
 *   "maxSelected": 3
 * }
 * ```
 */
export function MultiSelect({ config }: { config: MultiSelectConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  // Resolve from-refs
  const visible = useSubscribe(config.visible ?? true);
  if (visible === false) return null;

  const resolvedValue = useSubscribe(config.value) as string[] | undefined;
  const resolvedDisabled = useSubscribe(config.disabled ?? false) as boolean;

  // Fetch remote options if `data` is configured
  const hasDataConfig = config.data !== undefined;
  const dataResult = hasDataConfig
    ? useComponentData(config.data!)
    : { data: null, isLoading: false, error: null };

  const labelField = config.labelField ?? "label";
  const valueField = config.valueField ?? "value";
  const searchable = config.searchable !== false;
  const placeholder = config.placeholder ?? "Select...";

  // Build normalized options from static config or fetched data
  const options: MultiSelectOption[] = useMemo(() => {
    if (config.options) {
      return config.options;
    }
    if (dataResult.data) {
      const items = Array.isArray(dataResult.data)
        ? (dataResult.data as Record<string, unknown>[])
        : [];
      return items.map((item) => ({
        label: String(item[labelField] ?? ""),
        value: String(item[valueField] ?? ""),
        icon: item.icon ? String(item.icon) : undefined,
        disabled: item.disabled === true,
      }));
    }
    return [];
  }, [config.options, dataResult.data, labelField, valueField]);

  const [selected, setSelected] = useState<string[]>(resolvedValue ?? []);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => {
    if (resolvedValue !== undefined) {
      setSelected(resolvedValue);
    }
  }, [resolvedValue]);

  // Publish selected values
  useEffect(() => {
    if (publish) {
      publish({ value: selected });
    }
  }, [publish, selected]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleOption = useCallback(
    (value: string) => {
      setSelected((prev) => {
        const isSelected = prev.includes(value);
        let next: string[];
        if (isSelected) {
          next = prev.filter((v) => v !== value);
        } else {
          if (config.maxSelected && prev.length >= config.maxSelected) {
            return prev;
          }
          next = [...prev, value];
        }
        if (config.changeAction) {
          void execute(config.changeAction, { value: next });
        }
        return next;
      });
    },
    [config.maxSelected, config.changeAction, execute],
  );

  const removeSelected = useCallback(
    (value: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelected((prev) => {
        const next = prev.filter((v) => v !== value);
        if (config.changeAction) {
          void execute(config.changeAction, { value: next });
        }
        return next;
      });
    },
    [config.changeAction, execute],
  );

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(lower));
  }, [options, search]);

  const selectedLabels = useMemo(() => {
    const map = new Map(options.map((o) => [o.value, o.label]));
    return selected.map((v) => ({ value: v, label: map.get(v) ?? v }));
  }, [selected, options]);

  const fieldId = config.id ? `sn-multi-select-${config.id}` : undefined;

  return (
    <div
      data-snapshot-component="multi-select"
      data-testid="multi-select"
      ref={containerRef}
      className={config.className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--sn-spacing-xs, 0.25rem)",
        position: "relative",
        ...config.style,
      }}
    >
      {config.label && (
        <label
          htmlFor={fieldId}
          style={{
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            fontWeight: "var(--sn-font-weight-medium, 500)" as unknown as number,
            color: "var(--sn-color-foreground, #111827)",
          }}
        >
          {config.label}
        </label>
      )}

      {/* Trigger button */}
      <div
        id={fieldId}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={resolvedDisabled}
        tabIndex={resolvedDisabled ? -1 : 0}
        onClick={() => {
          if (!resolvedDisabled) setIsOpen(!isOpen);
        }}
        onKeyDown={(e) => {
          if (resolvedDisabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          } else if (e.key === "Escape") {
            setIsOpen(false);
            setSearch("");
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--sn-spacing-2xs, 0.125rem)",
          minHeight: 38,
          padding:
            "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-md, 0.75rem)",
          backgroundColor: "var(--sn-color-background, #ffffff)",
          border: `var(--sn-border-default, 1px) solid ${
            isOpen
              ? "var(--sn-color-ring, #2563eb)"
              : "var(--sn-color-border, #d1d5db)"
          }`,
          borderRadius: "var(--sn-radius-md, 0.375rem)",
          cursor: resolvedDisabled ? "not-allowed" : "pointer",
          opacity: resolvedDisabled
            ? "var(--sn-opacity-disabled, 0.5)"
            : undefined,
          transition:
            "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
          outline: "none",
          boxSizing: "border-box",
        }}
      >
        {selectedLabels.length > 0 ? (
          selectedLabels.map((item) => (
            <span
              key={item.value}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--sn-spacing-2xs, 0.125rem)",
                padding:
                  "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-xs, 0.25rem)",
                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                backgroundColor: "var(--sn-color-secondary, #f3f4f6)",
                color: "var(--sn-color-secondary-foreground, #111827)",
                borderRadius: "var(--sn-radius-sm, 0.25rem)",
                lineHeight: 1.4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "120px",
              }}
            >
              {item.label}
              <span
                role="button"
                aria-label={`Remove ${item.label}`}
                onClick={(e) => removeSelected(item.value, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    removeSelected(
                      item.value,
                      e as unknown as React.MouseEvent,
                    );
                  }
                }}
                tabIndex={0}
                style={{
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: "var(--sn-font-size-xs, 0.75rem)",
                  color: "var(--sn-color-muted-foreground, #6b7280)",
                  lineHeight: 1,
                }}
              >
                ×
              </span>
            </span>
          ))
        ) : (
          <span
            style={{
              color: "var(--sn-color-muted-foreground, #6b7280)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              padding: "var(--sn-spacing-2xs, 0.125rem) 0",
            }}
          >
            {placeholder}
          </span>
        )}

        {/* Chevron */}
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition:
              "transform var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
            flexShrink: 0,
          }}
        >
          <Icon name="chevron-down" size={16} />
        </span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          aria-multiselectable="true"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "var(--sn-spacing-2xs, 0.125rem)",
            backgroundColor: "var(--sn-color-popover, #ffffff)",
            color: "var(--sn-color-popover-foreground, #111827)",
            border:
              "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
            borderRadius: "var(--sn-radius-md, 0.375rem)",
            boxShadow: "var(--sn-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))",
            zIndex: "var(--sn-z-index-dropdown, 1000)" as unknown as number,
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {searchable && (
            <div
              style={{
                padding: "var(--sn-spacing-sm, 0.5rem)",
                borderBottom:
                  "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
              }}
            >
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  padding:
                    "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                  color: "var(--sn-color-foreground, #111827)",
                  backgroundColor: "var(--sn-color-background, #ffffff)",
                  border:
                    "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
                  borderRadius: "var(--sn-radius-sm, 0.25rem)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {dataResult.isLoading && (
            <div
              style={{
                padding: "var(--sn-spacing-md, 0.75rem)",
                textAlign: "center",
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
                color: "var(--sn-color-muted-foreground, #6b7280)",
              }}
            >
              Loading...
            </div>
          )}

          {!dataResult.isLoading && filteredOptions.length === 0 && (
            <div
              style={{
                padding: "var(--sn-spacing-md, 0.75rem)",
                textAlign: "center",
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
                color: "var(--sn-color-muted-foreground, #6b7280)",
              }}
            >
              {search ? "No results found" : "No options available"}
            </div>
          )}

          {filteredOptions.map((opt) => {
            const isChecked = selected.includes(opt.value);
            const isAtMax =
              !isChecked &&
              config.maxSelected !== undefined &&
              selected.length >= config.maxSelected;
            const isOptionDisabled = opt.disabled || isAtMax;

            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isChecked}
                aria-disabled={isOptionDisabled}
                onClick={() => {
                  if (!isOptionDisabled) toggleOption(opt.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isOptionDisabled) {
                    toggleOption(opt.value);
                  }
                }}
                tabIndex={isOptionDisabled ? -1 : 0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sn-spacing-sm, 0.5rem)",
                  padding:
                    "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                  cursor: isOptionDisabled ? "not-allowed" : "pointer",
                  opacity: isOptionDisabled
                    ? "var(--sn-opacity-disabled, 0.5)"
                    : undefined,
                  backgroundColor: isChecked
                    ? "var(--sn-color-accent, #f3f4f6)"
                    : "transparent",
                  transition:
                    "background-color var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
                }}
              >
                {/* Checkbox indicator */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    height: 16,
                    borderRadius: "var(--sn-radius-xs, 0.125rem)",
                    border: `var(--sn-border-default, 1px) solid ${
                      isChecked
                        ? "var(--sn-color-primary, #2563eb)"
                        : "var(--sn-color-border, #d1d5db)"
                    }`,
                    backgroundColor: isChecked
                      ? "var(--sn-color-primary, #2563eb)"
                      : "transparent",
                    color: isChecked
                      ? "var(--sn-color-primary-foreground, #ffffff)"
                      : "transparent",
                    fontSize: "var(--sn-font-size-xs, 0.75rem)",
                    lineHeight: 1,
                    flexShrink: 0,
                    transition:
                      "background-color var(--sn-duration-fast, 150ms), border-color var(--sn-duration-fast, 150ms)",
                  }}
                >
                  {isChecked && "✓"}
                </span>

                {opt.icon && (
                  <Icon name={opt.icon} size={14} />
                )}

                <span
                  style={{
                    color: "var(--sn-color-foreground, #111827)",
                  }}
                >
                  {opt.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
