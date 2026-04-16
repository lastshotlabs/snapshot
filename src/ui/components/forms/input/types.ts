import type {
  CSSProperties,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
} from "react";
import type { z } from "zod";
import type { DomRef } from "../../_base/dom-ref";
import type { RuntimeSurfaceState } from "../../_base/style-surfaces";
import type { inputConfigSchema } from "./schema";

/** Inferred config type from the Input Zod schema. */
export type InputConfig = z.input<typeof inputConfigSchema>;

export interface InputControlProps {
  inputRef?: DomRef<HTMLInputElement>;
  inputId?: string;
  name?: string;
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
  value?: string;
  checked?: boolean;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  accept?: string;
  multiple?: boolean;
  list?: string;
  min?: string;
  max?: string;
  step?: number | string;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  ariaLabel?: string;
  onChangeText?: (value: string) => void;
  onChangeChecked?: (checked: boolean) => void;
  onChangeFiles?: (files: FileList | null) => void;
  onBlur?: () => void;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onClick?: MouseEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  className?: string;
  style?: CSSProperties;
  surfaceId?: string;
  surfaceConfig?: Record<string, unknown>;
  itemSurfaceConfig?: Record<string, unknown>;
  activeStates?: RuntimeSurfaceState[];
  testId?: string;
}
