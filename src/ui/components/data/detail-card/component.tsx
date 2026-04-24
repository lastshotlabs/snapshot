'use client';

import { useCallback, useMemo } from "react";
import { useActionExecutor } from "../../../actions/executor";
import type { ActionConfig } from "../../../actions/types";
import { useResolveFrom, useSubscribe } from "../../../context/hooks";
import { AutoSkeleton } from "../../_base/auto-skeleton";
import { ComponentWrapper } from "../../_base/component-wrapper";
import { useDetailCard } from "./hook";
import type { DetailCardConfig } from "./schema";
import { resolveLookupValue, useLookupMaps } from "../_shared/lookups";
import { DetailCardBase, type DetailCardBaseField, type DetailCardBaseAction } from "./standalone";

export function DetailCard({ config }: { config: DetailCardConfig }) {
  const { data, fields, title, isLoading, error } = useDetailCard(config);
  const execute = useActionExecutor();
  const emptyStateMessage = useSubscribe(config.emptyState) as string | undefined;
  const resolvedStaticConfig = useResolveFrom({
    actions: config.actions,
    empty: config.empty,
  });

  const actions: DetailCardBaseAction[] = useMemo(
    () =>
      ((resolvedStaticConfig.actions as DetailCardConfig["actions"] | undefined) ??
        config.actions ??
        []
      ).map((actionDef: NonNullable<DetailCardConfig["actions"]>[number]) => ({
        label: typeof actionDef.label === "string" ? actionDef.label : "",
        icon: typeof actionDef.icon === "string" ? actionDef.icon : undefined,
        onAction: () => {
          void execute(actionDef.action as ActionConfig | ActionConfig[], data ? { ...data } : {});
        },
        slots: actionDef.slots,
      })),
    [config.actions, resolvedStaticConfig.actions, execute, data],
  );

  const lookupMaps = useLookupMaps(
    fields
      .filter((field) => field.lookup)
      .map((field) => ({
        key: field.field,
        lookup: field.lookup!,
      })),
  );

  const displayFields: DetailCardBaseField[] = useMemo(
    () =>
      fields.map((field) => ({
        field: field.field,
        label: field.label,
        value: resolveLookupValue(field.value, field.lookup, lookupMaps),
        format: field.format,
        copyable: field.copyable,
        divisor: field.divisor,
        slots: field.slots as Record<string, Record<string, unknown>> | undefined,
      })),
    [fields, lookupMaps],
  );

  const emptyMessage =
    (typeof (resolvedStaticConfig.empty as Record<string, unknown> | undefined)?.title === "string"
      ? (resolvedStaticConfig.empty as Record<string, unknown>).title as string
      : undefined) ??
    emptyStateMessage ??
    "Select an item to view details";

  return (
    <ComponentWrapper type="detail-card" id={config.id} config={config}>
      <DetailCardBase
        id={config.id}
        data={data}
        fields={displayFields}
        title={title}
        actions={actions}
        isLoading={isLoading}
        error={error ? String(error) : undefined}
        emptyMessage={emptyMessage}
        loadingContent={
          config.loading && !config.loading.disabled ? (
            <AutoSkeleton componentType="card" config={config.loading} />
          ) : undefined
        }
        slots={config.slots}
      />
    </ComponentWrapper>
  );
}
