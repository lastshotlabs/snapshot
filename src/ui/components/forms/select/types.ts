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
  selectRef?: DomRef<HTMLSelectElement>;
  selectId?: string;
  name?: string;
  value: string;
  disabled?: boolean;
  required?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  ariaLabel?: string;
  onChangeValue?: (value: string) => void;
  onBlur?: FocusEventHandler<HTMLSelectElement>;
  onFocus?: FocusEventHandler<HTMLSelectElement>;
  onClick?: MouseEventHandler<HTMLSelectElement>;
  onKeyDown?: KeyboardEventHandler<HTMLSelectElement>;
  onMouseEnter?: MouseEventHandler<HTMLSelectElement>;
  onMouseLeave?: MouseEventHandler<HTMLSelectElement>;
  onPointerDown?: PointerEventHandler<HTMLSelectElement>;
  onPointerUp?: PointerEventHandler<HTMLSelectElement>;
  onTouchStart?: TouchEventHandler<HTMLSelectElement>;
  onTouchEnd?: TouchEventHandler<HTMLSelectElement>;
  className?: string;
  style?: CSSProperties;
  surfaceId?: string;
  surfaceConfig?: Record<string, unknown>;
  itemSurfaceConfig?: Record<string, unknown>;
  activeStates?: RuntimeSurfaceState[];
  testId?: string;
  children: ReactNode;
}
