"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function canCommitAsyncState() {
  return typeof window !== "undefined";
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function")
    return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export interface UseOverlayAnimationOptions {
  open: boolean;
  duration?: number;
  onOpen?: () => void;
}

export interface OverlayAnimationState {
  mounted: boolean;
  animating: boolean;
}

/**
 * Manages the mount/unmount lifecycle for overlay components with
 * enter/exit transitions.
 *
 * Handles: deferred mount for enter animation, timed unmount for exit,
 * cleanup on component teardown, and `prefers-reduced-motion` (skips
 * the animation delay when the user has opted out of motion).
 */
export function useOverlayAnimation({
  open,
  duration = 200,
  onOpen,
}: UseOverlayAnimationOptions): OverlayAnimationState {
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);
  const previousOpenRef = useRef<boolean | undefined>(undefined);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);

  const clearTimers = useCallback(() => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, [clearTimers]);

  useEffect(() => {
    clearTimers();
    const reducedMotion = prefersReducedMotion();

    if (open) {
      setMounted(true);

      if (reducedMotion) {
        setAnimating(true);
      } else {
        enterTimerRef.current = setTimeout(() => {
          enterTimerRef.current = null;
          if (mountedRef.current && canCommitAsyncState()) {
            setAnimating(true);
          }
        }, 10);
      }
      return clearTimers;
    }

    if (mounted) {
      setAnimating(false);

      if (reducedMotion) {
        setMounted(false);
      } else {
        exitTimerRef.current = setTimeout(() => {
          exitTimerRef.current = null;
          if (mountedRef.current && canCommitAsyncState()) {
            setMounted(false);
          }
        }, duration);
      }
      return clearTimers;
    }
  }, [clearTimers, duration, mounted, open]);

  useEffect(() => {
    const previousOpen = previousOpenRef.current;
    previousOpenRef.current = open;
    if (open && previousOpen !== true) {
      onOpenRef.current?.();
    }
  }, [open]);

  return { mounted, animating };
}
