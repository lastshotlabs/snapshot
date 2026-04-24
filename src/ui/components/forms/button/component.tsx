'use client';

import type { CSSProperties } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe } from "../../../context/hooks";
import { ButtonBase } from "./standalone";
import type { ButtonConfig } from "./types";

// Re-export ButtonControl from its standalone module for backwards compatibility
export { ButtonControl } from "./control";

export function Button({ config }: { config: ButtonConfig }) {
  const execute = useActionExecutor();
  const visible = useSubscribe(config.visible ?? true);
  const disabled = useSubscribe(config.disabled ?? false) as boolean;
  const resolvedLabel = useSubscribe(
    typeof config.label === "object" && config.label !== null && "from" in config.label
      ? config.label
      : undefined,
  );

  if (visible === false) {
    return null;
  }

  const action = config.action;
  const label =
    typeof config.label === "string"
      ? config.label
      : typeof resolvedLabel === "string"
        ? resolvedLabel
        : "";

  return (
    <ButtonBase
      id={config.id}
      label={label}
      icon={config.icon}
      variant={config.variant ?? "default"}
      size={config.size ?? "md"}
      disabled={disabled}
      fullWidth={config.fullWidth}
      onClick={() => {
        if (disabled || !action) {
          return;
        }
        void execute(action as Parameters<typeof execute>[0]);
      }}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
