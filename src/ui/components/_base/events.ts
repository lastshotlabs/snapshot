import type {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  TouchEvent,
} from "react";
import { z } from "zod";
import { actionSchema } from "../../actions/types";

const eventActionSchema = z.union([actionSchema, z.array(actionSchema)]);

export const baseEventActionsSchema = z
  .object({
    click: eventActionSchema.optional(),
    focus: eventActionSchema.optional(),
    blur: eventActionSchema.optional(),
    keyDown: eventActionSchema.optional(),
    mouseEnter: eventActionSchema.optional(),
    mouseLeave: eventActionSchema.optional(),
  })
  .strict();

export const gestureEventActionsSchema = z
  .object({
    pointerDown: eventActionSchema.optional(),
    pointerUp: eventActionSchema.optional(),
    touchStart: eventActionSchema.optional(),
    touchEnd: eventActionSchema.optional(),
  })
  .strict();

export const interactiveEventActionsSchema = baseEventActionsSchema
  .extend(gestureEventActionsSchema.shape)
  .strict();

export const controlEventActionsSchema = interactiveEventActionsSchema
  .extend({
    change: eventActionSchema.optional(),
    input: eventActionSchema.optional(),
  })
  .strict();

export const formEventActionsSchema = z
  .object({
    submit: eventActionSchema.optional(),
    success: eventActionSchema.optional(),
    error: eventActionSchema.optional(),
  })
  .strict();

export type EventActionConfig = z.input<typeof eventActionSchema>;

export async function executeEventAction(
  execute: (action: EventActionConfig, payload?: Record<string, unknown>) => Promise<unknown>,
  action: EventActionConfig | undefined,
  payload?: Record<string, unknown>,
): Promise<void> {
  if (!action) {
    return;
  }

  await execute(action, payload);
}

export function keyEventPayload(
  event: KeyboardEvent<HTMLElement>,
  payload?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...payload,
    key: event.key,
    code: event.code,
    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
  };
}

export function pointerEventPayload(
  event: PointerEvent<HTMLElement>,
  payload?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...payload,
    pointerType: event.pointerType,
    button: event.button,
    buttons: event.buttons,
    clientX: event.clientX,
    clientY: event.clientY,
  };
}

export function touchEventPayload(
  event: TouchEvent<HTMLElement>,
  payload?: Record<string, unknown>,
): Record<string, unknown> {
  const touch = event.touches[0] ?? event.changedTouches[0];

  return {
    ...payload,
    touches: event.touches.length,
    clientX: touch?.clientX,
    clientY: touch?.clientY,
  };
}

export function focusEventPayload(
  _event: FocusEvent<HTMLElement>,
  payload?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...payload,
  };
}

export function mouseEventPayload(
  event: MouseEvent<HTMLElement>,
  payload?: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...payload,
    button: event.button,
    buttons: event.buttons,
    clientX: event.clientX,
    clientY: event.clientY,
  };
}
