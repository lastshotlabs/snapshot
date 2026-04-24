'use client';

import type { CSSProperties } from "react";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { useActionExecutor } from "../../../actions/executor";
import { executeEventAction } from "../../_base/events";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { QuickAddField } from "./standalone";
import type { QuickAddConfig } from "./types";

export function QuickAdd({ config }: { config: QuickAddConfig }) {
  const visible = useSubscribe(config.visible ?? true);
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({
    placeholder: config.placeholder,
    buttonText: config.buttonText,
  });
  const resolvedPlaceholder = resolveOptionalPrimitiveValue(
    resolvedConfig.placeholder,
    primitiveOptions,
  );
  const resolvedButtonText = resolveOptionalPrimitiveValue(
    resolvedConfig.buttonText,
    primitiveOptions,
  );
  const execute = useActionExecutor();
  const publish = usePublish(config.id);

  if (visible === false) {
    return null;
  }

  const surfaceConfig = extractSurfaceConfig(config);

  return (
    <QuickAddField
      id={config.id}
      placeholder={resolvedPlaceholder}
      icon={config.icon}
      submitOnEnter={config.submitOnEnter}
      showButton={config.showButton}
      buttonText={resolvedButtonText}
      clearOnSubmit={config.clearOnSubmit}
      onSubmit={(value) => {
        publish?.({ value });
        void executeEventAction(execute, config.on?.submit, {
          id: config.id,
          value,
        });
      }}
      className={surfaceConfig?.className as string | undefined}
      style={surfaceConfig?.style as CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
