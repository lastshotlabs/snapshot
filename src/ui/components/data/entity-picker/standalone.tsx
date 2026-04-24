'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../../../icons/index";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";
import { InputControl } from "../../forms/input";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EntityPickerEntity {
  /** Display label for the entity. */
  label: string;
  /** Unique value identifier for selection. */
  value: string;
  /** Optional description shown below the label. */
  description?: string;
  /** Optional icon name shown before the label. */
  icon?: string;
  /** Optional avatar image URL shown before the label. */
  avatar?: string;
}

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface EntityPickerBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** List of selectable entities. */
  entities: EntityPickerEntity[];
  /** Currently selected value(s). */
  value?: string | string[];
  /** Label text shown on the trigger button. */
  label?: string;
  /** Whether multiple selection is allowed. */
  multiple?: boolean;
  /** Whether the search input is shown. */
  searchable?: boolean;
  /** Max height of the dropdown list. */
  maxHeight?: string;
  /** Whether data is loading. */
  isLoading?: boolean;
  /** Error message to display. */
  error?: string;
  /** Callback when selection changes. */
  onChange?: (value: string | string[]) => void;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, trigger, dropdown, item, searchContainer, list). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Item sub-component ────────────────────────────────────────────────────────

function EntityPickerItem({
  entity,
  isMultiple,
  isSelected,
  onToggle,
  rootId,
  slots,
}: {
  entity: EntityPickerEntity;
  isMultiple: boolean;
  isSelected: boolean;
  onToggle: (value: string) => void;
  rootId: string;
  slots?: Record<string, Record<string, unknown>>;
}) {
  const itemBaseId = `${rootId}-item-${entity.value}`;
  const itemSurface = resolveSurfacePresentation({
    surfaceId: itemBaseId,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "sm",
      width: "100%",
      color: "var(--sn-color-foreground, #111827)",
      cursor: "pointer",
      transition: "colors",
      style: {
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
        border: "none",
        background: isSelected
          ? "color-mix(in oklch, var(--sn-color-primary, #2563eb) 10%, var(--sn-color-card, #ffffff))"
          : "none",
        textAlign: "left",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
      },
      hover: {
        bg: isSelected
          ? "color-mix(in oklch, var(--sn-color-primary, #2563eb) 15%, var(--sn-color-card, #ffffff))"
          : "var(--sn-color-accent, var(--sn-color-secondary, #f3f4f6))",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
    },
    componentSurface: slots?.item,
    activeStates: isSelected ? ["selected"] : [],
  });
  const itemSelectionSurface = resolveSurfacePresentation({
    surfaceId: `${itemBaseId}-selection`,
    implementationBase: {
      style: {
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
      },
    },
    componentSurface: slots?.itemSelection,
    activeStates: isSelected ? ["selected"] : [],
  });
  const itemAvatarSurface = resolveSurfacePresentation({
    surfaceId: `${itemBaseId}-avatar`,
    implementationBase: {
      style: {
        width: "1.5rem",
        height: "1.5rem",
        borderRadius: "var(--sn-radius-full, 9999px)",
        objectFit: "cover",
        flexShrink: 0,
      },
    },
    componentSurface: slots?.itemAvatar,
  });
  const itemIconSurface = resolveSurfacePresentation({
    surfaceId: `${itemBaseId}-icon`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        flexShrink: 0,
      },
    },
    componentSurface: slots?.itemIcon,
  });
  const itemContentSurface = resolveSurfacePresentation({
    surfaceId: `${itemBaseId}-content`,
    implementationBase: {
      flex: "1",
      style: {
        minWidth: 0,
      },
    },
    componentSurface: slots?.itemContent,
  });
  const itemLabelSurface = resolveSurfacePresentation({
    surfaceId: `${itemBaseId}-label`,
    implementationBase: {
      fontWeight: "medium",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: slots?.itemLabel,
  });
  const itemDescriptionSurface = resolveSurfacePresentation({
    surfaceId: `${itemBaseId}-description`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: slots?.itemDescription,
  });
  const itemCheckSurface = resolveSurfacePresentation({
    surfaceId: `${itemBaseId}-check`,
    implementationBase: {
      color: "var(--sn-color-primary, #2563eb)",
      style: {
        flexShrink: 0,
      },
    },
    componentSurface: slots?.itemCheck,
    activeStates: isSelected ? ["selected"] : [],
  });

  return (
    <>
      <ButtonControl
        type="button"
        testId="entity-picker-item"
        surfaceId={itemBaseId}
        onClick={() => onToggle(entity.value)}
        surfaceConfig={itemSurface.resolvedConfigForWrapper}
        variant="ghost"
        size="sm"
        activeStates={isSelected ? ["selected"] : []}
      >
        {isMultiple ? (
          <span
            data-snapshot-id={`${itemBaseId}-selection`}
            className={itemSelectionSurface.className}
            style={itemSelectionSurface.style}
          >
            {isSelected ? "\u2713" : ""}
          </span>
        ) : null}

        {entity.avatar ? (
          <img
            src={entity.avatar}
            alt=""
            data-snapshot-id={`${itemBaseId}-avatar`}
            className={itemAvatarSurface.className}
            style={itemAvatarSurface.style}
          />
        ) : null}

        {!entity.avatar && entity.icon ? (
          <span
            data-snapshot-id={`${itemBaseId}-icon`}
            className={itemIconSurface.className}
            style={itemIconSurface.style}
          >
            <Icon name={entity.icon} size={16} />
          </span>
        ) : null}

        <div
          data-snapshot-id={`${itemBaseId}-content`}
          className={itemContentSurface.className}
          style={itemContentSurface.style}
        >
          <div
            data-snapshot-id={`${itemBaseId}-label`}
            className={itemLabelSurface.className}
            style={itemLabelSurface.style}
          >
            {entity.label}
          </div>
          {entity.description ? (
            <div
              data-snapshot-id={`${itemBaseId}-description`}
              className={itemDescriptionSurface.className}
              style={itemDescriptionSurface.style}
            >
              {entity.description}
            </div>
          ) : null}
        </div>

        {!isMultiple && isSelected ? (
          <span
            data-snapshot-id={`${itemBaseId}-check`}
            className={itemCheckSurface.className}
            style={itemCheckSurface.style}
          >
            {"\u2713"}
          </span>
        ) : null}
      </ButtonControl>
      <SurfaceStyles css={itemSelectionSurface.scopedCss} />
      <SurfaceStyles css={itemAvatarSurface.scopedCss} />
      <SurfaceStyles css={itemIconSurface.scopedCss} />
      <SurfaceStyles css={itemContentSurface.scopedCss} />
      <SurfaceStyles css={itemLabelSurface.scopedCss} />
      <SurfaceStyles css={itemDescriptionSurface.scopedCss} />
      <SurfaceStyles css={itemCheckSurface.scopedCss} />
    </>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone EntityPicker — dropdown with search, single/multi select.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <EntityPickerBase
 *   label="Assign to"
 *   entities={[
 *     { label: "Alice", value: "alice", avatar: "/avatars/alice.jpg" },
 *     { label: "Bob", value: "bob", icon: "user" },
 *   ]}
 *   multiple
 *   searchable
 *   onChange={(selected) => setAssignees(selected)}
 * />
 * ```
 */
export function EntityPickerBase({
  id,
  entities,
  value,
  label: triggerBaseLabel,
  multiple: isMultiple = false,
  searchable = true,
  maxHeight = "300px",
  isLoading = false,
  error,
  onChange,
  className,
  style,
  slots,
}: EntityPickerBaseProps) {
  const rootId = id ?? "entity-picker";

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(() => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value) return [value];
    return [];
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      setSelected(value);
    } else if (typeof value === "string" && value) {
      setSelected([value]);
    } else {
      setSelected([]);
    }
  }, [value]);

  const filtered = useMemo(() => {
    if (!search) return entities;
    const query = search.toLowerCase();
    return entities.filter(
      (entity) =>
        entity.label.toLowerCase().includes(query) ||
        entity.description?.toLowerCase().includes(query),
    );
  }, [entities, search]);

  const updateSelection = useCallback(
    (newSelected: string[]) => {
      setSelected(newSelected);
      const publishValue = isMultiple ? newSelected : (newSelected[0] ?? "");
      onChange?.(publishValue);
    },
    [isMultiple, onChange],
  );

  const toggleEntity = useCallback(
    (entityValue: string) => {
      if (isMultiple) {
        const nextValue = selected.includes(entityValue)
          ? selected.filter((entry) => entry !== entityValue)
          : [...selected, entityValue];
        updateSelection(nextValue);
      } else {
        updateSelection([entityValue]);
        setIsOpen(false);
      }
    },
    [isMultiple, selected, updateSelection],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !searchable) return;
    const timer = setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [isOpen, searchable]);

  const selectedEntities = entities.filter((entity) =>
    selected.includes(entity.value),
  );
  const triggerLabel =
    selectedEntities.length === 0
      ? (triggerBaseLabel ?? "Select...")
      : isMultiple
        ? `${selectedEntities.length} selected`
        : (selectedEntities[0]?.label ?? "");

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
      display: "inline-block",
      style: {
        fontFamily: "var(--sn-font-sans, system-ui, sans-serif)",
      },
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const triggerSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      justifyContent: "between",
      gap: "sm",
      paddingY: "sm",
      paddingX: "md",
      border:
        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "md",
      bg: "var(--sn-color-input, #ffffff)",
      fontSize: "sm",
      cursor: "pointer",
      transition: "colors",
      style: {
        minWidth: "160px",
      },
      hover: {
        bg: "var(--sn-color-secondary, #f3f4f6)",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      states: {
        open: {
          bg: "var(--sn-color-secondary, #f3f4f6)",
        },
      },
    },
    componentSurface: slots?.trigger,
    activeStates: isOpen ? ["open"] : [],
  });
  const triggerLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-triggerLabel`,
    implementationBase: {
      color:
        selectedEntities.length > 0
          ? "var(--sn-color-foreground, #111827)"
          : "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: slots?.triggerLabel,
  });
  const triggerIconSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-triggerIcon`,
    implementationBase: {
      fontSize: "xs",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        flexShrink: 0,
      },
    },
    componentSurface: slots?.triggerIcon,
  });
  const dropdownSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dropdown`,
    implementationBase: {
      position: "absolute",
      border:
        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "md",
      bg: "var(--sn-color-popover, #ffffff)",
      shadow: "lg",
      overflow: "hidden",
      zIndex: "dropdown",
      style: {
        top: "100%",
        left: 0,
        width: "100%",
        minWidth: "240px",
        marginTop: "var(--sn-spacing-2xs, 0.125rem)",
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
          "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
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
      border:
        "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "sm",
      fontSize: "sm",
      color: "var(--sn-color-foreground, #111827)",
      bg: "var(--sn-color-input, #ffffff)",
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        boxSizing: "border-box",
      },
    },
    componentSurface: slots?.searchInput,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    implementationBase: {
      overflow: "auto",
      style: {
        maxHeight,
      },
    },
    componentSurface: slots?.list,
  });
  const loadingSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading`,
    implementationBase: {
      padding: "md",
      textAlign: "center",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "sm",
    },
    componentSurface: slots?.loading,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error`,
    implementationBase: {
      padding: "md",
      textAlign: "center",
      color: "var(--sn-color-destructive, #dc2626)",
      fontSize: "sm",
    },
    componentSurface: slots?.error,
  });
  const emptySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-empty`,
    implementationBase: {
      padding: "md",
      textAlign: "center",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "sm",
    },
    componentSurface: slots?.empty,
  });

  return (
    <>
      <div
        data-snapshot-component="entity-picker"
        data-snapshot-id={rootId}
        data-testid="entity-picker"
        ref={containerRef}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        <ButtonControl
          type="button"
          testId="entity-picker-trigger"
          surfaceId={`${rootId}-trigger`}
          onClick={() => setIsOpen((open) => !open)}
          surfaceConfig={triggerSurface.resolvedConfigForWrapper}
          variant="ghost"
          size="sm"
          activeStates={isOpen ? ["open"] : []}
          ariaExpanded={isOpen}
          ariaHasPopup="listbox"
        >
          <span
            data-snapshot-id={`${rootId}-triggerLabel`}
            className={triggerLabelSurface.className}
            style={triggerLabelSurface.style}
          >
            {triggerLabel}
          </span>
          <span
            aria-hidden="true"
            data-snapshot-id={`${rootId}-triggerIcon`}
            className={triggerIconSurface.className}
            style={triggerIconSurface.style}
          >
            {isOpen ? "\u25B2" : "\u25BC"}
          </span>
        </ButtonControl>

        {isOpen ? (
          <div
            data-testid="entity-picker-dropdown"
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
                  inputRef={searchInputRef}
                  testId="entity-picker-search"
                  surfaceId={`${rootId}-searchInput`}
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChangeText={setSearch}
                  surfaceConfig={searchInputSurface.resolvedConfigForWrapper}
                />
              </div>
            ) : null}

            <div
              data-snapshot-id={`${rootId}-list`}
              className={listSurface.className}
              style={listSurface.style}
            >
              {isLoading ? (
                <div
                  data-testid="entity-picker-loading"
                  data-snapshot-id={`${rootId}-loading`}
                  className={loadingSurface.className}
                  style={loadingSurface.style}
                >
                  Loading...
                </div>
              ) : null}

              {!isLoading && error ? (
                <div
                  data-testid="entity-picker-error"
                  data-snapshot-id={`${rootId}-error`}
                  className={errorSurface.className}
                  style={errorSurface.style}
                >
                  {error}
                </div>
              ) : null}

              {!isLoading && !error && filtered.length === 0 ? (
                <div
                  data-testid="entity-picker-empty"
                  data-snapshot-id={`${rootId}-empty`}
                  className={emptySurface.className}
                  style={emptySurface.style}
                >
                  No results found
                </div>
              ) : null}

              {!isLoading && !error
                ? filtered.map((entity) => (
                    <EntityPickerItem
                      key={entity.value}
                      entity={entity}
                      isMultiple={isMultiple}
                      isSelected={selected.includes(entity.value)}
                      onToggle={toggleEntity}
                      rootId={rootId}
                      slots={slots}
                    />
                  ))
                : null}
            </div>
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={triggerLabelSurface.scopedCss} />
      <SurfaceStyles css={triggerIconSurface.scopedCss} />
      <SurfaceStyles css={dropdownSurface.scopedCss} />
      <SurfaceStyles css={searchContainerSurface.scopedCss} />
      <SurfaceStyles css={listSurface.scopedCss} />
      <SurfaceStyles css={loadingSurface.scopedCss} />
      <SurfaceStyles css={errorSurface.scopedCss} />
      <SurfaceStyles css={emptySurface.scopedCss} />
    </>
  );
}
