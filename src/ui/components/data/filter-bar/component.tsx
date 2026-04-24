'use client';

import { useCallback, useMemo } from "react";
import { useActionExecutor } from "../../../actions/executor";
import { usePublish, useResolveFrom, useSubscribe } from "../../../context/hooks";
import { extractSurfaceConfig } from "../../_base/style-surfaces";
import type { FilterBarConfig } from "./types";
import { FilterBarBase, type FilterBarFilter } from "./standalone";

export function FilterBar({ config }: { config: FilterBarConfig }) {
  const execute = useActionExecutor();
  const publish = usePublish(config.id);
  const visible = useSubscribe(config.visible ?? true);
  const searchPlaceholder = useSubscribe(config.searchPlaceholder) as
    | string
    | undefined;
  const resolvedConfig = useResolveFrom({ filters: config.filters });

  const filters: FilterBarFilter[] = useMemo(
    () =>
      ((resolvedConfig.filters as FilterBarConfig["filters"] | undefined) ??
        config.filters ??
        []
      ).map((filter) => ({
        key: filter.key,
        label: typeof filter.label === "string" ? filter.label : "",
        multiple: filter.multiple,
        options: filter.options.map((option) => ({
          label: typeof option.label === "string" ? option.label : "",
          value: option.value,
        })),
      })),
    [config.filters, resolvedConfig.filters],
  );

  const handleChange = useCallback(
    (state: { search: string; filters: Record<string, string | string[]> }) => {
      publish?.({ search: state.search, filters: state.filters });
      if (config.changeAction) {
        void execute(config.changeAction, {
          search: state.search,
          filters: state.filters,
        });
      }
    },
    [config.changeAction, execute, publish],
  );

  if (visible === false) {
    return null;
  }

  const surface = extractSurfaceConfig(config);

  return (
    <FilterBarBase
      id={config.id}
      filters={filters}
      showSearch={config.showSearch !== false}
      searchPlaceholder={searchPlaceholder ?? undefined}
      onChange={handleChange}
      className={surface?.className as string | undefined}
      style={surface?.style as React.CSSProperties | undefined}
      slots={config.slots}
    />
  );
}
