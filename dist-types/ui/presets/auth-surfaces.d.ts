export declare const defaultAuthFormSlots: {
    readonly actions: {
        readonly style: {
            readonly display: "flex";
            readonly width: "100%";
        };
    };
    readonly submitButton: {
        readonly style: {
            readonly width: "100%";
            readonly minHeight: "2.75rem";
            readonly justifyContent: "center";
        };
    };
};
export declare const defaultAuthOAuthButtonSlots: {
    readonly root: {
        readonly style: {
            readonly width: "100%";
        };
    };
    readonly provider: {
        readonly style: {
            readonly width: "100%";
            readonly minHeight: "2.75rem";
            readonly justifyContent: "center";
        };
    };
    readonly providerLabel: {
        readonly style: {
            readonly flex: 1;
            readonly textAlign: "center";
        };
    };
};
export declare function withDefaultAuthFormSlots<T extends Record<string, unknown>>(config: T): T & {
    slots: Record<string, unknown>;
};
export declare function withDefaultAuthOAuthButtonSlots<T extends Record<string, unknown>>(config: T): T & {
    slots: Record<string, unknown>;
};
