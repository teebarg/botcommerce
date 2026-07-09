"use client";

import type * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle, Check, Loader2 } from "lucide-react";
import { cn } from "@/utils";

const radioVariants = {
    default: {
        container: "grid gap-3",
        item: "border border-primary text-primary focus-visible:border-ring focus-visible:ring-ring/50 aspect-square size-4 shrink-0 rounded-full shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        indicator: "relative flex items-center justify-center",
        icon: "fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2",
        ring: ""
    },
    card: {
        container: "grid gap-3",
        item: "group relative cursor-pointer flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-foreground",
        indicator: "absolute right-4 top-4 flex items-center justify-center",
        icon: "size-4 text-foreground opacity-0 transition-opacity duration-200 group-data-[state=checked]:opacity-100",
        ring: ""
    },
    pill: {
        container: "flex flex-wrap gap-2",
        item: "group relative flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background",
        indicator: "flex items-center justify-center",
        icon: "size-3.5 opacity-0 transition-opacity duration-200 group-data-[state=checked]:opacity-100",
        ring: ""
    },
    button: {
        container: "grid gap-2",
        item: "group relative flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background",
        indicator: "flex items-center justify-center",
        icon: "size-3.5 opacity-0 transition-opacity duration-200 group-data-[state=checked]:opacity-100",
        ring: ""
    },
    // Delivery method cards: icon + label on the left, price on the right,
    // gradient badge + glow border when selected.
    delivery: {
        container: "grid gap-2",
        item: "group relative flex items-start gap-3 p-4 pr-12 rounded-1xl border border-border bg-card cursor-pointer transition-all duration-200 hover:border-accent/40 data-[state=checked]:border-accent data-[state=checked]:shadow-[0_0_16px_hsl(var(--accent)/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        indicator: "absolute right-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-primary",
        icon: "size-3.5 text-accent-foreground",
        ring: "absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border-2 border-input group-hover:border-accent/50 group-data-[state=checked]:opacity-0 transition-colors",
    },
    // Saved address cards: same treatment, indicator pinned top-right since
    // content height varies (name, address, phone, edit/delete row).
    address: {
        container: "space-y-2",
        item: "group relative w-full text-left p-4 pr-11 rounded-1xl border border-border bg-card cursor-pointer transition-all duration-200 hover:border-accent/40 data-[state=checked]:border-accent data-[state=checked]:shadow-[0_0_16px_hsl(var(--accent)/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        indicator: "absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-primary",
        icon: "size-3.5 text-accent-foreground",
        ring: "absolute top-3 right-3 h-6 w-6 rounded-full border-2 border-input group-hover:border-accent/50 group-data-[state=checked]:opacity-0 transition-colors",
    },
    // Payment method cards: same visual language as delivery, single-line content.
    payment: {
        container: "grid gap-2",
        item: "group relative flex items-center gap-3 p-4 pr-12 rounded-1xl border border-border bg-card cursor-pointer transition-all duration-200 hover:border-accent/40 data-[state=checked]:border-accent data-[state=checked]:shadow-[0_0_16px_hsl(var(--accent)/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        indicator: "absolute right-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-primary",
        icon: "size-3.5 text-accent-foreground",
        ring: "absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border-2 border-input group-hover:border-accent/50 group-data-[state=checked]:opacity-0 transition-colors",
    },
};

function RadioGroup({
    className,
    variant = "default",
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root> & {
    variant?: keyof typeof radioVariants;
}) {
    const variantStyles = radioVariants[variant];
    return <RadioGroupPrimitive.Root className={cn(variantStyles.container, className)} {...props} />;
}

function RadioGroupItem({
    className,
    children,
    variant = "default",
    loading = false,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
    variant?: keyof typeof radioVariants;
    children?: React.ReactNode;
    loading?: boolean;
}) {
    const variantStyles = radioVariants[variant];

    return (
        <div className="relative">
            {variant === "default" ? (
                <RadioGroupPrimitive.Item className={cn(variantStyles.item, className, "w-full")} {...props}>
                    <RadioGroupPrimitive.Indicator className={variantStyles.indicator}>
                        <Circle className={variantStyles.icon} />
                    </RadioGroupPrimitive.Indicator>
                </RadioGroupPrimitive.Item>
            ) : (
                <RadioGroupPrimitive.Item className={cn(variantStyles.item, className, "w-full")} {...props}>
                    {children}
                    {/* Unselected placeholder ring — only variants that opt in (delivery/address/payment) render one */}
                    {variantStyles.ring && <div className={variantStyles.ring} />}
                    <RadioGroupPrimitive.Indicator className={variantStyles.indicator}>
                        <Check className={variantStyles.icon} />
                    </RadioGroupPrimitive.Indicator>
                </RadioGroupPrimitive.Item>
            )}
            {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 rounded-[inherit] pointer-events-auto">
                    <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin text-muted-foreground size-5" />
                        <span className="text-xs text-muted-foreground">Processing…</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function RadioGroupWithLabel({
    className,
    variant = "default",
    label,
    description,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root> & {
    variant?: keyof typeof radioVariants;
    label?: string;
    description?: string;
}) {
    return (
        <div className="space-y-3">
            {label && (
                <div className="space-y-1">
                    <h3 className="text-sm font-medium">{label}</h3>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
            )}
            <RadioGroup className={className} variant={variant} {...props} />
        </div>
    );
}

export { RadioGroup, RadioGroupItem, RadioGroupWithLabel };