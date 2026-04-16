export type DomRef<T> =
  | ((instance: T | null) => void)
  | { current: T | null }
  | null
  | undefined;

export function setDomRef<T>(ref: DomRef<T>, instance: T | null): void {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(instance);
    return;
  }

  ref.current = instance;
}
