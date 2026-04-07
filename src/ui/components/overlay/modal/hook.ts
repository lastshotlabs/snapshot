import { useEffect, useRef } from "react";
import { useModalManager } from "../../../actions/modal-manager";
import { useSubscribe } from "../../../context/hooks";
import type { ModalConfig } from "./schema";
import type { UseModalReturn } from "./types";

/**
 * Hook that manages modal state for a given modal config.
 * Reads open/close state from the modal manager, resolves the title FromRef,
 * and handles the trigger auto-open behavior.
 *
 * @param config - The modal config from the manifest
 * @returns Modal state and controls
 */
export function useModal(config: ModalConfig): UseModalReturn {
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
