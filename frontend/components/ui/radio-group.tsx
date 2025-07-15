"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle, Check } from "lucide-react";

import { cn } from "@/lib/utils";

const radioVariants = {
    default: {
        container: "grid gap-3",
        item: "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        indicator: "relative flex items-center justify-center",
        icon: "fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2",
    },
    card: {
        container: "grid gap-3",
        item: "group relative flex items-center gap-3 rounded-lg border-2 border-default-200 bg-content1 p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-50 data-[state=checked]:dark:bg-blue-900/20",
        indicator: "absolute right-4 top-4 flex items-center justify-center",
        icon: "size-5 text-blue-500 opacity-0 transition-opacity duration-200 group-data-[state=checked]:opacity-100",
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
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
    variant?: keyof typeof radioVariants;
    children?: React.ReactNode;
}) {
    const variantStyles = radioVariants[variant];

    if (variant === "default") {
        return (
            <RadioGroupPrimitive.Item className={cn(variantStyles.item, className)} {...props}>
                <RadioGroupPrimitive.Indicator className={variantStyles.indicator}>
                    <Circle className={variantStyles.icon} />
                </RadioGroupPrimitive.Indicator>
            </RadioGroupPrimitive.Item>
        );
    }

    return (
        <RadioGroupPrimitive.Item className={cn(variantStyles.item, className)} {...props}>
            {children}
            <RadioGroupPrimitive.Indicator className={variantStyles.indicator}>
                <Check className={variantStyles.icon} />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    );
}

// Enhanced radio group with label support
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
