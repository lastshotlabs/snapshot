"use client";

import { useEffect } from "react";
import { usePublish, useResolveFrom } from "../../../context/index";
import { useActionExecutor } from "../../../actions/executor";
import {
  resolveOptionalPrimitiveValue,
  usePrimitiveValueOptions,
} from "../../primitives/resolve-value";
import { NavSearchBase } from "./standalone";
import type { NavSearchConfig } from "./types";

export function NavSearch({ config }: { config: NavSearchConfig }) {
  const publish = usePublish(config.publishTo);
  const primitiveOptions = usePrimitiveValueOptions();
  const resolvedConfig = useResolveFrom({ placeholder: config.placeholder });
  const resolvedPlaceholder = resolveOptionalPrimitiveValue(
    resolvedConfig.placeholder,
    primitiveOptions,
  );
  const execute = useActionExecutor();

  const handleSearch = (value: string) => {
    if (config.onSearch) {
      void execute(config.onSearch as Parameters<typeof execute>[0]);
    }
  };

  const handleValueChange = (value: string) => {
    if (config.publishTo) publish(value);
  };

  return (
    <NavSearchBase
      id={config.id}
      placeholder={resolvedPlaceholder ?? "Search..."}
      shortcut={config.shortcut}
      onSearch={handleSearch}
      onValueChange={handleValueChange}
      className={config.className}
      style={config.style}
      slots={config.slots}
    />
  );
}
