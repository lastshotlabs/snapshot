import { useSubscribe } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import type { EmptyStateConfig } from "./types";

/** Icon size in pixels for each size variant. */
const ICON_SIZE_MAP = { sm: 32, md: 48, lg: 64 } as const;

/** Spacing scale name for each size variant. */
const SPACING_MAP = {
  sm: "var(--sn-spacing-md, 1rem)",
  md: "var(--sn-spacing-xl, 2rem)",
  lg: "var(--sn-spacing-xl, 2rem)",
} as const;

/**
 * EmptyState component — a centered placeholder for when there is no data.
 *
 * Displays an icon, title, description, and optional CTA button
 * to guide the user when a view has no content.
 *
 * @param props - Component props containing the empty state configuration
 *
 * @example
 * ```json
 * {
 *   "type": "empty-state",
 *   "title": "No projects yet",
 *   "description": "Create your first project to get started.",
 *   "icon": "folder",
 *   "actionLabel": "New Project",
 *   "action": { "type": "navigate", "to": "/projects/new" }
 * }
 * ```
 */
export function EmptyState({ config }: { config: EmptyStateConfig }) {
  const execute = useActionExecutor();

  // Check visibility
  const visible = useSubscribe(config.visible ?? true);
  if (visible === false) return null;

  const size = config.size ?? "md";
  const iconSize = ICON_SIZE_MAP[size];
  const spacing = SPACING_MAP[size];

  const handleAction = config.action
    ? () => void execute(config.action!)
    : undefined;

  return (
    <div
      data-snapshot-component="empty-state"
      data-testid="empty-state"
      className={config.className}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: spacing,
        gap: "var(--sn-spacing-md, 1rem)",
        ...(config.style as React.CSSProperties),
      }}
    >
      {/* Icon */}
      {config.icon && (
        <span
          data-testid="empty-state-icon"
          aria-hidden="true"
          style={{
            lineHeight: 1,
            color: config.iconColor
              ? `var(--sn-color-${config.iconColor}, ${config.iconColor})`
              : "var(--sn-color-muted-foreground, #6b7280)",
          }}
        >
          <Icon name={config.icon} size={iconSize} />
        </span>
      )}

      {/* Title */}
      <h3
        data-testid="empty-state-title"
        style={{
          fontSize:
            size === "sm"
              ? "var(--sn-font-size-md, 1rem)"
              : size === "lg"
                ? "var(--sn-font-size-xl, 1.25rem)"
                : "var(--sn-font-size-lg, 1.125rem)",
          fontWeight: "var(--sn-font-weight-semibold, 600)",
          color: "var(--sn-color-foreground, #111827)",
          margin: 0,
        }}
      >
        {config.title}
      </h3>

      {/* Description */}
      {config.description && (
        <p
          data-testid="empty-state-description"
          style={{
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            color: "var(--sn-color-muted-foreground, #6b7280)",
            maxWidth: 400,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {config.description}
        </p>
      )}

      {/* Action button */}
      {handleAction && config.actionLabel && (
        <button
          data-testid="empty-state-action"
          onClick={handleAction}
          style={{
            backgroundColor: "var(--sn-color-primary, #2563eb)",
            color: "var(--sn-color-primary-foreground, #ffffff)",
            border: "none",
            borderRadius: "var(--sn-radius-md, 0.375rem)",
            padding: `var(--sn-spacing-sm, 0.5rem) var(--sn-spacing-lg, 1.5rem)`,
            fontSize: "var(--sn-font-size-sm, 0.875rem)",
            fontWeight: "var(--sn-font-weight-semibold, 600)",
            cursor: "pointer",
            transition:
              "opacity var(--sn-duration-fast, 150ms) var(--sn-ease-out, ease-out)",
          }}
        >
          {config.actionLabel}
        </button>
      )}
    </div>
  );
}
