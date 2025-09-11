"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle, Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const radioVariants = {
    default: {
        container: "grid gap-3",
        item: "border-input text-indigo-600 focus-visible:border-ring focus-visible:ring-ring/50 bg-content3 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        indicator: "relative flex items-center justify-center",
        icon: "fill-indigo-600 absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2",
    },
    card: {
        container: "grid gap-3",
        item: "group relative flex items-center gap-3 rounded-lg border-2 border-default-200 bg-content1 p-4 transition-all duration-200 hover:border-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-accent data-[state=checked]:bg-accent/10",
        indicator: "absolute right-4 top-4 flex items-center justify-center",
        icon: "size-5 text-accent opacity-0 transition-opacity duration-200 group-data-[state=checked]:opacity-100",
    },
    pill: {
        container: "flex flex-wrap gap-2",
        item: "group relative flex items-center gap-2 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-blue-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white",
        indicator: "flex items-center justify-center",
        icon: "size-4 opacity-0 transition-opacity duration-200 group-data-[state=checked]:opacity-100",
    },
    button: {
        container: "grid gap-2",
        item: "group relative flex items-center justify-center gap-2 rounded-md border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium transition-all duration-200 hover:border-blue-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-blue-500 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600 data-[state=checked]:text-white data-[state=checked]:shadow-md",
        indicator: "flex items-center justify-center",
        icon: "size-4 opacity-0 transition-opacity duration-200 group-data-[state=checked]:opacity-100",
    },
    delivery: {
        container: "grid gap-2",
        item: "flex items-start space-x-4 p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-elegant border-border hover:border-accent/50 data-[state=checked]:border-accent data-[state=checked]:bg-accent/10 data-[state=checked]:shadow-elegant group relative focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        indicator: "flex items-center justify-center",
        icon: "size-4 opacity-0 transition-opacity duration-200 group-data-[state=checked]:opacity-100",
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
                    <RadioGroupPrimitive.Indicator className={variantStyles.indicator}>
                        <Check className={variantStyles.icon} />
                    </RadioGroupPrimitive.Indicator>
                </RadioGroupPrimitive.Item>
            )}
            {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-black/50 pointer-events-auto">
                    <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin text-muted-foreground size-6" />
                        <span className="text-xs text-muted-foreground">Processing...</span>
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
                    <h3 className="text-sm font-medium text-default-900">{label}</h3>
                    {description && <p className="text-sm text-default-600">{description}</p>}
                </div>
            )}
            <RadioGroup className={className} variant={variant} {...props} />
        </div>
    );
}

export { RadioGroup, RadioGroupItem, RadioGroupWithLabel };
