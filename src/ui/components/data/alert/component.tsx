'use client';

import { useResolveFrom, useSubscribe, usePublish } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import type { AlertConfig } from "./types";
import { AlertBase } from "./standalone";

export function Alert({ config }: { config: AlertConfig }) {
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    title: config.title ?? "",
    description: config.description,
    actionLabel: config.actionLabel,
  });
  const resolvedTitle =
    resolveOptionalPrimitiveValue(resolvedConfig.title, primitiveOptions) ?? "";
  const resolvedDescription =
    resolveOptionalPrimitiveValue(resolvedConfig.description, primitiveOptions) ?? "";
  const resolvedActionLabel = resolveOptionalPrimitiveValue(
    resolvedConfig.actionLabel,
    primitiveOptions,
  );
  const visible = useSubscribe(config.visible ?? true);
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  if (visible === false) {
    return null;
  }

  const surface = extractSurfaceConfig(config);

  return (
    <AlertBase
      id={config.id}
      title={resolvedTitle}
      description={resolvedDescription}
      variant={config.variant}
      icon={config.icon}
      dismissible={config.dismissible}
      actionLabel={resolvedActionLabel ?? undefined}
      onAction={
        config.action
          ? () => {
              void execute(config.action!);
              publish?.({ action: true });
            }
          : undefined
      }
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
