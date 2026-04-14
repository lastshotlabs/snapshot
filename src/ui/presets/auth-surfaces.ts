type SlotMap = Record<string, unknown>;

export const defaultAuthFormSlots = {
  actions: {
    style: {
      display: "flex",
      width: "100%",
    },
  },
  submitButton: {
    style: {
      width: "100%",
      minHeight: "2.75rem",
      justifyContent: "center",
    },
  },
} as const;

export const defaultAuthOAuthButtonSlots = {
  root: {
    style: {
      width: "100%",
    },
  },
  provider: {
    style: {
      width: "100%",
      minHeight: "2.75rem",
      justifyContent: "center",
    },
  },
  providerLabel: {
    style: {
      flex: 1,
      textAlign: "center",
    },
  },
} as const;

function mergeSlots(
  defaults: SlotMap,
  slots: Record<string, unknown> | undefined,
): Record<string, unknown> {
  return {
    ...defaults,
    ...(slots ?? {}),
  };
}

export function withDefaultAuthFormSlots<T extends Record<string, unknown>>(
  config: T,
): T & { slots: Record<string, unknown> } {
  return {
    ...config,
    slots: mergeSlots(defaultAuthFormSlots, config.slots as SlotMap | undefined),
  };
}

export function withDefaultAuthOAuthButtonSlots<
  T extends Record<string, unknown>,
>(config: T): T & { slots: Record<string, unknown> } {
  return {
    ...config,
    slots: mergeSlots(
      defaultAuthOAuthButtonSlots,
      config.slots as SlotMap | undefined,
    ),
  };
}
