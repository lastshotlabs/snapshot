'use client';

import { useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import type { FavoriteButtonConfig } from "./types";
import { FavoriteButtonBase } from "./standalone";

export function FavoriteButton({ config }: { config: FavoriteButtonConfig }) {
  const resolvedActive = useSubscribe(config.active ?? false) as boolean;
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  if (visible === false) {
    return null;
  }

  const surface = extractSurfaceConfig(config);

  return (
    <FavoriteButtonBase
      id={config.id}
      active={resolvedActive}
      size={config.size}
      onToggle={(next) => {
        publish?.({ active: next });
        if (config.toggleAction) {
          void execute(config.toggleAction as Parameters<typeof execute>[0]);
        }
      }}
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
