"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../button";
import { InputControl } from "../input";

// ── Standalone Props ───���─────────────────────────────��────────────────────────

export interface MultiSelectFieldOption {
  /** Display text for the option. */
  label: string;
  /** Form value submitted when this option is selected. */
  value: string;
  /** Optional icon name rendered beside the option label. */
  icon?: string;
  /** Whether this option is disabled and cannot be toggled. */
  disabled?: boolean;
}

export interface MultiSelectFieldProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Label text displayed above the select trigger. */
  label?: string;
  /** Placeholder text shown when no items are selected. */
  placeholder?: string;
  /** Available options to choose from. */
  options?: MultiSelectFieldOption[];
  /** Controlled array of selected values. */
  value?: string[];
  /** Initial selected values (uncontrolled). */
  defaultValue?: string[];
  /** Whether the entire field is disabled. */
  disabled?: boolean;
  /** Whether to show a search input inside the dropdown. */
  searchable?: boolean;
  /** Maximum number of items that can be selected. */
  maxSelected?: number;
  /** Whether options are currently loading. */
  loading?: boolean;
  /** Error message displayed inside the dropdown when options fail to load. */
  error?: string | null;
  /** Called when the user clicks "Retry" after a load error. */
  onRetry?: () => void;
  /** Called when the selection changes. */
  onChange?: (value: string[]) => void;

  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
}

function StandaloneSelectedPill({
  rootId,
  item,
  onRemove,
  slots,
}: {
  rootId: string;
  item: { value: string; label: string };
  onRemove: (value: string, event: ReactMouseEvent<HTMLButtonElement>) => void;
  slots?: Record<string, Record<string, unknown>>;
}) {
  const pillId = `${rootId}-pill-${item.value}`;
  const pillSurface = resolveSurfacePresentation({
    surfaceId: pillId,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "2xs",
      paddingY: "2xs",
      paddingX: "xs",
      fontSize: "xs",
      borderRadius: "sm",
      bg: "var(--sn-color-secondary, #f3f4f6)",
      color: "var(--sn-color-secondary-foreground, #111827)",
      style: {
        lineHeight: "var(--sn-leading-tight, 1.25)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "120px",
      },
    },
    componentSurface: slots?.pill,
  });
  const pillLabelSurface = resolveSurfacePresentation({
    surfaceId: `${pillId}-label`,
    implementationBase: {},
    componentSurface: slots?.pillLabel,
  });
  const pillRemoveSurface = resolveSurfacePresentation({
    surfaceId: `${pillId}-remove`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      hover: {
        color: "var(--sn-color-destructive, #ef4444)",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        background: "none",
        border: "none",
        padding: 0,
        lineHeight: "var(--sn-leading-none, 1)",
      },
    },
    componentSurface: slots?.pillRemove,
  });

  return (
    <>
      <span
        data-snapshot-id={pillId}
        className={pillSurface.className}
        style={pillSurface.style}
      >
        <span
          data-snapshot-id={`${pillId}-label`}
          className={pillLabelSurface.className}
          style={pillLabelSurface.style}
        >
          {item.label}
        </span>
        <ButtonControl
          type="button"
          ariaLabel={`Remove ${item.label}`}
          surfaceId={`${pillId}-remove`}
          onClick={(event) => onRemove(item.value, event)}
          variant="ghost"
          size="icon"
          surfaceConfig={pillRemoveSurface.resolvedConfigForWrapper}
        >
          {"\u00d7"}
        </ButtonControl>
      </span>
      <SurfaceStyles css={pillSurface.scopedCss} />
      <SurfaceStyles css={pillLabelSurface.scopedCss} />
    </>
  );
}

