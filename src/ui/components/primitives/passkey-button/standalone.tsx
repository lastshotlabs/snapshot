'use client';

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import { ButtonControl } from "../../forms/button";

// ── Standalone Props ─────────────────────────────────────────────────────────

export interface PasskeyButtonBaseProps {
  /** Pre-resolved label text. */
  label?: string;
  /** Loading label shown while passkey auth is in progress. */
  loadingLabel?: string;
  /** Whether the button is in a loading state. */
  loading?: boolean;
  /** Whether passkey is supported and enabled (controls rendering). */
  visible?: boolean;
  /** Auto-prompt passkey on mount. */
  autoPrompt?: boolean;
  /** Click handler — should trigger the passkey auth flow. */
  onClick?: () => void | Promise<void>;

  // ── Style / Slot overrides ───────────────────────────────────────────────
  /** Unique identifier for surface scoping. */
  id?: string;
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, label). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * Standalone PasskeyButton — renders a passkey authentication button.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <PasskeyButtonBase label="Sign in with passkey" onClick={() => startPasskey()} />
 * ```
 */
export function PasskeyButtonBase({
  label = "Sign in with passkey",
  loadingLabel = "Preparing passkey...",
  loading = false,
  visible = true,
  autoPrompt = false,
  onClick,
  id,
  className,
  style,
  slots,
}: PasskeyButtonBaseProps) {
  const autoPromptedRef = useRef(false);
  const rootId = id ?? "passkey-button";
  const componentSurface = className || style ? { className, style } : undefined;

  const labelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-label`,
    componentSurface: slots?.label,
  });

  useEffect(() => {
    if (!visible || !autoPrompt || autoPromptedRef.current || loading) {
      return;
    }

    autoPromptedRef.current = true;
    if (onClick) {
      void onClick();
    }
  }, [visible, autoPrompt, loading, onClick]);

  if (!visible) {
    return null;
  }

  return (
    <>
      <ButtonControl
        surfaceId={`${rootId}-root`}
        surfaceConfig={componentSurface}
        itemSurfaceConfig={slots?.root}
        variant="outline"
        size="sm"
        fullWidth
        onClick={onClick ? () => void onClick() : undefined}
        disabled={loading}
        activeStates={loading ? ["active"] : []}
      >
        <span
          data-snapshot-id={`${rootId}-label`}
          className={labelSurface.className}
          style={labelSurface.style}
        >
          {loading ? loadingLabel : label}
        </span>
      </ButtonControl>
      <SurfaceStyles css={labelSurface.scopedCss} />
    </>
  );
}
