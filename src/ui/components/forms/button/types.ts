import type {
  CSSProperties,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  PointerEventHandler,
  ReactNode,
  TouchEventHandler,
} from "react";
import type { z } from "zod";
import type { DomRef } from "../../_base/dom-ref";
import type { buttonConfigSchema } from "./schema";

export type ButtonConfig = z.input<typeof buttonConfigSchema>;

export interface ButtonControlProps {
  /** HTML id attribute for the element. */
  id?: string;
  /** Content rendered inside the element. */
  children: ReactNode;
  /** HTML element type attribute. */
  type?: "button" | "submit";
  /** Visual variant. */
  variant?: ButtonConfig["variant"];
  /** Size of the element. */
  size?: ButtonConfig["size"];
  /** Disabled state. */
  disabled?: boolean;
  /** Whether the element spans full width. */
  fullWidth?: boolean;
  /** Click event handler. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Keyboard event handler. */
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  /** Focus event handler. */
  onFocus?: FocusEventHandler<HTMLButtonElement>;
  /** Blur event handler. */
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  /** Pointer event handler. */
  onPointerDown?: PointerEventHandler<HTMLButtonElement>;
  /** Pointer event handler. */
  onPointerUp?: PointerEventHandler<HTMLButtonElement>;
  /** Pointer event handler. */
  onPointerEnter?: PointerEventHandler<HTMLButtonElement>;
  /** Pointer event handler. */
  onPointerLeave?: PointerEventHandler<HTMLButtonElement>;
  /** Touch event handler. */
  onTouchStart?: TouchEventHandler<HTMLButtonElement>;
  /** Touch event handler. */
  onTouchEnd?: TouchEventHandler<HTMLButtonElement>;
  /** CSS class name applied to the element. */
  className?: string;
  /** Inline styles applied to the element. */
  style?: CSSProperties;
  /** Ref callback for the underlying element. */
  buttonRef?: DomRef<HTMLButtonElement>;
  /** Surface ID for style scoping. */
  surfaceId?: string;
  /** Component-level surface style overrides. */
  surfaceConfig?: Record<string, unknown>;
  /** Item-level surface style overrides. */
  itemSurfaceConfig?: Record<string, unknown>;
  /** Test ID for the element. */
  testId?: string;
  /** Accessible label. */
  ariaLabel?: string;
  /** ID of the element that describes this element. */
  ariaDescribedBy?: string;
  /** Live region politeness level. */
  ariaLive?: "off" | "polite" | "assertive";
  /** Toggle button pressed state. */
  ariaPressed?: boolean;
  /** Checkbox/switch checked state. */
  ariaChecked?: boolean;
  /** Current item indicator for navigation. */
  ariaCurrent?: "page" | "step" | "location" | "date" | "time" | true;
  /** Selection state. */
  ariaSelected?: boolean;
  /** Expanded/collapsed state. */
  ariaExpanded?: boolean;
  /** Popup type indicator. */
  ariaHasPopup?: boolean | "menu" | "listbox" | "tree" | "grid" | "dialog";
  /** ARIA role override. */
  role?: string;
  /** Tab order. */
  tabIndex?: number;
  /** Tooltip text. */
  title?: string;
  /** Active interaction/state flags for surface styling. */
  activeStates?: Array<
    | "hover"
    | "focus"
    | "open"
    | "selected"
    | "current"
    | "active"
    | "completed"
    | "invalid"
    | "disabled"
  >;
}
