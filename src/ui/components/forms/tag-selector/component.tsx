'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { useComponentData } from "../../_base/use-component-data";
import type { TagSelectorConfig } from "./types";

/** Resolved tag shape used internally. */
interface ResolvedTag {
  label: string;
  value: string;
  color?: string;
}

/**
 * Derive a contrasting text color (black or white) from a CSS hex color.
 * Falls back to white for non-hex values.
 */
function contrastText(color: string): string {
  if (!color.startsWith("#") || color.length < 7) return "#ffffff";
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  // Relative luminance simplified
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

/**
 * TagSelector component — a tag input for selecting and creating tags.
 *
 * Displays selected tags as colored pills with remove buttons. Includes
 * a text input for searching available tags and optionally creating new ones.
 *
 * @param props - Component props containing the tag selector configuration
 *
 * @example
 * ```json
 * {
 *   "type": "tag-selector",
 *   "id": "tags",
 *   "tags": [
 *     { "label": "Bug", "value": "bug", "color": "#ef4444" },
 *     { "label": "Feature", "value": "feature", "color": "#22c55e" }
 *   ],
 *   "allowCreate": true
 * }
 * ```
 */
export function TagSelector({ config }: { config: TagSelectorConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const resolvedValue = useSubscribe(config.value ?? []);
  const executeAction = useActionExecutor();
  const publish = usePublish(config.id);

  // Fetch tags from API if data is provided
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

  // Sync external value
  useEffect(() => {
    if (Array.isArray(resolvedValue)) {
      setSelectedValues(resolvedValue as string[]);
    }
  }, [resolvedValue]);

  // Build available tags from static config + API data
  const availableTags: ResolvedTag[] = useMemo(() => {
    const tags: ResolvedTag[] = [];

    // Static tags
    if (config.tags) {
      tags.push(...config.tags);
    }

    // API tags
    if (apiData) {
      const items = Array.isArray(apiData)
        ? apiData
        : Array.isArray((apiData as Record<string, unknown>).data)
          ? ((apiData as Record<string, unknown>).data as Record<
              string,
              unknown
            >[])
          : [];
      const labelField = config.labelField ?? "label";
      const valueField = config.valueField ?? "value";
      const colorField = config.colorField ?? "color";

      for (const item of items) {
        const rec = item as Record<string, unknown>;
        tags.push({
          label: String(rec[labelField] ?? ""),
          value: String(rec[valueField] ?? ""),
          color: rec[colorField] ? String(rec[colorField]) : undefined,
        });
      }
    }

    return tags;
  }, [
    config.tags,
    apiData,
    config.labelField,
    config.valueField,
    config.colorField,
  ]);

  // Filter available tags by search and exclude already selected
  const filteredTags = useMemo(() => {
    const search = searchText.toLowerCase();
    return availableTags.filter(
      (t) =>
        !selectedValues.includes(t.value) &&
        (search === "" || t.label.toLowerCase().includes(search)),
    );
  }, [availableTags, selectedValues, searchText]);

  // Check if the typed text matches any existing tag
  const canCreate =
    config.allowCreate &&
    searchText.trim() !== "" &&
    !availableTags.some(
      (t) => t.label.toLowerCase() === searchText.trim().toLowerCase(),
    );

  const atMax =
    config.maxTags != null && selectedValues.length >= config.maxTags;

  // Publish and notify on change
  const updateSelection = useCallback(
    (newValues: string[]) => {
      setSelectedValues(newValues);
      if (publish) publish({ value: newValues });
      if (config.changeAction) {
        void executeAction(config.changeAction, { value: newValues });
      }
    },
    [publish, config.changeAction, executeAction],
  );

  const addTag = useCallback(
    (value: string) => {
      if (atMax) return;
      if (selectedValues.includes(value)) return;
      updateSelection([...selectedValues, value]);
      setSearchText("");
    },
    [selectedValues, atMax, updateSelection],
  );

  const removeTag = useCallback(
    (value: string) => {
      updateSelection(selectedValues.filter((v) => v !== value));
    },
    [selectedValues, updateSelection],
  );

  const handleCreate = useCallback(() => {
    const label = searchText.trim();
    if (!label || atMax) return;
    const value = label.toLowerCase().replace(/\s+/g, "-");
    addTag(value);
    if (config.createAction) {
      void executeAction(config.createAction, { label, value });
    }
  }, [searchText, atMax, addTag, config.createAction, executeAction]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (visible === false) return null;

  // Resolve tag metadata for selected values
  const selectedTags = selectedValues.map((v) => {
    const found = availableTags.find((t) => t.value === v);
    return found ?? { label: v, value: v };
  });

  return (
    <div
      data-snapshot-component="tag-selector"
      data-testid="tag-selector"
      className={config.className}
      ref={containerRef}
      style={{
        position: "relative",
        fontFamily: "var(--sn-font-sans, system-ui, sans-serif)",
        ...((config.style as React.CSSProperties) ?? {}),
      }}
    >
      <style>{`
        [data-snapshot-component="tag-selector"] [data-testid="tag-remove"]:focus { outline: none; }
        [data-snapshot-component="tag-selector"] [data-testid="tag-remove"]:hover {
          opacity: 1;
          background-color: rgba(0, 0, 0, 0.15);
          border-radius: var(--sn-radius-full, 9999px);
        }
        [data-snapshot-component="tag-selector"] [data-testid="tag-remove"]:focus-visible {
          outline: 2px solid var(--sn-ring-color, var(--sn-color-primary, #2563eb));
          outline-offset: var(--sn-ring-offset, 2px);
          border-radius: var(--sn-radius-full, 9999px);
        }
        [data-snapshot-component="tag-selector"] [data-testid="tag-option"]:focus { outline: none; }
        [data-snapshot-component="tag-selector"] [data-testid="tag-option"]:hover {
          background-color: var(--sn-color-secondary, #f1f5f9);
        }
        [data-snapshot-component="tag-selector"] [data-testid="tag-option"]:focus-visible {
          background-color: var(--sn-color-secondary, #f1f5f9);
        }
        [data-snapshot-component="tag-selector"] [data-testid="tag-create-option"]:focus { outline: none; }
        [data-snapshot-component="tag-selector"] [data-testid="tag-create-option"]:hover {
          background-color: var(--sn-color-secondary, #f1f5f9);
        }
        [data-snapshot-component="tag-selector"] [data-testid="tag-create-option"]:focus-visible {
          background-color: var(--sn-color-secondary, #f1f5f9);
        }
      `}</style>

      {/* Label */}
      {config.label && (
        <label
          data-testid="tag-selector-label"
          style={{
            display: "block",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            fontWeight: "var(--sn-font-weight-medium, 500)" as string,
            color: "var(--sn-color-foreground, #111827)",
            marginBottom: "var(--sn-spacing-xs, 0.25rem)",
          }}
        >
          {config.label}
        </label>
      )}

      {/* Tag pills + input */}
      <div
        onClick={() => {
          inputRef.current?.focus();
          setIsOpen(true);
        }}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--sn-spacing-xs, 0.25rem)",
          padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
          border:
            "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
          borderRadius: "var(--sn-radius-md, 0.5rem)",
          backgroundColor: "var(--sn-color-input, #ffffff)",
          minHeight: "2.5rem",
          alignItems: "center",
          cursor: "text",
        }}
      >
        {selectedTags.map((tag) => {
          const bgColor = tag.color ?? "var(--sn-color-primary, #2563eb)";
          const textColor = tag.color
            ? contrastText(tag.color)
            : "var(--sn-color-primary-foreground, #ffffff)";
          return (
            <span
              key={tag.value}
              data-testid="tag-pill"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--sn-spacing-2xs, 0.125rem)",
                padding:
                  "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-sm, 0.5rem)",
                borderRadius: "var(--sn-radius-full, 9999px)",
                backgroundColor: bgColor,
                color: textColor,
                fontSize: "var(--sn-font-size-sm, 0.875rem)",
                fontWeight: "var(--sn-font-weight-medium, 500)" as string,
                lineHeight: "var(--sn-leading-tight, 1.25)",
                whiteSpace: "nowrap",
              }}
            >
              {tag.label}
              <button
                data-testid="tag-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag.value);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  padding: "0 0 0 var(--sn-spacing-2xs, 0.125rem)",
                  fontSize: "var(--sn-font-size-md, 1rem)",
                  lineHeight: "var(--sn-leading-none, 1)",
                  opacity: "var(--sn-opacity-hover, 0.7)",
                }}
                aria-label={`Remove ${tag.label}`}
              >
                \u00d7
              </button>
            </span>
          );
        })}

        <input
          ref={inputRef}
          data-testid="tag-input"
          type="text"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (
              e.key === "Backspace" &&
              searchText === "" &&
              selectedValues.length > 0
            ) {
              const lastVal = selectedValues[selectedValues.length - 1];
              if (lastVal) removeTag(lastVal);
            }
            if (e.key === "Enter" && canCreate) {
              e.preventDefault();
              handleCreate();
            }
          }}
          placeholder={selectedValues.length === 0 ? "Type to search..." : ""}
          disabled={atMax}
          style={{
            flex: 1,
            minWidth: "80px",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-foreground, #111827)",
            padding: "var(--sn-spacing-2xs, 0.125rem) 0",
          }}
        />
      </div>

      {/* Dropdown */}
      {isOpen &&
        (filteredTags.length > 0 || canCreate || apiLoading || apiError) && (
          <div
            data-testid="tag-dropdown"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: "var(--sn-spacing-2xs, 0.125rem)",
              backgroundColor: "var(--sn-color-popover, #ffffff)",
              border:
                "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)",
              borderRadius: "var(--sn-radius-md, 0.5rem)",
              boxShadow: "var(--sn-shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1))",
              zIndex: "var(--sn-z-index-dropdown, 100)" as string,
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {apiLoading && (
              <div
                data-testid="tag-selector-loading"
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

            {!apiLoading && apiError && (
              <div
                data-testid="tag-selector-error"
                style={{
                  padding: "var(--sn-spacing-md, 0.75rem)",
                  textAlign: "center",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                  color: "var(--sn-color-destructive, #ef4444)",
                }}
              >
                <div>Failed to load tags</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    apiRefetch();
                  }}
                  style={{
                    marginTop: "var(--sn-spacing-xs, 0.25rem)",
                    padding:
                      "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-sm, 0.5rem)",
                    fontSize: "var(--sn-font-size-sm, 0.875rem)",
                    color: "var(--sn-color-primary, #2563eb)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {!apiLoading &&
              !apiError &&
              filteredTags.map((tag) => (
                <button
                  key={tag.value}
                  data-testid="tag-option"
                onClick={() => {
                  addTag(tag.value);
                  setIsOpen(false);
                }}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--sn-spacing-sm, 0.5rem)",
                    width: "100%",
                    padding:
                      "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
                    border: "none",
                    background: "transparent",
                  cursor: "pointer",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                  color: "var(--sn-color-foreground, #111827)",
                  textAlign: "left",
                }}
                >
                  {tag.color && (
                    <span
                      style={{
                        width: "0.75rem",
                        height: "0.75rem",
                        borderRadius: "var(--sn-radius-full, 9999px)",
                        backgroundColor: tag.color,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {tag.label}
                </button>
              ))}

            {/* Create option */}
            {canCreate && (
              <button
                data-testid="tag-create-option"
                onClick={handleCreate}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sn-spacing-sm, 0.5rem)",
                  width: "100%",
                  padding:
                    "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
                  border: "none",
                  borderTop:
                    filteredTags.length > 0
                      ? "var(--sn-border-default, 1px) solid var(--sn-color-border, #e5e7eb)"
                      : "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "var(--sn-font-size-sm, 0.875rem)",
                  color: "var(--sn-color-primary, #2563eb)",
                  textAlign: "left",
                }}
              >
                Create &ldquo;{searchText.trim()}&rdquo;
              </button>
            )}
          </div>
        )}
    </div>
  );
}
