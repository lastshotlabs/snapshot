import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePublish, useSubscribe } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import type { InlineEditConfig } from "./types";

/**
 * InlineEdit component — click-to-edit text field.
 *
 * Toggles between a display mode (shows text with a pencil icon on hover)
 * and an edit mode (auto-focused input). Enter or blur saves the value;
 * Escape reverts to the original value (if `cancelOnEscape` is true).
 *
 * Publishes `{ value, editing }` to the page context.
 *
 * @param props.config - The inline edit config from the manifest
 */
export function InlineEdit({ config }: { config: InlineEditConfig }) {
  const execute = useActionExecutor();
  const publish = config.id ? usePublish(config.id) : undefined;

  // Resolve value from ref or static
  const resolvedValue = useSubscribe(config.value);
  const displayValue =
    typeof resolvedValue === "string" || typeof resolvedValue === "number"
      ? String(resolvedValue)
      : "";

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(displayValue);
  const [hovering, setHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholder = config.placeholder ?? "Click to edit";
  const inputType = config.inputType ?? "text";
  const cancelOnEscape = config.cancelOnEscape !== false;
  const fontSize = config.fontSize ?? "var(--sn-font-size-md, 1rem)";

  // Sync resolved value when it changes externally
  useEffect(() => {
    if (!editing) {
      setEditValue(displayValue);
    }
  }, [displayValue, editing]);

  // Publish state
  useEffect(() => {
    publish?.({ value: editing ? editValue : displayValue, editing });
  }, [editing, editValue, displayValue, publish]);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEditing = useCallback(() => {
    setEditValue(displayValue);
    setEditing(true);
  }, [displayValue]);

  const save = useCallback(() => {
    setEditing(false);
    if (config.saveAction && editValue !== displayValue) {
      void execute(config.saveAction, { value: editValue });
    }
  }, [config.saveAction, editValue, displayValue, execute]);

  const cancel = useCallback(() => {
    setEditValue(displayValue);
    setEditing(false);
  }, [displayValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        save();
      } else if (e.key === "Escape" && cancelOnEscape) {
        e.preventDefault();
        cancel();
      }
    },
    [save, cancel, cancelOnEscape],
  );

  const handleBlur = useCallback(() => {
    save();
  }, [save]);

  // Visibility check
  if (config.visible === false) return null;

  return (
    <div
      data-snapshot-component="inline-edit"
      className={config.className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        minWidth: 0,
      }}
    >
      {editing ? (
        /* Edit mode */
        <input
          ref={inputRef}
          type={inputType}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          data-testid="inline-edit-input"
          style={{
            fontSize,
            fontFamily: "inherit",
            lineHeight: "var(--sn-leading-normal, 1.5)",
            color: "var(--sn-color-foreground, #111)",
            backgroundColor: "var(--sn-color-input, #fff)",
            border: "1px solid var(--sn-color-ring, #2563eb)",
            borderRadius: "var(--sn-radius-sm, 0.25rem)",
            padding:
              "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-xs, 0.25rem)",
            outline: "none",
            width: "100%",
            minWidth: "60px",
          }}
        />
      ) : (
        /* Display mode */
        <button
          type="button"
          onClick={startEditing}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          data-testid="inline-edit-display"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--sn-spacing-xs, 0.25rem)",
            fontSize,
            fontFamily: "inherit",
            lineHeight: "var(--sn-leading-normal, 1.5)",
            color: displayValue
              ? "var(--sn-color-foreground, #111)"
              : "var(--sn-color-muted-foreground, #6b7280)",
            background: "none",
            border: "1px solid transparent",
            borderRadius: "var(--sn-radius-sm, 0.25rem)",
            padding:
              "var(--sn-spacing-2xs, 0.125rem) var(--sn-spacing-xs, 0.25rem)",
            cursor: "pointer",
            textAlign: "left",
            transition:
              "border-color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
            borderColor: hovering
              ? "var(--sn-color-border, #e5e7eb)"
              : "transparent",
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayValue || placeholder}
          </span>
          <span
            style={{
              opacity: hovering ? 1 : 0,
              transition:
                "opacity var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)",
              display: "inline-flex",
              flexShrink: 0,
              color: "var(--sn-color-muted-foreground, #6b7280)",
            }}
          >
            <Icon name="pencil" size={12} />
          </span>
        </button>
      )}
    </div>
  );
}
