"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(", ");

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true",
  );
}

export function useFocusTrap(
  active: boolean,
  rootRef: RefObject<HTMLElement | null>,
  options?: {
    initialFocus?: string;
    returnFocus?: boolean;
  },
): void {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || typeof document === "undefined") {
      return;
    }

    const root = rootRef.current;
    if (!root) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusInitialElement = () => {
      if (options?.initialFocus) {
        const target = root.querySelector<HTMLElement>(options.initialFocus);
        if (target) {
          target.focus();
          return;
        }
      }

      const focusable = getFocusableElements(root);
      if (focusable.length > 0) {
        focusable[0]?.focus();
        return;
      }

      root.focus();
    };

    focusInitialElement();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(root);
      if (focusable.length === 0) {
        event.preventDefault();
        root.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || root.contains(target)) {
        return;
      }

      focusInitialElement();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);

      if (options?.returnFocus !== false) {
        previousFocusRef.current?.focus?.();
      }
    };
  }, [active, options?.initialFocus, options?.returnFocus, rootRef]);
}