function StandaloneMultiSelectOptionRow({
  rootId,
  option,
  isChecked,
  isDisabled,
  onToggle,
  slots,
}: {
  rootId: string;
  option: MultiSelectFieldOption;
  isChecked: boolean;
  isDisabled: boolean;
  onToggle: (value: string) => void;
  slots?: Record<string, Record<string, unknown>>;
}) {
  const optionId = `${rootId}-option-${option.value}`;
  const optionSurface = resolveSurfacePresentation({
    surfaceId: optionId,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "sm",
      cursor: isDisabled ? "not-allowed" : "pointer",
      opacity: isDisabled ? 0.5 : 1,
      transition: "colors",
      style: {
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        backgroundColor: isChecked
          ? "var(--sn-color-accent, #f3f4f6)"
          : "transparent",
      },
      hover: isDisabled
        ? undefined
        : {
            bg: "var(--sn-color-accent, var(--sn-color-muted, #f3f4f6))",
          },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
    },
    componentSurface: slots?.option,
    activeStates: isChecked ? ["selected"] : [],
  });
  const indicatorSurface = resolveSurfacePresentation({
    surfaceId: `${optionId}-indicator`,
    implementationBase: {
      style: {
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
        lineHeight: "var(--sn-leading-none, 1)",
        flexShrink: 0,
      },
    },
    componentSurface: slots?.optionIndicator,
    activeStates: isChecked ? ["selected"] : [],
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${optionId}-icon`,
    implementationBase: {},
    componentSurface: slots?.optionIcon,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${optionId}-label`,
    implementationBase: {
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: slots?.optionLabel,
  });

  return (
    <>
      <ButtonControl
        type="button"
        variant="ghost"
        size="sm"
        role="option"
        aria-selected={isChecked}
        disabled={isDisabled}
        surfaceId={optionId}
        surfaceConfig={optionSurface.resolvedConfigForWrapper}
        activeStates={[
          ...(isChecked ? (["selected"] as const) : []),
          ...(isDisabled ? (["disabled"] as const) : []),
        ]}
        onClick={() => onToggle(option.value)}
      >
        <span
          data-snapshot-id={`${optionId}-indicator`}
          className={indicatorSurface.className}
          style={indicatorSurface.style}
        >
          {isChecked ? "\u2713" : ""}
        </span>
        {option.icon ? (
          <span
            data-snapshot-id={`${optionId}-icon`}
            className={iconSurface.className}
            style={iconSurface.style}
          >
            <Icon name={option.icon} size={14} />
          </span>
        ) : null}
        <span
          data-snapshot-id={`${optionId}-label`}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {option.label}
        </span>
      </ButtonControl>
      <SurfaceStyles css={indicatorSurface.scopedCss} />
      <SurfaceStyles css={iconSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
    </>
  );
}

/**
 * Standalone MultiSelectField -- multi-select dropdown with pill tags, inline search,
 * and configurable max selection. No manifest context required.
 *
 * @example
 * ```tsx
 * <MultiSelectField
 *   label="Tags"
 *   options={[
 *     { label: "React", value: "react" },
 *     { label: "Vue", value: "vue" },
 *     { label: "Svelte", value: "svelte" },
 *   ]}
 *   searchable
 *   onChange={(selected) => setTags(selected)}
 * />
 * ```
 */
export function MultiSelectField({
  id,
  label,
  placeholder: placeholderProp,
  options: optionsProp = [],
  value: controlledValue,
  defaultValue,
  disabled = false,
  searchable = true,
  maxSelected,
  loading = false,
  error: errorProp,
  onRetry,
  onChange,
  className,
  style,
  slots,
}: MultiSelectFieldProps) {
  const rootId = id ?? "multi-select";
  const placeholder = placeholderProp ?? "Select...";

  const [selected, setSelected] = useState<string[]>(defaultValue ?? []);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setSelected(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleOption = useCallback(
    (value: string) => {
      setSelected((previous) => {
        const isSelected = previous.includes(value);
        let next: string[];

        if (isSelected) {
          next = previous.filter((entry) => entry !== value);
        } else {
          if (maxSelected && previous.length >= maxSelected) {
            return previous;
          }
          next = [...previous, value];
        }

        onChange?.(next);
        return next;
      });
    },
    [maxSelected, onChange],
  );

  const removeSelected = useCallback(
    (value: string, event: ReactMouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setSelected((previous) => {
        const next = previous.filter((entry) => entry !== value);
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  const filteredOptions = useMemo(() => {
    if (!search) {
      return optionsProp;
    }

    const lowerSearch = search.toLowerCase();
    return optionsProp.filter((option) =>
      option.label.toLowerCase().includes(lowerSearch),
    );
  }, [optionsProp, search]);

  const selectedLabels = useMemo(() => {
    const optionMap = new Map(optionsProp.map((option) => [option.value, option.label]));
    return selected.map((value) => ({
      value,
      label: optionMap.get(value) ?? value,
    }));
  }, [optionsProp, selected]);

  const fieldId = id ? `sn-multi-select-${id}` : undefined;

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "xs",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      fontSize: "sm",
      fontWeight: "medium",
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: slots?.label,
  });
  const triggerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "2xs",
      paddingY: "2xs",
      paddingX: "md",
      border: `var(--sn-border-default, 1px) solid ${
        isOpen
          ? "var(--sn-color-ring, #2563eb)"
          : "var(--sn-color-border, #d1d5db)"
      }`,
      borderRadius: "md",
      bg: "var(--sn-color-background, #ffffff)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        minHeight: 38,
        boxSizing: "border-box",
      },
    },
    componentSurface: slots?.trigger,
    activeStates: isOpen ? ["open"] : [],
  });
  const placeholderSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-placeholder`,
    implementationBase: {
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        padding: "var(--sn-spacing-2xs, 0.125rem) 0",
      },
    },
    componentSurface: slots?.placeholder,
  });
  const chevronSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-chevron`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        marginLeft: "auto",
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        transition:
          "transform var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
        flexShrink: 0,
      },
    },
    componentSurface: slots?.chevron,
    activeStates: isOpen ? ["open"] : [],
  });
  const dropdownSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dropdown`,
    implementationBase: {
      position: "absolute",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
      borderRadius: "md",
      bg: "var(--sn-color-popover, #ffffff)",
      color: "var(--sn-color-popover-foreground, #111827)",
      shadow: "md",
      overflow: "auto",
      zIndex: "dropdown",
      style: {
        top: "100%",
        left: 0,
        right: 0,
        marginTop: "var(--sn-spacing-2xs, 0.125rem)",
        maxHeight: 240,
      },
    },
    componentSurface: slots?.dropdown,
  });
  const searchContainerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-searchContainer`,
    implementationBase: {
      padding: "sm",
      style: {
        borderBottom:
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
      },
    },
    componentSurface: slots?.searchContainer,
  });
  const searchInputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-searchInput`,
    implementationBase: {
      width: "100%",
      paddingY: "xs",
      paddingX: "sm",
      fontSize: "sm",
      color: "var(--sn-color-foreground, #111827)",
      bg: "var(--sn-color-background, #ffffff)",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #d1d5db)",
      borderRadius: "sm",
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        boxSizing: "border-box",
      },
    },
    componentSurface: slots?.searchInput,
  });
  const loadingSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading`,
    implementationBase: {
      padding: "md",
      textAlign: "center",
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: slots?.loading,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error`,
    implementationBase: {
      padding: "md",
      textAlign: "center",
      fontSize: "sm",
      color: "var(--sn-color-destructive, #ef4444)",
    },
    componentSurface: slots?.error,
  });
  const errorMessageSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-errorMessage`,
    implementationBase: {} as Record<string, unknown>,
    componentSurface: slots?.errorMessage,
  });
  const retryButtonSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-retryButton`,
    implementationBase: {
      color: "var(--sn-color-primary, #2563eb)",
      cursor: "pointer",
      style: {
        marginTop: "var(--sn-spacing-xs, 0.25rem)",
        padding: "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-sm, 0.5rem)",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        background: "none",
        border: "none",
        textDecoration: "underline",
      },
    },
    componentSurface: slots?.retryButton,
  });
  const emptySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-empty`,
    implementationBase: {
      padding: "md",
      textAlign: "center",
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: slots?.empty,
  });

  return (
    <>
      <div
        data-snapshot-component="multi-select"
        data-snapshot-id={rootId}
        data-testid="multi-select"
        ref={containerRef}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {label ? (
          <label
            htmlFor={fieldId}
            data-snapshot-id={`${rootId}-label`}
            className={labelSurface.className}
            style={labelSurface.style}
          >
            {label}
          </label>
        ) : null}

        <div
          id={fieldId}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          data-snapshot-id={`${rootId}-trigger`}
          onClick={() => {
            if (!disabled) {
              setIsOpen((open) => !open);
            }
          }}
          onKeyDown={(event) => {
            if (disabled) {
              return;
            }

            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsOpen((open) => !open);
            } else if (event.key === "Escape") {
              setIsOpen(false);
              setSearch("");
            }
          }}
          className={triggerSurface.className}
          style={triggerSurface.style}
        >
          {selectedLabels.length > 0 ? (
            selectedLabels.map((item) => (
              <StandaloneSelectedPill
                key={item.value}
                rootId={rootId}
                item={item}
                onRemove={removeSelected}
                slots={slots}
              />
            ))
          ) : (
            <span
              data-snapshot-id={`${rootId}-placeholder`}
              className={placeholderSurface.className}
              style={placeholderSurface.style}
            >
              {placeholder}
            </span>
          )}

          <span
            data-snapshot-id={`${rootId}-chevron`}
            className={chevronSurface.className}
            style={chevronSurface.style}
          >
            <Icon name="chevron-down" size={16} />
          </span>
        </div>

        {isOpen ? (
          <div
            role="listbox"
            aria-multiselectable="true"
            data-snapshot-id={`${rootId}-dropdown`}
            className={dropdownSurface.className}
            style={dropdownSurface.style}
          >
            {searchable ? (
              <div
                data-snapshot-id={`${rootId}-searchContainer`}
                className={searchContainerSurface.className}
                style={searchContainerSurface.style}
              >
                <InputControl
                  type="text"
                  placeholder="Search..."
                  value={search}
                  autoFocus
                  onChangeText={setSearch}
                  onClick={(event) => event.stopPropagation()}
                  surfaceId={`${rootId}-searchInput`}
                  surfaceConfig={searchInputSurface.resolvedConfigForWrapper}
                />
              </div>
            ) : null}

            {loading ? (
              <div
                data-snapshot-id={`${rootId}-loading`}
                className={loadingSurface.className}
                style={loadingSurface.style}
              >
                Loading...
              </div>
            ) : null}

            {!loading && errorProp ? (
              <div
                data-testid="multi-select-error"
                data-snapshot-id={`${rootId}-error`}
                className={errorSurface.className}
                style={errorSurface.style}
              >
                <div
                  data-snapshot-id={`${rootId}-errorMessage`}
                  className={errorMessageSurface.className}
                  style={errorMessageSurface.style}
                >
                  Failed to load options
                </div>
                {onRetry ? (
                  <ButtonControl
                    type="button"
                    surfaceId={`${rootId}-retryButton`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onRetry();
                    }}
                    variant="ghost"
                    size="sm"
                    surfaceConfig={retryButtonSurface.resolvedConfigForWrapper}
                  >
                    Retry
                  </ButtonControl>
                ) : null}
              </div>
            ) : null}

            {!loading && !errorProp && filteredOptions.length === 0 ? (
              <div
                data-snapshot-id={`${rootId}-empty`}
                className={emptySurface.className}
                style={emptySurface.style}
              >
                {search ? "No results found" : "No options available"}
              </div>
            ) : null}

            {!loading && !errorProp
              ? filteredOptions.map((option) => {
                  const isChecked = selected.includes(option.value);
                  const isAtMax =
                    !isChecked &&
                    maxSelected !== undefined &&
                    selected.length >= maxSelected;
                  const isOptionDisabled = Boolean(option.disabled || isAtMax);

                  return (
                    <StandaloneMultiSelectOptionRow
                      key={option.value}
                      rootId={rootId}
                      option={option}
                      isChecked={isChecked}
                      isDisabled={isOptionDisabled}
                      onToggle={toggleOption}
                      slots={slots}
                    />
                  );
                })
              : null}
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={triggerSurface.scopedCss} />
      <SurfaceStyles css={placeholderSurface.scopedCss} />
      <SurfaceStyles css={chevronSurface.scopedCss} />
      <SurfaceStyles css={dropdownSurface.scopedCss} />
      <SurfaceStyles css={searchContainerSurface.scopedCss} />
      <SurfaceStyles css={loadingSurface.scopedCss} />
      <SurfaceStyles css={errorSurface.scopedCss} />
      <SurfaceStyles css={errorMessageSurface.scopedCss} />
      <SurfaceStyles css={emptySurface.scopedCss} />
    </>
  );
}
