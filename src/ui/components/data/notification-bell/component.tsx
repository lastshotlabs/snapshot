'use client';

import { useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import type { NotificationBellConfig } from "./types";
import { NotificationBellBase } from "./standalone";

export function NotificationBell({
  config,
}: {
  config: NotificationBellConfig;
}) {
  const resolvedCount = useSubscribe(config.count ?? 0) as number;
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  useEffect(() => {
    if (publish) {
      publish({ count: resolvedCount });
    }
  }, [publish, resolvedCount]);

  if (visible === false) return null;

  const surface = extractSurfaceConfig(config);

  return (
    <NotificationBellBase
      id={config.id}
      count={resolvedCount}
      size={config.size}
      max={config.max}
      ariaLive={config.ariaLive}
      onClick={() => {
        if (config.clickAction) {
          void execute(config.clickAction as Parameters<typeof execute>[0]);
        }
      }}
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
