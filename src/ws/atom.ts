import { atom } from "jotai";
import type { WebSocketManager } from "./manager";

// Singleton atom holding the WebSocketManager instance.
// null when no ws config is provided or before initialization.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const wsManagerAtom = atom<WebSocketManager<any> | null>(null);
