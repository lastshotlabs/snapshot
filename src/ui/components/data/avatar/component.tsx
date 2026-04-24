'use client';

import { useEffect } from "react";
import { useSubscribe, usePublish } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import type { AvatarConfig } from "./types";
import { AvatarBase } from "./standalone";

export function Avatar({ config }: { config: AvatarConfig }) {
  const resolvedSrc = useSubscribe(config.src ?? "") as string;
  const resolvedName = useSubscribe(config.name ?? "") as string;
  const visible = useSubscribe(config.visible ?? true);
  const publish = usePublish(config.id);

  useEffect(() => {
    if (publish) {
      publish({ name: resolvedName, src: resolvedSrc });
    }
  }, [publish, resolvedName, resolvedSrc]);

  if (visible === false) return null;

  const surface = extractSurfaceConfig(config, { omit: ["color"] });

  return (
    <AvatarBase
      id={config.id}
      src={resolvedSrc}
      name={resolvedName}
      alt={config.alt}
      size={config.size}
      shape={config.shape}
      color={config.color}
      icon={config.icon}
      status={config.status}
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
