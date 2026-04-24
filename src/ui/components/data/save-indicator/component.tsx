'use client';

import { useSubscribe } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import type { SaveIndicatorConfig } from "./types";
import { SaveIndicatorBase } from "./standalone";

export function SaveIndicator({ config }: { config: SaveIndicatorConfig }) {
  const status = useSubscribe(config.status) as string;
  const visible = useSubscribe(config.visible ?? true);

  if (visible === false) {
    return null;
  }

  const surface = extractSurfaceConfig(config);

  return (
    <SaveIndicatorBase
      id={config.id}
      status={status as "idle" | "saving" | "saved" | "error"}
      showIcon={config.showIcon}
      savingText={config.savingText}
      savedText={config.savedText}
      errorText={config.errorText}
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
