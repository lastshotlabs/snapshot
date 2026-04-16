import type { CSSProperties } from "react";
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
  onBlur?: () => void;
  className?: string;
  style?: CSSProperties;
  surfaceId?: string;
  surfaceConfig?: Record<string, unknown>;
  itemSurfaceConfig?: Record<string, unknown>;
  activeStates?: RuntimeSurfaceState[];
  testId?: string;
}
