'use client';

import type { CSSProperties } from "react";
import { useSubscribe } from "../../../context/hooks";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
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
export function TypingIndicator({ config }: { config: TypingIndicatorConfig }) {
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
    const allButLast = displayUsers
      .slice(0, -1)
      .map((u) => u.name)
      .join(", ");
    text = `${allButLast} and ${displayUsers[displayUsers.length - 1]!.name} are typing`;
  }

  const rootId = config.id ?? "typing-indicator";
  const rootSurface = resolveSurfacePresentation({
    surfaceId: rootId,
    implementationBase: {
      display: "flex",
      alignItems: "center",
      gap: "var(--sn-spacing-xs, 0.25rem)",
      padding: "var(--sn-spacing-xs, 0.25rem) var(--sn-spacing-sm, 0.5rem)",
      style: {
        transition:
          "opacity var(--sn-duration-normal, 250ms) var(--sn-ease-default, ease)",
      },
    },
    componentSurface: config,
    itemSurface: config.slots?.root,
  });
  const dotsSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dots`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--sn-spacing-2xs, 2px)",
    },
    componentSurface: config.slots?.dots,
  });
  const dotSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-dot`,
    implementationBase: {
      display: "inline-block",
      style: {
        width: 5,
        height: 5,
        borderRadius: "var(--sn-radius-full, 9999px)",
        backgroundColor: "var(--sn-color-muted-foreground, #6b7280)",
      },
    },
    componentSurface: config.slots?.dot,
  });
  const textSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-text`,
    implementationBase: {
      style: {
        fontSize: "var(--sn-font-size-sm, 0.875rem)",
        color: "var(--sn-color-muted-foreground, #6b7280)",
        fontStyle: "italic",
      },
    },
    componentSurface: config.slots?.text,
  });

  return (
    <div
      data-snapshot-component="typing-indicator"
      data-snapshot-id={rootId}
      data-testid="typing-indicator"
      role="status"
      aria-live="polite"
      className={[config.className, rootSurface.className].filter(Boolean).join(" ") || undefined}
      style={{
        ...(rootSurface.style ?? {}),
        ...((config.style as CSSProperties | undefined) ?? {}),
      }}
    >
      <span
        data-snapshot-id={`${rootId}-dots`}
        className={dotsSurface.className}
        style={dotsSurface.style}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            data-snapshot-id={`${rootId}-dot`}
            className={dotSurface.className}
            style={{
              width: 5,
              height: 5,
              ...(dotSurface.style ?? {}),
              animation: "sn-typing-bounce 1.2s infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </span>
      <span
        data-snapshot-id={`${rootId}-text`}
        data-testid="typing-text"
        className={textSurface.className}
        style={textSurface.style}
      >
        {text}
      </span>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={dotsSurface.scopedCss} />
      <SurfaceStyles css={dotSurface.scopedCss} />
      <SurfaceStyles css={textSurface.scopedCss} />
      <SurfaceStyles css={BOUNCE_KEYFRAMES} />
    </div>
  );
}
