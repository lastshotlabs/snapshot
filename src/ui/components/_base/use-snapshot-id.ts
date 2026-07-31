"use client";

import { useId } from "react";

export function useSnapshotId(
  id: string | undefined,
  fallback: string,
): string {
  const reactId = useId().replace(/:/g, "");
  return id ?? `${fallback}-${reactId}`;
}
