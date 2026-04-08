import { useState, useCallback, useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import type { QuickAddConfig } from "./types";

/**
 * QuickAdd component — a config-driven inline creation bar for quick item entry.
 *
 * Renders a horizontal bar with an optional icon, text input, and submit button.
 * Enter key submits by default. Dispatches `submitAction` with `{ value }` payload
 * and publishes the current input value.
 *
 * @param props - Component props containing the quick add configuration
 *
 * @example
 * ```json
 * {
 *   "type": "quick-add",
 *   "placeholder": "Add a task...",
 *   "submitAction": { "type": "api", "method": "POST", "endpoint": "/api/tasks" },
 *   "showButton": true,
 *   "buttonText": "Add"
 * }
 * ```
 */
export function QuickAdd({ config }: { config: QuickAddConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const [value, setValue] = useState("");

  const placeholder = config.placeholder ?? "Add new item...";
  const icon = config.icon ?? "plus";
  const submitOnEnter = config.submitOnEnter ?? true;
  const showButton = config.showButton ?? true;
  const buttonText = config.buttonText ?? "Add";
  const clearOnSubmit = config.clearOnSubmit ?? true;

  // Publish value changes
  useEffect(() => {
    if (publish) {
      publish({ value });
    }
  }, [publish, value]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (config.submitAction) {
      void execute(config.submitAction as Parameters<typeof execute>[0]);
    }

    if (clearOnSubmit) {
      setValue("");
    }
  }, [value, config.submitAction, execute, clearOnSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (submitOnEnter && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [submitOnEnter, handleSubmit],
  );

  if (visible === false) return null;

  return (
    <div
      data-snapshot-component="quick-add"
      data-testid="quick-add"
      className={config.className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sn-spacing-sm, 0.5rem)",
        padding: "var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-md, 0.75rem)",
        border:
          "var(--sn-border-thin, 1px) solid var(--sn-color-border, #e5e7eb)",
        borderRadius: "var(--sn-radius-lg, 0.75rem)",
        backgroundColor: "var(--sn-color-card, #ffffff)",
        ...config.style,
      }}
    >
      {/* Left icon */}
      <span
        aria-hidden="true"
        style={{
          display: "flex",
          flexShrink: 0,
          color: "var(--sn-color-muted-foreground, #6b7280)",
        }}
      >
        <Icon name={icon} size={18} />
      </span>

      {/* Input */}
      <input
        data-testid="quick-add-input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: "var(--sn-font-size-sm, 0.875rem)",
          color: "var(--sn-color-foreground, #111827)",
          fontFamily: "var(--sn-font-sans, sans-serif)",
          lineHeight: "var(--sn-leading-normal, 1.5)",
          padding: 0,
        }}
      />

      {/* Submit button */}
      {showButton && (
        <button
          data-testid="quick-add-button"
          onClick={handleSubmit}
          disabled={!value.trim()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--sn-spacing-xs, 0.25rem)",
            padding:
              "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-md, 0.75rem)",
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            fontWeight: "var(--sn-font-weight-medium, 500)" as string,
            color: "var(--sn-color-primary-foreground, #ffffff)",
            backgroundColor: "var(--sn-color-primary, #2563eb)",
            border: "none",
            borderRadius: "var(--sn-radius-md, 0.375rem)",
            cursor: value.trim() ? "pointer" : "not-allowed",
            opacity: value.trim()
              ? 1
              : ("var(--sn-opacity-disabled, 0.5)" as unknown as number),
            transition: `opacity var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)`,
            whiteSpace: "nowrap",
          }}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
