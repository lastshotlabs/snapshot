import type {
  CSSProperties,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  Ref,
} from "react";
import type { z } from "zod";
import type { RuntimeSurfaceState } from "../../_base/style-surfaces";
import type { inputConfigSchema } from "./schema";

/** Inferred config type from the Input Zod schema. */
export type InputConfig = z.input<typeof inputConfigSchema>;

export interface InputControlProps {
  inputRef?: Ref<HTMLInputElement>;
  inputId?: string;
  type?: InputConfig["inputType"];
  value: string;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  min?: string;
  max?: string;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  ariaLabel?: string;
  onChangeText?: (value: string) => void;
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
