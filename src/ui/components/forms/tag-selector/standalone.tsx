"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../button";
import { InputControl } from "../input";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface TagSelectorTag {
  /** Display text for the tag. */
  label: string;
  /** Unique value identifier for the tag. */
  value: string;
  /** Optional hex color for the tag pill background. */
  color?: string;
}

export interface TagSelectorFieldProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Label text displayed above the tag field. */
  label?: string;
  /** Available tags to select from. */
  tags?: TagSelectorTag[];
  /** Controlled array of selected tag values. */
  value?: string[];
  /** Initial selected tag values (uncontrolled). */
  defaultValue?: string[];
  /** Whether the user can create new tags by typing. */
  allowCreate?: boolean;
  /** Maximum number of tags that can be selected. */
  maxTags?: number;
  /** Called when the tag selection changes. */
  onChange?: (values: string[]) => void;
  /** Called when the user creates a new tag. */
  onCreate?: (label: string, value: string) => void;

  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements. */
  slots?: Record<string, Record<string, unknown>>;
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

function StandaloneTagPill({
  rootId,
  tag,
  onRemove,
  slots,
}: {
  rootId: string;
  tag: TagSelectorTag;
  onRemove: (value: string) => void;
  slots?: Record<string, Record<string, unknown>>;
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
    componentSurface: slots?.pill,
  });
  const pillLabelSurface = resolveSurfacePresentation({
    surfaceId: `${pillId}-label`,
    implementationBase: {},
    componentSurface: slots?.pillLabel,
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
    componentSurface: slots?.removeButton,
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
          testId="tag-remove"
          onClick={(event) => {
            event.stopPropagation();
            onRemove(tag.value);
          }}
          surfaceConfig={removeButtonSurface.resolvedConfigForWrapper}
        >
          {"\u00d7"}
        </ButtonControl>
      </span>
      <SurfaceStyles css={pillSurface.scopedCss} />
      <SurfaceStyles css={pillLabelSurface.scopedCss} />
    </>
  );
}

function StandaloneTagOption({
  rootId,
  tag,
  onSelect,
  slots,
}: {
  rootId: string;
  tag: TagSelectorTag;
  onSelect: (value: string) => void;
  slots?: Record<string, Record<string, unknown>>;
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
    componentSurface: slots?.option,
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
    componentSurface: slots?.optionSwatch,
  });
  const optionLabelSurface = resolveSurfacePresentation({
    surfaceId: `${optionId}-label`,
    implementationBase: {} as Record<string, unknown>,
    componentSurface: slots?.optionLabel,
  });

  return (
    <>
      <ButtonControl
        type="button"
        variant="ghost"
        size="sm"
        surfaceId={optionId}
        testId="tag-option"
        onClick={() => onSelect(tag.value)}
        surfaceConfig={optionSurface.resolvedConfigForWrapper}
      >
        {tag.color ? (
          <span
            data-snapshot-id={`${optionId}-swatch`}
            className={swatchSurface.className}
            style={swatchSurface.style}
          />
        ) : null}
        <span
          data-snapshot-id={`${optionId}-label`}
          className={optionLabelSurface.className}
          style={optionLabelSurface.style}
        >
          {tag.label}
        </span>
      </ButtonControl>
      <SurfaceStyles css={swatchSurface.scopedCss} />
      <SurfaceStyles css={optionLabelSurface.scopedCss} />
    </>
  );
}

/**
 * Standalone TagSelectorField -- tag pills with dropdown selection, search filtering,
 * and optional tag creation. No manifest context required.
 *
 * @example
 * ```tsx
 * <TagSelectorField
 *   label="Categories"
 *   tags={[
 *     { label: "Bug", value: "bug", color: "#ef4444" },
 *     { label: "Feature", value: "feature", color: "#22c55e" },
 *   ]}
 *   allowCreate
 *   onChange={(selected) => setCategories(selected)}
 * />
 * ```
 */
