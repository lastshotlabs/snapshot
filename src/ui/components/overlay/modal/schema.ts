import { z } from "zod";
import {
  baseComponentConfigSchema,
  fromRefSchema,
} from "../../../manifest/schema";

/**
 * Zod schema for modal component config.
 * Modals are overlay dialogs that display child components.
 * They are opened/closed via the modal manager (open-modal/close-modal actions).
 */
export const modalConfigSchema = baseComponentConfigSchema.extend({
  type: z.literal("modal"),
  /** Modal title. Can be static or a FromRef. */
  title: z.union([z.string(), fromRefSchema]).optional(),
  /** Modal size. */
  size: z.enum(["sm", "md", "lg", "xl", "full"]).default("md"),
  /** FromRef trigger — when resolved value is truthy, modal auto-opens. */
  trigger: fromRefSchema.optional(),
  /** Child components rendered inside the modal body. */
  content: z.array(z.record(z.unknown())),
});

/** Inferred type for modal config. */
export type ModalConfig = z.infer<typeof modalConfigSchema>;
