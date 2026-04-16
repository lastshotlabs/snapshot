/**
 * Return type for the useDrawer hook.
 */
export interface UseDrawerReturn {
    /** Whether the drawer is currently open. */
    isOpen: boolean;
    /** Open the drawer. */
    open: () => void;
    /** Close the drawer. */
    close: () => void;
    /** Current overlay payload. */
    payload: unknown;
    /** Most recent overlay close result. */
    result: unknown;
}
