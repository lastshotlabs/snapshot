import { z } from "zod";
/** Validate preset config for a CRUD page assembled from list/form primitives. */
export declare const crudPresetConfigSchema: z.ZodObject<{
    title: z.ZodString;
    listEndpoint: z.ZodString;
    createEndpoint: z.ZodOptional<z.ZodString>;
    updateEndpoint: z.ZodOptional<z.ZodString>;
    deleteEndpoint: z.ZodOptional<z.ZodString>;
    columns: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodString;
        badge: z.ZodOptional<z.ZodBoolean>;
        format: z.ZodOptional<z.ZodEnum<["date", "currency", "number", "boolean"]>>;
    }, "strict", z.ZodTypeAny, {
        label: string;
        key: string;
        format?: "number" | "boolean" | "date" | "currency" | undefined;
        badge?: boolean | undefined;
    }, {
        label: string;
        key: string;
        format?: "number" | "boolean" | "date" | "currency" | undefined;
        badge?: boolean | undefined;
    }>, "many">;
    createForm: z.ZodOptional<z.ZodObject<{
        fields: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            type: z.ZodEnum<["text", "email", "password", "number", "select", "textarea", "toggle"]>;
            label: z.ZodString;
            required: z.ZodOptional<z.ZodBoolean>;
            options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                value: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                value: string;
                label: string;
            }, {
                value: string;
                label: string;
            }>, "many">>;
            placeholder: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }, {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }>, "many">;
    }, "strict", z.ZodTypeAny, {
        fields: {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }[];
    }, {
        fields: {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }[];
    }>>;
    updateForm: z.ZodOptional<z.ZodObject<{
        fields: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            type: z.ZodEnum<["text", "email", "password", "number", "select", "textarea", "toggle"]>;
            label: z.ZodString;
            required: z.ZodOptional<z.ZodBoolean>;
            options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                value: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                value: string;
                label: string;
            }, {
                value: string;
                label: string;
            }>, "many">>;
            placeholder: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }, {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }>, "many">;
    }, "strict", z.ZodTypeAny, {
        fields: {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }[];
    }, {
        fields: {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }[];
    }>>;
    filters: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodString;
        type: z.ZodEnum<["select", "text"]>;
        options: z.ZodOptional<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            value: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            value: string;
            label: string;
        }, {
            value: string;
            label: string;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        type: "text" | "select";
        label: string;
        key: string;
        options?: {
            value: string;
            label: string;
        }[] | undefined;
    }, {
        type: "text" | "select";
        label: string;
        key: string;
        options?: {
            value: string;
            label: string;
        }[] | undefined;
    }>, "many">>;
    pagination: z.ZodOptional<z.ZodObject<{
        pageSize: z.ZodOptional<z.ZodNumber>;
        type: z.ZodOptional<z.ZodEnum<["offset", "cursor"]>>;
    }, "strict", z.ZodTypeAny, {
        type?: "cursor" | "offset" | undefined;
        pageSize?: number | undefined;
    }, {
        type?: "cursor" | "offset" | undefined;
        pageSize?: number | undefined;
    }>>;
    emptyState: z.ZodOptional<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        title: string;
        icon?: string | undefined;
        description?: string | undefined;
    }, {
        title: string;
        icon?: string | undefined;
        description?: string | undefined;
    }>>;
    id: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    title: string;
    columns: {
        label: string;
        key: string;
        format?: "number" | "boolean" | "date" | "currency" | undefined;
        badge?: boolean | undefined;
    }[];
    listEndpoint: string;
    id?: string | undefined;
    emptyState?: {
        title: string;
        icon?: string | undefined;
        description?: string | undefined;
    } | undefined;
    pagination?: {
        type?: "cursor" | "offset" | undefined;
        pageSize?: number | undefined;
    } | undefined;
    filters?: {
        type: "text" | "select";
        label: string;
        key: string;
        options?: {
            value: string;
            label: string;
        }[] | undefined;
    }[] | undefined;
    createEndpoint?: string | undefined;
    updateEndpoint?: string | undefined;
    deleteEndpoint?: string | undefined;
    createForm?: {
        fields: {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }[];
    } | undefined;
    updateForm?: {
        fields: {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }[];
    } | undefined;
}, {
    title: string;
    columns: {
        label: string;
        key: string;
        format?: "number" | "boolean" | "date" | "currency" | undefined;
        badge?: boolean | undefined;
    }[];
    listEndpoint: string;
    id?: string | undefined;
    emptyState?: {
        title: string;
        icon?: string | undefined;
        description?: string | undefined;
    } | undefined;
    pagination?: {
        type?: "cursor" | "offset" | undefined;
        pageSize?: number | undefined;
    } | undefined;
    filters?: {
        type: "text" | "select";
        label: string;
        key: string;
        options?: {
            value: string;
            label: string;
        }[] | undefined;
    }[] | undefined;
    createEndpoint?: string | undefined;
    updateEndpoint?: string | undefined;
    deleteEndpoint?: string | undefined;
    createForm?: {
        fields: {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }[];
    } | undefined;
    updateForm?: {
        fields: {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }[];
    } | undefined;
}>;
/** Validate preset config for a dashboard page with stats, charts, and activity sections. */
export declare const dashboardPresetConfigSchema: z.ZodObject<{
    title: z.ZodString;
    stats: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        endpoint: z.ZodString;
        valueKey: z.ZodString;
        format: z.ZodOptional<z.ZodEnum<["number", "currency", "percent"]>>;
        trend: z.ZodOptional<z.ZodObject<{
            key: z.ZodString;
            positive: z.ZodOptional<z.ZodEnum<["up", "down"]>>;
        }, "strict", z.ZodTypeAny, {
            key: string;
            positive?: "up" | "down" | undefined;
        }, {
            key: string;
            positive?: "up" | "down" | undefined;
        }>>;
        icon: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        label: string;
        endpoint: string;
        valueKey: string;
        icon?: string | undefined;
        format?: "number" | "percent" | "currency" | undefined;
        trend?: {
            key: string;
            positive?: "up" | "down" | undefined;
        } | undefined;
    }, {
        label: string;
        endpoint: string;
        valueKey: string;
        icon?: string | undefined;
        format?: "number" | "percent" | "currency" | undefined;
        trend?: {
            key: string;
            positive?: "up" | "down" | undefined;
        } | undefined;
    }>, "many">;
    recentActivity: z.ZodOptional<z.ZodString>;
    charts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        variant: z.ZodEnum<["line", "bar", "area", "pie", "donut", "sparkline", "funnel", "radar", "treemap", "scatter"]>;
        endpoint: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        series: z.ZodOptional<z.ZodArray<z.ZodObject<{
            field: z.ZodString;
            label: z.ZodOptional<z.ZodString>;
            color: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            field: string;
            color?: string | undefined;
            label?: string | undefined;
        }, {
            field: string;
            color?: string | undefined;
            label?: string | undefined;
        }>, "many">>;
        span: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        variant: "bar" | "area" | "line" | "donut" | "pie" | "sparkline" | "funnel" | "radar" | "treemap" | "scatter";
        endpoint: string;
        span?: number | undefined;
        title?: string | undefined;
        series?: {
            field: string;
            color?: string | undefined;
            label?: string | undefined;
        }[] | undefined;
    }, {
        variant: "bar" | "area" | "line" | "donut" | "pie" | "sparkline" | "funnel" | "radar" | "treemap" | "scatter";
        endpoint: string;
        span?: number | undefined;
        title?: string | undefined;
        series?: {
            field: string;
            color?: string | undefined;
            label?: string | undefined;
        }[] | undefined;
    }>, "many">>;
    activityFeed: z.ZodOptional<z.ZodObject<{
        endpoint: z.ZodString;
        limit: z.ZodOptional<z.ZodNumber>;
        title: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        endpoint: string;
        title?: string | undefined;
        limit?: number | undefined;
    }, {
        endpoint: string;
        title?: string | undefined;
        limit?: number | undefined;
    }>>;
    id: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    title: string;
    stats: {
        label: string;
        endpoint: string;
        valueKey: string;
        icon?: string | undefined;
        format?: "number" | "percent" | "currency" | undefined;
        trend?: {
            key: string;
            positive?: "up" | "down" | undefined;
        } | undefined;
    }[];
    id?: string | undefined;
    recentActivity?: string | undefined;
    charts?: {
        variant: "bar" | "area" | "line" | "donut" | "pie" | "sparkline" | "funnel" | "radar" | "treemap" | "scatter";
        endpoint: string;
        span?: number | undefined;
        title?: string | undefined;
        series?: {
            field: string;
            color?: string | undefined;
            label?: string | undefined;
        }[] | undefined;
    }[] | undefined;
    activityFeed?: {
        endpoint: string;
        title?: string | undefined;
        limit?: number | undefined;
    } | undefined;
}, {
    title: string;
    stats: {
        label: string;
        endpoint: string;
        valueKey: string;
        icon?: string | undefined;
        format?: "number" | "percent" | "currency" | undefined;
        trend?: {
            key: string;
            positive?: "up" | "down" | undefined;
        } | undefined;
    }[];
    id?: string | undefined;
    recentActivity?: string | undefined;
    charts?: {
        variant: "bar" | "area" | "line" | "donut" | "pie" | "sparkline" | "funnel" | "radar" | "treemap" | "scatter";
        endpoint: string;
        span?: number | undefined;
        title?: string | undefined;
        series?: {
            field: string;
            color?: string | undefined;
            label?: string | undefined;
        }[] | undefined;
    }[] | undefined;
    activityFeed?: {
        endpoint: string;
        title?: string | undefined;
        limit?: number | undefined;
    } | undefined;
}>;
/** Validate preset config for a settings page composed from one or more submitted sections. */
export declare const settingsPresetConfigSchema: z.ZodObject<{
    title: z.ZodString;
    sections: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        submitEndpoint: z.ZodString;
        method: z.ZodOptional<z.ZodEnum<["POST", "PUT", "PATCH"]>>;
        dataEndpoint: z.ZodOptional<z.ZodString>;
        fields: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            type: z.ZodEnum<["text", "email", "password", "number", "select", "textarea", "toggle"]>;
            label: z.ZodString;
            required: z.ZodOptional<z.ZodBoolean>;
            options: z.ZodOptional<z.ZodArray<z.ZodObject<{
                label: z.ZodString;
                value: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                value: string;
                label: string;
            }, {
                value: string;
                label: string;
            }>, "many">>;
            placeholder: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }, {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }>, "many">;
        submitLabel: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        autoSave: z.ZodOptional<z.ZodBoolean>;
        autoSaveDelay: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        label: string;
        fields: {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }[];
        submitEndpoint: string;
        icon?: string | undefined;
        submitLabel?: string | undefined;
        method?: "POST" | "PUT" | "PATCH" | undefined;
        autoSave?: boolean | undefined;
        dataEndpoint?: string | undefined;
        autoSaveDelay?: number | undefined;
    }, {
        label: string;
        fields: {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }[];
        submitEndpoint: string;
        icon?: string | undefined;
        submitLabel?: string | undefined;
        method?: "POST" | "PUT" | "PATCH" | undefined;
        autoSave?: boolean | undefined;
        dataEndpoint?: string | undefined;
        autoSaveDelay?: number | undefined;
    }>, "many">;
    id: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    title: string;
    sections: {
        label: string;
        fields: {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }[];
        submitEndpoint: string;
        icon?: string | undefined;
        submitLabel?: string | undefined;
        method?: "POST" | "PUT" | "PATCH" | undefined;
        autoSave?: boolean | undefined;
        dataEndpoint?: string | undefined;
        autoSaveDelay?: number | undefined;
    }[];
    id?: string | undefined;
}, {
    title: string;
    sections: {
        label: string;
        fields: {
            type: "number" | "text" | "textarea" | "select" | "toggle" | "email" | "password";
            label: string;
            key: string;
            options?: {
                value: string;
                label: string;
            }[] | undefined;
            required?: boolean | undefined;
            placeholder?: string | undefined;
        }[];
        submitEndpoint: string;
        icon?: string | undefined;
        submitLabel?: string | undefined;
        method?: "POST" | "PUT" | "PATCH" | undefined;
        autoSave?: boolean | undefined;
        dataEndpoint?: string | undefined;
        autoSaveDelay?: number | undefined;
    }[];
    id?: string | undefined;
}>;
/** Validate preset config for auth screens such as login, register, and password recovery. */
export declare const authPresetConfigSchema: z.ZodObject<{
    screen: z.ZodEnum<["login", "register", "forgot-password", "reset-password", "verify-email"]>;
    branding: z.ZodOptional<z.ZodObject<{
        logo: z.ZodOptional<z.ZodString>;
        appName: z.ZodOptional<z.ZodString>;
        tagline: z.ZodOptional<z.ZodString>;
        background: z.ZodOptional<z.ZodObject<{
            image: z.ZodOptional<z.ZodString>;
            color: z.ZodOptional<z.ZodString>;
            position: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            position?: string | undefined;
            color?: string | undefined;
            image?: string | undefined;
        }, {
            position?: string | undefined;
            color?: string | undefined;
            image?: string | undefined;
        }>>;
    }, "strict", z.ZodTypeAny, {
        background?: {
            position?: string | undefined;
            color?: string | undefined;
            image?: string | undefined;
        } | undefined;
        logo?: string | undefined;
        appName?: string | undefined;
        tagline?: string | undefined;
    }, {
        background?: {
            position?: string | undefined;
            color?: string | undefined;
            image?: string | undefined;
        } | undefined;
        logo?: string | undefined;
        appName?: string | undefined;
        tagline?: string | undefined;
    }>>;
    oauthProviders: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    passkey: z.ZodOptional<z.ZodBoolean>;
    redirects: z.ZodOptional<z.ZodObject<{
        afterLogin: z.ZodOptional<z.ZodString>;
        afterRegister: z.ZodOptional<z.ZodString>;
        forgotPassword: z.ZodOptional<z.ZodString>;
        login: z.ZodOptional<z.ZodString>;
        register: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        login?: string | undefined;
        register?: string | undefined;
        forgotPassword?: string | undefined;
        afterLogin?: string | undefined;
        afterRegister?: string | undefined;
    }, {
        login?: string | undefined;
        register?: string | undefined;
        forgotPassword?: string | undefined;
        afterLogin?: string | undefined;
        afterRegister?: string | undefined;
    }>>;
    id: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    screen: "login" | "register" | "forgot-password" | "reset-password" | "verify-email";
    id?: string | undefined;
    passkey?: boolean | undefined;
    branding?: {
        background?: {
            position?: string | undefined;
            color?: string | undefined;
            image?: string | undefined;
        } | undefined;
        logo?: string | undefined;
        appName?: string | undefined;
        tagline?: string | undefined;
    } | undefined;
    redirects?: {
        login?: string | undefined;
        register?: string | undefined;
        forgotPassword?: string | undefined;
        afterLogin?: string | undefined;
        afterRegister?: string | undefined;
    } | undefined;
    oauthProviders?: string[] | undefined;
}, {
    screen: "login" | "register" | "forgot-password" | "reset-password" | "verify-email";
    id?: string | undefined;
    passkey?: boolean | undefined;
    branding?: {
        background?: {
            position?: string | undefined;
            color?: string | undefined;
            image?: string | undefined;
        } | undefined;
        logo?: string | undefined;
        appName?: string | undefined;
        tagline?: string | undefined;
    } | undefined;
    redirects?: {
        login?: string | undefined;
        register?: string | undefined;
        forgotPassword?: string | undefined;
        afterLogin?: string | undefined;
        afterRegister?: string | undefined;
    } | undefined;
    oauthProviders?: string[] | undefined;
}>;
