'use client';

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import { ButtonControl } from "../button";
import { InputControl } from "../input";
import type { TagSelectorConfig } from "./types";

interface ResolvedTag {
  label: string;
  value: string;
  color?: string;
}

function contrastText(color: string): string {
  if (!color.startsWith("#") || color.length < 7) {
    return "#ffffff";
  }

  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

function joinClassNames(
  ...values: Array<string | undefined | null | false>
): string | undefined {
  const className = values.filter(Boolean).join(" ");
  return className || undefined;
}

function TagPill({
  config,
  rootId,
  tag,
  onRemove,
}: {
  config: TagSelectorConfig;
  rootId: string;
  tag: ResolvedTag;
  onRemove: (value: string) => void;
}) {
  const pillId = `${rootId}-pill-${tag.value}`;
  const backgroundColor = tag.color ?? "var(--sn-color-primary, #2563eb)";
  const textColor = tag.color
    ? contrastText(tag.color)
    : "var(--sn-color-primary-foreground, #ffffff)";

  const pillSurface = resolveSurfacePresentation({
    surfaceId: pillId,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "2xs",
      paddingY: "2xs",
      paddingX: "sm",
      borderRadius: "full",
      fontSize: "sm",
      fontWeight: "medium",
      style: {
        backgroundColor,
        color: textColor,
        lineHeight: "var(--sn-leading-tight, 1.25)",
        whiteSpace: "nowrap",
      },
    },
    componentSurface: config.slots?.pill,
  });
  const pillLabelSurface = resolveSurfacePresentation({
    surfaceId: `${pillId}-label`,
    implementationBase: {},
    componentSurface: config.slots?.pillLabel,
  });
  const removeButtonSurface = resolveSurfacePresentation({
    surfaceId: `${pillId}-remove`,
    implementationBase: {
      color: "inherit",
      cursor: "pointer",
      opacity: 0.7,
      hover: {
        opacity: 1,
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        background: "none",
        border: "none",
        padding: "0 0 0 var(--sn-spacing-2xs, 0.125rem)",
        fontSize: "var(--sn-font-size-md, 1rem)",
        lineHeight: "var(--sn-leading-none, 1)",
        borderRadius: "var(--sn-radius-full, 9999px)",
      },
    },
    componentSurface: config.slots?.removeButton,
  });

  return (
    <>
      <span
        data-testid="tag-pill"
        data-snapshot-id={pillId}
        className={pillSurface.className}
        style={pillSurface.style}
      >
        <span
          data-snapshot-id={`${pillId}-label`}
          className={pillLabelSurface.className}
          style={pillLabelSurface.style}
        >
          {tag.label}
        </span>
        <ButtonControl
          type="button"
          variant="ghost"
          size="icon"
          ariaLabel={`Remove ${tag.label}`}
          surfaceId={`${pillId}-remove`}
          data-testid="tag-remove"
          onClick={(event) => {
            event.stopPropagation();
            onRemove(tag.value);
          }}
          className={removeButtonSurface.className}
          style={removeButtonSurface.style}
        >
          \u00d7
        </ButtonControl>
      </span>
      <SurfaceStyles css={pillSurface.scopedCss} />
      <SurfaceStyles css={pillLabelSurface.scopedCss} />
      <SurfaceStyles css={removeButtonSurface.scopedCss} />
    </>
  );
}

function TagOption({
  config,
  rootId,
  tag,
  onSelect,
}: {
  config: TagSelectorConfig;
  rootId: string;
  tag: ResolvedTag;
  onSelect: (value: string) => void;
}) {
  const optionId = `${rootId}-option-${tag.value}`;
  const optionSurface = resolveSurfacePresentation({
    surfaceId: optionId,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "sm",
      width: "100%",
      cursor: "pointer",
      transition: "colors",
      style: {
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
        border: "none",
        background: "transparent",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        color: "var(--sn-color-foreground, #111827)",
        textAlign: "left",
      },
      hover: {
        bg: "var(--sn-color-secondary, #f1f5f9)",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
    },
    componentSurface: config.slots?.option,
  });
  const swatchSurface = resolveSurfacePresentation({
    surfaceId: `${optionId}-swatch`,
    implementationBase: {
      style: {
        width: "0.75rem",
        height: "0.75rem",
        borderRadius: "var(--sn-radius-full, 9999px)",
        backgroundColor: tag.color,
        flexShrink: 0,
      },
    },
    componentSurface: config.slots?.optionSwatch,
  });

  return (
    <>
      <ButtonControl
        type="button"
        variant="ghost"
        size="sm"
        surfaceId={optionId}
        data-testid="tag-option"
        onClick={() => onSelect(tag.value)}
        className={optionSurface.className}
        style={optionSurface.style}
      >
        {tag.color ? (
          <span
            data-snapshot-id={`${optionId}-swatch`}
            className={swatchSurface.className}
            style={swatchSurface.style}
          />
        ) : null}
        {tag.label}
      </ButtonControl>
      <SurfaceStyles css={optionSurface.scopedCss} />
      <SurfaceStyles css={swatchSurface.scopedCss} />
    </>
  );
}

