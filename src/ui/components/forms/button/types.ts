import type {
  CSSProperties,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  PointerEventHandler,
  ReactNode,
} from "react";
import type { z } from "zod";
import type { DomRef } from "../../_base/dom-ref";
import type { buttonConfigSchema } from "./schema";

export type ButtonConfig = z.input<typeof buttonConfigSchema>;

export interface ButtonControlProps {
  children: ReactNode;
  type?: "button" | "submit";
  variant?: ButtonConfig["variant"];
  size?: ButtonConfig["size"];
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  onFocus?: FocusEventHandler<HTMLButtonElement>;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  onPointerEnter?: PointerEventHandler<HTMLButtonElement>;
  onPointerLeave?: PointerEventHandler<HTMLButtonElement>;
  className?: string;
  style?: CSSProperties;
  buttonRef?: DomRef<HTMLButtonElement>;
  surfaceId?: string;
  surfaceConfig?: Record<string, unknown>;
  itemSurfaceConfig?: Record<string, unknown>;
  testId?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaLive?: "off" | "polite" | "assertive";
  ariaPressed?: boolean;
  ariaChecked?: boolean;
  ariaCurrent?: "page" | "step" | "location" | "date" | "time" | true;
  ariaSelected?: boolean;
  ariaExpanded?: boolean;
  ariaHasPopup?: boolean | "menu" | "listbox" | "tree" | "grid" | "dialog";
  role?: string;
  tabIndex?: number;
  title?: string;
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
