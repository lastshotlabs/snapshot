'use client';

import { useActionExecutor } from "../../../actions/executor";
import { useSubscribe } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import type { VoteConfig } from "./types";
import { VoteBase } from "./standalone";

export function Vote({ config }: { config: VoteConfig }) {
  const execute = useActionExecutor();
  const resolvedValue = useSubscribe(config.value ?? 0);
  const value = typeof resolvedValue === "number" ? resolvedValue : 0;

  const surface = extractSurfaceConfig(config);

  return (
    <VoteBase
      id={config.id}
      value={value}
      onUpvote={
        config.upAction ? () => void execute(config.upAction!) : undefined
      }
      onDownvote={
        config.downAction ? () => void execute(config.downAction!) : undefined
      }
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
