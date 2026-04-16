export type DomRef<T> = ((instance: T | null) => void) | {
    current: T | null;
} | null | undefined;
export declare function setDomRef<T>(ref: DomRef<T>, instance: T | null): void;
