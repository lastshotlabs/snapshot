'use client';

import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { ButtonControl } from "../button";
import { InputControl } from "../input";
import type { MultiSelectConfig, MultiSelectOption } from "./types";

function joinClassNames(
  ...values: Array<string | undefined | null | false>
): string | undefined {
  const className = values.filter(Boolean).join(" ");
  return className || undefined;
}

function SelectedPill({
  config,
  rootId,
  item,
  onRemove,
}: {
  config: MultiSelectConfig;
  rootId: string;
  item: { value: string; label: string };
  onRemove: (value: string, event: ReactMouseEvent<HTMLButtonElement>) => void;
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
    componentSurface: config.slots?.pill,
  });
  const pillLabelSurface = resolveSurfacePresentation({
    surfaceId: `${pillId}-label`,
    implementationBase: {},
    componentSurface: config.slots?.pillLabel,
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
    componentSurface: config.slots?.pillRemove,
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
          \u00d7
        </ButtonControl>
      </span>
      <SurfaceStyles css={pillSurface.scopedCss} />
      <SurfaceStyles css={pillLabelSurface.scopedCss} />
    </>
  );
}

function MultiSelectOptionRow({
  config,
  rootId,
  option,
  isChecked,
  isDisabled,
  onToggle,
}: {
  config: MultiSelectConfig;
  rootId: string;
  option: MultiSelectOption;
  isChecked: boolean;
  isDisabled: boolean;
  onToggle: (value: string) => void;
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
    componentSurface: config.slots?.option,
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
    componentSurface: config.slots?.optionIndicator,
    activeStates: isChecked ? ["selected"] : [],
  });
  const iconSurface = resolveSurfacePresentation({
    surfaceId: `${optionId}-icon`,
    implementationBase: {},
    componentSurface: config.slots?.optionIcon,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${optionId}-label`,
    implementationBase: {
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: config.slots?.optionLabel,
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

export function MultiSelect({ config }: { config: MultiSelectConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const visible = useSubscribe(config.visible ?? true);
  const resolvedValue = useSubscribe(config.value) as string[] | undefined;
  const resolvedDisabled = Boolean(useSubscribe(config.disabled ?? false));
  const dataResult = useComponentData(config.data ?? "");
  const { error: dataError, refetch: dataRefetch } = dataResult;
  const rootId = config.id ?? "multi-select";

  const labelField = config.labelField ?? "label";
  const valueField = config.valueField ?? "value";
  const searchable = config.searchable !== false;
  const placeholder = config.placeholder ?? "Select...";

  const options = useMemo<MultiSelectOption[]>(() => {
    if (config.options) {
      return config.options;
    }

    if (Array.isArray(dataResult.data)) {
      return dataResult.data.map((item) => ({
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

  useEffect(() => {
    if (resolvedValue !== undefined) {
      setSelected(resolvedValue);
    }
  }, [resolvedValue]);

  useEffect(() => {
    if (publish) {
      publish({ value: selected });
    }
  }, [publish, selected]);

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
          if (config.maxSelected && previous.length >= config.maxSelected) {
            return previous;
          }
          next = [...previous, value];
        }

        if (config.changeAction) {
          void execute(config.changeAction, { value: next });
        }

        return next;
      });
    },
    [config.changeAction, config.maxSelected, execute],
  );

  const removeSelected = useCallback(
    (value: string, event: ReactMouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setSelected((previous) => {
        const next = previous.filter((entry) => entry !== value);
        if (config.changeAction) {
          void execute(config.changeAction, { value: next });
        }
        return next;
      });
    },
    [config.changeAction, execute],
  );

  const filteredOptions = useMemo(() => {
    if (!search) {
      return options;
    }

    const lowerSearch = search.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(lowerSearch),
    );
  }, [options, search]);

  const selectedLabels = useMemo(() => {
    const optionMap = new Map(options.map((option) => [option.value, option.label]));
    return selected.map((value) => ({
      value,
      label: optionMap.get(value) ?? value,
    }));
  }, [options, selected]);

  const fieldId = config.id ? `sn-multi-select-${config.id}` : undefined;

  if (visible === false) {
    return null;
  }

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      gap: "xs",
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      fontSize: "sm",
      fontWeight: "medium",
      color: "var(--sn-color-foreground, #111827)",
    },
    componentSurface: config.slots?.label,
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
      cursor: resolvedDisabled ? "not-allowed" : "pointer",
      opacity: resolvedDisabled ? 0.5 : 1,
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        minHeight: 38,
        boxSizing: "border-box",
      },
    },
    componentSurface: config.slots?.trigger,
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
    componentSurface: config.slots?.placeholder,
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
    componentSurface: config.slots?.chevron,
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
    componentSurface: config.slots?.dropdown,
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
    componentSurface: config.slots?.searchContainer,
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
    componentSurface: config.slots?.searchInput,
  });
  const loadingSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading`,
    implementationBase: {
      padding: "md",
      textAlign: "center",
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.loading,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error`,
    implementationBase: {
      padding: "md",
      textAlign: "center",
      fontSize: "sm",
      color: "var(--sn-color-destructive, #ef4444)",
    },
    componentSurface: config.slots?.error,
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
    componentSurface: config.slots?.retryButton,
  });
  const emptySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-empty`,
    implementationBase: {
      padding: "md",
      textAlign: "center",
      fontSize: "sm",
      color: "var(--sn-color-muted-foreground, #6b7280)",
    },
    componentSurface: config.slots?.empty,
  });

  return (
    <>
      <div
        data-snapshot-component="multi-select"
        data-snapshot-id={rootId}
        data-testid="multi-select"
        ref={containerRef}
        className={joinClassNames(config.className, rootSurface.className)}
        style={{
          ...(rootSurface.style ?? {}),
          ...((config.style as CSSProperties | undefined) ?? {}),
        }}
      >
        {config.label ? (
          <label
            htmlFor={fieldId}
            data-snapshot-id={`${rootId}-label`}
            className={labelSurface.className}
            style={labelSurface.style}
          >
            {config.label}
          </label>
        ) : null}

        <div
          id={fieldId}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-disabled={resolvedDisabled}
          tabIndex={resolvedDisabled ? -1 : 0}
          data-snapshot-id={`${rootId}-trigger`}
          onClick={() => {
            if (!resolvedDisabled) {
              setIsOpen((open) => !open);
            }
          }}
          onKeyDown={(event) => {
            if (resolvedDisabled) {
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
              <SelectedPill
                key={item.value}
                config={config}
                rootId={rootId}
                item={item}
                onRemove={removeSelected}
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

            {dataResult.isLoading ? (
              <div
                data-snapshot-id={`${rootId}-loading`}
                className={loadingSurface.className}
                style={loadingSurface.style}
              >
                Loading...
              </div>
            ) : null}

            {!dataResult.isLoading && dataError ? (
              <div
                data-testid="multi-select-error"
                data-snapshot-id={`${rootId}-error`}
                className={errorSurface.className}
                style={errorSurface.style}
              >
                <div>Failed to load options</div>
                <ButtonControl
                  type="button"
                  surfaceId={`${rootId}-retryButton`}
                  onClick={(event) => {
                    event.stopPropagation();
                    dataRefetch();
                  }}
                  variant="ghost"
                  size="sm"
                  surfaceConfig={retryButtonSurface.resolvedConfigForWrapper}
                >
                  Retry
                </ButtonControl>
              </div>
            ) : null}

            {!dataResult.isLoading && !dataError && filteredOptions.length === 0 ? (
              <div
                data-snapshot-id={`${rootId}-empty`}
                className={emptySurface.className}
                style={emptySurface.style}
              >
                {search ? "No results found" : "No options available"}
              </div>
            ) : null}

            {!dataResult.isLoading && !dataError
              ? filteredOptions.map((option) => {
                  const isChecked = selected.includes(option.value);
                  const isAtMax =
                    !isChecked &&
                    config.maxSelected !== undefined &&
                    selected.length >= config.maxSelected;
                  const isOptionDisabled = Boolean(option.disabled || isAtMax);

                  return (
                    <MultiSelectOptionRow
                      key={option.value}
                      config={config}
                      rootId={rootId}
                      option={option}
                      isChecked={isChecked}
                      isDisabled={isOptionDisabled}
                      onToggle={toggleOption}
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
      <SurfaceStyles css={emptySurface.scopedCss} />
    </>
  );
}
