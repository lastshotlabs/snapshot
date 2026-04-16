'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { InputControl } from "../../forms/input";
import type { FilterBarConfig } from "./types";

type FilterState = Record<string, string | string[]>;

type ActivePill = {
  key: string;
  value: string;
  displayLabel: string;
};

export function FilterBar({ config }: { config: FilterBarConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);
  const showSearch = config.showSearch !== false;
  const filters = config.filters ?? [];
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState<FilterState>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const rootId = config.id ?? "filter-bar";

  useEffect(() => {
    publish?.({ search, filters: filterState });
  }, [search, filterState, publish]);

  useEffect(() => {
    if (!openDropdown) {
      return undefined;
    }

    const handleClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown]);

  useEffect(() => {
    if (!openDropdown) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openDropdown]);

  const dispatchChange = useCallback(
    (nextSearch: string, nextFilters: FilterState) => {
      if (config.changeAction) {
        void execute(config.changeAction, {
          search: nextSearch,
          filters: nextFilters,
        });
      }
    },
    [config.changeAction, execute],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      dispatchChange(value, filterState);
    },
    [dispatchChange, filterState],
  );

  const handleOptionSelect = useCallback(
    (key: string, value: string, multiple: boolean) => {
      setFilterState((previous) => {
        const nextState: FilterState = { ...previous };

        if (multiple) {
          const current = Array.isArray(previous[key])
            ? [...(previous[key] as string[])]
            : [];
          const index = current.indexOf(value);

          if (index >= 0) {
            current.splice(index, 1);
            if (current.length === 0) {
              delete nextState[key];
            } else {
              nextState[key] = current;
            }
          } else {
            nextState[key] = [...current, value];
          }
        } else {
          if (previous[key] === value) {
            delete nextState[key];
          } else {
            nextState[key] = value;
          }
          setOpenDropdown(null);
        }

        dispatchChange(search, nextState);
        return nextState;
      });
    },
    [dispatchChange, search],
  );

  const removeFilter = useCallback(
    (key: string, value?: string) => {
      setFilterState((previous) => {
        const nextState: FilterState = { ...previous };

        if (value && Array.isArray(previous[key])) {
          const nextValues = (previous[key] as string[]).filter(
            (candidate) => candidate !== value,
          );

          if (nextValues.length === 0) {
            delete nextState[key];
          } else {
            nextState[key] = nextValues;
          }
        } else {
          delete nextState[key];
        }

        dispatchChange(search, nextState);
        return nextState;
      });
    },
    [dispatchChange, search],
  );

  const clearAll = useCallback(() => {
    setSearch("");
    setFilterState({});
    dispatchChange("", {});
  }, [dispatchChange]);

  const isSelected = useCallback(
    (key: string, value: string) => {
      const current = filterState[key];
      if (!current) {
        return false;
      }
      return Array.isArray(current) ? current.includes(value) : current === value;
    },
    [filterState],
  );

  const activePills = useMemo<ActivePill[]>(() => {
    const pills: ActivePill[] = [];

    for (const filter of filters) {
      const selected = filterState[filter.key];
      if (!selected) {
        continue;
      }

      const values = Array.isArray(selected) ? selected : [selected];
      for (const value of values) {
        const option = filter.options.find((candidate) => candidate.value === value);
        pills.push({
          key: filter.key,
          value,
          displayLabel: option
            ? `${filter.label}: ${option.label}`
            : `${filter.label}: ${value}`,
        });
      }
    }

    return pills;
  }, [filterState, filters]);

  const hasActiveFilters = search.length > 0 || activePills.length > 0;

  if (visible === false) {
    return null;
  }

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--sn-spacing-sm, 0.5rem)",
    },
    componentSurface: extractSurfaceConfig(config),
    itemSurface: config.slots?.root,
  });
  const toolbarSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-toolbar`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sn-spacing-sm, 0.5rem)",
      flexWrap: "wrap",
    },
    componentSurface: config.slots?.toolbar,
  });
  const searchSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-search`,
    implementationBase: {
      position: "relative",
      style: {
        flex: "1 1 200px",
        minWidth: "140px",
        maxWidth: "min(320px, 100%)",
      },
    },
    componentSurface: config.slots?.search,
  });
  const searchIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-search-icon`,
    implementationBase: {
      position: "absolute",
      display: "flex",
      style: {
        left: "var(--sn-spacing-sm, 0.5rem)",
        top: "50%",
        transform: "translateY(-50%)",
        color: "var(--sn-color-muted-foreground, #6b7280)",
        pointerEvents: "none",
      },
    },
    componentSurface: config.slots?.searchIcon,
  });
  const searchInputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-search-input`,
    implementationBase: {
      width: "100%",
      style: {
        padding:
          "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
        paddingLeft: "var(--sn-spacing-xl, 2rem)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        lineHeight: "var(--sn-leading-normal, 1.5)",
        border:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-md, 0.375rem)",
        backgroundColor: "var(--sn-color-input, #fff)",
        color: "var(--sn-color-foreground, #111)",
      },
      focus: {
        ring: true,
      },
    },
    componentSurface: config.slots?.searchInput,
  });
  const dropdownSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dropdown`,
    implementationBase: {
      position: "absolute",
      style: {
        top: "calc(100% + 4px)",
        left: 0,
        zIndex: "var(--sn-z-index-dropdown, 30)",
        minWidth: "150px",
        backgroundColor: "var(--sn-color-popover, #fff)",
        border:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-md, 0.375rem)",
        boxShadow: "var(--sn-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))",
        padding: "var(--sn-spacing-2xs, 0.125rem) 0",
        overflow: "hidden",
      },
    },
    componentSurface: config.slots?.dropdown,
  });
  const pillSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-pill`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--sn-spacing-2xs, 0.125rem)",
      style: {
        padding: "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-sm, 0.5rem)",
        fontSize: "var(--sn-font-size-xs, 0.75rem)",
        backgroundColor: "var(--sn-color-secondary, #f3f4f6)",
        color: "var(--sn-color-secondary-foreground, #111)",
        borderRadius: "var(--sn-radius-full, 9999px)",
      },
    },
    componentSurface: config.slots?.pill,
  });
  const pillLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-pill-label`,
    implementationBase: {},
    componentSurface: config.slots?.pillLabel,
  });
  const pillRemoveSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-pill-remove`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      hover: {
        color: "var(--sn-color-foreground, #111)",
      },
      focus: {
        ring: true,
      },
      style: {
        border: "none",
        background: "none",
        padding: 0,
        lineHeight: "var(--sn-leading-none, 1)",
      },
    },
    componentSurface: config.slots?.pillRemove,
  });
  const clearButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-clear`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sn-spacing-2xs, 0.125rem)",
      cursor: "pointer",
      hover: {
        color: "var(--sn-color-foreground, #111)",
      },
      focus: {
        ring: true,
      },
      style: {
        padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        border: "none",
        background: "none",
        color: "var(--sn-color-muted-foreground, #6b7280)",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: config.slots?.clearButton,
  });

  return (
    <div
      data-snapshot-component="filter-bar"
      data-snapshot-id={rootId}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <div
        data-snapshot-id={`${rootId}-toolbar`}
        className={toolbarSurface.className}
        style={toolbarSurface.style}
      >
        {showSearch ? (
          <div
            data-snapshot-id={`${rootId}-search`}
            className={searchSurface.className}
            style={searchSurface.style}
          >
            <div
              data-snapshot-id={`${rootId}-search-icon`}
              className={searchIconSurface.className}
              style={searchIconSurface.style}
            >
              <Icon name="search" size={14} />
            </div>
            <InputControl
              type="text"
              value={search}
              onChangeText={handleSearchChange}
              placeholder={config.searchPlaceholder ?? "Search..."}
              testId="filter-bar-search"
              surfaceId={`${rootId}-search-input`}
              surfaceConfig={searchInputSurface.resolvedConfigForWrapper}
            />
          </div>
        ) : null}

        {filters.map((filter) => {
          const isOpen = openDropdown === filter.key;
          const hasValue = filter.key in filterState;
          const filterButtonStates = [
            ...(hasValue ? (["active"] as const) : []),
            ...(isOpen ? (["open"] as const) : []),
          ];

          return (
            <div
              key={filter.key}
              ref={isOpen ? dropdownRef : undefined}
              style={{ position: "relative" }}
            >
              <ButtonControl
                type="button"
                testId={`filter-button-${filter.key}`}
                surfaceId={`${rootId}-filter-button-${filter.key}`}
                surfaceConfig={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sn-spacing-2xs, 0.125rem)",
                  cursor: "pointer",
                  hover: {
                    opacity: 0.85,
                  },
                  focus: {
                    ring: true,
                  },
                  style: {
                    padding:
                      "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                    fontSize: "var(--sn-font-size-sm, 0.875rem)",
                    borderRadius: "var(--sn-radius-md, 0.375rem)",
                    whiteSpace: "nowrap",
                    border: "1px solid var(--sn-color-border, #e5e7eb)",
                    backgroundColor: "var(--sn-color-card, #fff)",
                    color: "var(--sn-color-foreground, #111)",
                  },
                  states: {
                    active: {
                      style: {
                        border: "1px solid var(--sn-color-primary, #2563eb)",
                        backgroundColor: "var(--sn-color-primary, #2563eb)",
                        color: "var(--sn-color-primary-foreground, #fff)",
                      },
                    },
                    open: {
                      style: {
                        border: "1px solid var(--sn-color-primary, #2563eb)",
                        backgroundColor: "var(--sn-color-primary, #2563eb)",
                        color: "var(--sn-color-primary-foreground, #fff)",
                      },
                    },
                  },
                }}
                itemSurfaceConfig={config.slots?.filterButton}
                variant="ghost"
                size="sm"
                onClick={() => setOpenDropdown(isOpen ? null : filter.key)}
                activeStates={filterButtonStates}
              >
                <span>{filter.label}</span>
                <Icon name="chevron-down" size={12} color="currentColor" />
              </ButtonControl>

              {isOpen ? (
                <div
                  role="listbox"
                  data-testid={`filter-dropdown-${filter.key}`}
                  data-snapshot-id={`${rootId}-dropdown`}
                  className={dropdownSurface.className}
                  style={dropdownSurface.style}
                >
                  {filter.options.map((option) => {
                    const selected = isSelected(filter.key, option.value);
                    const optionId = `${rootId}-option-${filter.key}-${option.value}`;
                    const optionIndicatorSurface = resolveSurfacePresentation({
                      surfaceId: `${optionId}-indicator`,
                      implementationBase: {
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        style: {
                          width: "14px",
                          height: "14px",
                          border: `1px solid ${
                            selected
                              ? "var(--sn-color-primary, #2563eb)"
                              : "var(--sn-color-border, #e5e7eb)"
                          }`,
                          borderRadius: "var(--sn-radius-xs, 0.125rem)",
                          backgroundColor: selected
                            ? "var(--sn-color-primary, #2563eb)"
                            : "transparent",
                          flexShrink: 0,
                        },
                      },
                      componentSurface: config.slots?.optionIndicator,
                      activeStates: selected ? ["active"] : [],
                    });
                    const optionLabelSurface = resolveSurfacePresentation({
                      surfaceId: `${optionId}-label`,
                      implementationBase: {},
                      componentSurface: config.slots?.optionLabel,
                    });

                    return (
                      <React.Fragment key={option.value}>
                        <ButtonControl
                        key={option.value}
                        type="button"
                        role="option"
                        ariaSelected={selected}
                        surfaceId={optionId}
                        surfaceConfig={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--sn-spacing-sm, 0.5rem)",
                          cursor: "pointer",
                          hover: {
                            bg: "var(--sn-color-accent, #f3f4f6)",
                          },
                          focus: {
                            ring: true,
                            bg: "var(--sn-color-accent, #f3f4f6)",
                          },
                          style: {
                            width: "100%",
                            padding:
                              "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
                            border: "none",
                            fontSize: "var(--sn-font-size-sm, 0.875rem)",
                            color: "var(--sn-color-popover-foreground, #111)",
                            textAlign: "left",
                            whiteSpace: "nowrap",
                          },
                          states: {
                            active: {
                              style: {
                                background: "var(--sn-color-accent, #f3f4f6)",
                              },
                            },
                          },
                        }}
                        itemSurfaceConfig={config.slots?.option}
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleOptionSelect(
                            filter.key,
                            option.value,
                            filter.multiple === true,
                          )
                        }
                        activeStates={selected ? ["active"] : []}
                      >
                        {filter.multiple ? (
                          <span
                            data-snapshot-id={`${optionId}-indicator`}
                            className={optionIndicatorSurface.className}
                            style={optionIndicatorSurface.style}
                          >
                            {selected ? (
                              <Icon
                                name="check"
                                size={10}
                                color="var(--sn-color-primary-foreground, #fff)"
                              />
                            ) : null}
                          </span>
                        ) : null}
                        <span
                          data-snapshot-id={`${optionId}-label`}
                          className={optionLabelSurface.className}
                          style={optionLabelSurface.style}
                        >
                          {option.label}
                        </span>
                      </ButtonControl>
                      <SurfaceStyles css={optionIndicatorSurface.scopedCss} />
                      <SurfaceStyles css={optionLabelSurface.scopedCss} />
                    </React.Fragment>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}

        {hasActiveFilters ? (
          <ButtonControl
            type="button"
            data-testid="filter-bar-clear"
            surfaceId={`${rootId}-clear`}
            surfaceConfig={clearButtonSurface.resolvedConfigForWrapper}
            variant="ghost"
            size="sm"
            onClick={clearAll}
          >
            <Icon name="x" size={12} />
            <span>Clear all</span>
          </ButtonControl>
        ) : null}
      </div>

      {activePills.length > 0 ? (
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
              data-snapshot-id={`${rootId}-pill`}
              className={pillSurface.className}
              style={pillSurface.style}
            >
              <span
                data-snapshot-id={`${rootId}-pill-label`}
                className={pillLabelSurface.className}
                style={pillLabelSurface.style}
              >
                {pill.displayLabel}
              </span>
              <ButtonControl
                type="button"
                ariaLabel={`Remove filter ${pill.displayLabel}`}
                surfaceId={`${rootId}-pill-remove`}
                surfaceConfig={pillRemoveSurface.resolvedConfigForWrapper}
                onClick={() => removeFilter(pill.key, pill.value)}
                variant="ghost"
                size="icon"
              >
                <Icon name="x" size={12} />
              </ButtonControl>
            </span>
          ))}
        </div>
      ) : null}

      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={toolbarSurface.scopedCss} />
      <SurfaceStyles css={searchSurface.scopedCss} />
      <SurfaceStyles css={searchIconSurface.scopedCss} />
      <SurfaceStyles css={dropdownSurface.scopedCss} />
      <SurfaceStyles css={pillSurface.scopedCss} />
      <SurfaceStyles css={pillLabelSurface.scopedCss} />
    </div>
  );
}
