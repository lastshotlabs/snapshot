import { z } from "zod";
export declare const kanbanSlotNames: readonly ["root", "column", "columnHeader", "columnTitle", "columnCount", "columnBody", "card", "cardTitle", "cardDescription", "cardMeta", "emptyState"];
export declare const kanbanColumnSlotNames: readonly ["column", "columnHeader", "columnTitle", "columnCount", "columnBody"];
/**
 * Schema for a Kanban board column definition.
 */
export declare const kanbanColumnSchema: z.ZodObject<{
    /** Unique key matching the value in the column field. */
    key: z.ZodString;
    /** Display title for the column header. */
    title: z.ZodString;
    /** Semantic color for the column header accent. */
    color: z.ZodOptional<z.ZodEnum<["primary", "secondary", "success", "warning", "destructive", "info", "muted"]>>;
    /** Maximum number of cards allowed in this column. */
    limit: z.ZodOptional<z.ZodNumber>;
    /** Per-column slot overrides for visible column surfaces. */
    slots: z.ZodOptional<z.ZodObject<Record<"column" | "columnCount" | "columnHeader" | "columnTitle" | "columnBody", z.ZodOptional<z.ZodObject<{
        readonly className: z.ZodOptional<z.ZodString>;
        readonly style: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>>;
        readonly cursor: z.ZodOptional<z.ZodString>;
        readonly gridTemplateColumns: z.ZodOptional<z.ZodString>;
        readonly gridTemplateRows: z.ZodOptional<z.ZodString>;
        readonly gridColumn: z.ZodOptional<z.ZodString>;
        readonly gridRow: z.ZodOptional<z.ZodString>;
        readonly display: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["flex", "grid", "block", "inline", "inline-flex", "inline-grid", "none"]>, z.ZodObject<{
            default: z.ZodEnum<["flex", "grid", "block", "inline", "inline-flex", "inline-grid", "none"]>;
            sm: z.ZodOptional<z.ZodEnum<["flex", "grid", "block", "inline", "inline-flex", "inline-grid", "none"]>>;
            md: z.ZodOptional<z.ZodEnum<["flex", "grid", "block", "inline", "inline-flex", "inline-grid", "none"]>>;
            lg: z.ZodOptional<z.ZodEnum<["flex", "grid", "block", "inline", "inline-flex", "inline-grid", "none"]>>;
            xl: z.ZodOptional<z.ZodEnum<["flex", "grid", "block", "inline", "inline-flex", "inline-grid", "none"]>>;
            "2xl": z.ZodOptional<z.ZodEnum<["flex", "grid", "block", "inline", "inline-flex", "inline-grid", "none"]>>;
        }, "strict", z.ZodTypeAny, {
            default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
            lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
        }, {
            default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
            lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
        }>]>>;
        readonly flexDirection: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["row", "column", "row-reverse", "column-reverse"]>, z.ZodObject<{
            default: z.ZodEnum<["row", "column", "row-reverse", "column-reverse"]>;
            sm: z.ZodOptional<z.ZodEnum<["row", "column", "row-reverse", "column-reverse"]>>;
            md: z.ZodOptional<z.ZodEnum<["row", "column", "row-reverse", "column-reverse"]>>;
            lg: z.ZodOptional<z.ZodEnum<["row", "column", "row-reverse", "column-reverse"]>>;
            xl: z.ZodOptional<z.ZodEnum<["row", "column", "row-reverse", "column-reverse"]>>;
            "2xl": z.ZodOptional<z.ZodEnum<["row", "column", "row-reverse", "column-reverse"]>>;
        }, "strict", z.ZodTypeAny, {
            default: "row" | "column" | "row-reverse" | "column-reverse";
            lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
        }, {
            default: "row" | "column" | "row-reverse" | "column-reverse";
            lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
        }>]>>;
        readonly position: z.ZodOptional<z.ZodEnum<["relative", "absolute", "fixed", "sticky"]>>;
        readonly inset: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        readonly padding: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
            default: z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>;
            sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
        }, "strict", z.ZodTypeAny, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }>]>>;
        readonly paddingX: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
            default: z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>;
            sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
        }, "strict", z.ZodTypeAny, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }>]>>;
        readonly paddingY: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
            default: z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>;
            sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
        }, "strict", z.ZodTypeAny, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }>]>>;
        readonly margin: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
            default: z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>;
            sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
        }, "strict", z.ZodTypeAny, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }>]>>;
        readonly marginX: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
            default: z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>;
            sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
        }, "strict", z.ZodTypeAny, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }>]>>;
        readonly marginY: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
            default: z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>;
            sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
        }, "strict", z.ZodTypeAny, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }>]>>;
        readonly gap: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
            default: z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>;
            sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
        }, "strict", z.ZodTypeAny, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }>]>>;
        readonly width: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodObject<{
            default: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            sm: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            md: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            lg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            xl: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            "2xl": z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        }, "strict", z.ZodTypeAny, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }>]>>;
        readonly minWidth: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodObject<{
            default: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            sm: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            md: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            lg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            xl: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            "2xl": z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        }, "strict", z.ZodTypeAny, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }>]>>;
        readonly maxWidth: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodObject<{
            default: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            sm: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            md: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            lg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            xl: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            "2xl": z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        }, "strict", z.ZodTypeAny, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }>]>>;
        readonly height: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodObject<{
            default: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            sm: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            md: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            lg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            xl: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            "2xl": z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        }, "strict", z.ZodTypeAny, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }>]>>;
        readonly minHeight: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodObject<{
            default: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            sm: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            md: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            lg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            xl: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            "2xl": z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        }, "strict", z.ZodTypeAny, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }>]>>;
        readonly maxHeight: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodObject<{
            default: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            sm: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            md: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            lg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            xl: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            "2xl": z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        }, "strict", z.ZodTypeAny, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }>]>>;
        readonly bg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodUnion<[z.ZodString, z.ZodObject<{
            image: z.ZodOptional<z.ZodString>;
            overlay: z.ZodOptional<z.ZodString>;
            gradient: z.ZodOptional<z.ZodObject<{
                type: z.ZodDefault<z.ZodEnum<["linear", "radial", "conic"]>>;
                direction: z.ZodOptional<z.ZodString>;
                stops: z.ZodArray<z.ZodObject<{
                    color: z.ZodString;
                    position: z.ZodOptional<z.ZodString>;
                }, "strict", z.ZodTypeAny, {
                    color: string;
                    position?: string | undefined;
                }, {
                    color: string;
                    position?: string | undefined;
                }>, "many">;
            }, "strict", z.ZodTypeAny, {
                type: "linear" | "radial" | "conic";
                stops: {
                    color: string;
                    position?: string | undefined;
                }[];
                direction?: string | undefined;
            }, {
                stops: {
                    color: string;
                    position?: string | undefined;
                }[];
                type?: "linear" | "radial" | "conic" | undefined;
                direction?: string | undefined;
            }>>;
            position: z.ZodOptional<z.ZodString>;
            size: z.ZodOptional<z.ZodEnum<["cover", "contain", "auto"]>>;
            fixed: z.ZodOptional<z.ZodBoolean>;
        }, "strict", z.ZodTypeAny, {
            size?: "auto" | "cover" | "contain" | undefined;
            overlay?: string | undefined;
            position?: string | undefined;
            image?: string | undefined;
            gradient?: {
                type: "linear" | "radial" | "conic";
                stops: {
                    color: string;
                    position?: string | undefined;
                }[];
                direction?: string | undefined;
            } | undefined;
            fixed?: boolean | undefined;
        }, {
            size?: "auto" | "cover" | "contain" | undefined;
            overlay?: string | undefined;
            position?: string | undefined;
            image?: string | undefined;
            gradient?: {
                stops: {
                    color: string;
                    position?: string | undefined;
                }[];
                type?: "linear" | "radial" | "conic" | undefined;
                direction?: string | undefined;
            } | undefined;
            fixed?: boolean | undefined;
        }>]>]>>;
        readonly color: z.ZodOptional<z.ZodString>;
        readonly borderRadius: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl", "full"]>, z.ZodString, z.ZodNumber]>>;
        readonly border: z.ZodOptional<z.ZodString>;
        readonly shadow: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl"]>, z.ZodString]>>;
        readonly opacity: z.ZodOptional<z.ZodNumber>;
        readonly overflow: z.ZodOptional<z.ZodEnum<["auto", "hidden", "scroll", "visible"]>>;
        readonly alignItems: z.ZodOptional<z.ZodEnum<["start", "center", "end", "stretch", "baseline"]>>;
        readonly justifyContent: z.ZodOptional<z.ZodEnum<["start", "center", "end", "between", "around", "evenly"]>>;
        readonly flexWrap: z.ZodOptional<z.ZodEnum<["wrap", "nowrap", "wrap-reverse"]>>;
        readonly flex: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        readonly textAlign: z.ZodOptional<z.ZodEnum<["left", "center", "right", "justify"]>>;
        readonly fontSize: z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
            default: z.ZodUnion<[z.ZodEnum<["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]>, z.ZodString, z.ZodNumber]>;
            sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]>, z.ZodString, z.ZodNumber]>>;
            md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]>, z.ZodString, z.ZodNumber]>>;
            lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]>, z.ZodString, z.ZodNumber]>>;
            xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]>, z.ZodString, z.ZodNumber]>>;
            "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]>, z.ZodString, z.ZodNumber]>>;
        }, "strict", z.ZodTypeAny, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }, {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        }>]>>;
        readonly fontWeight: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["light", "normal", "medium", "semibold", "bold"]>, z.ZodNumber, z.ZodString]>>;
        readonly lineHeight: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "tight", "snug", "normal", "relaxed", "loose"]>, z.ZodString, z.ZodNumber]>>;
        readonly letterSpacing: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["tight", "normal", "wide"]>, z.ZodString, z.ZodNumber]>>;
        readonly hover: z.ZodOptional<z.ZodObject<{
            bg: z.ZodOptional<z.ZodString>;
            color: z.ZodOptional<z.ZodString>;
            shadow: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl"]>, z.ZodString]>>;
            borderRadius: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl", "full"]>, z.ZodString, z.ZodNumber]>>;
            border: z.ZodOptional<z.ZodString>;
            opacity: z.ZodOptional<z.ZodNumber>;
            transform: z.ZodOptional<z.ZodString>;
            scale: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            transform?: string | undefined;
            border?: string | undefined;
            scale?: number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            color?: string | undefined;
            bg?: string | undefined;
            borderRadius?: string | number | undefined;
        }, {
            transform?: string | undefined;
            border?: string | undefined;
            scale?: number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            color?: string | undefined;
            bg?: string | undefined;
            borderRadius?: string | number | undefined;
        }>>;
        readonly focus: z.ZodOptional<z.ZodObject<{
            bg: z.ZodOptional<z.ZodString>;
            color: z.ZodOptional<z.ZodString>;
            shadow: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl"]>, z.ZodString]>>;
            ring: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString]>>;
            outline: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            ring?: string | boolean | undefined;
            shadow?: string | undefined;
            outline?: string | undefined;
            color?: string | undefined;
            bg?: string | undefined;
        }, {
            ring?: string | boolean | undefined;
            shadow?: string | undefined;
            outline?: string | undefined;
            color?: string | undefined;
            bg?: string | undefined;
        }>>;
        readonly active: z.ZodOptional<z.ZodObject<{
            bg: z.ZodOptional<z.ZodString>;
            color: z.ZodOptional<z.ZodString>;
            transform: z.ZodOptional<z.ZodString>;
            scale: z.ZodOptional<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            transform?: string | undefined;
            scale?: number | undefined;
            color?: string | undefined;
            bg?: string | undefined;
        }, {
            transform?: string | undefined;
            scale?: number | undefined;
            color?: string | undefined;
            bg?: string | undefined;
        }>>;
    } & {
        states: z.ZodOptional<z.ZodRecord<z.ZodEnum<["hover", "focus", "open", "selected", "current", "active", "completed", "invalid", "disabled"]>, z.ZodObject<{
            readonly className: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            readonly style: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>>>;
            readonly cursor: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            readonly gridTemplateColumns: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            readonly gridTemplateRows: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            readonly gridColumn: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            readonly gridRow: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            readonly display: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodEnum<["flex", "grid", "block", "inline", "inline-flex", "inline-grid", "none"]>, z.ZodObject<{
                default: z.ZodEnum<["flex", "grid", "block", "inline", "inline-flex", "inline-grid", "none"]>;
                sm: z.ZodOptional<z.ZodEnum<["flex", "grid", "block", "inline", "inline-flex", "inline-grid", "none"]>>;
                md: z.ZodOptional<z.ZodEnum<["flex", "grid", "block", "inline", "inline-flex", "inline-grid", "none"]>>;
                lg: z.ZodOptional<z.ZodEnum<["flex", "grid", "block", "inline", "inline-flex", "inline-grid", "none"]>>;
                xl: z.ZodOptional<z.ZodEnum<["flex", "grid", "block", "inline", "inline-flex", "inline-grid", "none"]>>;
                "2xl": z.ZodOptional<z.ZodEnum<["flex", "grid", "block", "inline", "inline-flex", "inline-grid", "none"]>>;
            }, "strict", z.ZodTypeAny, {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            }, {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            }>]>>>;
            readonly flexDirection: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodEnum<["row", "column", "row-reverse", "column-reverse"]>, z.ZodObject<{
                default: z.ZodEnum<["row", "column", "row-reverse", "column-reverse"]>;
                sm: z.ZodOptional<z.ZodEnum<["row", "column", "row-reverse", "column-reverse"]>>;
                md: z.ZodOptional<z.ZodEnum<["row", "column", "row-reverse", "column-reverse"]>>;
                lg: z.ZodOptional<z.ZodEnum<["row", "column", "row-reverse", "column-reverse"]>>;
                xl: z.ZodOptional<z.ZodEnum<["row", "column", "row-reverse", "column-reverse"]>>;
                "2xl": z.ZodOptional<z.ZodEnum<["row", "column", "row-reverse", "column-reverse"]>>;
            }, "strict", z.ZodTypeAny, {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            }, {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            }>]>>>;
            readonly position: z.ZodOptional<z.ZodOptional<z.ZodEnum<["relative", "absolute", "fixed", "sticky"]>>>;
            readonly inset: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>>;
            readonly padding: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
                default: z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>;
                sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            }, "strict", z.ZodTypeAny, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }>]>>>;
            readonly paddingX: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
                default: z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>;
                sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            }, "strict", z.ZodTypeAny, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }>]>>>;
            readonly paddingY: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
                default: z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>;
                sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            }, "strict", z.ZodTypeAny, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }>]>>>;
            readonly margin: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
                default: z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>;
                sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            }, "strict", z.ZodTypeAny, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }>]>>>;
            readonly marginX: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
                default: z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>;
                sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            }, "strict", z.ZodTypeAny, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }>]>>>;
            readonly marginY: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
                default: z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>;
                sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            }, "strict", z.ZodTypeAny, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }>]>>>;
            readonly gap: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
                default: z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>;
                sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
                "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"]>, z.ZodString, z.ZodNumber]>>;
            }, "strict", z.ZodTypeAny, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }>]>>>;
            readonly width: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodObject<{
                default: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
                sm: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                md: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                lg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                xl: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                "2xl": z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            }, "strict", z.ZodTypeAny, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }>]>>>;
            readonly minWidth: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodObject<{
                default: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
                sm: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                md: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                lg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                xl: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                "2xl": z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            }, "strict", z.ZodTypeAny, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }>]>>>;
            readonly maxWidth: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodObject<{
                default: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
                sm: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                md: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                lg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                xl: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                "2xl": z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            }, "strict", z.ZodTypeAny, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }>]>>>;
            readonly height: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodObject<{
                default: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
                sm: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                md: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                lg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                xl: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                "2xl": z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            }, "strict", z.ZodTypeAny, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }>]>>>;
            readonly minHeight: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodObject<{
                default: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
                sm: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                md: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                lg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                xl: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                "2xl": z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            }, "strict", z.ZodTypeAny, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }>]>>>;
            readonly maxHeight: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodString, z.ZodNumber]>, z.ZodObject<{
                default: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
                sm: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                md: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                lg: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                xl: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
                "2xl": z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            }, "strict", z.ZodTypeAny, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }>]>>>;
            readonly bg: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodUnion<[z.ZodString, z.ZodObject<{
                image: z.ZodOptional<z.ZodString>;
                overlay: z.ZodOptional<z.ZodString>;
                gradient: z.ZodOptional<z.ZodObject<{
                    type: z.ZodDefault<z.ZodEnum<["linear", "radial", "conic"]>>;
                    direction: z.ZodOptional<z.ZodString>;
                    stops: z.ZodArray<z.ZodObject<{
                        color: z.ZodString;
                        position: z.ZodOptional<z.ZodString>;
                    }, "strict", z.ZodTypeAny, {
                        color: string;
                        position?: string | undefined;
                    }, {
                        color: string;
                        position?: string | undefined;
                    }>, "many">;
                }, "strict", z.ZodTypeAny, {
                    type: "linear" | "radial" | "conic";
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    direction?: string | undefined;
                }, {
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    type?: "linear" | "radial" | "conic" | undefined;
                    direction?: string | undefined;
                }>>;
                position: z.ZodOptional<z.ZodString>;
                size: z.ZodOptional<z.ZodEnum<["cover", "contain", "auto"]>>;
                fixed: z.ZodOptional<z.ZodBoolean>;
            }, "strict", z.ZodTypeAny, {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    type: "linear" | "radial" | "conic";
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            }, {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    type?: "linear" | "radial" | "conic" | undefined;
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            }>]>]>>>;
            readonly color: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            readonly borderRadius: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl", "full"]>, z.ZodString, z.ZodNumber]>>>;
            readonly border: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            readonly shadow: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl"]>, z.ZodString]>>>;
            readonly opacity: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
            readonly overflow: z.ZodOptional<z.ZodOptional<z.ZodEnum<["auto", "hidden", "scroll", "visible"]>>>;
            readonly alignItems: z.ZodOptional<z.ZodOptional<z.ZodEnum<["start", "center", "end", "stretch", "baseline"]>>>;
            readonly justifyContent: z.ZodOptional<z.ZodOptional<z.ZodEnum<["start", "center", "end", "between", "around", "evenly"]>>>;
            readonly flexWrap: z.ZodOptional<z.ZodOptional<z.ZodEnum<["wrap", "nowrap", "wrap-reverse"]>>>;
            readonly flex: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>>;
            readonly textAlign: z.ZodOptional<z.ZodOptional<z.ZodEnum<["left", "center", "right", "justify"]>>>;
            readonly fontSize: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodUnion<[z.ZodEnum<["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]>, z.ZodString, z.ZodNumber]>, z.ZodObject<{
                default: z.ZodUnion<[z.ZodEnum<["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]>, z.ZodString, z.ZodNumber]>;
                sm: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]>, z.ZodString, z.ZodNumber]>>;
                md: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]>, z.ZodString, z.ZodNumber]>>;
                lg: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]>, z.ZodString, z.ZodNumber]>>;
                xl: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]>, z.ZodString, z.ZodNumber]>>;
                "2xl": z.ZodOptional<z.ZodUnion<[z.ZodEnum<["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"]>, z.ZodString, z.ZodNumber]>>;
            }, "strict", z.ZodTypeAny, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }, {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            }>]>>>;
            readonly fontWeight: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodEnum<["light", "normal", "medium", "semibold", "bold"]>, z.ZodNumber, z.ZodString]>>>;
            readonly lineHeight: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "tight", "snug", "normal", "relaxed", "loose"]>, z.ZodString, z.ZodNumber]>>>;
            readonly letterSpacing: z.ZodOptional<z.ZodOptional<z.ZodUnion<[z.ZodEnum<["tight", "normal", "wide"]>, z.ZodString, z.ZodNumber]>>>;
            readonly hover: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                bg: z.ZodOptional<z.ZodString>;
                color: z.ZodOptional<z.ZodString>;
                shadow: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl"]>, z.ZodString]>>;
                borderRadius: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl", "full"]>, z.ZodString, z.ZodNumber]>>;
                border: z.ZodOptional<z.ZodString>;
                opacity: z.ZodOptional<z.ZodNumber>;
                transform: z.ZodOptional<z.ZodString>;
                scale: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            }, {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            }>>>;
            readonly focus: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                bg: z.ZodOptional<z.ZodString>;
                color: z.ZodOptional<z.ZodString>;
                shadow: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["none", "xs", "sm", "md", "lg", "xl"]>, z.ZodString]>>;
                ring: z.ZodOptional<z.ZodUnion<[z.ZodBoolean, z.ZodString]>>;
                outline: z.ZodOptional<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            }, {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            }>>>;
            readonly active: z.ZodOptional<z.ZodOptional<z.ZodObject<{
                bg: z.ZodOptional<z.ZodString>;
                color: z.ZodOptional<z.ZodString>;
                transform: z.ZodOptional<z.ZodString>;
                scale: z.ZodOptional<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            }, {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            }>>>;
        }, "strict", z.ZodTypeAny, {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    type: "linear" | "radial" | "conic";
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
        }, {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    type?: "linear" | "radial" | "conic" | undefined;
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
        }>>>;
    }, "strict", z.ZodTypeAny, {
        border?: string | undefined;
        flex?: string | number | undefined;
        className?: string | undefined;
        style?: Record<string, string | number> | undefined;
        cursor?: string | undefined;
        gridTemplateColumns?: string | undefined;
        gridTemplateRows?: string | undefined;
        gridColumn?: string | undefined;
        gridRow?: string | undefined;
        display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
            default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
            lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
        } | undefined;
        flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
            default: "row" | "column" | "row-reverse" | "column-reverse";
            lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
        } | undefined;
        position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
        inset?: string | number | undefined;
        padding?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        paddingX?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        paddingY?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        margin?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        marginX?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        marginY?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        gap?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        width?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        minWidth?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        maxWidth?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        height?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        minHeight?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        maxHeight?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        bg?: string | {
            size?: "auto" | "cover" | "contain" | undefined;
            overlay?: string | undefined;
            position?: string | undefined;
            image?: string | undefined;
            gradient?: {
                type: "linear" | "radial" | "conic";
                stops: {
                    color: string;
                    position?: string | undefined;
                }[];
                direction?: string | undefined;
            } | undefined;
            fixed?: boolean | undefined;
        } | undefined;
        color?: string | undefined;
        borderRadius?: string | number | undefined;
        shadow?: string | undefined;
        opacity?: number | undefined;
        overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
        alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
        justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
        flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
        textAlign?: "center" | "left" | "right" | "justify" | undefined;
        fontSize?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        fontWeight?: string | number | undefined;
        lineHeight?: string | number | undefined;
        letterSpacing?: string | number | undefined;
        hover?: {
            transform?: string | undefined;
            border?: string | undefined;
            scale?: number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            color?: string | undefined;
            bg?: string | undefined;
            borderRadius?: string | number | undefined;
        } | undefined;
        focus?: {
            ring?: string | boolean | undefined;
            shadow?: string | undefined;
            outline?: string | undefined;
            color?: string | undefined;
            bg?: string | undefined;
        } | undefined;
        active?: {
            transform?: string | undefined;
            scale?: number | undefined;
            color?: string | undefined;
            bg?: string | undefined;
        } | undefined;
        states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    type: "linear" | "radial" | "conic";
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
        }>> | undefined;
    }, {
        border?: string | undefined;
        flex?: string | number | undefined;
        className?: string | undefined;
        style?: Record<string, string | number> | undefined;
        cursor?: string | undefined;
        gridTemplateColumns?: string | undefined;
        gridTemplateRows?: string | undefined;
        gridColumn?: string | undefined;
        gridRow?: string | undefined;
        display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
            default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
            lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
        } | undefined;
        flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
            default: "row" | "column" | "row-reverse" | "column-reverse";
            lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
        } | undefined;
        position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
        inset?: string | number | undefined;
        padding?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        paddingX?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        paddingY?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        margin?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        marginX?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        marginY?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        gap?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        width?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        minWidth?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        maxWidth?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        height?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        minHeight?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        maxHeight?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        bg?: string | {
            size?: "auto" | "cover" | "contain" | undefined;
            overlay?: string | undefined;
            position?: string | undefined;
            image?: string | undefined;
            gradient?: {
                stops: {
                    color: string;
                    position?: string | undefined;
                }[];
                type?: "linear" | "radial" | "conic" | undefined;
                direction?: string | undefined;
            } | undefined;
            fixed?: boolean | undefined;
        } | undefined;
        color?: string | undefined;
        borderRadius?: string | number | undefined;
        shadow?: string | undefined;
        opacity?: number | undefined;
        overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
        alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
        justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
        flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
        textAlign?: "center" | "left" | "right" | "justify" | undefined;
        fontSize?: string | number | {
            default: string | number;
            sm?: string | number | undefined;
            md?: string | number | undefined;
            lg?: string | number | undefined;
            xl?: string | number | undefined;
            "2xl"?: string | number | undefined;
        } | undefined;
        fontWeight?: string | number | undefined;
        lineHeight?: string | number | undefined;
        letterSpacing?: string | number | undefined;
        hover?: {
            transform?: string | undefined;
            border?: string | undefined;
            scale?: number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            color?: string | undefined;
            bg?: string | undefined;
            borderRadius?: string | number | undefined;
        } | undefined;
        focus?: {
            ring?: string | boolean | undefined;
            shadow?: string | undefined;
            outline?: string | undefined;
            color?: string | undefined;
            bg?: string | undefined;
        } | undefined;
        active?: {
            transform?: string | undefined;
            scale?: number | undefined;
            color?: string | undefined;
            bg?: string | undefined;
        } | undefined;
        states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    type?: "linear" | "radial" | "conic" | undefined;
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
        }>> | undefined;
    }>>>, "strict", z.ZodTypeAny, {
        column?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    type: "linear" | "radial" | "conic";
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        type: "linear" | "radial" | "conic";
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnCount?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    type: "linear" | "radial" | "conic";
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        type: "linear" | "radial" | "conic";
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnHeader?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    type: "linear" | "radial" | "conic";
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        type: "linear" | "radial" | "conic";
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnTitle?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    type: "linear" | "radial" | "conic";
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        type: "linear" | "radial" | "conic";
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnBody?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    type: "linear" | "radial" | "conic";
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        type: "linear" | "radial" | "conic";
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
    }, {
        column?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    type?: "linear" | "radial" | "conic" | undefined;
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        type?: "linear" | "radial" | "conic" | undefined;
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnCount?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    type?: "linear" | "radial" | "conic" | undefined;
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        type?: "linear" | "radial" | "conic" | undefined;
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnHeader?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    type?: "linear" | "radial" | "conic" | undefined;
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        type?: "linear" | "radial" | "conic" | undefined;
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnTitle?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    type?: "linear" | "radial" | "conic" | undefined;
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        type?: "linear" | "radial" | "conic" | undefined;
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnBody?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    type?: "linear" | "radial" | "conic" | undefined;
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        type?: "linear" | "radial" | "conic" | undefined;
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    key: string;
    title: string;
    color?: "destructive" | "success" | "warning" | "info" | "primary" | "secondary" | "muted" | undefined;
    slots?: {
        column?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    type: "linear" | "radial" | "conic";
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        type: "linear" | "radial" | "conic";
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnCount?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    type: "linear" | "radial" | "conic";
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        type: "linear" | "radial" | "conic";
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnHeader?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    type: "linear" | "radial" | "conic";
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        type: "linear" | "radial" | "conic";
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnTitle?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    type: "linear" | "radial" | "conic";
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        type: "linear" | "radial" | "conic";
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnBody?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    type: "linear" | "radial" | "conic";
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        type: "linear" | "radial" | "conic";
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
    } | undefined;
    limit?: number | undefined;
}, {
    key: string;
    title: string;
    color?: "destructive" | "success" | "warning" | "info" | "primary" | "secondary" | "muted" | undefined;
    slots?: {
        column?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    type?: "linear" | "radial" | "conic" | undefined;
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        type?: "linear" | "radial" | "conic" | undefined;
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnCount?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    type?: "linear" | "radial" | "conic" | undefined;
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        type?: "linear" | "radial" | "conic" | undefined;
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnHeader?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    type?: "linear" | "radial" | "conic" | undefined;
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        type?: "linear" | "radial" | "conic" | undefined;
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnTitle?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    type?: "linear" | "radial" | "conic" | undefined;
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        type?: "linear" | "radial" | "conic" | undefined;
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
        columnBody?: {
            border?: string | undefined;
            flex?: string | number | undefined;
            className?: string | undefined;
            style?: Record<string, string | number> | undefined;
            cursor?: string | undefined;
            gridTemplateColumns?: string | undefined;
            gridTemplateRows?: string | undefined;
            gridColumn?: string | undefined;
            gridRow?: string | undefined;
            display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
            } | undefined;
            flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                default: "row" | "column" | "row-reverse" | "column-reverse";
                lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
            } | undefined;
            position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
            inset?: string | number | undefined;
            padding?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            paddingY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            margin?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginX?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            marginY?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            gap?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            width?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxWidth?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            height?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            minHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            maxHeight?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            bg?: string | {
                size?: "auto" | "cover" | "contain" | undefined;
                overlay?: string | undefined;
                position?: string | undefined;
                image?: string | undefined;
                gradient?: {
                    stops: {
                        color: string;
                        position?: string | undefined;
                    }[];
                    type?: "linear" | "radial" | "conic" | undefined;
                    direction?: string | undefined;
                } | undefined;
                fixed?: boolean | undefined;
            } | undefined;
            color?: string | undefined;
            borderRadius?: string | number | undefined;
            shadow?: string | undefined;
            opacity?: number | undefined;
            overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
            alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
            justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
            flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
            textAlign?: "center" | "left" | "right" | "justify" | undefined;
            fontSize?: string | number | {
                default: string | number;
                sm?: string | number | undefined;
                md?: string | number | undefined;
                lg?: string | number | undefined;
                xl?: string | number | undefined;
                "2xl"?: string | number | undefined;
            } | undefined;
            fontWeight?: string | number | undefined;
            lineHeight?: string | number | undefined;
            letterSpacing?: string | number | undefined;
            hover?: {
                transform?: string | undefined;
                border?: string | undefined;
                scale?: number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
                borderRadius?: string | number | undefined;
            } | undefined;
            focus?: {
                ring?: string | boolean | undefined;
                shadow?: string | undefined;
                outline?: string | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            active?: {
                transform?: string | undefined;
                scale?: number | undefined;
                color?: string | undefined;
                bg?: string | undefined;
            } | undefined;
            states?: Partial<Record<"hover" | "focus" | "active" | "open" | "selected" | "current" | "completed" | "invalid" | "disabled", {
                border?: string | undefined;
                flex?: string | number | undefined;
                className?: string | undefined;
                style?: Record<string, string | number> | undefined;
                cursor?: string | undefined;
                gridTemplateColumns?: string | undefined;
                gridTemplateRows?: string | undefined;
                gridColumn?: string | undefined;
                gridRow?: string | undefined;
                display?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | {
                    default: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid";
                    lg?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    sm?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    md?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    xl?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                    "2xl"?: "none" | "flex" | "grid" | "block" | "inline" | "inline-flex" | "inline-grid" | undefined;
                } | undefined;
                flexDirection?: "row" | "column" | "row-reverse" | "column-reverse" | {
                    default: "row" | "column" | "row-reverse" | "column-reverse";
                    lg?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    sm?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    md?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    xl?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                    "2xl"?: "row" | "column" | "row-reverse" | "column-reverse" | undefined;
                } | undefined;
                position?: "relative" | "absolute" | "fixed" | "sticky" | undefined;
                inset?: string | number | undefined;
                padding?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                paddingY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                margin?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginX?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                marginY?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                gap?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                width?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxWidth?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                height?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                minHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                maxHeight?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                bg?: string | {
                    size?: "auto" | "cover" | "contain" | undefined;
                    overlay?: string | undefined;
                    position?: string | undefined;
                    image?: string | undefined;
                    gradient?: {
                        stops: {
                            color: string;
                            position?: string | undefined;
                        }[];
                        type?: "linear" | "radial" | "conic" | undefined;
                        direction?: string | undefined;
                    } | undefined;
                    fixed?: boolean | undefined;
                } | undefined;
                color?: string | undefined;
                borderRadius?: string | number | undefined;
                shadow?: string | undefined;
                opacity?: number | undefined;
                overflow?: "auto" | "hidden" | "scroll" | "visible" | undefined;
                alignItems?: "start" | "center" | "end" | "stretch" | "baseline" | undefined;
                justifyContent?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined;
                flexWrap?: "wrap" | "nowrap" | "wrap-reverse" | undefined;
                textAlign?: "center" | "left" | "right" | "justify" | undefined;
                fontSize?: string | number | {
                    default: string | number;
                    sm?: string | number | undefined;
                    md?: string | number | undefined;
                    lg?: string | number | undefined;
                    xl?: string | number | undefined;
                    "2xl"?: string | number | undefined;
                } | undefined;
                fontWeight?: string | number | undefined;
                lineHeight?: string | number | undefined;
                letterSpacing?: string | number | undefined;
                hover?: {
                    transform?: string | undefined;
                    border?: string | undefined;
                    scale?: number | undefined;
                    shadow?: string | undefined;
                    opacity?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                    borderRadius?: string | number | undefined;
                } | undefined;
                focus?: {
                    ring?: string | boolean | undefined;
                    shadow?: string | undefined;
                    outline?: string | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
                active?: {
                    transform?: string | undefined;
                    scale?: number | undefined;
                    color?: string | undefined;
                    bg?: string | undefined;
                } | undefined;
            }>> | undefined;
        } | undefined;
    } | undefined;
    limit?: number | undefined;
}>;
/**
 * Zod config schema for the Kanban board component.
 *
 * Renders a column-based card board driven by data from an API endpoint.
 * Cards are placed into columns based on a configurable status/column field.
 *
 * @example
 * ```json
 * {
 *   "type": "kanban",
 *   "data": "GET /api/tasks",
 *   "columns": [
 *     { "key": "todo", "title": "To Do", "color": "info" },
 *     { "key": "in-progress", "title": "In Progress", "color": "warning", "limit": 5 },
 *     { "key": "done", "title": "Done", "color": "success" }
 *   ],
 *   "columnField": "status",
 *   "titleField": "title",
 *   "descriptionField": "description"
 * }
 * ```
 */
export declare const kanbanConfigSchema: z.ZodType<Record<string, any>>;
