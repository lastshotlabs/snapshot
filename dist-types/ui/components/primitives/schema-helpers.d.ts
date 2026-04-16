import { z } from "zod";
export declare const primitiveExprSchema: z.ZodObject<{
    expr: z.ZodString;
}, "strict", z.ZodTypeAny, {
    expr: string;
}, {
    expr: string;
}>;
export declare const primitiveTextValueSchema: z.ZodUnion<[z.ZodString, z.ZodObject<{
    from: z.ZodString;
    transform: z.ZodOptional<z.ZodEnum<["uppercase", "lowercase", "trim", "length", "number", "boolean", "string", "json", "keys", "values", "first", "last", "count", "sum", "join", "split", "default"]>>;
    transformArg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
}, "strict", z.ZodTypeAny, {
    from: string;
    transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
    transformArg?: string | number | undefined;
}, {
    from: string;
    transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
    transformArg?: string | number | undefined;
}>, z.ZodObject<{
    env: z.ZodString;
    default: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    env: string;
    default?: string | undefined;
}, {
    env: string;
    default?: string | undefined;
}>, z.ZodObject<{
    expr: z.ZodString;
}, "strict", z.ZodTypeAny, {
    expr: string;
}, {
    expr: string;
}>, z.ZodObject<{
    t: z.ZodString;
    vars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strict", z.ZodTypeAny, {
    t: string;
    vars?: Record<string, unknown> | undefined;
}, {
    t: string;
    vars?: Record<string, unknown> | undefined;
}>]>;
export declare const primitiveStringValueSchema: z.ZodUnion<[z.ZodString, z.ZodObject<{
    from: z.ZodString;
    transform: z.ZodOptional<z.ZodEnum<["uppercase", "lowercase", "trim", "length", "number", "boolean", "string", "json", "keys", "values", "first", "last", "count", "sum", "join", "split", "default"]>>;
    transformArg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
}, "strict", z.ZodTypeAny, {
    from: string;
    transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
    transformArg?: string | number | undefined;
}, {
    from: string;
    transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
    transformArg?: string | number | undefined;
}>, z.ZodObject<{
    env: z.ZodString;
    default: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    env: string;
    default?: string | undefined;
}, {
    env: string;
    default?: string | undefined;
}>, z.ZodObject<{
    expr: z.ZodString;
}, "strict", z.ZodTypeAny, {
    expr: string;
}, {
    expr: string;
}>]>;
export declare const primitiveDisplayValueSchema: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodObject<{
    from: z.ZodString;
    transform: z.ZodOptional<z.ZodEnum<["uppercase", "lowercase", "trim", "length", "number", "boolean", "string", "json", "keys", "values", "first", "last", "count", "sum", "join", "split", "default"]>>;
    transformArg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
}, "strict", z.ZodTypeAny, {
    from: string;
    transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
    transformArg?: string | number | undefined;
}, {
    from: string;
    transform?: "string" | "number" | "boolean" | "uppercase" | "lowercase" | "trim" | "length" | "json" | "keys" | "values" | "first" | "last" | "count" | "sum" | "join" | "split" | "default" | undefined;
    transformArg?: string | number | undefined;
}>, z.ZodObject<{
    env: z.ZodString;
    default: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    env: string;
    default?: string | undefined;
}, {
    env: string;
    default?: string | undefined;
}>, z.ZodObject<{
    expr: z.ZodString;
}, "strict", z.ZodTypeAny, {
    expr: string;
}, {
    expr: string;
}>, z.ZodObject<{
    t: z.ZodString;
    vars: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strict", z.ZodTypeAny, {
    t: string;
    vars?: Record<string, unknown> | undefined;
}, {
    t: string;
    vars?: Record<string, unknown> | undefined;
}>]>;
