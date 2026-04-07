import { useEffect, useRef } from "react";
import { useModalManager } from "../../../actions/modal-manager";
import { useSubscribe } from "../../../context/hooks";
import type { DrawerConfig } from "./schema";
import type { UseDrawerReturn } from "./types";

/**
 * Hook that manages drawer state for a given drawer config.
 * Reads open/close state from the modal manager, resolves the title FromRef,
 * and handles the trigger auto-open behavior.
 *
 * @param config - The drawer config from the manifest
 * @returns Drawer state and controls
 */
export function useDrawer(config: DrawerConfig): UseDrawerReturn {
  const { open, close, isOpen } = useModalManager();
  const id = config.id ?? "";
  const currentlyOpen = isOpen(id);

  // Resolve title from ref or static value
  const resolvedTitle = useSubscribe(config.title) as string | undefined;

  // Resolve trigger from ref
  const triggerValue = useSubscribe(config.trigger);

  // Track previous trigger value to detect truthy transitions
  const prevTriggerRef = useRef<unknown>(undefined);

  useEffect(() => {
    if (config.trigger === undefined) return;

    const prev = prevTriggerRef.current;
    prevTriggerRef.current = triggerValue;

    // Auto-open when trigger becomes truthy
    if (triggerValue && !prev) {
      open(id);
    }
    // Auto-close when trigger becomes falsy
    if (!triggerValue && prev) {
      close(id);
    }
  }, [triggerValue, config.trigger, id, open, close]);

  return {
    isOpen: currentlyOpen,
    open: () => open(id),
    close: () => close(id),
    title: resolvedTitle,
  };
}
