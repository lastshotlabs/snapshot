import { type RefObject } from "react";
export declare function useFocusTrap(active: boolean, rootRef: RefObject<HTMLElement | null>, options?: {
    initialFocus?: string;
    returnFocus?: boolean;
}): void;
