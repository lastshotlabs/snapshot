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
import type { RuntimeSurfaceState } from "../../_base/style-surfaces";
import type { selectConfigSchema } from "./schema";

export type SelectConfig = z.input<typeof selectConfigSchema>;

export interface SelectControlProps {
  /** Ref callback for the underlying element. */
  selectRef?: DomRef<HTMLSelectElement>;
  /** HTML id attribute for the select element. */
  selectId?: string;
  /** Form field name. */
  name?: string;
  /** Current selected value. */
  value: string;
  /** Disabled state. */
  disabled?: boolean;
  /** Whether the field is required. */
  required?: boolean;
  /** Whether the field value is invalid. */
  ariaInvalid?: boolean;
  /** ID of the element that describes this element. */
  ariaDescribedBy?: string;
  /** Accessible label. */
  ariaLabel?: string;
  /** Called with the new selected value on change. */
  onChangeValue?: (value: string) => void;
  /** Blur event handler. */
  onBlur?: FocusEventHandler<HTMLSelectElement>;
  /** Focus event handler. */
  onFocus?: FocusEventHandler<HTMLSelectElement>;
  /** Click event handler. */
  onClick?: MouseEventHandler<HTMLSelectElement>;
  /** Keyboard event handler. */
  onKeyDown?: KeyboardEventHandler<HTMLSelectElement>;
  /** Mouse event handler. */
  onMouseEnter?: MouseEventHandler<HTMLSelectElement>;
  /** Mouse event handler. */
  onMouseLeave?: MouseEventHandler<HTMLSelectElement>;
  /** Pointer event handler. */
  onPointerDown?: PointerEventHandler<HTMLSelectElement>;
  /** Pointer event handler. */
  onPointerUp?: PointerEventHandler<HTMLSelectElement>;
  /** Touch event handler. */
  onTouchStart?: TouchEventHandler<HTMLSelectElement>;
  /** Touch event handler. */
  onTouchEnd?: TouchEventHandler<HTMLSelectElement>;
  /** CSS class name applied to the element. */
  className?: string;
  /** Inline styles applied to the element. */
  style?: CSSProperties;
  /** Surface ID for style scoping. */
  surfaceId?: string;
  /** Component-level surface style overrides. */
  surfaceConfig?: Record<string, unknown>;
  /** Item-level surface style overrides. */
  itemSurfaceConfig?: Record<string, unknown>;
  /** Active interaction/state flags for surface styling. */
  activeStates?: RuntimeSurfaceState[];
  /** Test ID for the element. */
  testId?: string;
  /** Content rendered inside the element. */
  children: ReactNode;
}
