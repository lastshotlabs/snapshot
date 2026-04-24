'use client';

import { useRef, useState, type CSSProperties } from "react";
import { renderIcon } from "../../../icons/render";
import { ButtonControl } from "../../forms/button";
import { SurfaceStyles } from "../../_base/surface-styles";
import { resolveSurfacePresentation } from "../../_base/style-surfaces";
import {
  FloatingMenuStyles,
  FloatingPanel,
  MenuItem,
} from "../../primitives/floating-menu";

// ── Standalone Props ──────────────────────────────────────────────────────────

export interface NavUserMenuBaseItem {
  /** Menu item label. */
  label: string;
  /** Optional icon name. */
  icon?: string;
  /** Callback fired when the item is clicked. */
  onClick?: () => void;
}

export interface NavUserMenuBaseProps {
  /** Unique identifier for surface scoping. */
  id?: string;
  /** Display mode: "compact" (avatar only) or "full" (avatar + name). Default: "compact". */
  mode?: "compact" | "full";
  /** Whether to show the avatar. Default: true. */
  showAvatar?: boolean;
  /** Whether to show the user name in the trigger (full mode). Default: true. */
  showName?: boolean;
  /** Whether to show the user email in the dropdown. Default: false. */
  showEmail?: boolean;
  /** User display name. */
  userName?: string;
  /** User email address. */
  userEmail?: string;
  /** User avatar URL. */
  userAvatar?: string;
  /** Menu items to render in the dropdown. */
  items?: NavUserMenuBaseItem[];
  /** className applied to the root wrapper. */
  className?: string;
  /** Inline style applied to the root wrapper. */
  style?: CSSProperties;
  /** Slot overrides for sub-elements (root, trigger, triggerLabel, avatar, avatarImage, panel, item, itemLabel, itemIcon, email). */
  slots?: Record<string, Record<string, unknown>>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Standalone NavUserMenu -- a user menu dropdown with avatar trigger.
 * No manifest context required.
 *
 * @example
 * ```tsx
 * <NavUserMenuBase
 *   userName="Jane Doe"
 *   userEmail="jane@example.com"
 *   userAvatar="/avatar.png"
 *   mode="full"
 *   showEmail
 *   items={[
 *     { label: "Profile", icon: "user", onClick: () => router.push("/profile") },
 *     { label: "Sign out", icon: "log-out", onClick: () => signOut() },
 *   ]}
 * />
 * ```
 */
export function NavUserMenuBase({
  id,
  mode = "compact",
  showAvatar = true,
  showName = true,
  showEmail = false,
  userName,
  userEmail,
  userAvatar,
  items = [],
  className,
  style,
  slots,
}: NavUserMenuBaseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rootId = id ?? "nav-user-menu";

  const rootSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-root`,
    implementationBase: {
      position: "relative",
      display: "inline-flex",
    },
    componentSurface: className || style ? { className, style } : undefined,
    itemSurface: slots?.root,
  });
  const avatarSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-avatar`,
    implementationBase: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: "2rem",
      height: "2rem",
      borderRadius: "var(--sn-radius-full, 9999px)",
      overflow: "hidden",
      flexShrink: 0,
      background: "var(--sn-color-muted)",
      color: "var(--sn-color-muted-foreground)",
    },
    componentSurface: slots?.avatar,
  });
  const triggerLabelSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-trigger-label`,
    implementationBase: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    componentSurface: slots?.triggerLabel,
  });
  const avatarImageSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-avatar-image`,
    implementationBase: {
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
      },
    },
    componentSurface: slots?.avatarImage,
  });
  const emailSurface = resolveSurfacePresentation({
    surfaceId: `${rootId}-email`,
    implementationBase: {
      style: {
        padding: "0.5rem 0.75rem",
        fontSize: "0.75rem",
      },
    },
    componentSurface: slots?.email,
  });

  return (
    <div
      ref={containerRef}
      data-snapshot-component="nav-user-menu"
      data-snapshot-id={`${rootId}-root`}
      className={rootSurface.className}
      style={rootSurface.style}
    >
      <FloatingMenuStyles />
      <ButtonControl
        variant="ghost"
        onClick={() => setIsOpen((value) => !value)}
        surfaceId={`${rootId}-trigger`}
        surfaceConfig={slots?.trigger}
        activeStates={isOpen ? ["open"] : []}
      >
        {showAvatar ? (
          <span
            data-snapshot-id={`${rootId}-avatar`}
            className={avatarSurface.className}
            style={avatarSurface.style}
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName ?? "User"}
                data-snapshot-id={`${rootId}-avatar-image`}
                className={avatarImageSurface.className}
                style={avatarImageSurface.style}
              />
            ) : (
              (userName?.charAt(0)?.toUpperCase() ?? "U")
            )}
          </span>
        ) : null}
        {mode === "full" && showName && userName ? (
          <span
            data-snapshot-id={`${rootId}-trigger-label`}
            className={triggerLabelSurface.className}
            style={triggerLabelSurface.style}
          >
            {userName}
          </span>
        ) : null}
      </ButtonControl>

      <FloatingPanel
        open={isOpen}
        onClose={() => setIsOpen(false)}
        containerRef={containerRef}
        align="end"
        surfaceId={`${rootId}-panel`}
        slot={slots?.panel}
      >
        {showEmail && userEmail ? (
          <div
            data-snapshot-id={`${rootId}-email`}
            className={emailSurface.className}
            style={emailSurface.style}
          >
            {userEmail}
          </div>
        ) : null}
        {items.map((item, index) => (
          <MenuItem
            key={`${rootId}-item-${index}`}
            label={item.label}
            icon={item.icon}
            onClick={() => {
              setIsOpen(false);
              item.onClick?.();
            }}
            surfaceId={`${rootId}-item-${index}`}
            slot={slots?.item}
            labelSlot={slots?.itemLabel}
            iconSlot={slots?.itemIcon}
          />
        ))}
      </FloatingPanel>
      <SurfaceStyles css={rootSurface.scopedCss} />
      <SurfaceStyles css={avatarSurface.scopedCss} />
      <SurfaceStyles css={avatarImageSurface.scopedCss} />
      <SurfaceStyles css={emailSurface.scopedCss} />
      <SurfaceStyles css={triggerLabelSurface.scopedCss} />
    </div>
  );
}
