import { type ReactNode } from "react";
interface TransitionConfig {
    enter: string;
    exit: string;
    duration: number;
    easing: string;
}
/** Apply enter transitions around routed content when a route transition config is present. */
export declare function TransitionWrapper({ config, routeKey, children, }: {
    config?: TransitionConfig;
    routeKey: string;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export {};
