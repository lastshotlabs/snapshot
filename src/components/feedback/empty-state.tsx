import { token } from "../../tokens/utils";
import type { EmptyStateConfig } from "./empty-state.schema";

interface EmptyStateProps {
  config: EmptyStateConfig;
  onAction?: () => void;
}

/**
 * Config-driven empty state placeholder.
 * Used when a table, list, or feed has no data to display.
 */
export function EmptyState({ config, onAction }: EmptyStateProps) {
  return (
    <div
      className={config.className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: `${token("spacing.12")} ${token("spacing.6")}`,
        textAlign: "center",
      }}
    >
      {config.icon && (
        <div
          style={{
            fontSize: "2.5rem",
            marginBottom: token("spacing.4"),
            color: token("colors.muted-foreground"),
          }}
        >
          {config.icon}
        </div>
      )}

      <div
        style={{
          fontSize: token("typography.fontSize.lg"),
          fontWeight: token("typography.fontWeight.medium"),
          color: token("colors.foreground"),
          marginBottom: token("spacing.2"),
        }}
      >
        {config.title}
      </div>

      {config.description && (
        <div
          style={{
            fontSize: token("typography.fontSize.sm"),
            color: token("colors.muted-foreground"),
            maxWidth: "400px",
            marginBottom: config.action ? token("spacing.6") : undefined,
          }}
        >
          {config.description}
        </div>
      )}

      {config.action && config.actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: `${token("spacing.2")} ${token("spacing.4")}`,
            fontSize: token("typography.fontSize.sm"),
            fontWeight: token("typography.fontWeight.medium"),
            borderRadius: token("radius.md"),
            border: "none",
            backgroundColor: token("colors.primary"),
            color: token("colors.primary-foreground"),
            cursor: "pointer",
          }}
        >
          {config.actionLabel}
        </button>
      )}
    </div>
  );
}
