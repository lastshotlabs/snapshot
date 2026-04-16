/** Options controlling interval-based polling from client components. */
export interface UsePollOptions {
    interval: number;
    pauseWhenHidden: boolean;
    onPoll: () => void;
    enabled: boolean;
}
/**
 * Invoke a callback on an interval with optional document-visibility pausing.
 */
export declare function usePoll({ interval, pauseWhenHidden, onPoll, enabled, }: UsePollOptions): void;
