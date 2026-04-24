'use client';

import { useMemo } from "react";
import { useSubscribe } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import { useComponentData } from "../../_base/use-component-data";
import type { AvatarGroupConfig } from "./types";
import { AvatarGroupBase } from "./standalone";

export function AvatarGroup({ config }: { config: AvatarGroupConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const dataResult = useComponentData(config.data ?? "");

  const nameField = config.nameField ?? "name";
  const srcField = config.srcField ?? "avatar";

  const avatars = useMemo(() => {
    if (config.avatars) {
      return config.avatars;
    }
    if (!dataResult.data) return [];
    const items = Array.isArray(dataResult.data)
      ? dataResult.data
      : ((dataResult.data as Record<string, unknown>).data ??
        (dataResult.data as Record<string, unknown>).items ??
        []);
    if (!Array.isArray(items)) return [];
    return items.map((item: Record<string, unknown>) => ({
      name: String(item[nameField] ?? ""),
      src: item[srcField] ? String(item[srcField]) : undefined,
    }));
  }, [config.avatars, dataResult.data, nameField, srcField]);

  if (visible === false) return null;

  const surface = extractSurfaceConfig(config);

  return (
    <AvatarGroupBase
      id={config.id}
      avatars={avatars}
      size={config.size}
      max={config.max}
      overlap={config.overlap}
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
