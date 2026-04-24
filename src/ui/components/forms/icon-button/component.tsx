"use client";

import type { CSSProperties } from "react";
import { useSubscribe } from "../../../context/index";
import { useActionExecutor } from "../../../actions/executor";
import { IconButtonBase } from "./standalone";
import type { IconButtonConfig } from "./types";

export function IconButton({ config }: { config: IconButtonConfig }) {
  const execute = useActionExecutor();
  const resolvedDisabled = useSubscribe(
    typeof config.disabled === "object" && "from" in config.disabled
      ? config.disabled
      : undefined,
  );
  const isDisabled =
    typeof config.disabled === "boolean"
      ? config.disabled
      : typeof resolvedDisabled === "boolean"
        ? resolvedDisabled
        : false;

  return (
    <IconButtonBase
      id={config.id}
      icon={config.icon}
      ariaLabel={config.ariaLabel}
      variant={config.variant ?? "ghost"}
      size={config.size ?? "md"}
      shape={config.shape}
      tooltip={config.tooltip}
      disabled={isDisabled}
      onClick={() => {
        if (config.action) {
          void execute(config.action as Parameters<typeof execute>[0]);
        }
      }}
      className={config.className}
      style={config.style as CSSProperties}
      slots={config.slots as Record<string, Record<string, unknown>>}
    />
  );
}
