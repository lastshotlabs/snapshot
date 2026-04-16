"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { Icon } from "../../../icons/index";
import { AutoErrorState } from "../../_base/auto-error-state";
import { SurfaceStyles } from "../../_base/surface-styles";
import {
  extractSurfaceConfig,
  resolveSurfacePresentation,
} from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { ButtonControl } from "../../forms/button";
import { InputControl } from "../../forms/input";
import type { EntityPickerConfig } from "./types";

interface ResolvedEntity {
  label: string;
  value: string;
  description?: string;
  icon?: string;
  avatar?: string;
}

const EMPTY_ARRAY: string[] = [];

function EntityPickerItem({
  config,
  entity,
  isMultiple,
  isSelected,
  onToggle,
  rootId,
}: {
  config: EntityPickerConfig;
  entity: ResolvedEntity;
  isMultiple: boolean;
  isSelected: boolean;
  onToggle: (value: string) => void;
  rootId: string;
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
    componentSurface: config.slots?.item,
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
    componentSurface: config.slots?.itemSelection,
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
    componentSurface: config.slots?.itemAvatar,
  });
  const itemIconSurface = resolveSurfacePresentation({
    surfaceId: `${itemBaseId}-icon`,
    implementationBase: {
      color: "var(--sn-color-muted-foreground, #6b7280)",
      style: {
        flexShrink: 0,
      },
    },
    componentSurface: config.slots?.itemIcon,
  });
  const itemContentSurface = resolveSurfacePresentation({
    surfaceId: `${itemBaseId}-content`,
    implementationBase: {
      flex: "1",
      style: {
        minWidth: 0,
      },
    },
    componentSurface: config.slots?.itemContent,
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
    componentSurface: config.slots?.itemLabel,
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
    componentSurface: config.slots?.itemDescription,
  });
  const itemCheckSurface = resolveSurfacePresentation({
    surfaceId: `${itemBaseId}-check`,
    implementationBase: {
      color: "var(--sn-color-primary, #2563eb)",
      style: {
        flexShrink: 0,
      },
    },
    componentSurface: config.slots?.itemCheck,
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
            \u2713
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

export function EntityPicker({ config }: { config: EntityPickerConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const externalDefault = config.multiple ? EMPTY_ARRAY : "";
  const resolvedValue = useSubscribe(config.value ?? externalDefault);
  const executeAction = useActionExecutor();
  const publish = usePublish(config.id);
  const {
    data: apiData,
    isLoading,
    error: dataError,
    refetch: dataRefetch,
  } = useComponentData(config.data ?? "");
  const rootId = config.id ?? "entity-picker";

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

  useEffect(() => {
    if (config.value === undefined) {
      return;
    }

    if (Array.isArray(resolvedValue)) {
      setSelected(resolvedValue as string[]);
    } else if (typeof resolvedValue === "string" && resolvedValue) {
      setSelected([resolvedValue]);
    } else {
      setSelected([]);
    }
  }, [config.value, resolvedValue]);

  const entities: ResolvedEntity[] = useMemo(() => {
    if (!apiData) {
      return [];
    }

    const items = Array.isArray(apiData)
      ? apiData
      : Array.isArray((apiData as Record<string, unknown>).data)
        ? ((apiData as Record<string, unknown>).data as Record<string, unknown>[])
        : [];

    return items.map((item) => ({
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
  }, [
    apiData,
    config.avatarField,
    config.descriptionField,
    config.iconField,
    labelField,
    valueField,
  ]);

  const filtered = useMemo(() => {
    if (!search) {
      return entities;
    }

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
      if (publish) {
        publish({ value: publishValue });
      }
      if (config.changeAction) {
        void executeAction(config.changeAction, { value: publishValue });
      }
    },
    [config.changeAction, executeAction, isMultiple, publish],
  );

  const toggleEntity = useCallback(
    (value: string) => {
      if (isMultiple) {
        const nextValue = selected.includes(value)
          ? selected.filter((entry) => entry !== value)
          : [...selected, value];
        updateSelection(nextValue);
      } else {
        updateSelection([value]);
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
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !searchable) {
      return;
    }

    const timer = setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [isOpen, searchable]);

  if (visible === false) {
    return null;
  }

  const selectedEntities = entities.filter((entity) => selected.includes(entity.value));
  const triggerLabel =
    selectedEntities.length === 0
      ? (config.label ?? "Select...")
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
    componentSurface: extractSurfaceConfig(config, { omit: ["maxHeight"] }),
    itemSurface: config.slots?.root,
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
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
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
    componentSurface: config.slots?.trigger,
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
    componentSurface: config.slots?.triggerLabel,
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
    componentSurface: config.slots?.triggerIcon,
  });
  const dropdownSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dropdown`,
    implementationBase: {
      position: "absolute",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
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
    componentSurface: config.slots?.dropdown,
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
    componentSurface: config.slots?.searchContainer,
  });
  const searchInputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-searchInput`,
    implementationBase: {
      width: "100%",
      paddingY: "xs",
      paddingX: "sm",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
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
    componentSurface: config.slots?.searchInput,
  });
  const listSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-list`,
    implementationBase: {
      overflow: "auto",
      style: {
        maxHeight,
      },
    },
    componentSurface: config.slots?.list,
  });
  const loadingSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-loading`,
    implementationBase: {
      padding: "md",
      textAlign: "center",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "sm",
    },
    componentSurface: config.slots?.loading,
  });
  const errorSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-error`,
    implementationBase: {},
    componentSurface: config.slots?.error,
  });
  const emptySurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-empty`,
    implementationBase: {
      padding: "md",
      textAlign: "center",
      color: "var(--sn-color-muted-foreground, #6b7280)",
      fontSize: "sm",
    },
    componentSurface: config.slots?.empty,
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

              {!isLoading && dataError ? (
                <div
                  data-testid="entity-picker-error"
                  data-snapshot-id={`${rootId}-error`}
                  className={errorSurface.className}
                  style={errorSurface.style}
                >
                  <AutoErrorState
                    config={config.error ?? {}}
                    onRetry={
                      config.error?.retry !== undefined ? dataRefetch : undefined
                    }
                  />
                </div>
              ) : null}

              {!isLoading && !dataError && filtered.length === 0 ? (
                <div
                  data-testid="entity-picker-empty"
                  data-snapshot-id={`${rootId}-empty`}
                  className={emptySurface.className}
                  style={emptySurface.style}
                >
                  No results found
                </div>
              ) : null}

              {!isLoading && !dataError
                ? filtered.map((entity) => (
                    <EntityPickerItem
                      key={entity.value}
                      config={config}
                      entity={entity}
                      isMultiple={isMultiple}
                      isSelected={selected.includes(entity.value)}
                      onToggle={toggleEntity}
                      rootId={rootId}
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
