import type { WebSocketManager } from "./manager";
export declare const wsManagerAtom: import("jotai").PrimitiveAtom<WebSocketManager<any> | null> & {
    init: WebSocketManager<any> | null;
};
