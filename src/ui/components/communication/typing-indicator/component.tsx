import { useSubscribe } from "../../../context/hooks";
import type { TypingIndicatorConfig } from "./types";

/** CSS keyframes for bouncing dot animation. */
const BOUNCE_KEYFRAMES = `
@keyframes sn-typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}
`;

/**
 * TypingIndicator — shows animated bouncing dots with user names
 * to indicate who is currently typing.
 *
 * @param props - Component props containing the typing indicator configuration
 */
export function TypingIndicator({
  config,
}: {
  config: TypingIndicatorConfig;
}) {
  const visible = useSubscribe(config.visible ?? true);
  const rawUsers = useSubscribe(config.users ?? []);

  if (visible === false) return null;

  const users = Array.isArray(rawUsers)
    ? (rawUsers as { name: string; avatar?: string }[])
    : [];

  if (users.length === 0) return null;

  const maxDisplay = config.maxDisplay ?? 3;
  const displayUsers = users.slice(0, maxDisplay);
  const remaining = users.length - maxDisplay;

  let text: string;
  if (displayUsers.length === 1) {
    text = `${displayUsers[0]!.name} is typing`;
  } else if (displayUsers.length === 2) {
    text = `${displayUsers[0]!.name} and ${displayUsers[1]!.name} are typing`;
  } else if (remaining > 0) {
    const names = displayUsers.map((u) => u.name).join(", ");
    text = `${names} and ${remaining} other${remaining > 1 ? "s" : ""} are typing`;
  } else {
    const allButLast = displayUsers.slice(0, -1).map((u) => u.name).join(", ");
    text = `${allButLast} and ${displayUsers[displayUsers.length - 1]!.name} are typing`;
  }

  return (
    <div
      data-snapshot-component="typing-indicator"
      data-testid="typing-indicator"
      className={config.className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--sn-spacing-xs, 0.25rem)",
        padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
      }}
    >
      {/* Inject keyframes */}
      <style>{BOUNCE_KEYFRAMES}</style>

      {/* Bouncing dots */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "2px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: "var(--sn-radius-full, 9999px)",
              backgroundColor: "var(--sn-color-muted-foreground, #6b7280)",
              display: "inline-block",
              animation: "sn-typing-bounce 1.2s infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </span>

      {/* Text */}
      <span
        data-testid="typing-text"
        style={{
          fontSize: "var(--sn-font-size-xs, 0.75rem)",
          color: "var(--sn-color-muted-foreground, #6b7280)",
          fontStyle: "italic",
        }}
      >
        {text}
      </span>
    </div>
  );
}
