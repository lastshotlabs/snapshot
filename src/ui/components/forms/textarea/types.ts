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
  textareaRef?: DomRef<HTMLTextAreaElement>;
  textareaId?: string;
  name?: string;
  value: string;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  required?: boolean;
  resize?: TextareaConfig["resize"];
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  ariaLabel?: string;
  onChangeText?: (value: string) => void;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  onFocus?: FocusEventHandler<HTMLTextAreaElement>;
  onClick?: MouseEventHandler<HTMLTextAreaElement>;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
  onMouseEnter?: MouseEventHandler<HTMLTextAreaElement>;
  onMouseLeave?: MouseEventHandler<HTMLTextAreaElement>;
  onPointerDown?: PointerEventHandler<HTMLTextAreaElement>;
  onPointerUp?: PointerEventHandler<HTMLTextAreaElement>;
  onTouchStart?: TouchEventHandler<HTMLTextAreaElement>;
  onTouchEnd?: TouchEventHandler<HTMLTextAreaElement>;
  className?: string;
  style?: CSSProperties;
  surfaceId?: string;
  surfaceConfig?: Record<string, unknown>;
  itemSurfaceConfig?: Record<string, unknown>;
  activeStates?: RuntimeSurfaceState[];
  testId?: string;
}
