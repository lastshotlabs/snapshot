import { useState, useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { Icon } from "../../../icons/index";
import type { FavoriteButtonConfig } from "./types";

/** Icon sizes per size variant (px). */
const SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

/**
 * FavoriteButton component — a config-driven star toggle for marking favorites.
 *
 * Renders a star icon that toggles between active (filled/warning color) and
 * inactive (muted foreground) states. Dispatches an optional action on toggle
 * and publishes its active state.
 *
 * @param props - Component props containing the favorite button configuration
 *
 * @example
 * ```json
 * {
 *   "type": "favorite-button",
 *   "active": false,
 *   "size": "md"
 * }
 * ```
 */
export function FavoriteButton({ config }: { config: FavoriteButtonConfig }) {
  const resolvedActive = useSubscribe(config.active ?? false) as boolean;
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  const [active, setActive] = useState(resolvedActive);

  // Sync with external from-ref changes
  useEffect(() => {
    setActive(resolvedActive);
  }, [resolvedActive]);

  // Publish state
  useEffect(() => {
    if (publish) {
      publish({ active });
    }
  }, [publish, active]);

  if (visible === false) return null;

  const size = config.size ?? "md";
  const iconSize = SIZE_MAP[size];

  const handleToggle = () => {
    const next = !active;
    setActive(next);
    if (config.toggleAction) {
      void execute(config.toggleAction as Parameters<typeof execute>[0]);
    }
  };

  return (
    <>
    <style>{`[data-snapshot-component="favorite-button"]:hover { background-color: var(--sn-color-secondary, #f3f4f6); }`}</style>
    <button
      data-snapshot-component="favorite-button"
      data-testid="favorite-button"
      data-active={active}
      className={config.className}
      onClick={handleToggle}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={active}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "var(--sn-spacing-xs, 0.25rem)",
        borderRadius: "var(--sn-radius-sm, 0.25rem)",
        color: active
          ? "var(--sn-color-warning, #f59e0b)"
          : "var(--sn-color-muted-foreground, #6b7280)",
        transition: `color var(--sn-duration-fast, 150ms) var(--sn-ease-default, ease)`,
      }}
    >
      <Icon name="star" size={iconSize} />
    </button>
    </>
  );
}
