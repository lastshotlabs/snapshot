import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import type { FilterBarConfig } from "./types";

/** Internal state for active filter selections. */
type FilterState = Record<string, string | string[]>;

/**
 * FilterBar component — search input + filter dropdowns + active filter pills.
 *
 * Publishes `{ search, filters }` to the page context so other components
 * (e.g., data tables) can subscribe and react to filter changes.
 *
 * @param props.config - The filter bar config from the manifest
 */
export function FilterBar({ config }: { config: FilterBarConfig }) {
  const execute = useActionExecutor();
  const publish = config.id ? usePublish(config.id) : undefined;

  const showSearch = config.showSearch !== false;
  const filters = config.filters ?? [];

  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState<FilterState>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Publish state changes
  useEffect(() => {
    publish?.({ search, filters: filterState });
  }, [search, filterState, publish]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!openDropdown) return;

    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearch(val);
      if (config.changeAction) {
        void execute(config.changeAction, {
          search: val,
          filters: filterState,
        });
      }
    },
    [config.changeAction, execute, filterState],
  );

  const handleOptionSelect = useCallback(
    (key: string, value: string, multiple: boolean) => {
      setFilterState((prev) => {
        const newState = { ...prev };

        if (multiple) {
          const current = Array.isArray(prev[key]) ? [...(prev[key] as string[])] : [];
          const idx = current.indexOf(value);
          if (idx >= 0) {
            current.splice(idx, 1);
            if (current.length === 0) {
              delete newState[key];
            } else {
              newState[key] = current;
            }
          } else {
            newState[key] = [...current, value];
          }
        } else {
          if (prev[key] === value) {
            delete newState[key];
          } else {
            newState[key] = value;
          }
          setOpenDropdown(null);
        }

        if (config.changeAction) {
          void execute(config.changeAction, {
            search,
            filters: newState,
          });
        }

        return newState;
      });
    },
    [config.changeAction, execute, search],
  );

  const removeFilter = useCallback(
    (key: string, value?: string) => {
      setFilterState((prev) => {
        const newState = { ...prev };

        if (value && Array.isArray(prev[key])) {
          const arr = (prev[key] as string[]).filter((v) => v !== value);
          if (arr.length === 0) {
            delete newState[key];
          } else {
            newState[key] = arr;
          }
        } else {
          delete newState[key];
        }

        if (config.changeAction) {
          void execute(config.changeAction, {
            search,
            filters: newState,
          });
        }

        return newState;
      });
    },
    [config.changeAction, execute, search],
  );

  const clearAll = useCallback(() => {
    setSearch("");
    setFilterState({});
    if (config.changeAction) {
      void execute(config.changeAction, { search: "", filters: {} });
    }
  }, [config.changeAction, execute]);

  const hasActiveFilters =
    search.length > 0 || Object.keys(filterState).length > 0;

  // Build active pill list
  const activePills: Array<{
    key: string;
    label: string;
    value: string;
    displayLabel: string;
  }> = [];

  for (const f of filters) {
    const val = filterState[f.key];
    if (!val) continue;

    const values = Array.isArray(val) ? val : [val];
    for (const v of values) {
      const opt = f.options.find((o) => o.value === v);
      activePills.push({
        key: f.key,
        label: f.label,
        value: v,
        displayLabel: opt ? `${f.label}: ${opt.label}` : `${f.label}: ${v}`,
      });
    }
  }

  // Helper to check if an option is selected
  const isSelected = (key: string, value: string): boolean => {
    const current = filterState[key];
    if (!current) return false;
    if (Array.isArray(current)) return current.includes(value);
    return current === value;
  };

  // Visibility check
  if (config.visible === false) return null;

  return (
    <div
      data-snapshot-component="filter-bar"
      className={config.className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--sn-spacing-sm, 0.5rem)",
      }}
    >
      {/* Top row: search + filter buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--sn-spacing-sm, 0.5rem)",
          flexWrap: "wrap",
        }}
      >
        {/* Search input */}
        {showSearch && (
          <div
            style={{
              position: "relative",
              flex: "1 1 200px",
              minWidth: "140px",
              maxWidth: "320px",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "var(--sn-spacing-sm, 0.5rem)",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--sn-color-muted-foreground, #6b7280)",
                pointerEvents: "none",
                display: "flex",
              }}
            >
              <Icon name="search" size={14} />
            </div>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder={config.searchPlaceholder ?? "Search..."}
              data-testid="filter-bar-search"
              style={{
                width: "100%",
                padding:
                  "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                paddingLeft: "var(--sn-spacing-xl, 2rem)",
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
                lineHeight: "var(--sn-leading-normal, 1.5)",
                border: "1px solid var(--sn-color-border, #e5e7eb)",
                borderRadius: "var(--sn-radius-md, 0.375rem)",
                backgroundColor: "var(--sn-color-input, #fff)",
                color: "var(--sn-color-foreground, #111)",
                outline: "none",
              }}
            />
          </div>
        )}

        {/* Filter dropdown buttons */}
        {filters.map((filter) => {
          const isActive = openDropdown === filter.key;
          const hasValue = filter.key in filterState;

          return (
            <div
              key={filter.key}
              ref={isActive ? dropdownRef : undefined}
              style={{ position: "relative" }}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(isActive ? null : filter.key)
                }
                data-testid={`filter-button-${filter.key}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sn-spacing-2xs, 0.125rem)",
                  padding:
                    "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                  border: `1px solid ${hasValue ? "var(--sn-color-primary, #2563eb)" : "var(--sn-color-border, #e5e7eb)"}`,
                  borderRadius: "var(--sn-radius-md, 0.375rem)",
                  backgroundColor: hasValue
                    ? "var(--sn-color-primary, #2563eb)"
                    : "var(--sn-color-card, #fff)",
                  color: hasValue
                    ? "var(--sn-color-primary-foreground, #fff)"
                    : "var(--sn-color-foreground, #111)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{filter.label}</span>
                <Icon
                  name="chevron-down"
                  size={12}
                  color="currentColor"
                />
              </button>

              {/* Dropdown options */}
              {isActive && (
                <div
                  role="listbox"
                  data-testid={`filter-dropdown-${filter.key}`}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    zIndex: "var(--sn-z-index-dropdown, 30)",
                    minWidth: "150px",
                    backgroundColor: "var(--sn-color-popover, #fff)",
                    border:
                      "1px solid var(--sn-color-border, #e5e7eb)",
                    borderRadius: "var(--sn-radius-md, 0.375rem)",
                    boxShadow:
                      "var(--sn-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))",
                    padding: "var(--sn-spacing-2xs, 0.125rem) 0",
                    overflow: "hidden",
                  }}
                >
                  {filter.options.map((opt) => {
                    const selected = isSelected(filter.key, opt.value);

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() =>
                          handleOptionSelect(
                            filter.key,
                            opt.value,
                            filter.multiple === true,
                          )
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--sn-spacing-sm, 0.5rem)",
                          width: "100%",
                          padding:
                            "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                          border: "none",
                          background: selected
                            ? "var(--sn-color-accent, #f3f4f6)"
                            : "none",
                          cursor: "pointer",
                          fontSize:
                            "var(--sn-font-size-sm, 0.875rem)",
                          color:
                            "var(--sn-color-popover-foreground, #111)",
                          textAlign: "left",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                          if (!selected) {
                            (
                              e.currentTarget as HTMLElement
                            ).style.backgroundColor =
                              "var(--sn-color-accent, #f3f4f6)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selected) {
                            (
                              e.currentTarget as HTMLElement
                            ).style.backgroundColor = "transparent";
                          }
                        }}
                      >
                        {filter.multiple && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "14px",
                              height: "14px",
                              border: `1px solid ${selected ? "var(--sn-color-primary, #2563eb)" : "var(--sn-color-border, #e5e7eb)"}`,
                              borderRadius:
                                "var(--sn-radius-xs, 0.125rem)",
                              backgroundColor: selected
                                ? "var(--sn-color-primary, #2563eb)"
                                : "transparent",
                              flexShrink: 0,
                            }}
                          >
                            {selected && (
                              <Icon
                                name="check"
                                size={10}
                                color="var(--sn-color-primary-foreground, #fff)"
                              />
                            )}
                          </span>
                        )}
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Clear all button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            data-testid="filter-bar-clear"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sn-spacing-2xs, 0.125rem)",
              padding:
                "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
              fontSize: "var(--sn-font-size-sm, 0.875rem)",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "var(--sn-color-muted-foreground, #6b7280)",
              whiteSpace: "nowrap",
            }}
          >
            <Icon name="x" size={12} />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Active filter pills */}
      {activePills.length > 0 && (
        <div
          data-testid="filter-bar-pills"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--sn-spacing-xs, 0.25rem)",
          }}
        >
          {activePills.map((pill) => (
            <span
              key={`${pill.key}-${pill.value}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--sn-spacing-2xs, 0.125rem)",
                padding:
                  "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-sm, 0.5rem)",
                fontSize: "var(--sn-font-size-xs, 0.75rem)",
                backgroundColor: "var(--sn-color-secondary, #f3f4f6)",
                color: "var(--sn-color-secondary-foreground, #111)",
                borderRadius: "var(--sn-radius-full, 9999px)",
              }}
            >
              <span>{pill.displayLabel}</span>
              <button
                type="button"
                onClick={() => removeFilter(pill.key, pill.value)}
                aria-label={`Remove filter ${pill.displayLabel}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: "0",
                  color: "var(--sn-color-muted-foreground, #6b7280)",
                  lineHeight: 1,
                }}
              >
                <Icon name="x" size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
