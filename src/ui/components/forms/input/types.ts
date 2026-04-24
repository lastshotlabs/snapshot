import type {
  CSSProperties,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  PointerEventHandler,
  TouchEventHandler,
} from "react";
import type { z } from "zod";
import type { DomRef } from "../../_base/dom-ref";
import type { RuntimeSurfaceState } from "../../_base/style-surfaces";
import type { inputConfigSchema } from "./schema";

/** Inferred config type from the Input Zod schema. */
export type InputConfig = z.input<typeof inputConfigSchema>;

export interface InputControlProps {
  /** Ref callback for the underlying element. */
  inputRef?: DomRef<HTMLInputElement>;
  /** HTML id attribute for the input element. */
  inputId?: string;
  /** Form field name. */
  name?: string;
  /** HTML input type attribute. */
  type?:
    | InputConfig["inputType"]
    | "checkbox"
    | "radio"
    | "date"
    | "time"
    | "datetime-local"
    | "color"
    | "range"
    | "file";
  /** Current input value. */
  value?: string;
  /** Whether the checkbox or radio is checked. */
  checked?: boolean;
  /** Placeholder text shown when the input is empty. */
  placeholder?: string;
  /** Browser autocomplete hint. */
  autoComplete?: string;
  /** Whether the input receives focus on mount. */
  autoFocus?: boolean;
  /** Disabled state. */
  disabled?: boolean;
  /** Whether the input is read-only. */
  readOnly?: boolean;
  /** Accepted file types for file inputs. */
  accept?: string;
  /** Whether multiple files can be selected. */
  multiple?: boolean;
  /** ID of a datalist element for suggestions. */
  list?: string;
  /** Minimum allowed value. */
  min?: string;
  /** Maximum allowed value. */
  max?: string;
  /** Step increment for numeric/range inputs. */
  step?: number | string;
  /** Maximum character length. */
  maxLength?: number;
  /** Regex pattern for input validation. */
  pattern?: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Whether the field value is invalid. */
  ariaInvalid?: boolean;
  /** ID of the element that describes this element. */
  ariaDescribedBy?: string;
  /** Accessible label. */
  ariaLabel?: string;
  /** Called with the new string value on change. */
  onChangeText?: (value: string) => void;
  /** Called with the new checked state on change. */
  onChangeChecked?: (checked: boolean) => void;
  /** Called with the FileList on file input change. */
  onChangeFiles?: (files: FileList | null) => void;
  /** Blur event handler. */
  onBlur?: FocusEventHandler<HTMLInputElement>;
  /** Focus event handler. */
  onFocus?: FocusEventHandler<HTMLInputElement>;
  /** Click event handler. */
  onClick?: MouseEventHandler<HTMLInputElement>;
  /** Keyboard event handler. */
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  /** Mouse event handler. */
  onMouseEnter?: MouseEventHandler<HTMLInputElement>;
  /** Mouse event handler. */
  onMouseLeave?: MouseEventHandler<HTMLInputElement>;
  /** Pointer event handler. */
  onPointerDown?: PointerEventHandler<HTMLInputElement>;
  /** Pointer event handler. */
  onPointerUp?: PointerEventHandler<HTMLInputElement>;
  /** Touch event handler. */
  onTouchStart?: TouchEventHandler<HTMLInputElement>;
  /** Touch event handler. */
  onTouchEnd?: TouchEventHandler<HTMLInputElement>;
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
}