export function TagSelectorField({
  id,
  label,
  tags: tagsProp = [],
  value: controlledValue,
  defaultValue,
  allowCreate = false,
  maxTags,
  onChange,
  onCreate,
  className,
  style,
  slots,
}: TagSelectorFieldProps) {
  const rootId = id ?? "tag-selector";

  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue ?? []);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setSelectedValues(controlledValue);
    }
  }, [controlledValue]);

  const filteredTags = useMemo(() => {
    const search = searchText.toLowerCase();
    return tagsProp.filter(
      (tag) =>
        !selectedValues.includes(tag.value) &&
        (search === "" || tag.label.toLowerCase().includes(search)),
    );
  }, [tagsProp, searchText, selectedValues]);

  const canCreate =
    allowCreate &&
    searchText.trim() !== "" &&
    !tagsProp.some(
      (tag) => tag.label.toLowerCase() === searchText.trim().toLowerCase(),
    );

  const atMax =
    maxTags != null && selectedValues.length >= maxTags;

  const updateSelection = useCallback(
    (newValues: string[]) => {
      setSelectedValues(newValues);
      onChange?.(newValues);
    },
    [onChange],
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
    onCreate?.(label, value);
  }, [addTag, atMax, onCreate, searchText]);

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

  const selectedTags = selectedValues.map((value) => {
    const found = tagsProp.find((tag) => tag.value === value);
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
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
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
    componentSurface: slots?.label,
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
    componentSurface: slots?.field,
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
    componentSurface: slots?.input,
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
    componentSurface: slots?.dropdown,
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
    componentSurface: slots?.createOption,
  });
  const createOptionLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-createOptionLabel`,
    implementationBase: {} as Record<string, unknown>,
    componentSurface: slots?.createOptionLabel,
  });

  return (
    <>
      <div
        data-snapshot-component="tag-selector"
        data-snapshot-id={rootId}
        data-testid="tag-selector"
        ref={containerRef}
        className={rootSurface.className}
        style={rootSurface.style}
      >
        {label ? (
          <label
            data-testid="tag-selector-label"
            data-snapshot-id={`${rootId}-label`}
            className={labelSurface.className}
            style={labelSurface.style}
          >
            {label}
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
            <StandaloneTagPill
              key={tag.value}
              rootId={rootId}
              tag={tag}
              onRemove={removeTag}
              slots={slots}
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
            surfaceConfig={inputSurface.resolvedConfigForWrapper}
          />
        </div>

        {isOpen && (filteredTags.length > 0 || canCreate) ? (
          <div
            data-testid="tag-dropdown"
            data-snapshot-id={`${rootId}-dropdown`}
            className={dropdownSurface.className}
            style={dropdownSurface.style}
          >
            {filteredTags.map((tag) => (
              <StandaloneTagOption
                key={tag.value}
                rootId={rootId}
                tag={tag}
                onSelect={(value) => {
                  addTag(value);
                  setIsOpen(false);
                }}
                slots={slots}
              />
            ))}

            {canCreate ? (
              <ButtonControl
                type="button"
                variant="ghost"
                size="sm"
                surfaceId={`${rootId}-createOption`}
                testId="tag-create-option"
                onClick={handleCreate}
                surfaceConfig={createOptionSurface.resolvedConfigForWrapper}
              >
                <span
                  data-snapshot-id={`${rootId}-createOptionLabel`}
                  className={createOptionLabelSurface.className}
                  style={createOptionLabelSurface.style}
                >
                  Create &ldquo;{searchText.trim()}&rdquo;
                </span>
              </ButtonControl>
            ) : null}
          </div>
        ) : null}
      </div>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={labelSurface.scopedCss} />
      <SurfaceStyles css={fieldSurface.scopedCss} />
      <SurfaceStyles css={dropdownSurface.scopedCss} />
      <SurfaceStyles css={createOptionLabelSurface.scopedCss} />
    </>
  );
}
