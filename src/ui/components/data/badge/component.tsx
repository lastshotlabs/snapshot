'use client';

import { useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import type { BadgeConfig } from "./types";
import { BadgeBase } from "./standalone";

export function Badge({ config }: { config: BadgeConfig }) {
  const resolvedText = useSubscribe(config.text) as string;
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);

  useEffect(() => {
    if (publish && resolvedText) {
      publish({ text: resolvedText });
    }
  }, [publish, resolvedText]);

  if (visible === false) {
    return null;
  }

  const surface = extractSurfaceConfig(config, { omit: ["color"] });

  return (
    <BadgeBase
      id={config.id}
      text={resolvedText}
      color={config.color}
      variant={config.variant}
      size={config.size}
      rounded={config.rounded}
      icon={config.icon}
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
