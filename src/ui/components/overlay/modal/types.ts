import type { ModalConfig } from "./schema";

/**
 * Return type for the useModal hook.
 */
export interface UseModalReturn {
  /** Whether the modal is currently open. */
  isOpen: boolean;
  /** Open the modal. */
  open: () => void;
  /** Close the modal. */
  close: () => void;
  /** Resolved title string (FromRef resolved to value). */
  title: string | undefined;
}

/**
 * Props for the Modal component.
 */
export interface ModalProps {
  config: ModalConfig;
}