export function TagSelector({ config }: { config: TagSelectorConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const resolvedValue = useSubscribe(config.value ?? []);
  const executeAction = useActionExecutor();
  const publish = usePublish(config.id);
  const rootId = config.id ?? "tag-selector";

  const {
    data: apiData,
    isLoading: apiLoading,
    error: apiError,
    refetch: apiRefetch,
  } = useComponentData(config.data ?? "");

  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Array.isArray(resolvedValue)) {
      setSelectedValues(resolvedValue as string[]);
    }
  }, [resolvedValue]);

  const availableTags = useMemo<ResolvedTag[]>(() => {
    const tags: ResolvedTag[] = [];

    if (config.tags) {
      tags.push(...config.tags);
    }

    if (apiData) {
      const items = Array.isArray(apiData)
        ? apiData
        : Array.isArray((apiData as Record<string, unknown>).data)
          ? ((apiData as Record<string, unknown>).data as Record<string, unknown>[])
          : [];
      const labelField = config.labelField ?? "label";
      const valueField = config.valueField ?? "value";
      const colorField = config.colorField ?? "color";

      for (const item of items) {
        tags.push({
          label: String(item[labelField] ?? ""),
          value: String(item[valueField] ?? ""),
          color: item[colorField] ? String(item[colorField]) : undefined,
        });
      }
    }

    return tags;
  }, [
    apiData,
    config.colorField,
    config.labelField,
    config.tags,
    config.valueField,
  ]);

  const filteredTags = useMemo(() => {
    const search = searchText.toLowerCase();
    return availableTags.filter(
      (tag) =>
        !selectedValues.includes(tag.value) &&
        (search === "" || tag.label.toLowerCase().includes(search)),
    );
  }, [availableTags, searchText, selectedValues]);

  const canCreate =
    config.allowCreate &&
    searchText.trim() !== "" &&
    !availableTags.some(
      (tag) => tag.label.toLowerCase() === searchText.trim().toLowerCase(),
    );

  const atMax =
    config.maxTags != null && selectedValues.length >= config.maxTags;

  const updateSelection = useCallback(
    (newValues: string[]) => {
      setSelectedValues(newValues);
      if (publish) {
        publish({ value: newValues });
      }
      if (config.changeAction) {
        void executeAction(config.changeAction, { value: newValues });
      }
    },
    [config.changeAction, executeAction, publish],
  );

  const addTag = useCallback(
    (value: string) => {
      if (atMax || selectedValues.includes(value)) {
        return;
      }

      updateSelection([...selectedValues, value]);
      setSearchText("");
    },
    [atMax, selectedValues, updateSelection],
  );

  const removeTag = useCallback(
    (value: string) => {
      updateSelection(selectedValues.filter((entry) => entry !== value));
    },
    [selectedValues, updateSelection],
  );

  const handleCreate = useCallback(() => {
    const label = searchText.trim();
    if (!label || atMax) {
      return;
    }

    const value = label.toLowerCase().replace(/\s+/g, "-");
    addTag(value);
    if (config.createAction) {
      void executeAction(config.createAction, { label, value });
    }
  }, [addTag, atMax, config.createAction, executeAction, searchText]);

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

  if (visible === false) {
    return null;
  }

  const selectedTags = selectedValues.map((value) => {
    const found = availableTags.find((tag) => tag.value === value);
    return found ?? { label: value, value };
  });

  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      position: "relative",
      style: {
        fontFamily: "var(--sn-font-sans, system-ui, sans-serif)",
      },
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    implementationBase: {
      display: "block",
      fontSize: "sm",
      fontWeight: "medium",
      color: "var(--sn-color-foreground, #111827)",
      style: {
        marginBottom: "var(--sn-spacing-xs, 0.25rem)",
      },
    },
    componentSurface: config.slots?.label,
  });
  const fieldSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-field`,
    implementationBase: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "xs",
      paddingY: "xs",
      paddingX: "sm",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "md",
      bg: "var(--sn-color-input, #ffffff)",
      cursor: "text",
      style: {
        minHeight: "2.5rem",
      },
    },
    componentSurface: config.slots?.field,
  });
  const inputSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-input`,
    implementationBase: {
      flex: "1",
      fontSize: "sm",
      color: "var(--sn-color-foreground, #111827)",
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
      style: {
        minWidth: "80px",
        border: "none",
        outline: "none",
        background: "transparent",
        padding: "var(--sn-spacing-2xs, 0.125rem) 0",
      },
    },
    componentSurface: config.slots?.input,
  });
  const dropdownSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dropdown`,
    implementationBase: {
      position: "absolute",
      border: "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
      borderRadius: "md",
      bg: "var(--sn-color-popover, #ffffff)",
      shadow: "md",
      overflow: "auto",
      zIndex: "dropdown",
      style: {
        top: "100%",
        left: 0,
        right: 0,
        marginTop: "var(--sn-spacing-2xs, 0.125rem)",
        maxHeight: "200px",
      },
    },
    componentSurface: config.slots?.dropdown,
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
  const createOptionSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-createOption`,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "sm",
      width: "100%",
      color: "var(--sn-color-primary, #2563eb)",
      cursor: "pointer",
      transition: "colors",
      style: {
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
        border: "none",
        background: "transparent",
        textAlign: "left",
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        borderTop:
          filteredTags.length > 0
            ? "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)"
            : "none",
      },
      hover: {
        bg: "var(--sn-color-secondary, #f1f5f9)",
      },
      focus: {
        ring: "var(--sn-ring-color, var(--sn-color-primary, #2563eb))",
      },
    },
    componentSurface: config.slots?.createOption,
  });

  return (
    <>
      <div
        data-snapshot-component="tag-selector"
        data-snapshot-id={rootId}
        data-testid="tag-selector"
        ref={containerRef}
        className={joinClassNames(config.className, rootSurface.className)}
        style={{
          ...(rootSurface.style ?? {}),
          ...((config.style as CSSProperties | undefined) ?? {}),
        }}
      >
        {config.label ? (
          <label
            data-testid="tag-selector-label"
            data-snapshot-id={`${rootId}-label`}
            className={labelSurface.className}
            style={labelSurface.style}
          >
            {config.label}
          </label>
        ) : null}

        <div
          data-snapshot-id={`${rootId}-field`}
          onClick={() => {
            inputRef.current?.focus();
            setIsOpen(true);
          }}
          className={fieldSurface.className}
          style={fieldSurface.style}
        >
          {selectedTags.map((tag) => (
            <TagPill
              key={tag.value}
              config={config}
              rootId={rootId}
              tag={tag}
              onRemove={removeTag}
            />
          ))}

          <InputControl
            inputRef={inputRef}
            testId="tag-input"
            surfaceId={`${rootId}-input`}
            type="text"
            value={searchText}
            onChangeText={(value) => {
              setSearchText(value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(event) => {
              if (
                event.key === "Backspace" &&
                searchText === "" &&
                selectedValues.length > 0
              ) {
                const lastValue = selectedValues[selectedValues.length - 1];
                if (lastValue) {
                  removeTag(lastValue);
                }
              }

              if (event.key === "Enter" && canCreate) {
                event.preventDefault();
                handleCreate();
              }
            }}
            placeholder={selectedValues.length === 0 ? "Type to search..." : ""}
            disabled={atMax}
            className={inputSurface.className}
            style={inputSurface.style}
          />
        </div>

        {isOpen && (filteredTags.length > 0 || canCreate || apiLoading || apiError) ? (
          <div
            data-testid="tag-dropdown"
            data-snapshot-id={`${rootId}-dropdown`}
            className={dropdownSurface.className}
            style={dropdownSurface.style}
          >
            {apiLoading ? (
              <div
                data-testid="tag-selector-loading"
                data-snapshot-id={`${rootId}-loading`}
                className={loadingSurface.className}
                style={loadingSurface.style}
              >
                Loading...
              </div>
            ) : null}

            {!apiLoading && apiError ? (
              <div
                data-testid="tag-selector-error"
                data-snapshot-id={`${rootId}-error`}
                className={errorSurface.className}
                style={errorSurface.style}
              >
                <div>Failed to load tags</div>
                <ButtonControl
                  type="button"
                  surfaceId={`${rootId}-retryButton`}
                  onClick={(event) => {
                    event.stopPropagation();
                    apiRefetch();
                  }}
                  variant="ghost"
                  size="sm"
                  className={retryButtonSurface.className}
                  style={retryButtonSurface.style}
                >
                  Retry
                </ButtonControl>
              </div>
            ) : null}

            {!apiLoading && !apiError
              ? filteredTags.map((tag) => (
                  <TagOption
                    key={tag.value}
                    config={config}
                    rootId={rootId}
                    tag={tag}
                    onSelect={(value) => {
                      addTag(value);
                      setIsOpen(false);
                    }}
                  />
                ))
              : null}

            {canCreate ? (
              <ButtonControl
                type="button"
                variant="ghost"
                size="sm"
                surfaceId={`${rootId}-createOption`}
                data-testid="tag-create-option"
                onClick={handleCreate}
                className={createOptionSurface.className}
                style={createOptionSurface.style}
              >
                Create &ldquo;{searchText.trim()}&rdquo;
              </ButtonControl>
            ) : null}
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={fieldSurface.scopedCss} />
      <SurfaceStyles css={inputSurface.scopedCss} />
      <SurfaceStyles css={dropdownSurface.scopedCss} />
      <SurfaceStyles css={loadingSurface.scopedCss} />
      <SurfaceStyles css={errorSurface.scopedCss} />
      <SurfaceStyles css={retryButtonSurface.scopedCss} />
      <SurfaceStyles css={createOptionSurface.scopedCss} />
    </>
  );
}
