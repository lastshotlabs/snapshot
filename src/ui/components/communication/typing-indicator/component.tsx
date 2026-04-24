'use client';

import { useSubscribe } from "../../../context/hooks";
import { TypingIndicatorBase } from "./standalone";
import type { TypingIndicatorConfig } from "./types";

/**
 * Manifest adapter — resolves config refs and delegates to TypingIndicatorBase.
 */
export function TypingIndicator({ config }: { config: TypingIndicatorConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const rawUsers = useSubscribe(config.users ?? []);

  if (visible === false) return null;

  const users = Array.isArray(rawUsers)
    ? (rawUsers as { name: string; avatar?: string }[])
    : [];

  return (
    <TypingIndicatorBase
      id={config.id}
      users={users}
      maxDisplay={config.maxDisplay}
      className={config.className}
      style={config.style}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
