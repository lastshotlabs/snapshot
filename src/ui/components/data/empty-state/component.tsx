'use client';

import { useResolveFrom, useSubscribe } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import type { EmptyStateConfig } from "./types";
import { EmptyStateBase } from "./standalone";

export function EmptyState({ config }: { config: EmptyStateConfig }) {
  const execute = useActionExecutor();
  const visible = useSubscribe(config.visible ?? true);
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    title: config.title,
    description: config.description,
    actionLabel: config.actionLabel,
  });
  const title = resolveOptionalPrimitiveValue(
    resolvedConfig.title,
    primitiveOptions,
  );
  const description = resolveOptionalPrimitiveValue(
    resolvedConfig.description,
    primitiveOptions,
  );
  const actionLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.actionLabel,
    primitiveOptions,
  );

  if (visible === false) {
    return null;
  }

  const surface = extractSurfaceConfig(config);

  return (
    <EmptyStateBase
      id={config.id}
      title={title ?? ""}
      description={description ?? undefined}
      icon={config.icon}
      iconColor={config.iconColor}
      size={config.size}
      actionLabel={actionLabel ?? undefined}
      onAction={
        config.action ? () => void execute(config.action!) : undefined
      }
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
