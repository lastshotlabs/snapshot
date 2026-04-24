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
import type { textareaConfigSchema } from "./schema";

/** Inferred config type from the Textarea Zod schema. */
export type TextareaConfig = z.input<typeof textareaConfigSchema>;

export interface TextareaControlProps {
  /** Ref callback for the underlying element. */
  textareaRef?: DomRef<HTMLTextAreaElement>;
  /** HTML id attribute for the textarea element. */
  textareaId?: string;
  /** Form field name. */
  name?: string;
  /** Current textarea value. */
  value: string;
  /** Number of visible text rows. */
  rows?: number;
  /** Placeholder text shown when the textarea is empty. */
  placeholder?: string;
  /** Disabled state. */
  disabled?: boolean;
  /** Whether the textarea is read-only. */
  readOnly?: boolean;
  /** Maximum character length. */
  maxLength?: number;
  /** Whether the field is required. */
  required?: boolean;
  /** Resize behavior of the textarea. */
  resize?: TextareaConfig["resize"];
  /** Whether the field value is invalid. */
  ariaInvalid?: boolean;
  /** ID of the element that describes this element. */
  ariaDescribedBy?: string;
  /** Accessible label. */
  ariaLabel?: string;
  /** Called with the new string value on change. */
  onChangeText?: (value: string) => void;
  /** Blur event handler. */
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  /** Focus event handler. */
  onFocus?: FocusEventHandler<HTMLTextAreaElement>;
  /** Click event handler. */
  onClick?: MouseEventHandler<HTMLTextAreaElement>;
  /** Keyboard event handler. */
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
  /** Mouse event handler. */
  onMouseEnter?: MouseEventHandler<HTMLTextAreaElement>;
  /** Mouse event handler. */
  onMouseLeave?: MouseEventHandler<HTMLTextAreaElement>;
  /** Pointer event handler. */
  onPointerDown?: PointerEventHandler<HTMLTextAreaElement>;
  /** Pointer event handler. */
  onPointerUp?: PointerEventHandler<HTMLTextAreaElement>;
  /** Touch event handler. */
  onTouchStart?: TouchEventHandler<HTMLTextAreaElement>;
  /** Touch event handler. */
  onTouchEnd?: TouchEventHandler<HTMLTextAreaElement>;
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
